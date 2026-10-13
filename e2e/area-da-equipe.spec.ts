import { test, expect } from './fixtures'

const CENTRAL_DE_SERVICOS = 'https://atendente.planassiste.mpu.mp.br/'

test.describe('Área da equipe', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login-govbr?acesso=portal')
    await page.getByRole('button', { name: 'Entrar com a conta corporativa' }).click()
    await expect(page).toHaveURL(/\/area-da-equipe$/)
  })

  test('card da Central de serviços abre o atendimento em nova guia', async ({ page }) => {
    const link = page.getByRole('link', { name: 'Acessar central' })

    await expect(link).toHaveAttribute('href', CENTRAL_DE_SERVICOS)
    await expect(link).toHaveAttribute('target', '_blank')
  })

  test('menu lateral tem a Central de serviços em Trabalho', async ({ page, isMobile }) => {
    test.skip(isMobile, 'No celular o menu lateral da área não é exibido.')
    const link = page.getByRole('link', { name: /Central de serviços/ })

    await expect(link).toHaveAttribute('href', CENTRAL_DE_SERVICOS)
  })
})
