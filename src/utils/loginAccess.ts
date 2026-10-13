/**
 * Define quais opcoes a tela de login mostra, conforme de onde o usuario veio.
 *
 * - beneficiario: veio do menu ou de um card do beneficiario; so o acesso de beneficiario.
 * - portal: clicou no botao Login do topo; beneficiarios e equipe, sem credenciados.
 * - todos: qualquer outra origem (ex.: area do credenciado ou da equipe protegida).
 */
export type LoginAccess = 'beneficiario' | 'portal' | 'todos'

export const LOGIN_PATH = '/login-govbr'
const ACCESS_PARAM = 'acesso'

export function readLoginAccess(value: string | null): LoginAccess {
  return value === 'beneficiario' || value === 'portal' ? value : 'todos'
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
