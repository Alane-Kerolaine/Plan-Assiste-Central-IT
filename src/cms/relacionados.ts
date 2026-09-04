import { useCmsSnapshot, type CmsPage, type CmsRelatedRef } from './contentRepository'
import { caminhoDoSlug } from './portalNavegacao'
import { getSiteContent, type CmsNewsItem } from './siteContentRepository'

export type ItemRelacionado = {
  chave: string
  titulo: string
  resumo: string
  caminho: string
  ehNoticia: boolean
}

/**
 * Resolve as referencias escolhidas na edicao para itens exibiveis, na ordem em
 * que foram escolhidas, descartando o que nao existe mais ou nao esta publicado
 * — uma noticia excluida nao pode deixar um card quebrado na pagina que a citava.
 */
export function resolverRelacionados(
  paginas: CmsPage[],
  noticias: CmsNewsItem[],
  refs: CmsRelatedRef[] | undefined,
): ItemRelacionado[] {
  if (!refs || refs.length === 0) return []

  return refs.flatMap((ref): ItemRelacionado[] => {
    if (ref.kind === 'news') {
      const noticia = noticias.find((item) => item.id === ref.id && item.status === 'published')
      return noticia
        ? [{ chave: `news:${ref.id}`, titulo: noticia.title, resumo: noticia.summary, caminho: `/noticias/${noticia.id}`, ehNoticia: true }]
        : []
    }
    const pagina = paginas.find((item) => item.slug === ref.id && item.status === 'published')
    return pagina
      ? [{ chave: `page:${ref.id}`, titulo: pagina.navigationTitle || pagina.title, resumo: pagina.summary, caminho: caminhoDoSlug(pagina.slug), ehNoticia: false }]
      : []
  })
}

export function useRelacionados(refs: CmsRelatedRef[] | undefined): ItemRelacionado[] {
  const paginas = useCmsSnapshot().pages
  return resolverRelacionados(paginas, getSiteContent().news, refs)
}
