import { useState } from 'react'
import {
  Home, Grid2X2, MapPin, Heart, User,
  Bell, CreditCard, FileText, DollarSign,
  ChevronRight, RefreshCw, Maximize2, ArrowLeft,
  Shield, HelpCircle, Phone, MessageCircle, Headphones,
} from 'lucide-react'
import { GovBrSignInButton } from '../components/GovBrSignInButton'

// ─── Material Design 3 type scale – Titillium Web ────────────────────────────
//
//  MD3 weight "Medium (500)" → mapeado para 600 (SemiBold) no Titillium Web.
//  Linha de base do contêiner: font-size 16px (neutraliza os 18px do portal).
//
//  Token           Size   Weight  Line-height  Uso típico
//  displaySmall    36px   400     1.11         títulos muito grandes (não usado nas telas atuais)
//  headlineLarge   32px   400     1.25         –
//  headlineMedium  28px   400     1.29         título principal de splash/login
//  headlineSmall   24px   400     1.33         saudação em destaque, sub-título de entrada
//  titleLarge      22px   400     1.27         cabeçalho de tela interna (AppScreenHeader)
//  titleMedium     16px   600     1.50         título de card, rótulo de seção
//  titleSmall      14px   600     1.43         subtítulo de card, label de botão compacto
//  labelLarge      14px   600     1.43         texto de botão, ações
//  labelMedium     12px   600     1.33         rótulos de tab/bottom-nav, labels de form
//  labelSmall      11px   600     1.45         eyebrows, badges, micro-rótulos
//  bodyLarge       16px   400     1.50         corpo proeminente
//  bodyMedium      14px   400     1.43         corpo padrão, descrições, dados
//  bodySmall       12px   400     1.33         textos secundários, sublabels, rodapés
//
const T = {
  displaySmall:   { fontSize: '36px', fontWeight: 400, lineHeight: 1.11 },
  headlineMedium: { fontSize: '28px', fontWeight: 400, lineHeight: 1.29 },
  headlineSmall:  { fontSize: '24px', fontWeight: 400, lineHeight: 1.33 },
  titleLarge:     { fontSize: '22px', fontWeight: 400, lineHeight: 1.27 },
  titleMedium:    { fontSize: '16px', fontWeight: 600, lineHeight: 1.50 },
  titleSmall:     { fontSize: '16px', fontWeight: 600, lineHeight: 1.43 },
  labelLarge:     { fontSize: '16px', fontWeight: 600, lineHeight: 1.43 },
  labelMedium:    { fontSize: '16px', fontWeight: 600, lineHeight: 1.33 },
  labelSmall:     { fontSize: '16px', fontWeight: 600, lineHeight: 1.45 },
  bodyLarge:      { fontSize: '16px', fontWeight: 400, lineHeight: 1.50 },
  bodyMedium:     { fontSize: '16px', fontWeight: 400, lineHeight: 1.43 },
  bodySmall:      { fontSize: '16px', fontWeight: 400, lineHeight: 1.33 },
} as const

// ─── Types ────────────────────────────────────────────────────────────────────

type Screen =
  | 'login'
  | 'fale-conosco'
  | 'home'
  | 'servicos'
  | 'rede'
  | 'favoritos'
  | 'perfil'

const MAIN_SCREENS: Screen[] = ['home', 'servicos', 'rede', 'favoritos', 'perfil']

// ─── Shared chrome ────────────────────────────────────────────────────────────

function StatusBar() {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '0 28px', height: '44px',
      ...T.titleSmall, color: '#103f3a', flexShrink: 0, userSelect: 'none',
    }}>
      <span>9:41</span>
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
        <svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor">
          <rect x="0" y="6" width="3" height="6" rx="1"/>
          <rect x="4.5" y="4" width="3" height="8" rx="1"/>
          <rect x="9" y="2" width="3" height="10" rx="1"/>
          <rect x="13.5" y="0" width="3" height="12" rx="1"/>
        </svg>
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none" stroke="currentColor" strokeLinecap="round">
          <circle cx="8" cy="11" r="1" fill="currentColor" stroke="none"/>
          <path d="M4.5 7.5C5.7 6.3 6.8 5.7 8 5.7s2.3.6 3.5 1.8" strokeWidth="1.5"/>
          <path d="M1.5 4.5C3.2 2.8 5.5 1.8 8 1.8s4.8 1 6.5 2.7" strokeWidth="1.5"/>
        </svg>
        <svg width="26" height="13" viewBox="0 0 26 13" fill="none">
          <rect x="0.5" y="0.5" width="21" height="12" rx="3" stroke="currentColor" strokeOpacity=".35"/>
          <rect x="2" y="2" width="17" height="9" rx="2" fill="currentColor"/>
          <path d="M23 4.5v4c1-.5 1.6-1.2 1.6-2s-.6-1.5-1.6-2z" fill="currentColor" fillOpacity=".4"/>
        </svg>
      </div>
    </div>
  )
}

function DynamicIsland() {
  return (
    <div style={{
      width: '120px', height: '34px', background: '#000',
      borderRadius: '20px', margin: '0 auto 4px', flexShrink: 0,
    }} />
  )
}

function AppScreenHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '12px',
      padding: '14px 20px', borderBottom: '1px solid #d7e7e2',
      background: 'white', flexShrink: 0,
    }}>
      <button
        onClick={onBack}
        aria-label="Voltar"
        style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', color: '#103f3a', display: 'flex', alignItems: 'center' }}
      >
        <ArrowLeft size={22} />
      </button>
      {/* titleLarge: 22px / 400 – padrão MD3 para App Bar */}
      <span style={{ ...T.titleLarge, color: '#103f3a' }}>{title}</span>
    </div>
  )
}

// ─── Login screen ─────────────────────────────────────────────────────────────

function LoginScreen({ onLogin, onHelp }: { onLogin: () => void; onHelp: () => void }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'white', overflowY: 'auto' }}>

      {/* Central area */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '32px 24px', gap: '32px',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <img src="/assets/logo-colorida.svg" alt="Plan-Assiste" style={{ height: '80px' }} />
          {/* titleLarge + semibold para nome da marca */}
          <span style={{ ...T.titleLarge, fontWeight: 600, color: '#3a877c', letterSpacing: '-0.2px' }}>
            Plan-Assiste
          </span>
        </div>

        {/* Text block */}
        <div style={{ textAlign: 'center', width: '100%' }}>
          {/* headlineMedium: 28px / 400 – título principal da tela */}
          <h1 style={{ ...T.headlineMedium, color: '#103f3a', margin: '0 0 8px' }}>
            Acessar o Portal
          </h1>
          {/* labelMedium: 12px / 600 – sublabel descritivo */}
          <p style={{ ...T.labelMedium, color: '#8aa8a3', margin: '0 0 16px', letterSpacing: '0.3px' }}>
            Autenticação segura via gov.br
          </p>
          {/* bodyMedium: 14px / 400 – corpo explicativo */}
          <p style={{ ...T.bodyMedium, color: '#4a7b73', margin: 0 }}>
            Utilize sua conta gov.br para acessar todos os serviços do Plan-Assiste com segurança.
          </p>
        </div>

        {/* gov.br button */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <GovBrSignInButton
            onClick={onLogin}
            style={{
              width: '100%',
              minHeight: '52px',
              boxShadow: '0 4px 14px rgba(19,81,180,.3)',
            }}
          />
          {/* bodySmall: 12px / 400 – nota informativa abaixo do botão */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', ...T.bodySmall, color: '#8aa8a3' }}>
            <Shield size={12} />
            Acesso oficial do Governo Federal
          </div>
        </div>
      </div>

      {/* Bottom area */}
      <div style={{ padding: '0 24px 16px' }}>
        {/* Help card */}
        <button
          onClick={onHelp}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: '14px',
            border: '1.5px solid #d7e7e2', borderRadius: '16px',
            background: 'white', padding: '14px 16px',
            marginBottom: '14px', cursor: 'pointer', textAlign: 'left',
          }}
        >
          <div style={{
            width: '40px', height: '40px', borderRadius: '50%',
            border: '1.5px solid #d7e7e2',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <HelpCircle size={18} color="#0d8473" />
          </div>
          <div style={{ flex: 1 }}>
            {/* titleSmall: 14px / 600 – título do card de ação */}
            <div style={{ ...T.titleSmall, color: '#103f3a', marginBottom: '2px' }}>
              Precisa de ajuda?
            </div>
            {/* bodySmall: 12px / 400 – descrição secundária */}
            <div style={{ ...T.bodySmall, color: '#4a7b73' }}>
              Entre em contato com nossa equipe.
            </div>
          </div>
          <ChevronRight size={16} color="#4a7b73" />
        </button>

        {/* Version – bodySmall: 12px / 400 */}
        <div style={{ textAlign: 'center', ...T.bodySmall, fontWeight: 600, color: '#0d8473', paddingBottom: '8px' }}>
          Plan-Assiste · Versão 2.0.0
        </div>
      </div>
    </div>
  )
}

// ─── Fale Conosco screen ──────────────────────────────────────────────────────

function FaleConoscoScreen({ onBack }: { onBack: () => void }) {
  const contacts = [
    { icon: <Phone size={18} color="#0d8473" />, label: '0800 591 5601', sub: 'Ligação gratuita' },
    { icon: <MessageCircle size={18} color="#0d8473" />, label: '(27) 9812-58237', sub: 'WhatsApp' },
    { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0d8473" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>, label: 'planassiste-atendimento@mpf.mp.br', sub: 'E-mail', wrap: true },
  ]

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: '#f7fdfb' }}>
      <AppScreenHeader title="Fale Conosco" onBack={onBack} />

      <div style={{ padding: '20px' }}>
        <div style={{
          border: '1px solid #d7e7e2', borderRadius: '18px',
          background: 'white', overflow: 'hidden',
          boxShadow: '0 10px 24px rgba(16,63,58,.06)',
        }}>
          {/* Card header */}
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center', padding: '18px 20px' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%',
              background: '#e7f5ef',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Headphones size={22} color="#0d8473" />
            </div>
            <div>
              {/* titleMedium: 16px / 600 – título de card */}
              <div style={{ ...T.titleMedium, color: '#103f3a' }}>
                Central de Atendimento 24h
              </div>
              {/* bodySmall: 12px / 400 – subtítulo descritivo */}
              <div style={{ ...T.bodySmall, color: '#4a7b73', marginTop: '3px' }}>
                Estamos aqui para ajudar você.
              </div>
            </div>
          </div>

          {/* Contact rows */}
          {contacts.map((row, i) => (
            <div key={i} style={{
              display: 'flex', gap: '14px', alignItems: 'center',
              padding: '13px 20px', borderTop: '1px solid #d7e7e2',
            }}>
              <div style={{ flexShrink: 0 }}>{row.icon}</div>
              <div style={{ minWidth: 0 }}>
                {/* bodyMedium bold: 14px / 600 – dado de contato */}
                <div style={{
                  ...T.bodyMedium, fontWeight: 600, color: '#103f3a',
                  wordBreak: row.wrap ? 'break-all' : undefined,
                }}>
                  {row.sub === 'E-mail' ? <a href={`mailto:${row.label}`} style={{ color: 'inherit', textDecoration: 'underline', textUnderlineOffset: '3px' }}>{row.label}</a> : row.label}
                </div>
                {/* bodySmall: 12px / 400 – tipo do canal */}
                <div style={{ ...T.bodySmall, color: '#4a7b73', marginTop: '2px' }}>{row.sub}</div>
              </div>
            </div>
          ))}

          {/* Action buttons */}
          <div style={{ padding: '16px 20px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* labelLarge: 14px / 600 – texto de botão primário */}
            <button style={{
              width: '100%', minHeight: '48px',
              background: '#0d8473', color: 'white',
              border: 'none', borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              ...T.labelLarge, cursor: 'pointer',
            }}>
              <Phone size={16} />
              Ligar agora
            </button>
            <button style={{
              width: '100%', minHeight: '48px',
              background: 'white', color: '#0d8473',
              border: '1.5px solid #0d8473', borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              ...T.labelLarge, cursor: 'pointer',
            }}>
              <MessageCircle size={16} />
              WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Home screen ──────────────────────────────────────────────────────────────

function HomeScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  return (
    <div style={{ flex: 1, overflowY: 'auto', background: '#f7fdfb' }}>

      {/* Compact App Bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '12px 20px', background: 'white', borderBottom: '1px solid #d7e7e2',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src="/assets/logo-colorida.svg" alt="" aria-hidden="true" style={{ height: '18px' }} />
          {/* titleMedium: 16px / 600 – nome do app no header compacto */}
          <span style={{ ...T.titleMedium, color: '#0d8473', letterSpacing: '-0.1px' }}>Plan-Assiste</span>
        </div>
        <div style={{ position: 'relative' }}>
          <Bell size={20} color="#103f3a" />
          {/* labelSmall: 11px / 600 – badge de notificação */}
          <span style={{
            position: 'absolute', top: '-5px', right: '-5px',
            background: '#d7a739', color: 'white', borderRadius: '50%',
            width: '16px', height: '16px', ...T.labelSmall,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>2</span>
        </div>
      </div>

      {/* Beneficiary banner */}
      <div style={{ background: '#0d8473', padding: '18px 20px', display: 'flex', gap: '14px', alignItems: 'center' }}>
        <div style={{
          width: '52px', height: '52px', borderRadius: '50%',
          background: '#02c491', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <User size={26} color="white" />
        </div>
        <div>
          {/* labelSmall: 11px / 600 – eyebrow / categoria */}
          <div style={{ ...T.labelSmall, color: '#a8dfd4', letterSpacing: '1px', marginBottom: '4px' }}>
            ÁREA DO BENEFICIÁRIO
          </div>
          {/* headlineSmall: 24px / 400 – saudação em destaque */}
          <div style={{ ...T.headlineSmall, fontWeight: 600, color: 'white' }}>Olá, Ana Maria!</div>
          {/* bodySmall: 12px / 400 – sublabel de contexto */}
          <div style={{ ...T.bodySmall, color: '#c8ede8', marginTop: '2px' }}>Perfil atual: Titular</div>
        </div>
      </div>

      {/* Hero card */}
      <div style={{ margin: '14px', background: 'white', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 10px 24px rgba(16,63,58,.06)' }}>
        <div style={{ padding: '16px 16px 0' }}>
          {/* labelSmall: 11px / 600 – eyebrow de seção */}
          <div style={{ ...T.labelSmall, color: '#02c491', letterSpacing: '1px', marginBottom: '6px' }}>
            BENEFICIÁRIOS
          </div>
          {/* titleMedium: 16px / 600 – título do card */}
          <div style={{ ...T.titleMedium, color: '#103f3a' }}>
            Acompanhe tudo em um só lugar
          </div>
          {/* bodyMedium: 14px / 400 – descrição do card */}
          <div style={{ ...T.bodyMedium, color: '#4a7b73', marginTop: '6px' }}>
            Veja solicitações, reembolsos, dependentes e comunicados fixados.
          </div>
        </div>
        <div style={{
          height: '88px', background: 'linear-gradient(135deg,#e7f5ef,#c8ede8)',
          margin: '12px', borderRadius: '10px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: '32px' }}>👩‍💼</span>
        </div>
        <div style={{ padding: '0 16px 16px' }}>
          {/* labelLarge: 14px / 600 – texto de botão */}
          <button style={{
            width: '100%', minHeight: '44px',
            background: '#0d8473', color: 'white', border: 'none',
            borderRadius: '8px', ...T.labelLarge, cursor: 'pointer',
          }}>
            Ver painel
          </button>
        </div>
      </div>

      {/* Quick access */}
      <div style={{ padding: '4px 14px 16px' }}>
        {/* titleSmall: 14px / 600 – rótulo de seção */}
        <div style={{ ...T.titleSmall, color: '#103f3a', marginBottom: '10px' }}>
          Acessos rápidos
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {[
            { icon: <CreditCard size={20} color="#0d8473" />, label: 'Carteirinha' },
            { icon: <MapPin size={20} color="#0d8473" />, label: 'Rede credenciada', onClick: () => onNavigate('rede') },
            { icon: <FileText size={20} color="#0d8473" />, label: 'Solicitações' },
            { icon: <DollarSign size={20} color="#0d8473" />, label: 'Reembolsos' },
          ].map((item, i) => (
            <button key={i} onClick={item.onClick} style={{
              background: 'white', border: '1.5px solid #d7e7e2', borderRadius: '12px',
              padding: '14px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: '8px', cursor: 'pointer',
              /* labelMedium: 12px / 600 – label de atalho */
              ...T.labelMedium, color: '#225c55',
            }}>
              <div style={{
                width: '38px', height: '38px', background: '#e7f5ef',
                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {item.icon}
              </div>
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Placeholder screen ───────────────────────────────────────────────────────

function PlaceholderScreen({ title, icon }: { title: string; icon: React.ReactNode }) {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: '12px', background: '#f7fdfb',
    }}>
      <div style={{ opacity: .3 }}>{icon}</div>
      <span style={{ ...T.titleSmall, color: '#5a8880' }}>{title}</span>
      <span style={{ ...T.bodySmall, color: '#a0b8b4' }}>Tela em construção</span>
    </div>
  )
}

// ─── Bottom navigation ────────────────────────────────────────────────────────

const NAV_TABS: { id: Screen; label: string; icon: React.ReactNode }[] = [
  { id: 'home',      label: 'Início',    icon: <Home size={22} /> },
  { id: 'servicos',  label: 'Serviços',  icon: <Grid2X2 size={22} /> },
  { id: 'rede',      label: 'Rede',      icon: <MapPin size={22} /> },
  { id: 'favoritos', label: 'Favoritos', icon: <Heart size={22} /> },
  { id: 'perfil',    label: 'Perfil',    icon: <User size={22} /> },
]

function BottomNav({ current, onChange }: { current: Screen; onChange: (s: Screen) => void }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-around', alignItems: 'center',
      borderTop: '1px solid #d7e7e2', padding: '6px 0 24px',
      background: 'white', flexShrink: 0,
    }}>
      {NAV_TABS.map(tab => {
        const active = current === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
              background: 'none', border: 'none', padding: '4px 10px', cursor: 'pointer',
              color: active ? '#0d8473' : '#b0c8c4',
              /* labelMedium: 12px / 600 – rótulo de tab ativa; 400 na inativa */
              ...T.labelMedium, fontWeight: active ? 600 : 400,
              transition: 'color .15s',
            }}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}

// ─── Phone frame ──────────────────────────────────────────────────────────────

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      width: '375px', flexShrink: 0,
      background: '#1a1a1a', borderRadius: '52px', padding: '10px',
      boxShadow: '0 0 0 1px #333, 0 30px 80px rgba(0,0,0,.35), inset 0 0 0 1px #444',
    }}>
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', left: '-14px', top: '70px',  width: '4px', height: '32px', background: '#333', borderRadius: '2px' }} />
        <div style={{ position: 'absolute', left: '-14px', top: '110px', width: '4px', height: '32px', background: '#333', borderRadius: '2px' }} />
        <div style={{ position: 'absolute', right: '-14px', top: '90px', width: '4px', height: '60px', background: '#333', borderRadius: '2px' }} />

        <div style={{
          background: 'white', borderRadius: '44px', overflow: 'hidden',
          display: 'flex', flexDirection: 'column', height: '780px',
          // Neutraliza o font-size: 18px herdado do body do portal
          fontSize: '16px',
        }}>
          <div style={{ padding: '12px 0 0', background: 'white', flexShrink: 0 }}>
            <DynamicIsland />
            <StatusBar />
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}

// ─── MockupPage ───────────────────────────────────────────────────────────────

export function MockupPage() {
  const [screenStack, setScreenStack] = useState<Screen[]>(['login'])
  const [key, setKey] = useState(0)

  const currentScreen = screenStack[screenStack.length - 1]

  function navigateTo(screen: Screen) {
    setScreenStack(prev => [...prev, screen])
  }

  function switchTab(screen: Screen) {
    setScreenStack([screen])
  }

  function goBack() {
    setScreenStack(prev => (prev.length > 1 ? prev.slice(0, -1) : prev))
  }

  function reload() {
    setScreenStack(['login'])
    setKey(k => k + 1)
  }

  function renderScreen() {
    switch (currentScreen) {
      case 'login':
        return <LoginScreen onLogin={() => navigateTo('home')} onHelp={() => navigateTo('fale-conosco')} />
      case 'fale-conosco':
        return <FaleConoscoScreen onBack={goBack} />
      case 'home':
        return <HomeScreen onNavigate={navigateTo} />
      case 'servicos':
        return <PlaceholderScreen title="Serviços"        icon={<Grid2X2 size={56} />} />
      case 'rede':
        return <PlaceholderScreen title="Rede Credenciada" icon={<MapPin   size={56} />} />
      case 'favoritos':
        return <PlaceholderScreen title="Favoritos"        icon={<Heart    size={56} />} />
      case 'perfil':
        return <PlaceholderScreen title="Perfil"           icon={<User     size={56} />} />
    }
  }

  const showBottomNav = MAIN_SCREENS.includes(currentScreen)

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #d4ede6 0%, #e7f5ef 60%, #c8ede8 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: '80px', padding: '40px 60px',
      fontFamily: '"Titillium Web", "Neo Sans", Inter, sans-serif',
    }}>
      {/* Info panel */}
      <div style={{ maxWidth: '400px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
          <img src="/assets/logo-colorida.svg" alt="Plan-Assiste" style={{ height: '36px' }} />
          <span style={{ fontWeight: 700, fontSize: '20px', color: '#0d8473' }}>Plan-Assiste</span>
        </div>

        <div style={{ fontSize: '16px', fontWeight: 700, color: '#0d8473', letterSpacing: '2px', marginBottom: '12px' }}>
          MOCKUP MOBILE
        </div>

        <h1 style={{ fontSize: '42px', fontWeight: 700, color: '#103f3a', margin: '0 0 20px', lineHeight: 1.15 }}>
          Plan-Assiste<br />no celular
        </h1>

        <p style={{ fontSize: '16px', color: '#4a7b73', lineHeight: 1.7, margin: '0 0 36px' }}>
          Visualização do protótipo mobile do app do Plan-Assiste.
          Por meio da moldura ao lado, navegue para testar o aplicativo
          real em uma tela de celular, ideal para demonstrações pelo
          computador. Se estiver acessando esta página pelo celular,
          pode abrir o aplicativo em tela cheia pelo botão abaixo.
        </p>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <a href="/" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: '#0d8473', color: 'white', padding: '14px 24px',
            borderRadius: '50px', fontWeight: 600, fontSize: '16px', textDecoration: 'none',
          }}>
            <Maximize2 size={16} />
            Abrir app em tela cheia
            <ChevronRight size={16} />
          </a>

          <button onClick={reload} style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(255,255,255,.7)', color: '#0d8473', padding: '14px 24px',
            borderRadius: '50px', fontWeight: 600, fontSize: '16px',
            border: '1.5px solid rgba(13,132,115,.25)', cursor: 'pointer',
          }}>
            <RefreshCw size={16} />
            Recarregar tela
          </button>
        </div>
      </div>

      {/* Phone */}
      <PhoneFrame key={key}>
        {renderScreen()}
        {showBottomNav && <BottomNav current={currentScreen} onChange={switchTab} />}
      </PhoneFrame>
    </div>
  )
}
