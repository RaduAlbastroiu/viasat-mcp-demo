/**
 * The NB-NTN IoT pilot fleet: 100 devices across 15 groups/sites under one BSNL India account.
 * Source: install-base-devices.json (kept unchanged); this file maps the rows onto the app's data model.
 */
import raw from './install-base-devices.json'
import type { Account, Connectivity, Device, Group, RatePlan, Site } from './types'

export interface FleetDeviceRow {
  id: string
  deviceName: string
  productSpecification: string
  msisdn: string
  imsi: string
  iccid: string
  status: 'active' | 'suspended'
  connectivityStatus: Connectivity
  groupId: string
  groupName: string
  siteId: string
  siteName: string
  accountId: string
  accountName: string
  dataPlan: string
  activationDate: string
  lastSeenAt: string
  lastSeenMinutesAgo: number
}

export const fleetRows = raw as FleetDeviceRow[]
export const FLEET_ACCOUNT_ID = 'ACC-BSNL-IN-001'
export const FLEET_ACCOUNT_NAME = 'BSNL India (NB-NTN IoT pilot)'

export const fleetAccount: Account = {
  id: FLEET_ACCOUNT_ID,
  customerId: 'bsnl',
  name: FLEET_ACCOUNT_NAME,
  legalName: 'Bharat Sanchar Nigam Limited — NB-NTN IoT pilot',
  status: 'Validated',
  identity: [
    { label: 'Legal name', value: 'Bharat Sanchar Nigam Limited' },
    { label: 'Trading name', value: FLEET_ACCOUNT_NAME },
    { label: 'Company type', value: 'company · Ltd' },
    { label: 'Account type', value: 'Pilot programme' },
    { label: 'Region', value: 'IN' },
    { label: 'Account id', value: FLEET_ACCOUNT_ID },
  ],
  contactMethods: [{ kind: 'Technical', label: 'Technical · Email', value: 'iot-pilot@bsnl.example' }],
  contacts: [],
}

const cityMeta: Record<string, { state: string; coords: string; mapX: number; mapY: number }> = {
  'Mumbai, MH': { state: 'Maharashtra', coords: '19.076°N, 72.878°E', mapX: 296, mapY: 196 },
  'Delhi, DL': { state: 'Delhi', coords: '28.614°N, 77.209°E', mapX: 345, mapY: 92 },
  'Bengaluru, KA': { state: 'Karnataka', coords: '12.972°N, 77.594°E', mapX: 366, mapY: 262 },
  'Chennai, TN': { state: 'Tamil Nadu', coords: '13.083°N, 80.271°E', mapX: 398, mapY: 262 },
  'Kolkata, WB': { state: 'West Bengal', coords: '22.573°N, 88.364°E', mapX: 470, mapY: 168 },
  'Hyderabad, TG': { state: 'Telangana', coords: '17.385°N, 78.487°E', mapX: 368, mapY: 214 },
  'Pune, MH': { state: 'Maharashtra', coords: '18.520°N, 73.857°E', mapX: 304, mapY: 210 },
  'Ahmedabad, GJ': { state: 'Gujarat', coords: '23.023°N, 72.572°E', mapX: 282, mapY: 150 },
  'Jaipur, RJ': { state: 'Rajasthan', coords: '26.912°N, 75.787°E', mapX: 326, mapY: 118 },
  'Lucknow, UP': { state: 'Uttar Pradesh', coords: '26.847°N, 80.947°E', mapX: 392, mapY: 118 },
  'Surat, GJ': { state: 'Gujarat', coords: '21.170°N, 72.831°E', mapX: 288, mapY: 170 },
  'Nagpur, MH': { state: 'Maharashtra', coords: '21.146°N, 79.088°E', mapX: 364, mapY: 174 },
  'Indore, MP': { state: 'Madhya Pradesh', coords: '22.720°N, 75.858°E', mapX: 326, mapY: 160 },
  'Patna, BR': { state: 'Bihar', coords: '25.594°N, 85.138°E', mapX: 440, mapY: 132 },
  'Bhopal, MP': { state: 'Madhya Pradesh', coords: '23.260°N, 77.413°E', mapX: 343, mapY: 164 },
}

const siteTypeFor = (groupName: string) =>
  groupName.startsWith('Agri') ? 'Agricultural' : groupName.startsWith('Fleet') ? 'Fleet depot' : groupName.startsWith('FieldOps') ? 'Field operations' : groupName.startsWith('Warehouse') ? 'Warehouse' : 'Terminal'

function uniqueBy<T, K>(items: T[], key: (t: T) => K): T[] {
  const seen = new Set<K>()
  return items.filter((i) => {
    const k = key(i)
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
}

export const fleetGroups: Group[] = uniqueBy(fleetRows, (r) => r.groupId).map((r) => ({
  id: r.groupId,
  accountId: FLEET_ACCOUNT_ID,
  name: r.groupName,
  oobRate: 'USD 0.18/Kb · USD 0.02/message',
  created: '2025-05-01',
  status: 'Active',
}))

export const fleetSites: Site[] = uniqueBy(fleetRows, (r) => r.siteId).map((r) => {
  const m = cityMeta[r.siteName]
  const city = r.siteName.split(',')[0]
  return { id: r.siteId, accountId: FLEET_ACCOUNT_ID, name: r.siteName, city, type: siteTypeFor(r.groupName), country: 'IN', address: `${city}, ${m?.state ?? 'India'}, India`, coords: m?.coords, status: 'Active', mapX: m?.mapX, mapY: m?.mapY }
})

export const fleetPlanPrice: Record<string, number> = { 'NB-IoT 10MB/mo': 2.8, 'NB-IoT 50MB/mo': 3.4, 'NB-IoT 200MB/mo': 4.2, 'NB-IoT Unlimited': 6 }
const planAllowanceMb: Record<string, number> = { 'NB-IoT 10MB/mo': 10, 'NB-IoT 50MB/mo': 50, 'NB-IoT 200MB/mo': 200, 'NB-IoT Unlimited': 1000 }
const planSlug = (p: string) => p.replace(/^NB-IoT /, '').replace(/\/mo$/, '').toLowerCase()
const planIdFor = (groupId: string, plan: string) => `${groupId}-${planSlug(plan)}`

/** One rate-plan instance per (group, plan) pair in use, as the app models plans per group. */
export const fleetPlans: RatePlan[] = uniqueBy(fleetRows, (r) => planIdFor(r.groupId, r.dataPlan)).map((r) => ({
  id: planIdFor(r.groupId, r.dataPlan),
  groupId: r.groupId,
  dataPlan: r.dataPlan,
  smsPlan: 'No messages',
  label: r.dataPlan,
  monthly: fleetPlanPrice[r.dataPlan] ?? 3,
}))

const hash = (s: string) => {
  let h = 0
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0
  return Math.abs(h)
}

export const fleetDevices: Device[] = fleetRows.map((r) => {
  const usagePct = 12 + (hash(r.imsi) % 84)
  const allowance = planAllowanceMb[r.dataPlan] ?? 50
  const conn = r.connectivityStatus
  return {
    id: r.id,
    label: r.deviceName,
    accountId: FLEET_ACCOUNT_ID,
    groupId: r.groupId,
    planId: planIdFor(r.groupId, r.dataPlan),
    siteId: r.siteId,
    model: r.productSpecification,
    productSpecification: r.productSpecification,
    imsi: r.imsi,
    imei: `3569${r.imsi.slice(4)}`,
    msisdn: r.msisdn,
    iccid: r.iccid,
    productInstance: `PI-${r.id}`,
    status: r.status === 'suspended' ? 'Suspended' : 'Active',
    dataPlan: r.dataPlan,
    smsPlan: 'No messages',
    features: ['IP data', 'NIDD'],
    monthly: fleetPlanPrice[r.dataPlan] ?? 3,
    oneTime: 2,
    usagePct,
    usage: [{ label: 'Data', used: Math.round((allowance * usagePct) / 100), allowance, unit: 'MB', tone: usagePct > 90 ? 'red' : 'blue' }],
    alarm:
      conn === 'offline'
        ? { title: `Loss of connectivity — ${r.deviceName}`, tone: 'negative', caption: `No report for ${r.lastSeenMinutesAgo} minutes (resource alarm, critical).` }
        : conn === 'degraded'
          ? { title: `Intermittent reporting — ${r.deviceName}`, tone: 'warning', caption: `Last report ${r.lastSeenMinutesAgo} minutes ago (resource alarm, minor).` }
          : undefined,
    connection: conn === 'offline' ? 'Offline' : 'Online',
    availability: conn === 'connected' ? 'Available' : 'Degraded',
    bearerAvailability: conn === 'connected' ? '99.4%' : conn === 'degraded' ? '96.1%' : '0%',
    latency: conn === 'connected' ? '410 ms' : '—',
    orderId: '',
    connectivity: conn,
    lastSeenMinutesAgo: r.lastSeenMinutesAgo,
    activationDate: r.activationDate,
  }
})

/** Effective connectivity for any device: fleet rows carry it, older records derive it from alarms/availability. */
export function deviceConnectivity(d: Device): Connectivity {
  if (d.connectivity) return d.connectivity
  if (d.alarm?.tone === 'negative') return 'offline'
  if (d.alarm || d.availability === 'Degraded') return 'degraded'
  return 'connected'
}

/** Last report time, computed from the relative minutes so the data stays plausible on any day. */
export function lastSeenAt(d: Device, now = Date.now()): string | null {
  return d.lastSeenMinutesAgo === undefined ? null : new Date(now - d.lastSeenMinutesAgo * 60_000).toISOString()
}
