import { type FormEvent, useEffect, useRef, useState } from 'react'
import {
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Heart,
  HeartHandshake,
  IdCard,
  Mail,
  Pause,
  Play,
  ShieldCheck,
  Stethoscope,
  UserRound,
  UsersRound,
  X,
} from 'lucide-react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  Footer,
  Header,
  MainMenu,
  ProviderSearch,
  ServiceGrid,
  SupportIcon,
  type SupportIconType,
} from '../components/PortalComponents'
import { CaptchaField } from '../components/CaptchaField'
import { news, providerServices, type Service } from '../data/mock'
import { supportChannels, type SupportChannelIcon } from '../data/supportChannels'
import {
  getFavoriteState,
  toggleFavoriteNews,
  type FavoriteState,
} from '../utils/favorites'
import { getStoredSession, hasProfile, setActiveProfile, type PortalProfile } from '../utils/session'
import { generateCaptchaCode } from '../utils/captcha'
import { getCmsSlideshow } from '../cms/siteContentRepository'
import { AtalhoDeEdicao } from '../components/AtalhoDeEdicao'

const heroSlides = [
  {
    eyebrow: 'Portal do Plan-Assiste',
    title: 'Cuidar da sua saúde ficou mais simples',
    description:
      'Encontre credenciados, acesse serviços, acompanhe reembolsos e consulte informações importantes em um só lugar.',
    action: 'Conheça os serviços',
    href: '#servicos',
    image: '/assets/hero-cuidar-saude.png',
    alt: 'Médica atendendo uma paciente',
  },
  {
    eyebrow: 'Rede credenciada',
    title: 'Encontre um credenciado perto de você',
    description:
      'Busque profissionais, clínicas, hospitais e serviços por especialidade, cidade, tipo de rede ou forma de atendimento.',
    action: 'Buscar credenciados',
    href: '/rede-credenciada',
    image: '/assets/hero-prestador.png',
    alt: 'Beneficiária usando tablet para buscar credenciados de saúde',
  },
  {
    eyebrow: 'Adesão ao Plan-Assiste',
    title: 'Torne-se beneficiário com orientação clara',
    description:
      'Veja quem pode aderir, conheça os próximos passos e encontre os canais certos para iniciar sua vinculação ao Plan-Assiste.',
    action: 'Ver orientações',
    href: '/plan-assiste/beneficiarios/torne-se-beneficiario',
    image: '/assets/hero-beneficiario.png',
    alt: 'Família recebendo orientação para adesão ao Plan-Assiste',
  },
]

function newsDateValue(date: string) {
  const [day, month, year] = date.split('/').map(Number)
  return new Date(year, month - 1, day).getTime()
}

export function HomePage({
  loggedIn,
  onLogout,
}: {
  loggedIn: boolean
  onLogout: () => void
}) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const showBeneficiaryArea = true
  const showTeamArea = true
  const showProviderArea = true
  const [showDuplicateCardDialog, setShowDuplicateCardDialog] = useState(
    () => searchParams.get('servico') === 'segunda-via-carteirinha',
  )
  const [favoriteState, setFavoriteState] = useState<FavoriteState>(() => getFavoriteState())
  const recentNews = [...news]
    .sort((first, second) => newsDateValue(second.date) - newsDateValue(first.date))
    .slice(0, 4)

  const homeBeneficiaryServices: Service[] = [
    { title: '2ª via da carteirinha', icon: 'card' },
    { title: 'Solicitar reembolso', icon: 'refund', route: '/beneficiario/reembolsos', requiresAuth: true },
    { title: 'Autorização de exames', icon: 'file', route: '/beneficiario/servicos', requiresAuth: true },
    { title: 'Atualizar cadastro', icon: 'userRound', route: '/beneficiario/meus-dados', requiresAuth: true },
    { title: 'Consultar IRPF e extratos', icon: 'money', route: '/beneficiario/despesas-e-extratos', requiresAuth: true },
    { title: 'Comprovante IRPF', icon: 'file', route: '/beneficiario/comprovante-irpf', requiresAuth: true },
    { title: 'Orientações sobre EPS', icon: 'heartPulse', route: '/plan-assiste/beneficiarios/orientacoes-sobre-eps' },
    { title: 'Rede credenciada', icon: 'network', route: '/rede-credenciada' },
  ]

  function protectedService(service: Service) {
    if (service.title === '2ª via da carteirinha') {
      setShowDuplicateCardDialog(true)
      return
    }
    if (service.externalUrl) {
      window.open(service.externalUrl, '_blank', 'noopener,noreferrer')
      return
    }
    if (!service.route) return
    if ((loggedIn && hasProfile(getStoredSession(), 'beneficiary')) || !service.route.startsWith('/beneficiario')) {
      navigate(service.route)
      return
    }
    localStorage.setItem('planAssisteDestination', service.route)
    navigate('/login-govbr')
  }

  return (
    <>
      <Header loggedIn={loggedIn} onLogout={onLogout} />
      <MainMenu loggedIn={loggedIn} />
      <HeroCarousel />
      <main className="container home-main">
        <section className="audience-access-layout" id="equipe" aria-label="Áreas do portal" data-reveal>
          <div className="audience-access-grid" aria-label="Perfis de acesso">
            {showBeneficiaryArea && (
              <AudienceCard
                icon={UserRound}
                title="Beneficiário"
                text="Acesse carteirinhas, solicitações, reembolsos e auxílios, rede credenciada e seus dados."
                accent="green"
                destination="/beneficiario"
                profile="beneficiary"
                loggedIn={loggedIn}
                protectedArea
              />
            )}
            {showProviderArea && (
              <AudienceCard
                icon={Stethoscope}
                title="Credenciado"
                text="Consulte credenciamento, autorizações, faturas e serviços do Portal TISS."
                accent="dark"
                destination="/credenciado"
                profile="provider"
                loggedIn={loggedIn}
                protectedArea
              />
            )}
            {showTeamArea && (
              <AudienceCard
                icon={UsersRound}
                title="Área da equipe"
                text="Ambiente de trabalho para a equipe autorizada do Plan-Assiste."
                accent="blue"
                destination="/area-da-equipe"
                profile="team"
                loggedIn={loggedIn}
                protectedArea
              />
            )}
          </div>
          <BecomeBeneficiaryCard />
        </section>

        <Section title="Serviços para beneficiários" link="Ver todos os serviços →" linkHref="/beneficiario/servicos" id="servicos">
          <ServiceGrid services={homeBeneficiaryServices} onService={protectedService} />
        </Section>

        <ProviderSearch variant="home" />

        <Section title="Serviços para credenciados" link="Ver todos →" linkHref="/credenciado" id="credenciado">
          <ServiceGrid services={providerServices} className="service-grid-four" />
        </Section>

        <Section title="Notícias recentes" link="Ver mais →" linkHref="/noticias" id="noticias">
          <div className="news-grid home-grid-4">
            {recentNews.map((item) => (
              <NewsCard
                key={item.title}
                {...item}
                favorite={loggedIn && favoriteState.favoriteNewsIds.includes(item.id)}
                onFavorite={loggedIn ? () => setFavoriteState(toggleFavoriteNews(item.id)) : undefined}
              />
            ))}
          </div>
        </Section>

        <Section
          title="Fale conosco"
          subtitle="Tire dúvidas, fale com a equipe do Plan-Assiste ou encontre nossos canais oficiais."
          link="Ver canais →"
          linkHref="/fale-conosco"
          id="suporte"
        >
          <div className="support-grid home-grid-4">
            {supportChannels.map((channel) => <SupportCard {...channel} key={channel.title} />)}
          </div>
        </Section>
      </main>
      {showDuplicateCardDialog && <DuplicateCardDialog onClose={() => setShowDuplicateCardDialog(false)} />}
      <Footer />
    </>
  )
}

function DuplicateCardDialog({ onClose }: { onClose: () => void }) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const [cpf, setCpf] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [captchaCode, setCaptchaCode] = useState(() => generateCaptchaCode())
  const [captchaValue, setCaptchaValue] = useState('')
  const [notice, setNotice] = useState('')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    closeButtonRef.current?.focus()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose])

  function refreshCaptcha() {
    setCaptchaCode(generateCaptchaCode())
    setCaptchaValue('')
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const cpfDigits = cpf.replace(/\D/g, '')

    if (cpfDigits.length !== 11 || !birthDate) {
      setNotice('Informe um CPF com 11 dígitos e a data de nascimento.')
      return
    }
    if (captchaValue.trim().toUpperCase() !== captchaCode) {
      setNotice('Código de verificação incorreto. Confira o código e tente novamente.')
      refreshCaptcha()
      return
    }

    setNotice('')
    setSubmitted(true)
  }

  return (
    <div
      className="duplicate-card-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        className="duplicate-card-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="duplicate-card-title"
        aria-describedby="duplicate-card-description"
      >
        <button ref={closeButtonRef} className="duplicate-card-close" type="button" onClick={onClose} aria-label="Fechar solicitação de segunda via">
          <X aria-hidden="true" />
        </button>

        {submitted ? (
          <div className="duplicate-card-success" role="status">
            <span><ShieldCheck aria-hidden="true" /></span>
                <p className="eyebrow">Envio solicitado</p>
                <h2 id="duplicate-card-title">Carteirinha encaminhada por e-mail</h2>
                <p id="duplicate-card-description">
                  Se os dados informados corresponderem a um beneficiário ativo, a carteirinha foi encaminhada ao e-mail cadastrado. A entrega pode levar alguns minutos.
                </p>
                <p className="duplicate-card-security-note">Por segurança, não confirmamos nesta tela a existência do CPF nem exibimos o endereço de e-mail.</p>
                <button className="primary-button" type="button" onClick={onClose}>Concluir</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="duplicate-card-heading">
              <span><IdCard aria-hidden="true" /></span>
              <div>
                <p className="eyebrow">Serviço público</p>
                <h2 id="duplicate-card-title">2ª via da carteirinha</h2>
                <p id="duplicate-card-description">Solicite o envio da carteirinha digital sem precisar acessar a conta gov.br.</p>
              </div>
            </div>

            <div className="duplicate-card-fields">
              <label>
                <span>CPF do beneficiário *</span>
                <input
                  value={cpf}
                  onChange={(event) => setCpf(event.target.value)}
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={14}
                  placeholder="000.000.000-00"
                  required
                />
              </label>
              <label>
                <span>Data de nascimento *</span>
                <input type="date" lang="pt-BR" value={birthDate} onChange={(event) => setBirthDate(event.target.value)} required />
              </label>
            </div>

            <div className="duplicate-card-email-notice-wrap">
              <aside className="duplicate-card-email-notice">
                <Mail aria-hidden="true" />
                <div><h3>Envio para o e-mail cadastrado</h3><p>A carteirinha digital será encaminhada exclusivamente ao endereço de e-mail registrado no cadastro. Por segurança, esse endereço não será exibido nem poderá ser alterado nesta solicitação.</p></div>
              </aside>
            </div>

            <div className="duplicate-card-captcha">
              <h3>Verificação de segurança</h3>
              <CaptchaField code={captchaCode} onChangeValue={setCaptchaValue} onRefresh={refreshCaptcha} value={captchaValue} />
            </div>

            <p className="duplicate-card-security-note"><ShieldCheck aria-hidden="true" /> Os dados serão usados somente para localizar o cadastro e realizar este envio.</p>
            {notice && <p className="form-alert alert-danger" role="alert">{notice}</p>}
            <div className="duplicate-card-actions">
              <button className="primary-button" type="submit">Solicitar envio</button>
              <button className="secondary-button" type="button" onClick={onClose}>Cancelar</button>
            </div>
          </form>
        )}
      </section>
    </div>
  )
}

function HeroCarousel() {
  const managedSlides = getCmsSlideshow('home')
  const slides = managedSlides.length ? managedSlides.map((item) => ({ eyebrow: item.eyebrow, title: item.title, description: item.description, action: item.actionLabel, href: item.destination, image: item.imageUrl, alt: item.alt })) : heroSlides
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const slide = slides[active] || slides[0]

  useEffect(() => {
    if (paused) return
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % slides.length)
    }, 6500)

    return () => window.clearInterval(timer)
  }, [paused, slides.length])

  function previousSlide() {
    setActive((current) => (current - 1 + slides.length) % slides.length)
  }

  function nextSlide() {
    setActive((current) => (current + 1) % slides.length)
  }

  return (
    <section
      className="hero-section"
      aria-roledescription="carrossel"
      aria-label="Campanhas do Portal do Plan-Assiste"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <AtalhoDeEdicao para="/banners" titulo="Editar os banners desta vitrine" />
      <div className="hero-track">
        {slides.map((item, index) => (
          <article
            className={`hero-slide ${index === active ? 'is-active' : ''}`}
            aria-hidden={index !== active}
            key={item.title}
          >
            <img src={item.image} alt="" />
          </article>
        ))}
      </div>

      <div className="container hero-content" aria-live="polite">
        <div className="hero-copy" key={slide.title}>
          <span>{slide.eyebrow}</span>
          <h1>{slide.title}</h1>
          <p>{slide.description}</p>
          {slide.href.startsWith('/') ? (
            <Link className="primary-button hero-button" to={slide.href}>{slide.action}</Link>
          ) : (
            <a className="primary-button hero-button" href={slide.href}>{slide.action}</a>
          )}
        </div>
      </div>

      <div className="container hero-controls">
        <button type="button" onClick={previousSlide} aria-label="Campanha anterior">
          <ChevronLeft />
        </button>
        <div className="hero-dots" role="tablist" aria-label="Selecionar campanha">
          {slides.map((item, index) => (
            <button
              type="button"
              role="tab"
              aria-selected={index === active}
              aria-label={`Mostrar campanha: ${item.title}`}
              className={index === active ? 'is-active' : ''}
              key={item.title}
              onClick={() => setActive(index)}
            />
          ))}
        </div>
        <button type="button" onClick={nextSlide} aria-label="Próxima campanha">
          <ChevronRight />
        </button>
        <button
          type="button"
          className="hero-pause"
          onClick={() => setPaused(!paused)}
          aria-label={paused ? 'Retomar carrossel' : 'Pausar carrossel'}
          aria-pressed={paused}
        >
          {paused ? <Play /> : <Pause />}
        </button>
      </div>
      <span className="sr-only" aria-live="polite">
        Campanha {active + 1} de {slides.length}: {slide.title}
      </span>
    </section>
  )
}

function Section({
  title,
  subtitle,
  link,
  linkHref = '/',
  id,
  children,
}: {
  title: string
  subtitle?: string
  link?: string
  linkHref?: string
  id?: string
  children: React.ReactNode
}) {
  return (
    <section className="home-section" id={id} data-reveal>
      <div className="section-heading">
        <div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>
        {link && <Link to={linkHref}>{link}</Link>}
      </div>
      {children}
    </section>
  )
}

function AudienceCard({
  icon: Icon,
  title,
  text,
  accent,
  action = 'Acessar',
  destination,
  profile,
  protectedArea = false,
  loggedIn,
}: {
  icon: typeof UserRound
  title: string
  text: string
  accent: string
  action?: string
  destination?: string
  profile?: PortalProfile
  protectedArea?: boolean
  loggedIn: boolean
}) {
  const navigate = useNavigate()

  function openDestination() {
    if (!destination) return
    const currentSession = getStoredSession()
    const hasRequestedProfile = profile ? hasProfile(currentSession, profile) : false
    if (profile && hasRequestedProfile) {
      setActiveProfile(profile)
    }
    if (protectedArea && (!loggedIn || (profile && !hasRequestedProfile))) {
      localStorage.setItem('planAssisteDestination', destination)
      navigate('/login-govbr')
      return
    }
    navigate(destination)
  }

  return (
    <button type="button" className={`audience-card ${accent}`} onClick={openDestination}>
      <span className="audience-icon"><Icon /></span>
      <h2>{title}</h2>
      <p>{text}</p>
      <span className="audience-action">{action} <ArrowRight /></span>
    </button>
  )
}

function BecomeBeneficiaryCard() {
  return (
    <Link className="become-beneficiary-card" to="/plan-assiste/beneficiarios/torne-se-beneficiario">
      <span className="become-beneficiary-top">
        <span className="become-beneficiary-icon"><HeartHandshake aria-hidden="true" /></span>
      </span>
      <h2>Torne-se beneficiário</h2>
      <p>Veja orientações para iniciar sua adesão e acompanhar os próximos passos.</p>
      <span className="become-beneficiary-action">Ver orientações <ArrowRight aria-hidden="true" /></span>
    </Link>
  )
}

export function NewsCard({
  id,
  category,
  title,
  date,
  image,
  favorite = false,
  onFavorite,
}: {
  id?: string
  category: string
  title: string
  date: string
  image: string
  favorite?: boolean
  onFavorite?: () => void
}) {
  const detailPath = id ? `/noticias/${id}` : '/noticias'
  const displayCategory = category
    .toLocaleLowerCase('pt-BR')
    .replace(/(^|\s|-)(\p{L})/gu, (match) => match.toLocaleUpperCase('pt-BR'))

  return (
    <article className="news-card">
      <Link className="news-card-image-link" to={detailPath} aria-label={`Ler notícia: ${title}`}>
        <img src={image} alt="" />
      </Link>
      <div>
        <div className="news-card-top">
          <span>{displayCategory}</span>
          {onFavorite && (
            <div className="news-actions" aria-label={`Ações para ${title}`}>
              <button type="button" className={`provider-circle-action ${favorite ? 'is-favorite' : ''}`} onClick={onFavorite} aria-label={favorite ? 'Remover notícia dos favoritos' : 'Adicionar notícia aos favoritos'}><Heart aria-hidden="true" /></button>
            </div>
          )}
        </div>
        <h3><Link to={detailPath}>{title}</Link></h3>
        <time className="news-date-label"><CalendarDays aria-hidden="true" /> {date}</time>
        {id && <span className="sr-only">Identificador da notícia: {id}</span>}
      </div>
    </article>
  )
}

function SupportCard({ type, title, text, detail, route }: { type: SupportChannelIcon, title: string, text: string, detail: string, route?: string }) {
  const destination = route || '/fale-conosco'
  return (
    <Link className="support-card" to={destination}>
      <SupportIcon type={type as SupportIconType} />
      <h3>{title}</h3>
      <p>{text}</p>
      <small>{detail}</small>
    </Link>
  )
}
