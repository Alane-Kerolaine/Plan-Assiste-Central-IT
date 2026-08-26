import { createCmsPage as criarPagina, type CmsPage } from './contentRepository'

/** O caminho do portal vira o slug usado pelo CMS: /plan-assiste -> plan-assiste */
export function caminhoParaSlug(caminho: string): string {
  return caminho.split('?')[0].split('#')[0].replace(/^\/+/, '').replace(/\/+$/, '')
}

export type EstadoPagina = {
  rotulo: string
  tom: 'publicada' | 'rascunho' | 'original'
  descricao: string
  pagina?: CmsPage
}

/**
 * Situação da página aberta no navegador: se já existe versão gerenciada e, em
 * caso afirmativo, se ela está no ar ou ainda em rascunho.
 */
export function estadoDaPagina(paginas: CmsPage[], caminho: string): EstadoPagina {
  const slug = caminhoParaSlug(caminho)
  const pagina = paginas.find((item) => item.slug === slug)

  if (!pagina) {
    return {
      rotulo: 'Conteúdo original',
      tom: 'original',
      descricao: 'Esta página ainda não foi personalizada. Ao editar, uma versão gerenciável é criada a partir do conteúdo atual.',
    }
  }
  if (pagina.status === 'published') {
    return {
      rotulo: 'Publicada',
      tom: 'publicada',
      descricao: 'Esta versão está no ar. O que aparece abaixo é o que o público enxerga.',
      pagina,
    }
  }
  return {
    rotulo: 'Rascunho',
    tom: 'rascunho',
    descricao: 'Há uma versão em rascunho. O público continua vendo o conteúdo original até a publicação.',
    pagina,
  }
}

/** Destino de edição da página aberta, criando a versão gerenciada se ainda não houver. */
export function rotaDeEdicao(estado: EstadoPagina, caminho: string): string {
  const base = '/area-da-equipe/administracao-do-portal/paginas'
  return estado.pagina
    ? `${base}/${estado.pagina.id}`
    : `${base}/base-${encodeURIComponent(caminhoParaSlug(caminho))}`
}

/**
 * Página a ser editada a partir do caminho aberto. Quando ainda não há versão
 * gerenciada, cria uma a partir do caminho, para que a edição comece no lugar
 * certo da hierarquia em vez de numa página solta.
 */
export function paginaParaEdicao(estado: EstadoPagina, caminho: string): CmsPage {
  if (estado.pagina) return estado.pagina
  const slug = caminhoParaSlug(caminho)
  const partes = slug.split('/')
  const base = criarPagina(slug)
  return {
    ...base,
    parentSlug: partes.length > 1 ? partes.slice(0, -1).join('/') : null,
    navigationTitle: '',
    title: '',
  }
}
