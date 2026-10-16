import { test, expect, entrarComoEquipe, type Page } from './fixtures'

const PERMISSOES = '/area-da-equipe/permissao-administracao-portal'
const ADMINISTRACAO = '/area-da-equipe/administracao-do-portal'

async function entrar(page: Page, usuario: string) {
  await page.goto('/login-govbr?acesso=equipe')
  await entrarComoEquipe(page, usuario)
  await expect(page).toHaveURL(/\/area-da-equipe$/)
}

async function abrirPermissoes(page: Page) {
  await entrar(page, 'ana.maria')
  await page.goto(PERMISSOES)
}

const secao = (page: Page, titulo: string) => page.locator('section.permissoes-secao', { has: page.getByRole('heading', { name: titulo }) })
const autorizados = (page: Page) => secao(page, 'Usuários com acesso').locator('tbody th')
const pesquisarParaConceder = (page: Page, termo: string) => secao(page, 'Conceder acesso').getByPlaceholder('Digite o nome ou a matrícula').fill(termo)
const resultado = (page: Page, nome: string) => page.locator('.permissoes-resultado', { hasText: nome })

test.describe('Permissão Administração Portal', () => {
  test('gerente tem o item no menu, sem card na visão geral', async ({ page, isMobile }) => {
    test.skip(isMobile, 'No celular o menu lateral da área não é exibido.')
    await entrar(page, 'ana.maria')

    await expect(page.locator('.team-dashboard-cards h2', { hasText: 'Permissão Administração Portal' })).toHaveCount(0)
    await page.locator('aside').getByRole('link', { name: 'Permissão Administração Portal' }).click()

    await expect(page).toHaveURL(new RegExp(`${PERMISSOES}$`))
    await expect(page.getByRole('heading', { level: 1, name: 'Permissão Administração Portal' })).toBeVisible()
  })

  test('tabela mostra só os membros com acesso', async ({ page }) => {
    await abrirPermissoes(page)

    await expect(autorizados(page)).toHaveText(['Carlos Eduardo Lima'])
  })

  test('pesquisa para conceder por nome (sem acento) e por matrícula', async ({ page }) => {
    await abrirPermissoes(page)

    await expect(page.locator('.permissoes-resultado')).toHaveCount(0)
    await pesquisarParaConceder(page, 'patricia')
    await expect(page.locator('.permissoes-resultado strong')).toHaveText(['Patrícia Gomes Rocha'])

    await pesquisarParaConceder(page, '30006045')
    await expect(page.locator('.permissoes-resultado strong')).toHaveText(['Juliana Ribeiro Alves'])

    await pesquisarParaConceder(page, 'ninguém')
    await expect(page.getByText('Nenhum usuário encontrado para “ninguém”.')).toBeVisible()
  })

  test('pesquisa indica quem já tem acesso e os gerentes', async ({ page }) => {
    await abrirPermissoes(page)

    await pesquisarParaConceder(page, 'carlos')
    await expect(resultado(page, 'Carlos Eduardo Lima')).toContainText('Já tem acesso')
    await pesquisarParaConceder(page, 'roberto')
    await expect(resultado(page, 'Roberto Nunes Barbosa')).toContainText('Gerente — acesso automático')
    await expect(resultado(page, 'Roberto Nunes Barbosa').getByRole('button')).toHaveCount(0)
  })

  test('conceder acesso a vários usuários os coloca na tabela e no registro', async ({ page }) => {
    await abrirPermissoes(page)

    for (const [termo, nome] of [['fernanda', 'Fernanda Souza Costa'], ['30007548', 'Thiago Martins Oliveira']]) {
      await pesquisarParaConceder(page, termo)
      await resultado(page, nome).getByRole('button', { name: 'Conceder acesso' }).click()
      await page.getByRole('alertdialog').getByRole('button', { name: 'Conceder acesso' }).click()
      await expect(page.getByRole('status')).toHaveText(`Acesso à Administração do Portal concedido a ${nome}.`)
    }

    await expect(autorizados(page)).toHaveText(['Carlos Eduardo Lima', 'Fernanda Souza Costa', 'Thiago Martins Oliveira'])
    const ultimo = secao(page, 'Registro de autorizações').locator('tbody tr').first()
    await expect(ultimo).toContainText('Acesso concedido')
    await expect(ultimo).toContainText('Thiago Martins Oliveira (matrícula 30007548)')
    await expect(ultimo).toContainText('Ana Maria de Araújo (matrícula 30003387)')
  })

  test('revogar acesso tira o usuário da tabela', async ({ page }) => {
    await abrirPermissoes(page)

    await secao(page, 'Usuários com acesso').getByRole('button', { name: 'Revogar acesso' }).click()
    await expect(page.getByRole('alertdialog')).toContainText('Carlos Eduardo Lima (matrícula 30005218)')
    await page.getByRole('alertdialog').getByRole('button', { name: 'Revogar acesso' }).click()

    await expect(page.getByRole('status')).toHaveText('Acesso à Administração do Portal revogado de Carlos Eduardo Lima.')
    await expect(autorizados(page)).toHaveCount(0)
    await expect(page.getByText('Nenhum membro autorizado no momento.')).toBeVisible()
  })

  test('cancelar a confirmação não altera nada', async ({ page }) => {
    await abrirPermissoes(page)

    await secao(page, 'Usuários com acesso').getByRole('button', { name: 'Revogar acesso' }).click()
    await page.getByRole('alertdialog').getByRole('button', { name: 'Cancelar' }).click()

    await expect(page.getByRole('alertdialog')).toHaveCount(0)
    await expect(autorizados(page)).toHaveText(['Carlos Eduardo Lima'])
  })

  test('registro tem paginação de 10 em 10', async ({ page }) => {
    await abrirPermissoes(page)
    const registro = secao(page, 'Registro de autorizações')

    await expect(registro.locator('tbody tr')).toHaveCount(10)
    await expect(registro.getByText('Mostrando 1–10 de 13 registros')).toBeVisible()
    await registro.getByRole('button', { name: 'Próxima' }).click()
    await expect(registro.locator('tbody tr')).toHaveCount(3)
    await expect(registro.getByText('Mostrando 11–13 de 13 registros')).toBeVisible()
    await expect(registro.getByRole('button', { name: 'Próxima' })).toBeDisabled()
  })

  test('registro tem pesquisa por nome, matrícula e ação', async ({ page }) => {
    await abrirPermissoes(page)
    const registro = secao(page, 'Registro de autorizações')
    const pesquisa = registro.getByPlaceholder('Nome, matrícula ou ação')

    await pesquisa.fill('marcos')
    await expect(registro.locator('tbody tr')).toHaveCount(2)
    await pesquisa.fill('30005218')
    await expect(registro.locator('tbody tr')).toHaveCount(1)
    await pesquisa.fill('revogado')
    await expect(registro.locator('tbody tr')).toHaveCount(6)
    await pesquisa.fill('xyz')
    await expect(registro.getByText('Nenhum registro encontrado para “xyz”.')).toBeVisible()
  })

  test('membro autorizado acessa a Administração do Portal, mas não a tela de permissões', async ({ page, isMobile }) => {
    await entrar(page, 'carlos.lima')

    await expect(page.getByRole('heading', { name: /Administração do Portal/ })).toBeVisible()
    if (!isMobile) {
      await expect(page.locator('aside').getByRole('link', { name: 'Administração do Portal' })).toBeVisible()
      await expect(page.locator('aside').getByRole('link', { name: 'Permissão Administração Portal' })).toHaveCount(0)
    }

    await page.goto(ADMINISTRACAO)
    await expect(page).toHaveURL(new RegExp(`${ADMINISTRACAO}$`))
    await page.goto(PERMISSOES)
    await expect(page).toHaveURL(/\/area-da-equipe$/)
  })

  test('membro sem acesso não vê os itens e é barrado pelo endereço direto', async ({ page, isMobile }) => {
    await entrar(page, 'fernanda.costa')

    await expect(page.getByRole('heading', { name: /Administração do Portal/ })).toHaveCount(0)
    if (!isMobile) {
      const menu = page.locator('aside')
      await expect(menu.getByRole('link', { name: 'Administração do Portal' })).toHaveCount(0)
      await expect(menu.getByRole('link', { name: 'Permissão Administração Portal' })).toHaveCount(0)
    }

    for (const endereco of [ADMINISTRACAO, `${ADMINISTRACAO}/noticias`, PERMISSOES]) {
      await page.goto(endereco)
      await expect(page).toHaveURL(/\/area-da-equipe$/)
    }
  })

  test('acesso concedido passa a valer para o membro', async ({ page }) => {
    await abrirPermissoes(page)
    await pesquisarParaConceder(page, 'fernanda')
    await resultado(page, 'Fernanda Souza Costa').getByRole('button', { name: 'Conceder acesso' }).click()
    await page.getByRole('alertdialog').getByRole('button', { name: 'Conceder acesso' }).click()

    await entrar(page, 'fernanda.costa')
    await expect(page.getByRole('heading', { name: /Administração do Portal/ })).toBeVisible()
  })

  test('login da equipe recusa usuário que não existe', async ({ page }) => {
    await page.goto('/login-govbr?acesso=equipe')
    await entrarComoEquipe(page, 'usuario.inexistente')

    await expect(page.getByRole('alert')).toContainText('Usuário não encontrado.')
    await expect(page).toHaveURL(/acesso=equipe$/)
  })
})
