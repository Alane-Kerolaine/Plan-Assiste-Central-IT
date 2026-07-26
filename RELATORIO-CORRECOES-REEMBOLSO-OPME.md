# Relatório de correções - Reembolso, Auxílios e OPME

Data: 17/07/2026  
Branch: `2026-07-17-correcoes-sistema`

## Implementado

1. A área "Reembolsos" foi renomeada para "Reembolsos e Auxílios" nos pontos principais de navegação do beneficiário.
2. A página passou a apresentar três modalidades:
   - Reembolso de Livre Escolha - Norma Complementar nº 41;
   - Auxílio para Aquisição de Medicamentos - Norma Complementar nº 29;
   - Auxílio de Órteses, Próteses e Transportes - Norma Complementar nº 31, com solicitação pelo Portal.
3. O catálogo do beneficiário foi consolidado nessas três entradas. Os itens antigos e fragmentados de dúvidas, recurso, atendimento e solicitação deixaram de aparecer como opções iniciais separadas.
4. "Autorização de OPME" foi retirada do catálogo do beneficiário, pois o serviço é exclusivo de prestadores.
5. O aviso sobre dados bancários foi substituído pelo texto solicitado, incluindo o endereço `seplan-cadastro@mpu.mp.br` como link de e-mail.
6. A relação de tipos de reembolso foi ampliada com os tipos informados, incluindo Avaliação neuropsicológica e Parto.
7. Os anexos do formulário do beneficiário agora variam conforme o tipo de reembolso selecionado.
8. A marcação de TEA, SD ou PC acrescenta Perícia à relação de anexos.
9. Todos os campos de anexo do formulário do beneficiário aceitam múltiplos arquivos.
10. Para Odontologia, foi incluído o link para baixar o modelo de orçamento odontológico.
11. O texto foi alterado para "Pessoa com Transtorno do Espectro Autista - TEA, Síndrome de Down - SD ou Paralisia Cerebral - PC".
12. O termo de responsabilidade foi atualizado conforme a sugestão.
13. O tipo de dependente deixou de ser digitado manualmente no formulário do beneficiário e passou a ser preenchido automaticamente a partir do beneficiário selecionado no mock.
14. O formulário da Gestão Operacional recebeu a lista ampliada de tipos, o novo aviso bancário, o texto completo de TEA/SD/PC, preenchimento automático do tipo de dependente e suporte a múltiplos arquivos.
15. Na área do prestador, a entrada foi padronizada como "Autorizações" e passou a exibir os subitens:
    - Autorização eletrônica;
    - Autorização eletiva;
    - Autorização de urgência e emergência.

## Implementado parcialmente

1. A consolidação do catálogo organiza as funcionalidades por assunto, mas ainda reutiliza as telas e rotas disponíveis no protótipo. Não há uma API real que agrupe solicitações, recursos, dúvidas e FAQ por serviço.
2. As regras condicionais de anexos foram aplicadas integralmente ao formulário do beneficiário. A tela interna da Gestão Operacional recebeu anexos múltiplos, mas continua exibindo seu conjunto fixo de campos.
3. O terceiro auxílio da Norma Complementar nº 31 passou a ser solicitado integralmente pelo Portal, por formulário próprio semelhante ao de auxílio para medicamentos.
4. Os subitens de autorização do prestador foram incluídos como navegação e organização de conteúdo. Como não foram fornecidos fluxos ou formulários distintos, Autorização eletiva e Urgência/Emergência direcionam para as orientações e guias existentes.

## Não foi possível implementar sem dados ou integração adicional

1. Validar e reproduzir a lista oficial completa de tipos e opções das tabelas do Benner/Apex. A lista atual reflete os PDFs recebidos.
2. Integrar o preenchimento automático do tipo de dependente com o cadastro real. No protótipo, a automação usa os dados mockados locais.
3. Enviar, persistir, analisar ou autorizar solicitações reais. O projeto continua sendo um protótipo front-end sem integração com Benner/Apex.
4. Disponibilizar um novo ambiente real de homologação para a equipe de Reembolso. O portal apenas possui os acessos já cadastrados no projeto; provisionamento e credenciais dependem da infraestrutura responsável.
5. Confirmar obrigatoriedade, limites, formatos e tamanhos dos anexos. O protótipo aplica provisoriamente PDF com até 5 MB por arquivo, conforme a informação ainda não confirmada.
6. Confirmar a origem oficial da tabela de tipos de reembolso. A área de tabelas do Benner apresentada possui "Teto de reembolso", mas não revelou uma lista de tipos; por isso o protótipo continua usando os tipos fornecidos no PDF de sugestões.

## Validações executadas

- `npm run lint`: concluído sem erros.
- `npm run build`: concluído sem erros.
- `git diff --check`: concluído sem problemas de whitespace.
- O build mantém apenas a advertência preexistente sobre o tamanho do bundle principal.

## Ajustes complementares em tabelas e recursos externos

1. Incluída na página `Tabelas de serviços` a TABJUDMPU 2025 - Tabela de Referência para Convênios e Credenciamentos, com acesso à publicação oficial do Plan-Assiste.
2. Em `Prestador > Faturamento > Envio de documentação`, o Protocolo Eletrônico do MPF foi retirado da tabela de documentos e apresentado como botão principal de acesso.
3. O tutorial de envio permaneceu na tabela, por ser um documento para consulta e download.
4. Foram auditados os demais acessos externos das páginas de prestadores:
   - Protocolo Eletrônico nas páginas de credenciamento de pessoa física e jurídica: já estava corretamente apresentado como botão;
   - Portal TISS: já estava corretamente apresentado como botão, separado dos manuais;
   - Autorizador Web: já estava corretamente apresentado como botão, separado do manual;
   - padrão TISS da ANS: mantido na tabela por ser uma referência técnica, não um sistema operacional do portal.

## Próximos dados recomendados

Para a próxima rodada, coletar no Benner/Apex:

- lista oficial e códigos dos tipos de reembolso;
- vínculo/tipo de cada categoria de dependente;
- documentos obrigatórios, opcionais e condicionais por tipo;
- regras de TEA, SD e PC;
- formatos e limites de upload;
- fluxos de recurso, dúvida e autorização;
- documentos e regras definitivas do fluxo da Norma Complementar nº 31;
- regras específicas de autorização eletiva e de urgência/emergência para prestadores.
