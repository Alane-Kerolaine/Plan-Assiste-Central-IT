import { test as base, expect } from '@playwright/test'

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

export { expect }
