import {
  Accessibility,
  Activity,
  Ambulance,
  ArrowRight,
  Baby,
  BadgeDollarSign,
  Bed,
  Bell,
  Bone,
  BookOpen,
  Brain,
  BriefcaseMedical,
  Building2,
  Bus,
  CalendarDays,
  Car,
  CheckCircle2,
  CircleHelp,
  ClipboardCheck,
  Clock,
  CreditCard,
  Download,
  Eye,
  FileHeart,
  FileText,
  Globe2,
  HandCoins,
  HeartPulse,
  Hospital,
  House,
  Info,
  Landmark,
  Laptop,
  Mail,
  MapPin,
  Megaphone,
  MessageCircle,
  Microscope,
  Network,
  Newspaper,
  Pencil,
  Phone,
  Pill,
  Plane,
  Scale,
  Search,
  Settings,
  ShieldCheck,
  Star,
  Stethoscope,
  Syringe,
  Upload,
  UserRound,
  UsersRound,
  WalletCards,
  type LucideIcon,
} from 'lucide-react'
import { createElement } from 'react'

export type CmsIconOption = { value: string, label: string, icon: LucideIcon }
export type CmsIconGroup = { label: string, options: CmsIconOption[] }

export const cmsIconGroups: CmsIconGroup[] = [
  {
    label: 'Navegação e interface',
    options: [
      { value: 'arrow', label: 'Seta', icon: ArrowRight },
      { value: 'home', label: 'Início', icon: House },
      { value: 'search', label: 'Busca', icon: Search },
      { value: 'calendar', label: 'Calendário', icon: CalendarDays },
      { value: 'clock', label: 'Horário', icon: Clock },
      { value: 'star', label: 'Destaque', icon: Star },
      { value: 'settings', label: 'Configurações', icon: Settings },
    ],
  },
  {
    label: 'Saúde e assistência',
    options: [
      { value: 'heart', label: 'Saúde', icon: HeartPulse },
      { value: 'activity', label: 'Atividade de saúde', icon: Activity },
      { value: 'medical-briefcase', label: 'Assistência médica', icon: BriefcaseMedical },
      { value: 'stethoscope', label: 'Atendimento médico', icon: Stethoscope },
      { value: 'hospital', label: 'Hospital', icon: Hospital },
      { value: 'ambulance', label: 'Ambulância', icon: Ambulance },
      { value: 'pill', label: 'Medicamentos', icon: Pill },
      { value: 'syringe', label: 'Vacina', icon: Syringe },
      { value: 'microscope', label: 'Exames', icon: Microscope },
      { value: 'brain', label: 'Saúde mental', icon: Brain },
      { value: 'bone', label: 'Ortopedia', icon: Bone },
      { value: 'bed', label: 'Internação', icon: Bed },
      { value: 'baby', label: 'Maternidade e dependentes', icon: Baby },
      { value: 'accessibility', label: 'Acessibilidade', icon: Accessibility },
    ],
  },
  {
    label: 'Documentos e conhecimento',
    options: [
      { value: 'file', label: 'Documento', icon: FileText },
      { value: 'file-heart', label: 'Documento de saúde', icon: FileHeart },
      { value: 'book', label: 'Manual e conhecimento', icon: BookOpen },
      { value: 'clipboard', label: 'Formulário e conferência', icon: ClipboardCheck },
      { value: 'news', label: 'Notícias', icon: Newspaper },
      { value: 'download', label: 'Download', icon: Download },
      { value: 'upload', label: 'Envio de arquivo', icon: Upload },
      { value: 'pencil', label: 'Edição', icon: Pencil },
    ],
  },
  {
    label: 'Pessoas e atendimento',
    options: [
      { value: 'user', label: 'Pessoa', icon: UserRound },
      { value: 'users', label: 'Equipe ou grupo', icon: UsersRound },
      { value: 'phone', label: 'Telefone', icon: Phone },
      { value: 'mail', label: 'E-mail', icon: Mail },
      { value: 'message', label: 'Mensagem e atendimento', icon: MessageCircle },
      { value: 'help', label: 'Dúvidas frequentes', icon: CircleHelp },
      { value: 'bell', label: 'Aviso e notificação', icon: Bell },
      { value: 'megaphone', label: 'Comunicado', icon: Megaphone },
      { value: 'eye', label: 'Visualização', icon: Eye },
    ],
  },
  {
    label: 'Institucional e rede',
    options: [
      { value: 'building', label: 'Edifício', icon: Building2 },
      { value: 'landmark', label: 'Instituição pública', icon: Landmark },
      { value: 'globe', label: 'Abrangência nacional', icon: Globe2 },
      { value: 'network', label: 'Rede credenciada', icon: Network },
      { value: 'location', label: 'Localização', icon: MapPin },
      { value: 'shield', label: 'Proteção e integridade', icon: ShieldCheck },
      { value: 'scale', label: 'Normas e regulamento', icon: Scale },
      { value: 'laptop', label: 'Sistema digital', icon: Laptop },
    ],
  },
  {
    label: 'Financeiro e deslocamento',
    options: [
      { value: 'money', label: 'Reembolso e custeio', icon: HandCoins },
      { value: 'currency', label: 'Valores financeiros', icon: BadgeDollarSign },
      { value: 'card', label: 'Cartão', icon: CreditCard },
      { value: 'wallet', label: 'Carteirinha', icon: WalletCards },
      { value: 'car', label: 'Transporte terrestre', icon: Car },
      { value: 'bus', label: 'Ônibus', icon: Bus },
      { value: 'plane', label: 'Passagens aéreas', icon: Plane },
    ],
  },
  {
    label: 'Status',
    options: [
      { value: 'info', label: 'Informação', icon: Info },
      { value: 'check', label: 'Confirmação', icon: CheckCircle2 },
    ],
  },
]

const cmsIconMap = new Map(cmsIconGroups.flatMap((group) => group.options.map((option) => [option.value, option.icon])))

export function getCmsIcon(value?: string) {
  return value ? cmsIconMap.get(value) : undefined
}

export function renderCmsIcon(value?: string, className?: string) {
  const Icon = getCmsIcon(value)
  return Icon ? createElement(Icon, { className, 'aria-hidden': true }) : null
}
