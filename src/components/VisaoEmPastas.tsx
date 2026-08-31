import type { ReactNode } from 'react'
import { ChevronRight, Folder, House } from 'lucide-react'
import { conteudoDaPasta, type ItemComPasta } from '../cms/pastas'

/**
 * Navegacao em pastas para os acervos: trilha no topo, pastas e depois os itens.
 *
 * A contagem em cada pasta evita o vaivem de abrir para descobrir que esta
 * vazia, e a trilha permite voltar a qualquer nivel sem passar pelos de baixo.
 */
export function VisaoEmPastas<T>({
  entradas,
  caminho,
  onNavegar,
  renderItens,
  rotuloRaiz = 'Acervo',
  vazio = 'Nada nesta pasta.',
}: {
  entradas: Array<ItemComPasta<T>>
  caminho: string[]
  onNavegar: (caminho: string[]) => void
  renderItens: (itens: T[]) => ReactNode
  rotuloRaiz?: string
  vazio?: string
}) {
  const { pastas, itens } = conteudoDaPasta(entradas, caminho)

  return (
    <div className="cms-pastas">
      <nav className="cms-pastas-trilha" aria-label="Caminho até a pasta atual">
        <button type="button" onClick={() => onNavegar([])} disabled={caminho.length === 0}>
          <House aria-hidden="true" /> {rotuloRaiz}
        </button>
        {caminho.map((parte, indice) => (
          <span key={`${parte}-${indice}`}>
            <ChevronRight aria-hidden="true" />
            <button
              type="button"
              onClick={() => onNavegar(caminho.slice(0, indice + 1))}
              disabled={indice === caminho.length - 1}
            >
              {parte}
            </button>
          </span>
        ))}
      </nav>

      {pastas.length > 0 && (
        <ul className="cms-pastas-grade">
          {pastas.map((pasta) => (
            <li key={pasta.nome}>
              <button type="button" onClick={() => onNavegar([...caminho, pasta.nome])}>
                <Folder aria-hidden="true" />
                <span>
                  <strong>{pasta.nome}</strong>
                  <small>{pasta.total} {pasta.total === 1 ? 'item' : 'itens'}</small>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {itens.length > 0
        ? <div className="cms-pastas-itens">{renderItens(itens)}</div>
        : pastas.length === 0 && <p className="cms-live-files-empty">{vazio}</p>}
    </div>
  )
}
