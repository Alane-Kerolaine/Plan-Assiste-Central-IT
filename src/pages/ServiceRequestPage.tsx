import { useParams } from 'react-router-dom'
import { EmptyState } from '../components/PortalComponents'
import { ServiceRequestWizard } from '../components/ServiceRequestWizard'
import { getServiceFormSchema } from '../data/serviceFormSchemas'

export function ServiceRequestPage() {
  const { slug } = useParams<{ slug: string }>()
  const schema = slug ? getServiceFormSchema(slug) : undefined

  if (!schema) {
    return (
      <div className="requests-page">
        <EmptyState title="Serviço não encontrado" />
      </div>
    )
  }

  return (
    <div className="requests-page">
      <div className="provider-page-heading">
        <h1>{schema.title}</h1>
        <p className="page-subtitle">
          Preencha o formulário, revise os dados e confirme o envio para gerar o protocolo da solicitação.
        </p>
      </div>
      <ServiceRequestWizard schema={schema} />
    </div>
  )
}
