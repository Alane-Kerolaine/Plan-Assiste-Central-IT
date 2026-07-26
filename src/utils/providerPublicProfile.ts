import { useEffect, useState } from 'react'
import { providers, type Provider } from '../data/mock'
import { getStoredUserProfile } from './userProfile'

export const testProviderId = 'clinica-saude-vida'
const storageKey = 'planAssisteProviderPublicProfile'
const updateEvent = 'planAssisteProviderPublicProfileUpdated'

export const providerTagOptions = [
  'Presencial',
  'Telemedicina',
  'Pronto-atendimento',
  'Acessibilidade',
  'Clínica médica',
  'Cardiologia',
  'Pediatria',
  'Ginecologia',
]

export type ProviderPublicProfile = {
  openingStatus: string
  tags: string[]
  website: string
  mapsQuery: string
  observation: string
}

export const defaultProviderPublicProfile: ProviderPublicProfile = {
  openingStatus: 'Segunda a sexta, das 8h às 18h',
  tags: ['Presencial', 'Acessibilidade', 'Clínica médica'],
  website: 'https://www.saudeevida.com.br',
  mapsQuery: 'Clínica Saúde & Vida, Asa Sul, Brasília, DF',
  observation: 'Atendimento mediante agendamento prévio.',
}

export function getProviderPublicProfile(): ProviderPublicProfile {
  if (typeof window === 'undefined') return defaultProviderPublicProfile
  try {
    const stored = JSON.parse(window.localStorage.getItem(storageKey) || '{}') as Partial<ProviderPublicProfile>
    return { ...defaultProviderPublicProfile, ...stored, tags: stored.tags || defaultProviderPublicProfile.tags }
  } catch {
    return defaultProviderPublicProfile
  }
}

export function saveProviderPublicProfile(profile: ProviderPublicProfile) {
  window.localStorage.setItem(storageKey, JSON.stringify(profile))
  window.dispatchEvent(new CustomEvent(updateEvent, { detail: profile }))
  return profile
}

export function getProviderCatalog(): Provider[] {
  const user = getStoredUserProfile()
  const page = getProviderPublicProfile()
  const address = user.address
  const tags = page.tags
  const sample: Provider = {
    id: testProviderId,
    name: 'Clínica Saúde & Vida',
    category: 'Clínica médica',
    providerType: 'clinica',
    specialties: tags.filter((tag) => !['Presencial', 'Telemedicina', 'Pronto-atendimento', 'Acessibilidade'].includes(tag)),
    services: tags.filter((tag) => !['Presencial', 'Telemedicina', 'Pronto-atendimento'].includes(tag)),
    address: {
      street: [address.street, address.number, address.complement].filter(Boolean).join(', '),
      district: address.district,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      latitude: address.latitude,
      longitude: address.longitude,
    },
    phone: user.phone,
    whatsapp: user.providerWhatsapp,
    email: user.providerEmail,
    website: page.website,
    mapsQuery: page.mapsQuery,
    openingStatus: page.openingStatus,
    observation: page.observation,
    logoUrl: user.providerAvatar || '/assets/provider-clinic-logo.svg',
    attendanceTypes: tags.filter((tag) => ['Presencial', 'Telemedicina', 'Pronto-atendimento'].includes(tag)),
    accessibility: tags.includes('Acessibilidade'),
    telemedicine: tags.includes('Telemedicina'),
    emergency: tags.includes('Pronto-atendimento'),
    networkType: 'Convencional',
    rating: 4.8,
    reviewCount: 24,
  }
  return [sample, ...providers.filter((provider) => provider.id !== testProviderId)]
}

export function useProviderCatalog() {
  const [catalog, setCatalog] = useState<Provider[]>(getProviderCatalog)
  useEffect(() => {
    const sync = () => setCatalog(getProviderCatalog())
    window.addEventListener(updateEvent, sync)
    window.addEventListener('planAssisteUserProfileUpdated', sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(updateEvent, sync)
      window.removeEventListener('planAssisteUserProfileUpdated', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])
  return catalog
}
