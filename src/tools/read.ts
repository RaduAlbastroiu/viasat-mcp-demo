/**
 * Read tools. Logic is ported from the Business Hub in-app assistant (business-hub/src/chat/tools/executors.ts)
 * so answers match what the app's own chat gives.
 */
import { z } from 'zod'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { ToolAnnotations } from '@modelcontextprotocol/sdk/types.js'
import { connectivityNow, lastSeenAt, minutesAgo } from '../fleet-sim'
import { PERSONA } from '../config'
import { allowsTool } from '../persona'
import { state } from '../store'
import { recordCall } from '../activity'
import { appLink, LINK_KINDS } from './links'
import { ACTIVATION_FEE, BASE_SERVICE, INSTALL_FEE, SUSPENSION_FEE, apiSpecs, breakingChanges, certifiedDevices, dataPlans, docById, guideById, guides, libraryDocs, newsItems, productById, products, smsPlans, specById } from '../data/catalog'
import { accountById, accounts, customerById, customers, groupById, groups, planById, siteById, sites } from '../data/estate'
import { agreementById, agreements } from '../data/commerce'
import type { Device } from '../data/types'

export interface ToolResult {
  summary: string
  data: Record<string, unknown>
}

export interface ToolDef {
  name: string
  title: string
  description: string
  input: z.ZodRawShape
  /** Defaults to read-only + idempotent */
  annotations?: ToolAnnotations
  run: (args: Record<string, any>) => ToolResult
}
export type ReadTool = ToolDef

const text = (...parts: Array<string | undefined>) => parts.filter(Boolean).join(' ').toLowerCase()
const score = (hay: string, q: string) => q.toLowerCase().split(/\s+/).filter(Boolean).reduce((s, w) => s + (hay.includes(w) ? 1 : 0), 0)
const notFound = (what: string): never => {
  throw new Error(`${what} not found`)
}

function specEndpoints(id: string) {
  const s = specById(id)
  if (!s) return []
  const base = `/${s.name.replace(/[^a-z]/gi, '').replace(/^./, (c) => c.toLowerCase())}Management/${s.version.split('.')[0]}`
  const entity = s.name.split(' ')[0].toLowerCase() === 'product' ? s.name.split(' ').slice(0, 2).join('').replace(/^./, (c) => c.toLowerCase()) : s.name.split(' ')[0].toLowerCase()
  const eps = [
    { methods: ['GET', 'POST'].filter((m) => s.methods.includes(m as never)), path: `${base}/${entity}` },
    { methods: ['GET', 'PATCH', 'DELETE'].filter((m) => s.methods.includes(m as never)), path: `${base}/${entity}/{id}` },
  ]
  if (s.code === 'TMF622') eps.push({ methods: ['GET', 'POST'], path: `${base}/cancelProductOrder` }, { methods: ['GET'], path: `${base}/cancelProductOrder/{id}` })
  return eps.filter((e) => e.methods.length)
}

const deviceView = (d: Device) => ({
  id: d.id,
  label: d.label,
  status: d.status,
  account: accountById(d.accountId)?.name,
  account_id: d.accountId,
  group: groupById(d.groupId)?.name,
  group_id: d.groupId,
  plan: planById(d.planId)?.label,
  site: siteById(d.siteId)?.name,
  site_id: d.siteId,
  model: d.model,
  imsi: d.imsi,
  msisdn: d.msisdn,
  monthly_usd: d.monthly,
  usage_pct: d.usagePct,
  usage: d.usage.map((u) => `${u.label}: ${u.used}/${u.allowance} ${u.unit}`),
  alarm: d.alarm ? `${d.alarm.tone === 'negative' ? 'Critical' : 'Warning'} — ${d.alarm.title}` : null,
  connection: d.connection,
  availability: d.availability,
  connectivity: connectivityNow(d),
  last_seen_at: lastSeenAt(d),
  last_seen_minutes_ago: minutesAgo(d),
  last_order: d.orderId || null,
  open_in_app: appLink('device', d.id),
})

export const readTools: ReadTool[] = [
  {
    name: 'get_catalogue_index',
    title: 'Catalogue & estate index',
    description:
      'Compact index of everything in the Business Hub with ids: API specs, products/plans, documents, guides, breaking changes, customers, accounts, groups, sites, agreements. Call this first when you need to resolve a name to an id, then use the specific get_* tool.',
    input: {},
    run: () => {
      const data = {
        api_specs: apiSpecs.map((s) => ({ id: s.id, code: s.code, name: s.name, version: s.version, domain: s.domain, status: s.status })),
        breaking_changes: breakingChanges.map((b) => ({ id: b.id, title: b.title, date: b.date, spec: b.tag })),
        products: products.map((p) => ({ id: p.id, name: p.name, price: p.price, covered_by_agreement: p.covered })),
        documents: libraryDocs.map((d) => ({ id: d.id, title: d.title, category: d.category, type: d.docType })),
        guides: guides.map((g) => ({ id: g.id, title: g.title, type: g.type })),
        news: newsItems.map((n) => ({ id: n.id, title: n.title })),
        customers: customers.filter((c) => accounts.some((a) => a.customerId === c.id)).map((c) => ({ id: c.id, name: c.name, role: c.role, accounts: accounts.filter((a) => a.customerId === c.id).map((a) => ({ id: a.id, name: a.name })) })),
        groups: groups.map((g) => ({ id: g.id, name: g.name, account_id: g.accountId })),
        sites: sites.map((s) => ({ id: s.id, name: s.name, type: s.type, account_id: s.accountId, status: s.status })),
        agreements: agreements.map((a) => ({ id: a.id, name: a.name, type: a.type, status: a.status, covers: a.covers, ends: a.expires })),
        support_contact: { name: 'Sarah Chen', title: 'Account Executive · Viasat' },
        signed_in_user: { name: 'Mx Parv Kaur', role: 'Self-Service Account Administrator', persona: PERSONA },
      }
      return { summary: 'Business Hub index (ids for every record).', data }
    },
  },
  {
    name: 'search_library',
    title: 'Search the Library',
    description: 'Keyword search across API specs, commercial documents, getting-started guides, products, news and breaking changes. Returns the best matches with ids, a summary and an open-in-app link.',
    input: {
      query: z.string().describe('Keywords, e.g. "order creation API" or "privacy"'),
      kind: z.enum(['any', 'spec', 'document', 'guide', 'product', 'news']).optional().describe('Restrict to one kind (default any)'),
    },
    run: ({ query, kind = 'any' }) => {
      const q = String(query)
      const hits: { kind: string; id: string; title: string; summary: string; open_in_app: string | null; score: number }[] = []
      if (kind === 'any' || kind === 'spec') {
        apiSpecs.forEach((s) => hits.push({ kind: 'spec', id: s.id, title: `${s.code} — ${s.name} (${s.version}, ${s.status})`, summary: `${s.domain}: ${s.description}`, open_in_app: appLink('spec', s.id), score: score(text(s.code, s.name, s.domain, s.description, s.status), q) }))
        breakingChanges.forEach((b) => hits.push({ kind: 'breaking_change', id: b.id, title: `Breaking change: ${b.title}`, summary: `${b.date} · ${b.tag}`, open_in_app: `${appLink('page', 'library-technical')}&view=breaking`, score: score(text(b.title, b.body, b.tag), q) }))
      }
      if (kind === 'any' || kind === 'document') libraryDocs.forEach((d) => hits.push({ kind: 'document', id: d.id, title: d.title, summary: `${d.category} / ${d.docType}: ${d.description}`, open_in_app: appLink('document', d.id), score: score(text(d.title, d.category, d.docType, d.description), q) }))
      if (kind === 'any' || kind === 'guide') guides.forEach((g) => hits.push({ kind: 'guide', id: g.id, title: g.title, summary: `${g.type}: ${g.desc}`, open_in_app: appLink('guide', g.id), score: score(text(g.title, g.type, g.desc), q) }))
      if (kind === 'any' || kind === 'product') products.forEach((p) => hits.push({ kind: 'product', id: p.id, title: p.name, summary: `${p.price} · ${p.description}`, open_in_app: appLink('product', p.id), score: score(text(p.name, p.description, p.market, p.sector), q) }))
      if (kind === 'any' || kind === 'news') newsItems.forEach((n) => hits.push({ kind: 'news', id: n.id, title: n.title, summary: n.desc, open_in_app: appLink('page', 'library-news'), score: score(text(n.title, n.desc), q) }))
      const top = hits.filter((h) => h.score > 0).sort((a, b) => b.score - a.score).slice(0, 8)
      return { summary: `${top.length} result${top.length === 1 ? '' : 's'} for “${q}”.`, data: { query: q, results: top.map(({ score: _s, ...h }) => h) } }
    },
  },
  {
    name: 'get_api_spec',
    title: 'API specification detail',
    description: 'Full detail for one API specification: version, status, domain, description, endpoints with HTTP methods, newer version and related breaking changes, and where it lives in the Library.',
    input: { spec_id: z.string().describe('Spec id (tmf622-v5) or code (TMF622)') },
    run: ({ spec_id }) => {
      const id = String(spec_id)
      const s = specById(id) ?? apiSpecs.find((x) => x.code.toLowerCase() === id.toLowerCase()) ?? notFound(`Spec ${id}`)
      const newer = apiSpecs.find((x) => x.code === s.code && x.status === 'Latest version' && x.id !== s.id)
      return {
        summary: `${s.code} — ${s.name} ${s.version} (${s.status}, ${s.domain}).`,
        data: { id: s.id, code: s.code, name: s.name, version: s.version, date: s.date, status: s.status, domain: s.domain, description: s.description, products: s.products, methods: s.methods, endpoints: specEndpoints(s.id), newer_version: newer ? { id: newer.id, version: newer.version, change: newer.description } : null, related_breaking_changes: breakingChanges.filter((b) => b.specId === (newer?.id ?? s.id)).map((b) => ({ id: b.id, title: b.title, date: b.date })), location: `Library › Technical › API catalogue › Service Fulfilment › Domain specific specs › ${s.domain}`, open_in_app: appLink('spec', s.id) },
      }
    },
  },
  {
    name: 'get_document',
    title: 'Document or guide content',
    description: 'Content of a Library document or getting-started guide, for summaries and explanations. PDFs return their summary and metadata.',
    input: { doc_id: z.string().describe('Document id (doc-privacy) or guide id (guide-auth)') },
    run: ({ doc_id }) => {
      const id = String(doc_id)
      const d = docById(id)
      const g = guideById(id)
      if (d) return { summary: d.title, data: { id: d.id, title: d.title, category: d.category, type: d.docType, tags: d.tags, meta: d.meta, summary: d.description, content: d.meta.startsWith('PDF') ? 'PDF — full text is not available in this demo; see the summary.' : `${d.description} This document applies to ${d.tags.join(', ')} and was last updated ${d.meta.split('updated ')[1]}.`, location: 'Library › Commercial', open_in_app: appLink('document', d.id) } }
      if (g) return { summary: g.title, data: { id: g.id, title: g.title, type: g.type, meta: g.meta, summary: g.desc, location: 'Library › Technical › Getting started guides', open_in_app: appLink('guide', g.id) } }
      return notFound(`Document ${id}`)
    },
  },
  {
    name: 'get_install_base',
    title: 'Install base',
    description: 'Estate summary: customers → accounts → groups → devices with statuses, alarms, SLA breaches and failed orders. Scope to one customer, account or group by id, or "all".',
    input: {
      scope: z.enum(['all', 'customer', 'account', 'group']).optional().describe('Default all'),
      id: z.string().optional().describe('Customer id (bsnl), account id (cus-bsnl-marine) or group id (grp-001)'),
    },
    run: ({ scope = 'all', id }) => {
      let accts = accounts
      if (scope === 'customer' && id) accts = accounts.filter((a) => a.customerId === id)
      if (scope === 'account' && id) accts = accounts.filter((a) => a.id === id)
      if (scope === 'group' && id) accts = accounts.filter((a) => groups.some((g) => g.id === id && g.accountId === a.id))
      if (!accts.length) notFound(`Install base for ${scope} ${id ?? ''}`)
      const out = accts.map((a) => {
        const grps = groups.filter((g) => g.accountId === a.id && (scope !== 'group' || g.id === id))
        return {
          account: a.name,
          account_id: a.id,
          customer: customerById(a.customerId)?.name,
          customer_id: a.customerId,
          sla_breached: a.slaBreached ?? 0,
          failed_orders: a.failedOrders ?? 0,
          groups: grps.map((g) => ({ id: g.id, name: g.name, status: g.status, open_in_app: appLink('group', g.id), devices: state.devices.filter((d) => d.groupId === g.id).map(deviceView) })),
          sites: sites.filter((s) => s.accountId === a.id).map((s) => ({ id: s.id, name: s.name, type: s.type, status: s.status, devices: state.devices.filter((d) => d.siteId === s.id).length, open_in_app: appLink('site', s.id) })),
          open_in_app: appLink('account', a.id),
        }
      })
      const all = state.devices.filter((d) => accts.some((a) => a.id === d.accountId))
      return { summary: `${all.length} devices across ${accts.length} account${accts.length === 1 ? '' : 's'}.`, data: { totals: { accounts: accts.length, devices: all.length, active: all.filter((d) => d.status === 'Active').length, suspended: all.filter((d) => d.status === 'Suspended').length, alarms: all.filter((d) => d.alarm).length }, accounts: out } }
    },
  },
  {
    name: 'get_device',
    title: 'Device detail',
    description: 'Detail for one device/terminal: status, group, plan, usage against allowance, alarms, identifiers (IMSI, MSISDN, IMEI), site and order history.',
    input: { query: z.string().describe('Device id (dev-001), label ("Buoy sensor 001") or MSISDN') },
    run: ({ query }) => {
      const q = String(query).toLowerCase()
      const d = state.devices.find((x) => x.id.toLowerCase() === q || x.label.toLowerCase() === q || x.msisdn === q || x.label.toLowerCase().includes(q)) ?? notFound(`Device "${query}"`)
      const order = state.orders.find((o) => o.id === d.orderId)
      return { summary: `${d.label} is ${d.status}.`, data: { ...deviceView(d), order_history: order ? { id: order.id, title: order.title, status: order.status, activity: order.activity } : null, available_actions_in_app: ['suspend', 'resume', 'terminate', 'move to group', 'bar device'] } }
    },
  },
  {
    name: 'list_orders',
    title: 'List orders and quotes',
    description: 'Orders and quotes with id, title, account, date, status and progress. Optional filters by status and account.',
    input: {
      status: z.string().optional().describe('Draft, Acknowledged, In progress, Completed, Failed, Cancelled, Pending approval, Approved, Accepted, Expired'),
      account_id: z.string().optional().describe('Account id, e.g. cus-bsnl-marine'),
    },
    run: ({ status, account_id }) => {
      const st = status ? String(status).toLowerCase() : null
      const orders = state.orders.filter((o) => (!st || o.status.toLowerCase() === st) && (!account_id || o.accountId === account_id)).map((o) => ({ id: o.id, kind: 'order', title: o.title, type: o.orderType, account: accountById(o.accountId)?.name, date: o.date, status: o.status, progress: o.progress ?? o.expiresIn ?? null, open_in_app: appLink('order', o.id) }))
      const quotes = state.quotes.filter((q) => (!st || q.status.toLowerCase() === st) && (!account_id || q.accountId === account_id)).map((q) => ({ id: q.id, kind: 'quote', title: q.title, account: accountById(q.accountId)?.name, date: q.created, status: q.status, valid_until: q.validUntil, monthly_usd: q.monthly, open_in_app: appLink('quote', q.id) }))
      return { summary: `${orders.length} orders, ${quotes.length} quotes.`, data: { orders, quotes } }
    },
  },
  {
    name: 'get_order',
    title: 'Order or quote detail',
    description: 'Detail for one order or quote: status, service-order steps, items, activity log, failure reason and the recommended next step.',
    input: { order_id: z.string().describe('Order id (ord-5008) or quote id (QUO-D2D-003)') },
    run: ({ order_id }) => {
      const id = String(order_id).toLowerCase()
      const o = state.orders.find((x) => x.id.toLowerCase() === id)
      if (o) {
        const next = o.status === 'Failed' ? 'Start a new order after remediation (Marketplace › Orders & quotes › ⊕ on the failed row).' : o.status === 'Draft' ? 'Resume the draft from Orders & quotes (pencil icon) or the Saved panel.' : o.status === 'In progress' || o.status === 'Acknowledged' ? 'In fulfilment — no action needed; it can be cancelled from the row.' : null
        return { summary: `${o.id} — ${o.status}.`, data: { id: o.id, title: o.title, type: o.orderType, account: accountById(o.accountId)?.name, account_id: o.accountId, date: o.date, status: o.status, progress: o.progress ?? null, completed: o.completed ?? null, failure_reason: o.failureReason ?? null, service_order: o.serviceOrder ? { id: o.serviceOrder.id, status: o.serviceOrder.status, steps: o.serviceOrder.steps.map((s) => `${s.label}: ${s.state}${s.date ? ' (' + s.date + ')' : ''}`) } : null, items: o.orderItems ?? null, activity: o.activity, next_step: next, open_in_app: appLink('order', o.id) } }
      }
      const q = state.quotes.find((x) => x.id.toLowerCase() === id) ?? notFound(`Order or quote ${order_id}`)
      return { summary: `${q.id} — ${q.status}.`, data: { id: q.id, kind: 'quote', title: q.title, account: accountById(q.accountId)?.name, account_id: q.accountId, created: q.created, valid_until: q.validUntil, status: q.status, governed_by: q.governedBy, monthly_usd: q.monthly, one_time_usd: q.oneTime, line_items: q.lineItems, converted_to_order: q.convertedOrderId ?? null, installation_sites: q.siteIds.map((sid) => siteById(sid)?.name), open_in_app: appLink('quote', q.id) } }
    },
  },
  {
    name: 'get_agreement',
    title: 'Agreement detail',
    description: 'Agreement detail: parties, type, status, product coverage, key terms (minimum commit, SLA), start/end dates and documents. Omit the id for all agreements.',
    input: { agreement_id: z.string().optional().describe('e.g. AGR-D2D-BSNL-2024') },
    run: ({ agreement_id }) => {
      const list = agreement_id ? [agreementById(String(agreement_id)) ?? notFound(`Agreement ${agreement_id}`)] : agreements
      return { summary: `${list.length} agreement${list.length === 1 ? '' : 's'}.`, data: { agreements: list.map((a) => ({ id: a.id, name: a.name, type: a.type, status: a.status, covers: a.covers, start: a.start, end: a.expires, customer: customerById(a.customerId)?.name, parties: a.parties, key_terms: a.keyTerms, documents: a.documents, open_in_app: appLink('agreement', a.id) })) } }
    },
  },
  {
    name: 'get_contacts',
    title: 'Contacts',
    description: 'Named contacts (commercial, billing, technical) and contact methods for a customer or account.',
    input: { account_id: z.string().optional().describe('Account id (cus-bsnl-marine) or customer id (bsnl); default bsnl') },
    run: ({ account_id }) => {
      const id = account_id ? String(account_id) : 'bsnl'
      const a = accountById(id)
      const c = customerById(id)
      if (!a && !c) notFound(`Account or customer ${id}`)
      const entity = (a ?? c)!
      const contacts = a ? a.contacts : id === 'bsnl' ? state.contacts : c!.contacts
      return { summary: `${contacts.length} contact${contacts.length === 1 ? '' : 's'} for ${entity.name}.`, data: { entity: entity.name, entity_id: id, contact_methods: entity.contactMethods.map((m) => `${m.label}: ${m.value}`), contacts: contacts.map((x) => ({ id: x.id, name: `${x.firstName} ${x.lastName}`, role: x.role, job_title: x.jobTitle, email: x.email, phone: x.phone ?? null })), open_in_app: appLink(a ? 'account' : 'customer', id) } }
    },
  },
  {
    name: 'get_support_contact',
    title: 'Account manager and escalation',
    description: "The user's Viasat account manager and how to escalate: support entry points and open cases past SLA.",
    input: {},
    run: () => {
      const open = state.cases.filter((c) => c.status !== 'Resolved')
      return { summary: 'Account manager: Sarah Chen.', data: { account_manager: { name: 'Sarah Chen', title: 'Account Executive · Viasat', email: 'sarah.chen@viasat.example' }, escalation: ['Report an issue (incident) or Raise a request from Support & cases, or the headset icon in the app header', 'Critical incidents are assigned to Viasat NOC — Field Ops'], open_cases: open.map((c) => ({ id: c.id, title: c.title, severity: c.severity, status: c.status, sla_deadline: c.sla, open_in_app: appLink('case', c.id) })), open_in_app: appLink('page', 'support') } }
    },
  },
  {
    name: 'get_attention_summary',
    title: 'What needs attention',
    description: 'Everything that needs attention right now across the estate: failed and at-risk orders, drafts, SLA breaches, open cases, device alarms, devices over allowance, agreements expiring and quotes to review — per account.',
    input: {},
    run: () => {
      const perAccount = accounts.map((a) => {
        const devs = state.devices.filter((d) => d.accountId === a.id)
        const ords = state.orders.filter((o) => o.accountId === a.id)
        const cs = state.cases.filter((c) => c.accountId === a.id && c.status !== 'Resolved')
        return { account: a.name, account_id: a.id, failed_orders: ords.filter((o) => o.status === 'Failed').map((o) => o.id), draft_orders: ords.filter((o) => o.status === 'Draft').map((o) => o.id), in_fulfilment: ords.filter((o) => ['Acknowledged', 'In progress'].includes(o.status)).map((o) => `${o.id} (${o.progress})`), sla_breached: a.slaBreached ?? 0, open_cases: cs.map((c) => `${c.id} ${c.status} (${c.severity})`), device_alarms: devs.filter((d) => d.alarm).map((d) => `${d.label}: ${d.alarm!.title}`), devices_over_allowance: devs.filter((d) => d.usagePct > 100).map((d) => d.label), suspended_devices: devs.filter((d) => d.status === 'Suspended').map((d) => d.label), open_in_app: appLink('account', a.id) }
      })
      const flagged = perAccount.filter((p) => p.failed_orders.length || p.open_cases.length || p.device_alarms.length || p.sla_breached || p.draft_orders.length || p.devices_over_allowance.length || p.suspended_devices.length)
      return { summary: `${flagged.length} account${flagged.length === 1 ? '' : 's'} need attention.`, data: { agreements_expiring: agreements.filter((a) => a.status === 'Expiring soon').map((a) => `${a.id} ends ${a.expires}`), quotes_to_review: state.quotes.filter((q) => ['Pending approval', 'Approved'].includes(q.status)).map((q) => `${q.id} ${q.status}`), accounts: flagged } }
    },
  },
  {
    name: 'compare_plans',
    title: 'Compare plans',
    description: 'Side-by-side comparison of products/plans: price, agreement coverage, offerings, certified devices, market, sector, and the shared rate card (data/SMS plan deltas, fees).',
    input: { product_ids: z.array(z.string()).min(1).describe('Product ids from the index, e.g. ["nbntn-iot-connectivity", "nbntn-asset-tracking"]') },
    run: ({ product_ids }) => {
      const list = (product_ids as string[]).map((id) => productById(id) ?? notFound(`Product ${id}`))
      return { summary: `${list.length} plan${list.length === 1 ? '' : 's'} compared.`, data: { plans: list.map((p) => ({ id: p.id, name: p.name, price: p.price, covered_by_agreement: p.covered, offerings: p.offerings, certified_devices: p.certifiedDevices, market: p.market, sector: p.sector, business_unit: p.businessUnit, description: p.description, how_to_get_it: p.covered ? 'Order now in the Marketplace' : 'Request to add to agreement (Enquire)', open_in_app: appLink('product', p.id) })), shared_rate_card: { base_service_usd_per_device_month: BASE_SERVICE, data_plans: dataPlans.map((d) => `${d.label} +${d.delta.toFixed(2)}`), sms_plans: smsPlans.map((d) => `${d.label} +${d.delta.toFixed(2)}`), activation_fee_usd: ACTIVATION_FEE, installation_fee_usd: INSTALL_FEE, suspension_fee_usd_per_month: SUSPENSION_FEE, certified_devices: certifiedDevices.map((c) => `${c.model} (${c.manufacturer}) — ${c.certification}`) } } }
    },
  },
  {
    name: 'get_news',
    title: 'News & Events',
    description: 'News, events and reports from the Library › News & Events tab.',
    input: {},
    run: () => ({ summary: `${newsItems.length} items.`, data: { items: newsItems.map((n) => ({ ...n, open_in_app: appLink('page', 'library-news') })) } }),
  },
  {
    name: 'get_app_link',
    title: 'Open-in-app link',
    description: 'Deep link into the hosted Business Hub app for a record (opens the right page and detail panel). Kinds: ' + LINK_KINDS.join(', ') + '. For kind=page, id is one of home, install-base, marketplace, orders, assets, library, library-technical, library-news, agreements, billing, support, notifications, monitoring, profile.',
    input: { kind: z.enum(LINK_KINDS), id: z.string().describe('Record id (tmf622-v5, ord-5008, dev-001, AGR-D2D-BSNL-2024…) or page id') },
    run: ({ kind, id }) => {
      const url = appLink(String(kind), String(id)) ?? notFound(`${kind} ${id}`)
      return { summary: url, data: { kind, id, url } }
    },
  },
]

export function registerTools(server: McpServer, tools: ToolDef[], client = 'unknown') {
  for (const t of tools) {
    if (!allowsTool(PERSONA, t.name)) continue
    server.registerTool(
      t.name,
      { title: t.title, description: t.description, inputSchema: t.input, annotations: t.annotations ?? { readOnlyHint: true, idempotentHint: true, openWorldHint: false } },
      async (args) => {
        try {
          const { summary, data } = t.run((args ?? {}) as Record<string, any>)
          recordCall({ tool: t.name, client, ok: true, summary, created: t.name === 'create_ticket' && data.created === true, resolved: t.name === 'resolve_ticket' && data.resolved === true })
          return { content: [{ type: 'text', text: `${summary}\n${JSON.stringify(data, null, 2)}` }], structuredContent: data }
        } catch (e) {
          const message = e instanceof Error ? e.message : String(e)
          recordCall({ tool: t.name, client, ok: false, summary: message })
          return { content: [{ type: 'text', text: `Error: ${message}` }], isError: true }
        }
      },
    )
  }
}

export const registerReadTools = (server: McpServer) => registerTools(server, readTools)
