import { useState, type FormEvent } from 'react'
import { ArrowLeft, KeyRound, Mail, Smartphone } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { GovBrSignInButton } from '../components/GovBrSignInButton'
import { getStoredUserProfile } from '../utils/userProfile'
import { emailMascarado, telefoneMascarado } from '../utils/contatoMascarado'
import { isCpfValido } from '../utils/cpf'
import { maskCpf } from '../utils/inputMasks'

/** Codigo aceito na demonstracao. Nao ha envio real de e-mail nem de SMS. */
const TOKEN_DA_DEMONSTRACAO = '000000'

/**
 * CPF aceito na demonstracao, a par do token.
 *
 * Ele nao passa nos digitos verificadores — nenhuma sequencia repetida passa —,
 * entao a excecao fica aqui, na tela, e nao dentro de isCpfValido, que precisa
 * seguir dizendo a verdade sobre qualquer CPF.
 */
const CPF_DA_DEMONSTRACAO = '000.000.000-00'

type Canal = 'email' | 'telefone'
type Etapa = 'cpf' | 'canal' | 'codigo'

export function LoginPage({
  onGovLogin,
  onProviderLogin,
}: {
  onGovLogin: () => void
  onProviderLogin: () => void
}) {
  const navigate = useNavigate()
  const perfil = getStoredUserProfile()

  const [etapa, setEtapa] = useState<Etapa>('cpf')
  const [cpf, setCpf] = useState('')
  const [canal, setCanal] = useState<Canal>('email')
  const [codigo, setCodigo] = useState('')
  const [erro, setErro] = useState('')

  const contatos: Record<Canal, string> = {
    email: emailMascarado(perfil.email),
    telefone: telefoneMascarado(perfil.whatsapp.trim() || perfil.phone),
  }

  function entrarComoBeneficiario() {
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

  function reconhecerCpf(event: FormEvent) {
    event.preventDefault()
    if (cpf !== CPF_DA_DEMONSTRACAO && !isCpfValido(cpf)) {
      setErro(`CPF não localizado. CPF padrão do protótipo: ${CPF_DA_DEMONSTRACAO}`)
      return
    }
    setErro('')
    setEtapa('canal')
  }

  function enviarCodigo(escolhido: Canal) {
    setCanal(escolhido)
    setCodigo('')
    setErro('')
    setEtapa('codigo')
  }

  function conferirCodigo(event: FormEvent) {
    event.preventDefault()
    if (codigo.trim() !== TOKEN_DA_DEMONSTRACAO) {
      setErro(`Token padrão do protótipo: ${TOKEN_DA_DEMONSTRACAO}`)
      return
    }
    setErro('')
    entrarComoBeneficiario()
  }

  function voltarAoInicioDoAcesso() {
    setEtapa('cpf')
    setCodigo('')
    setErro('')
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
          <GovBrSignInButton className="gov-login-large" onClick={entrarComoBeneficiario} />

          <div className="login-divider login-divider-interno" aria-hidden="true"><span>ou</span></div>

          {etapa === 'cpf' && (
            <form className="login-token-form" onSubmit={reconhecerCpf}>
              <h3><KeyRound aria-hidden="true" /> Acesso por código</h3>
              <p>Informe seu CPF para receber um código de acesso.</p>
              <label>
                <span>CPF</span>
                <input
                  value={cpf}
                  onChange={(evento) => { setCpf(maskCpf(evento.target.value)); setErro('') }}
                  placeholder="000.000.000-00"
                  inputMode="numeric"
                  maxLength={14}
                  autoComplete="off"
                />
              </label>
              {erro && <p className="field-error-text" role="alert">{erro}</p>}
              <button className="secondary-button" type="submit">Continuar</button>
            </form>
          )}

          {etapa === 'canal' && (
            <div className="login-token-form">
              <h3><KeyRound aria-hidden="true" /> Onde receber o código?</h3>
              <p>Enviaremos um código de seis dígitos para o contato escolhido.</p>
              <div className="login-token-canais">
                <button type="button" onClick={() => enviarCodigo('email')}>
                  <Mail aria-hidden="true" />
                  <span>
                    <strong>E-mail</strong>
                    <small>{contatos.email}</small>
                  </span>
                </button>
                <button type="button" onClick={() => enviarCodigo('telefone')}>
                  <Smartphone aria-hidden="true" />
                  <span>
                    <strong>Telefone</strong>
                    <small>{contatos.telefone}</small>
                  </span>
                </button>
              </div>
              <button className="login-token-voltar" type="button" onClick={voltarAoInicioDoAcesso}>
                Usar outro CPF
              </button>
            </div>
          )}

          {etapa === 'codigo' && (
            <form className="login-token-form" onSubmit={conferirCodigo}>
              <h3><KeyRound aria-hidden="true" /> Digite o código</h3>
              <p>
                Código de seis dígitos enviado para {canal === 'email' ? 'o e-mail' : 'o telefone'}{' '}
                <strong>{contatos[canal]}</strong>.
              </p>
              <label>
                <span>Código de acesso</span>
                <input
                  className="login-token-codigo"
                  value={codigo}
                  onChange={(evento) => { setCodigo(evento.target.value.replace(/\D/g, '').slice(0, 6)); setErro('') }}
                  placeholder="000000"
                  inputMode="numeric"
                  maxLength={6}
                  autoComplete="one-time-code"
                  autoFocus
                />
              </label>
              {erro && <p className="field-error-text" role="alert">{erro}</p>}
              <button className="secondary-button" type="submit">Entrar com o código</button>
              <div className="login-token-acoes">
                <button type="button" onClick={() => enviarCodigo(canal)}>Reenviar código</button>
                <button type="button" onClick={() => setEtapa('canal')}>Trocar o contato</button>
              </div>
            </form>
          )}
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
