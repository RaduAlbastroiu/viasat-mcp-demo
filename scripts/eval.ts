/**
 * Runs the Business Hub JTBD prompts through Claude with this MCP server's tools bridged in via an MCP client,
 * and checks the tool each answer used. Needs ANTHROPIC_API_KEY (or an `ant auth login` profile).
 *   npx tsx scripts/eval.ts [filter] [--http http://localhost:8080/mcp]
 */
import Anthropic from '@anthropic-ai/sdk'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'

const cases: { prompt: string; expect: string[] }[] = [
  { prompt: 'Where is the API spec for creating product orders?', expect: ['get_api_spec', 'search_library'] },
  { prompt: "What's the status of order ord-5008?", expect: ['get_order'] },
  { prompt: 'What does the BSNL agreement cover and when does it expire?', expect: ['get_agreement'] },
  { prompt: 'Which devices or accounts need attention right now?', expect: ['get_attention_summary', 'get_install_base'] },
  { prompt: "Who's my account manager and how do I escalate?", expect: ['get_support_contact'] },
  { prompt: 'Why did ord-5010 fail and what should I do next?', expect: ['get_order'] },
  { prompt: 'Compare NB-NTN IoT Connectivity with NB-NTN Asset Tracking for a container fleet', expect: ['compare_plans'] },
  { prompt: 'Summarise the privacy notice in plain language', expect: ['get_document'] },
  { prompt: "What's the status of my install base right now?", expect: ['get_install_base', 'get_attention_summary'] },
  { prompt: 'Explain the latest breaking change in the ordering API', expect: ['get_api_spec', 'search_library', 'get_catalogue_index'] },
  { prompt: 'Give me a link to open device Buoy sensor 002 in the app', expect: ['get_app_link', 'get_device'] },
]

const SYSTEM = 'You are an assistant for Viasat Business Hub users. Answer from the MCP tools only; keep answers short and cite record ids and open-in-app links.'

async function main() {
  const httpIdx = process.argv.indexOf('--http')
  const url = httpIdx > -1 ? process.argv[httpIdx + 1] : undefined
  const filter = process.argv.slice(2).find((a) => !a.startsWith('--') && a !== url)
  const mcp = new Client({ name: 'business-hub-eval', version: '0.1.0' })
  await mcp.connect(url ? new StreamableHTTPClientTransport(new URL(url)) : new StdioClientTransport({ command: 'npx', args: ['tsx', 'src/index.ts', '--stdio'] }))
  const listed = await mcp.listTools()
  const tools: Anthropic.Tool[] = listed.tools.map((t) => ({ name: t.name, description: t.description ?? '', input_schema: t.inputSchema as Anthropic.Tool['input_schema'] }))
  const claude = new Anthropic()

  let pass = 0
  let fail = 0
  for (const c of cases) {
    if (filter && !c.prompt.toLowerCase().includes(filter.toLowerCase())) continue
    const used: string[] = []
    const messages: Anthropic.MessageParam[] = [{ role: 'user', content: c.prompt }]
    const t0 = Date.now()
    let answer = ''
    for (let round = 0; round < 6; round++) {
      const res = await claude.messages.create({ model: 'claude-opus-5-5', max_tokens: 8000, system: SYSTEM, tools, messages })
      messages.push({ role: 'assistant', content: res.content })
      const toolUses = res.content.filter((b): b is Anthropic.ToolUseBlock => b.type === 'tool_use')
      answer = res.content.filter((b): b is Anthropic.TextBlock => b.type === 'text').map((b) => b.text).join('\n')
      if (res.stop_reason !== 'tool_use' || !toolUses.length) break
      const results: Anthropic.ToolResultBlockParam[] = []
      for (const tu of toolUses) {
        used.push(tu.name)
        const r = (await mcp.callTool({ name: tu.name, arguments: tu.input as Record<string, unknown> })) as { isError?: boolean; content: { type: string; text?: string }[] }
        results.push({ type: 'tool_result', tool_use_id: tu.id, content: r.content.map((b) => b.text ?? '').join('\n'), is_error: r.isError || undefined })
      }
      messages.push({ role: 'user', content: results })
    }
    const ok = c.expect.some((e) => used.includes(e))
    ok ? pass++ : fail++
    console.log(`\n${ok ? 'PASS' : 'FAIL'} (${((Date.now() - t0) / 1000).toFixed(1)}s) ${c.prompt}`)
    console.log(`  tools: ${used.join(', ') || '(none)'}`)
    console.log(`  answer: ${answer.replace(/\s+/g, ' ').slice(0, 280)}`)
  }
  await mcp.close()
  console.log(`\n${pass} passed, ${fail} failed`)
  process.exit(fail ? 1 : 0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
