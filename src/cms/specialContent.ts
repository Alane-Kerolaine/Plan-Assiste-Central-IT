import { supportFaqCategories, supportFaqs } from '../data/supportFaqs'

const FAQ_KEY = 'planAssisteCmsFaqsV1'
const ORG_KEY = 'planAssisteCmsOrgHierarchyV1'
const FAQ_CATEGORIES_KEY = 'planAssisteCmsFaqCategoriesV1'
const MEDICATION_FAQS_MIGRATION_KEY = 'planAssisteCmsMedicationFaqsV2'
const MEDICATION_CATEGORY_MIGRATION_KEY = 'planAssisteCmsMedicationCategoryV1'

export type CmsFaqItem = { id?: string, category: string, question: string, answer: string }

export function getCmsFaqs(): CmsFaqItem[] {
  try {
    const value = JSON.parse(localStorage.getItem(FAQ_KEY) || 'null')
    if (!Array.isArray(value)) return supportFaqs
    const cleaned = value.filter((item: CmsFaqItem) => !(item.category?.trim().toLocaleLowerCase('pt-BR') === 'teste' && item.question?.trim().toLocaleLowerCase('pt-BR') === 'e'))
    if (localStorage.getItem(MEDICATION_FAQS_MIGRATION_KEY)) return cleaned

    const medicationDefaults = new Map(supportFaqs.filter((item) => item.category === 'Medicamentos').map((item) => [item.question, item]))
    const refreshed = cleaned.map((item: CmsFaqItem) => {
      const current = medicationDefaults.get(item.question)
      return current ? { ...current, id: item.id } : item
    })
    const questions = new Set(refreshed.map((item: CmsFaqItem) => item.question))
    const medicationFaqs = supportFaqs.filter((item) => item.category === 'Medicamentos' && !questions.has(item.question))
    const migrated = [...refreshed, ...medicationFaqs]
    localStorage.setItem(FAQ_KEY, JSON.stringify(migrated))
    localStorage.setItem(MEDICATION_FAQS_MIGRATION_KEY, '1')
    return migrated
  } catch { return supportFaqs }
}
export function saveCmsFaqs(items: CmsFaqItem[]) { localStorage.setItem(FAQ_KEY, JSON.stringify(items)); window.dispatchEvent(new Event('planAssisteCmsSpecialContentUpdated')) }
export function resetCmsFaqs() { localStorage.removeItem(FAQ_KEY); window.dispatchEvent(new Event('planAssisteCmsSpecialContentUpdated')) }
export function getCmsFaqCategories(): string[] {
  try {
    const value = JSON.parse(localStorage.getItem(FAQ_CATEGORIES_KEY) || 'null')
    if (!Array.isArray(value)) return supportFaqCategories.slice(1)
    const cleaned = value.filter((category: string) => category.trim().toLocaleLowerCase('pt-BR') !== 'teste')
    if (localStorage.getItem(MEDICATION_CATEGORY_MIGRATION_KEY) || cleaned.includes('Medicamentos')) return cleaned

    const migrated = [...cleaned, 'Medicamentos']
    localStorage.setItem(FAQ_CATEGORIES_KEY, JSON.stringify(migrated))
    localStorage.setItem(MEDICATION_CATEGORY_MIGRATION_KEY, '1')
    return migrated
  } catch { return [...supportFaqCategories.slice(1)] }
}
export function saveCmsFaqCategories(items: string[]) { localStorage.setItem(FAQ_CATEGORIES_KEY, JSON.stringify(items)); window.dispatchEvent(new Event('planAssisteCmsSpecialContentUpdated')) }
export function resetCmsFaqCategories() { localStorage.removeItem(FAQ_CATEGORIES_KEY); window.dispatchEvent(new Event('planAssisteCmsSpecialContentUpdated')) }

export function getCmsOrgHierarchy(fallback: string[]): string[] {
  try { const value = JSON.parse(localStorage.getItem(ORG_KEY) || 'null'); return Array.isArray(value) ? value : fallback } catch { return fallback }
}
export function saveCmsOrgHierarchy(items: string[]) { localStorage.setItem(ORG_KEY, JSON.stringify(items)); window.dispatchEvent(new Event('planAssisteCmsSpecialContentUpdated')) }
export function resetCmsOrgHierarchy() { localStorage.removeItem(ORG_KEY); window.dispatchEvent(new Event('planAssisteCmsSpecialContentUpdated')) }
