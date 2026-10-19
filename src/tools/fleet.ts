/**
 * Fleet monitoring tools: list devices, detect stale ones, create/list/resolve tickets, fleet health.
 * create_ticket / resolve_ticket are the server's only write tools; state is in-memory for the process lifetime.
 */
import { z } from 'zod'
import type { ToolDef } from './read'
import { monitorTickets, resetDemo, state } from '../store'
import { DEFAULT_THRESHOLD_MIN, DEGRADED_AFTER_MIN, SIMULATION, connectivityNow, currentIncident, lastSeenAt, minutesAgo, resetSimulation } from '../fleet-sim'
import { monitorStatus } from '../activity'
import { appLink } from './links'
import { accountById, groupById, siteById } from '../data/estate'
import type { Case, Connectivity, Device } from '../data/types'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']
const fmtDate = (d: Date) => `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`
let ticketSeq = 4500

const findDevice = (q: string) => {
  const needle = q.trim().toLowerCase()
  return state.devices.find((d) => d.id.toLowerCase() === needle || d.label.toLowerCase() === needle || d.msisdn.replace(/\s/g, '') === needle.replace(/\s/g, ''))
}

export const openTicketFor = (deviceId: string) => state.cases.find((c) => c.deviceId === deviceId && c.status !== 'Resolved')

export function deviceSummary(d: Device, now = Date.now(), threshold = DEFAULT_THRESHOLD_MIN) {
  const t = openTicketFor(d.id)
  return {
    id: d.id,
    name: d.label,
    type: d.model,
    status: d.status,
    connectivity: connectivityNow(d, now, threshold),
    last_seen_at: lastSeenAt(d, now),
    last_seen_minutes_ago: minutesAgo(d, now),
    group: groupById(d.groupId)?.name ?? null,
    group_id: d.groupId,
    site: siteById(d.siteId)?.name ?? null,
    site_id: d.siteId,
    account: accountById(d.accountId)?.name ?? null,
    account_id: d.accountId,
    data_plan: d.dataPlan,
    usage_pct: d.usagePct,
    activation_date: d.activationDate ?? null,
    msisdn: d.msisdn,
    imsi: d.imsi,
    open_ticket: t ? t.id : null,
    open_in_app: appLink('device', d.id),
  }
}

export function ticketView(c: Case) {
  const d = c.deviceId ? state.devices.find((x) => x.id === c.deviceId) : undefined
  return {
    id: c.id,
    title: c.title,
    severity: c.severity,
    status: c.status,
    device_id: c.deviceId ?? null,
    device_name: d?.label ?? null,
    account: accountById(c.accountId)?.name ?? null,
    raised: c.raised,
    created_at: c.createdAt ?? null,
    sla_deadline: c.sla,
    summary: c.summary,
    source: c.source ?? 'user',
    progress: c.progress,
    open_in_app: c.deviceId ? appLink('device', c.deviceId) : appLink('page', 'support'),
  }
}

export function listDevices(args: { connectivity?: string; status?: string; group_id?: string; site_id?: string; account_id?: string; query?: string; limit?: number; offset?: number }, now = Date.now()) {
  const limit = Math.min(Math.max(1, args.limit ?? 50), 200)
  const offset = Math.max(0, args.offset ?? 0)
  const q = args.query?.toLowerCase()
  const all = state.devices
    .filter((d) => !args.account_id || d.accountId === args.account_id)
    .filter((d) => !args.group_id || d.groupId === args.group_id)
    .filter((d) => !args.site_id || d.siteId === args.site_id)
    .filter((d) => !args.status || d.status.toLowerCase() === args.status.toLowerCase())
    .filter((d) => !q || d.id.toLowerCase().includes(q) || d.label.toLowerCase().includes(q) || d.msisdn.includes(q))
    .map((d) => deviceSummary(d, now))
    .filter((v) => !args.connectivity || args.connectivity === 'all' || v.connectivity === args.connectivity)
  return { total: all.length, offset, returned: Math.min(limit, Math.max(0, all.length - offset)), devices: all.slice(offset, offset + limit) }
}

export function detectStale(threshold: number, includeDegraded: boolean, now = Date.now()) {
  const rows = state.devices.map((d) => ({ d, m: minutesAgo(d, now) })).filter((x) => x.m !== null) as { d: Device; m: number }[]
  const stale = rows
    .filter((x) => x.m >= threshold)
    .sort((a, b) => b.m - a.m)
    .map((x) => ({ ...deviceSummary(x.d, now, threshold), tier: 'ticket' as const, suggested_severity: x.m > 240 ? 'Critical' : 'High' }))
  const watch = includeDegraded
    ? rows
        .filter((x) => x.m >= DEGRADED_AFTER_MIN && x.m < threshold)
        .sort((a, b) => b.m - a.m)
        .map((x) => ({ ...deviceSummary(x.d, now, threshold), tier: 'watch' as const }))
    : []
  // Devices that report again but still carry an open monitor ticket → the runbook resolves those.
  const recovered = rows
    .filter((x) => x.m < DEGRADED_AFTER_MIN && openTicketFor(x.d.id))
    .map((x) => ({ ...deviceSummary(x.d, now, threshold), tier: 'recovered' as const }))
  return {
    threshold_minutes: threshold,
    degraded_after_minutes: DEGRADED_AFTER_MIN,
    checked: rows.length,
    stale,
    watch,
    recovered,
    already_ticketed: stale.filter((s) => s.open_ticket).length,
    needing_ticket: stale.filter((s) => !s.open_ticket).map((s) => s.id),
    needing_resolve: recovered.map((r) => ({ device_id: r.id, ticket_id: r.open_ticket })),
    simulation: SIMULATION,
    incident: currentIncident(now),
    checked_at: new Date(now).toISOString(),
  }
}

export function fleetHealth(accountId?: string, now = Date.now(), threshold = DEFAULT_THRESHOLD_MIN) {
  const devices = state.devices.filter((d) => !accountId || d.accountId === accountId)
  const rows = devices.map((d) => ({ d, c: connectivityNow(d, now, threshold), m: minutesAgo(d, now) }))
  const count = (c: Connectivity, list = rows) => list.filter((r) => r.c === c).length
  const groupBy = (key: (d: Device) => string) => {
    const map = new Map<string, typeof rows>()
    rows.forEach((r) => map.set(key(r.d), [...(map.get(key(r.d)) ?? []), r]))
    return [...map.entries()]
      .map(([name, list]) => ({ name, total: list.length, connected: count('connected', list), degraded: count('degraded', list), offline: count('offline', list) }))
      .sort((a, b) => b.offline + b.degraded - (a.offline + a.degraded) || b.total - a.total)
  }
  const attention = [
    ...rows
      .filter((r) => r.c !== 'connected')
      .sort((a, b) => (a.c === b.c ? (b.m ?? 0) - (a.m ?? 0) : a.c === 'offline' ? -1 : 1))
      .map((r) => ({ ...deviceSummary(r.d, now, threshold), suggested_action: r.c === 'offline' ? (openTicketFor(r.d.id) ? `Ticket ${openTicketFor(r.d.id)!.id} open` : 'Raise ticket now') : r.d.usagePct > 100 ? 'Watch · over allowance' : 'Watch' })),
    ...rows
      .filter((r) => r.c === 'connected' && r.m !== null && openTicketFor(r.d.id))
      .map((r) => ({ ...deviceSummary(r.d, now, threshold), suggested_action: `Reporting again · resolve ${openTicketFor(r.d.id)!.id}` })),
  ]
  const total = rows.length
  const pct = (n: number) => (total ? Math.round((n / total) * 100) : 0)
  const byType = groupBy((d) => d.model)
  const bySite = groupBy((d) => siteById(d.siteId)?.name ?? d.siteId)
  return {
    generated_at: new Date(now).toISOString(),
    account: accountId ? (accountById(accountId)?.name ?? accountId) : 'All accounts',
    threshold_minutes: threshold,
    totals: { devices: total, connected: count('connected'), degraded: count('degraded'), offline: count('offline'), connected_pct: pct(count('connected')), degraded_pct: pct(count('degraded')), offline_pct: pct(count('offline')) },
    highest_risk_type: byType[0] ? { name: byType[0].name, issues: byType[0].offline + byType[0].degraded, total: byType[0].total } : null,
    highest_risk_site: bySite[0] ? { name: bySite[0].name, issues: bySite[0].offline + bySite[0].degraded, total: bySite[0].total } : null,
    by_type: byType,
    by_site: bySite,
    attention,
    open_tickets: monitorTickets()
      .filter((t) => t.status !== 'Resolved')
      .map(ticketView),
    simulation: SIMULATION,
    incident: currentIncident(now),
    monitor: (({ recent_calls: _r, ...rest }) => rest)(monitorStatus(now, 0)),
  }
}

export function createTicket(args: { device_id: string; severity?: string; title?: string; description?: string }, now = Date.now()) {
  const d = findDevice(args.device_id)
  if (!d) throw new Error(`Device "${args.device_id}" not found`)
  const existing = openTicketFor(d.id)
  if (existing) return { created: false, reason: 'An open ticket already exists for this device', ticket: ticketView(existing) }
  const m = minutesAgo(d, now)
  const sev = (['Critical', 'High', 'Medium', 'Low'].find((s) => s.toLowerCase() === (args.severity ?? '').toLowerCase()) ?? (m !== null && m > 240 ? 'Critical' : 'High')) as Case['severity']
  const nowD = new Date(now)
  const sla = new Date(now + (sev === 'Critical' ? 1 : 2) * 86_400_000)
  const title = args.title ?? `Device stopped responding — ${d.label}`
  const summary = args.description ?? `${d.label} (${d.id}, ${d.model}) at ${siteById(d.siteId)?.name ?? d.siteId} has not reported for ${m ?? 'an unknown number of'} minutes (last seen ${lastSeenAt(d, now) ?? 'unknown'}). Raised automatically by the fleet monitor via MCP.`
  const id = `INC-D2D-${ticketSeq++}`
  const ticket: Case = {
    id,
    type: 'Incident',
    title,
    severity: sev,
    status: 'Open',
    accountId: d.accountId,
    raised: fmtDate(nowD),
    sla: fmtDate(sla),
    summary,
    progress: [{ author: 'Fleet monitor (MCP)', date: fmtDate(nowD), status: 'Open', text: summary }],
    details: [
      { label: 'Case ID', value: id },
      { label: 'Type', value: 'Incident' },
      { label: 'Device', value: `${d.label} (${d.id})` },
      { label: 'Account', value: accountById(d.accountId)?.name ?? d.accountId },
      { label: 'Assignee', value: 'Viasat NOC' },
      { label: 'Opened', value: fmtDate(nowD) },
      { label: 'SLA deadline', value: fmtDate(sla) },
    ],
    deviceId: d.id,
    source: 'monitor',
    createdAt: nowD.toISOString(),
  }
  state.cases.unshift(ticket)
  return { created: true, ticket: ticketView(ticket) }
}

export function listTickets(args: { status?: string; device_id?: string; include_seed?: boolean }) {
  const base = args.include_seed ? state.cases : monitorTickets()
  const st = (args.status ?? 'open').toLowerCase()
  const list = base.filter((c) => (st === 'all' ? true : st === 'resolved' ? c.status === 'Resolved' : c.status !== 'Resolved')).filter((c) => !args.device_id || c.deviceId === args.device_id)
  return { total: list.length, tickets: list.map(ticketView) }
}

export function resolveTicket(ticketId: string, note?: string, now = Date.now()) {
  const t = state.cases.find((c) => c.id.toLowerCase() === ticketId.toLowerCase())
  if (!t) throw new Error(`Ticket ${ticketId} not found`)
  if (t.status === 'Resolved') return { resolved: false, reason: 'Already resolved', ticket: ticketView(t) }
  t.status = 'Resolved'
  t.progress = [...t.progress, { author: 'Fleet monitor (MCP)', date: fmtDate(new Date(now)), status: 'Resolved', text: note ?? 'Resolved via MCP.' }]
  return { resolved: true, ticket: ticketView(t) }
}

const connectivityEnum = z.enum(['all', 'connected', 'degraded', 'offline'])
const WRITE = { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false }

export const fleetTools: ToolDef[] = [
  {
    name: 'list_devices',
    title: 'List Install Base devices',
    description: 'Step 1 of the monitoring runbook: the Install Base device list with live connectivity and last-report time per device. Filter by connectivity (connected / degraded / offline), status, group, site, account or free text; paginated (default 50, max 200).',
    input: {
      connectivity: connectivityEnum.optional().describe('Default all'),
      status: z.string().optional().describe('Active, Suspended, …'),
      group_id: z.string().optional(),
      site_id: z.string().optional(),
      account_id: z.string().optional(),
      query: z.string().optional().describe('Matches id, name or MSISDN'),
      limit: z.number().int().optional(),
      offset: z.number().int().optional(),
    },
    run: (a) => {
      const r = listDevices(a)
      return { summary: `${r.returned} of ${r.total} devices (offset ${r.offset}).`, data: r }
    },
  },
  {
    name: 'detect_stale_devices',
    title: 'Detect devices that stopped responding',
    description: `Step 3 of the runbook: devices whose last report is older than threshold_minutes (default ${DEFAULT_THRESHOLD_MIN}), most stale first, each with a suggested ticket severity and whether an open ticket already exists. With include_degraded, also returns the "watch" tier (reported ${DEGRADED_AFTER_MIN}–threshold minutes ago). Also lists "recovered" devices: reporting again but still carrying an open ticket, which should be resolved with resolve_ticket.`,
    input: {
      threshold_minutes: z.number().int().positive().optional().describe(`Default ${DEFAULT_THRESHOLD_MIN}`),
      include_degraded: z.boolean().optional().describe('Default true'),
    },
    run: (a) => {
      const r = detectStale(a.threshold_minutes ?? DEFAULT_THRESHOLD_MIN, a.include_degraded ?? true)
      return { summary: `${r.stale.length} device${r.stale.length === 1 ? '' : 's'} exceed ${r.threshold_minutes} min (${r.already_ticketed} already ticketed, ${r.needing_ticket.length} need a ticket); ${r.watch.length} degraded to watch; ${r.recovered.length} reporting again with an open ticket to resolve.`, data: r }
    },
  },
  {
    name: 'get_fleet_health',
    title: 'Fleet health report',
    description: 'The Fleet Health dashboard numbers: totals and percentages by connectivity, breakdown by device type and by site, the attention list with suggested actions, highest-risk type/site, and open monitor tickets.',
    input: { account_id: z.string().optional().describe('Default: all accounts') },
    run: (a) => {
      const r = fleetHealth(a.account_id)
      return { summary: `${r.totals.connected} of ${r.totals.devices} devices connected (${r.totals.connected_pct}%); ${r.totals.degraded} degraded, ${r.totals.offline} offline.`, data: r }
    },
  },
  {
    name: 'create_ticket',
    title: 'Create a support ticket for a device',
    description: 'Step 4 of the runbook. Creates an incident ticket (INC-D2D-…) for a device that stopped responding. Idempotent: if the device already has an open ticket, returns it with created=false instead of creating a duplicate. State is in-memory on this server.',
    input: {
      device_id: z.string().describe('Device id (DEV-0051), name or MSISDN'),
      severity: z.enum(['Critical', 'High', 'Medium', 'Low']).optional().describe('Default: Critical if silent > 240 min, else High'),
      title: z.string().optional(),
      description: z.string().optional(),
    },
    annotations: WRITE,
    run: (a) => {
      const r = createTicket({ device_id: String(a.device_id), severity: a.severity, title: a.title, description: a.description })
      return { summary: r.created ? `Created ${r.ticket.id} for ${r.ticket.device_name} (${r.ticket.severity}).` : `${r.ticket.id} is already open for ${r.ticket.device_name}.`, data: r }
    },
  },
  {
    name: 'list_tickets',
    title: 'List tickets',
    description: 'Tickets raised through this server (default: open ones). status: open | resolved | all; include_seed adds the Business Hub seed support cases.',
    input: { status: z.enum(['open', 'resolved', 'all']).optional(), device_id: z.string().optional(), include_seed: z.boolean().optional() },
    run: (a) => {
      const r = listTickets(a)
      return { summary: `${r.total} ticket${r.total === 1 ? '' : 's'}.`, data: r }
    },
  },
  {
    name: 'resolve_ticket',
    title: 'Resolve a ticket',
    description: 'Marks a ticket Resolved (e.g. once the device reports again). Idempotent.',
    input: { ticket_id: z.string(), note: z.string().optional() },
    annotations: WRITE,
    run: (a) => {
      const r = resolveTicket(String(a.ticket_id), a.note)
      return { summary: r.resolved ? `Resolved ${r.ticket.id}.` : `${r.ticket.id} was already resolved.`, data: r }
    },
  },
  {
    name: 'get_monitor_status',
    title: 'Monitor heartbeat',
    description: 'Is the monitoring cron still running? When the last check (detect_stale_devices / list_devices / get_fleet_health) hit this server and from which client, checks in the last hour and 24 h, tickets created and resolved since the server started, the current simulated incident, and the last tool calls. status is active / silent / never.',
    input: {},
    run: () => {
      const s = monitorStatus(Date.now(), 25)
      return { summary: s.status_hint, data: { ...s, incident: currentIncident() } }
    },
  },
  {
    name: 'reset_demo_data',
    title: 'Reset demo data',
    description: 'Removes all tickets created through this server and restarts the time simulation, so the monitoring demo can be replayed from the first poll.',
    input: {},
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: false },
    run: () => {
      resetDemo()
      resetSimulation()
      return { summary: 'Demo data reset.', data: { ok: true, open_tickets: 0 } }
    },
  },
]
