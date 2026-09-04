export type RequestRating = {
  rating: number
  comment: string
}

export type FavoriteState = {
  favoriteNewsIds: string[]
  favoriteServiceIds: string[]
  favoriteProviderIds: string[]
  providerRatings: Record<string, number>
  requestRatings: Record<string, RequestRating>
}

const storageKey = 'planAssisteFavorites'

export const defaultFavoriteState: FavoriteState = {
  favoriteNewsIds: ['nova-funcionalidade-busca-credenciados'],
  favoriteServiceIds: ['servico-solicitacao-reembolso'],
  favoriteProviderIds: ['dra-maria-cavalcanti'],
  providerRatings: {
    'clinica-saude-vida': 5,
  },
  requestRatings: {},
}

export function getFavoriteState(): FavoriteState {
  if (typeof window === 'undefined') return defaultFavoriteState

  const stored = window.localStorage.getItem(storageKey)
  if (!stored) return defaultFavoriteState

  try {
    const parsed = JSON.parse(stored) as Partial<FavoriteState>
    return {
      favoriteNewsIds: parsed.favoriteNewsIds || defaultFavoriteState.favoriteNewsIds,
      favoriteServiceIds: parsed.favoriteServiceIds || defaultFavoriteState.favoriteServiceIds,
      favoriteProviderIds: parsed.favoriteProviderIds || defaultFavoriteState.favoriteProviderIds,
      providerRatings: parsed.providerRatings || defaultFavoriteState.providerRatings,
      requestRatings: parsed.requestRatings || defaultFavoriteState.requestRatings,
    }
  } catch {
    return defaultFavoriteState
  }
}

export function saveFavoriteState(state: FavoriteState) {
  window.localStorage.setItem(storageKey, JSON.stringify(state))
  window.dispatchEvent(new CustomEvent('planAssisteFavoritesUpdated', { detail: state }))
  return state
}

export function toggleFavoriteNews(newsId: string) {
  const state = getFavoriteState()
  const exists = state.favoriteNewsIds.includes(newsId)
  return saveFavoriteState({
    ...state,
    favoriteNewsIds: exists
      ? state.favoriteNewsIds.filter((id) => id !== newsId)
      : [...state.favoriteNewsIds, newsId],
  })
}

export function toggleFavoriteService(serviceId: string) {
  const state = getFavoriteState()
  const exists = state.favoriteServiceIds.includes(serviceId)
  return saveFavoriteState({
    ...state,
    favoriteServiceIds: exists
      ? state.favoriteServiceIds.filter((id) => id !== serviceId)
      : [...state.favoriteServiceIds, serviceId],
  })
}

export function toggleFavoriteProvider(providerId: string) {
  const state = getFavoriteState()
  const exists = state.favoriteProviderIds.includes(providerId)
  return saveFavoriteState({
    ...state,
    favoriteProviderIds: exists
      ? state.favoriteProviderIds.filter((id) => id !== providerId)
      : [...state.favoriteProviderIds, providerId],
  })
}

export function removeProviderRating(providerId: string) {
  const state = getFavoriteState()
  const providerRatings = { ...state.providerRatings }
  delete providerRatings[providerId]
  return saveFavoriteState({
    ...state,
    providerRatings,
  })
}

export function setProviderRating(providerId: string, rating: number) {
  const state = getFavoriteState()
  return saveFavoriteState({
    ...state,
    providerRatings: {
      ...state.providerRatings,
      [providerId]: rating,
    },
  })
}

export function setRequestRating(requestId: string, rating: number, comment: string) {
  const state = getFavoriteState()
  return saveFavoriteState({
    ...state,
    requestRatings: {
      ...state.requestRatings,
      [requestId]: { rating, comment },
    },
  })
}
