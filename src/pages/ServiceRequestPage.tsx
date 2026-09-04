import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { servicoDetalheRota } from '../utils/servicoPlanAssiste'
import { EmptyState } from '../components/PortalComponents'
import { ServiceRequestWizard } from '../components/ServiceRequestWizard'
import { ServiceRequestWizardV2 } from '../components/ServiceRequestWizardV2'
import { beneficiaryRequests } from '../data/mock'
import { getServiceFormSchema } from '../data/serviceFormSchemas'
import { isFeatureInstrucoesCondicionaisEnabled } from '../utils/featureFlags'

const MOCK_INSTRUCTIONS = [
  'Reúna com antecedência os documentos que podem ser exigidos nesta solicitação.',
  'Preencha o formulário com atenção; alguns campos variam conforme o seu caso.',
  'Revise os dados na etapa de Revisão antes de confirmar o envio.',
  'Guarde o número de protocolo gerado para acompanhar sua solicitação.',
]

const MOCK_FAQ = [
  {
    question: 'Como solicitar?',
    answer: 'Preencha o formulário com os dados solicitados e anexe a documentação necessária. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse potenti. Verifique se todos os campos obrigatórios foram preenchidos corretamente antes de avançar para a etapa de revisão, evitando retrabalho ou pendências na análise.',
  },
  {
    question: 'Quem pode solicitar?',
    answer: 'Titulares e dependentes ativos no Plan-Assiste, conforme as regras deste serviço. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Beneficiários especiais também podem solicitar quando enquadrados nas condições previstas no Regulamento Geral do Programa.',
  },
  {
    question: 'Prazo de atendimento?',
    answer: 'A análise costuma ocorrer em até 5 dias úteis após o envio da solicitação. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Em casos que exijam documentação complementar, o prazo pode ser prorrogado e você será notificado pelo portal.',
  },
]

export function ServiceRequestPage() {
  const { slug } = useParams<{ slug: string }>()
  const schema = slug ? getServiceFormSchema(slug) : undefined
  const [showForm, setShowForm] = useState(false)

  if (!schema) {
    return (
      <div className="requests-page">
        <EmptyState title="Serviço não encontrado" />
      </div>
    )
  }

  const catalogEntry = beneficiaryRequests.find((request) => request.route === `/beneficiario/servicos/${slug}/nova-solicitacao`)
  const actionLabel = catalogEntry?.action ?? 'Iniciar solicitação'
  // Página explicativa no Plan-Assiste: existe só para serviços com formulário.
  const detalheRota = servicoDetalheRota(catalogEntry)

  if (!showForm) {
    return (
      <div className="requests-page">
        <div className="provider-page-heading">
          <h1>{schema.title}</h1>
          {catalogEntry?.description && <p className="page-subtitle">{catalogEntry.description}</p>}
        </div>
        <section className="reimbursement-card">
          <div className="service-intro-faq">
            {MOCK_FAQ.map((item) => (
              <div key={item.question}>
                <h3>{item.question}</h3>
                <p>{item.answer}</p>
              </div>
            ))}
          </div>
          <div className="service-success-followup">
            <h3>Instruções</h3>
            <ol>
              {MOCK_INSTRUCTIONS.map((instruction, index) => (
                <li key={instruction}>
                  <span className="service-followup-index">{index + 1}</span> {instruction}
                </li>
              ))}
            </ol>
          </div>
          <div className="reimbursement-actions">
            <button className="primary-button" onClick={() => setShowForm(true)} type="button">
              {actionLabel} <ArrowRight aria-hidden="true" />
            </button>
            {detalheRota && <Link className="secondary-button" to={detalheRota}>Ver detalhes</Link>}
          </div>
        </section>
      </div>
    )
  }

  const heading = (
    <div className="provider-page-heading">
      <h1>{schema.title}</h1>
      <p className="page-subtitle">
        Preencha o formulário, revise os dados e confirme o envio para gerar o protocolo da solicitação.
      </p>
    </div>
  )

  if (isFeatureInstrucoesCondicionaisEnabled() && schema.perguntaChave) {
    return (
      <div className="requests-page">
        {heading}
        <ServiceRequestWizardV2 schema={{ ...schema, perguntaChave: schema.perguntaChave }} />
      </div>
    )
  }

  return (
    <div className="requests-page">
      {heading}
      <ServiceRequestWizard schema={schema} />
    </div>
  )
}
