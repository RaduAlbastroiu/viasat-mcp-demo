/** Persona → tools exposed. Mirrors the per-profile gating in the JTBD document; "internal" sees everything. */
const readOnlyLibrary = ['get_catalogue_index', 'search_library', 'get_api_spec', 'get_document', 'get_news', 'get_app_link']
const installBase = ['get_install_base', 'get_device', 'get_attention_summary', 'list_devices', 'detect_stale_devices', 'get_fleet_health', 'create_ticket', 'list_tickets', 'resolve_ticket']
const commercial = ['list_orders', 'get_order', 'get_agreement', 'get_contacts', 'get_support_contact', 'compare_plans']

export const personaTools: Record<string, 'all' | string[]> = {
  internal: 'all',
  integrator: [...readOnlyLibrary, ...installBase],
  operator: [...readOnlyLibrary, ...installBase, ...commercial],
  commercial: [...readOnlyLibrary, ...installBase, 'list_orders', 'get_order', 'compare_plans', 'get_contacts'],
}

export function allowsTool(persona: string, tool: string): boolean {
  const allowed = personaTools[persona] ?? 'all'
  return allowed === 'all' || allowed.includes(tool)
}
