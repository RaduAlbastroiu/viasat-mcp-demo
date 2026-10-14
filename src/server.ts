import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { BUSINESS_HUB_URL, PERSONA, SERVER_NAME, SERVER_VERSION } from './config'
import { registerReadTools } from './tools/read'
import { registerResources } from './resources'
import { registerPrompts } from './prompts'

const INSTRUCTIONS = `Business Hub is Viasat's partner portal for NB-NTN satellite IoT connectivity: customers and accounts, their install base (groups, sites, devices), orders and quotes, agreements, billing, support cases, and a library of API specs (TM Forum), commercial documents and guides. This server exposes that data read-only for the Internal (Viasat) persona${PERSONA !== 'internal' ? ` (currently restricted to the "${PERSONA}" persona's tools)` : ''}.

How to use it well:
- Start with get_catalogue_index (or search_library for free text) to resolve names to ids, then call the specific get_* tool.
- Statuses, counts, dates and prices must come from the tools — do not guess.
- Every record result includes an open_in_app link to ${BUSINESS_HUB_URL}; share it so the user can see the record in the app.
- Currency is USD; dates look like "25 Jul 2026". Record ids look like ord-5008, QUO-D2D-003, dev-001, grp-001, SITE-D2D-005, AGR-D2D-BSNL-2024, INC-D2D-4471, tmf622-v5.`

/** Builds a fresh server instance. Cheap, so the HTTP transport creates one per request (stateless mode). */
export function createServer(): McpServer {
  const server = new McpServer({ name: SERVER_NAME, version: SERVER_VERSION }, { instructions: INSTRUCTIONS })
  registerReadTools(server)
  registerResources(server)
  registerPrompts(server)
  return server
}
