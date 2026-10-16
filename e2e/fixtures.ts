import { test as base, expect, type Page } from '@playwright/test'

/**
 * Page que fecha o banner de cookies sempre que ele aparecer, para que ele
 * nao intercepte os cliques dos testes.
 */
export const test = base.extend({
  page: async ({ page }, provide) => {
    await page.addLocatorHandler(page.locator('.cookie-consent-backdrop'), async () => {
      await page.getByRole('button', { name: 'Aceitar todos' }).click()
    })
    await provide(page)
  },
})

/** Preenche e envia o login da equipe (tela do Citsmart). Padrão: ana.maria, gerente. */
export async function entrarComoEquipe(page: Page, usuario = 'ana.maria') {
  await page.getByPlaceholder('Digite seu nome de usuário ou e-mail *').fill(usuario)
  await page.getByPlaceholder('Digite sua senha*').fill('senha-de-teste')
  await page.getByRole('button', { name: 'Entrar No Citsmart X' }).click()
}

export { expect, type Page }
