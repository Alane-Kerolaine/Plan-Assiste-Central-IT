import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { lazy, Suspense, useEffect, useState } from 'react'
import { BackToTop, ScrollEnhancements } from './components/PortalComponents'
import { VLibrasWidget } from './components/VLibrasWidget'
import { AiChatWidget } from './components/AiChatWidget'
import { CookieConsent } from './components/CookieConsent'
import { HomePage } from './pages/HomePage'
import { CmsPaginaCriadaPage } from './pages/CmsPaginaCriadaPage'
import { LoginPage } from './pages/LoginPage'
import { BecomeBeneficiaryPage } from './pages/LandingPages'
import {
  AppGuidePage,
  ManifestationPage,
  NewsDetailPage,
  NewsPage,
  PlanAssisteArticlePage,
  PlanAssisteIndexPage,
  ProviderAuthorizationsPage,
  ProviderBillingDetailPage,
  ProviderBillingPage,
  ProviderDashboardPage,
  ProviderPublicProfilePage,
  SearchPage,
  StaticInfoPage,
  TeamDashboardPage,
  TeamInformationPage,
  TeamInformationDetailPage,
  SupportPage,
  SupportFaqPage,
} from './pages/PublicPages'
import {
  AccountAreaPage,
  BeneficiaryLayout,
  BeneficiaryNovaReembolsoPage,
  BeneficiaryNovaBeneficioMedicamentosPage,
  BeneficiaryAuthorizationsPage,
  CardsPage,
  DependentsPage,
  ExpensesPage,
  FaqPage,
  HealthAidExtractPage,
  IrpfPage,
  MinhasSolicitacoesPage,
  MyDataPage,
  NotificationsPage,
  NovaSolicitacaoPage,
  OverviewPage,
  PreferencesPage,
  PlaceholderPage,
  ReimbursementsPage,
  RequestsPage,
  SolicitacaoDetalhePage,
} from './pages/BeneficiaryPages'
import { ServiceRequestPage } from './pages/ServiceRequestPage'
import {
  AdminBaseConhecimentoPage,
  AdminBannersPage,
  AdminCategoriasNoticiasPage,
  AdminNoticiasPage,
  GestaoOperacionalLayout,
  NovaAutorizacaoPage,
  NovaInscricaoDependentePage,
  NovaNoticiaPage,
  NovoBannerPage,
  NovoArtigoPage,
} from './pages/GestaoOperacionalPages'
import {
  BeneficiaryProviderDetailsPage,
  BeneficiaryProviderNetworkPage,
  PublicProviderDetailsPage,
  PublicProviderNetworkPage,
} from './pages/ProviderNetworkPages'
import { placeholderPages } from './data/mock'
import { MockupPage } from './pages/MockupPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { CmsAdminOverviewPage, CmsBannersPage, CmsContactPage, CmsFilesPage, CmsMediaPage, CmsNewsPage, CmsPageEditorPage, CmsPagesPage } from './pages/CmsAdminPages'
import { CmsLiveBrowserPage } from './pages/CmsLiveBrowser'
import { InstrucoesCondicionaisPreviewPage } from './pages/InstrucoesCondicionaisPreviewPage'
import { isFeatureInstrucoesCondicionaisEnabled } from './utils/featureFlags'
import {
  clearSession,
  createGovBrSession,
  createProviderSession,
  getProfileHome,
  getStoredSession,
  hasProfile,
  storeSession,
  type PortalProfile,
  type PortalSession,
} from './utils/session'

const TransparenciaPage = lazy(() =>
  import('./pages/TransparenciaPage').then((module) => ({ default: module.TransparenciaPage })),
)
const AccountingStatementsPage = lazy(() => import('./pages/TransparenciaPage').then((module) => ({ default: module.AccountingStatementsPage })))
const ActuarialEvaluationsPage = lazy(() => import('./pages/TransparenciaPage').then((module) => ({ default: module.ActuarialEvaluationsPage })))
const AccreditationTermsPage = lazy(() => import('./pages/TransparenciaPage').then((module) => ({ default: module.AccreditationTermsPage })))
const ManagementReportsPage = lazy(() => import('./pages/TransparenciaPage').then((module) => ({ default: module.ManagementReportsPage })))
const BudgetExecutionPage = lazy(() => import('./pages/TransparenciaPage').then((module) => ({ default: module.BudgetExecutionPage })))
const BudgetFinancialReportsPage = lazy(() => import('./pages/TransparenciaPage').then((module) => ({ default: module.BudgetFinancialReportsPage })))

function LegacyCredenciadoRedirect() {
  const location = useLocation()
  const pathname = location.pathname
    .replace(/^\/prestador(?=\/|$)/, '/credenciado')
    .replace('/rede-credenciada/prestador/', '/rede-credenciada/credenciado/')
  return <Navigate to={`${pathname}${location.search}${location.hash}`} replace />
}

function RequireAuth({
  session,
  profile,
  children,
}: {
  session: PortalSession
  profile?: PortalProfile
  children: React.ReactNode
}) {
  const location = useLocation()

  if (!session.authenticated) {
    localStorage.setItem('planAssisteDestination', `${location.pathname}${location.search}`)
    return <Navigate to="/login-govbr" replace />
  }

  if (profile && !hasProfile(session, profile)) {
    return <Navigate to="/" replace />
  }

  if (profile && session.activeProfile !== profile) {
    return <Navigate to={getProfileHome(session.activeProfile)} replace />
  }

  return children
}

function App() {
  const [session, setSession] = useState<PortalSession>(() => getStoredSession())
  const loggedIn = session.authenticated

  useEffect(() => {
    function syncSession() {
      setSession(getStoredSession())
    }

    window.addEventListener('planAssisteSessionUpdated', syncSession)
    window.addEventListener('storage', syncSession)
    return () => {
      window.removeEventListener('planAssisteSessionUpdated', syncSession)
      window.removeEventListener('storage', syncSession)
    }
  }, [])

  useEffect(() => {
    const profile = session.authenticated && session.activeProfile ? session.activeProfile : 'public'
    document.body.dataset.portalProfile = profile

    return () => {
      delete document.body.dataset.portalProfile
    }
  }, [session.authenticated, session.activeProfile])

  function loginGovBr() {
    const nextSession = createGovBrSession()
    storeSession(nextSession)
    setSession(nextSession)
  }

  function loginProvider() {
    const nextSession = createProviderSession()
    storeSession(nextSession)
    setSession(nextSession)
  }

  function logout() {
    clearSession()
    setSession(getStoredSession())
  }

  return (
    <>
      <ScrollEnhancements />
      <CookieConsent />
      <Routes>
        <Route path="/" element={<HomePage loggedIn={loggedIn} onLogout={logout} />} />
        <Route path="/login-govbr" element={<LoginPage onGovLogin={loginGovBr} onProviderLogin={loginProvider} />} />
        <Route path="/rede-credenciada" element={<PublicProviderNetworkPage loggedIn={loggedIn} onLogout={logout} />} />
        <Route path="/rede-credenciada/credenciado/:id" element={<PublicProviderDetailsPage loggedIn={loggedIn} onLogout={logout} />} />
        <Route path="/rede-credenciada/prestador/:id" element={<LegacyCredenciadoRedirect />} />
        <Route path="/torne-se-beneficiario" element={<Navigate to="/plan-assiste/beneficiarios/torne-se-beneficiario" replace />} />
        <Route path="/plan-assiste" element={<PlanAssisteIndexPage loggedIn={loggedIn} onLogout={logout} />} />
        <Route path="/plan-assiste/beneficiarios/torne-se-beneficiario" element={<BecomeBeneficiaryPage loggedIn={loggedIn} onLogout={logout} />} />
        <Route path="/plan-assiste/estrutura-e-govenrnanca" element={<Navigate to="/plan-assiste/estrutura-e-governanca" replace />} />
        <Route path="/plan-assiste/portarias-normativas" element={<Navigate to="/plan-assiste/portarias" replace />} />
        <Route path="/plan-assiste/portarias-de-designacao" element={<Navigate to="/plan-assiste/portarias" replace />} />
        <Route path="/plan-assiste/prestadores" element={<Navigate to="/plan-assiste/credenciados" replace />} />
        <Route path="/plan-assiste/credenciamento-de-pessoa-juridica" element={<Navigate to="/plan-assiste/como-se-credenciar-ou-renovar/pessoa-juridica" replace />} />
        <Route path="/plan-assiste/credenciamento-pessoa-fisica" element={<Navigate to="/plan-assiste/como-se-credenciar-ou-renovar/pessoa-fisica" replace />} />
        <Route path="/plan-assiste/*" element={<PlanAssisteArticlePage loggedIn={loggedIn} onLogout={logout} />} />
        <Route path="/transparencia/demonstracoes-contabeis" element={<AccountingStatementsPage loggedIn={loggedIn} onLogout={logout} />} />
        <Route path="/transparencia/avaliacoes-atuariais" element={<ActuarialEvaluationsPage loggedIn={loggedIn} onLogout={logout} />} />
        <Route path="/transparencia/termos-de-credenciamento" element={<AccreditationTermsPage loggedIn={loggedIn} onLogout={logout} />} />
        <Route path="/transparencia/relatorios-de-gestao" element={<ManagementReportsPage loggedIn={loggedIn} onLogout={logout} />} />
        <Route path="/transparencia/execucao-orcamentaria" element={<RequireAuth session={session} profile="beneficiary"><BudgetExecutionPage loggedIn={loggedIn} onLogout={logout} /></RequireAuth>} />
        <Route path="/transparencia/relatorios-orcamentarios-e-financeiros" element={<BudgetFinancialReportsPage loggedIn={loggedIn} onLogout={logout} />} />
        <Route path="/noticias" element={<NewsPage loggedIn={loggedIn} onLogout={logout} />} />
        <Route path="/noticias/:id" element={<NewsDetailPage loggedIn={loggedIn} onLogout={logout} />} />
        <Route path="/fale-conosco" element={<SupportPage loggedIn={loggedIn} onLogout={logout} />} />
        <Route path="/fale-conosco/duvidas-frequentes" element={<SupportFaqPage loggedIn={loggedIn} onLogout={logout} />} />
        <Route path="/fale-conosco/manifestacoes" element={<ManifestationPage loggedIn={loggedIn} onLogout={logout} />} />
        <Route path="/fale-conosco/manifestacoes/qualidade-dos-servicos" element={<ManifestationPage loggedIn={loggedIn} onLogout={logout} />} />
        <Route path="/fale-conosco/manifestacoes/reclamacao-e-denuncia" element={<ManifestationPage loggedIn={loggedIn} onLogout={logout} />} />
        <Route path="/suporte-e-relacionamento" element={<Navigate to="/fale-conosco" replace />} />
        <Route path="/suporte-e-relacionamento/manifestacoes" element={<Navigate to="/fale-conosco/manifestacoes" replace />} />
        <Route
          path="/transparencia"
          element={
            <Suspense fallback={null}>
              <TransparenciaPage loggedIn={loggedIn} onLogout={logout} />
            </Suspense>
          }
        />
        <Route path="/transparencia/*" element={<CmsPaginaCriadaPage loggedIn={loggedIn} onLogout={logout} />} />
        <Route path="/busca" element={<SearchPage loggedIn={loggedIn} onLogout={logout} />} />
        <Route
          path="/credenciado"
          element={
            <RequireAuth session={session} profile="provider">
              <ProviderDashboardPage loggedIn={loggedIn} onLogout={logout} />
            </RequireAuth>
          }
        />
        <Route
          path="/credenciado/pagina-do-credenciado"
          element={
            <RequireAuth session={session} profile="provider">
              <ProviderPublicProfilePage loggedIn={loggedIn} onLogout={logout} />
            </RequireAuth>
          }
        />
        <Route
          path="/credenciado/autorizacoes"
          element={
            <RequireAuth session={session} profile="provider">
              <ProviderAuthorizationsPage loggedIn={loggedIn} onLogout={logout} />
            </RequireAuth>
          }
        />
        <Route
          path="/credenciado/faturamento"
          element={
            <RequireAuth session={session} profile="provider">
              <ProviderBillingPage loggedIn={loggedIn} onLogout={logout} />
            </RequireAuth>
          }
        />
        <Route
          path="/credenciado/faturamento/:section"
          element={
            <RequireAuth session={session} profile="provider">
              <ProviderBillingDetailPage loggedIn={loggedIn} onLogout={logout} />
            </RequireAuth>
          }
        />
        <Route path="/prestador/*" element={<LegacyCredenciadoRedirect />} />
        <Route
          path="/area-da-equipe"
          element={
            <RequireAuth session={session} profile="team">
              <TeamDashboardPage loggedIn={loggedIn} onLogout={logout} />
            </RequireAuth>
          }
        />
        <Route path="/aplicativo" element={<AppGuidePage loggedIn={loggedIn} onLogout={logout} />} />
        <Route path="/orientacoes-eps" element={<Navigate to="/plan-assiste/beneficiarios/orientacoes-sobre-eps" replace />} />
        <Route path="/mockup" element={<MockupPage />} />
        {isFeatureInstrucoesCondicionaisEnabled() && (
          <Route path="/dev/instrucoes-condicionais-preview" element={<InstrucoesCondicionaisPreviewPage />} />
        )}
        <Route path="/lgpd" element={<StaticInfoPage loggedIn={loggedIn} onLogout={logout} page="lgpd" />} />
        <Route path="/privacidade" element={<StaticInfoPage loggedIn={loggedIn} onLogout={logout} page="privacidade" />} />
        <Route path="/acessibilidade" element={<StaticInfoPage loggedIn={loggedIn} onLogout={logout} page="acessibilidade" />} />
        <Route path="/mapa-do-site" element={<StaticInfoPage loggedIn={loggedIn} onLogout={logout} page="mapa" />} />
        <Route
          path="/minha-area"
          element={
            <RequireAuth session={session}>
              <AccountAreaPage onLogout={logout} />
            </RequireAuth>
          }
        />
        <Route
          path="/beneficiario"
          element={
            <RequireAuth session={session} profile="beneficiary">
              <BeneficiaryLayout onLogout={logout} />
            </RequireAuth>
          }
        >
          <Route index element={<OverviewPage />} />
          <Route path="visao-geral" element={<Navigate to="/beneficiario" replace />} />
          <Route path="carteirinhas" element={<CardsPage />} />
          <Route path="meus-dados" element={<MyDataPage />} />
          <Route path="minha-area" element={<MyDataPage />} />
          <Route path="servicos" element={<RequestsPage />} />
          <Route path="solicitacoes" element={<MinhasSolicitacoesPage />} />
          <Route path="solicitacoes/:id" element={<SolicitacaoDetalhePage />} />
          <Route path="autorizacoes" element={<BeneficiaryAuthorizationsPage />} />
          <Route path="minhas-solicitacoes" element={<Navigate to="/beneficiario/solicitacoes" replace />} />
          <Route path="nova-solicitacao" element={<NovaSolicitacaoPage />} />
          <Route path="reembolso-procedimentos/nova-solicitacao" element={<BeneficiaryNovaReembolsoPage />} />
          <Route path="beneficio-medicamentos/nova-solicitacao" element={<BeneficiaryNovaBeneficioMedicamentosPage />} />
          <Route path="inscricao-dependente/nova-solicitacao" element={<NovaInscricaoDependentePage />} />
          <Route path="autorizacao-procedimentos/nova-solicitacao" element={<NovaAutorizacaoPage />} />
          <Route path="servicos/:slug/nova-solicitacao" element={<ServiceRequestPage />} />
          <Route path="reembolsos" element={<ReimbursementsPage />} />
          <Route path="reembolsos/extrato-auxilio-saude" element={<HealthAidExtractPage />} />
          <Route path="despesas-e-extratos" element={<ExpensesPage />} />
          <Route path="comprovante-irpf" element={<IrpfPage />} />
          <Route path="duvidas-frequentes" element={<FaqPage />} />
          <Route path="minhas-preferencias" element={<PreferencesPage />} />
          <Route path="dependentes" element={<DependentsPage />} />
          <Route path="notificacoes" element={<NotificationsPage />} />
          <Route path="rede-credenciada" element={<BeneficiaryProviderNetworkPage />} />
          <Route path="rede-credenciada/credenciado/:id" element={<BeneficiaryProviderDetailsPage />} />
          <Route path="rede-credenciada/prestador/:id" element={<LegacyCredenciadoRedirect />} />
          {placeholderPages.map((page) => (
            <Route
              key={page.slug}
              path={page.slug}
              element={<PlaceholderPage page={page} />}
            />
          ))}
        </Route>
        <Route
          path="/credenciado/visao-geral"
          element={<Navigate to="/credenciado" replace />}
        />
        <Route
          path="/area-da-equipe/visao-geral"
          element={
            <RequireAuth session={session} profile="team">
              <Navigate to="/area-da-equipe" replace />
            </RequireAuth>
          }
        />
        <Route
          path="/area-da-equipe/gestao-da-informacao"
          element={
            <RequireAuth session={session} profile="team">
              <TeamInformationPage loggedIn={loggedIn} onLogout={logout} />
            </RequireAuth>
          }
        />
        <Route
          path="/area-da-equipe/gestao-da-informacao/:category"
          element={
            <RequireAuth session={session} profile="team">
              <TeamInformationDetailPage loggedIn={loggedIn} onLogout={logout} />
            </RequireAuth>
          }
        />
        <Route path="/area-da-equipe/administracao-do-portal" element={<RequireAuth session={session} profile="team"><CmsAdminOverviewPage loggedIn={loggedIn} onLogout={logout} /></RequireAuth>} />
        <Route path="/area-da-equipe/administracao-do-portal/navegar/*" element={<RequireAuth session={session} profile="team"><CmsLiveBrowserPage loggedIn={loggedIn} onLogout={logout} /></RequireAuth>} />
        <Route path="/area-da-equipe/administracao-do-portal/paginas" element={<RequireAuth session={session} profile="team"><CmsPagesPage loggedIn={loggedIn} onLogout={logout} /></RequireAuth>} />
        <Route path="/area-da-equipe/administracao-do-portal/paginas/:pageId" element={<RequireAuth session={session} profile="team"><CmsPageEditorPage loggedIn={loggedIn} onLogout={logout} /></RequireAuth>} />
        <Route path="/area-da-equipe/administracao-do-portal/banners" element={<RequireAuth session={session} profile="team"><CmsBannersPage loggedIn={loggedIn} onLogout={logout} /></RequireAuth>} />
        <Route path="/area-da-equipe/administracao-do-portal/midias" element={<RequireAuth session={session} profile="team"><CmsMediaPage loggedIn={loggedIn} onLogout={logout} /></RequireAuth>} />
        <Route path="/area-da-equipe/administracao-do-portal/arquivos" element={<RequireAuth session={session} profile="team"><CmsFilesPage loggedIn={loggedIn} onLogout={logout} /></RequireAuth>} />
        <Route path="/area-da-equipe/administracao-do-portal/noticias" element={<RequireAuth session={session} profile="team"><CmsNewsPage loggedIn={loggedIn} onLogout={logout} /></RequireAuth>} />
        <Route path="/area-da-equipe/administracao-do-portal/contatos" element={<RequireAuth session={session} profile="team"><CmsContactPage loggedIn={loggedIn} onLogout={logout} /></RequireAuth>} />
        <Route
          path="/gestao-operacional"
          element={
            <RequireAuth session={session} profile="team">
              <GestaoOperacionalLayout onLogout={logout} />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="site" replace />} />
          <Route path="visao-geral" element={<Navigate to="/gestao-operacional/site" replace />} />
          <Route path="reembolso-procedimentos/*" element={<Navigate to="/area-da-equipe" replace />} />
          <Route path="auxilio-medicamentos/*" element={<Navigate to="/area-da-equipe" replace />} />
          <Route path="inscricao-dependente/*" element={<Navigate to="/area-da-equipe" replace />} />
          <Route path="autorizacao-procedimentos/*" element={<Navigate to="/area-da-equipe" replace />} />
          <Route path="admin/reembolsos" element={<Navigate to="/area-da-equipe" replace />} />
          <Route path="admin/medicamentos" element={<Navigate to="/area-da-equipe" replace />} />
          <Route path="admin/autorizacoes" element={<Navigate to="/area-da-equipe" replace />} />
          <Route path="site" element={<Navigate to="/area-da-equipe/administracao-do-portal" replace />} />
          <Route path="site/banners" element={<AdminBannersPage />} />
          <Route path="site/banners/novo-banner" element={<NovoBannerPage />} />
          <Route path="site/noticias" element={<AdminNoticiasPage />} />
          <Route path="site/noticias/nova-noticia" element={<NovaNoticiaPage />} />
          <Route path="site/noticias/categorias-noticias" element={<AdminCategoriasNoticiasPage />} />
          <Route path="site/base-conhecimento" element={<AdminBaseConhecimentoPage />} />
          <Route path="site/base-conhecimento/novo-artigo" element={<NovoArtigoPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <BackToTop />
      <VLibrasWidget />
      <AiChatWidget />
    </>
  )
}

export default App
