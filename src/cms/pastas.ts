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

/** Segmentos de um item do acervo: a pasta escolhida a mao vence o endereco. */
export function segmentosDoAcervo(asset: { url: string, folder?: string }): string[] {
  if (asset.folder) return asset.folder.split('/').filter(Boolean)
  return segmentosDoCaminho(asset.url)
}

/** Junta o caminho aberto e o nome digitado, recusando o que ficaria vazio. */
export function caminhoDaNovaPasta(caminho: string[], nome: string): string[] | undefined {
  // Barra separa niveis: no nome de uma pasta ela viraria hierarquia sem querer.
  const limpo = nome.trim().replace(/[/\\]/g, ' ').replace(/\s+/g, ' ').trim()
  return limpo ? [...caminho, limpo] : undefined
}

/**
 * Pasta de um item que tem pasta natural e pode ganhar uma escolhida a mao.
 *
 * A pasta manual e apenas organizacao: nao muda o que o item e nem onde ele
 * aparece no portal. Um slide movido de pasta continua no mesmo carrossel.
 */
export function segmentosComPastaManual(folder: string | undefined, padrao: string[]): string[] {
  if (folder) return folder.split('/').filter(Boolean)
  return padrao
}

/** True quando o item esta na pasta indicada ou em alguma abaixo dela. */
export function dentroDaPasta(segmentos: string[], caminho: string[]): boolean {
  return caminho.every((parte, indice) => segmentos[indice] === parte)
}

/**
 * Renomeia uma pasta: devolve o novo valor de `folder` para cada item que
 * estava nela ou abaixo dela, e undefined para os que nao mudam.
 */
export function folderAposRenomear(segmentos: string[], antigo: string[], novo: string[]): string | undefined {
  if (!dentroDaPasta(segmentos, antigo) || segmentos.length < antigo.length) return undefined
  return [...novo, ...segmentos.slice(antigo.length)].join('/')
}

/** Exclusao de pasta: o conteudo sobe um nivel em vez de ser apagado. */
export function folderAposExcluir(segmentos: string[], alvo: string[]): string | undefined {
  if (!dentroDaPasta(segmentos, alvo) || segmentos.length < alvo.length) return undefined
  return alvo.slice(0, -1).join('/')
}
