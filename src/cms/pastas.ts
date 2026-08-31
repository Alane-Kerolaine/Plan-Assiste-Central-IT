/**
 * Arvore de pastas para os acervos da administracao.
 *
 * Nem todo acervo tem caminho de arquivo: noticia se organiza por categoria e
 * banner por carrossel. Por isso quem chama informa os segmentos de cada item,
 * e este modulo so agrupa — o que mantem a mesma navegacao servindo as quatro
 * secoes sem que nenhuma precise inventar um caminho falso.
 */

export type ItemComPasta<T> = {
  item: T
  /** Pastas ate o item, da mais externa para a mais interna. */
  segmentos: string[]
}

export type Pasta = {
  nome: string
  /** Itens diretamente dentro dela e em tudo abaixo. */
  total: number
}

export type ConteudoDaPasta<T> = {
  pastas: Pasta[]
  itens: T[]
}

function comecaCom(segmentos: string[], caminho: string[]): boolean {
  return caminho.every((parte, indice) => segmentos[indice] === parte)
}

/** Pastas e itens que aparecem em um ponto da arvore. */
export function conteudoDaPasta<T>(entradas: Array<ItemComPasta<T>>, caminho: string[]): ConteudoDaPasta<T> {
  const dentro = entradas.filter((entrada) => comecaCom(entrada.segmentos, caminho))

  const contagem = new Map<string, number>()
  const itens: T[] = []

  for (const entrada of dentro) {
    const proximo = entrada.segmentos[caminho.length]
    if (proximo === undefined) itens.push(entrada.item)
    else contagem.set(proximo, (contagem.get(proximo) ?? 0) + 1)
  }

  const pastas = [...contagem.entries()]
    .map(([nome, total]) => ({ nome, total }))
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { numeric: true }))

  return { pastas, itens }
}

/**
 * Segmentos a partir de um endereco de arquivo.
 *
 * O nome do arquivo nao vira pasta, e o que foi enviado pelo navegador nao tem
 * caminho nenhum — cai numa pasta propria em vez de se misturar a raiz.
 */
export function segmentosDoCaminho(url: string, rotuloSemCaminho = 'Enviados pelo portal'): string[] {
  if (!url || url.startsWith('data:')) return [rotuloSemCaminho]
  const semParametros = url.split('?')[0].split('#')[0]
  const partes = semParametros.replace(/^\/+/, '').split('/').filter(Boolean)
  // A ultima parte e o proprio arquivo.
  return partes.slice(0, -1)
}
