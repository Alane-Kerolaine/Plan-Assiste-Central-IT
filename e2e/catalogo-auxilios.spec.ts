import { test, expect } from './fixtures'

const TITULO = 'Transporte com cobertura de diárias para acompanhante'

test.describe('Catálogo: Transporte com cobertura de diárias para acompanhante', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login-govbr?acesso=beneficiario')
    await page.getByRole('button', { name: 'Entrar com CPF e código de acesso' }).click()
    await page.getByLabel('CPF').fill('00000000000')
    await page.getByRole('button', { name: 'Continuar' }).click()
    await page.getByLabel('Código recebido').fill('000000')
    await page.getByRole('button', { name: 'Entrar', exact: true }).click()
    await page.getByRole('button', { name: 'Li e estou ciente' }).click()
  })

  test('aparece no catálogo e abre o formulário', async ({ page }) => {
    await page.goto('/beneficiario/servicos')
    await page.getByPlaceholder('Digite serviço, assunto ou palavra-chave').fill('diárias para acompanhante')

    const card = page.locator('article', { hasText: TITULO })
    await expect(card).toBeVisible()
    await card.getByText('Solicitar auxílio').click()

    await expect(page).toHaveURL(/\/beneficiario\/servicos\/transporte-diarias-acompanhante\/nova-solicitacao$/)
    await expect(page.getByRole('heading', { level: 1 })).toContainText(TITULO)
  })
})
