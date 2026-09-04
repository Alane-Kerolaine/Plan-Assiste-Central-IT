import { useRef, useState, type ChangeEvent } from 'react'
import { ImageUp, X } from 'lucide-react'
import { enviarParaAcervo, imagensDoAcervo } from '../cms/acervoDeImagens'

/**
 * Escolha de imagem em janela propria: grade com o acervo e envio de arquivo.
 *
 * O texto alternativo fica no mesmo lugar da escolha porque, pedido depois, ele
 * costuma ser ignorado — e sem ele a imagem nao existe para quem usa leitor de
 * tela.
 */
export function SeletorDeImagem({
  onEscolher,
  onFechar,
}: {
  onEscolher: (dados: { src: string, alt: string }) => void
  onFechar: () => void
}) {
  const entrada = useRef<HTMLInputElement>(null)
  const [acervo, setAcervo] = useState(imagensDoAcervo)
  const [escolhida, setEscolhida] = useState('')
  const [alt, setAlt] = useState('')

  function enviar(evento: ChangeEvent<HTMLInputElement>) {
    const arquivo = evento.target.files?.[0]
    evento.target.value = ''
    if (!arquivo) return
    if (!arquivo.type.startsWith('image/')) {
      window.alert('Selecione um arquivo de imagem (PNG, JPG, WEBP, GIF ou SVG).')
      return
    }
    enviarParaAcervo(arquivo, (url) => {
      setAcervo(imagensDoAcervo())
      setEscolhida(url)
      if (!alt) setAlt(arquivo.name.replace(/\.[^.]+$/, ''))
    })
  }

  return (
    <div className="cms-dialogo-fundo" role="presentation" onClick={onFechar}>
      <div
        className="cms-dialogo cms-dialogo-imagens"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cms-seletor-imagem-titulo"
        onClick={(evento) => evento.stopPropagation()}
      >
        <header>
          <h2 id="cms-seletor-imagem-titulo">Inserir imagem</h2>
          <button type="button" onClick={onFechar} title="Fechar" aria-label="Fechar">
            <X aria-hidden="true" />
          </button>
        </header>

        <div className="cms-dialogo-corpo">
          <button className="secondary-button cms-imagem-enviar" type="button" onClick={() => entrada.current?.click()}>
            <ImageUp aria-hidden="true" /> Enviar imagem do computador
          </button>
          <input ref={entrada} hidden type="file" accept="image/*" onChange={enviar} />

          {acervo.length === 0 ? (
            <p className="cms-relacionados-vazio">Nenhuma imagem no acervo ainda. Envie a primeira pelo botão acima.</p>
          ) : (
            <ul className="cms-imagem-grade">
              {acervo.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className={item.url === escolhida ? 'is-escolhida' : undefined}
                    aria-pressed={item.url === escolhida}
                    onClick={() => setEscolhida(item.url)}
                  >
                    <img src={item.url} alt="" />
                    <small>{item.name}</small>
                  </button>
                </li>
              ))}
            </ul>
          )}

          <label>
            Texto alternativo
            <input
              value={alt}
              onChange={(evento) => setAlt(evento.target.value)}
              placeholder="Descreva a imagem para quem não pode vê-la"
            />
          </label>
        </div>

        <footer>
          <button className="secondary-button" type="button" onClick={onFechar}>Cancelar</button>
          <button
            className="primary-button"
            type="button"
            disabled={!escolhida}
            onClick={() => onEscolher({ src: escolhida, alt: alt.trim() })}
          >
            Inserir imagem
          </button>
        </footer>
      </div>
    </div>
  )
}
