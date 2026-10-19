import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { BUSINESS_HUB_URL, PERSONA, SERVER_NAME, SERVER_VERSION } from './config'
import { registerTools, readTools } from './tools/read'
import { fleetTools } from './tools/fleet'
import { registerResources } from './resources'
import { registerPrompts } from './prompts'

const INSTRUCTIONS = `Business Hub is Viasat's partner portal for NB-NTN satellite IoT connectivity: customers and accounts, their install base (groups, sites, devices), orders and quotes, agreements, billing, support cases, and a library of API specs (TM Forum), commercial documents and guides. This server exposes that data for the Internal (Viasat) persona, plus fleet-monitoring tools: list_devices → detect_stale_devices → create_ticket (in-memory, idempotent per device) → resolve_ticket when a device reports again → list_tickets; get_monitor_status says when the last check happened${PERSONA !== 'internal' ? ` (currently restricted to the "${PERSONA}" persona's tools)` : ''}.

How to use it well:
- Start with get_catalogue_index (or search_library for free text) to resolve names to ids, then call the specific get_* tool.
- Fleet monitoring: detect_stale_devices(threshold_minutes) tells you which devices stopped responding and whether they already have a ticket; create one ticket per stale device with create_ticket; never duplicate.
- Statuses, counts, dates and prices must come from the tools — do not guess.
- Every record result includes an open_in_app link to ${BUSINESS_HUB_URL}; share it so the user can see the record in the app.
- Currency is USD; dates look like "25 Jul 2026". Record ids look like ord-5008, QUO-D2D-003, dev-001, grp-001, SITE-D2D-005, AGR-D2D-BSNL-2024, INC-D2D-4471, tmf622-v5.`

/** Builds a fresh server instance. Cheap, so the HTTP transport creates one per request (stateless mode). `client` labels the caller in the activity log. */
export function createServer(client = 'unknown'): McpServer {
  const server = new McpServer({ name: SERVER_NAME, version: SERVER_VERSION }, { instructions: INSTRUCTIONS })
  registerTools(server, readTools, client)
  registerTools(server, fleetTools, client)
  registerResources(server)
  registerPrompts(server)
  return server
}
