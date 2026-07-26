export const supportFaqCategories = [
  'Todas',
  'Cadastro de beneficiários',
  'Financeiro',
  'Cobertura',
  'Medicamentos',
  'Autorização de procedimentos',
  'Rede credenciada',
] as const

export type SupportFaqCategory = Exclude<(typeof supportFaqCategories)[number], 'Todas'>

export type SupportFaq = {
  category: SupportFaqCategory
  question: string
  answer: string
}

export const supportFaqs: SupportFaq[] = [
  {
    category: 'Cadastro de beneficiários',
    question: 'Quem pode ser beneficiário do Plan-Assiste?',
    answer:
      'Podem participar como titulares membros, servidores e pensionistas vinculados ao MPU, conforme as regras do Programa. Também há dependentes e beneficiários especiais previstos em norma, como cônjuge ou companheiro, filhos, enteados e pessoas sob guarda, tutela ou curatela, observadas as condições aplicáveis.',
  },
  {
    category: 'Cadastro de beneficiários',
    question: 'Como faço para alterar meu endereço?',
    answer:
      'A atualização de endereço, e-mail pessoal, telefone e estado civil deve ser feita pelo Hórus, no caminho GPSNet 2.0 > Informações Pessoais. Em caso de dúvida, procure a Central de Atendimento ou a área de cadastro do Plan-Assiste.',
  },
  {
    category: 'Cadastro de beneficiários',
    question: 'Como solicito a 2ª via dos cartões?',
    answer:
      'A carteirinha física pode ser solicitada à gerência regional do Plan-Assiste. A versão digital pode ser emitida pelo Portal do Beneficiário, na opção de emissão de carteira.',
  },
  {
    category: 'Cadastro de beneficiários',
    question: 'Qual o procedimento para solicitar a inclusão de dependentes?',
    answer:
      'A solicitação deve ser feita pelo titular no Portal do Beneficiário, em Inscrição de Dependente, ou pelos formulários indicados pelo Plan-Assiste, com a documentação exigida para cada vínculo. Algumas unidades possuem fluxos próprios de entrega ou envio.',
  },
  {
    category: 'Cadastro de beneficiários',
    question: 'Quais os prazos de carência?',
    answer:
      'A inscrição em até 30 dias do início do exercício, quando aplicável, não gera carência. Fora desse prazo, podem incidir carências como 90 dias para cobertura geral, 180 dias para internações e cirurgias, 300 dias para parto e 24 meses para condições preexistentes ou lesões anteriores.',
  },
  {
    category: 'Cadastro de beneficiários',
    question: 'Por que o valor da contribuição dos beneficiários especiais é mais elevado?',
    answer:
      'Os beneficiários especiais formam um grupo sem subsídio da União e precisam ter custeio próprio. Como o grupo é menor, há menos diluição de riscos e os gastos assistenciais impactam mais diretamente o valor da contribuição.',
  },
  {
    category: 'Cadastro de beneficiários',
    question: 'Doenças preexistentes impedem a adesão ou interferem nos prazos de carência?',
    answer:
      'Doenças ou lesões preexistentes não impedem a adesão ao Plan-Assiste. As carências seguem as regras gerais do Programa, mas a data considerada para inscrição sem carência pode variar conforme o tipo de beneficiário e o evento que gerou o direito.',
  },
  {
    category: 'Cadastro de beneficiários',
    question: 'Posso incluir meus pais no Plan-Assiste?',
    answer:
      'A inclusão de novos pais está suspensa desde 2020. Pais que já estavam inscritos puderam permanecer em situações específicas, e novas inclusões dependem de deliberação do Conselho Gestor.',
  },
  {
    category: 'Financeiro',
    question: 'Quais são os valores das mensalidades?',
    answer:
      'A mensalidade é calculada pela soma dos valores atribuídos ao titular e a cada dependente, de acordo com a faixa etária e a tabela contributiva vigente do Plan-Assiste.',
  },
  {
    category: 'Financeiro',
    question: 'Quais são os percentuais de coparticipação?',
    answer:
      'Os percentuais de coparticipação variam conforme o tipo de procedimento e devem ser consultados na tabela oficial de coparticipação dos beneficiários do Plan-Assiste.',
  },
  {
    category: 'Financeiro',
    question: 'O Plan-Assiste oferece reembolso de despesas em credenciado de livre escolha?',
    answer:
      'Sim. Atendimentos cobertos realizados fora da rede credenciada podem gerar reembolso de até o limite previsto nas tabelas adotadas pelo Programa. O pedido deve ser apresentado no prazo definido pelo Plan-Assiste, contado da emissão da nota fiscal ou recibo.',
  },
  {
    category: 'Financeiro',
    question: 'Como solicitar reembolso de despesas?',
    answer:
      'A solicitação deve ser feita pelo Portal do Beneficiário, em Reembolso de Procedimentos, com anexação da nota fiscal ou recibo e dos documentos de suporte, como pedido médico e laudos, quando houver.',
  },
  {
    category: 'Financeiro',
    question: 'IRPF - Extratos, Comprovantes e Dúvidas',
    answer:
      'Os extratos de despesas, custeio, reembolsos e auxílio-saúde ficam disponíveis no Portal do Beneficiário. Para o IRPF, consulte os informes por CPF e observe a forma correta de declarar valores reembolsados ou não dedutíveis.',
  },
  {
    category: 'Financeiro',
    question: 'O que mudou com o novo modelo contributivo?',
    answer:
      'Desde 1º de janeiro de 2021, a contribuição passou a seguir modelo per capita por faixa etária, buscando aproximar o custeio do perfil de gastos assistenciais e reforçar a sustentabilidade do Programa.',
  },
  {
    category: 'Financeiro',
    question: 'O que é coparticipação? Por que ela é cobrada?',
    answer:
      'Coparticipação é a parcela paga pelo beneficiário após a utilização de determinados serviços de saúde. Ela ajuda a equilibrar o custeio do Programa e relaciona parte do pagamento ao uso efetivo da assistência.',
  },
  {
    category: 'Financeiro',
    question: 'Como ficam os valores pendentes de pagamento após o falecimento do titular do plano?',
    answer:
      'Os débitos seguem o tratamento previsto nas regras do Plan-Assiste, podendo envolver compensação com créditos, cobrança do espólio ou pensionista, ou liquidação por recursos específicos do Programa, conforme a data e a natureza do atendimento.',
  },
  {
    category: 'Financeiro',
    question:
      'Os dependentes e/ou beneficiários podem permanecer no Plano após o falecimento do titular? Em caso positivo, sujeitos a qual regime de contribuição e custeio?',
    answer:
      'A permanência é admitida para pensionistas devidamente habilitados, que passam à condição de titulares e ficam sujeitos às mesmas regras de contribuição e coparticipação aplicáveis aos demais titulares.',
  },
  {
    category: 'Cobertura',
    question: 'O Plan-Assiste oferece cobertura para home care?',
    answer:
      'Sim. A internação domiciliar pode ser autorizada como continuidade do tratamento hospitalar, mediante relatório médico e análise prévia do Plan-Assiste. A solicitação deve ser feita com antecedência para avaliação e acionamento da rede credenciada.',
  },
  {
    category: 'Cobertura',
    question: 'O Plan-Assiste oferece remoção inter-hospitalar?',
    answer:
      'Sim, nas situações previstas nas normas do Programa, especialmente quando a continuidade do tratamento exigir transferência e não houver recursos adequados no local de origem. A remoção depende de análise técnica e documentação específica.',
  },
  {
    category: 'Cobertura',
    question: 'Quem tem direito a acompanhante durante o período de internação?',
    answer:
      'A internação em acomodação individual permite acompanhante. A alimentação do acompanhante é custeada pelo Plan-Assiste apenas em situações previstas, como pacientes idosos, menores de idade, gestantes em trabalho de parto ou pessoas com necessidades especiais.',
  },
  {
    category: 'Cobertura',
    question: 'Quais são as coberturas mínimas do plano odontológico?',
    answer:
      'O plano odontológico segue tabela própria e contempla, no rol mínimo, consultas e exames clínicos, restaurações, tratamentos de canal e procedimentos periodontais, entre outras coberturas previstas.',
  },
  {
    category: 'Cobertura',
    question: 'Quais são as coberturas excluídas do Plan-Assiste?',
    answer:
      'Entre as exclusões estão procedimentos experimentais, tratamentos estéticos, inseminação artificial, medicamentos importados não nacionalizados, medicamentos domiciliares, internações sem necessidade hospitalar e itens não relacionados ao ato cirúrgico, conforme norma.',
  },
  {
    category: 'Cobertura',
    question: 'Quando uma cirurgia pode ser considerada estética?',
    answer:
      'Uma cirurgia tende a ser considerada estética quando não tem finalidade de restaurar função de órgão ou parte do corpo afetada por doença, trauma ou anomalia congênita.',
  },
  {
    category: 'Cobertura',
    question: 'O que é doença ou lesão preexistente? Há cobertura?',
    answer:
      'É a condição que o beneficiário ou seu representante sabe existir no momento da adesão. A cobertura pode ocorrer de forma parcial ou após o cumprimento das carências aplicáveis, conforme o procedimento.',
  },
  {
    category: 'Cobertura',
    question: 'O Plan-Assiste custeia medicamentos?',
    answer:
      'O Plan-Assiste pode custear medicamentos de alto custo e de uso contínuo, desde que enquadrados nos critérios normativos, com indicação médica e análise pericial quando exigida.',
  },
  {
    category: 'Cobertura',
    question:
      'O Plan-Assiste custeia tratamentos de Transtorno Global do Desenvolvimento, Síndrome de Down e Paralisia Cerebral?',
    answer:
      'Sim, esses tratamentos possuem cobertura regulamentada por norma específica do Plan-Assiste. A autorização e o custeio seguem os critérios definidos nessa regulamentação.',
  },
  {
    category: 'Medicamentos',
    question: 'Há uma lista de medicamentos para consulta de cobertura pelo Plan-Assiste?',
    answer:
      'O Plan-Assiste oferece diferentes coberturas para medicamentos, como os utilizados durante internações, os de cobertura obrigatória pela ANS e aqueles empregados no tratamento de doenças crônicas e degenerativas. Não há uma lista única, pois existem muitos medicamentos e situações excepcionais, e a cobertura depende do Regulamento Geral e das normas específicas, especialmente da [Norma Complementar nº 29/2023](/assets/normas/normas-complementares/nc-29.pdf). Para verificar a cobertura de um medicamento, utilize os [canais de atendimento do Plan-Assiste](/fale-conosco).',
  },
  {
    category: 'Medicamentos',
    question: 'O Plan-Assiste oferece reembolso para medicamentos?',
    answer:
      'Sim, conforme o tipo de medicamento e a modalidade de cobertura. Medicamentos utilizados durante internação e medicamentos de cobertura obrigatória podem ser reembolsados de acordo com as tabelas adotadas pelo Programa. Para medicamentos de cobertura não obrigatória, prescritos para o tratamento ambulatorial ou domiciliar de doenças crônicas ou degenerativas, aplicam-se os critérios da [Norma Complementar nº 29/2023](/assets/normas/normas-complementares/nc-29.pdf). A norma divide a assistência farmacológica em duas categorias: auxílio para medicamento de uso contínuo e reembolso de medicamento de alto custo.',
  },
  {
    category: 'Medicamentos',
    question: 'O que são medicamentos de uso contínuo?',
    answer:
      'São medicamentos indicados em receita médica ou odontológica para o tratamento de doenças crônicas e/ou degenerativas. Devem ser alopáticos, ter registro na Anvisa e não ser fornecidos pelo SUS, salvo indisponibilidade comprovada ou situação excepcional analisada pela perícia médica. A disponibilidade no SUS pode ser consultada na [Relação Nacional de Medicamentos Essenciais (Rename)](https://bvsms.saude.gov.br/bvs/publicacoes/relacao_nacional_medicamentos_2024.pdf). Não há cobertura para medicamentos manipulados nem para os itens vedados pela [Norma Complementar nº 29/2023](/assets/normas/normas-complementares/nc-29.pdf), como cosméticos, dietéticos, materiais para curativo, tratamentos de fertilidade ou disfunção erétil, sais minerais e vitaminas não essenciais, tratamentos de obesidade com IMC inferior a 30 e sem comorbidades e sensores para glicemia.',
  },
  {
    category: 'Medicamentos',
    question: 'Como funciona o auxílio para medicamentos de uso contínuo?',
    answer:
      'Os medicamentos são cobertos na forma de auxílio com custeio integral. Funciona como um empréstimo: o Plan-Assiste paga o valor solicitado e, posteriormente, cobra esse mesmo valor do beneficiário. Portanto, não se trata de reembolso.',
  },
  {
    category: 'Medicamentos',
    question: 'Há algum teto ou valor-limite para solicitar o auxílio?',
    answer:
      'Não. O salário mínimo nacional vigente é utilizado apenas como referência para classificar o pedido como auxílio ou medicamento de alto custo. Se o gasto mensal com um ou mais medicamentos for inferior ao salário mínimo, o pedido será tratado como auxílio para medicamentos de uso contínuo, com cobrança posterior do valor pago pelo Plan-Assiste. Se for igual ou superior, será tratado como medicamento de alto custo. A classificação e a apuração da coparticipação são individuais; as despesas do titular e de cada dependente são consideradas separadamente.',
  },
  {
    category: 'Medicamentos',
    question: 'O que são medicamentos de alto custo conforme a Norma Complementar nº 29/2023?',
    answer:
      'São aqueles cujo valor da quantidade prescrita para uso no mês seja igual ou superior a um salário mínimo. Medicamentos de uso contínuo também serão tratados como de alto custo quando o gasto mensal atingir esse valor. O medicamento deve ser alopático, prescrito por médico ou odontólogo, ter registro na Anvisa e indicação em bula, não ser coberto pela assistência médico-hospitalar nem fornecido pelo SUS, salvo indisponibilidade comprovada. Não há cobertura para medicamentos manipulados ou para os itens vedados pela norma.',
  },
  {
    category: 'Medicamentos',
    question: 'Como funciona a assistência farmacológica para medicamentos de alto custo?',
    answer:
      'O reembolso corresponde a 50% do valor total da despesa mensal de cada beneficiário que exceder um salário mínimo. Por exemplo, considerando uma despesa de R$ 2.000,00 e um salário mínimo de R$ 1.621,00, a diferença é de R$ 379,00, e o Plan-Assiste reembolsa 50% desse valor: R$ 189,50. Não há cobrança posterior pelo Programa, pois essa modalidade é um reembolso.',
  },
  {
    category: 'Medicamentos',
    question: 'Qual é o prazo para solicitar a cobertura de medicamentos?',
    answer:
      'O prazo é de 90 dias, contados da data de emissão da nota fiscal.',
  },
  {
    category: 'Medicamentos',
    question: 'Qual é o prazo para o pagamento?',
    answer:
      'O Plan-Assiste tem até 40 dias, contados da inserção do pedido no Portal do Beneficiário, para autorizar e pagar a solicitação. O pagamento pode ocorrer antes, mas o prazo padrão é de 40 dias.',
  },
  {
    category: 'Medicamentos',
    question: 'Como solicitar a cobertura de medicamentos?',
    answer:
      'A solicitação deve ser feita no [Portal do Beneficiário](/beneficiario), na opção Reembolso e auxílios > Auxílio para Aquisição de Medicamentos. Preencha o formulário, anexe a receita, o relatório médico e a nota fiscal da compra e salve o pedido. Antes do envio, confira também os dados bancários, o telefone e o e-mail de contato. Em caso de dúvida, consulte os [canais de atendimento](/fale-conosco).',
  },
  {
    category: 'Medicamentos',
    question: 'É possível solicitar a cobertura antes de ter a nota fiscal?',
    answer:
      'Não. É necessário realizar a compra primeiro e apresentar a respectiva nota fiscal.',
  },
  {
    category: 'Medicamentos',
    question: 'Como solicitar a cobertura de somatropina?',
    answer:
      'A somatropina consta na Relação Nacional de Medicamentos Essenciais (Rename) e, em regra, não tem cobertura conforme a Norma Complementar nº 29/2023. Primeiro, é necessário solicitá-la às farmácias especializadas do SUS. Se o pedido não atender aos critérios do Ministério da Saúde e for indeferido, o Plan-Assiste também não oferecerá cobertura. Se for deferido, mas o medicamento estiver em falta na rede pública, o Programa poderá cobri-lo enquanto durar o desabastecimento. Nesse caso, faça a solicitação no Portal do Beneficiário e anexe o comprovante de desabastecimento, o relatório médico e a nota fiscal. A modalidade aplicável dependerá do valor mensal da despesa.',
  },
  {
    category: 'Medicamentos',
    question: 'Como solicitar medicamentos para o tratamento da obesidade, como semaglutida e tirzepatida?',
    answer:
      'A cobertura segue os critérios da Norma Complementar nº 29/2023. É necessário apresentar relatório médico detalhado com a indicação de uso e o IMC, que deve ser igual ou superior a 30, ou superior a 27 quando houver comorbidades associadas, como hipertensão arterial, apneia do sono ou agravos cardiovasculares. Quando o medicamento for indicado para o tratamento de diabetes mellitus, não é necessário informar o IMC. Faça o pedido no Portal do Beneficiário e anexe o relatório médico, a receita e a nota fiscal da compra. Conforme o valor mensal, a solicitação será classificada como auxílio ou medicamento de alto custo.',
  },
  {
    category: 'Autorização de procedimentos',
    question: 'Como solicitar autorização para fisioterapia?',
    answer:
      'A autorização deve ser solicitada pelo Portal do Beneficiário, em Autorização de Procedimentos, com o pedido médico anexado. Unidades com fluxo próprio devem seguir o canal indicado pelo respectivo ramo.',
  },
  {
    category: 'Autorização de procedimentos',
    question: 'Qual o procedimento para iniciar tratamento odontológico?',
    answer:
      'O beneficiário deve agendar atendimento com credenciado da rede credenciada direta. Após o plano de tratamento, quando necessário, o credenciado solicita perícia odontológica antes do início dos procedimentos.',
  },
  {
    category: 'Autorização de procedimentos',
    question: 'Qual o prazo para a emissão da guia de autorização para cirurgia?',
    answer:
      'A guia de autorização para cirurgia é emitida em até 8 dias úteis após o recebimento da documentação necessária, como pedido médico e laudos dos exames relacionados.',
  },
  {
    category: 'Autorização de procedimentos',
    question: 'Qual a validade da guia de autorização?',
    answer:
      'A guia emitida pelo sistema deve ser apresentada ao credenciado dentro do prazo de validade informado pelo Plan-Assiste, que normalmente é de 60 dias.',
  },
  {
    category: 'Autorização de procedimentos',
    question: 'Qual a validade do pedido médico?',
    answer:
      'O pedido médico tem validade de 30 dias a partir da assinatura do profissional ou de sua revalidação.',
  },
  {
    category: 'Autorização de procedimentos',
    question: 'Qual o prazo para retorno de consultas?',
    answer:
      'O prazo de retorno deve ser definido pelo médico assistente na primeira consulta. Quando não houver definição expressa, costuma-se adotar o prazo de 15 dias.',
  },
  {
    category: 'Rede credenciada',
    question: 'Qual a abrangência da rede credenciada?',
    answer:
      'A rede tem abrangência nacional e inclui credenciamento direto, redes indiretas e convênios com outras operadoras, conforme a disponibilidade local e as regras de utilização do Plan-Assiste.',
  },
  {
    category: 'Rede credenciada',
    question: 'Como consultar a rede credenciada disponível?',
    answer:
      'A rede pode ser consultada pelos canais oficiais do Plan-Assiste, incluindo credenciados da rede direta e indireta. Em algumas localidades também há opções específicas de telemedicina e convênios locais.',
  },
]
