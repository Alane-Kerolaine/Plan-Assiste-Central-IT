export type MinhasSolicitacaoStatus = 'Aberto' | 'Em andamento' | 'Suspenso' | 'Reativado' | 'Reaberto' | 'Concluída'

export type MinhasSolicitacaoFormField = {
  label: string
  value: string
}

export type MinhasSolicitacaoAtualizacao = {
  data: string
  hora?: string
  titulo: string
  descricao: string
  autor?: 'atendente' | 'beneficiario'
  anexos?: string[]
}

export function solicitacaoConcluida(status: MinhasSolicitacaoStatus) {
  return status === 'Concluída'
}

export function solicitacaoStatusBadge(status: MinhasSolicitacaoStatus) {
  if (status === 'Concluída') return 'go-badge approved'
  if (status === 'Em andamento' || status === 'Reativado') return 'go-badge analysis'
  if (status === 'Suspenso') return 'go-badge refused'
  if (status === 'Reaberto') return 'go-badge warning'
  return 'go-badge pending'
}

export function solicitacaoStatusLabel(status: MinhasSolicitacaoStatus) {
  return status
}

export const SOLICITACOES_PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

export const solicitacaoRatingLabels = ['Péssimo', 'Ruim', 'Regular', 'Bom', 'Excelente']
