import { test, expect } from './fixtures'

const CPF_DA_DEMONSTRACAO = '00000000000'
const TOKEN_DA_DEMONSTRACAO = '000000'

const cartoesDeAcesso = (page: import('@playwright/test').Page) => page.locator('.login-access-card h2')

test.describe('Tela de login', () => {
  test('botão Login do topo mostra beneficiários e equipe, sem credenciados', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('button', { name: 'Login', exact: true }).click()

    await expect(page).toHaveURL(/\/login-govbr\?acesso=portal$/)
    await expect(cartoesDeAcesso(page)).toHaveText(['Beneficiários', 'Equipe do Plan-Assiste'])
  })

  test('área do beneficiário sem login mostra só a opção de beneficiário', async ({ page }) => {
    await page.goto('/beneficiario')

    await expect(page).toHaveURL(/\/login-govbr\?acesso=beneficiario$/)
    await expect(cartoesDeAcesso(page)).toHaveText(['Beneficiários'])
  })

  test('área do credenciado sem login mostra todas as opções', async ({ page }) => {
    await page.goto('/credenciado')

    await expect(page).toHaveURL(/\/login-govbr$/)
    await expect(cartoesDeAcesso(page)).toHaveText(['Beneficiários', 'Equipe do Plan-Assiste', 'Credenciados'])
  })

  test('beneficiário entra com CPF e código de acesso', async ({ page }) => {
    await page.goto('/login-govbr?acesso=beneficiario')

    await page.getByRole('button', { name: 'Entrar com CPF e código de acesso' }).click()
    const continuar = page.getByRole('button', { name: 'Continuar' })
    await expect(continuar).toBeDisabled()
    await page.getByLabel('CPF').fill(CPF_DA_DEMONSTRACAO)
    await continuar.click()

    await expect(page.getByText(/Enviamos um código de 6 dígitos para/)).toBeVisible()
    await page.getByLabel('Código recebido').fill(TOKEN_DA_DEMONSTRACAO)
    await page.getByRole('button', { name: 'Entrar', exact: true }).click()

    await expect(page).toHaveURL(/\/beneficiario$/)
  })

  test('código errado mostra erro e não entra', async ({ page }) => {
    await page.goto('/login-govbr?acesso=beneficiario')

    await page.getByRole('button', { name: 'Entrar com CPF e código de acesso' }).click()
    await page.getByLabel('CPF').fill(CPF_DA_DEMONSTRACAO)
    await page.getByRole('button', { name: 'Continuar' }).click()
    await page.getByLabel('Código recebido').fill('123456')
    await page.getByRole('button', { name: 'Entrar', exact: true }).click()

    await expect(page.getByRole('alert')).toContainText('Código inválido')
    await expect(page).toHaveURL(/\/login-govbr/)
  })

  test('"Outras formas de entrar" volta às opções', async ({ page }) => {
    await page.goto('/login-govbr?acesso=portal')

    await page.getByRole('button', { name: 'Entrar com CPF e código de acesso' }).click()
    await page.getByRole('button', { name: 'Outras formas de entrar' }).click()

    await expect(cartoesDeAcesso(page)).toHaveText(['Beneficiários', 'Equipe do Plan-Assiste'])
  })

  test('equipe entra com a conta corporativa', async ({ page }) => {
    await page.goto('/login-govbr?acesso=portal')

    await page.getByRole('button', { name: 'Entrar com a conta corporativa' }).click()

    await expect(page).toHaveURL(/\/area-da-equipe$/)
  })

  test('credenciado entra com CNPJ e senha', async ({ page }) => {
    await page.goto('/login-govbr')

    await page.getByRole('button', { name: 'Entrar como credenciado' }).click()
    await page.getByLabel('CNPJ').fill('12345678000199')
    await expect(page.getByLabel('CNPJ')).toHaveValue('12.345.678/0001-99')
    await page.getByLabel('Senha').fill('senha-de-teste')
    await page.getByRole('button', { name: 'Entrar como credenciado' }).click()

    await expect(page).toHaveURL(/\/credenciado$/)
  })
})
