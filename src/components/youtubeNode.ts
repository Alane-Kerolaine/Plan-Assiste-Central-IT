import { Node, mergeAttributes } from '@tiptap/core'
import { incorporacaoDoYoutube } from '../cms/youtube'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    youtube: {
      /** Insere o vídeo a partir do endereço colado pela equipe. */
      setYoutube: (url: string) => ReturnType
    }
  }
}

/**
 * Vídeo do YouTube como bloco do editor de texto. Guarda apenas o endereço de
 * incorporação: o que for colado é convertido na inserção, de modo que o HTML
 * salvo já esteja no formato que a página publica.
 */
export const YoutubeNode = Node.create({
  name: 'youtube',
  group: 'block',
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return { src: { default: '' } }
  },

  parseHTML() {
    return [{ tag: 'div[data-youtube] iframe[src]' }, { tag: 'iframe[src*="youtube-nocookie.com/embed/"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      { class: 'cms-youtube', 'data-youtube': '' },
      ['iframe', mergeAttributes(HTMLAttributes, {
        allow: 'accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
        allowfullscreen: 'true',
        loading: 'lazy',
        title: 'Vídeo do YouTube',
      })],
    ]
  },

  addCommands() {
    return {
      setYoutube: (url: string) => ({ commands }) => {
        const src = incorporacaoDoYoutube(url)
        if (!src) return false
        return commands.insertContent({ type: this.name, attrs: { src } })
      },
    }
  },
})
