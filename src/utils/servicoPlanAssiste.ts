import { beneficiaryRequests } from '../data/mock'

type Servico = (typeof beneficiaryRequests)[number]

// Serviços cujo formulário mora numa rota própria, diferente da que o card do
// catálogo aponta — ali o card leva à área do serviço, não ao formulário.
const FORMULARIO_FORA_DO_CATALOGO: Record<string, string> = {
  'inclusao-dependentes': '/beneficiario/inscricao-dependente/nova-solicitacao',
}

/** Slug do formulário, quando o serviço usa a rota padrão /beneficiario/servicos/<slug>/nova-solicitacao. */
export function servicoFormSlug(request: Servico): string | undefined {
  return request.route?.match(/^\/beneficiario\/servicos\/(.+)\/nova-solicitacao$/)?.[1]
}

/** Segmento usado na página do serviço dentro do Plan-Assiste. */
export function servicoPaginaSlug(request: Servico): string {
  return servicoFormSlug(request) ?? request.id
}

export function findServicoByPaginaSlug(slug: string): Servico | undefined {
  return beneficiaryRequests.find((request) => servicoPaginaSlug(request) === slug)
}

/** Rota do formulário do serviço, se ele tiver um. */
export function servicoRotaFormulario(request: Servico): string | undefined {
  const propria = FORMULARIO_FORA_DO_CATALOGO[request.id]
  if (propria) return propria
  return request.route?.includes('/nova-solicitacao') ? request.route : undefined
}

/**
 * Página explicativa no Plan-Assiste. Só existe para serviços com formulário —
 * são os mesmos que exibem o botão "Formulário" naquela seção.
 */
export function servicoDetalheRota(request: Servico | undefined): string | undefined {
  if (!request || !servicoRotaFormulario(request)) return undefined
  return `/plan-assiste/servicos/${servicoPaginaSlug(request)}`
}
