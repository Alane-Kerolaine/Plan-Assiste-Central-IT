import { getStoredSession } from '../utils/session'

const CMS_ADMIN_SESSION_KEY = 'planAssisteCmsAdminSessionV1'

export type CmsAdminSession = {
  authenticated: true
  username: string
  signedInAt: string
}

export function getCmsAdminSession(): CmsAdminSession | null {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(CMS_ADMIN_SESSION_KEY) || 'null') as CmsAdminSession | null
    return parsed?.authenticated === true && parsed.username ? parsed : null
  } catch {
    sessionStorage.removeItem(CMS_ADMIN_SESSION_KEY)
    return null
  }
}

export function signInCmsAdmin(username: string, password: string) {
  if (!username.trim() || !password) return false
  const session: CmsAdminSession = {
    authenticated: true,
    username: username.trim(),
    signedInAt: new Date().toISOString(),
  }
  sessionStorage.setItem(CMS_ADMIN_SESSION_KEY, JSON.stringify(session))
  window.dispatchEvent(new Event('planAssisteCmsAdminAuthUpdated'))
  return true
}

export function signOutCmsAdmin() {
  sessionStorage.removeItem(CMS_ADMIN_SESSION_KEY)
  window.dispatchEvent(new Event('planAssisteCmsAdminAuthUpdated'))
}

export function isCmsAdminAuthenticated() {
  return Boolean(getCmsAdminSession())
}

export function canUseCmsEditor() {
  const portalSession = getStoredSession()
  return portalSession.authenticated
    && portalSession.activeProfile === 'team'
    && isCmsAdminAuthenticated()
}
