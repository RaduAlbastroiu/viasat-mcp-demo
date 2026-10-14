import type { Case, Notification } from './types'

export const seedCases: Case[] = [
  {
    id: 'REQ-D2D-2207', type: 'Request', title: 'Company information change — Sagar Marine Logistics', severity: 'Low', status: 'Open', accountId: 'cus-bsnl-marine', raised: '9 Sept 2026', sla: '16 Sept 2026',
    summary: 'Request to update the trading name and website on the Sagar Marine Logistics account record. Account team to verify against the MCA filing before applying.',
    progress: [{ author: 'You', date: '9 Sept 2026', status: 'Open', text: 'Submitted a company information change request from the Company profile page.' }],
    details: [
      { label: 'Case ID', value: 'REQ-D2D-2207' }, { label: 'Type', value: 'Request' }, { label: 'Category', value: 'Account ▸ Company information' },
      { label: 'Account', value: 'Sagar Marine Logistics' }, { label: 'Assignee', value: 'Account Owner' }, { label: 'Opened', value: '9 Sept 2026' }, { label: 'Updated', value: '9 Sept 2026' }, { label: 'SLA deadline', value: '16 Sept 2026' },
    ],
  },
  {
    id: 'REQ-2026-0853', type: 'Request', title: 'Plan information request — NB-NTN Maritime Safety', severity: 'Low', status: 'Open', accountId: 'cus-bsnl-roam', raised: '11 Aug 2026', sla: '14 Aug 2026',
    summary: 'Information / callback requested about the NB-NTN Maritime Safety plan — a cross-sell product not currently in the agreement. Sales team to follow up with pricing, terms and next steps. Raised via the catalogue "Enquire" flow.',
    planEnquired: [
      { label: 'Plan', value: 'NB-NTN Maritime Safety' }, { label: 'Status', value: 'Cross-sell — not yet in your agreement' },
      { label: 'Summary', value: 'Distress messaging and vessel telemetry beyond terrestrial coverage.' }, { label: 'Billing currency', value: 'USD' },
    ],
    requestedBy: [
      { label: 'Requested by', value: 'Parv Kaur' }, { label: 'Email', value: 'parv.kaur@bsnl.example' },
      { label: 'Job title', value: 'Self-Service Account Administrator' }, { label: 'What they asked', value: 'Pricing, terms and how to add this to our agreement.' },
    ],
    progress: [{ author: 'You', date: '11 Aug 2026', status: 'Open', text: 'Sent an enquiry about the NB-NTN Maritime Safety plan via the catalogue "Enquire" flow.' }],
    details: [
      { label: 'Case ID', value: 'REQ-2026-0853' }, { label: 'Type', value: 'Request' }, { label: 'Category', value: 'Products & Features ▸ Product Enquire' },
      { label: 'Account', value: 'Deccan Roaming Services' }, { label: 'Assignee', value: 'Account Owner' }, { label: 'Opened', value: '11 Aug 2026' }, { label: 'Updated', value: '11 Aug 2026' }, { label: 'SLA deadline', value: '14 Aug 2026' },
    ],
  },
  {
    id: 'REQ-2026-0842', type: 'API access', title: 'API access request — NB-NTN Order-to-Inventory (BSNL)', severity: 'Medium', status: 'Open', accountId: 'cus-bsnl-roam', raised: '7 Aug 2026', sla: '11 Aug 2026',
    summary: 'Client credentials requested for the NB-NTN Order-to-Inventory E2E API (production scope: productOrder, product, customer).',
    progress: [{ author: 'You', date: '7 Aug 2026', status: 'Open', text: 'Raised an access request from the TMF622 spec detail panel.' }],
    details: [
      { label: 'Case ID', value: 'REQ-2026-0842' }, { label: 'Type', value: 'API access' }, { label: 'Account', value: 'Deccan Roaming Services' },
      { label: 'Assignee', value: 'API Platform team' }, { label: 'Opened', value: '7 Aug 2026' }, { label: 'Updated', value: '7 Aug 2026' }, { label: 'SLA deadline', value: '11 Aug 2026' },
    ],
  },
  {
    id: 'INC-D2D-4471', type: 'Incident', title: 'Mumbai PoP hardware fault — 4 nodes offline', severity: 'Critical', status: 'In progress', accountId: 'cus-bsnl-roam', raised: '22 Jul 2026', sla: '28 Jul 2026',
    summary: 'Hardware failure at Mumbai PoP affecting 4 backhaul nodes. Field engineer dispatched. Expected resolution: replacement power supply unit, ETA 28 Jul.',
    progress: [
      { author: 'Automated monitoring', date: '22 Jul 2026', status: 'Open', text: 'Incident raised automatically — 4 backhaul nodes at Mumbai PoP stopped responding.' },
      { author: 'Viasat NOC — Field Ops', date: '23 Jul 2026', status: 'In progress', text: 'Root cause confirmed as a failed power supply unit. Field engineer dispatched; replacement part ordered.' },
      { author: 'Viasat NOC — Field Ops', date: '24 Jul 2026', text: 'Engineer on site. Replacement PSU ETA 28 Jul — will confirm restoration once nodes are back online.' },
    ],
    details: [
      { label: 'Case ID', value: 'INC-D2D-4471' }, { label: 'Type', value: 'Incident' }, { label: 'Account', value: 'Deccan Roaming Services' },
      { label: 'Assignee', value: 'Viasat NOC — Field Ops' }, { label: 'Opened', value: '22 Jul 2026' }, { label: 'Updated', value: '24 Jul 2026' }, { label: 'SLA deadline', value: '28 Jul 2026' },
    ],
    relatedMonitoring: 'Mumbai PoP — Performance monitoring',
  },
  {
    id: 'REQ-D2D-3904', type: 'Request', title: 'IMSI activation delay — Acceleronix batch (50 units)', severity: 'High', status: 'In progress', accountId: 'cus-accl-agri', raised: '18 Jul 2026', sla: '29 Jul 2026',
    summary: 'A batch of 50 IMSIs ordered for Prairie AgriTech is stuck in SM-DP+ activation. Provisioning team is re-running the download confirmation.',
    progress: [
      { author: 'You', date: '18 Jul 2026', status: 'Open', text: 'Reported that 50 IMSIs have not activated 48h after order acknowledgement.' },
      { author: 'Viasat Provisioning', date: '20 Jul 2026', status: 'In progress', text: 'Confirmed SM-DP+ backlog; re-queued the batch for activation.' },
    ],
    details: [
      { label: 'Case ID', value: 'REQ-D2D-3904' }, { label: 'Type', value: 'Request' }, { label: 'Account', value: 'Prairie AgriTech Cooperative' },
      { label: 'Assignee', value: 'Viasat Provisioning' }, { label: 'Opened', value: '18 Jul 2026' }, { label: 'Updated', value: '20 Jul 2026' }, { label: 'SLA deadline', value: '29 Jul 2026' },
    ],
  },
  {
    id: 'REQ-D2D-3812', type: 'Request', title: 'Invoice query — BSNL Jun 2026 usage variance', severity: 'Medium', status: 'Pending customer', accountId: 'cus-bsnl-marine', raised: '10 Jul 2026', sla: '5 Aug 2026',
    summary: 'Query on the Jun 2026 invoice: usage-rated charges are higher than the device allowance implies. Billing team has responded with a usage breakdown and needs your confirmation to proceed.',
    progress: [
      { author: 'You', date: '10 Jul 2026', status: 'Open', text: 'Raised a query on BILL-D2D-2025-06 usage charges.' },
      { author: 'Viasat Billing', date: '12 Aug 2026', status: 'Pending customer', text: 'Usage breakdown attached — Buoy sensor 001 exceeded its NIDD allowance by 120 messages. Please confirm whether to apply the out-of-allowance rate or move the device to a larger plan.' },
    ],
    details: [
      { label: 'Case ID', value: 'REQ-D2D-3812' }, { label: 'Type', value: 'Request' }, { label: 'Account', value: 'Sagar Marine Logistics' },
      { label: 'Assignee', value: 'Viasat Billing' }, { label: 'Opened', value: '10 Jul 2026' }, { label: 'Updated', value: '12 Aug 2026' }, { label: 'SLA deadline', value: '5 Aug 2026' },
    ],
  },
  {
    id: 'REQ-D2D-3701', type: 'Request', title: 'API key rotation — Verizon integration account', severity: 'Low', status: 'Resolved', accountId: 'cus-vzn-util', raised: '1 Jul 2026', sla: '15 Jul 2026',
    summary: 'Production client secret rotated for the Verizon integration account; old secret revoked after the 24h overlap window.',
    progress: [
      { author: 'You', date: '1 Jul 2026', status: 'Open', text: 'Requested a rotation of the production API key.' },
      { author: 'API Platform team', date: '2 Jul 2026', status: 'Resolved', text: 'New secret issued and old secret revoked. Case closed.' },
    ],
    details: [
      { label: 'Case ID', value: 'REQ-D2D-3701' }, { label: 'Type', value: 'Request' }, { label: 'Account', value: 'Cascade Utilities' },
      { label: 'Assignee', value: 'API Platform team' }, { label: 'Opened', value: '1 Jul 2026' }, { label: 'Updated', value: '2 Jul 2026' }, { label: 'SLA deadline', value: '15 Jul 2026' },
    ],
  },
  {
    id: 'INC-D2D-4102', type: 'Incident', title: 'NB-NTN throughput degradation — Cascade Utilities fleet', severity: 'High', status: 'Open', accountId: 'cus-vzn-util', raised: '12 Jun 2026', sla: '10 Jul 2026',
    summary: 'Sustained throughput degradation across the Cascade Utilities grid-monitor fleet. Under investigation by the NOC; suspected beam congestion in the north-west sector.',
    progress: [{ author: 'Automated monitoring', date: '12 Jun 2026', status: 'Open', text: 'Throughput below threshold for 3 consecutive reporting windows.' }],
    details: [
      { label: 'Case ID', value: 'INC-D2D-4102' }, { label: 'Type', value: 'Incident' }, { label: 'Account', value: 'Cascade Utilities' },
      { label: 'Assignee', value: 'Viasat NOC' }, { label: 'Opened', value: '12 Jun 2026' }, { label: 'Updated', value: '12 Jun 2026' }, { label: 'SLA deadline', value: '10 Jul 2026' },
    ],
    relatedMonitoring: 'Cascade Utilities fleet — Performance monitoring',
  },
]

const n = (id: string, type: Notification['type'], title: string, detail: string, status: Notification['status'], date: string, dateLong: string, link?: Notification['link'], unread = false): Notification =>
  ({ id, type, title, detail, status, date, dateLong, link, unread })

export const seedNotifications: Notification[] = [
  n('n01', 'Order notes', 'Add fleet — Coastal Buoy Fleet Bay of Bengal (draft, 6 devices)', 'Draft saved. 6 IMSIs reserved; awaiting site-list confirmation before submit.', 'Update', '26 Aug', '26 Aug 2026', { kind: 'order', id: 'ord-5007' }, true),
  n('n02', 'Offer', 'New plan — NB-NTN Global Roaming Plus', 'Extend coverage to 30+ new maritime corridors with pooled data across your fleet, and no per-device activation fee for the first 90 days. Open the plan to see the detail.', 'Update', '14 Aug', '14 Aug 2026', { kind: 'product', id: 'nbntn-maritime-safety' }),
  n('n03', 'Contract', 'Contract renewal ready for review', 'Your BSNL NB-NTN IoT VAR agreement renewal has been prepared. Review the updated terms and approve before the current term lapses.', 'Attention', '13 Aug', '13 Aug 2026', { kind: 'agreement', id: 'AGR-D2D-BSNL-2024' }, true),
  n('n04', 'Support', 'Support request updated — awaiting your reply', 'Request REQ-D2D-3812 (invoice query — BSNL Jun 2026 usage variance) has moved to "Awaiting customer". Our team has responded and needs your confirmation to proceed.', 'Update', '12 Aug', '12 Aug 2026', { kind: 'case', id: 'REQ-D2D-3812' }, true),
  n('n05', 'Order notes', 'Create IoT group — Meridian Cold Chain Arctic Route', 'Order acknowledged (201 Created). Awaiting fulfilment scheduling.', 'Update', '27 Jul', '27 Jul 2026', { kind: 'order', id: 'ord-5009' }),
  n('n06', 'At risk', 'Order at risk — Create IoT group — Meridian Cold Chain Arctic Route', 'Open for 48 days and not yet completed — at risk of missing its target date.', 'Critical', '27 Jul', '27 Jul 2026', { kind: 'order', id: 'ord-5009' }, true),
  n('n07', 'Order notes', 'Add fleet — Cascade Utilities Grid Monitor (12 devices)', 'SM-DP+ provisioning underway — 8 of 12 devices active. 4 pending SM-DP+ download confirmation.', 'Update', '26 Jul', '26 Jul 2026', { kind: 'order', id: 'ord-5008' }),
  n('n08', 'Order notes', 'Add fleet — Cascade Utilities Grid Monitor (12 devices)', 'Order acknowledged (201 Created). 12 order items submitted.', 'Update', '25 Jul', '25 Jul 2026', { kind: 'order', id: 'ord-5008' }),
  n('n09', 'Order notes', 'Add fleet — Cascade Utilities Grid Monitor (12 devices)', 'eSIM pool: 12 IMSIs reserved; MSISDN assignment in progress.', 'Update', '25 Jul', '25 Jul 2026', { kind: 'order', id: 'ord-5008' }),
  n('n10', 'At risk', 'Order at risk — Add fleet — Cascade Utilities Grid Monitor (12 devices)', 'Open for 50 days and not yet completed — at risk of missing its target date.', 'Critical', '25 Jul', '25 Jul 2026', { kind: 'order', id: 'ord-5008' }, true),
  n('n11', 'Order notes', 'Add device — Deccan Roaming Services (IMSI path)', 'Order acknowledged (201 Created).', 'Update', '22 Jul', '22 Jul 2026', { kind: 'order', id: 'ord-5010' }),
  n('n12', 'Order status', 'Add device — Deccan Roaming Services (IMSI path)', 'Order failed — MSISDN range exhausted for this customer. Contact Viasat to expand allocation before resubmitting.', 'Critical', '22 Jul', '22 Jul 2026', { kind: 'order', id: 'ord-5010' }),
  n('n13', 'At risk', 'Order failed — Add device — Deccan Roaming Services (IMSI path)', 'Order failed — MSISDN range exhausted for this customer. Action required — restart after remediation.', 'Critical', '22 Jul', '22 Jul 2026', { kind: 'order', id: 'ord-5010' }),
  n('n14', 'Alarm', 'Loss of connectivity — Buoy sensor 002', 'No heartbeat received in the last reporting window (resource alarm, critical).', 'Critical', '22 Jul', '22 Jul 2026', { kind: 'terminal', id: 'dev-002' }),
  n('n15', 'Alarm', 'Connectivity alarm — Buoy sensor 001', 'Intermittent signal degradation reported by the network (resource alarm, minor).', 'Attention', '21 Jul', '21 Jul 2026', { kind: 'terminal', id: 'dev-001' }),
  n('n16', 'Resource', 'API spec updated — TMF622 v5.1', 'Product Ordering API refreshed in release R26.10. New fields: serviceOrders[], itemState lifecycle. Open the release notes.', 'Update', '18 Jul', '18 Jul 2026', { kind: 'spec', id: 'tmf622-v5' }),
  n('n17', 'Resource', 'Firmware release — NB-NTN module v3.4.2', 'Critical patch for NB-NTN attach stability on Cascade-class devices. Download via Software & patches.', 'Update', '10 Jul', '10 Jul 2026'),
  n('n18', 'Order status', 'Create IoT group — Pipeline Telemetry', 'Group created with Out of Band usage rating.', 'Update', '2 Jul', '2 Jul 2026', { kind: 'order', id: 'ord-5002' }),
  n('n19', 'Order status', 'Add & activate device — Buoy sensor 002', 'Service order completed; product instance PI-88213002 active.', 'Update', '20 Jun', '20 Jun 2026', { kind: 'order', id: 'ord-5004' }),
  n('n20', 'Order notes', 'Add & activate device — Buoy sensor 002', 'eSIM reserved; MSISDN assigned.', 'Update', '20 Jun', '20 Jun 2026', { kind: 'order', id: 'ord-5004' }),
  n('n21', 'Order notes', 'Add & activate device — Buoy sensor 001', 'Order acknowledged (201 Created).', 'Update', '19 Jun', '19 Jun 2026', { kind: 'order', id: 'ord-5003' }),
  n('n22', 'Order notes', 'Add & activate device — Buoy sensor 001', 'eSIM reserved; MSISDN assigned.', 'Update', '19 Jun', '19 Jun 2026', { kind: 'order', id: 'ord-5003' }),
  n('n23', 'Order status', 'Add & activate device — Buoy sensor 001', 'Service order completed; product instance PI-88213001 active.', 'Update', '19 Jun', '19 Jun 2026', { kind: 'order', id: 'ord-5003' }),
  n('n24', 'Order notes', 'Create IoT group — Coastal Buoy Fleet', 'Order acknowledged (201 Created).', 'Update', '18 Jun', '18 Jun 2026', { kind: 'order', id: 'ord-5001' }),
  n('n25', 'Order status', 'Create IoT group — Coastal Buoy Fleet', 'Group created with Out of Band usage rating.', 'Update', '18 Jun', '18 Jun 2026', { kind: 'order', id: 'ord-5001' }),
]
