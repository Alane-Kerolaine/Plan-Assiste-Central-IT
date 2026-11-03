import { readFile } from 'node:fs/promises'
import { test, expect } from './fixtures'

test.describe('Reembolsos solicitados: paginação e extrato em PDF', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login-govbr?acesso=beneficiario')
    await page.getByRole('button', { name: 'Entrar com CPF e código de acesso' }).click()
    await page.getByLabel('CPF').fill('00000000000')
    await page.getByRole('button', { name: 'Continuar' }).click()
    await page.getByLabel('Código recebido').fill('000000')
    await page.getByRole('button', { name: 'Entrar', exact: true }).click()
    await page.getByRole('button', { name: 'Li e estou ciente' }).click()
    await page.goto('/beneficiario/reembolsos')
  })

  test('não oferece mais o botão Compartilhar', async ({ page }) => {
    const acoes = page.getByLabel('Ações para reembolsos solicitados')
    await expect(acoes.getByRole('button')).toHaveText(['Fazer download', 'Imprimir', 'Enviar por e-mail'])
  })

  test('troca a coluna Observações pela ação que abre a solicitação do reembolso', async ({ page }) => {
    const tabela = page.locator('.reimbursement-table')
    await expect(tabela.getByRole('columnheader', { name: 'Observações' })).toHaveCount(0)
    await expect(tabela.getByRole('columnheader', { name: 'Ações' })).toBeVisible()

    await tabela.getByRole('link', { name: 'Visualizar solicitação do reembolso 2026-1775' }).click()

    await expect(page).toHaveURL(/\/beneficiario\/solicitacoes\/REE-2026-1775$/)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Acompanhamento da solicitação')
    await expect(page.locator('.solicitacao-protocol-plain strong')).toHaveText('REE-2026-1775')
  })

  test('pagina a tabela de reembolsos', async ({ page }) => {
    const linhas = page.locator('.reimbursement-table tbody tr')
    await expect(linhas).toHaveCount(5)

    const paginacao = page.getByRole('navigation', { name: 'Paginação dos reembolsos solicitados' })
    await paginacao.getByRole('button', { name: '3' }).click()
    await expect(linhas).toHaveCount(1)

    await page.getByLabel('Itens por página').selectOption('20')
    await expect(linhas).toHaveCount(11)
    await expect(paginacao).toHaveCount(0)
  })

  test('o download gera um PDF com o logo e o título do extrato', async ({ page }) => {
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'Fazer download' }).click(),
    ])
    expect(download.suggestedFilename()).toMatch(/^extrato-reembolsos-\d{4}-\d{2}-\d{2}\.pdf$/)
    const conteudo = (await readFile(await download.path())).toString('latin1')
    expect(conteudo.startsWith('%PDF-1.4')).toBe(true)
    expect(conteudo).toContain('/Filter /DCTDecode')
    expect(conteudo).toContain('(Extrato de reembolsos solicitados)')
    expect(conteudo).not.toContain('(Observa')
  })

  test('o envio por e-mail abre a janela Compartilhar do sistema com o PDF anexado', async ({ page }) => {
    // Simula a Web Share API, que no Windows abre a escolha do app de e-mail.
    await page.evaluate(`
      navigator.canShare = (dados) => Boolean(dados && dados.files && dados.files.length)
      navigator.share = async (dados) => {
        const arquivo = dados.files[0]
        window.compartilhado = { nome: arquivo.name, tipo: arquivo.type, titulo: dados.title }
      }
    `)

    await page.getByRole('button', { name: 'Enviar por e-mail' }).click()

    await expect(page.getByRole('status')).toContainText('enviado ao aplicativo de e-mail escolhido')
    const compartilhado = await page.evaluate<{ nome: string, tipo: string, titulo: string }>('window.compartilhado')
    expect(compartilhado.nome).toMatch(/^extrato-reembolsos-.*\.pdf$/)
    expect(compartilhado.tipo).toBe('application/pdf')
    expect(compartilhado.titulo).toContain('Extrato de reembolsos solicitados')
  })

  test('sem a janela Compartilhar, baixa o PDF e abre o app de e-mail padrão', async ({ page }) => {
    await page.evaluate('navigator.canShare = () => false')

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'Enviar por e-mail' }).click(),
    ])

    expect(download.suggestedFilename()).toMatch(/^extrato-reembolsos-.*\.pdf$/)
    await expect(page.getByRole('status')).toContainText('Anexe o arquivo')
  })
})
