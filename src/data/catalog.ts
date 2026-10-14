import type { ApiSpec, LibraryDoc, Product } from './types'

export const products: Product[] = [
  {
    id: 'nbntn-iot-connectivity', name: 'NB-NTN IoT Connectivity', eyebrow: 'Plans', icon: 'router', art: 'satellite', price: 'From USD 2.20', offerings: 6, certifiedDevices: 3,
    description: 'Direct-to-device satellite IoT — the bundle you hold today.', covered: true, topBadge: 'Share Pool Plan',
    plans: 'NB-NTN IoT Service', agreements: 'AGR-D2D-BSNL-2024, AGR-D2D-ACCL-2025', activeOn: 2,
    market: 'Maritime & Environmental Sensing', sector: 'Transportation & Logistics', businessUnit: 'ANTS',
  },
  {
    id: 'nbntn-asset-tracking', name: 'NB-NTN Asset Tracking', eyebrow: 'Plans', icon: 'shipping', art: 'port', price: 'From USD 2.20', offerings: 4, certifiedDevices: 2,
    description: 'Low-power position + status reporting for containers, trailers and plant.', covered: false, topBadge: 'Cross-sell',
    market: 'Intermodal Logistics', sector: 'Transportation & Logistics', businessUnit: 'ANTS',
  },
  {
    id: 'nbntn-maritime-safety', name: 'NB-NTN Maritime Safety', eyebrow: 'Plans', icon: 'boat', art: 'ship', price: 'From USD 2.20', offerings: 6, certifiedDevices: 1,
    description: 'Distress messaging and vessel telemetry beyond terrestrial coverage.', covered: false, topBadge: 'Cross-sell',
    market: 'Maritime & Environmental Sensing', sector: 'Cruise Line', businessUnit: 'Maritime',
  },
  {
    id: 'nbntn-agriculture', name: 'NB-NTN Agriculture & Environment', eyebrow: 'Plans', icon: 'agriculture', art: 'field', price: 'From USD 2.20', offerings: 5, certifiedDevices: 1,
    description: 'Soil, water and livestock sensors in the remotest fields.', covered: false, topBadge: 'Cross-sell',
    market: 'Heavy Equipment & Agriculture', sector: 'Agriculture', businessUnit: 'ANTS',
  },
  {
    id: 'nexuswave', name: 'NexusWave', eyebrow: 'Plans', icon: 'boat', art: 'ocean', price: 'Plan based', offerings: 0, certifiedDevices: 0,
    description: 'A fully managed connectivity service powered by innovative bonded network technology and intelligent orchestration of a multi-orbit, multi-band network', covered: false, topBadge: 'Cross-sell',
    market: 'Maritime & Environmental Sensing', sector: 'Cruise Line', businessUnit: 'Maritime',
  },
]

export const productById = (id: string) => products.find((p) => p.id === id)

export const certifiedDevices = [
  { model: 'NB-NTN SIM PRD00001009', source: 'NB-NTN catalog export', manufacturer: 'Viasat', formFactor: 'eSIM / SIM profile', certification: 'Certified', note: 'Read from the NB-NTN catalog export (product_model) — the one real certified entry.' },
  { model: 'BG95-M3', source: 'OEM-supplied (representative)', manufacturer: 'Quectel', formFactor: 'NB-NTN module', certification: 'Certified', note: 'Representative OEM entry — the certified-device list would be supplied by the OEM.' },
  { model: 'ALT1250', source: 'OEM-supplied (representative)', manufacturer: 'Sony Semiconductor', formFactor: 'NB-NTN chipset', certification: 'Certification in progress', note: 'Representative OEM entry — certification in progress (illustrative).' },
]

export const dataPlans = [
  { label: 'No data usage', delta: 0 },
  { label: '5 Kb / device / month', delta: 0.6 },
  { label: '10 Kb / device / month', delta: 0.9 },
  { label: '25 Kb / device / month', delta: 1.2 },
  { label: '50 Kb / device / month', delta: 2.0 },
]
export const smsPlans = [
  { label: 'No messages', delta: 0 },
  { label: '1 message / day', delta: 0.2 },
  { label: '2 messages / day', delta: 0.35 },
  { label: '5 messages / day', delta: 0.7 },
]
export const BASE_SERVICE = 2.2
export const ACTIVATION_FEE = 2.0
export const INSTALL_FEE = 5.0
export const SUSPENSION_FEE = 1.5

export const libraryDocs: LibraryDoc[] = [
  { id: 'doc-onboarding', title: 'NB-NTN IoT onboarding — first 30 days', category: 'Knowledge', docType: 'Getting started', description: 'Set-up walkthrough for a new distribution-partner tenant: agreement, credentials, first device activation.', tags: ['NB-NTN IoT'], meta: 'HTML · updated 2026-07-18', art: 'iot', status: 'Live' },
  { id: 'doc-bulk', title: 'Bulk device activation — 500+ IMSIs', category: 'Knowledge', docType: 'How-to', description: 'CSV upload flow for provisioning IMSIs in bulk against a share plan.', tags: ['NB-NTN IoT'], meta: 'PDF · 412 KB · updated 2026-06-30', art: 'iot', status: 'Live' },
  { id: 'doc-msa', title: 'NB-NTN IoT Master Service Agreement — 2026 template', category: 'Contract', docType: 'Contract template', description: 'Standard MSA template used for new NB-NTN distribution partners. Not customer-specific.', tags: ['NB-NTN IoT'], meta: 'PDF · 287 KB · updated 2026-05-12', art: 'handshake', status: 'Live' },
  { id: 'doc-nda', title: 'Integration Partner NDA', category: 'Contract', docType: 'NDA', description: 'The non-disclosure agreement an integration partner signs to get access to API specs and developer resources ahead of general availability.', tags: ['NB-NTN IoT'], meta: 'PDF · 142 KB · updated 2026-05-12', art: 'abstract', status: 'Live' },
  { id: 'doc-datasheet', title: 'NB-NTN IoT — Product datasheet', category: 'Product Specs', docType: 'Product Datasheet', description: 'Bearer, coverage, throughput, SLA and pricing summary for NB-NTN IoT.', tags: ['NB-NTN IoT'], meta: 'PDF · 196 KB · updated 2026-06-01', art: 'road', status: 'Live' },
  { id: 'doc-terms-hub', title: 'Business Hub — universal terms of use', category: 'T&Cs', docType: 'T&Cs', description: 'Terms governing use of the Business Hub platform itself (all products).', tags: ['Platform-wide'], meta: 'HTML · updated 2026-04-18', art: 'laptop', status: 'Live' },
  { id: 'doc-tos', title: 'Terms of Service', category: 'T&Cs', docType: 'Legal & policy', description: 'The terms governing your use of the Business Hub and the services delivered through it.', tags: ['Platform-wide'], meta: 'HTML · updated 2026-04-18', art: 'handshake', status: 'Live' },
  { id: 'doc-privacy', title: 'Privacy Notice', category: 'Policies', docType: 'Legal & policy', description: 'How Viasat collects, uses, shares and protects your personal data across the Business Hub.', tags: ['Platform-wide'], meta: 'HTML · updated 2026-04-18', art: 'handshake', status: 'Live' },
  { id: 'doc-cookies', title: 'Manage Cookies', category: 'Policies', docType: 'Legal & policy', description: 'Review the cookies the Business Hub uses and manage your cookie preferences.', tags: ['Platform-wide'], meta: 'HTML · updated 2026-04-18', art: 'handshake', status: 'Live' },
  { id: 'doc-aup', title: 'Network data — acceptable use policy', category: 'Policies', docType: 'Legal & policy', description: 'The acceptable use policy governing network-data made available through the Business Hub APIs — permitted uses, prohibited uses, and your obligations.', tags: ['Platform-wide', 'API'], meta: 'HTML · updated 2026-06-30', art: 'code', status: 'Live' },
]

export const docById = (id: string) => libraryDocs.find((d) => d.id === id)

export const apiSpecs: ApiSpec[] = [
  { id: 'tmf620-v5', code: 'TMF620', name: 'Product Catalog Management', version: 'v5.0.0', date: '2026-06-12', status: 'Live', description: 'Browse the product catalogue — offerings, specs, prices, categories.', domain: 'Product', products: ['NB-NTN IoT', 'NexusWave', 'IFC (In-flight)', 'Platform-wide'], methods: ['GET'] },
  { id: 'tmf620-v6', code: 'TMF620', name: 'Product Catalog Management', version: 'v6.0.0', date: '2026-10-15', status: 'Latest version', description: 'v6.0.0 changes productOfferingPrice id to a prefixed slug format (e.g. "pop-nbntn-iot-base") — see Breaking changes.', domain: 'Product', products: ['NB-NTN IoT', 'NexusWave', 'IFC (In-flight)', 'Platform-wide'], methods: ['GET'] },
  { id: 'tmf637-v5', code: 'TMF637', name: 'Product Inventory', version: 'v5.0.0', date: '2026-06-12', status: 'Live', description: 'Query active product instances (the subscriptions a customer holds).', domain: 'Product', products: ['NB-NTN IoT', 'NexusWave', 'IFC (In-flight)'], methods: ['GET'] },
  { id: 'tmf637-v6', code: 'TMF637', name: 'Product Inventory', version: 'v6.0.0', date: '2026-10-15', status: 'Latest version', description: 'v6.0.0 renames the usage characteristic "dataUsageMb" to "dataUsageMB" — see Breaking changes.', domain: 'Product', products: ['NB-NTN IoT', 'NexusWave', 'IFC (In-flight)'], methods: ['GET'] },
  { id: 'tmf622-v5', code: 'TMF622', name: 'Product Ordering', version: 'v5.0.0', date: '2026-06-12', status: 'Live', description: 'Create and track product orders (activate / modify / cease a subscription).', domain: 'Fulfilment', products: ['NB-NTN IoT', 'NexusWave', 'IFC (In-flight)', 'Platform-wide'], methods: ['GET', 'POST', 'PATCH', 'DELETE'] },
  { id: 'tmf622-v6', code: 'TMF622', name: 'Product Ordering', version: 'v6.0.0', date: '2026-10-15', status: 'Latest version', description: 'v6.0.0 adds "pendingCancellation" and "held" to ProductOrder.state — see Breaking changes.', domain: 'Fulfilment', products: ['NB-NTN IoT', 'NexusWave', 'IFC (In-flight)', 'Platform-wide'], methods: ['GET', 'POST', 'PATCH', 'DELETE'] },
  { id: 'tmf641', code: 'TMF641', name: 'Service Ordering', version: 'v4.1.0', date: '2026-05-20', status: 'Live', description: 'Service-level orchestration behind a product order (provisioning steps).', domain: 'Fulfilment', products: ['NB-NTN IoT', 'NexusWave', 'IFC (In-flight)'], methods: ['GET', 'POST', 'PATCH'] },
  { id: 'tmf640', code: 'TMF640', name: 'Service Activation & Configuration', version: 'v4.0.0', date: '2026-03-22', status: 'Planned', description: 'Trigger service provisioning and config changes at the network layer.', domain: 'Fulfilment', products: ['NexusWave', 'IFC (In-flight)'], methods: ['POST', 'PATCH'] },
  { id: 'tmf639', code: 'TMF639', name: 'Resource Inventory', version: 'v5.0.0', date: '2026-06-12', status: 'Planned', description: 'Network resources — bearers, links, network elements. The base for Performance monitoring.', domain: 'Assurance', products: ['NexusWave', 'IFC (In-flight)'], methods: ['GET', 'PATCH'] },
  { id: 'tmf655', code: 'TMF655', name: 'Usage Management', version: 'v4.0.0', date: '2026-04-02', status: 'Planned', description: 'Real-time data usage per subscriber/device — allowances, top-ups, alerts.', domain: 'Assurance', products: ['NB-NTN IoT'], methods: ['GET'] },
  { id: 'tmf657', code: 'TMF657', name: 'Service Quality Management', version: 'v4.0.0', date: '2026-04-02', status: 'Planned', description: 'SLA tracking, threshold alerting, quality metrics — what Performance monitoring needs.', domain: 'Assurance', products: ['NB-NTN IoT'], methods: ['GET'] },
  { id: 'tmf621', code: 'TMF621', name: 'Trouble Ticket Management', version: 'v4.0.0', date: '2026-04-30', status: 'Planned', description: 'Structured incident tickets with lifecycle, notes, SLA — what Support & cases needs.', domain: 'Assurance', products: ['Platform-wide'], methods: ['GET', 'POST', 'PATCH'] },
  { id: 'tmf681', code: 'TMF681', name: 'Communication Management', version: 'v4.0.0', date: '2026-05-01', status: 'Planned', description: 'Event-driven notifications and push messaging (email, SMS, in-portal).', domain: 'Assurance', products: ['Platform-wide'], methods: ['POST'] },
  { id: 'prop-aviation', code: 'Proprietary', name: 'Aviation flight-ops feed', version: 'Version TBD', date: '', status: 'Roadmap', description: 'Proprietary telemetry feed for aircraft state (altitude, heading, IFC session).', domain: 'Assurance', products: ['IFC (In-flight)'], methods: [] },
  { id: 'tmf629', code: 'TMF629', name: 'Customer Management', version: 'v4.0.0', date: '2026-05-08', status: 'Live', description: 'Customer entities, contacts, characteristics — the customer of a service.', domain: 'Configuration', products: ['NB-NTN IoT', 'Platform-wide'], methods: ['GET', 'POST', 'PATCH', 'DELETE'] },
  { id: 'tmf632', code: 'TMF632', name: 'Party Management', version: 'v5.0.0', date: '2026-06-12', status: 'Live', description: 'Organizations, individuals, roles — the underlying identity layer shared across every product family.', domain: 'Configuration', products: ['Platform-wide'], methods: ['GET', 'POST', 'PATCH', 'DELETE'] },
  { id: 'tmf651', code: 'TMF651', name: 'Agreement Management', version: 'v4.0.0', date: '2026-04-30', status: 'Live', description: 'Account agreements — contracts, MSAs, VAR/roaming schedules.', domain: 'Configuration', products: ['Platform-wide'], methods: ['GET'] },
  { id: 'tmf673', code: 'TMF673', name: 'Geographic Address', version: 'v4.0.0', date: '2026-03-14', status: 'Live', description: 'Address / location entities used by orders, sites, agreements.', domain: 'Configuration', products: ['Platform-wide'], methods: ['GET'] },
  { id: 'tmf674', code: 'TMF674', name: 'Site Management', version: 'v4.0.0', date: '2026-03-14', status: 'Live', description: 'Named geographic sites that host services (buildings, vessels, aircraft).', domain: 'Configuration', products: ['Platform-wide'], methods: ['GET'] },
  { id: 'tmf666', code: 'TMF666', name: 'Account Management', version: 'v4.0.0', date: '2026-03-14', status: 'Planned', description: 'Dedicated account entity — richer than the customer profile carried by TMF629.', domain: 'Configuration', products: ['Platform-wide'], methods: ['GET'] },
  { id: 'tmf672', code: 'TMF672', name: 'User Role & Permission', version: 'v4.0.0', date: '2026-05-08', status: 'Planned', description: 'Proper RBAC API — roles, permissions, entitlements. The basis for the access-management lens.', domain: 'Configuration', products: ['Platform-wide'], methods: ['GET'] },
  { id: 'tmf648', code: 'TMF648', name: 'Quote Management', version: 'v4.0.0', date: '2026-04-30', status: 'Live', description: 'Price quotes with line items and validity window; convertible to an order.', domain: 'Billing', products: ['NB-NTN IoT'], methods: ['GET', 'POST', 'PATCH'] },
  { id: 'tmf678', code: 'TMF678', name: 'Account Bill Management', version: 'v4.0.0', date: '2026-05-01', status: 'Live', description: 'Account invoices — line items, totals, billing period, PDF references.', domain: 'Billing', products: ['NB-NTN IoT'], methods: ['GET'] },
]

export const specById = (id: string) => apiSpecs.find((s) => s.id === id)

export interface Guide { id: string; title: string; type: string; desc: string; meta: string; icon: 'info' | 'book' | 'code' | 'video' | 'release' }
export const guides: Guide[] = [
  { id: 'guide-overview', title: 'API overview', type: 'Overview', desc: 'A hub to help developers quickly discover and learn about the Business Hub APIs available for their integration.', meta: 'HTML · updated 2026-07-18', icon: 'info' },
  { id: 'guide-auth', title: 'Authentication', type: 'Guide', desc: 'How to obtain an OAuth 2.0 access token to call the Business Hub APIs, with sample request and response.', meta: 'HTML · updated 2026-07-18', icon: 'book' },
  { id: 'guide-quickstart', title: 'Quick start guide', type: 'Guide', desc: 'A developer onboarding guide covering authentication, environment configuration and your first calls against the API platform.', meta: 'HTML · updated 2026-07-15', icon: 'book' },
  { id: 'guide-postman', title: 'Postman collection', type: 'Dev kit', desc: 'A downloadable Postman collection for provisioning and inventory calls, with an environment template and example requests.', meta: 'JSON · 46 KB · updated 2026-07-10', icon: 'code' },
  { id: 'guide-videos', title: 'API section — navigation videos', type: 'Video', desc: 'Short video demonstrations of the API developer area: finding specs, getting credentials, and running your first integration.', meta: 'MP4 · 32 MB · updated 2026-07-12', icon: 'video' },
  { id: 'guide-r2608', title: 'API release notes — R26.08', type: 'Release notes', desc: 'Release process and update summary for the R26.08 provisioning API — new endpoints, changes and deprecations.', meta: 'HTML · updated 2026-05-13', icon: 'release' },
  { id: 'guide-r2610', title: 'API release notes — R26.10', type: 'Release notes', desc: 'Updates effective from the R26.10 release — endpoint changes, schema updates and migration notes.', meta: 'HTML · updated 2026-07-01', icon: 'release' },
]
export const guideById = (id: string) => guides.find((g) => g.id === id)

export const breakingChanges = [
  { id: 'bc-1', title: 'ProductOrder.state adds two new enum values', date: '02 Sep 2026', body: '"pendingCancellation" and "held" join the existing state set. Clients that switch on a closed enum (rather than falling through to a default) will need an update before these appear on real orders.', tag: 'TMF622 · GET /productOrderingManagement/v5/productOrder/{id}', specId: 'tmf622-v6' },
  { id: 'bc-2', title: 'Usage characteristic renamed for clarity', date: '18 Jul 2026', body: '"dataUsageMb" is renamed to "dataUsageMB" (unit casing, matching the rest of the contract). The old key is no longer returned — a 90-day dual-write window applied at the time, now closed.', tag: 'TMF637 · GET /productInventoryManagement/v5/product/{id}', specId: 'tmf637-v6' },
  { id: 'bc-3', title: 'ProductOfferingPrice id format changed', date: '04 Jun 2026', body: 'IDs move from a numeric sequence to a prefixed slug (e.g. "pop-nbntn-iot-base") so they read consistently across environments. Any client that parsed the old numeric id will need to switch to treating it as an opaque string.', tag: 'TMF620 · GET /productCatalogManagement/v5/productOfferingPrice', specId: 'tmf620-v6' },
]

/** Library › Technical sub-views (used by the UI and by the chat assistant's navigation tool). */
export const technicalViews = [
  { id: 'guides', label: 'Getting started guides' },
  { id: 'catalogue', label: 'API catalogue (service areas)' },
  { id: 'specs', label: 'API spec browser' },
  { id: 'forum', label: "API Developers' Forum" },
  { id: 'access', label: 'Your API access' },
  { id: 'breaking', label: 'Breaking changes' },
  { id: 'firmware', label: 'Software & firmware' },
  { id: 'policies', label: 'Data usage policies' },
  { id: 'approvals', label: 'Type approvals & certifications' },
] as const

export const newsItems = [
  { id: 'news-1', badges: ['News', 'Partner'], title: 'Partner Program Update — Q3 2026', desc: 'Roadmap briefing, refreshed partner terms and the new device-certification fast-track for approved distributors.', date: '14 Aug 2026' },
  { id: 'news-2', badges: ['News', 'Partner'], title: 'New certified device added to NB-NTN IoT', desc: 'A third IMSI-class tracker joins the Share Pool Plan bundle — same activation flow, no contract change needed.', date: '02 Aug 2026' },
  { id: 'news-3', badges: ['Event', 'Developer'], title: 'NB-NTN ordering at scale — TMF622 patterns & rate limits', desc: "The next live API Developers' Forum session — join live for the walkthrough and Q&A, or catch the recording afterwards.", date: 'Thu 18 Sep 2026 · 15:00 UTC' },
  { id: 'news-4', badges: ['Report', 'NTN', 'IoT'], title: 'The Great Connectivity Convergence: NTN in Automotive', desc: 'Which connected-car applications matter most to drivers, and where ubiquitous connectivity pays off.', date: '' },
  { id: 'news-5', badges: ['Report', 'NTN', 'IoT'], title: 'The Great Connectivity Convergence: NTN in Industrial IoT', desc: 'Industry sentiment on NB-NTN adoption: the urgency, the barriers, and where the buying landscape is heading.', date: '' },
  { id: 'news-6', badges: ['Report', 'NTN', 'IoT'], title: 'The Great Connectivity Convergence: NTN in Consumer Mobile', desc: 'The state of connectivity by region, rising demand for "coverage certainty," and where hybrid connectivity delivers.', date: '' },
]
