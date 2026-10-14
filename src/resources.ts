import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js'
import { apiSpecs, docById, guideById, guides, libraryDocs, specById } from './data/catalog'
import { appLink } from './tools/links'

const one = (v: string | string[]) => (Array.isArray(v) ? v[0] : v)

export function registerResources(server: McpServer) {
  server.registerResource(
    'documents',
    new ResourceTemplate('businesshub://docs/{id}', {
      list: async () => ({ resources: libraryDocs.map((d) => ({ uri: `businesshub://docs/${d.id}`, name: d.title, description: `${d.category} / ${d.docType} · ${d.meta}`, mimeType: 'text/plain' })) }),
    }),
    { title: 'Commercial documents', description: 'Policies, T&Cs, contracts, datasheets and knowledge articles from Library › Commercial.', mimeType: 'text/plain' },
    async (uri, { id }) => {
      const d = docById(one(id))
      if (!d) throw new Error(`Unknown document ${one(id)}`)
      const body = [`# ${d.title}`, `${d.category} / ${d.docType} · ${d.meta}`, `Tags: ${d.tags.join(', ')}`, '', d.description, '', d.meta.startsWith('PDF') ? 'PDF — full text is not available in this demo.' : `This document applies to ${d.tags.join(', ')}.`, '', `Open in app: ${appLink('document', d.id)}`].join('\n')
      return { contents: [{ uri: uri.href, mimeType: 'text/plain', text: body }] }
    },
  )

  server.registerResource(
    'guides',
    new ResourceTemplate('businesshub://guides/{id}', {
      list: async () => ({ resources: guides.map((g) => ({ uri: `businesshub://guides/${g.id}`, name: g.title, description: `${g.type} · ${g.meta}`, mimeType: 'text/plain' })) }),
    }),
    { title: 'Getting started guides', description: 'API overview, authentication, quick start, Postman collection, videos and release notes.', mimeType: 'text/plain' },
    async (uri, { id }) => {
      const g = guideById(one(id))
      if (!g) throw new Error(`Unknown guide ${one(id)}`)
      return { contents: [{ uri: uri.href, mimeType: 'text/plain', text: [`# ${g.title}`, `${g.type} · ${g.meta}`, '', g.desc, '', `Open in app: ${appLink('guide', g.id)}`].join('\n') }] }
    },
  )

  server.registerResource(
    'api-specs',
    new ResourceTemplate('businesshub://specs/{id}', {
      list: async () => ({ resources: apiSpecs.map((s) => ({ uri: `businesshub://specs/${s.id}`, name: `${s.code} — ${s.name} ${s.version}`, description: `${s.domain} · ${s.status}`, mimeType: 'application/json' })) }),
    }),
    { title: 'API specifications', description: 'TM Forum API specs in the catalogue, with version, status, domain and methods.', mimeType: 'application/json' },
    async (uri, { id }) => {
      const s = specById(one(id))
      if (!s) throw new Error(`Unknown spec ${one(id)}`)
      return { contents: [{ uri: uri.href, mimeType: 'application/json', text: JSON.stringify({ ...s, open_in_app: appLink('spec', s.id) }, null, 2) }] }
    },
  )
}
