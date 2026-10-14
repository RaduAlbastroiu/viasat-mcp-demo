export const SERVER_NAME = 'business-hub'
export const SERVER_VERSION = '0.1.0'

/** Public URL of the hosted Business Hub app, used to build "open in app" deep links. */
export const BUSINESS_HUB_URL = (process.env.BUSINESS_HUB_URL ?? 'https://mcp-demo-app-o6moq.ondigitalocean.app').replace(/\/+$/, '')

export const PORT = Number(process.env.PORT ?? 8080)

/** Which persona's tool set to expose. The demo is built for "internal" (every tool); the others mirror the JTBD gating. */
export const PERSONA = (process.env.MCP_PERSONA ?? 'internal').toLowerCase()
