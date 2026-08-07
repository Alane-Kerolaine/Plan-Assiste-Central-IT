import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, ChevronLeft, Copy, RotateCcw, Send } from 'lucide-react'
import { beneficiaries } from '../data/mock'
import { isFieldVisible, type CasoInstrucaoServico, type PerguntaChaveConfig, type ServiceFormSchema } from '../data/serviceFormSchemas'
import { generateProtocolNumber } from '../utils/protocol'
import { AvisoNormativo } from './AvisoNormativo'
import { ChecklistAnexos, type ChecklistAnexosDocumento } from './ChecklistAnexos'
import { Combobox } from './Combobox'
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
  schema: ServiceFormSchema & { perguntaChave: PerguntaChaveConfig }
  successSecondaryAction?: { label: string, to: string }
}

function dedupeDocumentos(casos: CasoInstrucaoServico[]) {
  const seen = new Set<string>()
  return casos.flatMap((caso) => caso.documentos).filter((documento) => {
    if (seen.has(documento.id)) return false
    seen.add(documento.id)
    return true
  })
}

export function ServiceRequestWizardV2({
  schema,
  successSecondaryAction = DEFAULT_SUCCESS_SECONDARY_ACTION,
}: Props) {
  const { perguntaChave } = schema
  const todosDocumentos = dedupeDocumentos(perguntaChave.casos)
  const camposSincronizados = new Set(
    perguntaChave.casos.flatMap((caso) => Object.keys(caso.sincronizarCampos ?? {})),
  )

  const [step, setStep] = useState<WizardStep>('form')
  const [values, setValues] = useState<Record<string, string>>(() => ({
    ...initialValues(schema),
    ...perguntaChave.casos[0].sincronizarCampos,
  }))
  const [casoId, setCasoId] = useState(perguntaChave.casos[0].id)
  const [anexosPorDocumento, setAnexosPorDocumento] = useState<Record<string, File[]>>({})
  const [avisoConfirmado, setAvisoConfirmado] = useState(false)
  const [notice, setNotice] = useState('')
  const [protocol, setProtocol] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const id = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(id)
  }, [copied])

  const casoSelecionado = perguntaChave.casos.find((caso) => caso.id === casoId) ?? perguntaChave.casos[0]
  const documentosRequeridos = new Set(casoSelecionado.documentos.map((documento) => documento.id))

  function updateValue(fieldId: string, value: string) {
    setValues((current) => ({ ...current, [fieldId]: value }))
  }

  function handleBeneficiarioChange(beneficiaryId: string) {
    const beneficiary = beneficiaries.find((item) => item.id === beneficiaryId)
    setValues((current) => ({ ...current, beneficiarioId: beneficiaryId, ...beneficiaryFieldValues(beneficiary) }))
  }

  function handleCasoChange(nextCasoId: string) {
    setCasoId(nextCasoId)
    setAvisoConfirmado(false)
    const nextCaso = perguntaChave.casos.find((caso) => caso.id === nextCasoId)
    if (nextCaso?.sincronizarCampos) {
      setValues((current) => ({ ...current, ...nextCaso.sincronizarCampos }))
    }
  }

  function addFiles(documentoId: string, newFiles: File[]) {
    setAnexosPorDocumento((current) => ({ ...current, [documentoId]: [...(current[documentoId] ?? []), ...newFiles] }))
  }

  function removeFile(documentoId: string, index: number) {
    setAnexosPorDocumento((current) => ({ ...current, [documentoId]: (current[documentoId] ?? []).filter((_, i) => i !== index) }))
  }

  const visibleSections = schema.sections
    .filter((section) => isFieldVisible(section.showIf, values))
    .map((section) => ({
      ...section,
      fields: section.fields.filter((field) =>
        isFieldVisible(field.showIf, values) && field.type !== 'file' && !camposSincronizados.has(field.id)),
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
        if (!values[field.id]?.trim()) missing.push(field.label)
      })
    })
    casoSelecionado.documentos.forEach((documento) => {
      if (documento.obrigatorio && (anexosPorDocumento[documento.id]?.length ?? 0) === 0) {
        missing.push(documento.label)
      }
    })
    if (casoSelecionado.avisoNormativo?.exigeConfirmacao && !avisoConfirmado) {
      missing.push('Confirmação do aviso normativo')
    }
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
    setValues({ ...initialValues(schema), ...perguntaChave.casos[0].sincronizarCampos })
    setAnexosPorDocumento({})
    setCasoId(perguntaChave.casos[0].id)
    setAvisoConfirmado(false)
    setNotice('')
    setProtocol('')
    setStep('form')
  }

  const checklistDocumentos: ChecklistAnexosDocumento[] = todosDocumentos.map((documento) => ({
    ...documento,
    requerido: documentosRequeridos.has(documento.id),
    arquivos: anexosPorDocumento[documento.id] ?? [],
  }))

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
                        : formatReviewValue(field, values[field.id])}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
          <div className="reimbursement-form-section">
            <h3>Instruções específicas — {casoSelecionado.titulo}</h3>
            <dl className="service-review-grid">
              {casoSelecionado.documentos.map((documento) => (
                <div className="service-review-row" key={documento.id}>
                  <dt>{documento.label}</dt>
                  <dd>
                    {(anexosPorDocumento[documento.id]?.length ?? 0) > 0
                      ? anexosPorDocumento[documento.id].map((file) => file.name).join(', ')
                      : '–'}
                  </dd>
                </div>
              ))}
              {casoSelecionado.avisoNormativo?.exigeConfirmacao && (
                <div className="service-review-row">
                  <dt>Aviso normativo</dt>
                  <dd>{avisoConfirmado ? 'Confirmado' : 'Não confirmado'}</dd>
                </div>
              )}
            </dl>
          </div>
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
                  {section.id === 'detalhes' && (
                    <label className="wide" key="pergunta-chave-combobox">
                      {perguntaChave.enunciado}
                      <Combobox
                        onSelect={handleCasoChange}
                        options={perguntaChave.casos.map((caso) => ({ value: caso.id, label: caso.titulo }))}
                        placeholder="Selecione uma opção"
                        value={casoId}
                      />
                    </label>
                  )}
                  {otherFields.map((field) => renderField(field, values[field.id], (value) => updateValue(field.id, value)))}
                </div>
              </div>
            )
          })}
          <div className="reimbursement-form-section">
            <h3>Documentos exigidos — {casoSelecionado.titulo}</h3>
            <ChecklistAnexos documentos={checklistDocumentos} onAdd={addFiles} onRemove={removeFile} />
          </div>
          {casoSelecionado.avisoNormativo && (
            <div className="reimbursement-form-section">
              <AvisoNormativo
                {...casoSelecionado.avisoNormativo}
                confirmado={avisoConfirmado}
                onConfirmar={setAvisoConfirmado}
              />
            </div>
          )}
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
