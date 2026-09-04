/**
 * Limpeza do HTML que a equipe escreve no editor antes de ele ir para a página.
 * Trabalha sobre a árvore do documento, e não sobre o texto: expressões regulares
 * sobre HTML deixam passar variações de escrita que o navegador ainda executa.
 */

/** Endereços que podem virar um quadro incorporado na página. */
const INCORPORACAO_PERMITIDA = /^https:\/\/(www\.)?youtube-nocookie\.com\/embed\//

const TAGS_PROIBIDAS = new Set(['SCRIPT', 'STYLE', 'OBJECT', 'EMBED', 'LINK', 'META', 'BASE', 'FORM'])
const PROTOCOLOS_DE_LINK = /^(https?:|mailto:|tel:|\/|#)/i

/**
 * Imagem embutida no próprio HTML. A equipe envia arquivos pelo editor e eles
 * ficam guardados como data URL, então barrar esse formato apagaria toda imagem
 * enviada. Vale só para <img>: em iframe ou link, data: executa conteúdo.
 */
const IMAGEM_EMBUTIDA = /^data:image\/(png|jpeg|jpg|gif|webp|avif|svg\+xml);base64,/i

function limpar(no: Element) {
  for (const filho of Array.from(no.children)) {
    if (TAGS_PROIBIDAS.has(filho.tagName)) {
      filho.remove()
      continue
    }
    // Só o vídeo incorporado pode ser um iframe; qualquer outro sai.
    if (filho.tagName === 'IFRAME' && !INCORPORACAO_PERMITIDA.test(filho.getAttribute('src') ?? '')) {
      filho.remove()
      continue
    }
    for (const atributo of Array.from(filho.attributes)) {
      const nome = atributo.name.toLowerCase()
      // Manipuladores de evento (onclick, onerror…) nunca vêm do editor.
      if (nome.startsWith('on')) filho.removeAttribute(atributo.name)
      // A imagem embutida é aceita só aqui, e só como imagem.
      else if (nome === 'src' && filho.tagName === 'IMG') {
        const valor = atributo.value.trim()
        if (!PROTOCOLOS_DE_LINK.test(valor) && !IMAGEM_EMBUTIDA.test(valor)) filho.removeAttribute(atributo.name)
      }
      // javascript: e data: em href/src executam código ao serem abertos.
      else if ((nome === 'href' || nome === 'src') && !PROTOCOLOS_DE_LINK.test(atributo.value.trim())) {
        filho.removeAttribute(atributo.name)
      }
    }
    limpar(filho)
  }
}

/** Devolve o HTML limpo, pronto para dangerouslySetInnerHTML. */
export function htmlSeguro(html: string): { __html: string } {
  const recipiente = document.createElement('div')
  recipiente.innerHTML = html
  limpar(recipiente)
  return { __html: recipiente.innerHTML }
}
