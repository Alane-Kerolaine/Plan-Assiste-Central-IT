/**
 * Validacao de CPF pelos digitos verificadores.
 *
 * O reconhecimento do CPF e o primeiro passo do acesso por token, entao aceitar
 * qualquer sequencia de onze numeros faria a etapa nao significar nada.
 */
export function isCpfValido(valor: string): boolean {
  const numeros = valor.replace(/\D/g, '')
  if (numeros.length !== 11) return false
  // Sequencias repetidas passam na conta dos digitos, mas nao existem.
  if (/^(\d)\1{10}$/.test(numeros)) return false

  const digito = (ate: number): number => {
    let soma = 0
    for (let i = 0; i < ate; i += 1) soma += Number(numeros[i]) * (ate + 1 - i)
    const resto = (soma * 10) % 11
    return resto === 10 ? 0 : resto
  }

  return digito(9) === Number(numeros[9]) && digito(10) === Number(numeros[10])
}
