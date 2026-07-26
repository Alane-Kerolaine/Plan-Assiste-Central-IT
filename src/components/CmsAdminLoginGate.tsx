import { LockKeyhole, LogIn, X } from 'lucide-react'
import { useState, type FormEvent, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCmsAdminSession, signInCmsAdmin } from '../cms/adminAuth'

export function CmsAdminLoginGate({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const [session, setSession] = useState(() => getCmsAdminSession())
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function submit(event: FormEvent) {
    event.preventDefault()
    if (!signInCmsAdmin(username, password)) {
      setError('Informe usuário e senha para continuar.')
      return
    }
    setSession(getCmsAdminSession())
  }

  if (session) return children

  return (
    <div className="cms-admin-login-backdrop" role="presentation">
      <section className="cms-admin-login-dialog" role="dialog" aria-modal="true" aria-labelledby="cms-admin-login-title">
        <button className="cms-admin-login-close" type="button" onClick={() => navigate('/area-da-equipe')} aria-label="Fechar"><X /></button>
        <div className="cms-admin-login-icon"><LockKeyhole aria-hidden="true" /></div>
        <p className="eyebrow">Acesso restrito</p>
        <h1 id="cms-admin-login-title">Administração do Portal</h1>
        <p>Entre com as credenciais editoriais. Nesta demonstração, qualquer usuário e senha preenchidos são aceitos.</p>
        <form onSubmit={submit}>
          <label>Usuário<input autoComplete="username" autoFocus value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Digite o usuário" /></label>
          <label>Senha<input autoComplete="current-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Digite a senha" /></label>
          {error && <p className="form-alert alert-danger" role="alert">{error}</p>}
          <button className="primary-button" type="submit"><LogIn aria-hidden="true" /> Entrar na administração</button>
        </form>
        <small>Este login é apenas visual e não representa segurança de produção.</small>
      </section>
    </div>
  )
}
