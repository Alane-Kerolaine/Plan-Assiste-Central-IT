import { useRef, useState, type ChangeEvent } from 'react'
import { ImageUp, Maximize2, Minimize2, Save, Trash2, X } from 'lucide-react'
import { PUBLICOS_DE_NOTICIA, REGIOES_DE_NOTICIA, getSiteContent, saveSiteContent, type CmsMediaAsset, type CmsNewsItem } from '../cms/siteContentRepository'
import { RichTextEditor } from '../components/RichTextEditor'
import { CmsRelacionados } from './CmsRelacionados'
import { SeletorMultiplo } from '../components/SeletorMultiplo'
import { BlockEditor } from './CmsAdminPages'
import { createCmsBlock, type CmsBlock, type CmsBlockType } from '../cms/contentRepository'
import { TIPOS_DE_BLOCO } from '../cms/tiposDeBloco'
import { Plus } from 'lucide-react'

/**
 * Seletor de imagem da notícia. Mostra a prévia e explica onde a imagem sai no
 * portal — a distinção entre capa e imagem interna era o que confundia quem
 * preenchia o formulário antigo, que trazia só os dois rótulos.
 */
function ImagemDaNoticia({
  rotulo,
  ondeAparece,
  valor,
  acervo,
  onEscolher,
  onEnviar,
}: {
  rotulo: string
  ondeAparece: string
  valor: string
  acervo: CmsMediaAsset[]
  onEscolher: (url: string) => void
  onEnviar: (arquivo: File) => void
}) {
  const entrada = useRef<HTMLInputElement>(null)

  function enviar(evento: ChangeEvent<HTMLInputElement>) {
    const arquivo = evento.target.files?.[0]
    evento.target.value = ''
    if (!arquivo) return
    if (!arquivo.type.startsWith('image/')) {
      window.alert('Selecione um arquivo de imagem (PNG, JPG, WEBP, GIF ou SVG).')
      return
    }
    onEnviar(arquivo)
  }

  return (
    <div className="cms-imagem-campo">
      <div className="cms-imagem-topo">
        <div>
          <strong>{rotulo}</strong>
          <small>{ondeAparece}</small>
        </div>
        <button type="button" onClick={() => entrada.current?.click()}>
          <ImageUp aria-hidden="true" /> Enviar
        </button>
        <input ref={entrada} hidden type="file" accept="image/*" onChange={enviar} />
      </div>

      <div className="cms-imagem-previa">
        {valor
          ? <img src={valor} alt={`Prévia da ${rotulo.toLowerCase()}`} />
          : <span>Sem imagem</span>}
      </div>

      <select value={valor} onChange={(evento) => onEscolher(evento.target.value)}>
        <option value="">Sem imagem</option>
        {/* A imagem já em uso pode ter vindo de fora do acervo: sem esta opção o campo apareceria vazio. */}
        {valor && !acervo.some((item) => item.url === valor) && <option value={valor}>Imagem atual (fora da biblioteca)</option>}
        {acervo.map((item) => <option key={item.id} value={item.url}>{item.name}</option>)}
      </select>
    </div>
  )
}

/**
 * Painel de edição de notícia no navegador ao vivo. É um caminho a mais: a tela
 * de Gestão de notícias continua existindo para quem preferir a lista.
 */
export function CmsLiveNewsPanel({
  noticiaInicial,
  existente,
  onFechar,
  onSalvo,
  ampliado,
  onAlternarLargura,
}: {
  noticiaInicial: CmsNewsItem
  /** Já publicada no acervo: permite excluir. */
  existente: boolean
  onFechar: () => void
  onSalvo: (destino: string) => void
  /** Painel ocupando a largura maior do palco. */
  ampliado: boolean
  onAlternarLargura: () => void
}) {
  const [noticia, setNoticia] = useState<CmsNewsItem>(noticiaInicial)
  const [aviso, setAviso] = useState('')
  const blocos = noticia.blocks ?? []
  const site = getSiteContent()
  const categorias = site.newsCategories
  // O acervo grava o tipo ora como MIME, ora como extensão solta.
  const acervo = site.media.filter((item) => item.type.startsWith('image/') || /^(png|jpe?g|webp|gif|svg)$/i.test(item.type) || /\.(png|jpe?g|webp|gif|svg)$/i.test(item.name))

  /** Guarda a imagem no acervo e a aplica de imediato no campo. */
  function enviarImagem(arquivo: File, aplicar: (url: string) => void) {
    const leitor = new FileReader()
    leitor.onload = () => {
      const atual = getSiteContent()
      const midia = {
        id: crypto.randomUUID(),
        name: arquivo.name,
        type: arquivo.type,
        size: arquivo.size,
        url: String(leitor.result),
        createdAt: new Date().toISOString(),
      }
      saveSiteContent({ ...atual, media: [...atual.media, midia] })
      aplicar(midia.url)
    }
    leitor.readAsDataURL(arquivo)
  }

  function atualizar(campos: Partial<CmsNewsItem>) {
    setNoticia((atual) => ({ ...atual, ...campos }))
  }

  function salvar(status: CmsNewsItem['status']) {
    if (!noticia.title.trim()) {
      setAviso('Informe o título da notícia antes de salvar.')
      return
    }
    const site = getSiteContent()
    const valor = { ...noticia, status, updatedAt: new Date().toISOString() }
    const news = site.news.some((item) => item.id === valor.id)
      ? site.news.map((item) => (item.id === valor.id ? valor : item))
      : [...site.news, valor]
    saveSiteContent({ ...site, news, deletedNewsIds: site.deletedNewsIds.filter((id) => id !== valor.id) })
    setAviso(status === 'published' ? 'Notícia publicada.' : 'Rascunho salvo.')
    onSalvo(`/noticias/${valor.id}`)
  }

  function excluir() {
    if (!window.confirm('Excluir esta notícia do portal?')) return
    const site = getSiteContent()
    saveSiteContent({
      ...site,
      news: site.news.filter((item) => item.id !== noticia.id),
      deletedNewsIds: [...new Set([...site.deletedNewsIds, noticia.id])],
    })
    onSalvo('/noticias')
  }

  return (
    <aside className="cms-live-panel" aria-label={`Edição de ${noticia.title || 'nova notícia'}`}>
      <header className="cms-live-panel-head">
        <div>
          <p className="eyebrow">{existente ? 'Editando notícia' : 'Nova notícia'}</p>
          <strong>{noticia.title || 'Sem título'}</strong>
          <small>{existente ? `/noticias/${noticia.id}` : 'Será publicada em /noticias'}</small>
        </div>
        <div className="cms-live-panel-head-acoes">
          <button
            type="button"
            onClick={onAlternarLargura}
            title={ampliado ? 'Reduzir o quadro de edição' : 'Ampliar o quadro de edição'}
            aria-label={ampliado ? 'Reduzir o quadro de edição' : 'Ampliar o quadro de edição'}
            aria-pressed={ampliado}
          >
            {ampliado ? <Minimize2 aria-hidden="true" /> : <Maximize2 aria-hidden="true" />}
          </button>
          <button type="button" onClick={onFechar} title="Fechar edição" aria-label="Fechar edição">
            <X aria-hidden="true" />
          </button>
        </div>
      </header>

      <div className="cms-live-panel-body">
        <section className="cms-live-fields">
          <label>Título<input value={noticia.title} onChange={(evento) => atualizar({ title: evento.target.value })} /></label>
          <label>
            Resumo
            <textarea rows={3} value={noticia.summary} onChange={(evento) => atualizar({ summary: evento.target.value })} />
          </label>
          <label>
            Categoria
            <select value={noticia.category} onChange={(evento) => atualizar({ category: evento.target.value })}>
              {categorias.map((categoria) => <option key={categoria} value={categoria}>{categoria}</option>)}
            </select>
          </label>
          <label>Autor<input value={noticia.author} onChange={(evento) => atualizar({ author: evento.target.value })} /></label>
          <label>
            Publicação
            <input type="date" lang="pt-BR" value={noticia.publishDate} onChange={(evento) => atualizar({ publishDate: evento.target.value })} />
          </label>
          <SeletorMultiplo
            rotulo="Público"
            opcoes={PUBLICOS_DE_NOTICIA}
            valor={noticia.audience}
            onChange={(audience) => atualizar({ audience })}
            avisoVazio="Sem público escolhido, a notícia aparece para todos."
          />
          <SeletorMultiplo
            rotulo="Regiões"
            opcoes={REGIOES_DE_NOTICIA}
            valor={noticia.regions}
            onChange={(regions) => atualizar({ regions })}
            avisoVazio="Sem região escolhida, a notícia vale para todas as regiões."
          />
        </section>

        <section className="cms-live-imagens">
          <h3>Imagens</h3>
          <ImagemDaNoticia
            rotulo="Imagem de capa"
            ondeAparece="Aparece no card da notícia, nas listagens e nos destaques."
            valor={noticia.coverUrl}
            acervo={acervo}
            onEscolher={(coverUrl) => atualizar({ coverUrl })}
            onEnviar={(arquivo) => enviarImagem(arquivo, (coverUrl) => atualizar({ coverUrl }))}
          />
          <ImagemDaNoticia
            rotulo="Imagem interna"
            ondeAparece="Aparece dentro da notícia, acima do texto, ao abri-la."
            valor={noticia.bodyImageUrl}
            acervo={acervo}
            onEscolher={(bodyImageUrl) => atualizar({ bodyImageUrl })}
            onEnviar={(arquivo) => enviarImagem(arquivo, (bodyImageUrl) => atualizar({ bodyImageUrl }))}
          />
        </section>

        <section className="cms-live-relacionados">
          <h3>Conteúdos relacionados</h3>
          <p>Escolha o que aparece no rodapé desta notícia, na ordem em que devem sair.</p>
          <CmsRelacionados
            valor={noticia.related ?? []}
            excluir={{ kind: 'news', id: noticia.id }}
            onChange={(related) => atualizar({ related })}
          />
        </section>

        <section className="cms-live-blocks">
          <header>
            <h3>Conteúdo</h3>
            <div className="cms-live-add-block">
              <select
                value=""
                onChange={(evento) => {
                  if (!evento.target.value) return
                  atualizar({ blocks: [...blocos, createCmsBlock(evento.target.value as CmsBlockType)] })
                }}
              >
                <option value="">Adicionar bloco…</option>
                {TIPOS_DE_BLOCO.map(([tipo, rotulo]) => <option key={tipo} value={tipo}>{rotulo}</option>)}
              </select>
              <Plus aria-hidden="true" />
            </div>
          </header>

          <RichTextEditor value={noticia.content} onChange={(content) => atualizar({ content })} minHeight={200} />

          {blocos.length > 0 && (
            <p className="cms-live-blocos-nota">Os blocos abaixo aparecem na notícia depois do texto, nesta ordem.</p>
          )}
          {blocos.map((bloco, indice) => (
            <BlockEditor
              key={bloco.id}
              block={bloco}
              index={indice}
              total={blocos.length}
              onChange={(alterado: CmsBlock) => atualizar({ blocks: blocos.map((item) => item.id === alterado.id ? alterado : item) })}
              onMove={(direcao: -1 | 1) => {
                const lista = [...blocos]
                const alvo = indice + direcao
                if (alvo < 0 || alvo >= lista.length) return
                ;[lista[indice], lista[alvo]] = [lista[alvo], lista[indice]]
                atualizar({ blocks: lista })
              }}
              onDelete={() => atualizar({ blocks: blocos.filter((item) => item.id !== bloco.id) })}
            />
          ))}
        </section>
      </div>

      <footer className="cms-live-panel-foot">
        {aviso && <p className="cms-live-panel-notice" role="status">{aviso}</p>}
        <div>
          {existente && (
            <button className="cms-live-descartar" type="button" onClick={excluir}>
              <Trash2 aria-hidden="true" /> Excluir notícia
            </button>
          )}
          <button className="secondary-button" type="button" onClick={() => salvar('draft')}>
            <Save aria-hidden="true" /> Salvar rascunho
          </button>
          <button className="primary-button" type="button" onClick={() => salvar('published')}>
            <Save aria-hidden="true" /> Publicar
          </button>
        </div>
      </footer>
    </aside>
  )
}
