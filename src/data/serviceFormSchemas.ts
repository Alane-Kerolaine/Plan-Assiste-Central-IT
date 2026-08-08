import { beneficiaries } from './mock'

export type ServiceFieldType = 'text' | 'textarea' | 'date' | 'select' | 'combobox' | 'checkbox' | 'file' | 'beneficiary' | 'note' | 'radio'

export type ServiceFieldCondition = {
  fieldId: string
  equals: string
}

export type ServiceFieldFormat = 'phone' | 'cpf' | 'cpfCnpj' | 'cep' | 'email'

export type ServiceField = {
  id: string
  label: string
  type: ServiceFieldType
  required?: boolean
  disabled?: boolean
  fullWidth?: boolean
  columnSpan?: 2 | 3
  placeholder?: string
  options?: string[]
  defaultValue?: string
  helpText?: string
  infoText?: string
  showIf?: ServiceFieldCondition
  format?: ServiceFieldFormat
}

export type ServiceFormSection = {
  id: string
  title?: string
  fields: ServiceField[]
  showIf?: ServiceFieldCondition
  columns?: 2 | 3
}

export type CasoInstrucaoDocumento = {
  id: string
  label: string
  obrigatorio: boolean
}

export type AvisoNormativoConfig = {
  titulo: string
  conteudo: string
  baseLegal?: { label: string, href: string }
  exigeConfirmacao: boolean
}

export type CasoInstrucaoServico = {
  id: string
  titulo: string
  icone?: string
  documentos: CasoInstrucaoDocumento[]
  camposAdicionais?: string[]
  avisoNormativo?: AvisoNormativoConfig
  /**
   * Campos legados do schema (ex.: um `select` que a pergunta-chave substitui) cujo valor deve
   * ser preenchido automaticamente ao escolher este caso. O formulário V2 esconde esses campos
   * da renderização (já que ficam redundantes com a pergunta-chave) mas mantém seu valor em
   * sincronia, para que `showIf` condicionados a eles continuem funcionando sem duplicar a pergunta.
   */
  sincronizarCampos?: Record<string, string>
}

export type PerguntaChaveConfig = {
  enunciado: string
  casos: CasoInstrucaoServico[]
  // Id da seção abaixo de cuja qual o seletor de casos deve ser renderizado. Por padrão
  // aparece na última seção ("detalhes"); usado para reposicioná-lo quando necessário.
  secaoAncora?: string
  // Largura do seletor no grid da seção: 2 colunas ou largura total (padrão).
  colunas?: 2
}

export type AvisoInicialConfig = {
  titulo: string
  conteudo: string
  tone?: 'aviso' | 'informativo'
  posicao?: 'inicio' | 'apos-detalhes'
}

export type ServiceFormSchema = {
  slug: string
  title: string
  sections: ServiceFormSection[]
  perguntaChave?: PerguntaChaveConfig
  avisoInicial?: AvisoInicialConfig
}

function identificationSection(localidadeLabel: string = 'Localidade da Matrícula', includeRamo: boolean = false): ServiceFormSection {
  const localidadeTravada = localidadeLabel === 'Localidade da Matrícula'
  const fields: ServiceField[] = [
    { id: 'beneficiarioId', label: 'Beneficiário do Atendimento', type: 'beneficiary', required: true },
    { id: 'nomeCompleto', label: 'Nome completo', type: 'text', disabled: true, placeholder: 'Selecione um beneficiário' },
    { id: 'cpf', label: 'CPF', type: 'text', disabled: true, placeholder: 'Selecione um beneficiário' },
    { id: 'dataNascimento', label: 'Data de nascimento', type: 'date', disabled: true },
    { id: 'matricula', label: 'Matrícula', type: 'text', disabled: true, placeholder: 'Selecione um beneficiário' },
  ]

  if (includeRamo) {
    fields.push({ id: 'ramo', label: 'Ramo', type: 'text', disabled: true, placeholder: 'Selecione um beneficiário' })
  }

  fields.push(
    { id: 'telefone', label: 'Telefone do beneficiário', type: 'text', required: true, format: 'phone', placeholder: '(00) 00000-0000' },
    { id: 'email', label: 'E-mail', type: 'text', disabled: true, columnSpan: includeRamo ? 2 : undefined, placeholder: 'Selecione um beneficiário' },
    {
      id: 'localAtendimento',
      label: localidadeLabel,
      type: 'text',
      required: true,
      disabled: localidadeTravada,
      columnSpan: 2,
      placeholder: localidadeTravada ? 'Selecione um beneficiário' : `Digite a ${localidadeLabel.toLowerCase()}`,
    },
  )

  return {
    id: 'identificacao',
    title: 'Identificação',
    fields,
  }
}

// Formulários de autorização: dados de contato do(a) titular, travados (exceto o telefone),
// exibidos logo abaixo do título — independente de qual beneficiário está sendo atendido.
function dadosParaContatoSection(): ServiceFormSection {
  const titular = beneficiaries.find((beneficiary) => beneficiary.relation === 'Titular')
  return {
    id: 'dados-contato',
    title: 'Dados para Contato',
    fields: [
      { id: 'contatoTitularNome', label: 'Titular', type: 'text', disabled: true, columnSpan: 3, defaultValue: titular?.name },
      { id: 'contatoTitularMatricula', label: 'Matrícula', type: 'text', disabled: true, defaultValue: titular?.matricula },
      { id: 'contatoTitularEmail', label: 'E-mail', type: 'text', disabled: true, defaultValue: titular?.email },
      { id: 'contatoTitularRamo', label: 'Ramo', type: 'text', disabled: true, defaultValue: titular?.ramo },
      { id: 'contatoTitularTelefone', label: 'Telefone', type: 'text', required: true, format: 'phone', columnSpan: 2, defaultValue: titular?.telefone, placeholder: '(00) 00000-0000' },
    ],
  }
}

// Formulários de autorização de tratamento: dados do prestador que realizará o procedimento,
// exibidos logo abaixo do card de avisos da seção de pedido/detalhes.
const PRESTADOR_FIELDS: ServiceField[] = [
  { id: 'dataPrevista', label: 'Data prevista', type: 'date' },
  { id: 'nomePrestador', label: 'Nome Prestador', type: 'text', required: true, columnSpan: 2, placeholder: 'Nome completo do prestador' },
  { id: 'telefonePrestador', label: 'Telefone Prestador', type: 'text', format: 'phone', placeholder: '(00) 00000-0000' },
  { id: 'cpfCnpjPrestador', label: 'CPF/CNPJ Prestador', type: 'text', format: 'cpfCnpj', columnSpan: 2, placeholder: '000.000.000-00 ou 00.000.000/0000-00' },
]

function detailsSection(): ServiceFormSection {
  return {
    id: 'detalhes',
    title: 'Descrição e anexos',
    fields: [
      { id: 'descricao', label: 'Descrição', type: 'textarea', fullWidth: true, placeholder: 'Inclua informações que ajudem na análise da solicitação' },
      {
        id: 'anexos',
        label: 'Anexos',
        type: 'file',
        fullWidth: true,
        helpText: 'Arraste arquivos ou selecione no computador (PDF, JPG ou PNG até 10 MB).',
      },
    ],
  }
}

function baseSchema(slug: string, title: string, extraSections: ServiceFormSection[] = [], localidadeLabel?: string, includeRamo: boolean = false): ServiceFormSchema {
  return {
    slug,
    title,
    sections: [identificationSection(localidadeLabel, includeRamo), ...extraSections, detailsSection()],
  }
}

function authorizationSchema(slug: string, title: string, documents: Array<{ id: string, label: string, required?: boolean }>, localidadeLabel?: string, comDadosContato: boolean = false, comDadosPrestador: boolean = false): ServiceFormSchema {
  const sections: ServiceFormSection[] = [
    identificationSection(localidadeLabel),
    {
      id: 'detalhes',
      title: 'Informações do pedido',
      fields: [
        ...(comDadosPrestador ? PRESTADOR_FIELDS : []),
        { id: 'descricao', label: 'Descrição', type: 'textarea', fullWidth: true, placeholder: 'Inclua informações que ajudem na análise da solicitação' },
      ],
    },
    {
      id: 'documentos',
      title: 'Documentos',
      fields: documents.map((document) => ({ ...document, type: 'file', fullWidth: true, helpText: 'Selecione um ou mais arquivos em PDF, JPG ou PNG, com até 10 MB cada.' })),
    },
  ]
  return {
    slug,
    title,
    sections: comDadosContato ? [dadosParaContatoSection(), ...sections] : sections,
  }
}

// Alguns formulários já têm campo(s) de e-mail próprio (com finalidade específica, distinta da
// identificação genérica) — nesses casos o campo "E-mail" compartilhado ficaria duplicado na tela.
function withoutGenericEmail(schema: ServiceFormSchema): ServiceFormSchema {
  return {
    ...schema,
    sections: schema.sections.map((section) => (
      section.id === 'identificacao'
        ? { ...section, fields: section.fields.filter((field) => field.id !== 'email') }
        : section
    )),
  }
}

function withSectionTitle(schema: ServiceFormSchema, sectionId: string, title: string): ServiceFormSchema {
  return {
    ...schema,
    sections: schema.sections.map((section) => (section.id === sectionId ? { ...section, title } : section)),
  }
}

const SEXO_OPTIONS = ['Masculino', 'Feminino']
const UF_OPTIONS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
]

const SIMPLE_SERVICES: { slug: string, title: string }[] = [
  { slug: 'acesso-sistemas-integrados', title: 'Acesso a sistemas institucionais integrados' },
  { slug: 'reingresso-reativacao', title: 'Reingresso / reativação' },
  { slug: 'cadastro-duvidas-informacoes', title: 'Cadastro - dúvidas, informações e esclarecimentos' },
  { slug: 'reembolso-duvidas', title: 'Reembolso (dúvidas, informações e esclarecimentos)' },
  { slug: 'recurso-reembolso', title: 'Recurso de reembolso - livre escolha' },
  { slug: 'autorizacao-cirurgia', title: 'Autorização de cirurgia eletiva' },
  { slug: 'psicologia', title: 'Psicologia' },
  { slug: 'fonoaudiologia', title: 'Fonoaudiologia' },
  { slug: 'terapia-ocupacional', title: 'Terapia ocupacional' },
  { slug: 'fisioterapia', title: 'Fisioterapia' },
  { slug: 'acupuntura', title: 'Acupuntura' },
  { slug: 'pilates', title: 'Pilates' },
  { slug: 'rpg', title: 'RPG' },
  { slug: 'hidroterapia', title: 'Hidroterapia' },
  { slug: 'abertura-solicitacoes-administrativas', title: 'Abertura de solicitações administrativas' },
  { slug: 'autorizacao-exame', title: 'Autorização de exame' },
  { slug: 'autorizacao-procedimentos', title: 'Autorização (dúvidas, informações e esclarecimentos)' },
  { slug: 'auxilio-duvidas-informacoes', title: 'Auxílio (dúvidas, informações e esclarecimentos)' },
  { slug: 'carteirinha-virtual', title: 'Carteirinha virtual' },
  { slug: 'atualizacao-cadastral-periodica', title: 'Atualização cadastral periódica' },
  { slug: 'cobertura-duvidas', title: 'Cobertura (dúvidas, informações e esclarecimentos)' },
  { slug: 'inclusao-ampliacao-cobertura', title: 'Inclusão / ampliação do rol de cobertura' },
  { slug: 'autorizacao-portais-unimed', title: 'Autorização portais Unimeds' },
  { slug: 'assistencia-domiciliar', title: 'Autorização de Assistência domiciliar' },
  { slug: 'tratamento-odontologico-duvidas', title: 'Tratamento odontológico (dúvidas, informações e esclarecimentos)' },
  { slug: 'auxilio-materiais-saude', title: 'Auxílio de materiais de saúde' },
  { slug: 'transporte-tratamento-fora-domicilio', title: 'Transporte de paciente em tratamento fora do domicílio' },
  { slug: 'despesas-saude-duvidas', title: 'Atendimento - despesas de saúde (dúvidas, informações e esclarecimentos)' },
  { slug: 'recurso-informacoes-financeiras', title: 'Recurso / contestação de informações financeiras' },
  { slug: 'acompanhamento-denuncia-reclamacao', title: 'Acompanhamento de registros de denúncia / reclamação' },
  { slug: 'atualizacao-site', title: 'Atualização do site' },
  { slug: 'site-app-duvidas', title: 'Site / app (dúvidas, informações e esclarecimentos)' },
  { slug: 'problemas-acesso-site-app', title: 'Problemas de acesso do site / app' },
  { slug: 'indisponibilidade-site-app', title: 'Indisponibilidade do site / app' },
  { slug: 'erro-funcionalidades-site-app', title: 'Ocorrência de erro em funcionalidades do site / app' },
]

const LOCALIDADE_PROCEDIMENTO_LABEL = 'Localidade do Procedimento'
// Grupo de terapias/autorizações: a planilha pede "Localidade do Procedimento" em vez do padrão
// "Localidade da Matrícula". Aplicado tanto aos slugs simples (baseSchema) quanto aos que têm
// documentos nomeados (authorizationSchema).
const SLUGS_LOCALIDADE_PROCEDIMENTO = new Set([
  'autorizacao-cirurgia', 'psicologia', 'fonoaudiologia', 'terapia-ocupacional', 'fisioterapia',
  'acupuntura', 'pilates', 'rpg', 'hidroterapia',
  'auxilio-aquisicao-medicamentos',
])

// Serviços da categoria Cadastro: a identificação exige a seleção do Ramo do MPU
// (CNMP, MPDFT, MPM, MPF ou MPT), conforme a planilha de formulários.
const SLUGS_CADASTRO_RAMO = new Set([
  'cadastro-duvidas-informacoes', 'carteirinha-virtual', 'atualizacao-cadastral-periodica',
  'abertura-solicitacoes-administrativas', 'reingresso-reativacao',
])

const atualizacaoDadosCadastrais = withoutGenericEmail(baseSchema('atualizacao-dados-cadastrais', 'Atualização de dados cadastrais', [
  {
    id: 'dados-contato',
    title: 'Dados do beneficiário',
    fields: [
      { id: 'localidade', label: 'Localidade', type: 'text', placeholder: 'Ex.: Brasília/DF' },
      { id: 'nomeSocial', label: 'Nome social', type: 'text', placeholder: 'Se houver, informe o nome social' },
      { id: 'sexo', label: 'Sexo', type: 'select', options: SEXO_OPTIONS },
      { id: 'nomeMae', label: 'Nome da mãe', type: 'text', placeholder: 'Nome completo da mãe' },
      { id: 'nomePai', label: 'Nome do pai', type: 'text', placeholder: 'Nome completo do pai' },
      { id: 'emailInstitucional', label: 'E-mail institucional', type: 'text', format: 'email', placeholder: 'nome@mpu.mp.br' },
      { id: 'emailPessoal', label: 'E-mail pessoal', type: 'text', format: 'email', placeholder: 'nome@exemplo.com' },
      { id: 'telefone', label: 'Telefone', type: 'text', format: 'phone', placeholder: '(00) 00000-0000' },
      { id: 'cartao', label: 'Cartão', type: 'text', placeholder: 'Número do cartão' },
      { id: 'estadoLotacao', label: 'Estado de lotação', type: 'combobox', options: UF_OPTIONS, placeholder: 'Digite ou selecione a UF' },
      { id: 'endereco', label: 'Endereço', type: 'text', fullWidth: true, placeholder: 'Rua, número, complemento, bairro, cidade/UF' },
    ],
  },
  {
    id: 'dados-bancarios',
    title: 'Dados bancários',
    fields: [
      {
        id: 'avisoDadosBancarios',
        label: 'Os dados bancários são geridos pelas áreas internas do MPF e, por hora, não são passíveis de atualização pelo beneficiário.',
        type: 'note',
        fullWidth: true,
      },
      { id: 'banco', label: 'Banco', type: 'text', disabled: true, placeholder: 'Selecione um beneficiário' },
      { id: 'agencia', label: 'Agência', type: 'text', disabled: true, placeholder: 'Selecione um beneficiário' },
      { id: 'contaCorrente', label: 'Conta corrente ou mista', type: 'text', disabled: true, placeholder: 'Selecione um beneficiário' },
    ],
  },
], undefined, true))

const emissaoCarteiraTemporaria = withoutGenericEmail(baseSchema('emissao-carteira-temporaria', 'Emissão de carteira temporária', [
  {
    id: 'contato',
    title: 'Contato',
    fields: [
      { id: 'emailCarteiraTemp', label: 'E-mail', type: 'text', required: true, format: 'email', placeholder: 'nome@exemplo.com' },
    ],
  },
], undefined, true))

const emissaoDocumentos = baseSchema('emissao-documentos', 'Emissão de documentos e comprovantes', [], undefined, true)

const acompanhamentoProtocolos = baseSchema('acompanhamento-protocolos', 'Acompanhamento de protocolos e processos', [
  {
    id: 'protocolo',
    title: 'Protocolo ou processo',
    fields: [
      {
        id: 'numeroProtocolo',
        label: 'Nº do protocolo ou processo único (Sistema Administrativo do MPF)',
        type: 'text',
        required: true,
        fullWidth: true,
        placeholder: 'Ex.: 00000.000000/0000-00',
      },
    ],
  },
], undefined, true)

const alteracaoEndereco = baseSchema('alteracao-de-endereco', 'Alteração de endereço', [
  {
    id: 'novo-endereco',
    title: 'Novo endereço',
    fields: [
      { id: 'cep', label: 'CEP', type: 'text', required: true, format: 'cep', placeholder: '00000-000' },
      { id: 'logradouro', label: 'Logradouro', type: 'text', required: true, fullWidth: true, placeholder: 'Rua, avenida...' },
      { id: 'numero', label: 'Número', type: 'text', required: true, placeholder: 'Número' },
      { id: 'complemento', label: 'Complemento', type: 'text', placeholder: 'Apto, bloco, casa (opcional)' },
      { id: 'bairro', label: 'Bairro', type: 'text', required: true, placeholder: 'Nome do bairro' },
      { id: 'cidade', label: 'Cidade', type: 'text', required: true, placeholder: 'Nome da cidade' },
      { id: 'uf', label: 'UF', type: 'combobox', required: true, options: UF_OPTIONS, placeholder: 'Digite ou selecione a UF' },
      { id: 'comprovanteEndereco', label: 'Comprovante de endereço', type: 'file', required: true, fullWidth: true, helpText: 'Anexe um comprovante de endereço em PDF, JPG ou PNG, com até 10 MB.' },
    ],
  },
])

const ASSUNTO_OUTRAS_SOLICITACOES_OPTIONS = [
  'Autorização',
  'Auxílio',
  'Benefício',
  'Cadastro',
  'Cobertura',
  'Financeiro',
  'Odontológico',
  'Reembolso',
  'Site / APP',
]

const outrasSolicitacoes = baseSchema('outras-solicitacoes', 'Outras solicitações', [
  {
    id: 'assunto',
    title: 'Assunto',
    fields: [
      { id: 'assuntoOutrasSolicitacoes', label: 'Assunto', type: 'select', required: true, fullWidth: true, options: ASSUNTO_OUTRAS_SOLICITACOES_OPTIONS },
    ],
  },
], undefined, true)

const SITUACAO_FUNCIONAL_OPTIONS = ['Membro', 'Quadro', 'Requisitado', 'Contratado', 'Cedido', 'Pensionista Vitalício', 'Pensionista Filho']
const DEPENDENTE_TIPO_OPTIONS = [
  'Cônjuge',
  'Companheiro (a)',
  'Pai, Mãe, Padrasto ou Madrasta',
  'Filho ou enteado até 21 anos',
  'Filho/enteado estudante (21 a 24 anos)',
  'Pessoa sob guarda ou tutela (até 18 anos), dependente perante a legislação tributária',
]
const BENEFICIARIO_ESPECIAL_TIPO_OPTIONS = [
  'Filhos e enteados entre 21 e 38 anos, desde que solteiros',
  'Pessoas solteiras, sem rendimentos, entre 18 e 21 anos (ex-guardado ou ex-tutelado)',
  'Pessoas solteiras, sem rendimentos, entre 21 e 24 anos (ex-guardado ou ex-tutelado) e estudantes',
  'Ex-cônjuge ou ex-companheiro(a) mediante decisão judicial ou escritura pública',
  'Pais não dependentes econômicos, inscritos há pelo menos 5 anos',
]

const titularInscricaoAdesao = beneficiaries.find((beneficiary) => beneficiary.relation === 'Titular')

const inscricaoAdesao = baseSchema('inscricao-adesao', 'Inscrição / adesão', [
  {
    id: 'tipo-beneficiario',
    fields: [
      {
        id: 'tipoBeneficiario',
        label: 'Tipo de beneficiário',
        type: 'select',
        required: true,
        fullWidth: true,
        options: ['Titular', 'Dependente', 'Beneficiário Especial'],
      },
    ],
  },
  {
    id: 'inscricao-titular-pessoais',
    title: 'Dados pessoais',
    showIf: { fieldId: 'tipoBeneficiario', equals: 'Titular' },
    columns: 3,
    fields: [
      { id: 'titularNome', label: 'Nome completo', type: 'text', required: true, placeholder: 'Nome completo do titular' },
      { id: 'titularMatricula', label: 'Matrícula', type: 'text', required: true, placeholder: 'Número da matrícula' },
      { id: 'titularNomeSocial', label: 'Nome social', type: 'text', placeholder: 'Se houver', infoText: 'Conforme Portaria PGR/MPU nº 7/2018' },
      { id: 'titularSituacaoFuncional', label: 'Situação funcional', type: 'select', options: SITUACAO_FUNCIONAL_OPTIONS },
      { id: 'titularAtividade', label: 'Atividade', type: 'select', options: ['Ativo', 'Inativo'] },
      { id: 'titularSexo', label: 'Sexo', type: 'select', options: SEXO_OPTIONS },
      { id: 'titularEstadoCivil', label: 'Estado civil', type: 'text', placeholder: 'Ex.: Solteiro(a), Casado(a)' },
      { id: 'titularNacionalidade', label: 'Nacionalidade', type: 'text', placeholder: 'Ex.: Brasileira' },
      { id: 'titularNaturalidade', label: 'Naturalidade', type: 'text', placeholder: 'Cidade de nascimento' },
      { id: 'titularUf', label: 'UF', type: 'combobox', options: UF_OPTIONS, placeholder: 'Digite ou selecione a UF' },
      { id: 'titularIdentidade', label: 'Identidade', type: 'text', placeholder: 'Número do RG' },
      { id: 'titularOrgaoEmissor', label: 'Órgão emissor', type: 'text', placeholder: 'Ex.: SSP/UF' },
      { id: 'titularFiliacao1', label: 'Filiação 1', type: 'text', placeholder: 'Digite o nome do(a) responsável' },
      { id: 'titularFiliacao2', label: 'Filiação 2', type: 'text', placeholder: 'Digite o nome do(a) responsável', infoText: 'Preferencialmente o nome da mãe' },
      { id: 'titularLotacao', label: 'Lotação', type: 'text', placeholder: 'Setor ou unidade de lotação' },
    ],
  },
  {
    id: 'inscricao-titular-endereco',
    title: 'Endereço',
    showIf: { fieldId: 'tipoBeneficiario', equals: 'Titular' },
    columns: 3,
    fields: [
      { id: 'titularCep', label: 'CEP', type: 'text', format: 'cep', placeholder: '00000-000', infoText: 'Ao digitar o CEP, o endereço é preenchido automaticamente' },
      { id: 'titularEndereco', label: 'Endereço', type: 'text', fullWidth: true, placeholder: 'Rua, número, complemento' },
      { id: 'titularBairro', label: 'Bairro', type: 'text', placeholder: 'Nome do bairro' },
      { id: 'titularCidade', label: 'Cidade', type: 'text', placeholder: 'Nome da cidade' },
      { id: 'titularUfCidade', label: 'UF (cidade)', type: 'combobox', options: UF_OPTIONS, placeholder: 'Digite ou selecione a UF' },
    ],
  },
  {
    id: 'inscricao-titular-contato',
    title: 'Contato',
    showIf: { fieldId: 'tipoBeneficiario', equals: 'Titular' },
    columns: 3,
    fields: [
      { id: 'titularTelefoneResidencial', label: 'Telefone residencial', type: 'text', format: 'phone', placeholder: '(00) 0000-0000' },
      { id: 'titularTelefoneCelular', label: 'Telefone celular', type: 'text', format: 'phone', placeholder: '(00) 00000-0000' },
      { id: 'titularTelefoneComercial', label: 'Telefone comercial', type: 'text', format: 'phone', placeholder: '(00) 0000-0000' },
      { id: 'titularEmail', label: 'Endereço eletrônico (e-mail)', type: 'text', format: 'email', placeholder: 'nome@exemplo.com' },
    ],
  },
  {
    id: 'inscricao-titular-bancarios',
    title: 'Dados bancários',
    showIf: { fieldId: 'tipoBeneficiario', equals: 'Titular' },
    columns: 3,
    fields: [
      { id: 'titularBanco', label: 'Banco', type: 'text', placeholder: 'Ex.: Banco do Brasil' },
      { id: 'titularAgencia', label: 'Agência', type: 'text', placeholder: 'Número da agência' },
      { id: 'titularContaCorrente', label: 'Conta corrente', type: 'text', placeholder: 'Número da conta' },
    ],
  },
  {
    id: 'inscricao-dependente',
    title: 'Inscrição de dependente',
    showIf: { fieldId: 'tipoBeneficiario', equals: 'Dependente' },
    columns: 3,
    fields: [
      { id: 'dependenteTitularNome', label: 'Nome completo do(a) titular', type: 'text', disabled: true, defaultValue: titularInscricaoAdesao?.name },
      { id: 'dependenteTitularMatricula', label: 'Matrícula', type: 'text', disabled: true, defaultValue: titularInscricaoAdesao?.matricula },
      { id: 'dependenteNome', label: 'Nome do dependente', type: 'text', required: true, placeholder: 'Nome completo do dependente' },
      { id: 'dependenteNomeSocial', label: 'Nome social', type: 'text', placeholder: 'Se houver', infoText: 'Conforme Portaria PGR/MPU nº 7/2018' },
      { id: 'dependenteTipo', label: 'Tipo de dependência', type: 'select', required: true, options: DEPENDENTE_TIPO_OPTIONS },
      { id: 'dependenteSexo', label: 'Sexo', type: 'select', options: SEXO_OPTIONS },
      { id: 'dependenteNaturalidade', label: 'Naturalidade', type: 'text', placeholder: 'Cidade de nascimento' },
      { id: 'dependenteEstadoCivil', label: 'Estado civil', type: 'text', placeholder: 'Ex.: Solteiro(a), Casado(a)' },
      { id: 'dependenteIdentidade', label: 'Identidade', type: 'text', placeholder: 'Número do RG' },
      { id: 'dependenteOrgaoEmissorUf', label: 'Órgão emissor / UF', type: 'text', placeholder: 'Ex.: SSP/UF' },
      { id: 'dependenteFiliacao1', label: 'Filiação 1', type: 'text', placeholder: 'Digite o nome do(a) responsável' },
      { id: 'dependenteFiliacao2', label: 'Filiação 2', type: 'text', placeholder: 'Digite o nome do(a) responsável', infoText: 'Preferencialmente o nome da mãe' },
    ],
  },
  {
    id: 'inscricao-beneficiario-especial',
    title: 'Beneficiário especial',
    showIf: { fieldId: 'tipoBeneficiario', equals: 'Beneficiário Especial' },
    columns: 3,
    fields: [
      { id: 'especialTitularNome', label: 'Nome completo do(a) titular', type: 'text', disabled: true, defaultValue: titularInscricaoAdesao?.name },
      { id: 'especialTitularMatricula', label: 'Matrícula', type: 'text', disabled: true, defaultValue: titularInscricaoAdesao?.matricula },
      { id: 'especialTitularEmailParticular', label: 'E-mail particular do(a) titular', type: 'text', format: 'email', placeholder: 'nome@exemplo.com' },
      { id: 'especialTitularCelular', label: 'Celular ou WhatsApp do(a) titular', type: 'text', format: 'phone', placeholder: '(00) 00000-0000' },
      { id: 'especialNome', label: 'Nome completo do beneficiário', type: 'text', required: true, placeholder: 'Nome completo do beneficiário especial' },
      { id: 'especialNomeSocial', label: 'Nome social', type: 'text', placeholder: 'Se houver', infoText: 'Conforme Portaria PGR/MPU nº 7/2018' },
      { id: 'especialTipo', label: 'Tipo de dependência', type: 'select', required: true, options: BENEFICIARIO_ESPECIAL_TIPO_OPTIONS },
      { id: 'especialDataNascimento', label: 'Data de nascimento', type: 'date' },
      { id: 'especialSexo', label: 'Sexo', type: 'select', options: SEXO_OPTIONS },
      { id: 'especialNaturalidade', label: 'Naturalidade', type: 'text', placeholder: 'Cidade de nascimento' },
      { id: 'especialEstadoCivil', label: 'Estado civil', type: 'text', placeholder: 'Ex.: Solteiro(a), Casado(a)' },
      { id: 'especialCpf', label: 'CPF', type: 'text', format: 'cpf', placeholder: '000.000.000-00' },
      { id: 'especialIdentidade', label: 'Identidade', type: 'text', placeholder: 'Número do RG' },
      { id: 'especialOrgaoEmissorUf', label: 'Órgão emissor / UF', type: 'text', placeholder: 'Ex.: SSP/UF' },
      { id: 'especialFiliacao1', label: 'Filiação 1', type: 'text', placeholder: 'Digite o nome do(a) responsável', infoText: 'Preferencialmente o nome da mãe' },
      { id: 'especialFiliacao2', label: 'Filiação 2', type: 'text', placeholder: 'Digite o nome do(a) responsável' },
    ],
  },
], undefined, true)

const desligamento = baseSchema('desligamento', 'Desligamento', [
  {
    id: 'tipo-desligamento',
    title: 'Tipo de desligamento',
    fields: [
      {
        id: 'tipoDesligamento',
        label: 'Desligamento',
        type: 'select',
        required: true,
        fullWidth: true,
        options: [
          'Titular e respectivos dependentes/beneficiários especiais',
          'Dependente(s) e/ou beneficiário(s) especial(is) específico(s)',
        ],
      },
    ],
  },
  {
    id: 'dependente-desligamento',
    title: 'Dependente ou beneficiário especial a desligar',
    showIf: { fieldId: 'tipoDesligamento', equals: 'Dependente(s) e/ou beneficiário(s) especial(is) específico(s)' },
    fields: [
      { id: 'nomeDependenteDesligar', label: 'Nome do dependente / beneficiário especial', type: 'text', required: true, placeholder: 'Nome completo' },
      { id: 'parentesco', label: 'Parentesco', type: 'text', required: true, placeholder: 'Ex.: Cônjuge, Filho(a)' },
    ],
  },
  {
    id: 'motivo-desligamento',
    title: 'Motivo do desligamento',
    fields: [
      {
        id: 'motivoDesligamento',
        label: 'Motivo do desligamento',
        type: 'select',
        required: true,
        fullWidth: true,
        options: ['Exoneração / Desligamento do MPU', 'Posse em outro Órgão da Administração Pública', 'Outros'],
      },
      {
        id: 'qualOrgao',
        label: 'Qual órgão?',
        type: 'text',
        required: true,
        fullWidth: true,
        placeholder: 'Nome do órgão',
        showIf: { fieldId: 'motivoDesligamento', equals: 'Posse em outro Órgão da Administração Pública' },
      },
      {
        id: 'identificarMotivo',
        label: 'Identifique o motivo',
        type: 'text',
        required: true,
        fullWidth: true,
        placeholder: 'Descreva o motivo',
        showIf: { fieldId: 'motivoDesligamento', equals: 'Outros' },
      },
      {
        id: 'declaracaoDesligamento',
        label: 'Declaração obrigatória',
        type: 'radio',
        required: true,
        fullWidth: true,
        options: [
          'Não se aplica (sem inscrição no Plan-Assiste, Remoção, Exercício Provisório, Lotação Provisória, Aposentadoria, Cessão ou outras situações sem perda de vínculo com MPU).',
          'Requeiro meu desligamento do Plan-Assiste e declaro ter conhecimento do Regulamento Geral e das Normas do Programa de saúde. Eventuais débitos e saldo devedor de coparticipação com o Plan-Assiste, provenientes de procedimentos de saúde realizados por mim, incluindo os relacionados aos meus dependentes e aos meus beneficiários especiais, após apuração regular de seus valores financeiros, serão compensados pela área de Gestão de Pessoas com os créditos que eu tenha direito tais como subsídios, vencimentos e outras vantagens remuneratórias de qualquer natureza, computados auxílios, gratificações natalinas, indenizações de férias e seu adicional de 1/3, entre outros. Caso citada compensação não seja suficiente para assegurar a extinção integral do débito, a parcela remanescente junto ao Plan-Assiste será liquidada via transferência bancária ou boleto de pagamento para crédito na conta corrente do Plano. Desde já autorizo a emissão de cobrança contra minha pessoa de eventuais débitos futuros decorrentes de guias de atendimento não processadas até a presente data, mesmo que apresentadas pelos credenciados após meu desligamento.',
        ],
      },
      {
        id: 'cienciaCarencia',
        label:
          'Estou ciente que após o desligamento, titular e/ou dependente só poderão retornar ao Programa após 6 meses, contados da data de desligamento e mediante o cumprimento dos períodos de carência. Vide trecho da Norma Complementar n° 34/2023. § 5º O reingresso no Programa dos beneficiários elencados neste artigo somente será autorizado após transcorridos no mínimo seis meses da data do desligamento, aplicando-se os prazos de carência previstos no art. 12 do Regulamento Geral, observado o disposto no §2º do mesmo artigo.',
        type: 'checkbox',
        required: true,
        fullWidth: true,
      },
    ],
  },
], undefined, true)

const mudancaTipoBeneficiario = baseSchema('mudanca-tipo-beneficiario', 'Mudança de tipo de beneficiário', [
  {
    id: 'tipo-mudanca',
    title: 'Tipo de mudança',
    fields: [
      {
        id: 'tipoMudanca',
        label: 'Mudança para',
        type: 'select',
        required: true,
        fullWidth: true,
        options: ['Beneficiário Especial', 'Dependente'],
      },
    ],
  },
  {
    id: 'mudanca-beneficiario-especial',
    title: 'Dados do beneficiário especial',
    showIf: { fieldId: 'tipoMudanca', equals: 'Beneficiário Especial' },
    fields: [
      { id: 'mudancaEspecialTitularEmailParticular', label: 'E-mail particular do(a) titular', type: 'text', format: 'email', placeholder: 'nome@exemplo.com' },
      { id: 'mudancaEspecialTitularCelular', label: 'Celular ou WhatsApp do(a) titular (com DDD)', type: 'text', format: 'phone', placeholder: '(00) 00000-0000' },
      { id: 'mudancaEspecialNome', label: 'Nome completo do beneficiário', type: 'text', required: true, placeholder: 'Nome completo do beneficiário especial' },
      { id: 'mudancaEspecialNomeSocial', label: 'Nome social', type: 'text', placeholder: 'Se houver', infoText: 'Conforme Portaria PGR/MPU nº 7/2018' },
      { id: 'mudancaEspecialTipo', label: 'Tipo de dependência', type: 'select', required: true, options: BENEFICIARIO_ESPECIAL_TIPO_OPTIONS },
      { id: 'mudancaEspecialDataNascimento', label: 'Data de nascimento', type: 'date' },
      { id: 'mudancaEspecialSexo', label: 'Sexo', type: 'select', options: SEXO_OPTIONS },
      { id: 'mudancaEspecialNaturalidade', label: 'Naturalidade', type: 'text', placeholder: 'Cidade de nascimento' },
      { id: 'mudancaEspecialEstadoCivil', label: 'Estado civil', type: 'text', placeholder: 'Ex.: Solteiro(a), Casado(a)' },
      { id: 'mudancaEspecialCpf', label: 'CPF', type: 'text', required: true, format: 'cpf', placeholder: '000.000.000-00' },
      { id: 'mudancaEspecialIdentidade', label: 'Identidade', type: 'text', placeholder: 'Número do RG' },
      { id: 'mudancaEspecialOrgaoEmissorUf', label: 'Órgão emissor / UF', type: 'text', placeholder: 'Ex.: SSP/UF' },
      { id: 'mudancaEspecialFiliacao1', label: 'Filiação 1', type: 'text', placeholder: 'Nome da mãe', infoText: 'Preferencialmente o nome da mãe' },
      { id: 'mudancaEspecialFiliacao2', label: 'Filiação 2', type: 'text', placeholder: 'Nome do pai ou responsável' },
      {
        id: 'mudancaEspecialDocumentosNota',
        label: 'Documentos exigidos: declaração de estado civil, documento de identificação do beneficiário especial, CPF e comprovantes complementares conforme a condição do beneficiário.',
        type: 'note',
        fullWidth: true,
      },
      {
        id: 'mudancaEspecialDeclaracao',
        label:
          'Pelo presente, declaro ciência que deverei comunicar de imediato a este Plan-Assiste a ocorrência dos seguintes fatos que determinam a exclusão do(s) beneficiário(s) indicados: óbito ou alteração de estado civil. Devo, inclusive, enviar assinado, por força de norma, o Requerimento de Desligamento previsto no Anexo IV da Norma Complementar nº 34/2023. Tenho ciência que, além da comunicação imediata, a utilização considerada indevida ou de situação cadastral irregular conforme normativos deste Plan-Assiste afastam a incidência dos percentuais de coparticipação do beneficiário, previstos no Anexo V da Norma Complementar nº 34/2023, devendo assim a despesa de coparticipação ser integralmente cobrada deste(a) Titular. A tabela de contribuições devida mensalmente de cada beneficiário(a) acima é a do Anexo VI da Norma Complementar nº 34/2023. Estou ciente que a falta de cumprimento do compromisso ora assumido sujeitar-me-á às penalidades previstas no Regulamento Geral deste Plan-Assiste.',
        type: 'checkbox',
        required: true,
        fullWidth: true,
      },
    ],
  },
  {
    id: 'mudanca-dependente',
    title: 'Dados do dependente e do titular',
    showIf: { fieldId: 'tipoMudanca', equals: 'Dependente' },
    fields: [
      { id: 'mudancaDependenteTitularLotacao', label: 'Lotação do(a) titular', type: 'text', placeholder: 'Setor ou unidade de lotação' },
      { id: 'mudancaDependenteNome', label: 'Nome do beneficiário especial', type: 'text', required: true, placeholder: 'Nome completo' },
      { id: 'mudancaDependenteParentesco', label: 'Parentesco', type: 'text', required: true, placeholder: 'Ex.: Cônjuge, Filho(a)' },
      { id: 'mudancaDependenteDataNascimento', label: 'Data de nascimento', type: 'date' },
      { id: 'mudancaDependenteCpf', label: 'CPF', type: 'text', format: 'cpf', placeholder: '000.000.000-00' },
      { id: 'mudancaDependenteNomeMae', label: 'Nome da mãe', type: 'text', placeholder: 'Nome completo da mãe' },
    ],
  },
], undefined, true)

const processoAposentadoriaRetorno = withoutGenericEmail(baseSchema('processo-aposentadoria-retorno-orgao', 'Início de processo de aposentadoria / retorno ao órgão de origem', [
  {
    id: 'dados-funcionais',
    title: 'Dados funcionais',
    fields: [
      { id: 'cargoEfetivo', label: 'Cargo efetivo', type: 'text', required: true, placeholder: 'Ex.: Analista Judiciário' },
      { id: 'lotacao', label: 'Lotação', type: 'text', required: true, placeholder: 'Setor ou unidade de lotação' },
      { id: 'enderecoResidencial', label: 'Endereço residencial (com CEP)', type: 'text', required: true, fullWidth: true, placeholder: 'Rua, número, bairro, cidade/UF e CEP' },
      { id: 'localidadeMatricula', label: 'Localidade da matrícula', type: 'text', required: true, placeholder: 'Ex.: Brasília/DF' },
      { id: 'telefoneWhatsapp', label: 'Telefone / WhatsApp (com DDD)', type: 'text', required: true, format: 'phone', placeholder: '(00) 00000-0000' },
      { id: 'emailParticular', label: 'E-mail particular', type: 'text', required: true, format: 'email', placeholder: 'nome@exemplo.com' },
    ],
  },
  {
    id: 'tipo-solicitacao',
    title: 'Tipo de solicitação',
    fields: [
      {
        id: 'tipoSolicitacaoAposentadoria',
        label: 'Solicitação',
        type: 'select',
        required: true,
        fullWidth: true,
        options: ['Início do Processo de Aposentadoria', 'Retorno ao Órgão de Origem'],
      },
    ],
  },
  {
    id: 'declaracoes-inicio-aposentadoria',
    title: 'Declarações',
    showIf: { fieldId: 'tipoSolicitacaoAposentadoria', equals: 'Início do Processo de Aposentadoria' },
    fields: [
      {
        id: 'cienciaCoparticipacao',
        label: 'Estou ciente que as contribuições mensais quanto às cobranças de coparticipação, se houver, deverão continuar sendo cobradas normalmente em meu contracheque.',
        type: 'checkbox',
        required: true,
        fullWidth: true,
      },
      {
        id: 'cienciaPermanenciaPlano',
        label: 'Estou ciente que, manifestando o interesse em permanecer no plano, será realizado o pagamento por depósito identificado ao Plan-Assiste (mensalidade + coparticipação), e devo apresentar a autorização de desconto em folha de pagamento fornecida pelo órgão de origem (União).',
        type: 'checkbox',
        required: true,
        fullWidth: true,
      },
    ],
  },
], undefined, true))

const OPCAO_ENQUADRAMENTO_DEPENDENTE_ECONOMICO = 'Opção 1 - Pais Dependentes Econômicos (com fundamento no Requerimento de Atualização Cadastral - Dependência Econômica dos Pais, NC nº 34).'
const OPCAO_ENQUADRAMENTO_NAO_DEPENDENTE_ECONOMICO = 'Opção 2 - Pais Não Dependentes Econômicos (com fundamento na Ficha de Inscrição de Beneficiários Especiais e Opção de Pais Não Dependentes Econômicos, NC nº 34/2023).'

const paisDependentes: ServiceFormSchema = {
  slug: 'pais-dependentes',
  title: 'Pais Dependentes (Econômicos ou não)',
  sections: [
    {
      id: 'nota-legal',
      title: 'Pais Dependentes (Econômicos ou não)',
      fields: [
        {
          id: 'notaLegalPaisDependentes',
          label: 'A inscrição de novos pais como beneficiários está vedada desde 2020, conforme Art. 2º, § 8º, da Norma Complementar nº 34. Este documento destina-se exclusivamente a pais já inscritos no Plan-Assiste que necessitem atualizar sua condição de dependência econômica perante o Programa.',
          type: 'note',
          fullWidth: true,
        },
      ],
    },
    {
      id: 'identificacao-titular',
      title: 'Identificação do titular',
      fields: [
        { id: 'nomeTitular', label: 'Nome do titular', type: 'text', disabled: true, fullWidth: true, defaultValue: 'Ana Maria de Araújo' },
        { id: 'matriculaTitular', label: 'Matrícula', type: 'text', disabled: true, defaultValue: '30003387' },
        { id: 'cpfTitular', label: 'CPF', type: 'text', disabled: true, defaultValue: '123.456.789-00' },
        { id: 'ramoTitular', label: 'Ramo', type: 'text', disabled: true, defaultValue: 'MPF' },
        { id: 'enderecoAtualTitular', label: 'Endereço atual (com CEP)', type: 'text', disabled: true, fullWidth: true, defaultValue: 'SQS 205, Bloco B, Apartamento 302, Asa Sul, Brasília/DF, 70000-000' },
        { id: 'emailParticularTitular', label: 'E-mail particular', type: 'text', required: true, format: 'email', placeholder: 'nome@exemplo.com' },
        { id: 'celularTitular', label: 'Celular/WhatsApp (DDD)', type: 'text', required: true, format: 'phone', placeholder: '(00) 00000-0000' },
      ],
    },
    {
      id: 'opcao-enquadramento',
      title: 'Opção de enquadramento dos pais',
      fields: [
        {
          id: 'opcaoEnquadramento',
          label: 'O titular abaixo assinado opta pelo seguinte enquadramento de seu(s) pai(s)/mãe(s) já inscrito(s) no Plan-Assiste MPU, para fins de atualização cadastral e definição do valor da contribuição mensal:',
          type: 'radio',
          required: true,
          fullWidth: true,
          options: [OPCAO_ENQUADRAMENTO_DEPENDENTE_ECONOMICO, OPCAO_ENQUADRAMENTO_NAO_DEPENDENTE_ECONOMICO],
        },
        {
          id: 'declaracaoOpcaoDependenteEconomico',
          label: 'Declaro que o(s) beneficiário(s) abaixo identificado(s) voltou(voltaram) à condição de meu(s) dependente(s) na minha Declaração de Imposto de Renda do exercício atual, e solicito o retorno da contribuição mensal para o valor da cobrança por faixa etária, excluindo o acréscimo de 50% aplicável apenas para os pais não dependentes econômicos, nos termos do art. 4º, parágrafo único, da Norma Complementar nº 34.',
          type: 'checkbox',
          required: true,
          fullWidth: true,
          showIf: { fieldId: 'opcaoEnquadramento', equals: OPCAO_ENQUADRAMENTO_DEPENDENTE_ECONOMICO },
        },
        {
          id: 'declaracaoOpcaoNaoDependenteEconomico',
          label: 'Declaro que o(s) beneficiário(s) abaixo identificado(s) é (são) pai(s)/mãe(s) não dependente(s) econômico(s), inscrito(s) há pelo menos 5 (cinco) anos no Plan-Assiste, que perdeu (perderam) a condição de dependência junto à minha Declaração de Imposto de Renda, aplicando-se o acréscimo de 50% (cinquenta por cento) sobre a contribuição mensal, conforme normativa vigente.',
          type: 'checkbox',
          required: true,
          fullWidth: true,
          showIf: { fieldId: 'opcaoEnquadramento', equals: OPCAO_ENQUADRAMENTO_NAO_DEPENDENTE_ECONOMICO },
        },
      ],
    },
    {
      id: 'identificacao-beneficiarios',
      title: 'Identificação do(s) beneficiário(s) pai(s) / mãe(s)',
      fields: [
        { id: 'beneficiario1Nome', label: 'Beneficiário 1 - Nome completo', type: 'text', required: true, fullWidth: true, placeholder: 'Nome completo do pai/mãe' },
        { id: 'beneficiario2Nome', label: 'Beneficiário 2 (se houver) - Nome completo', type: 'text', fullWidth: true, placeholder: 'Nome completo do pai/mãe (se houver)' },
      ],
    },
    {
      id: 'ciencia-declaracoes',
      title: 'Ciência e declarações do titular',
      fields: [
        {
          id: 'declaracao41',
          label: '4.1. Estou ciente sobre a obrigatoriedade de encaminhar, até 30 de junho de cada ano, a Declaração de Imposto de Renda do titular em que inclua(m) como dependente(s) o(s) nome(s) do(s) beneficiário(s) pais para fins da comprovação de dependência econômica, prevista no inciso III do art. 3º da Norma Complementar nº 34.',
          type: 'checkbox',
          required: true,
          fullWidth: true,
        },
        {
          id: 'declaracao42',
          label: '4.2. Declaro estar ciente de que a omissão de informações ou falsidade documental implicará nas sanções administrativas e legais cabíveis. Comprometo-me a informar qualquer alteração na condição de dependência no prazo estabelecido pela norma.',
          type: 'checkbox',
          required: true,
          fullWidth: true,
        },
        {
          id: 'declaracao43',
          label: '4.3. Declaro ciência de que deverei comunicar de imediato a este Plan-Assiste a ocorrência dos seguintes fatos que determinam a exclusão do(s) beneficiário(s) indicados: óbitos ou alteração de estado civil, devendo, inclusive, enviar assinado o Requerimento de Desligamento previsto no Anexo IV da Norma Complementar nº 34/2023.',
          type: 'checkbox',
          required: true,
          fullWidth: true,
        },
        {
          id: 'declaracao44',
          label: '4.4. Tenho ciência de que, além da comunicação imediata, a utilização considerada indevida ou de situação cadastral irregular conforme normativos deste Plan-Assiste afasta a incidência dos percentuais de coparticipação do beneficiário, previstos no Anexo V da Norma Complementar nº 34/2023, devendo assim a despesa de coparticipação ser integralmente cobrada deste titular.',
          type: 'checkbox',
          required: true,
          fullWidth: true,
        },
        {
          id: 'declaracao45',
          label: '4.5. Tenho ciência de que a falta de cumprimento do compromisso ora assumido sujeitar-me-á às penalidades previstas no Regulamento Geral do Plan-Assiste.',
          type: 'checkbox',
          required: true,
          fullWidth: true,
        },
      ],
    },
    detailsSection(),
  ],
}

// [PLACEHOLDER] Conteúdo provisório — substituir pelos documentos e casos reais do documento
// INSTRUÇÕES_PARA_ABERTURA_DE_TICKET_V2 assim que ele for compartilhado. Não usar em produção sem revisão.
const CASOS_ATUALIZACAO_DADOS_CADASTRAIS: CasoInstrucaoServico[] = [
  {
    id: 'titular',
    titulo: 'Titular',
    documentos: [
      { id: 'documentoIdentificacaoTitular', label: 'Documento de identificação do titular', obrigatorio: true },
    ],
  },
  {
    id: 'dependente',
    titulo: 'Dependente',
    documentos: [
      { id: 'documentoIdentificacaoDependente', label: 'Documento de identificação do dependente', obrigatorio: true },
      { id: 'comprovanteVinculoDependente', label: 'Comprovante de vínculo com o titular', obrigatorio: true },
    ],
  },
  {
    id: 'terceiro',
    titulo: 'Terceiro',
    documentos: [
      { id: 'procuracaoTerceiro', label: 'Procuração ou documento de representação', obrigatorio: true },
      { id: 'documentoIdentificacaoTerceiro', label: 'Documento de identificação do terceiro', obrigatorio: true },
    ],
  },
]

// [PLACEHOLDER] "Carteira do Plan-Assiste" não é uma opção aqui — essa emissão é feita direto
// pelo Portal/App, sem solicitação neste formulário (ver aviso "Antes de começar" no topo).
const CASOS_EMISSAO_DOCUMENTOS: CasoInstrucaoServico[] = [
  {
    id: 'carteira_unimed',
    titulo: 'Carteira Unimed',
    documentos: [
      { id: 'placeholderCarteiraUnimed', label: 'Documento exigido para emissão da carteira Unimed', obrigatorio: true },
    ],
  },
  {
    id: 'carteira_uniodonto',
    titulo: 'Carteira UniOdonto',
    documentos: [
      { id: 'placeholderCarteiraUniodonto', label: 'Documento exigido para emissão da carteira UniOdonto', obrigatorio: true },
    ],
  },
  {
    id: 'carta_permanencia',
    titulo: 'Carta de Permanência',
    documentos: [
      { id: 'placeholderCartaPermanencia', label: 'Documento exigido para emissão da carta de permanência', obrigatorio: true },
    ],
  },
  {
    id: 'documento_acerto_financeiro',
    titulo: 'Documento de Acerto Financeiro',
    documentos: [
      { id: 'placeholderDocAcertoFinanceiro', label: 'Documento exigido para o documento de acerto financeiro', obrigatorio: true },
    ],
  },
]

const AVISO_INICIAL_EMISSAO_DOCUMENTOS: AvisoInicialConfig = {
  titulo: 'Antes de começar',
  conteudo: 'É possível realizar a emissão da carteira do Plan-Assiste através do Portal e do Aplicativo do Plan-Assiste.',
}

const AVISO_INICIAL_ACUPUNTURA: AvisoInicialConfig = {
  titulo: 'Atenção',
  tone: 'informativo',
  posicao: 'apos-detalhes',
  conteudo: [
    'O processo de autorização de procedimentos eletivos poderá levar até 4 dias úteis para ser concluído.',
    'Após a autorização do procedimento solicitado, a guia de autorização será emitida pelo Plan-Assiste/MPU e encaminhada para o e-mail informado.',
    'Segundo estabelecido na Norma Complementar Nº 32, de 15/02/2023, o tratamento de acupuntura ficará limitado a 40 (quarenta) sessões por ano civil, realizadas por profissionais médicos habilitados, mediante indicação médica ou odontológica, restrito à sua área de atuação. Será exigida perícia quando o número de sessões semanais ultrapassar os limites estabelecidos em norma complementar.',
  ].join('\n\n'),
}

const AVISO_INICIAL_CIRURGIA_ELETIVA: AvisoInicialConfig = {
  titulo: 'Atenção',
  tone: 'informativo',
  posicao: 'apos-detalhes',
  conteudo: [
    'O processo de autorização de cirurgias eletivas poderá levar até 8 dias úteis para ser concluído.',
    'Após a autorização do procedimento solicitado, a guia de autorização do procedimento cirúrgico será emitida pelo Plan-Assiste/MPU e encaminhada para o e-mail informado. Esta deverá ser entregue ao hospital a ser realizado o procedimento, juntamente com o relatório médico, para as providências de cotação dos materiais, se for o caso, e agendamento da cirurgia.',
  ].join('\n\n'),
}

const AVISO_INICIAL_FISIOTERAPIA: AvisoInicialConfig = {
  titulo: 'Atenção',
  tone: 'informativo',
  posicao: 'apos-detalhes',
  conteudo: [
    'O processo de autorização de procedimentos eletivos poderá levar até 4 dias úteis para ser concluído.',
    'Após a autorização do procedimento solicitado, a guia de autorização será emitida pelo Plan-Assiste/MPU e encaminhada para o e-mail informado.',
    'Segundo estabelecido na Norma Complementar Nº 32, de 15/02/2023, será exigida perícia para autorização quando o número de sessões semanais ultrapassar 2 (duas) vezes na semana ou quando houver solicitação de 2 (dois) ou mais códigos no mesmo tratamento, e/ou 40 (quarenta) sessões por ano civil, e, ainda, em todos os casos de internação.',
    'Acima deste limite, deverão ser anexados, para avaliação pericial, laudos de exames e relatório do terapeuta, indicando a necessidade de continuidade do tratamento.',
  ].join('\n\n'),
}

const AVISO_INICIAL_FONOAUDIOLOGIA: AvisoInicialConfig = {
  titulo: 'Atenção',
  tone: 'informativo',
  posicao: 'apos-detalhes',
  conteudo: [
    'O processo de autorização de procedimentos eletivos poderá levar até 4 dias úteis para ser concluído.',
    'Após a autorização do procedimento solicitado, a guia de autorização será emitida pelo Plan-Assiste/MPU e encaminhada para o e-mail informado.',
    'Segundo estabelecido na Norma Complementar Nº 32, de 15/02/2023, será exigida perícia para autorização quando o número de sessões semanais ultrapassar 2 (duas) vezes na semana em tratamentos ambulatoriais, e/ou 40 (quarenta) sessões por ano civil, e, ainda, em todos os casos de internação.',
    'Acima deste limite, deverão ser anexados, para avaliação pericial, relatório emitido pelo próprio fonoaudiólogo e/ou pelo médico ou odontólogo assistente, do qual deve constar o diagnóstico e o tempo de tratamento.',
  ].join('\n\n'),
}

const AVISO_INICIAL_PILATES: AvisoInicialConfig = {
  titulo: 'Atenção',
  tone: 'informativo',
  posicao: 'apos-detalhes',
  conteudo: [
    'O processo de autorização de procedimentos eletivos poderá levar até 4 dias úteis para ser concluído.',
    'Após a autorização do procedimento solicitado, a guia de autorização será emitida pelo Plan-Assiste/MPU e encaminhada para o e-mail informado.',
    'Segundo estabelecido nas Normas Complementares nº 32, de 15/02/2023 será exigida perícia quando o número de sessões semanais ultrapassar 2 (duas) vezes na semana, e/ou 40 (quarenta) sessões por ano civil, e, ainda, em todos os casos de internação. A frequência de 2 (duas) vezes na semana será considerada por tipo: motora, neurológica, uroginecológica ou respiratória, ou por sub-especialidade como hidroterapia e RPG.',
  ].join('\n\n'),
}

const AVISO_INICIAL_PSICOLOGIA: AvisoInicialConfig = {
  titulo: 'Atenção',
  tone: 'informativo',
  posicao: 'apos-detalhes',
  conteudo: [
    'O processo de autorização de procedimentos eletivos poderá levar até 4 dias úteis para ser concluído.',
    'Após a autorização do procedimento solicitado, a guia de autorização será emitida pelo Plan-Assiste/MPU e encaminhada para o e-mail informado.',
    'Segundo estabelecido na Norma Complementar Nº 32, de 15/02/2023, será exigida perícia para autorização quando o número de sessões semanais ultrapassar 2 (duas) vezes na semana, e/ou 40 (quarenta) sessões por ano civil, e, ainda, em todos os casos de internação.',
    'Acima deste limite, deverá ser anexado para avaliação pericial, relatório psicológico contendo o diagnóstico e o tempo de tratamento com as sessões semanais.',
    'Abaixo deste limite, não há necessidade de autorização prévia do Plan-Assiste, visto que, o próprio prestador emitirá a autorização.',
  ].join('\n\n'),
}

const AVISO_INICIAL_RPG: AvisoInicialConfig = {
  titulo: 'Atenção',
  tone: 'informativo',
  posicao: 'apos-detalhes',
  conteudo: [
    'O processo de autorização de procedimentos eletivos poderá levar até 4 dias úteis para ser concluído.',
    'Após a autorização do procedimento solicitado, a guia de autorização será emitida pelo Plan-Assiste/MPU e encaminhada para o e-mail informado.',
    'Segundo estabelecido na Norma Complementar Nº 32, de 15/02/2023, será exigida perícia quando o número de sessões semanais ultrapassar 2 (duas) vezes na semana, e/ou 40 (quarenta) sessões por ano civil, e, ainda, em todos os casos de internação. A frequência de 2 (duas) vezes na semana será considerada por tipo: motora, neurológica, uroginecológica ou respiratória, ou por sub-especialidade como hidroterapia e RPG.',
  ].join('\n\n'),
}

const AVISO_INICIAL_HIDROTERAPIA: AvisoInicialConfig = {
  titulo: 'Atenção',
  tone: 'informativo',
  posicao: 'apos-detalhes',
  conteudo: [
    'O processo de autorização de procedimentos eletivos poderá levar até 4 dias úteis para ser concluído.',
    'Após a autorização do procedimento solicitado, a guia de autorização será emitida pelo Plan-Assiste/MPU e encaminhada para o e-mail informado.',
    'Segundo estabelecido na Norma Complementar Nº 32, de 15/02/2023, será exigida perícia quando o número de sessões semanais ultrapassar 2 (duas) vezes na semana, e/ou 40 (quarenta) sessões por ano civil, e, ainda, em todos os casos de internação. A frequência de 2 (duas) vezes na semana será considerada por tipo: motora, neurológica, uroginecológica ou respiratória, ou por sub-especialidade como hidroterapia e RPG.',
  ].join('\n\n'),
}

const AVISO_INICIAL_TERAPIA_OCUPACIONAL: AvisoInicialConfig = {
  titulo: 'Atenção',
  tone: 'informativo',
  posicao: 'apos-detalhes',
  conteudo: [
    'O processo de autorização de procedimentos eletivos poderá levar até 4 dias úteis para ser concluído.',
    'Após a autorização do procedimento solicitado, a guia de autorização será emitida pelo Plan-Assiste/MPU e encaminhada para o e-mail informado.',
    'Segundo estabelecido na Norma Complementar Nº 32, de 15/02/2023, será exigida perícia para autorização quando o número de sessões semanais ultrapassar 2 (duas) vezes na semana em tratamentos ambulatoriais, e/ou 40 (quarenta) sessões por ano civil, e, ainda, em todos os casos de internação.',
    'Acima deste limite, deverão ser anexados, para avaliação pericial, Relatório/Pedido médico, indicando a necessidade de continuidade do tratamento.',
  ].join('\n\n'),
}

const AVISO_INICIAL_AUTORIZACAO_OUTROS: AvisoInicialConfig = {
  titulo: 'Atenção',
  tone: 'informativo',
  posicao: 'apos-detalhes',
  conteudo: [
    'De acordo com a Norma Complementar Nº 32, de 15/02/2023, os procedimentos de quimioterapia, radioterapia, medicamentos, hemodiálise, exame de genética e procedimentos para os quais está prevista diretriz de utilização (DUT) pela ANS, ou que não constem na cobertura do Programa, necessitam de realização de perícia técnica no âmbito do Programa de Saúde e Assistência Social do MPU.',
    'O pedido médico e laudos de exames complementares devem ser anexados para avaliação pericial.',
    'Após a autorização do procedimento solicitado, a guia de autorização será emitida pelo Plan-Assiste/MPU e encaminhada para o e-mail informado.',
  ].join('\n\n'),
}

// Cada caso sincroniza o campo legado "tipoSolicitacaoAposentadoria", que continua controlando
// a visibilidade da seção "Declarações" já existente — preservando as declarações reais aprovadas
// sem duplicar a pergunta "aposentadoria vs. retorno" na tela.
const CASOS_APOSENTADORIA_RETORNO: CasoInstrucaoServico[] = [
  {
    id: 'aposentadoria',
    titulo: 'Aposentadoria',
    documentos: [
      { id: 'placeholderDocAposentadoria', label: 'Documento exigido para início do processo de aposentadoria', obrigatorio: true },
    ],
    sincronizarCampos: { tipoSolicitacaoAposentadoria: 'Início do Processo de Aposentadoria' },
  },
  {
    id: 'retorno_orgao_origem',
    titulo: 'Retorno ao órgão de origem',
    documentos: [
      { id: 'placeholderDocRetornoOrgao', label: 'Documento exigido para retorno ao órgão de origem', obrigatorio: true },
    ],
    avisoNormativo: {
      titulo: 'Norma Complementar nº 34/2023',
      conteudo: '[PLACEHOLDER — substituir pelo texto oficial da NC 34/2023 aplicável ao retorno ao órgão de origem, incluindo prazos, carência e condições de permanência no Plan-Assiste]',
      exigeConfirmacao: true,
    },
    sincronizarCampos: { tipoSolicitacaoAposentadoria: 'Retorno ao Órgão de Origem' },
  },
]

const SERVICE_FORM_SCHEMAS: Record<string, ServiceFormSchema> = {
  [atualizacaoDadosCadastrais.slug]: {
    ...atualizacaoDadosCadastrais,
    perguntaChave: {
      enunciado: 'Para quem é a atualização?',
      casos: CASOS_ATUALIZACAO_DADOS_CADASTRAIS,
      secaoAncora: 'dados-contato',
      colunas: 2,
    },
  },
  [emissaoDocumentos.slug]: {
    ...emissaoDocumentos,
    perguntaChave: {
      enunciado: 'Qual documento você precisa?',
      casos: CASOS_EMISSAO_DOCUMENTOS,
    },
    avisoInicial: AVISO_INICIAL_EMISSAO_DOCUMENTOS,
  },
  [emissaoCarteiraTemporaria.slug]: emissaoCarteiraTemporaria,
  [acompanhamentoProtocolos.slug]: acompanhamentoProtocolos,
  [alteracaoEndereco.slug]: alteracaoEndereco,
  [inscricaoAdesao.slug]: inscricaoAdesao,
  [desligamento.slug]: desligamento,
  [mudancaTipoBeneficiario.slug]: mudancaTipoBeneficiario,
  [processoAposentadoriaRetorno.slug]: {
    ...processoAposentadoriaRetorno,
    perguntaChave: {
      enunciado: 'Qual o motivo?',
      casos: CASOS_APOSENTADORIA_RETORNO,
    },
  },
  [paisDependentes.slug]: paisDependentes,
  [outrasSolicitacoes.slug]: outrasSolicitacoes,
  ...Object.fromEntries(SIMPLE_SERVICES.map(({ slug, title }) =>
    [slug, baseSchema(
      slug,
      title,
      [],
      SLUGS_LOCALIDADE_PROCEDIMENTO.has(slug) ? LOCALIDADE_PROCEDIMENTO_LABEL : undefined,
      SLUGS_CADASTRO_RAMO.has(slug),
    )])),
  'autorizacao-cirurgia': {
    ...authorizationSchema('autorizacao-cirurgia', 'Autorização de cirurgia eletiva', [
      { id: 'pedidoRelatorioMedico', label: 'Pedido/Relatório Médico', required: true },
      { id: 'laudosExames', label: 'Laudos de Exames', required: true },
      { id: 'documentosAdicionais', label: 'Documentos adicionais' },
    ], LOCALIDADE_PROCEDIMENTO_LABEL, true, true),
    avisoInicial: AVISO_INICIAL_CIRURGIA_ELETIVA,
  },
  fisioterapia: {
    ...authorizationSchema('fisioterapia', 'Autorização de Fisioterapia', [
      { id: 'pedidoRelatorioMedico', label: 'Pedido/Relatório Médico', required: true },
      { id: 'laudosExames', label: 'Laudos de Exames' },
      { id: 'documentosAdicionais', label: 'Documentos adicionais' },
    ], LOCALIDADE_PROCEDIMENTO_LABEL, true, true),
    avisoInicial: AVISO_INICIAL_FISIOTERAPIA,
  },
  fonoaudiologia: {
    ...authorizationSchema('fonoaudiologia', 'Autorização de Fonoaudiologia', [
      { id: 'pedidoRelatorioMedico', label: 'Pedido/Relatório Médico', required: true },
      { id: 'laudosExames', label: 'Laudos de Exames' },
      { id: 'documentosAdicionais', label: 'Documentos adicionais' },
    ], LOCALIDADE_PROCEDIMENTO_LABEL, true, true),
    avisoInicial: AVISO_INICIAL_FONOAUDIOLOGIA,
  },
  pilates: {
    ...authorizationSchema('pilates', 'Autorização de Pilates', [
      { id: 'pedidoRelatorioMedico', label: 'Pedido/Relatório Médico', required: true },
      { id: 'laudosExames', label: 'Laudos de Exames', required: true },
      { id: 'documentosAdicionais', label: 'Documentos adicionais' },
    ], LOCALIDADE_PROCEDIMENTO_LABEL, true, true),
    avisoInicial: AVISO_INICIAL_PILATES,
  },
  psicologia: {
    ...authorizationSchema('psicologia', 'Autorização de Psicologia', [
      { id: 'relatorioPsicologico', label: 'Relatório psicológico', required: true },
      { id: 'documentosAdicionais', label: 'Documentos adicionais' },
    ], LOCALIDADE_PROCEDIMENTO_LABEL, true, true),
    avisoInicial: AVISO_INICIAL_PSICOLOGIA,
  },
  rpg: {
    ...authorizationSchema('rpg', 'Autorização de RPG', [
      { id: 'pedidoRelatorioMedico', label: 'Pedido/Relatório Médico', required: true },
      { id: 'laudosExames', label: 'Laudos de Exames' },
      { id: 'documentosAdicionais', label: 'Documentos adicionais' },
    ], LOCALIDADE_PROCEDIMENTO_LABEL, true, true),
    avisoInicial: AVISO_INICIAL_RPG,
  },
  acupuntura: {
    ...withSectionTitle(authorizationSchema('acupuntura', 'Autorização de Acupuntura', [
      { id: 'pedidoRelatorioMedico', label: 'Pedido/Relatório Médico', required: true },
      { id: 'laudosExames', label: 'Laudos de Exames' },
      { id: 'documentosAdicionais', label: 'Documentos adicionais' },
    ], LOCALIDADE_PROCEDIMENTO_LABEL, true, true), 'detalhes', 'Dados da Solicitação'),
    avisoInicial: AVISO_INICIAL_ACUPUNTURA,
  },
  hidroterapia: {
    ...authorizationSchema('hidroterapia', 'Autorização de Hidroterapia', [
      { id: 'pedidoRelatorioMedico', label: 'Pedido/Relatório Médico', required: true },
      { id: 'laudosExames', label: 'Laudos de Exames' },
      { id: 'documentosAdicionais', label: 'Documentos adicionais' },
    ], LOCALIDADE_PROCEDIMENTO_LABEL, true, true),
    avisoInicial: AVISO_INICIAL_HIDROTERAPIA,
  },
  'terapia-ocupacional': {
    ...authorizationSchema('terapia-ocupacional', 'Autorização de Terapia ocupacional', [
      { id: 'pedidoRelatorioMedico', label: 'Pedido/Relatório Médico', required: true },
      { id: 'laudosExames', label: 'Laudos de Exames' },
      { id: 'documentosAdicionais', label: 'Documentos adicionais' },
    ], LOCALIDADE_PROCEDIMENTO_LABEL, true, true),
    avisoInicial: AVISO_INICIAL_TERAPIA_OCUPACIONAL,
  },
  'autorizacao-outros': {
    ...authorizationSchema('autorizacao-outros', 'Autorização de procedimentos (outros)', [
      { id: 'pedidoRelatorioMedico', label: 'Pedido/Relatório Médico', required: true },
      { id: 'laudosExames', label: 'Laudos de Exames', required: true },
      { id: 'documentosAdicionais', label: 'Documentos adicionais' },
    ], LOCALIDADE_PROCEDIMENTO_LABEL, true, true),
    avisoInicial: AVISO_INICIAL_AUTORIZACAO_OUTROS,
  },
  'auxilio-aquisicao-medicamentos': authorizationSchema('auxilio-aquisicao-medicamentos', 'Auxílio para aquisição de medicamentos', [
    { id: 'receitaMedica', label: 'Receita médica', required: true },
    { id: 'relatorioMedico', label: 'Relatório médico', required: true },
    { id: 'documentosAdicionais', label: 'Exames e documentos adicionais' },
  ], LOCALIDADE_PROCEDIMENTO_LABEL),
}

export function getServiceFormSchema(slug: string): ServiceFormSchema | undefined {
  return SERVICE_FORM_SCHEMAS[slug]
}

export function isFieldVisible(condition: ServiceFieldCondition | undefined, values: Record<string, string>): boolean {
  if (!condition) return true
  return values[condition.fieldId] === condition.equals
}
