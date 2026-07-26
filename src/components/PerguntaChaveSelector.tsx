import { useId, type KeyboardEvent } from 'react'
import type { CasoInstrucaoServico } from '../data/serviceFormSchemas'

type PerguntaChaveSelectorProps = {
  enunciado: string
  casos: CasoInstrucaoServico[]
  value: string
  onChange: (casoId: string) => void
}

export function PerguntaChaveSelector({ enunciado, casos, value, onChange }: PerguntaChaveSelectorProps) {
  const baseId = useId()
  const enunciadoId = `${baseId}-enunciado`
  const selectedIndex = Math.max(0, casos.findIndex((caso) => caso.id === value))

  function focusCard(index: number) {
    document.getElementById(`${baseId}-caso-${casos[index].id}`)?.focus()
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault()
      const next = (index + 1) % casos.length
      onChange(casos[next].id)
      focusCard(next)
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault()
      const previous = (index - 1 + casos.length) % casos.length
      onChange(casos[previous].id)
      focusCard(previous)
    }
  }

  return (
    <div className="pergunta-chave">
      <p className="pergunta-chave-enunciado" id={enunciadoId}>{enunciado}</p>
      <div className="pergunta-chave-grid" role="radiogroup" aria-labelledby={enunciadoId}>
        {casos.map((caso, index) => {
          const isSelected = caso.id === value
          return (
            <button
              aria-checked={isSelected}
              className={`pergunta-chave-card${isSelected ? ' is-selected' : ''}`}
              id={`${baseId}-caso-${caso.id}`}
              key={caso.id}
              onClick={() => onChange(caso.id)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              role="radio"
              tabIndex={index === selectedIndex ? 0 : -1}
              type="button"
            >
              {caso.icone && <span aria-hidden="true" className="pergunta-chave-icone">{caso.icone}</span>}
              <span className="pergunta-chave-titulo">{caso.titulo}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
