import { ArrowLeft } from 'lucide-react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GovBrSignInButton } from '../components/GovBrSignInButton'

export function LoginPage({
  onGovLogin,
  onProviderLogin,
}: {
  onGovLogin: () => void
  onProviderLogin: () => void
}) {
  const navigate = useNavigate()

  function loginGovBr() {
    const destination = localStorage.getItem('planAssisteDestination') || '/beneficiario'
    onGovLogin()
    localStorage.removeItem('planAssistePendingProviderFavorite')
    localStorage.removeItem('planAssisteDestination')
    navigate(destination)
  }

  function loginProvider(event: FormEvent) {
    event.preventDefault()
    const requestedDestination = localStorage.getItem('planAssisteDestination')
    const destination = requestedDestination?.startsWith('/credenciado') ? requestedDestination : '/credenciado'
    onProviderLogin()
    localStorage.removeItem('planAssistePendingProviderFavorite')
    localStorage.removeItem('planAssisteDestination')
    navigate(destination)
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <img className="login-card-logo" src="/assets/logo-colorida.svg" alt="Plan-Assiste" />
        <div className="login-intro">
          <h1>Acesse o Plan-Assiste</h1>
          <p>Escolha o tipo de acesso para continuar no portal.</p>
        </div>
        <section className="login-access-card login-access-card-gov">
          <h2>Beneficiários e equipe</h2>
          <p>Use sua conta gov.br para acessar os serviços do portal.</p>
          <GovBrSignInButton className="gov-login-large" onClick={loginGovBr} />
        </section>
        <div className="login-divider" aria-hidden="true"><span>ou</span></div>
        <form className="provider-login-form" onSubmit={loginProvider}>
          <h2>Credenciados</h2>
          <p>Acesso exclusivo para credenciados já cadastrados.</p>
          <label>
            <span>CNPJ</span>
            <input placeholder="00.000.000/0000-00" required />
          </label>
          <label>
            <span>Senha</span>
            <input type="password" placeholder="Digite sua senha" required />
          </label>
          <button type="submit">Entrar como credenciado</button>
          <div className="provider-login-links">
            <Link to="/fale-conosco">Esqueci minha senha</Link>
            <Link to="/plan-assiste/como-se-credenciar-ou-renovar">Solicitar acesso de credenciado</Link>
          </div>
        </form>
        <button type="button" className="back-button" onClick={() => navigate('/')}><ArrowLeft /> Voltar ao portal</button>
      </section>
    </main>
  )
}
