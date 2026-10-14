export type Tone = 'positive' | 'warning' | 'negative' | 'infoPrimary' | 'infoSecondary' | 'pink' | 'violet'

export interface KV { label: string; value: string }

export interface Contact {
  id: string
  firstName: string
  lastName: string
  role: 'Commercial' | 'Technical' | 'Billing'
  jobTitle: string
  email: string
  phone?: string
}

export interface ContactMethod { kind: string; label: string; value: string }

export interface Customer {
  id: string
  name: string
  legalName: string
  role: string // e.g. "Reseller · MNO"
  roleCode: string // e.g. "DistributionPartner + MNO"
  identity: KV[]
  contactMethods: ContactMethod[]
  contacts: Contact[]
  outstandingBalance?: string
  status: 'Validated' | 'Initialized' | 'Closed'
}

export interface Account {
  id: string // cus-bsnl-marine
  customerId: string
  name: string
  legalName: string
  identity: KV[]
  contactMethods: ContactMethod[]
  contacts: Contact[]
  status: 'Validated'
  slaBreached?: number
  failedOrders?: number
}

export interface Group {
  id: string
  accountId: string
  name: string
  oobRate: string
  created: string
  status: 'Active' | 'Provisioning'
}

export interface RatePlan {
  id: string
  groupId: string
  dataPlan: string
  smsPlan: string
  label: string
  monthly: number
}

export interface Site {
  id: string // SITE-D2D-005
  accountId: string
  name: string
  type: string
  country: string
  address: string
  coords?: string
  status: 'Active' | 'Pending' | 'Decommissioned'
  mapX?: number
  mapY?: number
}

export type DeviceStatus = 'Active' | 'Suspended' | 'Terminated' | 'Barred' | 'Provisioning'

export interface Device {
  id: string
  label: string
  accountId: string
  groupId: string
  planId: string
  siteId: string
  model: string
  imsi: string
  imei: string
  msisdn: string
  iccid: string
  productInstance: string
  status: DeviceStatus
  dataPlan: string
  smsPlan: string
  features: string[]
  monthly: number
  oneTime: number
  usagePct: number
  usage: { label: string; used: number; allowance: number; unit: string; tone: 'red' | 'blue' | 'teal' }[]
  alarm?: { title: string; tone: 'warning' | 'negative'; caption: string }
  connection: 'Online' | 'Offline' | 'No data'
  availability: 'Degraded' | 'Available'
  bearerAvailability: string
  latency: string
  orderId: string
}

export interface Agreement {
  id: string
  name: string
  type: 'Value-Added Reseller' | 'Master Service Agreement' | 'Roaming' | 'Non-Disclosure Agreement'
  status: 'Active' | 'Expiring soon' | 'Expired' | 'Pending'
  covers: string | null
  expires: string
  start: string
  customerId: string
  parties: KV[]
  keyTerms: KV[]
  documents: string[]
}

export type OrderStatus = 'Draft' | 'Acknowledged' | 'In progress' | 'Completed' | 'Failed' | 'Cancelled' | 'Expired'

export interface OrderStep { label: string; date?: string; state: 'done' | 'failed' | 'pending' | 'current' }

export interface Order {
  id: string
  title: string
  orderType: string // "Add & activate device" | "Create group" | "Suspend"
  items: number
  accountId: string
  date: string
  status: OrderStatus
  progress?: string // "1 of 4 steps"
  expiresIn?: string
  groupRef?: string
  completed?: string
  serviceOrder?: { id: string; status: string; steps: OrderStep[] }
  orderItems?: { action: string; name: string; ref: string; status: string }[]
  activity: { date: string; text: string }[]
  failureReason?: string
  checklist?: { title: string; items: { text: string; done: boolean }[] }
}

export type QuoteStatus = 'Pending approval' | 'Approved' | 'Accepted' | 'Expired' | 'Declined'

export interface Quote {
  id: string
  title: string
  accountId: string
  created: string
  validUntil: string
  valueMo: string
  status: QuoteStatus
  governedBy: string
  governedByNote?: string
  convertedOrderId?: string
  items: number
  lineItems: { desc: string; code: string; qty: number; unit: number; total: number }[]
  monthly: number
  oneTime: number
  siteIds: string[]
  tracking?: { id: string; status: string; steps: OrderStep[] }
}

export interface Invoice {
  id: string
  accountLabel: string
  billingAccount: string
  period: string
  periodRange: string
  status: 'Paid' | 'Overdue' | 'Processing'
  total: number | null
  due: string
  lines: { desc: string; code: string; qty: number; unit: number; total: number }[]
}

export type CaseType = 'Request' | 'Incident' | 'API access'
export type CaseStatus = 'Open' | 'In progress' | 'Pending customer' | 'Resolved'
export type Severity = 'Low' | 'Medium' | 'High' | 'Critical'

export interface Case {
  id: string
  type: CaseType
  title: string
  severity: Severity
  status: CaseStatus
  accountId: string
  raised: string
  sla: string
  summary: string
  progress: { author: string; date: string; status?: CaseStatus; text: string }[]
  details: KV[]
  planEnquired?: KV[]
  requestedBy?: KV[]
  relatedMonitoring?: string
}

export type NotificationType = 'Order notes' | 'Offer' | 'Contract' | 'Support' | 'At risk' | 'Order status' | 'Alarm' | 'Resource'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  detail: string
  status: 'Update' | 'Attention' | 'Critical'
  date: string
  dateLong: string
  link?: { kind: string; id: string }
  unread?: boolean
}

export interface Product {
  id: string
  name: string
  eyebrow: string
  icon: 'router' | 'shipping' | 'boat' | 'agriculture'
  art: 'satellite' | 'port' | 'ship' | 'field' | 'ocean'
  price: string
  offerings: number
  certifiedDevices: number
  description: string
  covered: boolean
  topBadge?: 'Share Pool Plan' | 'Cross-sell'
  plans?: string
  agreements?: string
  activeOn?: number
  market: string
  sector: string
  businessUnit: string
}

export interface LibraryDoc {
  id: string
  title: string
  category: string
  docType: string
  description: string
  tags: string[]
  meta: string
  art: 'iot' | 'handshake' | 'abstract' | 'road' | 'laptop' | 'code'
  status: 'Live' | 'Planned'
}

export interface ApiSpec {
  id: string
  code: string
  name: string
  version: string
  date: string
  status: 'Live' | 'Planned' | 'Roadmap' | 'Latest version'
  description: string
  domain: 'Product' | 'Fulfilment' | 'Assurance' | 'Configuration' | 'Billing'
  products: string[]
  methods: ('GET' | 'POST' | 'PATCH' | 'DELETE')[]
}
