import { useState } from 'react'
import { isValidEmail } from '../utils/validation'

export const EMAIL_INVALIDO_MESSAGE = 'O e-mail informado não é válido.'

type Props = {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  readOnly?: boolean
  placeholder?: string
}

export function EmailTextInput({ value, onChange, disabled, readOnly, placeholder }: Props) {
  // O alerta só aparece depois que o usuário sai do campo, para não acusar erro
  // enquanto o endereço ainda está sendo digitado.
  const [visitado, setVisitado] = useState(false)
  // Campo somente leitura traz dado do cadastro: acusar erro aqui não ajuda, já que o usuário
  // não pode corrigi-lo nesta tela.
  const invalido = !readOnly && visitado && value.trim().length > 0 && !isValidEmail(value)

  return (
    <>
      <input
        type="email"
        value={value}
        disabled={disabled}
        readOnly={readOnly}
        placeholder={placeholder}
        aria-invalid={invalido || undefined}
        onBlur={() => setVisitado(true)}
        onChange={(event) => onChange(event.target.value)}
      />
      {invalido && <span className="field-error-text" role="alert">{EMAIL_INVALIDO_MESSAGE}</span>}
    </>
  )
}
