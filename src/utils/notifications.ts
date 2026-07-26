export type BeneficiaryNotification = {
  id: string
  title: string
  summary: string
  detail: string
  category: 'Cadastro' | 'Autorizações' | 'Reembolso e auxílios' | 'Financeiro' | 'Documentos'
  date: string
  read: boolean
  pinned?: boolean
  route?: string
}

const storageKey = 'planAssisteNotifications'

export const defaultNotifications: BeneficiaryNotification[] = [
  {
    id: 'politica-privacidade-2026-07-19',
    title: 'Política de privacidade atualizada',
    summary: 'Leia a política atualizada e registre sua nova ciência no portal.',
    detail: 'A Política de Privacidade e Cookies do Plan-Assiste foi atualizada. O aviso também será encaminhado ao e-mail cadastrado. Revise o documento e confirme suas preferências de cookies para continuar utilizando o portal.',
    category: 'Documentos',
    date: '19/07/2026',
    read: false,
    pinned: true,
    route: '/lgpd',
  },
  {
    id: 'contato-cadastral',
    title: 'Atualize seus dados de contato',
    summary: 'Mantenha telefone e e-mail atualizados para receber avisos importantes.',
    detail: 'Identificamos que seus dados de contato podem estar incompletos. Revise telefone, e-mail e endereço em Meus dados para continuar recebendo comunicações do Plan-Assiste.',
    category: 'Cadastro',
    date: '08/06/2026',
    read: false,
    pinned: false,
    route: '/beneficiario/meus-dados',
  },
  {
    id: 'reembolso-documento-pendente',
    title: 'Documento pendente em reembolso',
    summary: 'A solicitação de reembolso nº 2026-1842 possui um documento pendente.',
    detail: 'Para concluir a análise do reembolso nº 2026-1842, envie o comprovante complementar solicitado. O acompanhamento pode ser feito na página de Reembolsos.',
    category: 'Reembolso e auxílios',
    date: '07/06/2026',
    read: false,
    pinned: true,
    route: '/beneficiario/reembolsos',
  },
  {
    id: 'carteirinha-disponivel',
    title: 'Carteirinha digital disponível',
    summary: 'A carteirinha digital da beneficiária Maria Olívia Araújo está disponível.',
    detail: 'A carteirinha digital foi atualizada e já pode ser acessada, baixada ou compartilhada na página Carteirinhas.',
    category: 'Documentos',
    date: '05/06/2026',
    read: true,
    pinned: false,
    route: '/beneficiario/carteirinhas',
  },
  {
    id: 'autorizacao-procedimento-aprovada',
    title: 'Autorização de procedimento aprovada',
    summary: 'A solicitação de autorização nº AUT-2026-002 foi aprovada.',
    detail: 'A autorização solicitada para o procedimento foi aprovada. Consulte Minhas solicitações para visualizar os dados e acompanhar as próximas orientações.',
    category: 'Autorizações',
    date: '03/06/2026',
    read: true,
    pinned: false,
    route: '/beneficiario/solicitacoes',
  },
  {
    id: 'autorizacao-documento-complementar',
    title: 'Documento solicitado para autorização',
    summary: 'A autorização nº AUT-2026-001 aguarda documentação complementar.',
    detail: 'Envie o relatório médico complementar solicitado para que a análise da autorização possa prosseguir.',
    category: 'Autorizações',
    date: '02/06/2026',
    read: false,
    pinned: false,
    route: '/beneficiario/solicitacoes',
  },
  {
    id: 'auxilio-medicamentos-em-analise',
    title: 'Auxílio para medicamentos em análise',
    summary: 'A solicitação MED-2026-001 foi encaminhada para análise.',
    detail: 'Os documentos do pedido de auxílio para aquisição de medicamentos foram recebidos e estão em análise pela equipe responsável.',
    category: 'Reembolso e auxílios',
    date: '30/05/2026',
    read: true,
    pinned: false,
    route: '/beneficiario/solicitacoes',
  },
  {
    id: 'reembolso-pagamento-programado',
    title: 'Pagamento de reembolso programado',
    summary: 'O pagamento do reembolso SOL-2026-002 foi programado.',
    detail: 'A solicitação foi aprovada e o crédito está programado para a conta bancária vinculada ao beneficiário titular.',
    category: 'Reembolso e auxílios',
    date: '28/05/2026',
    read: true,
    pinned: false,
    route: '/beneficiario/reembolsos',
  },
  {
    id: 'dependente-incluido',
    title: 'Dependente incluído no Programa',
    summary: 'A solicitação DEP-2026-001 foi concluída.',
    detail: 'A inclusão do dependente foi aprovada. Os dados cadastrais e a carteirinha podem ser consultados no portal.',
    category: 'Cadastro',
    date: '25/05/2026',
    read: true,
    pinned: false,
    route: '/beneficiario/dependentes',
  },
  {
    id: 'dados-cadastrais-atualizados',
    title: 'Dados cadastrais atualizados',
    summary: 'Sua solicitação de atualização cadastral foi concluída.',
    detail: 'As alterações informadas foram processadas e já estão disponíveis para consulta em Meus dados.',
    category: 'Cadastro',
    date: '22/05/2026',
    read: true,
    pinned: false,
    route: '/beneficiario/meus-dados',
  },
  {
    id: 'demonstrativo-irpf-disponivel',
    title: 'Demonstrativo de IRPF disponível',
    summary: 'O demonstrativo anual já pode ser consultado e baixado.',
    detail: 'O documento com os valores destinados à declaração do Imposto de Renda está disponível na área de documentos.',
    category: 'Documentos',
    date: '18/05/2026',
    read: true,
    pinned: false,
    route: '/beneficiario/despesas-e-extratos',
  },
  {
    id: 'desconto-folha-processado',
    title: 'Desconto em folha processado',
    summary: 'O custeio referente à competência de abril foi processado.',
    detail: 'Consulte o extrato para conferir os valores de custeio e os descontos processados na folha de pagamento.',
    category: 'Financeiro',
    date: '15/05/2026',
    read: true,
    pinned: false,
    route: '/beneficiario/despesas-e-extratos',
  },
  {
    id: 'extrato-financeiro-atualizado',
    title: 'Extrato financeiro atualizado',
    summary: 'Novos lançamentos foram incluídos em Despesas e custeios.',
    detail: 'O extrato recebeu lançamentos recentes de despesas assistenciais, custeios e descontos em folha.',
    category: 'Financeiro',
    date: '12/05/2026',
    read: true,
    pinned: false,
    route: '/beneficiario/despesas-e-extratos',
  },
]

export function sortNotifications(notifications: BeneficiaryNotification[]) {
  return [...notifications].sort((first, second) => {
    if (first.read !== second.read) return first.read ? 1 : -1
    if (first.pinned !== second.pinned) return first.pinned ? -1 : 1
    return defaultNotifications.findIndex((item) => item.id === first.id) - defaultNotifications.findIndex((item) => item.id === second.id)
  })
}

export function getStoredNotifications() {
  if (typeof window === 'undefined') return defaultNotifications

  const stored = window.localStorage.getItem(storageKey)
  if (!stored) return defaultNotifications

  try {
    const parsed = JSON.parse(stored) as BeneficiaryNotification[]
    const merged = parsed.flatMap((notification) => {
      const currentNotification = defaultNotifications.find((item) => item.id === notification.id)
      return currentNotification
        ? [{ ...currentNotification, read: notification.read, pinned: notification.pinned }]
        : []
    })
    const ids = new Set(merged.map((notification) => notification.id))
    return [...defaultNotifications.filter((notification) => !ids.has(notification.id)), ...merged]
  } catch {
    return defaultNotifications
  }
}

export function saveStoredNotifications(notifications: BeneficiaryNotification[]) {
  window.localStorage.setItem(storageKey, JSON.stringify(notifications))
  window.dispatchEvent(new CustomEvent('planAssisteNotificationsUpdated', {
    detail: notifications,
  }))
}

export function markNotificationRead(id: string) {
  const notifications = getStoredNotifications().map((notification) => (
    notification.id === id ? { ...notification, read: true } : notification
  ))
  saveStoredNotifications(notifications)
  return notifications
}

export function markNotificationUnread(id: string) {
  const notifications = getStoredNotifications().map((notification) => (
    notification.id === id ? { ...notification, read: false } : notification
  ))
  saveStoredNotifications(notifications)
  return notifications
}

export function markAllNotificationsRead() {
  const notifications = getStoredNotifications().map((notification) => ({ ...notification, read: true }))
  saveStoredNotifications(notifications)
  return notifications
}

export function toggleNotificationPinned(id: string) {
  const notifications = getStoredNotifications().map((notification) => (
    notification.id === id ? { ...notification, pinned: !notification.pinned } : notification
  ))
  saveStoredNotifications(notifications)
  return notifications
}
