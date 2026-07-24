export type ServiceFieldType = 'text' | 'textarea' | 'date' | 'select' | 'combobox' | 'checkbox' | 'file' | 'beneficiary' | 'note' | 'radio'

export type ServiceFieldCondition = {
  fieldId: string
  equals: string
}

export type ServiceFieldFormat = 'phone' | 'cpf' | 'cep' | 'email'

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
  showIf?: ServiceFieldCondition
  format?: ServiceFieldFormat
}

export type ServiceFormSection = {
  id: string
  title: string
  fields: ServiceField[]
  showIf?: ServiceFieldCondition
}

export type ServiceFormSchema = {
  slug: string
  title: string
  sections: ServiceFormSection[]
}

function identificationSection(): ServiceFormSection {
  return {
    id: 'identificacao',
    title: 'Identificação',
    fields: [
      { id: 'beneficiarioId', label: 'Beneficiário', type: 'beneficiary', required: true },
      { id: 'nomeCompleto', label: 'Nome completo', type: 'text', disabled: true, placeholder: 'Selecione um beneficiário' },
      { id: 'cpf', label: 'CPF', type: 'text', disabled: true, placeholder: 'Selecione um beneficiário' },
      { id: 'dataNascimento', label: 'Data de nascimento', type: 'date', disabled: true },
      { id: 'matricula', label: 'Matrícula', type: 'text', disabled: true, placeholder: 'Selecione um beneficiário' },
      { id: 'telefone', label: 'Telefone do beneficiário', type: 'text', required: true, format: 'phone', placeholder: '(00) 00000-0000' },
      { id: 'localAtendimento', label: 'Local do atendimento', type: 'text', required: true, columnSpan: 3, placeholder: 'Digite o local do atendimento' },
    ],
  }
}

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

function baseSchema(slug: string, title: string, extraSections: ServiceFormSection[] = []): ServiceFormSchema {
  return {
    slug,
    title,
    sections: [identificationSection(), ...extraSections, detailsSection()],
  }
}

function authorizationSchema(slug: string, title: string, documents: Array<{ id: string, label: string, required?: boolean }>): ServiceFormSchema {
  return {
    slug,
    title,
    sections: [
      identificationSection(),
      {
        id: 'detalhes',
        title: 'Informações do pedido',
        fields: [{ id: 'descricao', label: 'Descrição', type: 'textarea', fullWidth: true, placeholder: 'Inclua informações que ajudem na análise da solicitação' }],
      },
      {
        id: 'documentos',
        title: 'Documentos',
        fields: documents.map((document) => ({ ...document, type: 'file', fullWidth: true, helpText: 'Selecione um ou mais arquivos em PDF, JPG ou PNG, com até 10 MB cada.' })),
      },
    ],
  }
}

const SEXO_OPTIONS = ['Masculino', 'Feminino']
const UF_OPTIONS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
]

const SIMPLE_SERVICES: { slug: string, title: string }[] = [
  { slug: 'acesso-sistemas-integrados', title: 'Acesso a Sistemas Institucionais Integrados' },
  { slug: 'reingresso-reativacao', title: 'Reingresso / Reativação' },
  { slug: 'cadastro-duvidas-informacoes', title: 'Cadastro - Dúvidas, Informações e Esclarecimentos' },
  { slug: 'medicamentos-uso-continuo', title: 'Medicamentos de Uso Contínuo' },
  { slug: 'medicamentos-alto-custo', title: 'Medicamentos de Alto Custo' },
  { slug: 'reembolso-livre-escolha-duvidas', title: 'Reembolso Livre Escolha - Dúvidas e Orientações' },
  { slug: 'auxilio-medicamentos-duvidas', title: 'Auxílio de Medicamentos - Dúvidas e Orientações' },
  { slug: 'recurso-reembolso', title: 'Recurso de Reembolso - Livre Escolha' },
  { slug: 'solicitacao-reembolso', title: 'Solicitação de Reembolso - Livre Escolha' },
  { slug: 'autorizacao-cirurgia', title: 'Autorização de Cirurgia Eletiva' },
  { slug: 'psicologia', title: 'Psicologia' },
  { slug: 'fonoaudiologia', title: 'Fonoaudiologia' },
  { slug: 'terapia-ocupacional', title: 'Terapia Ocupacional' },
  { slug: 'fisioterapia', title: 'Fisioterapia' },
  { slug: 'acupuntura', title: 'Acupuntura' },
  { slug: 'pilates', title: 'Pilates' },
  { slug: 'rpg', title: 'RPG' },
  { slug: 'hidroterapia', title: 'Hidroterapia' },
  { slug: 'acompanhamento-autorizacoes-demandas', title: 'Acompanhamento de Autorizações e Demandas' },
  { slug: 'abertura-solicitacoes-administrativas', title: 'Abertura de Solicitações Administrativas' },
  { slug: 'autorizacao-opme', title: 'Autorização de OPME' },
  { slug: 'autorizacao-exame', title: 'Autorização de Exame' },
  { slug: 'autorizacao-outros', title: 'Autorização de Procedimentos (Outros)' },
]

const atualizacaoDadosCadastrais = baseSchema('atualizacao-dados-cadastrais', 'Atualização de Dados Cadastrais', [
  {
    id: 'dados-contato',
    title: 'Dados de contato',
    fields: [
      { id: 'localidade', label: 'Localidade', type: 'text', placeholder: 'Ex.: Brasília/DF' },
      { id: 'nomeMae', label: 'Nome da mãe', type: 'text', placeholder: 'Nome completo da mãe' },
      { id: 'nomePai', label: 'Nome do pai', type: 'text', placeholder: 'Nome completo do pai' },
      { id: 'emailInstitucional', label: 'E-mail institucional', type: 'text', format: 'email', placeholder: 'nome@mpu.mp.br' },
      { id: 'emailPessoal', label: 'E-mail pessoal', type: 'text', format: 'email', placeholder: 'nome@exemplo.com' },
      { id: 'telefone', label: 'Telefone', type: 'text', format: 'phone', placeholder: '(00) 00000-0000' },
      { id: 'endereco', label: 'Endereço', type: 'text', fullWidth: true, placeholder: 'Rua, número, complemento, bairro, cidade/UF' },
      { id: 'nomeSocial', label: 'Nome social', type: 'text', placeholder: 'Se houver, informe o nome social' },
      { id: 'cartao', label: 'Cartão', type: 'text', placeholder: 'Número do cartão' },
      { id: 'ramo', label: 'Ramo', type: 'text', placeholder: 'Ex.: Judiciário, Executivo' },
      { id: 'estadoLotacao', label: 'Estado de lotação', type: 'combobox', options: UF_OPTIONS, placeholder: 'Digite ou selecione a UF' },
      { id: 'sexo', label: 'Sexo', type: 'select', options: SEXO_OPTIONS },
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
])

const emissaoCarteiraTemporaria = baseSchema('emissao-carteira-temporaria', 'Emissão de Carteira Temporária', [
  {
    id: 'contato',
    title: 'Contato',
    fields: [
      { id: 'emailCarteiraTemp', label: 'E-mail', type: 'text', required: true, format: 'email', placeholder: 'nome@exemplo.com' },
    ],
  },
])

const emissaoDocumentos = baseSchema('emissao-documentos', 'Emissão de Documentos e Comprovantes', [
  {
    id: 'documento',
    title: 'Documento solicitado',
    fields: [
      {
        id: 'documentoSolicitado',
        label: 'Documento solicitado',
        type: 'select',
        required: true,
        fullWidth: true,
        options: [
          'Cartão do Plan-Assiste',
          'Cartão Unimed',
          'Cartão UniOdonto (para fora do DF e convênio odontológico)',
          'Carta de Permanência',
          'Documento de Acerto Financeiro',
        ],
      },
      {
        id: 'avisoCartaoPlanAssiste',
        label: 'É possível realizar a emissão da carteira do Plan-Assiste através do Portal e do Aplicativo do Plan-Assiste.',
        type: 'note',
        fullWidth: true,
        showIf: { fieldId: 'documentoSolicitado', equals: 'Cartão do Plan-Assiste' },
      },
    ],
  },
])

const acompanhamentoProtocolos = baseSchema('acompanhamento-protocolos', 'Acompanhamento de Protocolos e Processos', [
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
])

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

const SITUACAO_FUNCIONAL_OPTIONS = ['Membro', 'Quadro', 'Requisitado', 'Contratado', 'Cedido', 'Pensionista Vitalício', 'Pensionista Filho']
const DEPENDENTE_TIPO_OPTIONS = [
  'Cônjuge',
  'Companheiro(a)',
  'Pai, Mãe, Padrasto ou Madrasta',
  'Filho ou enteado até 21 anos',
  'Filho/enteado estudante (21 a 24 anos)',
  'Pessoa sob guarda ou tutela (até 18 anos)',
]
const BENEFICIARIO_ESPECIAL_TIPO_OPTIONS = [
  'Filhos e enteados entre 21 e 38 anos, desde que solteiros',
  'Pessoas solteiras, sem rendimentos, entre 18 e 21 anos (ex-guardado ou ex-tutelado)',
  'Pessoas solteiras, sem rendimentos, entre 21 e 24 anos (ex-guardado ou ex-tutelado) e estudantes',
  'Ex-cônjuge ou ex-companheiro(a) mediante decisão judicial ou escritura pública',
  'Pais não dependentes econômicos, inscritos há pelo menos 5 anos',
]

const inscricaoAdesao = baseSchema('inscricao-adesao', 'Inscrição / Adesão', [
  {
    id: 'tipo-beneficiario',
    title: 'Tipo de beneficiário',
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
    id: 'inscricao-titular',
    title: 'Inscrição do titular',
    showIf: { fieldId: 'tipoBeneficiario', equals: 'Titular' },
    fields: [
      { id: 'titularNomeSocial', label: 'Nome social (Portaria PGR/MPU nº 7/2018)', type: 'text', placeholder: 'Se houver, informe o nome social' },
      { id: 'titularSituacaoFuncional', label: 'Situação funcional', type: 'select', options: SITUACAO_FUNCIONAL_OPTIONS },
      { id: 'titularAtividade', label: 'Atividade', type: 'select', options: ['Ativo', 'Inativo'] },
      { id: 'titularFiliacao1', label: 'Filiação 1', type: 'text', placeholder: 'Nome do pai ou responsável' },
      { id: 'titularFiliacao2', label: 'Filiação 2 (preferencialmente o nome da mãe)', type: 'text', placeholder: 'Nome da mãe' },
      { id: 'titularSexo', label: 'Sexo', type: 'select', options: SEXO_OPTIONS },
      { id: 'titularEstadoCivil', label: 'Estado civil', type: 'text', placeholder: 'Ex.: Solteiro(a), Casado(a)' },
      { id: 'titularNacionalidade', label: 'Nacionalidade', type: 'text', placeholder: 'Ex.: Brasileira' },
      { id: 'titularNaturalidade', label: 'Naturalidade', type: 'text', placeholder: 'Cidade de nascimento' },
      { id: 'titularUf', label: 'UF', type: 'combobox', options: UF_OPTIONS, placeholder: 'Digite ou selecione a UF' },
      { id: 'titularIdentidade', label: 'Identidade', type: 'text', placeholder: 'Número do RG' },
      { id: 'titularOrgaoEmissor', label: 'Órgão emissor', type: 'text', placeholder: 'Ex.: SSP/UF' },
      { id: 'titularEndereco', label: 'Endereço', type: 'text', fullWidth: true, placeholder: 'Rua, número, complemento' },
      { id: 'titularBairro', label: 'Bairro', type: 'text', placeholder: 'Nome do bairro' },
      { id: 'titularCidade', label: 'Cidade', type: 'text', placeholder: 'Nome da cidade' },
      { id: 'titularCep', label: 'CEP', type: 'text', format: 'cep', placeholder: '00000-000' },
      { id: 'titularUfCidade', label: 'UF (cidade)', type: 'combobox', options: UF_OPTIONS, placeholder: 'Digite ou selecione a UF' },
      { id: 'titularTelefoneResidencial', label: 'Telefone residencial', type: 'text', format: 'phone', placeholder: '(00) 0000-0000' },
      { id: 'titularTelefoneCelular', label: 'Telefone celular', type: 'text', format: 'phone', placeholder: '(00) 00000-0000' },
      { id: 'titularTelefoneComercial', label: 'Telefone comercial', type: 'text', format: 'phone', placeholder: '(00) 0000-0000' },
      { id: 'titularLotacao', label: 'Lotação', type: 'text', placeholder: 'Setor ou unidade de lotação' },
      { id: 'titularEmail', label: 'Endereço eletrônico (e-mail)', type: 'text', format: 'email', placeholder: 'nome@exemplo.com' },
      { id: 'titularBanco', label: 'Banco', type: 'text', placeholder: 'Ex.: Banco do Brasil' },
      { id: 'titularAgencia', label: 'Agência', type: 'text', placeholder: 'Número da agência' },
      { id: 'titularContaCorrente', label: 'Conta corrente', type: 'text', placeholder: 'Número da conta' },
    ],
  },
  {
    id: 'inscricao-dependente',
    title: 'Inscrição de dependente',
    showIf: { fieldId: 'tipoBeneficiario', equals: 'Dependente' },
    fields: [
      { id: 'dependenteNome', label: 'Nome do dependente', type: 'text', required: true, placeholder: 'Nome completo do dependente' },
      { id: 'dependenteNomeSocial', label: 'Nome social (Portaria PGR/MPU nº 7/2018)', type: 'text', placeholder: 'Se houver, informe o nome social' },
      { id: 'dependenteTipo', label: 'Tipo de dependência', type: 'select', required: true, options: DEPENDENTE_TIPO_OPTIONS },
      { id: 'dependenteSexo', label: 'Sexo', type: 'select', options: SEXO_OPTIONS },
      { id: 'dependenteNaturalidade', label: 'Naturalidade', type: 'text', placeholder: 'Cidade de nascimento' },
      { id: 'dependenteEstadoCivil', label: 'Estado civil', type: 'text', placeholder: 'Ex.: Solteiro(a), Casado(a)' },
      { id: 'dependenteIdentidade', label: 'Identidade', type: 'text', placeholder: 'Número do RG' },
      { id: 'dependenteOrgaoEmissorUf', label: 'Órgão emissor / UF', type: 'text', placeholder: 'Ex.: SSP/UF' },
      { id: 'dependenteFiliacao1', label: 'Filiação 1', type: 'text', placeholder: 'Nome do pai ou responsável' },
      { id: 'dependenteFiliacao2', label: 'Filiação 2 (preferencialmente o nome da mãe)', type: 'text', placeholder: 'Nome da mãe' },
    ],
  },
  {
    id: 'inscricao-beneficiario-especial',
    title: 'Beneficiário especial',
    showIf: { fieldId: 'tipoBeneficiario', equals: 'Beneficiário Especial' },
    fields: [
      { id: 'especialTitularEmailParticular', label: 'E-mail particular do(a) titular', type: 'text', format: 'email', placeholder: 'nome@exemplo.com' },
      { id: 'especialTitularCelular', label: 'Celular ou WhatsApp do(a) titular (com DDD)', type: 'text', format: 'phone', placeholder: '(00) 00000-0000' },
      { id: 'especialNome', label: 'Nome completo do beneficiário', type: 'text', required: true, placeholder: 'Nome completo do beneficiário especial' },
      { id: 'especialNomeSocial', label: 'Nome social (Portaria PGR/MPU nº 7/2018)', type: 'text', placeholder: 'Se houver, informe o nome social' },
      { id: 'especialTipo', label: 'Tipo de dependência', type: 'select', required: true, options: BENEFICIARIO_ESPECIAL_TIPO_OPTIONS },
      { id: 'especialDataNascimento', label: 'Data de nascimento', type: 'date' },
      { id: 'especialSexo', label: 'Sexo', type: 'select', options: SEXO_OPTIONS },
      { id: 'especialNaturalidade', label: 'Naturalidade', type: 'text', placeholder: 'Cidade de nascimento' },
      { id: 'especialEstadoCivil', label: 'Estado civil', type: 'text', placeholder: 'Ex.: Solteiro(a), Casado(a)' },
      { id: 'especialCpf', label: 'CPF', type: 'text', format: 'cpf', placeholder: '000.000.000-00' },
      { id: 'especialIdentidade', label: 'Identidade', type: 'text', placeholder: 'Número do RG' },
      { id: 'especialOrgaoEmissorUf', label: 'Órgão emissor / UF', type: 'text', placeholder: 'Ex.: SSP/UF' },
      { id: 'especialFiliacao1', label: 'Filiação 1 (preferencialmente o nome da mãe)', type: 'text', placeholder: 'Nome da mãe' },
      { id: 'especialFiliacao2', label: 'Filiação 2', type: 'text', placeholder: 'Nome do pai ou responsável' },
    ],
  },
])

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
          'Estou ciente que, após o desligamento, titular e/ou dependente só poderão retornar ao Programa após 6 meses, contados da data de desligamento, e mediante o cumprimento dos períodos de carência (Norma Complementar nº 34/2023, art. 12, §5º).',
        type: 'checkbox',
        required: true,
        fullWidth: true,
      },
    ],
  },
])

const mudancaTipoBeneficiario = baseSchema('mudanca-tipo-beneficiario', 'Mudança de Tipo de Beneficiário', [
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
      { id: 'mudancaEspecialNomeSocial', label: 'Nome social (Portaria PGR/MPU nº 7/2018)', type: 'text', placeholder: 'Se houver, informe o nome social' },
      { id: 'mudancaEspecialTipo', label: 'Tipo de dependência', type: 'select', required: true, options: BENEFICIARIO_ESPECIAL_TIPO_OPTIONS },
      { id: 'mudancaEspecialDataNascimento', label: 'Data de nascimento', type: 'date' },
      { id: 'mudancaEspecialSexo', label: 'Sexo', type: 'select', options: SEXO_OPTIONS },
      { id: 'mudancaEspecialNaturalidade', label: 'Naturalidade', type: 'text', placeholder: 'Cidade de nascimento' },
      { id: 'mudancaEspecialEstadoCivil', label: 'Estado civil', type: 'text', placeholder: 'Ex.: Solteiro(a), Casado(a)' },
      { id: 'mudancaEspecialCpf', label: 'CPF', type: 'text', required: true, format: 'cpf', placeholder: '000.000.000-00' },
      { id: 'mudancaEspecialIdentidade', label: 'Identidade', type: 'text', placeholder: 'Número do RG' },
      { id: 'mudancaEspecialOrgaoEmissorUf', label: 'Órgão emissor / UF', type: 'text', placeholder: 'Ex.: SSP/UF' },
      { id: 'mudancaEspecialFiliacao1', label: 'Filiação 1 (preferencialmente o nome da mãe)', type: 'text', placeholder: 'Nome da mãe' },
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
])

const processoAposentadoriaRetorno = baseSchema('processo-aposentadoria-retorno-orgao', 'Início de Processo de Aposentadoria / Retorno ao Órgão de Origem', [
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
])

const paisDependentes = baseSchema('pais-dependentes', 'Pais Dependentes (Econômicos ou não)', [
  {
    id: 'dependencia-economica',
    title: 'Dependência econômica',
    fields: [
      { id: 'dependenciaTitularLotacao', label: 'Lotação do(a) titular', type: 'text', placeholder: 'Setor ou unidade de lotação' },
      { id: 'dependenciaNome', label: 'Nome do beneficiário especial', type: 'text', required: true, placeholder: 'Nome completo' },
      { id: 'dependenciaParentesco', label: 'Parentesco', type: 'text', required: true, placeholder: 'Ex.: Pai, Mãe' },
      { id: 'dependenciaDataNascimento', label: 'Data de nascimento', type: 'date' },
      { id: 'dependenciaCpf', label: 'CPF', type: 'text', format: 'cpf', placeholder: '000.000.000-00' },
      { id: 'dependenciaNomeMae', label: 'Nome da mãe', type: 'text', placeholder: 'Nome completo da mãe' },
    ],
  },
])

const SERVICE_FORM_SCHEMAS: Record<string, ServiceFormSchema> = {
  [atualizacaoDadosCadastrais.slug]: atualizacaoDadosCadastrais,
  [emissaoDocumentos.slug]: emissaoDocumentos,
  [emissaoCarteiraTemporaria.slug]: emissaoCarteiraTemporaria,
  [acompanhamentoProtocolos.slug]: acompanhamentoProtocolos,
  [alteracaoEndereco.slug]: alteracaoEndereco,
  [inscricaoAdesao.slug]: inscricaoAdesao,
  [desligamento.slug]: desligamento,
  [mudancaTipoBeneficiario.slug]: mudancaTipoBeneficiario,
  [processoAposentadoriaRetorno.slug]: processoAposentadoriaRetorno,
  [paisDependentes.slug]: paisDependentes,
  ...Object.fromEntries(SIMPLE_SERVICES.map(({ slug, title }) => [slug, baseSchema(slug, title)])),
  'autorizacao-cirurgia': authorizationSchema('autorizacao-cirurgia', 'Autorização de Cirurgia Eletiva', [
    { id: 'pedidoRelatorioMedico', label: 'Pedido ou relatório médico', required: true },
    { id: 'laudosExames', label: 'Laudos de exames', required: true },
    { id: 'documentosAdicionais', label: 'Documentos adicionais relacionados ao diagnóstico' },
  ]),
  fisioterapia: authorizationSchema('fisioterapia', 'Fisioterapia', [
    { id: 'pedidoMedico', label: 'Pedido médico', required: true },
    { id: 'relatorioFisioterapico', label: 'Relatório fisioterápico', required: true },
  ]),
  fonoaudiologia: authorizationSchema('fonoaudiologia', 'Fonoaudiologia', [
    { id: 'pedidoMedico', label: 'Pedido médico', required: true },
    { id: 'relatorioFonoaudiologico', label: 'Relatório fonoaudiológico com diagnóstico e tempo de tratamento', required: true },
  ]),
  pilates: authorizationSchema('pilates', 'Pilates', [
    { id: 'pedidoMedico', label: 'Pedido médico', required: true },
    { id: 'relatorioFisioterapico', label: 'Relatório fisioterápico', required: true },
  ]),
  psicologia: authorizationSchema('psicologia', 'Psicologia', [
    { id: 'pedidoMedico', label: 'Pedido médico', required: true },
    { id: 'relatorioPsicologico', label: 'Relatório psicológico', required: true },
  ]),
  rpg: authorizationSchema('rpg', 'RPG', [
    { id: 'pedidoMedico', label: 'Pedido médico', required: true },
    { id: 'relatorioFisioterapico', label: 'Relatório fisioterápico', required: true },
  ]),
  acupuntura: authorizationSchema('acupuntura', 'Acupuntura', [
    { id: 'pedidoMedicoOdontologico', label: 'Pedido médico ou odontológico', required: true },
    { id: 'documentosAdicionais', label: 'Documentos adicionais' },
  ]),
  hidroterapia: authorizationSchema('hidroterapia', 'Hidroterapia', [
    { id: 'pedidoMedico', label: 'Pedido médico', required: true },
    { id: 'relatorioFisioterapico', label: 'Relatório fisioterápico', required: true },
  ]),
  'terapia-ocupacional': authorizationSchema('terapia-ocupacional', 'Terapia Ocupacional', [
    { id: 'pedidoMedico', label: 'Pedido médico', required: true },
    { id: 'relatorioTerapiaOcupacional', label: 'Relatório de terapia ocupacional', required: true },
  ]),
  'atendimento-auxilio-medicamentos': authorizationSchema('atendimento-auxilio-medicamentos', 'Atendimento para Auxílio de Medicamentos', [
    { id: 'receitaMedica', label: 'Receita médica', required: true },
    { id: 'relatorioMedico', label: 'Relatório médico', required: true },
    { id: 'documentosAdicionais', label: 'Exames e documentos adicionais' },
  ]),
  'auxilio-aquisicao-medicamentos': authorizationSchema('auxilio-aquisicao-medicamentos', 'Auxílio para Aquisição de Medicamentos', [
    { id: 'receitaMedica', label: 'Receita médica', required: true },
    { id: 'relatorioMedico', label: 'Relatório médico', required: true },
    { id: 'documentosAdicionais', label: 'Exames e documentos adicionais' },
  ]),
}

export function getServiceFormSchema(slug: string): ServiceFormSchema | undefined {
  return SERVICE_FORM_SCHEMAS[slug]
}

export function isFieldVisible(condition: ServiceFieldCondition | undefined, values: Record<string, string>): boolean {
  if (!condition) return true
  return values[condition.fieldId] === condition.equals
}
