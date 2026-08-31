/**
 * Mascara de contato para a tela de acesso: mostra o suficiente para a pessoa
 * reconhecer o proprio e-mail ou telefone sem expor o dado a quem digitou um
 * CPF que nao e o seu.
 */

export function emailMascarado(email: string): string {
  const [local, dominio] = email.split('@')
  if (!dominio) return email
  const visivel = local.slice(0, 2)
  return `${visivel}${'•'.repeat(Math.max(local.length - 2, 3))}@${dominio}`
}

export function telefoneMascarado(telefone: string): string {
  const numeros = telefone.replace(/\D/g, '')
  if (numeros.length < 6) return telefone
  const ddd = numeros.slice(0, 2)
  const finais = numeros.slice(-4)
  return `(${ddd}) ${'•'.repeat(numeros.length - 6)}-${finais}`
}
