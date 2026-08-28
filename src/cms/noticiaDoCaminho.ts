import { getSiteContent, type CmsNewsItem } from './siteContentRepository'

const RAIZ_NOTICIA = '/noticias'

/** Identifica a noticia aberta a partir do caminho: /noticias/<id>. */
export function idDaNoticia(caminho: string): string | undefined {
  const limpo = caminho.split('?')[0].split('#')[0].replace(/\/+$/, '')
  if (!limpo.startsWith(RAIZ_NOTICIA + '/')) return undefined
  const id = limpo.slice(RAIZ_NOTICIA.length + 1)
  return id.includes('/') || !id ? undefined : id
}

/** A listagem tambem e editavel: dali se cria uma noticia. */
export function ehAreaDeNoticias(caminho: string): boolean {
  const limpo = caminho.split('?')[0].split('#')[0].replace(/\/+$/, '')
  return limpo === RAIZ_NOTICIA || idDaNoticia(caminho) !== undefined
}

function noticiaVazia(categoria: string): CmsNewsItem {
  return {
    id: crypto.randomUUID(),
    title: '',
    summary: '',
    category: categoria,
    author: '',
    publishDate: new Date().toISOString().slice(0, 10),
    status: 'draft',
    audience: 'Ambos',
    scope: 'Nacional',
    coverUrl: '',
    bodyImageUrl: '',
    content: '',
    updatedAt: new Date().toISOString(),
  }
}

/**
 * Noticia a ser editada a partir do caminho aberto: a existente quando se esta
 * na pagina dela, ou uma nova quando se esta na listagem.
 */
export function noticiaParaEdicao(caminho: string): CmsNewsItem {
  const site = getSiteContent()
  const id = idDaNoticia(caminho)
  const existente = id ? site.news.find((item) => item.id === id) : undefined
  return existente ?? noticiaVazia(site.newsCategories[0] || 'Geral')
}
