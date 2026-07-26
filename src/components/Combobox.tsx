import { useEffect, useState, type KeyboardEvent } from 'react'
import { ChevronDown, X } from 'lucide-react'

export type ComboboxOption = { value: string, label: string }

export function Combobox({ value, options, onSelect, placeholder, onClear }: { value: string, options: ComboboxOption[], onSelect: (value: string) => void, placeholder?: string, onClear?: () => void }) {
  const selectedLabel = options.find((option) => option.value === value)?.label || ''
  const [query, setQuery] = useState(selectedLabel)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const label = options.find((option) => option.value === value)?.label ?? ''
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (label !== query) setQuery(label)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])
  const [filterActive, setFilterActive] = useState(false)
  const [highlighted, setHighlighted] = useState(0)
  const filtered = filterActive ? options.filter((option) => option.label.toLowerCase().includes(query.toLowerCase())) : options
  function choose(option: ComboboxOption) {
    onSelect(option.value)
    setQuery(option.label)
    setFilterActive(false)
    setOpen(false)
  }
  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown') { event.preventDefault(); setOpen(true); setHighlighted((current) => Math.min(current + 1, filtered.length - 1)) }
    else if (event.key === 'ArrowUp') { event.preventDefault(); setHighlighted((current) => Math.max(current - 1, 0)) }
    else if (event.key === 'Enter') { const option = filtered[highlighted]; if (option) { event.preventDefault(); choose(option) } }
    else if (event.key === 'Escape') { setOpen(false) }
  }
  return <span className={`cms-combobox${onClear ? ' has-clear' : ''}`} onBlur={() => window.setTimeout(() => setOpen(false), 150)}>
    <span className="field-with-icon">
      <input
        value={query}
        onFocus={(event) => { setOpen(true); event.target.select() }}
        onChange={(event) => { setQuery(event.target.value); setFilterActive(true); setOpen(true); setHighlighted(0) }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
      />
      {onClear && (
        <button
          type="button"
          className="combobox-clear"
          aria-label="Limpar seleção"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => { onClear(); setOpen(false) }}
        >
          <X aria-hidden="true" />
        </button>
      )}
      <ChevronDown aria-hidden="true" />
    </span>
    {open && <ul className="cms-combobox-list">
      {filtered.length === 0 && <li className="cms-combobox-empty">Nenhum resultado encontrado</li>}
      {filtered.map((option, index) => <li key={option.value || 'empty'} className={index === highlighted ? 'is-highlighted' : ''} onMouseEnter={() => setHighlighted(index)} onMouseDown={(event) => event.preventDefault()} onClick={() => choose(option)}>{option.label}</li>)}
    </ul>}
  </span>
}
