import { readdir, stat, writeFile } from 'node:fs/promises'
import { extname, join, relative, sep } from 'node:path'

const root = new URL('../public/', import.meta.url)
const output = new URL('../src/data/assetCatalog.generated.ts', import.meta.url)
const mediaExtensions = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.mp3', '.wav', '.ogg', '.m4a', '.mp4', '.webm'])
const fileExtensions = new Set(['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.csv', '.odt', '.ods', '.txt'])

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const nested = await Promise.all(entries.map(async (entry) => entry.isDirectory() ? walk(join(directory, entry.name)) : [join(directory, entry.name)]))
  return nested.flat()
}

const rootPath = root.pathname.replace(/^\/(.:)/, '$1')
const paths = await walk(rootPath)
const records = []
for (const absolute of paths) {
  const extension = extname(absolute).toLowerCase()
  const kind = mediaExtensions.has(extension) ? 'media' : fileExtensions.has(extension) ? 'file' : null
  if (!kind) continue
  const info = await stat(absolute)
  const path = relative(rootPath, absolute).split(sep).join('/')
  records.push({ id: `bundled:${path}`, name: path.split('/').at(-1), type: extension.slice(1), size: info.size, url: `/${path}`, createdAt: info.mtime.toISOString(), kind, bundled: true })
}
records.sort((a, b) => a.url.localeCompare(b.url, 'pt-BR'))
await writeFile(output, `// Arquivo gerado por scripts/generate-asset-catalog.mjs. Não editar manualmente.\nexport const bundledAssetCatalog = ${JSON.stringify(records, null, 2)} as const\n`)
