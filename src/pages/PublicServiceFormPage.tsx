import { Info } from 'lucide-react'
import { Navigate, useParams } from 'react-router-dom'
import { ServiceRequestWizard } from '../components/ServiceRequestWizard'
import { getPublicServiceFormSchema, nomeDoSolicitanteSemLogin } from '../data/serviceFormSchemas'
import { getStoredSession, hasProfile } from '../utils/session'
import { PlanAssisteSidebar, PublicBreadcrumb, PublicShell, type PublicPageProps } from './PublicPages'

const ACOMPANHAMENTO_SEM_LOGIN = [
  'Guarde o número do protocolo e a via do documento assinado',
  'A equipe do Plan-Assiste vai analisar a solicitação e dar retorno pelo e-mail ou telefone informados',
  'Em caso de dúvida, fale com a Central de atendimento informando o número do protocolo',
]

/**
 * Formulário de serviço preenchido sem login, a partir da seção Serviços do Plan-Assiste.
 * Quem já está logado como beneficiário vai para o formulário da área logada, que
 * traz a identificação do cadastro.
 */
export function PublicServiceFormPage({ loggedIn, onLogout }: PublicPageProps) {
  const { slug = '' } = useParams<{ slug: string }>()
  const schema = getPublicServiceFormSchema(slug)

  if (!schema) return <Navigate to={`/plan-assiste/servicos/${slug}`} replace />
  if (hasProfile(getStoredSession(), 'beneficiary')) {
    return <Navigate to={`/beneficiario/servicos/${slug}/nova-solicitacao`} replace />
  }

  return (
    <PublicShell loggedIn={loggedIn} onLogout={onLogout}>
      <main className="container public-page">
        <PublicBreadcrumb
          current="Formulário"
          parents={[
            { label: 'Plan-Assiste', to: '/plan-assiste' },
            { label: 'Serviços', to: '/plan-assiste/servicos' },
            { label: schema.title, to: `/plan-assiste/servicos/${slug}` },
          ]}
        />
        <div className="public-content-layout plan-content-layout">
          <PlanAssisteSidebar currentSlug={`servicos/${slug}`} />
          <div className="public-content-main requests-page">
            <div className="provider-page-heading">
              <h1>{schema.title}</h1>
              <p className="page-subtitle">
                Preencha o formulário, revise os dados e confirme o envio para gerar o protocolo da solicitação.
              </p>
            </div>
            <p className="servico-sem-login-aviso">
              <Info aria-hidden="true" />
              <span>
                Você está preenchendo sem login. Informe seus dados pessoais e de contato: a equipe do Plan-Assiste vai usá-los para dar retorno sobre a solicitação.
              </span>
            </p>
            <ServiceRequestWizard
              schema={schema}
              nomeDoAssinante={(valores) => nomeDoSolicitanteSemLogin(slug, valores)}
              acompanhamento={ACOMPANHAMENTO_SEM_LOGIN}
              successSecondaryAction={{ label: 'Voltar aos serviços', to: '/plan-assiste/servicos' }}
            />
          </div>
        </div>
      </main>
    </PublicShell>
  )
}
