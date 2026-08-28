import { ArrowRight, CalendarDays, CheckCircle2, ChevronRight, Copy, Download, ExternalLink, FileText, HelpCircle, Pencil, Search } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCmsSnapshot, type CmsBlock, type CmsPage } from '../cms/contentRepository'
import { renderCmsIcon } from '../cms/iconCatalog'
import { caminhoDoSlug } from '../cms/portalNavegacao'
import { InlineLinkedText } from './InlineLinkedText'
import { stripHtml } from '../utils/html'
import { incorporacaoDoYoutube } from '../cms/youtube'
import { htmlSeguro } from '../utils/htmlSeguro'
import { ConteudosRelacionados } from './ConteudosRelacionados'
import { CmsGaleria } from './CmsGaleria'

/**
 * Vídeo do YouTube dentro da página. Se o endereço guardado não for do YouTube,
 * a página avisa em vez de exibir um quadro vazio.
 */
function YoutubeIncorporado({ url, titulo }: { url: string, titulo: string }) {
  const incorporacao = incorporacaoDoYoutube(url)
  if (!incorporacao) return <p className="cms-youtube-invalido">Vídeo do YouTube não configurado: o endereço informado não é reconhecido.</p>
  return (
    <div className="cms-youtube">
      <iframe
        src={incorporacao}
        title={titulo}
        loading="lazy"
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  )
}

function CmsFaqBlock({ block, className }: { block: CmsBlock, className: string }) {
  const categories = block.faqCategories || ['Geral']
  const [selected, setSelected] = useState('Todas')
  const visible = (block.faqItems || []).filter((item) => selected === 'Todas' || item.category === selected)
  return <section className={`${className} cms-faq-block`}>{block.title && <h2>{block.title}</h2>}<div className="filter-buttons support-faq-filters topic-filter-buttons"><button type="button" className={selected === 'Todas' ? 'selected' : undefined} onClick={() => setSelected('Todas')}>Todas</button>{categories.map((category) => <button type="button" className={selected === category ? 'selected' : undefined} onClick={() => setSelected(category)} key={category}>{category}</button>)}</div><div className="support-faq-list">{visible.map((item) => <details key={`${item.category}-${item.question}`}><summary><HelpCircle aria-hidden="true" /> {item.question}</summary><p><InlineLinkedText text={item.answer} /></p></details>)}</div></section>
}

function CmsOrganizationBlock({ block, className }: { block: CmsBlock, className: string }) {
  const counters: number[] = []
  const items = (block.organizationItems || []).map((item, index, all) => {
    const level = Math.max(1, Math.min(item.level, index === 0 ? 1 : all[index - 1].level + 1)); counters.length = level; counters[level - 1] = (counters[level - 1] || 0) + 1; for (let depth = 0; depth < level - 1; depth += 1) counters[depth] ||= 1
    return { ...item, level, number: counters.join('.') }
  })
  type Node = (typeof items)[number] & { children: Node[] }
  const roots: Node[] = []; const stack: Node[] = []
  items.forEach((item) => { const node: Node = { ...item, children: [] }; while (stack.length >= node.level) stack.pop(); const parent = stack.at(-1); if (parent) parent.children.push(node); else roots.push(node); stack.push(node) })
  const expandableIds = roots.flatMap(function collect(node: Node): string[] { return node.children.length ? [node.id, ...node.children.flatMap(collect)] : [] })
  const [query, setQuery] = useState('')
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set(window.matchMedia('(min-width: 901px)').matches ? expandableIds : []))
  const [copiedEmail, setCopiedEmail] = useState('')
  function filter(nodes: Node[]): Node[] { const term = query.trim().toLocaleLowerCase('pt-BR'); if (!term) return nodes; return nodes.flatMap((node) => { const children = filter(node.children); const text = [node.number, node.acronym, node.label, node.responsible, node.email].filter(Boolean).join(' ').toLocaleLowerCase('pt-BR'); return text.includes(term) || children.length ? [{ ...node, children }] : [] }) }
  const visibleRoots = filter(roots)
  function toggle(id: string) { setOpenIds((current) => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next }) }
  async function copyEmail(email: string) { await navigator.clipboard.writeText(email); setCopiedEmail(email); window.setTimeout(() => setCopiedEmail(''), 1600) }
  function render(nodes: Node[], root = false) { return <div className="org-hierarchy-children" role={root ? 'tree' : 'group'}>{nodes.map((node) => { const hasChildren = node.children.length > 0; const isOpen = query.trim() ? hasChildren : openIds.has(node.id); return <div className="org-hierarchy-node" role="treeitem" aria-level={node.level} aria-expanded={hasChildren ? isOpen : undefined} key={node.id}><div className={`org-hierarchy-row is-level-${Math.min(node.level, 5)}${hasChildren ? ' has-children' : ''}`}>{hasChildren && <button className="org-hierarchy-toggle" type="button" aria-expanded={isOpen} aria-label={`${isOpen ? 'Contrair' : 'Expandir'} ${node.label}`} onClick={() => toggle(node.id)}><ChevronRight className="org-hierarchy-chevron" aria-hidden="true" /></button>}<span className="org-hierarchy-content"><span className="org-hierarchy-meta"><span className="org-hierarchy-number">{node.number}</span>{node.acronym && <span className="org-hierarchy-acronym">{node.acronym}</span>}</span><span className="org-hierarchy-label">{node.label}</span>{(node.responsible || node.email) && <span className="org-hierarchy-contact">{node.responsible && <span>{node.responsible}</span>}{node.email && <span className="org-hierarchy-email"><a className="portal-email-link" href={`mailto:${node.email}`}>{node.email}</a><button type="button" onClick={() => copyEmail(node.email!)} aria-label={`Copiar e-mail ${node.email}`} title="Copiar e-mail">{copiedEmail === node.email ? <CheckCircle2 aria-hidden="true" /> : <Copy aria-hidden="true" />}</button></span>}</span>}</span></div>{hasChildren && isOpen && render(node.children)}</div> })}</div> }
  return <section className={`${className} cms-organization-block`}>{block.title && <h2>{block.title}</h2>}<section className="org-hierarchy-list" aria-label="Estrutura administrativa em accordion"><div className="org-hierarchy-toolbar"><strong>Programa de Saúde e Assistência Social do MPU (SEPLAN)</strong><div><button type="button" onClick={() => setOpenIds(new Set(expandableIds))}>Expandir tudo</button><button type="button" onClick={() => setOpenIds(new Set())}>Contrair tudo</button></div></div><label className="org-hierarchy-search"><span>Buscar no organograma</span><span className="field-with-icon"><Search aria-hidden="true" /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Setor, sigla, servidor, e-mail ou número" /></span></label>{visibleRoots.length ? render(visibleRoots, true) : <p className="org-hierarchy-empty" role="status">Nenhuma unidade encontrada.</p>}</section></section>
}

export function CmsBlockRenderer({ block }: { block: CmsBlock }) {
  const className = `cms-public-block cms-width-${block.width.replace('/', '-')}`
  if (block.type === 'faq') return <CmsFaqBlock block={block} className={className} />
  if (block.type === 'organization') return <CmsOrganizationBlock block={block} className={className} />
  if (block.type === 'rich-text') return (
    <section className={className}>
      {block.title && <h2>{block.title}</h2>}
      <div className="cms-rich-content" dangerouslySetInnerHTML={htmlSeguro(block.content)} />
    </section>
  )
  if (block.type === 'card') return (
    <article className={`${className} cms-card cms-card-${block.cardVariant || 'navigation'}`}>
      {block.cardVariant === 'actuarial' && <div className="actuarial-card-top"><FileText aria-hidden="true" />{block.badge && <span className="actuarial-year">{block.badge}</span>}</div>}
      {block.cardVariant !== 'actuarial' && block.icon !== 'none' && renderCmsIcon(block.icon, 'cms-card-icon')}
      {block.title && <h2>{block.title}</h2>}
      {block.meta && <p className={block.cardVariant === 'actuarial' ? 'actuarial-period' : 'cms-card-meta'}>{block.cardVariant === 'actuarial' && <CalendarDays aria-hidden="true" />}{block.meta}</p>}
      <p className="cms-plain-content">{stripHtml(block.content)}</p>
      {block.href && (block.href.startsWith('/')
        ? <Link className={block.cardVariant === 'actuarial' || block.cardVariant === 'operational' ? 'primary-button' : 'text-link'} to={block.href}>{block.buttonLabel || 'Abrir página'} <ArrowRight aria-hidden="true" /></Link>
        : <a className={block.cardVariant === 'actuarial' || block.cardVariant === 'operational' ? 'primary-button' : 'text-link'} href={block.href} target="_blank" rel="noreferrer">{block.buttonLabel || 'Abrir'} <ExternalLink aria-hidden="true" /></a>)}
    </article>
  )
  if (block.type === 'table') return <section className={className}>{block.title && <h2>{block.title}</h2>}<div className="portal-table-wrap"><table className={`portal-table cms-table-${block.tableVariant || 'standard'}`}><thead><tr>{(block.tableHeaders || []).map((header, index) => <th key={index}>{header}</th>)}</tr></thead><tbody>{(block.tableRows || []).map((row, rowIndex) => <tr key={rowIndex}>{(block.tableHeaders || []).map((_, columnIndex) => <td key={columnIndex}>{row[columnIndex]}</td>)}</tr>)}</tbody></table></div></section>
  if (block.type === 'button') return <div className={`${className} cms-button-block`}>{block.href?.startsWith('/') ? <Link className={block.buttonVariant === 'link' ? 'text-link' : block.buttonVariant === 'secondary' ? 'secondary-button' : 'primary-button'} to={block.href}>{block.buttonLabel || 'Abrir'} <ArrowRight /></Link> : <a className={block.buttonVariant === 'link' ? 'text-link' : block.buttonVariant === 'secondary' ? 'secondary-button' : 'primary-button'} href={block.href || '#'} target="_blank" rel="noreferrer">{block.buttonLabel || 'Abrir'} <ExternalLink /></a>}</div>
  if (block.type === 'gallery') return (
    <section className={className}>
      {block.title && <h2>{block.title}</h2>}
      <CmsGaleria itens={block.galleryItems || []} autoplay={block.galleryAutoplay} titulo={block.title} />
    </section>
  )
  if (block.type === 'media') {
    const lado = block.mediaLayout === 'left' || block.mediaLayout === 'right'
    const midia = block.mediaKind === 'youtube'
      ? <YoutubeIncorporado url={block.mediaUrl || ''} titulo={block.title || block.caption || 'Vídeo do YouTube'} />
      : block.mediaKind === 'video' ? <video src={block.mediaUrl} controls preload="metadata" />
      : block.mediaKind === 'audio' ? <audio src={block.mediaUrl} controls preload="metadata" />
      : <img src={block.mediaUrl} alt={block.caption || ''} />

    if (lado) {
      return (
        <section className={`${className} cms-media-lado is-${block.mediaLayout}`}>
          {block.title && <h2>{block.title}</h2>}
          <div className="cms-media-lado-corpo">
            <div className="cms-media-lado-figura">
              {midia}
              {block.caption && <small>{block.caption}</small>}
            </div>
            <div className="cms-media-lado-texto cms-rich-content" dangerouslySetInnerHTML={htmlSeguro(block.content)} />
          </div>
        </section>
      )
    }

    return (
      <figure className={`${className} cms-public-media`}>
        {block.title && <h2>{block.title}</h2>}
        {midia}
        {block.caption && <figcaption>{block.caption}</figcaption>}
      </figure>
    )
  }
  if (block.type === 'document') return (
    <section className={className}>
      {block.title && <h2>{block.title}</h2>}
      <p className="cms-plain-content">{stripHtml(block.content)}</p>
      {block.href && <a className="primary-button" href={block.href} download><Download aria-hidden="true" /> {block.buttonLabel || 'Baixar arquivo'}</a>}
    </section>
  )
  return (
    <aside className={`${className} cms-notice`}>
      {block.title && <strong>{block.title}</strong>}
      <p className="cms-plain-content">{stripHtml(block.content)}</p>
    </aside>
  )
}

/**
 * Paginas filhas publicadas de uma pagina, em cards. Fica num componente porque
 * o indice do Plan-Assiste nao passa por CmsPageBlocks e tambem precisa listar
 * o que a equipe criou abaixo dele.
 */
export function CmsPaginasFilhas({ parentSlug }: { parentSlug: string }) {
  const filhas = useCmsSnapshot().pages.filter((item) => item.parentSlug === parentSlug && item.status === 'published')
  if (filhas.length === 0) return null

  return (
    <section className="cms-child-pages">
      <h2>Páginas desta seção</h2>
      <div className="plan-card-grid plan-card-grid-secondary">
        {filhas.map((filha) => (
          <Link className="plan-section-card" to={caminhoDoSlug(filha.slug)} key={filha.id}>
            <span>{filha.navigationTitle || filha.title}</span>
            {filha.summary && <p>{filha.summary}</p>}
            <strong>Abrir página <ExternalLink aria-hidden="true" /></strong>
          </Link>
        ))}
      </div>
    </section>
  )
}

export function CmsPageBlocks({ page, editing }: { page: CmsPage, editing?: boolean }) {
  return (
    <div className="cms-public-grid">
      {page.blocks.map((block) => <CmsBlockRenderer block={block} key={block.id} />)}
      <CmsPaginasFilhas parentSlug={page.slug} />
      <ConteudosRelacionados refs={page.related} />
      {editing && <Link className="cms-context-edit" to={`/area-da-equipe/administracao-do-portal/paginas/${page.id}`}><Pencil aria-hidden="true" /> Editar conteúdo desta página</Link>}
    </div>
  )
}
