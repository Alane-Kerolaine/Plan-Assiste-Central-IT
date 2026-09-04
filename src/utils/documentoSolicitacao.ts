import { beneficiaries } from '../data/mock'
import type { ServiceField, ServiceFormSchema, ServiceFormSection } from '../data/serviceFormSchemas'
import { formatReviewValue } from '../components/serviceRequestWizardHelpers'
import { nomeExibicao } from './nomeSocial'
import type { SecaoDocumento } from './documentoPdf'

const CABECALHO = ['PLAN-ASSISTE', 'MINISTÉRIO PÚBLICO DA UNIÃO']
const RODAPE = 'Você não deve editar o documento após assinatura, pois perderá a validade'

export type AssinaturaDocumento = { nome: string, detalhe: string }

function valorDoCampo(
  field: ServiceField,
  values: Record<string, string>,
  attachments: Record<string, File[]>,
): string {
  if (field.type === 'beneficiary') {
    return nomeExibicao(beneficiaries.find((item) => item.id === values[field.id])) || '-'
  }
  if (field.type === 'file') {
    const arquivos = attachments[field.id] ?? []
    return arquivos.length > 0 ? arquivos.map((arquivo) => arquivo.name).join(', ') : '-'
  }
  return formatReviewValue(field, values[field.id]) || '-'
}

/** Converte as seções visíveis do formulário no conteúdo do documento. */
export function secoesDoDocumento(
  sections: ServiceFormSection[],
  values: Record<string, string>,
  attachments: Record<string, File[]>,
): SecaoDocumento[] {
  const resultado: SecaoDocumento[] = []
  for (const section of sections) {
    const itens = section.fields
      .filter((field) => field.type !== 'note')
      .map((field) => ({ rotulo: field.label, valor: valorDoCampo(field, values, attachments) }))
    if (itens.length === 0) continue
    // Seção sem título não tem cabeçalho no formulário: continua a anterior,
    // em vez de ganhar um título inventado no documento.
    const anterior = resultado[resultado.length - 1]
    if (!section.title && anterior) anterior.itens.push(...itens)
    else resultado.push({ titulo: section.title ?? 'Dados da solicitação', itens })
  }
  return resultado
}

export function documentoDaSolicitacao(
  schema: ServiceFormSchema,
  sections: ServiceFormSection[],
  values: Record<string, string>,
  attachments: Record<string, File[]>,
  assinatura?: AssinaturaDocumento,
) {
  return {
    cabecalho: CABECALHO,
    titulo: schema.title,
    secoes: secoesDoDocumento(sections, values, attachments),
    rodapeAssinatura: RODAPE,
    assinatura,
  }
}

/** Nome do arquivo baixado, derivado do serviço e do protocolo quando houver. */
export function nomeArquivoDocumento(schema: ServiceFormSchema, protocolo?: string): string {
  const base = schema.slug || 'solicitacao'
  return protocolo ? `${base}-${protocolo}.pdf` : `${base}.pdf`
}

/** Carimbo da via assinada, no formato que o gov.br aplica. */
export function assinaturaAgora(nome: string): AssinaturaDocumento {
  const agora = new Date()
  const data = agora.toLocaleDateString('pt-BR')
  const hora = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  return { nome, detalhe: `Assinado digitalmente via gov.br em ${data} às ${hora}` }
}
