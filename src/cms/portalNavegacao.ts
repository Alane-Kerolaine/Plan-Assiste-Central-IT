import type { CmsPage } from './contentRepository'

function limparCaminho(caminho: string): string {
  return caminho.split('?')[0].split('#')[0].replace(/^\/+/, '').replace(/\/+$/, '')
}

/**
 * Slug que o portal usa para procurar a versao gerenciada da pagina.
 *
 * Nao e o caminho puro: cada familia de rota resolve o seu de um jeito. Os
 * artigos do Plan-Assiste, por exemplo, ficam sob /plan-assiste/<slug> mas sao
 * procurados so por <slug>. Devolve undefined quando a rota aberta nao troca o
 * conteudo pelo CMS — nesses casos, editar salvaria sem efeito visivel.
 */
export function slugDoCaminho(caminho: string): string | undefined {
  const limpo = limparCaminho(caminho)

  if (limpo === 'plan-assiste') return 'plan-assiste'
  if (limpo.startsWith('plan-assiste/')) return limpo.slice('plan-assiste/'.length)
  if (limpo === 'transparencia' || limpo.startsWith('transparencia/')) return limpo
  if (limpo === 'fale-conosco/duvidas-frequentes') return limpo

  return undefined
}

/** Rotas em que a edicao realmente aparece no portal. */
export function edicaoTemEfeito(caminho: string): boolean {
  return slugDoCaminho(caminho) !== undefined
}

export type EstadoPagina = {
  rotulo: string
  tom: 'publicada' | 'rascunho' | 'original' | 'indisponivel'
  descricao: string
  pagina?: CmsPage
}

/**
 * Situacao da pagina aberta: se a rota e gerenciavel e, sendo, se ja existe
 * versao salva e se ela esta no ar.
 */
export function estadoDaPagina(paginas: CmsPage[], caminho: string): EstadoPagina {
  const slug = slugDoCaminho(caminho)

  if (slug === undefined) {
    return {
      rotulo: 'Fora do gerenciador',
      tom: 'indisponivel',
      descricao: 'Esta area do portal ainda nao e gerenciada por conteudo. A edicao esta disponivel em Plan-Assiste, Transparencia e Duvidas frequentes.',
    }
  }

  const pagina = paginas.find((item) => item.slug === slug)

  if (!pagina) {
    return {
      rotulo: 'Conteudo original',
      tom: 'original',
      descricao: 'Esta pagina ainda nao foi personalizada. Ao editar, o conteudo publicado e carregado para voce ajustar.',
    }
  }
  if (pagina.status === 'published') {
    return {
      rotulo: 'Publicada',
      tom: 'publicada',
      descricao: 'Esta versao esta no ar. O que aparece abaixo e o que o publico enxerga.',
      pagina,
    }
  }
  return {
    rotulo: 'Rascunho',
    tom: 'rascunho',
    descricao: 'Ha uma versao em rascunho. O publico continua vendo o conteudo original ate a publicacao.',
    pagina,
  }
}

/**
 * Caminho do portal para um slug do CMS — inverso de slugDoCaminho.
 *
 * Os artigos do Plan-Assiste guardam so o proprio nome, entao qualquer slug que
 * nao seja de outra familia conhecida pertence aquela secao.
 */
export function caminhoDoSlug(slug: string): string {
  if (slug === 'transparencia' || slug.startsWith('transparencia/')) return `/${slug}`
  if (slug === 'fale-conosco/duvidas-frequentes') return `/${slug}`
  if (slug === 'plan-assiste') return '/plan-assiste'
  return `/plan-assiste/${slug}`
}

/** Slug da pagina mae, ou undefined na raiz da familia. */
export function slugDaMae(slug: string): string | undefined {
  if (slug === 'plan-assiste' || slug === 'transparencia') return undefined
  if (slug.includes('/')) return slug.split('/').slice(0, -1).join('/')
  // Artigo do Plan-Assiste: a mae e o indice da secao.
  return 'plan-assiste'
}

/**
 * Ancestrais da pagina, da mais alta para a mae direta, seguindo parentSlug.
 *
 * Serve a trilha de navegacao das paginas criadas pela equipe: sem isso uma
 * filha apareceria pendurada direto na raiz, escondendo a pagina mae.
 */
export function trilhaDaPagina(paginas: CmsPage[], slug: string): CmsPage[] {
  const trilha: CmsPage[] = []
  const visitados = new Set<string>([slug])
  let atual = paginas.find((item) => item.slug === slug)?.parentSlug ?? undefined

  while (atual) {
    // Ciclo em parentSlug travaria o portal: para na primeira repeticao.
    if (visitados.has(atual)) break
    visitados.add(atual)
    const mae = paginas.find((item) => item.slug === atual)
    if (!mae) break
    trilha.unshift(mae)
    atual = mae.parentSlug ?? undefined
  }

  return trilha
}

/**
 * Slug de uma pagina filha, dado o slug da mae e o endereco escolhido.
 *
 * Nao e a simples juncao das duas partes: os artigos do Plan-Assiste guardam so
 * o proprio nome, entao filha de 'plan-assiste' fica com o endereco puro. Juntar
 * mecanicamente produziria 'plan-assiste/eleicoes', que caminhoDoSlug traduziria
 * para /plan-assiste/plan-assiste/eleicoes.
 */
export function slugFilho(slugDaMaeEscolhida: string, endereco: string): string {
  if (!slugDaMaeEscolhida || slugDaMaeEscolhida === 'plan-assiste') return endereco
  return `${slugDaMaeEscolhida}/${endereco}`
}
