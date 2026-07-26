import { PublicBreadcrumb, PublicShell, type PublicPageProps } from './PublicPages'
import { createCmsBlock, createCmsPage, useCmsSnapshot, type CmsPage } from '../cms/contentRepository'
import { CmsBlockRenderer, CmsPageBlocks } from '../components/CmsBlocks'
import { accountingStatements } from '../data/accountingStatements.generated'
import { ArrowRight, ChartNoAxesCombined, ClipboardList, Download, FileCheck2, Landmark, LockKeyhole, ReceiptText } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

type TransparencyDocument = { year: string; title: string; entity: string; href: string }

const transparencyNavigation = [
  ['transparencia', 'Visão geral'],
  ['demonstracoes-contabeis', 'Demonstrações contábeis'],
  ['avaliacoes-atuariais', 'Avaliações atuariais'],
  ['termos-de-credenciamento', 'Termos de credenciamento'],
  ['relatorios-de-gestao', 'Relatórios de gestão'],
  ['relatorios-orcamentarios-e-financeiros', 'Relatórios orçamentários e financeiros'],
  ['execucao-orcamentaria', 'Execução orçamentária'],
] as const

const managementReports: TransparencyDocument[] = [
  { year: '2024', title: 'Síntese', entity: 'MPU', href: '/assets/transparencia/relatorios-de-gestao/2024-sintese.pdf' },
  { year: '2024', title: 'Relatório de Gestão do Plan-Assiste', entity: 'MPU', href: '/assets/transparencia/relatorios-de-gestao/2024-relatorio-de-gestao.pdf' },
  { year: '2024', title: 'Parecer nº 2/2025 do Conselho Fiscal/Seplan/MPU', entity: 'MPU', href: '/assets/transparencia/relatorios-de-gestao/2024-parecer-conselho-fiscal.pdf' },
  { year: '2024', title: 'Voto do Conselho Gestor/Seplan/MPU', entity: 'MPU', href: '/assets/transparencia/relatorios-de-gestao/2024-voto-conselho-gestor.pdf' },
  { year: '2023', title: 'Relatório de Gestão do Plan-Assiste', entity: 'MPU', href: '/assets/transparencia/relatorios-de-gestao/2023-relatorio-de-gestao.pdf' },
  { year: '2023', title: 'Relatório atuarial', entity: 'MPU', href: '/assets/transparencia/relatorios-de-gestao/2023-relatorio-atuarial.pdf' },
  { year: '2023', title: 'Relatório anual de capacitação', entity: 'MPU', href: '/assets/transparencia/relatorios-de-gestao/2023-relatorio-anual-capacitacao.pdf' },
  { year: '2023', title: 'Aprovação do Relatório de Gestão pelo Conselho Fiscal', entity: 'MPU', href: '/assets/transparencia/relatorios-de-gestao/2023-aprovacao-conselho-fiscal.pdf' },
  { year: '2022', title: 'Relatório de Gestão do Plan-Assiste', entity: 'MPU', href: '/assets/transparencia/relatorios-de-gestao/2022-relatorio-de-gestao.pdf' },
  { year: '2022', title: 'Relatório da 1ª etapa da unificação', entity: 'MPU', href: '/assets/transparencia/relatorios-de-gestao/2022-primeira-etapa-unificacao.pdf' },
  { year: '2022', title: 'Relatório anual de capacitação', entity: 'MPU', href: '/assets/transparencia/relatorios-de-gestao/2022-relatorio-anual-capacitacao.pdf' },
  { year: '2022', title: 'Relatório atuarial', entity: 'MPU', href: '/assets/transparencia/relatorios-de-gestao/2022-relatorio-atuarial.pdf' },
  { year: '2020–2021', title: 'Relatório de Gestão do Plan-Assiste', entity: 'MPU', href: '/assets/transparencia/relatorios-de-gestao/2020-2021-relatorio-de-gestao.pdf' },
]

const budgetReports: TransparencyDocument[] = [
  ...['2025', '2024', '2023'].map((year) => ({ year, title: 'Relatório mensal de receitas e despesas', entity: 'MPU', href: `/assets/transparencia/relatorios-orcamentarios/${year}-mpu-receitas-despesas.pdf` })),
  ...['2022', '2021', '2020', '2019', '2018'].flatMap((year) => ['MPF', 'MPT'].map((entity) => ({ year, title: 'Relatório mensal de receitas e despesas', entity, href: `/assets/transparencia/relatorios-orcamentarios/${year}-${entity.toLowerCase()}-receitas-despesas.pdf` }))),
  ...['2017', '2016'].flatMap((year) => ['MPF', 'MPM', 'MPT'].map((entity) => ({ year, title: 'Relatório mensal de receitas e despesas', entity, href: `/assets/transparencia/relatorios-orcamentarios/${year}-${entity.toLowerCase()}-receitas-despesas.pdf` }))),
  ...['2018', '2017', '2016'].map((year) => ({ year, title: 'Relatório de execução orçamentária e financeira anual', entity: 'MPU', href: `/assets/transparencia/relatorios-orcamentarios/${year}-execucao-orcamentaria-financeira-anual.pdf` })),
].sort((a, b) => Number(b.year) - Number(a.year))

const accreditationTerms: TransparencyDocument[] = [
  { year: '2026', title: 'Termos de credenciamento — lista atualizada até março de 2026', entity: 'MPU', href: '/assets/transparencia/termos-de-credenciamento/termos-de-credenciamento-marco-2026.pdf' },
]

const transparencyCardIcons = {
  '/transparencia/demonstracoes-contabeis': Landmark,
  '/transparencia/avaliacoes-atuariais': ChartNoAxesCombined,
  '/transparencia/termos-de-credenciamento': FileCheck2,
  '/transparencia/relatorios-de-gestao': ClipboardList,
  '/transparencia/execucao-orcamentaria': ReceiptText,
  '/transparencia/relatorios-orcamentarios-e-financeiros': ReceiptText,
} as const

const actuarialEvaluations = [
  {
    year: '2025',
    title: 'Avaliação Atuarial 2025',
    period: 'Período-base: julho/2024 a junho/2025',
    description:
      'Apresenta diagnóstico atuarial e econômico-financeiro do Plan-Assiste, com análise do perfil de beneficiários, receitas e despesas assistenciais, histórico econômico-financeiro e projeções para 2026 e 2027.',
    href: '/assets/avaliacoes-atuariais/avaliacao-atuarial-2025.pdf',
  },
  {
    year: '2024',
    title: 'Avaliação Atuarial 2024',
    period: 'Período-base: julho/2023 a junho/2024',
    description:
      'Avalia o equilíbrio operacional do Programa, registra o impacto do reconhecimento tardio de despesas assistenciais de exercícios anteriores e apresenta projeções para o triênio de 2025 a 2027.',
    href: '/assets/avaliacoes-atuariais/avaliacao-atuarial-2024.pdf',
  },
  {
    year: '2023',
    title: 'Avaliação Atuarial 2023',
    period: 'Período-base: julho/2022 a junho/2023',
    description:
      'Examina receitas e despesas assistenciais, registros contábeis de 2019 a 2022 e projeções para os anos seguintes, indicando superávit operacional em 2023 e necessidade de acompanhamento dos cenários futuros.',
    href: '/assets/avaliacoes-atuariais/avaliacao-atuarial-2023.pdf',
  },
  {
    year: '2022',
    title: 'Avaliação Atuarial 2022',
    period: 'Período-base: julho/2021 a junho/2022',
    description:
      'Traz diagnóstico atuarial e econômico-financeiro com dados históricos de receitas e despesas, registros contábeis de 2018 a 2021 e análise dos efeitos da unificação do Plan-Assiste no âmbito do MPU.',
    href: '/assets/avaliacoes-atuariais/avaliacao-atuarial-2022.pdf',
  },
  {
    year: '2021',
    title: 'Avaliação Atuarial 2021',
    period: 'Período-base: julho/2020 a junho/2021',
    description:
      'Analisa o equilíbrio operacional do Plan-Assiste a partir de receitas, despesas e registros contábeis de 2017 a 2020, apontando a efetividade das medidas de saneamento iniciadas em 2019.',
    href: '/assets/avaliacoes-atuariais/avaliacao-atuarial-2021.pdf',
  },
  {
    year: '2020',
    title: 'Avaliação Atuarial 2020',
    period: 'Ano-base: 2019',
    description:
      'Apresenta diagnóstico da situação atuarial e econômico-financeira com base no exercício de 2019, avaliando receitas, despesas operacionais, registros contábeis e projeções para 2020 a 2023.',
    href: '/assets/avaliacoes-atuariais/avaliacao-atuarial-2020.pdf',
  },
  {
    year: '2019',
    title: 'Avaliação Atuarial 2019',
    period: 'Exercício de 2019',
    description:
      'Nota técnica atuarial com avaliação do Programa no exercício de 2019, análise da situação econômico-financeira dos ramos e projeções para o triênio de 2020 a 2022.',
    href: '/assets/avaliacoes-atuariais/avaliacao-atuarial-2019.pdf',
  },
  {
    year: '2018',
    title: 'Avaliação Atuarial 2018',
    period: 'Exercício de 2018',
    description:
      'Reúne avaliação atuarial do exercício de 2018, análise da massa de beneficiários, histórico econômico-financeiro e propostas para restaurar a sustentabilidade do Programa no médio e longo prazos.',
    href: '/assets/avaliacoes-atuariais/avaliacao-atuarial-2018.pdf',
  },
  {
    year: '2017',
    title: 'Avaliação Atuarial 2017',
    period: 'Exercício de 2017',
    description:
      'Nota técnica com avaliação atuarial e econômico-financeira das contas do Plan-Assiste, incluindo propostas de alteração do modelo contributivo para fortalecer a sustentabilidade do Programa.',
    href: '/assets/avaliacoes-atuariais/avaliacao-atuarial-2017.pdf',
  },
  {
    year: '2016',
    title: 'Avaliação Atuarial 2016',
    period: 'Relatório final da comissão de reestruturação',
    description:
      'Relatório sobre a viabilidade da constituição do Plan-Assiste/MPU e o plano de operacionalização da incorporação do Plan-Assiste/MPDFT ao Plan-Assiste/MPF.',
    href: '/assets/avaliacoes-atuariais/avaliacao-atuarial-2016.pdf',
  },
] as const


// eslint-disable-next-line react-refresh/only-export-components
export function getTransparencyCmsSeed(): CmsPage {
  const page = createCmsPage('transparencia')
  return {
    ...page,
    title: 'Transparência',
    navigationTitle: 'Transparência',
    summary: 'Acesse documentos contábeis, atuariais, de gestão, credenciamento e execução orçamentária do Plan-Assiste.',
    status: 'published',
    blocks: [
      { ...createCmsBlock('card'), width: '1/3', cardVariant: 'navigation', title: 'Demonstrações contábeis', content: '<p>Balanços, resultados, fluxos de caixa, notas explicativas e documentos dos conselhos.</p>', href: '/transparencia/demonstracoes-contabeis', buttonLabel: 'Abrir página' },
      { ...createCmsBlock('card'), width: '1/3', cardVariant: 'navigation', title: 'Avaliações atuariais', content: '<p>Análises técnicas sobre o equilíbrio e a sustentabilidade do Programa.</p>', href: '/transparencia/avaliacoes-atuariais', buttonLabel: 'Abrir página' },
      { ...createCmsBlock('card'), width: '1/3', cardVariant: 'navigation', title: 'Termos de credenciamento', content: '<p>Consulte a relação atualizada dos termos de credenciamento do Programa.</p>', href: '/transparencia/termos-de-credenciamento', buttonLabel: 'Abrir página' },
      { ...createCmsBlock('card'), width: '1/3', cardVariant: 'navigation', title: 'Relatórios de gestão', content: '<p>Resultados, sínteses, pareceres e documentos anuais da gestão.</p>', href: '/transparencia/relatorios-de-gestao', buttonLabel: 'Abrir página' },
      { ...createCmsBlock('card'), width: '1/3', cardVariant: 'navigation', title: 'Relatórios orçamentários e financeiros', content: '<p>Receitas, despesas e execução orçamentária e financeira por exercício.</p>', href: '/transparencia/relatorios-orcamentarios-e-financeiros', buttonLabel: 'Abrir página' },
      { ...createCmsBlock('card'), width: '1/3', cardVariant: 'navigation', title: 'Execução orçamentária', content: '<p>Acesso permitido apenas para beneficiários do Programa.</p>', href: '/transparencia/execucao-orcamentaria', buttonLabel: 'Abrir página' },
    ],
  }
}

export function TransparenciaPage({ loggedIn, onLogout }: PublicPageProps) {
  const snapshot = useCmsSnapshot()
  const cmsPage = snapshot.pages.find((page) => page.slug === 'transparencia' && page.status === 'published')
  const seed = getTransparencyCmsSeed()
  const displayPage = cmsPage ? {
    ...cmsPage,
    blocks: [...seed.blocks.map((defaultBlock) => {
      const saved = cmsPage.blocks.find((block) => block.href === defaultBlock.href)
      return saved ? { ...saved, content: defaultBlock.href === '/transparencia/execucao-orcamentaria' ? defaultBlock.content : saved.content, cardVariant: 'navigation' as const, width: '1/3' as const } : defaultBlock
    }), ...cmsPage.blocks.filter((block) => !block.href || !seed.blocks.some((defaultBlock) => defaultBlock.href === block.href))],
  } : seed
  const navigationCards = displayPage.blocks.filter((block) => block.type === 'card' && block.href)
  const additionalBlocks = displayPage.blocks.filter((block) => block.type !== 'card' || !block.href)
  return (
    <PublicShell loggedIn={loggedIn} onLogout={onLogout}>
      <main className="container public-page transparency-page">
        <PublicBreadcrumb current="Transparência" />
        <div className="public-content-layout plan-content-layout transparency-content-layout"><TransparencySidebar /><div className="public-content-main"><section className="public-hero public-hero-institutional plan-landing-hero">
          <p className="eyebrow">Prestação de contas</p>
          <h1>{displayPage.title}</h1>
          <p>{displayPage.summary}</p>
        </section>

        <section className="plan-card-grid" aria-label="Áreas de Transparência">{navigationCards.map((block) => { const Icon = transparencyCardIcons[block.href as keyof typeof transparencyCardIcons] || ClipboardList; const restricted = block.href === '/transparencia/execucao-orcamentaria'; return <Link className={`plan-section-card${restricted ? ' transparency-restricted-card' : ''}`} to={block.href!} key={block.id}><Icon aria-hidden="true" />{restricted && <span className="service-auth-lock" aria-label="Login de beneficiário necessário" data-tooltip="Login de beneficiário necessário" title="Login de beneficiário necessário"><LockKeyhole aria-hidden="true" /></span>}<span>{block.title}</span><div className="transparency-card-description" dangerouslySetInnerHTML={{ __html: block.content }} /><strong>{block.buttonLabel || 'Acessar'} <ArrowRight aria-hidden="true" /></strong></Link> })}</section>
        {additionalBlocks.length > 0 && <div className="cms-public-grid transparency-extra-blocks">{additionalBlocks.map((block) => <CmsBlockRenderer block={block} key={block.id} />)}</div>}</div></div>
      </main>
    </PublicShell>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function getAccountingCmsSeed(): CmsPage {
  const page = createCmsPage('transparencia/demonstracoes-contabeis')
  return { ...page, title: 'Demonstrações contábeis', navigationTitle: 'Demonstrações contábeis', summary: 'Consulte o acervo contábil do Plan-Assiste, organizado por exercício.', status: 'published', blocks: accountingStatements.map((item) => ({ ...createCmsBlock('document'), width: '1/3', title: `${item.title} — ${item.year}`, content: `<p>Exercício de ${item.year} · ${item.entity}</p>`, href: item.href, buttonLabel: 'Abrir PDF' })) }
}

// eslint-disable-next-line react-refresh/only-export-components
export function getActuarialCmsSeed(): CmsPage {
  const page = createCmsPage('transparencia/avaliacoes-atuariais')
  return { ...page, title: 'Avaliações atuariais', navigationTitle: 'Avaliações atuariais', summary: 'Análises técnicas sobre receitas, despesas, equilíbrio operacional e sustentabilidade do Programa.', status: 'published', blocks: actuarialEvaluations.map((item) => ({ ...createCmsBlock('card'), width: '1/2', cardVariant: 'actuarial', badge: item.year, title: item.title, meta: item.period, content: `<p>${item.description}</p>`, href: item.href, buttonLabel: 'Abrir PDF' })) }
}

function getDocumentCollectionCmsSeed(slug: string, title: string, summary: string, documents: readonly TransparencyDocument[]): CmsPage {
  const page = createCmsPage(slug)
  return { ...page, title, navigationTitle: title, summary, status: 'published', blocks: documents.map((item) => ({ ...createCmsBlock('document'), width: '1/1', title: `${item.title} — ${item.year}`, content: `<p>Exercício de ${item.year} · ${item.entity}</p>`, href: item.href, buttonLabel: 'Baixar' })) }
}

// eslint-disable-next-line react-refresh/only-export-components
export function getAccreditationTermsCmsSeed() { return getDocumentCollectionCmsSeed('transparencia/termos-de-credenciamento', 'Termos de credenciamento', 'Consulte a relação atualizada dos termos de credenciamento celebrados pelo Plan-Assiste.', accreditationTerms) }
// eslint-disable-next-line react-refresh/only-export-components
export function getManagementReportsCmsSeed() { return getDocumentCollectionCmsSeed('transparencia/relatorios-de-gestao', 'Relatórios de gestão', 'Acesse relatórios, sínteses, pareceres e documentos de acompanhamento da gestão do Plan-Assiste.', managementReports) }
// eslint-disable-next-line react-refresh/only-export-components
export function getBudgetFinancialReportsCmsSeed() { return getDocumentCollectionCmsSeed('transparencia/relatorios-orcamentarios-e-financeiros', 'Relatórios orçamentários e financeiros', 'Consulte os relatórios de receitas, despesas e execução orçamentária e financeira organizados por exercício.', budgetReports) }
// eslint-disable-next-line react-refresh/only-export-components
export function getBudgetExecutionCmsSeed() {
  const page = createCmsPage('transparencia/execucao-orcamentaria')
  return { ...page, title: 'Execução orçamentária', navigationTitle: 'Execução orçamentária', summary: 'Acesso permitido apenas para beneficiários do Programa.', status: 'published' as const, blocks: [] }
}

function TransparencyCollectionPage({ loggedIn, onLogout, slug, seed }: PublicPageProps & { slug: string, seed: CmsPage }) {
  const snapshot = useCmsSnapshot()
  const page = snapshot.pages.find((item) => item.slug === slug && item.status === 'published') || seed
  const actuarialPage = slug === 'transparencia/avaliacoes-atuariais'
  const displayPage = actuarialPage ? { ...page, blocks: page.blocks.map((block) => ({ ...block, width: '1/2' as const })) } : page
  return <PublicShell loggedIn={loggedIn} onLogout={onLogout}><main className={`container public-page transparency-page${actuarialPage ? ' actuarial-evaluations-page' : ''}`}><PublicBreadcrumb current={displayPage.title} parents={[{ label: 'Transparência', to: '/transparencia' }]} /><div className="public-content-layout transparency-content-layout"><TransparencySidebar /><div className="public-content-main"><section className="public-hero"><p className="eyebrow">Prestação de contas</p><h1>{displayPage.title}</h1><p>{displayPage.summary}</p></section><CmsPageBlocks page={displayPage} editing={false} /></div></div></main></PublicShell>
}

function TransparencySidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  return <aside className="public-side-nav plan-side-nav transparency-side-nav" aria-label="Navegação de Transparência">
    <strong>Transparência</strong>
    <div className="sidebar-mobile-select"><label htmlFor="transparency-navigation">Navegar em Transparência</label><select id="transparency-navigation" value={location.pathname} onChange={(event) => navigate(event.target.value)}>{transparencyNavigation.map(([slug, label]) => <option value={slug === 'transparencia' ? '/transparencia' : `/transparencia/${slug}`} key={slug}>{label}</option>)}</select></div>
    <div className="plan-side-nav-links transparency-side-links">{transparencyNavigation.map(([slug, label]) => { const path = slug === 'transparencia' ? '/transparencia' : `/transparencia/${slug}`; return <Link className={`${slug === 'transparencia' ? 'plan-side-home' : 'plan-side-section-link'}${location.pathname === path ? ' active' : ''}`} aria-current={location.pathname === path ? 'page' : undefined} to={path} key={slug}>{label}</Link> })}</div>
  </aside>
}

function AccountingStatementsTables({ page }: { page: CmsPage }) {
  const editedStatements = page.blocks
    .filter((block) => block.type === 'document' && block.href)
    .map((block) => {
      const official = accountingStatements.find((item) => item.href === block.href)
      const year = official?.year || block.title.match(/(?:—|-)\s*(\d{4})\s*$/)?.[1] || block.content.match(/(?:Exercício de\s*)?(\d{4})/)?.[1] || ''
      const savedEntity = block.content.replace(/<[^>]+>/g, '').match(/·\s*([^·]+)\s*$/)?.[1]?.trim()
      const entity = official?.entity || savedEntity || 'MPU'
      const editedTitle = block.title.replace(/\s*(?:—|-)\s*\d{4}\s*$/, '')
      const title = official?.title || editedTitle
      return { year, entity, title, href: block.href! }
    })
    .filter((item) => item.year)
  const editedByHref = new Map(editedStatements.map((item) => [item.href, item]))
  const officialHrefs = new Set<string>(accountingStatements.map((item) => item.href))
  const documents = [
    ...accountingStatements.map((item) => editedByHref.get(item.href) || item),
    ...editedStatements.filter((item) => !officialHrefs.has(item.href)),
  ]
  return <TransparencyDocumentsTables documents={documents} />
}

function TransparencyDocumentsTables({ documents }: { documents: readonly TransparencyDocument[] }) {
  const years = [...new Set(documents.map((item) => item.year))].sort((a, b) => Number(b) - Number(a))

  return <div className="accounting-statements">
    {years.map((year) => {
      const statements = documents.filter((item) => item.year === year)

      return <section className="accounting-year" key={year} aria-labelledby={`accounting-year-${year}`}>
        <h2 id={`accounting-year-${year}`}>Exercício de {year}</h2>
        <div className="portal-table-wrap accounting-table-wrap">
          <table className="portal-table document-table accounting-table">
            <caption className="sr-only">Demonstrações contábeis do exercício de {year}</caption>
            <thead><tr><th scope="col">Nº</th><th scope="col">Documento ou recurso</th><th scope="col">Unidade</th><th scope="col">Ação</th></tr></thead>
            <tbody>{statements.map((document, index) => <tr key={`${document.entity}-${document.title}-${document.href}`}>
              <td>{index + 1}</td>
              <td>{document.title}</td>
              <td>{document.entity}</td>
              <td><a href={document.href} download aria-label={`Baixar ${document.title}, ${document.entity}, exercício de ${year}`}><Download aria-hidden="true" /> <span>Baixar</span></a></td>
            </tr>)}</tbody>
          </table>
        </div>
      </section>
    })}
  </div>
}

export function AccountingStatementsPage({ loggedIn, onLogout }: PublicPageProps) {
  const snapshot = useCmsSnapshot()
  const page = snapshot.pages.find((item) => item.slug === 'transparencia/demonstracoes-contabeis' && item.status === 'published') || getAccountingCmsSeed()
  return <PublicShell loggedIn={loggedIn} onLogout={onLogout}>
    <main className="container public-page transparency-page">
      <PublicBreadcrumb current={page.title} parents={[{ label: 'Transparência', to: '/transparencia' }]} />
      <div className="public-content-layout transparency-content-layout"><TransparencySidebar /><div className="public-content-main"><section className="public-hero"><p className="eyebrow">Prestação de contas</p><h1>{page.title}</h1><p>{page.summary}</p></section>
      <AccountingStatementsTables page={page} /></div></div>
    </main>
  </PublicShell>
}
export function ActuarialEvaluationsPage(props: PublicPageProps) { return <TransparencyCollectionPage {...props} slug="transparencia/avaliacoes-atuariais" seed={getActuarialCmsSeed()} /> }

function TransparencyDocumentCollectionPage({ loggedIn, onLogout, seed }: PublicPageProps & { seed: CmsPage }) {
  const snapshot = useCmsSnapshot()
  const page = snapshot.pages.find((item) => item.slug === seed.slug && item.status === 'published') || seed
  const documents = page.blocks.filter((block) => block.type === 'document' && block.href).map((block) => ({
    year: block.title.match(/\s+—\s+([^—]+)\s*$/)?.[1]?.trim() || block.content.match(/(?:Exercício de\s*)?([\d–-]+)/)?.[1] || '',
    entity: block.content.replace(/<[^>]+>/g, '').match(/·\s*([^·]+)\s*$/)?.[1]?.trim() || 'MPU',
    title: block.title.replace(/\s+—\s+[^—]+\s*$/, ''),
    href: block.href!,
  })).filter((item) => item.year)
  const additionalBlocks = page.blocks.filter((block) => block.type !== 'document')
  return <PublicShell loggedIn={loggedIn} onLogout={onLogout}><main className="container public-page transparency-page"><PublicBreadcrumb current={page.title} parents={[{ label: 'Transparência', to: '/transparencia' }]} /><div className="public-content-layout transparency-content-layout"><TransparencySidebar /><div className="public-content-main"><section className="public-hero"><p className="eyebrow">Prestação de contas</p><h1>{page.title}</h1><p>{page.summary}</p></section><TransparencyDocumentsTables documents={documents} />{additionalBlocks.length > 0 && <div className="cms-public-grid transparency-extra-blocks">{additionalBlocks.map((block) => <CmsBlockRenderer block={block} key={block.id} />)}</div>}</div></div></main></PublicShell>
}

export function AccreditationTermsPage(props: PublicPageProps) { return <TransparencyDocumentCollectionPage {...props} seed={getAccreditationTermsCmsSeed()} /> }
export function ManagementReportsPage(props: PublicPageProps) { return <TransparencyDocumentCollectionPage {...props} seed={getManagementReportsCmsSeed()} /> }
export function BudgetFinancialReportsPage(props: PublicPageProps) { return <TransparencyDocumentCollectionPage {...props} seed={getBudgetFinancialReportsCmsSeed()} /> }
export function BudgetExecutionPage({ loggedIn, onLogout }: PublicPageProps) { const snapshot = useCmsSnapshot(); const seed = getBudgetExecutionCmsSeed(); const page = snapshot.pages.find((item) => item.slug === seed.slug && item.status === 'published') || seed; return <PublicShell loggedIn={loggedIn} onLogout={onLogout}><main className="container public-page transparency-page"><PublicBreadcrumb current={page.title} parents={[{ label: 'Transparência', to: '/transparencia' }]} /><div className="public-content-layout transparency-content-layout"><TransparencySidebar /><div className="public-content-main"><section className="public-hero"><p className="eyebrow">Acesso restrito</p><h1>{page.title}</h1><p>{page.summary}</p></section><CmsPageBlocks page={page} editing={false} /></div></div></main></PublicShell> }
