export type SupportChannelIcon = 'chat' | 'faq' | 'phone' | 'manifestation'

export type SupportChannel = {
  type: SupportChannelIcon
  title: string
  text: string
  detail: string
  route?: string
}

export const supportChannels: SupportChannel[] = [
  {
    type: 'chat',
    title: 'Assistente virtual',
    text: 'Esclareça suas dúvidas com nosso atendente virtual.',
    detail: 'Acesse o atendimento virtual para dúvidas rápidas sobre serviços, canais e orientações do Plan-Assiste.',
  },
  {
    type: 'faq',
    title: 'Dúvidas frequentes',
    text: 'Consulte respostas rápidas para os temas mais procurados.',
    detail: 'Veja orientações sobre rede credenciada, solicitações, reembolsos, dados cadastrais e canais de atendimento.',
    route: '/fale-conosco/duvidas-frequentes',
  },
  {
    type: 'phone',
    title: 'Central de atendimento 24h',
    text: 'Entre em contato pelo call center ou envie uma mensagem de texto pelo WhatsApp.',
    detail: 'Call center: 0800 591-5601. WhatsApp: (27) 98125-8237, exclusivo para recebimento de mensagens.',
  },
  {
    type: 'manifestation',
    title: 'Denúncia e reclamação',
    text: 'Relate situações que precisem de apuração ou tratamento pela unidade responsável.',
    detail: 'Use o canal oficial para registrar denúncias ou reclamações sobre atendimento, rede, processos e serviços do Plan-Assiste.',
    route: '/fale-conosco/manifestacoes/reclamacao-e-denuncia',
  },
]
