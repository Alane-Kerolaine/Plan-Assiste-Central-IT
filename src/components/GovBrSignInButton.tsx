import type { ButtonHTMLAttributes } from 'react'

type GovBrSignInButtonProps = ButtonHTMLAttributes<HTMLButtonElement>

export function GovBrSignInButton({ className = '', type = 'button', ...props }: GovBrSignInButtonProps) {
  return (
    <button type={type} className={`br-sign-in large primary gov-login-button mt-3 mt-sm-0 ml-sm-3 ${className}`.trim()} {...props}>
      <span className="gov-login-label">
        <span className="gov-login-prefix">Entrar com&nbsp;</span>
        <span className="text-black">gov.br</span>
      </span>
    </button>
  )
}
