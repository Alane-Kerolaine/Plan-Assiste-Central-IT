import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'
import type { CmsGalleryItem } from '../cms/contentRepository'

const INTERVALO = 5000

/** Respeita quem pediu menos animação no sistema: nesse caso não gira sozinho. */
function prefereMenosMovimento(): boolean {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Carrossel de imagens: imagem grande, legenda, contador e faixa de miniaturas.
 *
 * O giro automático começa desligado quando o sistema pede menos movimento, e
 * qualquer ação de quem está vendo — seta, miniatura ou teclado — o interrompe:
 * a imagem trocar sozinha no meio da leitura é o pior comportamento possível.
 */
export function CmsGaleria({ itens, autoplay, titulo }: { itens: CmsGalleryItem[], autoplay?: boolean, titulo?: string }) {
  const [atual, setAtual] = useState(0)
  const [girando, setGirando] = useState(Boolean(autoplay) && !prefereMenosMovimento())
  const faixa = useRef<HTMLDivElement>(null)

  const total = itens.length
  // Uma exclusão no editor pode deixar o índice além do fim.
  const indice = total === 0 ? 0 : Math.min(atual, total - 1)

  useEffect(() => {
    if (!girando || total <= 1) return
    const id = window.setInterval(() => setAtual((anterior) => (anterior + 1) % total), INTERVALO)
    return () => window.clearInterval(id)
  }, [girando, total])

  // Mantém a miniatura ativa visível quando a faixa é maior que a tela.
  useEffect(() => {
    const alvo = faixa.current?.children[indice] as HTMLElement | undefined
    alvo?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }, [indice])

  if (total === 0) return null

  function irPara(proximo: number) {
    setGirando(false)
    setAtual((proximo + total) % total)
  }

  const item = itens[indice]

  return (
    <div
      className="cms-galeria"
      role="group"
      aria-roledescription="carrossel"
      aria-label={titulo || 'Galeria de imagens'}
      onKeyDown={(evento) => {
        if (evento.key === 'ArrowLeft') { evento.preventDefault(); irPara(indice - 1) }
        if (evento.key === 'ArrowRight') { evento.preventDefault(); irPara(indice + 1) }
      }}
    >
      {item.caption && <p className="cms-galeria-legenda">{item.caption}</p>}

      <div className="cms-galeria-palco">
        <img src={item.url} alt={item.caption || `Imagem ${indice + 1} de ${total}`} />

        {total > 1 && (
          <>
            <button className="cms-galeria-seta is-anterior" type="button" onClick={() => irPara(indice - 1)} aria-label="Imagem anterior">
              <ChevronLeft aria-hidden="true" />
            </button>
            <button className="cms-galeria-seta is-proxima" type="button" onClick={() => irPara(indice + 1)} aria-label="Próxima imagem">
              <ChevronRight aria-hidden="true" />
            </button>
            <button
              className="cms-galeria-girar"
              type="button"
              onClick={() => setGirando((ligado) => !ligado)}
              aria-label={girando ? 'Pausar a troca automática' : 'Retomar a troca automática'}
            >
              {girando ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
            </button>
          </>
        )}

        <span className="cms-galeria-contador" aria-live="polite">{indice + 1} / {total}</span>
      </div>

      {total > 1 && (
        <div className="cms-galeria-miniaturas" ref={faixa}>
          {itens.map((miniatura, posicao) => (
            <button
              key={miniatura.id}
              type="button"
              className={posicao === indice ? 'is-atual' : undefined}
              aria-label={`Ver imagem ${posicao + 1}${miniatura.caption ? `: ${miniatura.caption}` : ''}`}
              aria-current={posicao === indice || undefined}
              onClick={() => irPara(posicao)}
            >
              <img src={miniatura.url} alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
