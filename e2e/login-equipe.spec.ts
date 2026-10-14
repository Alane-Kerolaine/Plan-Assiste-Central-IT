import { test, expect, entrarComoEquipe } from './fixtures'

test.describe('Login da Equipe do Plan-Assiste', () => {
  test('card Área da equipe mostra só o login da equipe', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('button', { name: /Área da equipe/ }).first().click()

    await expect(page).toHaveURL(/\/login-govbr\?acesso=equipe$/)
    await expect(page.getByRole('img', { name: 'Meu Plan-Assiste' })).toBeVisible()
    await expect(page.getByText('Beneficiários', { exact: true })).toHaveCount(0)
    await expect(page.getByRole('button', { name: /gov\.br/ })).toHaveCount(0)
  })

  test('ao entrar vai para a área da equipe', async ({ page }) => {
    await page.goto('/area-da-equipe')
    await expect(page).toHaveURL(/acesso=equipe$/)

    await entrarComoEquipe(page)

    await expect(page).toHaveURL(/\/area-da-equipe$/)
  })

  test('sem usuário e senha não entra', async ({ page }) => {
    await page.goto('/login-govbr?acesso=equipe')

    await page.getByRole('button', { name: 'Entrar No Citsmart X' }).click()

    await expect(page).toHaveURL(/acesso=equipe$/)
  })

  test('olho mostra e oculta a senha', async ({ page }) => {
    await page.goto('/login-govbr?acesso=equipe')
    const senha = page.getByPlaceholder('Digite sua senha*')

    await expect(senha).toHaveAttribute('type', 'password')
    await page.getByRole('button', { name: 'Mostrar senha' }).click()
    await expect(senha).toHaveAttribute('type', 'text')
  })

  test('"Login MPF - Servidores" entra na área da equipe', async ({ page }) => {
    await page.goto('/login-govbr?acesso=equipe')

    await page.getByRole('button', { name: 'Login MPF - Servidores' }).click()

    await expect(page).toHaveURL(/\/area-da-equipe$/)
  })

  test('"Entrar com a conta corporativa" do login geral abre o login da equipe', async ({ page }) => {
    await page.goto('/login-govbr')

    await page.getByRole('button', { name: 'Entrar com a conta corporativa' }).click()

    await expect(page).toHaveURL(/acesso=equipe$/)
  })
})
