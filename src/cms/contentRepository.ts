import { useSyncExternalStore } from 'react'

export type CmsBlockWidth = '1/1' | '1/2' | '1/3' | '1/4'
export type CmsBlockType = 'rich-text' | 'card' | 'document' | 'notice' | 'faq' | 'organization' | 'table' | 'button' | 'media'
export type CmsCardVariant = 'navigation' | 'navigation-secondary' | 'information' | 'operational' | 'result' | 'actuarial'

export type CmsBlock = {
  id: string
  type: CmsBlockType
  width: CmsBlockWidth
  title: string
  content: string
  href?: string
  buttonLabel?: string
  cardVariant?: CmsCardVariant
  meta?: string
  badge?: string
  icon?: string
  faqCategories?: string[]
  faqItems?: Array<{ id?: string, category: string, question: string, answer: string }>
  organizationItems?: Array<{ id: string, label: string, acronym?: string, responsible?: string, email?: string, level: number }>
  tableHeaders?: string[]
  tableRows?: string[][]
  tableVariant?: 'standard' | 'hover' | 'striped'
  buttonVariant?: 'primary' | 'secondary' | 'link'
  mediaUrl?: string
  mediaKind?: 'image' | 'video' | 'audio'
  caption?: string
}

export type CmsPage = {
  id: string
  slug: string
  parentSlug: string | null
  title: string
  navigationTitle: string
  summary: string
  status: 'draft' | 'published'
  blocks: CmsBlock[]
  updatedAt: string
}

export type CmsSnapshot = {
  pages: CmsPage[]
  editingEnabled: boolean
}

export interface ContentRepository {
  getSnapshot(): CmsSnapshot
  subscribe(listener: () => void): () => void
  getPage(slug: string): CmsPage | undefined
  savePage(page: CmsPage): void
  deletePage(id: string): void
  setEditingEnabled(enabled: boolean): void
  exportData(): string
  importData(serialized: string): void
  reset(): void
  reload(): void
}

const STORAGE_KEY = 'planAssisteCmsContentV1'
const EDITING_KEY = 'planAssisteCmsEditing'

const initialPages: CmsPage[] = []

function emptySnapshot(): CmsSnapshot {
  return {
    pages: initialPages,
    editingEnabled: localStorage.getItem(EDITING_KEY) === 'true',
  }
}

export class BrowserContentRepository implements ContentRepository {
  private listeners = new Set<() => void>()
  private snapshot = this.read()

  private read(): CmsSnapshot {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') as { pages?: CmsPage[] } | null
      const pages = Array.isArray(parsed?.pages) ? parsed.pages.map((page) => ({ ...page, blocks: page.blocks.map((block) => block.type === 'faq' ? { ...block, faqCategories: (block.faqCategories || []).filter((category) => category.trim().toLocaleLowerCase('pt-BR') !== 'teste'), faqItems: (block.faqItems || []).filter((item) => !(item.category.trim().toLocaleLowerCase('pt-BR') === 'teste' && item.question.trim().toLocaleLowerCase('pt-BR') === 'e')) } : block) })) : initialPages
      return {
        pages,
        editingEnabled: localStorage.getItem(EDITING_KEY) === 'true',
      }
    } catch {
      return emptySnapshot()
    }
  }

  private commit(next: CmsSnapshot) {
    this.snapshot = next
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ pages: next.pages }))
    localStorage.setItem(EDITING_KEY, String(next.editingEnabled))
    this.listeners.forEach((listener) => listener())
    window.dispatchEvent(new Event('planAssisteCmsUpdated'))
  }

  getSnapshot = () => this.snapshot

  subscribe = (listener: () => void) => {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  getPage(slug: string) {
    return this.snapshot.pages.find((page) => page.slug === slug)
  }

  savePage(page: CmsPage) {
    const duplicate = this.snapshot.pages.find((item) => item.id !== page.id && item.slug === page.slug)
    const normalizedPage = duplicate ? { ...page, id: duplicate.id } : page
    const pages = this.snapshot.pages.some((item) => item.id === normalizedPage.id)
      ? this.snapshot.pages.map((item) => item.id === normalizedPage.id ? normalizedPage : item)
      : [...this.snapshot.pages, normalizedPage]
    this.commit({ ...this.snapshot, pages })
  }

  deletePage(id: string) {
    this.commit({ ...this.snapshot, pages: this.snapshot.pages.filter((page) => page.id !== id) })
  }

  setEditingEnabled(enabled: boolean) {
    this.commit({ ...this.snapshot, editingEnabled: enabled })
  }

  exportData() {
    return JSON.stringify({ schemaVersion: 1, exportedAt: new Date().toISOString(), pages: this.snapshot.pages }, null, 2)
  }

  importData(serialized: string) {
    const parsed = JSON.parse(serialized) as { pages?: CmsPage[] }
    if (!Array.isArray(parsed.pages)) throw new Error('Arquivo de conteúdo inválido.')
    this.commit({ ...this.snapshot, pages: parsed.pages })
  }

  reset() {
    localStorage.removeItem(STORAGE_KEY)
    this.commit(emptySnapshot())
  }

  reload() {
    this.snapshot = this.read()
    this.listeners.forEach((listener) => listener())
    window.dispatchEvent(new Event('planAssisteCmsUpdated'))
  }
}

export const contentRepository: ContentRepository = new BrowserContentRepository()

window.addEventListener('storage', () => {
  contentRepository.reload()
})

export function useCmsSnapshot() {
  return useSyncExternalStore(contentRepository.subscribe, contentRepository.getSnapshot)
}

export function createCmsBlock(type: CmsBlockType = 'rich-text'): CmsBlock {
  return {
    id: crypto.randomUUID(),
    type,
    width: '1/1',
    title: '',
    content: '',
    buttonLabel: type === 'document' ? 'Baixar arquivo' : undefined,
    cardVariant: type === 'card' ? 'navigation' : undefined,
    faqCategories: type === 'faq' ? ['Geral'] : undefined,
    faqItems: type === 'faq' ? [] : undefined,
    organizationItems: type === 'organization' ? [] : undefined,
    tableHeaders: type === 'table' ? ['Coluna 1', 'Coluna 2'] : undefined,
    tableRows: type === 'table' ? [['', '']] : undefined,
    tableVariant: type === 'table' ? 'standard' : undefined,
    buttonVariant: type === 'button' ? 'primary' : undefined,
  }
}

export function createCmsPage(slug = ''): CmsPage {
  return {
    id: crypto.randomUUID(),
    slug,
    parentSlug: null,
    title: '',
    navigationTitle: '',
    summary: '',
    status: 'draft',
    blocks: [createCmsBlock()],
    updatedAt: new Date().toISOString(),
  }
}
