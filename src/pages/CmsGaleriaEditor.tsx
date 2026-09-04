import { useState } from 'react'
import { ArrowLeft, ArrowRight, ImagePlus, Trash2 } from 'lucide-react'
import type { CmsBlock, CmsGalleryItem } from '../cms/contentRepository'
import { SeletorDeImagem } from '../components/SeletorDeImagem'

/**
 * Montagem do carrossel: lista das imagens na ordem em que aparecem, cada uma
 * com a própria legenda. A legenda fica ao lado da miniatura porque escrevê-la
 * sem ver a imagem é o caminho mais fácil para trocá-las de lugar.
 */
export function CmsGaleriaEditor({ block, onChange }: { block: CmsBlock, onChange: (block: CmsBlock) => void }) {
  const [adicionando, setAdicionando] = useState(false)
  const itens = block.galleryItems || []

  function definir(galleryItems: CmsGalleryItem[]) {
    onChange({ ...block, galleryItems })
  }

  function mover(indice: number, passo: -1 | 1) {
    const destino = indice + passo
    if (destino < 0 || destino >= itens.length) return
    const copia = [...itens]
    ;[copia[indice], copia[destino]] = [copia[destino], copia[indice]]
    definir(copia)
  }

  return (
    <section className="cms-galeria-editor">
      <div className="cms-galeria-editor-topo">
        <label className="cms-galeria-auto">
          <input
            type="checkbox"
            checked={block.galleryAutoplay ?? true}
            onChange={(evento) => onChange({ ...block, galleryAutoplay: evento.target.checked })}
          />
          <span>
            Trocar as imagens sozinho
            <small>Quem estiver vendo pode pausar. Fica desligado para quem pediu menos animação no sistema.</small>
          </span>
        </label>
        <button className="secondary-button" type="button" onClick={() => setAdicionando(true)}>
          <ImagePlus aria-hidden="true" /> Adicionar imagem
        </button>
      </div>

      {itens.length === 0 ? (
        <p className="cms-relacionados-vazio">Nenhuma imagem ainda. O carrossel não aparece na página enquanto estiver vazio.</p>
      ) : (
        <ol className="cms-galeria-editor-lista">
          {itens.map((item, indice) => (
            <li key={item.id}>
              <img src={item.url} alt="" />
              <label>
                <span className="sr-only">Legenda da imagem {indice + 1}</span>
                <input
                  value={item.caption}
                  placeholder="Legenda (aparece acima da imagem)"
                  onChange={(evento) => definir(itens.map((atual, i) => i === indice ? { ...atual, caption: evento.target.value } : atual))}
                />
              </label>
              <div className="cms-galeria-editor-acoes">
                <button type="button" title="Mover para trás" aria-label={`Mover a imagem ${indice + 1} para trás`} disabled={indice === 0} onClick={() => mover(indice, -1)}>
                  <ArrowLeft aria-hidden="true" />
                </button>
                <button type="button" title="Mover para frente" aria-label={`Mover a imagem ${indice + 1} para frente`} disabled={indice === itens.length - 1} onClick={() => mover(indice, 1)}>
                  <ArrowRight aria-hidden="true" />
                </button>
                <button type="button" className="cms-table-remover" title="Remover do carrossel" aria-label={`Remover a imagem ${indice + 1}`} onClick={() => definir(itens.filter((_, i) => i !== indice))}>
                  <Trash2 aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}

      {adicionando && (
        <SeletorDeImagem
          onFechar={() => setAdicionando(false)}
          onEscolher={({ src, alt }) => {
            definir([...itens, { id: crypto.randomUUID(), url: src, caption: alt }])
            setAdicionando(false)
          }}
        />
      )}
    </section>
  )
}
