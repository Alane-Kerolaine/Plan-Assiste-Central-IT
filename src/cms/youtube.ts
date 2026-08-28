/**
 * Leitura de endereços do YouTube. Quem edita cola o endereço que estiver na
 * barra do navegador — que pode vir como watch, youtu.be, embed ou shorts, com
 * ou sem parâmetros — e o portal precisa do endereço de incorporação.
 */

const ID_VALIDO = /^[\w-]{11}$/

/** Extrai o identificador do vídeo, ou undefined se o endereço não for do YouTube. */
export function idDoYoutube(valor: string): string | undefined {
  const texto = valor.trim()
  if (!texto) return undefined
  // Quem cola só o identificador também é atendido.
  if (ID_VALIDO.test(texto)) return texto

  let url: URL
  try {
    url = new URL(texto.startsWith('http') ? texto : `https://${texto}`)
  } catch {
    return undefined
  }

  const host = url.hostname.replace(/^www\./, '')
  if (host === 'youtu.be') {
    const id = url.pathname.slice(1)
    return ID_VALIDO.test(id) ? id : undefined
  }
  if (host !== 'youtube.com' && host !== 'm.youtube.com' && host !== 'youtube-nocookie.com') return undefined

  const parametro = url.searchParams.get('v')
  if (parametro && ID_VALIDO.test(parametro)) return parametro

  const partes = url.pathname.split('/').filter(Boolean)
  // /embed/<id>, /shorts/<id>, /live/<id> e /v/<id>.
  if (partes.length >= 2 && ['embed', 'shorts', 'live', 'v'].includes(partes[0]) && ID_VALIDO.test(partes[1])) {
    return partes[1]
  }
  return undefined
}

/** Endereço para o iframe, ou undefined quando o endereço colado não serve. */
export function incorporacaoDoYoutube(valor: string): string | undefined {
  const id = idDoYoutube(valor)
  // O domínio sem cookies evita rastreamento de quem só visita a página.
  return id ? `https://www.youtube-nocookie.com/embed/${id}` : undefined
}

/** Miniatura do vídeo, útil para conferir na edição se o endereço é o certo. */
export function miniaturaDoYoutube(valor: string): string | undefined {
  const id = idDoYoutube(valor)
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : undefined
}
