import { mockUser } from '../data/mock'

export type UserAddress = {
  street: string
  number: string
  complement: string
  district: string
  city: string
  state: string
  zipCode: string
  latitude?: number
  longitude?: number
}

export type UserProfile = {
  id: string
  name: string
  email: string
  providerEmail?: string
  providerWhatsapp?: string
  providerCnpj?: string
  providerCode?: string
  phone: string
  whatsapp: string
  avatar?: string
  providerAvatar?: string
  birthDate: string
  cpf: string
  organ: string
  registration: string
  address: UserAddress
}

const storageKey = 'planAssisteUserProfile'

export const defaultUserProfile: UserProfile = {
  id: mockUser.id,
  name: mockUser.name,
  email: 'ana.araujo@mpu.mp.br',
  providerEmail: 'contato@saudeevida.com.br',
  providerWhatsapp: '(61) 99876-4321',
  providerCnpj: '12.345.678/0001-90',
  providerCode: '004521',
  phone: '(61) 99876-4321',
  whatsapp: '',
  avatar: mockUser.avatar,
  birthDate: '01/03/1980',
  cpf: '***.123.456-**',
  organ: 'Ministério Público Federal',
  registration: '1000.00000000.00',
  address: {
    street: 'SQS 205',
    number: 'Bloco B',
    complement: 'Apartamento 302',
    district: 'Asa Sul',
    city: mockUser.registeredLocation.city,
    state: mockUser.registeredLocation.state,
    zipCode: mockUser.registeredLocation.zipCode,
    latitude: mockUser.registeredLocation.latitude,
    longitude: mockUser.registeredLocation.longitude,
  },
}

export function geocodeAddressForPrototype(address: UserAddress): UserAddress {
  const city = address.city
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
  const state = address.state.trim().toUpperCase()
  const district = address.district
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()

  if (city === 'brasilia' && state === 'DF') {
    const coordinates = district.includes('norte')
      ? { latitude: -15.767128, longitude: -47.881482 }
      : { latitude: -15.793889, longitude: -47.882778 }

    return { ...address, ...coordinates }
  }

  if ((city === 'belo horizonte' || city === 'bh') && state === 'MG') {
    if (district.includes('pampulha')) {
      return { ...address, latitude: -19.858611, longitude: -43.979167 }
    }

    if (district.includes('savassi') || district.includes('funcionarios')) {
      return { ...address, latitude: -19.936089, longitude: -43.933445 }
    }

    return { ...address, latitude: -19.916681, longitude: -43.934493 }
  }

  return {
    ...address,
    latitude: undefined,
    longitude: undefined,
  }
}

export function getStoredUserProfile(): UserProfile {
  if (typeof window === 'undefined') return defaultUserProfile

  const stored = window.localStorage.getItem(storageKey)
  if (!stored) return defaultUserProfile

  try {
    const parsed = JSON.parse(stored) as Partial<UserProfile>

    return {
      ...defaultUserProfile,
      ...parsed,
      address: {
        ...defaultUserProfile.address,
        ...parsed.address,
      },
    }
  } catch {
    return defaultUserProfile
  }
}

export function saveStoredUserProfile(profile: UserProfile) {
  const normalizedProfile = {
    ...profile,
    address: geocodeAddressForPrototype(profile.address),
  }

  window.localStorage.setItem(storageKey, JSON.stringify(normalizedProfile))
  window.dispatchEvent(new CustomEvent('planAssisteUserProfileUpdated', {
    detail: normalizedProfile,
  }))

  return normalizedProfile
}

export function resetStoredUserProfile() {
  window.localStorage.removeItem(storageKey)
  window.dispatchEvent(new CustomEvent('planAssisteUserProfileUpdated', {
    detail: defaultUserProfile,
  }))

  return defaultUserProfile
}
