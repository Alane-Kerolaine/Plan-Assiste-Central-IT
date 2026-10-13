import { test, expect } from './fixtures'

test.describe('Área do credenciado (pública)', () => {
  test('card Credenciado da página inicial abre a área direto, sem login', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('button', { name: /Credenciado/ }).first().click()

    await expect(page).toHaveURL(/\/credenciado$/)
    await expect(page.getByRole('heading', { level: 1, name: 'Área do credenciado' })).toBeVisible()
  })

  test('páginas internas abrem sem login', async ({ page }) => {
    for (const caminho of ['/credenciado/autorizacoes', '/credenciado/faturamento']) {
      await page.goto(caminho)
      await expect(page).toHaveURL(new RegExp(`${caminho}$`))
    }
  })

  test('menu lateral não tem dados de login, Minha conta nem Sair', async ({ page, isMobile }) => {
    test.skip(isMobile, 'No celular o menu lateral da área não é exibido.')
    await page.goto('/credenciado')
    const menu = page.locator('aside.restricted-area-sidebar')

    await expect(menu).toContainText('Atendimento')
    await expect(menu).toContainText('Sistemas')
    await expect(menu).not.toContainText('Minha conta')
    await expect(menu).not.toContainText('Página do credenciado')
    await expect(menu.locator('.sidebar-profile')).toHaveCount(0)
    await expect(menu.getByRole('button', { name: 'Sair' })).toHaveCount(0)
  })

  test('endereço antigo da página do credenciado volta para a área', async ({ page }) => {
    await page.goto('/credenciado/pagina-do-credenciado')

    await expect(page).toHaveURL(/\/credenciado$/)
  })
})
