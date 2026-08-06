import { Fragment, useEffect, useRef, useState, type ChangeEvent, type FormEvent, type KeyboardEvent } from 'react'
import {
  Accessibility,
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Bell,
  Brain,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Clock,
  Copy,
  Download,
  Dumbbell,
  FileImage,
  FileText,
  Heart,
  HeartPulse,
  Mail,
  MapPin,
  MessageCircle,
  CircleDollarSign,
  ClipboardList,
  Eye,
  HandCoins,
  HandHeart,
  Headphones,
  HelpCircle,
  IdCard,
  MonitorCheck,
  PersonStanding,
  Plus,
  RotateCcw,
  Save,
  Search,
  Send,
  ShieldCheck,
  Smartphone,
  Speech,
  Star,
  Stethoscope,
  Undo2,
  UserPlus,
  UserRound,
  WalletCards,
  Waves,
  X,
  type LucideIcon,
} from 'lucide-react'
import { getCmsSlideshow } from '../cms/siteContentRepository'
import { Link, Navigate, Outlet, useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  Breadcrumb,
  EmptyState,
  Footer,
  Header,
  MainMenu,
  ProviderSearch,
  Sidebar,
} from '../components/PortalComponents'
import {
  beneficiaries,
  beneficiaryRequests,
  cardData,
  news,
  providers,
  type BeneficiaryRequest,
  type SavedPreference,
} from '../data/mock'
import {
  defaultUserProfile,
  getStoredUserProfile,
  saveStoredUserProfile,
  type UserProfile,
} from '../utils/userProfile'
import { ResultsHeader } from '../components/ResultsHeader'
import { BrazilianDateInput } from '../components/BrazilianDateInput'
import { FileAttachmentField } from '../components/FileAttachmentField'
import { WizardSteps } from '../components/serviceRequestWizardComponents'
import { DEFAULT_SUCCESS_SECONDARY_ACTION, type WizardStep } from '../components/serviceRequestWizardHelpers'
import { generateProtocolNumber } from '../utils/protocol'
import { maskCpfCnpj, maskCurrency } from '../utils/inputMasks'
import {
  getStoredNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  markNotificationUnread,
  sortNotifications,
  type BeneficiaryNotification,
} from '../utils/notifications'
import {
  getFavoriteState,
  removeProviderRating,
  saveFavoriteState,
  setRequestRating,
  toggleFavoriteNews,
  toggleFavoriteService,
  type FavoriteState,
} from '../utils/favorites'
import { Combobox } from '../components/Combobox'
import { ChatMessageComposer } from '../components/ChatMessageComposer'
import { getStoredSession } from '../utils/session'
import { pluralCount, pluralize } from '../utils/plural'
import {
  SOLICITACOES_PAGE_SIZE_OPTIONS,
  solicitacaoConcluida,
  solicitacaoRatingLabels,
  solicitacaoStatusBadge,
  solicitacaoStatusLabel,
  type MinhasSolicitacaoAtualizacao,
  type MinhasSolicitacaoFormField,
  type MinhasSolicitacaoStatus,
} from '../utils/solicitacoes'
import { NewsCard } from './HomePage'
import { NewsDateRangePicker } from './PublicPages'

const whatsAppConfirmed = false

function dateValue(date: string) {
  const [day, month, year] = date.split('/').map(Number)
  return new Date(year, month - 1, day).getTime()
}

const pageNames: Record<string, string> = {
  beneficiario: 'Beneficiário',
  'visao-geral': 'Beneficiário',
  carteirinhas: 'Carteirinhas',
  'rede-credenciada': 'Rede credenciada',
  servicos: 'Catálogo de serviços',
  solicitacoes: 'Minhas solicitações',
  'minhas-solicitacoes': 'Minhas solicitações',
  'nova-solicitacao': 'Nova solicitação',
  autorizacoes: 'Autorizações',
  reembolsos: 'Reembolso e auxílios',
  'despesas-e-extratos': 'Despesas e custeios',
  'comprovante-irpf': 'Comprovante IRPF',
  'meus-dados': 'Meus dados',
  dependentes: 'Dependentes',
  notificacoes: 'Notificações',
  'minhas-preferencias': 'Meus favoritos',
  'duvidas-frequentes': 'Dúvidas frequentes',
}

const beneficiaryCampaigns = [
  {
    title: 'Conheça novos credenciados disponíveis para você',
    description:
      'Veja profissionais, clínicas e serviços incluídos recentemente na rede credenciada do Plan-Assiste.',
    action: 'Consultar rede',
    to: '/rede-credenciada',
    tone: 'green',
  },
  {
    title: 'Sua carteirinha do Plan-Assiste sempre à mão',
    description:
      'Acesse, baixe ou compartilhe a sua carteirinha e a dos seus dependentes com mais praticidade.',
    action: 'Ver carteirinha',
    to: '/beneficiario/carteirinhas',
    tone: 'teal',
  },
  {
    title: 'Baixe o novo app do Plan-Assiste',
    description:
      'Tenha serviços, carteirinhas, rede credenciada e notificações importantes em um só lugar.',
    action: 'Conhecer recursos',
    to: 'https://planassiste-app.vercel.app',
    tone: 'blue',
  },
]

const beneficiaryDashboardCards = [
  {
    title: 'Solicitar reembolso',
    description: 'Envie documentos e registre uma nova solicitação de reembolso.',
    to: '/beneficiario/reembolso-procedimentos/nova-solicitacao',
    action: 'Iniciar solicitação',
    icon: HandCoins,
  },
  {
    title: 'Autorizações',
    description: 'Consulte os tipos de autorização e acesse o formulário específico para cada serviço.',
    to: '/beneficiario/autorizacoes',
    action: 'Ver autorizações',
    icon: ClipboardCheck,
  },
  {
    title: 'Encontrar credenciado',
    description: 'Pesquise profissionais e estabelecimentos da rede credenciada.',
    to: '/rede-credenciada',
    action: 'Pesquisar na rede',
    icon: Stethoscope,
  },
  {
    title: 'Acessar carteirinha',
    description: 'Consulte, baixe ou compartilhe sua carteirinha e as dos dependentes.',
    to: '/beneficiario/carteirinhas',
    action: 'Abrir carteirinhas',
    icon: IdCard,
  },
  {
    title: 'Acompanhar solicitação',
    description: 'Consulte protocolos, pendências e o andamento dos pedidos enviados.',
    to: '/beneficiario/solicitacoes',
    action: 'Ver solicitações',
    icon: Clock,
  },
  {
    title: 'Emitir comprovante IRPF',
    description: 'Acesse informes e comprovantes para a declaração do Imposto de Renda.',
    to: '/beneficiario/comprovante-irpf',
    action: 'Emitir comprovante',
    icon: FileText,
  },
]

const beneficiaryAuthorizationGroups = [
  {
    title: 'Cirurgia eletiva',
    cards: [
      {
        title: 'Autorização de cirurgia eletiva',
        text: 'Anexe o pedido ou relatório médico, os laudos de exames e os demais documentos relacionados ao diagnóstico.',
        to: '/beneficiario/servicos/autorizacao-cirurgia/nova-solicitacao',
        icon: HeartPulse,
      },
    ],
  },
  {
    title: 'Tratamentos seriados',
    cards: [
      { title: 'Acupuntura', text: 'Solicite o tratamento e envie a documentação clínica necessária. Pode haver perícia quando os limites de frequência forem ultrapassados.', to: '/beneficiario/servicos/acupuntura/nova-solicitacao', icon: Activity },
      { title: 'Fisioterapia', text: 'Solicite o tratamento e informe a frequência indicada. Pedidos acima dos limites de sessões podem exigir perícia preliminar.', to: '/beneficiario/servicos/fisioterapia/nova-solicitacao', icon: Dumbbell },
      { title: 'Fonoaudiologia', text: 'Envie o relatório com diagnóstico, frequência indicada e tempo previsto de tratamento.', to: '/beneficiario/servicos/fonoaudiologia/nova-solicitacao', icon: Speech },
      { title: 'Psicologia', text: 'Solicite o tratamento e informe a frequência indicada. Pedidos acima dos limites de sessões podem exigir perícia preliminar.', to: '/beneficiario/servicos/psicologia/nova-solicitacao', icon: Brain },
      { title: 'Terapia ocupacional', text: 'Solicite o tratamento e informe a frequência indicada. Pedidos acima dos limites de sessões podem exigir perícia preliminar.', to: '/beneficiario/servicos/terapia-ocupacional/nova-solicitacao', icon: HandHeart },
      { title: 'Pilates', text: 'Solicite o tratamento indicado por profissional habilitado e envie a documentação clínica necessária.', to: '/beneficiario/servicos/pilates/nova-solicitacao', icon: PersonStanding },
      { title: 'Hidroterapia', text: 'Informe a frequência indicada e envie a documentação clínica. Alguns pedidos podem exigir perícia.', to: '/beneficiario/servicos/hidroterapia/nova-solicitacao', icon: Waves },
      { title: 'RPG', text: 'Informe a frequência indicada e envie a documentação clínica. Alguns pedidos podem exigir perícia.', to: '/beneficiario/servicos/rpg/nova-solicitacao', icon: Accessibility },
    ],
  },
  {
    title: 'Órteses, próteses e materiais (OPME)',
    cards: [
      {
        title: 'Autorização de OPME',
        text: 'Solicite autorização para órteses, próteses e materiais especiais indicados em procedimento.',
        to: '/beneficiario/servicos/autorizacao-opme/nova-solicitacao',
        icon: Stethoscope,
      },
    ],
  },
]

export function BeneficiaryLayout({ onLogout }: { onLogout: () => void }) {
  const location = useLocation()
  if (location.pathname.includes('/beneficiario/rede-credenciada')) {
    const publicNetworkPath = location.pathname.replace('/beneficiario/rede-credenciada', '/rede-credenciada')
    return <Navigate to={`${publicNetworkPath}${location.search}${location.hash}`} replace />
  }

  const relativePath = location.pathname.replace(/^\/beneficiario\/?/, '')
  const slug = relativePath.split('/')[0] || 'beneficiario'

  return (
    <>
      <Header loggedIn onLogout={onLogout} />
      <MainMenu loggedIn />
      <div className="container">
        <Breadcrumb current={pageNames[slug] || 'Beneficiários'} />
        <div className="beneficiary-grid beneficiary-workspace">
          <Sidebar onLogout={onLogout} />
          <main className="beneficiary-main">
            <Outlet />
          </main>
        </div>
      </div>
      <Footer />
    </>
  )
}

function BeneficiaryCampaignCarousel() {
  const managed = getCmsSlideshow('beneficiary')
  const campaigns = managed.length ? managed.map((item) => ({ title: item.title, description: item.description, action: item.actionLabel, to: item.destination, tone: item.tone })) : beneficiaryCampaigns
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const campaign = campaigns[active] || campaigns[0]
  const isExternalDestination = /^https?:\/\//i.test(campaign.to)

  useEffect(() => {
    if (paused) return

    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % campaigns.length)
    }, 7000)

    return () => window.clearInterval(timer)
  }, [paused, campaigns.length])

  function previousCampaign() {
    setActive((current) => (current - 1 + campaigns.length) % campaigns.length)
  }

  function nextCampaign() {
    setActive((current) => (current + 1) % campaigns.length)
  }

  return (
    <section
      className={`beneficiary-campaign tone-${campaign.tone}`}
      aria-roledescription="carrossel"
      aria-label="Campanhas para beneficiários"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="beneficiary-campaign-copy" aria-live="polite">
        <h1>{campaign.title}</h1>
        <p>{campaign.description}</p>
        {isExternalDestination ? (
          <a className="beneficiary-campaign-link" href={campaign.to} target="_blank" rel="noreferrer">
            {campaign.action}<ArrowRight aria-hidden="true" />
          </a>
        ) : (
          <Link className="beneficiary-campaign-link" to={campaign.to}>
            {campaign.action}<ArrowRight aria-hidden="true" />
          </Link>
        )}
      </div>

      <div className="beneficiary-campaign-controls">
        <button type="button" onClick={previousCampaign} aria-label="Campanha anterior">
          <ChevronLeft />
        </button>
        <div className="beneficiary-campaign-dots" role="tablist" aria-label="Selecionar campanha">
          {campaigns.map((item, index) => (
            <button
              type="button"
              role="tab"
              aria-selected={index === active}
              className={index === active ? 'is-active' : ''}
              aria-label={`Mostrar campanha: ${item.title}`}
              key={item.title}
              onClick={() => setActive(index)}
            />
          ))}
        </div>
        <button type="button" onClick={nextCampaign} aria-label="Próxima campanha">
          <ChevronRight />
        </button>
      </div>
    </section>
  )
}

export function OverviewPage() {
  const [notifications, setNotifications] = useState<BeneficiaryNotification[]>(() => getStoredNotifications())
  const [favoriteState, setFavoriteState] = useState<FavoriteState>(() => getFavoriteState())
  const unreadNotifications = notifications.filter((notification) => !notification.read)
  const criticalNotifications = unreadNotifications.filter((notification) => notification.pinned)
  const regularUnreadNotifications = unreadNotifications.filter((notification) => !notification.pinned)
  const recentNews = [...news].sort((first, second) => dateValue(second.date) - dateValue(first.date)).slice(0, 4)

  useEffect(() => {
    function syncNotifications() {
      setNotifications(getStoredNotifications())
    }

    window.addEventListener('planAssisteNotificationsUpdated', syncNotifications)
    window.addEventListener('storage', syncNotifications)
    return () => {
      window.removeEventListener('planAssisteNotificationsUpdated', syncNotifications)
      window.removeEventListener('storage', syncNotifications)
    }
  }, [])

  useEffect(() => {
    function syncFavorites() {
      setFavoriteState(getFavoriteState())
    }

    window.addEventListener('planAssisteFavoritesUpdated', syncFavorites)
    window.addEventListener('storage', syncFavorites)
    return () => {
      window.removeEventListener('planAssisteFavoritesUpdated', syncFavorites)
      window.removeEventListener('storage', syncFavorites)
    }
  }, [])

  function markDashboardNotificationsRead() {
    regularUnreadNotifications.forEach((notification) => markNotificationRead(notification.id))
    setNotifications(getStoredNotifications())
  }

  function acknowledgeCriticalNotifications() {
    criticalNotifications.forEach((notification) => markNotificationRead(notification.id))
    setNotifications(getStoredNotifications())
  }

  return (
    <div className="overview-page">
      {criticalNotifications.length > 0 && (
        <CriticalNotificationDialog
          notifications={criticalNotifications}
          onAcknowledge={acknowledgeCriticalNotifications}
        />
      )}

      <BeneficiaryCampaignCarousel />

      {regularUnreadNotifications.length > 0 && (
        <section className="beneficiary-notification-summary" aria-labelledby="beneficiary-notification-summary-title">
          <div className="beneficiary-notification-summary-icon" aria-hidden="true">
            <Bell />
          </div>
          <div>
            <p className="eyebrow">Atenção</p>
            <h2 id="beneficiary-notification-summary-title">
              {regularUnreadNotifications.length === 1
                ? 'Você tem uma notificação não lida'
                : `Você tem ${regularUnreadNotifications.length} notificações não lidas`}
            </h2>
            <p>Consulte avisos sobre solicitações, documentos e informações importantes do plano.</p>
          </div>
          <div className="beneficiary-notification-summary-actions">
            <Link to="/beneficiario/notificacoes">Ver notificações <ArrowRight aria-hidden="true" /></Link>
            <button type="button" onClick={markDashboardNotificationsRead}>Marcar como lidas</button>
          </div>
        </section>
      )}

      <section className="overview-intro" aria-labelledby="beneficiary-overview-title">
        <div>
          <h1 id="beneficiary-overview-title">Área do beneficiário</h1>
          <p>
            Acesse os serviços mais usados, acompanhe solicitações, consulte sua carteirinha e encontre orientações para usar o Plan-Assiste com mais segurança.
          </p>
        </div>
      </section>

      <section className="beneficiary-dashboard-section" aria-labelledby="beneficiary-dashboard-title">
        <div className="section-heading">
          <h2 id="beneficiary-dashboard-title">O que você precisa fazer?</h2>
        </div>
        <div className="beneficiary-dashboard-grid">
          {beneficiaryDashboardCards.map((card) => {
            const Icon = card.icon
            return (
              <Link className="beneficiary-dashboard-card" to={card.to} key={card.title}>
                <Icon aria-hidden="true" />
                <h3>{card.title}</h3>
                <p>{card.description}</p>
                <span>{card.action} <ArrowRight aria-hidden="true" /></span>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="beneficiary-section" id="noticias-beneficiario" data-reveal>
        <div className="section-heading">
          <h2>Notícias</h2>
          <Link to="/noticias">Ver mais →</Link>
        </div>
        <div className="news-grid news-grid-four">
          {recentNews.map((item) => (
            <NewsCard
              key={item.title}
              {...item}
              favorite={favoriteState.favoriteNewsIds.includes(item.id)}
              onFavorite={() => setFavoriteState(toggleFavoriteNews(item.id))}
            />
          ))}
        </div>
      </section>

      <ProviderSearch context="beneficiary" />

      <section className="beneficiary-section overview-guidance-grid" aria-label="Orientações e transparência" data-reveal>
        <Link className="overview-guidance-card" to="/plan-assiste/quem-pode-aderir">
          <HelpCircle aria-hidden="true" />
          <h2>Uso consciente do Plan-Assiste</h2>
          <p>Orientações para utilizar a rede, serviços e coberturas com responsabilidade e segurança.</p>
          <span>Saiba mais <ArrowRight aria-hidden="true" /></span>
        </Link>
        <Link className="overview-guidance-card" to="/transparencia">
          <CircleDollarSign aria-hidden="true" />
          <h2>Painéis de receitas e despesas</h2>
          <p>Espaço para acompanhar informações de transparência, prestação de contas e sustentabilidade do Programa.</p>
          <span>Saiba mais <ArrowRight aria-hidden="true" /></span>
        </Link>
        <Link className="overview-guidance-card" to="/plan-assiste/sobre-o-plan-assiste">
          <UserRound aria-hidden="true" />
          <h2>Autogestão</h2>
          <p>Conteúdo de apoio para entender o modelo de autogestão e a participação dos beneficiários.</p>
          <span>Saiba mais <ArrowRight aria-hidden="true" /></span>
        </Link>
      </section>
    </div>
  )
}

function CriticalNotificationDialog({
  notifications,
  onAcknowledge,
}: {
  notifications: BeneficiaryNotification[]
  onAcknowledge: () => void
}) {
  const dialogRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialogRef.current?.focus()
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [])

  function keepFocusInside(event: KeyboardEvent<HTMLElement>) {
    if (event.key !== 'Tab') return
    const button = event.currentTarget.querySelector<HTMLButtonElement>('button')
    if (!button) return
    if (event.shiftKey || document.activeElement === button) {
      event.preventDefault()
      if (event.shiftKey) button.focus()
      else dialogRef.current?.focus()
    }
  }

  return (
    <div className="critical-notification-backdrop">
      <section ref={dialogRef} className="critical-notification-dialog" role="alertdialog" aria-modal="true" aria-labelledby="critical-notification-title" aria-describedby="critical-notification-description" tabIndex={-1} onKeyDown={keepFocusInside}>
        <div className="critical-notification-heading">
          <span aria-hidden="true"><Bell /></span>
          <div>
            <p className="eyebrow">Comunicado importante</p>
            <h2 id="critical-notification-title">Leia antes de continuar</h2>
            <p id="critical-notification-description">Estas informações precisam da sua confirmação de leitura.</p>
          </div>
        </div>
        <div className="critical-notification-list">
          {sortNotifications(notifications).map((notification) => (
            <article key={notification.id}>
              <small>{notification.category} · {notification.date}</small>
              <h3>{notification.title}</h3>
              <p>{notification.summary}</p>
            </article>
          ))}
        </div>
        <button type="button" onClick={onAcknowledge}>
          Li e estou ciente
        </button>
      </section>
    </div>
  )
}

const requestCategories = ['Todos', 'Cadastro', 'Autorizações', 'Reembolso e auxílios', 'Financeiro', 'Documentos', 'Orientações e canais', 'Cobertura', 'Fale Conosco']
const requestCategoryLabel: Record<string, string> = {
  'Orientações e canais': 'Orientações',
}
function categorySlug(category: string) {
  return category
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .toLowerCase()
    .replace(/^-|-$/g, '')
}

export function RequestsPage() {
  const pageSize = 18
  const [category, setCategory] = useState('Todos')
  const [sort, setSort] = useState<'az' | 'za'>('az')
  const [query, setQuery] = useState('')
  const [onlyFavorites, setOnlyFavorites] = useState(false)
  const [onlyRequestable, setOnlyRequestable] = useState(false)
  const [page, setPage] = useState(1)
  const [favoriteState, setFavoriteState] = useState<FavoriteState>(() => getFavoriteState())

  const normalizedQuery = query
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()

  const visibleRequests = beneficiaryRequests
    .filter((request) => request.category !== 'Rede e atendimento')
    .filter((request) => category === 'Todos' || request.category === category)
    .filter((request) => !onlyFavorites || favoriteState.favoriteServiceIds.includes(request.id))
    .filter((request) => !onlyRequestable || request.route?.includes('nova-solicitacao'))
    .filter((request) => {
      if (!normalizedQuery) return true
      const target = `${request.title} ${request.description} ${request.category} ${request.tags.join(' ')}`
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
      return target.includes(normalizedQuery)
    })
    .sort((first, second) => sort === 'az'
      ? first.title.localeCompare(second.title, 'pt-BR')
      : second.title.localeCompare(first.title, 'pt-BR'))
  const totalPages = Math.max(1, Math.ceil(visibleRequests.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const paginatedRequests = visibleRequests.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  useEffect(() => {
    function syncFavorites() {
      setFavoriteState(getFavoriteState())
    }

    window.addEventListener('planAssisteFavoritesUpdated', syncFavorites)
    window.addEventListener('storage', syncFavorites)
    return () => {
      window.removeEventListener('planAssisteFavoritesUpdated', syncFavorites)
      window.removeEventListener('storage', syncFavorites)
    }
  }, [])

  return (
    <div className="requests-page">
      <div className="provider-page-heading">
        <h1>Catálogo de serviços</h1>
        <p className="page-subtitle">
          Encontre serviços, solicitações, documentos e orientações do Plan-Assiste em um só lugar.
        </p>
      </div>

      <section className="request-toolbar" aria-label="Filtros de serviços e solicitações">
        <label>
          Buscar
          <input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1) }} placeholder="Digite serviço, assunto ou palavra-chave" />
        </label>
        <label>
          Assunto
          <select value={category} onChange={(event) => { setCategory(event.target.value); setPage(1) }}>
            {requestCategories.map((item) => <option value={item} key={item}>{requestCategoryLabel[item] ?? item}</option>)}
          </select>
        </label>
        <label>
          Ordenar
          <select value={sort} onChange={(event) => { setSort(event.target.value as 'az' | 'za'); setPage(1) }}>
            <option value="az">Nome A-Z</option>
            <option value="za">Nome Z-A</option>
          </select>
        </label>
        <button className="filter-clear-button" type="button" onClick={() => { setCategory('Todos'); setQuery(''); setSort('az'); setOnlyFavorites(false); setOnlyRequestable(false); setPage(1) }}>Limpar filtros</button>
      </section>
      <div className="topic-filter-buttons" aria-label="Filtrar serviços por assunto">
        {requestCategories.map((item) => <button type="button" className={category === item ? 'selected' : ''} aria-pressed={category === item} onClick={() => { setCategory(item); setPage(1) }} key={item}>{requestCategoryLabel[item] ?? item}</button>)}
      </div>

      <ResultsHeader
        title="Serviços disponíveis"
        countLabel={`${visibleRequests.length} ${pluralize(visibleRequests.length, 'item encontrado', 'itens encontrados')}`}
        showPrint={false}
        extraActions={(
          <div className="catalog-quick-filters" aria-label="Filtros rápidos">
            <label><input type="checkbox" checked={onlyRequestable} onChange={(event) => { setOnlyRequestable(event.target.checked); setPage(1) }} /> Solicitações</label>
            <label><input type="checkbox" checked={onlyFavorites} onChange={(event) => { setOnlyFavorites(event.target.checked); setPage(1) }} /> Favoritos</label>
          </div>
        )}
      />

      <section className="request-card-grid services-card-grid" aria-label="Lista de serviços">
        {paginatedRequests.map((request) => (
          <RequestCard
            request={request}
            key={request.id}
            favorite={favoriteState.favoriteServiceIds.includes(request.id)}
            onFavorite={() => setFavoriteState(toggleFavoriteService(request.id))}
          />
        ))}
      </section>

      {totalPages > 1 && (
        <nav className="provider-pagination services-pagination" aria-label="Paginação do catálogo de serviços">
          <button type="button" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>
            <ChevronLeft aria-hidden="true" /> Anterior
          </button>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
            <button
              type="button"
              className={currentPage === pageNumber ? 'selected' : ''}
              aria-current={currentPage === pageNumber ? 'page' : undefined}
              onClick={() => setPage(pageNumber)}
              key={pageNumber}
            >
              {pageNumber}
            </button>
          ))}
          <button type="button" disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)}>
            Próxima <ChevronRight aria-hidden="true" />
          </button>
        </nav>
      )}
    </div>
  )
}

type ReimbursementStatus = 'Documento pendente' | 'Em análise' | 'Aprovado' | 'Pago'

type ReimbursementRecord = {
  id: string
  beneficiary: string
  requestDate: string
  receiptNumber: string
  receiptDate: string
  providerDocument: string
  type: string
  status: ReimbursementStatus
  value: string
  note: string
}

type ReimbursementDraft = {
  type: string
  beneficiary: string
  dependentType: string
  receiptNumber: string
  receiptDate: string
  providerDocument: string
  value: string
  sessions: string
  isPriorityCare: boolean
  notes: string
}

const reimbursementRecords: ReimbursementRecord[] = [
  {
    id: '2026-1842',
    beneficiary: 'Ana Maria de Araújo',
    requestDate: '07/06/2026',
    receiptNumber: 'NF-8841',
    receiptDate: '03/06/2026',
    providerDocument: '12.345.678/0001-90',
    type: 'Consulta médica',
    status: 'Documento pendente',
    value: 'R$ 320,00',
    note: 'Comprovante complementar solicitado.',
  },
  {
    id: '2026-1775',
    beneficiary: 'Maria Olívia Araújo',
    requestDate: '28/05/2026',
    receiptNumber: 'REC-2209',
    receiptDate: '25/05/2026',
    providerDocument: '987.654.321-00',
    type: 'Psicologia',
    status: 'Em análise',
    value: 'R$ 450,00',
    note: 'Aguardando conferência técnica.',
  },
  {
    id: '2026-1602',
    beneficiary: 'Ana Maria de Araújo',
    requestDate: '10/05/2026',
    receiptNumber: 'NF-7712',
    receiptDate: '08/05/2026',
    providerDocument: '23.456.789/0001-10',
    type: 'Exame',
    status: 'Pago',
    value: 'R$ 186,40',
    note: 'Creditado em conta cadastrada.',
  },
]

const dependentTypeByBeneficiary = Object.fromEntries(beneficiaries.map((beneficiary) => [beneficiary.name, beneficiary.relation]))

const initialReimbursementDraft: ReimbursementDraft = {
  type: '',
  beneficiary: beneficiaries[0].name,
  dependentType: beneficiaries[0].relation,
  receiptNumber: '',
  receiptDate: '',
  providerDocument: '',
  value: '',
  sessions: '',
  isPriorityCare: false,
  notes: '',
}

const reimbursementTypes = [
  'Acompanhamento nutricional', 'Acupuntura', 'Avaliação neuropsicológica',
  'Cirurgia com internação', 'Cirurgia sem internação', 'Consulta/Avaliação', 'Equoterapia',
  'Exames', 'Fisioterapia', 'Fonoaudiologia', 'Hidroterapia', 'Honorários individuais',
  'Internação sem cirurgia', 'Medicamentos ambulatoriais', 'Musicoterapia', 'Odontologia',
  'Parto', 'Pilates', 'Psicologia', 'Psicomotricidade', 'Psicopedagogia', 'Quimioterapia',
  'Radioterapia', 'RPG', 'Terapia ocupacional',
]

const medicalDocumentTypes = new Set(reimbursementTypes.filter((type) => !['Acompanhamento nutricional', 'Consulta/Avaliação'].includes(type)))
const expertiseTypes = new Set(['Cirurgia com internação', 'Cirurgia sem internação', 'Honorários individuais', 'Odontologia', 'Pilates', 'Quimioterapia', 'Radioterapia'])

function reimbursementAttachments(type: string, priorityCare: boolean) {
  if (!type) return []
  const attachments = ['Nota fiscal/recibo']
  if (medicalDocumentTypes.has(type)) attachments.push('Pedido ou relatório médico')
  if (expertiseTypes.has(type) || priorityCare) attachments.push('Perícia')
  if (type === 'Odontologia') attachments.push('Orçamento odontológico')
  attachments.push('Documentos adicionais')
  return attachments
}

function statusClass(status: string) {
  return status
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .toLowerCase()
    .replace(/^-|-$/g, '')
}

function reimbursementDateValue(date: string) {
  const [day, month, year] = date.split('/').map(Number)
  return new Date(year, month - 1, day).getTime()
}

const REEMBOLSO_INSTRUCTIONS = [
  'Selecione o tipo de reembolso e o beneficiário atendido para cada procedimento.',
  'Anexe a nota fiscal/recibo e os demais documentos exigidos para o tipo escolhido.',
  'Revise os dados na etapa de Revisão antes de confirmar o envio.',
  'Guarde o número de protocolo gerado para acompanhar sua solicitação.',
]

const REEMBOLSO_FAQ = [
  {
    question: 'Quais documentos preciso anexar?',
    answer: 'Os documentos variam conforme o tipo de reembolso selecionado: nota fiscal ou recibo é sempre exigido, e a depender do procedimento também são solicitados pedido ou relatório médico, perícia e, no caso de tratamento odontológico, orçamento no modelo do Plan-Assiste.',
  },
  {
    question: 'Em quanto tempo recebo o reembolso?',
    answer: 'Após o envio, a solicitação passa por análise e o crédito é feito na conta bancária cadastrada como recebimento de salário do beneficiário titular. Pendências de documentação podem prorrogar esse prazo.',
  },
  {
    question: 'Posso incluir mais de um procedimento na mesma solicitação?',
    answer: 'Sim. Utilize o botão "Adicionar solicitação" para incluir cada procedimento na lista antes de revisar e enviar; todos serão analisados dentro do mesmo protocolo.',
  },
]

export function BeneficiaryNovaReembolsoPage() {
  const profile = getStoredUserProfile()
  const [showForm, setShowForm] = useState(false)
  const [step, setStep] = useState<WizardStep>('form')
  const [draft, setDraft] = useState<ReimbursementDraft>(initialReimbursementDraft)
  const [items, setItems] = useState<ReimbursementDraft[]>([])
  const [attachmentFiles, setAttachmentFiles] = useState<Record<string, File[]>>({})
  const [acceptedTerm, setAcceptedTerm] = useState(false)
  const [notice, setNotice] = useState('')
  const [protocol, setProtocol] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const id = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(id)
  }, [copied])

  function updateDraft<Key extends keyof ReimbursementDraft>(key: Key, value: ReimbursementDraft[Key]) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  function addReimbursementItem() {
    if (!draft.type || !draft.receiptNumber || !draft.receiptDate || !draft.providerDocument || !draft.value) {
      setNotice('Preencha tipo de reembolso, nota/recibo, data, CPF/CNPJ do credenciado e valor para adicionar a solicitação.')
      return
    }
    setItems((current) => [...current, draft])
    setDraft({ ...initialReimbursementDraft, beneficiary: draft.beneficiary, dependentType: draft.dependentType })
    setNotice('Solicitação adicionada à lista. Revise os dados antes de enviar.')
  }

  function addAttachmentFiles(label: string, newFiles: File[]) {
    const invalidType = newFiles.find((file) => file.type !== 'application/pdf')
    const oversized = newFiles.find((file) => file.size > 5 * 1024 * 1024)
    if (invalidType || oversized) {
      setNotice(invalidType ? 'Anexe somente arquivos PDF.' : 'Cada arquivo deve ter no máximo 5 MB.')
      return
    }
    setAttachmentFiles((current) => ({ ...current, [label]: [...(current[label] ?? []), ...newFiles] }))
  }

  function removeAttachmentFile(label: string, index: number) {
    setAttachmentFiles((current) => ({ ...current, [label]: (current[label] ?? []).filter((_, fileIndex) => fileIndex !== index) }))
  }

  function handleContinue(event: FormEvent) {
    event.preventDefault()
    if (items.length === 0) {
      setNotice('Adicione pelo menos uma solicitação antes de continuar.')
      return
    }
    setNotice('')
    setStep('review')
  }

  function handleConfirm() {
    if (!acceptedTerm) {
      setNotice('Aceite o termo de responsabilidade para concluir o envio.')
      return
    }
    setNotice('')
    setProtocol(generateProtocolNumber())
    setStep('success')
  }

  function handleReset() {
    setDraft(initialReimbursementDraft)
    setItems([])
    setAttachmentFiles({})
    setAcceptedTerm(false)
    setNotice('')
    setProtocol('')
    setStep('form')
  }

  const catalogEntry = beneficiaryRequests.find((request) => request.route === '/beneficiario/reembolso-procedimentos/nova-solicitacao')

  if (!showForm) {
    return (
      <div className="reimbursements-page">
        <div className="provider-page-heading">
          <h1>{catalogEntry?.title ?? 'Reembolso de Procedimentos (Livre Escolha)'}</h1>
          {catalogEntry?.description && <p className="page-subtitle">{catalogEntry.description}</p>}
        </div>
        <section className="reimbursement-card">
          <div className="service-intro-faq">
            {REEMBOLSO_FAQ.map((item) => (
              <div key={item.question}>
                <h3>{item.question}</h3>
                <p>{item.answer}</p>
              </div>
            ))}
          </div>
          <div className="service-success-followup">
            <h3>Instruções</h3>
            <ol>
              {REEMBOLSO_INSTRUCTIONS.map((instruction, index) => (
                <li key={instruction}>
                  <span className="service-followup-index">{index + 1}</span> {instruction}
                </li>
              ))}
            </ol>
          </div>
          <div className="reimbursement-actions">
            <button className="primary-button" onClick={() => setShowForm(true)} type="button">
              Iniciar solicitação <ArrowRight aria-hidden="true" />
            </button>
          </div>
        </section>
      </div>
    )
  }

  const heading = (
    <div className="provider-page-heading">
      <h1>Nova solicitação de reembolso</h1>
      <p className="page-subtitle">Preencha os dados do procedimento e anexe os documentos digitalizados.</p>
    </div>
  )

  if (step === 'success') {
    return (
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
                <li><span className="service-followup-index">1</span> Acesse o menu Minhas Solicitações</li>
                <li><span className="service-followup-index">2</span> Localize o protocolo informado</li>
                <li><span className="service-followup-index">3</span> Verifique o status e atualizações</li>
              </ol>
            </div>
            <div className="service-success-actions">
              <button className="primary-button" type="button" onClick={handleReset}>
                <RotateCcw aria-hidden="true" /> Registrar nova solicitação
              </button>
              <Link className="secondary-button" to={DEFAULT_SUCCESS_SECONDARY_ACTION.to}>{DEFAULT_SUCCESS_SECONDARY_ACTION.label}</Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'review') {
    const attachedEntries = Object.entries(attachmentFiles).filter(([, files]) => files.length > 0)
    return (
      <div className="reimbursements-page">
        {heading}
        <div className="service-wizard">
          <WizardSteps current={step} />
          <div className="reimbursement-card service-review">
            <h2>Revise sua solicitação</h2>
            <p className="page-subtitle">Confira os dados informados antes de confirmar o envio.</p>

            <div className="reimbursement-form-section">
              <h3>Identificação do(a) titular</h3>
              <dl className="service-review-grid">
                <div className="service-review-row"><dt>Titular</dt><dd>Ana Maria de Araújo</dd></div>
                <div className="service-review-row"><dt>Matrícula</dt><dd>30003387</dd></div>
                <div className="service-review-row"><dt>Ramo</dt><dd>MPDFT</dd></div>
                <div className="service-review-row"><dt>E-mail</dt><dd>{profile.email}</dd></div>
                <div className="service-review-row"><dt>Telefone com DDD</dt><dd>{profile.phone}</dd></div>
              </dl>
            </div>

            <div className="reimbursement-form-section">
              <h3>Dados bancários</h3>
              <dl className="service-review-grid">
                <div className="service-review-row"><dt>Banco</dt><dd>Banco do Brasil - Nº 001</dd></div>
                <div className="service-review-row"><dt>Agência</dt><dd>3085-6</dd></div>
                <div className="service-review-row"><dt>Conta</dt><dd>19865</dd></div>
                <div className="service-review-row"><dt>DV conta</dt><dd>X</dd></div>
              </dl>
            </div>

            <div className="reimbursement-form-section">
              <h3>Solicitações</h3>
              <div className="reimbursement-table-wrap">
                <table className="reimbursement-table">
                  <thead>
                    <tr>
                      <th>Beneficiário</th><th>Nº nota/recibo</th><th>Data</th>
                      <th>CPF/CNPJ credenciado</th><th>Tipo reembolso</th><th>Qtd sessões</th><th>Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr key={`${item.receiptNumber}-${index}`}>
                        <td>{item.beneficiary}</td><td>{item.receiptNumber}</td><td>{item.receiptDate}</td>
                        <td>{item.providerDocument}</td><td>{item.type}</td>
                        <td>{item.sessions || '-'}</td><td>{item.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="reimbursement-form-section">
              <h3>Anexos</h3>
              <dl className="service-review-grid">
                {attachedEntries.length > 0
                  ? attachedEntries.map(([label, files]) => (
                    <div className="service-review-row" key={label}>
                      <dt>{label}</dt>
                      <dd>{files.map((file) => file.name).join(', ')}</dd>
                    </div>
                  ))
                  : <div className="service-review-row"><dt>Documentos</dt><dd>–</dd></div>}
              </dl>
            </div>

            <label className="responsibility-term">
              <input type="checkbox" checked={acceptedTerm} onChange={(event) => setAcceptedTerm(event.target.checked)} />
              Atesto a prestação do(s) serviço(s) e solicito a autorização para o reembolso da(s) despesa(s) acima discriminada(s), de acordo com o Regulamento Geral do Plan-Assiste e as Normas Complementares que disciplinam a matéria. Declaro que li e concordo com os termos.
            </label>

            {notice && <p className="form-alert alert-danger" role="status">{notice}</p>}

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
    )
  }

  return (
    <div className="reimbursements-page">
      {heading}
      <div className="service-wizard">
        <WizardSteps current={step} />
        <form className="reimbursement-form" onSubmit={handleContinue}>
          <section className="reimbursement-card">
            <h2>Formulário</h2>
            <div className="reimbursement-form-section">
              <h3>Identificação do(a) titular</h3>
              <div className="reimbursement-grid reimbursement-grid-two-columns">
                <label className="wide">Titular<input value="Ana Maria de Araújo" disabled /></label>
                <label>Matrícula<input value="30003387" disabled /></label>
                <label>Ramo<input value="MPDFT" disabled /></label>
                <label>E-mail<input value={profile.email} disabled /></label>
                <label>Telefone com DDD<input value={profile.phone} disabled /></label>
              </div>
              <p className="service-field-hint reimbursement-profile-hint">
                E-mail, telefone e WhatsApp podem ser atualizados em <Link to="/beneficiario/meus-dados">Meus dados</Link>.
              </p>
            </div>

            <div className="reimbursement-form-section">
              <h3>Dados bancários</h3>
              <div className="reimbursement-grid reimbursement-grid-two-columns">
                <label>Banco<input value="Banco do Brasil - Nº 001" disabled /></label>
                <label>Agência<input value="3085-6" disabled /></label>
                <label>Conta<input value="19865" disabled /></label>
                <label>DV conta<input value="X" disabled /></label>
              </div>
              <p className="reimbursement-warning">
                Os dados bancários são obtidos a partir do cadastro do beneficiário titular no Plan-Assiste. Os créditos dos reembolsos são obrigatoriamente creditados na conta de recebimento do salário do beneficiário titular.
                Caso os dados cadastrados refiram-se à conta diversa ou exclusiva para recebimento da remuneração, encaminhe um e-mail para <a href="mailto:seplan-cadastro@mpu.mp.br">seplan-cadastro@mpu.mp.br</a>, informando a matrícula e os novos dados bancários.
              </p>
            </div>

            <div className="reimbursement-form-section">
              <h3>Dados da solicitação</h3>
              <div className="reimbursement-grid">
                <label>
                  Beneficiário atendido
                  <select value={draft.beneficiary} onChange={(event) => setDraft((current) => ({ ...current, beneficiary: event.target.value, dependentType: dependentTypeByBeneficiary[event.target.value] || '' }))}>
                    {beneficiaries.map((beneficiary) => <option key={beneficiary.id}>{beneficiary.name}</option>)}
                  </select>
                </label>
                <label>Tipo de beneficiário<input value={draft.dependentType} disabled /></label>
                <label>
                  <span className="service-field-label-text">Tipo de reembolso</span>
                  <Combobox
                    value={draft.type}
                    options={reimbursementTypes.map((item) => ({ value: item, label: item }))}
                    onSelect={(value) => updateDraft('type', value)}
                    placeholder="Selecione o tipo"
                  />
                </label>
                <label>Nº nota fiscal/recibo<input value={draft.receiptNumber} onChange={(event) => updateDraft('receiptNumber', event.target.value)} placeholder="Ex.: NF-1234" /></label>
                <label>Data da nota fiscal/recibo<BrazilianDateInput value={draft.receiptDate} onChangeValue={(value) => updateDraft('receiptDate', value)} /></label>
                <label>CPF/CNPJ credenciado<input value={draft.providerDocument} onChange={(event) => updateDraft('providerDocument', maskCpfCnpj(event.target.value))} maxLength={18} placeholder="000.000.000-00 ou 00.000.000/0000-00" /></label>
                <label>Valor<input value={draft.value} onChange={(event) => updateDraft('value', maskCurrency(event.target.value))} placeholder="R$ 0,00" /></label>
                <label>Quantidade de sessões<input value={draft.sessions} onChange={(event) => updateDraft('sessions', event.target.value.replace(/\D/g, ''))} placeholder="Se aplicável" /></label>
                <label className="responsibility-term wide">
                  <input type="checkbox" checked={draft.isPriorityCare} onChange={(event) => updateDraft('isPriorityCare', event.target.checked)} />
                  Pessoa com Transtorno do Espectro Autista - TEA, Síndrome de Down - SD ou Paralisia Cerebral - PC
                </label>
                <label className="wide">Observações<textarea value={draft.notes} onChange={(event) => updateDraft('notes', event.target.value)} rows={4} placeholder="Inclua informações que ajudem na análise da solicitação" /></label>
              </div>
            </div>

            <div className="reimbursement-form-section">
              <h3>Anexos</h3>
              <p className="service-field-hint">Formato: PDF, até 5 MB por arquivo. É possível selecionar mais de um arquivo por campo.</p>
              {draft.type ? (
                <div className="checklist-anexos">
                  {reimbursementAttachments(draft.type, draft.isPriorityCare).map((label) => (
                    <div key={label}>
                      {label === 'Orçamento odontológico' && (
                        <p className="service-field-hint">
                          <a href="https://planassiste.mpu.mp.br/beneficiarios/docs-formularios/orcamento_odontologico_Edit.pdf" target="_blank" rel="noreferrer">Baixar modelo</a>
                        </p>
                      )}
                      <FileAttachmentField
                        fullWidth
                        files={attachmentFiles[label] ?? []}
                        label={label}
                        onAdd={(files) => addAttachmentFiles(label, files)}
                        onRemove={(index) => removeAttachmentFile(label, index)}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="page-subtitle wide">Selecione o tipo de reembolso para ver os documentos necessários.</p>
              )}
            </div>

            <div className="reimbursement-actions">
              <button className="secondary-button" type="button" onClick={addReimbursementItem}><ClipboardList aria-hidden="true" /> Adicionar solicitação</button>
            </div>

            {items.length > 0 && (
              <div className="reimbursement-table-wrap reimbursement-items-table">
                <table className="reimbursement-table">
                  <thead>
                    <tr>
                      <th>Beneficiário</th><th>Nº nota/recibo</th><th>Data</th>
                      <th>CPF/CNPJ credenciado</th><th>Tipo reembolso</th><th>Qtd sessões</th><th>Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr key={`${item.receiptNumber}-${index}`}>
                        <td>{item.beneficiary}</td><td>{item.receiptNumber}</td><td>{item.receiptDate}</td>
                        <td>{item.providerDocument}</td><td>{item.type}</td>
                        <td>{item.sessions || '-'}</td><td>{item.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {notice && <p className="action-notice" role="status">{notice}</p>}

            <div className="reimbursement-actions">
              <button className="primary-button" type="submit"><ArrowRight aria-hidden="true" /> Continuar</button>
              <button type="button" onClick={() => { setDraft(initialReimbursementDraft); setItems([]); setAttachmentFiles({}); setAcceptedTerm(false); setNotice('') }}><RotateCcw aria-hidden="true" /> Limpar formulário</button>
            </div>
          </section>
        </form>
      </div>
    </div>
  )
}

export function BeneficiaryAuthorizationsPage() {
  return (
    <div className="beneficiary-authorizations-page">
      <section className="provider-page-heading">
        <h1>Autorizações</h1>
        <p className="page-subtitle">Consulte os tipos de autorização e inicie a solicitação adequada para cada serviço.</p>
      </section>

      <section className="beneficiary-authorization-intro">
        <p>O acompanhamento dos pedidos é feito em <Link to="/beneficiario/solicitacoes">Minhas solicitações</Link>. Você também receberá notificações conforme a demanda avançar.</p>
      </section>

      {beneficiaryAuthorizationGroups.map((group) => (
        <section className="beneficiary-authorization-group" key={group.title}>
          <h2>{group.title}</h2>
          <div className="beneficiary-authorization-grid">
            {group.cards.map((card) => {
              const Icon = card.icon
              return (
                <Link className="beneficiary-authorization-card" to={card.to} key={card.title}>
                  <Icon aria-hidden="true" />
                  <h3>{card.title}</h3>
                  <p>{card.text}</p>
                  <span>Solicitar autorização <ArrowRight aria-hidden="true" /></span>
                </Link>
              )
            })}
          </div>
        </section>
      ))}

      <section className="beneficiary-authorization-note">
        <h2>Tratamento odontológico</h2>
        <p>Em regra, a autorização é conduzida diretamente pela clínica. Há exceções para cirurgias ortognáticas e procedimentos específicos do Rol da ANS realizados em ambiente hospitalar.</p>
        <p>A coparticipação odontológica, com ou sem internação, é de 50%.</p>
      </section>
    </div>
  )
}

export function ReimbursementsPage() {
  const [periodStart, setPeriodStart] = useState('2026-03-01')
  const [periodEnd, setPeriodEnd] = useState('2026-05-31')
  const [beneficiaryFilter, setBeneficiaryFilter] = useState('Todos')
  const [reimbursementNumber, setReimbursementNumber] = useState('')
  const [typeFilter, setTypeFilter] = useState('Todos')
  const [statusFilter, setStatusFilter] = useState('Todas')
  const [notice, setNotice] = useState('')
  const [appliedFilters, setAppliedFilters] = useState({ periodStart, periodEnd, beneficiaryFilter, reimbursementNumber, typeFilter, statusFilter })

  const filteredRecords = reimbursementRecords.filter((record) => {
    const matchesBeneficiary = appliedFilters.beneficiaryFilter === 'Todos' || record.beneficiary === appliedFilters.beneficiaryFilter
    const recordDate = reimbursementDateValue(record.requestDate)
    const startDate = appliedFilters.periodStart ? new Date(appliedFilters.periodStart).getTime() : Number.NEGATIVE_INFINITY
    const endDate = appliedFilters.periodEnd ? new Date(appliedFilters.periodEnd).getTime() : Number.POSITIVE_INFINITY
    const matchesPeriod = recordDate >= startDate && recordDate <= endDate
    const matchesNumber = !appliedFilters.reimbursementNumber.trim() || record.id.toLowerCase().includes(appliedFilters.reimbursementNumber.trim().toLowerCase())
    const matchesType = appliedFilters.typeFilter === 'Todos' || record.type === appliedFilters.typeFilter
    const matchesStatus = appliedFilters.statusFilter === 'Todas' || record.status === appliedFilters.statusFilter
    return matchesBeneficiary && matchesPeriod && matchesNumber && matchesType && matchesStatus
  })

  const pendingDocuments = reimbursementRecords.filter((record) => record.status === 'Documento pendente').length
  const inAnalysis = reimbursementRecords.filter((record) => record.status === 'Em análise').length
  const approvedOrPaid = reimbursementRecords.filter((record) => ['Aprovado', 'Pago'].includes(record.status)).length

  return (
    <div className="reimbursements-page">
      <div className="provider-page-heading">
        <h1>Reembolso e auxílios</h1>
        <p className="page-subtitle">
          Solicite reembolsos e auxílios, acompanhe pedidos enviados e consulte pendências de documentação.
        </p>
      </div>

      <section className="info-page-grid reimbursement-service-grid" aria-label="Modalidades de reembolso e auxílio">
        <article>
          <HandCoins aria-hidden="true" />
          <h2>Reembolso de Livre Escolha</h2>
          <p>Solicitação, acompanhamento, dúvidas e recurso do reembolso de livre escolha.</p>
          <Link className="text-link" to="/beneficiario/reembolso-procedimentos/nova-solicitacao">Solicitar reembolso <ArrowRight aria-hidden="true" /></Link>
        </article>
        <article>
          <CircleDollarSign aria-hidden="true" />
          <h2>Auxílio para Aquisição de Medicamentos</h2>
          <p>Solicitação e orientações para aquisição de medicamentos.</p>
          <Link className="text-link" to="/beneficiario/servicos/auxilio-aquisicao-medicamentos/nova-solicitacao">Solicitar auxílio <ArrowRight aria-hidden="true" /></Link>
        </article>
        <article>
          <WalletCards aria-hidden="true" />
          <h2>Extrato do auxílio-saúde</h2>
          <p>Consulte o valor do auxílio efetivamente recebido na folha de pagamento.</p>
          <Link className="text-link" to="/beneficiario/reembolsos/extrato-auxilio-saude">Consultar extrato <ArrowRight aria-hidden="true" /></Link>
        </article>
      </section>

      <section className="reimbursement-summary" aria-label="Resumo de reembolsos">
        <article><HandCoins aria-hidden="true" /><strong>{reimbursementRecords.length}</strong><span>solicitações recentes</span></article>
        <article><FileText aria-hidden="true" /><strong>{pendingDocuments}</strong><span>documento pendente</span></article>
        <article><ClipboardList aria-hidden="true" /><strong>{inAnalysis}</strong><span>em análise</span></article>
        <article><BadgeCheck aria-hidden="true" /><strong>{approvedOrPaid}</strong><span>{pluralize(approvedOrPaid, 'aprovado ou pago', 'aprovados ou pagos')}</span></article>
      </section>

      <section className="reimbursement-query" aria-label="Parâmetros para consulta">
        <div className="reimbursement-section-heading">
          <div>
            <h2>Consultar solicitações</h2>
            <p>Filtre por período, beneficiário, número do reembolso, tipo ou situação.</p>
          </div>
          <button className="primary-button" type="button" onClick={() => window.open('/beneficiario/reembolso-procedimentos/nova-solicitacao', '_blank')}>
            <HandCoins aria-hidden="true" /> Solicitar reembolso
          </button>
        </div>
        <div className="reimbursement-filters reimbursement-query-filters">
          <label className="shared-date-range-filter">Período<NewsDateRangePicker startDate={periodStart} endDate={periodEnd} onChange={(start, end) => { setPeriodStart(start); setPeriodEnd(end) }} /></label>
          <label>
            Beneficiário
            <select value={beneficiaryFilter} onChange={(event) => setBeneficiaryFilter(event.target.value)}>
              <option>Todos</option>
              {beneficiaries.map((beneficiary) => <option key={beneficiary.id}>{beneficiary.name}</option>)}
            </select>
          </label>
          <label className="reimbursement-filter-number">Número do reembolso<input value={reimbursementNumber} onChange={(event) => setReimbursementNumber(event.target.value)} placeholder="Ex.: 2026-1842" /></label>
          <label>
            Tipo
            <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
              <option>Todos</option>
              {reimbursementTypes.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label>
            Situação
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option>Todas</option>
              {['Documento pendente', 'Em análise', 'Aprovado', 'Pago'].map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <button type="button" onClick={() => { setPeriodStart(''); setPeriodEnd(''); setBeneficiaryFilter('Todos'); setReimbursementNumber(''); setTypeFilter('Todos'); setStatusFilter('Todas'); setAppliedFilters({ periodStart: '', periodEnd: '', beneficiaryFilter: 'Todos', reimbursementNumber: '', typeFilter: 'Todos', statusFilter: 'Todas' }); setNotice('Filtros removidos.') }}>Limpar</button>
          <button className="primary-button" type="button" onClick={() => { const filters = { periodStart, periodEnd, beneficiaryFilter, reimbursementNumber, typeFilter, statusFilter }; setAppliedFilters(filters); setNotice('Consulta realizada com os filtros informados.') }}>Buscar</button>
        </div>
      </section>

      <section className="reimbursement-card">
        <div className="request-results-heading">
          <h2>Reembolsos solicitados</h2>
          <span>{pluralCount(filteredRecords.length, 'registro encontrado', 'registros encontrados')}</span>
        </div>
        <div className="reimbursement-result-actions" aria-label="Ações para reembolsos solicitados">
          <button type="button" onClick={() => setNotice('Download do extrato de reembolsos simulado.')}><Download aria-hidden="true" /> Fazer download</button>
          <button type="button" onClick={() => setNotice('Impressão do extrato de reembolsos simulada.')}><FileText aria-hidden="true" /> Imprimir</button>
          <button type="button" onClick={() => setNotice('Envio por e-mail simulado.')}><Mail aria-hidden="true" /> Enviar por e-mail</button>
          <button type="button" onClick={() => setNotice('Compartilhamento simulado.')}><Send aria-hidden="true" /> Compartilhar</button>
        </div>
        <div className="reimbursement-table-wrap">
          <table className="reimbursement-table">
            <thead>
              <tr>
                <th>Beneficiário</th>
                <th>Nº reembolso</th>
                <th>Data da solicitação</th>
                <th>Nº recibo/nota</th>
                <th>Data recibo/nota</th>
                <th>Situação</th>
                <th>CPF/CNPJ credenciado</th>
                <th>Tipo</th>
                <th>Valor</th>
                <th>Observações</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record) => (
                <tr key={record.id}>
                  <td>{record.beneficiary}</td>
                  <td>{record.id}</td>
                  <td>{record.requestDate}</td>
                  <td>{record.receiptNumber}</td>
                  <td>{record.receiptDate}</td>
                  <td><span className={`reimbursement-status status-${statusClass(record.status)}`}>{record.status}</span></td>
                  <td>{record.providerDocument}</td>
                  <td>{record.type}</td>
                  <td>{record.value}</td>
                  <td>{record.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {notice && <p className="action-notice" role="status">{notice}</p>}
    </div>
  )
}

type ExpenseRecord = {
  id: string
  month: string
  paymentDate: string
  attendanceDate: string
  guide: string
  patient: string
  provider: string
  expense: number
  copay: number
  beneficiaryId: string
}

type BalanceRecord = {
  id: string
  month: string
  description: string
  reference: string
  charge: number
  discount: number
  adjustment: number
  status: 'Lançado' | 'Programado' | 'Quitado' | 'Estornado'
}

export function HealthAidExtractPage() {
  const [beneficiary, setBeneficiary] = useState('Todos')
  const [startDate, setStartDate] = useState('2026-01-01')
  const [endDate, setEndDate] = useState('2026-03-31')
  const [appliedFilters, setAppliedFilters] = useState({ beneficiary: 'Todos', startDate: '2026-01-01', endDate: '2026-03-31' })
  const [notice, setNotice] = useState('')
  const sourceRecords = [
    { competence: '03/2026', payroll: 'Folha normal 03/2026', beneficiary: 'Ana Maria de Araújo', value: 486.72 },
    { competence: '02/2026', payroll: 'Folha normal 02/2026', beneficiary: 'Ana Maria de Araújo', value: 486.72 },
    { competence: '01/2026', payroll: 'Folha normal 01/2026', beneficiary: 'Carlos Eduardo de Araújo', value: 243.36 },
  ]
  const records = sourceRecords.filter((record) => {
    const [month, year] = record.competence.split('/')
    const competence = `${year}-${month}`
    const matchesBeneficiary = appliedFilters.beneficiary === 'Todos' || record.beneficiary === appliedFilters.beneficiary
    const matchesStart = !appliedFilters.startDate || competence >= appliedFilters.startDate.slice(0, 7)
    const matchesEnd = !appliedFilters.endDate || competence <= appliedFilters.endDate.slice(0, 7)
    return matchesBeneficiary && matchesStart && matchesEnd
  })

  async function exportHealthAidExtract() {
    const { Workbook } = await import('exceljs')
    const workbook = new Workbook()
    const sheet = workbook.addWorksheet('Auxílio-saúde')
    sheet.addRow(['Competência', 'Folha', 'Beneficiário', 'Valor recebido', 'Situação'])
    records.forEach((record) => sheet.addRow([record.competence, record.payroll, record.beneficiary, record.value, 'Recebido']))
    sheet.columns = [{ width: 16 }, { width: 25 }, { width: 34 }, { width: 20 }, { width: 16 }]
    sheet.getColumn(4).numFmt = 'R$ #,##0.00'
    const header = sheet.getRow(1)
    header.font = { bold: true, color: { argb: 'FF004E59' } }
    header.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE9F8F5' } }
    header.alignment = { vertical: 'middle' }
    header.height = 28
    sheet.views = [{ state: 'frozen', ySplit: 1 }]
    const buffer = await workbook.xlsx.writeBuffer()
    const href = URL.createObjectURL(new Blob([buffer as BlobPart], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }))
    const anchor = document.createElement('a')
    anchor.href = href
    anchor.download = `extrato-auxilio-saude-${appliedFilters.startDate || 'inicio'}-a-${appliedFilters.endDate || 'fim'}.xlsx`
    anchor.click()
    URL.revokeObjectURL(href)
    setNotice('Resultado exportado em planilha (.xlsx).')
  }

  return (
    <div className="reimbursements-page">
      <div className="provider-page-heading"><p className="eyebrow">Reembolso e auxílios</p><h1>Extrato do auxílio-saúde</h1><p className="page-subtitle">Consulte os valores recebidos em folha por beneficiário e período.</p></div>
      <section className="reimbursement-query" aria-label="Filtros do extrato">
        <div className="reimbursement-filters health-aid-filters">
          <label>Beneficiário<select value={beneficiary} onChange={(event) => setBeneficiary(event.target.value)}><option>Todos</option>{beneficiaries.map((item) => <option key={item.id}>{item.name}</option>)}</select></label>
          <label className="shared-date-range-filter">Período<NewsDateRangePicker startDate={startDate} endDate={endDate} onChange={(start, end) => { setStartDate(start); setEndDate(end) }} /></label>
          <button className="primary-button" type="button" onClick={() => { setAppliedFilters({ beneficiary, startDate, endDate }); setNotice('Consulta executada com os filtros informados.') }}>Consultar</button>
        </div>
      </section>
      {notice && <p className="form-notice" role="status">{notice}</p>}
      <section className="reimbursement-card health-aid-extract"><div className="request-results-heading"><h2>Valores recebidos</h2><span>{pluralCount(records.length, 'lançamento', 'lançamentos')}</span></div><div className="reimbursement-table-wrap"><table className="reimbursement-table financial-table"><thead><tr><th>Competência</th><th>Folha</th><th>Beneficiário</th><th>Valor recebido</th><th>Situação</th></tr></thead><tbody>{records.length ? records.map((record) => <tr key={`${record.competence}-${record.beneficiary}`}><td>{record.competence}</td><td>{record.payroll}</td><td>{record.beneficiary}</td><td><strong>{formatCurrency(record.value)}</strong></td><td><span className="extract-status status-quitado">Recebido</span></td></tr>) : <tr><td colSpan={5}>Nenhum lançamento encontrado para os filtros informados.</td></tr>}</tbody></table></div><div className="reimbursement-result-actions"><button type="button" onClick={exportHealthAidExtract} disabled={!records.length}><Download aria-hidden="true" /> Exportar dados em planilha (.xlsx)</button></div></section>
    </div>
  )
}

const expenseRecords: ExpenseRecord[] = [
  {
    id: 'exp-001',
    month: '01/2026',
    paymentDate: '31/01/2026',
    attendanceDate: '07/11/2025',
    guide: '112025008',
    patient: 'André Luiz Araújo',
    provider: 'OdontoSorrir',
    expense: 458.72,
    copay: 229.36,
    beneficiaryId: 'andre',
  },
  {
    id: 'exp-002',
    month: '01/2026',
    paymentDate: '31/01/2026',
    attendanceDate: '07/11/2025',
    guide: '112025009',
    patient: 'Maria Olívia Araújo',
    provider: 'OdontoSorrir',
    expense: 458.72,
    copay: 229.36,
    beneficiaryId: 'maria',
  },
  {
    id: 'exp-003',
    month: '02/2026',
    paymentDate: '28/02/2026',
    attendanceDate: '24/06/2025',
    guide: '32801162',
    patient: 'André Luiz Araújo',
    provider: 'Hospital Brasília',
    expense: 224,
    copay: 67.2,
    beneficiaryId: 'andre',
  },
  {
    id: 'exp-004',
    month: '02/2026',
    paymentDate: '28/02/2026',
    attendanceDate: '30/09/2025',
    guide: '33553751',
    patient: 'André Luiz Araújo',
    provider: 'Clínica Saúde & Vida',
    expense: 168,
    copay: 33.6,
    beneficiaryId: 'andre',
  },
  {
    id: 'exp-005',
    month: '02/2026',
    paymentDate: '28/02/2026',
    attendanceDate: '21/10/2025',
    guide: '33780829',
    patient: 'Ana Maria de Araújo',
    provider: 'Clínica Saúde & Vida',
    expense: 168,
    copay: 33.6,
    beneficiaryId: 'ana',
  },
  {
    id: 'exp-006',
    month: '02/2026',
    paymentDate: '28/02/2026',
    attendanceDate: '17/11/2025',
    guide: '33952022',
    patient: 'Ana Maria de Araújo',
    provider: 'Hospital Brasília',
    expense: 151.67,
    copay: 30.33,
    beneficiaryId: 'ana',
  },
  {
    id: 'exp-007',
    month: '02/2026',
    paymentDate: '28/02/2026',
    attendanceDate: '25/11/2025',
    guide: '34000077',
    patient: 'André Luiz Araújo',
    provider: 'Hospital Brasília',
    expense: 168,
    copay: 33.6,
    beneficiaryId: 'andre',
  },
  {
    id: 'exp-008',
    month: '02/2026',
    paymentDate: '28/02/2026',
    attendanceDate: '02/12/2025',
    guide: '34157394',
    patient: 'André Luiz Araújo',
    provider: 'Hospital Brasília',
    expense: 56,
    copay: 11.2,
    beneficiaryId: 'andre',
  },
  {
    id: 'exp-009',
    month: '03/2026',
    paymentDate: '31/03/2026',
    attendanceDate: '14/01/2026',
    guide: '200000109215',
    patient: 'André Luiz Araújo',
    provider: 'Laboratório Exame Certo',
    expense: 728.16,
    copay: 145.67,
    beneficiaryId: 'andre',
  },
]

const balanceRecords: BalanceRecord[] = [
  { id: 'bal-001', month: '01/2026', description: 'Custeio mensal de procedimentos', reference: 'Folha 01/2026', charge: 458.72, discount: 458.72, adjustment: 0, status: 'Quitado' },
  { id: 'bal-002', month: '02/2026', description: 'Custeio mensal de procedimentos', reference: 'Folha 02/2026', charge: 209.53, discount: 209.53, adjustment: 0, status: 'Quitado' },
  { id: 'bal-003', month: '03/2026', description: 'Custeio mensal de procedimentos', reference: 'Folha 03/2026', charge: 145.67, discount: 145.67, adjustment: 0, status: 'Lançado' },
  { id: 'bal-004', month: '04/2026', description: 'Contribuição do plano', reference: 'Folha 04/2026', charge: 0, discount: 389.42, adjustment: 0, status: 'Programado' },
  { id: 'bal-005', month: '03/2026', description: 'Devolução de custeio em folha', reference: 'Estorno da folha 03/2026', charge: 0, discount: 0, adjustment: 115.35, status: 'Estornado' },
]

const irpfStatements = [
  { year: '2026', beneficiaryId: 'ana', paid: 4928.22, copay: 812.37, reimbursements: 1240, issuedAt: '10/06/2026' },
  { year: '2026', beneficiaryId: 'andre', paid: 1784.5, copay: 245.11, reimbursements: 320, issuedAt: '10/06/2026' },
  { year: '2025', beneficiaryId: 'ana', paid: 7312.9, copay: 980.43, reimbursements: 1890, issuedAt: '20/02/2026' },
  { year: '2025', beneficiaryId: 'maria', paid: 2140.75, copay: 316.88, reimbursements: 0, issuedAt: '20/02/2026' },
]

const faqCategories = [
  {
    id: 'cadastro',
    title: 'Cadastro de beneficiários',
    questions: [
      ['Quem pode ser beneficiário do Plan-Assiste?', 'Titulares, dependentes e beneficiários especiais seguem as categorias e condições previstas nas normas do Programa.'],
      ['Como faço para alterar meu endereço?', 'Atualize seus dados em Meus dados. O endereço cadastrado também pode ser usado como referência na Rede credenciada.'],
      ['Como solicito inclusão de dependente?', 'A solicitação deve ser iniciada em Serviços, com envio da documentação exigida para cada vínculo.'],
    ],
  },
  {
    id: 'financeiro',
    title: 'Financeiro',
    questions: [
      ['Onde consulto coparticipação e despesas?', 'Use Despesas e custeios para filtrar por período, beneficiário e tipo de lançamento.'],
      ['Onde baixo o comprovante de IRPF?', 'Acesse Comprovante IRPF, selecione o ano-calendário e o beneficiário desejado.'],
      ['Como acompanho reembolsos?', 'Use a página Reembolsos para consultar protocolo, status e pendências documentais.'],
    ],
  },
  {
    id: 'cobertura',
    title: 'Cobertura',
    questions: [
      ['Como consulto regras de cobertura?', 'Consulte as páginas institucionais e as normas do Plan-Assiste para confirmar cobertura e condições.'],
      ['Há cobertura para atendimento de urgência?', 'A cobertura depende da modalidade e da rede disponível. Em caso de dúvida, use Fale conosco.'],
    ],
  },
  {
    id: 'autorizacoes',
    title: 'Autorização de procedimentos',
    questions: [
      ['Como solicito autorização para exames?', 'Acesse Serviços e escolha Autorização de exames.'],
      ['Como acompanho uma autorização?', 'Na área de solicitações, consulte o protocolo e a situação da demanda.'],
    ],
  },
  {
    id: 'rede',
    title: 'Rede credenciada',
    questions: [
      ['Como consultar a rede credenciada?', 'Use Rede credenciada para buscar por cidade, especialidade, tipo de credenciado e forma de atendimento.'],
      ['Posso consultar redes conveniadas?', 'Sim. A página de Rede credenciada apresenta a rede direta e os principais links para redes conveniadas.'],
    ],
  },
  {
    id: 'carteirinha',
    title: 'Carteirinha virtual',
    questions: [
      ['Posso baixar a carteirinha?', 'Sim. A página Carteirinhas permite baixar, imprimir, enviar por e-mail ou compartilhar.'],
      ['Como vejo a carteirinha dos dependentes?', 'Use o seletor de beneficiário na página Carteirinhas.'],
    ],
  },
]

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function groupExpensesByMonth(records: ExpenseRecord[]) {
  return records.reduce<Record<string, ExpenseRecord[]>>((groups, record) => {
    groups[record.month] = groups[record.month] ? [...groups[record.month], record] : [record]
    return groups
  }, {})
}

function competenceRange(start: string, end: string) {
  if (!start || !end || start > end) return []
  const [startYear, startMonth] = start.split('-').map(Number)
  const [endYear, endMonth] = end.split('-').map(Number)
  const values: string[] = []
  const cursor = new Date(startYear, startMonth - 1, 1)
  const limit = new Date(endYear, endMonth - 1, 1)
  while (cursor <= limit) {
    values.push(`${String(cursor.getMonth() + 1).padStart(2, '0')}/${cursor.getFullYear()}`)
    cursor.setMonth(cursor.getMonth() + 1)
  }
  return values
}

const competenceMonthNames = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

const competenceOptions = Array.from({ length: (new Date().getFullYear() + 2 - 2020 + 1) * 12 }, (_, index) => {
  const year = 2020 + Math.floor(index / 12)
  const monthIndex = index % 12
  return {
    value: `${year}-${String(monthIndex + 1).padStart(2, '0')}`,
    label: `${competenceMonthNames[monthIndex]} de ${year}`,
  }
})

export function ExpensesPage() {
  const [periodStart, setPeriodStart] = useState('2025-01')
  const [periodEnd, setPeriodEnd] = useState('2026-12')
  const [beneficiaryFilter, setBeneficiaryFilter] = useState('Todos')
  const [activeTab, setActiveTab] = useState<'expenses' | 'balances' | 'copay'>('expenses')
  const [notice, setNotice] = useState('')

  const visibleExpenses = expenseRecords.filter((record) => {
    const [month, year] = record.month.split('/')
    const competence = `${year}-${month}`
    const matchesPeriod = (!periodStart || competence >= periodStart) && (!periodEnd || competence <= periodEnd)
    const matchesBeneficiary = beneficiaryFilter === 'Todos' || record.beneficiaryId === beneficiaryFilter
    return matchesPeriod && matchesBeneficiary
  })
  const visibleBalances = balanceRecords.filter((record) => { const [month, year] = record.month.split('/'); const competence = `${year}-${month}`; return (!periodStart || competence >= periodStart) && (!periodEnd || competence <= periodEnd) })
  const groupedExpenses = groupExpensesByMonth(visibleExpenses)
  const totalExpense = visibleExpenses.reduce((total, record) => total + record.expense, 0)
  const totalCopay = visibleExpenses.reduce((total, record) => total + record.copay, 0)
  const totalDiscount = visibleBalances.reduce((total, record) => total + record.discount, 0)
  const visibleCompetences = competenceRange(periodStart, periodEnd)
  const copayByBeneficiary = beneficiaries.map((beneficiary) => ({ beneficiary, months: visibleCompetences.map((month) => ({ month, value: visibleExpenses.filter((record) => record.beneficiaryId === beneficiary.id && record.month === month).reduce((total, record) => total + record.copay, 0) })) })).filter((item) => beneficiaryFilter === 'Todos' || item.beneficiary.id === beneficiaryFilter)

  async function exportExtract() {
    const { Workbook } = await import('exceljs')
    const workbook = new Workbook()
    const sheet = workbook.addWorksheet(activeTab === 'expenses' ? 'Atendimentos' : activeTab === 'balances' ? 'Saldos e descontos' : 'Coparticipação')
    if (activeTab === 'expenses') {
      sheet.addRow(['Data pagamento', 'Data atendimento', 'Guia', 'Paciente', 'Credenciado', 'Despesa', 'Custeio'])
      visibleExpenses.forEach((record) => sheet.addRow([record.paymentDate, record.attendanceDate, record.guide, record.patient, record.provider, record.expense, record.copay]))
      sheet.getColumn(6).numFmt = 'R$ #,##0.00'; sheet.getColumn(7).numFmt = 'R$ #,##0.00'
      sheet.columns = [{ width: 18 }, { width: 18 }, { width: 18 }, { width: 28 }, { width: 36 }, { width: 16 }, { width: 16 }]
    } else if (activeTab === 'balances') {
      sheet.addRow(['Competência', 'Descrição', 'Referência', 'Saldo/custeio', 'Desconto', 'Abatimentos/cancelamentos', 'Situação'])
      visibleBalances.forEach((record) => sheet.addRow([record.month, record.description, record.reference, record.charge, record.discount, record.adjustment, record.status]))
      ;[4, 5, 6].forEach((column) => { sheet.getColumn(column).numFmt = 'R$ #,##0.00' })
      sheet.columns = [{ width: 15 }, { width: 38 }, { width: 25 }, { width: 18 }, { width: 18 }, { width: 28 }, { width: 16 }]
    } else {
      sheet.addRow(['Beneficiário', ...visibleCompetences, 'Saldo acumulado'])
      copayByBeneficiary.forEach(({ beneficiary, months }) => sheet.addRow([beneficiary.name, ...months.map((month) => month.value), months.reduce((total, month) => total + month.value, 0)]))
      for (let column = 2; column <= visibleCompetences.length + 2; column += 1) { sheet.getColumn(column).numFmt = 'R$ #,##0.00'; sheet.getColumn(column).width = 16 }
      sheet.getColumn(1).width = 34
    }
    const header = sheet.getRow(1)
    header.font = { bold: true, color: { argb: 'FF004E59' } }
    header.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE9F8F5' } }
    header.alignment = { vertical: 'middle', wrapText: true }
    header.height = 28
    sheet.views = [{ state: 'frozen', ySplit: 1 }]
    if (sheet.columnCount > 0 && sheet.rowCount > 1) sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: sheet.columnCount } }
    const buffer = await workbook.xlsx.writeBuffer()
    const href = URL.createObjectURL(new Blob([buffer as BlobPart], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }))
    const anchor = document.createElement('a'); anchor.href = href; anchor.download = `extrato-plan-assiste-${activeTab}-${periodStart || 'inicio'}-a-${periodEnd || 'fim'}.xlsx`; anchor.click(); URL.revokeObjectURL(href)
    setNotice('Resultados exportados em planilha (.xlsx).')
  }

  return (
    <div className="expenses-page">
      <div className="provider-page-heading">
        <h1>Despesas e custeios</h1>
        <p className="page-subtitle">
          Consulte atendimentos médicos e odontológicos, valores de custeio e demonstrativos financeiros vinculados aos beneficiários do seu perfil.
        </p>
      </div>

      <section className="extract-summary" aria-label="Resumo do extrato">
        <article><FileText aria-hidden="true" /><strong>{visibleExpenses.length}</strong><span>{pluralize(visibleExpenses.length, 'registro no período', 'registros no período')}</span></article>
        <article><CircleDollarSign aria-hidden="true" /><strong>{formatCurrency(totalExpense)}</strong><span>despesas registradas</span></article>
        <article><HandCoins aria-hidden="true" /><strong>{formatCurrency(totalCopay)}</strong><span>custeio apurado</span></article>
        <article><WalletCards aria-hidden="true" /><strong>{formatCurrency(totalDiscount)}</strong><span>descontos em folha</span></article>
      </section>

      <section className="extract-query" aria-label="Parâmetros para consulta">
        <div className="reimbursement-section-heading">
          <div>
            <h2>Extrato do Plan-Assiste</h2>
            <p>Filtre por competências e beneficiário. O período pode abranger mais de um ano.</p>
          </div>
        </div>
        <div className="extract-filters">
          <label>
            Competência inicial
            <select value={periodStart} onChange={(event) => setPeriodStart(event.target.value)}>
              {competenceOptions.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
            </select>
          </label>
          <label>
            Competência final
            <select value={periodEnd} onChange={(event) => setPeriodEnd(event.target.value)}>
              {competenceOptions.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
            </select>
          </label>
          <label>
            Beneficiário
            <select value={beneficiaryFilter} onChange={(event) => setBeneficiaryFilter(event.target.value)}>
              <option value="Todos">Todos</option>
              {beneficiaries.map((beneficiary) => <option value={beneficiary.id} key={beneficiary.id}>{beneficiary.name}</option>)}
            </select>
          </label>
        </div>
      </section>

      <section className="extract-card">
        <div className="extract-option-grid" aria-label="Escolha o demonstrativo do extrato">
          <button type="button" className={activeTab === 'expenses' ? 'selected' : ''} onClick={() => setActiveTab('expenses')}>
            <span>Atendimentos médicos e odontológicos</span>
            <small>Atendimentos realizados, despesas correspondentes e valores de custeio.</small>
            <strong>Visualizar extrato <ArrowRight aria-hidden="true" /></strong>
          </button>
          <button type="button" className={activeTab === 'balances' ? 'selected' : ''} onClick={() => setActiveTab('balances')}>
            <span>Saldos e descontos</span>
            <small>Saldos de custeio consolidados, descontos em folha e eventuais abatimentos.</small>
            <strong>Visualizar extrato <ArrowRight aria-hidden="true" /></strong>
          </button>
          <button type="button" className={activeTab === 'copay' ? 'selected' : ''} onClick={() => setActiveTab('copay')}>
            <span>Saldos de coparticipação por beneficiário</span>
            <small>Saldos mensais de coparticipação individualizados por beneficiário.</small>
            <strong>Visualizar extrato <ArrowRight aria-hidden="true" /></strong>
          </button>
        </div>

        {activeTab === 'expenses' ? (
          <div className="extract-table-wrap">
            <table className="extract-table">
              <thead>
                <tr>
                  <th>Data pagamento</th>
                  <th>Data atend.</th>
                  <th>Guia</th>
                  <th>Paciente</th>
                  <th>Credenciado</th>
                  <th>Despesa</th>
                  <th>Custeio</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(groupedExpenses).map(([month, records]) => {
                  const monthExpense = records.reduce((total, record) => total + record.expense, 0)
                  const monthCopay = records.reduce((total, record) => total + record.copay, 0)

                  return (
                    <Fragment key={month}>
                      <tr className="extract-month-row"><td colSpan={7}>{month} ({pluralCount(records.length, 'registro', 'registros')})</td></tr>
                      {records.map((record) => (
                        <tr key={record.id}>
                          <td>{record.paymentDate}</td>
                          <td>{record.attendanceDate}</td>
                          <td>{record.guide}</td>
                          <td>{record.patient}</td>
                          <td><strong>{record.provider}</strong></td>
                          <td>{formatCurrency(record.expense)}</td>
                          <td>{formatCurrency(record.copay)}</td>
                        </tr>
                      ))}
                      <tr className="extract-total-row">
                        <td colSpan={5}>Total do mês</td>
                        <td>{formatCurrency(monthExpense)}</td>
                        <td>{formatCurrency(monthCopay)}</td>
                      </tr>
                    </Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : activeTab === 'balances' ? (
          <div className="extract-balances-result"><div className="extract-table-wrap">
            <table className="extract-table extract-balances-table">
              <colgroup><col className="balance-col-competence" /><col className="balance-col-description" /><col className="balance-col-reference" /><col className="balance-col-charge" /><col className="balance-col-discount" /><col className="balance-col-adjustment" /><col className="balance-col-status" /></colgroup>
              <thead>
                <tr>
                  <th>Competência</th>
                  <th>Descrição</th>
                  <th>Referência</th>
                  <th>Saldo/custeio</th>
                  <th>Desconto</th>
                  <th>Abatimentos/<wbr />cancelamentos</th>
                  <th>Situação</th>
                </tr>
              </thead>
              <tbody>
                {visibleBalances.map((record) => (
                  <tr key={record.id}>
                    <td>{record.month}</td>
                    <td>{record.description}</td>
                    <td>{record.reference}</td>
                    <td>{formatCurrency(record.charge)}</td>
                    <td>{formatCurrency(record.discount)}</td>
                    <td>{formatCurrency(record.adjustment)}</td>
                    <td><span className={`extract-status status-${statusClass(record.status)}`}>{record.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div><p className="extract-rule-note"><strong>Tratamento de devoluções:</strong> valores devolvidos ou estornados em folha são apresentados em “Abatimentos/cancelamentos” e não são contabilizados como nova despesa ou cobrança.</p></div>
        ) : (
          <div className="extract-copay-result">
            {visibleCompetences.length > 5 && <p className="extract-scroll-hint">Deslize horizontalmente para consultar todas as competências do período.</p>}
            <div className="extract-table-wrap">
              <table className="extract-table extract-copay-table" style={{ minWidth: Math.max(940, 410 + visibleCompetences.length * 140) }}>
                <thead><tr><th>Beneficiário</th>{visibleCompetences.map((competence) => <th key={competence}>{competence}</th>)}<th>Saldo acumulado</th></tr></thead>
                <tbody>{copayByBeneficiary.map(({ beneficiary, months }) => <tr key={beneficiary.id}><td><strong>{beneficiary.name}</strong></td>{months.map((month) => <td key={month.month}>{formatCurrency(month.value)}</td>)}<td><strong>{formatCurrency(months.reduce((total, month) => total + month.value, 0))}</strong></td></tr>)}</tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      <div className="extract-export-actions"><button className="primary-button" type="button" onClick={exportExtract}><Download aria-hidden="true" /> Exportar dados em planilha (.xlsx)</button></div>

      {notice && <p className="action-notice" role="status">{notice}</p>}
    </div>
  )
}

export function IrpfPage() {
  const [year, setYear] = useState('')
  const [beneficiaryId, setBeneficiaryId] = useState('ana')
  const [notice, setNotice] = useState('')
  const selectedBeneficiary = beneficiaries.find((beneficiary) => beneficiary.id === beneficiaryId) || beneficiaries[0]
  const statement = irpfStatements.find((item) => item.year === year && item.beneficiaryId === beneficiaryId)

  function downloadStatement() {
    setNotice(`Comprovante IRPF ${year} de ${selectedBeneficiary.name} preparado para download.`)
  }

  return (
    <div className="irpf-page">
      <div className="provider-page-heading">
        <h1>Comprovante IRPF</h1>
        <p className="page-subtitle">
          Selecione o ano-calendário e o beneficiário para consultar comprovantes e demonstrativos para declaração.
        </p>
      </div>

      <section className="extract-query" aria-label="Consulta de comprovante IRPF">
        <div className="extract-filters">
          <label>
            Ano-calendário
            <select value={year} onChange={(event) => setYear(event.target.value)}>
              <option value="">Selecione um ano...</option>
              {['2026', '2025', '2024'].map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label>
            Beneficiário
            <select value={beneficiaryId} onChange={(event) => setBeneficiaryId(event.target.value)}>
              {beneficiaries.map((beneficiary) => <option value={beneficiary.id} key={beneficiary.id}>{beneficiary.name}</option>)}
            </select>
          </label>
        </div>
      </section>

      {year && statement ? (
        <section className="irpf-statement-card" aria-label="Comprovante encontrado">
          <div>
            <span className="request-category">Ano-calendário {statement.year}</span>
            <h2>{selectedBeneficiary.name}</h2>
            <p>Comprovante emitido em {statement.issuedAt}. Confira os valores consolidados antes de declarar.</p>
          </div>
          <dl>
            <div><dt>Contribuições e custeios</dt><dd>{formatCurrency(statement.paid)}</dd></div>
            <div><dt>Coparticipação</dt><dd>{formatCurrency(statement.copay)}</dd></div>
            <div><dt>Reembolsos recebidos</dt><dd>{formatCurrency(statement.reimbursements)}</dd></div>
          </dl>
          <div className="my-data-actions">
            <button className="primary-button" type="button" onClick={downloadStatement}><Download aria-hidden="true" /> Baixar comprovante</button>
            <Link className="text-link" to="/beneficiario/despesas-e-extratos">Conferir extratos <ArrowRight aria-hidden="true" /></Link>
          </div>
        </section>
      ) : (
        <section className="empty-state irpf-empty">
          <FileText aria-hidden="true" />
          <h2>{year ? 'Nenhum comprovante encontrado' : 'Selecione um ano para ver o comprovante'}</h2>
          <p>{year ? 'Tente outro beneficiário ou ano-calendário.' : 'Os comprovantes disponíveis serão exibidos depois da seleção.'}</p>
        </section>
      )}

      {notice && <p className="action-notice" role="status">{notice}</p>}
    </div>
  )
}

export function FaqPage() {
  const [query, setQuery] = useState('')
  const normalizedQuery = query.trim().toLowerCase()
  const visibleCategories = faqCategories
    .map((category) => ({
      ...category,
      questions: category.questions.filter(([question, answer]) => {
        if (!normalizedQuery) return true
        return `${category.title} ${question} ${answer}`.toLowerCase().includes(normalizedQuery)
      }),
    }))
    .filter((category) => category.questions.length > 0)

  return (
    <div className="faq-page">
      <div className="provider-page-heading">
        <h1>Dúvidas frequentes</h1>
        <p className="page-subtitle">Busque respostas rápidas por tema ou navegue pelas categorias mais consultadas.</p>
      </div>

      <section className="faq-search-panel" aria-label="Buscar dúvidas frequentes">
        <Search aria-hidden="true" />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar dúvidas..." />
      </section>

      <section className="faq-category-grid" aria-label="Categorias de dúvidas">
        {faqCategories.map((category) => (
          <a href={`#faq-${category.id}`} key={category.id}>
            <HelpCircle aria-hidden="true" />
            <span>{category.title}</span>
            <small>{pluralCount(category.questions.length, 'pergunta', 'perguntas')}</small>
          </a>
        ))}
      </section>

      <section className="faq-results" aria-label="Respostas frequentes">
        {visibleCategories.length > 0 ? visibleCategories.map((category) => (
          <article id={`faq-${category.id}`} key={category.id}>
            <h2>{category.title}</h2>
            {category.questions.map(([question, answer]) => (
              <details key={question}>
                <summary>{question}</summary>
                <p>{answer}</p>
              </details>
            ))}
          </article>
        )) : (
          <div className="empty-state compact-empty">
            <HelpCircle aria-hidden="true" />
            <h2>Nenhuma dúvida encontrada</h2>
            <p>Tente buscar por cadastro, reembolso, carteirinha, rede credenciada ou IRPF.</p>
          </div>
        )}
      </section>
    </div>
  )
}

const requestIconById: Record<string, LucideIcon> = {
  'adesao-programa': BadgeCheck,
  'atualizacao-cadastral': UserRound,
  'inclusao-dependentes': UserRound,
  'consulta-odontologica': Stethoscope,
  irpf: FileText,
  'extrato-mes': FileText,
  carteirinhas: IdCard,
  declaracoes: FileText,
  'termo-hospital-alto-custo': ClipboardCheck,
  'rede-credenciada': Stethoscope,
  aplicativo: Smartphone,
  'orientacoes-eps': HelpCircle,
  'quem-pode-aderir': BadgeCheck,
  'central-atendimento': HelpCircle,
  'recomendacoes-credenciados': Star,
  'permanencia-apos-aposentadoria': WalletCards,
  'servico-atualizacao-dados-cadastrais': UserRound,
  'servico-emissao-documentos': IdCard,
  'servico-emissao-carteira-temporaria': IdCard,
  'servico-acompanhamento-protocolos': ClipboardList,
  'servico-inscricao-adesao': BadgeCheck,
  'servico-reingresso-reativacao': RotateCcw,
  'servico-desligamento': ClipboardList,
  'servico-mudanca-tipo-beneficiario': UserRound,
  'servico-pais-dependentes': UserRound,
  'servico-cadastro-duvidas-informacoes': HelpCircle,
  'servico-reembolso-duvidas': HelpCircle,
  'servico-recurso-reembolso': ClipboardList,
  'servico-solicitacao-reembolso': HandCoins,
  'servico-autorizacao-cirurgia': ClipboardCheck,
  'servico-psicologia': Stethoscope,
  'servico-fonoaudiologia': Stethoscope,
  'servico-terapia-ocupacional': Stethoscope,
  'servico-fisioterapia': Stethoscope,
  'servico-acupuntura': Stethoscope,
  'servico-pilates': Stethoscope,
  'servico-rpg': Stethoscope,
  'servico-hidroterapia': Stethoscope,
  'servico-autorizacao-outros': ClipboardCheck,
  'servico-autorizacao-duvidas': HelpCircle,
  'servico-auxilio-duvidas-informacoes': HelpCircle,
  'servico-abertura-solicitacoes-administrativas': ClipboardList,
  'servico-autorizacao-opme': Stethoscope,
  'servico-processo-aposentadoria-retorno': WalletCards,
  'servico-carteirinha-virtual': IdCard,
  'servico-atualizacao-cadastral-periodica': UserRound,
  'servico-cobertura-duvidas': ShieldCheck,
  'servico-inclusao-ampliacao-cobertura': ShieldCheck,
  'servico-autorizacao-portais-unimed': Building2,
  'servico-assistencia-domiciliar': HeartPulse,
  'servico-tratamento-odontologico-duvidas': Stethoscope,
  'servico-auxilio-materiais-saude': HandCoins,
  'servico-transporte-tratamento-fora-domicilio': MapPin,
  'servico-despesas-saude-duvidas': CircleDollarSign,
  'servico-recurso-informacoes-financeiras': WalletCards,
  'servico-acompanhamento-denuncia-reclamacao': ClipboardList,
  'servico-atualizacao-site': MonitorCheck,
  'servico-site-app-duvidas': MonitorCheck,
  'servico-problemas-acesso-site-app': AlertTriangle,
  'servico-indisponibilidade-site-app': AlertTriangle,
  'servico-erro-funcionalidades-site-app': AlertTriangle,
}

function RequestCard({
  request,
  favorite = false,
  onFavorite,
}: {
  request: BeneficiaryRequest
  favorite?: boolean
  onFavorite?: () => void
}) {
  const Icon = requestIconById[request.id] || FileText
  const content = (
    <>
      {request.route || request.externalUrl ? request.action : 'Detalhar solicitação'}
      <ArrowRight aria-hidden="true" />
    </>
  )

  return (
    <article className="request-card">
      {onFavorite && (
        <button
          className={`provider-circle-action request-favorite-button ${favorite ? 'is-favorite' : ''}`}
          type="button"
          onClick={onFavorite}
          aria-label={favorite ? 'Remover serviço dos favoritos' : 'Adicionar serviço aos favoritos'}
        >
          <Heart aria-hidden="true" />
        </button>
      )}
      <div className={`request-card-icon category-icon-${categorySlug(request.category)}`}><Icon aria-hidden="true" /></div>
      <div>
        <span className={`request-category category-${categorySlug(request.category)}`}>{request.category}</span>
        <h3>{request.title}</h3>
        <p>{request.description}</p>
        <div className="provider-tags">
          {request.tags.map((tag) => <span key={tag}>{tag}</span>)}
        </div>
      </div>
      {request.externalUrl ? (
        <a className="request-action" href={request.externalUrl} target="_blank" rel="noreferrer">{content}</a>
      ) : request.route ? (
        <Link className="request-action" to={request.route}>{content}</Link>
      ) : (
        <button className="request-action" type="button">{content}</button>
      )}
    </article>
  )
}

const preferenceTypes = ['Todos', 'Credenciado favorito', 'Credenciado avaliado', 'Notícia favorita', 'Serviço favorito']

type PreferenceItem = SavedPreference & {
  sourceType: 'provider-favorite' | 'provider-rating' | 'news' | 'service'
  sourceId: string
}

export function PreferencesPage() {
  const [type, setType] = useState('Todos')
  const [sort, setSort] = useState<'az' | 'za'>('az')
  const [favoriteState, setFavoriteState] = useState<FavoriteState>(() => getFavoriteState())
  const dynamicProviderPreferences: PreferenceItem[] = providers
    .filter((provider) => favoriteState.favoriteProviderIds.includes(provider.id))
    .map((provider) => ({
      id: `provider-${provider.id}`,
      title: provider.name,
      type: 'Credenciado favorito',
      description: `${provider.category} em ${provider.address.city}/${provider.address.state}.`,
      meta: provider.specialties.slice(0, 2).join(', '),
      route: `/rede-credenciada/credenciado/${provider.id}`,
      sourceType: 'provider-favorite',
      sourceId: provider.id,
    }))
  const dynamicRatedProviderPreferences: PreferenceItem[] = providers
    .filter((provider) => favoriteState.providerRatings[provider.id] !== undefined)
    .map((provider) => ({
      id: `rated-${provider.id}`,
      title: provider.name,
      type: 'Credenciado avaliado',
      description: `Avaliação registrada para ${provider.category.toLowerCase()}.`,
      meta: `${provider.address.city}/${provider.address.state}`,
      route: `/rede-credenciada/credenciado/${provider.id}`,
      rating: favoriteState.providerRatings[provider.id],
      sourceType: 'provider-rating',
      sourceId: provider.id,
    }))
  const dynamicNewsPreferences: PreferenceItem[] = news
    .filter((item) => favoriteState.favoriteNewsIds.includes(item.id))
    .map((item) => ({
      id: `news-${item.id}`,
      title: item.title,
      type: 'Notícia favorita',
      description: 'Notícia marcada como favorita na área de notícias.',
      meta: `Publicada em ${item.date}`,
      route: '/noticias',
      sourceType: 'news',
      sourceId: item.id,
    }))
  const dynamicServicePreferences: PreferenceItem[] = beneficiaryRequests
    .filter((request) => favoriteState.favoriteServiceIds.includes(request.id))
    .map((request) => ({
      id: `service-${request.id}`,
      title: request.title,
      type: 'Serviço favorito',
      description: request.description,
      meta: request.category,
      route: request.route || '/beneficiario/servicos',
      sourceType: 'service',
      sourceId: request.id,
    }))
  const preferenceItems: PreferenceItem[] = [
    ...dynamicProviderPreferences,
    ...dynamicRatedProviderPreferences,
    ...dynamicNewsPreferences,
    ...dynamicServicePreferences,
  ]
  const visiblePreferences = preferenceItems
    .filter((preference) => type === 'Todos' || preference.type === type)
    .sort((first, second) => sort === 'az'
      ? first.title.localeCompare(second.title, 'pt-BR')
      : second.title.localeCompare(first.title, 'pt-BR'))
  const favoriteProviderCount = dynamicProviderPreferences.length
  const ratedProviderCount = dynamicRatedProviderPreferences.length
  const favoriteNewsCount = dynamicNewsPreferences.length
  const favoriteServiceCount = dynamicServicePreferences.length

  useEffect(() => {
    function syncFavorites() {
      setFavoriteState(getFavoriteState())
    }

    window.addEventListener('planAssisteFavoritesUpdated', syncFavorites)
    window.addEventListener('storage', syncFavorites)
    return () => {
      window.removeEventListener('planAssisteFavoritesUpdated', syncFavorites)
      window.removeEventListener('storage', syncFavorites)
    }
  }, [])

  function removePreference(preference: PreferenceItem) {
    if (preference.sourceType === 'provider-rating') {
      setFavoriteState(removeProviderRating(preference.sourceId))
      return
    }

    const nextState = {
      ...favoriteState,
      favoriteProviderIds: preference.sourceType === 'provider-favorite'
        ? favoriteState.favoriteProviderIds.filter((id) => id !== preference.sourceId)
        : favoriteState.favoriteProviderIds,
      favoriteNewsIds: preference.sourceType === 'news'
        ? favoriteState.favoriteNewsIds.filter((id) => id !== preference.sourceId)
        : favoriteState.favoriteNewsIds,
      favoriteServiceIds: preference.sourceType === 'service'
        ? favoriteState.favoriteServiceIds.filter((id) => id !== preference.sourceId)
        : favoriteState.favoriteServiceIds,
    }

    setFavoriteState(saveFavoriteState(nextState))
  }

  return (
    <div className="preferences-page">
      <div className="provider-page-heading">
        <h1>Meus favoritos</h1>
        <p className="page-subtitle">
          Gerencie credenciados, serviços e notícias marcados como favoritos.
        </p>
      </div>

      <section className="preferences-overview">
        <button type="button" className={type === 'Credenciado favorito' ? 'selected' : ''} onClick={() => setType('Credenciado favorito')}>
          <Heart aria-hidden="true" /><strong>{favoriteProviderCount}</strong><span>{pluralize(favoriteProviderCount, 'credenciado favorito', 'credenciados favoritos')}</span>
        </button>
        <button type="button" className={type === 'Credenciado avaliado' ? 'selected' : ''} onClick={() => setType('Credenciado avaliado')}>
          <Star aria-hidden="true" /><strong>{ratedProviderCount}</strong><span>{pluralize(ratedProviderCount, 'credenciado avaliado', 'credenciados avaliados')}</span>
        </button>
        <button type="button" className={type === 'Notícia favorita' ? 'selected' : ''} onClick={() => setType('Notícia favorita')}>
          <Heart aria-hidden="true" /><strong>{favoriteNewsCount}</strong><span>{pluralize(favoriteNewsCount, 'notícia favorita', 'notícias favoritas')}</span>
        </button>
        <button type="button" className={type === 'Serviço favorito' ? 'selected' : ''} onClick={() => setType('Serviço favorito')}>
          <Heart aria-hidden="true" /><strong>{favoriteServiceCount}</strong><span>{pluralize(favoriteServiceCount, 'serviço favorito', 'serviços favoritos')}</span>
        </button>
      </section>

      <section className="request-toolbar favorites-toolbar" aria-label="Filtros de preferências">
        <label>
          Tipo
          <select value={type} onChange={(event) => setType(event.target.value)}>
            {preferenceTypes.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <label>
          Ordenar
          <select value={sort} onChange={(event) => setSort(event.target.value as 'az' | 'za')}>
            <option value="az">Nome A-Z</option>
            <option value="za">Nome Z-A</option>
          </select>
        </label>
        <button className="filter-clear-button" type="button" onClick={() => { setType('Todos'); setSort('az') }}>Limpar</button>
      </section>

      <section className="preference-list" aria-label="Itens salvos">
        {visiblePreferences.length > 0 ? (
          visiblePreferences.map((preference) => (
            <article className="preference-item" key={preference.id}>
              <span className="preference-icon">
                {preference.type === 'Credenciado avaliado' ? <Star aria-hidden="true" /> : <Heart aria-hidden="true" />}
              </span>
              <div>
                <span className="request-category">{preference.type}</span>
                <h2>{preference.title}</h2>
                <p>{preference.description}</p>
                {preference.rating && <p className="provider-rating"><Star aria-hidden="true" /> {preference.rating}/5</p>}
                <small>{preference.meta}</small>
              </div>
              <div className="preference-actions">
                {preference.route && <Link className="request-action" to={preference.route}>Abrir <ArrowRight aria-hidden="true" /></Link>}
                <button type="button" onClick={() => removePreference(preference)}>
                  {preference.type === 'Credenciado avaliado' ? 'Excluir avaliação' : 'Remover favorito'}
                </button>
              </div>
            </article>
          ))
        ) : (
          <div className="empty-state compact-empty">
            <Heart aria-hidden="true" />
            <h2>Nenhum item encontrado</h2>
            <p>Ajuste os filtros ou marque novos serviços, notícias e credenciados como favoritos.</p>
          </div>
        )}
      </section>
    </div>
  )
}

export function CardsPage() {
  const [selected, setSelected] = useState('ana')
  const [cardProvider, setCardProvider] = useState<'plan-assiste' | 'unimed'>('plan-assiste')
  const [side, setSide] = useState<'front' | 'back'>('front')
  const [notice, setNotice] = useState('')
  const data = cardData.find((card) => card.id === selected) || cardData[0]
  const isUnimedCard = cardProvider === 'unimed'
  const cardLabel = isUnimedCard ? 'Unimed' : 'Plan-Assiste'
  const unimedRegistration = `0865 ${data.registration.replace(/\D/g, '').slice(0, 12)}`
  const getInitials = (name: string) => name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('')

  function action(message: string) {
    setNotice(message)
    window.setTimeout(() => setNotice(''), 3000)
  }

  return (
    <div className="cards-page">
      <div className="provider-page-heading">
        <h1>Carteirinhas</h1>
        <p className="page-subtitle">Acesse sua carteirinha digital e a dos seus dependentes. Visualize, baixe, imprima ou envie por e-mail com facilidade.</p>
      </div>
      <section data-reveal>
        <h2>Selecionar beneficiário</h2>
        <div className="beneficiary-selector">
          {beneficiaries.map((beneficiary) => (
            <button type="button" key={beneficiary.id} onClick={() => setSelected(beneficiary.id)} className={selected === beneficiary.id ? 'selected' : ''}>
              <span className="beneficiary-initials" aria-hidden="true">{getInitials(beneficiary.name)}</span><span><strong>{beneficiary.name}</strong><small>{beneficiary.relation}</small></span>
            </button>
          ))}
        </div>
      </section>

      <section className="card-viewer" data-reveal>
        <h2>Visualização da carteirinha</h2>
        <p className="card-offline-status">{cardLabel} disponível offline no app e no Portal após o primeiro acesso.</p>
        <div className="segmented-control card-provider-control" aria-label="Selecionar tipo de carteirinha">
          <button type="button" className={cardProvider === 'plan-assiste' ? 'selected' : ''} onClick={() => setCardProvider('plan-assiste')}>Plan-Assiste</button>
          <button type="button" className={cardProvider === 'unimed' ? 'selected' : ''} onClick={() => setCardProvider('unimed')}>Unimed</button>
        </div>
        <div className="segmented-control card-side-control" aria-label="Selecionar lado da carteirinha">
          <button type="button" className={side === 'front' ? 'selected' : ''} onClick={() => setSide('front')}>Frente</button>
          <button type="button" className={side === 'back' ? 'selected' : ''} onClick={() => setSide('back')}>Verso</button>
        </div>
        {isUnimedCard ? (
          side === 'front' ? (
            <div className="health-card-front unimed-card-front" role="img" aria-label={`Frente da carteirinha Unimed de ${data.name}`}>
              <div className="unimed-card-header">
                <img className="unimed-logo-image" src="/assets/unimed-logo.svg" alt="Unimed" />
                <span>Plano de saúde nacional</span>
              </div>
              <div className="unimed-card-person">
                <small>Beneficiário</small>
                <strong>{data.name}</strong>
                <p>{unimedRegistration}</p>
              </div>
              <div className="unimed-card-grid">
                <span><small>Validade</small>{data.validity}</span>
                <span><small>Nascimento</small>{data.birthDate}</span>
                <span><small>Abrangência</small>Nacional</span>
              </div>
              <b>Atendimento cooperado Unimed</b>
            </div>
          ) : (
            <div className="health-card-back unimed-card-back" role="img" aria-label={`Verso da carteirinha Unimed de ${data.name}`}>
              <div>
                <img className="unimed-logo-image" src="/assets/unimed-logo.svg" alt="Unimed" />
                <strong>Orientações de atendimento</strong>
              </div>
              <p>Apresente esta carteirinha com documento oficial com foto. Confirme cobertura, rede e autorização antes do atendimento, quando aplicável.</p>
              <div className="unimed-card-back-grid">
                <span><small>SAC 24h</small>0800 000 0000</span>
                <span><small>Autorização</small>Portal Unimed</span>
                <span><small>Emergência</small>Pronto atendimento credenciado</span>
              </div>
              </div>
          )
        ) : (
          side === 'front' ? (
            <div className="health-card-front" role="img" aria-label={`Frente da carteirinha Plan-Assiste de ${data.name}`}>
              <div className="health-card-brand">
                <img src="/assets/logo-branca.svg" alt="Plan-Assiste" />
              </div>
              <p>Matrícula: {data.registration}</p>
              <p>Validade: {data.validity}</p>
              <div className="health-card-person">
                <p>Órgão: {data.organ}</p>
                <p>Beneficiário: {data.name}</p>
                <p>Nascimento: {data.birthDate}</p>
              </div>
              <strong>◎ www.planassiste.mpu.mp.br</strong>
              <strong>◴ 0800 591-5601</strong>
              <i aria-hidden="true" />
            </div>
          ) : (
            <div className="health-card-back" role="img" aria-label={`Verso da carteirinha Plan-Assiste de ${data.name}`}>
              <img src="/assets/logo-branca.svg" alt="Plan-Assiste" />
              <p>Atendimento 24h</p><b>0800 591-5601</b><span>www.planassiste.mpu.mp.br</span>
            </div>
          )
        )}
        <div className="card-data-layout">
          <div className="card-data-panel">
            <h2>Dados da carteirinha</h2>
            <dl className="card-data">
              <div><dt>Carteirinha:</dt><dd>{cardLabel}</dd></div>
              <div><dt>Matrícula:</dt><dd>{isUnimedCard ? unimedRegistration : data.registration}</dd></div>
              <div><dt>Validade:</dt><dd>{data.validity}</dd></div>
              <div><dt>{isUnimedCard ? 'Abrangência:' : 'Órgão:'}</dt><dd>{isUnimedCard ? 'Nacional' : data.organ}</dd></div>
              <div><dt>Beneficiário:</dt><dd>{data.name}</dd></div>
              <div><dt>Nascimento:</dt><dd>{data.birthDate}</dd></div>
            </dl>
          </div>
          <div className="card-actions">
            <button type="button" onClick={() => action('Download simulado com sucesso.')}><Download /> Baixar carteirinha</button>
            <button type="button" onClick={() => action('Carteirinha adicionada à carteira digital.')}><WalletCards /> Adicionar à carteira</button>
            <button type="button" onClick={() => action('Impressão simulada.')}><FileText /> Imprimir</button>
            <button type="button" onClick={() => action('Envio por e-mail simulado.')}><Mail /> Enviar por e-mail</button>
            <button
              type="button"
              disabled={!whatsAppConfirmed}
              title={whatsAppConfirmed ? 'Enviar por WhatsApp' : 'Confirme seu número de WhatsApp em Meus dados para habilitar este envio.'}
              onClick={() => action('Envio por WhatsApp simulado.')}
            >
              <MessageCircle /> Enviar por WhatsApp
            </button>
          </div>
        </div>
        {notice && <p className="action-notice" role="status">{notice}</p>}
        <p className="app-note"><Smartphone /> Também disponível no aplicativo do Plan-Assiste.</p>
      </section>

      <div className="internal-grid-3 info-grid" data-reveal>
        <InfoCard
          icon={BadgeCheck}
          title="Por que optar pelo Plan-Assiste?"
          text="Conheça as vantagens de utilizar a nossa carteirinha."
          to="/plan-assiste/beneficiarios/por-que-optar-pelo-plan-assiste"
        />
        <InfoCard
          icon={IdCard}
          title="Posso obter a carteirinha física?"
          text="Embora o uso da digital seja o mais comum, ainda é possível receber a carteirinha física do Plan-Assiste."
          to="/plan-assiste/beneficiarios/carteirinha-fisica"
        />
        <InfoCard
          icon={HelpCircle}
          title="Problemas com a carteirinha?"
          text="Veja como solicitar nossa ajuda para resolvê-los."
          to="/plan-assiste/beneficiarios/problemas-com-a-carteirinha"
        />
      </div>
    </div>
  )
}

function InfoCard({ icon: Icon, title, text, to }: { icon: LucideIcon, title: string, text: string, to: string }) {
  return (
    <Link className="info-card navigation-info-card" to={to}>
      <Icon aria-hidden="true" />
      <h2>{title}</h2>
      <p>{text}</p>
      <span>Saiba mais <ArrowRight aria-hidden="true" /></span>
    </Link>
  )
}

function formatMobileNumber(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (!digits) return ''
  if (digits.length <= 2) return `(${digits}`
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

export function MyDataPage() {
  const [profile, setProfile] = useState<UserProfile>(() => getStoredUserProfile())
  const [notice, setNotice] = useState('')
  const [confirmationItems, setConfirmationItems] = useState<string[]>([])
  const initialProfileRef = useRef(profile)
  const session = getStoredSession()
  const navigate = useNavigate()
  const isProviderAccount = session.activeProfile === 'provider'
  const isBeneficiaryAccount = session.activeProfile === 'beneficiary'
  const mainAreaPath = isProviderAccount
    ? '/credenciado'
    : session.activeProfile === 'team'
      ? '/area-da-equipe'
      : '/beneficiario'
  const accountAvatar = isProviderAccount
    ? (profile.providerAvatar || '/assets/provider-clinic-logo.svg')
    : (profile.avatar || defaultUserProfile.avatar || '')
  const accountName = isProviderAccount ? (session.displayName || 'Clínica Saúde & Vida') : profile.name
  const accountEmail = isProviderAccount ? (profile.providerEmail || 'contato@saudeevida.com.br') : profile.email
  const addressHasCoordinates = profile.address.latitude !== undefined && profile.address.longitude !== undefined

  function updateProfile(key: keyof Pick<UserProfile, 'email' | 'providerEmail' | 'providerWhatsapp' | 'phone' | 'whatsapp'>, value: string) {
    setProfile((current) => ({ ...current, [key]: value }))
  }

  function updateAvatar(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      setProfile((current) => isProviderAccount
        ? ({ ...current, providerAvatar: String(reader.result) })
        : ({ ...current, avatar: String(reader.result) }))
      setNotice('Foto atualizada no protótipo. Salve as alterações para manter a imagem.')
    }
    reader.readAsDataURL(file)
  }

  function saveProfile(event: FormEvent) {
    event.preventDefault()
    const initialProfile = initialProfileRef.current
    const items: string[] = []
    const currentEmail = isProviderAccount ? profile.providerEmail : profile.email
    const initialEmail = isProviderAccount ? initialProfile.providerEmail : initialProfile.email

    if (currentEmail !== initialEmail) {
      items.push('Confirme a alteração pelo link enviado para o e-mail informado.')
    }
    if (profile.phone !== initialProfile.phone) {
      items.push('Confirme a alteração do telefone cadastrado pelo link enviado por SMS.')
    }
    if (isBeneficiaryAccount && profile.whatsapp !== initialProfile.whatsapp) {
      items.push(initialProfile.whatsapp.trim()
        ? 'Confirme a alteração do número de WhatsApp seguindo as instruções enviadas.'
        : 'Confirme a inclusão do número de WhatsApp seguindo as instruções enviadas.')
    }
    if (isProviderAccount && profile.providerWhatsapp !== initialProfile.providerWhatsapp) {
      items.push(initialProfile.providerWhatsapp?.trim()
        ? 'Confirme a alteração do WhatsApp institucional seguindo as instruções enviadas.'
        : 'Confirme a inclusão do WhatsApp institucional seguindo as instruções enviadas.')
    }

    const saved = saveStoredUserProfile(profile)
    setProfile(saved)
    initialProfileRef.current = saved
    setConfirmationItems(items)
    setNotice(items.length === 0 ? 'Dados salvos com sucesso.' : '')
  }

  return (
    <div className="my-data-page">
      <div className="provider-page-heading">
        <h1>Meus dados</h1>
        <p className="page-subtitle">
          Consulte seus dados cadastrais, revise preferências de contato e mantenha atualizadas as informações dinâmicas do perfil.
        </p>
      </div>

      <form className="my-data-form" onSubmit={saveProfile}>
        <section className="my-data-card my-data-profile-card">
          <img src={accountAvatar} alt="" />
          <div>
            <h2>{accountName}</h2>
            <p>{isProviderAccount ? 'Perfil do credenciado credenciado' : (session.roleLabel || 'Perfil do usuário')}</p>
          </div>
          <label className="secondary-button my-data-photo-button">
            Alterar foto
            <input type="file" accept="image/*" onChange={updateAvatar} />
          </label>
        </section>

        <section className="my-data-card">
          <div className="my-data-card-heading">
            <UserRound aria-hidden="true" />
            <div>
              <h2>{isProviderAccount ? 'Dados do credenciado' : 'Dados pessoais'}</h2>
              <p>As informações de origem sistêmica ficam bloqueadas. Contatos e foto podem ser atualizados no protótipo.</p>
            </div>
          </div>
          <div className="my-data-grid">
            <label>{isProviderAccount ? 'Razão social' : 'Nome completo'}<input value={accountName} disabled /></label>
            <label>E-mail<input type="email" value={accountEmail} onChange={(event) => updateProfile(isProviderAccount ? 'providerEmail' : 'email', event.target.value)} /></label>
            <label>Telefone<input value={profile.phone} onChange={(event) => updateProfile('phone', event.target.value)} /></label>
            {isProviderAccount && (
              <label>
                WhatsApp para contato
                <input
                  type="tel"
                  inputMode="tel"
                  value={profile.providerWhatsapp || ''}
                  placeholder="Informe o WhatsApp da empresa"
                  maxLength={15}
                  onChange={(event) => updateProfile('providerWhatsapp', formatMobileNumber(event.target.value))}
                />
              </label>
            )}
            {isBeneficiaryAccount && (
              <label>
                WhatsApp
                <input
                  type="tel"
                  inputMode="tel"
                  value={profile.whatsapp}
                  placeholder="Número ainda não confirmado"
                  maxLength={15}
                  onChange={(event) => updateProfile('whatsapp', formatMobileNumber(event.target.value))}
                />
              </label>
            )}
            {isProviderAccount ? (
              <>
                <label>CNPJ<input value="00.000.000/0001-90" disabled /></label>
                <label>Tipo de credenciado<input value="Clínica médica" disabled /></label>
                <label>Situação cadastral<input value="Credenciamento ativo" disabled /></label>
              </>
            ) : (
              <>
                <label>Data de nascimento<input value={profile.birthDate} disabled /></label>
                <label>CPF<input value={profile.cpf} disabled /></label>
                <label>Matrícula<input value={profile.registration} disabled /></label>
                <label>Órgão<input value={profile.organ} disabled /></label>
              </>
            )}
          </div>
          {isBeneficiaryAccount && <div className="dependent-personal-data">
            <div className="dependent-personal-heading">
              <h3>Dados pessoais dos dependentes</h3>
              <Link className="text-link" to="/beneficiario/dependentes">
                Ver dependentes <ArrowRight aria-hidden="true" />
              </Link>
            </div>
            <div className="dependent-personal-grid">
              {dependentDetails.map((dependent) => (
                <article key={dependent.id}>
                  <span className="request-category">{dependent.status}</span>
                  <h4>{dependent.name}</h4>
                  <dl>
                    <div><dt>Vínculo</dt><dd>{dependent.relation}</dd></div>
                    <div><dt>Nascimento</dt><dd>{dependent.birthDate}</dd></div>
                    <div><dt>Matrícula</dt><dd>{dependent.registration}</dd></div>
                  </dl>
                </article>
              ))}
            </div>
          </div>}
        </section>

        <section className="my-data-card">
          <div className="my-data-card-heading">
            <MapPin aria-hidden="true" />
            <div>
              <h2>{isProviderAccount ? 'Endereço de atendimento' : 'Endereço residencial'}</h2>
              <p>{isProviderAccount ? 'Endereço cadastral do credenciado, disponível apenas para consulta.' : 'Endereço cadastral disponível apenas para consulta e usado como referência de distância na busca logada.'}</p>
            </div>
          </div>
          <div className="my-data-grid">
            <label className="my-data-wide">Logradouro<input value={profile.address.street} disabled /></label>
            <label>Número<input value={profile.address.number} disabled /></label>
            <label>Complemento<input value={profile.address.complement} disabled /></label>
            <label>Bairro<input value={profile.address.district} disabled /></label>
            <label>Cidade<input value={profile.address.city} disabled /></label>
            <label>UF<input value={profile.address.state} disabled /></label>
            <label>CEP<input value={profile.address.zipCode} disabled /></label>
          </div>
          <section className="my-data-reference" aria-live="polite">
            <MapPin aria-hidden="true" />
            <div>
              <strong>Referência atual para Rede credenciada</strong>
              <p>
                {profile.address.city}/{profile.address.state}
                {addressHasCoordinates
                  ? ' - endereço cadastrado será usado para estimar distância'
                  : ' - endereço cadastral ainda não possui referência geográfica'}
              </p>
            </div>
          </section>
        </section>

        <div className="my-data-actions">
          <button className="primary-button" type="submit"><Save aria-hidden="true" /> Salvar alterações</button>
          <button type="button" onClick={() => navigate(mainAreaPath)}>Cancelar alterações</button>
        </div>
      </form>

      {notice && <p className="action-notice" role="status">{notice}</p>}

      {confirmationItems.length > 0 && (
        <div className="my-data-confirmation-backdrop" role="presentation">
          <section
            className="my-data-confirmation-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="my-data-confirmation-title"
            aria-describedby="my-data-confirmation-description"
          >
            <button className="my-data-confirmation-close" type="button" aria-label="Fechar confirmação" onClick={() => setConfirmationItems([])}>
              <X aria-hidden="true" />
            </button>
            <span className="my-data-confirmation-icon"><BadgeCheck aria-hidden="true" /></span>
            <h2 id="my-data-confirmation-title">Confirme suas alterações</h2>
            <p id="my-data-confirmation-description">Para concluir a atualização dos dados de contato:</p>
            <ul>
              {confirmationItems.map((item) => <li key={item}>{item}</li>)}
            </ul>
            <button className="primary-button" type="button" onClick={() => setConfirmationItems([])}>Entendi</button>
          </section>
        </div>
      )}
    </div>
  )
}

export function AccountAreaPage({ onLogout }: { onLogout: () => void }) {
  return (
    <>
      <Header loggedIn onLogout={onLogout} />
      <MainMenu loggedIn />
      <main className="container public-page">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Início</Link>
          <ArrowRight />
          <span>Meus dados</span>
        </nav>
        <MyDataPage />
      </main>
      <Footer />
    </>
  )
}

const dependentDetails = [
  {
    id: 'andre',
    name: 'André Luiz Araújo',
    relation: 'Dependente',
    status: 'Ativo',
    birthDate: '14/06/2012',
    registration: '1000.00000000.01',
    documents: 'Documentação completa',
    pendingRequests: 1,
    pendingAuthorizations: 1,
    lastUpdate: 'Atualizado em 03/06/2026',
  },
  {
    id: 'maria',
    name: 'Maria Olívia Araújo',
    relation: 'Dependente',
    status: 'Ativo',
    birthDate: '23/09/2015',
    registration: '1000.00000000.02',
    documents: 'Carteirinha digital disponível',
    pendingRequests: 1,
    pendingAuthorizations: 0,
    lastUpdate: 'Atualizado em 05/06/2026',
  },
]

export function DependentsPage() {
  const pendingRequests = dependentDetails.reduce((total, dependent) => total + dependent.pendingRequests, 0)
  const pendingAuthorizations = dependentDetails.reduce((total, dependent) => total + dependent.pendingAuthorizations, 0)

  return (
    <div className="dependents-page">
      <div className="provider-page-heading">
        <h1>Dependentes</h1>
        <p className="page-subtitle">
          Consulte dependentes vinculados ao titular, acompanhe situação cadastral e acesse serviços relacionados.
        </p>
      </div>

      <section className="dependents-summary">
        <article><UsersIcon /><strong>{dependentDetails.length}</strong><span>dependentes ativos</span></article>
        <article><ClipboardList aria-hidden="true" /><strong>{pendingRequests}</strong><span>solicitações pendentes</span></article>
        <article><BadgeCheck aria-hidden="true" /><strong>{pendingAuthorizations}</strong><span>autorizações pendentes</span></article>
      </section>

      <section className="dependent-card-grid" aria-label="Lista de dependentes">
        {dependentDetails.map((dependent) => (
          <article className="dependent-card" key={dependent.id}>
            <div className="beneficiary-initials" aria-hidden="true">
              {dependent.name.split(' ').slice(0, 2).map((part) => part[0]).join('')}
            </div>
            <div>
              <span className="request-category">{dependent.status}</span>
              <h2>{dependent.name}</h2>
              <dl>
                <div><dt>Vínculo</dt><dd>{dependent.relation}</dd></div>
                <div><dt>Nascimento</dt><dd>{dependent.birthDate}</dd></div>
                <div><dt>Matrícula</dt><dd>{dependent.registration}</dd></div>
                <div><dt>Documentos</dt><dd>{dependent.documents}</dd></div>
              </dl>
              <small>{dependent.lastUpdate}</small>
            </div>
            <div className="dependent-actions">
              <Link to="/beneficiario/carteirinhas">Ver carteirinha</Link>
              <Link to="/beneficiario/servicos">Solicitar alteração</Link>
              <Link to="/beneficiario/solicitacoes">Acompanhar solicitações</Link>
              <Link to="/beneficiario/solicitacoes">Acompanhar autorizações</Link>
            </div>
          </article>
        ))}
      </section>

      <section className="dependents-help">
        <h2>Serviços para dependentes</h2>
        <div className="request-card-grid">
          {beneficiaryRequests
            .filter((request) => ['inclusao-dependentes', 'atualizacao-cadastral', 'declaracoes', 'servico-desligamento'].includes(request.id))
            .map((request) => <RequestCard request={request} key={request.id} />)}
        </div>
      </section>
    </div>
  )
}

function UsersIcon() {
  return <span className="svg-mask-icon dependents-icon" aria-hidden="true" />
}

const defaultNotificationPreferences = {
  email: true,
  sms: false,
  whatsapp: false,
  alerts: true,
  reminders: true,
  news: true,
}

const trackableSubjects = ['Todas', 'Cadastro', 'Autorizações', 'Reembolso e auxílios', 'Financeiro', 'Documentos']

export function NotificationsPage() {
  const [categoryFilter, setCategoryFilter] = useState('Todas')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [page, setPage] = useState(1)
  const [notifications, setNotifications] = useState<BeneficiaryNotification[]>(() => getStoredNotifications())
  const [preferencesOpen, setPreferencesOpen] = useState(false)
  const [notificationPreferences, setNotificationPreferences] = useState(defaultNotificationPreferences)
  const [draftPreferences, setDraftPreferences] = useState(defaultNotificationPreferences)
  const [preferencesNotice, setPreferencesNotice] = useState('')

  const notificationCategories = trackableSubjects
  const filteredNotifications = sortNotifications(notifications)
    .filter((notification) => categoryFilter === 'Todas' || notification.category === categoryFilter)
    .filter((notification) => {
      const notificationDate = dateValue(notification.date)
      const startsAfter = !startDate || notificationDate >= new Date(`${startDate}T00:00:00`).getTime()
      const endsBefore = !endDate || notificationDate <= new Date(`${endDate}T23:59:59`).getTime()
      return startsAfter && endsBefore
    })
  const regularNotifications = filteredNotifications
  const notificationsPerPage = 12
  const totalPages = Math.max(1, Math.ceil(regularNotifications.length / notificationsPerPage))
  const visibleNotifications = regularNotifications.slice((page - 1) * notificationsPerPage, page * notificationsPerPage)
  function resetNotificationFilters() {
    setCategoryFilter('Todas')
    setStartDate('')
    setEndDate('')
    setPage(1)
  }

  function markRead(id: string) {
    setNotifications(markNotificationRead(id))
  }

  function markUnread(id: string) {
    setNotifications(markNotificationUnread(id))
  }

  function markAllRead() {
    setNotifications(markAllNotificationsRead())
  }

  function openPreferences() {
    setDraftPreferences(notificationPreferences)
    setPreferencesNotice('')
    setPreferencesOpen(true)
  }

  function closePreferences() {
    setDraftPreferences(notificationPreferences)
    setPreferencesOpen(false)
  }

  function updateDraftPreference(key: keyof typeof defaultNotificationPreferences, value: boolean) {
    setDraftPreferences((current) => ({ ...current, [key]: value }))
  }

  function applyNotificationPreferences() {
    setNotificationPreferences(draftPreferences)
    setPreferencesOpen(false)
    setPreferencesNotice('Preferências de notificações atualizadas.')
  }

  return (
    <div className="notifications-page" id="notifications-section">
      <div className="provider-page-heading page-heading-with-action">
        <div>
          <h1>Notificações</h1>
          <p className="page-subtitle">
            Acompanhe avisos cadastrais, pendências, comunicados e atualizações do Plan-Assiste.
          </p>
        </div>
        <button type="button" onClick={preferencesOpen ? closePreferences : openPreferences}>
          Personalizar
        </button>
      </div>

      {preferencesOpen && (
        <section className="notification-preferences-panel" aria-label="Preferências de notificações">
          <div className="notification-preferences-heading">
            <div>
              <h2>Preferências de notificações</h2>
              <p>Escolha quais alertas deseja receber e por quais canais.</p>
            </div>
            <button type="button" onClick={closePreferences} aria-label="Fechar preferências de notificações">
              <X aria-hidden="true" />
            </button>
          </div>
          <div className="notification-preference-grid">
            <label><input type="checkbox" checked={draftPreferences.alerts} onChange={(event) => updateDraftPreference('alerts', event.target.checked)} /> Alertas de solicitações e pendências</label>
            <label><input type="checkbox" checked={draftPreferences.reminders} onChange={(event) => updateDraftPreference('reminders', event.target.checked)} /> Lembretes de carteirinha, IRPF e extratos</label>
            <label><input type="checkbox" checked={draftPreferences.news} onChange={(event) => updateDraftPreference('news', event.target.checked)} /> Notícias e comunicados do Plan-Assiste</label>
            <label><input type="checkbox" checked={draftPreferences.email} onChange={(event) => updateDraftPreference('email', event.target.checked)} /> Receber por e-mail</label>
            <label><input type="checkbox" checked={draftPreferences.sms} onChange={(event) => updateDraftPreference('sms', event.target.checked)} /> Receber por SMS</label>
            <label className="is-disabled" title="Confirme seu número de WhatsApp em Meus dados para habilitar esta opção.">
              <input type="checkbox" checked={draftPreferences.whatsapp} disabled={!whatsAppConfirmed} onChange={(event) => updateDraftPreference('whatsapp', event.target.checked)} />
              <span>Receber por WhatsApp<small>Número ainda não confirmado</small></span>
            </label>
          </div>
          <div className="notification-preferences-actions">
            <button className="primary-button" type="button" onClick={applyNotificationPreferences}>Aplicar alterações</button>
            <button type="button" onClick={closePreferences}>Cancelar</button>
          </div>
        </section>
      )}

      {preferencesNotice && <p className="action-notice" role="status">{preferencesNotice}</p>}

      <section className="notification-toolbar notification-primary-filters" aria-label="Filtros de notificações">
        <label className="shared-date-range-filter">
          Período
          <NewsDateRangePicker startDate={startDate} endDate={endDate} onChange={(start, end) => { setStartDate(start); setEndDate(end); setPage(1) }} />
        </label>
        <button className="filter-clear-button" type="button" onClick={resetNotificationFilters}>Limpar</button>
        <button type="button" onClick={markAllRead}>Marcar todas como lidas</button>
      </section>

      <div className="topic-filter-buttons notification-category-buttons" aria-label="Filtrar notificações por assunto">
        {notificationCategories.map((category) => (
          <button
            type="button"
            className={categoryFilter === category ? 'selected' : ''}
            aria-pressed={categoryFilter === category}
            onClick={() => { setCategoryFilter(category); setPage(1) }}
            key={category}
          >
            {category}
          </button>
        ))}
      </div>

      <section className="notifications-list" aria-label="Lista de notificações">
        <div className="notifications-card-grid">
          {visibleNotifications.map((notification) => (
            <article
              className={`notification-list-item ${notification.read ? 'is-read' : 'is-unread'}`}
              key={notification.id}
            >
              <div className="notification-card-meta">
                <span className="notification-card-subject">{notification.category}</span>
                <span className="notification-status-label">{notification.read ? 'Lida' : 'Não lida'}</span>
              </div>
              <h2>{notification.title}</h2>
              <p>{notification.detail}</p>
              <small>{notification.date}</small>
              <div className="notification-card-actions">
                {notification.read ? (
                  <button type="button" onClick={() => markUnread(notification.id)}>Marcar como não lida</button>
                ) : (
                  <button type="button" onClick={() => markRead(notification.id)}>Marcar como lida</button>
                )}
                {notification.route && <Link className="primary-button" to={notification.route}>Abrir serviço relacionado</Link>}
              </div>
            </article>
          ))}
          {visibleNotifications.length === 0 && <p className="notification-empty">Nenhuma notificação encontrada para os filtros selecionados.</p>}
        </div>
        {totalPages > 1 && (
          <nav className="notification-pagination" aria-label="Páginas de notificações">
            <button type="button" disabled={page === 1} onClick={() => setPage((current) => current - 1)}><ChevronLeft aria-hidden="true" /> Anterior</button>
            <span>Página {page} de {totalPages}</span>
            <button type="button" disabled={page === totalPages} onClick={() => setPage((current) => current + 1)}>Próxima <ChevronRight aria-hidden="true" /></button>
          </nav>
        )}
      </section>

    </div>
  )
}

// ============================================================
// Minhas Solicitações
// ============================================================

type MinhasSolicitacaoAssunto = 'Autorizações' | 'Cadastro' | 'Reembolso e auxílios' | 'Financeiro' | 'Documentos'

type MinhasSolicitacao = {
  id: string
  assunto: MinhasSolicitacaoAssunto
  tipo: string
  beneficiario: string
  data: string
  status: MinhasSolicitacaoStatus
  formulario: MinhasSolicitacaoFormField[]
  anexos: string[]
  atualizacoes: MinhasSolicitacaoAtualizacao[]
}

const minhasSolicitacoesData: MinhasSolicitacao[] = [
  {
    id: 'SOL-2026-001', assunto: 'Reembolso e auxílios', tipo: 'Reembolso de Procedimento', beneficiario: 'João Silva Santos (Titular)', data: '20/03/2026', status: 'Suspenso',
    formulario: [
      { label: 'Tipo de reembolso', value: 'Consulta/Avaliação' },
      { label: 'Beneficiário atendido', value: 'João Silva Santos' },
      { label: 'Nº nota fiscal/recibo', value: 'NF-9987' },
      { label: 'Data da nota fiscal/recibo', value: '15/03/2026' },
      { label: 'CPF/CNPJ credenciado', value: '12.345.678/0001-90' },
      { label: 'Valor', value: 'R$ 280,00' },
    ],
    anexos: ['nota-fiscal-9987.pdf', 'comprovante-pagamento.pdf'],
    atualizacoes: [
      { data: '22/03/2026', titulo: 'Solicitação suspensa', descricao: 'Aguardando documento complementar para prosseguir com a análise.' },
      { data: '20/03/2026', titulo: 'Solicitação recebida', descricao: 'Sua solicitação foi registrada e está na fila de análise.' },
    ],
  },
  {
    id: 'SOL-2026-002', assunto: 'Reembolso e auxílios', tipo: 'Reembolso de Procedimento', beneficiario: 'Maria Silva Santos (Cônjuge)', data: '15/03/2026', status: 'Concluída',
    formulario: [
      { label: 'Tipo de reembolso', value: 'Psicologia' },
      { label: 'Beneficiário atendido', value: 'Maria Silva Santos' },
      { label: 'Nº nota fiscal/recibo', value: 'REC-2209' },
      { label: 'Data da nota fiscal/recibo', value: '10/03/2026' },
      { label: 'CPF/CNPJ credenciado', value: '987.654.321-00' },
      { label: 'Valor', value: 'R$ 450,00' },
    ],
    anexos: ['recibo-2209.pdf'],
    atualizacoes: [
      { data: '19/03/2026', titulo: 'Reembolso aprovado', descricao: 'Valor de R$ 450,00 aprovado e enviado para crédito na conta cadastrada.' },
      { data: '17/03/2026', titulo: 'Em andamento', descricao: 'Documentação em conferência pela equipe técnica.' },
      { data: '15/03/2026', titulo: 'Solicitação recebida', descricao: 'Sua solicitação foi registrada e está na fila de análise.' },
    ],
  },
  {
    id: 'SOL-2026-003', assunto: 'Reembolso e auxílios', tipo: 'Reembolso de Procedimento', beneficiario: 'João Silva Santos (Titular)', data: '05/03/2026', status: 'Concluída',
    formulario: [
      { label: 'Tipo de reembolso', value: 'Exames' },
      { label: 'Beneficiário atendido', value: 'João Silva Santos' },
      { label: 'Nº nota fiscal/recibo', value: 'NF-7712' },
      { label: 'Data da nota fiscal/recibo', value: '01/03/2026' },
      { label: 'CPF/CNPJ credenciado', value: '23.456.789/0001-10' },
      { label: 'Valor', value: 'R$ 186,40' },
    ],
    anexos: ['nota-fiscal-7712.pdf'],
    atualizacoes: [
      { data: '08/03/2026', titulo: 'Solicitação recusada', descricao: 'Procedimento fora da cobertura contratual. Consulte as orientações de reembolso para mais detalhes.' },
      { data: '06/03/2026', titulo: 'Em andamento', descricao: 'Documentação em conferência pela equipe técnica.' },
      { data: '05/03/2026', titulo: 'Solicitação recebida', descricao: 'Sua solicitação foi registrada e está na fila de análise.' },
    ],
  },
  {
    id: 'SOL-2026-004', assunto: 'Reembolso e auxílios', tipo: 'Reembolso de Procedimento', beneficiario: 'Pedro Silva Santos (Filho)', data: '28/02/2026', status: 'Concluída',
    formulario: [
      { label: 'Tipo de reembolso', value: 'Fonoaudiologia' },
      { label: 'Beneficiário atendido', value: 'Pedro Silva Santos' },
      { label: 'Nº nota fiscal/recibo', value: 'NF-6650' },
      { label: 'Data da nota fiscal/recibo', value: '24/02/2026' },
      { label: 'CPF/CNPJ credenciado', value: '34.567.890/0001-21' },
      { label: 'Valor', value: 'R$ 210,00' },
    ],
    anexos: ['nota-fiscal-6650.pdf'],
    atualizacoes: [
      { data: '03/03/2026', titulo: 'Reembolso aprovado', descricao: 'Valor de R$ 210,00 aprovado e enviado para crédito na conta cadastrada.' },
      { data: '01/03/2026', titulo: 'Em andamento', descricao: 'Documentação em conferência pela equipe técnica.' },
      { data: '28/02/2026', titulo: 'Solicitação recebida', descricao: 'Sua solicitação foi registrada e está na fila de análise.' },
    ],
  },
  {
    id: 'MED-2026-001', assunto: 'Reembolso e auxílios', tipo: 'Auxílio para Medicamentos', beneficiario: 'João Silva Santos (Titular)', data: '22/03/2026', status: 'Reativado',
    formulario: [
      { label: 'Beneficiário atendido', value: 'João Silva Santos' },
      { label: 'Medicamento', value: 'Uso contínuo - anti-hipertensivo' },
      { label: 'Receita médica', value: 'Anexada' },
      { label: 'Valor da compra', value: 'R$ 132,90' },
    ],
    anexos: ['receita-medica.pdf', 'nota-fiscal-farmacia.pdf'],
    atualizacoes: [
      { data: '25/03/2026', titulo: 'Solicitação reativada', descricao: 'Documento complementar recebido. A análise foi retomada pela equipe técnica.' },
      { data: '23/03/2026', titulo: 'Solicitação suspensa', descricao: 'Aguardando receita médica atualizada para prosseguir com a análise.' },
      { data: '22/03/2026', titulo: 'Solicitação recebida', descricao: 'Sua solicitação foi registrada e está na fila de análise.' },
    ],
  },
  {
    id: 'MED-2026-002', assunto: 'Reembolso e auxílios', tipo: 'Auxílio para Medicamentos', beneficiario: 'Maria Silva Santos (Cônjuge)', data: '10/03/2026', status: 'Concluída',
    formulario: [
      { label: 'Beneficiário atendido', value: 'Maria Silva Santos' },
      { label: 'Medicamento', value: 'Alto custo - imunossupressor' },
      { label: 'Receita médica', value: 'Anexada' },
      { label: 'Valor da compra', value: 'R$ 890,00' },
    ],
    anexos: ['receita-medica.pdf', 'relatorio-medico.pdf', 'nota-fiscal-farmacia.pdf'],
    atualizacoes: [
      { data: '14/03/2026', titulo: 'Auxílio aprovado', descricao: 'Valor de R$ 890,00 aprovado e enviado para crédito na conta cadastrada.' },
      { data: '12/03/2026', titulo: 'Em andamento', descricao: 'Documentação em conferência pela equipe técnica.' },
      { data: '10/03/2026', titulo: 'Solicitação recebida', descricao: 'Sua solicitação foi registrada e está na fila de análise.' },
    ],
  },
  {
    id: 'MED-2026-003', assunto: 'Reembolso e auxílios', tipo: 'Auxílio para Medicamentos', beneficiario: 'João Silva Santos (Titular)', data: '20/02/2026', status: 'Concluída',
    formulario: [
      { label: 'Beneficiário atendido', value: 'João Silva Santos' },
      { label: 'Medicamento', value: 'Uso contínuo - anti-hipertensivo' },
      { label: 'Receita médica', value: 'Anexada' },
      { label: 'Valor da compra', value: 'R$ 128,50' },
    ],
    anexos: ['receita-medica.pdf', 'nota-fiscal-farmacia.pdf'],
    atualizacoes: [
      { data: '24/02/2026', titulo: 'Auxílio aprovado', descricao: 'Valor de R$ 128,50 aprovado e enviado para crédito na conta cadastrada.' },
      { data: '22/02/2026', titulo: 'Em andamento', descricao: 'Documentação em conferência pela equipe técnica.' },
      { data: '20/02/2026', titulo: 'Solicitação recebida', descricao: 'Sua solicitação foi registrada e está na fila de análise.' },
    ],
  },
  {
    id: 'DEP-2026-001', assunto: 'Cadastro', tipo: 'Inscrição de Dependente', beneficiario: 'Maria Silva Santos', data: '10/01/2026', status: 'Concluída',
    formulario: [
      { label: 'Nome do dependente', value: 'Maria Silva Santos' },
      { label: 'Parentesco', value: 'Cônjuge' },
      { label: 'Data de nascimento', value: '14/06/1988' },
    ],
    anexos: ['certidao-casamento.pdf', 'documento-identidade.pdf'],
    atualizacoes: [
      { data: '18/01/2026', titulo: 'Inscrição aprovada', descricao: 'Dependente incluído no cadastro do Plan-Assiste.' },
      { data: '13/01/2026', titulo: 'Em andamento', descricao: 'Documentação em conferência pela equipe de cadastro.' },
      { data: '10/01/2026', titulo: 'Solicitação recebida', descricao: 'Sua solicitação foi registrada e está na fila de análise.' },
    ],
  },
  {
    id: 'DEP-2026-002', assunto: 'Cadastro', tipo: 'Inscrição de Dependente', beneficiario: 'Pedro Silva Santos', data: '05/03/2026', status: 'Suspenso',
    formulario: [
      { label: 'Nome do dependente', value: 'Pedro Silva Santos' },
      { label: 'Parentesco', value: 'Filho' },
      { label: 'Data de nascimento', value: '02/09/2015' },
    ],
    anexos: ['certidao-nascimento.pdf'],
    atualizacoes: [
      { data: '08/03/2026', titulo: 'Solicitação suspensa', descricao: 'Certidão de nascimento ilegível. Envie uma nova cópia digitalizada.' },
      { data: '05/03/2026', titulo: 'Solicitação recebida', descricao: 'Sua solicitação foi registrada e está na fila de análise.' },
    ],
  },
  {
    id: 'AUT-2026-001', assunto: 'Autorizações', tipo: 'Autorização de Procedimento', beneficiario: 'João Silva Santos (Titular)', data: '23/03/2026', status: 'Reaberto',
    formulario: [
      { label: 'Procedimento solicitado', value: 'Fisioterapia' },
      { label: 'Beneficiário atendido', value: 'João Silva Santos' },
      { label: 'Pedido médico', value: 'Anexado' },
    ],
    anexos: ['pedido-medico.pdf', 'relatorio-fisioterapico.pdf'],
    atualizacoes: [
      { data: '27/03/2026', titulo: 'Solicitação reaberta', descricao: 'O beneficiário reabriu a solicitação após anexar o relatório fisioterápico faltante.' },
      { data: '25/03/2026', titulo: 'Solicitação recusada', descricao: 'Relatório fisioterápico não apresentado. Consulte os documentos exigidos.' },
      { data: '23/03/2026', titulo: 'Solicitação recebida', descricao: 'Sua solicitação foi registrada e está na fila de análise.' },
    ],
  },
  {
    id: 'AUT-2026-002', assunto: 'Autorizações', tipo: 'Autorização de Procedimento', beneficiario: 'Maria Silva Santos (Cônjuge)', data: '15/02/2026', status: 'Concluída',
    formulario: [
      { label: 'Procedimento solicitado', value: 'Psicologia' },
      { label: 'Beneficiário atendido', value: 'Maria Silva Santos' },
      { label: 'Pedido médico', value: 'Anexado' },
    ],
    anexos: ['pedido-medico.pdf', 'relatorio-psicologico.pdf'],
    atualizacoes: [
      { data: '19/02/2026', titulo: 'Autorização aprovada', descricao: 'Sessões autorizadas junto à rede credenciada.' },
      { data: '17/02/2026', titulo: 'Em andamento', descricao: 'Documentação em conferência pela equipe técnica.' },
      { data: '15/02/2026', titulo: 'Solicitação recebida', descricao: 'Sua solicitação foi registrada e está na fila de análise.' },
    ],
  },
  {
    id: 'AUT-2026-003', assunto: 'Autorizações', tipo: 'Autorização de Procedimento', beneficiario: 'Pedro Silva Santos (Filho)', data: '02/02/2026', status: 'Concluída',
    formulario: [
      { label: 'Procedimento solicitado', value: 'Acupuntura' },
      { label: 'Beneficiário atendido', value: 'Pedro Silva Santos' },
      { label: 'Pedido médico', value: 'Anexado' },
    ],
    anexos: ['pedido-medico.pdf'],
    atualizacoes: [
      { data: '06/02/2026', titulo: 'Solicitação recusada', descricao: 'Relatório fisioterápico não apresentado. Consulte os documentos exigidos e solicite novamente.' },
      { data: '04/02/2026', titulo: 'Em andamento', descricao: 'Documentação em conferência pela equipe técnica.' },
      { data: '02/02/2026', titulo: 'Solicitação recebida', descricao: 'Sua solicitação foi registrada e está na fila de análise.' },
    ],
  },
  {
    id: 'FIN-2026-001', assunto: 'Financeiro', tipo: 'Revisão de Custeio', beneficiario: 'João Silva Santos (Titular)', data: '18/03/2026', status: 'Em andamento',
    formulario: [
      { label: 'Beneficiário atendido', value: 'João Silva Santos' },
      { label: 'Mês de referência', value: 'Fevereiro/2026' },
      { label: 'Descrição', value: 'Divergência no valor de coparticipação descontado em folha.' },
    ],
    anexos: ['contracheque-fevereiro.pdf'],
    atualizacoes: [
      { data: '22/03/2026', hora: '09:15', titulo: 'Atendimento', descricao: 'Recebemos sua solicitação e já estamos analisando. Segue o comprovante e o parecer técnico gerados até o momento.', autor: 'atendente', anexos: ['comprovante-atualizacao.pdf', 'parecer-tecnico.pdf'] },
      { data: '20/03/2026', hora: '11:40', titulo: 'Em andamento', descricao: 'Solicitação encaminhada para a área financeira.' },
      { data: '18/03/2026', hora: '15:00', titulo: 'Solicitação recebida', descricao: 'Sua solicitação foi registrada e está na fila de análise.' },
    ],
  },
  {
    id: 'FIN-2026-002', assunto: 'Financeiro', tipo: 'Regularização de Desconto', beneficiario: 'João Silva Santos (Titular)', data: '12/02/2026', status: 'Concluída',
    formulario: [
      { label: 'Beneficiário atendido', value: 'João Silva Santos' },
      { label: 'Mês de referência', value: 'Janeiro/2026' },
      { label: 'Descrição', value: 'Desconto em duplicidade de coparticipação.' },
    ],
    anexos: ['contracheque-janeiro.pdf'],
    atualizacoes: [
      { data: '20/02/2026', titulo: 'Regularização aprovada', descricao: 'Valor será estornado na próxima folha de pagamento.' },
      { data: '16/02/2026', titulo: 'Em andamento', descricao: 'Solicitação encaminhada para a área financeira.' },
      { data: '12/02/2026', titulo: 'Solicitação recebida', descricao: 'Sua solicitação foi registrada e está na fila de análise.' },
    ],
  },
  {
    id: 'DOC-2026-001', assunto: 'Documentos', tipo: 'Emissão de Declaração', beneficiario: 'Maria Silva Santos (Cônjuge)', data: '08/03/2026', status: 'Concluída',
    formulario: [
      { label: 'Beneficiário atendido', value: 'Maria Silva Santos' },
      { label: 'Documento solicitado', value: 'Declaração de vida em comum' },
      { label: 'Finalidade', value: 'Atualização cadastral' },
    ],
    anexos: [],
    atualizacoes: [
      { data: '11/03/2026', titulo: 'Declaração emitida', descricao: 'Documento disponível para download em Meus dados.' },
      { data: '08/03/2026', titulo: 'Solicitação recebida', descricao: 'Sua solicitação foi registrada e está na fila de análise.' },
    ],
  },
  {
    id: 'DOC-2026-002', assunto: 'Documentos', tipo: 'Segunda Via de Documento', beneficiario: 'Pedro Silva Santos (Filho)', data: '25/02/2026', status: 'Suspenso',
    formulario: [
      { label: 'Beneficiário atendido', value: 'Pedro Silva Santos' },
      { label: 'Documento solicitado', value: 'Carteirinha do Plan-Assiste' },
    ],
    anexos: [],
    atualizacoes: [
      { data: '27/02/2026', titulo: 'Solicitação suspensa', descricao: 'Aguardando confirmação do endereço de entrega.' },
      { data: '25/02/2026', titulo: 'Solicitação recebida', descricao: 'Sua solicitação foi registrada e está na fila de análise.' },
    ],
  },
  {
    id: 'DOC-2026-003', assunto: 'Documentos', tipo: 'Emissão de Declaração', beneficiario: 'João Silva Santos (Titular)', data: '28/03/2026', status: 'Aberto',
    formulario: [
      { label: 'Beneficiário atendido', value: 'João Silva Santos' },
      { label: 'Documento solicitado', value: 'Declaração de dependentes' },
      { label: 'Finalidade', value: 'Imposto de renda' },
    ],
    anexos: [],
    atualizacoes: [
      { data: '28/03/2026', titulo: 'Solicitação recebida', descricao: 'Sua solicitação foi registrada e está na fila de análise.' },
    ],
  },
]

function anexoIcone(nome: string) {
  const extensao = nome.split('.').pop()?.toLowerCase() ?? ''
  if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(extensao)) return <FileImage aria-hidden="true" />
  return <FileText aria-hidden="true" />
}

export function AnexoItem({ nome, onNotice }: { nome: string, onNotice: (mensagem: string) => void }) {
  return (
    <li>
      {anexoIcone(nome)}
      <span className="solicitacao-attachment-name">{nome}</span>
      <span className="solicitacao-attachment-actions">
        <button type="button" title="Visualizar arquivo" aria-label={`Visualizar ${nome}`} onClick={() => onNotice(`Visualização de "${nome}" indisponível neste protótipo.`)}>
          <Eye aria-hidden="true" />
        </button>
        <button type="button" title="Baixar arquivo" aria-label={`Baixar ${nome}`} onClick={() => onNotice(`Download de "${nome}" simulado.`)}>
          <Download aria-hidden="true" />
        </button>
      </span>
    </li>
  )
}

export function MinhasSolicitacoesPage() {
  const [requestLauncherOpen, setRequestLauncherOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('Todas')
  const [typeFilter, setTypeFilter] = useState('Todas')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const tiposDisponiveis = ['Todas', ...Array.from(new Set(novaSolicitacaoTypes.map((t) => t.title))).sort((a, b) => a.localeCompare(b, 'pt-BR'))]
  const tipoOptions = tiposDisponiveis.map((tipo) => ({ value: tipo, label: tipo }))

  const filtered = minhasSolicitacoesData
    .filter((s) => statusFilter === 'Todas' || s.status === statusFilter)
    .filter((s) => typeFilter === 'Todas' || s.tipo === typeFilter)
    .filter((s) => {
      const [day, month, year] = s.data.split('/')
      const value = `${year}-${month}-${day}`
      return (!startDate || value >= startDate) && (!endDate || value <= endDate)
    })
    .filter((s) => {
      const search = query.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
      if (!search) return true
      return `${s.id} ${s.assunto} ${s.tipo} ${s.beneficiario}`
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
  }, [query, statusFilter, typeFilter, startDate, endDate, pageSize])

  const aberto = minhasSolicitacoesData.filter((s) => s.status === 'Aberto').length
  const emAndamento = minhasSolicitacoesData.filter((s) => s.status === 'Em andamento').length
  const suspenso = minhasSolicitacoesData.filter((s) => s.status === 'Suspenso').length
  const reativado = minhasSolicitacoesData.filter((s) => s.status === 'Reativado').length
  const reaberto = minhasSolicitacoesData.filter((s) => s.status === 'Reaberto').length
  const concluida = minhasSolicitacoesData.filter((s) => s.status === 'Concluída').length

  return (
    <div>
      <div className="provider-page-heading">
        <h1>Minhas solicitações</h1>
        <p className="page-subtitle">
          Acompanhe o status de todas as suas solicitações em um só lugar.
        </p>
      </div>

      <section className="reimbursement-summary reimbursement-summary-6" aria-label="Resumo das solicitações">
        <article>
          <FileText aria-hidden="true" />
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
            <p>Filtre por situação ou pesquise por ID, tipo ou beneficiário.</p>
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
                  placeholder="ID, tipo ou beneficiário..."
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
              Tipo
              <Combobox
                value={typeFilter}
                options={tipoOptions}
                onSelect={setTypeFilter}
                placeholder="Selecione o tipo"
                onClear={typeFilter !== 'Todas' ? () => setTypeFilter('Todas') : undefined}
              />
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
                setTypeFilter('Todas')
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
                <th>Tipo</th>
                <th>Beneficiário</th>
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
                    <td><span className="requests-cell-wrap">{s.tipo}</span></td>
                    <td><span className="requests-cell-wrap">{s.beneficiario}</span></td>
                    <td>
                      <span className={solicitacaoStatusBadge(s.status)}>{solicitacaoStatusLabel(s.status)}</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <Link
                        to={`/beneficiario/solicitacoes/${s.id}`}
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
      <RequestLauncherModal open={requestLauncherOpen} onClose={() => setRequestLauncherOpen(false)} />
    </div>
  )
}

// ============================================================
// Acompanhamento de uma solicitação
// ============================================================

export function SolicitacaoDetalhePage() {
  const { id } = useParams()
  const solicitacao = minhasSolicitacoesData.find((item) => item.id === id)
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
      <div className="reimbursements-page">
        <div className="provider-page-heading">
          <h1>Solicitação não encontrada</h1>
          <p className="page-subtitle">Verifique o link ou volte para a lista de solicitações.</p>
        </div>
        <Link className="text-link provider-detail-back" to="/beneficiario/solicitacoes">
          <ArrowLeft aria-hidden="true" /> Voltar para Minhas solicitações
        </Link>
      </div>
    )
  }

  return (
    <div className="reimbursements-page">
      <Link className="text-link provider-detail-back" to="/beneficiario/solicitacoes">
        <ArrowLeft aria-hidden="true" /> Voltar para Minhas solicitações
      </Link>
      <div className="provider-page-heading">
        <h1>Acompanhamento da solicitação</h1>
        <p className="page-subtitle">Protocolo, dados enviados e atualizações de {solicitacao.tipo.toLowerCase()}.</p>
      </div>

      <section className="reimbursement-card" aria-label="Resumo da solicitação">
        <div className="solicitacao-protocol-plain">
          <span>Nº do protocolo</span>
          <strong>{solicitacao.id}</strong>
        </div>
        <div className="reimbursement-form-section">
          <dl className="service-review-grid">
            <div className="service-review-row"><dt>Serviço</dt><dd>{solicitacao.tipo}</dd></div>
            <div className="service-review-row"><dt>Assunto</dt><dd>{solicitacao.assunto}</dd></div>
            <div className="service-review-row"><dt>Beneficiário</dt><dd>{solicitacao.beneficiario}</dd></div>
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
          <div className="go-modal" role="dialog" aria-modal="true" aria-labelledby="reopen-modal-title" onClick={(event) => event.stopPropagation()}>
            <div className="go-modal-header">
              <h2 id="reopen-modal-title">Reabrir solicitação</h2>
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
  )
}

export function SolicitacaoRating({ requestId }: { requestId: string }) {
  const [favoriteState, setFavoriteState] = useState<FavoriteState>(() => getFavoriteState())
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')

  const saved = favoriteState.requestRatings[requestId]

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!rating) return
    setFavoriteState(setRequestRating(requestId, rating, comment))
  }

  if (saved) {
    return (
      <section className="reimbursement-card solicitacao-rating-card solicitacao-rating-submitted" aria-label="Avaliação enviada">
        <BadgeCheck aria-hidden="true" className="service-success-icon" />
        <h3>Avaliação enviada!</h3>
        <p>Obrigado pelo seu feedback.</p>
        <div className="solicitacao-rating-result-stars" aria-hidden="true">
          {[1, 2, 3, 4, 5].map((value) => (
            <Star key={value} className={value <= saved.rating ? 'star-filled' : ''} />
          ))}
        </div>
        <p className="solicitacao-rating-result-label">Sua nota: {solicitacaoRatingLabels[saved.rating - 1]}</p>
      </section>
    )
  }

  const previewRating = hoverRating || rating

  return (
    <section className="reimbursement-card solicitacao-rating-card" aria-label="Avalie o atendimento">
      <h3>Avalie o atendimento</h3>
      <form onSubmit={handleSubmit}>
        <div
          className="solicitacao-rating-stars"
          role="radiogroup"
          aria-label="Nota do atendimento"
          onMouseLeave={() => setHoverRating(0)}
        >
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              type="button"
              key={value}
              className={value <= previewRating ? 'is-selected' : ''}
              role="radio"
              aria-checked={rating === value}
              onMouseEnter={() => setHoverRating(value)}
              onFocus={() => setHoverRating(value)}
              onBlur={() => setHoverRating(0)}
              onClick={() => setRating(value)}
            >
              <span className="solicitacao-rating-star-circle">
                <Star aria-hidden="true" fill={value <= previewRating ? 'currentColor' : 'none'} />
              </span>
              <span>{solicitacaoRatingLabels[value - 1]}</span>
            </button>
          ))}
        </div>
        <label className="solicitacao-rating-comment">
          Observações (opcional)
          <textarea
            rows={3}
            placeholder="Deixe um comentário sobre o atendimento..."
            value={comment}
            onChange={(event) => setComment(event.target.value)}
          />
        </label>
        <button className="primary-button" type="submit" disabled={!rating}>Enviar avaliação</button>
      </form>
    </section>
  )
}

// ============================================================
// Nova Solicitação – catálogo de tipos (abre em nova aba)
// ============================================================

const requestIconByCategory: Record<BeneficiaryRequest['category'], LucideIcon> = {
  Cadastro: UserPlus,
  Autorizações: ClipboardCheck,
  'Reembolso e auxílios': HandCoins,
  Financeiro: WalletCards,
  'Rede e atendimento': Stethoscope,
  Documentos: FileText,
  'Orientações e canais': HelpCircle,
  Cobertura: ShieldCheck,
  'Fale Conosco': MessageCircle,
}

const novaSolicitacaoTypes = beneficiaryRequests
  .filter((service) => service.route?.includes('nova-solicitacao'))
  .map((service) => ({
    id: service.id,
    icon: requestIconById[service.id] ?? requestIconByCategory[service.category] ?? ClipboardList,
    title: service.title,
    description: service.description,
    tags: [requestCategoryLabel[service.category] ?? service.category, ...service.tags.slice(0, 2)],
    category: service.category,
    url: service.route ?? '',
  }))

function RequestLauncherModal({ open, onClose }: { open: boolean, onClose: () => void }) {
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

  const search = query.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
  const normalize = (value: string) => value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  const titleMatches = (service: typeof novaSolicitacaoTypes[number]) => normalize(service.title).includes(search)
  const visible = novaSolicitacaoTypes
    .filter((service) => !search || normalize(`${service.title} ${service.description} ${service.tags.slice(1).join(' ')}`).includes(search))
    .sort((a, b) => (search ? Number(titleMatches(b)) - Number(titleMatches(a)) : 0))

  return (
    <div className="request-launcher-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className="request-launcher-dialog" role="dialog" aria-modal="true" aria-labelledby="request-launcher-title">
        <header>
          <div>
            <p className="eyebrow">Nova solicitação</p>
            <h2 id="request-launcher-title">O que você deseja solicitar?</h2>
            <p>Escolha um serviço para abrir diretamente o formulário correspondente.</p>
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
              const Icon = service.icon
              return (
                <Link to={service.url} className="request-launcher-item" onClick={onClose} key={service.id}>
                  <Icon aria-hidden="true" />
                  <span><strong>{service.title}</strong><small>{service.description}</small></span>
                  <ArrowRight aria-hidden="true" />
                </Link>
              )
            })}
            {visible.length === 0 && <p className="request-launcher-empty">Nenhuma solicitação encontrada.</p>}
          </div>
          <footer><Link to="/beneficiario/servicos" onClick={onClose}>Ver catálogo completo de serviços</Link></footer>
        </div>
      </section>
    </div>
  )
}

export function NovaSolicitacaoPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Todos')

  const search = query.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
  const normalize = (value: string) => value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  const titleMatches = (s: typeof novaSolicitacaoTypes[number]) => normalize(s.title).includes(search)
  const visible = novaSolicitacaoTypes
    .filter((s) => {
      if (category !== 'Todos' && s.category !== category) return false
      if (!search) return true
      return normalize(`${s.title} ${s.description} ${s.tags.slice(1).join(' ')}`).includes(search)
    })
    .sort((a, b) => (search ? Number(titleMatches(b)) - Number(titleMatches(a)) : 0))

  return (
    <div className="requests-page">
      <div className="provider-page-heading">
        <h1>Nova solicitação</h1>
        <p className="page-subtitle">
          Escolha o tipo de solicitação que deseja criar e preencha o formulário correspondente.
        </p>
      </div>

      <section className="request-toolbar" aria-label="Filtrar tipos de solicitação">
        <label>
          Buscar
          <span className="clearable-input"><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Pesquise o tipo de solicitação..." />{query && <button type="button" onClick={() => setQuery('')} aria-label="Limpar busca"><X aria-hidden="true" /></button>}</span>
        </label>
        <label>Assunto<select value={category} onChange={(event) => setCategory(event.target.value)}>{requestCategories.map((item) => <option value={item} key={item}>{requestCategoryLabel[item] ?? item}</option>)}</select></label>
        <button className="filter-clear-button" type="button" onClick={() => { setQuery(''); setCategory('Todos') }}>Limpar filtros</button>
      </section>

      <div className="request-results-heading">
        <h2>Tipos de solicitação disponíveis</h2>
        <div className="search-results-summary">
          <span aria-live="polite">{visible.length} {visible.length === 1 ? 'tipo encontrado' : 'tipos encontrados'}</span>
        </div>
      </div>

      <section className="request-card-grid" aria-label="Tipos de solicitação">
        {visible.map((s) => {
          const Icon = s.icon
          return (
            <article key={s.id} className="request-card">
              <div className="request-card-icon"><Icon aria-hidden="true" /></div>
              <div>
                <h3>{s.title}</h3>
                <p>{s.description}</p>
                <div className="provider-tags">
                  {s.tags.map((tag) => <span key={tag}>{tag}</span>)}
                </div>
              </div>
              <button
                className="request-action"
                type="button"
                onClick={() => navigate(s.url)}
              >
                Iniciar solicitação <ArrowRight aria-hidden="true" />
              </button>
            </article>
          )
        })}
      </section>
    </div>
  )
}

export function PlaceholderPage({ page }: { page: { title: string, subtitle: string } }) {
  return (
    <div className="placeholder-page">
      <div className="provider-page-heading">
        <h1>{page.title}</h1>
        <p className="page-subtitle">{page.subtitle}</p>
      </div>
      <div data-reveal><EmptyState title={`${page.title} em construção`} /></div>
    </div>
  )
}
