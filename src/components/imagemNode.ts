import { Node, mergeAttributes } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    imagem: {
      /** Insere a imagem no ponto do cursor. */
      setImagem: (atributos: { src: string, alt?: string, align?: AlinhamentoImagem }) => ReturnType
      /** Muda o alinhamento da imagem selecionada. */
      setAlinhamentoImagem: (align: AlinhamentoImagem) => ReturnType
    }
  }
}

/** Onde a imagem fica em relacao ao texto que a cerca. */
export type AlinhamentoImagem = 'center' | 'left' | 'right'

const ALINHAMENTOS: AlinhamentoImagem[] = ['center', 'left', 'right']

/**
 * Imagem dentro do texto. Guarda o alinhamento no proprio no para que a equipe
 * possa encostar a imagem a esquerda ou a direita e deixar o texto correr ao
 * lado — o arranjo mais pedido no conteudo informativo do portal.
 */
export const ImagemNode = Node.create({
  name: 'imagem',
  group: 'block',
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      src: { default: '' },
      alt: { default: '' },
      align: {
        default: 'center' as AlinhamentoImagem,
        parseHTML: (elemento) => {
          const valor = elemento.getAttribute('data-align')
          return ALINHAMENTOS.includes(valor as AlinhamentoImagem) ? valor : 'center'
        },
      },
    }
  },

  parseHTML() {
    return [{ tag: 'img[src]' }]
  },

  renderHTML({ HTMLAttributes }) {
    const { align, ...resto } = HTMLAttributes
    return ['img', mergeAttributes(resto, {
      'data-align': align,
      class: `cms-imagem-no-texto is-${align}`,
    })]
  },

  addCommands() {
    return {
      setImagem: (atributos) => ({ commands }) => {
        if (!atributos.src) return false
        return commands.insertContent({ type: this.name, attrs: { align: 'center', alt: '', ...atributos } })
      },
      setAlinhamentoImagem: (align) => ({ commands }) => commands.updateAttributes(this.name, { align }),
    }
  },
})
