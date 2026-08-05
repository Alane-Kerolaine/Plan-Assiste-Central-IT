export type ProviderRequestCategory =
  | 'Rede Credenciada / Conveniada'
  | 'Especialidade e Preços de Serviços de Saúde'
  | 'Autorização'
  | 'Faturamento'
  | 'Serviços de Saúde'
  | 'Fale Conosco'
  | 'Relacionamento e Comunicação'

export type ProviderRequestType = 'Requisição' | 'Incidente'

export type ProviderServiceCatalogItem = {
  id: string
  title: string
  category: ProviderRequestCategory
  tipo: ProviderRequestType
}

export const providerRequestCategories: ProviderRequestCategory[] = [
  'Rede Credenciada / Conveniada',
  'Especialidade e Preços de Serviços de Saúde',
  'Autorização',
  'Faturamento',
  'Serviços de Saúde',
  'Fale Conosco',
  'Relacionamento e Comunicação',
]

export const providerServiceCatalog: ProviderServiceCatalogItem[] = [
  { id: 'credenciamento-duvidas', title: 'Credenciamento (Dúvidas, Informações e Esclarecimentos)', category: 'Rede Credenciada / Conveniada', tipo: 'Requisição' },
  { id: 'proposta-de-credenciamento', title: 'Proposta de Credenciamento', category: 'Rede Credenciada / Conveniada', tipo: 'Requisição' },
  { id: 'acompanhamento-credenciamento', title: 'Acompanhamento do Processo de Credenciamento', category: 'Rede Credenciada / Conveniada', tipo: 'Requisição' },

  { id: 'atualizacao-cadastral-duvidas', title: 'Atualização Cadastral (Dúvidas, Informações e Esclarecimentos)', category: 'Especialidade e Preços de Serviços de Saúde', tipo: 'Requisição' },
  { id: 'atualizacao-dados-cadastrais', title: 'Atualização de Dados Cadastrais', category: 'Especialidade e Preços de Serviços de Saúde', tipo: 'Requisição' },
  { id: 'reajuste-tabela-precos', title: 'Reajuste de Tabela de Preços', category: 'Especialidade e Preços de Serviços de Saúde', tipo: 'Requisição' },
  { id: 'acompanhamento-atualizacao-cadastral', title: 'Acompanhamento da Atualização de Dados Cadastrais', category: 'Especialidade e Preços de Serviços de Saúde', tipo: 'Requisição' },

  { id: 'autorizacao-urgencia-emergencia', title: 'Autorização Urgência e Emergência', category: 'Autorização', tipo: 'Requisição' },
  { id: 'autorizacao-opme', title: 'Autorização OPME', category: 'Autorização', tipo: 'Requisição' },

  { id: 'faturamento-duvidas', title: 'Faturamento (Dúvidas, Informações e Esclarecimentos)', category: 'Faturamento', tipo: 'Requisição' },
  { id: 'informacoes-financeiras-prestador', title: 'Informações Financeiras do Prestador', category: 'Faturamento', tipo: 'Requisição' },
  { id: 'recurso-informacoes-financeiras', title: 'Recurso / Contestação de Informações Financeiras', category: 'Faturamento', tipo: 'Requisição' },

  { id: 'autorizacoes-duvidas', title: 'Autorizações (Dúvidas, Informações e Esclarecimentos)', category: 'Serviços de Saúde', tipo: 'Requisição' },
  { id: 'recurso-negativa-autorizacao', title: 'Recurso / Contestação de Negativa de Autorização', category: 'Serviços de Saúde', tipo: 'Requisição' },

  { id: 'atualizacao-do-site', title: 'Atualização do Site', category: 'Fale Conosco', tipo: 'Requisição' },

  { id: 'indisponibilidade-do-site', title: 'Indisponibilidade do Site', category: 'Relacionamento e Comunicação', tipo: 'Requisição' },
  { id: 'catalogo-servico-prestador', title: 'Catálogo de Serviço do Prestador', category: 'Relacionamento e Comunicação', tipo: 'Requisição' },
  { id: 'sistemas-duvidas', title: 'Sistemas (Dúvidas, Informações e Esclarecimentos)', category: 'Relacionamento e Comunicação', tipo: 'Requisição' },
  { id: 'problemas-acesso-sistema', title: 'Problemas de Acesso do Sistema (Benner, Portal TISS, Autorizador WEB)', category: 'Relacionamento e Comunicação', tipo: 'Incidente' },
  { id: 'indisponibilidade-sistema', title: 'Indisponibilidade do Sistema (Benner, Portal TISS, Autorizador WEB)', category: 'Relacionamento e Comunicação', tipo: 'Incidente' },
  { id: 'erro-funcionalidade-sistema', title: 'Ocorrência de Erro em Funcionalidades do Sistema (Benner, Portal TISS, Autorizador WEB)', category: 'Relacionamento e Comunicação', tipo: 'Incidente' },
  { id: 'plataforma-conectividade-duvidas', title: 'Plataforma de Conectividade (Dúvidas, Informações e Esclarecimentos)', category: 'Relacionamento e Comunicação', tipo: 'Requisição' },
  { id: 'problemas-acesso-plataforma-conectividade', title: 'Problemas de Acesso da Plataforma de Conectividade', category: 'Relacionamento e Comunicação', tipo: 'Incidente' },
  { id: 'indisponibilidade-plataforma-conectividade', title: 'Indisponibilidade da Plataforma de Conectividade', category: 'Relacionamento e Comunicação', tipo: 'Incidente' },
  { id: 'erro-funcionalidade-plataforma-conectividade', title: 'Ocorrência de erro em Funcionalidade da Plataforma de Conectividade', category: 'Relacionamento e Comunicação', tipo: 'Incidente' },
]
