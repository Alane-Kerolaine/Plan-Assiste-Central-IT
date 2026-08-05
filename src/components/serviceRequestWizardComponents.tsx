import { beneficiaries } from '../data/mock'
import type { ServiceField } from '../data/serviceFormSchemas'
import { Combobox } from './Combobox'
import { WIZARD_STEPS, type WizardStep } from './serviceRequestWizardHelpers'

export function BeneficiarySelect({
  field,
  value,
  onChange,
}: {
  field: ServiceField
  value: string
  onChange: (beneficiaryId: string) => void
}) {
  const beneficiaryOptions = beneficiaries.map((beneficiary) => ({
    value: beneficiary.id,
    label: `${beneficiary.name} (${beneficiary.relation === 'Titular' ? 'Titular' : 'Dependente'})`,
  }))
  return (
    <label className="service-beneficiary-field">
      {field.label}{field.required ? ' *' : ''}
      <Combobox value={value} options={beneficiaryOptions} onSelect={onChange} placeholder="Selecione o beneficiário" />
    </label>
  )
}

export function WizardSteps({ current }: { current: WizardStep }) {
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
