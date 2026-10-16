export type PortalProfile = 'beneficiary' | 'team'

export type PortalSession = {
  authenticated: boolean
  authMethod: 'govbr' | 'corporate' | null
  displayName: string
  roleLabel: string
  profiles: PortalProfile[]
  activeProfile: PortalProfile | null
  /** Usuário da equipe logado (identifica papel e permissões na Área da equipe). */
  teamUserId: string | null
}

const SESSION_KEY = 'planAssisteSession'
const LEGACY_LOGIN_KEY = 'planAssisteLoggedIn'

const emptySession: PortalSession = {
  authenticated: false,
  authMethod: null,
  displayName: '',
  roleLabel: '',
  profiles: [],
  activeProfile: null,
  teamUserId: null,
}

export function getStoredSession(): PortalSession {
  const stored = localStorage.getItem(SESSION_KEY)

  if (stored) {
    try {
      const parsed = JSON.parse(stored) as Partial<PortalSession>
      const profiles = Array.isArray(parsed.profiles) ? parsed.profiles.filter(isPortalProfile) : []
      const activeProfile = isPortalProfile(parsed.activeProfile) && profiles.includes(parsed.activeProfile)
        ? parsed.activeProfile
        : profiles[0] ?? null

      return {
        // Sessoes antigas so de credenciado ficam sem perfil valido e contam como deslogadas.
        authenticated: parsed.authenticated === true && profiles.length > 0,
        authMethod: parsed.authMethod ?? null,
        displayName: parsed.displayName ?? '',
        roleLabel: parsed.roleLabel ?? '',
        profiles,
        activeProfile,
        // Sessoes salvas antes da identificacao da equipe eram todas da Ana Maria.
        teamUserId: typeof parsed.teamUserId === 'string'
          ? parsed.teamUserId
          : (profiles.includes('team') ? 'ana.maria' : null),
      }
    } catch {
      localStorage.removeItem(SESSION_KEY)
    }
  }

  if (localStorage.getItem(LEGACY_LOGIN_KEY) === 'true') {
    return createGovBrSession()
  }

  return emptySession
}

export function createGovBrSession(): PortalSession {
  return {
    authenticated: true,
    authMethod: 'govbr',
    displayName: 'Ana Maria',
    roleLabel: 'Beneficiária e equipe',
    profiles: ['beneficiary', 'team'],
    activeProfile: 'beneficiary',
    // A beneficiária de exemplo também é gerente da equipe.
    teamUserId: 'ana.maria',
  }
}

/**
 * Equipe entrando com a conta corporativa, abrindo na área da equipe. Quem também
 * é beneficiário mantém os dois perfis, como no gov.br.
 */
export function createTeamSession(usuario: { id: string, nome: string, tambemBeneficiario?: boolean }): PortalSession {
  return {
    authenticated: true,
    authMethod: 'corporate',
    displayName: usuario.nome,
    roleLabel: 'Área da equipe',
    profiles: usuario.tambemBeneficiario ? ['beneficiary', 'team'] : ['team'],
    activeProfile: 'team',
    teamUserId: usuario.id,
  }
}

export function storeSession(session: PortalSession) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  localStorage.setItem(LEGACY_LOGIN_KEY, String(session.authenticated))
  notifySessionChanged()
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY)
  localStorage.removeItem(LEGACY_LOGIN_KEY)
  localStorage.removeItem('planAssisteDestination')
  notifySessionChanged()
}

export function hasProfile(session: PortalSession, profile: PortalProfile) {
  return session.authenticated && session.profiles.includes(profile)
}

export function setActiveProfile(profile: PortalProfile) {
  const session = getStoredSession()
  if (!hasProfile(session, profile)) return session

  const nextSession = {
    ...session,
    activeProfile: profile,
    roleLabel: getProfileLabel(profile),
  }
  storeSession(nextSession)
  return nextSession
}

export function notifySessionChanged() {
  window.dispatchEvent(new Event('planAssisteSessionUpdated'))
}

export function getProfileLabel(profile: PortalProfile | null) {
  if (profile === 'beneficiary') return 'Área do beneficiário'
  if (profile === 'team') return 'Área da equipe'
  return ''
}

export function getProfileHome(profile: PortalProfile | null) {
  if (profile === 'team') return '/area-da-equipe'
  if (profile === 'beneficiary') return '/beneficiario'
  return '/'
}

function isPortalProfile(profile: unknown): profile is PortalProfile {
  return profile === 'beneficiary' || profile === 'team'
}
