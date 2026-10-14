import { test, expect, type Page } from './fixtures'

/** O menu do perfil fecha se a pagina rolar; volta ao topo e tenta de novo ate abrir. */
async function sairPeloMenuDoPerfil(page: Page) {
  await expect(async () => {
    await page.evaluate('window.scrollTo(0, 0)')
    await page.getByRole('button', { name: 'Abrir menu de perfil' }).click()
    await page.locator('.profile-popover').getByRole('button', { name: 'Sair' }).click({ timeout: 2000 })
  }).toPass({ timeout: 15000 })
}

test.describe('Sair', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login-govbr?acesso=beneficiario')
    await page.getByRole('button', { name: 'Entrar com CPF e código de acesso' }).click()
    await page.getByLabel('CPF').fill('00000000000')
    await page.getByRole('button', { name: 'Continuar' }).click()
    await page.getByLabel('Código recebido').fill('000000')
    await page.getByRole('button', { name: 'Entrar', exact: true }).click()
    await expect(page).toHaveURL(/\/beneficiario$/)
    await page.getByRole('button', { name: 'Li e estou ciente' }).click()
  })

  test('pelo menu do perfil volta para a página inicial, não para o login', async ({ page }) => {
    await sairPeloMenuDoPerfil(page)

    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByRole('button', { name: 'Login', exact: true })).toBeVisible()
  })

  test('estando na página inicial, continua nela e desloga', async ({ page }) => {
    await page.goto('/')
    await sairPeloMenuDoPerfil(page)

    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByRole('button', { name: 'Login', exact: true })).toBeVisible()
  })

  test('pelo menu lateral volta para a página inicial, não para o login', async ({ page, isMobile }) => {
    test.skip(isMobile, 'No celular o menu lateral da área não é exibido.')
    await page.locator('aside').getByRole('button', { name: 'Sair' }).click()

    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByRole('button', { name: 'Login', exact: true })).toBeVisible()
  })
})
