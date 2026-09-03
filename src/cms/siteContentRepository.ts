import { news as publicNews } from '../data/mock'
import { bundledAssetCatalog } from '../data/assetCatalog.generated'
import type { CmsBlock, CmsRelatedRef } from './contentRepository'

export type CmsMediaAsset = { id: string; name: string; type: string; size: number; url: string; createdAt: string; bundled?: boolean; /** Pasta escolhida a mao, quando o endereco nao traz caminho. */ folder?: string }
export type CmsFileAsset = CmsMediaAsset
export type CmsBanner = { id: string; slideshow: 'home' | 'beneficiary' | 'provider' | 'team'; eyebrow: string; title: string; description: string; actionLabel: string; destination: string; imageUrl: string; alt: string; tone: string; startDate: string; endDate: string; order: number; active: boolean; folder?: string }
export type CmsNewsItem = { id: string; title: string; summary: string; category: string; author: string; publishDate: string; status: 'draft' | 'published'; audience: string[]; regions: string[]; scope: string; coverUrl: string; bodyImageUrl: string; content: string; blocks?: CmsBlock[]; related?: CmsRelatedRef[]; folder?: string; updatedAt: string }
export type CmsSocialLink = { id: string; network: 'youtube' | 'whatsapp' | 'linkedin'; label: string; url: string; order: number; active: boolean; folder?: string }
export type CmsContactChannel = { id: string; kind: 'phone' | 'whatsapp' | 'email'; label: string; value: string; order: number; active: boolean; folder?: string }
export type CmsAddress = { id: string; label: string; note: string; detail: string; phone: string; email: string; order: number; active: boolean; folder?: string }

type SiteContent = { banners: CmsBanner[]; media: CmsMediaAsset[]; files: CmsFileAsset[]; news: CmsNewsItem[]; newsCategories: string[]; mediaFolders: string[]; fileFolders: string[]; bannerFolders: string[]; contactFolders: string[]; deletedBannerIds: string[]; deletedNewsIds: string[]; socialLinks: CmsSocialLink[]; contactChannels: CmsContactChannel[]; addresses: CmsAddress[] }
/** Publicos oferecidos na edicao de noticia. */
export const PUBLICOS_DE_NOTICIA = ['Público geral', 'Beneficiários', 'Credenciados', 'Equipe']

/**
 * Regioes de atuacao do Plan-Assiste, para a noticia valer so onde interessa.
 *
 * Nao sao as regioes do Brasil: seguem as unidades do Programa, na mesma ordem
 * e com os mesmos nomes da lista de enderecos.
 */
export const REGIOES_DE_NOTICIA = [
  'Sede (Brasília/DF)',
  'Coordenadoria Centro-Oeste (exceto Brasília)',
  'Diretoria São Paulo',
  'Diretoria Sudeste (exceto São Paulo)',
  'Diretoria Norte',
  'Diretoria Nordeste',
]

/** Regiao gravada antes do campo existir: lista vazia significa todas as regioes. */
export function regioesDaNoticia(valor: unknown): string[] {
  const lista = Array.isArray(valor) ? valor : []
  return [...new Set(lista.filter((item): item is string => REGIOES_DE_NOTICIA.includes(item)))]
}

/**
 * Normaliza o publico gravado antes da escolha multipla.
 *
 * Ate aqui era um texto unico, e "Ambos" era o nome do publico geral. Sem esta
 * conversao a noticia antiga apareceria sem publico nenhum.
 */
export function publicosDaNoticia(valor: unknown): string[] {
  const lista = Array.isArray(valor) ? valor : typeof valor === 'string' && valor ? [valor] : []
  const convertidos = lista.map((item) => (item === 'Ambos' ? 'Público geral' : item))
  return [...new Set(convertidos)]
}

const KEY = 'planAssisteCmsSiteContentV1'
const categoryLabel = (value: string) => { const text = value.trim().toLocaleLowerCase('pt-BR'); return text ? text.charAt(0).toLocaleUpperCase('pt-BR') + text.slice(1) : '' }

const defaults: SiteContent = {
  deletedBannerIds: [],
  deletedNewsIds: [],
  mediaFolders: [],
  fileFolders: [],
  bannerFolders: [],
  contactFolders: [],
  banners: [
    { id: 'slide-home-1', slideshow: 'home', eyebrow: 'Portal do Plan-Assiste', title: 'Cuidar da sua saúde ficou mais simples', description: 'Encontre credenciados, acesse serviços, acompanhe reembolsos e consulte informações importantes em um só lugar.', actionLabel: 'Conheça os serviços', destination: '#servicos', imageUrl: '/assets/hero-cuidar-saude.png', alt: 'Médica atendendo uma paciente', tone: 'default', startDate: '', endDate: '', order: 1, active: true },
    { id: 'slide-home-2', slideshow: 'home', eyebrow: 'Rede credenciada', title: 'Encontre um credenciado perto de você', description: 'Busque profissionais, clínicas, hospitais e serviços por especialidade, cidade, tipo de rede ou forma de atendimento.', actionLabel: 'Buscar credenciados', destination: '/rede-credenciada', imageUrl: '/assets/hero-prestador.png', alt: 'Beneficiária usando tablet para buscar credenciados de saúde', tone: 'default', startDate: '', endDate: '', order: 2, active: true },
    { id: 'slide-home-3', slideshow: 'home', eyebrow: 'Adesão ao Plan-Assiste', title: 'Torne-se beneficiário com orientação clara', description: 'Veja quem pode aderir, conheça os próximos passos e encontre os canais certos para iniciar sua vinculação ao Plan-Assiste.', actionLabel: 'Ver orientações', destination: '/plan-assiste/beneficiarios/torne-se-beneficiario', imageUrl: '/assets/hero-beneficiario.png', alt: 'Família recebendo orientação para adesão ao Plan-Assiste', tone: 'default', startDate: '', endDate: '', order: 3, active: true },
    { id: 'slide-beneficiary-1', slideshow: 'beneficiary', eyebrow: 'Campanha', title: 'Conheça novos credenciados disponíveis para você', description: 'Veja profissionais, clínicas e serviços incluídos recentemente na rede credenciada do Plan-Assiste.', actionLabel: 'Consultar rede', destination: '/rede-credenciada', imageUrl: '', alt: '', tone: 'green', startDate: '', endDate: '', order: 1, active: true },
    { id: 'slide-beneficiary-2', slideshow: 'beneficiary', eyebrow: 'Serviço', title: 'Sua carteirinha do Plan-Assiste sempre à mão', description: 'Acesse, baixe ou compartilhe a sua carteirinha e a dos seus dependentes com mais praticidade.', actionLabel: 'Ver carteirinha', destination: '/beneficiario/carteirinhas', imageUrl: '', alt: '', tone: 'teal', startDate: '', endDate: '', order: 2, active: true },
    { id: 'slide-beneficiary-3', slideshow: 'beneficiary', eyebrow: 'Aplicativo', title: 'Baixe o novo app do Plan-Assiste', description: 'Tenha serviços, carteirinhas, rede credenciada e notificações importantes em um só lugar.', actionLabel: 'Conhecer recursos', destination: 'https://planassiste-app.vercel.app', imageUrl: '', alt: '', tone: 'blue', startDate: '', endDate: '', order: 3, active: true },
    { id: 'slide-provider-1', slideshow: 'provider', eyebrow: 'Comunicado ao credenciado', title: 'Recurso de glosa com fluxo padronizado', description: 'Recursos de glosa voltaram a ser recebidos eletronicamente no padrão TISS/ANS, por XML gerado no sistema do credenciado.', actionLabel: 'Ver orientação', destination: 'https://planassiste.mpu.mp.br/noticias_2_0/plan-assiste-mpu-retoma-o-recebimento-de-recursos-de-glosa-em-conformidade-com-as-exigencias-da-agencia-nacional-de-saude-ans', imageUrl: '', alt: '', tone: 'default', startDate: '', endDate: '', order: 1, active: true },
    { id: 'slide-provider-2', slideshow: 'provider', eyebrow: 'Comunicado ao credenciado', title: 'Autorização web em evolução', description: 'A manutenção programada do sistema de autorização web reforça a modernização e a segurança do ambiente usado por hospitais, clínicas e laboratórios.', actionLabel: 'Acompanhar avisos', destination: 'https://planassiste.mpu.mp.br/todas-as-noticias', imageUrl: '', alt: '', tone: 'default', startDate: '', endDate: '', order: 2, active: true },
    { id: 'slide-provider-3', slideshow: 'provider', eyebrow: 'Comunicado ao credenciado', title: 'Rede credenciada em expansão', description: 'O Programa segue ampliando o credenciamento nacional, com novas oportunidades para credenciados qualificados e maior cobertura aos beneficiários.', actionLabel: 'Consultar notícias', destination: 'https://planassiste.mpu.mp.br/todas-as-noticias', imageUrl: '', alt: '', tone: 'default', startDate: '', endDate: '', order: 3, active: true },
    { id: 'slide-team-1', slideshow: 'team', eyebrow: 'Comunicado interno', title: 'Fechamento mensal com checklist integrado', description: 'As equipes regionais devem revisar pendências de faturamento, autorizações e conformidade documental antes do fechamento operacional do mês.', actionLabel: 'Abrir área da equipe', destination: '/area-da-equipe', imageUrl: '', alt: '', tone: 'default', startDate: '', endDate: '', order: 1, active: true },
    { id: 'slide-team-2', slideshow: 'team', eyebrow: 'Comunicado interno', title: 'Atualização de materiais internos', description: 'Novas orientações de credenciamento, cadastro e faturamento foram organizadas na Gestão da informação para consulta das equipes autorizadas.', actionLabel: 'Ver conteúdos', destination: '/area-da-equipe/gestao-da-informacao', imageUrl: '', alt: '', tone: 'default', startDate: '', endDate: '', order: 2, active: true },
    { id: 'slide-team-3', slideshow: 'team', eyebrow: 'Comunicado interno', title: 'Administração do portal em revisão', description: 'Banners, notícias e base de conhecimento devem seguir o padrão editorial do portal, com linguagem clara, dados atualizados e foco no usuário.', actionLabel: 'Acessar painel', destination: '/area-da-equipe/administracao-do-portal', imageUrl: '', alt: '', tone: 'default', startDate: '', endDate: '', order: 3, active: true },
  ],
  media: bundledAssetCatalog.filter((asset) => asset.kind === 'media').map((asset) => ({ id: asset.id, name: asset.name, type: asset.type, size: asset.size, url: asset.url, createdAt: asset.createdAt, bundled: asset.bundled })),
  files: bundledAssetCatalog.filter((asset) => asset.kind === 'file').map((asset) => ({ id: asset.id, name: asset.name, type: asset.type, size: asset.size, url: asset.url, createdAt: asset.createdAt, bundled: asset.bundled })),
  newsCategories: Array.from(new Set(['Institucional', 'Cobertura', 'Regulamento', 'Saúde', 'Rede credenciada', 'Financeiro', ...publicNews.map((item) => categoryLabel(item.category))])),
  news: publicNews.map((item) => { const [day, month, year] = item.date.split('/'); return { id: item.id, title: item.title, summary: item.summary, category: categoryLabel(item.category), author: 'Equipe Plan-Assiste', publishDate: `${year}-${month}-${day}`, status: 'published', audience: ['Público geral'], regions: [], scope: 'Nacional', coverUrl: item.image, bodyImageUrl: '', content: item.body.map((paragraph) => `<p>${paragraph}</p>`).join(''), updatedAt: new Date(`${year}-${month}-${day}T12:00:00`).toISOString() } }),
  socialLinks: [
    { id: 'youtube', network: 'youtube', label: 'YouTube', url: '/area-da-equipe/administracao-do-portal/contatos', order: 1, active: true },
    { id: 'whatsapp-social', network: 'whatsapp', label: 'WhatsApp', url: '/area-da-equipe/administracao-do-portal/contatos', order: 2, active: true },
    { id: 'linkedin', network: 'linkedin', label: 'LinkedIn', url: '/area-da-equipe/administracao-do-portal/contatos', order: 3, active: true },
  ],
  contactChannels: [
    { id: 'central-0800', kind: 'phone', label: 'Central de atendimento 24h', value: '0800 591 2455', order: 1, active: true },
    { id: 'whatsapp', kind: 'whatsapp', label: 'WhatsApp', value: '(61) 99877-2455', order: 2, active: true },
    { id: 'email-institucional', kind: 'email', label: 'E-mail institucional', value: 'planassiste-atendimento@mpf.mp.br', order: 3, active: true },
  ],
  addresses: [
    { id: 'sede', label: 'Sede (Brasília/DF)', note: '', detail: '', phone: '', email: '', order: 1, active: true },
    { id: 'centro-oeste', label: 'Coordenadoria Centro-Oeste', note: '(exceto Brasília)', detail: '', phone: '', email: '', order: 2, active: true },
    { id: 'sao-paulo', label: 'Diretoria São Paulo', note: '', detail: '', phone: '', email: '', order: 3, active: true },
    { id: 'sudeste', label: 'Diretoria Sudeste', note: '(exceto São Paulo)', detail: '', phone: '', email: '', order: 4, active: true },
    { id: 'norte', label: 'Diretoria Norte', note: '', detail: '', phone: '', email: '', order: 5, active: true },
    { id: 'nordeste', label: 'Diretoria Nordeste', note: '', detail: '', phone: '', email: '', order: 6, active: true },
  ],
}

function mergeFixedCollection<T extends { id: string }>(saved: T[] | undefined, defaultItems: T[]): T[] {
  const savedMap = new Map((saved || []).map((item) => [item.id, item]))
  return defaultItems.map((item) => ({ ...item, ...savedMap.get(item.id) }))
}

export function getSiteContent(): SiteContent {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || 'null') as Partial<SiteContent> | null
    if (!saved) return structuredClone(defaults)
    const media = [...(saved.media || []), ...defaults.media.filter((asset) => !(saved.media || []).some((item) => item.id === asset.id))]
    const files = [...(saved.files || []), ...defaults.files.filter((asset) => !(saved.files || []).some((item) => item.id === asset.id))]
    const deletedNewsIds = saved.deletedNewsIds || []
    const deletedBannerIds = saved.deletedBannerIds || []
    const news = [...(saved.news || []), ...defaults.news.filter((item) => !deletedNewsIds.includes(item.id) && !(saved.news || []).some((savedItem) => savedItem.id === item.id))].map((item) => ({ ...item, category: categoryLabel(item.category), bodyImageUrl: item.bodyImageUrl || '', audience: publicosDaNoticia(item.audience), regions: regioesDaNoticia(item.regions) }))
    const newsCategories = Array.from(new Map([...(saved.newsCategories || []), ...defaults.newsCategories].map((item) => [categoryLabel(item).toLocaleLowerCase('pt-BR'), categoryLabel(item)])).values())
    const savedBanners = (saved.banners || []).map((banner) => {
      const destination = banner.id === 'slide-beneficiary-3' && banner.destination === '/aplicativo'
        ? 'https://planassiste-app.vercel.app'
        : banner.id === 'slide-team-1' && banner.destination === '/gestao-operacional/admin/reembolsos'
          ? '/area-da-equipe'
          : banner.destination
      const actionLabel = banner.id === 'slide-team-1' && banner.actionLabel === 'Abrir gestão operacional' ? 'Abrir área da equipe' : banner.actionLabel
      return { ...banner, destination, actionLabel: actionLabel || 'Saiba mais', slideshow: banner.slideshow || 'home', eyebrow: banner.eyebrow || '', description: banner.description || '', alt: banner.alt || '', tone: banner.tone || 'default' }
    })
    const banners = [...savedBanners, ...defaults.banners.filter((item) => !deletedBannerIds.includes(item.id) && !savedBanners.some((savedItem) => savedItem.id === item.id))]
    const socialLinks = mergeFixedCollection(saved.socialLinks, defaults.socialLinks)
    const contactChannels = mergeFixedCollection(saved.contactChannels, defaults.contactChannels)
    const addresses = mergeFixedCollection(saved.addresses, defaults.addresses)
    return { banners, media, files, news, newsCategories, mediaFolders: saved.mediaFolders || [], fileFolders: saved.fileFolders || [], bannerFolders: saved.bannerFolders || [], contactFolders: saved.contactFolders || [], deletedBannerIds, deletedNewsIds, socialLinks, contactChannels, addresses }
  } catch { return structuredClone(defaults) }
}

export function saveSiteContent(content: SiteContent) {
  localStorage.setItem(KEY, JSON.stringify(content))
  window.dispatchEvent(new Event('planAssisteCmsSiteContentUpdated'))
}

export function getCmsSlideshow(slideshow: CmsBanner['slideshow']) {
  const today = new Date().toISOString().slice(0, 10)
  return getSiteContent().banners.filter((item) => item.slideshow === slideshow && item.active && (!item.startDate || item.startDate <= today) && (!item.endDate || item.endDate >= today)).sort((a, b) => a.order - b.order)
}

function activeSorted<T extends { active: boolean; order: number }>(items: T[]): T[] {
  return items.filter((item) => item.active).sort((a, b) => a.order - b.order)
}

export function getCmsSocialLinks() {
  return activeSorted(getSiteContent().socialLinks).filter((item) => item.url.trim())
}

export function getCmsContactChannels() {
  return activeSorted(getSiteContent().contactChannels)
}

export function getCmsAddresses() {
  return activeSorted(getSiteContent().addresses)
}

/**
 * Acervo com os envios da equipe na frente, do mais recente para o mais antigo.
 *
 * O catalogo incorporado ao site mantem a ordem em que foi gerado: ordenar tudo
 * por data embaralharia centenas de itens que a equipe ja sabe onde encontrar.
 * O que muda de lugar e so o que a propria equipe acabou de enviar.
 */
export function comEnviadosPrimeiro<T extends { createdAt: string, bundled?: boolean }>(acervo: T[]): T[] {
  const enviados = acervo
    .filter((item) => !item.bundled)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const doCatalogo = acervo.filter((item) => item.bundled)
  return [...enviados, ...doCatalogo]
}
