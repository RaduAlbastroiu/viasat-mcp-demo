/**
 * Read-only in-memory data: the same seed data the Business Hub app ships with (copied unchanged from
 * business-hub/src/data by `npm run sync-data`).
 */
import { customers, seedDevices } from './data/estate'
import { seedOrders, seedQuotes } from './data/commerce'
import { seedCases, seedNotifications } from './data/support'

export const state = {
  devices: seedDevices,
  orders: seedOrders,
  quotes: seedQuotes,
  cases: seedCases,
  notifications: seedNotifications,
  contacts: customers[0].contacts,
}

export type Store = typeof state
