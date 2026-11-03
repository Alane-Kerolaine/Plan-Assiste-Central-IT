/**
 * Relatório tabular em PDF (A4 paisagem), no mesmo espírito de documentoPdf:
 * sem dependência externa. Acrescenta o logo do Plan-Assiste como imagem JPEG
 * (DCTDecode), que o PDF aceita sem recodificação.
 */
import { larguraTexto, paraWinAnsi, quebra, type ItemDocumento } from './documentoPdf'

/** JPEG em string binária (um caractere por byte), como devolvido por atob. */
export type LogoPdf = { dados: string, largura: number, altura: number }
export type ColunaRelatorio = { titulo: string, peso: number }

export type RelatorioPdf = {
  logo?: LogoPdf
  titulo: string
  subtitulo?: string
  emitidoEm: string
  informacoes: ItemDocumento[]
  colunas: ColunaRelatorio[]
  linhas: string[][]
  rodape: string
}

type Cor = [number, number, number]

const LARGURA = 841.89
const ALTURA = 595.28
const MARGEM = 36
const LARGURA_UTIL = LARGURA - MARGEM * 2
const ALTURA_RODAPE = 30
const COLUNAS_INFORMACOES = 4
const TAMANHO_CELULA = 8
const ENTRELINHA_CELULA = 10
const PADDING_CELULA = 5

const PRETO: Cor = [0.11, 0.2, 0.19]
const CINZA: Cor = [0.42, 0.45, 0.44]
const MARCA: Cor = [0.05, 0.52, 0.45]
const BRANCO: Cor = [1, 1, 1]
const ZEBRA: Cor = [0.95, 0.98, 0.97]
const BORDA: Cor = [0.84, 0.91, 0.89]

type Comando =
  | { tipo: 'texto', x: number, y: number, texto: string, tamanho: number, negrito: boolean, cor: Cor }
  | { tipo: 'linha', x1: number, y1: number, x2: number, y2: number, cor: Cor }
  | { tipo: 'retangulo', x: number, y: number, largura: number, altura: number, cor: Cor }
  | { tipo: 'imagem', x: number, y: number, largura: number, altura: number }

const logosCarregados = new Map<string, Promise<LogoPdf | undefined>>()

/**
 * Rasteriza o logo (SVG) em JPEG com fundo branco, pronto para embutir no PDF.
 * Fica em cache: a janela de compartilhar exige que o clique seja recente, então
 * gerar o PDF precisa ser rápido.
 */
export function carregarLogoPdf(src: string): Promise<LogoPdf | undefined> {
  const emCache = logosCarregados.get(src)
  if (emCache) return emCache
  const carregamento = rasterizarLogo(src)
  logosCarregados.set(src, carregamento)
  return carregamento
}

async function rasterizarLogo(src: string, larguraPx = 960): Promise<LogoPdf | undefined> {
  try {
    const imagem = new Image()
    imagem.decoding = 'async'
    imagem.src = src
    await imagem.decode()
    const proporcao = imagem.naturalHeight && imagem.naturalWidth ? imagem.naturalHeight / imagem.naturalWidth : 90.07 / 319.96
    const canvas = document.createElement('canvas')
    canvas.width = larguraPx
    canvas.height = Math.round(larguraPx * proporcao)
    const contexto = canvas.getContext('2d')
    if (!contexto) return undefined
    contexto.fillStyle = '#ffffff'
    contexto.fillRect(0, 0, canvas.width, canvas.height)
    contexto.drawImage(imagem, 0, 0, canvas.width, canvas.height)
    const base64 = canvas.toDataURL('image/jpeg', 0.92).split(',')[1] ?? ''
    return { dados: atob(base64), largura: canvas.width, altura: canvas.height }
  } catch {
    // Sem o logo o relatório continua válido; o título identifica o documento.
    return undefined
  }
}

function texto(x: number, y: number, conteudo: string, tamanho: number, negrito = false, cor: Cor = PRETO): Comando {
  return { tipo: 'texto', x, y, texto: conteudo, tamanho, negrito, cor }
}

export function montarRelatorioPdf(relatorio: RelatorioPdf): Blob {
  const paginas: Comando[][] = []
  let comandos: Comando[] = []
  let y = ALTURA - MARGEM

  const pesoTotal = relatorio.colunas.reduce((total, coluna) => total + coluna.peso, 0)
  const largurasColunas = relatorio.colunas.map((coluna) => (coluna.peso / pesoTotal) * LARGURA_UTIL)
  const inicioColunas = largurasColunas.map((_, indice) => MARGEM + largurasColunas.slice(0, indice).reduce((a, b) => a + b, 0))

  const desenharLogo = (altura: number) => {
    if (!relatorio.logo) {
      comandos.push(texto(MARGEM, y - altura * 0.7, 'Plan-Assiste', altura * 0.6, true, MARCA))
      return
    }
    const largura = altura * (relatorio.logo.largura / relatorio.logo.altura)
    comandos.push({ tipo: 'imagem', x: MARGEM, y: y - altura, largura, altura })
  }

  const alinhadoDireita = (conteudo: string, yTexto: number, tamanho: number, negrito = false, cor: Cor = CINZA) => {
    comandos.push(texto(LARGURA - MARGEM - larguraTexto(conteudo, tamanho, negrito), yTexto, conteudo, tamanho, negrito, cor))
  }

  const cabecalhoTabela = () => {
    const blocos = relatorio.colunas.map((coluna, indice) => quebra(coluna.titulo, largurasColunas[indice] - PADDING_CELULA * 2, TAMANHO_CELULA))
    const altura = Math.max(...blocos.map((bloco) => bloco.length)) * ENTRELINHA_CELULA + PADDING_CELULA * 2
    comandos.push({ tipo: 'retangulo', x: MARGEM, y: y - altura, largura: LARGURA_UTIL, altura, cor: MARCA })
    blocos.forEach((bloco, coluna) => bloco.forEach((linha, posicao) => {
      comandos.push(texto(inicioColunas[coluna] + PADDING_CELULA, y - PADDING_CELULA - TAMANHO_CELULA - posicao * ENTRELINHA_CELULA + 1, linha, TAMANHO_CELULA, true, BRANCO))
    }))
    y -= altura
  }

  const novaPagina = () => {
    paginas.push(comandos)
    comandos = []
    y = ALTURA - MARGEM
    // Páginas seguintes repetem uma versão compacta do cabeçalho.
    desenharLogo(22)
    alinhadoDireita(relatorio.titulo, y - 14, 10, true, PRETO)
    y -= 34
    cabecalhoTabela()
  }

  // Cabeçalho completo da primeira página.
  desenharLogo(38)
  alinhadoDireita(`Emitido em ${relatorio.emitidoEm}`, y - 10, 8)
  y -= 62
  comandos.push(texto(MARGEM, y, relatorio.titulo, 16, true, MARCA))
  y -= 14
  if (relatorio.subtitulo) {
    comandos.push(texto(MARGEM, y, relatorio.subtitulo, 9, false, CINZA))
    y -= 12
  }
  y -= 4
  comandos.push({ tipo: 'linha', x1: MARGEM, y1: y, x2: LARGURA - MARGEM, y2: y, cor: BORDA })
  y -= 16

  const larguraInformacao = LARGURA_UTIL / COLUNAS_INFORMACOES
  for (let indice = 0; indice < relatorio.informacoes.length; indice += COLUNAS_INFORMACOES) {
    const grupo = relatorio.informacoes.slice(indice, indice + COLUNAS_INFORMACOES)
    const blocos = grupo.map((item) => quebra(item.valor || '-', larguraInformacao - 12, 9.5))
    grupo.forEach((item, coluna) => {
      const x = MARGEM + coluna * larguraInformacao
      comandos.push(texto(x, y, item.rotulo, 7.5, false, CINZA))
      blocos[coluna].forEach((linha, posicao) => comandos.push(texto(x, y - 12 - posicao * 11, linha, 9.5, true)))
    })
    y -= 12 + Math.max(...blocos.map((bloco) => bloco.length)) * 11 + 8
  }
  y -= 8
  cabecalhoTabela()

  if (relatorio.linhas.length === 0) {
    y -= 22
    comandos.push(texto(MARGEM + PADDING_CELULA, y, 'Nenhum registro encontrado para os filtros informados.', 9, false, CINZA))
  }

  relatorio.linhas.forEach((linha, indiceLinha) => {
    const blocos = linha.map((celula, coluna) => quebra(celula || '-', largurasColunas[coluna] - PADDING_CELULA * 2, TAMANHO_CELULA))
    const altura = Math.max(...blocos.map((bloco) => bloco.length)) * ENTRELINHA_CELULA + PADDING_CELULA * 2
    if (y - altura < MARGEM + ALTURA_RODAPE) novaPagina()
    if (indiceLinha % 2 === 1) comandos.push({ tipo: 'retangulo', x: MARGEM, y: y - altura, largura: LARGURA_UTIL, altura, cor: ZEBRA })
    blocos.forEach((bloco, coluna) => bloco.forEach((conteudo, posicao) => {
      comandos.push(texto(inicioColunas[coluna] + PADDING_CELULA, y - PADDING_CELULA - TAMANHO_CELULA - posicao * ENTRELINHA_CELULA + 1, conteudo, TAMANHO_CELULA))
    }))
    y -= altura
    comandos.push({ tipo: 'linha', x1: MARGEM, y1: y, x2: LARGURA - MARGEM, y2: y, cor: BORDA })
  })
  paginas.push(comandos)

  // Rodapé com a numeração, conhecida só depois da paginação.
  const paginasComRodape = paginas.map((pagina, indice) => {
    const rotulo = `Página ${indice + 1} de ${paginas.length}`
    return [
      ...pagina,
      { tipo: 'linha', x1: MARGEM, y1: MARGEM + 12, x2: LARGURA - MARGEM, y2: MARGEM + 12, cor: BORDA },
      texto(MARGEM, MARGEM, relatorio.rodape, 7.5, false, CINZA),
      texto(LARGURA - MARGEM - larguraTexto(rotulo, 7.5), MARGEM, rotulo, 7.5, false, CINZA),
    ] satisfies Comando[]
  })

  return montarArquivo(paginasComRodape, relatorio.logo)
}

function cor(valor: Cor): string {
  return valor.map((canal) => canal.toFixed(3)).join(' ')
}

function fluxo(comandos: Comando[]): string {
  return comandos.map((comando) => {
    switch (comando.tipo) {
      case 'linha':
        return `0.6 w ${cor(comando.cor)} RG ${comando.x1.toFixed(2)} ${comando.y1.toFixed(2)} m ${comando.x2.toFixed(2)} ${comando.y2.toFixed(2)} l S`
      case 'retangulo':
        return `${cor(comando.cor)} rg ${comando.x.toFixed(2)} ${comando.y.toFixed(2)} ${comando.largura.toFixed(2)} ${comando.altura.toFixed(2)} re f`
      case 'imagem':
        return `q ${comando.largura.toFixed(2)} 0 0 ${comando.altura.toFixed(2)} ${comando.x.toFixed(2)} ${comando.y.toFixed(2)} cm /Im1 Do Q`
      default: {
        const fonte = comando.negrito ? 'F2' : 'F1'
        return `BT ${cor(comando.cor)} rg /${fonte} ${comando.tamanho} Tf 1 0 0 1 ${comando.x.toFixed(2)} ${comando.y.toFixed(2)} Tm (${paraWinAnsi(comando.texto)}) Tj ET`
      }
    }
  }).join('\n')
}

function montarArquivo(paginas: Comando[][], logo?: LogoPdf): Blob {
  const objetos: string[] = []
  const idPaginas = 2
  const idFonte1 = 3
  const idFonte2 = 4
  const idImagem = 5
  const primeiroConteudo = logo ? 6 : 5
  const idsPagina = paginas.map((_, indice) => primeiroConteudo + paginas.length + indice)
  const recursoImagem = logo ? ` /XObject << /Im1 ${idImagem} 0 R >>` : ''

  objetos[1] = `<< /Type /Catalog /Pages ${idPaginas} 0 R >>`
  objetos[idPaginas] = `<< /Type /Pages /Kids [${idsPagina.map((id) => `${id} 0 R`).join(' ')}] /Count ${paginas.length} >>`
  objetos[idFonte1] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>'
  objetos[idFonte2] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>'
  if (logo) {
    objetos[idImagem] = `<< /Type /XObject /Subtype /Image /Width ${logo.largura} /Height ${logo.altura} /ColorSpace /DeviceRGB `
      + `/BitsPerComponent 8 /Filter /DCTDecode /Length ${logo.dados.length} >>\nstream\n${logo.dados}\nendstream`
  }

  paginas.forEach((comandos, indice) => {
    const conteudo = fluxo(comandos)
    objetos[primeiroConteudo + indice] = `<< /Length ${conteudo.length} >>\nstream\n${conteudo}\nendstream`
    objetos[idsPagina[indice]] = `<< /Type /Page /Parent ${idPaginas} 0 R /MediaBox [0 0 ${LARGURA} ${ALTURA}] `
      + `/Resources << /Font << /F1 ${idFonte1} 0 R /F2 ${idFonte2} 0 R >>${recursoImagem} >> /Contents ${primeiroConteudo + indice} 0 R >>`
  })

  let arquivo = '%PDF-1.4\n'
  const deslocamentos: number[] = []
  for (let id = 1; id < objetos.length; id += 1) {
    deslocamentos[id] = arquivo.length
    arquivo += `${id} 0 obj\n${objetos[id]}\nendobj\n`
  }

  const inicioXref = arquivo.length
  const total = objetos.length
  arquivo += `xref\n0 ${total}\n0000000000 65535 f \n`
  for (let id = 1; id < total; id += 1) {
    arquivo += `${String(deslocamentos[id]).padStart(10, '0')} 00000 n \n`
  }
  arquivo += `trailer\n<< /Size ${total} /Root 1 0 R >>\nstartxref\n${inicioXref}\n%%EOF`

  const bytes = new Uint8Array(arquivo.length)
  for (let i = 0; i < arquivo.length; i += 1) bytes[i] = arquivo.charCodeAt(i) & 0xff
  return new Blob([bytes], { type: 'application/pdf' })
}

/** Imprime o PDF por um iframe oculto; se o navegador bloquear, abre em nova aba. */
export function imprimirPdf(arquivo: Blob) {
  const url = URL.createObjectURL(arquivo)
  const quadro = document.createElement('iframe')
  quadro.style.position = 'fixed'
  quadro.style.right = '0'
  quadro.style.bottom = '0'
  quadro.style.width = '0'
  quadro.style.height = '0'
  quadro.style.border = '0'
  quadro.src = url
  quadro.onload = () => {
    try {
      quadro.contentWindow?.focus()
      quadro.contentWindow?.print()
    } catch {
      window.open(url, '_blank')
    }
    // O diálogo de impressão é assíncrono em alguns navegadores: libera depois.
    window.setTimeout(() => { quadro.remove(); URL.revokeObjectURL(url) }, 60_000)
  }
  document.body.appendChild(quadro)
}

export type ResultadoEnvioPorEmail = 'compartilhado' | 'cancelado' | 'aplicativo-padrao'

/**
 * Abre a janela "Compartilhar" do sistema (no Windows, lista Outlook, Email e
 * outros apps) com o PDF já anexado. Onde a Web Share API não aceita arquivos,
 * baixa o PDF e abre o aplicativo de e-mail padrão via mailto, que não permite
 * anexos: a mensagem orienta o usuário a anexar o arquivo baixado.
 */
export async function enviarPdfPorEmail(arquivo: File, assunto: string, mensagem: string): Promise<ResultadoEnvioPorEmail> {
  const dados: ShareData = { files: [arquivo], title: assunto, text: mensagem }
  if (typeof navigator.canShare === 'function' && navigator.canShare(dados)) {
    try {
      await navigator.share(dados)
      return 'compartilhado'
    } catch (erro) {
      if (erro instanceof DOMException && erro.name === 'AbortError') return 'cancelado'
      // Outras falhas (ex.: permissão negada) seguem para o aplicativo padrão.
    }
  }
  baixarArquivo(arquivo, arquivo.name)
  const corpo = `${mensagem}\n\nAnexe a esta mensagem o arquivo "${arquivo.name}", baixado na pasta de downloads.`
  window.location.href = `mailto:?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`
  return 'aplicativo-padrao'
}

export function baixarArquivo(arquivo: Blob, nome: string) {
  const url = URL.createObjectURL(arquivo)
  const ancora = document.createElement('a')
  ancora.href = url
  ancora.download = nome
  ancora.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000)
}
