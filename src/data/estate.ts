import type { Account, Customer, Device, Group, RatePlan, Site } from './types'

export const customers: Customer[] = [
  {
    id: 'bsnl',
    name: 'BSNL India',
    legalName: 'Bharat Sanchar Nigam Limited',
    role: 'Reseller · MNO',
    roleCode: 'DistributionPartner + MNO',
    status: 'Validated',
    identity: [
      { label: 'Legal name', value: 'Bharat Sanchar Nigam Limited' },
      { label: 'Trading name', value: 'BSNL India' },
      { label: 'Company type', value: 'company · Ltd' },
      { label: 'Legal entity', value: 'Yes' },
      { label: 'Region', value: 'IN' },
      { label: 'Company id', value: 'org-bsnl' },
      { label: 'CIN', value: 'U74899DL2000GOI107739 · MCA India' },
    ],
    contactMethods: [
      { kind: 'Commercial', label: 'Commercial · Address', value: 'Bharat Sanchar Bhawan, Janpath, New Delhi 110001, IN' },
      { kind: 'Commercial', label: 'Commercial · Email', value: 'partners@bsnl.example' },
      { kind: 'Commercial', label: 'Commercial · Phone', value: '+91 11 2373 4499' },
    ],
    contacts: [
      { id: 'c-vr', firstName: 'Vikram', lastName: 'Rao', role: 'Commercial', jobTitle: 'Enterprise Partnerships Lead', email: 'v.rao@bsnl.example' },
    ],
    outstandingBalance: '$1,707.60',
  },
  {
    id: 'acceleronix',
    name: 'Acceleronix',
    legalName: 'Acceleronix Technologies Ltd',
    role: 'Reseller',
    roleCode: 'DistributionPartner',
    status: 'Validated',
    identity: [
      { label: 'Legal name', value: 'Acceleronix Technologies Ltd' },
      { label: 'Trading name', value: 'Acceleronix' },
      { label: 'Company type', value: 'company · Ltd' },
      { label: 'Legal entity', value: 'Yes' },
      { label: 'Region', value: 'IN' },
      { label: 'Company id', value: 'org-acx' },
    ],
    contactMethods: [
      { kind: 'Commercial', label: 'Commercial · Email', value: 'partners@acceleronix.example' },
    ],
    contacts: [],
  },
  {
    id: 'verizon',
    name: 'Verizon',
    legalName: 'Verizon Communications Inc.',
    role: 'MNO',
    roleCode: 'MNO',
    status: 'Validated',
    identity: [
      { label: 'Legal name', value: 'Verizon Communications Inc.' },
      { label: 'Trading name', value: 'Verizon' },
      { label: 'Company type', value: 'company · Inc' },
      { label: 'Legal entity', value: 'Yes' },
      { label: 'Region', value: 'US' },
      { label: 'Company id', value: 'org-vzn' },
    ],
    contactMethods: [{ kind: 'Commercial', label: 'Commercial · Email', value: 'wholesale@verizon.example' }],
    contacts: [],
  },
  { id: 'synersat', name: 'SYNERSAT', legalName: 'Synersat Ltd', role: 'VAR', roleCode: 'VAR', status: 'Validated', identity: [], contactMethods: [], contacts: [] },
  { id: 'tototheo', name: 'TOTOTHEO', legalName: 'Tototheo Maritime', role: 'VAR', roleCode: 'VAR', status: 'Validated', identity: [], contactMethods: [], contacts: [] },
  { id: 'pulsar', name: 'PULSAR', legalName: 'Pulsar Networks', role: 'VAR', roleCode: 'VAR', status: 'Validated', identity: [], contactMethods: [], contacts: [] },
]

export const accounts: Account[] = [
  {
    id: 'cus-bsnl-marine',
    customerId: 'bsnl',
    name: 'Sagar Marine Logistics',
    legalName: 'Sagar Marine Logistics Pvt Ltd',
    status: 'Validated',
    slaBreached: 1,
    identity: [
      { label: 'Legal name', value: 'Sagar Marine Logistics Pvt Ltd' },
      { label: 'Trading name', value: 'Sagar Marine' },
      { label: 'Company type', value: 'company · Pvt Ltd' },
      { label: 'Account type', value: 'LargeEnterprise' },
      { label: 'Legal entity', value: 'Yes' },
      { label: 'Region', value: 'IN' },
      { label: 'Account id', value: 'cus-bsnl-marine' },
      { label: 'CIN', value: 'U61100MH2018PTC311902 · MCA India' },
    ],
    contactMethods: [
      { kind: 'Commercial', label: 'Commercial · Address', value: '7 Ballard Estate, Fort, Mumbai 400001, IN' },
      { kind: 'Billing', label: 'Billing · Address', value: 'PO Box 2211, Nariman Point, Mumbai 400021, IN' },
      { kind: 'Commercial', label: 'Commercial · Email', value: 'ops@sagarmarine.example' },
      { kind: 'Commercial', label: 'Commercial · Phone', value: '+91 22 6612 8800' },
    ],
    contacts: [
      { id: 'c-pn', firstName: 'Priya', lastName: 'Nair', role: 'Commercial', jobTitle: 'Fleet Operations Manager', email: 'p.nair@sagarmarine.example', phone: '+91 98200 41122' },
      { id: 'c-rm', firstName: 'Rohan', lastName: 'Mehta', role: 'Billing', jobTitle: 'Head of Finance', email: 'r.mehta@sagarmarine.example', phone: '+91 98200 55310' },
      { id: 'c-ad', firstName: 'Anjali', lastName: 'Desai', role: 'Technical', jobTitle: 'Logistics Coordinator', email: 'a.desai@sagarmarine.example' },
    ],
  },
  {
    id: 'cus-bsnl-roam',
    customerId: 'bsnl',
    name: 'Deccan Roaming Services',
    legalName: 'Deccan Roaming Services Pvt Ltd',
    status: 'Validated',
    slaBreached: 3,
    failedOrders: 1,
    identity: [
      { label: 'Legal name', value: 'Deccan Roaming Services Pvt Ltd' },
      { label: 'Trading name', value: 'Deccan Roaming' },
      { label: 'Company type', value: 'company · Pvt Ltd' },
      { label: 'Account type', value: 'LargeEnterprise' },
      { label: 'Region', value: 'IN' },
      { label: 'Account id', value: 'cus-bsnl-roam' },
    ],
    contactMethods: [{ kind: 'Commercial', label: 'Commercial · Email', value: 'noc@deccanroaming.example' }],
    contacts: [],
  },
  {
    id: 'cus-acx-cold',
    customerId: 'acceleronix',
    name: 'Meridian Cold Chain',
    legalName: 'Meridian Cold Chain Pvt Ltd',
    status: 'Validated',
    identity: [
      { label: 'Legal name', value: 'Meridian Cold Chain Pvt Ltd' },
      { label: 'Trading name', value: 'Meridian Cold Chain' },
      { label: 'Region', value: 'IN' },
      { label: 'Account id', value: 'cus-acx-cold' },
    ],
    contactMethods: [],
    contacts: [],
  },
  {
    id: 'cus-accl-agri',
    customerId: 'acceleronix',
    name: 'Prairie AgriTech Cooperative',
    legalName: 'Prairie AgriTech Cooperative Ltd',
    status: 'Validated',
    slaBreached: 1,
    identity: [
      { label: 'Legal name', value: 'Prairie AgriTech Cooperative Ltd' },
      { label: 'Trading name', value: 'Prairie AgriTech' },
      { label: 'Region', value: 'IN' },
      { label: 'Account id', value: 'cus-accl-agri' },
    ],
    contactMethods: [],
    contacts: [],
  },
  {
    id: 'cus-vzn-util',
    customerId: 'verizon',
    name: 'Cascade Utilities',
    legalName: 'Cascade Utilities LLC',
    status: 'Validated',
    slaBreached: 1,
    identity: [
      { label: 'Legal name', value: 'Cascade Utilities LLC' },
      { label: 'Trading name', value: 'Cascade Utilities' },
      { label: 'Region', value: 'US' },
      { label: 'Account id', value: 'cus-vzn-util' },
    ],
    contactMethods: [],
    contacts: [],
  },
]

export const groups: Group[] = [
  { id: 'grp-001', accountId: 'cus-bsnl-marine', name: 'Coastal Buoy Fleet — Bay of Bengal', oobRate: 'USD 0.18/Kb · USD 0.02/message', created: '2026-06-18', status: 'Active' },
  { id: 'grp-002', accountId: 'cus-bsnl-marine', name: 'Pipeline Telemetry — West Field', oobRate: 'USD 0.18/Kb · USD 0.02/message', created: '2026-07-02', status: 'Active' },
]

export const ratePlans: RatePlan[] = [
  { id: 'plan-001', groupId: 'grp-001', dataPlan: '5 Kb / device / month', smsPlan: '1 message / day', label: '5 Kb / device / month · 1 message / day', monthly: 3.0 },
  { id: 'plan-002', groupId: 'grp-001', dataPlan: '10 Kb / device / month', smsPlan: '2 messages / day', label: '10 Kb / device / month · 2 messages / day', monthly: 3.45 },
]

export const sites: Site[] = [
  { id: 'SITE-D2D-001', accountId: 'cus-bsnl-marine', name: 'Mumbai Gateway Logistics Hub', type: 'Logistics hub', country: 'IN', address: 'Nhava Sheva, Navi Mumbai, Maharashtra 400707', coords: '18.949°N, 72.951°E', status: 'Active', mapX: 300, mapY: 190 },
  { id: 'SITE-D2D-002', accountId: 'cus-bsnl-marine', name: 'Jaipur Agricultural Depot', type: 'Agricultural', country: 'IN', address: 'Sitapura Industrial Area, Jaipur, Rajasthan 302022', coords: '26.912°N, 75.787°E', status: 'Active', mapX: 320, mapY: 110 },
  { id: 'SITE-D2D-005', accountId: 'cus-bsnl-marine', name: 'Visakhapatnam Coastal Buoy Station', type: 'Marine buoy network', country: 'IN', address: 'Fishing Harbour Road, Visakhapatnam, Andhra Pradesh 530001', coords: '17.686°N, 83.218°E', status: 'Active', mapX: 430, mapY: 215 },
  { id: 'SITE-D2D-003', accountId: 'cus-acx-cold', name: 'Meridian Cold Chain — Pune Facility', type: 'Cold chain / Warehousing', country: 'IN', address: 'Chakan MIDC, Pune, Maharashtra 410501', coords: '18.760°N, 73.860°E', status: 'Active', mapX: 310, mapY: 205 },
  { id: 'SITE-D2D-004', accountId: 'cus-vzn-util', name: 'Bangalore Smart Utilities Node', type: 'Utility', country: 'IN', address: 'Electronic City Phase 1, Bengaluru, Karnataka 560100', coords: '12.845°N, 77.660°E', status: 'Pending', mapX: 360, mapY: 270 },
]

export const seedDevices: Device[] = [
  {
    id: 'dev-001', label: 'Buoy sensor 001', accountId: 'cus-bsnl-marine', groupId: 'grp-001', planId: 'plan-001', siteId: 'SITE-D2D-005',
    model: 'BG95-M3', imsi: '901700000000001', imei: '356938035643801', msisdn: '+911198765001', iccid: '8991701000000000019', productInstance: 'PI-88213001',
    status: 'Active', dataPlan: '5 Kb / device / month', smsPlan: '1 message / day', features: ['Messaging', 'NIDD'], monthly: 3.0, oneTime: 2.0, usagePct: 112,
    usage: [
      { label: 'NIDD messages', used: 1120, allowance: 1000, unit: 'msgs', tone: 'red' },
      { label: 'SMS', used: 28, allowance: 100, unit: 'msgs', tone: 'blue' },
    ],
    alarm: { title: 'Connectivity alarm — Buoy sensor 001', tone: 'warning', caption: '2026-07-21 · Intermittent signal degradation reported by the network (TMF639 resource alarm, minor).' },
    connection: 'Online', availability: 'Degraded', bearerAvailability: '99.1%', latency: '440 ms', orderId: 'ord-5003',
  },
  {
    id: 'dev-002', label: 'Buoy sensor 002', accountId: 'cus-bsnl-marine', groupId: 'grp-001', planId: 'plan-002', siteId: 'SITE-D2D-005',
    model: 'ALT1250', imsi: '901700000000002', imei: '356938035643802', msisdn: '+911198765002', iccid: '8991701000000000027', productInstance: 'PI-88213002',
    status: 'Active', dataPlan: '10 Kb / device / month', smsPlan: '2 messages / day', features: ['Messaging', 'IP data', 'NIDD'], monthly: 3.45, oneTime: 2.0, usagePct: 76,
    usage: [
      { label: 'NIDD messages', used: 760, allowance: 1000, unit: 'msgs', tone: 'blue' },
      { label: 'SMS', used: 41, allowance: 200, unit: 'msgs', tone: 'blue' },
    ],
    alarm: { title: 'Loss of connectivity — Buoy sensor 002', tone: 'negative', caption: '2026-07-22 · No heartbeat received in the last reporting window (resource alarm, critical).' },
    connection: 'Online', availability: 'Available', bearerAvailability: '99.6%', latency: '410 ms', orderId: 'ord-5004',
  },
]

export const customerById = (id: string) => customers.find((c) => c.id === id)
export const accountById = (id: string) => accounts.find((a) => a.id === id)
export const accountsOf = (customerId: string) => accounts.filter((a) => a.customerId === customerId)
export const groupById = (id: string) => groups.find((g) => g.id === id)
export const planById = (id: string) => ratePlans.find((p) => p.id === id)
export const siteById = (id: string) => sites.find((s) => s.id === id)
