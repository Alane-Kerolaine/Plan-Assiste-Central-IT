import { Fragment, useState, type FormEvent, type ReactNode } from 'react'
import { ArrowLeft, Building2 } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { GovBrSignInButton } from '../components/GovBrSignInButton'
import { getStoredUserProfile } from '../utils/userProfile'
import { emailMascarado } from '../utils/contatoMascarado'
import { isCpfValido } from '../utils/cpf'
import { maskCpf } from '../utils/inputMasks'
import { getLoginAccessParam, type LoginAccess } from '../utils/loginAccess'

/** Codigo aceito na demonstracao. Nao ha envio real de e-mail. */
const TOKEN_DA_DEMONSTRACAO = '000000'
const TAMANHO_DO_TOKEN = TOKEN_DA_DEMONSTRACAO.length

/**
 * CPF aceito na demonstracao, a par do token.
 *
 * Ele nao passa nos digitos verificadores — nenhuma sequencia repetida passa —,
 * entao a excecao fica aqui, na tela, e nao dentro de isCpfValido, que precisa
 * seguir dizendo a verdade sobre qualquer CPF.
 */
const CPF_DA_DEMONSTRACAO = '000.000.000-00'
const TAMANHO_DO_CPF = CPF_DA_DEMONSTRACAO.length

type Etapa = 'opcoes' | 'cpf' | 'codigo'
type Opcao = 'beneficiario' | 'equipe'

const OPCOES_POR_ACESSO: Record<LoginAccess, Opcao[]> = {
  beneficiario: ['beneficiario'],
  todos: ['beneficiario', 'equipe'],
}

const DESTINO_DO_BENEFICIARIO = '/beneficiario'
const DESTINO_DA_EQUIPE = '/area-da-equipe'

/** Destino pedido antes do login, se for da area de quem esta entrando; senao, a home da area. */
function consumirDestino(prefixo: string, padrao: string) {
  const pedido = localStorage.getItem('planAssisteDestination')
  localStorage.removeItem('planAssisteDestination')
  localStorage.removeItem('planAssistePendingProviderFavorite')
  return pedido?.startsWith(prefixo) ? pedido : padrao
}

export function LoginPage({
  onGovLogin,
  onTeamLogin,
}: {
  onGovLogin: () => void
  onTeamLogin: () => void
}) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const opcoes = OPCOES_POR_ACESSO[getLoginAccessParam(searchParams)]

  const [etapa, setEtapa] = useState<Etapa>('opcoes')
  const [cpf, setCpf] = useState('')
  const [codigo, setCodigo] = useState('')
  const [erro, setErro] = useState('')
  const emailDoBeneficiario = emailMascarado(getStoredUserProfile().email)

  function irPara(proxima: Etapa) {
    setErro('')
    setEtapa(proxima)
  }

  function entrarComoBeneficiario() {
    // Beneficiario e equipe compartilham a sessao gov.br; o destino pedido pode ser de qualquer uma.
    const destino = consumirDestino('/', DESTINO_DO_BENEFICIARIO)
    onGovLogin()
    navigate(destino)
  }

  function entrarComoEquipe() {
    const destino = consumirDestino(DESTINO_DA_EQUIPE, DESTINO_DA_EQUIPE)
    onTeamLogin()
    navigate(destino)
  }

  function reconhecerCpf(event: FormEvent) {
    event.preventDefault()
    if (cpf !== CPF_DA_DEMONSTRACAO && !isCpfValido(cpf)) {
      setErro(`CPF não localizado. CPF padrão do protótipo: ${CPF_DA_DEMONSTRACAO}`)
      return
    }
    setCodigo('')
    irPara('codigo')
  }

  function conferirCodigo(event: FormEvent) {
    event.preventDefault()
    if (codigo !== TOKEN_DA_DEMONSTRACAO) {
      setErro(`Código inválido. Token padrão do protótipo: ${TOKEN_DA_DEMONSTRACAO}`)
      return
    }
    entrarComoBeneficiario()
  }

  function reenviarCodigo() {
    setCodigo('')
    setErro('')
  }

  const cartoes: Record<Opcao, ReactNode> = {
    beneficiario: (
      <section className="login-access-card login-access-card-gov">
        <h2>Beneficiários</h2>
        <p>Titulares e dependentes: use sua conta gov.br para acessar os serviços do portal.</p>
        <GovBrSignInButton className="gov-login-large" onClick={entrarComoBeneficiario} />
        <p className="login-access-hint">Não tem conta gov.br?</p>
        <button className="login-access-button login-access-button-outline" type="button" onClick={() => irPara('cpf')}>
          Entrar com CPF e código de acesso
        </button>
      </section>
    ),
    equipe: (
      <section className="login-access-card login-access-card-plain">
        <h2>Equipe do Plan-Assiste</h2>
        <p>Servidores e colaboradores: use a sua conta corporativa institucional.</p>
        <button className="login-access-button" type="button" onClick={entrarComoEquipe}>
          <Building2 aria-hidden="true" /> Entrar com a conta corporativa
        </button>
      </section>
    ),
  }

  const voltarAsOpcoes = (
    <button type="button" className="back-button" onClick={() => irPara('opcoes')}><ArrowLeft /> Outras formas de entrar</button>
  )
  const mensagemDeErro = erro && <p className="field-error-text" role="alert">{erro}</p>

  return (
    <main className="login-page">
      <section className="login-card">
        <img className="login-card-logo" src="/assets/logo-colorida.svg" alt="Plan-Assiste" />
        <div className="login-intro">
          <h1>Acesse o Plan-Assiste</h1>
          <p>Escolha o tipo de acesso para continuar no portal.</p>
        </div>

        {etapa === 'opcoes' && opcoes.map((opcao, indice) => (
          <Fragment key={opcao}>
            {indice > 0 && <div className="login-divider" aria-hidden="true"><span>ou</span></div>}
            {cartoes[opcao]}
          </Fragment>
        ))}

        {etapa === 'cpf' && (
          <form className="login-step-form" onSubmit={reconhecerCpf}>
            <label>
              <span>CPF</span>
              <input
                value={cpf}
                onChange={(evento) => { setCpf(maskCpf(evento.target.value)); setErro('') }}
                placeholder="000.000.000-00"
                inputMode="numeric"
                maxLength={TAMANHO_DO_CPF}
                autoComplete="off"
                autoFocus
              />
            </label>
            <p className="login-access-note">Enviaremos um código para o e-mail ou telefone cadastrados no seu plano.</p>
            {mensagemDeErro}
            <button className="login-access-button" type="submit" disabled={cpf.length < TAMANHO_DO_CPF}>Continuar</button>
            {voltarAsOpcoes}
          </form>
        )}

        {etapa === 'codigo' && (
          <form className="login-step-form" onSubmit={conferirCodigo}>
            <p className="login-step-message">
              Enviamos um código de {TAMANHO_DO_TOKEN} dígitos para <strong>{emailDoBeneficiario}</strong>.
            </p>
            <label>
              <span>Código recebido</span>
              <input
                className="login-token-codigo"
                value={codigo}
                onChange={(evento) => { setCodigo(evento.target.value.replace(/\D/g, '').slice(0, TAMANHO_DO_TOKEN)); setErro('') }}
                inputMode="numeric"
                maxLength={TAMANHO_DO_TOKEN}
                autoComplete="one-time-code"
                autoFocus
              />
            </label>
            {mensagemDeErro}
            <button className="login-access-button" type="submit" disabled={codigo.length < TAMANHO_DO_TOKEN}>Entrar</button>
            <div className="login-step-links">
              <button type="button" onClick={reenviarCodigo}>Reenviar código</button>
              <button type="button" onClick={() => irPara('cpf')}>Usar outro CPF</button>
            </div>
            {voltarAsOpcoes}
          </form>
        )}


        <button type="button" className="back-button" onClick={() => navigate('/')}><ArrowLeft /> Voltar ao portal</button>
      </section>
    </main>
  )
}
