import { readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = path.resolve('public/assets/demonstracoes-contabeis')
const labels = {
  bp: 'Balanço patrimonial', bpe: 'Balanço especial de liquidação',
  dre: 'Demonstração do resultado do exercício', dfc: 'Demonstração do fluxo de caixa',
  dmpl: 'Demonstração das mutações do patrimônio líquido', ne: 'Notas explicativas',
}
const kindOrder = { bp: 0, bpe: 1, dre: 2, dfc: 3, dmpl: 4, ne: 5, parecer: 6, voto: 7 }
const entityOrder = { MPF: 0, MPM: 1, MPDFT: 2, MPT: 3, MPU: 4 }
const entries = []
for (const year of (await readdir(root, { withFileTypes: true })).filter((item) => item.isDirectory()).map((item) => item.name).sort().reverse()) {
  for (const file of (await readdir(path.join(root, year))).filter((item) => item.toLowerCase().endsWith('.pdf')).sort()) {
    const normalized = file.replace(/^\d+-/, '').replace(/\.pdf$/i, '').toLowerCase()
    const entity = normalized.match(/(?:^|[-_])(mpdft|mpu|mpf|mpm|mpt)(?:[-_]|$)/)?.[1]?.toUpperCase() || 'MPU'
    const kind = normalized.match(/(?:^|[-_])(dmpl|dfc|dre|bpe|bp|ne)(?:[-_]|$)/)?.[1]
      || (normalized.includes('balanco-patrimonial') ? 'bp' : normalized.includes('demonstracao-resultado') ? 'dre' : normalized.includes('fluxo-caixa') ? 'dfc' : normalized.includes('mutacoes-patrimonio') ? 'dmpl' : normalized.includes('notas-explicativas') ? 'ne' : undefined)
    const special = normalized.includes('parecer') ? 'Parecer do Conselho Fiscal' : normalized.includes('voto') ? 'Voto do Conselho Gestor' : normalized.includes('balanco-patrimonial') ? labels.bp : normalized.includes('demonstracao-resultado') ? labels.dre : normalized.includes('fluxo-caixa') ? labels.dfc : normalized.includes('mutacoes-patrimonio') ? labels.dmpl : normalized.includes('notas-explicativas') ? labels.ne : undefined
    entries.push({ year, entity, title: special || labels[kind] || 'Demonstração contábil', href: `/assets/demonstracoes-contabeis/${year}/${file}` })
  }
}
function getKind(entry) {
  const normalized = entry.href.toLowerCase()
  if (normalized.includes('parecer')) return 'parecer'
  if (normalized.includes('voto')) return 'voto'
  return normalized.match(/(?:^|[-_/])(dmpl|dfc|dre|bpe|bp|ne)(?:[-_.]|$)/)?.[1]
    || (normalized.includes('balanco-patrimonial') ? 'bp' : normalized.includes('demonstracao-resultado') ? 'dre' : normalized.includes('fluxo-caixa') ? 'dfc' : normalized.includes('mutacoes-patrimonio') ? 'dmpl' : normalized.includes('notas-explicativas') ? 'ne' : '')
}
for (const entry of entries) {
  if (entry.href.includes('parecer-conselho-fiscal')) entry.title = 'Parecer nº 1/2025 do Conselho Fiscal/Seplan/MPU (referente às demonstrações contábeis 2024)'
  if (entry.href.includes('voto-conselho-gestor')) entry.title = 'Voto do Conselho Gestor (referente às demonstrações contábeis 2024)'
}
entries.sort((a, b) => Number(b.year) - Number(a.year) || (kindOrder[getKind(a)] ?? 99) - (kindOrder[getKind(b)] ?? 99) || (entityOrder[a.entity] ?? 99) - (entityOrder[b.entity] ?? 99))
await writeFile('src/data/accountingStatements.generated.ts', `// Gerado por scripts/generate-accounting-catalog.mjs\nexport const accountingStatements = ${JSON.stringify(entries, null, 2)} as const\n`)
