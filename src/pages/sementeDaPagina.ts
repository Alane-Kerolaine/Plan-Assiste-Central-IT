import { createCmsBlock, createCmsPage, type CmsPage } from '../cms/contentRepository'
import { slugDoCaminho } from '../cms/portalNavegacao'
import { getCmsFaqCategories, getCmsFaqs } from '../cms/specialContent'
import { getPlanAssisteArticleCmsSeed } from './PublicPages'
import {
  getAccountingCmsSeed,
  getAccreditationTermsCmsSeed,
  getActuarialCmsSeed,
  getBudgetExecutionCmsSeed,
  getBudgetFinancialReportsCmsSeed,
  getManagementReportsCmsSeed,
  getTransparencyCmsSeed,
} from './TransparenciaPage'

function sementeDuvidasFrequentes(): CmsPage {
  const pagina = createCmsPage('fale-conosco/duvidas-frequentes')
  return {
    ...pagina,
    title: 'Duvidas frequentes',
    navigationTitle: 'Duvidas frequentes',
    summary: 'Encontre respostas rapidas para os temas mais procurados no atendimento do Plan-Assiste.',
    status: 'published',
    blocks: [{
      ...createCmsBlock('faq'),
      title: 'Duvidas frequentes',
      faqCategories: getCmsFaqCategories(),
      faqItems: getCmsFaqs().map((item) => ({ ...item, id: crypto.randomUUID() })),
    }],
  }
}

const SEMENTES: Record<string, () => CmsPage | undefined> = {
  'transparencia': getTransparencyCmsSeed,
  'transparencia/demonstracoes-contabeis': getAccountingCmsSeed,
  'transparencia/avaliacoes-atuariais': getActuarialCmsSeed,
  'transparencia/termos-de-credenciamento': getAccreditationTermsCmsSeed,
  'transparencia/relatorios-de-gestao': getManagementReportsCmsSeed,
  'transparencia/relatorios-orcamentarios-e-financeiros': getBudgetFinancialReportsCmsSeed,
  'transparencia/execucao-orcamentaria': getBudgetExecutionCmsSeed,
  'fale-conosco/duvidas-frequentes': sementeDuvidasFrequentes,
}

/**
 * Conteudo inicial da pagina ainda nao personalizada, para que a edicao comece
 * com o que esta publicado em vez de uma tela em branco.
 */
export function sementeDaPagina(caminho: string): CmsPage {
  const slug = slugDoCaminho(caminho) ?? ''
  const pronta = SEMENTES[slug]?.() ?? getPlanAssisteArticleCmsSeed(slug)
  const base = pronta ?? createCmsPage(slug)
  const partes = slug.split('/')

  return {
    ...base,
    slug,
    parentSlug: partes.length > 1 ? partes.slice(0, -1).join('/') : null,
    files: base.files ?? [],
  }
}
