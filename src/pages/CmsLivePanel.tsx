import { useRef, useState, type ChangeEvent } from 'react'
import { FileUp, Plus, Save, Trash2, X } from 'lucide-react'
import {
  contentRepository,
  createCmsBlock,
  type CmsBlock,
  type CmsBlockType,
  type CmsPage,
  type CmsPageFile,
} from '../cms/contentRepository'
import { BlockEditor } from './CmsAdminPages'

const TIPOS_DE_BLOCO: Array<[CmsBlockType, string]> = [
  ['rich-text', 'Texto'],
  ['card', 'Card'],
  ['document', 'Documento'],
  ['notice', 'Aviso'],
  ['table', 'Tabela'],
  ['button', 'Botão'],
  ['media', 'Mídia'],
  ['faq', 'Perguntas frequentes'],
]

function tamanhoLegivel(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function dataLegivel(iso: string): string {
  const data = new Date(iso)
  return Number.isNaN(data.getTime())
    ? '—'
    : `${data.toLocaleDateString('pt-BR')} ${data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
}

/**
 * Tabela de arquivos da página — apenas os documentos que pertencem a ela, no
 * espírito da aba "Conteúdo" do portal atual.
 */
function ArquivosDaPagina({
  arquivos,
  onChange,
}: {
  arquivos: CmsPageFile[]
  onChange: (arquivos: CmsPageFile[]) => void
}) {
  const entrada = useRef<HTMLInputElement>(null)

  function enviar(evento: ChangeEvent<HTMLInputElement>) {
    const escolhidos = Array.from(evento.target.files ?? [])
    if (escolhidos.length === 0) return
    let pendentes = escolhidos.length
    const novos: CmsPageFile[] = []
    escolhidos.forEach((arquivo) => {
      const leitor = new FileReader()
      leitor.onload = () => {
        novos.push({
          id: crypto.randomUUID(),
          name: arquivo.name,
          type: arquivo.type || arquivo.name.split('.').pop() || 'arquivo',
          size: arquivo.size,
          url: String(leitor.result),
          status: 'published',
          updatedAt: new Date().toISOString(),
        })
        pendentes -= 1
        if (pendentes === 0) onChange([...arquivos, ...novos])
      }
      leitor.readAsDataURL(arquivo)
    })
    evento.target.value = ''
  }

  function alterarEstado(id: string) {
    onChange(arquivos.map((arquivo) => (
      arquivo.id === id
        ? { ...arquivo, status: arquivo.status === 'published' ? 'draft' : 'published', updatedAt: new Date().toISOString() }
        : arquivo
    )))
  }

  function renomear(id: string) {
    const atual = arquivos.find((arquivo) => arquivo.id === id)
    if (!atual) return
    const nome = window.prompt('Novo nome do arquivo:', atual.name)?.trim()
    if (!nome) return
    onChange(arquivos.map((arquivo) => (
      arquivo.id === id ? { ...arquivo, name: nome, updatedAt: new Date().toISOString() } : arquivo
    )))
  }

  return (
    <section className="cms-live-files">
      <header>
        <div>
          <h3>Arquivos desta página</h3>
          <p>Documentos que pertencem só a esta página. O acervo completo fica em Arquivos.</p>
        </div>
        <button className="secondary-button" type="button" onClick={() => entrada.current?.click()}>
          <FileUp aria-hidden="true" /> Adicionar arquivos
        </button>
        <input ref={entrada} hidden multiple type="file" onChange={enviar} />
      </header>

      {arquivos.length === 0 ? (
        <p className="cms-live-files-empty">Nenhum arquivo nesta página ainda.</p>
      ) : (
        <div className="portal-table-wrap">
          <table className="portal-table">
            <thead>
              <tr><th>Título</th><th>Tamanho</th><th>Modificado</th><th>Estado</th><th>Ações</th></tr>
            </thead>
            <tbody>
              {arquivos.map((arquivo) => (
                <tr key={arquivo.id}>
                  <td><a href={arquivo.url} target="_blank" rel="noreferrer">{arquivo.name}</a></td>
                  <td>{tamanhoLegivel(arquivo.size)}</td>
                  <td>{dataLegivel(arquivo.updatedAt)}</td>
                  <td>{arquivo.status === 'published' ? 'Publicado' : 'Rascunho'}</td>
                  <td>
                    <div className="cms-table-actions">
                      <button type="button" onClick={() => renomear(arquivo.id)}>Renomear</button>
                      <button type="button" onClick={() => alterarEstado(arquivo.id)}>Alterar estado</button>
                      <button
                        type="button"
                        onClick={() => { if (window.confirm(`Excluir "${arquivo.name}"?`)) onChange(arquivos.filter((item) => item.id !== arquivo.id)) }}
                      >
                        <Trash2 aria-hidden="true" /> Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

/**
 * Painel de edição da página aberta no navegador. Fica ao lado do quadro para
 * que a alteração e o resultado publicado convivam na mesma tela.
 */
export function CmsLivePanel({
  paginaInicial,
  onFechar,
  onSalvo,
}: {
  paginaInicial: CmsPage
  onFechar: () => void
  onSalvo: () => void
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

  return (
    <aside className="cms-live-panel" aria-label={`Edição de ${pagina.title || 'nova página'}`}>
      <header className="cms-live-panel-head">
        <div>
          <p className="eyebrow">Editando</p>
          <strong>{pagina.title || 'Nova página'}</strong>
          <small>/{pagina.slug}</small>
        </div>
        <button type="button" onClick={onFechar} title="Fechar edição" aria-label="Fechar edição">
          <X aria-hidden="true" />
        </button>
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

        <ArquivosDaPagina arquivos={pagina.files ?? []} onChange={(files) => atualizar({ files })} />
      </div>

      <footer className="cms-live-panel-foot">
        {aviso && <p className="cms-live-panel-notice" role="status">{aviso}</p>}
        <div>
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
