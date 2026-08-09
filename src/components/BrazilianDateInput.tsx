import { useState } from 'react'

type BrazilianDateInputProps = {
  className?: string
  disabled?: boolean
  id?: string
  name?: string
  onChangeValue?: (value: string) => void
  readOnly?: boolean
  required?: boolean
  value?: string
}

function maskBrazilianDate(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
}

export function BrazilianDateInput({ className, disabled, id, name, onChangeValue, readOnly, required, value }: BrazilianDateInputProps) {
  const [internalValue, setInternalValue] = useState('')
  const currentValue = value ?? internalValue

  return (
    <input
      aria-label="Data no formato dia, mês e ano"
      className={className}
      disabled={disabled}
      id={id}
      inputMode="numeric"
      maxLength={10}
      name={name}
      pattern="(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}"
      placeholder="dd/mm/aaaa"
      readOnly={readOnly}
      required={required}
      title="Informe a data no formato dd/mm/aaaa"
      type="text"
      value={currentValue}
      onChange={(event) => {
        const nextValue = maskBrazilianDate(event.target.value)
        if (value === undefined) setInternalValue(nextValue)
        onChangeValue?.(nextValue)
      }}
    />
  )
}
