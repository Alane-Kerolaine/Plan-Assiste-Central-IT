import { beneficiaries } from '../data/mock'

export type PessoaComNome = {
  name: string
  nomeSocial?: string
}

/**
 * Regra do Programa: havendo nome social cadastrado, ele sobrepõe o nome de
 * registro em toda exibição. O nome de registro continua guardado no cadastro e
 * segue sendo o identificador interno (chaves, filtros e valores de formulário),
 * para que a troca de exibição não quebre vínculos entre os dados.
 */
export function nomeExibicao(pessoa: PessoaComNome | undefined | null): string {
  if (!pessoa) return ''
  return pessoa.nomeSocial?.trim() || pessoa.name
}

/**
 * Resolve para exibição um nome de registro já armazenado — o que vem de
 * filtros, lançamentos e solicitações gravadas, onde só temos a string do nome.
 */
export function nomeExibicaoPorRegistro(nomeRegistro: string): string {
  const beneficiario = beneficiaries.find((item) => item.name === nomeRegistro)
  return beneficiario ? nomeExibicao(beneficiario) : nomeRegistro
}
