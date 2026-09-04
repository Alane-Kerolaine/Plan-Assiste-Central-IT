import { useRef, useState, type ChangeEvent } from 'react'
import { ArrowUp, FileText, FilePlus2, FileUp, Folder, FolderPlus, Search } from 'lucide-react'
import {
  contentRepository,
  useCmsSnapshot,
  type CmsPage,
  type CmsPageFile,
} from '../cms/contentRepository'
import { caminhoDoSlug, slugDaMae, slugDoCaminho } from '../cms/portalNavegacao'
import { sementeDaPagina } from './sementeDaPagina'
import { ehAreaDeNoticias } from '../cms/noticiaDoCaminho'
import { getSiteContent } from '../cms/siteContentRepository'
import { normalizaTexto } from '../utils/texto'
import { CmsNovaPaginaDialogo, type OpcaoDeMae } from './CmsNovaPaginaDialogo'
import { VisaoEmPastas } from '../components/VisaoEmPastas'
import { AlternadorDeVisao, type Visao } from '../components/AlternadorDeVisao'
import { caminhoDaNovaPasta, folderAposExcluir, folderAposRenomear, segmentosComPastaManual, type ItemComPasta } from '../cms/pastas'
import { NovaPastaBotao } from '../components/NovaPastaBotao'
import { getSiteContent as lerSite, saveSiteContent } from '../cms/siteContentRepository'

type Linha =
  | { tipo: 'pagina', grupo: string, id: string, titulo: string, estado: string, modificado: string, tamanho: number, destino: string }
  | { tipo: 'arquivo', grupo: string, id: string, titulo: string, estado: string, modificado: string, tamanho: number, url: string }

function tamanhoLegivel(bytes: number): string {
  if (bytes <= 0) return '—'
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

/** Peso aproximado da página, para a coluna Tamanho ter significado. */
function pesoDaPagina(pagina: CmsPage): number {
  return new Blob([JSON.stringify(pagina.blocks ?? [])]).size
}

/**
 * Conteúdo da página aberta: páginas filhas e arquivos, no formato de tabela do
 * portal atual. Serve tanto para ver o que existe abaixo da página quanto para
 * navegar até lá — clicar num título leva o quadro para aquele item.
 */
export function CmsLiveConteudo({
  caminho,
  onNavegar,
  onNovaNoticia,
}: {
  caminho: string
  onNavegar: (destino: string) => void
  /** Abre o cadastro de notícia no painel, já em branco. */
  onNovaNoticia: () => void
}) {
  const paginas = useCmsSnapshot().pages
  const entrada = useRef<HTMLInputElement>(null)
  const [selecionados, setSelecionados] = useState<string[]>([])
  const [busca, setBusca] = useState('')
  // Guarda a mae pre-selecionada; undefined mantem o dialogo fechado.
  const [criando, setCriando] = useState<string>()
  const [visao, setVisao] = useState<Visao>('lista')
  const [pasta, setPasta] = useState<string[]>([])

  const slug = slugDoCaminho(caminho)
  const areaDeNoticias = ehAreaDeNoticias(caminho)
  const gerenciavel = slug !== undefined

  const pagina = slug ? paginas.find((item) => item.slug === slug) : undefined
  const filhas = slug ? paginas.filter((item) => item.parentSlug === slug) : []
  const arquivos = pagina?.files ?? []
  const mae = slug ? slugDaMae(slug) : undefined

  // Na area de noticias, os "filhos" sao as proprias noticias do acervo.
  const noticias = areaDeNoticias ? getSiteContent().news : []

  const linhas: Linha[] = [
    ...noticias.map((noticia): Linha => ({
      tipo: 'pagina',
      grupo: segmentosComPastaManual(noticia.folder, ['Notícias']).join('/'),
      id: noticia.id,
      titulo: noticia.title || '(sem título)',
      estado: noticia.status === 'published' ? 'Publicado' : 'Esboço público',
      modificado: noticia.updatedAt,
      tamanho: new Blob([noticia.content ?? '']).size,
      destino: `/noticias/${noticia.id}`,
    })),
    ...filhas.map((filha): Linha => ({
      tipo: 'pagina',
      grupo: segmentosComPastaManual(filha.folder, ['Páginas']).join('/'),
      id: filha.id,
      titulo: filha.title || filha.slug,
      estado: filha.status === 'published' ? 'Publicado' : 'Esboço público',
      modificado: filha.updatedAt,
      tamanho: pesoDaPagina(filha),
      destino: caminhoDoSlug(filha.slug),
    })),
    ...arquivos.map((arquivo): Linha => ({
      tipo: 'arquivo',
      grupo: segmentosComPastaManual(arquivo.folder, ['Arquivos']).join('/'),
      id: arquivo.id,
      titulo: arquivo.name,
      estado: arquivo.status === 'published' ? 'Publicado' : 'Esboço público',
      modificado: arquivo.updatedAt,
      tamanho: arquivo.size,
      url: arquivo.url,
    })),
  ]

  const termo = normalizaTexto(busca.trim())
  const visiveis = termo ? linhas.filter((linha) => normalizaTexto(linha.titulo).includes(termo)) : linhas

  /** Garante uma página salva para pendurar arquivos e filhas. */
  function paginaGravavel(): CmsPage {
    if (pagina) return pagina
    const nova = { ...sementeDaPagina(caminho), status: 'draft' as const }
    contentRepository.savePage(nova)
    return nova
  }

  function gravarArquivos(lista: CmsPageFile[]) {
    const base = paginaGravavel()
    contentRepository.savePage({ ...base, files: lista, updatedAt: new Date().toISOString() })
  }

  function enviar(evento: ChangeEvent<HTMLInputElement>) {
    const escolhidos = Array.from(evento.target.files ?? [])
    if (escolhidos.length === 0) return
    const base = paginaGravavel()
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
        if (pendentes === 0) {
          contentRepository.savePage({
            ...base,
            files: [...(base.files ?? []), ...novos],
            updatedAt: new Date().toISOString(),
          })
        }
      }
      leitor.readAsDataURL(arquivo)
    })
    evento.target.value = ''
  }

  /** Raiz da familia da pagina aberta, para oferecer "dentro de" no dialogo. */
  const raizDaFamilia = slug?.startsWith('transparencia') ? 'transparencia' : 'plan-assiste'

  const maes: OpcaoDeMae[] = [
    { valor: raizDaFamilia, rotulo: raizDaFamilia === 'transparencia' ? 'Transparência (raiz)' : 'Plan-Assiste (raiz)' },
    ...paginas
      .filter((item) => item.slug !== raizDaFamilia && (raizDaFamilia === 'transparencia' ? item.slug.startsWith('transparencia/') : !item.slug.startsWith('transparencia')))
      .map((item) => ({ valor: item.slug, rotulo: `${item.title || item.slug} (${caminhoDoSlug(item.slug)})` }))
      .sort((a, b) => a.rotulo.localeCompare(b.rotulo, 'pt-BR')),
  ]

  function criarPagina({ titulo, slug: slugNovo, parentSlug, publicar }: { titulo: string, slug: string, parentSlug: string | null, publicar: boolean }) {
    const base = sementeDaPagina(caminhoDoSlug(slugNovo))
    contentRepository.savePage({
      ...base,
      slug: slugNovo,
      parentSlug,
      title: titulo,
      navigationTitle: titulo,
      summary: '',
      blocks: base.blocks,
      status: publicar ? 'published' : 'draft',
      updatedAt: new Date().toISOString(),
    })
    setCriando(undefined)
    // Leva o quadro para a pagina recem-criada, senao ela some de vista.
    onNavegar(caminhoDoSlug(slugNovo))
  }

  function alternar(id: string) {
    setSelecionados((atual) => (atual.includes(id) ? atual.filter((item) => item !== id) : [...atual, id]))
  }

  function paraCadaSelecionado(acao: (linha: Linha) => void) {
    linhas.filter((linha) => selecionados.includes(linha.id)).forEach(acao)
    setSelecionados([])
  }

  function renomear() {
    paraCadaSelecionado((linha) => {
      const nome = window.prompt(`Novo nome de "${linha.titulo}":`, linha.titulo)?.trim()
      if (!nome) return
      if (linha.tipo === 'arquivo') {
        gravarArquivos(arquivos.map((item) => (item.id === linha.id ? { ...item, name: nome, updatedAt: new Date().toISOString() } : item)))
        return
      }
      const filha = paginas.find((item) => item.id === linha.id)
      if (filha) contentRepository.savePage({ ...filha, title: nome, navigationTitle: nome, updatedAt: new Date().toISOString() })
    })
  }

  function alterarEstado() {
    paraCadaSelecionado((linha) => {
      if (linha.tipo === 'arquivo') {
        gravarArquivos(arquivos.map((item) => (
          item.id === linha.id
            ? { ...item, status: item.status === 'published' ? 'draft' : 'published', updatedAt: new Date().toISOString() }
            : item
        )))
        return
      }
      const filha = paginas.find((item) => item.id === linha.id)
      if (filha) {
        contentRepository.savePage({
          ...filha,
          status: filha.status === 'published' ? 'draft' : 'published',
          updatedAt: new Date().toISOString(),
        })
      }
    })
  }

  function excluir() {
    const alvos = linhas.filter((linha) => selecionados.includes(linha.id))
    if (alvos.length === 0) return
    if (!window.confirm(`Excluir ${alvos.length} item(ns) selecionado(s)?`)) return
    const arquivosRestantes = arquivos.filter((item) => !selecionados.includes(item.id))
    if (arquivosRestantes.length !== arquivos.length) gravarArquivos(arquivosRestantes)
    alvos.filter((linha) => linha.tipo === 'pagina').forEach((linha) => contentRepository.deletePage(linha.id))
    setSelecionados([])
  }

  // Cada tipo de conteúdo é uma pasta: notícias, páginas filhas e arquivos.
  const entradasDeConteudo: Array<ItemComPasta<Linha>> = visiveis.map((linha) => ({ item: linha, segmentos: linha.grupo.split('/') }))
  // As pastas existem mesmo vazias: e dentro delas que se cria o primeiro item.
  // Renomear ou excluir uma pasta de tipo (Noticias, Paginas, Arquivos) nao a
  // elimina: ela e recriada a partir dos itens que nao tem pasta manual.
  /** Pastas criadas aqui ficam guardadas na propria pagina. */
  const pastasCriadas = (pagina?.contentFolders ?? []).map((caminho) => caminho.split('/'))

  function gravarPastas(lista: string[]) {
    const base = paginaGravavel()
    contentRepository.savePage({ ...base, contentFolders: lista, updatedAt: new Date().toISOString() })
  }

  function criarPastaDeConteudo(nome: string) {
    const novo = caminhoDaNovaPasta(pasta, nome)
    if (!novo) return
    const caminho = novo.join('/')
    const atuais = pagina?.contentFolders ?? []
    if (atuais.includes(caminho)) { window.alert(`Já existe uma pasta “${nome}” aqui.`); return }
    gravarPastas([...atuais, caminho])
    setPasta(novo)
  }

  /** Renomear leva junto notícias, páginas filhas e arquivos que estavam dentro. */
  function renomearPastaDeConteudo(nome: string, novo: string) {
    const antigo = [...pasta, nome]
    const destino = [...pasta, novo]
    const atuais = pagina?.contentFolders ?? []
    if (atuais.includes(destino.join('/'))) { window.alert(`Já existe uma pasta “${novo}” aqui.`); return }
    moverConteudo(antigo, destino, false)
  }

  function excluirPastaDeConteudo(nome: string, total: number) {
    const alvo = [...pasta, nome]
    const aviso = total > 0
      ? `Excluir a pasta “${nome}”? Os ${total} item(ns) sobem para a pasta acima — nada é apagado.`
      : `Excluir a pasta “${nome}”?`
    if (!window.confirm(aviso)) return
    moverConteudo(alvo, [], true)
  }

  /** Uma unica travessia: as tres origens guardam a pasta do mesmo jeito. */
  function moverConteudo(antigo: string[], destino: string[], excluindo: boolean) {
    const novoFolder = (segmentos: string[]) => excluindo
      ? folderAposExcluir(segmentos, antigo)
      : folderAposRenomear(segmentos, antigo, destino)

    const base = paginaGravavel()
    const atuais = base.contentFolders ?? []
    contentRepository.savePage({
      ...base,
      contentFolders: excluindo
        ? atuais.filter((item) => folderAposExcluir(item.split('/'), antigo) === undefined)
        : atuais.map((item) => folderAposRenomear(item.split('/'), antigo, destino) ?? item),
      files: (base.files ?? []).map((arquivo) => {
        const folder = novoFolder(segmentosComPastaManual(arquivo.folder, ['Arquivos']))
        return folder === undefined ? arquivo : { ...arquivo, folder: folder || undefined }
      }),
      updatedAt: new Date().toISOString(),
    })

    paginas
      .filter((item) => item.parentSlug === slug)
      .forEach((filha) => {
        const folder = novoFolder(segmentosComPastaManual(filha.folder, ['Páginas']))
        if (folder !== undefined) contentRepository.savePage({ ...filha, folder: folder || undefined })
      })

    if (areaDeNoticias) {
      const site = lerSite()
      saveSiteContent({
        ...site,
        news: site.news.map((item) => {
          const folder = novoFolder(segmentosComPastaManual(item.folder, ['Notícias']))
          return folder === undefined ? item : { ...item, folder: folder || undefined }
        }),
      })
    }
  }

  const pastasFixas: string[][] = [
    ...(areaDeNoticias ? [['Notícias']] : []),
    ...(gerenciavel ? [['Páginas'], ['Arquivos']] : []),
    ...pastasCriadas,
  ]

  /** A mesma tabela serve à lista e ao conteúdo de uma pasta. */
  function tabelaDeConteudo(itens: Linha[]) {
    return (
    <div className="portal-table-wrap">
      <table className="portal-table cms-conteudo-tabela">
        <thead>
          <tr>
            <th className="cms-conteudo-selecao">
              <input
                type="checkbox"
                aria-label="Selecionar todos"
                checked={itens.length > 0 && selecionados.length === itens.length}
                onChange={(evento) => setSelecionados(evento.target.checked ? itens.map((linha) => linha.id) : [])}
              />
            </th>
            <th>Título</th>
            <th>Tamanho</th>
            <th>Modificado</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {itens.map((linha) => (
            <tr key={linha.id}>
              <td className="cms-conteudo-selecao">
                <input
                  type="checkbox"
                  aria-label={`Selecionar ${linha.titulo}`}
                  checked={selecionados.includes(linha.id)}
                  onChange={() => alternar(linha.id)}
                />
              </td>
              <td>
                {linha.tipo === 'pagina' ? (
                  <button className="cms-conteudo-link" type="button" onClick={() => onNavegar(linha.destino)}>
                    <Folder aria-hidden="true" /> {linha.titulo}
                  </button>
                ) : (
                  <a className="cms-conteudo-link" href={linha.url} target="_blank" rel="noreferrer">
                    <FileText aria-hidden="true" /> {linha.titulo}
                  </a>
                )}
              </td>
              <td>{tamanhoLegivel(linha.tamanho)}</td>
              <td>{dataLegivel(linha.modificado)}</td>
              <td>{linha.estado}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    )
  }

  return (
    <section className="cms-conteudo" aria-label="Conteúdo desta página">
      <header className="cms-conteudo-head">
        <div>
          <h2>Conteúdo desta página</h2>
          <p>
            {areaDeNoticias
              ? 'Notícias publicadas no portal. Clique em um título para abri-la no quadro acima e editá-la.'
              : gerenciavel
                ? <>Páginas filhas e documentos que vivem abaixo de <code>{caminho}</code>. Clique em um título para abri-lo no quadro acima.</>
                : <>Esta área do portal ainda não é gerenciada por conteúdo, então não há filhas nem documentos sob <code>{caminho}</code>.</>}
          </p>
        </div>
        <div className="cms-conteudo-acoes-topo">
          {mae && (
            <button className="secondary-button" type="button" onClick={() => onNavegar(caminhoDoSlug(mae))}>
              <ArrowUp aria-hidden="true" /> Ir um nível acima
            </button>
          )}
          {areaDeNoticias && (
            <button className="secondary-button" type="button" onClick={onNovaNoticia}>
              <FilePlus2 aria-hidden="true" /> Nova notícia
            </button>
          )}
          {/* Criar página não depende da rota aberta: a mãe é escolhida no diálogo. */}
          <button className="secondary-button" type="button" onClick={() => setCriando(raizDaFamilia)}>
            <FilePlus2 aria-hidden="true" /> Nova página
          </button>
          {/* Sempre disponível: onde a rota aberta não guarda páginas — notícias, por
              exemplo — o diálogo abre na raiz da seção para a mãe ser escolhida. */}
          <button className="secondary-button" type="button" onClick={() => setCriando(slug ?? raizDaFamilia)}>
            <FolderPlus aria-hidden="true" /> Adicionar página filha
          </button>
          {gerenciavel && (
            <>
              <button className="secondary-button" type="button" onClick={() => entrada.current?.click()}>
                <FileUp aria-hidden="true" /> Adicionar arquivos
              </button>
              <input ref={entrada} hidden multiple type="file" onChange={enviar} />
            </>
          )}
        </div>
      </header>

      {linhas.length > 0 && (
        <label className="cms-conteudo-busca">
          <span className="sr-only">Buscar nesta lista</span>
          <Search aria-hidden="true" />
          <input
            type="search"
            value={busca}
            onChange={(evento) => setBusca(evento.target.value)}
            placeholder="Buscar pelo nome nesta lista"
          />
          {termo && <span className="cms-conteudo-contagem">{visiveis.length} de {linhas.length}</span>}
        </label>
      )}

      {visiveis.length === 0 ? (
        <p className="cms-conteudo-vazio">
          {termo
            ? `Nenhum item com “${busca.trim()}” nesta lista.`
            : gerenciavel
              ? 'Nada abaixo desta página ainda. Use “Nova página filha” para criar uma subpágina ou “Adicionar arquivos” para anexar documentos.'
              : 'Nada a listar aqui. A edição de conteúdo está disponível em Plan-Assiste, Transparência, Dúvidas frequentes e Notícias.'}
        </p>
      ) : (
        <>
          <div className="cms-acervo-filtros">
            <AlternadorDeVisao visao={visao} onChange={(proxima) => { setVisao(proxima); setPasta([]) }} />
          </div>

          {visao === 'pastas'
            ? <VisaoEmPastas
                acoes={<>
                  {gerenciavel && <NovaPastaBotao onCriar={criarPastaDeConteudo} />}
                  {/* Cada pasta é um tipo de conteúdo, então a ação segue a pasta aberta. */}
                  {(pasta[0] === undefined || pasta[0] === 'Notícias') && areaDeNoticias && (
                    <button className="secondary-button" type="button" onClick={onNovaNoticia}>
                      <FilePlus2 aria-hidden="true" /> Nova notícia
                    </button>
                  )}
                  {(pasta[0] === undefined || pasta[0] === 'Páginas') && (
                    <button className="secondary-button" type="button" onClick={() => setCriando(slug ?? raizDaFamilia)}>
                      <FolderPlus aria-hidden="true" /> Nova página filha
                    </button>
                  )}
                  {(pasta[0] === undefined || pasta[0] === 'Arquivos') && gerenciavel && (
                    <button className="secondary-button" type="button" onClick={() => entrada.current?.click()}>
                      <FileUp aria-hidden="true" /> Adicionar arquivos
                    </button>
                  )}
                </>}
                onRenomearPasta={renomearPastaDeConteudo}
                onExcluirPasta={excluirPastaDeConteudo}
                pastasVazias={pastasFixas}
                entradas={entradasDeConteudo}
                caminho={pasta}
                onNavegar={setPasta}
                rotuloRaiz="Conteúdo"
                vazio="Nada nesta pasta."
                renderItens={tabelaDeConteudo}
              />
            : tabelaDeConteudo(visiveis)}

          <div className="cms-conteudo-acoes">
            <button type="button" disabled={selecionados.length === 0} onClick={renomear}>Renomear</button>
            <button type="button" disabled={selecionados.length === 0} onClick={alterarEstado}>Alterar estado</button>
            <button type="button" disabled={selecionados.length === 0} onClick={excluir}>Excluir</button>
          </div>
        </>
      )}

      {criando !== undefined && (
        <CmsNovaPaginaDialogo
          maes={maes}
          maeInicial={criando}
          slugsExistentes={paginas.map((item) => item.slug)}
          onCancelar={() => setCriando(undefined)}
          onCriar={criarPagina}
        />
      )}
    </section>
  )
}
