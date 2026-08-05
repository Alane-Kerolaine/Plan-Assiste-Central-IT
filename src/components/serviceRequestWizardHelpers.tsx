import { Info } from 'lucide-react'
import type { ServiceField, ServiceFormSchema } from '../data/serviceFormSchemas'
import { maskCep, maskCpf, maskPhone } from '../utils/inputMasks'
import { BrazilianDateInput } from './BrazilianDateInput'
import { Combobox } from './Combobox'

export type WizardStep = 'form' | 'review' | 'success'

export const DEFAULT_SUCCESS_SECONDARY_ACTION = { label: 'Ver solicitações', to: '/beneficiario/solicitacoes' }

export const WIZARD_STEPS: { id: WizardStep, label: string }[] = [
  { id: 'form', label: 'Formulário' },
  { id: 'review', label: 'Revisão' },
  { id: 'success', label: 'Solicitação enviada' },
]

export function initialValues(schema: ServiceFormSchema): Record<string, string> {
  const values: Record<string, string> = {}
  schema.sections.forEach((section) => {
    section.fields.forEach((field) => {
      values[field.id] = field.defaultValue ?? ''
    })
  })
  return values
}

export function isoDateToBr(value: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  const [year, month, day] = value.split('-')
  return `${day}/${month}/${year}`
}

export function formatReviewValue(field: ServiceField, value: string | undefined): string {
  if (field.type === 'checkbox') return value === 'true' ? 'Confirmado' : 'Não confirmado'
  if (!value?.trim()) return '–'
  if (field.type === 'date') return isoDateToBr(value)

  return value
}

export function renderField(field: ServiceField, value: string, onChange: (value: string) => void) {
  if (field.type === 'note') {
    return (
      <p className="service-field-note wide" key={field.id}>{field.label}</p>
    )
  }

  if (field.type === 'radio') {
    return (
      <div className="service-radio-group wide" key={field.id}>
        {(field.options ?? []).map((option) => (
          <label className="responsibility-term wide" key={option}>
            <input
              type="radio"
              name={field.id}
              checked={value === option}
              onChange={() => onChange(option)}
            />
            {option}
          </label>
        ))}
      </div>
    )
  }

  if (field.type === 'checkbox') {
    return (
      <label className="responsibility-term wide" key={field.id}>
        <input
          type="checkbox"
          checked={value === 'true'}
          onChange={(event) => onChange(event.target.checked ? 'true' : '')}
        />
        {field.label}
      </label>
    )
  }

  const labelClassName = field.fullWidth
    ? 'wide'
    : field.columnSpan === 3
      ? 'span-3'
      : field.columnSpan === 2
        ? 'half-width'
        : undefined
  const requiredMark = field.required ? ' *' : ''
  const fieldInfoIcon = field.infoText && (
    <span className="field-info-icon" data-tooltip={field.infoText} tabIndex={0} role="img" aria-label={field.infoText}>
      <Info aria-hidden="true" />
    </span>
  )

  if (field.type === 'select' || field.type === 'combobox') {
    const comboboxOptions = (field.options ?? []).map((option) => ({ value: option, label: option }))
    return (
      <label className={labelClassName} key={field.id}>
        <span className="service-field-label-text">{field.label}{requiredMark}{fieldInfoIcon}</span>
        <Combobox value={value} options={comboboxOptions} onSelect={onChange} placeholder={field.placeholder ?? 'Selecione'} />
      </label>
    )
  }

  if (field.type === 'textarea') {
    return (
      <label className={labelClassName} key={field.id}>
        <span className="service-field-label-text">{field.label}{requiredMark}{fieldInfoIcon}</span>
        <textarea value={value} placeholder={field.placeholder} rows={6} onChange={(event) => onChange(event.target.value)} />
      </label>
    )
  }

  if (field.type === 'date') {
    return (
      <label className={labelClassName} key={field.id}>
        <span className="service-field-label-text">{field.label}{requiredMark}{fieldInfoIcon}</span>
        <BrazilianDateInput disabled={field.disabled} required={field.required} value={value} onChangeValue={onChange} />
      </label>
    )
  }

  const fieldMask = field.format === 'phone' ? maskPhone : field.format === 'cpf' ? maskCpf : field.format === 'cep' ? maskCep : undefined
  const inputType = field.format === 'email' ? 'email' : 'text'
  const inputMode = fieldMask ? 'numeric' : undefined
  const maxLength = field.format === 'phone' ? 15 : field.format === 'cpf' ? 14 : field.format === 'cep' ? 9 : undefined

  return (
    <label className={labelClassName} key={field.id}>
      <span className="service-field-label-text">{field.label}{requiredMark}{fieldInfoIcon}</span>
      <input
        type={inputType}
        inputMode={inputMode}
        maxLength={maxLength}
        value={value}
        disabled={field.disabled}
        placeholder={field.placeholder}
        onChange={(event) => onChange(fieldMask ? fieldMask(event.target.value) : event.target.value)}
      />
    </label>
  )
}
