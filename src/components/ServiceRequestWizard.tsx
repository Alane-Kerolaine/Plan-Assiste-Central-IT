import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, ChevronLeft, Copy, RotateCcw, Send } from 'lucide-react'
import { beneficiaries } from '../data/mock'
import { isFieldVisible, type ServiceField, type ServiceFormSchema } from '../data/serviceFormSchemas'
import { generateProtocolNumber } from '../utils/protocol'
import { maskCep, maskCpf, maskPhone } from '../utils/inputMasks'
import { Combobox } from './Combobox'
import { FileAttachmentField } from './FileAttachmentField'
import { BrazilianDateInput } from './BrazilianDateInput'

type WizardStep = 'form' | 'review' | 'success'

type Props = {
  schema: ServiceFormSchema
  successSecondaryAction?: { label: string, to: string }
}

const DEFAULT_SUCCESS_SECONDARY_ACTION = { label: 'Ver solicitações', to: '/beneficiario/solicitacoes' }

const WIZARD_STEPS: { id: WizardStep, label: string }[] = [
  { id: 'form', label: 'Formulário' },
  { id: 'review', label: 'Revisão' },
  { id: 'success', label: 'Solicitação enviada' },
]

function initialValues(schema: ServiceFormSchema): Record<string, string> {
  const values: Record<string, string> = {}
  schema.sections.forEach((section) => {
    section.fields.forEach((field) => {
      values[field.id] = field.defaultValue ?? ''
    })
  })
  return values
}

function formatReviewValue(field: ServiceField, value: string | undefined): string {
  if (field.type === 'checkbox') return value === 'true' ? 'Confirmado' : 'Não confirmado'
  if (!value?.trim()) return '–'
  if (field.type === 'date' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-')
    return `${day}/${month}/${year}`
  }

  return value
}

function BeneficiarySelect({
  field,
  value,
  onChange,
}: {
  field: ServiceField
  value: string
  onChange: (beneficiaryId: string) => void
}) {
  const beneficiaryOptions = beneficiaries.map((beneficiary) => ({ value: beneficiary.id, label: `${beneficiary.name} (${beneficiary.relation})` }))
  return (
    <label className="service-beneficiary-field">
      {field.label}{field.required ? ' *' : ''}
      <Combobox value={value} options={beneficiaryOptions} onSelect={onChange} placeholder="Selecione o beneficiário" />
    </label>
  )
}

function renderField(field: ServiceField, value: string, onChange: (value: string) => void) {
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
  const requiredMark = field.required ? ' *' : ''

  if (field.type === 'select' || field.type === 'combobox') {
    const comboboxOptions = (field.options ?? []).map((option) => ({ value: option, label: option }))
    return (
      <label className={labelClassName} key={field.id}>
        {field.label}{requiredMark}
        <Combobox value={value} options={comboboxOptions} onSelect={onChange} placeholder={field.placeholder ?? 'Selecione'} />
      </label>
    )
  }

  if (field.type === 'textarea') {
    return (
      <label className={labelClassName} key={field.id}>
        {field.label}{requiredMark}
        <textarea value={value} placeholder={field.placeholder} rows={6} onChange={(event) => onChange(event.target.value)} />
      </label>
    )
  }

  if (field.type === 'date') {
    return (
      <label className={labelClassName} key={field.id}>
        {field.label}{requiredMark}
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
      {field.label}{requiredMark}
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

function WizardSteps({ current }: { current: WizardStep }) {
  const currentIndex = WIZARD_STEPS.findIndex((item) => item.id === current)
  return (
    <ol className="service-wizard-steps" aria-label="Etapas da solicitação">
      {WIZARD_STEPS.map((item, index) => (
        <li key={item.id} className={index === currentIndex ? 'is-current' : index < currentIndex ? 'is-done' : undefined}>
          <span className="service-wizard-step-index">{index + 1}</span>
          {item.label}
        </li>
      ))}
    </ol>
  )
}

export function ServiceRequestWizard({
  schema,
  successSecondaryAction = DEFAULT_SUCCESS_SECONDARY_ACTION,
}: Props) {
  const [step, setStep] = useState<WizardStep>('form')
  const [values, setValues] = useState<Record<string, string>>(() => initialValues(schema))
  const [attachments, setAttachments] = useState<Record<string, File[]>>({})
  const [notice, setNotice] = useState('')
  const [protocol, setProtocol] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const id = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(id)
  }, [copied])

  function updateValue(fieldId: string, value: string) {
    setValues((current) => ({ ...current, [fieldId]: value }))
  }

  function handleBeneficiarioChange(beneficiaryId: string) {
    const beneficiary = beneficiaries.find((item) => item.id === beneficiaryId)
    setValues((current) => ({
      ...current,
      beneficiarioId: beneficiaryId,
      nomeCompleto: beneficiary?.name ?? '',
      cpf: beneficiary?.cpf ?? '',
      dataNascimento: beneficiary?.dataNascimento ?? '',
      matricula: beneficiary?.matricula ?? '',
      banco: beneficiary?.banco ?? '',
      agencia: beneficiary?.agencia ?? '',
      contaCorrente: beneficiary?.contaCorrente ?? '',
    }))
  }

  function addFiles(fieldId: string, newFiles: File[]) {
    setAttachments((current) => ({ ...current, [fieldId]: [...(current[fieldId] ?? []), ...newFiles] }))
  }

  function removeFile(fieldId: string, index: number) {
    setAttachments((current) => ({ ...current, [fieldId]: (current[fieldId] ?? []).filter((_, i) => i !== index) }))
  }

  const visibleSections = schema.sections
    .filter((section) => isFieldVisible(section.showIf, values))
    .map((section) => ({
      ...section,
      fields: section.fields.filter((field) => isFieldVisible(field.showIf, values)),
    }))

  function validate(): string[] {
    const missing: string[] = []
    visibleSections.forEach((section) => {
      section.fields.forEach((field) => {
        if (!field.required) return
        if (field.type === 'checkbox') {
          if (values[field.id] !== 'true') missing.push(field.label)
          return
        }
        if (field.type === 'file') {
          if ((attachments[field.id]?.length ?? 0) === 0) missing.push(field.label)
          return
        }
        if (!values[field.id]?.trim()) missing.push(field.label)
      })
    })
    return missing
  }

  function handleContinue() {
    const missing = validate()
    if (missing.length > 0) {
      setNotice(`Preencha os campos obrigatórios: ${missing.join(', ')}.`)
      return
    }
    setNotice('')
    setStep('review')
  }

  function handleConfirm() {
    setProtocol(generateProtocolNumber())
    setStep('success')
  }

  function handleReset() {
    setValues(initialValues(schema))
    setAttachments({})
    setNotice('')
    setProtocol('')
    setStep('form')
  }

  if (step === 'success') {
    return (
      <div className="service-wizard">
        <WizardSteps current={step} />
        <div className="service-success">
          <CheckCircle2 aria-hidden="true" className="service-success-icon" />
          <h2>Solicitação criada com sucesso!</h2>
          <p>Sua solicitação foi registrada para análise.</p>
          <div className="service-protocol">
            <span>Número do protocolo</span>
            <strong>{protocol}</strong>
            <button type="button" onClick={() => { navigator.clipboard.writeText(protocol); setCopied(true) }}>
              <Copy aria-hidden="true" /> {copied ? 'Copiado!' : 'Copiar protocolo'}
            </button>
          </div>
          <div className="service-success-followup">
            <h3>Como acompanhar?</h3>
            <ol>
              <li><span className="service-followup-index">1</span> Acesse o menu Minhas Solicitações</li>
              <li><span className="service-followup-index">2</span> Localize o protocolo informado</li>
              <li><span className="service-followup-index">3</span> Verifique o status e atualizações</li>
            </ol>
          </div>
          <div className="service-success-actions">
            <button className="primary-button" type="button" onClick={handleReset}>
              <RotateCcw aria-hidden="true" /> Registrar nova solicitação
            </button>
            <Link className="secondary-button" to={successSecondaryAction.to}>{successSecondaryAction.label}</Link>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'review') {
    return (
      <div className="service-wizard">
        <WizardSteps current={step} />
        <div className="reimbursement-card service-review">
          <h2>Revise sua solicitação</h2>
          <p className="page-subtitle">Confira os dados informados antes de confirmar o envio.</p>
          {visibleSections.map((section) => (
            <div className="reimbursement-form-section" key={section.id}>
              <h3>{section.title}</h3>
              <dl className="service-review-grid">
                {section.fields.filter((field) => field.type !== 'note').map((field) => (
                  <div className="service-review-row" key={field.id}>
                    <dt>{field.label}</dt>
                    <dd>
                      {field.type === 'beneficiary'
                        ? (beneficiaries.find((item) => item.id === values[field.id])?.name ?? '–')
                        : field.type === 'file'
                          ? ((attachments[field.id]?.length ?? 0) > 0
                            ? attachments[field.id].map((file) => file.name).join(', ')
                            : '–')
                          : formatReviewValue(field, values[field.id])}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
          {notice && <p className="form-alert alert-danger" role="status">{notice}</p>}
          <div className="reimbursement-actions">
            <button className="secondary-button" type="button" onClick={() => setStep('form')}>
              <ChevronLeft aria-hidden="true" /> Voltar e editar
            </button>
            <button className="primary-button" type="button" onClick={handleConfirm}>
              <Send aria-hidden="true" /> Confirmar e enviar
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="service-wizard">
      <WizardSteps current={step} />
      <form className="reimbursement-form" onSubmit={(event) => { event.preventDefault(); handleContinue() }}>
        <section className="reimbursement-card">
          <h2>Formulário</h2>
          {visibleSections.map((section) => {
            const beneficiaryField = section.fields.find((field) => field.type === 'beneficiary')
            const otherFields = section.fields.filter((field) => field.type !== 'beneficiary')
            return (
              <div className="reimbursement-form-section" key={section.id}>
                <h3>{section.title}</h3>
                {beneficiaryField && (
                  <div className="service-beneficiary-row">
                    <BeneficiarySelect
                      field={beneficiaryField}
                      onChange={handleBeneficiarioChange}
                      value={values[beneficiaryField.id]}
                    />
                  </div>
                )}
                <div className="reimbursement-grid">
                  {otherFields.map((field) => (
                    field.type === 'file'
                      ? (
                        <FileAttachmentField
                          fullWidth={field.fullWidth}
                          files={attachments[field.id] ?? []}
                          helpText={field.helpText}
                          key={field.id}
                          label={field.label}
                          onAdd={(newFiles) => addFiles(field.id, newFiles)}
                          onRemove={(index) => removeFile(field.id, index)}
                        />
                      )
                      : renderField(field, values[field.id], (value) => updateValue(field.id, value))
                  ))}
                </div>
              </div>
            )
          })}
          {notice && <p className="form-alert alert-danger" role="status">{notice}</p>}
          <div className="reimbursement-actions">
            <button className="primary-button" type="submit">
              <ArrowRight aria-hidden="true" /> Revisar solicitação
            </button>
          </div>
        </section>
      </form>
    </div>
  )
}
