/**
 * Define quais opcoes a tela de login mostra, conforme de onde o usuario veio.
 *
 * - beneficiario: veio do menu ou de um card do beneficiario; so o acesso de beneficiario.
 * - todos: qualquer outra origem (botao Login do topo, area da equipe); beneficiarios e equipe.
 *
 * Credenciados nao fazem login: a area do credenciado e publica.
 */
export type LoginAccess = 'beneficiario' | 'todos'

export const LOGIN_PATH = '/login-govbr'
const ACCESS_PARAM = 'acesso'

export function readLoginAccess(value: string | null): LoginAccess {
  return value === 'beneficiario' ? value : 'todos'
}

export function loginUrlFor(access: LoginAccess): string {
  return access === 'todos' ? LOGIN_PATH : `${LOGIN_PATH}?${ACCESS_PARAM}=${access}`
}

/** Login para quem tentou abrir uma rota protegida. */
export function loginUrlForDestination(destination: string): string {
  return loginUrlFor(destination.startsWith('/beneficiario') ? 'beneficiario' : 'todos')
}

export function getLoginAccessParam(searchParams: URLSearchParams): LoginAccess {
  return readLoginAccess(searchParams.get(ACCESS_PARAM))
}
