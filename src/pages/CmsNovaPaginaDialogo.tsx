import { useState } from 'react'
import { X } from 'lucide-react'
import { caminhoDoSlug, slugFilho } from '../cms/portalNavegacao'
import { enderecoDeTitulo } from '../utils/texto'

export type OpcaoDeMae = {
  /** Slug da mãe, ou '' para a raiz da seção. */
  valor: string
  rotulo: string
}

/**
 * Criação de página no navegador ao vivo. É um formulário, e não uma sequência
 * de janelas de pergunta: quem cria precisa ver o endereço final antes de
 * confirmar, e poder trocar a página mãe sem recomeçar.
 */
export function CmsNovaPaginaDialogo({
  maes,
  maeInicial,
  slugsExistentes,
  onCancelar,
  onCriar,
}: {
  maes: OpcaoDeMae[]
  maeInicial: string
  /** Endereços já em uso, para recusar duplicata antes de gravar. */
  slugsExistentes: string[]
  onCancelar: () => void
  onCriar: (dados: { titulo: string, slug: string, parentSlug: string | null, publicar: boolean }) => void
}) {
  const [titulo, setTitulo] = useState('')
  // Enquanto ninguém editar o endereço à mão, ele acompanha o título.
  const [enderecoManual, setEnderecoManual] = useState<string>()
  const [mae, setMae] = useState(maeInicial)
  const [publicar, setPublicar] = useState(false)
  const [erro, setErro] = useState('')

  const endereco = enderecoManual ?? enderecoDeTitulo(titulo)
  const slugFinal = slugFilho(mae, endereco)
  const caminhoFinal = endereco ? caminhoDoSlug(slugFinal) : ''

  function confirmar() {
    if (!titulo.trim()) return setErro('Informe o título da página.')
    if (!endereco) return setErro('Informe o endereço da página.')
    if (slugsExistentes.includes(slugFinal)) return setErro(`Já existe uma página em ${caminhoFinal}.`)
    onCriar({ titulo: titulo.trim(), slug: slugFinal, parentSlug: mae || null, publicar })
  }

  return (
    <div className="cms-dialogo-fundo" role="presentation" onClick={onCancelar}>
      <div
        className="cms-dialogo"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cms-nova-pagina-titulo"
        onClick={(evento) => evento.stopPropagation()}
      >
        <header>
          <h2 id="cms-nova-pagina-titulo">Nova página</h2>
          <button type="button" onClick={onCancelar} title="Fechar" aria-label="Fechar">
            <X aria-hidden="true" />
          </button>
        </header>

        <div className="cms-dialogo-corpo">
          <label>
            Título da página
            <input
              autoFocus
              value={titulo}
              onChange={(evento) => { setTitulo(evento.target.value); setErro('') }}
              placeholder="Título da página"
            />
          </label>

          <label>
            Fica dentro de
            <select value={mae} onChange={(evento) => { setMae(evento.target.value); setErro('') }}>
              {maes.map((opcao) => <option key={opcao.valor} value={opcao.valor}>{opcao.rotulo}</option>)}
            </select>
          </label>

          <label>
            Endereço
            <input
              value={endereco}
              onChange={(evento) => { setEnderecoManual(enderecoDeTitulo(evento.target.value)); setErro('') }}
              placeholder="endereco-da-pagina"
              spellCheck={false}
            />
          </label>

          <p className="cms-dialogo-previa">
            Endereço final: <code>{caminhoFinal || '—'}</code>
          </p>

          <label className="cms-dialogo-checkbox">
            <input type="checkbox" checked={publicar} onChange={(evento) => setPublicar(evento.target.checked)} />
            <span>
              Publicar imediatamente
              <small>Sem marcar, a página nasce como rascunho: só quem edita a enxerga, e o público não.</small>
            </span>
          </label>

          {erro && <p className="cms-dialogo-erro" role="alert">{erro}</p>}
        </div>

        <footer>
          <button className="secondary-button" type="button" onClick={onCancelar}>Cancelar</button>
          <button className="primary-button" type="button" onClick={confirmar}>Criar página</button>
        </footer>
      </div>
    </div>
  )
}
