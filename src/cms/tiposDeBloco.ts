import type { CmsBlockType } from './contentRepository'

/**
 * Blocos oferecidos no editor ao vivo, na ordem do menu. Fica em modulo proprio
 * porque a lista serve tanto a pagina quanto a noticia, e importar de um painel
 * para o outro criaria dependencia circular.
 */
export const TIPOS_DE_BLOCO: Array<[CmsBlockType, string]> = [
  ['rich-text', 'Texto'],
  ['card', 'Card'],
  ['document', 'Documento'],
  ['notice', 'Aviso'],
  ['table', 'Tabela'],
  ['button', 'Botão'],
  ['media', 'Imagem ou vídeo'],
  ['gallery', 'Carrossel de imagens'],
  ['faq', 'Perguntas frequentes'],
]
