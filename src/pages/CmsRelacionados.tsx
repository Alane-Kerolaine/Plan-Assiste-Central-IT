import { useState } from 'react'
import { ArrowDown, ArrowUp, Newspaper, Files, Search, X } from 'lucide-react'
import { useCmsSnapshot, type CmsRelatedRef } from '../cms/contentRepository'
import { caminhoDoSlug } from '../cms/portalNavegacao'
import { getSiteContent } from '../cms/siteContentRepository'
import { normalizaTexto } from '../utils/texto'

type Candidato = { ref: CmsRelatedRef, titulo: string, caminho: string }

/** Chave estavel para comparar duas referencias. */
function chave(ref: CmsRelatedRef): string {
  return `${ref.kind}:${ref.id}`
}

/**
 * Escolha manual dos conteudos relacionados de uma notícia ou página.
 *
 * A ordem importa: é a ordem em que os itens saem no portal, por isso as setas
 * de subir e descer. Sem nenhuma escolha, o portal mantém o preenchimento
 * automático por categoria — a lista vazia não significa "sem relacionados".
 */
export function CmsRelacionados({
  valor,
  excluir,
  onChange,
}: {
  valor: CmsRelatedRef[]
  /** Referência do próprio conteúdo em edição, para não se relacionar consigo. */
  excluir?: CmsRelatedRef
  onChange: (valor: CmsRelatedRef[]) => void
}) {
  const paginas = useCmsSnapshot().pages
  const [busca, setBusca] = useState('')

  const candidatos: Candidato[] = [
    ...getSiteContent().news.map((noticia) => ({
      ref: { kind: 'news' as const, id: noticia.id },
      titulo: noticia.title || '(sem título)',
      caminho: `/noticias/${noticia.id}`,
    })),
    ...paginas.map((pagina) => ({
      ref: { kind: 'page' as const, id: pagina.slug },
      titulo: pagina.title || pagina.slug,
      caminho: caminhoDoSlug(pagina.slug),
    })),
  ].filter((item) => !excluir || chave(item.ref) !== chave(excluir))

  const escolhidos = valor
    .map((ref) => candidatos.find((item) => chave(item.ref) === chave(ref)))
    .filter((item): item is Candidato => item !== undefined)

  const termo = normalizaTexto(busca.trim())
  const disponiveis = candidatos
    .filter((item) => !valor.some((ref) => chave(ref) === chave(item.ref)))
    .filter((item) => !termo || normalizaTexto(item.titulo).includes(termo))

  function adicionar(ref: CmsRelatedRef) {
    onChange([...valor, ref])
    setBusca('')
  }

  function remover(ref: CmsRelatedRef) {
    onChange(valor.filter((item) => chave(item) !== chave(ref)))
  }

  function mover(indice: number, passo: -1 | 1) {
    const destino = indice + passo
    if (destino < 0 || destino >= valor.length) return
    const copia = [...valor]
    ;[copia[indice], copia[destino]] = [copia[destino], copia[indice]]
    onChange(copia)
  }

  return (
    <div className="cms-relacionados">
      {escolhidos.length === 0 ? (
        <p className="cms-relacionados-vazio">
          Nenhum conteúdo escolhido. O portal mostra automaticamente as notícias da mesma categoria.
        </p>
      ) : (
        <ol className="cms-relacionados-lista">
          {escolhidos.map((item, indice) => (
            <li key={chave(item.ref)}>
              {item.ref.kind === 'news' ? <Newspaper aria-hidden="true" /> : <Files aria-hidden="true" />}
              <span>
                <strong>{item.titulo}</strong>
                <small>{item.caminho}</small>
              </span>
              <button type="button" title="Subir" aria-label={`Subir ${item.titulo}`} disabled={indice === 0} onClick={() => mover(indice, -1)}>
                <ArrowUp aria-hidden="true" />
              </button>
              <button type="button" title="Descer" aria-label={`Descer ${item.titulo}`} disabled={indice === escolhidos.length - 1} onClick={() => mover(indice, 1)}>
                <ArrowDown aria-hidden="true" />
              </button>
              <button type="button" title="Remover" aria-label={`Remover ${item.titulo}`} onClick={() => remover(item.ref)}>
                <X aria-hidden="true" />
              </button>
            </li>
          ))}
        </ol>
      )}

      <label className="cms-relacionados-busca">
        <span className="sr-only">Buscar conteúdo para relacionar</span>
        <Search aria-hidden="true" />
        <input
          type="search"
          value={busca}
          onChange={(evento) => setBusca(evento.target.value)}
          placeholder="Buscar notícia ou página para adicionar"
        />
      </label>

      {termo && (
        <ul className="cms-relacionados-resultados">
          {disponiveis.length === 0
            ? <li className="cms-relacionados-vazio">Nada encontrado com “{busca.trim()}”.</li>
            : disponiveis.slice(0, 8).map((item) => (
              <li key={chave(item.ref)}>
                <button type="button" onClick={() => adicionar(item.ref)}>
                  {item.ref.kind === 'news' ? <Newspaper aria-hidden="true" /> : <Files aria-hidden="true" />}
                  <span>
                    <strong>{item.titulo}</strong>
                    <small>{item.caminho}</small>
                  </span>
                </button>
              </li>
            ))}
        </ul>
      )}
    </div>
  )
}
