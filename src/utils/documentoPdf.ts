/**
 * Gerador de PDF sem dependência externa.
 *
 * O PDF é um formato textual: basta montar os objetos, o fluxo de conteúdo e a
 * tabela de referências cruzadas com os deslocamentos corretos em bytes. Como o
 * texto é escrito em WinAnsi (Latin-1, um byte por caractere), o comprimento da
 * string em JS coincide com o número de bytes, o que mantém o cálculo simples.
 */

export type ItemDocumento = { rotulo: string, valor: string }
export type SecaoDocumento = { titulo: string, itens: ItemDocumento[] }

export type DocumentoPdf = {
  /** Linhas do cabeçalho institucional, centralizadas no topo. */
  cabecalho: string[]
  /** Título do formulário. */
  titulo: string
  secoes: SecaoDocumento[]
  /** Ausente deixa a linha de assinatura em branco; presente gera a via assinada. */
  assinatura?: { nome: string, detalhe: string }
  rodapeAssinatura: string
}

const LARGURA = 595.28
const ALTURA = 841.89
const MARGEM = 56
const LARGURA_UTIL = LARGURA - MARGEM * 2
const COLUNAS = 2
const GAP_COLUNA = 18
const LARGURA_COLUNA = (LARGURA_UTIL - GAP_COLUNA * (COLUNAS - 1)) / COLUNAS

// Larguras da Helvetica (milésimos de em) para ASCII 32..126. Caracteres acentuados
// reaproveitam a largura da letra base, diferença irrelevante nesta composição.
const LARGURAS = [
  278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278,
  556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 278, 278, 584, 584, 584, 556,
  1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778,
  667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278, 278, 278, 469, 556,
  333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556,
  556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584,
]
const LARGURAS_BOLD = [
  278, 333, 474, 556, 556, 889, 722, 238, 333, 333, 389, 584, 278, 333, 278, 278,
  556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 333, 333, 584, 584, 584, 611,
  975, 722, 722, 722, 722, 667, 611, 778, 722, 278, 556, 722, 611, 833, 722, 778,
  667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 333, 278, 333, 584, 556,
  333, 556, 611, 556, 611, 556, 333, 611, 611, 278, 278, 556, 278, 889, 611, 611,
  611, 611, 389, 556, 333, 611, 556, 778, 556, 556, 500, 389, 280, 389, 584,
]

function semAcento(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '')
}

function larguraTexto(texto: string, tamanho: number, negrito = false): number {
  const tabela = negrito ? LARGURAS_BOLD : LARGURAS
  let total = 0
  for (const char of semAcento(texto)) {
    const codigo = char.charCodeAt(0)
    total += (codigo >= 32 && codigo <= 126 ? tabela[codigo - 32] : 556) / 1000
  }
  return total * tamanho
}

function quebra(texto: string, largura: number, tamanho: number): string[] {
  const palavras = texto.split(/\s+/).filter(Boolean)
  if (palavras.length === 0) return ['']
  const linhas: string[] = []
  let atual = ''
  for (const palavra of palavras) {
    const tentativa = atual ? `${atual} ${palavra}` : palavra
    if (larguraTexto(tentativa, tamanho) <= largura || !atual) atual = tentativa
    else { linhas.push(atual); atual = palavra }
  }
  if (atual) linhas.push(atual)
  return linhas
}

/** Latin-1 mantém a acentuação e garante um byte por caractere. */
function paraWinAnsi(texto: string): string {
  let saida = ''
  for (const char of texto) {
    const codigo = char.charCodeAt(0)
    saida += codigo <= 255 ? char : (semAcento(char).charAt(0) || '?')
  }
  return saida.replace(/[\\()]/g, (encontrado) => `\\${encontrado}`)
}

type Comando =
  | { tipo: 'texto', x: number, y: number, texto: string, tamanho: number, negrito: boolean, cinza?: boolean }
  | { tipo: 'linha', x1: number, y1: number, x2: number, y2: number }

export function montarPdf(documento: DocumentoPdf): Blob {
  const paginas: Comando[][] = []
  let comandos: Comando[] = []
  let y = ALTURA - MARGEM

  const novaPagina = () => {
    paginas.push(comandos)
    comandos = []
    y = ALTURA - MARGEM
  }
  const garantirEspaco = (altura: number) => {
    if (y - altura < MARGEM + 40) novaPagina()
  }
  const centralizado = (texto: string, tamanho: number, negrito: boolean) => {
    const x = MARGEM + (LARGURA_UTIL - larguraTexto(texto, tamanho, negrito)) / 2
    comandos.push({ tipo: 'texto', x, y, texto, tamanho, negrito })
    y -= tamanho + 5
  }

  for (const linha of documento.cabecalho) centralizado(linha, 11, true)
  y -= 10
  centralizado(documento.titulo, 14, true)
  y -= 14

  for (const secao of documento.secoes) {
    if (secao.itens.length === 0) continue
    garantirEspaco(70)
    comandos.push({ tipo: 'texto', x: MARGEM, y, texto: secao.titulo, tamanho: 11, negrito: true })
    y -= 6
    comandos.push({ tipo: 'linha', x1: MARGEM, y1: y, x2: LARGURA - MARGEM, y2: y })
    y -= 16

    // Duas colunas: percorre em pares e avança pelo bloco mais alto da linha.
    for (let indice = 0; indice < secao.itens.length; indice += COLUNAS) {
      const par = secao.itens.slice(indice, indice + COLUNAS)
      const blocos = par.map((item) => quebra(item.valor || '-', LARGURA_COLUNA, 10))
      const alturaLinha = 12 + Math.max(...blocos.map((bloco) => bloco.length)) * 12 + 8
      garantirEspaco(alturaLinha)
      par.forEach((item, coluna) => {
        const x = MARGEM + coluna * (LARGURA_COLUNA + GAP_COLUNA)
        comandos.push({ tipo: 'texto', x, y, texto: item.rotulo, tamanho: 8, negrito: false, cinza: true })
        blocos[coluna].forEach((linha, posicao) => {
          comandos.push({ tipo: 'texto', x, y: y - 12 - posicao * 12, texto: linha, tamanho: 10, negrito: false })
        })
      })
      y -= alturaLinha
    }
    y -= 8
  }

  // Bloco de assinatura, sempre encerrando o documento.
  garantirEspaco(96)
  y -= 44
  const larguraAssinatura = 300
  const xAssinatura = MARGEM + (LARGURA_UTIL - larguraAssinatura) / 2
  if (documento.assinatura) {
    const nome = documento.assinatura.nome
    comandos.push({
      tipo: 'texto',
      x: MARGEM + (LARGURA_UTIL - larguraTexto(nome, 12, false)) / 2,
      y: y + 7,
      texto: nome,
      tamanho: 12,
      negrito: false,
    })
  }
  comandos.push({ tipo: 'linha', x1: xAssinatura, y1: y, x2: xAssinatura + larguraAssinatura, y2: y })
  y -= 13
  centralizado('Assinatura do Requerente', 10, false)
  if (documento.assinatura) centralizado(documento.assinatura.detalhe, 8, false)
  centralizado(documento.rodapeAssinatura, 8, false)
  paginas.push(comandos)

  return montarArquivo(paginas)
}

function fluxo(comandos: Comando[]): string {
  const partes: string[] = []
  for (const comando of comandos) {
    if (comando.tipo === 'linha') {
      partes.push(`0.35 w 0 G ${comando.x1.toFixed(2)} ${comando.y1.toFixed(2)} m ${comando.x2.toFixed(2)} ${comando.y2.toFixed(2)} l S`)
      continue
    }
    const cor = comando.cinza ? '0.42 0.42 0.42 rg' : '0 g'
    const fonte = comando.negrito ? 'F2' : 'F1'
    partes.push(`BT ${cor} /${fonte} ${comando.tamanho} Tf 1 0 0 1 ${comando.x.toFixed(2)} ${comando.y.toFixed(2)} Tm (${paraWinAnsi(comando.texto)}) Tj ET`)
  }
  return partes.join('\n')
}

function montarArquivo(paginas: Comando[][]): Blob {
  const objetos: string[] = []
  const idPaginas = 2
  const idFonte1 = 3
  const idFonte2 = 4
  const primeiroConteudo = 5
  const idsPagina = paginas.map((_, indice) => primeiroConteudo + paginas.length + indice)

  objetos[1] = `<< /Type /Catalog /Pages ${idPaginas} 0 R >>`
  objetos[idPaginas] = `<< /Type /Pages /Kids [${idsPagina.map((id) => `${id} 0 R`).join(' ')}] /Count ${paginas.length} >>`
  objetos[idFonte1] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>'
  objetos[idFonte2] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>'

  paginas.forEach((comandos, indice) => {
    const conteudo = fluxo(comandos)
    objetos[primeiroConteudo + indice] = `<< /Length ${conteudo.length} >>\nstream\n${conteudo}\nendstream`
    objetos[idsPagina[indice]] = `<< /Type /Page /Parent ${idPaginas} 0 R /MediaBox [0 0 ${LARGURA} ${ALTURA}] `
      + `/Resources << /Font << /F1 ${idFonte1} 0 R /F2 ${idFonte2} 0 R >> >> /Contents ${primeiroConteudo + indice} 0 R >>`
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
