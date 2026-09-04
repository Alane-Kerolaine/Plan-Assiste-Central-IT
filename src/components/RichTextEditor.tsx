import { useEffect, useState, type ReactNode } from 'react'
import { EditorContent, useEditor, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Table from '@tiptap/extension-table'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import { YoutubeNode } from './youtubeNode'
import { ImagemNode, type AlinhamentoImagem } from './imagemNode'
import { SeletorDeImagem } from './SeletorDeImagem'
import {
  AlignCenter, AlignJustify, AlignLeft, AlignRight, Bold, Columns3, Heading2, Heading3,
  Italic, Link2, Link2Off, List, ListOrdered, Merge, Minus, Pilcrow, Quote, Redo2, Rows3,
  Split, Strikethrough, Table2, Trash2, Underline as UnderlineIcon, Undo2, MonitorPlay, ImagePlus, AlignStartVertical, AlignEndVertical, AlignVerticalJustifyCenter,
} from 'lucide-react'

type RichTextEditorProps = {
  value?: string
  onChange?: (html: string) => void
  placeholder?: string
  minHeight?: number
}

type ToolProps = {
  title: string
  active?: boolean
  disabled?: boolean
  onClick: () => void
  children: React.ReactNode
}

function Tool({ title, active, disabled, onClick, children }: ToolProps) {
  return <button type="button" className={`go-rte-btn${active ? ' active' : ''}`} aria-pressed={active || undefined} title={title} disabled={disabled} onMouseDown={(event) => { event.preventDefault(); onClick() }}>{children}</button>
}

function Divider() { return <span className="go-rte-sep" aria-hidden="true" /> }

function TableTools({ editor }: { editor: Editor }) {
  if (!editor.isActive('table')) return null
  return <span className="go-rte-group go-rte-table-tools" aria-label="Ferramentas da tabela">
    <Divider />
    <Tool title="Adicionar coluna à direita" onClick={() => editor.chain().focus().addColumnAfter().run()}><Columns3 /></Tool>
    <Tool title="Excluir coluna" disabled={!editor.can().deleteColumn()} onClick={() => editor.chain().focus().deleteColumn().run()}><Columns3 /><span>−</span></Tool>
    <Tool title="Adicionar linha abaixo" onClick={() => editor.chain().focus().addRowAfter().run()}><Rows3 /></Tool>
    <Tool title="Excluir linha" disabled={!editor.can().deleteRow()} onClick={() => editor.chain().focus().deleteRow().run()}><Rows3 /><span>−</span></Tool>
    <Tool title="Mesclar células selecionadas" disabled={!editor.can().mergeCells()} onClick={() => editor.chain().focus().mergeCells().run()}><Merge /></Tool>
    <Tool title="Dividir célula" disabled={!editor.can().splitCell()} onClick={() => editor.chain().focus().splitCell().run()}><Split /></Tool>
    <Tool title="Alternar cabeçalho da linha" onClick={() => editor.chain().focus().toggleHeaderRow().run()}><Pilcrow /></Tool>
    <span className="go-rte-table-delete"><Tool title="Excluir tabela" onClick={() => editor.chain().focus().deleteTable().run()}><Trash2 /><span>Excluir tabela</span></Tool></span>
  </span>
}

/**
 * Alinhamento da imagem selecionada. So aparece com uma imagem selecionada,
 * como as ferramentas da tabela — a barra ja e longa para trazer sempre.
 */
function ImagemTools({ editor }: { editor: Editor }) {
  if (!editor.isActive('imagem')) return null

  const atual = editor.getAttributes('imagem').align as AlinhamentoImagem | undefined
  const opcoes: Array<[AlinhamentoImagem, string, ReactNode]> = [
    ['left', 'Imagem à esquerda, texto ao lado', <AlignStartVertical key="e" />],
    ['center', 'Imagem centralizada', <AlignVerticalJustifyCenter key="c" />],
    ['right', 'Imagem à direita, texto ao lado', <AlignEndVertical key="d" />],
  ]

  return (
    <span className="go-rte-group" aria-label="Ferramentas da imagem">
      <Divider />
      {opcoes.map(([valor, titulo, icone]) => (
        <Tool
          key={valor}
          title={titulo}
          active={(atual ?? 'center') === valor}
          onClick={() => editor.chain().focus().setAlinhamentoImagem(valor).run()}
        >
          {icone}
        </Tool>
      ))}
    </span>
  )
}

export function RichTextEditor({ value = '', onChange, placeholder = 'Escreva aqui...', minHeight }: RichTextEditorProps) {
  const [escolhendoImagem, setEscolhendoImagem] = useState(false)
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false, autolink: true, HTMLAttributes: { rel: 'noopener noreferrer' } }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder }),
      Table.configure({ resizable: true, HTMLAttributes: { class: 'portal-table' } }),
      TableRow,
      TableHeader,
      TableCell,
      YoutubeNode,
      ImagemNode,
    ],
    content: value,
    onUpdate: ({ editor: current }) => onChange?.(current.getHTML()),
  })

  useEffect(() => {
    if (!editor || editor.getHTML() === value) return
    editor.commands.setContent(value || '', false)
  }, [editor, value])

  if (!editor) return null

  function editLink() {
    const previous = editor!.getAttributes('link').href || ''
    const href = window.prompt('Endereço do link:', previous)
    if (href === null) return
    if (!href.trim()) editor!.chain().focus().extendMarkRange('link').unsetLink().run()
    else editor!.chain().focus().extendMarkRange('link').setLink({ href: href.trim() }).run()
  }

  function inserirYoutube() {
    const url = window.prompt('Cole o endereço do vídeo no YouTube:', '')
    if (url === null || !url.trim()) return
    // O comando recusa endereço que não seja do YouTube: o aviso explica a recusa.
    if (!editor!.chain().focus().setYoutube(url.trim()).run()) {
      window.alert('Endereço não reconhecido. Use o endereço da página do vídeo no YouTube.')
    }
  }

  return <div className="go-rte cms-rich-text-editor">
    <div className="go-rte-toolbar" role="toolbar" aria-label="Formatação do texto">
      <span className="go-rte-group">
        <Tool title="Desfazer" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}><Undo2 /></Tool>
        <Tool title="Refazer" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}><Redo2 /></Tool>
        <Divider />
        <Tool title="Negrito" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}><Bold /></Tool>
        <Tool title="Itálico" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic /></Tool>
        <Tool title="Sublinhado" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}><UnderlineIcon /></Tool>
        <Tool title="Tachado" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}><Strikethrough /></Tool>
        <Divider />
        <Tool title="Parágrafo" active={editor.isActive('paragraph')} onClick={() => editor.chain().focus().setParagraph().run()}><Pilcrow /></Tool>
        <Tool title="Título 2" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 /></Tool>
        <Tool title="Título 3" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}><Heading3 /></Tool>
        <Divider />
        <Tool title="Lista com marcadores" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}><List /></Tool>
        <Tool title="Lista numerada" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered /></Tool>
        <Tool title="Citação" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote /></Tool>
        <Tool title="Inserir linha horizontal" onClick={() => editor.chain().focus().setHorizontalRule().run()}><Minus /></Tool>
        <Divider />
        <Tool title="Alinhar à esquerda" active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()}><AlignLeft /></Tool>
        <Tool title="Centralizar" active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()}><AlignCenter /></Tool>
        <Tool title="Alinhar à direita" active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()}><AlignRight /></Tool>
        <Tool title="Justificar" active={editor.isActive({ textAlign: 'justify' })} onClick={() => editor.chain().focus().setTextAlign('justify').run()}><AlignJustify /></Tool>
        <Divider />
        <Tool title="Inserir ou editar link" active={editor.isActive('link')} onClick={editLink}><Link2 /></Tool>
        <Tool title="Remover link" disabled={!editor.isActive('link')} onClick={() => editor.chain().focus().unsetLink().run()}><Link2Off /></Tool>
        <Tool title="Inserir imagem" onClick={() => setEscolhendoImagem(true)}><ImagePlus /></Tool>
        <Tool title="Inserir vídeo do YouTube" onClick={inserirYoutube}><MonitorPlay /></Tool>
        <Tool title="Inserir tabela 3 × 3" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}><Table2 /></Tool>
        <TableTools editor={editor} />
        <ImagemTools editor={editor} />
      </span>
    </div>
    <EditorContent editor={editor} className="go-rte-content" style={minHeight ? { minHeight } : undefined} />
    {escolhendoImagem && (
      <SeletorDeImagem
        onFechar={() => setEscolhendoImagem(false)}
        onEscolher={({ src, alt }) => {
          editor.chain().focus().setImagem({ src, alt }).run()
          setEscolhendoImagem(false)
        }}
      />
    )}
  </div>
}
