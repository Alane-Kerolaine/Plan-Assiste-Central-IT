import { Info } from 'lucide-react'
import { beneficiaries, type Beneficiary } from '../data/mock'
import type { ServiceField, ServiceFormSchema, ServiceFormSection } from '../data/serviceFormSchemas'
import { parseBrazilianDate } from '../utils/dates'
import { maskCep, maskCpf, maskCpfCnpj, maskPhone } from '../utils/inputMasks'
import { nomeExibicao } from '../utils/nomeSocial'
import { isValidEmail } from '../utils/validation'
import { BrazilianDateInput } from './BrazilianDateInput'
import { Combobox } from './Combobox'
import { EmailTextInput } from './EmailTextInput'

export type WizardStep = 'form' | 'review' | 'success'

export const DEFAULT_SUCCESS_SECONDARY_ACTION = { label: 'Ver solicitações', to: '/beneficiario/solicitacoes' }

export const WIZARD_STEPS: { id: WizardStep, label: string }[] = [
  { id: 'form', label: 'Formulário' },
  { id: 'review', label: 'Revisão' },
  { id: 'success', label: 'Solicitação enviada' },
]

export function beneficiaryFieldValues(beneficiary: Beneficiary | undefined, schema: ServiceFormSchema): Record<string, string> {
  const values: Record<string, string> = {
    // Versao simplificada do vinculo: qualquer nao-titular e exibido como Dependente.
    tipoDependente: beneficiary ? (beneficiary.relation === 'Titular' ? 'Titular' : 'Dependente') : '',
    nomeCompleto: nomeExibicao(beneficiary),
    cpf: beneficiary?.cpf ?? '',
    dataNascimento: beneficiary?.dataNascimento ? isoDateToBr(beneficiary.dataNascimento) : '',
    matricula: beneficiary?.matricula ?? '',
    email: beneficiary?.email ?? '',
    telefone: beneficiary?.telefone ?? '',
    telefoneContato: beneficiary?.telefone ?? '',
    ramo: beneficiary?.ramo ?? '',
    banco: beneficiary?.banco ?? '',
    agencia: beneficiary?.agencia ?? '',
    contaCorrente: beneficiary?.contaCorrente ?? '',
  }

  // "Localidade do Procedimento" é digitada livremente pelo usuário a cada solicitação;
  // só "Localidade da Matrícula" deve vir travada com o dado cadastrado do beneficiário.
  const localidadeField = schema.sections.flatMap((section) => section.fields).find((field) => field.id === 'localAtendimento')
  if (localidadeField?.disabled) {
    values.localAtendimento = beneficiary?.localidade ?? ''
  }

  return values
}

export function initialValues(schema: ServiceFormSchema): Record<string, string> {
  const values: Record<string, string> = {}
  schema.sections.forEach((section) => {
    section.fields.forEach((field) => {
      values[field.id] = field.defaultValue ?? ''
    })
  })

  const hasBeneficiaryField = schema.sections.some((section) => section.fields.some((field) => field.type === 'beneficiary'))
  const titular = hasBeneficiaryField ? beneficiaries.find((item) => item.relation === 'Titular') : undefined
  if (titular) {
    values.beneficiarioId = titular.id
    Object.assign(values, beneficiaryFieldValues(titular, schema))
  }

  return values
}

// Rótulos dos campos de e-mail preenchidos com um endereço inválido — usado pelos wizards para
// bloquear o avanço com a mesma regra do alerta exibido abaixo do campo.
export function invalidEmailLabels(sections: ServiceFormSection[], values: Record<string, string>): string[] {
  return sections
    .flatMap((section) => section.fields)
    .filter((field) => field.format === 'email' && !field.disabled)
    .filter((field) => {
      const value = values[field.id] ?? ''
      return value.trim().length > 0 && !isValidEmail(value)
    })
    .map((field) => field.label)
}

// Datas digitadas fora do padrão dd/mm/aaaa ou inexistentes (31/02, por exemplo). A máscara do
// campo aceita esses valores, e o formulário valida em JS em vez das mensagens do navegador.
export function invalidDateLabels(sections: ServiceFormSection[], values: Record<string, string>): string[] {
  return sections
    .flatMap((section) => section.fields)
    .filter((field) => field.type === 'date' && !field.disabled)
    .filter((field) => {
      const value = values[field.id] ?? ''
      return value.trim().length > 0 && !parseBrazilianDate(value)
    })
    .map((field) => field.label)
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

// Campos que o schema marca como `disabled` trazem dados do cadastro e são renderizados com
// `readonly`: mesma aparência de campo travado, mas o texto pode ser selecionado, copiado e
// alcançado pelo teclado/leitor de tela.
export function renderField(field: ServiceField, value: string, onChange: (value: string) => void) {
  const somenteLeitura = Boolean(field.disabled)

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

  const larguraClassName = field.fullWidth
    ? 'wide'
    : field.columnSpan === 3
      ? 'span-3'
      : field.columnSpan === 2
        ? 'half-width'
        : undefined
  const labelClassName = [larguraClassName, field.ownRow ? 'own-row' : undefined]
    .filter(Boolean).join(' ') || undefined
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
        <BrazilianDateInput readOnly={somenteLeitura} required={field.required} value={value} onChangeValue={onChange} />
      </label>
    )
  }

  if (field.format === 'email') {
    return (
      <label className={labelClassName} key={field.id}>
        <span className="service-field-label-text">{field.label}{requiredMark}{fieldInfoIcon}</span>
        <EmailTextInput readOnly={somenteLeitura} placeholder={field.placeholder} value={value} onChange={onChange} />
      </label>
    )
  }

  const fieldMask = field.format === 'phone' ? maskPhone : field.format === 'cpf' ? maskCpf : field.format === 'cpfCnpj' ? maskCpfCnpj : field.format === 'cep' ? maskCep : undefined
  const inputMode = fieldMask ? 'numeric' : undefined
  const maxLength = field.format === 'phone' ? 15 : field.format === 'cpf' ? 14 : field.format === 'cpfCnpj' ? 18 : field.format === 'cep' ? 9 : undefined

  return (
    <label className={labelClassName} key={field.id}>
      <span className="service-field-label-text">{field.label}{requiredMark}{fieldInfoIcon}</span>
      <input
        type="text"
        inputMode={inputMode}
        maxLength={maxLength}
        value={value}
        readOnly={somenteLeitura}
        placeholder={field.placeholder}
        onChange={(event) => onChange(fieldMask ? fieldMask(event.target.value) : event.target.value)}
      />
    </label>
  )
}
