/**
 * Connects as an MCP client (stdio by default, or a Streamable HTTP URL passed as the first argument),
 * lists tools/resources/prompts and calls every read tool with sample arguments.
 *   npx tsx scripts/smoke.ts                      # spawns `tsx src/index.ts --stdio`
 *   npx tsx scripts/smoke.ts http://localhost:8080/mcp
 */
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'

const calls: [string, Record<string, unknown>][] = [
  ['get_catalogue_index', {}],
  ['search_library', { query: 'order creation API' }],
  ['get_api_spec', { spec_id: 'tmf622-v5' }],
  ['get_document', { doc_id: 'doc-privacy' }],
  ['get_install_base', { scope: 'customer', id: 'bsnl' }],
  ['get_device', { query: 'Buoy sensor 001' }],
  ['list_orders', { status: 'Failed' }],
  ['get_order', { order_id: 'ord-5010' }],
  ['get_agreement', { agreement_id: 'AGR-D2D-BSNL-2024' }],
  ['get_contacts', { account_id: 'cus-bsnl-marine' }],
  ['get_support_contact', {}],
  ['get_attention_summary', {}],
  ['compare_plans', { product_ids: ['nbntn-iot-connectivity', 'nbntn-asset-tracking'] }],
  ['get_news', {}],
  ['get_app_link', { kind: 'spec', id: 'tmf622-v5' }],
  ['list_devices', { connectivity: 'offline' }],
  ['detect_stale_devices', { threshold_minutes: 60 }],
  ['get_fleet_health', {}],
  ['create_ticket', { device_id: 'DEV-0051' }],
  ['create_ticket', { device_id: 'DEV-0051' }], // idempotent: created=false
  ['list_tickets', {}],
  ['get_monitor_status', {}],
  ['resolve_ticket', { ticket_id: 'INC-D2D-4500' }],
  ['reset_demo_data', {}],
  ['get_order', { order_id: 'nope' }], // expected error
]

async function main() {
  const url = process.argv[2]
  const transport = url ? new StreamableHTTPClientTransport(new URL(url)) : new StdioClientTransport({ command: 'npx', args: ['tsx', 'src/index.ts', '--stdio'] })
  const client = new Client({ name: 'business-hub-smoke', version: '0.1.0' })
  await client.connect(transport)
  console.log(`connected via ${url ? 'http' : 'stdio'}; server instructions: ${(client.getInstructions() ?? '').slice(0, 80)}…`)

  const tools = await client.listTools()
  console.log(`tools (${tools.tools.length}): ${tools.tools.map((t) => t.name).join(', ')}`)
  const resources = await client.listResourceTemplates()
  console.log(`resource templates (${resources.resourceTemplates.length}): ${resources.resourceTemplates.map((r) => r.uriTemplate).join(', ')}`)
  const listed = await client.listResources()
  console.log(`resources listed: ${listed.resources.length}`)
  const prompts = await client.listPrompts()
  console.log(`prompts (${prompts.prompts.length}): ${prompts.prompts.map((p) => p.name).join(', ')}`)

  let failures = 0
  for (const [name, args] of calls) {
    const r = (await client.callTool({ name, arguments: args })) as { isError?: boolean; content: { type: string; text?: string }[]; structuredContent?: unknown }
    const first = r.content.find((c) => c.type === 'text')?.text ?? ''
    const expectError = name === 'get_order' && args.order_id === 'nope'
    const ok = expectError ? !!r.isError : !r.isError && !!r.structuredContent
    if (!ok) failures++
    console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}(${JSON.stringify(args)}) → ${first.split('\n')[0].slice(0, 100)}`)
  }
  const doc = await client.readResource({ uri: 'businesshub://docs/doc-privacy' })
  console.log(`resource read: ${(doc.contents[0] as { text?: string }).text?.split('\n')[0]}`)
  const prompt = await client.getPrompt({ name: 'order_status', arguments: { order_id: 'ord-5008' } })
  console.log(`prompt: ${(prompt.messages[0].content as { text: string }).text.slice(0, 80)}…`)

  await client.close()
  console.log(failures ? `\n${failures} failure(s)` : '\nall good')
  process.exit(failures ? 1 : 0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
