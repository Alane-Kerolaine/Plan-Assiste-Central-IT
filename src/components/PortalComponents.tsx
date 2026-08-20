import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  BadgeCheck,
  Bell,
  Building2,
  ChevronDown,
  CircleUserRound,
  Database,
  Download,
  Ear,
  ExternalLink,
  FileCheck2,
  FileSpreadsheet,
  HandCoins,
  HeartPulse,
  HelpCircle,
  Home,
  IdCard,
  ListChecks,
  LockKeyhole,
  LogIn,
  LogOut,
  Mail,
  Megaphone,
  Menu,
  MessageCircle,
  MonitorCheck,
  Phone,
  Search,
  ShieldCheck,
  Star,
  Stethoscope,
  ReceiptText,
  X,
  type LucideIcon,
} from 'lucide-react'
import { reopenCookiePreferences } from './CookieConsent'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState, type ComponentType, type FormEvent, type HTMLAttributes } from 'react'
import { mockUser, type IconName, type Service } from '../data/mock'
import {
  getStoredNotifications,
  markNotificationRead,
  sortNotifications,
  type BeneficiaryNotification,
} from '../utils/notifications'
import {
  createGovBrSession,
  createProviderSession,
  getProfileHome,
  getStoredSession,
  setActiveProfile,
  storeSession,
  type PortalProfile,
} from '../utils/session'
import { getStoredUserProfile } from '../utils/userProfile'
import { nomeExibicao } from '../utils/nomeSocial'
import { GovBrSignInButton } from './GovBrSignInButton'
import { getCmsAddresses, getCmsContactChannels, getCmsSocialLinks } from '../cms/siteContentRepository'
export { ProviderSearch } from './ProviderNetwork'

type PortalIcon = LucideIcon | ComponentType<HTMLAttributes<HTMLSpanElement>>

function DependentsIcon(props: HTMLAttributes<HTMLSpanElement>) {
  return <span className="svg-mask-icon dependents-icon" {...props} />
}

const iconMap: Record<IconName, PortalIcon> = {
  home: Home,
  card: IdCard,
  network: Building2,
  list: ListChecks,
  refund: HandCoins,
  money: FileSpreadsheet,
  users: DependentsIcon,
  database: Database,
  bell: Bell,
  star: Star,
  file: FileCheck2,
  invoice: ReceiptText,
  userRound: CircleUserRound,
  heartPulse: HeartPulse,
  download: Download,
  badge: BadgeCheck,
  portal: MonitorCheck,
  mail: Mail,
  help: HelpCircle,
}

export function Logo({ inverse = false }: { inverse?: boolean }) {
  const logoSrc = inverse ? '/assets/logo-branca.svg' : '/assets/logo-colorida.svg'

  return (
    <Link to="/" className={`logo ${inverse ? 'logo-inverse' : ''}`} aria-label="Página inicial do Plan-Assiste">
      <img src={logoSrc} alt="Plan-Assiste" />
    </Link>
  )
}

function SocialLinks() {
  const [highContrast, setHighContrast] = useState(
    () => localStorage.getItem('planAssisteContrast') === 'true',
  )

  useEffect(() => {
    document.documentElement.classList.toggle('high-contrast', highContrast)
    localStorage.setItem('planAssisteContrast', String(highContrast))
  }, [highContrast])

  return (
    <div className="social-links" aria-label="Redes sociais e acessibilidade">
      <Link to="/noticias" aria-label="YouTube" title="YouTube"><img src="/assets/youtube.svg" alt="" /></Link>
      <Link to="/fale-conosco" aria-label="WhatsApp" title="WhatsApp"><img src="/assets/whatsapp.svg" alt="" /></Link>
      <Link to="/plan-assiste" aria-label="LinkedIn" title="LinkedIn"><img src="/assets/linkedin.svg" alt="" /></Link>
      <button
        type="button"
        aria-label="Alternar alto contraste"
        aria-pressed={highContrast}
        title="Alternar alto contraste"
        onClick={() => setHighContrast(!highContrast)}
      >
        <img src="/assets/contraste.svg" alt="" />
      </button>
    </div>
  )
}

export function Header({
  loggedIn = false,
  onLogout,
}: {
  loggedIn?: boolean
  onLogout?: () => void
}) {
  const [profileOpen, setProfileOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const [notifications, setNotifications] = useState<BeneficiaryNotification[]>(() => getStoredNotifications())
  const [userProfile, setUserProfile] = useState(() => getStoredUserProfile())
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const profileMenuRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const session = getStoredSession()
  const activeProfile = session.activeProfile
  const canSeeBeneficiary = activeProfile === 'beneficiary'
  const profileAvatar = activeProfile === 'provider'
    ? (userProfile.providerAvatar || '/assets/provider-clinic-logo.svg')
    : (userProfile.avatar || mockUser.avatar)
  const canSwitchProfile = session.profiles.includes('beneficiary') && session.profiles.includes('team')
  const unreadNotifications = notifications.filter((notification) => !notification.read)
  const previewNotifications = sortNotifications(unreadNotifications).slice(0, 4)

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
    function syncUserProfile() {
      setUserProfile(getStoredUserProfile())
    }

    window.addEventListener('planAssisteUserProfileUpdated', syncUserProfile)
    window.addEventListener('storage', syncUserProfile)
    return () => {
      window.removeEventListener('planAssisteUserProfileUpdated', syncUserProfile)
      window.removeEventListener('storage', syncUserProfile)
    }
  }, [])

  useEffect(() => {
    if (!profileOpen) return

    function closeOnOutsideClick(event: PointerEvent) {
      if (!profileMenuRef.current?.contains(event.target as Node)) setProfileOpen(false)
    }

    function closeProfileMenu() {
      setProfileOpen(false)
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setProfileOpen(false)
    }

    document.addEventListener('pointerdown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    window.addEventListener('scroll', closeProfileMenu, { passive: true })
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
      window.removeEventListener('scroll', closeProfileMenu)
    }
  }, [profileOpen])

  function handleLogout() {
    setProfileOpen(false)
    onLogout?.()
  }

  function switchProfile(profile: PortalProfile) {
    setActiveProfile(profile)
    setProfileOpen(false)
    setNotificationsOpen(false)
    navigate(getProfileHome(profile))
  }

  function getProfileDescription(profile: PortalProfile | null) {
    if (profile === 'beneficiary') return 'Beneficiário titular'
    if (profile === 'provider') return 'Credenciado'
    if (profile === 'team') return 'Equipe Plan-Assiste'
    return session.roleLabel || mockUser.profile
  }

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Logo />
        <div className="header-actions">
          <SocialLinks />
          {loggedIn ? (
            <>
              {canSeeBeneficiary && (
                <div
                  className="notification-menu"
                  onMouseEnter={() => {
                    setProfileOpen(false)
                    setNotificationsOpen(true)
                  }}
                  onMouseLeave={() => setNotificationsOpen(false)}
                  onFocus={() => {
                    setProfileOpen(false)
                    setNotificationsOpen(true)
                  }}
                  onBlur={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget)) setNotificationsOpen(false)
                  }}
                >
                  <Link className="notification-button" to="/beneficiario/notificacoes" aria-label={`Notificações: ${unreadNotifications.length} não lidas`}>
                    <Bell />
                    {unreadNotifications.length > 0 && <span aria-hidden="true">{unreadNotifications.length}</span>}
                  </Link>
                  {notificationsOpen && (
                    <div className="notification-popover" role="dialog" aria-label="Prévia de notificações">
                      <strong>Notificações</strong>
                      {previewNotifications.length > 0 ? (
                        previewNotifications.map((notification) => (
                          <Link
                            key={notification.id}
                            to={`/beneficiario/notificacoes?notificacao=${notification.id}`}
                            onClick={() => setNotifications(markNotificationRead(notification.id))}
                          >
                            <span>{notification.pinned ? 'Fixada: ' : ''}{notification.title}</span>
                            <small>{notification.summary}</small>
                          </Link>
                        ))
                      ) : (
                        <p>Não há notificações não lidas.</p>
                      )}
                      <Link className="notification-popover-all" to="/beneficiario/notificacoes">Ver todas</Link>
                    </div>
                  )}
                </div>
              )}
              <div
                ref={profileMenuRef}
                className={`profile-menu ${profileOpen ? 'is-open' : ''}`}
                onMouseLeave={() => setProfileOpen(false)}
                onBlur={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget)) setProfileOpen(false)
                }}
              >
                <button
                  className="profile-button"
                  type="button"
                  aria-label="Abrir menu de perfil"
                  aria-expanded={profileOpen}
                  onClick={() => {
                    setNotificationsOpen(false)
                    setProfileOpen(!profileOpen)
                  }}
                >
                  <img src={profileAvatar} alt="" />
                  <ChevronDown />
                </button>
                {profileOpen && (
                  <div className="profile-popover">
                    <div className="profile-current">
                      <strong>{session.displayName || mockUser.shortName}</strong>
                      <span>{getProfileDescription(activeProfile)}</span>
                    </div>
                    <Link className="profile-home-link" to="/minha-area" onClick={() => setProfileOpen(false)}>
                      Meus dados <ArrowRight aria-hidden="true" />
                    </Link>
                    {activeProfile === 'provider' && (
                      <Link className="profile-home-link" to="/credenciado/pagina-do-credenciado" onClick={() => setProfileOpen(false)}>
                        Página do credenciado <ArrowRight aria-hidden="true" />
                      </Link>
                    )}
                    {canSwitchProfile && (
                      <div className="profile-switcher" aria-label="Trocar perfil">
                        <span>Trocar perfil de acesso</span>
                        <button type="button" className={`profile-option-beneficiary ${activeProfile === 'beneficiary' ? 'is-active' : ''}`} disabled={activeProfile === 'beneficiary'} onClick={() => switchProfile('beneficiary')}>
                          <strong>Beneficiário</strong>
                        </button>
                        <button type="button" className={`profile-option-team ${activeProfile === 'team' ? 'is-active' : ''}`} disabled={activeProfile === 'team'} onClick={() => switchProfile('team')}>
                          <strong>Área da equipe</strong>
                        </button>
                      </div>
                    )}
                    <button className="profile-logout" type="button" onClick={handleLogout}>Sair</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <button className="login-button" type="button" onClick={() => setLoginOpen(true)}>
              <LogIn aria-hidden="true" />
              Login
            </button>
          )}
        </div>
      </div>
      {loginOpen && <LoginDialog onClose={() => setLoginOpen(false)} />}
    </header>
  )
}

export function MainMenu({ loggedIn = false }: { loggedIn?: boolean }) {
  const [open, setOpen] = useState(false)
  const [searching, setSearching] = useState(false)
  const [hasScrolled, setHasScrolled] = useState(false)
  const [query, setQuery] = useState('')
  const [searchStatus, setSearchStatus] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const menuRef = useRef<HTMLElement>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const session = loggedIn ? getStoredSession() : null
  const menuLinks = getMenuLinks(session?.activeProfile ?? null)
  const activeMenuPath = menuLinks
    .filter((item) => item.to === '/'
      ? location.pathname === '/'
      : location.pathname === item.to || location.pathname.startsWith(`${item.to}/`))
    .sort((first, second) => second.to.length - first.to.length)[0]?.to

  useEffect(() => {
    if (searching) inputRef.current?.focus()
  }, [searching])

  useEffect(() => {
    const updateScrollState = () => setHasScrolled(window.scrollY > 80)
    updateScrollState()
    window.addEventListener('scroll', updateScrollState, { passive: true })
    return () => window.removeEventListener('scroll', updateScrollState)
  }, [])

  useEffect(() => {
    if (!searching) return

    function closeOnOutsideClick(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) closeSearch()
    }

    function closeOnScroll() {
      closeSearch()
    }

    document.addEventListener('pointerdown', closeOnOutsideClick)
    window.addEventListener('scroll', closeOnScroll, { passive: true })
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick)
      window.removeEventListener('scroll', closeOnScroll)
    }
  }, [searching])

  function submitSearch(event: FormEvent) {
    event.preventDefault()
    const normalizedQuery = query.trim()
    if (!normalizedQuery) {
      inputRef.current?.focus()
      setSearchStatus('Digite um termo para iniciar a busca.')
      return
    }
    setSearchStatus(`Buscando por "${normalizedQuery}".`)
    navigate(`/busca?q=${encodeURIComponent(normalizedQuery)}`)
    setOpen(false)
    setSearching(false)
  }

  function closeSearch() {
    setSearching(false)
    setSearchStatus('')
  }

  function closeMenu() {
    setOpen(false)
    setSearching(false)
    setSearchStatus('')
  }

  return (
    <nav ref={menuRef} className={`main-menu ${searching ? 'is-searching' : ''} ${hasScrolled ? 'has-scrolled' : ''}`} aria-label="Menu principal">
      <div className="container menu-inner">
        <button className="menu-toggle" type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Alternar menu principal">
          <Menu /> Menu
        </button>
        <div className={`menu-links ${open ? 'is-open' : ''}`}>
          <Link className={`menu-home-symbol ${activeMenuPath === '/' ? 'is-active' : ''}`} to="/" onClick={closeMenu} aria-label="Voltar para a página inicial">
            <img src="/assets/simbolo-menu-fixo.svg" alt="" />
          </Link>
          {menuLinks.map((item) => (
            <Link
              className={`${item.to === '/' ? 'menu-home-link' : ''} ${activeMenuPath === item.to ? 'is-active' : ''}`.trim() || undefined}
              to={item.to}
              onClick={closeMenu}
              key={item.to}
              aria-current={activeMenuPath === item.to ? 'page' : undefined}
            >
              {item.label}
            </Link>
          ))}
        </div>
        <form className="nav-search-form" onSubmit={submitSearch} aria-hidden={!searching}>
          <Search aria-hidden="true" />
          <label className="sr-only" htmlFor="portal-search">Pesquisar no portal</label>
          <input
            id="portal-search"
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => event.key === 'Escape' && closeSearch()}
            placeholder="O que você procura?"
            tabIndex={searching ? 0 : -1}
          />
          <button className="nav-search-submit" type="submit" tabIndex={searching ? 0 : -1}>Buscar</button>
          <button className="nav-search-close" type="button" onClick={closeSearch} aria-label="Fechar busca" tabIndex={searching ? 0 : -1}><X /></button>
          <span className="sr-only" role="status">{searchStatus}</span>
        </form>
        <button className="search-menu" type="button" aria-label="Abrir busca" onClick={() => setSearching(true)}><Search /></button>
      </div>
    </nav>
  )
}

function LoginDialog({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate()
  const [cnpj, setCnpj] = useState('')
  const [password, setPassword] = useState('')

  function loginGovBr() {
    const destination = localStorage.getItem('planAssisteDestination') || '/beneficiario'
    storeSession(createGovBrSession())
    localStorage.removeItem('planAssistePendingProviderFavorite')
    localStorage.removeItem('planAssisteDestination')
    onClose()
    navigate(destination)
  }

  function loginProvider(event: FormEvent) {
    event.preventDefault()
    if (!cnpj.trim() || !password.trim()) return
    const requestedDestination = localStorage.getItem('planAssisteDestination')
    const destination = requestedDestination?.startsWith('/credenciado') ? requestedDestination : '/credenciado'
    storeSession(createProviderSession())
    localStorage.removeItem('planAssistePendingProviderFavorite')
    localStorage.removeItem('planAssisteDestination')
    onClose()
    navigate(destination)
  }

  return (
    <div className="login-modal-backdrop" role="presentation">
      <section className="login-modal-card" role="dialog" aria-modal="true" aria-labelledby="login-modal-title">
        <button className="login-modal-close" type="button" onClick={onClose} aria-label="Fechar login"><X /></button>
        <Logo />
        <div className="login-intro">
          <h2 id="login-modal-title">Acesse o Plan-Assiste</h2>
          <p>Escolha o tipo de acesso para continuar no portal.</p>
        </div>
        <section className="login-access-card login-access-card-gov">
          <h3>Beneficiários e equipe</h3>
          <p>Use sua conta gov.br para acessar os serviços do portal.</p>
          <GovBrSignInButton className="gov-login-large" onClick={loginGovBr} />
        </section>
        <div className="login-divider" aria-hidden="true"><span>ou</span></div>
        <form className="provider-login-form" onSubmit={loginProvider}>
          <h3>Credenciados</h3>
          <p>Acesso exclusivo para credenciados já credenciados. Para obter acesso, conclua primeiro o processo de credenciamento.</p>
          <label>
            <span>CNPJ</span>
            <input value={cnpj} onChange={(event) => setCnpj(event.target.value)} placeholder="00.000.000/0000-00" required />
          </label>
          <label>
            <span>Senha</span>
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Digite sua senha" required />
          </label>
          <button type="submit">Entrar como credenciado</button>
          <div className="provider-login-links">
            <Link to="/fale-conosco" onClick={onClose}>Esqueci minha senha</Link>
            <Link to="/plan-assiste/como-se-credenciar-ou-renovar" onClick={onClose}>Como se credenciar e obter acesso</Link>
          </div>
        </form>
      </section>
    </div>
  )
}

function getMenuLinks(activeProfile: PortalProfile | null) {
  const links = [{ to: '/', label: 'Início' }]
  if (!activeProfile) links.push({ to: '/beneficiario', label: 'Beneficiário' })
  if (activeProfile === 'beneficiary') {
    links.push(
      { to: '/beneficiario', label: 'Beneficiário' },
      { to: '/beneficiario/servicos', label: 'Catálogo de serviços' },
    )
  }
  if (activeProfile === 'team') links.push({ to: '/area-da-equipe', label: 'Área da equipe' })
  if (activeProfile === 'provider') links.push({ to: '/credenciado', label: 'Credenciado' })
  links.push(
    { to: '/rede-credenciada', label: 'Rede credenciada' },
    { to: '/noticias', label: 'Notícias' },
    { to: '/plan-assiste', label: 'Plan-Assiste' },
    { to: '/transparencia', label: 'Transparência' },
    { to: '/fale-conosco', label: 'Fale conosco' },
  )
  return links
}

export function Footer() {
  return (
    <footer className="site-footer" id="plan-assiste">
        <div className="container footer-grid">
          <div className="footer-column footer-column-brand">
            <Logo inverse />
            <strong className="footer-tagline">
              <span>Proporcionando saúde e bem-estar</span>
              <span>no Ministério Público da União</span>
            </strong>
            <p className="protected"><ShieldCheck /> <b>Seus dados protegidos</b></p>
            <p>Saiba como o Plan-Assiste protege<br />suas informações pessoais.</p>
          </div>
          <div className="footer-column">
            <div className="footer-section">
              <h3><Link to="/">Portal Plan-Assiste</Link></h3>
              <nav aria-label="Portal Plan-Assiste">
                <ul className="footer-link-list">
                  <li><Link to="/beneficiario">Beneficiário</Link></li>
                  <li><Link to="/credenciado">Credenciado</Link></li>
                  <li><Link to="/area-da-equipe">Área da equipe</Link></li>
                  <li><Link to="/rede-credenciada">Rede credenciada</Link></li>
                  <li><Link to="/noticias">Notícias</Link></li>
                  <li><Link to="/plan-assiste">Plan-Assiste</Link></li>
                  <li><Link to="/transparencia">Transparência</Link></li>
                  <li><Link to="/fale-conosco">Fale conosco</Link></li>
                </ul>
              </nav>
            </div>
          </div>
          <div className="footer-column">
            <div className="footer-section">
              <h3>Endereços</h3>
              <ul className="footer-address-list">
                {getCmsAddresses().map((address) => <li key={address.id}>{address.label} {address.note && <span>{address.note}</span>}</li>)}
              </ul>
            </div>
          </div>
          <div className="footer-column footer-column-support">
            <div className="footer-section">
              <h3>Central de atendimento 24h</h3>
              {getCmsContactChannels().map((channel) => (
                <p className="footer-contact-item" key={channel.id}>
                  {channel.kind === 'email'
                    ? <><Mail aria-hidden="true" /> <a href={`mailto:${channel.value}`}>{channel.value}</a></>
                    : <><img src={`/assets/${channel.kind === 'phone' ? 'telefone' : 'whatsapp'}.svg`} alt="" /> {channel.value}</>}
                </p>
              ))}
            </div>
            <div className="footer-section">
              <h3>Nossas redes sociais</h3>
              <p>Acompanhe notícias, comunicados e conteúdos institucionais.</p>
              <span className="footer-social-icons" aria-label="Canais do portal">
                {getCmsSocialLinks().map((item) => (
                  <a key={item.id} href={item.url} target="_blank" rel="noreferrer noopener" aria-label={item.label} title={item.label}>
                    <img src={`/assets/${item.network}.svg`} alt="" />
                  </a>
                ))}
              </span>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="container footer-bottom-inner">
            <button className="footer-cookie-link" type="button" onClick={reopenCookiePreferences}><img src="/assets/cookies.svg" alt="" /> Redefinir cookies</button>
            <Link to="/lgpd">LGPD e Privacidade</Link>
            <Link to="/acessibilidade">Acessibilidade</Link>
            <Link to="/mapa-do-site">Mapa do site</Link>
            <span>© 2026 <a className="footer-manual-link" href="/manual-portal.html" rel="nofollow">Plan-Assiste</a> - Todos os direitos reservados.</span>
          </div>
        </div>
    </footer>
  )
}

export function ServiceGrid({
  services,
  className = '',
  onService,
}: {
  services: Service[]
  className?: string
  onService?: (service: Service) => void
}) {
  const navigate = useNavigate()
  return (
    <div className={`service-grid ${className}`}>
      {services.map((service) => {
        const Icon = iconMap[service.icon]
        return (
          <button
            className={`service-card ${service.requiresAuth ? 'has-auth-lock' : ''}`}
            key={service.title}
            type="button"
            title={service.externalUrl ? 'Abrir em uma nova aba' : undefined}
            aria-label={service.externalUrl ? `${service.title} — abrir em uma nova aba` : undefined}
            onClick={() => {
              if (onService) {
                onService(service)
                return
              }
              if (service.externalUrl) {
                window.open(service.externalUrl, '_blank', 'noopener,noreferrer')
                return
              }
              if (service.route) navigate(service.route)
            }}
          >
            <Icon aria-hidden="true" />
            <span>{service.title}</span>
            {service.requiresAuth && (
              <span className="service-auth-lock" aria-label="Login necessário" data-tooltip="Login necessário" title="Login necessário">
                <LockKeyhole aria-hidden="true" />
              </span>
            )}
            {service.externalUrl
              ? <ExternalLink className="service-arrow" aria-hidden="true" />
              : <ArrowRight className="service-arrow" aria-hidden="true" />}
          </button>
        )
      })}
    </div>
  )
}

export function Sidebar({ onLogout }: { onLogout: () => void }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState<BeneficiaryNotification[]>(() => getStoredNotifications())
  const unreadCount = notifications.filter((notification) => !notification.read).length
  type SidebarItem = readonly [slug: string, label: string, icon: IconName]
  const groups: ReadonlyArray<{ label: string; items: ReadonlyArray<SidebarItem> }> = [
    {
      label: 'Atendimento',
      items: [
        ['servicos', 'Catálogo de serviços', 'list'],
        ['solicitacoes', 'Minhas solicitações', 'file'],
        ['carteirinhas', 'Carteirinhas', 'card'],
        ['autorizacoes', 'Autorizações', 'heartPulse'],
        ['reembolsos', 'Reembolso e auxílios', 'refund'],
        ['despesas-e-extratos', 'Despesas e custeios', 'money'],
        ['dependentes', 'Dependentes (2)', 'users'],
      ],
    },
    {
      label: 'Minha conta',
      items: [
        ['meus-dados', 'Meus dados', 'database'],
        ['minhas-preferencias', 'Meus favoritos', 'star'],
        ['notificacoes', `Notificações${unreadCount > 0 ? ` (${unreadCount})` : ''}`, 'bell'],
      ],
    },
  ]
  const items = groups.flatMap((group) => group.items)
  const currentItem = items.find(([slug]) => location.pathname.includes(`/beneficiario/${slug}`))

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

  return (
    <aside className="sidebar">
      <div className="sidebar-mobile-select">
        <label htmlFor="beneficiary-mobile-section">Menu do beneficiário</label>
        <select
          id="beneficiary-mobile-section"
          value={currentItem?.[0] ?? 'inicio'}
          onChange={(event) => navigate(event.target.value === 'inicio' ? '/beneficiario' : `/beneficiario/${event.target.value}`)}
        >
          <option value="inicio">Visão geral</option>
          {groups.map((group) => (
            <optgroup key={group.label} label={group.label}>
              {group.items.map(([slug, label]) => (
                <option key={slug} value={slug}>{label}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>
      <div className="sidebar-content">
        <div className="sidebar-profile">
          <img src={mockUser.avatar} alt="" />
          <div>
            <span>Área do beneficiário</span>
            <strong>{nomeExibicao(mockUser)}</strong>
          </div>
        </div>
        <nav className="sidebar-nav" aria-label="Área do beneficiário">
          <NavLink to="/beneficiario" end className={({ isActive }) => isActive ? 'active' : ''}>
            <Home /><span>Visão geral</span>
          </NavLink>
          {groups.map((group) => (
            <div className="sidebar-nav-group" key={group.label}>
              <p>{group.label}</p>
              {group.items.map(([slug, label, icon]) => {
                const Icon = iconMap[icon]
                return (
                  <NavLink key={slug} to={`/beneficiario/${slug}`} className={({ isActive }) => isActive ? 'active' : ''}>
                    <Icon /><span>{label}</span>
                  </NavLink>
                )
              })}
            </div>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button type="button" onClick={onLogout}><LogOut /> Sair</button>
        </div>
      </div>
    </aside>
  )
}

export function Breadcrumb({ current, currentTo, extra }: { current: string, currentTo?: string, extra?: string }) {
  const isBeneficiaryRoot = current === 'Beneficiário' || current === 'Beneficiários'

  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      <Link to="/">Início</Link><ArrowRight />
      {isBeneficiaryRoot ? (
        <span>Beneficiário</span>
      ) : (
        <>
          <Link to="/beneficiario">Beneficiário</Link><ArrowRight />
          {extra && currentTo ? <Link to={currentTo}>{current}</Link> : <span>{current}</span>}
          {extra && (
            <>
              <ArrowRight /><span>{extra}</span>
            </>
          )}
        </>
      )}
    </nav>
  )
}

export type AreaSidebarItem = {
  label: string
  to: string
  icon: LucideIcon
  external?: boolean
  activePath?: string
}

export type AreaSidebarGroup = {
  label: string
  items: AreaSidebarItem[]
}

export function RestrictedAreaSidebar({
  area,
  homeLabel,
  homePath,
  groups,
  onLogout,
}: {
  area: 'provider' | 'team'
  homeLabel: string
  homePath: string
  groups: AreaSidebarGroup[]
  onLogout: () => void
}) {
  const location = useLocation()
  const navigate = useNavigate()
  const session = getStoredSession()
  const profile = getStoredUserProfile()
  const isProvider = area === 'provider'
  const areaLabel = isProvider ? 'Área do credenciado' : 'Área da equipe'
  const avatar = isProvider
    ? (profile.providerAvatar || '/assets/provider-clinic-logo.svg')
    : (profile.avatar || mockUser.avatar)
  const currentItem = groups.flatMap((group) => group.items)
    .filter((item) => {
      const activePath = item.activePath || item.to
      return !item.external && (location.pathname === item.to || location.pathname.startsWith(`${activePath}/`) || location.pathname === activePath)
    })
    .sort((first, second) => (second.activePath || second.to).length - (first.activePath || first.to).length)[0]
  const currentPath = location.pathname === homePath ? homePath : (currentItem?.to || homePath)

  function handleMobileNavigation(destination: string) {
    const item = groups.flatMap((group) => group.items).find((candidate) => candidate.to === destination)
    if (item?.external) {
      window.open(destination, '_blank', 'noopener,noreferrer')
      return
    }
    navigate(destination)
  }

  return (
    <aside className={`sidebar restricted-area-sidebar restricted-area-sidebar-${area}`}>
      <div className="sidebar-mobile-select">
        <label htmlFor={`${area}-mobile-section`}>Menu da {areaLabel.toLowerCase()}</label>
        <select id={`${area}-mobile-section`} value={currentPath} onChange={(event) => handleMobileNavigation(event.target.value)}>
          <option value={homePath}>{homeLabel}</option>
          {groups.map((group) => (
            <optgroup key={group.label} label={group.label}>
              {group.items.map((item) => (
                <option key={item.to} value={item.to}>{item.label}{item.external ? ' ↗' : ''}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>
      <div className="sidebar-content">
        <div className="sidebar-profile">
          <img src={avatar} alt="" />
          <div>
            <span>{areaLabel}</span>
            <strong>{session.displayName || nomeExibicao(mockUser)}</strong>
          </div>
        </div>
        <nav className="sidebar-nav" aria-label={areaLabel}>
          <NavLink to={homePath} end className={({ isActive }) => isActive ? 'active' : ''}>
            <Home /><span>{homeLabel}</span>
          </NavLink>
          {groups.map((group) => (
            <div className="sidebar-nav-group" key={group.label}>
              <p>{group.label}</p>
              {group.items.map((item) => {
                const Icon = item.icon
                return item.external ? (
                  <a href={item.to} target="_blank" rel="noreferrer" key={item.to} title="Abrir em uma nova aba">
                    <Icon /><span>{item.label}</span>
                    <span className="sidebar-external-icon" aria-label="Abrir em uma nova aba" title="Abrir em uma nova aba"><ExternalLink aria-hidden="true" /></span>
                  </a>
                ) : (
                  <NavLink key={item.to} to={item.to} className={currentItem?.to === item.to ? 'active' : ''}>
                    <Icon /><span>{item.label}</span>
                  </NavLink>
                )
              })}
            </div>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button type="button" onClick={onLogout}><LogOut /> Sair</button>
        </div>
      </div>
    </aside>
  )
}

export function EmptyState({ title }: { title: string }) {
  return (
    <div className="empty-state">
      <Stethoscope />
      <h2>{title}</h2>
      <p>Esta área faz parte do protótipo navegável e será detalhada na próxima etapa.</p>
      <Link className="text-link back-link" to="/beneficiario"><ArrowLeft aria-hidden="true" /> Voltar para Beneficiário</Link>
    </div>
  )
}

export type SupportIconType = 'chat' | 'faq' | 'phone' | 'manifestation' | 'quality'

export function SupportIcon({ type }: { type: SupportIconType }) {
  if (type === 'chat') {
    return <img className="support-card-image-icon" src="/assets/assistente-virtual.svg" alt="" />
  }

  const icons = { chat: MessageCircle, faq: HelpCircle, phone: Phone, manifestation: Ear, quality: Megaphone }
  const Icon = icons[type]
  return <Icon aria-hidden="true" />
}

export function ScrollEnhancements() {
  const location = useLocation()

  useEffect(() => {
    const applyAccessibleTooltips = (root: ParentNode) => {
      root.querySelectorAll<HTMLElement>('button[aria-label], a[aria-label]').forEach((control) => {
        const label = control.getAttribute('aria-label')?.trim()
        if (label && !control.title) control.title = label
      })
    }

    applyAccessibleTooltips(document)

    const tooltipObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return

          if (node.matches('button[aria-label], a[aria-label]')) {
            const label = node.getAttribute('aria-label')?.trim()
            if (label && !node.title) node.title = label
          }
          applyAccessibleTooltips(node)
        })
      })
    })

    tooltipObserver.observe(document.body, { childList: true, subtree: true })
    return () => tooltipObserver.disconnect()
  }, [])

  useEffect(() => {
    document.querySelectorAll<HTMLAnchorElement>('a[target="_blank"]').forEach((link) => {
      if (!link.title) link.title = 'Abrir em uma nova aba'
      if (!link.getAttribute('aria-label')) {
        const label = link.textContent?.trim() || 'Link externo'
        link.setAttribute('aria-label', `${label} — abrir em uma nova aba`)
      }
    })

    const scrollTarget = location.hash && document.getElementById(location.hash.slice(1))
    const timer = window.setTimeout(() => {
      if (scrollTarget) {
        scrollTarget.scrollIntoView({ behavior: 'smooth', block: 'start' })
      } else {
        window.scrollTo({ top: 0 })
      }
    }, 0)

    if (!('IntersectionObserver' in window)) return () => window.clearTimeout(timer)

    document.documentElement.classList.add('reveal-ready')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.08 },
    )
    const frame = window.requestAnimationFrame(() => {
      document.querySelectorAll('[data-reveal]').forEach((element) => observer.observe(element))
    })

    return () => {
      window.clearTimeout(timer)
      window.cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [location.pathname, location.hash])

  return null
}

export function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const updateVisibility = () => setVisible(window.scrollY > 420)
    updateVisibility()
    window.addEventListener('scroll', updateVisibility, { passive: true })
    return () => window.removeEventListener('scroll', updateVisibility)
  }, [])

  return (
    <button
      className={`back-to-top-button ${visible ? 'is-visible' : ''}`}
      type="button"
      aria-label="Voltar ao topo"
      title="Voltar ao topo"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    >
      <ArrowUp aria-hidden="true" />
      <span>Topo</span>
    </button>
  )
}

// ============================================================
// Combobox (digitação + lista suspensa com scroll)
// ============================================================

export interface ComboboxProps {
  options: string[]
  value: string
  onChange: (v: string) => void
  placeholder?: string
}

export function Combobox({ options, value, onChange, placeholder }: ComboboxProps) {
  const [open, setOpen] = useState(false)
  const [inputVal, setInputVal] = useState(value)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (inputVal !== value) setInputVal(value)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [])

  const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  const filtered = options.filter((o) => norm(o).includes(norm(inputVal)))

  return (
    <div className="go-combobox" ref={containerRef}>
      <div className="go-combobox-wrap">
        <input
          type="text"
          className="go-input"
          value={inputVal}
          placeholder={placeholder}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setInputVal(e.target.value)
            onChange(e.target.value)
            setOpen(true)
          }}
        />
        <button
          type="button"
          className={`go-combobox-toggle${open ? ' open' : ''}`}
          tabIndex={-1}
          onClick={() => setOpen((v) => !v)}
        >
          <ChevronDown />
        </button>
      </div>
      {open && (
        <ul className="go-combobox-list">
          {filtered.length > 0 ? (
            filtered.map((o) => (
              <li key={o}>
                <button
                  type="button"
                  className={`go-combobox-item${o === value ? ' selected' : ''}`}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    setInputVal(o)
                    onChange(o)
                    setOpen(false)
                  }}
                >
                  {o}
                </button>
              </li>
            ))
          ) : (
            <li className="go-combobox-empty">Nenhum resultado encontrado.</li>
          )}
        </ul>
      )}
    </div>
  )
}
