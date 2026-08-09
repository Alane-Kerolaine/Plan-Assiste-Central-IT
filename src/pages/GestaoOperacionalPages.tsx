import {
  ArrowRight,
  BookOpen,
  CircleCheck,
  CircleX,
  ClipboardCheck,
  FileText,
  Eye,
  Globe,
  HandCoins,
  Heart,
  Layout,
  Library,
  Newspaper,
  Pencil,
  Plus,
  ReceiptText,
  Search,
  Send,
  Tag,
  Trash2,
  Upload,
  UserPlus,
  type LucideIcon,
} from 'lucide-react'
import { useState } from 'react'
import { Link, Outlet, useLocation, useNavigate, useParams } from 'react-router-dom'
import { Combobox, Footer, Header, MainMenu, RestrictedAreaSidebar, type AreaSidebarGroup } from '../components/PortalComponents'
import { RichTextEditor } from '../components/RichTextEditor'
import { NewsDateRangePicker } from './PublicPages'

const gestaoPageNames: Record<string, string> = {
  'visao-geral': 'Visão geral',
  'reembolso-procedimentos': 'Reembolso de procedimentos',
  'auxilio-medicamentos': 'Auxílio para medicamentos',
  'inscricao-dependente': 'Inscrição de dependente',
  'autorizacao-procedimentos': 'Autorização de procedimentos',
  'nova-solicitacao': 'Nova solicitação',
  reembolsos: 'Gerenciar reembolsos',
  medicamentos: 'Gerenciar medicamentos',
  autorizacoes: 'Gerenciar autorizações',
  site: 'Administração do Portal',
  banners: 'Banners',
  noticias: 'Notícias',
  'base-conhecimento': 'Base de conhecimento',
  'novo-banner': 'Novo banner',
  'nova-noticia': 'Nova notícia',
  'novo-artigo': 'Novo artigo',
  'categorias-noticias': 'Categorias de notícias',
}

const operationalTeamSidebarGroups: AreaSidebarGroup[] = [
  {
    label: 'Trabalho',
    items: [
      { label: 'Gestão da informação', to: '/area-da-equipe/gestao-da-informacao', icon: BookOpen },
      { label: 'Administração do Portal', to: '/gestao-operacional/site', activePath: '/gestao-operacional/site', icon: Globe },
    ],
  },
  {
    label: 'Minha conta',
    items: [{ label: 'Meus dados', to: '/minha-area', icon: UserPlus }],
  },
]

function GestaoBreadcrumb({ current }: { current: string }) {
  const isOverview = current === 'Visão geral' || current === 'Gestão operacional'
  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      <Link to="/">Início</Link>
      <ArrowRight />
      <Link to="/area-da-equipe">Área da equipe</Link>
      <ArrowRight />
      {isOverview ? (
        <span>Gestão operacional</span>
      ) : (
        <>
          <Link to="/gestao-operacional/visao-geral">Gestão operacional</Link>
          <ArrowRight />
          <span>{current}</span>
        </>
      )}
    </nav>
  )
}

export function GestaoOperacionalLayout({ onLogout }: { onLogout: () => void }) {
  const location = useLocation()
  const segments = location.pathname.split('/').filter(Boolean)
  const lastSeg = segments[segments.length - 1] || 'visao-geral'
  const parentSeg = segments[segments.length - 2] || ''
  const currentPage = parentSeg === 'editar'
    ? 'Editar Solicitação de Reembolso'
    : (gestaoPageNames[lastSeg] ?? 'Gestão operacional')

  return (
    <>
      <Header loggedIn onLogout={onLogout} />
      <MainMenu loggedIn />
      <div className="container">
        <GestaoBreadcrumb current={currentPage} />
        <div className="beneficiary-grid restricted-area-grid">
          <RestrictedAreaSidebar area="team" homeLabel="Visão geral" homePath="/area-da-equipe" groups={operationalTeamSidebarGroups} onLogout={onLogout} />
          <main className="beneficiary-main restricted-area-main gestao-main">
            <Outlet />
          </main>
        </div>
      </div>
      <Footer />
    </>
  )
}

// ============================================================
// Overview Page
// ============================================================

interface OverviewCardProps {
  to: string
  icon: LucideIcon
  title: string
  description: string
  action: string
}

function OverviewCard({ to, icon: Icon, title, description, action }: OverviewCardProps) {
  return (
    <Link to={to} className="go-overview-card">
      <div className="go-overview-card-icon">
        <Icon />
      </div>
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <div className="go-overview-card-action">
        <span>{action}</span>
        <ArrowRight />
      </div>
    </Link>
  )
}

export function GestaoOverviewPage() {
  return (
    <div>
      <div className="go-page-header">
        <h1>Gestão operacional</h1>
        <p>Gerencie solicitações, autorizações e processos operacionais do Plan-Assiste.</p>
      </div>

      <h2 className="go-section-heading">Solicitações</h2>
      <div className="go-overview-grid">
        <OverviewCard
          to="/gestao-operacional/reembolso-procedimentos"
          icon={HandCoins}
          title="Reembolso de procedimentos"
          description="Solicite reembolso de procedimentos realizados fora da rede credenciada."
          action="Ver solicitações"
        />
        <OverviewCard
          to="/gestao-operacional/auxilio-medicamentos"
          icon={Heart}
          title="Auxílio para medicamentos"
          description="Solicite auxílio ou reembolso para medicamentos de uso contínuo ou especial."
          action="Ver solicitações"
        />
        <OverviewCard
          to="/gestao-operacional/inscricao-dependente"
          icon={UserPlus}
          title="Inscrição de dependente"
          description="Solicite a inscrição de um novo dependente no Plan-Assiste."
          action="Ver solicitações"
        />
        <OverviewCard
          to="/gestao-operacional/autorizacao-procedimentos"
          icon={ClipboardCheck}
          title="Autorização de procedimentos"
          description="Solicite autorização prévia para consultas, exames, cirurgias e tratamentos."
          action="Ver solicitações"
        />
        <OverviewCard
          to="/gestao-operacional/admin/reembolsos"
          icon={ReceiptText}
          title="Gerenciar reembolso e auxílios"
          description="Analise e aprove solicitações de reembolso e auxílio dos beneficiários."
          action="Ver solicitações"
        />
        <OverviewCard
          to="/gestao-operacional/admin/medicamentos"
          icon={Heart}
          title="Gerenciar medicamentos"
          description="Analise e aprove solicitações de auxílio para aquisição de medicamentos."
          action="Ver solicitações"
        />
        <OverviewCard
          to="/gestao-operacional/admin/autorizacoes"
          icon={ClipboardCheck}
          title="Gerenciar autorizações"
          description="Analise e aprove autorizações de procedimentos médicos dos beneficiários."
          action="Ver solicitações"
        />
      </div>

      <h2 className="go-section-heading">Administração do Portal</h2>
      <div className="go-overview-grid">
        <OverviewCard
          to="/gestao-operacional/site"
          icon={Globe}
          title="Administração do Portal"
          description="Gerencie banners, notícias e base de conhecimento do portal Plan-Assiste."
          action="Acessar painel"
        />
      </div>
    </div>
  )
}

// ============================================================
// Shared helpers
// ============================================================

type SolicitacaoStatus = 'Pendente' | 'Aprovado' | 'Recusado'

const statusClass: Record<SolicitacaoStatus, string> = {
  Pendente: 'pending',
  Aprovado: 'approved',
  Recusado: 'refused',
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`go-badge ${statusClass[status as SolicitacaoStatus] ?? ''}`}>
      {status}
    </span>
  )
}

function RowActions({ status }: { status: string }) {
  return (
    <div className="go-row-actions">
      <button className="go-row-action" title="Visualizar" type="button">
        <Eye />
      </button>
      {status === 'Pendente' && (
        <>
          <button className="go-row-action approve" title="Aprovar" type="button">
            <CircleCheck />
          </button>
          <button className="go-row-action refuse" title="Recusar" type="button">
            <CircleX />
          </button>
        </>
      )}
    </div>
  )
}

function countByStatus(data: { status: string }[]) {
  return {
    pendentes: data.filter((s) => s.status === 'Pendente').length,
    aprovados: data.filter((s) => s.status === 'Aprovado').length,
    recusados: data.filter((s) => s.status === 'Recusado').length,
  }
}

function StatsRow({
  pendentes,
  aprovados,
  recusados,
}: {
  pendentes: number
  aprovados: number
  recusados: number
}) {
  return (
    <div className="go-stats-grid">
      <div className="go-stat-card pending">
        <strong>{pendentes}</strong>
        <span>Pendentes</span>
      </div>
      <div className="go-stat-card approved">
        <strong>{aprovados}</strong>
        <span>Aprovadas</span>
      </div>
      <div className="go-stat-card refused">
        <strong>{recusados}</strong>
        <span>Recusadas</span>
      </div>
    </div>
  )
}

// ============================================================
// Tipos e dados compartilhados para Reembolso
// ============================================================

interface Servidor {
  matricula: string
  nome: string
  email: string
  ramo: string
  ddd: string
  telefone: string
  banco: string
  agencia: string
  conta: string
  dvConta: string
}

type ReembolsoSituacao = 'Autorizado' | 'Em análise' | 'Pendente de Envio'

interface ReembolsoRecord {
  id: string
  matricula: string
  beneficiario: string
  dataRegistro: string
  dataEnvio: string
  numeroRecibo: string
  dataRecibo: string
  situacao: ReembolsoSituacao
  cpfCnpjCredenciado: string
  tipoSolicitacao: string
  observacoes: string
  valorRecibo: string
}

const servidoresMock: Servidor[] = [
  {
    matricula: '10041201',
    nome: 'Carlos Eduardo Mendes',
    email: 'carlos.mendes@stj.jus.br',
    ramo: 'STJ',
    ddd: '61',
    telefone: '985432100',
    banco: 'Banco do Brasil - Nº 001',
    agencia: '1247-X',
    conta: '98765',
    dvConta: '3',
  },
  {
    matricula: '10062033',
    nome: 'Juliana Ferreira Costa',
    email: 'juliana.costa@agu.gov.br',
    ramo: 'AGU',
    ddd: '11',
    telefone: '991234567',
    banco: 'Caixa Econômica Federal - Nº 104',
    agencia: '0512-8',
    conta: '67890',
    dvConta: '2',
  },
  {
    matricula: '10058704',
    nome: 'Roberto Alves da Silva',
    email: 'roberto.silva@tcu.gov.br',
    ramo: 'TCU',
    ddd: '61',
    telefone: '998765432',
    banco: 'Bradesco - Nº 237',
    agencia: '3421-1',
    conta: '45678',
    dvConta: '9',
  },
  {
    matricula: '10078345',
    nome: 'Ana Paula Ribeiro',
    email: 'ana.ribeiro@stf.jus.br',
    ramo: 'STF',
    ddd: '61',
    telefone: '992345678',
    banco: 'Itaú - Nº 341',
    agencia: '7823-0',
    conta: '23456',
    dvConta: '1',
  },
  {
    matricula: '10081209',
    nome: 'Fernanda Lima Santos',
    email: 'fernanda.santos@pf.gov.br',
    ramo: 'PF',
    ddd: '71',
    telefone: '987654321',
    banco: 'Santander - Nº 033',
    agencia: '0234-5',
    conta: '34567',
    dvConta: '4',
  },
]

// ============================================================
// Formulário de Reembolso (componente interno compartilhado)
// ============================================================

interface ReembolsoFormProps {
  servidor: Servidor
  editRecord?: ReembolsoRecord
  onBack?: () => void
}

const tiposReembolsoOpts = [
  'Acompanhamento nutricional', 'Acupuntura',
  'Cirurgia com internação', 'Cirurgia sem internação', 'Consulta/Avaliação',
  'Exames', 'Fisioterapia', 'Fonoaudiologia', 'Hidroterapia', 'Honorários individuais',
  'Internação sem cirurgia', 'Medicamentos ambulatoriais', 'Musicoterapia', 'Odontologia',
  'Parto', 'Pilates', 'Psicologia', 'Psicomotricidade', 'Psicopedagogia', 'Quimioterapia',
  'Radioterapia', 'RPG', 'Terapia ocupacional',
]

function parseBRDate(d: string) {
  if (!d || d === '–') return ''
  const [day, month, year] = d.split('/')
  if (!year) return ''
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
}

function ReembolsoForm({ servidor, editRecord, onBack }: ReembolsoFormProps) {
  const [tipoReembolso, setTipoReembolso] = useState(editRecord?.tipoSolicitacao ?? '')
  const [benefAtendido, setBenefAtendido] = useState(editRecord?.beneficiario ?? '')
  const [tipoDep, setTipoDep] = useState('Titular')
  const [portadorTEA, setPortadorTEA] = useState(false)
  const [numNota, setNumNota] = useState(editRecord?.numeroRecibo ?? '')
  const [dataNota, setDataNota] = useState(editRecord ? parseBRDate(editRecord.dataRecibo) : '')
  const [cpfCredenciado, setCpfCredenciado] = useState(editRecord?.cpfCnpjCredenciado ?? '')
  const [valor, setValor] = useState(editRecord?.valorRecibo.replace('R$ ', '') ?? '')
  const [qtdSessoes, setQtdSessoes] = useState('')
  const [obs, setObs] = useState(editRecord?.observacoes === '–' ? '' : (editRecord?.observacoes ?? ''))
  const [declarou, setDeclarou] = useState(false)

  const itensAdicionados = editRecord ? [{
    beneficiario: editRecord.beneficiario,
    portador: 'Não',
    numNota: editRecord.numeroRecibo,
    dataNota: editRecord.dataRecibo,
    cpf: editRecord.cpfCnpjCredenciado,
    tipo: editRecord.tipoSolicitacao,
    sessoes: '–',
    obs: editRecord.observacoes,
    valor: editRecord.valorRecibo,
  }] : []

  return (
    <div className="go-table-card" style={{ padding: '1.5rem 2rem' }}>
      {onBack && (
        <button type="button" className="go-back-link" onClick={onBack}>
          ← Alterar servidor
        </button>
      )}

      <p className="go-form-section" style={{ marginTop: onBack ? '.75rem' : 0 }}>Identificação do(a) Titular</p>
      <div className="go-form-grid">
        <div className="go-field full">
          <label className="go-label">Titular</label>
          <input readOnly className="go-input" defaultValue={servidor.nome} />
        </div>
        <div className="go-field">
          <label className="go-label">Matrícula</label>
          <input readOnly className="go-input" defaultValue={servidor.matricula} />
        </div>
        <div className="go-field">
          <label className="go-label">E-mail</label>
          <input readOnly className="go-input" defaultValue={servidor.email} />
        </div>
        <div className="go-field">
          <label className="go-label">Ramo</label>
          <input readOnly className="go-input" defaultValue={servidor.ramo} />
        </div>
        <div className="go-field">
          <label className="go-label">DDD</label>
          <input readOnly className="go-input" defaultValue={servidor.ddd} />
        </div>
        <div className="go-field">
          <label className="go-label">Telefone</label>
          <input readOnly className="go-input" defaultValue={servidor.telefone} />
        </div>
      </div>

      <p className="go-form-section">Dados Bancários</p>
      <div className="go-form-grid">
        <div className="go-field full">
          <label className="go-label">Banco</label>
          <input readOnly className="go-input" defaultValue={servidor.banco} />
        </div>
        <div className="go-field">
          <label className="go-label">Agência</label>
          <input readOnly className="go-input" defaultValue={servidor.agencia} />
        </div>
        <div className="go-field">
          <label className="go-label">Conta</label>
          <input readOnly className="go-input" defaultValue={servidor.conta} />
        </div>
        <div className="go-field">
          <label className="go-label">DV Conta</label>
          <input readOnly className="go-input" defaultValue={servidor.dvConta} />
        </div>
      </div>
      <p className="go-warning-text">
        Os dados bancários são obtidos a partir do cadastro do beneficiário titular no Plan-Assiste. Os créditos dos reembolsos são obrigatoriamente creditados na conta de recebimento do salário do beneficiário titular.<br />
        Caso os dados cadastrados refiram-se à conta diversa ou exclusiva para recebimento da remuneração, encaminhe um e-mail para <a href="mailto:seplan-cadastro@mpu.mp.br">seplan-cadastro@mpu.mp.br</a>, informando a matrícula e os novos dados bancários.
      </p>

      <p className="go-form-section">Dados da solicitação</p>
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="go-form-grid">
          <div className="go-field">
            <label className="go-label">Tipo de Reembolso</label>
            <Combobox
              options={tiposReembolsoOpts}
              value={tipoReembolso}
              onChange={setTipoReembolso}
              placeholder="Digite ou selecione o tipo..."
            />
          </div>
          <div className="go-field">
            <label className="go-label">Beneficiário atendido</label>
            <select className="go-select" value={benefAtendido} onChange={(e) => { setBenefAtendido(e.target.value); setTipoDep(e.target.value.includes('(Titular)') ? 'Titular' : 'Dependente') }}>
              <option value="">Selecione o Beneficiário</option>
              <option>{servidor.nome} (Titular)</option>
              <option>Cônjuge de {servidor.nome.split(' ')[0]}</option>
              <option>Dependente</option>
            </select>
          </div>
          <div className="go-field">
            <label className="go-label">Tipo de Dependente</label>
            <input type="text" className="go-input" value={tipoDep} readOnly />
          </div>
          <div className="go-field" style={{ justifyContent: 'flex-end', paddingBottom: 6 }}>
            <label className="go-check">
              <input type="checkbox" checked={portadorTEA} onChange={(e) => setPortadorTEA(e.target.checked)} />
              Pessoa com Transtorno do Espectro Autista - TEA, Síndrome de Down - SD ou Paralisia Cerebral - PC
            </label>
          </div>
          <div className="go-field">
            <label className="go-label">Nº Nota Fiscal/Recibo</label>
            <input type="text" className="go-input" value={numNota} onChange={(e) => setNumNota(e.target.value)} />
          </div>
          <div className="go-field">
            <label className="go-label">Data Nota Fiscal/Recibo</label>
            <input type="date" lang="pt-BR" className="go-input" value={dataNota} onChange={(e) => setDataNota(e.target.value)} />
          </div>
          <div className="go-field">
            <label className="go-label">CPF/CNPJ Credenciado</label>
            <input type="text" className="go-input" placeholder="000.000.000-00" value={cpfCredenciado} onChange={(e) => setCpfCredenciado(e.target.value)} />
          </div>
          <div className="go-field">
            <label className="go-label">Valor (R$)</label>
            <input type="text" className="go-input" placeholder="0,00" value={valor} onChange={(e) => setValor(e.target.value)} />
          </div>
          <div className="go-field">
            <label className="go-label">Quantidade de sessões</label>
            <input type="number" min="0" className="go-input" value={qtdSessoes} onChange={(e) => setQtdSessoes(e.target.value)} />
          </div>
          <div className="go-field full">
            <label className="go-label">Observações</label>
            <textarea rows={3} className="go-textarea" value={obs} onChange={(e) => setObs(e.target.value)} />
          </div>
          <div className="go-field">
            <label className="go-label">Nota Fiscal / Recibo</label>
            <label className="go-upload-inline">
              <Upload /><span>Anexar N.F/Recibo digitalizado</span>
              <input type="file" multiple style={{ display: 'none' }} />
            </label>
          </div>
          <div className="go-field">
            <label className="go-label">Pedido / Relatório Médico</label>
            <label className="go-upload-inline">
              <Upload /><span>Anexar pedido/relatório médico digitalizado</span>
              <input type="file" multiple style={{ display: 'none' }} />
            </label>
          </div>
          <div className="go-field">
            <label className="go-label">Relatório de Perícia</label>
            <label className="go-upload-inline">
              <Upload /><span>Anexar o relatório de perícia digitalizado</span>
              <input type="file" multiple style={{ display: 'none' }} />
            </label>
          </div>
          <div className="go-field">
            <label className="go-label">Orçamento Odontológico</label>
            <label className="go-upload-inline">
              <Upload /><span>Anexar o orçamento digitalizado</span>
              <input type="file" multiple style={{ display: 'none' }} />
            </label>
          </div>
          <div className="go-field">
            <label className="go-label">Perícia</label>
            <label className="go-upload-inline">
              <Upload /><span>Anexar e-mail ou relatório de perícia</span>
              <input type="file" multiple style={{ display: 'none' }} />
            </label>
          </div>
          <div className="go-field">
            <label className="go-label">Termo de Encaminhamento</label>
            <label className="go-upload-inline">
              <Upload /><span>Anexar o termo de encaminhamento digitalizado</span>
              <input type="file" multiple style={{ display: 'none' }} />
            </label>
          </div>
          <div className="go-field full">
            <label className="go-label">Documentos adicionais</label>
            <label className="go-upload-inline">
              <Upload /><span>Anexar documento complementar digitalizado</span>
              <input type="file" multiple style={{ display: 'none' }} />
            </label>
          </div>
        </div>

        <div style={{ margin: '1.25rem 0 1rem' }}>
          <button type="button" className="go-add-btn">
            <Plus /> Adicionar solicitação
          </button>
        </div>

        <div className="go-table-wrap" style={{ marginBottom: '1.5rem' }}>
          <table className="go-table">
            <thead>
              <tr>
                <th>Beneficiário</th>
                <th>Portador TEA/SD/PC</th>
                <th>Nº Nota/Recibo</th>
                <th>Data N.F/Recibo</th>
                <th>CPF/CNPJ Credenciado</th>
                <th>Tipo Reembolso</th>
                <th>Qtd Sessões</th>
                <th>Observações</th>
                <th>Valor</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {itensAdicionados.length > 0 ? (
                itensAdicionados.map((item, idx) => (
                  <tr key={idx}>
                    <td className="cell-name">{item.beneficiario}</td>
                    <td>{item.portador}</td>
                    <td>{item.numNota}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{item.dataNota}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{item.cpf}</td>
                    <td>{item.tipo}</td>
                    <td style={{ textAlign: 'center' }}>{item.sessoes}</td>
                    <td>{item.obs}</td>
                    <td className="cell-value">{item.valor}</td>
                    <td>
                      <div className="go-row-actions">
                        <button className="go-row-action edit" title="Editar item" type="button"><Pencil /></button>
                        <button className="go-row-action delete" title="Remover item" type="button"><Trash2 /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--brand-dark)', fontSize: '1rem' }}>
                    Nenhum item adicionado. Preencha os campos acima e clique em "Adicionar solicitação".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="go-terms-section">
          <p className="go-form-section" style={{ marginTop: 0 }}>Termo de responsabilidade</p>
          <p className="go-terms-text">
            Atesto a prestação do(s) serviço(s) e solicito a autorização para o reembolso da(s) despesa(s)
            acima discriminada(s), de acordo com o{' '}
            <a href="#" className="go-link">Regulamento Geral do Plan-Assiste</a>{' '}
            e as Normas Complementares que disciplinam a matéria.
          </p>
          <label className="go-terms-checkbox">
            <input type="checkbox" checked={declarou} onChange={(e) => setDeclarou(e.target.checked)} />
            Declaro que li e concordo com os termos
          </label>
        </div>

        <div className="go-form-actions">
          <button type="submit" className="go-submit" disabled={!declarou}>
            <Send /> Salvar Reembolso
          </button>
          <button type="button" className="go-cancel-btn">Fechar</button>
        </div>
      </form>
    </div>
  )
}

// ============================================================
// Nova Solicitação de Reembolso (página de formulário)
// ============================================================

export function NovaReembolsoPage() {
  const [selectedServidor, setSelectedServidor] = useState<Servidor | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const searchResults = searchQuery.trim().length >= 2
    ? servidoresMock.filter((s) => {
        const q = searchQuery.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
        const nome = s.nome.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
        return nome.includes(q) || s.matricula.includes(searchQuery.trim())
      })
    : []

  return (
    <div>
      <div className="go-page-header">
        <h1>Nova solicitação de reembolso</h1>
        <p>
          {selectedServidor
            ? `Preencha os dados da solicitação para ${selectedServidor.nome}.`
            : 'Busque o servidor pelo nome ou matrícula para iniciar a solicitação.'}
        </p>
      </div>

      {!selectedServidor ? (
        <div className="go-table-card" style={{ padding: '1.5rem 2rem' }}>
          <p className="go-form-section" style={{ marginTop: 0 }}>Buscar Servidor</p>
          <div className="go-search-bar" style={{ maxWidth: 520 }}>
            <Search />
            <input
              type="text"
              placeholder="Nome ou matrícula do servidor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>
          {searchResults.length > 0 && (
            <div className="go-servidor-results">
              {searchResults.map((s) => (
                <button
                  key={s.matricula}
                  type="button"
                  className="go-servidor-result-item"
                  onClick={() => setSelectedServidor(s)}
                >
                  <div className="go-servidor-info">
                    <strong>{s.nome}</strong>
                    <span>Matrícula: {s.matricula} · {s.ramo} · {s.email}</span>
                  </div>
                  <ArrowRight />
                </button>
              ))}
            </div>
          )}
          {searchQuery.trim().length >= 2 && searchResults.length === 0 && (
            <p style={{ marginTop: '1rem', fontSize: '1rem', color: 'var(--brand-dark)' }}>
              Nenhum servidor encontrado para "{searchQuery}".
            </p>
          )}
        </div>
      ) : (
        <ReembolsoForm servidor={selectedServidor} onBack={() => setSelectedServidor(null)} />
      )}
    </div>
  )
}

// ============================================================
// Inscrição de Novo Dependente (página de formulário)
// ============================================================

export function NovaInscricaoDependentePage() {
  return (
    <div>
      <div className="go-page-header">
        <h1>Inscrição de novo dependente</h1>
        <p>Preencha o formulário abaixo para solicitar a inscrição de um novo dependente no Plan-Assiste.</p>
      </div>
      <div className="go-table-card" style={{ padding: '1.5rem 2rem' }}>
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="go-form-grid">
            <div className="go-field">
              <label className="go-label">Nome Completo do Dependente</label>
              <input type="text" placeholder="Nome completo" className="go-input" />
            </div>
            <div className="go-field">
              <label className="go-label">CPF</label>
              <input type="text" placeholder="000.000.000-00" className="go-input" />
            </div>
            <div className="go-field">
              <label className="go-label">Data de Nascimento</label>
              <input type="date" lang="pt-BR" className="go-input" />
            </div>
            <div className="go-field">
              <label className="go-label">Grau de Parentesco</label>
              <select className="go-select">
                <option>Cônjuge</option>
                <option>Companheiro(a)</option>
                <option>Filho(a)</option>
                <option>Enteado(a)</option>
                <option>Pai/Mãe</option>
                <option>Tutelado(a)</option>
                <option>Outro</option>
              </select>
            </div>
            <div className="go-field">
              <label className="go-label">Sexo</label>
              <select className="go-select">
                <option>Masculino</option>
                <option>Feminino</option>
              </select>
            </div>
            <div className="go-field">
              <label className="go-label">Estado Civil</label>
              <select className="go-select">
                <option>Solteiro(a)</option>
                <option>Casado(a)</option>
                <option>Divorciado(a)</option>
                <option>Viúvo(a)</option>
              </select>
            </div>
            <div className="go-field full">
              <label className="go-label">Documentação Comprobatória</label>
              <div className="go-upload">
                <Upload />
                <p>RG, certidão de nascimento/casamento, declaração de IR</p>
                <small>PDF, JPG ou PNG</small>
              </div>
            </div>
          </div>
          <button type="submit" className="go-submit">
            <Send /> Enviar Inscrição
          </button>
        </form>
      </div>
    </div>
  )
}

// ============================================================
// Nova Solicitação de Autorização (página de formulário)
// ============================================================

export function NovaAutorizacaoPage() {
  return (
    <div>
      <div className="go-page-header">
        <h1>Nova solicitação de autorização</h1>
        <p>Preencha o formulário abaixo para solicitar autorização prévia para consultas, exames, cirurgias e tratamentos.</p>
      </div>
      <div className="go-table-card" style={{ padding: '1.5rem 2rem' }}>
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="go-form-grid">
            <div className="go-field">
              <label className="go-label">Beneficiário</label>
              <select className="go-select">
                <option>João Silva Santos (Titular)</option>
                <option>Maria Silva Santos (Cônjuge)</option>
                <option>Pedro Silva Santos (Filho)</option>
              </select>
            </div>
            <div className="go-field">
              <label className="go-label">Tipo de Procedimento</label>
              <select className="go-select">
                <option>Consulta</option>
                <option>Exame Laboratorial</option>
                <option>Exame de Imagem</option>
                <option>Cirurgia</option>
                <option>Tratamento Seriado</option>
                <option>Internação</option>
              </select>
            </div>
            <div className="go-field full">
              <label className="go-label">Descrição do Procedimento</label>
              <input
                type="text"
                placeholder="Ex: Ressonância magnética do joelho direito"
                className="go-input"
              />
            </div>
            <div className="go-field">
              <label className="go-label">Credenciado / Clínica</label>
              <input type="text" placeholder="Nome do credenciado" className="go-input" />
            </div>
            <div className="go-field">
              <label className="go-label">Médico Solicitante</label>
              <input type="text" placeholder="Nome do médico" className="go-input" />
            </div>
            <div className="go-field">
              <label className="go-label">CRM</label>
              <input type="text" placeholder="CRM do médico" className="go-input" />
            </div>
            <div className="go-field">
              <label className="go-label">Data Prevista</label>
              <input type="date" lang="pt-BR" className="go-input" />
            </div>
            <div className="go-field full">
              <label className="go-label">Anexar Pedido Médico</label>
              <div className="go-upload">
                <Upload />
                <p>Guia médica e documentos complementares</p>
                <small>PDF, JPG ou PNG</small>
              </div>
            </div>
          </div>
          <button type="submit" className="go-submit">
            <Send /> Solicitar Autorização
          </button>
        </form>
      </div>
    </div>
  )
}

// ============================================================
// Reembolso de Procedimentos
// ============================================================

const reembolsoUserData: ReembolsoRecord[] = [
  {
    id: '0241001/2026',
    matricula: '0241001',
    beneficiario: 'Carlos Eduardo Mendes',
    dataRegistro: '03/02/2026',
    dataEnvio: '05/02/2026',
    numeroRecibo: '4471',
    dataRecibo: '28/01/2026',
    situacao: 'Autorizado',
    cpfCnpjCredenciado: '12.345.678/0001-90',
    tipoSolicitacao: 'Fisioterapia',
    observacoes: '10 sessões pós-cirúrgicas',
    valorRecibo: 'R$ 450,00',
  },
  {
    id: '0241078/2026',
    matricula: '0241078',
    beneficiario: 'Juliana Ferreira Costa',
    dataRegistro: '14/02/2026',
    dataEnvio: '15/02/2026',
    numeroRecibo: '8821',
    dataRecibo: '10/02/2026',
    situacao: 'Em análise',
    cpfCnpjCredenciado: '321.654.987-11',
    tipoSolicitacao: 'Cardiologia',
    observacoes: 'Consulta + eletrocardiograma',
    valorRecibo: 'R$ 1.200,00',
  },
  {
    id: '0241153/2026',
    matricula: '0241153',
    beneficiario: 'Roberto Alves da Silva',
    dataRegistro: '21/02/2026',
    dataEnvio: '–',
    numeroRecibo: '0056',
    dataRecibo: '18/02/2026',
    situacao: 'Pendente de Envio',
    cpfCnpjCredenciado: '98.765.432/0001-12',
    tipoSolicitacao: 'Oftalmologia',
    observacoes: '–',
    valorRecibo: 'R$ 280,00',
  },
  {
    id: '0241290/2026',
    matricula: '0241290',
    beneficiario: 'Ana Paula Ribeiro',
    dataRegistro: '03/03/2026',
    dataEnvio: '04/03/2026',
    numeroRecibo: '1102',
    dataRecibo: '28/02/2026',
    situacao: 'Autorizado',
    cpfCnpjCredenciado: '54.321.098/0001-76',
    tipoSolicitacao: 'Ortopedia',
    observacoes: 'Artroscopia joelho direito',
    valorRecibo: 'R$ 3.800,00',
  },
  {
    id: '0241314/2026',
    matricula: '0241314',
    beneficiario: 'Carlos Eduardo Mendes',
    dataRegistro: '10/03/2026',
    dataEnvio: '–',
    numeroRecibo: '2237',
    dataRecibo: '07/03/2026',
    situacao: 'Pendente de Envio',
    cpfCnpjCredenciado: '456.789.123-05',
    tipoSolicitacao: 'Psicologia',
    observacoes: '4 sessões mensais',
    valorRecibo: 'R$ 600,00',
  },
  {
    id: '0241402/2026',
    matricula: '0241402',
    beneficiario: 'Fernanda Lima Santos',
    dataRegistro: '18/03/2026',
    dataEnvio: '19/03/2026',
    numeroRecibo: '3388',
    dataRecibo: '14/03/2026',
    situacao: 'Em análise',
    cpfCnpjCredenciado: '23.456.789/0001-34',
    tipoSolicitacao: 'Dermatologia',
    observacoes: 'Biópsia + procedimento',
    valorRecibo: 'R$ 320,00',
  },
  {
    id: '0241518/2026',
    matricula: '0241518',
    beneficiario: 'Roberto Alves da Silva',
    dataRegistro: '25/03/2026',
    dataEnvio: '26/03/2026',
    numeroRecibo: '7764',
    dataRecibo: '20/03/2026',
    situacao: 'Autorizado',
    cpfCnpjCredenciado: '654.321.789-99',
    tipoSolicitacao: 'Neurologia',
    observacoes: '–',
    valorRecibo: 'R$ 2.100,00',
  },
  {
    id: '0241620/2026',
    matricula: '0241620',
    beneficiario: 'Ana Paula Ribeiro',
    dataRegistro: '01/04/2026',
    dataEnvio: '–',
    numeroRecibo: '0912',
    dataRecibo: '29/03/2026',
    situacao: 'Pendente de Envio',
    cpfCnpjCredenciado: '12.345.678/0001-90',
    tipoSolicitacao: 'Fisioterapia',
    observacoes: 'Sessões respiratórias',
    valorRecibo: 'R$ 180,00',
  },
  {
    id: '0241755/2026',
    matricula: '0241755',
    beneficiario: 'Juliana Ferreira Costa',
    dataRegistro: '08/04/2026',
    dataEnvio: '09/04/2026',
    numeroRecibo: '5501',
    dataRecibo: '04/04/2026',
    situacao: 'Autorizado',
    cpfCnpjCredenciado: '87.654.321/0001-55',
    tipoSolicitacao: 'Odontologia',
    observacoes: 'Implante dentário',
    valorRecibo: 'R$ 890,00',
  },
  {
    id: '0241893/2026',
    matricula: '0241893',
    beneficiario: 'Fernanda Lima Santos',
    dataRegistro: '15/04/2026',
    dataEnvio: '17/04/2026',
    numeroRecibo: '6630',
    dataRecibo: '12/04/2026',
    situacao: 'Em análise',
    cpfCnpjCredenciado: '11.222.333/0001-44',
    tipoSolicitacao: 'Cirurgia ambulatorial',
    observacoes: 'Aguardando laudo cirúrgico',
    valorRecibo: 'R$ 5.600,00',
  },
]

function ReembolsoStatusBadge({ situacao }: { situacao: ReembolsoSituacao }) {
  const cls = situacao === 'Autorizado' ? 'approved' : situacao === 'Em análise' ? 'analysis' : 'pending'
  return <span className={`go-badge ${cls}`}>{situacao}</span>
}

export function ReembolsoProcedimentosPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [situacaoFilter, setSituacaoFilter] = useState('Todas')
  const [periodoInicio, setPeriodoInicio] = useState('')
  const [periodoFim, setPeriodoFim] = useState('')

  const filtered = reembolsoUserData.filter((s) => {
    if (situacaoFilter !== 'Todas' && s.situacao !== situacaoFilter) return false
    if (query) {
      const q = query.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
      const target = `${s.beneficiario} ${s.matricula}`.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
      if (!target.includes(q)) return false
    }
    return true
  })

  const total = reembolsoUserData.length
  const pendentes = reembolsoUserData.filter((s) => s.situacao === 'Pendente de Envio').length
  const emAnalise = reembolsoUserData.filter((s) => s.situacao === 'Em análise').length
  const autorizados = reembolsoUserData.filter((s) => s.situacao === 'Autorizado').length

  return (
    <div>
      <div className="go-page-header">
        <h1>Reembolso de procedimentos (livre escolha)</h1>
        <p>Acompanhe e solicite reembolsos de procedimentos realizados fora da rede credenciada</p>
      </div>

      <div className="go-stats-grid cols-4">
        <div className="go-stat-card">
          <strong>{total}</strong>
          <span>Total</span>
        </div>
        <div className="go-stat-card pending">
          <strong>{pendentes}</strong>
          <span>Pendente de Envio</span>
        </div>
        <div className="go-stat-card analysis">
          <strong>{emAnalise}</strong>
          <span>Em análise</span>
        </div>
        <div className="go-stat-card approved">
          <strong>{autorizados}</strong>
          <span>Autorizado</span>
        </div>
      </div>

      <div className="go-table-toolbar-stack">
        <div className="go-table-toolbar">
          <label className="go-filter-label" style={{ flex: 1, minWidth: 220 }}>
            Beneficiário / Matrícula
            <div className="go-search-bar">
              <Search />
              <input
                type="text"
                placeholder="Nome ou matrícula..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </label>
          <button
            type="button"
            className="go-new-btn"
            onClick={() => window.open('/gestao-operacional/reembolso-procedimentos/nova-solicitacao', '_blank')}
          >
            <Plus /> Nova solicitação
          </button>
        </div>
        <div className="go-toolbar-filters">
          <label className="go-filter-label shared-date-range-filter">
            Período
            <NewsDateRangePicker startDate={periodoInicio} endDate={periodoFim} onChange={(start, end) => { setPeriodoInicio(start); setPeriodoFim(end) }} />
          </label>
          <label className="go-filter-label">
            Situação
            <select
              className="go-select"
              value={situacaoFilter}
              onChange={(e) => setSituacaoFilter(e.target.value)}
            >
              {['Todas', 'Pendente de Envio', 'Em análise', 'Autorizado'].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          {(query || situacaoFilter !== 'Todas' || periodoInicio || periodoFim) && (
            <button
              type="button"
              className="go-clear-btn"
              onClick={() => { setQuery(''); setSituacaoFilter('Todas'); setPeriodoInicio(''); setPeriodoFim('') }}
            >
              Limpar
            </button>
          )}
        </div>
      </div>

      <div className="go-table-card">
        <div className="go-table-wrap">
          <table className="go-table">
            <thead>
              <tr>
                <th>Beneficiário</th>
                <th>Nº Reembolso</th>
                <th>Data Registro</th>
                <th>Data Envio</th>
                <th>Nº Recibo/Nota</th>
                <th>Data Recibo/Nota</th>
                <th>Situação</th>
                <th>CPF/CNPJ Credenciado</th>
                <th>Tipo de Solicitação</th>
                <th>Observações</th>
                <th>Valor Nota/Recibo</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((s) => (
                  <tr key={s.id}>
                    <td className="cell-name">{s.beneficiario}</td>
                    <td className="cell-id">{s.id}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{s.dataRegistro}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{s.dataEnvio}</td>
                    <td>{s.numeroRecibo}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{s.dataRecibo}</td>
                    <td><ReembolsoStatusBadge situacao={s.situacao} /></td>
                    <td style={{ whiteSpace: 'nowrap' }}>{s.cpfCnpjCredenciado}</td>
                    <td>{s.tipoSolicitacao}</td>
                    <td>{s.observacoes}</td>
                    <td className="cell-value">{s.valorRecibo}</td>
                    <td>
                      <div className="go-row-actions">
                        <button className="go-row-action" title="Visualizar" type="button">
                          <Eye />
                        </button>
                        <button
                          className="go-row-action edit"
                          title="Editar"
                          type="button"
                          onClick={() => navigate(`/gestao-operacional/reembolso-procedimentos/editar/${s.matricula}`)}
                        >
                          <Pencil />
                        </button>
                        <button className="go-row-action delete" title="Excluir" type="button">
                          <Trash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={12} style={{ textAlign: 'center', padding: '2rem', color: 'var(--brand-dark)' }}>
                    Nenhum resultado encontrado para os filtros aplicados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// Editar Solicitação de Reembolso
// ============================================================

export function EditarReembolsoPage() {
  const { matricula } = useParams<{ matricula: string }>()
  const record = reembolsoUserData.find((r) => r.matricula === matricula)
  const servidor = record
    ? (servidoresMock.find((s) => s.nome === record.beneficiario) ?? servidoresMock[0])
    : servidoresMock[0]

  if (!record) {
    return (
      <div>
        <div className="go-page-header">
          <h1>Solicitação não encontrada</h1>
          <p>Não foi possível localizar a solicitação de matrícula {matricula}.</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="go-page-header">
        <h1>Editar solicitação de reembolso</h1>
        <p>Solicitação {record.id} – {record.beneficiario}</p>
      </div>
      <ReembolsoForm servidor={servidor} editRecord={record} />
    </div>
  )
}

// ============================================================
// Auxílio para Medicamentos
// ============================================================

const medicamentosUserData = [
  {
    id: 'MED-2026-001',
    beneficiario: 'João Silva Santos (Titular)',
    medicamento: 'Insulina Glargina',
    valor: 'R$ 320,00',
    data: '22/03/2026',
    status: 'Pendente',
  },
  {
    id: 'MED-2026-002',
    beneficiario: 'Maria Silva Santos (Cônjuge)',
    medicamento: 'Losartana 50mg',
    valor: 'R$ 45,00',
    data: '10/03/2026',
    status: 'Aprovado',
  },
  {
    id: 'MED-2026-003',
    beneficiario: 'João Silva Santos (Titular)',
    medicamento: 'Metformina 850mg',
    valor: 'R$ 38,00',
    data: '20/02/2026',
    status: 'Aprovado',
  },
]

export function AuxilioMedicamentosPage() {
  const counts = countByStatus(medicamentosUserData)

  return (
    <div>
      <div className="go-page-header">
        <h1>Auxílio para aquisição de medicamentos</h1>
        <p>Solicite auxílio ou reembolso para medicamentos de uso contínuo ou especial</p>
      </div>

      <StatsRow {...counts} />

      <div className="go-table-toolbar">
        <div className="go-search-bar">
          <Search />
          <input type="text" placeholder="Buscar solicitação..." />
        </div>
        <button
          type="button"
          className="go-new-btn"
          onClick={() => window.open('/gestao-operacional/auxilio-medicamentos/nova-solicitacao', '_blank')}
        >
          <Plus /> Nova solicitação
        </button>
      </div>

      <div className="go-table-card">
        <div className="go-table-wrap">
          <table className="go-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Beneficiário</th>
                <th>Medicamento</th>
                <th>Valor</th>
                <th>Data</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {medicamentosUserData.map((s) => (
                <tr key={s.id}>
                  <td className="cell-id">{s.id}</td>
                  <td className="cell-name">{s.beneficiario}</td>
                  <td>{s.medicamento}</td>
                  <td className="cell-value">{s.valor}</td>
                  <td>{s.data}</td>
                  <td>
                    <StatusBadge status={s.status} />
                  </td>
                  <td>
                    <RowActions status={s.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}

// ============================================================
// Inscrição de Dependente
// ============================================================

const dependenteUserData = [
  {
    id: 'DEP-2026-001',
    nome: 'Maria Silva Santos',
    cpf: '123.456.789-00',
    parentesco: 'Cônjuge',
    data: '10/01/2026',
    status: 'Aprovado',
  },
  {
    id: 'DEP-2026-002',
    nome: 'Pedro Silva Santos',
    cpf: '987.654.321-00',
    parentesco: 'Filho(a)',
    data: '05/03/2026',
    status: 'Pendente',
  },
]

export function InscricaoDependentePage() {
  const counts = countByStatus(dependenteUserData)

  return (
    <div>
      <div className="go-page-header">
        <h1>Inscrição de dependente</h1>
        <p>Solicite a inscrição de um novo dependente no Plan-Assiste</p>
      </div>

      <StatsRow {...counts} />

      <div className="go-table-toolbar">
        <div className="go-search-bar">
          <Search />
          <input type="text" placeholder="Buscar inscrição..." />
        </div>
        <button
          type="button"
          className="go-new-btn"
          onClick={() => window.open('/gestao-operacional/inscricao-dependente/nova-solicitacao', '_blank')}
        >
          <Plus /> Nova Inscrição
        </button>
      </div>

      <div className="go-table-card">
        <div className="go-table-wrap">
          <table className="go-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome do Dependente</th>
                <th>CPF</th>
                <th>Parentesco</th>
                <th>Data</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {dependenteUserData.map((s) => (
                <tr key={s.id}>
                  <td className="cell-id">{s.id}</td>
                  <td className="cell-name">{s.nome}</td>
                  <td>{s.cpf}</td>
                  <td>{s.parentesco}</td>
                  <td>{s.data}</td>
                  <td>
                    <StatusBadge status={s.status} />
                  </td>
                  <td>
                    <RowActions status={s.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}

// ============================================================
// Autorização de Procedimentos
// ============================================================

const autorizacaoUserData = [
  {
    id: 'AUT-2026-001',
    beneficiario: 'João Silva Santos (Titular)',
    procedimento: 'Ressonância Magnética – Joelho',
    credenciado: 'Hospital São Lucas',
    data: '23/03/2026',
    status: 'Pendente',
  },
  {
    id: 'AUT-2026-002',
    beneficiario: 'Maria Silva Santos (Cônjuge)',
    procedimento: 'Cirurgia Artroscópica',
    credenciado: 'Clínica Ortomed',
    data: '15/02/2026',
    status: 'Aprovado',
  },
  {
    id: 'AUT-2026-003',
    beneficiario: 'Pedro Silva Santos (Filho)',
    procedimento: 'Tomografia Computadorizada',
    credenciado: 'Lab. Diagnóstico',
    data: '02/02/2026',
    status: 'Recusado',
  },
]

export function AutorizacaoProcedimentosPage() {
  const counts = countByStatus(autorizacaoUserData)

  return (
    <div>
      <div className="go-page-header">
        <h1>Autorização de procedimentos</h1>
        <p>Solicite autorização prévia para consultas, exames, cirurgias e tratamentos</p>
      </div>

      <StatsRow {...counts} />

      <div className="go-table-toolbar">
        <div className="go-search-bar">
          <Search />
          <input type="text" placeholder="Buscar solicitação..." />
        </div>
        <button
          type="button"
          className="go-new-btn"
          onClick={() => window.open('/gestao-operacional/autorizacao-procedimentos/nova-solicitacao', '_blank')}
        >
          <Plus /> Nova solicitação
        </button>
      </div>

      <div className="go-table-card">
        <div className="go-table-wrap">
          <table className="go-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Beneficiário</th>
                <th>Procedimento</th>
                <th>Credenciado</th>
                <th>Data</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {autorizacaoUserData.map((s) => (
                <tr key={s.id}>
                  <td className="cell-id">{s.id}</td>
                  <td className="cell-name">{s.beneficiario}</td>
                  <td>{s.procedimento}</td>
                  <td>{s.credenciado}</td>
                  <td>{s.data}</td>
                  <td>
                    <StatusBadge status={s.status} />
                  </td>
                  <td>
                    <RowActions status={s.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}

// ============================================================
// Admin: Gerenciar Reembolsos / Auxílios
// ============================================================

const reembolsoData = [
  {
    id: 'SOL-2026-001',
    beneficiario: 'Ana Oliveira',
    tipo: 'Reembolso Consulta',
    valor: 'R$ 350,00',
    data: '20/03/2026',
    status: 'Pendente',
  },
  {
    id: 'SOL-2026-002',
    beneficiario: 'Carlos Mendes',
    tipo: 'Reembolso Exame',
    valor: 'R$ 1.200,00',
    data: '18/03/2026',
    status: 'Aprovado',
  },
  {
    id: 'SOL-2026-003',
    beneficiario: 'Fernanda Lima',
    tipo: 'Auxílio Saúde',
    valor: 'R$ 215,00',
    data: '15/03/2026',
    status: 'Pendente',
  },
  {
    id: 'SOL-2026-004',
    beneficiario: 'Roberto Santos',
    tipo: 'Reembolso Fisioterapia',
    valor: 'R$ 640,00',
    data: '12/03/2026',
    status: 'Recusado',
  },
  {
    id: 'SOL-2026-005',
    beneficiario: 'Juliana Costa',
    tipo: 'Reembolso Consulta',
    valor: 'R$ 280,00',
    data: '10/03/2026',
    status: 'Aprovado',
  },
]

export function AdminReembolsoPage() {
  const counts = countByStatus(reembolsoData)
  return (
    <div>
      <div className="go-admin-header">
        <div>
          <h1 className="go-admin-title">Gerenciar solicitações (reembolso/auxílio)</h1>
          <p className="go-admin-subtitle">Analise e aprove solicitações de reembolso e auxílio</p>
        </div>
        <div className="go-search-bar">
          <Search />
          <input type="text" placeholder="Buscar solicitação..." />
        </div>
      </div>

      <StatsRow {...counts} />

      <div className="go-table-card">
        <div className="go-table-wrap">
          <table className="go-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Beneficiário</th>
                <th>Tipo</th>
                <th>Valor</th>
                <th>Data</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {reembolsoData.map((s) => (
                <tr key={s.id}>
                  <td className="cell-id">{s.id}</td>
                  <td className="cell-name">{s.beneficiario}</td>
                  <td>{s.tipo}</td>
                  <td className="cell-value">{s.valor}</td>
                  <td>{s.data}</td>
                  <td>
                    <StatusBadge status={s.status} />
                  </td>
                  <td>
                    <RowActions status={s.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// Admin: Gerenciar Medicamentos
// ============================================================

const medicamentosData = [
  {
    id: 'MED-2026-001',
    beneficiario: 'Lucas Ferreira',
    medicamento: 'Insulina Glargina',
    valor: 'R$ 320,00',
    data: '22/03/2026',
    status: 'Pendente',
  },
  {
    id: 'MED-2026-002',
    beneficiario: 'Patrícia Andrade',
    medicamento: 'Losartana 50mg',
    valor: 'R$ 45,00',
    data: '19/03/2026',
    status: 'Aprovado',
  },
  {
    id: 'MED-2026-003',
    beneficiario: 'Eduardo Silva',
    medicamento: 'Metotrexato',
    valor: 'R$ 280,00',
    data: '16/03/2026',
    status: 'Recusado',
  },
  {
    id: 'MED-2026-004',
    beneficiario: 'Carla Ribeiro',
    medicamento: 'Adalimumabe',
    valor: 'R$ 1.800,00',
    data: '14/03/2026',
    status: 'Pendente',
  },
]

export function AdminMedicamentosPage() {
  const counts = countByStatus(medicamentosData)
  return (
    <div>
      <div className="go-admin-header">
        <div>
          <h1 className="go-admin-title">Gerenciar solicitações (medicamentos)</h1>
          <p className="go-admin-subtitle">
            Analise e aprove solicitações de auxílio para medicamentos
          </p>
        </div>
        <div className="go-search-bar">
          <Search />
          <input type="text" placeholder="Buscar solicitação..." />
        </div>
      </div>

      <StatsRow {...counts} />

      <div className="go-table-card">
        <div className="go-table-wrap">
          <table className="go-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Beneficiário</th>
                <th>Medicamento</th>
                <th>Valor</th>
                <th>Data</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {medicamentosData.map((s) => (
                <tr key={s.id}>
                  <td className="cell-id">{s.id}</td>
                  <td className="cell-name">{s.beneficiario}</td>
                  <td>{s.medicamento}</td>
                  <td className="cell-value">{s.valor}</td>
                  <td>{s.data}</td>
                  <td>
                    <StatusBadge status={s.status} />
                  </td>
                  <td>
                    <RowActions status={s.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// Admin: Gerenciar Autorizações
// ============================================================

const autorizacoesData = [
  {
    id: 'AUT-2026-001',
    beneficiario: 'Paulo Ferreira',
    procedimento: 'Ressonância Magnética',
    credenciado: 'Hospital São Lucas',
    data: '23/03/2026',
    status: 'Pendente',
  },
  {
    id: 'AUT-2026-002',
    beneficiario: 'Lucia Martins',
    procedimento: 'Cirurgia Artroscópica',
    credenciado: 'Clínica Ortomed',
    data: '21/03/2026',
    status: 'Aprovado',
  },
  {
    id: 'AUT-2026-003',
    beneficiario: 'Ricardo Gomes',
    procedimento: 'Tomografia Computadorizada',
    credenciado: 'Lab. Diagnóstico',
    data: '19/03/2026',
    status: 'Pendente',
  },
  {
    id: 'AUT-2026-004',
    beneficiario: 'Sandra Almeida',
    procedimento: 'Internação – Cirurgia Cardíaca',
    credenciado: 'Hospital do Coração',
    data: '17/03/2026',
    status: 'Aprovado',
  },
  {
    id: 'AUT-2026-005',
    beneficiario: 'Marcos Oliveira',
    procedimento: 'Fisioterapia (20 sessões)',
    credenciado: 'Clínica Reabilitar',
    data: '14/03/2026',
    status: 'Recusado',
  },
]

export function AdminAutorizacaoPage() {
  const counts = countByStatus(autorizacoesData)
  return (
    <div>
      <div className="go-admin-header">
        <div>
          <h1 className="go-admin-title">Gerenciar solicitações de autorização</h1>
          <p className="go-admin-subtitle">
            Analise e aprove autorizações de procedimentos médicos
          </p>
        </div>
        <div className="go-search-bar">
          <Search />
          <input type="text" placeholder="Buscar autorização..." />
        </div>
      </div>

      <StatsRow {...counts} />

      <div className="go-table-card">
        <div className="go-table-wrap">
          <table className="go-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Beneficiário</th>
                <th>Procedimento</th>
                <th>Credenciado</th>
                <th>Data</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {autorizacoesData.map((s) => (
                <tr key={s.id}>
                  <td className="cell-id">{s.id}</td>
                  <td className="cell-name">{s.beneficiario}</td>
                  <td>{s.procedimento}</td>
                  <td>{s.credenciado}</td>
                  <td>{s.data}</td>
                  <td>
                    <StatusBadge status={s.status} />
                  </td>
                  <td>
                    <RowActions status={s.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// Gestão do Site – Overview
// ============================================================

export function AdminSiteOverviewPage() {
  return (
    <div>
      <div className="go-page-header">
        <h1>Administração do portal</h1>
        <p>Gerencie os conteúdos e configurações do portal Plan-Assiste.</p>
      </div>
      <div className="go-overview-grid">
        <OverviewCard
          to="/gestao-operacional/site/banners"
          icon={Layout}
          title="Banners"
          description="Gerencie os banners exibidos na página inicial e demais seções do portal."
          action="Gerenciar banners"
        />
        <OverviewCard
          to="/gestao-operacional/site/noticias"
          icon={Newspaper}
          title="Notícias"
          description="Publique e gerencie artigos e notícias exibidos na seção de comunicação."
          action="Gerenciar notícias"
        />
        <OverviewCard
          to="/gestao-operacional/site/base-conhecimento"
          icon={BookOpen}
          title="Base de conhecimento"
          description="Gerencie perguntas frequentes, tutoriais e artigos de suporte ao beneficiário."
          action="Gerenciar conteúdo"
        />
      </div>
      <div className="go-page-header go-content-inventory-heading">
        <h2>Outros conteúdos do portal</h2>
        <p>Itens identificados no site que também podem fazer parte da administração editorial.</p>
      </div>
      <div className="go-overview-grid">
        <OverviewCard
          to="/plan-assiste"
          icon={Globe}
          title="Páginas institucionais"
          description="Inclui a página principal do Plan-Assiste e suas páginas de apresentação, estrutura, contatos e informações institucionais."
          action="Visualizar no portal"
        />
        <OverviewCard
          to="/transparencia"
          icon={Layout}
          title="Avaliações atuariais"
          description="Gerencie os relatórios anuais, resumos, datas de referência e arquivos publicados na área de Transparência."
          action="Visualizar no portal"
        />
        <OverviewCard
          to="/plan-assiste/normas-complementares"
          icon={FileText}
          title="Normas e documentos"
          description="Reúne normas complementares, regulamento, portarias, datas de publicação, anexos e situação de vigência."
          action="Visualizar no portal"
        />
        <OverviewCard
          to="/beneficiario/servicos"
          icon={Library}
          title="Catálogo de serviços"
          description="Permite manter descrições, públicos, categorias, documentos necessários e links para solicitações."
          action="Visualizar no portal"
        />
      </div>
      <div className="go-editor-proposal" role="note">
        <strong>Proposta para edição das páginas institucionais</strong>
        <p>Adotar um editor estruturado por blocos, preservando o modelo visual de cada página. A equipe editaria campos como título, resumo, seções, listas, tabelas, arquivos e botões, com rascunho, pré-visualização, histórico de versões e publicação mediante permissão. A página “Plan-Assiste” deve ser a primeira desse fluxo.</p>
      </div>
    </div>
  )
}

// ============================================================
// Gestão do Site – Banners
// ============================================================

const bannersData = [
  { id: 'BAN-001', titulo: 'Novo Aplicativo Plan-Assiste', perfil: 'Público', destino: '/aplicativo', ativo: true, dataInicio: '01/06/2026', dataFim: '30/06/2026', ordem: 1 },
  { id: 'BAN-002', titulo: 'Campanha Saúde Bucal 2026', perfil: 'Beneficiário', destino: '/noticias/2', ativo: true, dataInicio: '15/05/2026', dataFim: '15/07/2026', ordem: 2 },
  { id: 'BAN-003', titulo: 'Atualização Cadastral Obrigatória', perfil: 'Beneficiário', destino: '/beneficiario/meus-dados', ativo: false, dataInicio: '01/03/2026', dataFim: '31/03/2026', ordem: 3 },
  { id: 'BAN-004', titulo: 'Rede Credenciada Ampliada', perfil: 'Credenciado', destino: '/rede-credenciada', ativo: true, dataInicio: '01/06/2026', dataFim: '31/08/2026', ordem: 1 },
  { id: 'BAN-005', titulo: 'Prazos operacionais do mês', perfil: 'Equipe', destino: '/area-da-equipe', ativo: true, dataInicio: '01/06/2026', dataFim: '30/06/2026', ordem: 1 },
]

export function AdminBannersPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [perfilFilter, setPerfilFilter] = useState('Todos')
  const ativos = bannersData.filter((b) => b.ativo).length
  const filtered = bannersData.filter(
    (b) => (perfilFilter === 'Todos' || b.perfil === perfilFilter)
      && (!query || b.titulo.toLowerCase().includes(query.toLowerCase())),
  )

  return (
    <div>
      <div className="go-page-header">
        <h1>Gerenciar banners</h1>
        <p>Gerencie os banners e defina em qual perfil do portal cada conteúdo será exibido.</p>
      </div>

      <div className="go-stats-grid">
        <div className="go-stat-card">
          <strong>{bannersData.length}</strong>
          <span>Total de Banners</span>
        </div>
        <div className="go-stat-card approved">
          <strong>{ativos}</strong>
          <span>Ativos</span>
        </div>
        <div className="go-stat-card refused">
          <strong>{bannersData.length - ativos}</strong>
          <span>Inativos</span>
        </div>
      </div>

      <div className="go-table-toolbar" style={{ marginBottom: 16 }}>
        <div className="go-search-bar" style={{ flex: 1 }}>
          <Search />
          <input
            type="text"
            placeholder="Buscar banner..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <select className="go-select" style={{ width: 'auto', minWidth: 180 }} value={perfilFilter} onChange={(e) => setPerfilFilter(e.target.value)} aria-label="Filtrar banners por perfil">
          <option>Todos</option>
          <option>Público</option>
          <option>Beneficiário</option>
          <option>Credenciado</option>
          <option>Equipe</option>
        </select>
        <button type="button" className="go-new-btn" onClick={() => navigate('/gestao-operacional/site/banners/novo-banner')}>
          <Plus /> Novo banner
        </button>
      </div>

      <div className="go-table-card">
        <div className="go-table-wrap">
          <table className="go-table">
            <thead>
              <tr>
                <th>Ordem</th>
                <th>Título</th>
                <th>Perfil de exibição</th>
                <th>Página de Destino</th>
                <th>Status</th>
                <th>Data Início</th>
                <th>Data Fim</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id}>
                  <td style={{ textAlign: 'center', fontWeight: 600 }}>{b.ordem}</td>
                  <td className="cell-name">{b.titulo}</td>
                  <td><span className="go-badge info">{b.perfil}</span></td>
                  <td>
                    <code className="go-code-tag">{b.destino}</code>
                  </td>
                  <td>
                    <span className={`go-badge ${b.ativo ? 'approved' : 'refused'}`}>
                      {b.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>{b.dataInicio}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>{b.dataFim}</td>
                  <td>
                    <div className="go-row-actions">
                      <button className="go-row-action" title="Visualizar" type="button">
                        <Eye />
                      </button>
                      <button className="go-row-action edit" title="Editar" type="button">
                        <Pencil />
                      </button>
                      <button className="go-row-action delete" title="Excluir" type="button">
                        <Trash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// Gestão do Site – Notícias
// ============================================================

const adminNoticiasData = [
  { id: 1, titulo: 'Plan-Assiste lança novo aplicativo', categoria: 'Institucional', autor: 'Equipe Plan-Assiste', data: '20/06/2026', status: 'Publicada', publico: 'Ambos', abrangencia: 'Nacional' },
  { id: 2, titulo: 'Novas coberturas para tratamentos odontológicos', categoria: 'Cobertura', autor: 'Dep. Técnico', data: '15/06/2026', status: 'Publicada', publico: 'Beneficiários', abrangencia: 'Nacional' },
  { id: 3, titulo: 'Atualização dos critérios de reembolso', categoria: 'Regulamento', autor: 'Jurídico', data: '10/06/2026', status: 'Rascunho', publico: 'Beneficiários', abrangencia: 'Regional' },
  { id: 4, titulo: 'Campanha de prevenção ao diabetes', categoria: 'Saúde', autor: 'Equipe Plan-Assiste', data: '05/06/2026', status: 'Publicada', publico: 'Ambos', abrangencia: 'Nacional' },
  { id: 5, titulo: 'Rede credenciada ampliada em Goiânia', categoria: 'Rede Credenciada', autor: 'Dep. Credenciamento', data: '01/06/2026', status: 'Publicada', publico: 'Credenciados', abrangencia: 'Regional' },
  { id: 6, titulo: 'Prazo para declaração do IRPF 2026', categoria: 'Financeiro', autor: 'Jurídico', data: '25/05/2026', status: 'Rascunho', publico: 'Beneficiários', abrangencia: 'Nacional' },
]

const noticiaStatusCls: Record<string, string> = { Publicada: 'approved', Rascunho: 'pending' }

const noticiaPublicoCls: Record<string, string> = { Ambos: 'info', Beneficiários: 'approved', Credenciados: 'warning' }

export function AdminNoticiasPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [categoriaFilter, setCategoriaFilter] = useState('Todas')
  const [publicoFilter, setPublicoFilter] = useState('Todos')
  const [abrangenciaFilter, setAbrangenciaFilter] = useState('Todas')
  const categorias = ['Todas', ...Array.from(new Set(adminNoticiasData.map((n) => n.categoria)))]

  const filtered = adminNoticiasData.filter((n) => {
    if (categoriaFilter !== 'Todas' && n.categoria !== categoriaFilter) return false
    if (publicoFilter !== 'Todos' && n.publico !== publicoFilter) return false
    if (abrangenciaFilter !== 'Todas' && n.abrangencia !== abrangenciaFilter) return false
    if (query) {
      const q = query.toLowerCase()
      return n.titulo.toLowerCase().includes(q) || n.autor.toLowerCase().includes(q)
    }
    return true
  })

  const publicadas = adminNoticiasData.filter((n) => n.status === 'Publicada').length
  const rascunhos = adminNoticiasData.filter((n) => n.status === 'Rascunho').length

  return (
    <div>
      <div className="go-page-header">
        <h1>Gerenciar notícias</h1>
        <p>Publique e gerencie artigos e notícias do portal.</p>
      </div>

      <div className="go-stats-grid">
        <div className="go-stat-card">
          <strong>{adminNoticiasData.length}</strong>
          <span>Total</span>
        </div>
        <div className="go-stat-card approved">
          <strong>{publicadas}</strong>
          <span>Publicadas</span>
        </div>
        <div className="go-stat-card pending">
          <strong>{rascunhos}</strong>
          <span>Rascunhos</span>
        </div>
      </div>

      <div className="go-table-toolbar" style={{ marginBottom: 16 }}>
        <div className="go-search-bar" style={{ flex: 1 }}>
          <Search />
          <input
            type="text"
            placeholder="Título ou autor..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <select
          className="go-select"
          style={{ width: 'auto', minWidth: 160 }}
          value={categoriaFilter}
          onChange={(e) => setCategoriaFilter(e.target.value)}
        >
          {categorias.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select
          className="go-select"
          style={{ width: 'auto', minWidth: 150 }}
          value={publicoFilter}
          onChange={(e) => setPublicoFilter(e.target.value)}
        >
          <option>Todos</option>
          <option>Beneficiários</option>
          <option>Credenciados</option>
          <option>Ambos</option>
        </select>
        <select
          className="go-select"
          style={{ width: 'auto', minWidth: 140 }}
          value={abrangenciaFilter}
          onChange={(e) => setAbrangenciaFilter(e.target.value)}
        >
          <option>Todas</option>
          <option>Nacional</option>
          <option>Regional</option>
        </select>
        <button
          type="button"
          className="go-new-btn"
          style={{ background: 'transparent', border: '1.5px solid var(--brand-primary)', color: 'var(--brand-primary)' }}
          onClick={() => navigate('/gestao-operacional/site/noticias/categorias-noticias')}
        >
          <Tag /> Categorias
        </button>
        <button type="button" className="go-new-btn" onClick={() => navigate('/gestao-operacional/site/noticias/nova-noticia')}>
          <Plus /> Nova notícia
        </button>
      </div>

      <div className="go-table-card">
        <div className="go-table-wrap">
          <table className="go-table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Categoria</th>
                <th>Público</th>
                <th>Abrangência</th>
                <th>Autor</th>
                <th>Data</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((n) => (
                <tr key={n.id}>
                  <td className="cell-name">{n.titulo}</td>
                  <td><span className="go-category-tag">{n.categoria}</span></td>
                  <td>
                    <span className={`go-badge ${noticiaPublicoCls[n.publico] ?? ''}`}>
                      {n.publico}
                    </span>
                  </td>
                  <td>
                    <span className={`go-badge ${n.abrangencia === 'Nacional' ? 'info' : 'warning'}`}>
                      {n.abrangencia}
                    </span>
                  </td>
                  <td>{n.autor}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>{n.data}</td>
                  <td>
                    <span className={`go-badge ${noticiaStatusCls[n.status] ?? ''}`}>
                      {n.status}
                    </span>
                  </td>
                  <td>
                    <div className="go-row-actions">
                      <button className="go-row-action" title="Visualizar" type="button">
                        <Eye />
                      </button>
                      <button className="go-row-action edit" title="Editar" type="button">
                        <Pencil />
                      </button>
                      <button className="go-row-action delete" title="Excluir" type="button">
                        <Trash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// Gestão do Site – Base de Conhecimento
// ============================================================

const baseConhecimentoData = [
  { id: 1, titulo: 'Como solicitar reembolso de procedimentos?', categoria: 'Reembolso', status: 'Publicado', atualizacao: '01/06/2026', visualizacoes: 1247 },
  { id: 2, titulo: 'Prazos para inscrição de dependentes', categoria: 'Dependentes', status: 'Publicado', atualizacao: '20/05/2026', visualizacoes: 832 },
  { id: 3, titulo: 'Documentação necessária para autorização de procedimentos', categoria: 'Autorização', status: 'Rascunho', atualizacao: '15/05/2026', visualizacoes: 0 },
  { id: 4, titulo: 'Rede credenciada: como encontrar credenciados próximos', categoria: 'Rede Credenciada', status: 'Publicado', atualizacao: '10/05/2026', visualizacoes: 2156 },
  { id: 5, titulo: 'IRPF: como obter o comprovante de despesas médicas', categoria: 'Financeiro', status: 'Publicado', atualizacao: '05/05/2026', visualizacoes: 3891 },
  { id: 6, titulo: 'Limites de cobertura odontológica por procedimento', categoria: 'Cobertura', status: 'Rascunho', atualizacao: '01/05/2026', visualizacoes: 0 },
]

export function AdminBaseConhecimentoPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [categoriaFilter, setCategoriaFilter] = useState('Todas')
  const categorias = ['Todas', ...Array.from(new Set(baseConhecimentoData.map((b) => b.categoria)))]

  const filtered = baseConhecimentoData.filter((b) => {
    if (categoriaFilter !== 'Todas' && b.categoria !== categoriaFilter) return false
    if (query) return b.titulo.toLowerCase().includes(query.toLowerCase())
    return true
  })

  const publicados = baseConhecimentoData.filter((b) => b.status === 'Publicado').length

  return (
    <div>
      <div className="go-page-header">
        <h1>Base de conhecimento</h1>
        <p>Gerencie artigos, tutoriais e perguntas frequentes do portal.</p>
      </div>

      <div className="go-stats-grid">
        <div className="go-stat-card">
          <strong>{baseConhecimentoData.length}</strong>
          <span>Total de Artigos</span>
        </div>
        <div className="go-stat-card approved">
          <strong>{publicados}</strong>
          <span>Publicados</span>
        </div>
        <div className="go-stat-card pending">
          <strong>{baseConhecimentoData.length - publicados}</strong>
          <span>Rascunhos</span>
        </div>
      </div>

      <div className="go-table-toolbar" style={{ marginBottom: 16 }}>
        <div className="go-search-bar" style={{ flex: 1 }}>
          <Search />
          <input
            type="text"
            placeholder="Título do artigo..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <select
          className="go-select"
          style={{ width: 'auto', minWidth: 160 }}
          value={categoriaFilter}
          onChange={(e) => setCategoriaFilter(e.target.value)}
        >
          {categorias.map((c) => <option key={c}>{c}</option>)}
        </select>
        <button type="button" className="go-new-btn" onClick={() => navigate('/gestao-operacional/site/base-conhecimento/novo-artigo')}>
          <Plus /> Novo artigo
        </button>
      </div>

      <div className="go-table-card">
        <div className="go-table-wrap">
          <table className="go-table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Categoria</th>
                <th>Visualizações</th>
                <th>Última Atualização</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id}>
                  <td className="cell-name">{b.titulo}</td>
                  <td><span className="go-category-tag">{b.categoria}</span></td>
                  <td style={{ textAlign: 'center' }}>
                    {b.visualizacoes > 0 ? b.visualizacoes.toLocaleString('pt-BR') : '–'}
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>{b.atualizacao}</td>
                  <td>
                    <span className={`go-badge ${b.status === 'Publicado' ? 'approved' : 'pending'}`}>
                      {b.status}
                    </span>
                  </td>
                  <td>
                    <div className="go-row-actions">
                      <button className="go-row-action" title="Visualizar" type="button">
                        <Eye />
                      </button>
                      <button className="go-row-action edit" title="Editar" type="button">
                        <Pencil />
                      </button>
                      <button className="go-row-action delete" title="Excluir" type="button">
                        <Trash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// Cadastro – Novo Banner
// ============================================================

export function NovoBannerPage() {
  const navigate = useNavigate()
  const [status, setStatus] = useState('ativo')
  const [perfil, setPerfil] = useState('Público')

  return (
    <div>
      <div className="go-page-header">
        <h1>Novo banner</h1>
        <p>Preencha as informações para cadastrar um novo banner no portal.</p>
      </div>

      <div className="go-table-card" style={{ padding: '1.5rem 2rem' }}>
        <form onSubmit={(e) => e.preventDefault()}>
          <p className="go-form-section" style={{ marginTop: 0 }}>Informações do banner</p>
          <div className="go-form-grid">
            <div className="go-field full">
              <label className="go-label">Título</label>
              <input type="text" className="go-input" placeholder="Ex: Campanha de Vacinação 2026" />
            </div>
            <div className="go-field">
              <label className="go-label">Perfil de exibição</label>
              <select className="go-select" value={perfil} onChange={(e) => setPerfil(e.target.value)}>
                <option>Público</option>
                <option>Beneficiário</option>
                <option>Credenciado</option>
                <option>Equipe</option>
              </select>
              <small className="go-field-help">O banner será exibido somente na área correspondente ao perfil selecionado.</small>
            </div>
            <div className="go-field full">
              <label className="go-label">Página de Destino</label>
              <input type="text" className="go-input" placeholder="Ex: /noticias/1 ou /rede-credenciada" />
            </div>
            <div className="go-field full">
              <label className="go-label">Imagem do Banner</label>
              <div className="go-upload">
                <Upload />
                <p>Arraste a imagem ou clique para selecionar</p>
                <small>JPG, PNG ou WebP – recomendado 1440 × 480 px</small>
                <input type="file" accept="image/*" style={{ display: 'none' }} />
              </div>
            </div>
          </div>

          <p className="go-form-section">Publicação</p>
          <div className="go-form-grid">
            <div className="go-field">
              <label className="go-label">Data de Início</label>
              <input type="date" lang="pt-BR" className="go-input" />
            </div>
            <div className="go-field">
              <label className="go-label">Data de Fim</label>
              <input type="date" lang="pt-BR" className="go-input" />
            </div>
            <div className="go-field">
              <label className="go-label">Ordem de Exibição</label>
              <input type="number" min="1" className="go-input" placeholder="1" />
            </div>
            <div className="go-field">
              <label className="go-label">Status</label>
              <select className="go-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </div>
          </div>

          <div className="go-form-actions">
            <button type="submit" className="go-submit">
              <Send /> Salvar Banner
            </button>
            <button type="button" className="go-cancel-btn" onClick={() => navigate('/gestao-operacional/site/banners')}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ============================================================
// Cadastro – Nova Notícia
// ============================================================

const categoriasNoticias = ['Institucional', 'Cobertura', 'Regulamento', 'Saúde', 'Rede Credenciada', 'Financeiro']

const ufsBrasilNoticias = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG',
  'PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
]

export function NovaNoticiaPage() {
  const navigate = useNavigate()
  const [status, setStatus] = useState('Rascunho')
  const [publico, setPublico] = useState('Ambos')
  const [abrangencia, setAbrangencia] = useState('Nacional')
  const [estadosSel, setEstadosSel] = useState<string[]>([])

  function toggleEstado(uf: string) {
    setEstadosSel((prev) => prev.includes(uf) ? prev.filter((e) => e !== uf) : [...prev, uf])
  }

  return (
    <div>
      <div className="go-page-header">
        <h1>Nova notícia</h1>
        <p>Preencha as informações para publicar uma nova notícia no portal.</p>
      </div>

      <div className="go-table-card" style={{ padding: '1.5rem 2rem' }}>
        <form onSubmit={(e) => e.preventDefault()}>
          <p className="go-form-section" style={{ marginTop: 0 }}>Dados da Notícia</p>
          <div className="go-form-grid">
            <div className="go-field full">
              <label className="go-label">Título</label>
              <input type="text" className="go-input" placeholder="Título da notícia" />
            </div>
            <div className="go-field full">
              <label className="go-label">Subtítulo / Resumo</label>
              <input type="text" className="go-input" placeholder="Breve descrição exibida na listagem" />
            </div>
            <div className="go-field">
              <label className="go-label">Categoria</label>
              <select className="go-select">
                <option value="">Selecione a categoria</option>
                {categoriasNoticias.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="go-field">
              <label className="go-label">Autor</label>
              <input type="text" className="go-input" placeholder="Nome do autor ou equipe" />
            </div>
            <div className="go-field">
              <label className="go-label">Data de Publicação</label>
              <input type="date" lang="pt-BR" className="go-input" />
            </div>
            <div className="go-field">
              <label className="go-label">Status</label>
              <select className="go-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option>Rascunho</option>
                <option>Publicada</option>
              </select>
            </div>
          </div>

          <p className="go-form-section">Público e Abrangência</p>
          <div className="go-form-grid">
            <div className="go-field">
              <label className="go-label">Disponível para</label>
              <select className="go-select" value={publico} onChange={(e) => setPublico(e.target.value)}>
                <option>Ambos</option>
                <option>Beneficiários</option>
                <option>Credenciados</option>
              </select>
            </div>
            <div className="go-field">
              <label className="go-label">Abrangência</label>
              <select className="go-select" value={abrangencia} onChange={(e) => { setAbrangencia(e.target.value); setEstadosSel([]) }}>
                <option>Nacional</option>
                <option>Regional</option>
              </select>
            </div>
            {abrangencia === 'Regional' && (
              <div className="go-field full">
                <label className="go-label">
                  Estados {estadosSel.length > 0 && <span className="go-label-count">({estadosSel.length} selecionados)</span>}
                </label>
                <div className="go-states-grid">
                  {ufsBrasilNoticias.map((uf) => (
                    <label key={uf} className="go-state-check">
                      <input
                        type="checkbox"
                        checked={estadosSel.includes(uf)}
                        onChange={() => toggleEstado(uf)}
                      />
                      {uf}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          <p className="go-form-section">Imagem de Capa</p>
          <div className="go-form-grid">
            <div className="go-field full">
              <div className="go-upload">
                <Upload />
                <p>Arraste a imagem ou clique para selecionar</p>
                <small>JPG ou PNG – recomendado 1200 × 630 px</small>
                <input type="file" accept="image/*" style={{ display: 'none' }} />
              </div>
            </div>
          </div>

          <p className="go-form-section">Conteúdo</p>
          <div className="go-form-grid">
            <div className="go-field full">
              <label className="go-label">Texto da Notícia</label>
              <RichTextEditor placeholder="Escreva o conteúdo completo da notícia aqui..." />
            </div>
          </div>

          <div className="go-form-actions">
            <button type="submit" className="go-submit">
              <Send /> {status === 'Publicada' ? 'Publicar Notícia' : 'Salvar Rascunho'}
            </button>
            <button type="button" className="go-cancel-btn" onClick={() => navigate('/gestao-operacional/site/noticias')}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ============================================================
// Cadastro – Novo Artigo (Base de Conhecimento)
// ============================================================

const categoriasBaseConhecimento = ['Reembolso', 'Dependentes', 'Autorização', 'Rede Credenciada', 'Financeiro', 'Cobertura']

export function NovoArtigoPage() {
  const navigate = useNavigate()
  const [status, setStatus] = useState('Rascunho')

  return (
    <div>
      <div className="go-page-header">
        <h1>Novo artigo</h1>
        <p>Cadastre um novo artigo ou pergunta frequente na base de conhecimento.</p>
      </div>

      <div className="go-table-card" style={{ padding: '1.5rem 2rem' }}>
        <form onSubmit={(e) => e.preventDefault()}>
          <p className="go-form-section" style={{ marginTop: 0 }}>Identificação</p>
          <div className="go-form-grid">
            <div className="go-field full">
              <label className="go-label">Título / Pergunta</label>
              <input type="text" className="go-input" placeholder="Ex: Como solicitar reembolso de procedimentos?" />
            </div>
            <div className="go-field">
              <label className="go-label">Categoria</label>
              <select className="go-select">
                <option value="">Selecione a categoria</option>
                {categoriasBaseConhecimento.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="go-field">
              <label className="go-label">Status</label>
              <select className="go-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option>Rascunho</option>
                <option>Publicado</option>
              </select>
            </div>
          </div>

          <p className="go-form-section">Conteúdo / Resposta</p>
          <div className="go-form-grid">
            <div className="go-field full">
              <label className="go-label">Texto do Artigo</label>
              <textarea
                rows={16}
                className="go-textarea"
                placeholder="Escreva aqui a resposta ou o conteúdo completo do artigo..."
              />
            </div>
            <div className="go-field full">
              <label className="go-label">Anexos (opcional)</label>
              <label className="go-upload-inline">
                <Upload />
                <span>Anexar arquivo complementar (PDF, imagem)</span>
                <input type="file" style={{ display: 'none' }} />
              </label>
            </div>
          </div>

          <div className="go-form-actions">
            <button type="submit" className="go-submit">
              <Send /> {status === 'Publicado' ? 'Publicar Artigo' : 'Salvar Rascunho'}
            </button>
            <button type="button" className="go-cancel-btn" onClick={() => navigate('/gestao-operacional/site/base-conhecimento')}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ============================================================
// Gestão do Site – Categorias de Notícias
// ============================================================

const categoriasNoticiasData = [
  { id: 1, nome: 'Institucional', cor: '#0d8473', totalNoticias: 12 },
  { id: 2, nome: 'Cobertura', cor: '#2874d8', totalNoticias: 8 },
  { id: 3, nome: 'Regulamento', cor: '#d7a739', totalNoticias: 5 },
  { id: 4, nome: 'Saúde', cor: '#d94d6a', totalNoticias: 9 },
  { id: 5, nome: 'Rede Credenciada', cor: '#087765', totalNoticias: 6 },
  { id: 6, nome: 'Financeiro', cor: '#6366f1', totalNoticias: 4 },
]

export function AdminCategoriasNoticiasPage() {
  const [query, setQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingNome, setEditingNome] = useState('')
  const [editingCor, setEditingCor] = useState('#0d8473')

  const filtered = categoriasNoticiasData.filter(
    (c) => !query || c.nome.toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <div>
      <div className="go-page-header">
        <h1>Categorias de notícias</h1>
        <p>Gerencie as categorias utilizadas para classificar as notícias do portal.</p>
      </div>

      <div className="go-table-toolbar" style={{ marginBottom: 16 }}>
        <div className="go-search-bar" style={{ flex: 1 }}>
          <Search />
          <input
            type="text"
            placeholder="Buscar categoria..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <button type="button" className="go-new-btn" onClick={() => { setShowForm(true); setEditingNome(''); setEditingCor('#0d8473') }}>
          <Plus /> Nova Categoria
        </button>
      </div>

      {showForm && (
        <div className="go-table-card" style={{ padding: '1.25rem 1.75rem', marginBottom: 16 }}>
          <p className="go-form-section" style={{ marginTop: 0 }}>
            {editingNome ? 'Editar Categoria' : 'Nova Categoria'}
          </p>
          <form onSubmit={(e) => { e.preventDefault(); setShowForm(false) }}>
            <div className="go-form-grid">
              <div className="go-field">
                <label className="go-label">Nome da Categoria</label>
                <input
                  type="text"
                  className="go-input"
                  placeholder="Ex: Institucional"
                  value={editingNome}
                  onChange={(e) => setEditingNome(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="go-field">
                <label className="go-label">Cor de Identificação</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input
                    type="color"
                    value={editingCor}
                    onChange={(e) => setEditingCor(e.target.value)}
                    style={{ width: 44, height: 44, border: '2px solid var(--border)', borderRadius: 8, cursor: 'pointer', padding: 2 }}
                  />
                  <input
                    type="text"
                    className="go-input"
                    value={editingCor}
                    onChange={(e) => setEditingCor(e.target.value)}
                    style={{ flex: 1 }}
                  />
                </div>
              </div>
            </div>
            <div className="go-form-actions" style={{ justifyContent: 'flex-start', paddingTop: '1rem' }}>
              <button type="submit" className="go-submit" style={{ marginTop: 0 }}>
                <Send /> Salvar Categoria
              </button>
              <button type="button" className="go-cancel-btn" style={{ marginTop: 0 }} onClick={() => setShowForm(false)}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="go-table-card">
        <div className="go-table-wrap">
          <table className="go-table">
            <thead>
              <tr>
                <th>Cor</th>
                <th>Nome</th>
                <th>Notícias vinculadas</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td style={{ width: 48 }}>
                    <span
                      style={{ display: 'inline-block', width: 22, height: 22, borderRadius: 5, background: c.cor, verticalAlign: 'middle' }}
                    />
                  </td>
                  <td className="cell-name">{c.nome}</td>
                  <td style={{ textAlign: 'center' }}>{c.totalNoticias}</td>
                  <td>
                    <div className="go-row-actions">
                      <button
                        className="go-row-action edit"
                        title="Editar"
                        type="button"
                        onClick={() => { setEditingNome(c.nome); setEditingCor(c.cor); setShowForm(true) }}
                      >
                        <Pencil />
                      </button>
                      <button className="go-row-action delete" title="Excluir" type="button">
                        <Trash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
