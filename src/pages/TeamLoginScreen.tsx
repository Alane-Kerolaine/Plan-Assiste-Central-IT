import { useState, type FormEvent } from 'react'
import { Eye, EyeOff, LockKeyhole, UserRound } from 'lucide-react'

/**
 * Login da Equipe do Plan-Assiste, no visual do Citsmart X ("Meu Plan-Assiste").
 * No prototipo qualquer usuario e senha entram; "Login MPF - Servidores" simula o
 * acesso unico dos servidores do MPF.
 */
export function TeamLoginScreen({ onLogin }: { onLogin: () => void }) {
  const [usuario, setUsuario] = useState('')
  const [senha, setSenha] = useState('')
  const [senhaVisivel, setSenhaVisivel] = useState(false)

  function entrar(event: FormEvent) {
    event.preventDefault()
    if (!usuario.trim() || !senha) return
    onLogin()
  }

  return (
    <main className="team-login-page">
      <section className="team-login-card" aria-labelledby="team-login-title">
        <MeuPlanAssisteLogo />
        <h1 id="team-login-title" className="team-login-intro">Realize o login para acessar o sistema.</h1>

        <form className="team-login-form" onSubmit={entrar}>
          <label className="team-login-field">
            <UserRound aria-hidden="true" />
            <span className="sr-only">Nome de usuário ou e-mail</span>
            <input
              value={usuario}
              onChange={(evento) => setUsuario(evento.target.value)}
              placeholder="Digite seu nome de usuário ou e-mail *"
              autoComplete="username"
              required
              autoFocus
            />
          </label>
          <div className="team-login-field team-login-field-password">
            <label>
              <LockKeyhole aria-hidden="true" />
              <span className="sr-only">Senha</span>
              <input
                type={senhaVisivel ? 'text' : 'password'}
                value={senha}
                onChange={(evento) => setSenha(evento.target.value)}
                placeholder="Digite sua senha*"
                autoComplete="current-password"
                required
              />
            </label>
            <button
              type="button"
              className="team-login-toggle"
              onClick={() => setSenhaVisivel((visivel) => !visivel)}
              aria-label={senhaVisivel ? 'Ocultar senha' : 'Mostrar senha'}
              aria-pressed={senhaVisivel}
            >
              {senhaVisivel ? <Eye aria-hidden="true" /> : <EyeOff aria-hidden="true" />}
            </button>
          </div>
          <button type="submit" className="team-login-submit">Entrar No Citsmart X</button>
        </form>

        <ul className="team-login-links">
          <li><button type="button" onClick={onLogin}>Login MPF - Servidores</button></li>
        </ul>
      </section>
    </main>
  )
}

/** Reproducao do logo "Meu Plan-Assiste"; trocar pelo arquivo oficial quando houver. */
function MeuPlanAssisteLogo() {
  return (
    <div className="team-login-logo" role="img" aria-label="Meu Plan-Assiste">
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <path fill="#00c896" d="M32 44 12.6 25.4A10.6 10.6 0 0 1 27.6 10.4L32 14.8l4.4-4.4a10.6 10.6 0 0 1 15 15Z" />
        <path fill="#4a7b73" d="M6.5 41.5a4.2 4.2 0 0 1 5.9-.2L26 53.6l25.4-15.4a4.2 4.2 0 1 1 4.4 7.2L28.6 61.8a4.2 4.2 0 0 1-5.1-.5L6.7 47.4a4.2 4.2 0 0 1-.2-5.9Z" />
        <path fill="#00c896" d="M6.5 41.5a4.2 4.2 0 0 1 5.9-.2L26 53.6l-3.2 6.9L6.7 47.4a4.2 4.2 0 0 1-.2-5.9Z" />
      </svg>
      <span>
        <strong className="team-login-logo-meu">Meu</strong>
        <strong className="team-login-logo-nome">Plan-Assiste</strong>
      </span>
    </div>
  )
}
