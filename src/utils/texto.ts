/**
 * Normaliza para comparacao: sem acento e sem caixa, de modo que "medico"
 * encontre "médico" e "NOTICIA" encontre "Notícia".
 */
export function normalizaTexto(texto: string): string {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

/**
 * Endereco de pagina a partir do titulo: sem acento, em minusculas e com hifen
 * no lugar de espaco e pontuacao, como o portal ja usa nos enderecos existentes.
 */
export function enderecoDeTitulo(titulo: string): string {
  return normalizaTexto(titulo)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
