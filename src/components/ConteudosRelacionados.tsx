import { Link } from 'react-router-dom'
import { ArrowRight, Files } from 'lucide-react'
import type { CmsRelatedRef } from '../cms/contentRepository'
import { useRelacionados } from '../cms/relacionados'

/** Bloco de conteudos relacionados escolhidos a mao, no rodape de uma pagina. */
export function ConteudosRelacionados({ refs }: { refs: CmsRelatedRef[] | undefined }) {
  const itens = useRelacionados(refs)
  if (itens.length === 0) return null

  return (
    <section className="cms-relacionados-publico" aria-label="Conteúdos relacionados">
      <div className="section-heading">
        <h2>Conteúdos relacionados</h2>
      </div>
      <div className="plan-card-grid plan-card-grid-secondary">
        {itens.map((item) => (
          <Link className="plan-section-card" to={item.caminho} key={item.chave}>
            <Files aria-hidden="true" />
            <span>{item.titulo}</span>
            {item.resumo && <p>{item.resumo}</p>}
            <strong>{item.ehNoticia ? 'Ler notícia' : 'Abrir página'} <ArrowRight aria-hidden="true" /></strong>
          </Link>
        ))}
      </div>
    </section>
  )
}
