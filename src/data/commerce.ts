import type { Agreement, Invoice, Order, Quote } from './types'

export const agreements: Agreement[] = [
  {
    id: 'AGR-D2D-VZN-MSA', name: 'Verizon NB-NTN Master Service Agreement', type: 'Master Service Agreement', status: 'Pending', covers: null,
    expires: '31 Jul 2029', start: '01 Aug 2026', customerId: 'verizon',
    parties: [
      { label: 'Buyer', value: 'Verizon Communications Inc.' }, { label: 'Customer', value: 'Viasat Inc.' },
      { label: 'Agreement ID', value: 'AGR-D2D-VZN-MSA' }, { label: 'Start date', value: '01 Aug 2026' }, { label: 'End date', value: '31 Jul 2029' },
    ],
    keyTerms: [
      { label: 'Agreement type', value: 'Master Service Agreement (MSA)' }, { label: 'Minimum commit', value: '—' },
      { label: 'Service window', value: '24 × 7 IoT connectivity' }, { label: 'Platform SLA', value: '99.5% uptime' }, { label: 'Governing law', value: 'State of New York, USA' },
    ],
    documents: ['Draft MSA', 'Master Terms & Conditions'],
  },
  {
    id: 'AGR-D2D-ACCL-2025', name: 'Acceleronix NB-NTN IoT VAR Agreement 2025', type: 'Value-Added Reseller', status: 'Expiring soon', covers: 'NB-NTN IoT Connectivity',
    expires: '01 Oct 2026', start: '01 Oct 2025', customerId: 'acceleronix',
    parties: [
      { label: 'Buyer', value: 'Acceleronix Technologies Ltd' }, { label: 'Customer', value: 'Viasat Inc.' },
      { label: 'Agreement ID', value: 'AGR-D2D-ACCL-2025' }, { label: 'Start date', value: '01 Oct 2025' }, { label: 'End date', value: '01 Oct 2026' },
    ],
    keyTerms: [
      { label: 'Agreement type', value: 'Value-Added Reseller (VAR)' }, { label: 'Minimum commit', value: '250 devices / month' },
      { label: 'Service window', value: '24 × 7 IoT connectivity' }, { label: 'Platform SLA', value: '99.5% uptime' }, { label: 'Governing law', value: 'State of California, USA' },
    ],
    documents: ['Signed VAR Agreement', 'Master Terms & Conditions', 'NB-NTN Pricing Schedule', 'Service Description'],
  },
  {
    id: 'AGR-D2D-BSNL-2024', name: 'BSNL NB-NTN IoT VAR Agreement 2024', type: 'Value-Added Reseller', status: 'Active', covers: 'NB-NTN IoT Connectivity',
    expires: '14 Jan 2026', start: '15 Jan 2024', customerId: 'bsnl',
    parties: [
      { label: 'Buyer', value: 'BSNL / Bharti Airtel' }, { label: 'Customer', value: 'Viasat Inc.' },
      { label: 'Agreement ID', value: 'AGR-D2D-BSNL-2024' }, { label: 'Start date', value: '15 Jan 2024' }, { label: 'End date', value: '14 Jan 2026' },
    ],
    keyTerms: [
      { label: 'Agreement type', value: 'Value-Added Reseller (VAR)' }, { label: 'Minimum commit', value: '500 devices / month' },
      { label: 'Service window', value: '24 × 7 IoT connectivity' }, { label: 'Platform SLA', value: '99.5% uptime' }, { label: 'Governing law', value: 'State of California, USA' },
    ],
    documents: ['Signed VAR Agreement', 'Master Terms & Conditions', 'NB-NTN Pricing Schedule', 'Service Description'],
  },
]

export const agreementById = (id: string) => agreements.find((a) => a.id === id)

export const seedOrders: Order[] = [
  {
    id: 'ord-5007', title: 'Add fleet — Coastal Buoy Fleet Bay of Bengal (draft, 6 devices)', orderType: 'Add & activate device', items: 1,
    accountId: 'cus-bsnl-marine', date: '26 Aug 2026', status: 'Draft', expiresIn: 'Expires in 12 days', groupRef: 'grp-001',
    activity: [{ date: '26 Aug 2026', text: 'Draft saved. 6 IMSIs reserved; awaiting site-list confirmation before submit.' }],
  },
  {
    id: 'ord-5009', title: 'Create IoT group — Meridian Cold Chain Arctic Route', orderType: 'Create group', items: 1,
    accountId: 'cus-acx-cold', date: '27 Jul 2026', status: 'Acknowledged', progress: '1 of 4 steps', groupRef: 'grp-004',
    serviceOrder: { id: 'SVO-D2D-002', status: 'Acknowledged', steps: [
      { label: 'Order acknowledged', date: '27 Jul 2026', state: 'done' }, { label: 'Service order created', state: 'current' },
      { label: 'Group provisioning', state: 'pending' }, { label: 'Service verified', state: 'pending' },
    ] },
    orderItems: [{ action: 'add', name: 'NB-NTN IoT Group', ref: 'grp-004', status: 'Acknowledged' }],
    activity: [{ date: '27 Jul 2026', text: 'Order acknowledged (201 Created). Awaiting fulfilment scheduling.' }],
  },
  {
    id: 'ord-5008', title: 'Add fleet — Cascade Utilities Grid Monitor (12 devices)', orderType: 'Add & activate device', items: 3,
    accountId: 'cus-vzn-util', date: '25 Jul 2026', status: 'In progress', progress: '3 of 5 steps', groupRef: 'grp-003',
    serviceOrder: { id: 'SVO-D2D-001', status: 'In progress', steps: [
      { label: 'Order acknowledged', date: '25 Jul 2026', state: 'done' }, { label: 'Service order created', date: '25 Jul 2026', state: 'done' },
      { label: 'SIM provisioning', date: '25 Jul 2026', state: 'done' }, { label: 'SM-DP+ activation', date: 'In progress', state: 'current' },
      { label: 'Service verified', state: 'pending' },
    ] },
    orderItems: [
      { action: 'add', name: 'NB-NTN IoT Service', ref: 'PI-77401001', status: 'Completed' },
      { action: 'add', name: 'NB-NTN IoT Service', ref: 'PI-77401002', status: 'Completed' },
      { action: 'add', name: 'NB-NTN IoT Service', ref: 'PI-77401003', status: 'In progress' },
    ],
    checklist: { title: 'Pre-attendance checklist — installation 2026-08-20', items: [
      { text: 'Confirm power and network access at install point', done: true },
      { text: 'Clear a 2m mounting zone for the terminal', done: true },
      { text: 'Site contact available on installation day', done: false },
    ] },
    activity: [
      { date: '25 Jul 2026', text: 'Order acknowledged (201 Created). 12 order items submitted.' },
      { date: '25 Jul 2026', text: 'eSIM pool: 12 IMSIs reserved; MSISDN assignment in progress.' },
      { date: '26 Jul 2026', text: 'SM-DP+ provisioning underway — 8 of 12 devices active. 4 pending SM-DP+ download confirmation.' },
    ],
  },
  {
    id: 'ord-5010', title: 'Add device — Deccan Roaming Services (IMSI path)', orderType: 'Add & activate device', items: 1,
    accountId: 'cus-bsnl-roam', date: '22 Jul 2026', status: 'Failed', completed: '22 Jul 2026',
    failureReason: 'Order failed — MSISDN range exhausted for this customer. Contact Viasat to expand allocation before resubmitting.',
    serviceOrder: { id: 'SVO-D2D-003', status: 'Failed', steps: [
      { label: 'Order acknowledged', date: '22 Jul 2026', state: 'done' }, { label: 'Service order created', date: '22 Jul 2026', state: 'done' },
      { label: 'SIM provisioning', date: '22 Jul 2026', state: 'failed' }, { label: 'SM-DP+ activation', state: 'pending' }, { label: 'Service verified', state: 'pending' },
    ] },
    orderItems: [{ action: 'add', name: 'NB-NTN IoT Service', ref: 'PI-pending', status: 'Failed' }],
    activity: [
      { date: '22 Jul 2026', text: 'Order acknowledged (201 Created).' },
      { date: '22 Jul 2026', text: 'Order failed — MSISDN range exhausted for this customer. Contact Viasat to expand allocation before resubmitting.' },
    ],
  },
  {
    id: 'ord-5002', title: 'Create IoT group — Pipeline Telemetry', orderType: 'Create group', items: 1, accountId: 'cus-bsnl-marine', date: '2 Jul 2026', status: 'Completed', completed: '2 Jul 2026', groupRef: 'grp-002',
    serviceOrder: { id: 'SVO-D2D-012', status: 'Completed', steps: [
      { label: 'Order acknowledged', date: '2 Jul 2026', state: 'done' }, { label: 'Service order created', date: '2 Jul 2026', state: 'done' },
      { label: 'IoT group provisioned', date: '2 Jul 2026', state: 'done' }, { label: 'Service verified', date: '2 Jul 2026', state: 'done' },
    ] },
    orderItems: [{ action: 'add', name: 'NB-NTN IoT Group', ref: 'grp-002', status: 'Completed' }],
    activity: [{ date: '2 Jul 2026', text: 'Group created with Out of Band usage rating.' }],
  },
  {
    id: 'ord-5004', title: 'Add & activate device — Buoy sensor 002', orderType: 'Add & activate device', items: 1, accountId: 'cus-bsnl-marine', date: '20 Jun 2026', status: 'Completed', completed: '20 Jun 2026', groupRef: 'grp-001',
    serviceOrder: { id: 'SVO-D2D-011', status: 'Completed', steps: [
      { label: 'Order acknowledged', date: '20 Jun 2026', state: 'done' }, { label: 'Service order created', date: '20 Jun 2026', state: 'done' },
      { label: 'SIM provisioning', date: '20 Jun 2026', state: 'done' }, { label: 'SM-DP+ activation', date: '20 Jun 2026', state: 'done' }, { label: 'Service verified', date: '20 Jun 2026', state: 'done' },
    ] },
    orderItems: [{ action: 'add', name: 'NB-NTN IoT Service', ref: 'PI-88213002', status: 'Completed' }],
    activity: [
      { date: '20 Jun 2026', text: 'Order acknowledged (201 Created).' },
      { date: '20 Jun 2026', text: 'eSIM reserved; MSISDN assigned.' },
      { date: '20 Jun 2026', text: 'Service order completed; product instance PI-88213002 active.' },
    ],
  },
  {
    id: 'ord-5003', title: 'Add & activate device — Buoy sensor 001', orderType: 'Add & activate device', items: 1, accountId: 'cus-bsnl-marine', date: '19 Jun 2026', status: 'Completed', completed: '19 Jun 2026', groupRef: 'grp-001',
    serviceOrder: { id: 'SVO-D2D-010', status: 'Completed', steps: [
      { label: 'Order acknowledged', date: '19 Jun 2026', state: 'done' }, { label: 'Service order created', date: '19 Jun 2026', state: 'done' },
      { label: 'SIM provisioning', date: '19 Jun 2026', state: 'done' }, { label: 'SM-DP+ activation', date: '19 Jun 2026', state: 'done' }, { label: 'Service verified', date: '19 Jun 2026', state: 'done' },
    ] },
    orderItems: [{ action: 'add', name: 'NB-NTN IoT Service', ref: 'PI-88213001', status: 'Completed' }],
    activity: [
      { date: '19 Jun 2026', text: 'Order acknowledged (201 Created).' },
      { date: '19 Jun 2026', text: 'eSIM reserved; MSISDN assigned.' },
      { date: '19 Jun 2026', text: 'Service order completed; product instance PI-88213001 active.' },
    ],
  },
  {
    id: 'ord-5001', title: 'Create IoT group — Coastal Buoy Fleet', orderType: 'Create group', items: 1, accountId: 'cus-bsnl-marine', date: '18 Jun 2026', status: 'Completed', completed: '18 Jun 2026', groupRef: 'grp-001',
    serviceOrder: { id: 'SVO-D2D-010', status: 'Completed', steps: [
      { label: 'Order acknowledged', date: '18 Jun 2026', state: 'done' }, { label: 'Service order created', date: '18 Jun 2026', state: 'done' },
      { label: 'IoT group provisioned', date: '18 Jun 2026', state: 'done' }, { label: 'Service verified', date: '18 Jun 2026', state: 'done' },
    ] },
    orderItems: [{ action: 'add', name: 'NB-NTN IoT Group', ref: 'grp-001', status: 'Completed' }],
    activity: [{ date: '18 Jun 2026', text: 'Group created with Out of Band usage rating.' }],
  },
]

export const seedQuotes: Quote[] = [
  {
    id: 'QUO-D2D-003', title: 'Cascade Utilities — Smart Metering Pilot', accountId: 'cus-vzn-util', created: '10 Jul 2025', validUntil: '10 Aug 2025', valueMo: '$110.00/mo', status: 'Pending approval',
    governedBy: 'No active agreement — orderable tenant-wide', items: 2,
    lineItems: [
      { desc: 'NB-NTN IoT service — 50 devices (pilot)', code: 'SE3', qty: 50, unit: 2.2, total: 110 },
      { desc: 'IMSI activation fees — 50 IMSIs', code: 'ACCES1', qty: 50, unit: 2.0, total: 100 },
    ],
    monthly: 110, oneTime: 100, siteIds: ['SITE-D2D-004'],
  },
  {
    id: 'QUO-D2D-002', title: 'Meridian Cold Chain — Pune Expansion', accountId: 'cus-acx-cold', created: '1 Jun 2025', validUntil: '1 Jul 2025', valueMo: '$352.00/mo', status: 'Approved',
    governedBy: 'Acceleronix NB-NTN IoT VAR Agreement 2025', governedByNote: 'VAR agreement · expiring soon', items: 2,
    lineItems: [
      { desc: 'NB-NTN IoT service — 160 devices', code: 'SE3', qty: 160, unit: 2.2, total: 352 },
      { desc: 'IMSI activation fees — 160 IMSIs', code: 'ACCES1', qty: 160, unit: 2.0, total: 320 },
    ],
    monthly: 352, oneTime: 320, siteIds: ['SITE-D2D-003'],
  },
  {
    id: 'QUO-D2D-004', title: 'Deccan Roaming Services — NB-NTN Backhaul', accountId: 'cus-bsnl-roam', created: '10 Jan 2025', validUntil: '10 Feb 2025', valueMo: '$220.00/mo', status: 'Expired',
    governedBy: 'BSNL NB-NTN IoT VAR Agreement 2024', governedByNote: 'VAR agreement · active', items: 1,
    lineItems: [{ desc: 'NB-NTN IoT service — 100 devices', code: 'SE3', qty: 100, unit: 2.2, total: 220 }],
    monthly: 220, oneTime: 0, siteIds: [],
  },
  {
    id: 'QUO-D2D-001', title: 'BSNL Fleet & Logistics IoT — Phase 1', accountId: 'cus-bsnl-marine', created: '15 Oct 2024', validUntil: '15 Nov 2024', valueMo: '$657.80/mo', status: 'Accepted',
    governedBy: 'BSNL NB-NTN IoT VAR Agreement 2024', governedByNote: 'VAR agreement · active', convertedOrderId: 'ord-5001', items: 2,
    lineItems: [
      { desc: 'NB-NTN IoT service — 299 devices', code: 'SE3', qty: 299, unit: 2.2, total: 657.8 },
      { desc: 'IMSI activation fees — 299 IMSIs', code: 'ACCES1', qty: 299, unit: 2.0, total: 598 },
    ],
    monthly: 657.8, oneTime: 598, siteIds: ['SITE-D2D-001', 'SITE-D2D-002'],
    tracking: { id: 'SVO-D2D-010', status: 'Completed', steps: [
      { label: 'Order acknowledged', date: '18 Jun 2026', state: 'done' }, { label: 'Service order created', date: '18 Jun 2026', state: 'done' },
      { label: 'IoT group provisioned', date: '18 Jun 2026', state: 'done' }, { label: 'Service verified', date: '18 Jun 2026', state: 'done' },
    ] },
  },
]

export const invoices: Invoice[] = [
  { id: 'BILL-D2D-2025-07', accountLabel: 'BSNL — master account', billingAccount: 'BA-D2D-001', period: 'Jul 2025', periodRange: '01 Jul 2025 – 31 Jul 2025', status: 'Processing', total: null, due: '15 Aug 2025',
    lines: [{ desc: 'NB-NTN IoT service — in progress', code: 'SE3', qty: 0, unit: 2.2, total: 0 }] },
  { id: 'BILL-D2D-2025-06', accountLabel: 'BSNL — master account', billingAccount: 'BA-D2D-001', period: 'Jun 2025', periodRange: '01 Jun 2025 – 30 Jun 2025', status: 'Overdue', total: 1707.6, due: '15 Jul 2025',
    lines: [
      { desc: 'NB-NTN IoT service — 518 active devices', code: 'SE3', qty: 518, unit: 2.2, total: 1139.6 },
      { desc: 'IMSI activation fees — 22 new devices', code: 'ACCES1', qty: 22, unit: 2.0, total: 44 },
      { desc: 'Platform access fee', code: 'PLT1', qty: 1, unit: 500, total: 500 },
    ] },
  { id: 'BILL-D2D-2025-05', accountLabel: 'BSNL — master account', billingAccount: 'BA-D2D-001', period: 'May 2025', periodRange: '01 May 2025 – 31 May 2025', status: 'Paid', total: 1650.4, due: '15 Jun 2025',
    lines: [
      { desc: 'NB-NTN IoT service — 505 active devices', code: 'SE3', qty: 505, unit: 2.2, total: 1111 },
      { desc: 'IMSI activation fees — 20 new devices', code: 'ACCES1', qty: 20, unit: 2.0, total: 40 },
      { desc: 'Platform access fee', code: 'PLT1', qty: 1, unit: 500, total: 500 },
    ] },
  { id: 'BILL-D2D-2025-04', accountLabel: 'BSNL — master account', billingAccount: 'BA-D2D-001', period: 'Apr 2025', periodRange: '01 Apr 2025 – 30 Apr 2025', status: 'Paid', total: 1603.0, due: '15 May 2025',
    lines: [
      { desc: 'NB-NTN IoT service — 490 active devices', code: 'SE3', qty: 490, unit: 2.2, total: 1078 },
      { desc: 'IMSI activation fees — 12 new devices', code: 'ACCES1', qty: 12, unit: 2.0, total: 24 },
      { desc: 'Platform access fee', code: 'PLT1', qty: 1, unit: 500, total: 500 },
    ] },
]
