import { test, expect, type Page } from './fixtures'

const DETALHE = '/plan-assiste/servicos/inscricao-adesao'
const FORMULARIO_PUBLICO = `${DETALHE}/formulario`

async function abrirFormularioPeloCard(page: Page) {
  await page.goto('/plan-assiste/servicos')
  await page.locator('a.plan-servico-card', { hasText: 'Inscrição / adesão' }).click()
  await expect(page).toHaveURL(new RegExp(`${DETALHE}$`))
  await page.getByRole('link', { name: 'Formulário' }).click()
  await expect(page).toHaveURL(new RegExp(`${FORMULARIO_PUBLICO}$`))
}

const campo = (page: Page, rotulo: string) => page.getByLabel(rotulo, { exact: false }).first()

/** A lista do formulário é um combobox próprio: abre e escolhe a opção pelo texto exato. */
async function escolher(page: Page, rotulo: string, opcao: string) {
  await campo(page, rotulo).click()
  await page.locator('li').filter({ hasText: new RegExp(`^${opcao}$`) }).click()
}

test.describe('Inscrição / adesão sem login', () => {
  test('o card leva ao formulário sem pedir login e sem o bloco de Identificação', async ({ page }) => {
    await page.goto(DETALHE)
    await expect(page.getByRole('heading', { name: 'Informações solicitadas' })).toBeVisible()
    await expect(page.locator('.plan-servico-body')).not.toContainText('Identificação')

    await abrirFormularioPeloCard(page)

    await expect(page.getByText('Você está preenchendo sem login.')).toBeVisible()
    await expect(page.getByText('Beneficiário do Atendimento')).toHaveCount(0)
    await expect(page.getByText('Localidade da Matrícula')).toHaveCount(0)
  })

  test('titular: e-mail e todos os telefones são obrigatórios e o envio gera protocolo', async ({ page }) => {
    await page.goto(FORMULARIO_PUBLICO)
    await escolher(page, 'Tipo de beneficiário', 'Titular')

    await page.getByRole('button', { name: 'Revisar solicitação' }).click()
    const aviso = page.getByText(/^Preencha os campos obrigatórios/)
    for (const contato of ['Telefone residencial', 'Telefone celular', 'Telefone comercial', 'Endereço eletrônico (e-mail)']) {
      await expect(aviso).toContainText(contato)
    }

    await campo(page, 'Nome completo').fill('Mariana Teixeira Lopes')
    await campo(page, 'Matrícula').fill('30009911')
    await campo(page, 'Telefone residencial').fill('6133334444')
    await campo(page, 'Telefone celular').fill('61988887777')
    await campo(page, 'Telefone comercial').fill('6132125555')
    await campo(page, 'Endereço eletrônico (e-mail)').fill('mariana.lopes@exemplo.com')
    await page.getByRole('button', { name: 'Revisar solicitação' }).click()
    await page.getByRole('button', { name: 'Estou ciente, assinar com gov.br' }).click()

    await expect(page.getByRole('heading', { name: 'Solicitação criada com sucesso!' })).toBeVisible()
    await expect(page.getByText('A equipe do Plan-Assiste vai analisar a solicitação')).toBeVisible()
    await expect(page.getByText('Acesse o menu Minhas Solicitações')).toHaveCount(0)
    await expect(page.getByRole('link', { name: 'Voltar aos serviços' })).toHaveAttribute('href', '/plan-assiste/servicos')
  })

  test('dependente: dados do titular ficam em branco e editáveis, com contato', async ({ page }) => {
    await page.goto(FORMULARIO_PUBLICO)
    await escolher(page, 'Tipo de beneficiário', 'Dependente')

    const nomeDoTitular = campo(page, 'Nome completo do(a) titular')
    await expect(nomeDoTitular).toBeEditable()
    await expect(nomeDoTitular).toHaveValue('')
    await expect(campo(page, 'E-mail do(a) titular')).toBeVisible()
    await expect(campo(page, 'Celular ou WhatsApp do(a) titular')).toBeVisible()
  })

  test('"Iniciar orientação" de Torne-se beneficiário abre a inscrição sem pedir login', async ({ page }) => {
    await page.goto('/plan-assiste/beneficiarios/torne-se-beneficiario')

    await page.getByRole('link', { name: 'Iniciar orientação' }).click()

    await expect(page).toHaveURL(new RegExp(`${FORMULARIO_PUBLICO}$`))
    await expect(page.getByText('Você está preenchendo sem login.')).toBeVisible()
  })

  test('outros serviços continuam exigindo login', async ({ page }) => {
    await page.goto('/plan-assiste/servicos/desligamento/formulario')
    await expect(page).toHaveURL(/\/plan-assiste\/servicos\/desligamento$/)

    await page.getByRole('link', { name: 'Formulário' }).click()
    await expect(page).toHaveURL(/\/login-govbr\?acesso=beneficiario$/)
  })

  test('beneficiário logado usa o formulário da área logada', async ({ page }) => {
    await page.goto('/login-govbr?acesso=beneficiario')
    await page.getByRole('button', { name: 'Entrar com CPF e código de acesso' }).click()
    await page.getByLabel('CPF').fill('00000000000')
    await page.getByRole('button', { name: 'Continuar' }).click()
    await page.getByLabel('Código recebido').fill('000000')
    await page.getByRole('button', { name: 'Entrar', exact: true }).click()
    await expect(page).toHaveURL(/\/beneficiario$/)

    await page.goto(FORMULARIO_PUBLICO)
    await expect(page).toHaveURL(/\/beneficiario\/servicos\/inscricao-adesao\/nova-solicitacao$/)
  })
})
