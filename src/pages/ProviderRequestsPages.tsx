import { useEffect, useState, type FormEvent } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Activity,
  BadgeCheck,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ClipboardCheck,
  Clock,
  Copy,
  Eye,
  Headphones,
  MessageCircle,
  MonitorCheck,
  Plus,
  RotateCcw,
  Search,
  Send,
  Stethoscope,
  Undo2,
  UserRound,
  WalletCards,
  X,
  type LucideIcon,
} from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { RestrictedAreaPageFrame, NewsDateRangePicker, type PublicPageProps } from './PublicPages'
import { AnexoItem, SolicitacaoRating } from './BeneficiaryPages'
import { ChatMessageComposer } from '../components/ChatMessageComposer'
import {
  SOLICITACOES_PAGE_SIZE_OPTIONS,
  solicitacaoConcluida,
  solicitacaoStatusBadge,
  solicitacaoStatusLabel,
  type MinhasSolicitacaoAtualizacao,
  type MinhasSolicitacaoFormField,
  type MinhasSolicitacaoStatus,
} from '../utils/solicitacoes'
import {
  providerRequestCategories,
  providerServiceCatalog,
  type ProviderRequestCategory,
  type ProviderRequestType,
  type ProviderServiceCatalogItem,
} from '../data/providerRequests'
import { FileAttachmentField } from '../components/FileAttachmentField'
import { WizardSteps } from '../components/serviceRequestWizardComponents'
import type { WizardStep } from '../components/serviceRequestWizardHelpers'
import { generateProtocolNumber } from '../utils/protocol'
import { getStoredUserProfile } from '../utils/userProfile'
import { getStoredSession } from '../utils/session'

type ProviderSolicitacao = {
  id: string
  categoria: ProviderRequestCategory
  servico: string
  tipo: ProviderRequestType
  data: string
  status: MinhasSolicitacaoStatus
  formulario: MinhasSolicitacaoFormField[]
  anexos: string[]
  atualizacoes: MinhasSolicitacaoAtualizacao[]
}

const categoryIcon: Record<ProviderRequestCategory, LucideIcon> = {
  'Rede Credenciada / Conveniada': Building2,
  'Especialidade e Preços de Serviços de Saúde': WalletCards,
  'Autorização': ClipboardCheck,
  'Faturamento': WalletCards,
  'Serviços de Saúde': Stethoscope,
  'Fale Conosco': MessageCircle,
  'Relacionamento e Comunicação': MonitorCheck,
}

const providerSolicitacoesData: ProviderSolicitacao[] = [
  {
    id: 'PRE-2026-001', categoria: 'Autorização', servico: 'Autorização OPME', tipo: 'Requisição', data: '18/03/2026', status: 'Em andamento',
    formulario: [
      { label: 'Categoria', value: 'Autorização' },
      { label: 'Serviço', value: 'Autorização OPME' },
      { label: 'Descrição', value: 'Solicito autorização para órtese indicada no procedimento cirúrgico do beneficiário matrícula 30003387.' },
    ],
    anexos: ['pedido-medico-opme.pdf', 'orcamento-opme.pdf'],
    atualizacoes: [
      { data: '19/03/2026', hora: '10:20', titulo: 'Em andamento', descricao: 'Documentação em análise pela equipe técnica.', autor: 'atendente' },
      { data: '18/03/2026', hora: '08:40', titulo: 'Solicitação recebida', descricao: 'Sua solicitação foi registrada e está na fila de análise.' },
    ],
  },
  {
    id: 'PRE-2026-002', categoria: 'Faturamento', servico: 'Recurso / Contestação de Informações Financeiras', tipo: 'Requisição', data: '12/03/2026', status: 'Suspenso',
    formulario: [
      { label: 'Categoria', value: 'Faturamento' },
      { label: 'Serviço', value: 'Recurso / Contestação de Informações Financeiras' },
      { label: 'Descrição', value: 'Contestação de valores glosados na fatura de fevereiro/2026, guias 4471 a 4498.' },
    ],
    anexos: ['fatura-fevereiro.pdf', 'planilha-glosas.pdf'],
    atualizacoes: [
      { data: '14/03/2026', titulo: 'Solicitação suspensa', descricao: 'Aguardando envio dos comprovantes de atendimento das guias contestadas.' },
      { data: '12/03/2026', titulo: 'Solicitação recebida', descricao: 'Sua solicitação foi registrada e está na fila de análise.' },
    ],
  },
  {
    id: 'PRE-2026-003', categoria: 'Rede Credenciada / Conveniada', servico: 'Acompanhamento do Processo de Credenciamento', tipo: 'Requisição', data: '02/03/2026', status: 'Reativado',
    formulario: [
      { label: 'Categoria', value: 'Rede Credenciada / Conveniada' },
      { label: 'Serviço', value: 'Acompanhamento do Processo de Credenciamento' },
      { label: 'Descrição', value: 'Solicito atualização sobre o andamento do credenciamento da nova unidade em Taguatinga.' },
    ],
    anexos: [],
    atualizacoes: [
      { data: '10/03/2026', titulo: 'Solicitação reativada', descricao: 'Documento complementar recebido. O processo foi retomado pela equipe de credenciamento.' },
      { data: '05/03/2026', titulo: 'Solicitação suspensa', descricao: 'Aguardando envio da relação atualizada do corpo clínico.' },
      { data: '02/03/2026', titulo: 'Solicitação recebida', descricao: 'Sua solicitação foi registrada e está na fila de análise.' },
    ],
  },
  {
    id: 'PRE-2026-004', categoria: 'Relacionamento e Comunicação', servico: 'Problemas de Acesso do Sistema (Benner, Portal TISS, Autorizador WEB)', tipo: 'Incidente', data: '22/03/2026', status: 'Reaberto',
    formulario: [
      { label: 'Categoria', value: 'Relacionamento e Comunicação' },
      { label: 'Serviço', value: 'Problemas de Acesso do Sistema (Benner, Portal TISS, Autorizador WEB)' },
      { label: 'Descrição', value: 'Não conseguimos autenticar no Portal TISS desde a manhã de hoje para envio dos arquivos XML.' },
    ],
    anexos: ['print-erro-login.png'],
    atualizacoes: [
      { data: '24/03/2026', titulo: 'Chamado reaberto', descricao: 'O problema de acesso voltou a ocorrer após a liberação anterior.' },
      { data: '23/03/2026', titulo: 'Solicitação recusada', descricao: 'Acesso normalizado nos testes realizados pela equipe de sistemas.' },
      { data: '22/03/2026', titulo: 'Solicitação recebida', descricao: 'Sua solicitação foi registrada e está na fila de análise.' },
    ],
  },
  {
    id: 'PRE-2026-005', categoria: 'Especialidade e Preços de Serviços de Saúde', servico: 'Reajuste de Tabela de Preços', tipo: 'Requisição', data: '25/02/2026', status: 'Concluída',
    formulario: [
      { label: 'Categoria', value: 'Especialidade e Preços de Serviços de Saúde' },
      { label: 'Serviço', value: 'Reajuste de Tabela de Preços' },
      { label: 'Descrição', value: 'Solicitação de reajuste anual da tabela de preços de procedimentos ambulatoriais.' },
    ],
    anexos: ['proposta-reajuste.pdf'],
    atualizacoes: [
      { data: '10/03/2026', titulo: 'Reajuste aprovado', descricao: 'Nova tabela de preços aprovada e vigente a partir de 01/04/2026.' },
      { data: '01/03/2026', titulo: 'Em andamento', descricao: 'Proposta em análise pela área de credenciamento.' },
      { data: '25/02/2026', titulo: 'Solicitação recebida', descricao: 'Sua solicitação foi registrada e está na fila de análise.' },
    ],
  },
  {
    id: 'PRE-2026-006', categoria: 'Serviços de Saúde', servico: 'Autorizações (Dúvidas, Informações e Esclarecimentos)', tipo: 'Requisição', data: '28/03/2026', status: 'Aberto',
    formulario: [
      { label: 'Categoria', value: 'Serviços de Saúde' },
      { label: 'Serviço', value: 'Autorizações (Dúvidas, Informações e Esclarecimentos)' },
      { label: 'Descrição', value: 'Dúvida sobre os documentos exigidos para autorização de fisioterapia acima do limite de sessões.' },
    ],
    anexos: [],
    atualizacoes: [
      { data: '28/03/2026', titulo: 'Solicitação recebida', descricao: 'Sua solicitação foi registrada e está na fila de análise.' },
    ],
  },
]

export function ProviderMinhasSolicitacoesPage({ loggedIn, onLogout }: PublicPageProps) {
  const [requestLauncherOpen, setRequestLauncherOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('Todas')
  const [categoryFilter, setCategoryFilter] = useState('Todas')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const filtered = providerSolicitacoesData
    .filter((s) => statusFilter === 'Todas' || s.status === statusFilter)
    .filter((s) => categoryFilter === 'Todas' || s.categoria === categoryFilter)
    .filter((s) => {
      const [day, month, year] = s.data.split('/')
      const value = `${year}-${month}-${day}`
      return (!startDate || value >= startDate) && (!endDate || value <= endDate)
    })
    .filter((s) => {
      const search = query.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
      if (!search) return true
      return `${s.id} ${s.categoria} ${s.servico}`
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .includes(search)
    })

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1)
  }, [query, statusFilter, categoryFilter, startDate, endDate, pageSize])

  const aberto = providerSolicitacoesData.filter((s) => s.status === 'Aberto').length
  const emAndamento = providerSolicitacoesData.filter((s) => s.status === 'Em andamento').length
  const suspenso = providerSolicitacoesData.filter((s) => s.status === 'Suspenso').length
  const reativado = providerSolicitacoesData.filter((s) => s.status === 'Reativado').length
  const reaberto = providerSolicitacoesData.filter((s) => s.status === 'Reaberto').length
  const concluida = providerSolicitacoesData.filter((s) => s.status === 'Concluída').length

  return (
    <RestrictedAreaPageFrame area="provider" breadcrumb="Minhas solicitações" loggedIn={loggedIn} onLogout={onLogout}>
      <div>
        <div className="provider-page-heading">
          <h1>Minhas solicitações</h1>
          <p className="page-subtitle">
            Acompanhe o status de todas as solicitações abertas pelo credenciado em um só lugar.
          </p>
        </div>

        <section className="reimbursement-summary reimbursement-summary-6" aria-label="Resumo das solicitações">
          <article>
            <Clock aria-hidden="true" />
            <strong>{aberto}</strong>
            <span>Abertos</span>
          </article>
          <article>
            <Activity aria-hidden="true" />
            <strong>{emAndamento}</strong>
            <span>Em andamento</span>
          </article>
          <article>
            <Clock aria-hidden="true" />
            <strong>{suspenso}</strong>
            <span>Suspenso</span>
          </article>
          <article>
            <RotateCcw aria-hidden="true" />
            <strong>{reativado}</strong>
            <span>Reativado</span>
          </article>
          <article>
            <Undo2 aria-hidden="true" />
            <strong>{reaberto}</strong>
            <span>Reabertos</span>
          </article>
          <article>
            <BadgeCheck aria-hidden="true" />
            <strong>{concluida}</strong>
            <span>Concluídos</span>
          </article>
        </section>

        <section className="reimbursement-card" aria-label="Lista de solicitações">
          <div className="reimbursement-section-heading">
            <div>
              <h2>Todas as solicitações</h2>
              <p>Filtre por situação ou pesquise por protocolo, categoria ou serviço.</p>
            </div>
            <button className="primary-button" type="button" onClick={() => setRequestLauncherOpen(true)}>
              <Plus aria-hidden="true" /> Nova solicitação
            </button>
          </div>

          <div className="go-table-toolbar-stack">
            <div className="go-table-toolbar requests-primary-filters">
              <label className="go-filter-label requests-search-filter">
                Buscar solicitação
                <div className="go-search-bar">
                  <Search aria-hidden="true" />
                  <input
                    type="text"
                    placeholder="Protocolo, categoria ou serviço..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
              </label>
              <label className="go-filter-label requests-status-filter">
                Situação
                <select
                  className="go-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  {[
                    ['Todas', 'Todas'],
                    ['Aberto', 'Aberto'],
                    ['Em andamento', 'Em andamento'],
                    ['Suspenso', 'Suspenso'],
                    ['Reativado', 'Reativado'],
                    ['Reaberto', 'Reaberto'],
                    ['Concluída', 'Concluída'],
                  ].map(([value, label]) => (
                    <option value={value} key={value}>{label}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="go-toolbar-filters requests-toolbar-filters">
              <label className="go-filter-label">
                Categoria
                <select className="go-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                  <option value="Todas">Todas</option>
                  {providerRequestCategories.map((category) => (
                    <option value={category} key={category}>{category}</option>
                  ))}
                </select>
              </label>
              <label className="go-filter-label requests-date-filter">
                Data
                <NewsDateRangePicker
                  startDate={startDate}
                  endDate={endDate}
                  onChange={(nextStartDate, nextEndDate) => {
                    setStartDate(nextStartDate)
                    setEndDate(nextEndDate)
                  }}
                />
              </label>
              <button
                className="go-clear-btn requests-clear-button filter-clear-button"
                type="button"
                onClick={() => {
                  setQuery('')
                  setStatusFilter('Todas')
                  setCategoryFilter('Todas')
                  setStartDate('')
                  setEndDate('')
                }}
              >
                Limpar filtros
              </button>
            </div>
          </div>

          <div className="reimbursement-table-wrap requests-table-wrap">
            <table className="reimbursement-table requests-table">
              <thead>
                <tr>
                  <th>Protocolo</th>
                  <th>Data de abertura</th>
                  <th>Categoria</th>
                  <th>Serviço</th>
                  <th>Situação</th>
                  <th className="requests-actions-col">Ações</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length > 0 ? (
                  paginated.map((s) => (
                    <tr key={s.id}>
                      <td style={{ fontFamily: 'monospace', fontSize: '1rem', whiteSpace: 'nowrap' }}>{s.id}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>{s.data}</td>
                      <td><span className="requests-cell-wrap">{s.categoria}</span></td>
                      <td><span className="requests-cell-wrap">{s.servico}</span></td>
                      <td>
                        <span className={solicitacaoStatusBadge(s.status)}>{solicitacaoStatusLabel(s.status)}</span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <Link
                          to={`/credenciado/minhas-solicitacoes/${s.id}`}
                          title="Visualizar"
                          aria-label={`Visualizar solicitação ${s.id}`}
                          style={{ display: 'inline-flex', padding: '0.25rem', color: 'var(--text-muted, #6b7280)' }}
                        >
                          <Eye size={16} aria-hidden="true" />
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted, #6b7280)' }}>
                      Nenhuma solicitação encontrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filtered.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', color: 'var(--text-muted, #6b7280)' }}>
                Itens por página
                <select
                  className="go-select"
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  style={{ width: 'auto' }}
                >
                  {SOLICITACOES_PAGE_SIZE_OPTIONS.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </label>
              <nav className="provider-pagination" style={{ margin: 0 }} aria-label="Paginação de solicitações">
                <button type="button" onClick={() => setPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>
                  Anterior
                </button>
                {Array.from({ length: totalPages }).map((_, i) => {
                  const p = i + 1
                  return (
                    <button
                      key={p}
                      type="button"
                      className={p === currentPage ? 'selected' : ''}
                      aria-current={p === currentPage ? 'page' : undefined}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </button>
                  )
                })}
                <button type="button" onClick={() => setPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}>
                  Próxima
                </button>
              </nav>
            </div>
          )}
        </section>
        <ProviderRequestLauncherModal open={requestLauncherOpen} onClose={() => setRequestLauncherOpen(false)} />
      </div>
    </RestrictedAreaPageFrame>
  )
}

function ProviderRequestLauncherModal({ open, onClose }: { open: boolean, onClose: () => void }) {
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (!open) return
    function closeOnEscape(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [open, onClose])

  if (!open) return null

  const normalize = (value: string) => value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  const search = normalize(query.trim())
  const titleMatches = (service: ProviderServiceCatalogItem) => normalize(service.title).includes(search)
  const visible = providerServiceCatalog
    .filter((service) => !search || normalize(`${service.title} ${service.category}`).includes(search))
    .sort((a, b) => (search ? Number(titleMatches(b)) - Number(titleMatches(a)) : 0))

  return (
    <div className="request-launcher-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className="request-launcher-dialog" role="dialog" aria-modal="true" aria-labelledby="provider-request-launcher-title">
        <header>
          <div>
            <p className="eyebrow">Nova solicitação</p>
            <h2 id="provider-request-launcher-title">O que você deseja solicitar?</h2>
            <p>Escolha um serviço do catálogo do credenciado para abrir o formulário.</p>
          </div>
          <button className="request-launcher-close" type="button" onClick={onClose} aria-label="Fechar"><X aria-hidden="true" /></button>
        </header>
        <div className="request-launcher-body">
          <label className="request-launcher-search">
            <Search aria-hidden="true" />
            <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar solicitação" />
          </label>
          <div className="request-launcher-list">
            {visible.map((service) => {
              const Icon = categoryIcon[service.category]
              return (
                <Link to={`/credenciado/minhas-solicitacoes/nova-solicitacao/${service.id}`} className="request-launcher-item" onClick={onClose} key={service.id}>
                  <Icon aria-hidden="true" />
                  <span><strong>{service.title}</strong><small>{service.category}</small></span>
                  <ArrowRight aria-hidden="true" />
                </Link>
              )
            })}
            {visible.length === 0 && <p className="request-launcher-empty">Nenhuma solicitação encontrada.</p>}
          </div>
        </div>
      </section>
    </div>
  )
}

export function ProviderNovaSolicitacaoPage({ loggedIn, onLogout }: PublicPageProps) {
  const { serviceId } = useParams()
  const catalogEntry = providerServiceCatalog.find((service) => service.id === serviceId)
  const profile = getStoredUserProfile()
  const session = getStoredSession()
  const accountName = session.displayName || 'Clínica Saúde & Vida'

  const [step, setStep] = useState<WizardStep>('form')
  const [email, setEmail] = useState(profile.providerEmail || '')
  const [phone, setPhone] = useState(profile.phone || '')
  const [descricao, setDescricao] = useState('')
  const [anexos, setAnexos] = useState<File[]>([])
  const [notice, setNotice] = useState('')
  const [protocol, setProtocol] = useState('')
  const [copied, setCopied] = useState(false)

  function addAttachmentFiles(newFiles: File[]) {
    setAnexos((current) => [...current, ...newFiles])
  }

  function removeAttachmentFile(index: number) {
    setAnexos((current) => current.filter((_, fileIndex) => fileIndex !== index))
  }

  function handleContinue(event: FormEvent) {
    event.preventDefault()
    if (!descricao.trim()) {
      setNotice('Descreva a solicitação antes de continuar.')
      return
    }
    setNotice('')
    setStep('review')
  }

  function handleConfirm() {
    setProtocol(generateProtocolNumber())
    setStep('success')
  }

  function handleReset() {
    setDescricao('')
    setAnexos([])
    setNotice('')
    setProtocol('')
    setCopied(false)
    setStep('form')
  }

  if (!catalogEntry) {
    return (
      <RestrictedAreaPageFrame area="provider" breadcrumb="Nova solicitação" loggedIn={loggedIn} onLogout={onLogout}>
        <div className="reimbursements-page">
          <div className="provider-page-heading">
            <h1>Serviço não encontrado</h1>
            <p className="page-subtitle">Verifique o link ou escolha um serviço no catálogo.</p>
          </div>
          <Link className="text-link provider-detail-back" to="/credenciado/minhas-solicitacoes">
            <ArrowLeft aria-hidden="true" /> Voltar para Minhas solicitações
          </Link>
        </div>
      </RestrictedAreaPageFrame>
    )
  }

  const heading = (
    <div className="provider-page-heading">
      <h1>Nova solicitação — {catalogEntry.title}</h1>
      <p className="page-subtitle">{catalogEntry.category}</p>
    </div>
  )

  if (step === 'success') {
    return (
      <RestrictedAreaPageFrame area="provider" breadcrumb="Nova solicitação" loggedIn={loggedIn} onLogout={onLogout}>
        <div className="reimbursements-page">
          {heading}
          <div className="service-wizard">
            <WizardSteps current={step} />
            <div className="service-success">
              <CheckCircle2 aria-hidden="true" className="service-success-icon" />
              <h2>Solicitação criada com sucesso!</h2>
              <p>Sua solicitação foi registrada para análise.</p>
              <div className="service-protocol">
                <span>Número do protocolo</span>
                <strong>{protocol}</strong>
                <button type="button" onClick={() => { navigator.clipboard.writeText(protocol); setCopied(true) }}>
                  <Copy aria-hidden="true" /> {copied ? 'Copiado!' : 'Copiar protocolo'}
                </button>
              </div>
              <div className="service-success-followup">
                <h3>Como acompanhar?</h3>
                <ol>
                  <li><span className="service-followup-index">1</span> Acesse o menu Minhas solicitações</li>
                  <li><span className="service-followup-index">2</span> Localize o protocolo informado</li>
                  <li><span className="service-followup-index">3</span> Verifique o status e atualizações</li>
                </ol>
              </div>
              <div className="service-success-actions">
                <button className="primary-button" type="button" onClick={handleReset}>
                  <RotateCcw aria-hidden="true" /> Registrar nova solicitação
                </button>
                <Link className="secondary-button" to="/credenciado/minhas-solicitacoes">Ver minhas solicitações</Link>
              </div>
            </div>
          </div>
        </div>
      </RestrictedAreaPageFrame>
    )
  }

  if (step === 'review') {
    return (
      <RestrictedAreaPageFrame area="provider" breadcrumb="Nova solicitação" loggedIn={loggedIn} onLogout={onLogout}>
        <div className="reimbursements-page">
          {heading}
          <div className="service-wizard">
            <WizardSteps current={step} />
            <div className="reimbursement-card service-review">
              <h2>Revise sua solicitação</h2>
              <p className="page-subtitle">Confira os dados informados antes de confirmar o envio.</p>

              <div className="reimbursement-form-section">
                <h3>Identificação do credenciado</h3>
                <dl className="service-review-grid">
                  <div className="service-review-row"><dt>Nome/Razão Social</dt><dd>{accountName}</dd></div>
                  <div className="service-review-row"><dt>CPF/CNPJ</dt><dd>{profile.providerCnpj}</dd></div>
                  <div className="service-review-row"><dt>Cód. Prestador</dt><dd>{profile.providerCode}</dd></div>
                  <div className="service-review-row"><dt>E-mail</dt><dd>{email}</dd></div>
                  <div className="service-review-row"><dt>Telefone</dt><dd>{phone}</dd></div>
                </dl>
              </div>

              <div className="reimbursement-form-section">
                <h3>Descrição</h3>
                <p>{descricao}</p>
              </div>

              <div className="reimbursement-form-section">
                <h3>Anexos</h3>
                <dl className="service-review-grid">
                  {anexos.length > 0
                    ? <div className="service-review-row"><dt>Arquivos</dt><dd>{anexos.map((file) => file.name).join(', ')}</dd></div>
                    : <div className="service-review-row"><dt>Arquivos</dt><dd>–</dd></div>}
                </dl>
              </div>

              <div className="reimbursement-actions">
                <button className="secondary-button" type="button" onClick={() => setStep('form')}>
                  <ChevronLeft aria-hidden="true" /> Voltar e editar
                </button>
                <button className="primary-button" type="button" onClick={handleConfirm}>
                  <Send aria-hidden="true" /> Confirmar e enviar
                </button>
              </div>
            </div>
          </div>
        </div>
      </RestrictedAreaPageFrame>
    )
  }

  return (
    <RestrictedAreaPageFrame area="provider" breadcrumb="Nova solicitação" loggedIn={loggedIn} onLogout={onLogout}>
      <div className="reimbursements-page">
        {heading}
        <div className="service-wizard">
          <WizardSteps current={step} />
          <form className="reimbursement-form" onSubmit={handleContinue}>
            <section className="reimbursement-card">
              <div className="reimbursement-form-section">
                <h3>Identificação do credenciado</h3>
                <div className="reimbursement-grid reimbursement-grid-two-columns">
                  <label className="wide">Nome/Razão Social<input value={accountName} disabled /></label>
                  <label>CPF/CNPJ<input value={profile.providerCnpj || ''} disabled /></label>
                  <label>Cód. Prestador<input value={profile.providerCode || ''} disabled /></label>
                  <label>E-mail<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
                  <label>Telefone<input value={phone} onChange={(event) => setPhone(event.target.value)} /></label>
                </div>
                <p className="service-field-hint reimbursement-profile-hint">
                  Apenas e-mail e telefone podem ser alterados. Os demais dados são atualizados em <Link to="/minha-area">Meus dados</Link>.
                </p>
              </div>

              <div className="reimbursement-form-section">
                <h3>Dados da solicitação</h3>
                <div className="reimbursement-grid">
                  <label className="wide">
                    Descrição
                    <textarea rows={6} value={descricao} onChange={(event) => setDescricao(event.target.value)} placeholder="Descreva a solicitação com o máximo de detalhes possível" />
                  </label>
                </div>
              </div>

              <div className="reimbursement-form-section">
                <h3>Anexos</h3>
                <p className="service-field-hint">Anexe os documentos que ajudem na análise da solicitação. É possível selecionar mais de um arquivo.</p>
                <FileAttachmentField
                  fullWidth
                  label="Anexos"
                  hideLabel
                  files={anexos}
                  onAdd={addAttachmentFiles}
                  onRemove={removeAttachmentFile}
                />
              </div>

              {notice && <p className="form-alert alert-danger" role="status">{notice}</p>}

              <div className="reimbursement-actions">
                <Link className="secondary-button" to="/credenciado/minhas-solicitacoes">Cancelar</Link>
                <button className="primary-button" type="submit">
                  Continuar <ArrowRight aria-hidden="true" />
                </button>
              </div>
            </section>
          </form>
        </div>
      </div>
    </RestrictedAreaPageFrame>
  )
}

export function ProviderSolicitacaoDetalhePage({ loggedIn, onLogout }: PublicPageProps) {
  const { id } = useParams()
  const solicitacao = providerSolicitacoesData.find((item) => item.id === id)
  const [novaMensagem, setNovaMensagem] = useState('')
  const [mensagensEnviadas, setMensagensEnviadas] = useState<MinhasSolicitacaoAtualizacao[]>([])
  const [statusOverride, setStatusOverride] = useState<MinhasSolicitacaoStatus | null>(null)
  const [showReopenModal, setShowReopenModal] = useState(false)
  const [notice, setNotice] = useState('')
  const statusAtual = statusOverride ?? solicitacao?.status ?? 'Aberto'

  function formatDataHoraAtual() {
    const agora = new Date()
    const data = `${String(agora.getDate()).padStart(2, '0')}/${String(agora.getMonth() + 1).padStart(2, '0')}/${agora.getFullYear()}`
    const hora = `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`
    return { data, hora }
  }

  function handleEnviarMensagem(event: FormEvent) {
    event.preventDefault()
    const texto = novaMensagem.trim()
    if (!texto) return
    const { data, hora } = formatDataHoraAtual()
    setMensagensEnviadas((current) => [...current, { data, hora, titulo: 'Sua Mensagem', descricao: texto, autor: 'beneficiario' }])
    setNovaMensagem('')
  }

  function handleConfirmarReabertura() {
    const { data, hora } = formatDataHoraAtual()
    setStatusOverride('Reaberto')
    setMensagensEnviadas((current) => [...current, { data, hora, titulo: 'Chamado reaberto', descricao: 'Você reabriu esta solicitação. Nossa equipe retomará o atendimento em breve.' }])
    setShowReopenModal(false)
  }

  if (!solicitacao) {
    return (
      <RestrictedAreaPageFrame area="provider" breadcrumb="Minhas solicitações" loggedIn={loggedIn} onLogout={onLogout}>
        <div className="reimbursements-page">
          <div className="provider-page-heading">
            <h1>Solicitação não encontrada</h1>
            <p className="page-subtitle">Verifique o link ou volte para a lista de solicitações.</p>
          </div>
          <Link className="text-link provider-detail-back" to="/credenciado/minhas-solicitacoes">
            <ArrowLeft aria-hidden="true" /> Voltar para Minhas solicitações
          </Link>
        </div>
      </RestrictedAreaPageFrame>
    )
  }

  return (
    <RestrictedAreaPageFrame area="provider" breadcrumb="Minhas solicitações" loggedIn={loggedIn} onLogout={onLogout}>
      <div className="reimbursements-page">
        <Link className="text-link provider-detail-back" to="/credenciado/minhas-solicitacoes">
          <ArrowLeft aria-hidden="true" /> Voltar para Minhas solicitações
        </Link>
        <div className="provider-page-heading">
          <h1>Acompanhamento da solicitação</h1>
          <p className="page-subtitle">Protocolo, dados enviados e atualizações de {solicitacao.servico.toLowerCase()}.</p>
        </div>

        <section className="reimbursement-card" aria-label="Resumo da solicitação">
          <div className="solicitacao-protocol-plain">
            <span>Nº do protocolo</span>
            <strong>{solicitacao.id}</strong>
          </div>
          <div className="reimbursement-form-section">
            <dl className="service-review-grid">
              <div className="service-review-row"><dt>Serviço</dt><dd>{solicitacao.servico}</dd></div>
              <div className="service-review-row"><dt>Categoria</dt><dd>{solicitacao.categoria}</dd></div>
              <div className="service-review-row"><dt>Data de abertura</dt><dd>{solicitacao.data}</dd></div>
              <div className="service-review-row">
                <dt>Situação</dt>
                <dd><span className={solicitacaoStatusBadge(statusAtual)}>{solicitacaoStatusLabel(statusAtual)}</span></dd>
              </div>
            </dl>
          </div>
        </section>

        <div className="solicitacao-detail-stack">
          <details className="solicitacao-accordion" open>
            <summary>Detalhes da solicitação</summary>
            <dl className="service-review-grid">
              {solicitacao.formulario.map((field) => (
                <div className="service-review-row" key={field.label}>
                  <dt>{field.label}</dt>
                  <dd>{field.value}</dd>
                </div>
              ))}
            </dl>
          </details>

          <details className="solicitacao-accordion">
            <summary>Anexos ({solicitacao.anexos.length})</summary>
            {solicitacao.anexos.length > 0 ? (
              <ul className="solicitacao-attachment-list">
                {solicitacao.anexos.map((anexo) => (
                  <AnexoItem key={anexo} nome={anexo} onNotice={setNotice} />
                ))}
              </ul>
            ) : (
              <p className="page-subtitle">Nenhum arquivo anexado a esta solicitação.</p>
            )}
          </details>

          <section className="reimbursement-card solicitacao-detail-chat" aria-label="Atividade do chamado">
            <h3>Atividade do chamado</h3>
            <ol className="solicitacao-timeline">
              {(() => {
                const historico = [...solicitacao.atualizacoes].reverse().concat(mensagensEnviadas)
                return historico.map((item, index) => (
                  <li
                    key={`${item.data}-${item.titulo}-${index}`}
                    className={[
                      index === historico.length - 1 ? 'is-latest' : '',
                      item.autor === 'atendente' ? 'is-atendente' : '',
                      item.autor === 'beneficiario' ? 'is-beneficiario' : '',
                    ].filter(Boolean).join(' ')}
                  >
                    <span className="solicitacao-timeline-marker" aria-hidden="true">
                      {item.autor === 'atendente' ? (
                        <Headphones aria-hidden="true" />
                      ) : item.autor === 'beneficiario' ? (
                        <UserRound aria-hidden="true" />
                      ) : (
                        <CheckCircle2 aria-hidden="true" />
                      )}
                    </span>
                    <div>
                      <div className="solicitacao-timeline-heading">
                        <strong>{item.titulo}</strong>
                        <time>{item.data}{item.hora ? ` ${item.hora}` : ''}</time>
                      </div>
                      <p>{item.descricao}</p>
                      {item.anexos && item.anexos.length > 0 && (
                        <ul className="solicitacao-attachment-list solicitacao-timeline-attachments">
                          {item.anexos.map((anexo) => (
                            <AnexoItem key={anexo} nome={anexo} onNotice={setNotice} />
                          ))}
                        </ul>
                      )}
                    </div>
                  </li>
                ))
              })()}
            </ol>

            {solicitacaoConcluida(statusAtual) ? (
              <div className="solicitacao-reopen-action">
                <button className="secondary-button" type="button" onClick={() => setShowReopenModal(true)}>
                  <RotateCcw aria-hidden="true" /> Reabrir chamado
                </button>
              </div>
            ) : (
              <ChatMessageComposer value={novaMensagem} onChange={setNovaMensagem} onSubmit={handleEnviarMensagem} />
            )}
          </section>
        </div>

        {notice && <p className="action-notice" role="status">{notice}</p>}

        {solicitacaoConcluida(statusAtual) && <SolicitacaoRating requestId={solicitacao.id} />}

        {showReopenModal && (
          <div className="go-modal-overlay" role="presentation" onClick={() => setShowReopenModal(false)}>
            <div className="go-modal" role="dialog" aria-modal="true" aria-labelledby="provider-reopen-modal-title" onClick={(event) => event.stopPropagation()}>
              <div className="go-modal-header">
                <h2 id="provider-reopen-modal-title">Reabrir solicitação</h2>
                <button className="go-modal-close" type="button" onClick={() => setShowReopenModal(false)} aria-label="Fechar">
                  <X aria-hidden="true" />
                </button>
              </div>
              <div className="go-modal-body">
                <p>Tem certeza que deseja reabrir esta solicitação? O atendimento será retomado e você poderá enviar novas mensagens ao atendente.</p>
                <div className="reimbursement-actions">
                  <button className="secondary-button" type="button" onClick={() => setShowReopenModal(false)}>Cancelar</button>
                  <button className="primary-button" type="button" onClick={handleConfirmarReabertura}>
                    <RotateCcw aria-hidden="true" /> Reabrir chamado
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </RestrictedAreaPageFrame>
  )
}
