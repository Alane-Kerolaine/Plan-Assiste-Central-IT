/**
 * Define qual login a tela mostra, conforme de onde o usuario veio.
 *
 * - beneficiario: veio do menu ou de um card do beneficiario; so o acesso de beneficiario.
 * - equipe: veio do card ou de uma pagina da Area da equipe; so o login da equipe (Citsmart).
 * - todos: qualquer outra origem (ex.: botao Login do topo); beneficiarios e equipe.
 *
 * Credenciados nao fazem login: a area do credenciado e publica.
 */
export type LoginAccess = 'beneficiario' | 'equipe' | 'todos'

export const LOGIN_PATH = '/login-govbr'
const ACCESS_PARAM = 'acesso'

export function readLoginAccess(value: string | null): LoginAccess {
  return value === 'beneficiario' || value === 'equipe' ? value : 'todos'
}

export function loginUrlFor(access: LoginAccess): string {
  return access === 'todos' ? LOGIN_PATH : `${LOGIN_PATH}?${ACCESS_PARAM}=${access}`
}

/** Login para quem tentou abrir uma rota protegida. */
export function loginUrlForDestination(destination: string): string {
  if (destination.startsWith('/beneficiario')) return loginUrlFor('beneficiario')
  if (destination.startsWith('/area-da-equipe')) return loginUrlFor('equipe')
  return loginUrlFor('todos')
}

export function getLoginAccessParam(searchParams: URLSearchParams): LoginAccess {
  return readLoginAccess(searchParams.get(ACCESS_PARAM))
}
