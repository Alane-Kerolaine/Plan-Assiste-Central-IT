import { Printer } from 'lucide-react'
import type { ReactNode } from 'react'

type ResultsHeaderOption = {
  value: string
  label: string
}

export function ResultsHeader({
  title,
  titleId,
  countLabel,
  displayOptions,
  displayValue,
  onDisplayChange,
  extraActions,
  showPrint = true,
}: {
  title: string
  titleId?: string
  countLabel: string
  displayOptions?: ResultsHeaderOption[]
  displayValue?: string
  onDisplayChange?: (value: string) => void
  extraActions?: ReactNode
  showPrint?: boolean
}) {
  return (
    <div className="standard-results-header">
      <h2 id={titleId}>{title}</h2>
      <div className="standard-results-meta">
        <span className="standard-results-count" aria-live="polite">{countLabel}</span>
        <div className="standard-results-actions">
          {displayOptions && displayValue !== undefined && onDisplayChange && (
            <fieldset className="standard-results-display standard-results-checkboxes">
              <legend className="sr-only">Filtrar resultados exibidos</legend>
              {displayOptions.filter((option) => option.value !== 'all').map((option) => (
                <label key={option.value}>
                  <input type="checkbox" checked={displayValue === option.value} onChange={(event) => onDisplayChange(event.target.checked ? option.value : 'all')} />
                  {option.label}
                </label>
              ))}
            </fieldset>
          )}
          {extraActions}
          {showPrint && (
            <button className="standard-results-print" type="button" onClick={() => window.print()}>
              <Printer aria-hidden="true" /> Imprimir
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
