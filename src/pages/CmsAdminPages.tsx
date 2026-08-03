import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Download, Eye, FileArchive, FileImage, FilePlus2, Globe2, Images, MapPin, Newspaper, Pencil, Phone, Plus, Save, Trash2, Upload, X } from 'lucide-react'
import { useMemo, useRef, useState, type ChangeEvent } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { contentRepository, createCmsBlock, createCmsPage, useCmsSnapshot, type CmsBlock, type CmsBlockType, type CmsPage } from '../cms/contentRepository'
import { cmsIconGroups } from '../cms/iconCatalog'
import { getCmsFaqCategories, getCmsFaqs, resetCmsFaqCategories, resetCmsFaqs, type CmsFaqItem } from '../cms/specialContent'
import { getSiteContent, saveSiteContent, type CmsAddress, type CmsBanner, type CmsContactChannel, type CmsMediaAsset, type CmsNewsItem, type CmsSocialLink } from '../cms/siteContentRepository'
import { Combobox, type ComboboxOption } from '../components/Combobox'
import { RichTextEditor } from '../components/RichTextEditor'
import { stripHtml } from '../utils/html'
import { getPlanAssisteArticleCmsSeed, PublicBreadcrumb, PublicShell, type PublicPageProps } from './PublicPages'
import { getAccountingCmsSeed, getAccreditationTermsCmsSeed, getActuarialCmsSeed, getBudgetExecutionCmsSeed, getBudgetFinancialReportsCmsSeed, getManagementReportsCmsSeed, getTransparencyCmsSeed } from './TransparenciaPage'

const knownPages = [
  ['plan-assiste', 'Plan-Assiste'],
  ['transparencia', 'Transparência'],
  ['transparencia/demonstracoes-contabeis', 'Demonstrações contábeis'],
  ['transparencia/avaliacoes-atuariais', 'Avaliações atuariais'],
  ['transparencia/termos-de-credenciamento', 'Termos de credenciamento'],
  ['transparencia/relatorios-de-gestao', 'Relatórios de gestão'],
  ['transparencia/execucao-orcamentaria', 'Execução orçamentária'],
  ['transparencia/relatorios-orcamentarios-e-financeiros', 'Relatórios orçamentários e financeiros'],
  ['sobre-o-plan-assiste', 'Sobre o Plan-Assiste'],
  ['estrutura-e-governanca', 'Estrutura e Governança'],
  ['nossa-marca', 'Nossa marca'],
  ['quem-pode-aderir', 'Quem pode aderir'],
  ['como-se-credenciar-ou-renovar', 'Como se credenciar ou renovar'],
  ['como-se-credenciar-ou-renovar/pessoa-juridica', 'Pessoa jurídica'],
  ['como-se-credenciar-ou-renovar/pessoa-fisica', 'Pessoa física'],
  ['tabelas-de-servicos', 'Tabelas de serviços'],
  ['organograma', 'Organograma'],
  ['regulamento-geral', 'Regulamento Geral'],
  ['normas-complementares', 'Normas Complementares'],
  ['fale-conosco/duvidas-frequentes', 'Dúvidas frequentes'],
] as const

const adminPageSize = 12
const formatBrazilianDate = (value: string) => { const [year, month, day] = value.split('-'); return day && month && year ? `${day}/${month}/${year}` : value }
function AdminPagination({ page, total, onChange }: { page: number, total: number, onChange: (page: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / adminPageSize))
  if (pages <= 1) return null
  return <nav className="cms-admin-pagination" aria-label="Paginação"><button type="button" disabled={page <= 1} onClick={() => onChange(page - 1)}>Anterior</button><span>Página {page} de {pages}</span><button type="button" disabled={page >= pages} onClick={() => onChange(page + 1)}>Próxima</button></nav>
}

function replaceAssetReferences(oldUrl: string, newUrl: string) {
  contentRepository.getSnapshot().pages.forEach((page) => contentRepository.savePage({ ...page, blocks: page.blocks.map((block) => ({ ...block, href: block.href === oldUrl ? newUrl : block.href, mediaUrl: block.mediaUrl === oldUrl ? newUrl : block.mediaUrl, content: block.content.replaceAll(oldUrl, newUrl) })) }))
}

function isImageAsset(type: string) {
  return type.startsWith('image/') || ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(type.toLowerCase())
}

function MediaPreview({ asset }: { asset: ReturnType<typeof getSiteContent>['media'][number] }) {
  const [details, setDetails] = useState('')
  const image = isImageAsset(asset.type)
  const video = asset.type.startsWith('video/') || ['mp4','webm'].includes(asset.type)
  const audio = asset.type.startsWith('audio/') || ['mp3','wav','ogg','m4a'].includes(asset.type)
  const duration = (value: number) => Number.isFinite(value) ? `${Math.floor(value / 60)}:${String(Math.round(value % 60)).padStart(2, '0')}` : ''
  return <>{image ? <img src={asset.url} alt="" onLoad={(event) => setDetails(`${event.currentTarget.naturalWidth} × ${event.currentTarget.naturalHeight} px`)} /> : video ? <video src={asset.url} controls preload="metadata" onLoadedMetadata={(event) => setDetails(`${event.currentTarget.videoWidth} × ${event.currentTarget.videoHeight} px · ${duration(event.currentTarget.duration)}`)} /> : audio ? <audio src={asset.url} controls preload="metadata" onLoadedMetadata={(event) => setDetails(`Duração ${duration(event.currentTarget.duration)}`)} /> : <FileImage aria-hidden="true" />}{details && <small className="cms-media-details">{details}</small>}</>
}

function publicPath(slug: string) {
  if (slug === 'transparencia' || slug.startsWith('transparencia/')) return `/${slug}`
  if (slug === 'fale-conosco/duvidas-frequentes') return '/fale-conosco/duvidas-frequentes'
  return `/plan-assiste/${slug}`
}

function getFaqPageSeed(): CmsPage {
  const page = createCmsPage('fale-conosco/duvidas-frequentes')
  return { ...page, title: 'Dúvidas frequentes', navigationTitle: 'Dúvidas frequentes', summary: 'Encontre respostas rápidas para os temas mais procurados no atendimento do Plan-Assiste.', status: 'published', blocks: [{ ...createCmsBlock('faq'), title: 'Dúvidas frequentes', faqCategories: getCmsFaqCategories(), faqItems: getCmsFaqs().map((item) => ({ ...item, id: crypto.randomUUID() })) }] }
}

function hydrateStructuredBlocks(page: CmsPage) {
  if (page.slug !== 'organograma') return page
  const defaultBlock = getPlanAssisteArticleCmsSeed('organograma')?.blocks.find((block) => block.type === 'organization')
  if (!defaultBlock) return page
  let found = false
  const blocks = page.blocks.map((block) => {
    if (block.type === 'organization' || block.title.trim().toLowerCase() === 'estrutura administrativa') {
      found = true
      return { ...block, type: 'organization' as const, content: '', organizationItems: block.organizationItems?.length ? block.organizationItems : defaultBlock.organizationItems }
    }
    return block
  })
  return { ...page, blocks: found ? blocks : [...blocks, defaultBlock] }
}

type OrgItem = NonNullable<CmsBlock['organizationItems']>[number]

function numberedOrgItems(items: OrgItem[]) {
  const counters: number[] = []
  return items.map((item, index) => {
    const maximum = index === 0 ? 1 : (items[index - 1]?.level || 1) + 1
    const level = Math.max(1, Math.min(item.level, maximum))
    counters.length = level
    counters[level - 1] = (counters[level - 1] || 0) + 1
    for (let depth = 0; depth < level - 1; depth += 1) counters[depth] ||= 1
    return { ...item, level, number: counters.join('.') }
  })
}

function FaqCollectionEditor({ categories, items, onCategoriesChange, onItemsChange }: { categories: string[], items: CmsFaqItem[], onCategoriesChange: (categories: string[]) => void, onItemsChange: (items: CmsFaqItem[]) => void }) {
  const [newCategory, setNewCategory] = useState('')
  function renameCategory(index: number) {
    const nextName = window.prompt('Novo nome da categoria:', categories[index])?.trim()
    if (!nextName || categories.includes(nextName)) return
    const previous = categories[index]
    onCategoriesChange(categories.map((category, categoryIndex) => categoryIndex === index ? nextName : category))
    onItemsChange(items.map((item) => item.category === previous ? { ...item, category: nextName } : item))
  }
  function deleteCategory(index: number) {
    if (categories.length === 1) { window.alert('Mantenha pelo menos uma categoria.'); return }
    const removed = categories[index]
    const linkedCount = items.filter((item) => item.category === removed).length
    const linkedMessage = linkedCount === 0
      ? 'Ela não possui perguntas vinculadas.'
      : `${linkedCount} ${linkedCount === 1 ? 'pergunta vinculada será excluída' : 'perguntas vinculadas serão excluídas'} junto com a categoria.`
    if (!window.confirm(`Excluir a categoria “${removed}”?\n\n${linkedMessage}\n\nEsta ação não poderá ser desfeita após salvar a página.`)) return
    onCategoriesChange(categories.filter((_, categoryIndex) => categoryIndex !== index))
    onItemsChange(items.filter((item) => item.category !== removed))
  }
  function move(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= items.length) return
    const next = [...items]; [next[index], next[target]] = [next[target], next[index]]; onItemsChange(next)
  }
  return <>
    <section className="cms-category-manager"><h3>Categorias</h3><div className="cms-category-list">{categories.map((category, index) => <span key={category}>{category}<button type="button" onClick={() => renameCategory(index)} title="Renomear categoria"><Pencil /></button><button type="button" onClick={() => deleteCategory(index)} title="Excluir categoria"><Trash2 /></button></span>)}</div><div className="cms-category-add"><input value={newCategory} onChange={(event) => setNewCategory(event.target.value)} placeholder="Nova categoria" /><button className="secondary-button" type="button" onClick={() => { const value = newCategory.trim(); if (value && !categories.includes(value)) { onCategoriesChange([...categories, value]); setNewCategory('') } }}><Plus /> Adicionar categoria</button></div></section>
    <div className="cms-special-editor-list">{items.map((item, index) => <article className="cms-special-editor-item" key={item.id || index}><header><strong>Item {index + 1}</strong><div><button type="button" disabled={index === 0} onClick={() => move(index, -1)} title="Mover para cima"><ArrowUp /></button><button type="button" disabled={index === items.length - 1} onClick={() => move(index, 1)} title="Mover para baixo"><ArrowDown /></button><button type="button" onClick={() => onItemsChange(items.filter((_, itemIndex) => itemIndex !== index))} title="Excluir"><Trash2 /></button></div></header><div className="cms-page-fields"><label>Categoria<select value={item.category} onChange={(event) => onItemsChange(items.map((value, itemIndex) => itemIndex === index ? { ...value, category: event.target.value } : value))}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label><label className="wide">Pergunta<input value={item.question} onChange={(event) => onItemsChange(items.map((value, itemIndex) => itemIndex === index ? { ...value, question: event.target.value } : value))} /></label><label className="wide">Resposta<textarea value={item.answer} onChange={(event) => onItemsChange(items.map((value, itemIndex) => itemIndex === index ? { ...value, answer: event.target.value } : value))} /></label></div></article>)}</div>
    <button className="secondary-button" type="button" onClick={() => onItemsChange([...items, { category: categories[0] || 'Geral', question: '', answer: '' }])}><Plus /> Adicionar pergunta</button>
  </>
}

function OrganizationItemsEditor({ items, onChange }: { items: OrgItem[], onChange: (items: OrgItem[]) => void }) {
  const numbered = numberedOrgItems(items)
  function move(index: number, direction: -1 | 1) { const target = index + direction; if (target < 0 || target >= items.length) return; const next = [...items]; [next[index], next[target]] = [next[target], next[index]]; onChange(numberedOrgItems(next).map(({ number, ...item }) => { void number; return item })) }
  function setLevel(index: number, direction: -1 | 1) { const current = numbered[index]; const max = index === 0 ? 1 : numbered[index - 1].level + 1; const level = Math.max(1, Math.min(current.level + direction, max)); onChange(items.map((item, itemIndex) => itemIndex === index ? { ...item, level } : item)) }
  function update(index: number, patch: Partial<OrgItem>) { onChange(items.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item)) }
  return <><div className="cms-org-editor-list">{numbered.map((item, index) => <article className="cms-org-editor-row" style={{ '--org-level': item.level } as React.CSSProperties} key={item.id}><header><span className="cms-org-number">{item.number}</span><span className="cms-org-level">Nível {item.level}</span><div><button type="button" disabled={item.level === 1} onClick={() => setLevel(index, -1)} title="Mover um nível para a esquerda"><ArrowLeft /></button><button type="button" disabled={index === 0 || item.level >= (numbered[index - 1]?.level || 1) + 1} onClick={() => setLevel(index, 1)} title="Mover um nível para a direita"><ArrowRight /></button><button type="button" disabled={index === 0} onClick={() => move(index, -1)} title="Mover para cima"><ArrowUp /></button><button type="button" disabled={index === items.length - 1} onClick={() => move(index, 1)} title="Mover para baixo"><ArrowDown /></button><button type="button" onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))} title="Excluir"><Trash2 /></button></div></header><div className="cms-org-fields"><label className="wide">Nome da unidade<input value={item.label} onChange={(event) => update(index, { label: event.target.value })} /></label><label>Sigla<input value={item.acronym || ''} onChange={(event) => update(index, { acronym: event.target.value })} /></label><label>Responsável<input value={item.responsible || ''} onChange={(event) => update(index, { responsible: event.target.value })} /></label><label className="wide">E-mail<input type="email" value={item.email || ''} onChange={(event) => update(index, { email: event.target.value })} /></label></div></article>)}</div><button className="secondary-button" type="button" onClick={() => onChange([...items, { id: crypto.randomUUID(), label: '', acronym: '', responsible: '', email: '', level: items.at(-1)?.level || 1 }])}><Plus /> Adicionar unidade</button></>
}

function TableBlockEditor({ block, onChange, onDelete }: { block: CmsBlock, onChange: (block: CmsBlock) => void, onDelete: () => void }) {
  const headers = block.tableHeaders || ['Coluna 1', 'Coluna 2']
  const rows = block.tableRows || [['', '']]
  function setHeaders(tableHeaders: string[]) { onChange({ ...block, tableHeaders }) }
  function setRows(tableRows: string[][]) { onChange({ ...block, tableRows }) }
  return <section className="cms-table-editor">
    <label className="cms-table-style">Estilo da tabela
      <select value={block.tableVariant || 'standard'} onChange={(event) => onChange({ ...block, tableVariant: event.target.value as CmsBlock['tableVariant'] })}>
        <option value="standard">Normal</option>
        <option value="hover">Destacar linha ao passar o mouse</option>
        <option value="striped">Zebrada (linhas alternadas)</option>
      </select>
    </label>
    <div className="cms-table-editor-actions"><button type="button" onClick={() => onChange({ ...block, tableHeaders: [...headers, `Coluna ${headers.length + 1}`], tableRows: rows.map((row) => [...row, '']) })}><Plus /> Coluna</button><button type="button" disabled={headers.length <= 1} onClick={() => onChange({ ...block, tableHeaders: headers.slice(0, -1), tableRows: rows.map((row) => row.slice(0, -1)) })}><Trash2 /> Última coluna</button><button type="button" onClick={() => setRows([...rows, headers.map(() => '')])}><Plus /> Linha</button><button type="button" disabled={rows.length <= 1} onClick={() => setRows(rows.slice(0, -1))}><Trash2 /> Última linha</button><button className="cms-table-delete" type="button" onClick={() => { if (window.confirm('Excluir esta tabela?')) onDelete() }}><Trash2 /> Excluir tabela</button></div>
    <div className="portal-table-wrap"><table className={`portal-table cms-table-${block.tableVariant || 'standard'}`}><thead><tr>{headers.map((header, column) => <th key={column}><input value={header} onChange={(event) => setHeaders(headers.map((value, index) => index === column ? event.target.value : value))} aria-label={`Cabeçalho ${column + 1}`} /></th>)}</tr></thead><tbody>{rows.map((row, rowIndex) => <tr key={rowIndex}>{headers.map((_, column) => <td key={column}><textarea value={row[column] || ''} onChange={(event) => setRows(rows.map((value, index) => index === rowIndex ? headers.map((__, cellIndex) => cellIndex === column ? event.target.value : value[cellIndex] || '') : value))} aria-label={`Linha ${rowIndex + 1}, coluna ${column + 1}`} /></td>)}</tr>)}</tbody></table></div>
  </section>
}

function AdminFrame({ children, title, loggedIn, onLogout }: PublicPageProps & { children: React.ReactNode, title: string }) {
  const parents = title === 'Administração do Portal'
    ? [{ label: 'Área da equipe', to: '/area-da-equipe' }]
    : [{ label: 'Área da equipe', to: '/area-da-equipe' }, { label: 'Administração do Portal', to: '/area-da-equipe/administracao-do-portal' }]
  return (
    <PublicShell loggedIn={loggedIn} onLogout={onLogout}>
      <main className="container public-page cms-admin-page">
        <PublicBreadcrumb current={title} parents={parents} />
        {children}
      </main>
    </PublicShell>
  )
}

export function CmsAdminOverviewPage(props: PublicPageProps) {
  const snapshot = contentRepository.getSnapshot()
  const fileRef = useRef<HTMLInputElement>(null)

  function downloadBackup() {
    const blob = new Blob([contentRepository.exportData()], { type: 'application/json' })
    const href = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = href
    anchor.download = `plan-assiste-conteudo-${new Date().toISOString().slice(0, 10)}.json`
    anchor.click()
    URL.revokeObjectURL(href)
  }

  async function importBackup(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      contentRepository.importData(await file.text())
      window.location.reload()
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Não foi possível importar o arquivo.')
    }
  }

  return (
    <AdminFrame {...props} title="Administração do Portal">
      <section className="simple-page-heading cms-admin-heading">
        <div><p className="eyebrow">Área da equipe</p><h1>Administração do Portal</h1><p>Edite páginas e componentes preservando o padrão visual do portal.</p></div>
        <Link className="primary-button" to="/area-da-equipe/administracao-do-portal/paginas/nova"><FilePlus2 aria-hidden="true" /> Nova página</Link>
      </section>
      <section className="cms-admin-module-grid">
        <Link to="/area-da-equipe/administracao-do-portal/paginas"><Globe2 /><h2>Páginas</h2><p>Conteúdo em blocos, páginas-mãe, filhas e netas.</p></Link>
        <Link to="/area-da-equipe/administracao-do-portal/banners"><Images /><h2>Banners</h2><p>Cadastre, ordene, programe e publique banners por público.</p></Link>
        <Link to="/area-da-equipe/administracao-do-portal/midias"><FileImage /><h2>Mídia</h2><p>Gerencie imagens, vídeos e áudios com visualização e player.</p></Link>
        <Link to="/area-da-equipe/administracao-do-portal/arquivos"><FileArchive /><h2>Arquivos</h2><p>Consulte o acervo de PDFs e documentos do Office e envie novos arquivos.</p></Link>
        <Link to="/area-da-equipe/administracao-do-portal/noticias"><Newspaper /><h2>Notícias</h2><p>Crie, edite, categorize e publique notícias completas.</p></Link>
        <Link to="/area-da-equipe/administracao-do-portal/contatos"><Phone /><h2>Contatos institucionais</h2><p>Atualize telefones, e-mails, endereços e redes sociais exibidos em todo o site.</p></Link>
      </section>
      <section className="cms-storage-panel">
        <div><h2>Dados desta demonstração</h2><p>{snapshot.pages.length} página(s) personalizada(s) estão salvas neste navegador. O refresh não apaga alterações. Para voltar ao site original, use “Restaurar conteúdo”.</p></div>
        <div className="cms-admin-actions">
          <button className={snapshot.editingEnabled ? 'primary-button' : 'secondary-button'} type="button" onClick={() => { contentRepository.setEditingEnabled(!snapshot.editingEnabled); window.location.reload() }}><Pencil /> {snapshot.editingEnabled ? 'Desativar modo de edição' : 'Ativar modo de edição'}</button>
          <button className="secondary-button" type="button" onClick={downloadBackup}><Download /> Exportar JSON</button>
          <button className="secondary-button" type="button" onClick={() => fileRef.current?.click()}><Upload /> Importar JSON</button>
          <input ref={fileRef} hidden type="file" accept="application/json,.json" onChange={importBackup} />
          <button className="secondary-button" type="button" onClick={() => { if (window.confirm('Remover todas as personalizações salvas neste navegador?')) { resetCmsFaqs(); resetCmsFaqCategories(); contentRepository.reset(); window.location.reload() } }}><Trash2 /> Restaurar conteúdo</button>
        </div>
      </section>
    </AdminFrame>
  )
}

export function CmsPagesPage(props: PublicPageProps) {
  const customized = useCmsSnapshot().pages
  const [query, setQuery] = useState('')
  const [sortOrder, setSortOrder] = useState<'title-asc' | 'title-desc'>('title-asc')
  const rows = useMemo(() => {
    const known = knownPages.map(([slug, title]) => customized.find((page) => page.slug === slug) || ({ id: `base:${slug}`, slug, title, navigationTitle: title, status: 'published' } as CmsPage))
    return [...known, ...customized.filter((page) => !knownPages.some(([slug]) => slug === page.slug))]
  }, [customized])
  const visibleRows = useMemo(() => {
    const normalizedQuery = query.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR')
    const filteredRows = normalizedQuery ? rows.filter((page) => {
      const searchableContent = `${page.title} ${page.navigationTitle || ''} ${page.slug} ${page.status === 'draft' ? 'rascunho' : 'publicada'}`
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLocaleLowerCase('pt-BR')
      return searchableContent.includes(normalizedQuery)
    }) : rows
    return [...filteredRows].sort((first, second) => {
      const titleComparison = first.title.localeCompare(second.title, 'pt-BR', { sensitivity: 'base' })
      if (sortOrder === 'title-desc') return -titleComparison
      return titleComparison
    })
  }, [query, rows, sortOrder])
  return (
    <AdminFrame {...props} title="Páginas">
      <section className="simple-page-heading cms-admin-heading"><div><h1>Páginas do portal</h1><p>As personalizadas substituem o conteúdo original; páginas sem personalização continuam usando o conteúdo do código.</p></div><Link className="primary-button" to="nova"><Plus /> Nova página</Link></section>
      <div className="cms-pages-controls">
        <label className="cms-library-search">Buscar páginas<input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Título, endereço ou status" /></label>
        <label className="cms-pages-sort">Ordenar por<select value={sortOrder} onChange={(event) => setSortOrder(event.target.value as typeof sortOrder)}><option value="title-asc">Título: A–Z</option><option value="title-desc">Título: Z–A</option></select></label>
      </div>
      <div className="portal-table-wrap"><table className="portal-table cms-pages-table"><colgroup><col className="cms-pages-title-column" style={{ width: '25%' }} /><col className="cms-pages-path-column" style={{ width: '45%' }} /><col className="cms-pages-status-column" style={{ width: '15%' }} /><col className="cms-pages-action-column" style={{ width: '15%' }} /></colgroup><thead><tr><th>Página</th><th>Endereço</th><th>Status</th><th>Ações</th></tr></thead><tbody>{visibleRows.map((page) => { const isCustomized = customized.some((item) => item.id === page.id); return <tr key={page.id}><td>{page.title}</td><td><code>{publicPath(page.slug)}</code></td><td>{page.status === 'draft' ? 'Rascunho' : 'Publicada'}</td><td><div className="cms-table-actions"><Link to={page.id.startsWith('base:') ? `base-${encodeURIComponent(page.slug)}` : page.id}><Pencil /> Editar</Link>{isCustomized && <button type="button" onClick={() => { if (window.confirm(`Remover a personalização de “${page.title}”?`)) contentRepository.deletePage(page.id) }}><Trash2 /> {knownPages.some(([slug]) => slug === page.slug) ? 'Restaurar original' : 'Excluir'}</button>}</div></td></tr>})}{visibleRows.length === 0 && <tr><td colSpan={4}>Nenhuma página encontrada para a busca informada.</td></tr>}</tbody></table></div>
      <p className="cms-pages-result-count">{visibleRows.length} {visibleRows.length === 1 ? 'página encontrada' : 'páginas encontradas'}.</p>
    </AdminFrame>
  )
}

function BlockEditor({ block, index, total, onChange, onMove, onDelete }: { block: CmsBlock, index: number, total: number, onChange: (block: CmsBlock) => void, onMove: (direction: -1 | 1) => void, onDelete: () => void }) {
  const library = getSiteContent()
  function changeType(type: CmsBlockType) {
    onChange({ ...block, type, cardVariant: type === 'card' ? block.cardVariant || 'navigation' : block.cardVariant, faqCategories: type === 'faq' ? block.faqCategories || ['Geral'] : block.faqCategories, faqItems: type === 'faq' ? block.faqItems || [] : block.faqItems, organizationItems: type === 'organization' ? block.organizationItems || [] : block.organizationItems, tableHeaders: type === 'table' ? block.tableHeaders || ['Coluna 1', 'Coluna 2'] : block.tableHeaders, tableRows: type === 'table' ? block.tableRows || [['', '']] : block.tableRows, tableVariant: type === 'table' ? block.tableVariant || 'standard' : block.tableVariant, buttonVariant: type === 'button' ? block.buttonVariant || 'primary' : block.buttonVariant })
  }
  function attachFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    if (file.size > 1_000_000) {
      window.alert('Na demonstração local, use arquivos de até 1 MB. Na API definitiva, os arquivos serão enviados ao armazenamento de objetos.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => onChange({ ...block, href: String(reader.result || ''), buttonLabel: block.buttonLabel || file.name })
    reader.readAsDataURL(file)
  }
  return <article className={`cms-block-editor cms-width-${block.width.replace('/', '-')}`}>
    <header><strong>Bloco {index + 1}</strong><div><button type="button" disabled={index === 0} onClick={() => onMove(-1)} title="Mover para cima"><ArrowLeft /></button><button type="button" disabled={index === total - 1} onClick={() => onMove(1)} title="Mover para baixo"><ArrowRight /></button><button type="button" onClick={onDelete} title="Excluir bloco"><Trash2 /></button></div></header>
    <div className="cms-block-fields">
      <label>Tipo<select value={block.type} onChange={(event) => changeType(event.target.value as CmsBlockType)}><option value="rich-text">Texto rico</option><option value="card">Card</option><option value="document">Documento ou arquivo</option><option value="button">Botão</option><option value="media">Mídia</option><option value="table">Tabela</option><option value="notice">Destaque</option><option value="faq">Dúvidas frequentes</option><option value="organization">Organograma</option></select></label>
      <label>Largura<select value={block.width} onChange={(event) => onChange({ ...block, width: event.target.value as CmsBlock['width'] })}><option value="1/1">Linha inteira</option><option value="1/2">Metade</option><option value="1/3">Um terço</option><option value="1/4">Um quarto</option></select></label>
      <label className="wide">Título<input value={block.title} onChange={(event) => onChange({ ...block, title: event.target.value })} /></label>
      {block.type === 'rich-text' && <label className="wide">Conteúdo<RichTextEditor value={block.content} onChange={(content) => onChange({ ...block, content })} minHeight={130} /></label>}
      {['card', 'document', 'notice'].includes(block.type) && <label className="wide">Descrição<textarea rows={4} value={stripHtml(block.content)} onChange={(event) => onChange({ ...block, content: event.target.value })} /></label>}
      {block.type === 'card' && <><label>Estilo do card<select value={block.cardVariant || 'navigation'} onChange={(event) => onChange({ ...block, cardVariant: event.target.value as CmsBlock['cardVariant'] })}><option value="navigation">Navegação principal</option><option value="navigation-secondary">Card de navegação 2</option><option value="actuarial">Avaliação Atuarial</option><option value="information">Informativo</option><option value="operational">Operacional</option><option value="result">Resultado</option></select></label><label>Ícone do topo<select value={block.icon || 'none'} disabled={block.cardVariant === 'actuarial'} onChange={(event) => onChange({ ...block, icon: event.target.value })}><option value="none">Sem ícone</option>{cmsIconGroups.map((group) => <optgroup label={group.label} key={group.label}>{group.options.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</optgroup>)}</select></label><label>Identificador ou ano<input value={block.badge || ''} disabled={block.cardVariant !== 'actuarial'} onChange={(event) => onChange({ ...block, badge: event.target.value })} placeholder={block.cardVariant === 'actuarial' ? 'Ex.: 2026' : 'Disponível no card atuarial'} /></label><label>Metadado ou período<input value={block.meta || ''} onChange={(event) => onChange({ ...block, meta: event.target.value })} placeholder="Ex.: Período-base: julho/2025 a junho/2026" /></label></>}
      {(block.type === 'card' || block.type === 'document') && <><label className="wide">Link ou caminho do arquivo<input value={block.href || ''} onChange={(event) => onChange({ ...block, href: event.target.value })} placeholder="/assets/documento.pdf" /></label>{block.type === 'document' && <label className="wide">Hospedar arquivo nesta demonstração<input type="file" onChange={attachFile} /></label>}<label className="wide">Texto do botão<input value={block.buttonLabel || ''} onChange={(event) => onChange({ ...block, buttonLabel: event.target.value })} /></label></>}
      {block.type === 'document' && <label className="wide">Selecionar na Biblioteca de arquivos<Combobox value={block.href || ''} options={library.files.map((asset) => ({ value: asset.url, label: asset.name }))} onSelect={(href) => { const asset = library.files.find((item) => item.url === href); onChange({ ...block, href, buttonLabel: block.buttonLabel || asset?.name || 'Baixar arquivo' }) }} placeholder="Digite para buscar um arquivo existente" /></label>}
      {block.type === 'button' && <><label>Estilo<select value={block.buttonVariant || 'primary'} onChange={(event) => onChange({ ...block, buttonVariant: event.target.value as CmsBlock['buttonVariant'] })}><option value="primary">Primário</option><option value="secondary">Secundário</option><option value="link">Link textual</option></select></label><label>Texto do botão<input value={block.buttonLabel || ''} onChange={(event) => onChange({ ...block, buttonLabel: event.target.value })} /></label><label className="wide">Destino<input value={block.href || ''} onChange={(event) => onChange({ ...block, href: event.target.value })} /></label><label className="wide">Vincular a arquivo<select value={library.files.some((asset) => asset.url === block.href) ? block.href : ''} onChange={(event) => onChange({ ...block, href: event.target.value })}><option value="">Nenhum arquivo</option>{library.files.map((asset) => <option value={asset.url} key={asset.id}>{asset.name}</option>)}</select></label></>}
      {block.type === 'media' && <><label>Tipo<select value={block.mediaKind || 'image'} onChange={(event) => onChange({ ...block, mediaKind: event.target.value as CmsBlock['mediaKind'], mediaUrl: '' })}><option value="image">Imagem</option><option value="video">Vídeo</option><option value="audio">Áudio</option></select></label><label className="wide">Item da Biblioteca de mídia<select value={block.mediaUrl || ''} onChange={(event) => onChange({ ...block, mediaUrl: event.target.value })}><option value="">Selecione</option>{library.media.filter((asset) => block.mediaKind === 'video' ? ['mp4','webm'].includes(asset.type) || asset.type.startsWith('video/') : block.mediaKind === 'audio' ? ['mp3','wav','ogg','m4a'].includes(asset.type) || asset.type.startsWith('audio/') : ['png','jpg','jpeg','webp','gif','svg'].includes(asset.type) || asset.type.startsWith('image/')).map((asset) => <option value={asset.url} key={asset.id}>{asset.name}</option>)}</select></label><label className="wide">Legenda ou texto alternativo<input value={block.caption || ''} onChange={(event) => onChange({ ...block, caption: event.target.value })} /></label></>}
    </div>
    {block.type === 'faq' && <FaqCollectionEditor categories={block.faqCategories || ['Geral']} items={block.faqItems || []} onCategoriesChange={(faqCategories) => onChange({ ...block, faqCategories })} onItemsChange={(faqItems) => onChange({ ...block, faqItems })} />}
    {block.type === 'organization' && <OrganizationItemsEditor items={block.organizationItems || []} onChange={(organizationItems) => onChange({ ...block, organizationItems })} />}
    {block.type === 'table' && <TableBlockEditor block={block} onChange={onChange} onDelete={onDelete} />}
  </article>
}

export function CmsPageEditorPage(props: PublicPageProps) {
  const { pageId } = useParams()
  const navigate = useNavigate()
  const existing = pageId === 'nova' ? undefined : pageId?.startsWith('base-')
    ? undefined
    : contentRepository.getSnapshot().pages.find((page) => page.id === pageId)
  const baseSlug = pageId?.startsWith('base-') ? decodeURIComponent(pageId.slice(5)) : ''
  const baseTitle = knownPages.find(([slug]) => slug === baseSlug)?.[1] || ''
  const [page, setPage] = useState<CmsPage>(() => hydrateStructuredBlocks(existing || (
    baseSlug === 'transparencia' ? getTransparencyCmsSeed()
      : baseSlug === 'transparencia/demonstracoes-contabeis' ? getAccountingCmsSeed()
        : baseSlug === 'transparencia/avaliacoes-atuariais' ? getActuarialCmsSeed()
          : baseSlug === 'transparencia/termos-de-credenciamento' ? getAccreditationTermsCmsSeed()
            : baseSlug === 'transparencia/relatorios-de-gestao' ? getManagementReportsCmsSeed()
              : baseSlug === 'transparencia/relatorios-orcamentarios-e-financeiros' ? getBudgetFinancialReportsCmsSeed()
                : baseSlug === 'transparencia/execucao-orcamentaria' ? getBudgetExecutionCmsSeed()
                  : baseSlug === 'fale-conosco/duvidas-frequentes' ? getFaqPageSeed()
                    : getPlanAssisteArticleCmsSeed(baseSlug)
  ) || { ...createCmsPage(baseSlug), title: baseTitle, navigationTitle: baseTitle, status: 'published' }))
  if (pageId !== 'nova' && !existing && !baseSlug) return <Navigate to="/area-da-equipe/administracao-do-portal/paginas" replace />

  function updateBlock(block: CmsBlock) { setPage((current) => ({ ...current, blocks: current.blocks.map((item) => item.id === block.id ? block : item) })) }
  function moveBlock(index: number, direction: -1 | 1) { setPage((current) => { const blocks = [...current.blocks]; const target = index + direction; if (target < 0 || target >= blocks.length) return current; [blocks[index], blocks[target]] = [blocks[target], blocks[index]]; return { ...current, blocks } }) }
  function save(status: CmsPage['status']) { const title = page.title.trim(); const slug = page.slug.trim().replace(/^\/+|\/+$/g, ''); if (!title || !slug) { window.alert('Informe título e endereço da página.'); return } contentRepository.savePage({ ...page, title, navigationTitle: page.navigationTitle.trim() || title, slug, status, updatedAt: new Date().toISOString() }); navigate('/area-da-equipe/administracao-do-portal/paginas') }

  return <AdminFrame {...props} title={existing || baseSlug ? 'Editar página' : 'Nova página'}>
    <section className="simple-page-heading cms-admin-heading"><div><h1>{existing || baseSlug ? 'Editar página' : 'Nova página'}</h1><p>Monte o conteúdo usando blocos responsivos.</p></div><a className="secondary-button" href={publicPath(page.slug)} target="_blank" rel="noreferrer"><Eye /> Pré-visualizar</a></section>
    <section className="cms-page-fields"><label>Título<input value={page.title} onChange={(event) => setPage({ ...page, title: event.target.value })} /></label><label>Título de navegação<input value={page.navigationTitle} onChange={(event) => setPage({ ...page, navigationTitle: event.target.value })} /></label><label>Endereço<input value={page.slug} onChange={(event) => setPage({ ...page, slug: event.target.value })} placeholder="secao/nome-da-pagina" /></label><label>Página-mãe<input value={page.parentSlug || ''} onChange={(event) => setPage({ ...page, parentSlug: event.target.value || null })} placeholder="Opcional: secao/pagina-mae" /></label><label className="wide">Resumo<textarea value={page.summary} onChange={(event) => setPage({ ...page, summary: event.target.value })} /></label></section>
    <div className="cms-editor-grid">{page.blocks.map((block, index) => <BlockEditor block={block} index={index} total={page.blocks.length} key={block.id} onChange={updateBlock} onMove={(direction) => moveBlock(index, direction)} onDelete={() => setPage((current) => ({ ...current, blocks: current.blocks.filter((item) => item.id !== block.id) }))} />)}</div>
    <div className="cms-editor-footer"><button className="secondary-button" type="button" onClick={() => setPage((current) => ({ ...current, blocks: [...current.blocks, createCmsBlock()] }))}><Plus /> Adicionar bloco</button><span /><button className="secondary-button" type="button" onClick={() => navigate('/area-da-equipe/administracao-do-portal/paginas')}><X /> Cancelar edição</button><button className="secondary-button" type="button" onClick={() => save('draft')}><Save /> Salvar rascunho</button><button className="primary-button" type="button" onClick={() => save('published')}><Upload /> Publicar</button></div>
  </AdminFrame>
}

const emptyBanner = (): CmsBanner => ({ id: crypto.randomUUID(), slideshow: 'home', eyebrow: '', title: '', description: '', actionLabel: 'Saiba mais', destination: '', imageUrl: '', alt: '', tone: 'default', startDate: '', endDate: '', order: 1, active: true })

export function CmsBannersPage(props: PublicPageProps) {
  const [content, setContent] = useState(getSiteContent)
  const [editing, setEditing] = useState<CmsBanner | null>(null)
  const [slideshow, setSlideshow] = useState<CmsBanner['slideshow']>('home')
  const [page, setPage] = useState(1)
  function commit(next: typeof content) { setContent(next); saveSiteContent(next) }
  function saveBanner() { if (!editing?.title.trim()) { window.alert('Informe o título do banner.'); return }; const banners = content.banners.some((item) => item.id === editing.id) ? content.banners.map((item) => item.id === editing.id ? editing : item) : [...content.banners, editing]; commit({ ...content, banners }); setEditing(null) }
  const filtered = content.banners.filter((item) => item.slideshow === slideshow).sort((a, b) => a.order - b.order)
  const visible = filtered.slice((page - 1) * adminPageSize, page * adminPageSize)
  return <AdminFrame {...props} title="Slideshows"><section className="simple-page-heading cms-admin-heading"><div><h1>Slides dos perfis</h1><p>Gerencie os slideshows da Home e das áreas de Beneficiário, Credenciado e Equipe.</p></div><button className="primary-button" type="button" onClick={() => setEditing({ ...emptyBanner(), slideshow })}><Plus /> Novo slide</button></section><label className="cms-library-search cms-library-filter">Slideshow<select value={slideshow} onChange={(event) => { setSlideshow(event.target.value as CmsBanner['slideshow']); setPage(1) }}><option value="home">Home pública</option><option value="beneficiary">Área do beneficiário</option><option value="provider">Área do credenciado</option><option value="team">Área da equipe</option></select></label>
    {editing && <section className="cms-management-form"><header><h2>{content.banners.some((item) => item.id === editing.id) ? 'Editar slide' : 'Novo slide'}</h2><button type="button" onClick={() => setEditing(null)} title="Fechar"><X /></button></header><div className="cms-page-fields"><label>Slideshow<select value={editing.slideshow} onChange={(event) => setEditing({ ...editing, slideshow: event.target.value as CmsBanner['slideshow'] })}><option value="home">Home</option><option value="beneficiary">Beneficiário</option><option value="provider">Credenciado</option><option value="team">Equipe</option></select></label><label>Chamada superior<input value={editing.eyebrow} onChange={(event) => setEditing({ ...editing, eyebrow: event.target.value })} /></label><label className="wide">Título<input value={editing.title} onChange={(event) => setEditing({ ...editing, title: event.target.value })} /></label><label className="wide">Descrição<textarea value={editing.description} onChange={(event) => setEditing({ ...editing, description: event.target.value })} /></label><label>Texto do botão<input value={editing.actionLabel} onChange={(event) => setEditing({ ...editing, actionLabel: event.target.value })} /></label><label>Destino<input value={editing.destination} onChange={(event) => setEditing({ ...editing, destination: event.target.value })} /></label><label className="wide">Imagem<select value={editing.imageUrl} onChange={(event) => setEditing({ ...editing, imageUrl: event.target.value })}><option value="">Sem imagem</option>{content.media.filter((asset) => ['png','jpg','jpeg','webp','gif','svg'].includes(asset.type) || asset.type.startsWith('image/')).map((asset) => <option value={asset.url} key={asset.id}>{asset.name}</option>)}</select></label><label className="wide">Texto alternativo<input value={editing.alt} onChange={(event) => setEditing({ ...editing, alt: event.target.value })} /></label><label>Tom visual<select value={editing.tone} onChange={(event) => setEditing({ ...editing, tone: event.target.value })}><option value="default">Padrão</option><option value="green">Verde</option><option value="teal">Azul-petróleo</option><option value="blue">Azul</option></select></label><label>Ordem<input type="number" min="1" value={editing.order} onChange={(event) => setEditing({ ...editing, order: Number(event.target.value) })} /></label><label>Início<input type="date" lang="pt-BR" value={editing.startDate} onChange={(event) => setEditing({ ...editing, startDate: event.target.value })} /></label><label>Fim<input type="date" lang="pt-BR" value={editing.endDate} onChange={(event) => setEditing({ ...editing, endDate: event.target.value })} /></label><label>Status<select value={editing.active ? 'active' : 'inactive'} onChange={(event) => setEditing({ ...editing, active: event.target.value === 'active' })}><option value="active">Ativo</option><option value="inactive">Inativo</option></select></label></div><button className="primary-button" type="button" onClick={saveBanner}><Save /> Salvar slide</button></section>}
    <div className="portal-table-wrap"><table className="portal-table"><thead><tr><th>Ordem</th><th>Título</th><th>Botão</th><th>Período</th><th>Status</th><th>Ações</th></tr></thead><tbody>{visible.map((banner) => <tr key={banner.id}><td>{banner.order}</td><td>{banner.title}</td><td>{banner.actionLabel}</td><td>{banner.startDate || 'Sempre'} a {banner.endDate || 'sem término'}</td><td>{banner.active ? 'Ativo' : 'Inativo'}</td><td><div className="cms-table-actions"><button type="button" onClick={() => setEditing(banner)}><Pencil /> Editar</button><button type="button" onClick={() => { if (window.confirm('Excluir este slide?')) commit({ ...content, banners: content.banners.filter((item) => item.id !== banner.id), deletedBannerIds: [...new Set([...content.deletedBannerIds, banner.id])] }) }}><Trash2 /> Excluir</button></div></td></tr>)}</tbody></table></div><AdminPagination page={page} total={filtered.length} onChange={setPage} />
  </AdminFrame>
}

export function CmsMediaPage(props: PublicPageProps) {
  const [content, setContent] = useState(getSiteContent)
  const [page, setPage] = useState(1)
  async function upload(event: ChangeEvent<HTMLInputElement>) { const files = Array.from(event.target.files || []); const oversized = files.find((file) => file.size > 1_000_000); if (oversized) { window.alert(`${oversized.name} excede 1 MB, limite desta demonstração.`); return }; const additions = await Promise.all(files.map((file) => new Promise<(typeof content.media)[number]>((resolve) => { const reader = new FileReader(); reader.onload = () => resolve({ id: crypto.randomUUID(), name: file.name, type: file.type || 'application/octet-stream', size: file.size, url: String(reader.result), createdAt: new Date().toISOString() }); reader.readAsDataURL(file) }))); const next = { ...content, media: [...content.media, ...additions] }; setContent(next); saveSiteContent(next); event.target.value = '' }
  async function replace(asset: (typeof content.media)[number], file?: File) { if (!file || file.size > 1_000_000) { if (file) window.alert('O arquivo excede 1 MB.'); return }; const reader = new FileReader(); reader.onload = () => { const url = String(reader.result); replaceAssetReferences(asset.url, url); const next = { ...content, media: content.media.map((item) => item.id === asset.id ? { ...item, name: file.name, type: file.type, size: file.size, url, createdAt: new Date().toISOString(), bundled: false } : item), banners: content.banners.map((item) => item.imageUrl === asset.url ? { ...item, imageUrl: url } : item), news: content.news.map((item) => item.coverUrl === asset.url ? { ...item, coverUrl: url } : item) }; setContent(next); saveSiteContent(next) }; reader.readAsDataURL(file) }
  function remove(id: string) { if (!window.confirm('Excluir este arquivo da biblioteca? Referências existentes poderão deixar de funcionar.')) return; const next = { ...content, media: content.media.filter((asset) => asset.id !== id) }; setContent(next); saveSiteContent(next) }
  const visible = content.media.slice((page - 1) * adminPageSize, page * adminPageSize)
  return <AdminFrame {...props} title="Mídia"><section className="simple-page-heading cms-admin-heading"><div><h1>Biblioteca de mídia</h1><p>Hospede e reutilize imagens, vídeos e áudios nos conteúdos do portal.</p></div><label className="primary-button cms-upload-button"><Upload /> Enviar mídia<input hidden multiple type="file" accept="image/*,video/*,audio/*" onChange={upload} /></label></section><p className="cms-demo-limit">O acervo incorporado ao site é catalogado automaticamente. Novos itens de demonstração podem ter até 1 MB.</p><div className="cms-media-grid">{visible.map((asset) => <article key={asset.id}><MediaPreview asset={asset} /><div><strong>{asset.name}</strong><small>{asset.type} · {(asset.size / 1024).toFixed(1)} KB</small></div><div><a href={asset.url} target="_blank" rel="noreferrer"><Eye /> Abrir</a><label className="cms-replace-button"><Upload /> Substituir<input hidden type="file" accept="image/*,video/*,audio/*" onChange={(event) => replace(asset, event.target.files?.[0])} /></label>{!asset.bundled && <button type="button" onClick={() => remove(asset.id)}><Trash2 /> Excluir</button>}</div></article>)}</div><AdminPagination page={page} total={content.media.length} onChange={setPage} /></AdminFrame>
}

export function CmsFilesPage(props: PublicPageProps) {
  const [content, setContent] = useState(getSiteContent)
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  async function upload(event: ChangeEvent<HTMLInputElement>) { const files = Array.from(event.target.files || []); const oversized = files.find((file) => file.size > 1_000_000); if (oversized) { window.alert(`${oversized.name} excede 1 MB, limite desta demonstração.`); return }; const additions = await Promise.all(files.map((file) => new Promise<(typeof content.files)[number]>((resolve) => { const reader = new FileReader(); reader.onload = () => resolve({ id: crypto.randomUUID(), name: file.name, type: file.type || file.name.split('.').at(-1) || 'arquivo', size: file.size, url: String(reader.result), createdAt: new Date().toISOString() }); reader.readAsDataURL(file) }))); const next = { ...content, files: [...content.files, ...additions] }; setContent(next); saveSiteContent(next); event.target.value = '' }
  function remove(id: string) { if (!window.confirm('Excluir este arquivo enviado?')) return; const next = { ...content, files: content.files.filter((asset) => asset.id !== id) }; setContent(next); saveSiteContent(next) }
  async function replace(asset: (typeof content.files)[number], file?: File) { if (!file || file.size > 1_000_000) { if (file) window.alert('O arquivo excede 1 MB.'); return }; const reader = new FileReader(); reader.onload = () => { const url = String(reader.result); replaceAssetReferences(asset.url, url); const next = { ...content, files: content.files.map((item) => item.id === asset.id ? { ...item, name: file.name, type: file.type || file.name.split('.').at(-1) || 'arquivo', size: file.size, url, createdAt: new Date().toISOString(), bundled: false } : item) }; setContent(next); saveSiteContent(next) }; reader.readAsDataURL(file) }
  const visible = content.files.filter((asset) => asset.name.toLowerCase().includes(query.toLowerCase()) || asset.url.toLowerCase().includes(query.toLowerCase()))
  const paginated = visible.slice((page - 1) * adminPageSize, page * adminPageSize)
  return <AdminFrame {...props} title="Arquivos"><section className="simple-page-heading cms-admin-heading"><div><h1>Biblioteca de arquivos</h1><p>Acervo de PDFs, planilhas, documentos de texto e demais arquivos publicados no site.</p></div><label className="primary-button cms-upload-button"><Upload /> Enviar arquivos<input hidden multiple type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.csv,.odt,.ods,.txt" onChange={upload} /></label></section><label className="cms-library-search">Buscar no acervo<input type="search" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1) }} placeholder="Nome ou caminho do arquivo" /></label><div className="portal-table-wrap"><table className="portal-table"><thead><tr><th>Arquivo</th><th>Tipo</th><th>Tamanho</th><th>Caminho</th><th>Ações</th></tr></thead><tbody>{paginated.map((asset) => <tr key={asset.id}><td>{asset.name}</td><td>{asset.type.toUpperCase()}</td><td>{(asset.size / 1024).toFixed(1)} KB</td><td><code>{asset.url.startsWith('data:') ? 'Armazenado no navegador' : asset.url}</code></td><td><div className="cms-table-actions"><a href={asset.url} target="_blank" rel="noreferrer"><Eye /> Abrir</a><label className="cms-replace-button"><Upload /> Substituir<input hidden type="file" onChange={(event) => replace(asset, event.target.files?.[0])} /></label>{!asset.bundled && <button type="button" onClick={() => remove(asset.id)}><Trash2 /> Excluir</button>}</div></td></tr>)}</tbody></table></div><AdminPagination page={page} total={visible.length} onChange={setPage} /><p className="cms-demo-limit">{visible.length} arquivo(s) encontrado(s). O catálogo é regenerado automaticamente no build.</p></AdminFrame>
}

const emptyNews = (category: string): CmsNewsItem => ({ id: crypto.randomUUID(), title: '', summary: '', category, author: '', publishDate: new Date().toISOString().slice(0, 10), status: 'draft', audience: 'Ambos', scope: 'Nacional', coverUrl: '', bodyImageUrl: '', content: '', updatedAt: new Date().toISOString() })


function NewsImagePicker({ label, value, images, onSelect, onUpload }: { label: string, value: string, images: CmsMediaAsset[], onSelect: (url: string) => void, onUpload: (file: File) => void }) {
  const options: ComboboxOption[] = [{ value: '', label: 'Sem imagem' }, ...images.map((asset) => ({ value: asset.url, label: asset.name }))]
  function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) { window.alert('Selecione um arquivo de imagem (PNG, JPG, WEBP, GIF ou SVG).'); return }
    if (file.size > 1_000_000) { window.alert('Na demonstração local, use imagens de até 1 MB.'); return }
    onUpload(file)
  }
  return <label>
    {label}
    <Combobox value={value} options={options} onSelect={onSelect} placeholder="Digite para buscar uma imagem" />
    <label className="secondary-button cms-upload-button">
      <Upload /> Enviar nova imagem
      <input hidden type="file" accept="image/*" onChange={handleUpload} />
    </label>
  </label>
}

export function CmsNewsPage(props: PublicPageProps) {
  const [site, setSite] = useState(getSiteContent)
  const [editing, setEditing] = useState<CmsNewsItem | null>(null)
  const [newCategory, setNewCategory] = useState('')
  const [page, setPage] = useState(1)
  const normalizeCategory = (value: string) => { const text = value.trim().toLocaleLowerCase('pt-BR'); return text ? text.charAt(0).toLocaleUpperCase('pt-BR') + text.slice(1) : '' }
  function commit(next: typeof site) { setSite(next); saveSiteContent(next) }
  function saveNews() { if (!editing?.title.trim() || !editing.category || !editing.publishDate) { window.alert('Informe título, categoria e data de publicação da notícia.'); return }; const value = { ...editing, updatedAt: new Date().toISOString() }; const news = site.news.some((item) => item.id === value.id) ? site.news.map((item) => item.id === value.id ? value : item) : [...site.news, value]; commit({ ...site, news, deletedNewsIds: site.deletedNewsIds.filter((id) => id !== value.id) }); setEditing(null) }
  const newsImages = site.media.filter((asset) => isImageAsset(asset.type))
  function uploadNewsImage(file: File, apply: (url: string) => void) {
    const reader = new FileReader()
    reader.onload = () => {
      const asset: CmsMediaAsset = { id: crypto.randomUUID(), name: file.name, type: file.type, size: file.size, url: String(reader.result), createdAt: new Date().toISOString() }
      commit({ ...site, media: [...site.media, asset] })
      apply(asset.url)
    }
    reader.readAsDataURL(file)
  }
  const visibleNews = site.news.slice((page - 1) * adminPageSize, page * adminPageSize)
  function renameCategory(category: string) { const value = normalizeCategory(window.prompt('Novo nome da categoria:', category) || ''); if (!value || value === category || site.newsCategories.some((item) => item.toLocaleLowerCase('pt-BR') === value.toLocaleLowerCase('pt-BR'))) return; commit({ ...site, newsCategories: site.newsCategories.map((item) => item === category ? value : item), news: site.news.map((item) => item.category === category ? { ...item, category: value } : item) }) }
  return <AdminFrame {...props} title="Notícias"><section className="simple-page-heading cms-admin-heading"><div><h1>Gestão de notícias</h1><p>Crie, edite, categorize, publique ou retire notícias do portal.</p></div><button className="primary-button" type="button" onClick={() => setEditing(emptyNews(site.newsCategories[0] || 'Geral'))}><Plus /> Nova notícia</button></section><section className="cms-category-manager"><h2>Categorias</h2><div className="cms-category-list">{site.newsCategories.map((category) => <span key={category}>{category}<button type="button" title="Renomear categoria e atualizar notícias" onClick={() => renameCategory(category)}><Pencil /></button><button type="button" title="Excluir categoria" onClick={() => { if (site.news.some((item) => item.category === category)) { window.alert('Altere a categoria das notícias vinculadas antes de excluí-la.'); return }; commit({ ...site, newsCategories: site.newsCategories.filter((item) => item !== category) }) }}><Trash2 /></button></span>)}</div><div className="cms-category-add"><input value={newCategory} onChange={(event) => setNewCategory(event.target.value)} placeholder="Nova categoria" /><button className="secondary-button" type="button" onClick={() => { const value = normalizeCategory(newCategory); if (value && !site.newsCategories.some((item) => item.toLocaleLowerCase('pt-BR') === value.toLocaleLowerCase('pt-BR'))) { commit({ ...site, newsCategories: [...site.newsCategories, value] }); setNewCategory('') } }}><Plus /> Adicionar</button></div></section>
    {editing && <section className="cms-management-form"><header><h2>{site.news.some((item) => item.id === editing.id) ? 'Editar notícia' : 'Nova notícia'}</h2><button type="button" onClick={() => setEditing(null)} title="Cancelar edição"><X /></button></header><div className="cms-page-fields"><label className="wide">Título<input value={editing.title} onChange={(event) => setEditing({ ...editing, title: event.target.value })} /></label><label className="wide">Resumo<textarea value={editing.summary} onChange={(event) => setEditing({ ...editing, summary: event.target.value })} /></label><label>Categoria<Combobox value={editing.category} options={site.newsCategories.map((category) => ({ value: category, label: category }))} onSelect={(category) => setEditing({ ...editing, category })} placeholder="Digite para buscar uma categoria" /></label><label>Autor<input value={editing.author} onChange={(event) => setEditing({ ...editing, author: event.target.value })} /></label><label>Publicação<input type="date" lang="pt-BR" value={editing.publishDate} onChange={(event) => setEditing({ ...editing, publishDate: event.target.value })} /></label><label>Status<select value={editing.status} onChange={(event) => setEditing({ ...editing, status: event.target.value as CmsNewsItem['status'] })}><option value="draft">Rascunho</option><option value="published">Publicada</option></select></label><label>Público<select value={editing.audience} onChange={(event) => setEditing({ ...editing, audience: event.target.value })}><option>Ambos</option><option>Beneficiários</option><option>Credenciados</option><option>Equipe</option></select></label><label>Abrangência<select value={editing.scope} onChange={(event) => setEditing({ ...editing, scope: event.target.value })}><option>Nacional</option><option>Regional</option></select></label><NewsImagePicker label="Imagem de capa" value={editing.coverUrl} images={newsImages} onSelect={(coverUrl) => setEditing({ ...editing, coverUrl })} onUpload={(file) => uploadNewsImage(file, (coverUrl) => setEditing((current) => current && { ...current, coverUrl }))} /><NewsImagePicker label="Imagem interna da notícia" value={editing.bodyImageUrl} images={newsImages} onSelect={(bodyImageUrl) => setEditing({ ...editing, bodyImageUrl })} onUpload={(file) => uploadNewsImage(file, (bodyImageUrl) => setEditing((current) => current && { ...current, bodyImageUrl }))} /><label className="wide">Conteúdo<RichTextEditor value={editing.content} onChange={(content) => setEditing({ ...editing, content })} minHeight={220} /></label></div><div className="cms-editor-footer"><span /><button className="secondary-button" type="button" onClick={() => setEditing(null)}><X /> Cancelar edição</button><button className="primary-button" type="button" onClick={saveNews}><Save /> Salvar notícia</button></div></section>}
    <div className="portal-table-wrap"><table className="portal-table"><thead><tr><th>Título</th><th>Categoria</th><th>Autor</th><th>Publicação</th><th>Status</th><th>Ações</th></tr></thead><tbody>{visibleNews.map((item) => <tr key={item.id}><td>{item.title}</td><td>{item.category}</td><td>{item.author || '—'}</td><td>{formatBrazilianDate(item.publishDate)}</td><td>{item.status === 'published' ? 'Publicada' : 'Rascunho'}</td><td><div className="cms-table-actions"><button type="button" onClick={() => setEditing(item)}><Pencil /> Editar</button><button type="button" onClick={() => { if (window.confirm('Excluir esta notícia?')) commit({ ...site, news: site.news.filter((news) => news.id !== item.id), deletedNewsIds: [...new Set([...site.deletedNewsIds, item.id])] }) }}><Trash2 /> Excluir</button></div></td></tr>)}</tbody></table></div><AdminPagination page={page} total={site.news.length} onChange={setPage} />
  </AdminFrame>
}

export function CmsContactPage(props: PublicPageProps) {
  const [content, setContent] = useState(getSiteContent)
  const [editingSocial, setEditingSocial] = useState<CmsSocialLink | null>(null)
  const [editingChannel, setEditingChannel] = useState<CmsContactChannel | null>(null)
  const [editingAddress, setEditingAddress] = useState<CmsAddress | null>(null)
  function commit(next: typeof content) { setContent(next); saveSiteContent(next) }
  function saveSocial() { if (!editingSocial) return; commit({ ...content, socialLinks: content.socialLinks.map((item) => item.id === editingSocial.id ? editingSocial : item) }); setEditingSocial(null) }
  function saveChannel() { if (!editingChannel?.value.trim()) { window.alert('Informe o número do contato.'); return }; commit({ ...content, contactChannels: content.contactChannels.map((item) => item.id === editingChannel.id ? editingChannel : item) }); setEditingChannel(null) }
  function saveAddress() { if (!editingAddress?.label.trim()) { window.alert('Informe o nome da unidade.'); return }; commit({ ...content, addresses: content.addresses.map((item) => item.id === editingAddress.id ? editingAddress : item) }); setEditingAddress(null) }
  const socialLinks = [...content.socialLinks].sort((a, b) => a.order - b.order)
  const channels = [...content.contactChannels].sort((a, b) => a.order - b.order)
  const addresses = [...content.addresses].sort((a, b) => a.order - b.order)
  return <AdminFrame {...props} title="Contatos institucionais">
    <section className="simple-page-heading cms-admin-heading"><div><h1>Contatos institucionais</h1><p>Atualize telefones, redes sociais e endereços exibidos no cabeçalho e no rodapé de todo o site.</p></div></section>

    <section className="cms-contact-section">
      <h2><Globe2 aria-hidden="true" /> Redes sociais</h2>
      <p>Informe o link real de cada rede. Redes sem link cadastrado ou marcadas como inativas deixam de aparecer no site.</p>
      {editingSocial && <section className="cms-management-form"><header><h2>Editar {editingSocial.label}</h2><button type="button" onClick={() => setEditingSocial(null)} title="Fechar"><X /></button></header>
        <div className="cms-page-fields">
          <label className="wide">Link<input type="url" value={editingSocial.url} onChange={(event) => setEditingSocial({ ...editingSocial, url: event.target.value })} placeholder="https://" /></label>
          <label>Status<select value={editingSocial.active ? 'active' : 'inactive'} onChange={(event) => setEditingSocial({ ...editingSocial, active: event.target.value === 'active' })}><option value="active">Ativo</option><option value="inactive">Inativo</option></select></label>
        </div>
        <button className="primary-button" type="button" onClick={saveSocial}><Save /> Salvar rede social</button>
      </section>}
      <div className="portal-table-wrap"><table className="portal-table"><thead><tr><th>Rede</th><th>Link</th><th>Status</th><th>Ações</th></tr></thead><tbody>{socialLinks.map((item) => <tr key={item.id}><td>{item.label}</td><td>{item.url ? <code>{item.url}</code> : 'Sem link cadastrado'}</td><td>{item.active ? 'Ativo' : 'Inativo'}</td><td><div className="cms-table-actions"><button type="button" onClick={() => setEditingSocial(item)}><Pencil /> Editar</button></div></td></tr>)}</tbody></table></div>
    </section>

    <section className="cms-contact-section">
      <h2><Phone aria-hidden="true" /> Telefones e WhatsApp</h2>
      {editingChannel && <section className="cms-management-form"><header><h2>Editar contato</h2><button type="button" onClick={() => setEditingChannel(null)} title="Fechar"><X /></button></header>
        <div className="cms-page-fields">
          <label>Rótulo<input value={editingChannel.label} onChange={(event) => setEditingChannel({ ...editingChannel, label: event.target.value })} /></label>
          <label>Número<input value={editingChannel.value} onChange={(event) => setEditingChannel({ ...editingChannel, value: event.target.value })} /></label>
          <label>Status<select value={editingChannel.active ? 'active' : 'inactive'} onChange={(event) => setEditingChannel({ ...editingChannel, active: event.target.value === 'active' })}><option value="active">Ativo</option><option value="inactive">Inativo</option></select></label>
        </div>
        <button className="primary-button" type="button" onClick={saveChannel}><Save /> Salvar contato</button>
      </section>}
      <div className="portal-table-wrap"><table className="portal-table"><thead><tr><th>Rótulo</th><th>Número</th><th>Status</th><th>Ações</th></tr></thead><tbody>{channels.map((item) => <tr key={item.id}><td>{item.label}</td><td>{item.value}</td><td>{item.active ? 'Ativo' : 'Inativo'}</td><td><div className="cms-table-actions"><button type="button" onClick={() => setEditingChannel(item)}><Pencil /> Editar</button></div></td></tr>)}</tbody></table></div>
    </section>

    <section className="cms-contact-section">
      <h2><MapPin aria-hidden="true" /> Endereços e unidades</h2>
      {editingAddress && <section className="cms-management-form"><header><h2>Editar unidade</h2><button type="button" onClick={() => setEditingAddress(null)} title="Fechar"><X /></button></header>
        <div className="cms-page-fields">
          <label className="wide">Nome da unidade<input value={editingAddress.label} onChange={(event) => setEditingAddress({ ...editingAddress, label: event.target.value })} /></label>
          <label>Observação<input value={editingAddress.note} onChange={(event) => setEditingAddress({ ...editingAddress, note: event.target.value })} placeholder="Ex.: (exceto Brasília)" /></label>
          <label>Telefone<input value={editingAddress.phone} onChange={(event) => setEditingAddress({ ...editingAddress, phone: event.target.value })} placeholder="(00) 0000-0000" /></label>
          <label>E-mail<input type="email" value={editingAddress.email} onChange={(event) => setEditingAddress({ ...editingAddress, email: event.target.value })} /></label>
          <label className="wide">Endereço completo<textarea value={editingAddress.detail} onChange={(event) => setEditingAddress({ ...editingAddress, detail: event.target.value })} placeholder="Rua, número, bairro, cidade/UF, CEP" /></label>
          <label>Status<select value={editingAddress.active ? 'active' : 'inactive'} onChange={(event) => setEditingAddress({ ...editingAddress, active: event.target.value === 'active' })}><option value="active">Ativo</option><option value="inactive">Inativo</option></select></label>
        </div>
        <button className="primary-button" type="button" onClick={saveAddress}><Save /> Salvar unidade</button>
      </section>}
      <div className="portal-table-wrap"><table className="portal-table"><thead><tr><th>Unidade</th><th>Telefone</th><th>E-mail</th><th>Endereço</th><th>Status</th><th>Ações</th></tr></thead><tbody>{addresses.map((item) => <tr key={item.id}><td>{item.label}{item.note && <small> {item.note}</small>}</td><td>{item.phone || '—'}</td><td>{item.email || '—'}</td><td>{item.detail || '—'}</td><td>{item.active ? 'Ativo' : 'Inativo'}</td><td><div className="cms-table-actions"><button type="button" onClick={() => setEditingAddress(item)}><Pencil /> Editar</button></div></td></tr>)}</tbody></table></div>
    </section>
  </AdminFrame>
}
