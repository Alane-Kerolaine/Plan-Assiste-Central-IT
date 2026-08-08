import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, ChevronLeft, Copy, RotateCcw, Send } from 'lucide-react'
import { beneficiaries } from '../data/mock'
import { isFieldVisible, type ServiceFormSchema } from '../data/serviceFormSchemas'
import { generateProtocolNumber } from '../utils/protocol'
import { AvisoNormativo } from './AvisoNormativo'
import { FileAttachmentField } from './FileAttachmentField'
import { BeneficiarySelect, WizardSteps } from './serviceRequestWizardComponents'
import {
  beneficiaryFieldValues,
  DEFAULT_SUCCESS_SECONDARY_ACTION,
  formatReviewValue,
  initialValues,
  renderField,
  type WizardStep,
} from './serviceRequestWizardHelpers'

type Props = {
  schema: ServiceFormSchema
  successSecondaryAction?: { label: string, to: string }
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
    setValues((current) => ({ ...current, beneficiarioId: beneficiaryId, ...beneficiaryFieldValues(beneficiary, schema) }))
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
              {section.title && <h3>{section.title}</h3>}
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
          {schema.avisoInicial && (!schema.avisoInicial.posicao || schema.avisoInicial.posicao === 'inicio') && (
            <AvisoNormativo
              confirmado={false}
              conteudo={schema.avisoInicial.conteudo}
              exigeConfirmacao={false}
              onConfirmar={() => {}}
              titulo={schema.avisoInicial.titulo}
              tone={schema.avisoInicial.tone}
            />
          )}
          {visibleSections.map((section) => {
            const beneficiaryField = section.fields.find((field) => field.type === 'beneficiary')
            const otherFields = section.fields.filter((field) => field.type !== 'beneficiary')
            return (
              <div className="reimbursement-form-section" key={section.id}>
                {section.title && <h3>{section.title}</h3>}
                {schema.avisoInicial?.posicao === 'apos-detalhes' && section.id === 'detalhes' && (
                  <AvisoNormativo
                    confirmado={false}
                    conteudo={schema.avisoInicial.conteudo}
                    exigeConfirmacao={false}
                    onConfirmar={() => {}}
                    titulo={schema.avisoInicial.titulo}
                    tone={schema.avisoInicial.tone}
                  />
                )}
                {beneficiaryField && (
                  <div className="service-beneficiary-row">
                    <BeneficiarySelect
                      field={beneficiaryField}
                      onChange={handleBeneficiarioChange}
                      value={values[beneficiaryField.id]}
                    />
                  </div>
                )}
                <div className={`reimbursement-grid${section.columns === 3 ? ' reimbursement-grid-three-columns' : section.columns === 2 ? ' reimbursement-grid-two-columns' : ''}`}>
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
