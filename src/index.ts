import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { createServer } from './server'
import { createApp } from './http'
import { BUSINESS_HUB_URL, PERSONA, PORT, SERVER_NAME, SERVER_VERSION } from './config'

async function main() {
  if (process.argv.includes('--stdio')) {
    // stdout is the protocol channel in stdio mode — log to stderr only.
    const server = createServer()
    await server.connect(new StdioServerTransport())
    console.error(`${SERVER_NAME} ${SERVER_VERSION} ready on stdio (persona: ${PERSONA})`)
    return
  }
  const app = createApp()
  app.listen(PORT, () => {
    console.log(`${SERVER_NAME} ${SERVER_VERSION} listening on http://localhost:${PORT}/mcp (persona: ${PERSONA}, app: ${BUSINESS_HUB_URL})`)
  })
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
