import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ExternalLink, Home, Pencil, RefreshCw } from 'lucide-react'
import { PublicBreadcrumb, PublicShell, type PublicPageProps } from './PublicPages'
import { useCmsSnapshot } from '../cms/contentRepository'
import { edicaoTemEfeito, estadoDaPagina } from '../cms/portalNavegacao'
import { sementeDaPagina } from './sementeDaPagina'
import { CmsLiveNewsPanel } from './CmsLiveNewsPanel'
import { CmsLiveConteudo } from './CmsLiveConteudo'
import { ehAreaDeNoticias, idDaNoticia, noticiaParaEdicao } from '../cms/noticiaDoCaminho'
import { CmsLivePanel } from './CmsLivePanel'

const RAIZ = '/area-da-equipe/administracao-do-portal/navegar'
const INICIO = '/'

/**
 * Navegador do portal com contexto de edição: o quadro abaixo é o portal real,
 * navegável, e a barra acompanha a página aberta para dizer em que estado ela
 * está e levar à edição daquela página.
 */
export function CmsLiveBrowserPage({ loggedIn, onLogout }: PublicPageProps) {
  const { '*': rota } = useParams()
  const navigate = useNavigate()
  const quadro = useRef<HTMLIFrameElement>(null)
  // Só a montagem usa a rota: depois disso quem manda é a navegação do quadro.
  // `tentativa` remonta o quadro, para funcionar mesmo repetindo o caminho atual.
  const [destino, setDestino] = useState(() => ({ url: rota ? `/${rota}` : INICIO, tentativa: 0 }))
  const [caminho, setCaminho] = useState(destino.url)
  const paginas = useCmsSnapshot().pages
  const [editando, setEditando] = useState(false)
  // Muda a cada "Nova notícia" para o painel remontar em branco.
  const [novaNoticia, setNovaNoticia] = useState(0)

  /** Aceita caminho digitado, colado com o endereço completo ou sem a barra inicial. */
  function navegarPara(valor: string) {
    const limpo = valor.trim()
    if (!limpo) return
    const semOrigem = limpo.startsWith(window.location.origin)
      ? limpo.slice(window.location.origin.length)
      : limpo
    const url = semOrigem.startsWith('/') ? semOrigem : `/${semOrigem}`
    setDestino((atual) => ({ url, tentativa: atual.tentativa + 1 }))
    setCaminho(url)
  }

  // O portal navega por dentro (react-router) e, nesses casos, o evento load não
  // dispara. A leitura periódica da localização cobre as duas formas de navegar.
  useEffect(() => {
    const id = window.setInterval(() => {
      try {
        const atual = quadro.current?.contentWindow?.location
        if (!atual) return
        const completo = `${atual.pathname}${atual.search}`
        setCaminho((anterior) => (anterior === completo ? anterior : completo))
      } catch {
        // Navegação para fora da origem: mantém o último caminho conhecido.
      }
    }, 400)
    return () => window.clearInterval(id)
  }, [])

  // Mantém o endereço da administração alinhado ao que está aberto, para que
  // recarregar não devolva o usuário ao início do portal.
  useEffect(() => {
    const alvo = `${RAIZ}${caminho === INICIO ? '' : caminho}`
    if (window.location.pathname + window.location.search !== alvo) {
      navigate(alvo, { replace: true })
    }
  }, [caminho, navigate])

  const noticias = ehAreaDeNoticias(caminho)
  const editavel = noticias || edicaoTemEfeito(caminho)
  const estado = noticias
    ? { rotulo: idDaNoticia(caminho) ? 'Notícia' : 'Notícias', tom: 'publicada' as const, descricao: idDaNoticia(caminho) ? 'Edite esta notícia sem sair da visualização. A tela de Gestão de notícias continua disponível.' : 'Crie uma notícia a partir daqui. Ela aparece na listagem assim que for publicada.', pagina: undefined }
    : estadoDaPagina(paginas, caminho)

  return (
    <PublicShell loggedIn={loggedIn} onLogout={onLogout}>
      <main className="container public-page cms-admin-page cms-live-page">
        <PublicBreadcrumb
          current="Navegar e editar"
          parents={[
            { label: 'Área da equipe', to: '/area-da-equipe' },
            { label: 'Administração do Portal', to: '/area-da-equipe/administracao-do-portal' },
          ]}
        />

        <section className="simple-page-heading cms-admin-heading">
          <div>
            <h1>Navegar e editar</h1>
            <p>Percorra o portal como o público o vê e edite a página em que estiver.</p>
          </div>
        </section>

        <div className="cms-live-bar">
          <div className="cms-live-nav">
            <button type="button" onClick={() => quadro.current?.contentWindow?.history.back()} title="Voltar">
              <ArrowLeft aria-hidden="true" />
            </button>
            <button type="button" onClick={() => navegarPara(INICIO)} title="Início do portal">
              <Home aria-hidden="true" />
            </button>
            <button type="button" onClick={() => quadro.current?.contentWindow?.location.reload()} title="Recarregar">
              <RefreshCw aria-hidden="true" />
            </button>
          </div>

          <form
            className="cms-live-path-form"
            onSubmit={(evento) => {
              evento.preventDefault()
              navegarPara(String(new FormData(evento.currentTarget).get('caminho') ?? ''))
            }}
          >
            <label className="sr-only" htmlFor="cms-live-caminho">Caminho da página no portal</label>
            {/* Sem estado controlado: a chave devolve o campo ao caminho atual quando o quadro navega. */}
            <input
              className="cms-live-path"
              id="cms-live-caminho"
              name="caminho"
              key={caminho}
              defaultValue={caminho}
              placeholder="/plan-assiste"
              spellCheck={false}
            />
            <button className="cms-live-go" type="submit">Ir</button>
          </form>

          <span className={`cms-live-state is-${estado.tom}`}>{estado.rotulo}</span>

          <div className="cms-live-actions">
            <a className="secondary-button" href={caminho} target="_blank" rel="noreferrer">
              <ExternalLink aria-hidden="true" /> Abrir no portal
            </a>
            <button className="primary-button" type="button" onClick={() => setEditando(true)} disabled={!editavel}>
              <Pencil aria-hidden="true" /> {editando ? 'Editando…' : 'Editar esta página'}
            </button>
          </div>
        </div>

        <p className="cms-live-hint" role="status">{estado.descricao}</p>

        <div className={`cms-live-stage${editando ? ' is-editing' : ''}`}>
          <div className="cms-live-frame-wrap">
            <iframe
              className="cms-live-frame"
              key={destino.tentativa}
              ref={quadro}
              src={destino.url}
              title="Portal Plan-Assiste — visualização para edição"
            />
          </div>

          {editando && noticias && (
            <CmsLiveNewsPanel
              key={`${caminho}-${novaNoticia}`}
              noticiaInicial={noticiaParaEdicao(caminho)}
              existente={Boolean(idDaNoticia(caminho))}
              onFechar={() => setEditando(false)}
              onSalvo={(destino) => { setEditando(false); setDestino((atual) => ({ url: destino, tentativa: atual.tentativa + 1 })); setCaminho(destino) }}
            />
          )}

          {editando && !noticias && (
            <CmsLivePanel
              key={estado.pagina?.id ?? caminho}
              paginaInicial={estado.pagina ?? sementeDaPagina(caminho)}
              personalizada={Boolean(estado.pagina)}
              onFechar={() => setEditando(false)}
              // Recarrega no caminho aberto, nao no de montagem, senao volta ao inicio.
              onSalvo={() => setDestino((atual) => ({ url: caminho, tentativa: atual.tentativa + 1 }))}
            />
          )}
        </div>

        <CmsLiveConteudo
          caminho={caminho}
          onNavegar={navegarPara}
          onNovaNoticia={() => {
            navegarPara('/noticias')
            setNovaNoticia((atual) => atual + 1)
            setEditando(true)
          }}
        />
      </main>
    </PublicShell>
  )
}
