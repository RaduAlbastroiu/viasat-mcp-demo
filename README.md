# Business Hub MCP server

A [Model Context Protocol](https://modelcontextprotocol.io) server that exposes the Viasat Business Hub demo data (customers, install base, orders and quotes, agreements, support cases, API specs, documents, guides, news) to Claude and any other MCP-capable agent. The data is the same mock data the Business Hub app ships with, so an agent connected to this server can answer the same questions the app's built-in assistant answers, and every record comes with an **open-in-app** deep link into the hosted app.

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
| `FLEET_SIMULATION` / `FLEET_DRIFT` | `on` / `1` | Live-clock simulation for last-seen times (see Fleet monitoring demo). |
| `MCP_URL`, `MONITOR_MODEL`, `MONITOR_INTERVAL`, `MONITOR_THRESHOLD` | `http://localhost:8080/mcp`, `claude-opus-5-5`, `3m`, `60` | Used by `npm run monitor` only. |
| `MCP_PERSONA` | `internal` | Tool set to expose: `internal` (all), `integrator`, `operator`, `commercial`. |

No API key is needed on the server itself: it only serves data. The model runs on the client side — including the `monitor` script, which is the only place `ANTHROPIC_API_KEY` is used.

Endpoints: `POST /mcp` (Streamable HTTP, stateless), `GET /health`, `GET /`, `GET /api/fleet`, `GET /api/devices`, `GET /api/tickets`, `GET /api/monitor` (heartbeat).

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

## Fleet monitoring demo

The use case: **get the Install Base device list → monitor every 3 minutes → detect devices whose last report exceeds a threshold → create a ticket**. The data holds a 100-device NB-NTN IoT pilot fleet (88 connected, 9 degraded reporting 16–40 min ago, 3 offline for 90–480 min: DEV-0051, DEV-0080, DEV-0092) plus the two buoy sensors.

```bash
npm run monitor -- --once                    # one pass against MCP_URL (default http://localhost:8080/mcp)
npm run monitor                              # run now, then at every wall-clock multiple of 3 min (18:00, 18:03, 18:06 …)
npm run monitor -- --interval 15m            # :00, :15, :30, :45
npm run monitor -- --wait                    # don't run immediately; wait for the next boundary
npm run monitor -- --interval 1m --threshold 30   # quick demo: 7 stale devices on the first poll
MCP_URL=https://<host>/mcp npm run monitor -- --connector   # let the Messages API call the MCP server itself (public URL)
```

Runs are clock-aligned (`--no-align` for plain "every N minutes from start"). If you prefer the OS scheduler instead of a long-running process, the equivalent crontab line is `*/3 * * * * cd /path/to/business-hub-mcp && MCP_URL=https://<host>/mcp npm run monitor -- --once >> monitor.log 2>&1`.

Each run asks Claude (needs `ANTHROPIC_API_KEY`) to follow the runbook in `src/runbook.ts`: `detect_stale_devices(threshold)` → `create_ticket` once per stale device without an open ticket → `resolve_ticket` for devices that report again → short summary. `create_ticket` is idempotent per device, so repeated polls never duplicate tickets. Tickets are in-memory on the server (`list_tickets`, `GET /api/tickets`, and the Business Hub Home dashboard shows them); `reset_demo_data` clears them.

### Is the cron still running?

Once every silent device has a ticket, a healthy run creates nothing — so "no new tickets" does not mean the monitor died. The server records every tool call it receives:

```bash
curl https://<host>/api/monitor            # status active|silent|never, last check time + client, checks in last hour/24 h, tickets created/resolved, last 50 calls
curl https://<host>/health                 # same summary under "monitor", plus the current simulated incident
```

The same data is the `get_monitor_status` tool (ask any connected agent "is the monitor still running?") and the heartbeat line in the Business Hub Home dashboard. `status` turns `silent` when no check arrived for `MONITOR_SILENT_AFTER_MIN` minutes (default 30). Every call is also one log line (`tool detect_stale_devices ← <user-agent> · …`), so on DigitalOcean the **Runtime Logs** tab shows the cron's activity. Note the log and the counters live in memory, like the tickets: a redeploy resets them.

Time simulation (`FLEET_SIMULATION`, default on): connected devices keep reporting; degraded and offline devices drift by `FLEET_DRIFT` minutes per real minute (default 1), so later polls catch devices crossing the threshold. Set `FLEET_SIMULATION=off` for static values.

Rolling incidents (`FLEET_INCIDENTS`, default on): in every `FLEET_INCIDENT_EVERY` window (default `2h`) one otherwise healthy device goes silent from the start of the window — degraded after 15 min, past the 60-min threshold after an hour — and reports again when the next window starts, at which point `detect_stale_devices` lists it under `recovered` and the runbook resolves its ticket. The device is picked by hashing the window number, so every server instance agrees and the schedule survives restarts. This is what keeps the demo producing new tickets (and resolutions) over a weekend instead of going quiet after the first day. Keep the window longer than the threshold, otherwise the device recovers before it can be ticketed; `/health` shows the current incident.

Alternatives for the schedule: Claude Code (`claude mcp add --transport http business-hub https://<host>/mcp`, then `/loop 3m` with the runbook prompt), or a Claude Managed Agents scheduled deployment (`*/3 * * * *`) with the MCP server attached and the runbook as system prompt.

## What the server exposes

Fleet tools:

| Tool | Purpose |
|---|---|
| `list_devices(connectivity?, status?, group_id?, site_id?, account_id?, query?, limit?, offset?)` | Device list with live connectivity and last-report time (paginated). |
| `detect_stale_devices(threshold_minutes = 60, include_degraded = true)` | Devices past the threshold (most stale first, suggested severity, existing ticket) plus the "watch" tier. |
| `create_ticket(device_id, severity?, title?, description?)` | **Write.** Incident ticket for a device; returns the existing open ticket instead of duplicating. |
| `list_tickets(status?, device_id?, include_seed?)` / `resolve_ticket(ticket_id, note?)` | Tickets raised through the server; resolve one. |
| `get_monitor_status()` | Heartbeat: last check time and client, checks in the last hour / 24 h, tickets created and resolved, recent tool calls. |
| `get_fleet_health(account_id?)` | Dashboard numbers: totals, by type, by site, attention list, open tickets. |
| `reset_demo_data()` | Clears tickets and restarts the simulation. |

REST views of the same data (for the dashboard and quick checks): `GET /api/fleet`, `GET /api/devices?connectivity=offline`, `GET /api/tickets?status=open`, `GET /api/monitor`.

Read tools (annotated `readOnlyHint`):

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

`src/data/` is copied unchanged from the Business Hub app (`../business-hub/src/data`), including `install-base-devices.json` (the 100-device fleet) and `fleet.ts`, which maps it onto the app's model. After changing the app's mock data run `npm run sync-data` here. The tool logic mirrors the app's chat assistant (`business-hub/src/chat/tools/executors.ts`) so both give the same answers.

## Verify

```bash
npm run smoke                                 # spawns the server over stdio, calls every tool, reads a resource and a prompt
npm run smoke -- http://localhost:8080/mcp    # same against a running HTTP instance
ANTHROPIC_API_KEY=… npm run eval              # runs the JTBD prompts (incl. "which devices stopped responding") through Claude
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
  tools/fleet.ts  fleet monitoring tools (+ the ticket store)
  fleet-sim.ts    live-clock simulation of last-seen times
  runbook.ts      the monitoring runbook prompt
  monitor.ts      the clock-aligned monitor (Messages API + MCP), default every 3 min
scripts/          sync-data, smoke, eval
```
