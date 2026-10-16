/**
 * Fleet monitor: every N minutes, asks Claude to run the monitoring runbook against this MCP server
 * (list → detect stale devices → create tickets) and logs the outcome.
 *
 *   npm run monitor -- --once                       one pass, default threshold 60 min
 *   npm run monitor -- --interval 15m               poll every 15 minutes (default)
 *   npm run monitor -- --interval 1m --threshold 30 quick demo
 *   npm run monitor -- --connector                  use the Messages API MCP connector (server-side tool calls; the
 *                                                   MCP URL must be publicly reachable) instead of the local MCP client
 * Env: ANTHROPIC_API_KEY (or an `ant auth login` profile), MCP_URL (default http://localhost:$PORT/mcp), MONITOR_MODEL.
 */
import Anthropic from '@anthropic-ai/sdk'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'
import { MONITOR_SYSTEM, runbookPrompt } from './runbook'
import { DEFAULT_THRESHOLD_MIN } from './fleet-sim'

const argv = process.argv.slice(2)
const flag = (name: string) => argv.includes(`--${name}`)
const opt = (name: string, def: string) => {
  const i = argv.indexOf(`--${name}`)
  return i > -1 && argv[i + 1] ? argv[i + 1] : def
}
const parseInterval = (s: string) => {
  const m = /^(\d+)(s|m|h)?$/.exec(s.trim())
  if (!m) throw new Error(`Bad interval "${s}" (use 30s, 15m, 1h)`)
  return Number(m[1]) * (m[2] === 's' ? 1000 : m[2] === 'h' ? 3_600_000 : 60_000)
}

const MCP_URL = opt('mcp', process.env.MCP_URL ?? `http://localhost:${process.env.PORT ?? 8080}/mcp`)
const MODEL = opt('model', process.env.MONITOR_MODEL ?? 'claude-opus-5-5')
const THRESHOLD = Number(opt('threshold', String(DEFAULT_THRESHOLD_MIN)))
const INTERVAL = parseInterval(opt('interval', '15m'))
const ONCE = flag('once')
const CONNECTOR = flag('connector')

const claude = new Anthropic()
const ts = () => new Date().toISOString().replace('T', ' ').slice(0, 19)
let runNo = 0

type RunResult = { tools: string[]; text: string; seconds: number }

/** Local MCP client + Messages API tool loop. Works against any URL, including localhost. */
async function runBridge(): Promise<RunResult> {
  const t0 = Date.now()
  const mcp = new Client({ name: 'business-hub-monitor', version: '0.1.0' })
  await mcp.connect(new StreamableHTTPClientTransport(new URL(MCP_URL)))
  try {
    const listed = await mcp.listTools()
    const wanted = new Set(['list_devices', 'detect_stale_devices', 'create_ticket', 'list_tickets', 'get_fleet_health'])
    const tools: Anthropic.Tool[] = listed.tools.filter((t) => wanted.has(t.name)).map((t) => ({ name: t.name, description: t.description ?? '', input_schema: t.inputSchema as Anthropic.Tool['input_schema'] }))
    const messages: Anthropic.MessageParam[] = [{ role: 'user', content: runbookPrompt(THRESHOLD) }]
    const used: string[] = []
    let text = ''
    for (let round = 0; round < 12; round++) {
      const res = await claude.messages.create({ model: MODEL, max_tokens: 8000, system: MONITOR_SYSTEM, tools, messages })
      messages.push({ role: 'assistant', content: res.content })
      text = res.content.filter((b): b is Anthropic.TextBlock => b.type === 'text').map((b) => b.text).join('\n')
      const calls = res.content.filter((b): b is Anthropic.ToolUseBlock => b.type === 'tool_use')
      if (res.stop_reason !== 'tool_use' || !calls.length) break
      const results: Anthropic.ToolResultBlockParam[] = []
      for (const tu of calls) {
        used.push(tu.name)
        const r = (await mcp.callTool({ name: tu.name, arguments: tu.input as Record<string, unknown> })) as { isError?: boolean; content: { type: string; text?: string }[] }
        results.push({ type: 'tool_result', tool_use_id: tu.id, content: r.content.map((c) => c.text ?? '').join('\n'), is_error: r.isError || undefined })
      }
      messages.push({ role: 'user', content: results })
    }
    return { tools: used, text, seconds: (Date.now() - t0) / 1000 }
  } finally {
    await mcp.close()
  }
}

/** Messages API MCP connector: Anthropic's servers call the MCP server directly, so the URL must be public. */
async function runConnector(): Promise<RunResult> {
  const t0 = Date.now()
  const used: string[] = []
  const messages: Anthropic.Beta.BetaMessageParam[] = [{ role: 'user', content: runbookPrompt(THRESHOLD) }]
  let text = ''
  for (let round = 0; round < 6; round++) {
    const res = await claude.beta.messages.create({
      model: MODEL,
      max_tokens: 8000,
      betas: ['mcp-client-2025-11-20'],
      system: MONITOR_SYSTEM,
      mcp_servers: [{ type: 'url', url: MCP_URL, name: 'business-hub' }],
      tools: [{ type: 'mcp_toolset', mcp_server_name: 'business-hub' }],
      messages,
    })
    for (const b of res.content) {
      if (b.type === 'mcp_tool_use') used.push(b.name)
      if (b.type === 'text') text += b.text
    }
    if (res.stop_reason !== 'pause_turn') break
    messages.push({ role: 'assistant', content: res.content })
  }
  return { tools: used, text, seconds: (Date.now() - t0) / 1000 }
}

async function openTicketCount() {
  try {
    const base = MCP_URL.replace(/\/mcp\/?$/, '')
    const r = await fetch(`${base}/api/tickets?status=open`)
    const j = (await r.json()) as { total: number }
    return j.total
  } catch {
    return null
  }
}

async function runOnce() {
  runNo++
  console.log(`[${ts()}] run #${runNo} · threshold ${THRESHOLD} min · ${CONNECTOR ? 'connector' : 'bridge'} → ${MCP_URL}`)
  try {
    const r = CONNECTOR ? await runConnector() : await runBridge()
    const counts = r.tools.reduce<Record<string, number>>((m, t) => ((m[t] = (m[t] ?? 0) + 1), m), {})
    console.log(`[${ts()}] tools: ${Object.entries(counts).map(([k, v]) => (v > 1 ? `${k}×${v}` : k)).join(', ') || '(none)'} · ${r.seconds.toFixed(1)}s · open tickets on server: ${(await openTicketCount()) ?? '?'}`)
    console.log(r.text.trim().split('\n').map((l) => '    ' + l).join('\n'))
  } catch (e) {
    console.error(`[${ts()}] run failed:`, e instanceof Error ? e.message : e)
  }
}

async function main() {
  await runOnce()
  if (ONCE) return
  console.log(`[${ts()}] next run in ${INTERVAL / 60_000} min (Ctrl-C to stop)`)
  setInterval(() => void runOnce(), INTERVAL)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
