import { useId } from 'react'
import type { AvisoNormativoConfig } from '../data/serviceFormSchemas'

type AvisoNormativoProps = AvisoNormativoConfig & {
  confirmado: boolean
  onConfirmar: (confirmado: boolean) => void
  tone?: 'aviso' | 'informativo'
}

export function AvisoNormativo({ titulo, conteudo, baseLegal, exigeConfirmacao, confirmado, onConfirmar, tone = 'aviso' }: AvisoNormativoProps) {
  const headingId = useId()
  const paragraphs = conteudo.split('\n\n').filter((paragraph) => paragraph.trim().length > 0)

  return (
    <section aria-labelledby={headingId} className={`aviso-normativo${tone === 'informativo' ? ' tone-informativo' : ''}`}>
      <h3 id={headingId}>{titulo}</h3>
      {paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
      {baseLegal && (
        <p className="aviso-normativo-base-legal">
          <a href={baseLegal.href} rel="noopener noreferrer" target="_blank">{baseLegal.label}</a>
        </p>
      )}
      {exigeConfirmacao && (
        <label className="responsibility-term">
          <input
            checked={confirmado}
            onChange={(event) => onConfirmar(event.target.checked)}
            type="checkbox"
          />
          Declaro estar ciente do conteúdo acima.
        </label>
      )}
    </section>
  )
}
