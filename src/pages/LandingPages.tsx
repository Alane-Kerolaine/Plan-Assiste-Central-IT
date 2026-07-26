import { ArrowRight, CheckCircle2, FileText, ShieldCheck, UserPlus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { EmptyState, Footer, Header, MainMenu } from '../components/PortalComponents'
import { BecomeBeneficiaryContent, PlanAssisteSidebar } from './PublicPages'

export function LoggedLandingPage({
  title,
  subtitle,
  onLogout,
  themeClass = '',
}: {
  title: string
  subtitle: string
  onLogout: () => void
  themeClass?: string
}) {
  return (
    <div className={themeClass}>
      <Header loggedIn onLogout={onLogout} />
      <MainMenu loggedIn />
      <main className="container logged-landing">
        <nav className="breadcrumb public-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Início</Link><ArrowRight aria-hidden="true" />
          <span>{title}</span>
        </nav>
        <h1>{title}</h1>
        <p className="page-subtitle">{subtitle}</p>
        <EmptyState title={`${title} em construção`} />
      </main>
      <Footer />
    </div>
  )
}

export function BecomeBeneficiaryPage({ loggedIn, onLogout }: { loggedIn: boolean, onLogout: () => void }) {
  return (
    <>
      <Header loggedIn={loggedIn} onLogout={onLogout} />
      <MainMenu loggedIn={loggedIn} />
      <main className="container public-page become-page">
        <nav className="breadcrumb public-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Início</Link><ArrowRight aria-hidden="true" />
          <Link to="/plan-assiste">Plan-Assiste</Link><ArrowRight aria-hidden="true" />
          <Link to="/plan-assiste/beneficiarios">Beneficiários</Link><ArrowRight aria-hidden="true" />
          <span>Torne-se beneficiário</span>
        </nav>

        <div className="public-content-layout plan-content-layout">
          <PlanAssisteSidebar currentSlug="beneficiarios/torne-se-beneficiario" />
          <div className="public-content-main">
            <section className="public-hero public-hero-institutional plan-section-hero become-plan-hero">
              <UserPlus aria-hidden="true" />
              <div>
                <p className="eyebrow">Beneficiários</p>
                <h1>Torne-se beneficiário</h1>
                <p>
                  Entenda quem pode aderir ao Plan-Assiste, quais cuidados tomar antes de iniciar a solicitação e como acompanhar o pedido pelos canais oficiais.
                </p>
              </div>
            </section>

            <section className="become-intro">
              <p>
                A adesão ao Plan-Assiste deve ser feita com atenção às regras de elegibilidade, à documentação exigida e às condições previstas nas normas do Programa. Antes de iniciar o pedido, confira se o vínculo do titular, do dependente ou do beneficiário especial está contemplado e mantenha seus dados de contato atualizados.
              </p>
              <p>
                O processo é mais simples quando a documentação está organizada desde o início. Em caso de dúvida, utilize os canais oficiais de atendimento para confirmar requisitos específicos e evitar retrabalho.
              </p>
            </section>

            <section className="become-steps internal-grid-3" aria-label="Etapas de adesão">
              <article><CheckCircle2 /><h2>Confira se pode aderir</h2><p>Veja os critérios de vínculo e elegibilidade antes de iniciar a solicitação.</p></article>
              <article><FileText /><h2>Separe os documentos</h2><p>Organize dados pessoais, vínculo funcional e documentos de dependentes, quando houver.</p></article>
              <article><ShieldCheck /><h2>Acompanhe com segurança</h2><p>Use apenas os canais oficiais do Plan-Assiste para tirar dúvidas e acompanhar etapas.</p></article>
            </section>

            <BecomeBeneficiaryContent />
            <div className="become-actions">
              <Link className="primary-button" to="/login-govbr">Iniciar orientação</Link>
              <Link className="text-link" to="/fale-conosco">Falar com suporte <ArrowRight /></Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
