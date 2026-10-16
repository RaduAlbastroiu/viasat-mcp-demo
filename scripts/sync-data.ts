/** Copies the Business Hub app's mock data (business-hub/src/data) into this project unchanged. */
import { copyFileSync, mkdirSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'

const src = resolve(__dirname, '..', '..', 'business-hub', 'src', 'data')
const dst = resolve(__dirname, '..', 'src', 'data')
mkdirSync(dst, { recursive: true })
const files = readdirSync(src).filter((f) => f.endsWith('.ts') || f.endsWith('.json'))
for (const f of files) copyFileSync(join(src, f), join(dst, f))
console.log(`Copied ${files.length} files from ${src} → ${dst}`)
