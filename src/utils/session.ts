export type PortalProfile = 'beneficiary' | 'team' | 'provider'

export type PortalSession = {
  authenticated: boolean
  authMethod: 'govbr' | 'provider' | null
  displayName: string
  roleLabel: string
  profiles: PortalProfile[]
  activeProfile: PortalProfile | null
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
        authenticated: parsed.authenticated === true,
        authMethod: parsed.authMethod ?? null,
        displayName: parsed.displayName ?? '',
        roleLabel: parsed.roleLabel ?? '',
        profiles,
        activeProfile,
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
  }
}

export function createProviderSession(): PortalSession {
  return {
    authenticated: true,
    authMethod: 'provider',
    displayName: 'Clínica Saúde & Vida',
    roleLabel: 'Credenciado',
    profiles: ['provider'],
    activeProfile: 'provider',
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
  if (profile === 'provider') return 'Área do credenciado'
  return ''
}

export function getProfileHome(profile: PortalProfile | null) {
  if (profile === 'provider') return '/credenciado'
  if (profile === 'team') return '/area-da-equipe'
  if (profile === 'beneficiary') return '/beneficiario'
  return '/'
}

function isPortalProfile(profile: unknown): profile is PortalProfile {
  return profile === 'beneficiary' || profile === 'team' || profile === 'provider'
}
