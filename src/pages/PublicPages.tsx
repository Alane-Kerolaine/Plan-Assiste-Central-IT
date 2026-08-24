import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import {
  Accessibility,
  Activity,
  ArrowRight,
  BadgeCheck,
  BookOpenCheck,
  Brain,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Copy,
  Download,
  Dumbbell,
  ExternalLink,
  FileText,
  Globe2,
  Heart,
  HeartPulse,
  HandHeart,
  HelpCircle,
  IdCard,
  ListChecks,
  LockKeyhole,
  Mail,
  MonitorCheck,
  Pill,
  Printer,
  PersonStanding,
  Scale,
  Search,
  Save,
  Send,
  Share2,
  ShieldCheck,
  Smartphone,
  Speech,
  UserPlus,
  UsersRound,
  Waves,
} from 'lucide-react'
import { Link, Navigate, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { FileAttachmentField } from '../components/FileAttachmentField'
import { ResultsHeader } from '../components/ResultsHeader'
import { Footer, Header, MainMenu, RestrictedAreaSidebar, SupportIcon, type AreaSidebarGroup, type SupportIconType } from '../components/PortalComponents'
import {
  beneficiaryRequests,
  beneficiaryServices,
  news,
  providerServices,
  providers,
  type NewsItem,
} from '../data/mock'
import {
  getFavoriteState,
  toggleFavoriteNews,
  type FavoriteState,
} from '../utils/favorites'
import { UF_OPTIONS, getServiceFormSchema } from '../data/serviceFormSchemas'
import { findServicoByPaginaSlug, servicoFormSlug, servicoPaginaSlug, servicoRotaFormulario } from '../utils/servicoPlanAssiste'
import { maskCpf, maskPhone } from '../utils/inputMasks'
import { stripHtml } from '../utils/html'
import { getStoredSession } from '../utils/session'
import { NewsCard } from './HomePage'
import { createCmsBlock, createCmsPage, useCmsSnapshot, type CmsBlock, type CmsPage } from '../cms/contentRepository'
import { CmsPageBlocks } from '../components/CmsBlocks'
import { InlineLinkedText } from '../components/InlineLinkedText'
import { getCmsFaqCategories, getCmsFaqs, getCmsOrgHierarchy } from '../cms/specialContent'
import { getCmsSlideshow, getSiteContent } from '../cms/siteContentRepository'
import { supportChannels } from '../data/supportChannels'
import { getStoredUserProfile } from '../utils/userProfile'
import { getProviderPublicProfile, providerTagOptions, saveProviderPublicProfile, testProviderId, type ProviderPublicProfile } from '../utils/providerPublicProfile'

export type PublicPageProps = {
  loggedIn: boolean
  onLogout?: () => void
}

const newsPerPage = 12

function getPortalNews(): NewsItem[] {
  const managed = getSiteContent().news.filter((item) => item.status === 'published').map((item) => {
    const [year, month, day] = item.publishDate.split('-')
    return { id: item.id, category: item.category.toUpperCase(), title: item.title, date: day && month && year ? `${day}/${month}/${year}` : item.publishDate, image: item.coverUrl || news[0]?.image || '', bodyImageUrl: item.bodyImageUrl || '', summary: item.summary, body: [stripHtml(item.content)].filter(Boolean) }
  })
  return [...managed, ...news.filter((item) => !managed.some((managedItem) => managedItem.id === item.id))]
}

type PortalArticle = {
  id: string
  title: string
  navigationTitle: string
  slug: string
  category: string
  summary: string
  icon: typeof BookOpenCheck
  sections: Array<{
    id?: string
    title?: string
    paragraphs?: string[]
    bullets?: string[]
    bulletsAsTable?: boolean
    linkedBullets?: Array<{
      text: string
      href?: string
      download?: string
      external?: boolean
      label?: string
      signatureRequired?: boolean
    }>
    table?: {
      caption?: string
      headers: string[]
      rows: string[][]
      columnWidths?: string[]
      downloads?: Array<{
        href: string
        download: string
        label?: string
      }>
    }
    image?: {
      src: string
      alt: string
      caption?: string
      variant?: 'brand' | 'brand-dark' | 'wide'
    }
    cards?: Array<{
      title: string
      text: string
      to?: string
      actionLabel?: string
      bullets?: string[]
      actions?: Array<{
        label: string
        href: string
        download?: string
      }>
    }>
    actions?: Array<{
      label: string
      href: string
      download?: string
      external?: boolean
    }>
    hierarchy?: string[]
  }>
}

const seplanHierarchy = [
  '1. Diretoria Executiva (DEPAM)',
  '1.1. Gabinete da Diretoria Executiva (GABDEPAM)',
  '1.1.1. Assessoria Técnica (ASTEC)',
  '1.2. Assessoria Jurídica e Normativa (ASJUN)',
  '1.3. Assessoria de Suporte às Diretorias Regionais (ASDR)',
  '1.4. Diretoria Atuarial (DIAT)',
  '1.4.1. Assessoria Especial da Diretoria Atuarial (ASESDIAT)',
  '1.4.2. Controladoria (CONT)',
  '1.4.3. Núcleo de Contabilidade (NUCON)',
  '1.4.4. Supervisão de Gestão de Riscos (SUGER)',
  '1.5. Diretoria de Orçamento e Finanças (DIOF)',
  '1.5.1. Assessoria Técnica (ASTEC)',
  '1.5.2. Gestão Documental e Conformidade (COGEC)',
  '1.5.2.1. Núcleo de Gestão Documental (NUGED)',
  '1.5.2.2. Núcleo de Conformidade de Gestão (NUCOG)',
  '1.5.2.3. Núcleo de Acompanhamento Orçamentário e Execução Tributária (NAOET)',
  '1.5.3. Coordenadoria de Execução de Pagamentos (COEPAG)',
  '1.5.3.1. Divisão de Processamento de Contas (DIPROC)',
  '1.5.3.1.1. Núcleo de Análise de Contas (NUAC)',
  '1.5.3.1.1.1. Seção de Reembolsos (SEREB)',
  '1.5.3.2. Núcleo de Execução de Pagamentos (NUEPAG)',
  '1.5.3.2.1. Seção de Acompanhamento de Processos (SEACOP)',
  '1.5.4. Divisão de Coparticipação e Cobrança (DICOB)',
  '1.5.4.1. Setor de Auditoria de Contas (SEAC)',
  '1.5.4.2. Seção de Cobrança (SECOB)',
  '1.6. Diretoria de Saúde e Assistência (DISA)',
  '1.6.1. Assessoria Especial da Diretoria de Saúde e Assistência (ASESDISA)',
  '1.6.2. Diretoria Centralizada de Assistência e Benefícios (DABES)',
  '1.6.2.1. Divisão de Assistência Hospitalar e Benefícios (DABE)',
  '1.6.2.2. Divisão de Autorização e Atendimento (DIAU)',
  '1.6.2.2.1. Setor de Apoio a Credenciados Diretos (SEACRED)',
  '1.6.2.2.2. Setor de Apoio Operacional (SEAO)',
  '1.6.2.3. Divisão de Gestão da Assistência Domiciliar (DIGAD)',
  '1.6.2.3.1. Seção de Assistência Domiciliar (SEAD)',
  '1.6.2.4. Núcleo de Cadastro (NUCAD)',
  '1.6.2.4.1. Seção de Cadastro (SECAD)',
  '1.6.3. Diretoria Centralizada de Saúde (DICESA)',
  '1.6.3.1. Divisão de Auditoria e Perícias (DIAP)',
  '1.6.3.2. Supervisão de Regulação (SUREG)',
  '1.7. Diretoria Administrativa (DIAD)',
  '1.7.1. Diretoria Centralizada de Tecnologia e Inovação (DITEC)',
  '1.7.1.1. Assessoria Especial da Diretoria Centralizada de Tecnologia e Inovação (ASESDITE)',
  '1.7.1.2. Divisão de Suporte em Tecnologia da Informação (DISTI)',
  '1.7.1.2.1. Núcleo de Suporte aos Sistemas (NUSUP)',
  '1.7.1.3. Supervisão de Governança de Projetos e Sistemas (SUPROS)',
  '1.7.1.3.1. Núcleo de Soluções de Tecnologia da Informação (NUSOTI)',
  '1.7.2. Diretoria Centralizada de Credenciamentos e Contratos (DICRED)',
  '1.7.2.1. Divisão de Credenciamentos de Brasília e Alto Custo (DICREB)',
  '1.7.2.1.1. Núcleo de Negociações de Contratos de Brasília (NUNECB)',
  '1.7.2.2. Supervisão de Credenciamentos e Contratos nos Estados (SUCREN)',
  '1.7.2.2.1. Núcleo de Gestão de Contratos nos Estados (NUGECE)',
  '1.7.2.2.2. Núcleo de Negociação de Contratos nos Estados (NUNECE)',
  '1.8. Diretoria Regional Norte com sede no Pará (DIPLANN)',
  '1.8.1. Seção de Cadastro e Autorizações-N (SECAUN)',
  '1.8.2. Núcleo de Credenciamento-N (NUCREDN)',
  '1.8.3. Gerência Estadual no Amazonas (GEPLANAM)',
  '1.8.3.1. Seção de Apoio Técnico-Operacional-AM (SEATOPAM)',
  '1.8.4. Gerência Estadual em Rondônia (GEPLANRO)',
  '1.8.5. Núcleo Estadual no Acre (NUPLANAC)',
  '1.8.6. Núcleo Estadual no Amapá (NUPLANAP)',
  '1.8.7. Núcleo Estadual em Roraima (NUPLANRR)',
  '1.8.8. Núcleo Estadual em Tocantins (NUPLANTO)',
  '1.9. Diretoria Regional Nordeste com sede na Bahia (DIPLANNE)',
  '1.9.1. Seção de Cadastro e Autorizações-NE (SECAUNE)',
  '1.9.2. Núcleo de Credenciamentos-NE (NUCREDNE)',
  '1.9.3. Supervisão de Faturamentos-NE (SUFATNE)',
  '1.9.4. Gerência Estadual em Alagoas (GEPLANAL)',
  '1.9.5. Gerência Estadual na Bahia (GEPLANBA)',
  '1.9.5.1. Seção de Apoio Técnico-Operacional-BA (SEATOPBA)',
  '1.9.6. Gerência Estadual no Ceará (GEPLANCE)',
  '1.9.6.1. Seção de Apoio Técnico-Operacional-CE (SEATOPCE)',
  '1.9.7. Gerência Estadual no Maranhão (GEPLANMA)',
  '1.9.7.1. Seção de Apoio Técnico-Operacional-MA (SEATOPMA)',
  '1.9.8. Gerência Estadual na Paraíba (GEPLANPB)',
  '1.9.8.1. Seção de Apoio Técnico-Operacional-PB (SEATOPPB)',
  '1.9.9. Gerência Estadual em Pernambuco (GEPLANPE)',
  '1.9.9.1. Seção de Apoio Técnico-Operacional-PE (SEATOPPE)',
  '1.9.10. Gerência Estadual no Piauí (GEPLANPI)',
  '1.9.10.1. Seção de Apoio Técnico-Operacional-PI (SEATOPPI)',
  '1.9.11. Gerência Estadual no Rio Grande do Norte (GEPLANRN)',
  '1.9.12. Gerência Estadual no Sergipe (GEPLANSE)',
  '1.9.12.1. Seção de Apoio Técnico-Operacional-SE (SEATOPSE)',
  '1.10. Diretoria Regional Sudeste com sede no Rio de Janeiro (DIPLANSE)',
  '1.10.1. Seção de Cadastro e Autorizações-SE (SECAUSE)',
  '1.10.2. Núcleo de Credenciamentos-SE (NUCREDSE)',
  '1.10.3. Seção Técnica-SE (SETECSE)',
  '1.10.4. Supervisão de Faturamentos-SE (SUFATSE)',
  '1.10.5. Gerência Estadual no Espírito Santo (GEPLANES)',
  '1.10.5.1. Seção de Apoio Técnico-Operacional-ES (SEATOPES)',
  '1.10.6. Gerência Estadual em Minas Gerais (GEPLANMG)',
  '1.10.6.1. Seção de Apoio Técnico-Operacional-MG (SEATOPMG)',
  '1.11. Diretoria Regional Sul com sede no Rio Grande do Sul (DIPLANS)',
  '1.11.1. Seção de Cadastro e Autorizações-S (SECAUS)',
  '1.11.2. Núcleo de Credenciamentos-S (NUCREDS)',
  '1.11.3. Seção Técnica-S (SETECS)',
  '1.11.4. Supervisão de Faturamentos-S (SUFATS)',
  '1.11.5. Gerência Estadual no Paraná (GEPLANPR)',
  '1.11.5.1. Seção de Apoio Técnico-Operacional-PR (SEATOPPR)',
  '1.11.6. Gerência Estadual em Santa Catarina (GEPLANSC)',
  '1.11.6.1. Seção de Apoio Técnico-Operacional-SC (SEATOPSC)',
  '1.12. Diretoria Regional São Paulo com sede em São Paulo (DIPLANSP)',
  '1.12.1. Seção de Cadastro e Autorizações-SP (SECAUSP)',
  '1.12.2. Núcleo de Credenciamentos-SP (NUCREDSP)',
  '1.12.3. Seção Técnica-SP (SETECSP)',
  '1.12.4. Supervisão de Faturamentos-SP (SUFATSP)',
  '1.12.5. Núcleo Estadual em Campinas-SP (NUEPLANS)',
  '1.13. Coordenação Regional Centro-Oeste com sede em Goiás (COPLANCO)',
  '1.13.1. Seção de Cadastro e Autorizações-CO (SECAUCO)',
  '1.13.2. Gerência Estadual no Mato Grosso (GEPLANMT)',
  '1.13.3. Gerência Estadual no Mato Grosso do Sul (GEPLANMS)',
  '1.13.3.1. Seção de Apoio Técnico-Operacional-MS (SEATOPMS)',
]

const orgHierarchyContacts: Record<string, { name: string; email: string }> = {
  '1': { name: "Sônia Márcia Fernandes Amaral", email: "seplan-diretoria@mpu.mp.br" },
  '1.1': { name: "Cleiton Amaury da Cruz Dias", email: "cleitonamaury@mpf.mp.br" },
  '1.1.1': { name: "Gilberto Barros Santos", email: "gilbertobarros@mpu.mp.br" },
  '1.2': { name: "Claudio Luiz Ferreira de Oliveira", email: "claudiooliveira@mpf.mp.br" },
  '1.3': { name: "Gerson Sidnei Goncalves Junior", email: "gersonjunior@mpf.mp.br" },
  '1.4': { name: "Raimundo Francisco de Aguiar Sousa", email: "franciscoaguiar@mpf.mp.br" },
  '1.4.1': { name: "Helder Hey", email: "helderhey@mpf.mp.br" },
  '1.4.2': { name: "Marcos Wonder de Souza Mota", email: "marcosmota@mpf.mp.br" },
  '1.4.3': { name: "Rafael Lopes Cardozo de Castro", email: "rafaelcastro@mpf.mp.br" },
  '1.4.4': { name: "Laura Beatriz Araujo de Souza", email: "laurabeatriz@mpu.mp.br" },
  '1.5': { name: "Isabel Cristina Mendonça de Oliveira", email: "isabeloliveira@mpf.mp.br" },
  '1.5.1': { name: "Andre Brito de Sousa", email: "andrebrito@mpf.mp.br" },
  '1.5.2': { name: "Edilson Soares Neri", email: "edilsonsoares@mpf.mp.br" },
  '1.5.2.1': { name: "Edilson Soares Neri", email: "edilsonsoares@mpf.mp.br" },
  '1.5.2.2': { name: "Evandro Monteiro Gomes da Silva", email: "evandrogomes@mpf.mp.br" },
  '1.5.2.3': { name: "Marcio Guedes Cotrim da Silva", email: "marcioguedes@mpf.mp.br" },
  '1.5.3': { name: "Magna Maria dos Santos Nascimento", email: "magna@mpf.mp.br" },
  '1.5.3.1': { name: "Joelma Lopes Ribeiro", email: "joelmalopes@mpf.mp.br" },
  '1.5.3.1.1': { name: "Felipe Claudino de Almeida", email: "felipealmeida@mpf.mp.br" },
  '1.5.3.1.1.1': { name: "Gilvan Andre Ribeiro", email: "gilvanribeiro@mpf.mp.br" },
  '1.5.3.2': { name: "Cassiane Silvério Barros", email: "cassianebarros@mpf.mp.br" },
  '1.5.3.2.1': { name: "Lucas Costa da Silva Carvalho", email: "lucascarvalho@mpf.mp.br" },
  '1.5.4': { name: "Roberto Alves Pereira", email: "robertoalves@mpf.mp.br" },
  '1.5.4.1': { name: "Daniel Parronchi Valadares Carvalho", email: "danielc@mpf.mp.br" },
  '1.5.4.2': { name: "Pedro Gomes Moura Filho", email: "pedrogmoura@mpf.mp.br" },
  '1.6': { name: "Alexandre Teixeira de Oliveira", email: "alexandreteixeira@mpf.mp.br" },
  '1.6.1': { name: "Luciana do Nascimento Croner", email: "luciananascimento@mpf.mp.br" },
  '1.6.2': { name: "Paulo Jose Soares de Sousa", email: "paulosoares@mpf.mp.br" },
  '1.6.2.1': { name: "Andreza Goncalves Ferreira de Aguiar", email: "andreza@mpf.mp.br" },
  '1.6.2.2': { name: "Barbara Cristina Chagas de Aguiar", email: "barbaracchagas@mpf.mp.br" },
  '1.6.2.2.1': { name: "Anaelise Viana Castro Pires", email: "anaeliseviana@mpf.mp.br" },
  '1.6.2.2.2': { name: "Marcos Cunha Barbosa Lima", email: "marcoslima@mpf.mp.br" },
  '1.6.2.3': { name: "Gleice Carvalho Rodrigues", email: "gleicer@mpf.mp.br" },
  '1.6.2.3.1': { name: "Marcela Kathellyn Silva Alves Tozetti", email: "marcelatozetti@mpf.mp.br" },
  '1.6.2.4': { name: "William Rodrigues Gonçalves Estrêla", email: "williamestrela@mpf.mp.br" },
  '1.6.2.4.1': { name: "William Rodrigues Gonçalves Estrêla", email: "williamestrela@mpf.mp.br" },
  '1.6.3': { name: "Sandra Pereira Carrijo", email: "sandracarrijo@mpf.mp.br" },
  '1.6.3.1': { name: "Juliana Oliveira Lopes Sopko", email: "julianasopko@mpf.mp.br" },
  '1.6.3.2': { name: "Rizia Tayline Nunes Batistella", email: "riziatayline@mpu.mp.br" },
  '1.7': { name: "Herbert Dutra da Silva", email: "herbertdutra@mpu.mp.br" },
  '1.7.1': { name: "Luciana Maria de Araujo Freitas", email: "lucianafreitas@mpu.mp.br" },
  '1.7.1.1': { name: "Suzane Gonsaga Valentim Lima", email: "suzanevalentim@mpu.mp.br" },
  '1.7.1.2': { name: "Jose Carlos Watanabe da Silva", email: "josewatanabe@mpu.mp.br" },
  '1.7.1.2.1': { name: "Graciele Barbiero Fagundes Gomide", email: "gracielebarbiero@mpf.mp.br" },
  '1.7.1.3': { name: "Tiago da Costa Silva", email: "tiagocsilva@mpu.mp.br" },
  '1.7.1.3.1': { name: "Welder Rodrigues de Medeiros", email: "weldermedeiros@mpf.mp.br" },
  '1.7.2': { name: "Antonio Rogerio da Silva", email: "antoniorogerio@mpu.mp.br" },
  '1.7.2.1': { name: "Fabricio Ramos da Cruz", email: "rcfabricio@mpf.mp.br" },
  '1.7.2.1.1': { name: "Thiago Pereira Soares de Araujo", email: "thiagoaraujo@mpf.mp.br" },
  '1.7.2.2': { name: "Gessica Pacheco Camara", email: "gessicacamara@mpf.mp.br" },
  '1.7.2.2.1': { name: "Filipe Calderon Puerta de Noronha Picado", email: "filipecalderon@mpf.mp.br" },
  '1.7.2.2.2': { name: "Gessica Pacheco Camara", email: "gessicacamara@mpf.mp.br" },
  '1.8': { name: "Jader de Andrade Fernandes", email: "jaderfernandes@mpf.mp.br" },
  '1.8.1': { name: "Edineu da Silva Carvalheiro", email: "edineu@mpf.mp.br" },
  '1.8.2': { name: "Jader de Andrade Fernandes", email: "jaderfernandes@mpf.mp.br" },
  '1.8.3': { name: "Gabriel Bandeira Reboucas de Oliveira", email: "gabrielbandeira@mpf.mp.br" },
  '1.8.3.1': { name: "Vania Maria Pereira de Brito", email: "mariabrito@mpf.mp.br" },
  '1.8.4': { name: "Maria das Gracas Siqueira Gadelha", email: "gadelha@mpf.mp.br" },
  '1.8.5': { name: "Evelaine Luciana Coutinho  Lima dos Santos", email: "evelaineluciana@mpf.mp.br" },
  '1.8.6': { name: "Robert Wagner de Almeida Reis", email: "robertreis@mpf.mp.br" },
  '1.8.7': { name: "Analia Roxane Sales Llancafilo", email: "analiallancafilo@mpf.mp.br" },
  '1.8.8': { name: "Gracilane Vicente Aguiar", email: "gracilaneaguiar@mpf.mp.br" },
  '1.9': { name: "Sonia Telles da Cruz", email: "soniatelles@mpf.mp.br" },
  '1.9.1': { name: "Carlos Eduardo da Matta Costa", email: "carloscosta@mpf.mp.br" },
  '1.9.2': { name: "Marcelo Teixeira Azeredo", email: "marceloazeredo@mpf.mp.br" },
  '1.9.3': { name: "Leonardo Davi Bezerra de Lima Souza", email: "leonardols@mpf.mp.br" },
  '1.9.4': { name: "Jorge Daniel Braga Netto Costa", email: "jorgedcosta@mpf.mp.br" },
  '1.9.5': { name: "Marcia Sousa de Freitas", email: "marciasantos@mpf.mp.br" },
  '1.9.5.1': { name: "Eduardo Luz de Alencar Rocha", email: "eduardoluz@mpu.mp.br" },
  '1.9.6': { name: "Herbert Pereira Braga", email: "hbraga@mpf.mp.br" },
  '1.9.6.1': { name: "Paulo Sergio Martins Peres", email: "paulosergio@mpf.mp.br" },
  '1.9.7': { name: "Rubenilce Everton Diniz", email: "rubenilceediniz@mpf.mp.br" },
  '1.9.7.1': { name: "Joseane Costa da Silva", email: "joseanecosta@mpf.mp.br" },
  '1.9.8': { name: "Rogerio Virginio dos Santos", email: "rogeriovirginio@mpf.mp.br" },
  '1.9.8.1': { name: "Daniel dos Santos Nobrega", email: "danielnobrega@mpf.mp.br" },
  '1.9.9': { name: "Giselle Kelly Alves Ferreira", email: "gisellealves@mpf.mp.br" },
  '1.9.9.1': { name: "Alberto Leonardo Silva", email: "albertols@mpf.mp.br" },
  '1.9.10': { name: "Valdi Meneses Pimentel", email: "valdimpimentel@mpf.mp.br" },
  '1.9.10.1': { name: "Leidivan Nascimento Nunes", email: "leidivannascimento@mpf.mp.br" },
  '1.9.11': { name: "Rilvania Gomes de Menezes", email: "rilvania@mpf.mp.br" },
  '1.9.12': { name: "Naykson de Albuquerque Rodrigues", email: "nayksonrodrigues@mpf.mp.br" },
  '1.9.12.1': { name: "Gildo Vicente do Nascimento", email: "gildovnascimento@mpf.mp.br" },
  '1.10': { name: "Aline Maria Nogueira de Sousa Sarkis", email: "alinemaria@mpf.mp.br" },
  '1.10.1': { name: "Ana Paula Sales Barreto", email: "abarreto@mpf.mp.br" },
  '1.10.2': { name: "Sergio Nunes da Silva", email: "snsilva@mpf.mp.br" },
  '1.10.3': { name: "Marcia Sulair de Santa Rita", email: "marciasulair@mpu.mp.br" },
  '1.10.4': { name: "Josiane Silva de Carvalho", email: "josianecarvalho@mpu.mp.br" },
  '1.10.5': { name: "Dulciane Florencio Vieira", email: "dulcianevieira@mpf.mp.br" },
  '1.10.5.1': { name: "Claudio Antonio Faria da Silva", email: "claudioasilva@mpf.mp.br" },
  '1.10.6': { name: "Liz Flavia Chamon Oliveira", email: "lizchamon@mpf.mp.br" },
  '1.10.6.1': { name: "Fabio Honorato de Paula", email: "fabiohonorato@mpf.mp.br" },
  '1.11': { name: "Marcelo dos Santos Maidana", email: "maidana@mpf.mp.br" },
  '1.11.1': { name: "Neusa Maria Silveira Lehugeur", email: "neusamlehugeur@mpf.mp.br" },
  '1.11.2': { name: "Maristela Pagnussatt", email: "maristelapagnussatt@mpf.mp.br" },
  '1.11.3': { name: "Cirlei Salete Demarqui", email: "cirleidemarqui@mpf.mp.br" },
  '1.11.4': { name: "Marcio Francesco dos Santos Ferreira", email: "marciofrancesco@mpf.mp.br" },
  '1.11.5': { name: "Mario Cesar da Silva Secco", email: "mariosecco@mpf.mp.br" },
  '1.11.5.1': { name: "Marco Henrique Nadolny", email: "marcohenrique@mpf.mp.br" },
  '1.11.6': { name: "Sibelle Kiefer", email: "sibellekiefer@mpf.mp.br" },
  '1.11.6.1': { name: "Raphael Rollin Oliveira", email: "raphaeloliveira@mpf.mp.br" },
  '1.12': { name: "Rogerio Veiga Lima", email: "rogerioveiga@mpu.mp.br" },
  '1.12.1': { name: "Jamire Oliveira Silva Borges", email: "jamireborges@mpf.mp.br" },
  '1.12.2': { name: "Tania Cristina da Silveira", email: "tania@mpf.mp.br" },
  '1.12.3': { name: "Patricia Carla Rodrigues Lamunier", email: "patriciarodrigues@mpf.mp.br" },
  '1.12.4': { name: "Sergio Formenton Junior", email: "sergioformenton@mpf.mp.br" },
  '1.12.5': { name: "Simara Miranda Brito", email: "simaramiranda@mpf.mp.br" },
  '1.13': { name: "Jose Carlos Nicolau Bastos", email: "josebastos@mpf.mp.br" },
  '1.13.1': { name: "Maria Helena Damaso Vieira Breseghelo", email: "mariahelenadamaso@mpf.mp.br" },
  '1.13.2': { name: "Keila Rodrigues do Prado", email: "keilaprado@mpu.mp.br" },
  '1.13.3': { name: "Marcia Cristina Martins de Lima", email: "marcialima@mpf.mp.br" },
  '1.13.3.1': { name: "Ana Carolina Mastrangeli", email: "carolinamastrangeli@mpf.mp.br" },
}
type OrgHierarchyNode = {
  id: string
  label: string
  level: number
  children: OrgHierarchyNode[]
}

function parseHierarchyItem(item: string) {
  const id = item.match(/^\d+(?:\.\d+)*/)?.[0] || item
  const label = item.replace(/^\d+(?:\.\d+)*\.\s*/, '')
  const level = Math.max(1, id.split('.').filter(Boolean).length)

  return { id, label, level, children: [] as OrgHierarchyNode[] }
}

function buildHierarchy(items: string[]) {
  const roots: OrgHierarchyNode[] = []
  const stack: OrgHierarchyNode[] = []

  items.forEach((item) => {
    const node = parseHierarchyItem(item)
    while (stack.length >= node.level) stack.pop()

    const parent = stack[stack.length - 1]
    if (parent) parent.children.push(node)
    else roots.push(node)

    stack.push(node)
  })

  return roots
}

function getExpandableIds(nodes: OrgHierarchyNode[]): string[] {
  return nodes.flatMap((node) => [
    ...(node.children.length > 0 ? [node.id] : []),
    ...getExpandableIds(node.children),
  ])
}

const planAssisteArticles: PortalArticle[] = [
  {
    id: 'PORTAL-000001',
    title: 'Sobre o Plan-Assiste',
    navigationTitle: 'Sobre o Plan-Assiste',
    slug: 'sobre-o-plan-assiste',
    category: 'Institucional',
    summary:
      'Conheça a origem, a finalidade e a forma de atuação do Programa de Saúde e Assistência Social do Ministério Público da União.',
    icon: BookOpenCheck,
    sections: [
      {
        paragraphs: [
          'O **Plan-Assiste** é o **Programa de Saúde e Assistência Social do Ministério Público da União**. Organizado na modalidade de **autogestão, sem fins lucrativos**, integra a estrutura administrativa do MPU e oferece um conjunto de ações, serviços e benefícios sociais voltados à assistência à saúde.',
          'O Programa atende **membros, servidores, dependentes e pensionistas**, além dos demais públicos previstos no Regulamento Geral e nas normas complementares vigentes, com **abrangência nacional** e gestão orientada pela sustentabilidade, pela transparência e pelo cuidado humanizado.',
        ],
      },
      {
        title: 'Como o Programa atua',
        paragraphs: [
          'A atuação combina **prevenção, promoção e recuperação da saúde**, assistência médico-hospitalar, paramédica, ambulatorial e odontológica, além de benefícios sociais previstos nas regras do Programa.',
          'As regras de inscrição, permanência, desligamento, utilização dos serviços, coberturas, reembolsos e recursos administrativos devem ser consultadas no **Regulamento Geral**, nas **Normas Complementares** e nos conteúdos específicos do portal.',
        ],
      },
      {
        title: 'Como consultar regras e orientações',
        paragraphs: [
          'O portal organiza as informações por públicos e temas para facilitar a consulta. Conteúdos institucionais explicam a finalidade e a governança do Programa; as páginas de beneficiários e credenciados reúnem orientações práticas; e a seção de normas concentra os atos que sustentam as regras vigentes.',
          'Para situações concretas, consulte sempre o conteúdo correspondente e a norma aplicável, pois os resumos do portal servem como orientação inicial e não substituem o texto normativo.',
        ],
      },
      {
        title: 'Missão, visão e valores',
        cards: [
          {
            title: 'Missão',
            text:
              'Promover assistência em saúde e cuidar de vidas associadas ao MPU em todo o Brasil, oferecendo recursos efetivos para prevenção e tratamento.',
          },
          {
            title: 'Visão',
            text:
              'Ser referência em assistência à saúde integral para os beneficiários, promovendo prevenção, inovação e bem-estar.',
          },
          {
            title: 'Valores',
            text:
              'Cuidado humanizado, excelência no atendimento, transparência, sustentabilidade e confiança orientam a experiência de atendimento e a gestão do Programa.',
          },
        ],
      },
      {
        title: 'Princípios de atuação',
        bullets: [
          '**autogestão sem finalidade lucrativa**;',
          '**solidariedade entre beneficiários**;',
          '**atendimento humanizado e qualificado**;',
          '**uso responsável dos recursos assistenciais**;',
          '**transparência, continuidade administrativa e sustentabilidade**.',
        ],
      },
    ],
  },
  {
    id: 'PORTAL-000003',
    title: 'Nossa marca',
    navigationTitle: 'Nossa marca',
    slug: 'nossa-marca',
    category: 'Institucional',
    summary:
      'Entenda a renovação da identidade visual do Plan-Assiste MPU e o conceito que orienta a nova marca.',
    icon: ShieldCheck,
    sections: [
      {
        paragraphs: [
          'Em **2022**, quando completou **30 anos**, o Plan-Assiste renovou sua identidade visual para acompanhar o amadurecimento do Programa e a unificação das estruturas administrativas no âmbito do MPU.',
          'A marca reforça as ideias de **evolução, integração e cuidado humanizado**. O símbolo reúne quatro elementos que apontam para o centro, representando os ramos do Ministério Público da União e a convergência para um único Plan-Assiste MPU.',
        ],
      },
      {
        title: 'Conceito criativo',
        paragraphs: [
          'A nova marca ressignifica a cruz, tradicionalmente associada à saúde, e a transforma em uma composição mais ampla. O conjunto também remete a uma estrela, destacando excelência, unidade e aperfeiçoamento contínuo.',
          'Para uso institucional da marca, a orientação é entrar em contato com a equipe responsável pela comunicação do Plan-Assiste.',
        ],
      },
      {
        title: 'Logomarca colorida',
        paragraphs: [
          'A versão colorida é a aplicação preferencial da marca em fundos claros e materiais institucionais do portal.',
        ],
        image: {
          src: '/assets/logo-colorida.svg',
          alt: 'Logomarca colorida do Plan-Assiste MPU',
          variant: 'brand',
        },
        actions: [
          {
            label: 'Baixar logomarca colorida',
            href: '/assets/logo-colorida.svg',
            download: 'logo-colorida-plan-assiste.svg',
          },
        ],
      },
      {
        title: 'Logomarca branca',
        paragraphs: [
          'A versão branca deve ser utilizada em fundos escuros ou em situações nas quais a versão colorida não ofereça contraste adequado.',
        ],
        image: {
          src: '/assets/logo-branca.svg',
          alt: 'Logomarca branca do Plan-Assiste MPU',
          variant: 'brand-dark',
        },
        actions: [
          {
            label: 'Baixar logomarca branca',
            href: '/assets/logo-branca.svg',
            download: 'logo-branca-plan-assiste.svg',
          },
        ],
      },
      {
        title: 'Manual de aplicação da marca',
        paragraphs: [
          'Consulte o manual para aplicar a marca corretamente em materiais institucionais, peças digitais e documentos do Plan-Assiste.',
        ],
        actions: [
          {
            label: 'Baixar manual de aplicação da marca',
            href: '/assets/marca/manual-de-marca.pdf',
            download: 'manual-de-marca-plan-assiste.pdf',
          },
        ],
      },
    ],
  },
  {
    id: 'PORTAL-000003A',
    title: 'Estrutura e Governança do Plan-Assiste',
    navigationTitle: 'Estrutura e Governança',
    slug: 'estrutura-e-governanca',
    category: 'Institucional',
    summary:
      'Entenda como o Plan-Assiste se organiza e qual é a função geral dos principais órgãos e unidades do Programa.',
    icon: UsersRound,
    sections: [
      {
        paragraphs: [
          'O Plan-Assiste possui uma estrutura administrativa voltada a atividades de **deliberação, gestão, fiscalização, execução e assessoramento técnico** do Programa.',
          'Essa organização separa decisões estratégicas, diretrizes de gestão, acompanhamento fiscal, execução administrativa e apoio técnico especializado.',
        ],
      },
      {
        title: 'Como a governança se distribui',
        paragraphs: [
          'A estrutura do Programa reúne órgãos e unidades com funções diferentes. Em termos gerais, há instâncias voltadas à deliberação, à definição de diretrizes, à fiscalização econômico-financeira, à execução das atividades e ao assessoramento técnico.',
        ],
      },
      {
        title: 'Órgãos e unidades principais',
        bullets: [
          '**Conselho Deliberativo:** órgão máximo do Plan-Assiste, associado às decisões superiores do Programa e à deliberação sobre matérias submetidas pelas instâncias de gestão.',
          '**Conselho Gestor:** atua subordinado ao Conselho Deliberativo, estabelece políticas e diretrizes de gestão, aprecia propostas da Diretoria Executiva Colegiada e emite Normas Complementares necessárias ao funcionamento do Programa.',
          '**Conselho Fiscal:** fiscaliza a gestão administrativa e econômico-financeira, acompanhando demonstrativos, relatórios e atos de gestão.',
          '**Diretoria Executiva Colegiada:** atua no planejamento, na organização, na direção, no monitoramento e na execução das atividades do Plan-Assiste.',
          '**Câmara Técnica de Saúde:** unidade de assessoramento técnico especializado do Programa.',
        ],
      },
      {
        title: 'Papel da Seplan',
        paragraphs: [
          'A Secretaria do Programa de Saúde e Assistência Social do Ministério Público da União (Seplan) é uma unidade orgânica nacional subordinada à Secretaria-Geral do MPU.',
          'Compete à Seplan planejar, organizar, dirigir e monitorar tecnicamente as unidades administrativas do Programa em todo o país, coordenando a estrutura administrativa do Plan-Assiste em âmbito nacional.',
        ],
      },
      {
        title: 'Onde consultar as competências detalhadas',
        paragraphs: [
          'As competências e atribuições detalhadas dos órgãos e unidades devem ser consultadas nas normas vigentes do Plan-Assiste.',
          'O [Regulamento Geral](/plan-assiste/regulamento-geral) apresenta a estrutura administrativa do Programa, enquanto o [Regimento Interno da Seplan](/plan-assiste/regimento-interno) detalha a organização e o funcionamento da Secretaria.',
        ],
      },
    ],
  },
  {
    id: 'PORTAL-000004',
    title: 'Quem pode aderir?',
    navigationTitle: 'Quem pode aderir?',
    slug: 'quem-pode-aderir',
    category: 'Beneficiários',
    summary:
      'Veja os públicos que podem participar do Plan-Assiste como titulares, dependentes ou beneficiários especiais.',
    icon: Heart,
    sections: [
      {
        paragraphs: [
          'A participação no Plan-Assiste depende da condição do interessado e dos requisitos definidos no [Regulamento Geral](/plan-assiste/regulamento-geral) e nas [Normas Complementares](/plan-assiste/normas-complementares). As categorias de participação são **titular, dependente e beneficiário especial**.',
        ],
      },
      {
        title: 'Na condição de titular',
        bullets: [
          'membros e servidores ativos e inativos;',
          'servidores requisitados pelo Ministério Público da União para exercício de cargo em comissão ou função de confiança;',
          'servidores sem vínculo com a Administração Pública nomeados pelo Ministério Público da União, desde que em exercício de cargo em comissão;',
          'beneficiários de pensão civil.',
        ],
      },
      {
        title: 'Na condição de dependente',
        bullets: [
          'cônjuge ou companheiro(a);',
          'filhos e enteados até 21 anos de idade ou, se estudantes, até 24 anos;',
          'pessoas sob guarda ou tutela judicial do titular;',
          'pai, padrasto, mãe ou madrasta que constem como dependentes ou pensionistas na declaração de imposto de renda do titular, observadas as restrições vigentes.',
        ],
      },
      {
        title: 'Na condição de beneficiário especial',
        bullets: [
          'filhos e enteados entre 21 e 38 anos;',
          'ex-guardados ou ex-tutelados solteiros, sem rendimentos, entre 21 e 24 anos, estudantes de curso regular reconhecido pelo MEC;',
          'pessoas sob curatela judicial do titular que vivam sob sua dependência econômica, observadas as restrições de novas inscrições;',
          'filhos e enteados acima de 38 anos, solteiros e dependentes economicamente do titular, conforme regras e restrições vigentes.',
        ],
      },
      {
        title: 'Orientação',
        paragraphs: [
          'Este resumo ajuda a identificar a categoria de participação, mas não substitui a consulta às normas aplicáveis nem a análise da documentação exigida para inscrição ou permanência no Programa.',
        ],
      },
    ],
  },
  {
    id: 'PORTAL-000004A',
    title: 'Por que optar pelo Plan-Assiste?',
    navigationTitle: 'Por que optar pelo Plan-Assiste?',
    slug: 'beneficiarios/por-que-optar-pelo-plan-assiste',
    category: 'Beneficiários',
    summary: 'Conheça as principais vantagens de utilizar a assistência oferecida pelo Plan-Assiste.',
    icon: BadgeCheck,
    sections: [
      {
        title: 'Cuidado e segurança',
        paragraphs: [
          'O Plan-Assiste reúne **serviços de assistência à saúde** e orientações para beneficiários e seus dependentes.',
        ],
      },
      {
        title: 'Serviços integrados',
        paragraphs: [
          'A **rede credenciada, as carteirinhas e os principais serviços** podem ser consultados pelos canais oficiais do Programa.',
        ],
      },
    ],
  },
  {
    id: 'PORTAL-000005',
    title: 'Torne-se beneficiário',
    navigationTitle: 'Torne-se beneficiário',
    slug: 'beneficiarios/torne-se-beneficiario',
    category: 'Beneficiários',
    summary:
      'Orientações para iniciar a adesão, conferir documentos e acompanhar os próximos passos com clareza.',
    icon: UserPlus,
    sections: [],
  },
  {
    id: 'PORTAL-000005A',
    title: '2ª via da carteirinha',
    navigationTitle: '2ª via da carteirinha',
    slug: 'beneficiarios/segunda-via-carteirinha',
    category: 'Beneficiários',
    summary:
      'Saiba como receber a carteirinha digital pelo contato cadastrado mesmo sem conseguir acessar a conta gov.br.',
    icon: IdCard,
    sections: [
      {
        title: 'Quando usar este serviço',
        paragraphs: [
          'A solicitação pública de **2ª via da carteirinha digital** foi pensada para o beneficiário que não consegue acessar a Área do beneficiário pela conta gov.br.',
          'Quem estiver autenticado também pode consultar, baixar, imprimir e compartilhar suas carteirinhas na página Carteirinhas da Área do beneficiário.',
        ],
      },
      {
        title: 'Dados necessários',
        bullets: [
          'CPF do beneficiário;',
          'data de nascimento;',
          'e-mail previamente cadastrado;',
          'preenchimento do código de verificação (CAPTCHA).',
        ],
      },
      {
        title: 'Canal de envio',
        cards: [
          {
            title: 'E-mail cadastrado',
            text: 'A carteirinha pode ser encaminhada ao endereço de e-mail registrado no cadastro do beneficiário. O Portal não exibe nem permite alterar esse endereço durante a solicitação pública.',
          },
        ],
      },
      {
        title: 'Proteção dos dados',
        paragraphs: [
          'A resposta do serviço não confirma publicamente a existência do CPF e não mostra partes do e-mail ou do telefone. Os dados informados são usados somente para localizar o cadastro e processar o envio solicitado.',
        ],
      },
      {
        cards: [
          {
            title: 'Solicitar 2ª via',
            text: 'Acesse o formulário público para solicitar o envio ao e-mail cadastrado.',
            to: '/?servico=segunda-via-carteirinha',
            actionLabel: 'Iniciar solicitação',
          },
        ],
      },
    ],
  },
  {
    id: 'PORTAL-000005B',
    title: 'Orientações sobre EPS',
    navigationTitle: 'Orientações sobre EPS',
    slug: 'beneficiarios/orientacoes-sobre-eps',
    category: 'Beneficiários',
    summary: 'Consulte informações gerais sobre elegibilidade, cobertura, utilização dos serviços e canais de apoio.',
    icon: HeartPulse,
    sections: [
      {
        title: 'Conheça as regras',
        paragraphs: [
          'As condições de utilização devem ser consultadas no [Regulamento Geral](/plan-assiste/regulamento-geral), nas [Normas Complementares](/plan-assiste/normas-complementares) e nos conteúdos específicos do Portal.',
        ],
      },
      {
        title: 'Use os serviços corretos',
        paragraphs: [
          'Solicitações, autorizações, reembolsos e documentos devem ser encaminhados pela área correspondente.',
        ],
      },
      {
        title: 'Fale com o suporte',
        paragraphs: [
          'Quando houver dúvida concreta, confirme requisitos e documentos nos canais oficiais de atendimento.',
        ],
      },
    ],
  },
  {
    id: 'PORTAL-000005C',
    title: 'Posso obter a carteirinha física?',
    navigationTitle: 'Carteirinha física',
    slug: 'beneficiarios/carteirinha-fisica',
    category: 'Beneficiários',
    summary: 'Embora o uso da carteirinha digital seja o mais comum, consulte como solicitar uma versão física.',
    icon: IdCard,
    sections: [
      {
        title: 'Disponibilidade',
        paragraphs: [
          'A **carteirinha digital** é a opção principal para identificação, mas a **versão física** pode ser disponibilizada conforme as orientações do Programa.',
        ],
      },
      {
        title: 'Como solicitar',
        paragraphs: [
          'Consulte os canais oficiais de atendimento para confirmar requisitos, forma de envio e prazo estimado.',
        ],
      },
    ],
  },
  {
    id: 'PORTAL-000005D',
    title: 'Problemas com a carteirinha?',
    navigationTitle: 'Problemas com a carteirinha?',
    slug: 'beneficiarios/problemas-com-a-carteirinha',
    category: 'Beneficiários',
    summary: 'Veja como solicitar ajuda quando a carteirinha estiver indisponível ou apresentar informações incorretas.',
    icon: HelpCircle,
    sections: [
      {
        title: 'Antes de solicitar ajuda',
        paragraphs: [
          'Confira **seus dados cadastrais, a validade da carteirinha e o perfil utilizado no acesso**.',
        ],
      },
      {
        title: 'Atendimento',
        paragraphs: [
          'Se o problema continuar, informe o ocorrido pelos canais oficiais para receber a orientação adequada.',
        ],
      },
    ],
  },
  {
    id: 'PORTAL-000006',
    title: 'Tipos de redes',
    navigationTitle: 'Tipos de redes',
    slug: 'beneficiarios/tipos-de-redes',
    category: 'Beneficiários',
    summary: 'Conheça a diferença entre as redes convencional, intermediária e de alto custo.',
    icon: Building2,
    sections: [
      { title: 'Conheça a diferença entre as redes', paragraphs: ['A rede credenciada direta é organizada em três categorias: **rede convencional, rede intermediária e rede de alto custo**. Essa classificação ajuda o beneficiário a compreender as opções disponíveis antes de escolher onde será atendido.'] },
      { title: 'Rede convencional', paragraphs: ['Reúne credenciados com condições contratuais que normalmente resultam no menor percentual de coparticipação entre as três categorias.'] },
      { title: 'Rede intermediária', paragraphs: ['Reúne credenciados cujas condições de atendimento normalmente resultam em percentual moderado de coparticipação.'] },
      { title: 'Rede de alto custo', paragraphs: ['Reúne credenciados cujos valores contratados normalmente resultam no maior percentual de coparticipação. Antes do atendimento, consulte os percentuais aplicáveis e confirme a classificação do credenciado.'] },
      { cards: [{ title: 'Percentuais de coparticipação', text: 'Consulte os percentuais aplicáveis a cada tipo de rede.', to: '/plan-assiste/beneficiarios/percentuais-de-coparticipacao', actionLabel: 'Consultar percentuais' }] },
    ],
  },
  {
    id: 'PORTAL-000006A',
    title: 'Percentuais de coparticipação',
    navigationTitle: 'Percentuais de coparticipação',
    slug: 'beneficiarios/percentuais-de-coparticipacao',
    category: 'Beneficiários',
    summary: 'Conheça a diferença entre as redes e consulte como a classificação do credenciado influencia a coparticipação.',
    icon: FileText,
    sections: [
      { title: 'Conheça a diferença entre as redes', paragraphs: ['Os **percentuais de coparticipação** podem variar de acordo com o tipo de rede do credenciado. Consulte também a página [Tipos de redes](/plan-assiste/beneficiarios/tipos-de-redes) para conhecer as categorias convencional, intermediária e de alto custo.'] },
      { title: 'Antes do atendimento', bullets: ['confirme o tipo de rede indicado no cadastro do credenciado;', 'consulte a tabela de coparticipação vigente;', 'em caso de dúvida, utilize os canais oficiais do Plan-Assiste antes de realizar o procedimento.'] },
    ],
  },
  {
    id: 'PORTAL-000006AUT',
    title: 'Autorizações',
    navigationTitle: 'Autorizações',
    slug: 'beneficiarios/autorizacoes',
    category: 'Beneficiários',
    summary: 'Consulte quando a autorização é necessária, os documentos relacionados e as regras aplicáveis a cada tratamento.',
    icon: ClipboardCheck,
    sections: [
      {
        paragraphs: [
          'As orientações abaixo reúnem as principais regras para solicitações de autorização. Consulte sempre a versão vigente das [Normas Complementares](/plan-assiste/normas-complementares).',
          'O acompanhamento dos pedidos é feito em **Minhas solicitações**. O beneficiário também recebe notificações conforme a demanda avança. Os links para solicitar autorização direcionam à Área do beneficiário e exigem autenticação.',
        ],
      },
      {
        title: 'Cirurgia eletiva',
        cards: [{ title: 'Cirurgia Eletiva', text: 'Anexe o pedido ou relatório médico, os laudos de exames e os demais documentos relacionados ao diagnóstico.', to: '/beneficiario/servicos/autorizacao-cirurgia/nova-solicitacao', actionLabel: 'Solicitar autorização' }],
      },
      {
        title: 'Tratamentos seriados',
        cards: [
          { title: 'Acupuntura', text: 'A Norma Complementar nº 30 limita o tratamento a 40 sessões por ano civil e prevê perícia quando os limites semanais forem ultrapassados.', to: '/beneficiario/servicos/acupuntura/nova-solicitacao', actionLabel: 'Solicitar autorização' },
          { title: 'Fisioterapia', text: 'A Norma Complementar nº 30 prevê perícia preliminar quando a solicitação superar duas sessões semanais ou 40 anuais por tipo de tratamento.', to: '/beneficiario/servicos/fisioterapia/nova-solicitacao', actionLabel: 'Solicitar autorização' },
          { title: 'Fonoaudiologia', text: 'A Norma Complementar nº 30 prevê perícia acima dos limites de frequência e exige relatório com diagnóstico e tempo de tratamento.', to: '/beneficiario/servicos/fonoaudiologia/nova-solicitacao', actionLabel: 'Solicitar autorização' },
          { title: 'Psicologia', text: 'A Norma Complementar nº 30 prevê perícia preliminar quando a solicitação superar duas sessões semanais ou 40 anuais.', to: '/beneficiario/servicos/psicologia/nova-solicitacao', actionLabel: 'Solicitar autorização' },
          { title: 'Terapia ocupacional', text: 'A Norma Complementar nº 30 prevê perícia preliminar quando a solicitação superar duas sessões semanais ou 40 anuais.', to: '/beneficiario/servicos/terapia-ocupacional/nova-solicitacao', actionLabel: 'Solicitar autorização' },
          { title: 'Pilates', text: 'A Norma Complementar nº 30 estabelece atendimento por fisioterapeuta habilitado e limite de 40 sessões por ano civil, sem prorrogação.', to: '/beneficiario/servicos/pilates/nova-solicitacao', actionLabel: 'Solicitar autorização' },
          { title: 'Hidroterapia', text: 'A Norma Complementar nº 32 prevê perícia acima de duas sessões semanais, 40 anuais ou em casos de internação.', to: '/beneficiario/servicos/hidroterapia/nova-solicitacao', actionLabel: 'Solicitar autorização' },
          { title: 'RPG', text: 'A Norma Complementar nº 32 prevê perícia acima de duas sessões semanais, 40 anuais ou em casos de internação.', to: '/beneficiario/servicos/rpg/nova-solicitacao', actionLabel: 'Solicitar autorização' },
        ],
      },
      {
        title: 'Medicamentos',
        cards: [{ title: 'Medicamentos - Cobertura Direta', text: 'Solicite a cobertura direta de medicamentos informando o tipo de autorização e anexando o pedido ou relatório médico com os laudos de exames.', to: '/beneficiario/servicos/medicamentos-cobertura-direta/nova-solicitacao', actionLabel: 'Solicitar autorização' }],
      },
      {
        id: 'tratamento-odontologico',
        title: 'Tratamento odontológico',
        paragraphs: [
          'Em regra, o beneficiário não precisa solicitar autorização prévia ao Plan-Assiste: a liberação é conduzida diretamente pela clínica. As exceções incluem cirurgias ortognáticas e procedimentos específicos do Rol da ANS realizados por cirurgião-dentista em ambiente hospitalar.',
          'A coparticipação odontológica, com ou sem internação, é de 50%, conforme o Anexo V da Norma Complementar nº 34.',
        ],
      },
    ],
  },
  {
    id: 'PORTAL-000006B',
    title: 'Como se credenciar ou renovar',
    navigationTitle: 'Como se credenciar ou renovar',
    slug: 'como-se-credenciar-ou-renovar',
    category: 'Credenciados',
    summary:
      'Orientações para profissionais e instituições de saúde interessados em credenciamento ou renovação junto ao Plan-Assiste.',
    icon: FileText,
    sections: [
      {
        title: 'Credenciamento e renovação',
        paragraphs: [
          'O Plan-Assiste credencia **profissionais e instituições de saúde em todo o país** conforme o **Edital de Credenciamento nº 01/2023**. A mesma documentação básica é utilizada tanto em novos credenciamentos quanto na renovação de termos próximos ao vencimento.',
          'O acesso à área restrita do credenciado é destinado a quem já concluiu o credenciamento. Se você ainda não possui login, escolha **Pessoa Jurídica ou Pessoa Física**, reúna os documentos e envie a solicitação pelo **Protocolo Eletrônico do MPF**.',
        ],
        table: {
          headers: ['Etapa', 'O que fazer'],
          columnWidths: ['28%', '72%'],
          rows: [
            ['1. Escolha o perfil', 'Acesse Pessoa Jurídica ou Pessoa Física conforme a forma de prestação do serviço.'],
            ['2. Prepare os documentos', 'Baixe os modelos, assine os itens indicados e reúna os comprovantes exigidos.'],
            ['3. Envie a solicitação', 'Encaminhe toda a documentação pelo Protocolo Eletrônico do MPF.'],
            ['4. Acompanhe a análise', 'Responda a eventuais pedidos de complementação e aguarde o deferimento.'],
            ['5. Assine e obtenha acesso', 'Após o deferimento, assine o Termo de Credenciamento e aguarde as orientações de acesso ao portal.'],
          ],
        },
      },
      {
        title: 'Escolha a modalidade',
        paragraphs: [
          'Consulte a página correspondente ao seu perfil para conferir documentos, orientações de envio e etapas de análise.',
        ],
        cards: [
          {
            title: 'Pessoa Jurídica',
            text: 'Orientações para hospitais, clínicas, laboratórios e demais instituições de saúde interessadas em prestar serviços ao Plan-Assiste.',
            to: '/plan-assiste/como-se-credenciar-ou-renovar/pessoa-juridica',
          },
          {
            title: 'Pessoa Física',
            text: 'Orientações para profissionais de saúde autônomos interessados em solicitar credenciamento junto ao Programa.',
            to: '/plan-assiste/como-se-credenciar-ou-renovar/pessoa-fisica',
          },
        ],
      },
      {
        title: 'Especialidades cobertas',
        paragraphs: [
          'O credenciamento contempla especialidades médicas, paramédicas e odontológicas previstas nas regras do Programa.',
        ],
        bullets: [
          'Especialidades Médicas: acupuntura, alergologia, anatomia patológica e citopatologia, anestesiologia, angiologia e cirurgia vascular, cardiologia, cirurgia geral, cirurgia da mão, cirurgia de cabeça e pescoço, cirurgia do aparelho digestivo, cirurgia endocrinológica, cirurgia pediátrica, cirurgia plástica reparadora, cirurgia torácica, clínica médica, dermatologia, endocrinologia, endoscopia digestiva, gastroenterologia, geriatria e gerontologia, ginecologia e obstetrícia, hematologia, hepatologia, homeopatia, infectologia, mastologia, medicina nuclear, nefrologia, neurocirurgia, neurologia, oftalmologia, oncologia, ortopedia e traumatologia, otorrinolaringologia, patologia clínica, pediatria, pneumologia, proctologia, psiquiatria, radiodiagnóstico, radioterapia, reumatologia, tisiopneumologia, tomografia computadorizada, ultrassonografia e urologia.',
          'Especialidades Paramédicas: fisioterapia, fonoaudiologia, medicina física e reabilitação, nutrição, psicologia, terapia ocupacional, RPG, hidroterapia e pilates.',
          'Especialidades Odontológicas: diagnose e vistoria, radiologia, testes e exames de laboratório, prevenção, cirurgia, dentística, endodontia, odontopediatria, periodontia, prótese e urgências.',
        ],
        bulletsAsTable: true,
      },
      {
        title: 'Orientação ao credenciado',
        paragraphs: [
          'Antes de encaminhar a solicitação, confira o edital, selecione corretamente a modalidade de credenciamento e mantenha os documentos atualizados. O deferimento depende da análise documental e da assinatura do Termo de Credenciamento pelas partes.',
        ],
        linkedBullets: [
          {
            text: 'Edital de Credenciamento nº 01/2023',
            label: 'baixar edital',
            href: '/assets/normas/edital-credenciamento-2023.pdf',
            download: 'edital-credenciamento-2023.pdf',
          },
        ],
      },
    ],
  },
  {
    id: 'PORTAL-000006A',
    title: 'Credenciamento de Pessoa Jurídica',
    navigationTitle: 'Pessoa Jurídica',
    slug: 'como-se-credenciar-ou-renovar/pessoa-juridica',
    category: 'Credenciados',
    summary:
      'Documentos e orientações para instituições de saúde interessadas em credenciamento junto ao Plan-Assiste.',
    icon: Building2,
    sections: [
      {
        paragraphs: [
          'O credenciamento de **Pessoa Jurídica** atende hospitais, clínicas, laboratórios e demais instituições de saúde que desejam compor a rede do Plan-Assiste.',
          'A documentação deve ser enviada **exclusivamente pelo Protocolo Eletrônico do MPF** para a unidade da Federação onde a instituição pretende prestar os serviços, conforme o tutorial e o **Edital de Credenciamento nº 01/2023**.',
          '**Anexe cada documento separadamente e na sequência apresentada abaixo.** Não reúna toda a documentação em um único arquivo PDF.',
        ],
      },
      {
        title: 'Documentos principais',
        linkedBullets: [
          {
            text: 'solicitação de credenciamento;',
            href: '/assets/prestadores/credenciamento/pj/formulario-solicitacao-credenciamento-pessoa-juridica.pdf',
            download: 'formulario-solicitacao-credenciamento-pessoa-juridica.pdf',
            label: 'baixar solicitação',
            signatureRequired: true,
          },
          {
            text: 'ficha cadastral e dados bancários;',
            href: '/assets/prestadores/credenciamento/pj/ficha-cadastral-dados-bancarios-pessoa-juridica.pdf',
            download: 'ficha-cadastral-dados-bancarios-pessoa-juridica.pdf',
            label: 'baixar ficha',
            signatureRequired: true,
          },
          {
            text: 'carta proposta com os serviços prestados;',
            href: '/assets/prestadores/credenciamento/pj/carta-proposta-pessoa-juridica.odt',
            download: 'carta-proposta-pessoa-juridica.odt',
            label: 'baixar carta',
            signatureRequired: true,
          },
          { text: 'alvará ou licença de funcionamento;' },
          { text: 'alvará ou licença sanitária;' },
          { text: 'regularidade da instituição junto ao respectivo conselho de classe;' },
          { text: 'contrato social, estatuto ou alterações;' },
          {
            text: 'inscrição no CNPJ;',
            href: 'https://servicos.receita.fazenda.gov.br/servicos/cnpjreva/cnpjreva_solicitacao.asp',
            external: true,
            label: 'consultar',
          },
          { text: 'RG do representante legal;' },
          { text: 'CPF do representante legal;' },
          {
            text: 'certidão negativa do FGTS atualizada;',
            href: 'https://consulta-crf.caixa.gov.br/consultacrf/pages/consultaEmpregador.jsf',
            external: true,
            label: 'emitir',
          },
          {
            text: 'certidão conjunta de débitos relativos a tributos federais e à dívida ativa da União atualizada;',
            href: 'https://servicos.receita.fazenda.gov.br/Servicos/certidaointernet/PJ/Emitir',
            external: true,
            label: 'emitir',
          },
          {
            text: 'certidão negativa de débitos trabalhistas;',
            href: 'https://www.tst.jus.br/certidao1',
            external: true,
            label: 'emitir',
          },
          {
            text: 'relação de membros do corpo clínico;',
            href: '/assets/prestadores/credenciamento/pj/relacao-membros-corpo-clinico.xlsx',
            download: 'relacao-membros-corpo-clinico.xlsx',
            label: 'baixar modelo',
            signatureRequired: true,
          },
          { text: 'certificados de especialistas e registros nos conselhos de classe dos profissionais indicados;' },
          { text: 'currículo do responsável técnico;' },
          { text: 'RG do responsável técnico;' },
          { text: 'CPF do responsável técnico;' },
          { text: 'registro no respectivo conselho de classe do responsável técnico;' },
          { text: 'Odontologia – título de especialista;' },
          { text: 'Radiologia – título de especialista;' },
          { text: 'Fisioterapia, Fonoaudiologia, Psicologia e Nutrição – cópia do diploma e registro no conselho;' },
          { text: 'RPG, Hidroterapia e Pilates – diploma de graduação em Fisioterapia, título de especialista na área pretendida e registro no conselho.' },
        ],
      },
      {
        title: 'Análise e assinatura',
        paragraphs: [
          'Documentação incompleta, rasurada ou em desacordo com o edital poderá ser considerada inapta. Nesse caso, o interessado poderá apresentar novos documentos sem as irregularidades identificadas.',
          'Após a análise documental e o deferimento, o Termo de Credenciamento será assinado pelas partes. O credenciado receberá um e-mail informando que o termo está disponível e deverá assiná-lo, por meio do Sistema de Peticionamento Eletrônico do MPF, com seus representantes legais.',
        ],
        linkedBullets: [
          {
            text: 'tutorial oficial de envio de documentos para pessoa jurídica;',
            href: 'https://planassiste.mpu.mp.br/prestadores/credenciamento/docs-pj/tutorial-envio-de-documentos-para-credenciamento-pessoa-juridica',
            external: true,
            label: 'abrir',
          },
          {
            text: 'Edital de Credenciamento nº 01/2023.',
            href: '/assets/normas/edital-credenciamento-2023.pdf',
            download: 'edital-credenciamento-2023.pdf',
            label: 'baixar',
          },
        ],
        actions: [
          {
            label: 'Acessar o Protocolo Eletrônico do MPF',
            href: 'https://www.mpf.mp.br/mpfservicos/protocolo',
            external: true,
          },
        ],
      },
    ],
  },
  {
    id: 'PORTAL-000006B',
    title: 'Credenciamento de Pessoa Física',
    navigationTitle: 'Pessoa Física',
    slug: 'como-se-credenciar-ou-renovar/pessoa-fisica',
    category: 'Credenciados',
    summary:
      'Documentos e orientações para profissionais de saúde interessados em credenciamento junto ao Plan-Assiste.',
    icon: UserPlus,
    sections: [
      {
        paragraphs: [
          'O credenciamento de **Pessoa Física** é destinado a profissionais de saúde que desejam prestar atendimento aos beneficiários do Plan-Assiste na sua área de atuação.',
          'A solicitação deve ser encaminhada **exclusivamente pelo Protocolo Eletrônico do MPF** para a unidade da Federação onde o profissional pretende prestar os serviços, observando o tutorial e o **Edital de Credenciamento nº 01/2023**.',
          '**Envie os documentos na sequência apresentada abaixo e mantenha os originais disponíveis.** O Plan-Assiste poderá solicitar sua apresentação, substituição ou reapresentação durante a análise.',
        ],
      },
      {
        title: 'Documentos principais',
        linkedBullets: [
          {
            text: 'solicitação de credenciamento;',
            href: '/assets/prestadores/credenciamento/pf/formulario-solicitacao-credenciamento-pessoa-fisica.pdf',
            download: 'formulario-solicitacao-credenciamento-pessoa-fisica.pdf',
            label: 'baixar solicitação',
            signatureRequired: true,
          },
          {
            text: 'ficha cadastral e dados bancários;',
            href: '/assets/prestadores/credenciamento/pf/ficha-cadastral-dados-bancarios-pessoa-fisica.pdf',
            download: 'ficha-cadastral-dados-bancarios-pessoa-fisica.pdf',
            label: 'baixar ficha',
            signatureRequired: true,
          },
          {
            text: 'carta proposta com os serviços prestados;',
            href: '/assets/prestadores/credenciamento/pf/carta-proposta-pessoa-fisica.odt',
            download: 'carta-proposta-pessoa-fisica.odt',
            label: 'baixar carta',
            signatureRequired: true,
          },
          { text: 'alvará ou licença de funcionamento;' },
          { text: 'alvará ou licença sanitária;' },
          { text: 'regularidade do profissional junto ao respectivo conselho de classe;' },
          { text: 'curriculum vitae;' },
          { text: 'RG;' },
          { text: 'CPF;' },
          { text: 'registro no respectivo conselho de classe;' },
          {
            text: 'certidão negativa da Receita Federal atualizada;',
            href: 'http://servicos.receita.fazenda.gov.br/Servicos/certidaointernet/PF/Emitir',
            external: true,
            label: 'emitir',
          },
          {
            text: 'certidão negativa de débitos trabalhistas atualizada;',
            href: 'https://www.tst.jus.br/certidao1',
            external: true,
            label: 'emitir',
          },
          { text: 'inscrição no INSS, PIS ou PASEP;' },
          { text: 'inscrição no ISS, quando aplicável;' },
          { text: 'comprovante de residência ou de estabelecimento comercial;' },
          { text: 'Odontologia – título de especialista;' },
          { text: 'Fisioterapia, Fonoaudiologia, Psicologia, Terapia Ocupacional e Nutrição – cópia do diploma e registro no conselho;' },
          { text: 'Medicina – título de especialista ou comprovação de residência para a área pretendida;' },
          { text: 'RPG, Hidroterapia e Pilates – diploma de graduação em Fisioterapia, título de especialista na área pretendida e registro no conselho.' },
        ],
      },
      {
        title: 'Análise e assinatura',
        paragraphs: [
          'Documentação incompleta, rasurada ou em desacordo com o edital poderá ser considerada inapta. O credenciado deve acompanhar as comunicações do Plan-Assiste e responder eventuais solicitações de complementação.',
          'Após a análise e o deferimento, o Termo de Credenciamento será assinado pelas partes. O credenciado receberá um e-mail quando o termo estiver disponível e deverá assiná-lo por meio do Sistema de Peticionamento Eletrônico do MPF.',
        ],
        linkedBullets: [
          {
            text: 'tutorial oficial de envio de documentos para pessoa física;',
            href: 'https://planassiste.mpu.mp.br/prestadores/credenciamento/docs-pf/tutorial-envio-de-documentos-para-credenciamento-pessoa-fisica',
            external: true,
            label: 'abrir',
          },
          {
            text: 'Edital de Credenciamento nº 01/2023.',
            href: '/assets/normas/edital-credenciamento-2023.pdf',
            download: 'edital-credenciamento-2023.pdf',
            label: 'baixar',
          },
        ],
        actions: [
          {
            label: 'Acessar o Protocolo Eletrônico do MPF',
            href: 'https://www.mpf.mp.br/mpfservicos/protocolo',
            external: true,
          },
        ],
      },
    ],
  },
  {
    id: 'PORTAL-000006C',
    title: 'Tabelas de serviços',
    navigationTitle: 'Tabelas de serviços',
    slug: 'tabelas-de-servicos',
    category: 'Credenciados',
    summary:
      'Consulte tabelas de serviços médicos, paramédicos, hospitalares, odontológicos, diárias e taxas aplicáveis aos credenciados.',
    icon: ClipboardCheck,
    sections: [
      {
        paragraphs: [
          'As tabelas reúnem os **valores e as referências aplicáveis aos serviços médicos, paramédicos, hospitalares e odontológicos**, além de diárias e taxas. Elas orientam os credenciados e permitem que profissionais e instituições ainda não credenciados conheçam as condições de remuneração e avaliem o interesse em integrar a rede do Plan-Assiste.',
        ],
      },
      {
        title: 'Serviços médicos, paramédicos e hospitalares',
        paragraphs: [
          'A **TABJUDMPU** é a tabela de referência para remuneração de honorários médicos e SADT no Distrito Federal nos credenciamentos celebrados após a publicação do Edital nº 01/2023. A versão de 2025 possui valores válidos desde 01/03/2025.',
        ],
        actions: [
          {
            label: 'Acessar TABJUDMPU 2025',
            href: 'https://planassiste.mpu.mp.br/prestadores/credenciamento/tabelas/docs-servicos-medicos/tabjudmpu-2025-tabela-de-referencia-para-convenios-e-credenciamentos-atualizada-em-14_05_2025',
            external: true,
          },
        ],
      },
      {
        paragraphs: [
          'Esta seção também reúne tabelas próprias de procedimentos médicos, paramédicos e fisioterápicos disponibilizadas na área de credenciamento do Plan-Assiste.',
        ],
        actions: [
          {
            label: 'Tabela de procedimentos fisioterápicos',
            href: '/assets/prestadores/tabelas/tabela-propria-procedimentos-fisioterapicos.pdf',
            download: 'tabela-propria-procedimentos-fisioterapicos.pdf',
          },
          {
            label: 'Comunicado nº 01/2026 – valores de CHP e CHO',
            href: '/assets/prestadores/tabelas/comunicado-01-2026-valores-chp-cho.pdf',
            download: 'comunicado-01-2026-valores-chp-cho.pdf',
          },
        ],
      },
      {
        title: 'Serviços odontológicos',
        paragraphs: [
          'Lista de procedimentos odontológicos utilizada como referência para serviços prestados no âmbito do Plan-Assiste.',
        ],
        actions: [
          {
            label: 'Lista de procedimentos odontológicos',
            href: '/assets/prestadores/tabelas/lista-procedimentos-odontologicos-2016.pdf',
            download: 'lista-procedimentos-odontologicos-2016.pdf',
          },
        ],
      },
      {
        title: 'Diárias e taxas',
        paragraphs: [
          'As tabelas de diárias, taxas e gases medicinais variam conforme a data do credenciamento, a classificação hospitalar e o tipo de credenciado.',
          'A classificação dos hospitais tipo A, B e C é realizada pela empresa de auditoria responsável pela vistoria das instalações.',
        ],
        actions: [
          {
            label: 'Baixar tabela própria de diárias e taxas',
            href: '/assets/prestadores/tabelas/tabela-propria-diarias-e-taxas.pdf',
            download: 'tabela-propria-diarias-e-taxas.pdf',
          },
        ],
      },
      {
        title: 'Tipos de tabela',
        paragraphs: [
          'Para credenciamentos celebrados no Distrito Federal após o Edital de Credenciamento nº 01/2023, utilize a tabela correspondente à classificação do hospital ou ao tipo de credenciado.',
        ],
        cards: [
          {
            title: 'Hospital tipo A',
            text: 'Tabela aplicável aos credenciamentos celebrados no Distrito Federal após o Edital de Credenciamento nº 01/2023 para hospitais classificados como tipo A.',
            bullets: [
              'abrange taxas, diárias e gases medicinais;',
              'valores válidos a partir de 01/03/2026;',
              'inclui também a tabela de referência anterior, quando necessária para consulta histórica.',
            ],
            actions: [
              {
                label: 'Tipo A - 2026',
                href: '/assets/prestadores/tabelas/taxas-diarias-hospital-tipo-a-2026-03-01.xls',
                download: 'taxas-diarias-hospital-tipo-a-2026-03-01.xls',
              },
              {
                label: 'Tipo A - referência 2021',
                href: '/assets/prestadores/tabelas/tabjudmpu-2013-taxas-diarias-hospital-tipo-a-2021.xls',
                download: 'tabjudmpu-2013-taxas-diarias-hospital-tipo-a-2021.xls',
              },
            ],
          },
          {
            title: 'Hospital tipo B',
            text: 'Tabela aplicável aos credenciamentos celebrados no Distrito Federal após o Edital de Credenciamento nº 01/2023 para hospitais classificados como tipo B.',
            bullets: [
              'abrange taxas, diárias e gases medicinais;',
              'valores válidos a partir de 01/03/2026;',
              'inclui também a tabela de referência anterior, quando necessária para consulta histórica.',
            ],
            actions: [
              {
                label: 'Tipo B - 2026',
                href: '/assets/prestadores/tabelas/taxas-diarias-hospital-tipo-b-2026-03-01.xls',
                download: 'taxas-diarias-hospital-tipo-b-2026-03-01.xls',
              },
              {
                label: 'Tipo B - referência 2021',
                href: '/assets/prestadores/tabelas/tabjudmpu-2013-taxas-diarias-hospital-tipo-b-2021.xls',
                download: 'tabjudmpu-2013-taxas-diarias-hospital-tipo-b-2021.xls',
              },
            ],
          },
          {
            title: 'Hospital tipo C',
            text: 'Tabela aplicável aos credenciamentos celebrados no Distrito Federal após o Edital de Credenciamento nº 01/2023 para hospitais classificados como tipo C e para os demais credenciados médicos.',
            bullets: [
              'abrange taxas, diárias e gases medicinais;',
              'valores válidos a partir de 01/03/2026;',
              'serve também como referência para credenciados médicos não enquadrados nos tipos hospitalares A ou B.',
            ],
            actions: [
              {
                label: 'Tipo C - 2026',
                href: '/assets/prestadores/tabelas/taxas-diarias-tipo-c-2026-03-01.xls',
                download: 'taxas-diarias-tipo-c-2026-03-01.xls',
              },
              {
                label: 'Tipo C - referência 2021',
                href: '/assets/prestadores/tabelas/tabjudmpu-2013-taxas-diarias-hospital-tipo-c-2021.xls',
                download: 'tabjudmpu-2013-taxas-diarias-hospital-tipo-c-2021.xls',
              },
            ],
          },
        ],
      },
      {
        title: 'Instruções de uso',
        paragraphs: [
          'Consulte as instruções oficiais para compreender a forma de aplicação das tabelas de taxas e diárias dos tipos A, B e C.',
        ],
        actions: [
          {
            label: 'Baixar instruções das tabelas',
            href: '/assets/prestadores/tabelas/instrucoes-tabelas-taxas-diarias-tipos-a-b-c.pdf',
            download: 'instrucoes-tabelas-taxas-diarias-tipos-a-b-c.pdf',
          },
        ],
      },
    ],
  },
  {
    id: 'PORTAL-000007',
    title: 'Conselho Deliberativo',
    navigationTitle: 'Conselho Deliberativo',
    slug: 'conselho-deliberativo',
    category: 'Gestão',
    summary:
      'Conheça a instância superior do Plan-Assiste, responsável por deliberações estratégicas do Programa.',
    icon: UsersRound,
    sections: [
      {
        title: 'Competência',
        paragraphs: [
          'Compete ao **Conselho Deliberativo** aprovar propostas de alteração do [Regulamento Geral](/plan-assiste/regulamento-geral) apresentadas pelo Conselho Gestor, julgar recursos em última instância e determinar políticas de saúde pertinentes ao âmbito do MPU.',
        ],
      },
      {
        title: 'Composição',
        table: {
          headers: ['Representação', 'Integrante'],
          columnWidths: ['42%', '58%'],
          rows: [
            ['Ministério Público Federal', 'Procurador-Geral da República'],
            ['Ministério Público do Trabalho', 'Procurador-Geral do Ministério Público do Trabalho'],
            ['Ministério Público Militar', 'Procurador-Geral de Justiça do Ministério Público Militar'],
            ['Ministério Público do Distrito Federal e Territórios', 'Procurador-Geral de Justiça do Ministério Público do Distrito Federal e Territórios'],
          ],
        },
      },
    ],
  },
  {
    id: 'PORTAL-000008',
    title: 'Conselho Gestor',
    navigationTitle: 'Conselho Gestor',
    slug: 'conselho-gestor',
    category: 'Gestão',
    summary:
      'Entenda o papel do Conselho Gestor na definição de diretrizes e no acompanhamento da gestão do Programa.',
    icon: UsersRound,
    sections: [
      {
        paragraphs: [
          'O **Conselho Gestor** é uma das instâncias centrais de governança do Plan-Assiste. Atua na apreciação de propostas da Diretoria Executiva Colegiada, na análise de pleitos de beneficiários e na definição de diretrizes administrativas, assistenciais e financeiras do Programa.',
          'Suas deliberações são aprovadas por maioria absoluta dos votos de seus membros. Em caso de empate, prevalece o voto do Presidente.',
        ],
      },
      {
        title: 'Competência',
        bullets: [
          'apreciar propostas da Diretoria Executiva Colegiada;',
          'apreciar e decidir pleitos dos beneficiários encaminhados pela Diretoria Executiva Colegiada;',
          'aprovar o plano anual de trabalho e o planejamento estratégico do Programa;',
          'emitir Normas Complementares necessárias ao cumprimento do Regulamento Geral, quando necessário com apoio técnico da Câmara Técnica de Saúde e da Diretoria Atuarial;',
          'solicitar pareceres e estudos da Câmara Técnica de Saúde e da Diretoria Atuarial;',
          'aprovar o relatório anual de gestão da Diretoria Executiva Colegiada;',
          'aprovar os demonstrativos contábeis do Plan-Assiste, após manifestação do Conselho Fiscal;',
          'nomear representantes da Câmara Técnica de Saúde e integrantes do Conselho Fiscal;',
          'fixar critérios para credenciamento e descredenciamento de credenciados de serviço;',
          'fixar o rol de procedimentos e eventos em saúde cobertos pelo Programa;',
          'fixar o rol de abrangência de beneficiários titulares, dependentes e beneficiários especiais;',
          'aprovar tabelas próprias de credenciamento de serviços médicos, paramédicos e odontológicos;',
          'verificar a eficiência e a eficácia da gestão dos recursos do Plan-Assiste;',
          'aprovar a nomeação e a destituição dos integrantes da Diretoria Executiva Colegiada;',
          'executar ou determinar a execução de decisões do Conselho Deliberativo.',
        ],
      },
      {
        title: 'Composição',
        table: {
          headers: ['Representação', 'Integrante', 'Observação'],
          columnWidths: ['33.333%', '33.333%', '33.334%'],
          rows: [
            ['MPF', 'Eliana Peres Torelly de Carvalho', 'Secretária-Geral do Ministério Público da União'],
            ['MPT', 'João Batista Machado Júnior', 'Diretor-Geral do Ministério Público do Trabalho'],
            ['MPM', 'Antonio Carlos Alves Coutinho', 'Diretor-Geral do Ministério Público Militar'],
            ['MPDFT', 'Claudia Braga Tomelin', 'Secretária-Geral do Ministério Público do Distrito Federal e Territórios'],
            ['Entidades de classe de membros do MPU', 'José Gomes Riberto Schettino', 'Titular, Presidente da Associação Nacional dos Procuradores da República (ANPR)'],
            ['Entidades de classe de membros do MPU', 'Adriana Augusta de Moura Souza', 'Suplente, Presidente da Associação Nacional dos Procuradores e das Procuradoras do Trabalho (ANPT)'],
            ['Entidades de classe de membros do MPU', 'Karel Ozon Monfort Couri Raad', 'Titular, Presidente da Associação do Ministério Público do Distrito Federal e Territórios (AMPDFT)'],
            ['Entidades de classe de membros do MPU', 'Nelson Lacava Filho', 'Suplente, Presidente da Associação Nacional do Ministério Público Militar (ANMP)'],
            ['Associações nacionais de servidores do MPU', 'Elber Ferreira Marques e Daniela Lopes Mendes', 'Titular e suplente'],
            ['Sindicatos nacionais de servidores do MPU', 'Renato Cantoni', 'Titular'],
            ['AUDIN/MPU', 'Ronaldo da Silva Pereira', 'Auditor-chefe do Ministério Público da União, participante ouvinte sem direito a voto'],
            ['SPOC/MPU', 'Ionara Oliveira Cardoso Oliveira Cruz', 'Secretária de Planejamento, Orçamento e Contabilidade, participante ouvinte sem direito a voto'],
          ],
        },
      },
      {
        title: 'Contato',
        paragraphs: ['Demandas direcionadas ao Conselho Gestor podem ser encaminhadas para seplan-gabdepam@mpu.mp.br ou pelo telefone (61) 3212-8520.'],
      },
    ],
  },
  {
    id: 'PORTAL-000009',
    title: 'Conselho Fiscal',
    navigationTitle: 'Conselho Fiscal',
    slug: 'conselho-fiscal',
    category: 'Gestão',
    summary:
      'Conheça a composição e as atribuições da instância responsável pelo acompanhamento fiscal do Plan-Assiste.',
    icon: UsersRound,
    sections: [
      {
        paragraphs: [
          'O **Conselho Fiscal** acompanha a gestão administrativa e econômico-financeira do Plan-Assiste. Atualmente, é composto por dez integrantes, entre titulares e suplentes, nomeados para mandatos bianuais.',
          'A composição combina representantes indicados pela Administração dos quatro ramos do MPU e representantes eleitos diretamente pelos beneficiários titulares.',
        ],
      },
      {
        title: 'Constituição',
        bullets: [
          'um representante do Ministério Público Federal;',
          'um representante do Ministério Público do Trabalho;',
          'um representante do Ministério Público Militar;',
          'um representante do Ministério Público do Distrito Federal e Territórios;',
          'um representante dos membros do MPU, escolhido por eleição direta entre os beneficiários do Plan-Assiste;',
          'um representante dos servidores do MPU, escolhido por eleição direta entre os beneficiários do Plan-Assiste.',
        ],
      },
      {
        title: 'Integrantes atuais',
        table: {
          headers: ['Forma de nomeação', 'Conselheiro', 'Cargo', 'Mandato'],
          columnWidths: ['36%', '27%', '12%', '25%'],
          rows: [
            ['Indicação do MPF', 'Helton Demetrio de Barros', 'Titular', '30/06/2025 a 29/06/2027'],
            ['Indicação do MPF', 'Rodrigo Neves Rocha', 'Suplente', '30/06/2025 a 29/06/2027'],
            ['Indicação do MPM', 'Antonio Delnair de Lacerda', 'Titular', '30/06/2025 a 29/06/2027'],
            ['Indicação do MPM', 'Elaine Aparecida da Silva', 'Suplente', '30/06/2025 a 29/06/2027'],
            ['Indicação do MPT', 'Aliomar Athayde Cavalcante Filho', 'Titular', '30/06/2025 a 29/06/2027'],
            ['Indicação do MPT', 'Fernand Carlo de Souza Neris', 'Suplente', '30/06/2025 a 29/06/2027'],
            ['Indicação do MPDFT', 'Santiago Moreira Magalhães', 'Titular', '30/06/2025 a 29/06/2027'],
            ['Indicação do MPDFT', 'João Bosco Carbonesi', 'Suplente', '30/06/2025 a 29/06/2027'],
            ['Eleição direta dos representantes dos servidores', 'Pedro Bezerra da Silva Filho', 'Titular', '17/06/2026 a 16/06/2028'],
            ['Eleição direta dos representantes dos servidores', 'Edmilson Enedino das Chagas', 'Suplente', '17/06/2026 a 16/06/2028'],
          ],
        },
      },
      {
        title: 'Competência',
        bullets: [
          'emitir, anualmente, parecer conclusivo sobre as demonstrações contábeis do Plan-Assiste;',
          'emitir, anualmente, parecer sobre o relatório anual de gestão da Diretoria Executiva Colegiada;',
          'examinar e emitir, semestralmente, parecer sobre demonstrativos contábeis e financeiros;',
          'avaliar e emitir, semestralmente, parecer sobre o equilíbrio financeiro entre receitas e despesas realizadas nos últimos doze meses;',
          'apresentar sugestões para aprimorar controles internos e atos de gestão da Diretoria Executiva Colegiada;',
          'solicitar ao Conselho Gestor esclarecimentos e informações necessários ao desempenho de suas atribuições.',
        ],
      },
    ],
  },
  {
    id: 'PORTAL-000010',
    title: 'Câmara Técnica de Saúde',
    navigationTitle: 'Câmara Técnica de Saúde',
    slug: 'camara-tecnica-de-saude',
    category: 'Gestão',
    summary:
      'Veja como a Câmara Técnica apoia decisões sobre cobertura assistencial e temas complexos de saúde.',
    icon: UsersRound,
    sections: [
      {
        paragraphs: [
          'A **Câmara Técnica de Saúde** é a instância técnica do Plan-Assiste voltada à análise de temas assistenciais, cobertura em saúde, casos complexos e matérias que demandem avaliação especializada.',
          'Sua atuação apoia o Conselho Gestor e a Diretoria Executiva Colegiada na tomada de decisões sobre procedimentos, políticas e temas correlatos à cobertura assistencial.',
        ],
      },
      {
        title: 'Competência',
        bullets: [
          'definir critérios técnicos sobre procedimentos não cobertos pelo Programa;',
          'deliberar sobre questões específicas em casos complexos ou de alto custo;',
          'atuar como instância consultiva e propositiva na formulação de políticas de saúde a serem desenvolvidas pelo Ministério Público da União;',
          'emitir parecer quanto à inclusão ou exclusão de procedimento médico, odontológico ou de outras áreas de saúde no rol de procedimentos cobertos pelo Plan-Assiste;',
          'emitir, quando demandada pelo Conselho Gestor ou pela Diretoria Executiva Colegiada, pareceres e manifestações sobre temas correlatos à cobertura assistencial do Plan-Assiste.',
        ],
      },
      {
        title: 'Composição',
        table: {
          headers: ['Representação', 'Integrante'],
          columnWidths: ['50%', '50%'],
          rows: [
            ['Secretaria de Serviços Integrados de Saúde do MPF', 'Secretário da Secretaria de Serviços Integrados de Saúde do Ministério Público Federal'],
            ['Ministério Público Federal', 'Um representante do MPF'],
            ['Ministério Público do Trabalho', 'Um representante do MPT'],
            ['Ministério Público do Distrito Federal e Territórios', 'Um representante do MPDFT'],
            ['Ministério Público Militar', 'Um representante do MPM'],
          ],
        },
      },
    ],
  },
  {
    id: 'PORTAL-000011',
    title: 'Diretoria Executiva Colegiada do Plan-Assiste MPU',
    navigationTitle: 'Diretoria Executiva Colegiada',
    slug: 'diretoria-executiva-colegiada',
    category: 'Gestão',
    summary:
      'Conheça a instância responsável pelo planejamento, direção, monitoramento e execução das atividades do Programa.',
    icon: UsersRound,
    sections: [
      {
        paragraphs: [
          'A **Diretoria Executiva Colegiada** reúne a direção executiva e as áreas responsáveis pela condução administrativa, atuarial, assistencial, orçamentária e financeira do Plan-Assiste MPU.',
          'A instância coordena a execução das atividades do Programa e articula as diretorias responsáveis pela gestão cotidiana dos serviços, processos e recursos.',
        ],
      },
      {
        title: 'Composição',
        table: {
          headers: ['Nome', 'Cargo', 'Telefone', 'E-mail'],
          columnWidths: ['28%', '30%', '16%', '26%'],
          rows: [
            ['Sônia Márcia Fernandes Amaral', 'Diretora Executiva', '(61) 3212-8520', 'seplan-diretoria@mpu.mp.br'],
            ['Sandra Cristina de Araújo', 'Diretora Executiva Adjunta', '(61) 3212-8520', 'seplan-gabinete@mpu.mp.br'],
            ['Raimundo Francisco de Aguiar Sousa', 'Diretor Atuarial', '(61) 3212-8581', 'seplan-diat@mpu.mp.br'],
            ['Alexandre Teixeira de Oliveira', 'Diretor de Saúde e Assistência', '(61) 3212-8523', 'seplan-disa@mpu.mp.br'],
            ['Isabel Cristina Mendonça de Oliveira', 'Diretora de Orçamento e Finanças', '(61) 3212-8524', 'seplan-diof@mpu.mp.br'],
            ['Herbert Dutra da Silva', 'Diretor Administrativo', '(61) 3212-8544', 'seplan-diad@mpu.mp.br'],
          ],
        },
      },
    ],
  },
  {
    id: 'PORTAL-000012',
    title: 'Organograma',
    navigationTitle: 'Organograma',
    slug: 'organograma',
    category: 'Gestão',
    summary:
      'Visualize, em formato organizado, a relação entre as instâncias de governança e execução do Plan-Assiste.',
    icon: UsersRound,
    sections: [
      {
        paragraphs: [
          'O **organograma** apresenta a relação entre direção superior, conselhos de deliberação e fiscalização, execução administrativa e assessoramento técnico do Plan-Assiste.',
        ],
      },
      {
        title: 'Estrutura administrativa',
        hierarchy: seplanHierarchy,
      },
    ],
  },
  {
    id: 'PORTAL-000013',
    title: 'Plano de Gerenciamento de Riscos, de Integridade e de Controles Internos',
    navigationTitle: 'Plano de riscos e integridade',
    slug: 'plano-de-riscos-integridade-e-controles',
    category: 'Gestão',
    summary:
      'Entenda a proposta do plano voltado ao gerenciamento de riscos, integridade e controles internos do Programa.',
    icon: ShieldCheck,
    sections: [
      {
        paragraphs: [
          'A **gestão baseada em riscos** busca antecipar cenários, lidar melhor com incertezas e fortalecer a capacidade institucional de resposta. No Plan-Assiste, essa diretriz orienta controles internos, integridade e uso responsável dos recursos.',
          'O plano propõe uma estrutura de implementação de atividades de controle e gerenciamento de riscos para apoiar a gestão do Programa.',
        ],
        actions: [
          {
            label: 'Baixar Plano de Gerenciamento de Riscos',
            href: '/assets/normas/plano-gerenciamento-riscos-integridade-controles-internos.pdf',
            download: 'plano-gerenciamento-riscos-integridade-controles-internos.pdf',
          },
        ],
      },
      {
        title: 'Objetivos',
        bullets: [
          'aumentar a capacidade de lidar com incertezas;',
          'estimular a transparência;',
          'contribuir para o uso eficiente, eficaz e efetivo de recursos;',
          'fortalecer a imagem institucional do Programa.',
        ],
      },
    ],
  },
  {
    id: 'PORTAL-000014',
    title: 'Regulamento Geral',
    navigationTitle: 'Regulamento Geral',
    slug: 'regulamento-geral',
    category: 'Normas',
    summary:
      'Conheça a norma estruturante do Plan-Assiste e as portarias que aprovaram ou alteraram o Regulamento Geral.',
    icon: Scale,
    sections: [
      {
        paragraphs: [
          'O **Regulamento Geral** reúne as regras fundamentais do Plan-Assiste. Ele organiza conceitos, finalidade, estrutura administrativa, participação dos beneficiários, fontes de custeio, direitos, deveres e diretrizes gerais de funcionamento.',
          'As [Normas Complementares](/plan-assiste/normas-complementares) disciplinam matérias específicas e devem ser lidas em conjunto com o Regulamento, especialmente quando houver anexos, alterações, revogações ou versões consolidadas.',
        ],
      },
      {
        title: 'Em resumo',
        bullets: [
          'O Regulamento Geral apresenta a base normativa do Programa;',
          'as Normas Complementares detalham temas específicos, como credenciamento, reembolso, assistência farmacológica, perícias, contribuições e recursos administrativos;',
          'para situações concretas, consulte o conteúdo correspondente no portal e o texto vigente da norma relacionada ao tema;',
          'os resumos do portal não substituem a leitura do ato normativo, de seus anexos e de eventuais alterações.',
        ],
      },
      {
        title: 'Normas vigentes em destaque',
        bullets: [
          'Regulamento Geral do Plan-Assiste MPU consolidado, em vigor a partir de 22 de agosto de 2023;',
          'Portaria PGR/MPU nº 167, de 22 de agosto de 2023, que alterou dispositivos do Regulamento Geral;',
          'Portaria PGR/MPU nº 94, de 5 de junho de 2023, que aprovou o Regulamento Geral do Programa.',
        ],
        actions: [
          {
            label: 'Baixar Regulamento Geral consolidado',
            href: '/assets/normas/regulamento-geral/regulamento-geral-consolidado.pdf',
            download: 'regulamento-geral-plan-assiste-consolidado.pdf',
          },
          {
            label: 'Baixar Portaria PGR/MPU nº 167/2023',
            href: '/assets/normas/regulamento-geral/portaria-pgr-mpu-167-2023.pdf',
            download: 'portaria-pgr-mpu-167-2023.pdf',
          },
          {
            label: 'Baixar Portaria PGR/MPU nº 94/2023',
            href: '/assets/normas/regulamento-geral/portaria-pgr-mpu-94-2023.pdf',
            download: 'portaria-pgr-mpu-94-2023.pdf',
          },
        ],
      },
    ],
  },
  {
    id: 'PORTAL-000015',
    title: 'Normas Complementares',
    navigationTitle: 'Normas Complementares',
    slug: 'normas-complementares',
    category: 'Normas',
    summary:
      'Consulte as Normas Complementares vigentes do Plan-Assiste, suas datas de publicação e os temas que disciplinam.',
    icon: FileText,
    sections: [
      {
        paragraphs: [
          'As **Normas Complementares** detalham matérias específicas previstas no [Regulamento Geral](/plan-assiste/regulamento-geral) e orientam benefícios, coberturas, credenciamento, custeio e rotinas administrativas. A relação abaixo reúne os atos vigentes, com data de publicação, síntese do objeto e acesso ao documento integral hospedado neste portal.',
          'As normas que alteram atos anteriores estão identificadas para facilitar a consulta conjunta. Os anexos disponíveis estão reunidos após as tabelas.',
        ],
      },
      {
        title: '2013',
        table: {
          headers: ['Norma', 'Publicação', 'Assunto', 'Arquivo'],
          columnWidths: ['13%', '15%', '57%', '15%'],
          rows: [
            ['NC nº 10', '16/09/2013', 'Credenciamento de profissionais e instituições de saúde.'],
          ],
          downloads: [{ href: '/assets/normas/normas-complementares/nc-10.pdf', download: 'norma-complementar-10.pdf' }],
        },
      },
      {
        title: '2021',
        table: {
          headers: ['Norma', 'Publicação', 'Assunto', 'Arquivo'],
          columnWidths: ['13%', '15%', '57%', '15%'],
          rows: [
            ['NC nº 22', '30/12/2021', 'Altera a Norma Complementar nº 20.'],
          ],
          downloads: [{ href: '/assets/normas/normas-complementares/nc-22.pdf', download: 'norma-complementar-22.pdf' }],
        },
      },
      {
        title: '2022',
        table: {
          headers: ['Norma', 'Publicação', 'Assunto', 'Arquivo'],
          columnWidths: ['13%', '15%', '57%', '15%'],
          rows: [
            ['NC nº 23', '19/10/2022', 'Reserva de Contingência, Provisão de Eventos Ocorridos e Não Avisados (PEONA) e aplicação dos recursos próprios do Plan-Assiste.'],
            ['NC nº 25', '21/10/2022', 'Altera a Norma Complementar nº 20.'],
          ],
          downloads: [
            { href: '/assets/normas/normas-complementares/nc-23.pdf', download: 'norma-complementar-23.pdf' },
            { href: '/assets/normas/normas-complementares/nc-25.pdf', download: 'norma-complementar-25.pdf' },
          ],
        },
      },
      {
        title: '2023',
        table: {
          headers: ['Norma', 'Publicação', 'Assunto', 'Arquivo'],
          columnWidths: ['13%', '15%', '57%', '15%'],
          rows: [
            ['NC nº 27', '27/07/2023', 'Programa de Atenção Domiciliar.'],
            ['NC nº 28', '27/07/2023', 'Tratamento cirúrgico para obesidade grave e procedimentos mamários reparadores.'],
            ['NC nº 29', '27/07/2023', 'Assistência farmacológica e auxílio para aquisição de medicamentos de alto custo e de uso contínuo.'],
            ['NC nº 30', '27/07/2023', 'Assistência paramédica e acupuntura.'],
            ['NC nº 31', '27/07/2023', 'Auxílio para órteses e próteses não cirúrgicas, transporte de paciente e transporte e diária de acompanhante.'],
            ['NC nº 32', '15/02/2023', 'Exames técnicos e perícias médicas e odontológicas.'],
            ['NC nº 33', '27/07/2023', 'Liquidação de dívida de coparticipação quando ocorre o desligamento do beneficiário titular.'],
            ['NC nº 34', '27/07/2023', 'Beneficiários, contribuições mensais, coparticipação e atendimento na rede de alto custo. Possui sete anexos.'],
          ],
          downloads: [27, 28, 29, 30, 31, 32, 33, 34].map((number) => ({ href: `/assets/normas/normas-complementares/nc-${number}.pdf`, download: `norma-complementar-${number}.pdf` })),
        },
      },
      {
        title: '2024',
        table: {
          headers: ['Norma', 'Publicação', 'Assunto', 'Arquivo'],
          columnWidths: ['13%', '15%', '57%', '15%'],
          rows: [
            ['NC nº 37', '05/12/2024', 'Tratamentos relacionados a Transtorno do Espectro Autista (TEA), Síndrome de Down (SD) e Paralisia Cerebral (PC).'],
            ['NC nº 38', '05/09/2024', 'Altera a Norma Complementar nº 34, com anexos sobre dependência e declaração de estado civil.'],
          ],
          downloads: [37, 38].map((number) => ({ href: `/assets/normas/normas-complementares/nc-${number}.pdf`, download: `norma-complementar-${number}.pdf` })),
        },
      },
      {
        title: '2025',
        table: {
          headers: ['Norma', 'Publicação', 'Assunto', 'Arquivo'],
          columnWidths: ['13%', '15%', '57%', '15%'],
          rows: [
            ['NC nº 39', '10/03/2025', 'Cobertura de procedimentos de cirurgia robótica.'],
            ['NC nº 40', '10/03/2025', 'Cobertura de tratamentos para Hiperplasia Benigna de Próstata.'],
            ['NC nº 41', '10/04/2025', 'Critérios e valores para reembolso na modalidade de livre escolha. Possui seis anexos.'],
            ['NC nº 42', '13/03/2025', 'Altera a Norma Complementar nº 34.'],
            ['NC nº 43', '13/03/2025', 'Altera a Norma Complementar nº 33.'],
            ['NC nº 44', '01/04/2025', 'Altera regras de contribuição, coparticipação e atendimento na rede de alto custo da Norma Complementar nº 34.'],
            ['NC nº 45', '18/03/2025', 'Requerimentos e recursos administrativos no âmbito do Plan-Assiste.'],
            ['NC nº 46', '04/07/2025', 'Altera a Norma Complementar nº 44.'],
          ],
          downloads: [39, 40, 41, 42, 43, 44, 45, 46].map((number) => ({ href: `/assets/normas/normas-complementares/nc-${number}.pdf`, download: `norma-complementar-${number}.pdf` })),
        },
      },
      {
        title: '2026',
        table: {
          headers: ['Norma', 'Publicação', 'Assunto', 'Arquivo'],
          columnWidths: ['13%', '15%', '57%', '15%'],
          rows: [
            ['NC nº 47', '07/04/2026', 'Altera a Norma Complementar nº 34.'],
            ['NC nº 49', '07/04/2026', 'Altera a Norma Complementar nº 33 para reajustar o recolhimento mensal ao Fundo Garantidor de Cobertura de Saldo Devedor de Coparticipação (FGC).'],
            ['NC nº 50', '08/06/2026', 'Altera a Norma Complementar nº 41, relativa ao reembolso na modalidade de livre escolha.'],
          ],
          downloads: [47, 49, 50].map((number) => ({ href: `/assets/normas/normas-complementares/nc-${number}.pdf`, download: `norma-complementar-${number}.pdf` })),
        },
      },
      {
        title: 'Anexos das normas vigentes',
        linkedBullets: [
          ...[1, 2, 3, 4, 5, 6, 7].map((number) => ({ text: `NC nº 34 — Anexo ${number}`, href: `/assets/normas/normas-complementares/nc-34-anexo-${number}.pdf`, download: `nc-34-anexo-${number}.pdf` })),
          { text: 'NC nº 38 — Anexo III — Declaração de dependência econômica', href: '/assets/normas/normas-complementares/nc-38-anexo-3.pdf', download: 'nc-38-anexo-3.pdf' },
          { text: 'NC nº 38 — Anexo VII — Declaração de estado civil de solteiro', href: '/assets/normas/normas-complementares/nc-38-anexo-7.pdf', download: 'nc-38-anexo-7.pdf' },
          ...[1, 2, 3, 4, 5, 6].map((number) => ({ text: `NC nº 41 — Anexo ${number}`, href: `/assets/normas/normas-complementares/nc-41-anexo-${number}.pdf`, download: `nc-41-anexo-${number}.pdf` })),
        ],
      },
    ],
  },
  {
    id: 'PORTAL-000016',
    title: 'Portarias',
    navigationTitle: 'Portarias',
    slug: 'portarias',
    category: 'Normas',
    summary:
      'Consulte a organização das portarias normativas e de designação relacionadas ao Plan-Assiste.',
    icon: FileText,
    sections: [
      {
        paragraphs: [
          'As **portarias** registram atos normativos, delegações, estrutura administrativa, diretrizes de unificação e designações vinculadas ao Plan-Assiste.',
        ],
      },
      {
        title: 'Portarias normativas',
        bullets: [
          'Portaria PGR nº 591/1992: institui o Plan-Assiste e aprova o Regulamento Geral;',
          'Portaria PGR nº 46/2009: estabelece o credenciamento único de credenciados;',
          'Portaria PGR/MPU nº 301/2012: dispõe sobre o Programa de Exame Periódico de Saúde no MPU;',
          'Portaria PGR/MPU nº 29/2021: trata de adequações do Programa a normas aplicáveis;',
          'Portaria SG/MPF nº 721/2021: institui o Código de Conduta, Integridade e Compliance.',
        ],
      },
      {
        title: 'Unificação do Plan-Assiste',
        bullets: [
          'Ato Conjunto PGR/PGT/PGJM/PGJDFT nº 2/2022: aprova a unificação das estruturas administrativas;',
          'Ato Conjunto PGR/PGT/PGJM/PGJDFT nº 5/2022: complementa diretrizes e parâmetros da unificação;',
          'Portaria SG/MPU nº 114/2025: aprova o Regimento Interno da Secretaria do Programa de Saúde e Assistência Social do MPU.',
        ],
      },
      {
        title: 'Portarias de designação',
        paragraphs: [
          'As portarias de designação registram nomeações, composições e alterações de instâncias administrativas, conselhos, comissões e grupos de trabalho ligados ao Plan-Assiste.',
          'Esses atos ficam reunidos nesta página para manter a navegação da seção Normas mais simples e direta.',
        ],
      },
    ],
  },
  {
    id: 'PORTAL-000017',
    title: 'Portarias normativas',
    navigationTitle: 'Portarias normativas',
    slug: 'portarias-normativas',
    category: 'Normas',
    summary:
      'Veja os principais atos normativos e atos de designação relacionados ao histórico administrativo do Plan-Assiste.',
    icon: FileText,
    sections: [
      {
        title: 'Atos em destaque',
        bullets: [
          'Portaria PGR nº 591/1992: institui o Plan-Assiste e aprova o Regulamento Geral;',
          'Portaria PGR nº 46/2009: estabelece o credenciamento único de credenciados;',
          'Portaria PGR/MPU nº 301/2012: dispõe sobre o Programa de Exame Periódico de Saúde no MPU;',
          'Portaria PGR/MPU nº 29/2021: trata de adequações do Programa a normas aplicáveis;',
          'Portaria SG/MPF nº 721/2021: institui o Código de Conduta, Integridade e Compliance.',
        ],
      },
      {
        title: 'Unificação do Plan-Assiste',
        bullets: [
          'Ato Conjunto PGR/PGT/PGJM/PGJDFT nº 2/2022: aprova a unificação das estruturas administrativas;',
          'Ato Conjunto PGR/PGT/PGJM/PGJDFT nº 5/2022: complementa diretrizes e parâmetros da unificação;',
          'Portaria SG/MPU nº 114/2025: aprova o Regimento Interno da Secretaria do Programa de Saúde e Assistência Social do MPU.',
        ],
      },
      {
        title: 'Portarias de designação',
        paragraphs: [
          'As portarias de designação registram nomeações, composições e alterações de instâncias administrativas, conselhos, comissões e grupos de trabalho ligados ao Plan-Assiste.',
          'No protótipo, esses atos ficam reunidos em Portarias normativas para simplificar a navegação da seção Normas e evitar páginas excessivamente fragmentadas.',
        ],
      },
    ],
  },
  {
    id: 'PORTAL-000018',
    title: 'Portarias de Designação',
    navigationTitle: 'Portarias de Designação',
    slug: 'portarias-de-designacao',
    category: 'Normas',
    summary:
      'Espaço para organização das designações formais relacionadas aos conselhos, comissões e demais instâncias do Programa.',
    icon: FileText,
    sections: [
      {
        paragraphs: [
          'As **portarias de designação** registram nomeações e composições de instâncias administrativas, conselhos, comissões e grupos de trabalho ligados ao Plan-Assiste.',
          'No protótipo, esta página funciona como ponto de organização para esses atos, preservando o vínculo com a seção de Normas.',
        ],
      },
    ],
  },
  {
    id: 'PORTAL-000019',
    title: 'Regimento Interno do Plan-Assiste',
    navigationTitle: 'Regimento Interno',
    slug: 'regimento-interno',
    category: 'Normas',
    summary:
      'Entenda a finalidade do Regimento Interno na organização administrativa da Seplan e do Programa.',
    icon: FileText,
    sections: [
      {
        paragraphs: [
          'O **Regimento Interno** detalha a estrutura, as competências e o funcionamento da Secretaria do Programa de Saúde e Assistência Social do Ministério Público da União.',
          'Ele complementa o [Regulamento Geral](/plan-assiste/regulamento-geral) ao organizar a atuação administrativa da Seplan e das áreas responsáveis pela execução do Plan-Assiste.',
        ],
        actions: [
          {
            label: 'Baixar Regimento Interno',
            href: '/assets/normas/regimento-interno-plan-assiste.pdf',
            download: 'regimento-interno-plan-assiste.pdf',
          },
        ],
      },
    ],
  },
  {
    id: 'PORTAL-000020',
    title: 'Código de Conduta, Integridade e Compliance do Plan-Assiste MPU',
    navigationTitle: 'Código de Conduta',
    slug: 'codigo-de-conduta-integridade-e-compliance',
    category: 'Normas',
    summary:
      'Conheça o instrumento que orienta condutas, integridade, prevenção de riscos e boas práticas no Programa.',
    icon: ShieldCheck,
    sections: [
      {
        paragraphs: [
          'O **Código de Conduta, Integridade e Compliance** orienta práticas de integridade, relacionamento institucional, prevenção de riscos e condutas esperadas no âmbito do Plan-Assiste MPU.',
          'Ele é referência para fortalecer a confiança, a transparência e a responsabilidade na gestão do Programa e no relacionamento com beneficiários, equipes e credenciados.',
        ],
        actions: [
          {
            label: 'Baixar Código de Conduta',
            href: '/assets/normas/codigo-conduta-integridade-compliance-plan-assiste.pdf',
            download: 'codigo-conduta-integridade-compliance-plan-assiste.pdf',
          },
        ],
      },
    ],
  },
]

type PlanAssisteSection = {
  slug: string
  title: string
  summary: string
  description: string
  icon: typeof BookOpenCheck
  articleSlugs: string[]
}

const planAssisteSections: PlanAssisteSection[] = [
  {
    slug: 'institucional',
    title: 'Institucional',
    summary: 'Origem, finalidade, identidade e diretrizes institucionais do Plan-Assiste.',
    description:
      'Conheça a história do Programa, sua forma de atuação em autogestão, os compromissos que orientam o cuidado aos beneficiários e a identidade visual do Plan-Assiste MPU.',
    icon: BookOpenCheck,
    articleSlugs: ['sobre-o-plan-assiste', 'estrutura-e-governanca', 'nossa-marca'],
  },
  {
    slug: 'beneficiarios',
    title: 'Beneficiários',
    summary: 'Regras de participação e orientações essenciais para quem utiliza ou deseja aderir ao Programa.',
    description:
      'Consulte orientações gerais para beneficiários, incluindo quem pode aderir ao Plan-Assiste e quais categorias de participação são previstas nas regras do Programa.',
    icon: Heart,
    articleSlugs: [
      'quem-pode-aderir',
      'beneficiarios/por-que-optar-pelo-plan-assiste',
      'beneficiarios/torne-se-beneficiario',
      'beneficiarios/orientacoes-sobre-eps',
      'beneficiarios/segunda-via-carteirinha',
      'beneficiarios/carteirinha-fisica',
      'beneficiarios/problemas-com-a-carteirinha',
      'beneficiarios/tipos-de-redes',
      'beneficiarios/percentuais-de-coparticipacao',
    ],
  },
  {
    slug: 'credenciados',
    title: 'Credenciados',
    summary: 'Credenciamento, renovação e orientações para profissionais e instituições de saúde.',
    description:
      'Veja informações para credenciados interessados em credenciamento, renovação ou relacionamento com o Plan-Assiste.',
    icon: FileText,
    articleSlugs: [
      'como-se-credenciar-ou-renovar',
      'como-se-credenciar-ou-renovar/pessoa-juridica',
      'como-se-credenciar-ou-renovar/pessoa-fisica',
      'tabelas-de-servicos',
    ],
  },
  {
    slug: 'gestao',
    title: 'Gestão',
    summary: 'Estrutura de governança, conselhos, diretoria, assessoramento técnico e controles internos.',
    description:
      'Entenda como o Programa organiza deliberação, gestão, fiscalização, execução e assessoramento técnico para conduzir suas atividades.',
    icon: UsersRound,
    articleSlugs: [
      'conselho-deliberativo',
      'conselho-gestor',
      'conselho-fiscal',
      'camara-tecnica-de-saude',
      'diretoria-executiva-colegiada',
      'organograma',
      'plano-de-riscos-integridade-e-controles',
    ],
  },
  {
    slug: 'normas',
    title: 'Normas',
    summary: 'Regulamento, normas complementares, portarias, regimento interno e integridade.',
    description:
      'Consulte os principais conjuntos normativos que estruturam o funcionamento do Plan-Assiste e orientam beneficiários, equipes e credenciados.',
    icon: Scale,
    articleSlugs: [
      'regulamento-geral',
      'normas-complementares',
      'portarias',
      'regimento-interno',
      'codigo-de-conduta-integridade-e-compliance',
    ],
  },
  {
    // Vitrine dos serviços do catálogo: em vez de artigos, lista cada serviço com
    // uma página explicativa que leva ao formulário correspondente.
    slug: 'servicos',
    title: 'Serviços',
    summary: 'Conheça cada serviço do Plan-Assiste, o que é preciso reunir e acesse o formulário.',
    description:
      'Consulte os serviços disponíveis no Programa. Cada página reúne a finalidade do serviço, os documentos exigidos e as informações solicitadas, com acesso direto ao formulário de solicitação.',
    icon: ListChecks,
    articleSlugs: [],
  },
]

export function PublicShell({
  loggedIn,
  onLogout,
  children,
  themeClass = '',
}: PublicPageProps & { children: React.ReactNode, themeClass?: string }) {
  const activeProfile = loggedIn ? getStoredSession().activeProfile : null
  const profileThemeClass = activeProfile === 'team'
    ? 'team-public-theme'
    : activeProfile === 'provider'
      ? 'provider-public-theme'
      : ''
  const shellClassName = [profileThemeClass, themeClass].filter(Boolean).join(' ')
  return (
    <div className={shellClassName}>
      <Header loggedIn={loggedIn} onLogout={onLogout} />
      <MainMenu loggedIn={loggedIn} />
      {children}
      <Footer />
    </div>
  )
}

export function PublicBreadcrumb({
  current,
  parent,
  parents,
}: {
  current: string
  parent?: { label: string, to: string }
  parents?: Array<{ label: string, to: string }>
}) {
  const trail = parents || (parent ? [parent] : [])

  return (
    <nav className="breadcrumb public-breadcrumb" aria-label="Breadcrumb">
      <Link to="/">Início</Link>
      <ArrowRight aria-hidden="true" />
      {trail.map((item) => (
        <span className="breadcrumb-parent" key={item.to}>
          <Link to={item.to}>{item.label}</Link>
          <ArrowRight aria-hidden="true" />
        </span>
      ))}
      <span>{current}</span>
    </nav>
  )
}

export function PlanAssisteIndexPage({ loggedIn, onLogout }: PublicPageProps) {
  const cmsSnapshot = useCmsSnapshot()
  const cmsPage = cmsSnapshot.pages.find((page) => page.slug === 'plan-assiste' && page.status === 'published')
  const planAssisteHomeCards = planAssisteSections.flatMap((section) => {
    if (section.slug !== 'institucional') return [section]

    return [
      section,
      {
        slug: 'estrutura-e-governanca',
        title: 'Estrutura e Governança',
        summary: 'Organização administrativa, instâncias de decisão, fiscalização, execução e assessoramento técnico.',
        icon: UsersRound,
      },
    ]
  })

  return (
    <PublicShell loggedIn={loggedIn} onLogout={onLogout}>
      <main className="container public-page">
        <PublicBreadcrumb current="Plan-Assiste" />

        <div className="public-content-layout plan-content-layout">
          <PlanAssisteSidebar currentSlug="plan-assiste" />
          <div className="public-content-main">
            {cmsPage ? (
              <>
                <section className="public-hero public-hero-institutional plan-landing-hero">
                  <p className="eyebrow">Programa de Saúde e Assistência Social do MPU</p>
                  <h1>{cmsPage.title}</h1>
                  <p>{cmsPage.summary}</p>
                </section>
                <CmsPageBlocks page={cmsPage} editing={false} />
              </>
            ) : (
              <>
                <section className="public-hero public-hero-institutional plan-landing-hero">
                  <p className="eyebrow">Programa de Saúde e Assistência Social do MPU</p>
                  <h1>Plan-Assiste</h1>
                  <p>
                    Encontre <strong>informações institucionais</strong>, regras para <strong>beneficiários</strong>, orientações para
                    <strong> credenciados</strong>, estrutura de gestão e normas do Programa.
                  </p>
                </section>

                <section className="plan-card-grid" aria-label="Principais áreas do Plan-Assiste">
                  {planAssisteHomeCards.map((section) => {
                    const Icon = section.icon
                    return (
                      <Link className="plan-section-card" to={`/plan-assiste/${section.slug}`} key={section.slug}>
                        <Icon aria-hidden="true" />
                        <span>{section.title}</span>
                        <p>{linkifyEmails(section.summary)}</p>
                        <strong>
                          Acessar <ArrowRight aria-hidden="true" />
                        </strong>
                      </Link>
                    )
                  })}
                </section>
              </>
            )}
          </div>
        </div>
      </main>
    </PublicShell>
  )
}

export function PlanAssisteArticlePage({ loggedIn, onLogout }: PublicPageProps) {
  const { '*': slug } = useParams()
  const cmsSnapshot = useCmsSnapshot()
  if (slug === 'beneficiarios/autorizacoes') return <Navigate to="/beneficiario/autorizacoes" replace />
  const section = planAssisteSections.find((item) => item.slug === slug)

  // A seção de Serviços tem páginas próprias: uma vitrine e o detalhe de cada serviço.
  if (slug === 'servicos' && section) return <PlanAssisteServicosPage section={section} loggedIn={loggedIn} onLogout={onLogout} />
  if (slug?.startsWith('servicos/')) return <PlanAssisteServicoPage slug={slug.slice('servicos/'.length)} loggedIn={loggedIn} onLogout={onLogout} />

  if (section) return <PlanAssisteSectionPage section={section} loggedIn={loggedIn} onLogout={onLogout} />

  const article = planAssisteArticles.find((item) => item.slug === slug)
  const cmsPage = slug ? cmsSnapshot.pages.find((page) => page.slug === slug && page.status === 'published') : undefined

  if (!article && !cmsPage) return <Navigate to="/plan-assiste" replace />

  const Icon = article?.icon || FileText
  const parentSection = article ? findPlanAssisteSectionForArticle(article) : undefined
  const parents = slug?.startsWith('como-se-credenciar-ou-renovar/')
    ? [
        { label: 'Plan-Assiste', to: '/plan-assiste' },
        { label: 'Credenciados', to: '/plan-assiste/credenciados' },
        { label: 'Como se credenciar ou renovar', to: '/plan-assiste/como-se-credenciar-ou-renovar' },
      ]
    : parentSection
    ? [
        { label: 'Plan-Assiste', to: '/plan-assiste' },
        { label: parentSection.title, to: `/plan-assiste/${parentSection.slug}` },
      ]
    : [{ label: 'Plan-Assiste', to: '/plan-assiste' }]

  return (
    <PublicShell loggedIn={loggedIn} onLogout={onLogout}>
      <main className="container public-page">
        <PublicBreadcrumb current={cmsPage?.navigationTitle || article?.navigationTitle || ''} parents={parents} />

        <div className="public-content-layout plan-content-layout">
        <PlanAssisteSidebar currentSlug={article?.slug || cmsPage?.slug || ''} />
          <article className="portal-article public-content-main">
            <header className="portal-article-header">
              <Icon aria-hidden="true" />
              <h1>{cmsPage?.title || article?.title}</h1>
              <p>{linkifyEmails(cmsPage?.summary || article?.summary || '')}</p>
            </header>

            {cmsPage ? <CmsPageBlocks page={cmsPage} editing={false} /> : orderedArticleSections(article).map((section, index) => (
              <section className="portal-article-section" id={section.id} key={`${article!.id}-${section.title || index}`}>
                {section.title && <h2>{section.title}</h2>}
                {section.paragraphs?.map((paragraph) => <p key={paragraph}>{linkifyEmails(paragraph)}</p>)}
                {section.cards && (
                  <div className={`plan-value-grid portal-section-card-grid ${section.cards.length === 2 ? 'is-two-column' : ''} ${article?.slug === 'beneficiarios/autorizacoes' ? 'authorization-navigation-grid' : ''}`}>
                    {section.cards.map((card) => {
                      const authorizationCardIcons: Record<string, typeof BookOpenCheck> = {
                        'Cirurgia Eletiva': HeartPulse,
                        'Medicamentos - Cobertura Direta': Pill,
                        Acupuntura: Activity,
                        Fisioterapia: Dumbbell,
                        Fonoaudiologia: Speech,
                        Psicologia: Brain,
                        'Terapia ocupacional': HandHeart,
                        Pilates: PersonStanding,
                        Hidroterapia: Waves,
                        RPG: Accessibility,
                        'Medicamentos de cobertura obrigatória': ClipboardCheck,
                      }
                      const CardIcon = article?.slug === 'beneficiarios/autorizacoes'
                        ? authorizationCardIcons[card.title] || ClipboardCheck
                        : undefined
                      const cardContent = (
                        <>
                          {CardIcon && (
                            <div className="authorization-card-icons">
                              <CardIcon aria-hidden="true" />
                              <LockKeyhole aria-label="Acesso exclusivo para beneficiários autenticados" />
                            </div>
                          )}
                          <strong>{card.title}</strong>
                          <p>{linkifyEmails(card.text)}</p>
                          {card.bullets && (
                            <ul className="plan-card-list">
                              {card.bullets.map((bullet) => <li key={bullet}>{linkifyEmails(bullet)}</li>)}
                            </ul>
                          )}
                          {card.actions && (
                            <div className="plan-card-downloads">
                              {card.actions.map((action) => (
                                <a className="secondary-button" href={action.href} download={action.download} key={action.href}>
                                  <Download aria-hidden="true" /> {action.label}
                                </a>
                              ))}
                            </div>
                          )}
                          {card.to && (
                            <span className="plan-card-action">
                              {card.actionLabel || 'Abrir página'} <ArrowRight aria-hidden="true" />
                            </span>
                          )}
                        </>
                      )

                      return card.to ? (
                        <Link className="plan-value-card plan-value-card-link" to={card.to} key={card.title}>
                          {cardContent}
                        </Link>
                      ) : (
                        <article className="plan-value-card" key={card.title}>
                          {cardContent}
                        </article>
                      )
                    })}
                  </div>
                )}
                {section.bullets && section.bulletsAsTable && (
                  <div className="specialty-table-list">
                    {section.bullets.map((bullet) => {
                      const [category, specialties = ''] = bullet.split(':')
                      const sortedSpecialties = specialties.replace(/\.$/, '').split(',').map((specialty) => specialty.trim()).sort((first, second) => first.localeCompare(second, 'pt-BR'))
                      return (
                        <section className="specialty-table-section" key={category}>
                          <div className="portal-table-wrap specialty-table-wrap">
                            <table className="portal-table specialty-table">
                              <caption>{category}</caption>
                              <tbody>
                                {sortedSpecialties.map((specialty) => (
                                  <tr key={specialty}><td>{specialty}</td></tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </section>
                      )
                    })}
                  </div>
                )}
                {section.bullets && !section.bulletsAsTable && (
                  <ul>
                    {section.bullets.map((bullet) => <li key={bullet}>{formatPortalBullet(bullet)}</li>)}
                  </ul>
                )}
                {section.linkedBullets && (
                  <>
                    <div className="portal-table-wrap document-table-wrap">
                      <table className="portal-table document-table">
                        <thead><tr><th>Nº</th><th>Documento ou recurso</th><th>Ação</th></tr></thead>
                        <tbody>
                          {section.linkedBullets.map((item, itemIndex) => {
                            const documentName = item.text.replace(/;$/, '').replace(/^./, (character) => character.toUpperCase())
                            const actionLabel = item.download ? 'Baixar' : (item.label || 'Abrir')
                            return (
                              <tr key={`${item.text}-${item.href || 'plain'}`}>
                                <td>{itemIndex + 1}</td>
                                <td>{documentName}{item.signatureRequired && <sup title="Assinatura necessária">*</sup>}</td>
                                <td>
                                  {item.href ? (
                                    <a
                                      href={item.href}
                                      download={item.download}
                                      target={item.external ? '_blank' : undefined}
                                      rel={item.external ? 'noreferrer' : undefined}
                                      aria-label={`${actionLabel} ${item.text}`}
                                      title={`${actionLabel} ${documentName}`}
                                    >
                                      {item.download ? <Download aria-hidden="true" /> : <ExternalLink aria-hidden="true" />}
                                      <span>{actionLabel}</span>
                                    </a>
                                  ) : <span className="document-action-unavailable">–</span>}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                    {section.linkedBullets.some((item) => item.signatureRequired) && (
                      <p className="document-table-note"><sup>*</sup> {article!.slug.endsWith('/pessoa-juridica') ? 'Documento que deve ser assinado pelo representante legal antes do envio.' : 'Documento que deve ser assinado antes do envio.'}</p>
                    )}
                  </>
                )}
                {section.table && (
                  <div className="portal-table-wrap">
                    <table className={`portal-table${article!.slug === 'normas-complementares' ? ' document-table norms-download-table' : ''}`}>
                      {section.table.caption && <caption>{section.table.caption}</caption>}
                      {section.table.columnWidths && (
                        <colgroup>
                          {section.table.columnWidths.map((width, widthIndex) => (
                            <col style={{ width }} key={`${width}-${widthIndex}`} />
                          ))}
                        </colgroup>
                      )}
                      <thead>
                        <tr>
                          {section.table.headers.map((header) => <th key={header}>{header}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {section.table.rows.map((row, rowIndex) => (
                          <tr key={row.join('|')}>
                            {row.map((cell, cellIndex) => (
                              <td key={`${row.join('|')}-${cellIndex}`}>{linkifyEmails(cell)}</td>
                            ))}
                            {section.table?.downloads?.[rowIndex] && (
                              <td>
                                <a
                                  className="portal-table-download"
                                  href={section.table.downloads[rowIndex].href}
                                  download={section.table.downloads[rowIndex].download}
                                  aria-label={`Baixar ${row[0]}`}
                                >
                                  <Download aria-hidden="true" />
                                  <span>{section.table.downloads[rowIndex].label || 'Baixar'}</span>
                                </a>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {section.image && (
                  <figure className={`portal-article-figure ${section.image.variant ? `is-${section.image.variant}` : ''}`}>
                    <img src={section.image.src} alt={section.image.alt} />
                    {section.image.caption && <figcaption>{section.image.caption}</figcaption>}
                  </figure>
                )}
                {section.hierarchy && (
                  <OrgHierarchyAccordion items={getCmsOrgHierarchy(section.hierarchy)} />
                )}
                {section.actions && (
                  <div className="portal-article-actions">
                    {section.actions.map((action) => (
                      <a className="primary-button" href={action.href} download={action.download} target={action.external ? '_blank' : undefined} rel={action.external ? 'noreferrer' : undefined} key={action.href}>
                        {action.external ? <ExternalLink aria-hidden="true" /> : <Download aria-hidden="true" />} {action.label}
                      </a>
                    ))}
                  </div>
                )}
              </section>
            ))}
          </article>
        </div>
      </main>
    </PublicShell>
  )
}

function PlanAssisteSectionPage({
  section,
  loggedIn,
  onLogout,
}: PublicPageProps & { section: PlanAssisteSection }) {
  const Icon = section.icon
  const articles = getPlanAssisteSectionArticles(section)

  return (
    <PublicShell loggedIn={loggedIn} onLogout={onLogout}>
      <main className="container public-page">
        <PublicBreadcrumb current={section.title} parents={[{ label: 'Plan-Assiste', to: '/plan-assiste' }]} />

        <div className="public-content-layout plan-content-layout">
          <PlanAssisteSidebar currentSlug={section.slug} />
          <div className="public-content-main">
            <section className="public-hero public-hero-institutional plan-section-hero">
              <Icon aria-hidden="true" />
              <div>
                <p className="eyebrow">Plan-Assiste</p>
                <h1>{section.title}</h1>
                <p>{linkifyEmails(section.description)}</p>
              </div>
            </section>

            <section className="plan-card-grid plan-card-grid-secondary" aria-label={`Páginas de ${section.title}`}>
              {articles.map((article) => {
                const ArticleIcon = article.icon
                return (
                  <Link className="plan-section-card" to={`/plan-assiste/${article.slug}`} key={article.id}>
                    <ArticleIcon aria-hidden="true" />
                    <span>{article.navigationTitle}</span>
                    <p>{linkifyEmails(article.summary)}</p>
                    <strong>
                      Abrir página <ArrowRight aria-hidden="true" />
                    </strong>
                  </Link>
                )
              })}
            </section>
          </div>
        </div>
      </main>
    </PublicShell>
  )
}

// ---------------------------------------------------------------------------
// Seção "Serviços" do Plan-Assiste
// ---------------------------------------------------------------------------

// Busca sem acentuação e sem caixa, para "medico" encontrar "médico".
function normalizaBusca(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

function PlanAssisteServicosPage({ section, loggedIn, onLogout }: PublicPageProps & { section: PlanAssisteSection }) {
  const Icon = section.icon
  const [busca, setBusca] = useState('')

  const termo = normalizaBusca(busca.trim())
  const encontrados = termo
    ? beneficiaryRequests.filter((request) => normalizaBusca(
        [request.title, request.description, request.category, ...request.tags].join(' '),
      ).includes(termo))
    : beneficiaryRequests

  const porCategoria = encontrados.reduce<Record<string, typeof beneficiaryRequests>>((grupos, request) => {
    grupos[request.category] = [...(grupos[request.category] ?? []), request]
    return grupos
  }, {})

  return (
    <PublicShell loggedIn={loggedIn} onLogout={onLogout}>
      <main className="container public-page">
        <PublicBreadcrumb current={section.title} parents={[{ label: 'Plan-Assiste', to: '/plan-assiste' }]} />

        <div className="public-content-layout plan-content-layout">
          <PlanAssisteSidebar currentSlug={section.slug} />
          <div className="public-content-main">
            <section className="public-hero public-hero-institutional plan-section-hero">
              <Icon aria-hidden="true" />
              <div>
                <p className="eyebrow">Plan-Assiste</p>
                <h1>{section.title}</h1>
                <p>{section.description}</p>
              </div>
            </section>

            <label className="support-faq-search plan-servico-search">
              <span>Buscar serviço</span>
              <Search aria-hidden="true" />
              <input
                type="search"
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
                placeholder="Nome do serviço, categoria ou palavra-chave"
              />
            </label>

            <p className="plan-servico-count" role="status">
              {encontrados.length === beneficiaryRequests.length
                ? `${beneficiaryRequests.length} serviços disponíveis`
                : `${encontrados.length} ${encontrados.length === 1 ? 'serviço encontrado' : 'serviços encontrados'} para “${busca.trim()}”`}
            </p>

            {encontrados.length === 0 ? (
              <div className="empty-state">
                <Search aria-hidden="true" />
                <h2>Nenhum serviço encontrado</h2>
                <p>Revise a palavra digitada ou limpe a busca para ver todos os serviços.</p>
                <button className="secondary-button" type="button" onClick={() => setBusca('')}>Limpar busca</button>
              </div>
            ) : (
              Object.entries(porCategoria).map(([categoria, servicos]) => (
                <section className="plan-servico-group" key={categoria} aria-label={`Serviços de ${categoria}`}>
                  <h2>{categoria}</h2>
                  <div className="plan-servico-grid">
                    {servicos.map((servico) => (
                      <Link className="plan-servico-card" to={`/plan-assiste/servicos/${servicoPaginaSlug(servico)}`} key={servico.id}>
                        <span>{servico.title}</span>
                        <p>{servico.description}</p>
                        <strong>Acessar <ArrowRight aria-hidden="true" /></strong>
                      </Link>
                    ))}
                  </div>
                </section>
              ))
            )}
          </div>
        </div>
      </main>
    </PublicShell>
  )
}

function PlanAssisteServicoPage({ slug, loggedIn, onLogout }: PublicPageProps & { slug: string }) {
  const servico = findServicoByPaginaSlug(slug)
  if (!servico) return <Navigate to="/plan-assiste/servicos" replace />

  const schema = servicoFormSlug(servico) ? getServiceFormSchema(servicoFormSlug(servico) as string) : undefined
  const documentos = schema?.sections
    .flatMap((secao) => secao.fields)
    .filter((campo) => campo.type === 'file') ?? []
  const blocos = schema?.sections.filter((secao) => secao.title && secao.fields.some((campo) => campo.type !== 'note' && campo.type !== 'file')) ?? []
  const rotaFormulario = servicoRotaFormulario(servico)
  const destino = rotaFormulario ?? servico.route ?? servico.externalUrl
  // Só chama de 'Formulário' o que realmente leva a um; o resto usa o rótulo do catálogo.
  const rotuloAcao = rotaFormulario ? `Formulário` : servico.action

  return (
    <PublicShell loggedIn={loggedIn} onLogout={onLogout}>
      <main className="container public-page">
        <PublicBreadcrumb
          current={servico.title}
          parents={[{ label: 'Plan-Assiste', to: '/plan-assiste' }, { label: 'Serviços', to: '/plan-assiste/servicos' }]}
        />

        <div className="public-content-layout plan-content-layout">
          <PlanAssisteSidebar currentSlug={`servicos/${slug}`} />
          <div className="public-content-main">
            <section className="public-hero public-hero-institutional plan-servico-hero">
              <div>
                <p className="eyebrow">{servico.category}</p>
                <h1>{servico.title}</h1>
                <p>{servico.description}</p>
              </div>
            </section>

            <article className="portal-article-body plan-servico-body">
              {servico.tags.length > 0 && (
                <p className="plan-servico-tags">
                  {servico.tags.map((tag) => <span key={tag}>{tag}</span>)}
                </p>
              )}

              {documentos.length > 0 && (
                <section>
                  <h2>Documentos necessários</h2>
                  <p>Reúna os arquivos antes de iniciar. Os itens marcados como obrigatórios são exigidos para o envio.</p>
                  <ul>
                    {documentos.map((documento) => (
                      <li key={documento.id}>
                        {documento.label}{documento.required ? ' (obrigatório)' : ''}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {blocos.length > 0 && (
                <section>
                  <h2>Informações solicitadas</h2>
                  <p>O formulário está organizado nestas etapas:</p>
                  <ul>
                    {blocos.map((bloco) => (
                      <li key={bloco.id}>
                        <strong>{bloco.title}</strong>
                        {' — '}
                        {bloco.fields.filter((campo) => campo.type !== 'note' && campo.type !== 'file').map((campo) => campo.label).join(', ')}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {!schema && (
                <section>
                  <h2>Como acessar</h2>
                  <p>Este serviço é atendido diretamente em uma área do Portal, sem formulário de solicitação próprio.</p>
                </section>
              )}
            </article>

            {destino && (
              <div className="plan-servico-actions">
                {servico.externalUrl ? (
                  <a className="primary-button" href={servico.externalUrl} target="_blank" rel="noreferrer">
                    {rotuloAcao} <ArrowRight aria-hidden="true" />
                  </a>
                ) : (
                  <Link className="primary-button" to={destino}>
                    {rotuloAcao} <ArrowRight aria-hidden="true" />
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </PublicShell>
  )
}

export function PlanAssisteSidebar({ currentSlug }: { currentSlug: string }) {
  const navigate = useNavigate()
  const currentPath = currentSlug === 'plan-assiste' ? '/plan-assiste' : `/plan-assiste/${currentSlug}`

  return (
    <aside className="public-side-nav plan-side-nav" aria-label="Navegação Plan-Assiste">
      <strong>Plan-Assiste</strong>

      <div className="sidebar-mobile-select plan-side-mobile-select">
        <label htmlFor="plan-assiste-navigation">Navegar em Plan-Assiste</label>
        <select id="plan-assiste-navigation" value={currentPath} onChange={(event) => navigate(event.target.value)}>
          <option value="/plan-assiste">Página principal</option>
          {planAssisteSections.map((section) => {
            const articles = getPlanAssisteSectionArticles(section)

            return (
              <optgroup label={section.title} key={section.slug}>
                <option value={`/plan-assiste/${section.slug}`}>{section.title}</option>
                {articles.map((article) => {
                  const depth = getPlanAssisteArticleDepth(article, articles)
                  const levelMarker = depth > 0 ? `${'– '.repeat(depth)}` : ''

                  return (
                    <option value={`/plan-assiste/${article.slug}`} key={article.id}>
                      {levelMarker}{article.navigationTitle}
                    </option>
                  )
                })}
              </optgroup>
            )
          })}
        </select>
      </div>

      <div className="plan-side-nav-links">
        <Link className={`plan-side-home${currentSlug === 'plan-assiste' ? ' active' : ''}`} to="/plan-assiste" aria-current={currentSlug === 'plan-assiste' ? 'page' : undefined}>
          Página principal
        </Link>

        <div className="plan-side-section-list">
          {planAssisteSections.map((section) => {
            const sectionArticles = getPlanAssisteSectionArticles(section)
            const isSectionActive = currentSlug === section.slug || currentSlug.startsWith(`${section.slug}/`) || section.articleSlugs.some((articleSlug) => (
              currentSlug === articleSlug || currentSlug.startsWith(`${articleSlug}/`)
            ))

            return (
              <div className={`plan-side-group${isSectionActive ? ' is-open' : ''}`} key={section.slug}>
                <Link
                  className={`plan-side-section-link${isSectionActive ? ' active' : ''}`}
                  to={`/plan-assiste/${section.slug}`}
                  aria-current={currentSlug === section.slug ? 'page' : undefined}
                >
                  <span>{section.title}</span>
                </Link>

                {isSectionActive && (
                  <div className="plan-side-children">
                    {sectionArticles.map((article) => (
                      <Link
                        className={`${currentSlug === article.slug ? 'active' : ''}${article.slug.includes('/') ? ' is-nested' : ''}${currentSlug.startsWith(`${article.slug}/`) ? ' is-parent-active' : ''}`.trim() || undefined}
                        to={`/plan-assiste/${article.slug}`}
                        aria-current={currentSlug === article.slug ? 'page' : undefined}
                        key={article.id}
                      >
                        {article.navigationTitle}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </aside>
  )
}

function getPlanAssisteSectionArticles(section: PlanAssisteSection) {
  return section.articleSlugs
    .map((articleSlug) => planAssisteArticles.find((article) => article.slug === articleSlug))
    .filter((article): article is PortalArticle => Boolean(article))
}

function getPlanAssisteArticleDepth(article: PortalArticle, sectionArticles: PortalArticle[]) {
  return sectionArticles.filter((candidate) => article.slug.startsWith(`${candidate.slug}/`)).length
}

function findPlanAssisteSectionForArticle(article: PortalArticle) {
  return planAssisteSections.find((section) => section.articleSlugs.includes(article.slug))
}

function splitOrgUnitLabel(label: string) {
  const match = label.match(/^(.*?)\s+\(([^()]+)\)$/)
  return match
    ? { unitName: match[1], acronym: match[2] }
    : { unitName: label, acronym: undefined }
}

function linkifyEmails(text: string) {
  const editorialPattern = /(\*\*[^*]+\*\*|\[[^\]]+\]\(\/[^)]+\)|[\w.+-]+@[\w.-]+\.[A-Za-z]{2,})/g
  return text.split(editorialPattern).filter(Boolean).map((part, index) => {
    if (/^[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}$/.test(part)) {
      return <a className="portal-email-link" href={`mailto:${part}`} key={`${part}-${index}`}>{part}</a>
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong className="portal-text-keyword" key={`${part}-${index}`}>{part.slice(2, -2)}</strong>
    }
    const internalLink = part.match(/^\[([^\]]+)\]\((\/[^)]+)\)$/)
    if (internalLink) {
      return <Link to={internalLink[2]} key={`${part}-${index}`}>{internalLink[1]}</Link>
    }
    return part
  })
}

function formatPortalBullet(text: string) {
  if (text.includes('**')) return linkifyEmails(text)
  const separator = text.indexOf(':')
  if (separator <= 0) return linkifyEmails(text)
  return <><strong>{text.slice(0, separator + 1)}</strong>{linkifyEmails(text.slice(separator + 1))}</>
}

function filterOrgHierarchy(nodes: OrgHierarchyNode[], query: string): OrgHierarchyNode[] {
  const normalizedQuery = query.trim().toLocaleLowerCase('pt-BR')
  if (!normalizedQuery) return nodes

  return nodes.flatMap((node) => {
    const contact = orgHierarchyContacts[node.id]
    const searchableText = [node.id, node.label, contact?.name, contact?.email].filter(Boolean).join(' ').toLocaleLowerCase('pt-BR')
    const children = filterOrgHierarchy(node.children, query)
    return searchableText.includes(normalizedQuery) || children.length ? [{ ...node, children }] : []
  })
}

function OrgEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false)

  async function copyEmail() {
    await navigator.clipboard.writeText(email)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <span className="org-hierarchy-email">
      <a className="portal-email-link" href={`mailto:${email}`}>{email}</a>
      <button type="button" onClick={copyEmail} aria-label={`Copiar e-mail ${email}`} title="Copiar e-mail">
        {copied ? <CheckCircle2 aria-hidden="true" /> : <Copy aria-hidden="true" />}
      </button>
      <span className="sr-only" aria-live="polite">{copied ? 'E-mail copiado' : ''}</span>
    </span>
  )
}

function OrgHierarchyAccordion({ items }: { items: string[] }) {
  const nodes = useMemo(() => buildHierarchy(items), [items])
  const expandableIds = useMemo(() => getExpandableIds(nodes), [nodes])
  const [query, setQuery] = useState('')
  const visibleNodes = useMemo(() => filterOrgHierarchy(nodes, query), [nodes, query])
  const searchOpenIds = useMemo(() => new Set(getExpandableIds(visibleNodes)), [visibleNodes])
  const [openIds, setOpenIds] = useState<Set<string>>(
    () => new Set(window.matchMedia('(min-width: 901px)').matches ? nodes.filter((node) => node.children.length > 0).map((node) => node.id) : []),
  )

  function toggleNode(id: string) {
    setOpenIds((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function renderNodes(list: OrgHierarchyNode[], isRoot = false) {
    return (
      <div className="org-hierarchy-children" role={isRoot ? 'tree' : 'group'}>
        {list.map((node) => {
          const hasChildren = node.children.length > 0
          const isOpen = (query.trim() ? searchOpenIds : openIds).has(node.id)
          const contact = orgHierarchyContacts[node.id]
          const { unitName, acronym } = splitOrgUnitLabel(node.label)

          return (
            <div className="org-hierarchy-node" key={node.id} role="treeitem" aria-level={node.level} aria-expanded={hasChildren ? isOpen : undefined}>
              {hasChildren ? (
                <div className={`org-hierarchy-row is-level-${Math.min(node.level, 5)} has-children`}>
                  <button className="org-hierarchy-toggle" type="button" aria-expanded={isOpen} aria-label={`${isOpen ? 'Contrair' : 'Expandir'} ${unitName}`} onClick={() => toggleNode(node.id)}>
                    <ChevronRight className="org-hierarchy-chevron" aria-hidden="true" />
                  </button>
                  <span className="org-hierarchy-content">
                    <span className="org-hierarchy-meta">
                      <span className="org-hierarchy-number">{node.id}</span>
                      {acronym && <span className="org-hierarchy-acronym">{acronym}</span>}
                    </span>
                    <span className="org-hierarchy-label">{unitName}</span>
                    {contact && (
                      <span className="org-hierarchy-contact">
                        <span>{contact.name}</span>
                        <OrgEmail email={contact.email} />
                      </span>
                    )}
                  </span>
                </div>
              ) : (
                <div className={`org-hierarchy-row is-level-${Math.min(node.level, 5)}`}>
                  <span className="org-hierarchy-spacer" aria-hidden="true" />
                  <span className="org-hierarchy-content">
                    <span className="org-hierarchy-meta">
                      <span className="org-hierarchy-number">{node.id}</span>
                      {acronym && <span className="org-hierarchy-acronym">{acronym}</span>}
                    </span>
                    <span className="org-hierarchy-label">{unitName}</span>
                    {contact && (
                      <span className="org-hierarchy-contact">
                        <span>{contact.name}</span>
                        <OrgEmail email={contact.email} />
                      </span>
                    )}
                  </span>
                </div>
              )}

              {hasChildren && isOpen && renderNodes(node.children)}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <section className="org-hierarchy-list" aria-label="Estrutura administrativa em accordion">
      <div className="org-hierarchy-toolbar">
        <strong>Programa de Saúde e Assistência Social do MPU (SEPLAN)</strong>
        <div>
          <button type="button" onClick={() => setOpenIds(new Set(expandableIds))}>Expandir tudo</button>
          <button type="button" onClick={() => setOpenIds(new Set())}>Contrair tudo</button>
        </div>
      </div>
      <label className="org-hierarchy-search">
        <span>Buscar no organograma</span>
        <span className="field-with-icon"><Search aria-hidden="true" /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Setor, sigla, servidor, e-mail ou número" /></span>
      </label>
      {visibleNodes.length ? renderNodes(visibleNodes, true) : <p className="org-hierarchy-empty" role="status">Nenhuma unidade encontrada.</p>}
    </section>
  )
}

function newsDateValue(date: string) {
  const [day, month, year] = date.split('/').map(Number)
  return new Date(year, month - 1, day).getTime()
}

function inputDateValue(date: string) {
  return date ? new Date(`${date}T00:00:00`).getTime() : undefined
}

function formatDisplayDate(date: string) {
  if (!date) return ''
  const [year, month, day] = date.split('-')
  return `${day}/${month}/${year}`
}

function formatNewsCategory(category: string) {
  return category
    .toLocaleLowerCase('pt-BR')
    .replace(/(^|\s|-)(\p{L})/gu, (match) => match.toLocaleUpperCase('pt-BR'))
}

function normalizeSearch(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function NewsSidebar({ currentItem, loggedIn }: { currentItem: NewsItem, loggedIn: boolean }) {
  const [favoriteState, setFavoriteState] = useState<FavoriteState>(() => getFavoriteState())
  const navigate = useNavigate()
  const categories = Array.from(new Set(news.map((item) => item.category)))
  const favoriteItems = news.filter((item) => favoriteState.favoriteNewsIds.includes(item.id))

  useEffect(() => {
    function syncFavorites() {
      setFavoriteState(getFavoriteState())
    }

    window.addEventListener('planAssisteFavoritesUpdated', syncFavorites)
    window.addEventListener('storage', syncFavorites)
    return () => {
      window.removeEventListener('planAssisteFavoritesUpdated', syncFavorites)
      window.removeEventListener('storage', syncFavorites)
    }
  }, [])

  return (
    <aside className="news-sidebar-stack" aria-label="Navegação de notícias">
      {loggedIn && (
        <section className="public-side-nav news-side-nav">
          <strong>Meus favoritos</strong>
          <div className="news-side-favorites">
            {favoriteItems.length > 0 ? (
              favoriteItems.map((item) => (
                <Link to={`/noticias/${item.id}`} key={item.id}>{item.title}</Link>
              ))
            ) : (
              <p>Nenhuma notícia favorita salva.</p>
            )}
          </div>
          <Link className="public-side-nav-all" to="/beneficiario/minhas-preferencias">
            Todos os favoritos <ArrowRight aria-hidden="true" />
          </Link>
        </section>
      )}

      <div>
        <h2>Categorias</h2>
        <section className="public-side-nav news-side-nav news-category-box">
          <label className="news-side-category">
            <span>Pesquisar por categoria</span>
            <select
              value={currentItem.category}
              onChange={(event) => {
                if (event.target.value) navigate(`/noticias?categoria=${encodeURIComponent(event.target.value)}`)
              }}
            >
              {categories.map((category) => (
                <option value={category} key={category}>{formatNewsCategory(category)}</option>
              ))}
            </select>
          </label>
          <Link className="public-side-nav-all" to="/noticias">
            Todas as notícias <ArrowRight aria-hidden="true" />
          </Link>
        </section>
      </div>
    </aside>
  )
}

export function NewsPage({ loggedIn, onLogout }: PublicPageProps) {
  const portalNews = getPortalNews()
  const [searchParams, setSearchParams] = useSearchParams()
  const [category, setCategory] = useState(searchParams.get('categoria') || 'Todas')
  const [onlyFavorites, setOnlyFavorites] = useState(searchParams.get('favoritas') === 'true')
  const [startDate, setStartDate] = useState(searchParams.get('de') || '')
  const [endDate, setEndDate] = useState(searchParams.get('ate') || '')
  const [query, setQuery] = useState(searchParams.get('busca') || '')
  const [favoriteState, setFavoriteState] = useState<FavoriteState>(() => getFavoriteState())
  const [page, setPage] = useState(1)
  const categories = useMemo(() => ['Todas', ...Array.from(new Set(portalNews.map((item) => item.category)))], [portalNews])

  useEffect(() => {
    function syncFavorites() {
      setFavoriteState(getFavoriteState())
    }

    window.addEventListener('planAssisteFavoritesUpdated', syncFavorites)
    window.addEventListener('storage', syncFavorites)
    return () => {
      window.removeEventListener('planAssisteFavoritesUpdated', syncFavorites)
      window.removeEventListener('storage', syncFavorites)
    }
  }, [])

  const visibleNews = [...portalNews]
    .filter((item) => category === 'Todas' || item.category === category)
    .filter((item) => !loggedIn || !onlyFavorites || favoriteState.favoriteNewsIds.includes(item.id))
    .filter((item) => {
      const value = newsDateValue(item.date)
      const start = inputDateValue(startDate)
      const end = inputDateValue(endDate)
      if (start !== undefined && end === undefined) return value === start
      return (start === undefined || value >= start) && (end === undefined || value <= end)
    })
    .filter((item) => {
      const search = query.trim().toLowerCase()
      if (!search) return true
      return `${item.title} ${item.category}`.toLowerCase().includes(search)
    })
    .sort((first, second) => newsDateValue(second.date) - newsDateValue(first.date))
  const totalPages = Math.max(1, Math.ceil(visibleNews.length / newsPerPage))
  const currentPage = Math.min(page, totalPages)
  const paginatedNews = visibleNews.slice((currentPage - 1) * newsPerPage, currentPage * newsPerPage)

  function clearFilters() {
    setCategory('Todas')
    setOnlyFavorites(false)
    setStartDate('')
    setEndDate('')
    setQuery('')
    setPage(1)
    setSearchParams({})
  }

  function changePage(nextPage: number) {
    setPage(nextPage)
    window.setTimeout(() => {
      document.querySelector('.request-results-heading')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 0)
  }

  return (
    <PublicShell loggedIn={loggedIn} onLogout={onLogout}>
      <main className="container public-page news-page">
        <PublicBreadcrumb current="Notícias" />
        <section className="simple-page-heading">
          <h1>Notícias do Plan-Assiste</h1>
          <p>Acompanhe comunicados, novidades institucionais, orientações para beneficiários e informações para credenciados.</p>
        </section>

        <section className={`request-toolbar news-toolbar ${loggedIn ? 'logged-in' : 'logged-out'} ${startDate && endDate ? 'is-range' : ''}`} aria-label="Filtros de notícias">
          <label className="news-search-field">
            Buscar
            <span className="field-with-icon">
              <Search aria-hidden="true" />
              <input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1) }} placeholder="Título ou assunto" />
            </span>
          </label>
          <label>
            Categoria
            <select value={category} onChange={(event) => { setCategory(event.target.value); setPage(1) }}>
              {categories.map((item) => <option value={item} key={item}>{item === 'Todas' ? item : formatNewsCategory(item)}</option>)}
            </select>
          </label>
          <label className="news-date-field">
            Data
            <NewsDateRangePicker
              startDate={startDate}
              endDate={endDate}
              onChange={(nextStartDate, nextEndDate) => {
                setStartDate(nextStartDate)
                setEndDate(nextEndDate)
                setPage(1)
              }}
            />
          </label>
          <button className="filter-clear-button" type="button" onClick={clearFilters}>Limpar filtros</button>
        </section>

        <ResultsHeader
          title="Resultados"
          countLabel={`${visibleNews.length} ${visibleNews.length === 1 ? 'notícia encontrada' : 'notícias encontradas'}`}
          displayOptions={loggedIn ? [{ value: 'all', label: 'Todas' }, { value: 'favorites', label: 'Favoritas' }] : undefined}
          displayValue={loggedIn ? (onlyFavorites ? 'favorites' : 'all') : undefined}
          onDisplayChange={loggedIn ? (value) => { setOnlyFavorites(value === 'favorites'); setPage(1) } : undefined}
          extraActions={<a className="news-rss-link" href="/noticias.rss.xml" target="_blank" rel="noreferrer">RSS <ExternalLink aria-hidden="true" /></a>}
        />

        <section className="news-grid news-grid-four" aria-label="Lista de notícias">
          {paginatedNews.map((item) => (
            <NewsCard
              key={item.id}
              {...item}
              favorite={loggedIn && favoriteState.favoriteNewsIds.includes(item.id)}
              onFavorite={loggedIn ? () => setFavoriteState(toggleFavoriteNews(item.id)) : undefined}
            />
          ))}
        </section>
        {visibleNews.length > newsPerPage && (
          <nav className="provider-pagination news-pagination" aria-label="Paginação de notícias">
            <button type="button" onClick={() => changePage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>
              Anterior
            </button>
            {Array.from({ length: totalPages }).map((_, index) => {
              const pageNumber = index + 1
              return (
                <button
                  type="button"
                  key={pageNumber}
                  className={pageNumber === currentPage ? 'selected' : ''}
                  aria-current={pageNumber === currentPage ? 'page' : undefined}
                  onClick={() => changePage(pageNumber)}
                >
                  {pageNumber}
                </button>
              )
            })}
            <button type="button" onClick={() => changePage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}>
              Próxima
            </button>
          </nav>
        )}
      </main>
    </PublicShell>
  )
}

export function NewsDetailPage({ loggedIn, onLogout }: PublicPageProps) {
  const { id } = useParams()
  const portalNews = getPortalNews()
  const item = portalNews.find((newsItem) => newsItem.id === id)
  const [favoriteState, setFavoriteState] = useState<FavoriteState>(() => getFavoriteState())
  const [shareStatus, setShareStatus] = useState('')

  useEffect(() => {
    function syncFavorites() {
      setFavoriteState(getFavoriteState())
    }

    window.addEventListener('planAssisteFavoritesUpdated', syncFavorites)
    window.addEventListener('storage', syncFavorites)
    return () => {
      window.removeEventListener('planAssisteFavoritesUpdated', syncFavorites)
      window.removeEventListener('storage', syncFavorites)
    }
  }, [])

  if (!item) return <Navigate to="/noticias" replace />
  const currentItem = item

  const relatedNews = portalNews
    .filter((newsItem) => newsItem.id !== currentItem.id)
    .filter((newsItem) => newsItem.category === currentItem.category)
    .slice(0, 3)
  const fallbackRelatedNews = portalNews
    .filter((newsItem) => newsItem.id !== currentItem.id)
    .filter((newsItem) => !relatedNews.some((relatedItem) => relatedItem.id === newsItem.id))
    .slice(0, 3)
  const relatedItems = [...relatedNews, ...fallbackRelatedNews].slice(0, 3)
  const favorite = favoriteState.favoriteNewsIds.includes(currentItem.id)
  const newsCategoryLink = `/noticias?categoria=${encodeURIComponent(currentItem.category)}`

  function shareNews() {
    const url = window.location.href
    if (navigator.share) {
      navigator.share({ title: currentItem.title, text: currentItem.summary, url }).catch(() => undefined)
      return
    }

    navigator.clipboard?.writeText(url)
    setShareStatus('Link copiado para a área de transferência.')
  }

  return (
    <PublicShell loggedIn={loggedIn} onLogout={onLogout}>
      <main className="container public-page">
        <PublicBreadcrumb current={currentItem.title} parent={{ label: 'Notícias', to: '/noticias' }} />

        <div className="public-content-layout">
          <NewsSidebar currentItem={currentItem} loggedIn={loggedIn} />

          <div className="public-content-main news-detail-main">
            <article className="news-detail">
              <img className="news-detail-image" src={currentItem.image} alt="" />

              <header className="news-detail-header news-detail-header-compact">
                <h1>{currentItem.title}</h1>
                <p>{currentItem.summary}</p>
                <div className="news-detail-meta">
                  <time className="news-date-label"><CalendarDays aria-hidden="true" /> {currentItem.date}</time>
                  <div className="news-detail-actions">
                    {loggedIn && (
                      <button
                        type="button"
                        className={`provider-circle-action news-detail-favorite-button ${favorite ? 'is-favorite' : ''}`}
                        onClick={() => setFavoriteState(toggleFavoriteNews(currentItem.id))}
                        aria-label={favorite ? 'Remover notícia dos favoritos' : 'Adicionar notícia aos favoritos'}
                        aria-pressed={favorite}
                      >
                        <Heart aria-hidden="true" />
                      </button>
                    )}
                    <button type="button" onClick={shareNews}>
                      <Share2 aria-hidden="true" /> Compartilhar
                    </button>
                    <button type="button" onClick={() => window.print()}>
                      <Printer aria-hidden="true" /> Imprimir
                    </button>
                  </div>
                </div>
                {shareStatus && <span className="news-share-status" role="status">{shareStatus}</span>}
              </header>

              <section className="news-detail-body">
                {currentItem.bodyImageUrl && <img className="news-detail-inline-image" src={currentItem.bodyImageUrl} alt="" />}
                {currentItem.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                <div className="news-detail-category">
                  <strong>Categoria:</strong>
                  <Link className="request-category" to={newsCategoryLink}>
                    {formatNewsCategory(currentItem.category)}
                  </Link>
                </div>
              </section>
            </article>

            <section className="news-related" aria-label="Notícias relacionadas">
              <div className="section-heading">
                <h2>Notícias relacionadas</h2>
                <Link className="text-link" to={newsCategoryLink}>Ver mais <ArrowRight aria-hidden="true" /></Link>
              </div>
              <div className="news-grid news-detail-related-grid">
                {relatedItems.map((related) => (
                  <CompactNewsCard item={related} key={related.id} />
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </PublicShell>
  )
}

function CompactNewsCard({ item }: { item: NewsItem }) {
  return (
    <Link className="compact-news-card" to={`/noticias/${item.id}`}>
      <img src={item.image} alt="" />
      <span>{formatNewsCategory(item.category)}</span>
      <h3>{item.title}</h3>
      <time className="news-date-label"><CalendarDays aria-hidden="true" /> {item.date}</time>
    </Link>
  )
}

type SearchResult = {
  title: string
  description: string
  category: string
  to: string
  externalUrl?: string
  favoriteType?: 'news' | 'service' | 'provider'
  favoriteId?: string
}

export function NewsDateRangePicker({
  startDate,
  endDate,
  onChange,
}: {
  startDate: string
  endDate: string
  onChange: (nextStartDate: string, nextEndDate: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const baseDate = startDate ? new Date(`${startDate}T00:00:00`) : new Date()
    return new Date(baseDate.getFullYear(), baseDate.getMonth(), 1)
  })
  const monthFormatter = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' })
  const selectedStart = inputDateValue(startDate)
  const selectedEnd = inputDateValue(endDate)
  const monthStart = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1)
  const firstWeekday = monthStart.getDay()
  const daysInMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate()
  const calendarDays = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), index + 1)),
  ]
  const label = startDate
    ? endDate
      ? `${formatDisplayDate(startDate)} - ${formatDisplayDate(endDate)}`
      : formatDisplayDate(startDate)
    : 'Selecionar'

  function dateValueForInput(date: Date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  function selectDate(date: Date) {
    const nextDate = dateValueForInput(date)
    if (!startDate || endDate) {
      onChange(nextDate, '')
      return
    }

    if (nextDate === startDate) {
      setOpen(false)
      return
    }

    if (nextDate < startDate) {
      onChange(nextDate, startDate)
    } else {
      onChange(startDate, nextDate)
    }
    setOpen(false)
  }

  function changeMonth(offset: number) {
    setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + offset, 1))
  }

  function clearDates() {
    onChange('', '')
    setOpen(false)
  }

  return (
    <div className="news-date-picker">
      <button type="button" className="news-date-trigger" onClick={() => setOpen(!open)} aria-expanded={open}>
        <CalendarDays aria-hidden="true" />
        <span>{label}</span>
      </button>
      {open && (
        <div className="news-date-popover">
          <div className="news-date-popover-heading">
            <button type="button" onClick={() => changeMonth(-1)} aria-label="Mês anterior">‹</button>
            <strong>{monthFormatter.format(visibleMonth)}</strong>
            <button type="button" onClick={() => changeMonth(1)} aria-label="Próximo mês">›</button>
          </div>
          <div className="news-date-weekdays" aria-hidden="true">
            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}
          </div>
          <div className="news-date-grid">
            {calendarDays.map((date, index) => {
              if (!date) return <span key={`empty-${index}`} />
              const value = dateValueForInput(date)
              const time = inputDateValue(value)
              const selected = value === startDate || value === endDate
              const inRange = Boolean(selectedStart && selectedEnd && time && time > selectedStart && time < selectedEnd)
              return (
                <button
                  type="button"
                  key={value}
                  className={`${selected ? 'selected' : ''} ${inRange ? 'in-range' : ''}`}
                  onClick={() => selectDate(date)}
                >
                  {date.getDate()}
                </button>
              )
            })}
          </div>
          <div className="news-date-actions">
            <button type="button" onClick={clearDates}>Limpar data</button>
          </div>
        </div>
      )}
    </div>
  )
}

function resultPrimaryCategory(category: string) {
  if (category.startsWith('Notícias')) return 'Notícias'
  if (category.startsWith('Serviços')) return 'Serviços'
  if (category === 'Atendimento') return 'Suporte'
  return category
}

export function SearchPage({ loggedIn, onLogout }: PublicPageProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const selectedFilter = searchParams.get('tipo') || 'Todos'
  const normalizedQuery = normalizeSearch(query.trim())
  const [draft, setDraft] = useState(query)
  const [onlyFavorites, setOnlyFavorites] = useState(false)
  const [favoriteState, setFavoriteState] = useState<FavoriteState>(() => getFavoriteState())

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDraft(query)
    }, 0)

    return () => window.clearTimeout(timer)
  }, [query])

  useEffect(() => {
    function syncFavorites() {
      setFavoriteState(getFavoriteState())
    }

    window.addEventListener('planAssisteFavoritesUpdated', syncFavorites)
    window.addEventListener('storage', syncFavorites)
    return () => {
      window.removeEventListener('planAssisteFavoritesUpdated', syncFavorites)
      window.removeEventListener('storage', syncFavorites)
    }
  }, [])

  const allResults: SearchResult[] = [
    ...planAssisteArticles.map((article) => ({
      title: article.navigationTitle,
      description: article.summary,
      category: 'Plan-Assiste',
      to: `/plan-assiste/${article.slug}`,
    })),
    ...news.map((item) => ({
      title: item.title,
      description: item.summary,
      category: `Notícias - ${formatNewsCategory(item.category)}`,
      to: `/noticias/${item.id}`,
      favoriteType: 'news' as const,
      favoriteId: item.id,
    })),
    ...beneficiaryRequests.map((request) => ({
      title: request.title,
      description: request.description,
      category: `Serviços - ${request.category}`,
      to: request.route || '/beneficiario/servicos',
      externalUrl: request.externalUrl,
      favoriteType: 'service' as const,
      favoriteId: request.id,
    })),
    ...beneficiaryServices.map((service) => ({
      title: service.title,
      description: 'Serviço em destaque para beneficiários do Plan-Assiste.',
      category: 'Serviços para beneficiários',
      to: service.route || '/beneficiario/servicos',
      externalUrl: service.externalUrl,
    })),
    ...providerServices.map((service) => ({
      title: service.title,
      description: 'Serviço em destaque para credenciados credenciados ou em credenciamento.',
      category: 'Serviços para credenciados',
      to: service.route || '/credenciado',
    })),
    ...providers.map((provider) => ({
      title: provider.name,
      description: `${provider.category} em ${provider.address.city}/${provider.address.state}. ${provider.specialties.join(', ')}.`,
      category: 'Rede credenciada',
      to: `/rede-credenciada/credenciado/${provider.id}`,
      favoriteType: 'provider' as const,
      favoriteId: provider.id,
    })),
    {
      title: 'Fale conosco',
      description: 'Canais de atendimento, dúvidas frequentes, WhatsApp e manifestações do Plan-Assiste.',
      category: 'Atendimento',
      to: '/fale-conosco',
    },
    {
      title: 'Torne-se beneficiário',
      description: 'Orientações sobre elegibilidade, documentos e próximos passos para adesão.',
      category: 'Beneficiários',
      to: '/plan-assiste/beneficiarios/torne-se-beneficiario',
    },
  ]

  function isFavoriteResult(result: SearchResult) {
    if (!result.favoriteId || !result.favoriteType) return false
    if (result.favoriteType === 'news') return favoriteState.favoriteNewsIds.includes(result.favoriteId)
    if (result.favoriteType === 'service') return favoriteState.favoriteServiceIds.includes(result.favoriteId)
    return favoriteState.favoriteProviderIds.includes(result.favoriteId)
  }

  const queryResults = normalizedQuery
    ? allResults.filter((result) => normalizeSearch(`${result.title} ${result.description} ${result.category}`).includes(normalizedQuery))
    : allResults
  const matchedResults = loggedIn && onlyFavorites
    ? queryResults.filter(isFavoriteResult)
    : normalizedQuery ? queryResults : queryResults.slice(0, 8)
  const availableFilters = ['Todos', ...Array.from(new Set(matchedResults.map((result) => resultPrimaryCategory(result.category))))]
  const activeFilter = availableFilters.includes(selectedFilter) ? selectedFilter : 'Todos'
  const results = activeFilter === 'Todos'
    ? matchedResults
    : matchedResults.filter((result) => resultPrimaryCategory(result.category) === activeFilter)

  function submitSearch(event: React.FormEvent) {
    event.preventDefault()
    const nextQuery = draft.trim()
    setSearchParams(nextQuery ? { q: nextQuery } : {})
  }

  function applyResultFilter(filter: string) {
    const nextParams: Record<string, string> = {}
    if (query) nextParams.q = query
    if (filter !== 'Todos') nextParams.tipo = filter
    setSearchParams(nextParams)
  }

  return (
    <PublicShell loggedIn={loggedIn} onLogout={onLogout}>
      <main className="container public-page search-page">
        <PublicBreadcrumb current="Busca" />
        <section className="public-hero">
          <p className="eyebrow">Busca</p>
          <h1>Pesquisar no portal</h1>
          <p>Encontre notícias, serviços, credenciados, canais de atendimento e páginas institucionais.</p>
        </section>

        <form className="portal-search-panel" onSubmit={submitSearch}>
          <label>
            Termo de busca
            <span className="field-with-icon">
              <Search aria-hidden="true" />
              <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Digite o que você procura" />
            </span>
          </label>
          <button className="primary-button" type="submit">Buscar</button>
        </form>

        <ResultsHeader
          title="Resultados"
          countLabel={`${results.length} ${results.length === 1 ? 'item encontrado' : 'itens encontrados'}`}
          displayOptions={loggedIn ? [{ value: 'all', label: 'Todos' }, { value: 'favorites', label: 'Favoritos' }] : undefined}
          displayValue={loggedIn ? (onlyFavorites ? 'favorites' : 'all') : undefined}
          onDisplayChange={loggedIn ? (value) => setOnlyFavorites(value === 'favorites') : undefined}
        />

        <div className="search-result-filters topic-filter-buttons" aria-label="Filtrar resultados por área">
          {availableFilters.map((filter) => (
            <button
              type="button"
              key={filter}
              className={activeFilter === filter ? 'selected' : ''}
              onClick={() => applyResultFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>

        <section className="search-result-list" aria-label="Resultados da busca">
          {results.map((result) => {
            const content = (
              <>
                <span className="request-category">{result.category}</span>
                <h2>{result.title}</h2>
                <p>{result.description}</p>
                <strong>Abrir <ArrowRight aria-hidden="true" /></strong>
              </>
            )

            return result.externalUrl ? (
              <a className="search-result-item" href={result.externalUrl} target="_blank" rel="noreferrer" key={`${result.category}-${result.title}`}>
                {content}
              </a>
            ) : (
              <Link className="search-result-item" to={result.to} key={`${result.category}-${result.title}`}>
                {content}
              </Link>
            )
          })}
          {results.length === 0 && (
            <div className="empty-state compact-empty">
              <Search aria-hidden="true" />
              <h2>Nenhum resultado encontrado</h2>
              <p>Revise o termo pesquisado ou tente uma palavra mais ampla.</p>
            </div>
          )}
        </section>
      </main>
    </PublicShell>
  )
}

const infoPageContent = {
  lgpd: {
    eyebrow: 'LGPD',
    title: 'Lei Geral de Proteção de Dados',
    description: 'Política de tratamento de dados pessoais do Plan-Assiste e orientações para titulares de dados.',
    articleSections: [
      {
        title: 'Lei de Proteção de Dados Pessoais',
        paragraphs: [
          'A Lei Geral de Proteção de Dados Pessoais, Lei nº 13.709, de 14 de agosto de 2018, conhecida pela sigla LGPD, estabelece regras para o tratamento de dados pessoais no Brasil e está em vigor desde setembro de 2020. Seu objetivo é proteger os direitos fundamentais de liberdade, privacidade e livre desenvolvimento da personalidade da pessoa natural.',
          'Para fins da LGPD, dado pessoal é qualquer informação relacionada a pessoa natural identificada ou identificável. Isso inclui nome, documentos, endereços eletrônicos, perfis em redes sociais, endereço de IP, dados de localização, cookies de navegação, preferências, hábitos de consumo e outras informações capazes de identificar uma pessoa. A lei também confere proteção especial aos dados pessoais sensíveis, entre eles os dados referentes à saúde.',
        ],
      },
      {
        title: 'Política de tratamento de dados do Plan-Assiste',
        paragraphs: [
          'O Plan-Assiste é o Programa de Saúde e Assistência Social do Ministério Público da União, organizado na modalidade de autogestão, sem fins lucrativos, integrante da estrutura administrativa do MPU. O Programa é custeado pela União e pelas contribuições de seus beneficiários, e tem por finalidade oferecer um conjunto integrado de ações, serviços e benefícios sociais voltados à assistência à saúde de membros, servidores, dependentes e pensionistas, conforme o Regulamento Geral e as normas complementares vigentes.',
          'Esta política é direcionada aos titulares de dados pessoais tratados no âmbito das atividades do Plan-Assiste. Ela registra o compromisso do Programa com a proteção da privacidade, a segurança da informação, a transparência no tratamento de dados e a observância da LGPD, das normas aplicáveis à Administração Pública Federal e da Política de Privacidade e Tratamento de Dados do Ministério Público da União.',
        ],
      },
      {
        title: 'Compromisso com privacidade e segurança',
        paragraphs: [
          'O Plan-Assiste utiliza dados pessoais para cumprir sua finalidade pública e assistir às necessidades de saúde de seus beneficiários. O tratamento é realizado de forma ética, responsável e limitada ao necessário para a execução dos processos de trabalho, para o cumprimento de obrigações legais e regulatórias, para a execução de determinações de governança e controle e para a prestação dos serviços previstos nas normas do Programa.',
          'Os dados pessoais são armazenados em bases vinculadas ao Ministério Público da União e protegidos por procedimentos de segurança voltados à confidencialidade, integridade e disponibilidade das informações, conforme as políticas de tecnologia da informação dos ramos do MPU. O Programa repudia o tratamento de dados para fins discriminatórios, ilícitos ou abusivos, dissemina a cultura de sigilo e privacidade e adota controles internos para prevenir, identificar e tratar situações de uso indevido de informações pessoais.',
        ],
      },
      {
        title: 'Direitos dos titulares',
        paragraphs: [
          'O titular de dados pode apresentar solicitações relacionadas ao tratamento de suas informações pessoais, inclusive pedidos de anonimização, bloqueio ou eliminação de dados desnecessários, excessivos ou tratados em desconformidade com a legislação. O atendimento desses pedidos observará as obrigações legais, a finalidade pública do Programa e a viabilidade de continuidade dos serviços de assistência à saúde.',
          'Como o Plan-Assiste integra a estrutura do Ministério Público da União e não possui personalidade jurídica própria, as solicitações devem ser direcionadas ao encarregado de dados do respectivo ramo do MPU. O Plan-Assiste atuará no tratamento da demanda sempre que ela envolver seus processos de trabalho e suas bases de dados.',
        ],
      },
      {
        title: 'Bases legais e hipóteses de tratamento',
        paragraphs: [
          'O tratamento de dados pessoais pelo Plan-Assiste ocorre quando houver autorização legal e necessidade para o atendimento da finalidade pública do Programa. As bases legais abrangem, entre outras hipóteses, o cumprimento de obrigação legal ou regulatória, a execução de políticas públicas, o exercício regular de direitos em processos administrativos ou judiciais, a proteção da vida ou da incolumidade física, a tutela da saúde e o atendimento de interesses legítimos, desde que não prevaleçam direitos e liberdades fundamentais do titular.',
          'No caso de dados pessoais sensíveis, inclusive dados de saúde, o tratamento decorre da própria necessidade de prestação da assistência e é limitado por deveres de sigilo, segurança e guarda adequada. A regra geral de consentimento prevista na LGPD deve ser interpretada em conjunto com as hipóteses legais específicas aplicáveis à Administração Pública e aos serviços de saúde.',
        ],
      },
      {
        title: 'Compartilhamento de dados',
        paragraphs: [
          'Por atuar como sistema de autogestão em saúde, o Plan-Assiste mantém relacionamento com hospitais, clínicas, laboratórios, profissionais de saúde e outras entidades necessárias à operação do Programa. O compartilhamento de dados ocorre na medida necessária para viabilizar a assistência à saúde, administrar o Programa, executar contratos, termos de credenciamento e demais vínculos jurídicos, cumprir determinações legais ou atender ordens de autoridades competentes.',
          'Também poderá haver compartilhamento com órgãos governamentais, consultores e terceiros quando indispensável ao cumprimento da legislação, à cooperação institucional, à investigação de atividades irregulares, à defesa de direitos ou à proteção da segurança e integridade dos serviços, sempre observadas as salvaguardas aplicáveis e o princípio da necessidade.',
        ],
      },
      {
        title: 'Cookies e cuidados do usuário',
        paragraphs: [
          'A política de cookies aplicada ao site do Plan-Assiste segue a política utilizada pelo Ministério Público Federal, administrador do ambiente eletrônico. Ao acessar o portal, o usuário deve ser informado sobre a coleta de informações do dispositivo e da navegação, especialmente para permitir funcionalidades, melhorar o funcionamento técnico das páginas e mensurar a audiência do website.',
          'Para proteger seus dados pessoais, utilize apenas os canais oficiais do Plan-Assiste para tratar de assuntos relacionados à assistência à saúde. Evite acessar o site ou os portais do Programa por links recebidos por e-mail, SMS, WhatsApp, Telegram ou outras fontes não institucionais. Mantenha navegador e antivírus atualizados, revise seus dados cadastrais sempre que houver alteração e observe as orientações de segurança das áreas de tecnologia da informação dos ramos do MPU.',
        ],
      },
      {
        title: 'Encarregado de dados e atualização da política',
        paragraphs: [
          'Cada ramo do Ministério Público da União deve possuir encarregado de dados responsável por receber comunicações dos titulares, prestar esclarecimentos, adotar providências, receber comunicações da Autoridade Nacional de Proteção de Dados e orientar servidores, colaboradores e contratados sobre práticas de proteção de dados pessoais.',
          'Dúvidas, solicitações ou reclamações relacionadas ao tratamento de dados pessoais devem ser encaminhadas ao encarregado de dados do respectivo ramo do MPU, conforme os canais institucionais disponibilizados pelo MPF, MPDFT, MPT e MPM. Esta política poderá ser revista sempre que necessário, e eventuais alterações deverão ser publicadas de forma visível no website do Plan-Assiste.',
        ],
      },
    ],
  },
  privacidade: {
    eyebrow: 'Privacidade',
    title: 'LGPD e privacidade',
    description: 'Informações sobre tratamento de dados pessoais, segurança e canais relacionados à privacidade.',
    sections: [
      ['Dados protegidos', 'O Portal deve tratar informações pessoais apenas para finalidades vinculadas aos serviços do Plan-Assiste e aos canais oficiais de atendimento.'],
      ['Transparência', 'As páginas e formulários devem indicar quando uma informação é necessária, como será usada e qual canal pode esclarecer dúvidas.'],
      ['Cookies', 'Preferências de cookies e privacidade devem ser apresentadas em linguagem clara e com opção de revisão pelo usuário.'],
    ],
  },
  acessibilidade: {
    eyebrow: 'Acessibilidade',
    title: 'Acessibilidade',
    description: 'Recursos e orientações para uso do Portal por diferentes perfis de pessoas usuárias.',
    sections: [
      ['Contraste', 'O Portal oferece alternância de alto contraste e preserva foco visível para navegação por teclado.'],
      ['Leitura e navegação', 'A estrutura usa cabeçalhos, rótulos e textos alternativos para tornar os fluxos mais compreensíveis.'],
      ['VLibras', 'O widget VLibras permanece disponível para apoiar a comunicação em Libras.'],
    ],
  },
  mapa: {
    eyebrow: 'Mapa do site',
    title: 'Mapa do site',
    description: 'Consulte a estrutura do Portal organizada conforme o perfil de acesso.',
    sections: [
      ['Público', 'Início; O Plan-Assiste; Beneficiários; Credenciados; Rede credenciada; Transparência; Notícias; Fale conosco; Aplicativo; Busca; Acessibilidade; Privacidade.'],
      ['Credenciados', 'Visão geral; Autorizações; Faturamento; Demonstrativos; Guias; Dados cadastrais; Notícias e orientações da rede.'],
      ['Beneficiário', 'Visão geral; Catálogo de serviços; Minhas solicitações; Nova solicitação; Carteirinhas; Rede credenciada; Reembolso e auxílios; Despesas e custeios; Dependentes; Dados; Favoritos; Notificações.'],
      ['Área da equipe', 'Visão geral; Gestão operacional; Administração do portal; Notícias; Banners; Páginas; Mídia; Arquivos; Base de conhecimento.'],
      ['Beneficiário e área da equipe', 'Acesso combinado às funcionalidades do beneficiário e às ferramentas internas autorizadas para integrantes da equipe.'],
    ],
  },
}

export function StaticInfoPage({
  loggedIn,
  onLogout,
  page,
}: PublicPageProps & { page: keyof typeof infoPageContent }) {
  const content = infoPageContent[page]

  return (
    <PublicShell loggedIn={loggedIn} onLogout={onLogout}>
      <main className="container public-page">
        <PublicBreadcrumb current={content.title} />
        <section className="public-hero">
          <p className="eyebrow">{content.eyebrow}</p>
          <h1>{content.title}</h1>
          <p>{content.description}</p>
        </section>
        {'articleSections' in content ? (
          <article className="info-longform">
            {content.articleSections.map((section) => (
              <section key={section.title}>
                <h2>{section.title}</h2>
                {section.paragraphs.map((paragraph) => <p key={paragraph}>{linkifyEmails(paragraph)}</p>)}
              </section>
            ))}
          </article>
        ) : (
          <section className="info-page-grid">
            {content.sections.map(([title, text]) => (
              <article key={title}>
                <CheckCircle2 aria-hidden="true" />
                <h2>{title}</h2>
                <p>{linkifyEmails(text)}</p>
              </article>
            ))}
          </section>
        )}
      </main>
    </PublicShell>
  )
}

export function AppGuidePage({ loggedIn, onLogout }: PublicPageProps) {
  return (
    <PublicShell loggedIn={loggedIn} onLogout={onLogout}>
      <main className="container public-page">
        <PublicBreadcrumb current="Aplicativo" />
        <section className="public-hero">
          <p className="eyebrow">Aplicativo</p>
          <h1>Aplicativo do Plan-Assiste</h1>
          <p>Acesse carteirinhas, rede credenciada, notificações e serviços no celular.</p>
        </section>
        <section className="info-page-grid">
          {[
            ['Carteirinhas digitais', 'Consulte e apresente a carteirinha do titular e dos dependentes.'],
            ['Rede credenciada', 'Localize credenciados e serviços disponíveis com mais praticidade.'],
            ['Notificações', 'Acompanhe avisos importantes, pendências e comunicados do Programa.'],
          ].map(([title, text]) => (
            <article key={title}>
              <Smartphone aria-hidden="true" />
              <h2>{title}</h2>
              <p>{text}</p>
            </article>
          ))}
        </section>
      </main>
    </PublicShell>
  )
}

const providerPublicSections = [
  ['credenciamento', 'Credenciamento', 'Consulte orientações para credenciamento, renovação e documentação de pessoas físicas e jurídicas.'],
  ['autorizacoes', 'Autorizações', 'Acesse autorização eletrônica, eletiva, de urgência e emergência, além de guias e orientações.'],
  ['faturas', 'Faturas', 'Veja orientações sobre envio de faturas, notas fiscais, documentação e recurso de glosa.'],
  ['portal-tiss', 'Portal TISS', 'Acesse o ambiente operacional para autorizações, faturamento e acompanhamento de serviços.'],
]

export function ProviderPublicPage({ loggedIn, onLogout }: PublicPageProps) {
  return (
    <PublicShell loggedIn={loggedIn} onLogout={onLogout}>
      <main className="container public-page provider-public-page">
        <PublicBreadcrumb current="Credenciado" />
        <section className="simple-page-heading">
          <h1>Área do credenciado</h1>
          <p>Encontre orientações de credenciamento, autorizações, faturamento e acesso ao Portal TISS.</p>
        </section>
        <section className="info-page-grid provider-public-grid">
          {providerPublicSections.map(([id, title, text]) => (
            <article id={id} key={id}>
              <FileText aria-hidden="true" />
              <h2>{title}</h2>
              <p>{text}</p>
              <Link className="text-link" to="/credenciado">Acessar área logada <ArrowRight aria-hidden="true" /></Link>
            </article>
          ))}
        </section>
      </main>
    </PublicShell>
  )
}

const providerDashboardNews = [
  {
    title: 'Recurso de glosa com fluxo padronizado',
    text:
      'Recursos de glosa voltaram a ser recebidos eletronicamente no padrão TISS/ANS, por XML gerado no sistema do credenciado.',
    action: 'Ver orientação',
    href: 'https://planassiste.mpu.mp.br/noticias_2_0/plan-assiste-mpu-retoma-o-recebimento-de-recursos-de-glosa-em-conformidade-com-as-exigencias-da-agencia-nacional-de-saude-ans',
  },
  {
    title: 'Autorização web em evolução',
    text:
      'A manutenção programada do sistema de autorização web reforça a modernização e a segurança do ambiente usado por hospitais, clínicas e laboratórios.',
    action: 'Acompanhar avisos',
    href: 'https://planassiste.mpu.mp.br/todas-as-noticias',
  },
  {
    title: 'Rede credenciada em expansão',
    text:
      'O Programa segue ampliando o credenciamento nacional, com novas oportunidades para credenciados qualificados e maior cobertura aos beneficiários.',
    action: 'Consultar notícias',
    href: 'https://planassiste.mpu.mp.br/todas-as-noticias',
  },
]

const teamDashboardNews = [
  {
    title: 'Fechamento mensal com checklist integrado',
    text:
      'As equipes regionais devem revisar pendências de faturamento, autorizações e conformidade documental antes do fechamento operacional do mês.',
    action: 'Abrir área da equipe',
    href: '/area-da-equipe',
  },
  {
    title: 'Atualização de materiais internos',
    text:
      'Novas orientações de credenciamento, cadastro e faturamento foram organizadas na Gestão da informação para consulta das equipes autorizadas.',
    action: 'Ver conteúdos',
    href: '/area-da-equipe/gestao-da-informacao',
  },
  {
    title: 'Administração do portal em revisão',
    text:
      'Banners, notícias e base de conhecimento devem seguir o padrão editorial do portal, com linguagem clara, dados atualizados e foco no usuário.',
    action: 'Acessar painel',
    href: '/area-da-equipe/administracao-do-portal',
  },
]

const providerDashboardCards = [
  ['autorizacoes', 'Autorizações', 'Consulte guias, autorizações e orientações para atendimento aos beneficiários.', ClipboardCheck, '/credenciado/autorizacoes'],
  ['faturamento', 'Faturamento', 'Acesse orientações sobre faturas, notas fiscais e envio de documentação.', FileText, '/credenciado/faturamento'],
  ['portal-tiss', 'Portal TISS', 'Entre no ambiente operacional para serviços eletrônicos do credenciado.', MonitorCheck, 'https://sistema.planassiste.mpu.mp.br/portaltiss/login.aspx'],
  ['renovar-credenciamento', 'Renovar credenciamento', 'Acompanhe situação cadastral, documentos e orientações para renovação.', Building2, '/plan-assiste/como-se-credenciar-ou-renovar'],
] as const

const providerAuthorizationLinks = [
  {
    text: 'Manual Autorizador Web.',
    href: '/assets/prestadores/autorizacoes/manual-autorizador-web-v3.pdf',
    download: 'manual-autorizador-web-v3.pdf',
    label: 'baixar',
  },
]

const providerGuideLinks = [
  {
    text: 'guia de solicitação de internação;',
    href: '/assets/prestadores/autorizacoes/guia-solicitacao-internacao.pdf',
    download: 'guia-solicitacao-internacao.pdf',
    label: 'baixar',
  },
  {
    text: 'guia de solicitação de internação preenchível;',
    href: '/assets/prestadores/autorizacoes/guia-solicitacao-internacao-preenchivel.pdf',
    download: 'guia-solicitacao-internacao-preenchivel.pdf',
    label: 'baixar',
  },
  {
    text: 'guia de SP/SADT;',
    href: '/assets/prestadores/autorizacoes/guia-sp-sadt.pdf',
    download: 'guia-sp-sadt.pdf',
    label: 'baixar',
  },
  {
    text: 'guia de SP/SADT preenchível;',
    href: '/assets/prestadores/autorizacoes/guia-sp-sadt-preenchivel.pdf',
    download: 'guia-sp-sadt-preenchivel.pdf',
    label: 'baixar',
  },
  {
    text: 'guia de tratamento odontológico;',
    href: '/assets/prestadores/autorizacoes/guia-tratamento-odontologico.pdf',
    download: 'guia-tratamento-odontologico.pdf',
    label: 'baixar',
  },
  {
    text: 'guia de tratamento odontológico preenchível;',
    href: '/assets/prestadores/autorizacoes/guia-tratamento-odontologico-preenchivel.pdf',
    download: 'guia-tratamento-odontologico-preenchivel.pdf',
    label: 'baixar',
  },
  {
    text: 'guia de consulta;',
    href: '/assets/prestadores/autorizacoes/guia-consulta.pdf',
    download: 'guia-consulta.pdf',
    label: 'baixar',
  },
  {
    text: 'guia de consulta preenchível.',
    href: '/assets/prestadores/autorizacoes/guia-consulta-preenchivel.pdf',
    download: 'guia-consulta-preenchivel.pdf',
    label: 'baixar',
  },
]

const providerBillingPortalLinks = [
  {
    text: 'Manual Portal TISS;',
    href: '/assets/prestadores/faturamento/manual-portal-tiss-v3.pdf',
    download: 'manual-portal-tiss-v3.pdf',
    label: 'baixar',
  },
  {
    text: 'manual demonstrativo de motivo de devoluções - Portal TISS;',
    href: '/assets/prestadores/faturamento/manual-demonstrativo-devolucoes-plan-assiste.pdf',
    download: 'manual-demonstrativo-devolucoes-plan-assiste.pdf',
    label: 'baixar',
  },
  {
    text: 'suporte para problemas de login e senha: seplan-nusup@mpu.mp.br;',
  },
  {
    text: 'dúvidas sobre envio de documentos: seplan-faturamento@mpu.mp.br.',
  },
]

const providerBillingProtocolLinks = [
  {
    text: 'tutorial para envio de faturas pelo Protocolo Eletrônico do MPF;',
    href: '/assets/prestadores/faturamento/tutorial-envio-faturas-protocolo-mpf.pdf',
    download: 'tutorial-envio-faturas-protocolo-mpf.pdf',
    label: 'baixar',
  },
]

// eslint-disable-next-line react-refresh/only-export-components
export function getDefaultOrgHierarchy() {
  return [...seplanHierarchy]
}

// eslint-disable-next-line react-refresh/only-export-components
export function getDefaultOrgCmsItems(): NonNullable<CmsBlock['organizationItems']> {
  return seplanHierarchy.map((item, index) => {
    const parsed = parseHierarchyItem(item)
    const { unitName, acronym } = splitOrgUnitLabel(parsed.label)
    const contact = orgHierarchyContacts[parsed.id]
    return { id: `org-default-${index}`, label: unitName, acronym, responsible: contact?.name || '', email: contact?.email || '', level: parsed.level }
  })
}

function escapeCmsHtml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function formatCmsEditorialText(value: string) {
  return escapeCmsHtml(value)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\((\/[^)]+)\)/g, '<a href="$2">$1</a>')
}

function formatCmsEditorialBullet(value: string) {
  const formatted = formatCmsEditorialText(value)
  if (value.includes('**')) return formatted
  return formatted.replace(/^([^:]+:)/, '<strong>$1</strong>')
}

function orderedArticleSections(article?: PortalArticle) {
  if (!article || article.category !== 'Gestão') return article?.sections || []
  const compositionIndex = article.sections.findIndex((section) => section.title === 'Composição')
  const competenceIndex = article.sections.findIndex((section) => section.title === 'Competência')
  if (compositionIndex < 0 || competenceIndex < 0 || compositionIndex < competenceIndex) return article.sections
  const sections = [...article.sections]
  const [composition] = sections.splice(compositionIndex, 1)
  sections.splice(competenceIndex, 0, composition)
  return sections
}

/** Converte o conteúdo incorporado ao protótipo em um rascunho editável do CMS. */
// eslint-disable-next-line react-refresh/only-export-components
export function getPlanAssisteArticleCmsSeed(slug: string): CmsPage | undefined {
  if (slug === 'plan-assiste') {
    const cards = planAssisteSections.flatMap((section) => section.slug === 'institucional'
      ? [section, { slug: 'estrutura-e-governanca', title: 'Estrutura e Governança', summary: 'Organização administrativa, instâncias de decisão, fiscalização, execução e assessoramento técnico.' }]
      : [section])
    const page = createCmsPage('plan-assiste')
    return {
      ...page,
      title: 'Plan-Assiste',
      navigationTitle: 'Plan-Assiste',
      summary: 'Encontre informações institucionais, regras para beneficiários, orientações para credenciados, estrutura de gestão e normas do Programa.',
      status: 'published',
      blocks: cards.map((card) => ({
        ...createCmsBlock('card'),
        cardVariant: 'navigation',
        width: '1/2',
        title: card.title,
        content: `<p>${formatCmsEditorialText(card.summary)}</p>`,
        href: `/plan-assiste/${card.slug}`,
        buttonLabel: 'Acessar',
      })),
    }
  }
  const article = planAssisteArticles.find((item) => item.slug === slug)
  if (!article) return undefined

  const blocks: CmsBlock[] = orderedArticleSections(article).flatMap((section) => {
    const result: CmsBlock[] = []
    const textParts = [
      ...(section.paragraphs || []).map((paragraph) => `<p>${formatCmsEditorialText(paragraph)}</p>`),
      section.bullets?.length
        ? `<ul>${section.bullets.map((bullet) => `<li>${formatCmsEditorialBullet(bullet)}</li>`).join('')}</ul>`
        : '',
      section.table
        ? `<div class="portal-table-wrap"><table class="portal-table"><thead><tr>${section.table.headers.map((header) => `<th>${escapeCmsHtml(header)}</th>`).join('')}</tr></thead><tbody>${section.table.rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeCmsHtml(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`
        : '',
    ].filter(Boolean).join('')

    if ((textParts || section.title) && !section.hierarchy) {
      result.push({ ...createCmsBlock('rich-text'), title: section.title || '', content: textParts })
    }

    if (section.hierarchy) {
      result.push({ ...createCmsBlock('organization'), title: section.title || 'Organograma', organizationItems: getDefaultOrgCmsItems() })
    }

    section.cards?.forEach((card) => {
      result.push({
        ...createCmsBlock('card'),
        cardVariant: card.to ? 'navigation-secondary' : 'information',
        width: section.cards?.length === 2 ? '1/2' : section.cards?.length && section.cards.length >= 4 ? '1/4' : '1/3',
        title: card.title,
        content: `<p>${formatCmsEditorialText(card.text)}</p>${card.bullets?.length ? `<ul>${card.bullets.map((bullet) => `<li>${formatCmsEditorialText(bullet)}</li>`).join('')}</ul>` : ''}`,
        href: card.to,
        buttonLabel: card.actionLabel,
      })
    })

    section.actions?.forEach((action) => {
      result.push({ ...createCmsBlock('document'), title: section.title || action.label, content: '', href: action.href, buttonLabel: action.label })
    })

    section.linkedBullets?.forEach((item) => {
      if (!item.href) return
      result.push({ ...createCmsBlock('document'), title: item.text, content: '', href: item.href, buttonLabel: item.label || (item.download ? 'Baixar' : 'Abrir') })
    })

    if (section.image) {
      result.push({ ...createCmsBlock('rich-text'), title: section.title || '', content: `<figure><img src="${escapeCmsHtml(section.image.src)}" alt="${escapeCmsHtml(section.image.alt)}">${section.image.caption ? `<figcaption>${escapeCmsHtml(section.image.caption)}</figcaption>` : ''}</figure>` })
    }

    return result
  })

  const page = createCmsPage(article.slug)
  return {
    ...page,
    title: article.title,
    navigationTitle: article.navigationTitle,
    summary: article.summary,
    status: 'published',
    blocks: blocks.length ? blocks : page.blocks,
  }
}

const providerBillingCalendarLinks = [
  {
    text: 'calendário de pagamentos 2026;',
    href: '/assets/prestadores/faturamento/calendario-pagamentos-2026-plan-assiste.pdf',
    download: 'calendario-pagamentos-2026-plan-assiste.pdf',
    label: 'baixar',
  },
  {
    text: 'calendário de pagamentos 2025.',
    href: '/assets/prestadores/faturamento/calendario-pagamentos-2025-plan-assiste.pdf',
    download: 'calendario-pagamentos-2025-plan-assiste.pdf',
    label: 'baixar',
  },
]

const providerBillingGlosaLinks = [
  {
    text: 'manual de recurso de glosa;',
    href: '/assets/prestadores/faturamento/manual-recurso-glosa.pdf',
    download: 'manual-recurso-glosa.pdf',
    label: 'baixar',
  },
  {
    text: 'guia para resolver erros na submissão de arquivos XML;',
    href: '/assets/prestadores/faturamento/guia-erros-importacao-xml-recurso-glosa.pdf',
    download: 'guia-erros-importacao-xml-recurso-glosa.pdf',
    label: 'baixar',
  },
  {
    text: 'padrão TISS da ANS;',
    href: 'https://www.gov.br/ans/pt-br/assuntos/prestadores/padrao-para-troca-de-informacao-de-saude-suplementar-2013-tiss',
    external: true,
    label: 'abrir',
  },
]

function ProviderResourceTable({
  items,
  caption,
}: {
  items: Array<{ text: string; href?: string; download?: string; external?: boolean; label?: string }>
  caption: string
}) {
  const resources = items.filter((item) => item.href)

  return (
    <div className="portal-table-wrap document-table-wrap provider-resource-table-wrap">
      <table className="portal-table document-table provider-resource-table">
        <caption className="sr-only">{caption}</caption>
        <thead><tr><th>Nº</th><th>Documento ou recurso</th><th>Ação</th></tr></thead>
        <tbody>
          {resources.map((item, index) => {
            const resourceName = item.text.replace(/[.;]$/, '').replace(/^./, (character) => character.toUpperCase())
            const actionLabel = (item.download ? 'Baixar' : (item.label || 'Abrir')).replace(/^./, (character) => character.toUpperCase())
            return (
              <tr key={`${item.text}-${item.href}`}>
                <td>{index + 1}</td>
                <td>{resourceName}</td>
                <td>
                  <a href={item.href} download={item.download} target={item.external ? '_blank' : undefined} rel={item.external ? 'noreferrer' : undefined} aria-label={`${actionLabel} ${resourceName}`}>
                    {item.download ? <Download aria-hidden="true" /> : <ExternalLink aria-hidden="true" />}
                    <span>{actionLabel}</span>
                  </a>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function DashboardNewsCarousel({
  items,
  eyebrow,
  ariaLabel,
  className = '',
}: {
  items: Array<{ title: string; text: string; action: string; href: string }>
  eyebrow: string
  ariaLabel: string
  className?: string
}) {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const item = items[active]
  const isExternal = item.href.startsWith('http')

  useEffect(() => {
    if (paused) return
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % items.length)
    }, 6500)

    return () => window.clearInterval(timer)
  }, [items.length, paused])

  function previous() {
    setActive((current) => (current - 1 + items.length) % items.length)
  }

  function next() {
    setActive((current) => (current + 1) % items.length)
  }

  return (
    <section
      className={`provider-news-carousel ${className}`}
      aria-roledescription="carrossel"
      aria-label={ariaLabel}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="provider-news-main" aria-live="polite">
        <span className="eyebrow">{eyebrow}</span>
        <h2>{item.title}</h2>
        <p>{item.text}</p>
        {isExternal ? (
        <a className="primary-button" href={item.href} target="_blank" rel="noreferrer">
          {item.action} <ExternalLink aria-hidden="true" />
        </a>
        ) : (
          <Link className="primary-button" to={item.href}>
            {item.action} <ArrowRight aria-hidden="true" />
          </Link>
        )}
      </div>
      <div className="provider-news-controls">
        <button type="button" onClick={previous} aria-label="Notícia anterior">
          <ChevronLeft aria-hidden="true" />
        </button>
        <div className="provider-news-dots" role="tablist" aria-label="Selecionar notícia">
          {items.map((slide, index) => (
            <button
              type="button"
              role="tab"
              key={slide.title}
              className={index === active ? 'is-active' : ''}
              aria-selected={index === active}
              aria-label={`Mostrar notícia: ${slide.title}`}
              onClick={() => setActive(index)}
            />
          ))}
        </div>
        <button type="button" onClick={next} aria-label="Próxima notícia">
          <ChevronRight aria-hidden="true" />
        </button>
      </div>
    </section>
  )
}

function ProviderNewsCarousel() {
  const managed = getCmsSlideshow('provider')
  return (
    <DashboardNewsCarousel
      items={managed.length ? managed.map((item) => ({ title: item.title, text: item.description, action: item.actionLabel, href: item.destination })) : providerDashboardNews}
      eyebrow={managed[0]?.eyebrow || 'Comunicado ao credenciado'}
      ariaLabel="Informações importantes para credenciados"
    />
  )
}

function TeamNewsCarousel() {
  const managed = getCmsSlideshow('team')
  return (
    <DashboardNewsCarousel
      items={managed.length ? managed.map((item) => ({ title: item.title, text: item.description, action: item.actionLabel, href: item.destination })) : teamDashboardNews}
      eyebrow={managed[0]?.eyebrow || 'Comunicado interno'}
      ariaLabel="Informações importantes para a equipe"
      className="team-news-carousel"
    />
  )
}

const providerSidebarGroups: AreaSidebarGroup[] = [
  {
    label: 'Atendimento',
    items: [
      { label: 'Autorizações', to: '/credenciado/autorizacoes', icon: ClipboardCheck },
      { label: 'Faturamento', to: '/credenciado/faturamento', icon: FileText },
      { label: 'Renovar credenciamento', to: '/plan-assiste/como-se-credenciar-ou-renovar', icon: Building2, external: true },
    ],
  },
  {
    label: 'Sistemas',
    items: [
      { label: 'Autorizador Web', to: 'https://sistema.planassiste.mpu.mp.br/autorizadorweb', icon: ClipboardCheck, external: true },
      { label: 'Portal TISS', to: 'https://sistema.planassiste.mpu.mp.br/portaltiss/login.aspx', icon: MonitorCheck, external: true },
    ],
  },
  {
    label: 'Minha conta',
    items: [
      { label: 'Meus dados', to: '/minha-area', icon: UserPlus },
      { label: 'Página do credenciado', to: '/credenciado/pagina-do-credenciado', icon: Globe2 },
    ],
  },
]

const teamSidebarGroups: AreaSidebarGroup[] = [
  {
    label: 'Trabalho',
    items: [
      { label: 'Gestão da informação', to: '/area-da-equipe/gestao-da-informacao', icon: BookOpenCheck },
      { label: 'Administração do Portal', to: '/area-da-equipe/administracao-do-portal', activePath: '/area-da-equipe/administracao-do-portal', icon: Globe2 },
    ],
  },
  {
    label: 'Sistemas',
    items: [
      { label: 'Benner – Produção', to: 'https://sistema.planassiste.mpu.mp.br/AGWEB/Login', icon: MonitorCheck, external: true },
      { label: 'Benner – Homologação', to: 'https://sistema.planassiste.mpu.mp.br/WSTISSHom/Login', icon: MonitorCheck, external: true },
    ],
  },
  {
    label: 'Minha conta',
    items: [{ label: 'Meus dados', to: '/minha-area', icon: UserPlus }],
  },
]

export function RestrictedAreaPageFrame({
  area,
  breadcrumb,
  children,
  loggedIn,
  onLogout,
}: PublicPageProps & {
  area: 'provider' | 'team'
  breadcrumb: string
  children: ReactNode
}) {
  const providerArea = area === 'provider'
  return (
    <PublicShell loggedIn={loggedIn} onLogout={onLogout}>
      <main className={`container public-page ${providerArea ? 'provider-dashboard-page' : 'team-dashboard-page'}`}>
        <PublicBreadcrumb current={breadcrumb} />
        <div className="beneficiary-grid restricted-area-grid">
          <RestrictedAreaSidebar
            area={area}
            homeLabel="Visão geral"
            homePath={providerArea ? '/credenciado' : '/area-da-equipe'}
            groups={providerArea ? providerSidebarGroups : teamSidebarGroups}
            onLogout={onLogout || (() => undefined)}
          />
          <div className="beneficiary-main restricted-area-main">{children}</div>
        </div>
      </main>
    </PublicShell>
  )
}

export function ProviderDashboardPage({ loggedIn, onLogout }: PublicPageProps) {
  return (
    <RestrictedAreaPageFrame area="provider" breadcrumb="Área do credenciado" loggedIn={loggedIn} onLogout={onLogout}>
        <ProviderNewsCarousel />

        <section className="simple-page-heading provider-dashboard-heading">
          <div>
            <h1>Área do credenciado</h1>
            <p>Consulte credenciamento, autorizações, faturamento e serviços do Portal TISS.</p>
          </div>
        </section>

        <section className="info-page-grid provider-dashboard-grid" aria-label="Serviços do credenciado">
          {providerDashboardCards.map(([cardId, title, text, Icon, to]) => {
            const isExternal = to.startsWith('http')
            return (
              <article id={cardId} key={title}>
                <Icon aria-hidden="true" />
                <h2>{title}</h2>
                <p>{text}</p>
                {isExternal ? (
                  <a className="text-link" href={to} target="_blank" rel="noreferrer">
                    Acessar <ExternalLink aria-hidden="true" />
                  </a>
                ) : (
                  <Link className="text-link" to={to}>Acessar <ArrowRight aria-hidden="true" /></Link>
                )}
              </article>
            )
          })}
        </section>
    </RestrictedAreaPageFrame>
  )
}

export function ProviderPublicProfilePage({ loggedIn, onLogout }: PublicPageProps) {
  const [profile, setProfile] = useState<ProviderPublicProfile>(getProviderPublicProfile)
  const [notice, setNotice] = useState('')
  const user = getStoredUserProfile()

  function toggleTag(tag: string) {
    setProfile((current) => ({
      ...current,
      tags: current.tags.includes(tag) ? current.tags.filter((item) => item !== tag) : [...current.tags, tag],
    }))
  }

  function save(event: FormEvent) {
    event.preventDefault()
    saveProviderPublicProfile(profile)
    setNotice('Página atualizada. As alterações já estão disponíveis na Rede credenciada.')
  }

  return (
    <RestrictedAreaPageFrame area="provider" breadcrumb="Página do credenciado" loggedIn={loggedIn} onLogout={onLogout}>
      <section className="simple-page-heading provider-dashboard-heading">
        <div><h1>Página do credenciado</h1><p>Personalize as informações complementares exibidas na Rede credenciada.</p></div>
        <Link className="secondary-button" to={`/rede-credenciada/credenciado/${testProviderId}`} target="_blank">Visualizar página <ExternalLink aria-hidden="true" /></Link>
      </section>

      <form className="provider-public-profile-form" onSubmit={save}>
        <section className="my-data-card">
          <div className="my-data-card-heading"><Building2 aria-hidden="true" /><div><h2>Dados do cadastro</h2><p>Estas informações são atualizadas automaticamente a partir de Meus dados.</p></div></div>
          <div className="my-data-grid">
            <label>Nome do credenciado<input value="Clínica Saúde & Vida" disabled /></label>
            <label>E-mail<input value={user.providerEmail || ''} disabled /></label>
            <label>Telefone<input value={user.phone} disabled /></label>
            <label>WhatsApp<input value={user.providerWhatsapp || ''} disabled /></label>
            <label className="my-data-wide">Endereço<input value={[user.address.street, user.address.number, user.address.complement, user.address.district, `${user.address.city}/${user.address.state}`].filter(Boolean).join(', ')} disabled /></label>
          </div>
          <Link className="text-link" to="/minha-area">Atualizar em Meus dados <ArrowRight aria-hidden="true" /></Link>
        </section>

        <section className="my-data-card">
          <div className="my-data-card-heading"><Globe2 aria-hidden="true" /><div><h2>Informações da página</h2><p>Os campos abaixo aparecem apenas na apresentação pública do credenciado.</p></div></div>
          <div className="my-data-grid">
            <label className="my-data-wide">Horário de atendimento<input value={profile.openingStatus} onChange={(event) => setProfile({ ...profile, openingStatus: event.target.value })} placeholder="Ex.: segunda a sexta, das 8h às 18h" /></label>
            <label>Website<input type="url" value={profile.website} onChange={(event) => setProfile({ ...profile, website: event.target.value })} placeholder="https://" /></label>
            <label>Localização no Google Maps<input value={profile.mapsQuery} onChange={(event) => setProfile({ ...profile, mapsQuery: event.target.value })} placeholder="Endereço ou link do Google Maps" /></label>
            <label className="my-data-wide">Observação (opcional)<textarea value={profile.observation} onChange={(event) => setProfile({ ...profile, observation: event.target.value })} placeholder="Informação adicional exibida somente nesta página" /></label>
          </div>
          <fieldset className="provider-profile-tags"><legend>Informações e serviços exibidos</legend><p>Selecione as opções que devem aparecer como tags no perfil.</p><div>{providerTagOptions.map((tag) => <label key={tag}><input type="checkbox" checked={profile.tags.includes(tag)} onChange={() => toggleTag(tag)} /> {tag}</label>)}</div></fieldset>
        </section>

        {notice && <p className="form-status success" role="status">{notice}</p>}
        <div className="my-data-actions"><button className="primary-button" type="submit"><Save aria-hidden="true" /> Salvar página</button></div>
      </form>
    </RestrictedAreaPageFrame>
  )
}

export function ProviderAuthorizationsPage({ loggedIn, onLogout }: PublicPageProps) {
  const authorizationSections = [
    {
      title: 'Autorização eletrônica',
      description: 'Emita em tempo real autorizações de consultas, procedimentos diagnósticos e terapias pelo Autorizador Web.',
      href: '#provider-electronic-authorization-title',
    },
    {
      title: 'Autorização eletiva',
      description: 'Consulte como encaminhar previamente pedidos de procedimentos programados, com indicação médica e documentos pertinentes.',
      href: '#provider-guides-title',
    },
    {
      title: 'Autorização de urgência e emergência',
      description: 'Preste o atendimento prontamente e confira como formalizar o pedido e encaminhar a documentação ao Plan-Assiste.',
      href: '#provider-guides-title',
    },
  ]
  return (
    <RestrictedAreaPageFrame area="provider" breadcrumb="Autorizações" loggedIn={loggedIn} onLogout={onLogout}>
        <section className="simple-page-heading provider-dashboard-heading">
          <div>
            <h1>Autorizações</h1>
            <p>Consulte orientações para autorização eletrônica, acesso ao Autorizador Web e guias utilizadas no atendimento aos beneficiários.</p>
          </div>
        </section>

        <nav className="provider-billing-navigation-grid" aria-label="Tipos de autorização">
          {authorizationSections.map(({ title, description, href }) => (
            <a className="provider-billing-navigation-card" href={href} key={title}>
              <ClipboardCheck aria-hidden="true" />
              <h2>{title}</h2>
              <p>{description}</p>
              <span>Abrir orientações <ArrowRight aria-hidden="true" /></span>
            </a>
          ))}
        </nav>

        <div className="provider-authorization-content">
          <section className="provider-authorization-section" aria-labelledby="provider-electronic-authorization-title">
            <div className="provider-section-heading">
              <ClipboardCheck aria-hidden="true" />
              <h2 id="provider-electronic-authorization-title">Autorização eletrônica</h2>
            </div>
            <p>
              As autorizações eletrônicas para procedimentos realizados pelo Plan-Assiste, via de regra, são emitidas pelo sistema Autorizador Web.
            </p>
            <p>
              O acesso utiliza o CNPJ do credenciado como login e a mesma senha do Portal TISS usado para envio dos arquivos XML.
            </p>
            <div className="portal-table-wrap document-table-wrap provider-document-table-wrap">
              <table className="portal-table document-table">
                <thead><tr><th>Nº</th><th>Documento</th><th>Ação</th></tr></thead>
                <tbody>
                  {providerAuthorizationLinks.map((item, index) => {
                    const documentName = item.text.replace(/[.;]$/, '').replace(/^./, (character) => character.toUpperCase())
                    return (
                      <tr key={item.href}>
                        <td>{index + 1}</td>
                        <td>{documentName}</td>
                        <td><a href={item.href} download={item.download} aria-label={`Baixar ${documentName}`}><Download aria-hidden="true" /><span>Baixar</span></a></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <aside className="provider-service-table-callout" aria-label="Consulta de códigos de procedimentos">
              <div>
                <strong>Precisa consultar um código de procedimento?</strong>
                <p>A tabela de serviços reúne os códigos e as descrições dos procedimentos utilizados pelo Plan-Assiste.</p>
              </div>
              <a className="secondary-button" href="/plan-assiste/tabelas-de-servicos" target="_blank" rel="noreferrer">
                Consultar tabela de serviços <ExternalLink aria-hidden="true" />
              </a>
            </aside>
            <a className="primary-button provider-main-action" href="https://sistema.planassiste.mpu.mp.br/autorizadorweb" target="_blank" rel="noreferrer">
              Acessar Autorizador Web <ExternalLink aria-hidden="true" />
            </a>
            <p className="provider-note">
              Credenciados sem acesso ao Autorizador Web e ao Portal TISS devem solicitar login e senha pelo e-mail <a className="portal-email-link" href="mailto:seplan-suporte@mpu.mp.br">seplan-suporte@mpu.mp.br</a>.
            </p>
          </section>

          <section className="provider-authorization-section" aria-labelledby="provider-guides-title">
            <div className="provider-section-heading">
              <FileText aria-hidden="true" />
              <h2 id="provider-guides-title">Guias</h2>
            </div>
            <p>
              Para autorização manual imediata da guia, o credenciado deve preenchê-la e conferir o cartão válido do Plan-Assiste e o documento de identificação do beneficiário.
            </p>
            <div className="portal-table-wrap document-table-wrap provider-document-table-wrap">
              <table className="portal-table document-table">
                <thead><tr><th>Nº</th><th>Guia</th><th>Ação</th></tr></thead>
                <tbody>
                  {providerGuideLinks.map((item, index) => {
                    const documentName = item.text.replace(/[.;]$/, '').replace(/^./, (character) => character.toUpperCase())
                    return (
                      <tr key={item.href}>
                        <td>{index + 1}</td>
                        <td>{documentName}</td>
                        <td><a href={item.href} download={item.download} aria-label={`Baixar ${documentName}`}><Download aria-hidden="true" /><span>Baixar</span></a></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>
    </RestrictedAreaPageFrame>
  )
}

export function ProviderBillingPage({ loggedIn, onLogout }: PublicPageProps) {
  const sections = [
    { slug: 'portal-tiss', title: 'Portal TISS', summary: 'Acesse o sistema, consulte os manuais e encontre os canais de suporte para login e documentação.', icon: MonitorCheck },
    { slug: 'envio-documentacao', title: 'Envio de documentação', summary: 'Confira o tutorial e acesse o Protocolo Eletrônico do MPF para encaminhar a documentação de faturamento.', icon: Send },
    { slug: 'calendario-pagamentos', title: 'Calendário de pagamentos', summary: 'Consulte as datas previstas para organizar e acompanhar o processamento dos pagamentos.', icon: CalendarDays },
    { slug: 'recurso-glosa', title: 'Recurso de glosa', summary: 'Consulte manuais, orientações para arquivos XML e o padrão TISS definido pela ANS.', icon: ClipboardCheck },
  ]

  return (
    <RestrictedAreaPageFrame area="provider" breadcrumb="Faturamento" loggedIn={loggedIn} onLogout={onLogout}>
        <section className="simple-page-heading provider-dashboard-heading">
          <div>
            <h1>Faturamento</h1>
            <p>Consulte orientações para acesso ao Portal TISS, envio de documentação, calendário de pagamentos e recurso de glosa.</p>
          </div>
        </section>

        <section className="provider-billing-navigation-grid" aria-label="Áreas de faturamento">
          {sections.map((section) => {
            const Icon = section.icon
            return (
              <Link className="provider-billing-navigation-card" to={`/credenciado/faturamento/${section.slug}`} key={section.slug}>
                <Icon aria-hidden="true" />
                <h2>{section.title}</h2>
                <p>{section.summary}</p>
                <span>Abrir conteúdo <ArrowRight aria-hidden="true" /></span>
              </Link>
            )
          })}
        </section>
    </RestrictedAreaPageFrame>
  )
}

export function ProviderBillingDetailPage({ loggedIn, onLogout }: PublicPageProps) {
  const { section } = useParams()
  const validSections = ['portal-tiss', 'envio-documentacao', 'calendario-pagamentos', 'recurso-glosa']
  if (!section || !validSections.includes(section)) return <Navigate to="/credenciado/faturamento" replace />

  const titles: Record<string, string> = {
    'portal-tiss': 'Portal TISS',
    'envio-documentacao': 'Envio de documentação',
    'calendario-pagamentos': 'Calendário de pagamentos',
    'recurso-glosa': 'Recurso de glosa',
  }

  return (
    <RestrictedAreaPageFrame area="provider" breadcrumb={titles[section]} loggedIn={loggedIn} onLogout={onLogout}>
      <Link className="text-link provider-billing-back" to="/credenciado/faturamento"><ChevronLeft aria-hidden="true" /> Voltar para Faturamento</Link>

      <section className="simple-page-heading">
        <h1>{titles[section]}</h1>
      </section>

      <section className="provider-billing-detail">
        {section === 'portal-tiss' && <>
          <p>O Portal TISS concentra rotinas de faturamento, consultas, relatórios, acompanhamento de PEGs e informações sobre devoluções.</p>
          <p>Para problemas com login e senha, o credenciado deve acionar o suporte do Plan-Assiste. Dúvidas sobre envio documental devem ser encaminhadas à equipe de faturamento.</p>
          <ProviderResourceTable items={providerBillingPortalLinks} caption="Manuais do Portal TISS" />
          <a className="primary-button provider-main-action" href="https://sistema.planassiste.mpu.mp.br/portaltiss/login.aspx" target="_blank" rel="noreferrer">Acessar Portal TISS <ExternalLink aria-hidden="true" /></a>
          <p className="provider-note provider-billing-contacts">Suporte para login e senha: <a className="portal-email-link" href="mailto:seplan-nusup@mpu.mp.br">seplan-nusup@mpu.mp.br</a><br />Dúvidas sobre documentos: <a className="portal-email-link" href="mailto:seplan-faturamento@mpu.mp.br">seplan-faturamento@mpu.mp.br</a></p>
        </>}
        {section === 'envio-documentacao' && <>
          <p>A documentação de faturamento deve seguir as instruções de envio pelo Protocolo Eletrônico do MPF, com atenção ao tipo de documento, identificação do credenciado e anexos exigidos.</p>
          <p>O tutorial oficial orienta o fluxo de protocolo e ajuda a reduzir inconsistências no recebimento da documentação.</p>
          <ProviderResourceTable items={providerBillingProtocolLinks} caption="Tutorial para envio de documentação" />
          <aside className="provider-service-table-callout" aria-label="Consulta de valores de procedimentos">
            <div>
              <strong>Precisa consultar um valor de procedimento?</strong>
              <p>A tabela de serviços reúne os valores e as descrições dos procedimentos utilizados pelo Plan-Assiste.</p>
            </div>
            <a className="secondary-button" href="/plan-assiste/tabelas-de-servicos" target="_blank" rel="noreferrer">
              Consultar tabela de serviços <ExternalLink aria-hidden="true" />
            </a>
          </aside>
          <a className="primary-button provider-main-action" href="https://www.mpf.mp.br/mpfservicos/protocolo" target="_blank" rel="noreferrer">
            Acessar Protocolo Eletrônico do MPF <ExternalLink aria-hidden="true" />
          </a>
        </>}
        {section === 'calendario-pagamentos' && <>
          <p>O calendário de pagamentos é a principal ferramenta de organização da sistemática de faturamento, em vigor desde 04/08/2025.</p>
          <p>Ele permite que os credenciados acompanhem datas previstas com mais eficiência, agilidade e transparência.</p>
          <ProviderResourceTable items={providerBillingCalendarLinks} caption="Calendários de pagamentos" />
          <p className="provider-note">Para informações específicas, entre em contato com a representação do Plan-Assiste da sua localidade.</p>
        </>}
        {section === 'recurso-glosa' && <>
          <p>O Plan-Assiste retomou o recebimento de recursos de glosa após o período de suspensão técnica iniciado em julho de 2025.</p>
          <p>Os recursos devem ser enviados obrigatoriamente por arquivo XML do tipo recurso de glosa, observando o padrão TISS definido pela ANS.</p>
          <ProviderResourceTable items={providerBillingGlosaLinks} caption="Documentos e referências para recurso de glosa" />
          <p className="provider-note">Casos excepcionais que exijam adaptação às novas diretrizes devem ser submetidos à representação do Plan-Assiste na localidade do credenciado.</p>
        </>}
      </section>
    </RestrictedAreaPageFrame>
  )
}

const teamInfoGroups = [
  {
    slug: 'credenciamento',
    title: 'Credenciamento',
    summary: 'Processos, editais e referências para credenciamento.',
    items: ['Orientações do processo de credenciamento', 'Editais', 'Notas de Empenho', 'Legislação aplicável'],
  },
  {
    slug: 'cadastro',
    title: 'Cadastro',
    summary: 'Rotinas cadastrais, formulários e modelos de apoio.',
    items: ['Informações sobre o Benner', 'Formulários', 'Legislação aplicável', 'Modelos de documentos', 'Perguntas frequentes - auxílio-saúde'],
  },
  {
    slug: 'faturamento',
    title: 'Faturamento',
    summary: 'Orientações para processamento, documentos e controle financeiro.',
    items: ['Orientações gerais', 'Gestão documental', 'Processamento de contas', 'Controle financeiro', 'Legislação aplicável'],
  },
  {
    slug: 'normas-e-pareceres',
    title: 'Normas e pareceres',
    summary: 'Normas internas e pareceres técnicos organizados por origem.',
    items: ['Normas', 'Pareceres'],
    children: ['Pareceres Câmara Técnica de Saúde', 'Pareceres AUDIN/MPU'],
  },
  {
    slug: 'capacitacoes',
    title: 'Capacitações',
    summary: 'Treinamentos, materiais didáticos e referências temáticas.',
    items: ['Treinamentos e materiais didáticos', 'Catálogo temático', 'Materiais de referência'],
  },
  {
    slug: 'informativos-das-diretorias',
    title: 'Informativos das diretorias',
    summary: 'Comunicados técnicos publicados pelas diretorias do Programa.',
    items: ['Diretoria de Tecnologia e Inovação (DITEC)', 'Vice-Diretoria de Assistência e Benefícios (VDABES)', 'Diretoria de Orçamento e Finanças (DIOF)'],
    children: [
      'Informe DITEC 01/2025 - Resolução pontual de erros de importação de XMLs de cobrança da(s) Unimed(s).',
      'Informe DITEC 03/2024 - Metodologia de cadastramento dos números de carteirinhas Unimed no sistema Benner Autogestão.',
      'Informe DITEC 02/2024 - Adequação nacional dos e-mails das unidades e servidores do Plan-Assiste.',
      'Informe DITEC 01/2024 - Adequação nacional dos Drives das unidades do Plan-Assiste.',
      'Informe DITEC 02/2023 - Interoperabilidade entre os sistemas Benner AG e Único Digital.',
      'Informe DITEC 01/2023 - Envelopamento de objetos das unidades do Plan-Assiste via Único Digital.',
    ],
  },
  {
    slug: 'materiais-de-referencia',
    title: 'Materiais de referência',
    summary: 'Documentos, guias e materiais institucionais para consulta.',
    items: ['Documentos de apoio', 'Guias de consulta', 'Materiais institucionais'],
  },
]

export function TeamDashboardPage({ loggedIn, onLogout }: PublicPageProps) {
  return (
    <RestrictedAreaPageFrame area="team" breadcrumb="Área da equipe" loggedIn={loggedIn} onLogout={onLogout}>
        <TeamNewsCarousel />

        <section className="simple-page-heading provider-dashboard-heading">
          <div>
            <h1>Área da equipe</h1>
            <p>Acesse sistemas, rotinas administrativas e materiais de apoio ao trabalho autorizado do Plan-Assiste.</p>
          </div>
        </section>

        <section className="info-page-grid team-dashboard-cards" aria-label="Gestão e informação">
          <article>
            <BookOpenCheck aria-hidden="true" />
            <h2>Gestão da informação</h2>
            <p>Conteúdos internos de referência para as equipes nacionais e regionais.</p>
            <Link className="text-link" to="/area-da-equipe/gestao-da-informacao">Ver conteúdos <ArrowRight aria-hidden="true" /></Link>
          </article>
          <article>
            <Globe2 aria-hidden="true" />
            <h2>Administração do Portal <LockKeyhole className="team-lock-icon" aria-label="Acesso restrito" /></h2>
            <p>Administração de banners, notícias e base de conhecimento do portal.</p>
            <Link className="text-link" to="/area-da-equipe/administracao-do-portal">Acessar painel <ArrowRight aria-hidden="true" /></Link>
          </article>
          <article className="team-benner-card">
            <span className="team-card-eyebrow">Sistema Benner</span>
            <img src="/assets/benner.svg" alt="Benner" />
            <h2>Ambientes de acesso</h2>
            <p>Use o ambiente adequado para rotinas de produção ou validação/homologação.</p>
            <div className="team-benner-card-actions">
              <a className="primary-button" href="https://sistema.planassiste.mpu.mp.br/AGWEB/Login" target="_blank" rel="noreferrer">Produção <ExternalLink aria-hidden="true" /></a>
              <a className="secondary-button" href="https://sistema.planassiste.mpu.mp.br/WSTISSHom/Login" target="_blank" rel="noreferrer">Homologação <ExternalLink aria-hidden="true" /></a>
            </div>
          </article>
        </section>

    </RestrictedAreaPageFrame>
  )
}

export function TeamInformationPage({ loggedIn, onLogout }: PublicPageProps) {
  return (
    <RestrictedAreaPageFrame area="team" breadcrumb="Gestão da informação" loggedIn={loggedIn} onLogout={onLogout}>
        <section className="simple-page-heading provider-dashboard-heading">
          <div>
            <h1>Gestão da informação</h1>
            <p>Consulte rotinas, tutoriais e materiais organizados por frente de trabalho.</p>
          </div>
        </section>
        <div className="team-info-grid">
          {teamInfoGroups.map((group) => (
            <Link key={group.title} className="team-info-card team-info-navigation-card" to={`/area-da-equipe/gestao-da-informacao/${group.slug}`}>
              <h2>{group.title}</h2>
              <p>{group.summary}</p>
              <span>Abrir área <ArrowRight aria-hidden="true" /></span>
            </Link>
          ))}
        </div>
    </RestrictedAreaPageFrame>
  )
}

export function TeamInformationDetailPage({ loggedIn, onLogout }: PublicPageProps) {
  const { category } = useParams()
  const group = teamInfoGroups.find((item) => item.slug === category)
  if (!group) return <Navigate to="/area-da-equipe/gestao-da-informacao" replace />

  const topics = [...group.items, ...(group.children || [])]
  return (
    <RestrictedAreaPageFrame area="team" breadcrumb={group.title} loggedIn={loggedIn} onLogout={onLogout}>
      <section className="simple-page-heading">
        <p className="eyebrow">Gestão da informação</p>
        <h1>{group.title}</h1>
        <p>{group.summary}</p>
      </section>
      <nav className="team-knowledge-index" aria-label={`Conteúdos de ${group.title}`}>
        {topics.map((topic, index) => (
          <a href={`#team-topic-${index + 1}`} key={topic}>{topic}</a>
        ))}
      </nav>
      <div className="team-knowledge-sections">
        {topics.map((topic, index) => (
          <section id={`team-topic-${index + 1}`} key={topic}>
            <h2>{topic}</h2>
            <p>Esta seção reúne procedimentos, tutoriais passo a passo, modelos, responsáveis e referências relacionados a {topic.toLocaleLowerCase('pt-BR')}.</p>
            <div className="team-knowledge-actions">
              <span>Rotinas</span><span>Tutoriais</span><span>Modelos e referências</span>
            </div>
          </section>
        ))}
      </div>
    </RestrictedAreaPageFrame>
  )
}

export function TeamPublicPage({ loggedIn, onLogout }: PublicPageProps) {
  return (
    <PublicShell loggedIn={loggedIn} onLogout={onLogout}>
      <main className="container public-page team-public-page">
        <PublicBreadcrumb current="Área da equipe" />
        <section className="simple-page-heading">
          <h1>Ambiente da equipe</h1>
          <p>Acesso a ferramentas internas, rotinas administrativas e conteúdos de apoio ao trabalho autorizado do Plan-Assiste.</p>
        </section>
        <section className="info-page-grid">
          {[
            { title: 'Gestão de Conteúdo', text: 'Gerencie e publique notícias, comunicados e atualizações institucionais do portal e do aplicativo.', hasLink: true },
            { title: 'Atendimento', text: 'Acesse o sistema de chamados (ITSM) e gerencie as filas de suporte e atendimento técnico.', hasLink: false },
            { title: 'Intranet', text: 'Portal exclusivo do colaborador: encontre ferramentas de trabalho, manuais e avisos internos.', hasLink: false },
          ].map(({ title, text, hasLink }) => (
            <article key={title}>
              <UsersRound aria-hidden="true" />
              <h2>{title}</h2>
              <p>{text}</p>
              {hasLink && <Link className="text-link" to="/area-da-equipe/visao-geral">Acessar área logada <ArrowRight aria-hidden="true" /></Link>}
            </article>
          ))}
        </section>
      </main>
    </PublicShell>
  )
}

const TIPO_REGISTRO_DENUNCIA = 'Denúncia ou reclamação'
const TIPO_REGISTRO_ACOMPANHAMENTO = 'Acompanhamento de registros de denúncia / reclamação'

export function ManifestationPage({ loggedIn, onLogout }: PublicPageProps) {
  const location = useLocation()
  const isComplaint = location.pathname.endsWith('/reclamacao-e-denuncia')
  const isQuality = location.pathname.endsWith('/qualidade-dos-servicos')
  // O canal de denúncia reúne dois registros; o seletor decide quais campos entram.
  const [tipoRegistro, setTipoRegistro] = useState(TIPO_REGISTRO_DENUNCIA)
  const isAcompanhamento = isComplaint && tipoRegistro === TIPO_REGISTRO_ACOMPANHAMENTO
  const isDenuncia = isComplaint && !isAcompanhamento
  // Só a avaliação tem Assunto; na denúncia o tipo já é o próprio canal.
  const manifestationSubjects = ['Crítica', 'Elogio', 'Sugestão']
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  // Campos exclusivos da denúncia/reclamação: espelham o formulário
  // "Denúncia / Reclamação" do Catálogo de serviços.
  const [rgOrgaoExpedidor, setRgOrgaoExpedidor] = useState('')
  const [cpf, setCpf] = useState('')
  const [celular, setCelular] = useState('')
  const [telefone, setTelefone] = useState('')
  const [cidade, setCidade] = useState('')
  const [estado, setEstado] = useState('')
  // Exclusivos do acompanhamento: espelham os campos do formulário que saiu do
  // Catálogo de serviços, aqui digitados à mão por ser uma página pública.
  const [dataNascimento, setDataNascimento] = useState('')
  const [matricula, setMatricula] = useState('')
  const [localidadeMatricula, setLocalidadeMatricula] = useState('')
  // Espelha o campo do formulário Denúncia / Reclamação do catálogo.
  const [sigiloDadosPessoais, setSigiloDadosPessoais] = useState(false)
  const [assunto, setAssunto] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [attachments, setAttachments] = useState<File[]>([])
  const [notice, setNotice] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function addFiles(newFiles: File[]) {
    setAttachments((current) => [...current, ...newFiles])
  }

  function removeFile(index: number) {
    setAttachments((current) => current.filter((_, fileIndex) => fileIndex !== index))
  }

  function handleReset() {
    setNome('')
    setEmail('')
    setRgOrgaoExpedidor('')
    setCpf('')
    setCelular('')
    setTelefone('')
    setCidade('')
    setEstado('')
    setDataNascimento('')
    setMatricula('')
    setLocalidadeMatricula('')
    setSigiloDadosPessoais(false)
    setAssunto('')
    setMensagem('')
    setAttachments([])
    setNotice('')
    setSubmitted(false)
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    // A denúncia não tem campo Assunto: os tipos viraram o próprio serviço.
    if (!nome.trim() || !email.trim() || (!isComplaint && !assunto) || !stripHtml(mensagem)) {
      setNotice(isAcompanhamento
        ? 'Preencha nome, e-mail e descrição para enviar sua solicitação.'
        : isComplaint
          ? 'Preencha nome, e-mail e descrição para enviar seu relato.'
          : 'Preencha nome, e-mail, assunto e descrição para enviar sua avaliação.')
      return
    }
    setNotice('')
    setSubmitted(true)
  }

  if (!isComplaint && !isQuality) return <Navigate to="/fale-conosco/manifestacoes/reclamacao-e-denuncia" replace />

  if (submitted) {
    return (
      <PublicShell loggedIn={loggedIn} onLogout={onLogout}>
        <main className="container public-page">
          <PublicBreadcrumb
            current={isComplaint ? 'Denúncia e reclamação' : 'Avalie nossos serviços'}
            parent={{ label: 'Fale conosco', to: '/fale-conosco' }}
          />
          <div className="service-success">
            <CheckCircle2 aria-hidden="true" className="service-success-icon" />
            <h2>{isAcompanhamento ? 'Solicitação enviada com sucesso' : isComplaint ? 'Denúncia enviada com sucesso' : 'Avaliação enviada com sucesso'}</h2>
            <p>Recebemos sua mensagem. Nossa equipe vai analisá-la e retornar pelo e-mail informado, se necessário.</p>
            <div className="service-success-actions">
              <Link className="primary-button" to="/">Voltar para o início</Link>
            </div>
          </div>
        </main>
      </PublicShell>
    )
  }

  return (
    <PublicShell loggedIn={loggedIn} onLogout={onLogout}>
      <main className="container public-page">
        <PublicBreadcrumb
          current={isComplaint ? 'Denúncia e reclamação' : 'Avalie nossos serviços'}
          parent={{ label: 'Fale conosco', to: '/fale-conosco' }}
        />
        <section className="simple-page-heading">
          <h1>{isComplaint ? 'Denúncia e reclamação' : 'Avalie nossos serviços'}</h1>
          <p>{isComplaint ? 'Relate uma reclamação ou denúncia com as informações necessárias para análise e encaminhamento à unidade responsável.' : 'Ajude-nos a aprimorar a qualidade do atendimento e dos serviços do Plan-Assiste. Envie sua crítica, sugestão ou elogio e compartilhe sua experiência conosco.'}</p>
        </section>
        <form className="reimbursement-form" onSubmit={handleSubmit}>
          <section className="reimbursement-card">
            {isComplaint && (
              <div className="reimbursement-form-section">
                <div className="reimbursement-grid">
                  <label className="half-width">
                    Tipo de registro *
                    <select value={tipoRegistro} onChange={(event) => { setTipoRegistro(event.target.value); setNotice('') }}>
                      <option value={TIPO_REGISTRO_DENUNCIA}>{TIPO_REGISTRO_DENUNCIA}</option>
                      <option value={TIPO_REGISTRO_ACOMPANHAMENTO}>{TIPO_REGISTRO_ACOMPANHAMENTO}</option>
                    </select>
                  </label>
                </div>
              </div>
            )}
            <div className="reimbursement-form-section">
              <h3>Identificação</h3>
              <div className={isComplaint ? 'reimbursement-grid' : 'reimbursement-grid reimbursement-grid-two-columns manifestation-identification-grid'}>
                <label className={isComplaint ? 'half-width' : undefined}>
                  Nome completo *
                  <input value={nome} onChange={(event) => setNome(event.target.value)} placeholder="Digite o seu nome completo" />
                </label>
                <label className={isComplaint ? 'half-width' : undefined}>
                  E-mail *
                  <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Digite o seu e-mail de contato" />
                </label>
                {isAcompanhamento && (
                  <>
                    <label className="half-width">
                      CPF
                      <input value={cpf} maxLength={14} onChange={(event) => setCpf(maskCpf(event.target.value))} placeholder="000.000.000-00" />
                    </label>
                    <label className="half-width">
                      Data de nascimento
                      <input type="date" value={dataNascimento} onChange={(event) => setDataNascimento(event.target.value)} />
                    </label>
                    <label className="half-width">
                      Matrícula
                      <input value={matricula} onChange={(event) => setMatricula(event.target.value)} placeholder="Número da matrícula" />
                    </label>
                    <label className="half-width">
                      Localidade da Matrícula
                      <input value={localidadeMatricula} onChange={(event) => setLocalidadeMatricula(event.target.value)} placeholder="Ex.: Brasília - DF" />
                    </label>
                    <label className="half-width">
                      Telefone
                      <input value={telefone} maxLength={15} onChange={(event) => setTelefone(maskPhone(event.target.value))} placeholder="(00) 00000-0000" />
                    </label>
                  </>
                )}
                {isDenuncia && (
                  <>
                    <label className="half-width">
                      RG e Órgão Expedidor
                      <input value={rgOrgaoExpedidor} onChange={(event) => setRgOrgaoExpedidor(event.target.value)} placeholder="Ex.: 1234567 SSP/DF" />
                    </label>
                    <label className="half-width">
                      CPF
                      <input value={cpf} maxLength={14} onChange={(event) => setCpf(maskCpf(event.target.value))} placeholder="000.000.000-00" />
                    </label>
                    <label>
                      Celular
                      <input value={celular} maxLength={15} onChange={(event) => setCelular(maskPhone(event.target.value))} placeholder="(00) 00000-0000" />
                    </label>
                    <label>
                      Telefone
                      <input value={telefone} maxLength={15} onChange={(event) => setTelefone(maskPhone(event.target.value))} placeholder="(00) 0000-0000" />
                    </label>
                    <label>
                      Cidade
                      <input value={cidade} onChange={(event) => setCidade(event.target.value)} placeholder="Cidade" />
                    </label>
                    <label>
                      Estado
                      <select value={estado} onChange={(event) => setEstado(event.target.value)}>
                        <option value="">Selecione</option>
                        {UF_OPTIONS.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
                      </select>
                    </label>
                    <label className="responsibility-term wide">
                      <input type="checkbox" checked={sigiloDadosPessoais} onChange={(event) => setSigiloDadosPessoais(event.target.checked)} />
                      Deseja manter seus dados pessoais em sigilo?
                    </label>
                  </>
                )}
              </div>
            </div>
            <div className="reimbursement-form-section">
              <h3>{isAcompanhamento ? 'Detalhes do acompanhamento' : isComplaint ? 'Detalhes da denúncia ou reclamação' : 'Detalhes da avaliação'}</h3>
              <div className="reimbursement-grid">
                {!isComplaint && (
                  <label className="wide">
                    Assunto *
                    <select value={assunto} onChange={(event) => setAssunto(event.target.value)}>
                      <option value="">Selecione uma opção</option>
                      {manifestationSubjects.map((subject) => <option key={subject} value={subject}>{subject}</option>)}
                    </select>
                  </label>
                )}
                <label className="wide">
                  Descrição *
                  <textarea rows={7} value={mensagem} onChange={(event) => setMensagem(event.target.value)} placeholder={isAcompanhamento ? 'Informe o número do registro, se tiver, e o que deseja saber sobre o andamento' : isComplaint ? 'Descreva o ocorrido com o máximo de informações relevantes' : 'Conte-nos como foi sua experiência e o que podemos melhorar'} />
                </label>
                <FileAttachmentField
                  fullWidth
                  files={attachments}
                  helpText={isComplaint
                    ? 'Anexe, se necessário, provas ou documentos relacionados ao relato (PDF, JPG, PNG ou GIF até 10 MB).'
                    : 'Anexe, se necessário, imagens ou documentos que ajudem a ilustrar sua manifestação (PDF, JPG, PNG ou GIF até 10 MB).'}
                  label="Anexos (opcional)"
                  onAdd={addFiles}
                  onRemove={removeFile}
                />
              </div>
            </div>
            {notice && <p className="form-alert alert-danger" role="status">{notice}</p>}
            <div className="reimbursement-actions">
              <button className="primary-button" type="submit">
                <Send aria-hidden="true" /> {isAcompanhamento ? 'Enviar solicitação' : isComplaint ? 'Enviar denúncia' : 'Enviar'}
              </button>
              <button className="secondary-button" type="button" onClick={handleReset}>Limpar formulário</button>
            </div>
          </section>
        </form>
      </main>
    </PublicShell>
  )
}

export function SupportPage({ loggedIn, onLogout }: PublicPageProps) {
  return (
    <PublicShell loggedIn={loggedIn} onLogout={onLogout}>
      <main className="container public-page support-page">
        <PublicBreadcrumb current="Fale conosco" />
        <section className="public-hero">
          <p className="eyebrow">Atendimento</p>
          <h1>Fale conosco</h1>
          <p>Tire dúvidas, fale com a equipe do Plan-Assiste ou encontre nossos canais oficiais.</p>
        </section>

        <section className="support-grid home-grid-4 support-page-grid" aria-label="Canais de suporte">
          {supportChannels.map((card) => {
            return card.route ? (
              <Link className="support-card support-page-card" to={card.route} key={card.title}>
                <SupportIcon type={card.type as SupportIconType} />
                <h2>{card.title}</h2>
                <p>{card.text}</p>
                <small>{card.detail}</small>
              </Link>
            ) : (
              <article className="support-card support-page-card" key={card.title}>
                <SupportIcon type={card.type as SupportIconType} />
                <h2>{card.title}</h2>
                <p>{card.text}</p>
                <small>{card.detail}</small>
              </article>
            )
          })}
        </section>

        <section className="support-quality-callout" aria-labelledby="support-quality-title">
          <div>
            <h2 id="support-quality-title">Ajude-nos a aprimorar a qualidade</h2>
            <p>Sua experiência contribui para aperfeiçoarmos o atendimento, os canais e os serviços oferecidos pelo Plan-Assiste.</p>
          </div>
          <Link className="secondary-button" to="/fale-conosco/manifestacoes/qualidade-dos-servicos">Avalie nossos serviços <ArrowRight aria-hidden="true" /></Link>
        </section>

      </main>
    </PublicShell>
  )
}

export function SupportFaqPage({ loggedIn, onLogout }: PublicPageProps) {
  const cmsSnapshot = useCmsSnapshot()
  const cmsPage = cmsSnapshot.pages.find((page) => page.slug === 'fale-conosco/duvidas-frequentes' && page.status === 'published')
  const faqCategories = ['Todas', ...getCmsFaqCategories()]
  const [faqCategory, setFaqCategory] = useState('Todas')
  const [faqSearch, setFaqSearch] = useState('')
  const normalizedFaqSearch = faqSearch.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
  const visibleSupportFaqs = getCmsFaqs().filter((faq) => {
    const matchesCategory = faqCategory === 'Todas' || faq.category === faqCategory
    const searchableText = `${faq.question} ${faq.answer}`.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    return matchesCategory && (!normalizedFaqSearch || searchableText.includes(normalizedFaqSearch))
  })

  if (cmsPage) return <PublicShell loggedIn={loggedIn} onLogout={onLogout}><main className="container public-page support-page"><PublicBreadcrumb current={cmsPage.navigationTitle} parent={{ label: 'Fale conosco', to: '/fale-conosco' }} /><section className="simple-page-heading"><h1>{cmsPage.title}</h1><p>{cmsPage.summary}</p></section><CmsPageBlocks page={cmsPage} editing={false} /></main></PublicShell>

  return (
    <PublicShell loggedIn={loggedIn} onLogout={onLogout}>
      <main className="container public-page support-page">
        <PublicBreadcrumb current="Dúvidas frequentes" parent={{ label: 'Fale conosco', to: '/fale-conosco' }} />
        <section className="simple-page-heading">
          <h1>Dúvidas frequentes</h1>
          <p>Encontre respostas rápidas para os temas mais procurados no atendimento do Plan-Assiste.</p>
        </section>
        <section className="support-faq-section" aria-label="Dúvidas frequentes">
          <div className="filter-buttons support-faq-filters topic-filter-buttons" aria-label="Filtrar dúvidas frequentes por categoria">
            {faqCategories.map((category) => (
              <button type="button" key={category} className={faqCategory === category ? 'selected' : undefined} aria-pressed={faqCategory === category} onClick={() => setFaqCategory(category)}>
                {category}
              </button>
            ))}
          </div>
          <label className="support-faq-search">
            <span>Buscar nas dúvidas frequentes</span>
            <Search aria-hidden="true" />
            <input type="search" value={faqSearch} onChange={(event) => setFaqSearch(event.target.value)} placeholder="Digite uma palavra-chave" />
          </label>
          <div className="support-faq-list">
            {visibleSupportFaqs.length > 0 ? visibleSupportFaqs.map(({ category, question, answer }) => (
              <details key={`${category}-${question}`}>
                <summary><HelpCircle aria-hidden="true" /> {question}</summary>
                <p><InlineLinkedText text={answer} /></p>
              </details>
            )) : <p className="support-faq-empty">Nenhuma dúvida encontrada para os filtros selecionados.</p>}
          </div>
        </section>
      </main>
    </PublicShell>
  )
}

export function BecomeBeneficiaryContent() {
  return (
    <>
      <section className="become-eligibility">
        <h2>Quem pode aderir</h2>
        <p>
          A adesão depende da categoria do interessado e das condições previstas nas normas do Plan-Assiste. Em linhas gerais, podem solicitar inscrição titulares vinculados ao Ministério Público da União, seus dependentes e beneficiários especiais nas hipóteses admitidas pelo Programa.
        </p>
        <ul className="become-category-list">
          <li><strong>Titular:</strong> membros e servidores ativos ou inativos, servidores requisitados em cargo em comissão ou função de confiança, servidores sem vínculo nomeados para cargo em comissão e beneficiários de pensão civil, conforme as regras aplicáveis.</li>
          <li><strong>Dependente:</strong> cônjuge ou companheiro, filhos e enteados dentro dos limites previstos, pessoas sob guarda ou tutela judicial e ascendentes que atendam aos requisitos normativos.</li>
          <li><strong>Beneficiário especial:</strong> situações específicas previstas nas normas, como filhos e enteados em faixas etárias determinadas, ex-cônjuge ou ex-companheiro por decisão judicial ou escritura pública e pessoas sob curatela judicial.</li>
        </ul>
      </section>

      <section className="become-guidance">
        <div>
          <h2>Antes de iniciar a solicitação</h2>
          <p>
            Separe documentos pessoais, dados do vínculo funcional e, quando houver, os documentos que comprovem a condição do dependente ou do beneficiário especial. Também é importante conferir telefone, e-mail e endereço, pois essas informações podem ser usadas para comunicação sobre pendências e andamento do pedido.
          </p>
          <p>
            Durante a análise, acompanhe as orientações oficiais sobre inclusão, contribuição, carência e utilização dos serviços. Se houver dúvida sobre documentos ou enquadramento, procure a unidade responsável antes de enviar a solicitação.
          </p>
        </div>
        <aside>
          <Mail aria-hidden="true" />
          <strong>Precisa de apoio?</strong>
          <p>Use os canais oficiais do Plan-Assiste para confirmar requisitos e verificar o melhor caminho para o seu caso.</p>
        </aside>
      </section>
    </>
  )
}
