import { z } from 'zod'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'

const user = (text: string) => ({ messages: [{ role: 'user' as const, content: { type: 'text' as const, text } }] })

/** Starter prompts mirroring the Business Hub jobs-to-be-done. */
export function registerPrompts(server: McpServer) {
  server.registerPrompt('find_api_spec', { title: 'Find the right API spec', description: 'Locate the API specification and endpoint for a task.', argsSchema: { task: z.string().describe('What the integration needs to do, e.g. "create product orders"') } }, ({ task }) =>
    user(`Which Business Hub API specification and endpoint should I use to ${task}? Use get_catalogue_index or search_library to find it, then get_api_spec for the detail. Give me the spec code, version, status, the exact endpoint and method, any newer version or breaking change I should know about, and the open-in-app link.`),
  )
  server.registerPrompt('order_status', { title: 'Order status', description: 'Status of an order, and what to do next if it failed.', argsSchema: { order_id: z.string().describe('e.g. ord-5008') } }, ({ order_id }) =>
    user(`What is the status of order ${order_id}? Use get_order. Tell me where it is in fulfilment, what has been done, what is pending, and — if it failed or is at risk — why and what I should do next.`),
  )
  server.registerPrompt('agreement_summary', { title: 'Agreement coverage and expiry', description: 'What an agreement covers and when it expires.', argsSchema: { agreement_id: z.string().optional().describe('e.g. AGR-D2D-BSNL-2024; omit for all') } }, ({ agreement_id }) =>
    user(`${agreement_id ? `Summarise agreement ${agreement_id}` : 'Summarise my agreements'} using get_agreement: type, what it covers, key terms (minimum commit, SLA), start and end dates, and anything expiring soon.`),
  )
  server.registerPrompt('attention_summary', { title: 'What needs attention', description: 'Devices, orders and accounts that need attention right now.' }, () =>
    user('Which devices or accounts need attention right now? Use get_attention_summary and group the answer by account, most urgent first, with the record ids.'),
  )
  server.registerPrompt('compare_plans', { title: 'Compare plans', description: 'Compare two plans for a use case.', argsSchema: { use_case: z.string().describe('e.g. "a container fleet"') } }, ({ use_case }) =>
    user(`Compare the available NB-NTN plans for ${use_case}. Use get_catalogue_index to list the products, then compare_plans. Recommend one and say whether it is covered by the current agreement or needs an enquiry.`),
  )
  server.registerPrompt('escalation', { title: 'Account manager and escalation', description: 'Who the account manager is and how to escalate.' }, () =>
    user('Who is my Viasat account manager and how do I escalate an issue? Use get_support_contact and list any open cases that are past their SLA deadline.'),
  )
}
