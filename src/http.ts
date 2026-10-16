import express, { type Request, type Response } from 'express'
import cors from 'cors'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import { createServer } from './server'
import { BUSINESS_HUB_URL, PERSONA, SERVER_NAME, SERVER_VERSION } from './config'
import { readTools } from './tools/read'
import { fleetHealth, fleetTools, listDevices, listTickets } from './tools/fleet'
import { allowsTool } from './persona'

export function createApp() {
  const app = express()
  app.use(
    cors({
      origin: '*',
      exposedHeaders: ['Mcp-Session-Id', 'mcp-protocol-version'],
      allowedHeaders: ['Content-Type', 'Accept', 'Authorization', 'Mcp-Session-Id', 'mcp-protocol-version', 'Last-Event-ID'],
    }),
  )
  app.use(express.json({ limit: '1mb' }))

  const describe = () => ({
    name: SERVER_NAME,
    version: SERVER_VERSION,
    persona: PERSONA,
    mcp_endpoint: '/mcp',
    transport: 'streamable-http (stateless)',
    tools: [...readTools, ...fleetTools].filter((t) => allowsTool(PERSONA, t.name)).map((t) => t.name),
    rest_api: ['/api/fleet', '/api/devices', '/api/tickets'],
    business_hub_url: BUSINESS_HUB_URL,
  })

  app.get('/', (_req, res) => {
    res.json({ ...describe(), hint: 'Point an MCP client at POST /mcp.' })
  })
  app.get('/health', (_req, res) => {
    res.json({ ok: true, ...describe() })
  })

  // Plain JSON views of the same data, for the Business Hub dashboard and quick checks.
  app.get('/api/fleet', (req, res) => {
    res.json(fleetHealth(typeof req.query.account_id === 'string' ? req.query.account_id : undefined))
  })
  app.get('/api/devices', (req, res) => {
    const q = req.query as Record<string, string | undefined>
    res.json(listDevices({ connectivity: q.connectivity, status: q.status, group_id: q.group_id, site_id: q.site_id, account_id: q.account_id, query: q.query, limit: q.limit ? Number(q.limit) : undefined, offset: q.offset ? Number(q.offset) : undefined }))
  })
  app.get('/api/tickets', (req, res) => {
    const q = req.query as Record<string, string | undefined>
    res.json(listTickets({ status: q.status ?? 'open', device_id: q.device_id, include_seed: q.include_seed === 'true' }))
  })

  // Stateless Streamable HTTP: a fresh server + transport per request, nothing kept between calls.
  app.post('/mcp', async (req: Request, res: Response) => {
    const server = createServer()
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined })
    res.on('close', () => {
      void transport.close()
      void server.close()
    })
    try {
      await server.connect(transport)
      await transport.handleRequest(req, res, req.body)
    } catch (e) {
      console.error('MCP request failed:', e)
      if (!res.headersSent) res.status(500).json({ jsonrpc: '2.0', error: { code: -32603, message: 'Internal server error' }, id: null })
    }
  })
  const methodNotAllowed = (_req: Request, res: Response) => {
    res.status(405).json({ jsonrpc: '2.0', error: { code: -32000, message: 'Method not allowed in stateless mode. Use POST /mcp.' }, id: null })
  }
  app.get('/mcp', methodNotAllowed)
  app.delete('/mcp', methodNotAllowed)

  return app
}
