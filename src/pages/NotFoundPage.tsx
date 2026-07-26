import { ArrowLeft, Home } from 'lucide-react'
import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <main className="not-found-page">
      <section className="not-found-card" aria-labelledby="not-found-title">
        <span className="not-found-code" aria-hidden="true">404</span>
        <h1 id="not-found-title">Página não encontrada</h1>
        <p>O endereço pode estar incorreto, ter mudado ou não estar mais disponível.</p>
        <div className="not-found-actions">
          <Link className="primary-button" to="/"><Home aria-hidden="true" /> Ir para a página inicial</Link>
          <button className="secondary-button" type="button" onClick={() => window.history.back()}>
            <ArrowLeft aria-hidden="true" /> Voltar
          </button>
        </div>
      </section>
    </main>
  )
}
