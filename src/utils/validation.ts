// Validação pragmática de e-mail para feedback imediato no formulário: exige parte local, "@",
// domínio sem pontos consecutivos e TLD com pelo menos duas letras. Não substitui a confirmação
// do endereço pelo envio de uma mensagem.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[a-zA-Z]{2,}$/

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim())
}
