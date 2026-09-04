import { LayoutGrid, List } from 'lucide-react'

export type Visao = 'lista' | 'pastas'

/** Escolha entre a lista corrida e a navegacao em pastas do acervo. */
export function AlternadorDeVisao({ visao, onChange }: { visao: Visao, onChange: (visao: Visao) => void }) {
  return (
    <div className="cms-visao" role="group" aria-label="Forma de visualização">
      <button
        type="button"
        className={visao === 'lista' ? 'is-ativa' : undefined}
        aria-pressed={visao === 'lista'}
        onClick={() => onChange('lista')}
      >
        <List aria-hidden="true" /> Lista
      </button>
      <button
        type="button"
        className={visao === 'pastas' ? 'is-ativa' : undefined}
        aria-pressed={visao === 'pastas'}
        onClick={() => onChange('pastas')}
      >
        <LayoutGrid aria-hidden="true" /> Pastas
      </button>
    </div>
  )
}
