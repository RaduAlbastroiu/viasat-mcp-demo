/** Deep links into the hosted Business Hub app (same URL conventions the app's own chat assistant uses). */
import { BUSINESS_HUB_URL } from '../config'
import { specById } from '../data/catalog'

export const LINK_KINDS = ['spec', 'product', 'document', 'guide', 'order', 'quote', 'device', 'group', 'plan', 'site', 'account', 'customer', 'agreement', 'case', 'invoice', 'page'] as const
export type LinkKind = (typeof LINK_KINDS)[number]

const pages: Record<string, string> = {
  home: '/home',
  'install-base': '/install-base',
  marketplace: '/marketplace',
  orders: '/marketplace?tab=orders',
  assets: '/assets',
  library: '/library',
  'library-technical': '/library?tab=technical',
  'library-news': '/library?tab=news',
  agreements: '/agreements',
  billing: '/billing',
  support: '/support',
  notifications: '/notifications',
  monitoring: '/monitoring',
  profile: '/profile',
}

const withPanel = (route: string, panel: string) => `${route}${route.includes('?') ? '&' : '?'}panel=${panel}`

/** Returns a path (without host) for a record, or null if the kind/id cannot be resolved. */
export function pathFor(kind: LinkKind | string, id: string): string | null {
  switch (kind) {
    case 'page':
      return pages[id] ?? null
    case 'spec': {
      const s = specById(id)
      if (!s) return null
      return withPanel(`/library?tab=technical&view=specs&specs=domain&domain=${encodeURIComponent(s.domain)}`, `spec:${s.id}`)
    }
    case 'product':
      return `/products/${encodeURIComponent(id)}`
    case 'document':
      return withPanel('/library?tab=commercial', `content:${id}`)
    case 'guide':
      return withPanel('/library?tab=technical&view=guides', `content:${id}`)
    case 'order':
      return withPanel('/marketplace?tab=orders', `order:${id}`)
    case 'quote':
      return `/quotes/${encodeURIComponent(id)}`
    case 'device':
      return withPanel('/install-base?view=terminals', `terminal:${id}`)
    case 'group':
      return withPanel('/install-base?view=groups', `group:${id}`)
    case 'plan':
      return withPanel('/install-base?view=plans', `ratePlan:${id}`)
    case 'site':
      return withPanel('/install-base?view=sites', `location:${id}`)
    case 'account':
      return withPanel('/install-base', `account:${id}`)
    case 'customer':
      return withPanel('/install-base', `customer:${id}`)
    case 'agreement':
      return withPanel('/agreements', `agreement:${id}`)
    case 'case':
      return withPanel('/support', `case:${id}`)
    case 'invoice':
      return withPanel('/billing', `invoice:${id}`)
    default:
      return null
  }
}

export function appLink(kind: LinkKind | string, id: string): string | null {
  const p = pathFor(kind, id)
  return p ? `${BUSINESS_HUB_URL}${p}` : null
}
