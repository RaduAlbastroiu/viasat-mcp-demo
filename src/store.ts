/**
 * In-memory data: the Business Hub seed data (copied unchanged from business-hub/src/data by `npm run sync-data`)
 * plus the tickets the fleet monitor creates through this server. Tickets live for the process lifetime.
 */
import { customers, seedDevices } from './data/estate'
import { seedOrders, seedQuotes } from './data/commerce'
import { seedCases, seedNotifications } from './data/support'
import type { Case } from './data/types'

export const state = {
  devices: seedDevices,
  orders: seedOrders,
  quotes: seedQuotes,
  cases: [...seedCases] as Case[],
  notifications: seedNotifications,
  contacts: customers[0].contacts,
}

export type Store = typeof state

/** Tickets raised through MCP (create_ticket). */
export const monitorTickets = () => state.cases.filter((c) => c.source === 'monitor')

export function resetDemo() {
  state.cases = [...seedCases]
}
