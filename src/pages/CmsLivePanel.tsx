import { useState } from 'react'
import { Maximize2, Minimize2, Plus, Save, Trash2, X } from 'lucide-react'
import {
  contentRepository,
  createCmsBlock,
  type CmsBlock,
  type CmsBlockType,
  type CmsPage,
} from '../cms/contentRepository'
import { BlockEditor } from './CmsAdminPages'
import { CmsRelacionados } from './CmsRelacionados'
import { TIPOS_DE_BLOCO } from '../cms/tiposDeBloco'


/**
 * Painel de edição da página aberta no navegador. Fica ao lado do quadro para
 * que a alteração e o resultado publicado convivam na mesma tela.
 */
export function CmsLivePanel({
  paginaInicial,
  onFechar,
  onSalvo,
  personalizada,
  ampliado,
  onAlternarLargura,
}: {
  paginaInicial: CmsPage
  onFechar: () => void
  onSalvo: () => void
  /** Já existe versão salva: permite descartar e voltar ao conteúdo original. */
  personalizada: boolean
  /** Painel ocupando a largura maior do palco. */
  ampliado: boolean
  onAlternarLargura: () => void
}) {
  const [pagina, setPagina] = useState<CmsPage>(paginaInicial)
  const [aviso, setAviso] = useState('')

  function atualizar(campos: Partial<CmsPage>) {
    setPagina((atual) => ({ ...atual, ...campos }))
  }

  function salvar(status: CmsPage['status']) {
    if (!pagina.title.trim()) {
      setAviso('Informe o título da página antes de salvar.')
      return
    }
    contentRepository.savePage({
      ...pagina,
      status,
      navigationTitle: pagina.navigationTitle.trim() || pagina.title.trim(),
      updatedAt: new Date().toISOString(),
    })
    setAviso(status === 'published' ? 'Página publicada.' : 'Rascunho salvo.')
    onSalvo()
  }

  function descartar() {
    if (!window.confirm('Descartar a personalização e voltar ao conteúdo original desta página?')) return
    contentRepository.deletePage(pagina.id)
    setAviso('Personalização descartada. A página voltou ao conteúdo original.')
    onSalvo()
  }

  return (
    <aside className="cms-live-panel" aria-label={`Edição de ${pagina.title || 'nova página'}`}>
      <header className="cms-live-panel-head">
        <div>
          <p className="eyebrow">Editando</p>
          <strong>{pagina.title || 'Nova página'}</strong>
          <small>/{pagina.slug}</small>
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
          <label>Título<input value={pagina.title} onChange={(evento) => atualizar({ title: evento.target.value })} /></label>
          <label>
            Título no menu
            <input
              value={pagina.navigationTitle}
              onChange={(evento) => atualizar({ navigationTitle: evento.target.value })}
              placeholder="Igual ao título, se vazio"
            />
          </label>
          <label>
            Resumo
            <textarea rows={3} value={pagina.summary} onChange={(evento) => atualizar({ summary: evento.target.value })} />
          </label>
        </section>

        <section className="cms-live-blocks">
          <header>
            <h3>Conteúdo</h3>
            <div className="cms-live-add-block">
              <select
                value=""
                onChange={(evento) => {
                  if (!evento.target.value) return
                  atualizar({ blocks: [...pagina.blocks, createCmsBlock(evento.target.value as CmsBlockType)] })
                }}
              >
                <option value="">Adicionar bloco…</option>
                {TIPOS_DE_BLOCO.map(([tipo, rotulo]) => <option key={tipo} value={tipo}>{rotulo}</option>)}
              </select>
              <Plus aria-hidden="true" />
            </div>
          </header>

          {pagina.blocks.map((bloco, indice) => (
            <BlockEditor
              key={bloco.id}
              block={bloco}
              index={indice}
              total={pagina.blocks.length}
              onChange={(alterado: CmsBlock) => atualizar({ blocks: pagina.blocks.map((item) => item.id === alterado.id ? alterado : item) })}
              onMove={(direcao: -1 | 1) => {
                const blocos = [...pagina.blocks]
                const alvo = indice + direcao
                if (alvo < 0 || alvo >= blocos.length) return
                ;[blocos[indice], blocos[alvo]] = [blocos[alvo], blocos[indice]]
                atualizar({ blocks: blocos })
              }}
              onDelete={() => atualizar({ blocks: pagina.blocks.filter((item) => item.id !== bloco.id) })}
            />
          ))}
        </section>

        <section className="cms-live-relacionados">
          <h3>Conteúdos relacionados</h3>
          <p>Escolha o que aparece no rodapé desta página, na ordem em que devem sair.</p>
          <CmsRelacionados
            valor={pagina.related ?? []}
            excluir={{ kind: 'page', id: pagina.slug }}
            onChange={(related) => atualizar({ related })}
          />
        </section>

      </div>

      <footer className="cms-live-panel-foot">
        {aviso && <p className="cms-live-panel-notice" role="status">{aviso}</p>}
        <div>
          {personalizada && (
            <button className="cms-live-descartar" type="button" onClick={descartar}>
              <Trash2 aria-hidden="true" /> Descartar personalização
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
