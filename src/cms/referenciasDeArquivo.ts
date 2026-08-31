import { caminhoDoSlug } from './portalNavegacao'
import type { CmsBlock, CmsPage } from './contentRepository'
import type { CmsNewsItem } from './siteContentRepository'

/** Um lugar do portal que aponta para o arquivo. */
export type Referencia = {
  /** Onde aparece, para a equipe reconhecer sem abrir. */
  titulo: string
  /** Endereco no portal, quando existir. */
  caminho: string
  /** Em que parte daquele conteudo: bloco, corpo do texto, capa… */
  onde: string
}

function blocoUsa(bloco: CmsBlock, url: string): string | undefined {
  if (bloco.href === url) return bloco.type === 'document' ? 'bloco de documento' : 'link do bloco'
  if (bloco.mediaUrl === url) return 'bloco de imagem ou vídeo'
  if ((bloco.galleryItems ?? []).some((item) => item.url === url)) return 'carrossel de imagens'
  if (bloco.content.includes(url)) return 'texto do bloco'
  return undefined
}

/** Descreve o bloco para a lista, com o titulo quando houver. */
function rotuloDoBloco(bloco: CmsBlock, onde: string): string {
  return bloco.title.trim() ? `${onde} “${bloco.title.trim()}”` : onde
}

/**
 * Onde o arquivo esta em uso, em paginas e noticias.
 *
 * A busca e por endereco porque e assim que os blocos guardam o arquivo hoje.
 * Serve para avisar antes de substituir ou excluir: sem isso, a troca acontece
 * as cegas e a exclusao deixa links quebrados espalhados pelo portal.
 */
export function referenciasDoArquivo(paginas: CmsPage[], noticias: CmsNewsItem[], url: string): Referencia[] {
  if (!url) return []
  const encontradas: Referencia[] = []

  for (const pagina of paginas) {
    const titulo = pagina.title || pagina.slug
    const caminho = caminhoDoSlug(pagina.slug)

    for (const bloco of pagina.blocks) {
      const onde = blocoUsa(bloco, url)
      if (onde) encontradas.push({ titulo, caminho, onde: rotuloDoBloco(bloco, onde) })
    }
    if ((pagina.files ?? []).some((arquivo) => arquivo.url === url)) {
      encontradas.push({ titulo, caminho, onde: 'arquivos desta página' })
    }
  }

  for (const noticia of noticias) {
    const titulo = noticia.title || '(notícia sem título)'
    const caminho = `/noticias/${noticia.id}`

    if (noticia.coverUrl === url) encontradas.push({ titulo, caminho, onde: 'imagem de capa' })
    if (noticia.bodyImageUrl === url) encontradas.push({ titulo, caminho, onde: 'imagem interna' })
    if (noticia.content.includes(url)) encontradas.push({ titulo, caminho, onde: 'corpo da notícia' })
    for (const bloco of noticia.blocks ?? []) {
      const onde = blocoUsa(bloco, url)
      if (onde) encontradas.push({ titulo, caminho, onde: rotuloDoBloco(bloco, onde) })
    }
  }

  return encontradas
}

function trocaNoBloco(bloco: CmsBlock, antigo: string, novo: string): CmsBlock {
  return {
    ...bloco,
    href: bloco.href === antigo ? novo : bloco.href,
    mediaUrl: bloco.mediaUrl === antigo ? novo : bloco.mediaUrl,
    galleryItems: bloco.galleryItems?.map((item) => item.url === antigo ? { ...item, url: novo } : item),
    content: bloco.content.replaceAll(antigo, novo),
  }
}

/** Aplica o novo endereco em toda pagina que apontava para o antigo. */
export function trocarNasPaginas(paginas: CmsPage[], antigo: string, novo: string): CmsPage[] {
  return paginas.map((pagina) => ({
    ...pagina,
    blocks: pagina.blocks.map((bloco) => trocaNoBloco(bloco, antigo, novo)),
    files: pagina.files?.map((arquivo) => arquivo.url === antigo ? { ...arquivo, url: novo } : arquivo),
  }))
}

/** O mesmo para as noticias: capa, imagem interna, corpo e blocos. */
export function trocarNasNoticias(noticias: CmsNewsItem[], antigo: string, novo: string): CmsNewsItem[] {
  return noticias.map((noticia) => ({
    ...noticia,
    coverUrl: noticia.coverUrl === antigo ? novo : noticia.coverUrl,
    bodyImageUrl: noticia.bodyImageUrl === antigo ? novo : noticia.bodyImageUrl,
    content: noticia.content.replaceAll(antigo, novo),
    blocks: noticia.blocks?.map((bloco) => trocaNoBloco(bloco, antigo, novo)),
  }))
}
