import { Navigate, useLocation } from 'react-router-dom'
import { FileText } from 'lucide-react'
import { PublicBreadcrumb, PublicShell, type PublicPageProps } from './PublicPages'
import { CmsPageBlocks } from '../components/CmsBlocks'
import { useCmsSnapshot } from '../cms/contentRepository'
import { caminhoDoSlug, slugDoCaminho, trilhaDaPagina } from '../cms/portalNavegacao'
import { dentroDoEditor } from '../utils/modoEdicao'

/**
 * Pagina criada pela equipe fora da secao Plan-Assiste — hoje, sob Transparencia.
 *
 * As rotas fixas de Transparencia tem componentes proprios e vencem esta por
 * serem mais especificas; aqui caem apenas os enderecos novos, que so existem
 * no gerenciador de conteudo.
 */
export function CmsPaginaCriadaPage({ loggedIn, onLogout }: PublicPageProps) {
  const { pathname } = useLocation()
  const paginas = useCmsSnapshot().pages
  const slug = slugDoCaminho(pathname)
  // Rascunho aparece so dentro do navegador da Area da equipe.
  const pagina = slug
    ? paginas.find((item) => item.slug === slug && (item.status === 'published' || dentroDoEditor()))
    : undefined

  if (!pagina) return <Navigate to="/transparencia" replace />

  const trilha = trilhaDaPagina(paginas, pagina.slug)

  return (
    <PublicShell loggedIn={loggedIn} onLogout={onLogout}>
      <main className="container public-page">
        <PublicBreadcrumb
          current={pagina.navigationTitle || pagina.title}
          parents={[
            { label: 'Transparência', to: '/transparencia' },
            ...trilha
              .filter((ancestral) => ancestral.slug !== 'transparencia')
              .map((ancestral) => ({ label: ancestral.navigationTitle || ancestral.title, to: caminhoDoSlug(ancestral.slug) })),
          ]}
        />

        <article className="portal-article">
          <header className="portal-article-header">
            <FileText aria-hidden="true" />
            <h1>{pagina.title}</h1>
            {pagina.summary && <p>{pagina.summary}</p>}
          </header>

          <CmsPageBlocks page={pagina} editing={false} />
        </article>
      </main>
    </PublicShell>
  )
}
