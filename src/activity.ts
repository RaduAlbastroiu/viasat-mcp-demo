/**
 * In-memory activity log: every MCP tool call made against this server, so anyone can tell whether a monitor
 * (ours, a Claude Code /loop, a Managed Agent, someone's cron) is still polling — even on days when the fleet is in a
 * steady state and no new tickets get created. Exposed as GET /api/monitor, inside /health and /api/fleet, and as the
 * get_monitor_status tool. Lives for the process lifetime, like the tickets.
 */
export interface CallRecord {
  at: string
  tool: string
  /** User-Agent of the HTTP client (or "stdio") */
  client: string
  ok: boolean
  summary: string
}

/** Tool calls that count as a monitoring "check". */
const CHECK_TOOLS = new Set(['detect_stale_devices', 'list_devices', 'get_fleet_health'])
/** No check for this long → status "silent". */
export const SILENT_AFTER_MIN = Number(process.env.MONITOR_SILENT_AFTER_MIN ?? 30)
const MAX_RECENT = 200
const MAX_CHECK_TIMES = 20_000

const log = process.argv.includes('--stdio') ? console.error : console.log
export const startedAt = new Date().toISOString()
const recent: CallRecord[] = []
const checkTimes: number[] = []
let callsTotal = 0
let checksTotal = 0
let ticketsCreated = 0
let ticketsResolved = 0
let lastCheck: CallRecord | null = null
let lastTicketAt: string | null = null

export function recordCall(r: { tool: string; client: string; ok: boolean; summary: string; created?: boolean; resolved?: boolean }, now = Date.now()) {
  const rec: CallRecord = { at: new Date(now).toISOString(), tool: r.tool, client: r.client, ok: r.ok, summary: r.summary.slice(0, 200) }
  callsTotal++
  recent.unshift(rec)
  if (recent.length > MAX_RECENT) recent.pop()
  if (r.ok && CHECK_TOOLS.has(r.tool)) {
    checksTotal++
    lastCheck = rec
    checkTimes.push(now)
    if (checkTimes.length > MAX_CHECK_TIMES) checkTimes.shift()
  }
  if (r.created) {
    ticketsCreated++
    lastTicketAt = rec.at
  }
  if (r.resolved) ticketsResolved++
  // One line per call in the server log (DigitalOcean → Runtime Logs), so the cron's activity is visible there too.
  // In stdio mode stdout is the protocol channel, so log to stderr there.
  log(`[${rec.at}] tool ${r.tool} ← ${r.client} · ${r.ok ? rec.summary : `ERROR ${rec.summary}`}`)
}

export function monitorStatus(now = Date.now(), recentLimit = 50) {
  const since = (ms: number) => checkTimes.filter((t) => t >= now - ms).length
  const lastCheckMs = lastCheck ? Date.parse(lastCheck.at) : null
  const minutesSince = lastCheckMs === null ? null : Math.round((now - lastCheckMs) / 60_000)
  const status: 'never' | 'active' | 'silent' = minutesSince === null ? 'never' : minutesSince <= SILENT_AFTER_MIN ? 'active' : 'silent'
  return {
    status,
    status_hint:
      status === 'never'
        ? `No monitoring check since the server started (${startedAt}). Nothing has called detect_stale_devices / list_devices / get_fleet_health.`
        : status === 'active'
          ? `A monitor checked ${minutesSince} min ago (${lastCheck!.client}).`
          : `Last check was ${minutesSince} min ago (${lastCheck!.client}); nothing has polled for more than ${SILENT_AFTER_MIN} min — the cron may have stopped.`,
    server_started_at: startedAt,
    uptime_minutes: Math.round((now - Date.parse(startedAt)) / 60_000),
    last_check_at: lastCheck?.at ?? null,
    last_check_by: lastCheck?.client ?? null,
    last_check_tool: lastCheck?.tool ?? null,
    minutes_since_last_check: minutesSince,
    silent_after_minutes: SILENT_AFTER_MIN,
    checks_total: checksTotal,
    checks_last_hour: since(3_600_000),
    checks_last_24h: since(86_400_000),
    tool_calls_total: callsTotal,
    tickets_created_since_start: ticketsCreated,
    tickets_resolved_since_start: ticketsResolved,
    last_ticket_created_at: lastTicketAt,
    recent_calls: recent.slice(0, recentLimit),
  }
}

/** Compact form for /health and /api/fleet. */
export function monitorSummary(now = Date.now()) {
  const { recent_calls: _r, ...rest } = monitorStatus(now, 0)
  return rest
}
