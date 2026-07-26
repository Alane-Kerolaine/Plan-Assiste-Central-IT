import { RotateCcw } from 'lucide-react'

type CaptchaFieldProps = {
  code: string
  value: string
  onChangeValue: (value: string) => void
  onRefresh: () => void
}

export function CaptchaField({ code, value, onChangeValue, onRefresh }: CaptchaFieldProps) {
  return (
    <div className="captcha-field">
      <div className="captcha-code-row">
        <div className="captcha-code" aria-label={`Código de verificação: ${code.split('').join(' ')}`}>
          {code.split('').map((char, index) => <span key={`${char}-${index}`}>{char}</span>)}
        </div>
        <button type="button" className="captcha-refresh" onClick={onRefresh} aria-label="Gerar novo código de verificação">
          <RotateCcw aria-hidden="true" />
        </button>
      </div>
      <label className="captcha-input-label" htmlFor="captcha-input">
        Digite o código acima *
        <input
          id="captcha-input"
          value={value}
          onChange={(event) => onChangeValue(event.target.value)}
          placeholder="Código de verificação"
          autoComplete="off"
        />
      </label>
    </div>
  )
}
