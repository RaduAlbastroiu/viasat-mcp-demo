import express, { type Request, type Response } from 'express'
import cors from 'cors'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import { createServer } from './server'
import { BUSINESS_HUB_URL, PERSONA, SERVER_NAME, SERVER_VERSION } from './config'
import { readTools } from './tools/read'
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
    tools: readTools.filter((t) => allowsTool(PERSONA, t.name)).map((t) => t.name),
    business_hub_url: BUSINESS_HUB_URL,
  })

  app.get('/', (_req, res) => {
    res.json({ ...describe(), hint: 'Point an MCP client at POST /mcp.' })
  })
  app.get('/health', (_req, res) => {
    res.json({ ok: true, ...describe() })
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
