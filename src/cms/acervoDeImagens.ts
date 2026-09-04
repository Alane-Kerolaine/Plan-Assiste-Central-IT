import { getSiteContent, saveSiteContent, type CmsMediaAsset } from './siteContentRepository'

/** Imagens do acervo. O tipo vem ora como MIME, ora como extensao solta. */
export function imagensDoAcervo(): CmsMediaAsset[] {
  return getSiteContent().media.filter((item) => (
    item.type.startsWith('image/')
    || /^(png|jpe?g|webp|gif|svg)$/i.test(item.type)
    || /\.(png|jpe?g|webp|gif|svg)$/i.test(item.name)
  ))
}

/** Guarda a imagem no acervo e devolve o endereco para uso imediato. */
export function enviarParaAcervo(arquivo: File, aplicar: (url: string) => void) {
  const leitor = new FileReader()
  leitor.onload = () => {
    const atual = getSiteContent()
    const midia: CmsMediaAsset = {
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
