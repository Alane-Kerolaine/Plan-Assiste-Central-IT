import { useState, type ReactNode } from 'react'
import { Check, ChevronRight, Folder, House, Pencil, Trash2, X } from 'lucide-react'
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
  acoes,
  pastasVazias = [],
  vazio = 'Nada nesta pasta.',
  onRenomearPasta,
  onExcluirPasta,
  pastaEditavel,
}: {
  entradas: Array<ItemComPasta<T>>
  caminho: string[]
  onNavegar: (caminho: string[]) => void
  renderItens: (itens: T[]) => ReactNode
  rotuloRaiz?: string
  /** Botoes de criar, no contexto da pasta aberta. */
  acoes?: ReactNode
  /** Pastas guardadas que ainda nao tem item dentro. */
  pastasVazias?: string[][]
  vazio?: string
  /** Ausentes quando o acervo nao permite mexer nas pastas. */
  onRenomearPasta?: (nome: string, novo: string) => void
  onExcluirPasta?: (nome: string, total: number) => void
  /** Quais pastas aceitam renomear e excluir; sem isso, todas aceitam. */
  pastaEditavel?: (nome: string) => boolean
}) {
  const [renomeando, setRenomeando] = useState<string>()
  const [novoNome, setNovoNome] = useState('')
  const derivadas = conteudoDaPasta(entradas, caminho)
  // Pasta criada e ainda vazia nao aparece na arvore derivada dos itens.
  const vaziasAqui = pastasVazias
    .filter((partes) => partes.length === caminho.length + 1 && caminho.every((parte, i) => partes[i] === parte))
    .map((partes) => partes[partes.length - 1])
    .filter((nome) => !derivadas.pastas.some((pasta) => pasta.nome === nome))
  const pastas = [...derivadas.pastas, ...vaziasAqui.map((nome) => ({ nome, total: 0 }))]
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { numeric: true }))
  const itens = derivadas.itens

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

      {acoes && <div className="cms-pastas-acoes">{acoes}</div>}

      {pastas.length > 0 && (
        <ul className="cms-pastas-grade">
          {pastas.map((pasta) => {
            const editavel = (pastaEditavel?.(pasta.nome) ?? true) && Boolean(onRenomearPasta || onExcluirPasta)

            if (renomeando === pasta.nome) {
              const confirmar = () => {
                const limpo = novoNome.trim()
                if (limpo && limpo !== pasta.nome) onRenomearPasta?.(pasta.nome, limpo)
                setRenomeando(undefined)
              }
              return (
                <li key={pasta.nome} className="is-renomeando">
                  <div className="cms-pasta-renomear">
                    <label>
                      <span className="sr-only">Novo nome da pasta {pasta.nome}</span>
                      <input
                        autoFocus
                        value={novoNome}
                        onChange={(evento) => setNovoNome(evento.target.value)}
                        onKeyDown={(evento) => {
                          if (evento.key === 'Enter') { evento.preventDefault(); confirmar() }
                          if (evento.key === 'Escape') setRenomeando(undefined)
                        }}
                      />
                    </label>
                    <button type="button" onClick={confirmar} title="Confirmar" aria-label="Confirmar novo nome"><Check aria-hidden="true" /></button>
                    <button type="button" onClick={() => setRenomeando(undefined)} title="Cancelar" aria-label="Cancelar"><X aria-hidden="true" /></button>
                  </div>
                </li>
              )
            }

            return (
              <li key={pasta.nome}>
                <button type="button" onClick={() => onNavegar([...caminho, pasta.nome])}>
                  <Folder aria-hidden="true" />
                  <span>
                    <strong>{pasta.nome}</strong>
                    <small>{pasta.total} {pasta.total === 1 ? 'item' : 'itens'}</small>
                  </span>
                </button>
                {editavel && (
                  <div className="cms-pasta-acoes">
                    {onRenomearPasta && (
                      <button
                        type="button"
                        title={`Renomear a pasta ${pasta.nome}`}
                        aria-label={`Renomear a pasta ${pasta.nome}`}
                        onClick={() => { setRenomeando(pasta.nome); setNovoNome(pasta.nome) }}
                      >
                        <Pencil aria-hidden="true" />
                      </button>
                    )}
                    {onExcluirPasta && (
                      <button
                        type="button"
                        className="cms-table-remover"
                        title={`Excluir a pasta ${pasta.nome}`}
                        aria-label={`Excluir a pasta ${pasta.nome}`}
                        onClick={() => onExcluirPasta(pasta.nome, pasta.total)}
                      >
                        <Trash2 aria-hidden="true" />
                      </button>
                    )}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}

      {itens.length > 0
        ? <div className="cms-pastas-itens">{renderItens(itens)}</div>
        : <p className="cms-live-files-empty">{pastas.length === 0 ? vazio : 'Nenhum item solto nesta pasta.'}</p>}
    </div>
  )
}
