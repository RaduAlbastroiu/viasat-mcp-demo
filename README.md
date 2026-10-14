# Business Hub MCP server

A read-only [Model Context Protocol](https://modelcontextprotocol.io) server that exposes the Viasat Business Hub demo data (customers, install base, orders and quotes, agreements, support cases, API specs, documents, guides, news) to Claude and any other MCP-capable agent. The data is the same mock data the Business Hub app ships with, so an agent connected to this server can answer the same questions the app's built-in assistant answers, and every record comes with an **open-in-app** deep link into the hosted app.

## Run

```bash
npm install
npm run dev            # HTTP on http://localhost:8080/mcp (tsx watch)
npm run dev:stdio      # stdio transport, for local MCP hosts
npm run build && npm start   # production: node dist/index.js
```

Environment (see `.env.example`):

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `8080` | HTTP port. DigitalOcean sets it. |
| `BUSINESS_HUB_URL` | `https://mcp-demo-app-o6moq.ondigitalocean.app` | Base URL used for `open_in_app` deep links. |
| `MCP_PERSONA` | `internal` | Tool set to expose: `internal` (all), `integrator`, `operator`, `commercial`. |

No API key is needed on the server: it only serves data. The model runs on the client side.

Endpoints: `POST /mcp` (Streamable HTTP, stateless), `GET /health`, `GET /`.

## Connect a client

**claude.ai** — Settings › Connectors › Add custom connector → URL `https://<your-host>/mcp` (no auth).

**Claude Code**
```bash
claude mcp add --transport http business-hub https://<your-host>/mcp
# or run it locally over stdio:
claude mcp add business-hub -- node /path/to/business-hub-mcp/dist/index.js --stdio
```

**Claude Desktop** — `claude_desktop_config.json`:
```json
{ "mcpServers": { "business-hub": { "command": "node", "args": ["/path/to/business-hub-mcp/dist/index.js", "--stdio"] } } }
```

**Anthropic Messages API** (MCP connector):
```json
{
  "model": "claude-opus-5-5",
  "max_tokens": 8000,
  "mcp_servers": [{ "type": "url", "url": "https://<your-host>/mcp", "name": "business-hub" }],
  "tools": [{ "type": "mcp_toolset", "mcp_server_name": "business-hub" }],
  "messages": [{ "role": "user", "content": "What's the status of order ord-5008?" }]
}
```
with header `anthropic-beta: mcp-client-2025-11-20`.

**MCP Inspector** — `npm run inspector` (after `npm run build`).

## What the server exposes

Tools (all read-only, annotated `readOnlyHint`):

| Tool | Purpose |
|---|---|
| `get_catalogue_index` | Ids for everything: specs, products, documents, guides, customers, accounts, groups, sites, agreements. Call first to resolve names. |
| `search_library(query, kind?)` | Keyword search across specs, documents, guides, products, news, breaking changes. |
| `get_api_spec(spec_id)` | Version, status, domain, endpoints and methods, newer version, breaking changes, location. |
| `get_document(doc_id)` | Document or guide content/summary. |
| `get_install_base(scope?, id?)` | Customers → accounts → groups → devices with statuses, alarms, SLA breaches, failed orders. |
| `get_device(query)` | One device by id, label or MSISDN: status, plan, usage, alarms, identifiers, order history. |
| `list_orders(status?, account_id?)` / `get_order(order_id)` | Orders and quotes; detail with steps, items, activity, failure reason, next step. |
| `get_agreement(agreement_id?)` | Parties, terms, coverage, dates, documents. |
| `get_contacts(account_id?)` / `get_support_contact()` | Named contacts; account manager and escalation path. |
| `get_attention_summary()` | What needs attention, per account. |
| `compare_plans(product_ids[])` | Side-by-side plans plus the shared rate card. |
| `get_news()` | News & Events. |
| `get_app_link(kind, id)` | Deep link into the hosted app for any record or page. |

Every tool returns a one-line summary plus JSON (`structuredContent`), and record results carry `open_in_app` URLs.

Resources: `businesshub://docs/{id}`, `businesshub://guides/{id}`, `businesshub://specs/{id}` (listable). Prompts: `find_api_spec`, `order_status`, `agreement_summary`, `attention_summary`, `compare_plans`, `escalation`.

## Data

`src/data/` is copied unchanged from the Business Hub app (`../business-hub/src/data`). After changing the app's mock data run `npm run sync-data` here. The tool logic mirrors the app's chat assistant (`business-hub/src/chat/tools/executors.ts`) so both give the same answers.

## Verify

```bash
npm run smoke                                 # spawns the server over stdio, calls every tool, reads a resource and a prompt
npm run smoke -- http://localhost:8080/mcp    # same against a running HTTP instance
ANTHROPIC_API_KEY=… npm run eval              # runs the JTBD prompts through Claude with these tools bridged in
```

## Host

Any Node 18+ host works. For a DigitalOcean App Platform **Web Service**: build command `npm run build`, run command `npm start`, HTTP port `8080`, env `BUSINESS_HUB_URL`. A `Dockerfile` is included for container hosts. The public URL must be HTTPS for claude.ai connectors and the Messages API connector.

## Layout

```
src/
  index.ts        entrypoint: HTTP on $PORT, or --stdio
  http.ts         Express app: POST /mcp (stateless Streamable HTTP), /health, CORS
  server.ts       McpServer factory: instructions, tools, resources, prompts
  config.ts       env-driven settings
  store.ts        read-only in-memory data
  persona.ts      persona → tool list
  tools/read.ts   the tools (ported from the app's chat assistant)
  tools/links.ts  open-in-app deep links
  resources.ts    document / guide / spec resources
  prompts.ts      JTBD starter prompts
  data/           mock data, copied from the app
scripts/          sync-data, smoke, eval
```
