import {
  ArrowLeft,
  ArrowRight,
  Building2,
  ChevronDown,
  Clock,
  ExternalLink,
  Filter,
  Heart,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  Search,
  Star,
  Stethoscope,
} from 'lucide-react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useEffect, useMemo, useState, type FormEvent, type SVGProps } from 'react'
import { type Provider } from '../data/mock'
import { calculateDistanceKm, formatDistanceKm, type Coordinates } from '../utils/distance'
import {
  getFavoriteState,
  removeProviderRating,
  setProviderRating,
  toggleFavoriteProvider,
  type FavoriteState,
} from '../utils/favorites'
import { getStoredSession, type PortalProfile } from '../utils/session'
import { getStoredUserProfile } from '../utils/userProfile'
import { ResultsHeader } from './ResultsHeader'
import { pluralize } from '../utils/plural'
import { useProviderCatalog } from '../utils/providerPublicProfile'

type SearchVariant = 'home' | 'network'
type NetworkContext = 'public' | 'beneficiary'
type ProviderSort = 'nearest' | 'name-asc' | 'name-desc' | 'my-ratings'
const providersPerPage = 18

export type ProviderSearchFilters = {
  query: string
  providerType: string
  specialty: string
  state: string
  location: string
  networkType: string
  telemedicineOnly: boolean
  emergencyOnly: boolean
}

export type LocationReference = Coordinates & {
  source: 'registered-address' | 'manual' | 'current'
  label: string
  city?: string
  state?: string
  zipCode?: string
}

const defaultFilters: ProviderSearchFilters = {
  query: '',
  providerType: '',
  specialty: '',
  state: '',
  location: '',
  networkType: '',
  telemedicineOnly: false,
  emergencyOnly: false,
}

const fallbackCities = [
  'Brasília/DF', 'Águas Claras/DF', 'Brazlândia/DF', 'Ceilândia/DF', 'Gama/DF', 'Guará/DF', 'Núcleo Bandeirante/DF', 'Planaltina/DF', 'Recanto das Emas/DF', 'Samambaia/DF', 'Santa Maria/DF', 'São Sebastião/DF', 'Sobradinho/DF', 'Taguatinga/DF',
  'São Paulo/SP',
  'Rio de Janeiro/RJ',
  'Belo Horizonte/MG',
  'Salvador/BA',
  'Fortaleza/CE',
  'Curitiba/PR',
  'Recife/PE',
  'Porto Alegre/RS',
  'Manaus/AM',
]
const stateOptions = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']
const stateOptionLabels: Record<string, string> = {
  AC: 'Acre',
  AL: 'Alagoas',
  AP: 'Amapá',
  AM: 'Amazonas',
  BA: 'Bahia',
  CE: 'Ceará',
  DF: 'Distrito Federal',
  ES: 'Espírito Santo',
  GO: 'Goiás',
  MA: 'Maranhão',
  MT: 'Mato Grosso',
  MS: 'Mato Grosso do Sul',
  MG: 'Minas Gerais',
  PA: 'Pará',
  PB: 'Paraíba',
  PR: 'Paraná',
  PE: 'Pernambuco',
  PI: 'Piauí',
  RJ: 'Rio de Janeiro',
  RN: 'Rio Grande do Norte',
  RS: 'Rio Grande do Sul',
  RO: 'Rondônia',
  RR: 'Roraima',
  SC: 'Santa Catarina',
  SP: 'São Paulo',
  SE: 'Sergipe',
  TO: 'Tocantins',
}

const quickFilters = [
  ['todos', 'Todos'],
  ['medico', 'Médicos'],
  ['clinica', 'Clínicas'],
  ['laboratorio', 'Laboratórios'],
  ['hospital', 'Hospitais'],
  ['dentista', 'Dentistas'],
  ['outro', 'Outros'],
] as const

const quickFilterLabels = Object.fromEntries(quickFilters) as Record<string, string>
const networkTypeOptions = ['Convencional', 'Intermediária', 'Alto custo'] as const
const networkTypeOptionLabels: Record<string, string> = {
  Convencional: 'Convencional',
  Intermediária: 'Intermediária',
  'Alto custo': 'Alto custo',
}
const networkCostLabels: Record<string, { label: string, costLevel: 1 | 2 | 3 }> = {
  Convencional: {
    label: 'Rede convencional',
    costLevel: 1,
  },
  Intermediária: {
    label: 'Rede intermediária',
    costLevel: 2,
  },
  'Alto custo': {
    label: 'Rede de alto custo',
    costLevel: 3,
  },
}

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .toLowerCase()
    .trim()
}

function compactNormalize(value: string) {
  return normalize(value).replace(/\s+/g, '')
}

function parseFilters(searchParams: URLSearchParams): ProviderSearchFilters {
  return {
    query: searchParams.get('q') || searchParams.get('nome') || searchParams.get('credenciado') || '',
    providerType: searchParams.get('tipoPrestador') || searchParams.get('type') || '',
    specialty: searchParams.get('especialidade') || searchParams.get('specialty') || '',
    state: searchParams.get('estado') || searchParams.get('uf') || '',
    location: searchParams.get('cidade') || searchParams.get('city') || searchParams.get('localizacao') || '',
    networkType: searchParams.get('tipoRede') || '',
    telemedicineOnly: searchParams.get('telemedicina') === 'true',
    emergencyOnly: searchParams.get('prontoAtendimento') === 'true' || searchParams.get('urgencia') === 'true',
  }
}

function filtersToParams(filters: ProviderSearchFilters) {
  const params = new URLSearchParams()
  if (filters.query) params.set('q', filters.query)
  if (filters.providerType) params.set('tipoPrestador', filters.providerType)
  if (filters.specialty) params.set('especialidade', filters.specialty)
  if (filters.state) params.set('estado', filters.state)
  if (filters.location) params.set('cidade', filters.location)
  if (filters.networkType) params.set('tipoRede', filters.networkType)
  if (filters.telemedicineOnly) params.set('telemedicina', 'true')
  if (filters.emergencyOnly) params.set('prontoAtendimento', 'true')
  return params
}

function getActiveFilterLabels(filters: ProviderSearchFilters, quickFilter: string) {
  const labels: string[] = []

  if (quickFilter !== 'todos') labels.push(`Categoria: ${quickFilterLabels[quickFilter]}`)
  if (filters.query) labels.push(`Busca: ${filters.query}`)
  if (filters.providerType) labels.push(`Tipo: ${quickFilterLabels[filters.providerType] || filters.providerType}`)
  if (filters.specialty) labels.push(`Especialidade: ${filters.specialty}`)
  if (filters.state) labels.push(`Estado: ${stateOptionLabels[filters.state] || filters.state}`)
  if (filters.location) labels.push(`Cidade: ${filters.location}`)
  if (filters.networkType) labels.push(`Rede: ${filters.networkType}`)
  if (filters.telemedicineOnly) labels.push('Telemedicina')
  if (filters.emergencyOnly) labels.push('Pronto-atendimento')

  return labels
}

function getRegisteredLocationReference(): LocationReference {
  const { address } = getStoredUserProfile()
  return {
    source: 'registered-address',
    label: `endereço cadastrado em Meus dados - ${address.city}/${address.state}`,
    city: address.city,
    state: address.state,
    zipCode: address.zipCode,
    latitude: address.latitude,
    longitude: address.longitude,
  }
}

function getProviderMapsUrl(provider: Provider) {
  const query = provider.mapsQuery || `${provider.name}, ${provider.address.street}, ${provider.address.district}, ${provider.address.city}, ${provider.address.state}`
  if (/^https?:\/\//i.test(query)) return query
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

function getNetworkCostInfo(networkType: string) {
  return networkCostLabels[networkType] ?? {
    label: `Rede ${networkType.toLowerCase()}`,
    costLevel: 1 as const,
  }
}

function ToothIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M7.8 3.5c1.4-.7 2.7-.4 4.2.4 1.5-.8 2.8-1.1 4.2-.4 2.7 1.3 3.2 4.7 1.9 7.9-.7 1.7-1 3.3-1.2 5.1-.3 2.6-1.2 4-2.4 4s-1.4-1.7-1.9-3.7c-.2-.8-.4-1.4-.6-1.4s-.4.6-.6 1.4c-.5 2-1 3.7-1.9 3.7s-2.1-1.4-2.4-4c-.2-1.8-.5-3.4-1.2-5.1-1.3-3.2-.8-6.6 1.9-7.9Z" />
      <path d="M10.2 5.2c1.2.6 2.4.6 3.6 0" />
    </svg>
  )
}

type ProviderSearchProps = {
  variant?: SearchVariant
  context?: NetworkContext
  locationReference?: LocationReference | null
  locationStatus?: string
  onUseCurrentLocation?: () => void
  onClearLocation?: () => void
  onUseRegisteredLocation?: () => void
}

export function ProviderSearch({
  variant = 'network',
  context = 'public',
  locationReference,
  locationStatus,
  onUseCurrentLocation,
  onClearLocation,
  onUseRegisteredLocation,
}: ProviderSearchProps) {
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [cityOptions, setCityOptions] = useState<string[]>(fallbackCities)
  const [localLocationReference, setLocalLocationReference] = useState<LocationReference | null>(null)
  const [localLocationStatus, setLocalLocationStatus] = useState('')
  const [filters, setFilters] = useState<ProviderSearchFilters>(() => ({
    ...defaultFilters,
    ...parseFilters(searchParams),
  }))

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const nextFilters = {
        ...defaultFilters,
        ...parseFilters(searchParams),
      }

      setFilters(nextFilters)
    }, 0)

    return () => window.clearTimeout(timer)
  }, [searchParams])

  useEffect(() => {
    const controller = new AbortController()

    fetch('https://servicodados.ibge.gov.br/api/v1/localidades/municipios', {
      signal: controller.signal,
    })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('IBGE unavailable')))
      .then((cities: Array<{ nome: string, microrregiao?: { mesorregiao?: { UF?: { sigla: string } } }, 'regiao-imediata'?: { 'regiao-intermediaria'?: { UF?: { sigla: string } } } }>) => {
        const nextCities = [...fallbackCities, ...cities
          .map((city) => {
            const state = city.microrregiao?.mesorregiao?.UF?.sigla || city['regiao-imediata']?.['regiao-intermediaria']?.UF?.sigla
            return state ? `${city.nome}/${state}` : ''
          })
          .filter(Boolean)]
          .filter((city, index, values) => values.indexOf(city) === index)
          .sort((first, second) => first.localeCompare(second, 'pt-BR'))

        if (nextCities.length > 0) setCityOptions(nextCities)
      })
      .catch(() => undefined)

    return () => controller.abort()
  }, [])

  function updateFilter<Key extends keyof ProviderSearchFilters>(key: Key, value: ProviderSearchFilters[Key]) {
    setFilters((current) => ({ ...current, [key]: value }))
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    const params = filtersToParams(filters)
    const destination = variant === 'home'
      ? '/rede-credenciada'
      : context === 'beneficiary'
        ? '/rede-credenciada'
        : location.pathname
    navigate(`${destination}${params.size ? `?${params.toString()}` : ''}#provider-results-title`)
  }

  function clearFilters() {
    setFilters(defaultFilters)
    if (!isHome) navigate(location.pathname)
  }

  function useLocalCurrentLocation() {
    if (!navigator.geolocation) {
      setLocalLocationStatus('Seu navegador não disponibilizou a localização atual.')
      return
    }

    setLocalLocationStatus('Solicitando permissão para usar sua localização atual.')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocalLocationReference({
          source: 'current',
          label: 'localização atual do dispositivo',
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
        setLocalLocationStatus('Localização atual definida para esta busca.')
      },
      () => {
        setLocalLocationStatus('Não foi possível usar sua localização atual.')
      },
      { enableHighAccuracy: false, timeout: 8000 },
    )
  }

  function clearLocalLocation() {
    setLocalLocationReference(null)
    setLocalLocationStatus('Localização atual removida.')
  }

  const isHome = variant === 'home'
  const activeLocationReference = locationReference === undefined ? localLocationReference : locationReference
  const activeLocationStatus = locationStatus ?? localLocationStatus
  const hasCurrentLocation = activeLocationReference?.source === 'current'
  const hasRegisteredLocation = activeLocationReference?.source === 'registered-address'
  const handleLocationClick = hasCurrentLocation
    ? (onClearLocation ?? clearLocalLocation)
    : (onUseCurrentLocation ?? useLocalCurrentLocation)
  const locationButtonLabel = hasCurrentLocation ? 'Remover localização' : 'Usar localização atual'
  const locationButtonTitle = hasCurrentLocation
    ? 'Remove a localização atual usada para ordenar os resultados por distância.'
    : 'Usa a localização aproximada do dispositivo apenas para ordenar os resultados por distância.'
  const registeredLocationTitle = hasRegisteredLocation
    ? 'Endereço residencial cadastrado em uso para ordenar os resultados por distância.'
    : 'Usa o endereço residencial cadastrado em Meus dados para ordenar os resultados por distância.'

  return (
    <section className={`search-box provider-search ${isHome ? 'provider-search-home' : ''}`} id="encontre-prestador" data-reveal>
      <div className="provider-search-heading">
        <div>
          <h2>Encontre um credenciado</h2>
          <p>Preencha um ou mais campos para encontrar credenciados.</p>
        </div>
        <div className="provider-search-actions">
          <div className="provider-location-panel">
            <div className="provider-location-buttons">
              <button
                className={`location-toggle ${hasCurrentLocation ? 'selected' : ''}`}
                type="button"
                onClick={handleLocationClick}
                title={locationButtonTitle}
                aria-label={locationButtonTitle}
                aria-pressed={hasCurrentLocation}
              >
                <MapPin aria-hidden="true" />
                {locationButtonLabel}
              </button>
              {onUseRegisteredLocation && (
                <button
                  className={`location-toggle ${hasRegisteredLocation ? 'selected' : ''}`}
                  type="button"
                  onClick={onUseRegisteredLocation}
                  title={registeredLocationTitle}
                  aria-label={registeredLocationTitle}
                  aria-pressed={hasRegisteredLocation}
                >
                  <Building2 aria-hidden="true" />
                  Usar meu endereço
                </button>
              )}
            </div>
            {activeLocationStatus && <p className="provider-location-status" aria-live="polite">{activeLocationStatus}</p>}
          </div>
        </div>
      </div>

      <form className={`provider-form ${isHome ? 'provider-form-home' : ''}`} onSubmit={submit}>
        <label className="provider-query-field">
          <span>Nome do credenciado (opcional)</span>
          <span className="field-with-icon">
            <Search aria-hidden="true" />
            <input
              value={filters.query}
              onChange={(event) => updateFilter('query', event.target.value)}
              placeholder="Digite o nome do credenciado, especialidade ou serviço"
            />
          </span>
        </label>
        <div className={`provider-optional-filters ${isHome ? 'is-home' : ''}`} role="group" aria-labelledby="provider-optional-filters-label">
          <span className="provider-optional-filters-title" id="provider-optional-filters-label">Filtros (opcionais)</span>
          <div className="provider-optional-filters-box">
            <label><input type="checkbox" checked={filters.telemedicineOnly} onChange={(event) => updateFilter('telemedicineOnly', event.target.checked)} /><span>Telemedicina</span></label>
            <label><input type="checkbox" checked={filters.emergencyOnly} onChange={(event) => updateFilter('emergencyOnly', event.target.checked)} /><span>Pronto-atendimento</span></label>
          </div>
        </div>
        <label>
          <span>Tipo de credenciado</span>
          <select value={filters.providerType} onChange={(event) => updateFilter('providerType', event.target.value)}>
            <option value="">Todos</option>
            <option value="medico">Médicos</option>
            <option value="clinica">Clínicas</option>
            <option value="laboratorio">Laboratórios</option>
            <option value="hospital">Hospitais</option>
            <option value="dentista">Dentistas</option>
            <option value="outro">Outros</option>
          </select>
        </label>
        <label>
          <span>Especialidade</span>
          <select value={filters.specialty} onChange={(event) => updateFilter('specialty', event.target.value)}>
            <option value="">Todas</option>
            <option>Cardiologia</option>
            <option>Clínica médica</option>
            <option>Fisioterapia</option>
            <option>Análises clínicas</option>
          </select>
        </label>
        <label className="provider-network-field"><span>Tipos de rede</span><select value={filters.networkType} onChange={(event) => updateFilter('networkType', event.target.value)}><option value="">Todas</option>{networkTypeOptions.map((option) => <option key={option} value={option}>{networkTypeOptionLabels[option]}</option>)}</select></label>
        <div className="provider-final-filter-row">
          <label className="provider-state-field"><span>Estado</span><select value={filters.state} onChange={(event) => { updateFilter('state', event.target.value); updateFilter('location', '') }}><option value="">Todos</option>{stateOptions.map((state) => <option value={state} key={state}>{stateOptionLabels[state]}</option>)}</select></label>
          <label className="provider-city-field">
            <span>Cidade (opcional)</span>
            <span className="field-with-icon">
              <input
                value={filters.location}
                onChange={(event) => updateFilter('location', event.target.value)}
                list="provider-city-options"
                placeholder="Selecione ou digite a cidade"
              />
              <datalist id="provider-city-options">
                {cityOptions.filter((city) => !filters.state || city.endsWith(`/${filters.state}`)).map((city) => <option value={city.replace(/\/[A-Z]{2}$/, '')} key={city} />)}
              </datalist>
              <ChevronDown className="provider-city-chevron" aria-hidden="true" />
              <MapPin className="provider-city-pin" aria-hidden="true" />
            </span>
          </label>
          <button className="filter-clear-button provider-clear-button" type="button" onClick={clearFilters}>Limpar filtros</button>
          <button className="primary-button provider-search-submit" type="submit">Buscar</button>
        </div>
      </form>
    </section>
  )
}

export function ProviderNetworkContent({ context }: { context: NetworkContext }) {
  const providers = useProviderCatalog()
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  const initialSession = getStoredSession()
  const initiallyLoggedIn = initialSession.authenticated
  const initialActiveProfile = initialSession.activeProfile
  const shouldUseRegisteredLocation = context === 'beneficiary' || (initiallyLoggedIn && initialActiveProfile === 'beneficiary')
  const filters = useMemo(() => parseFilters(searchParams), [searchParams])
  const [quickFilter, setQuickFilter] = useState('todos')
  const [sort, setSort] = useState<ProviderSort>(shouldUseRegisteredLocation ? 'nearest' : 'name-asc')
  const [page, setPage] = useState(1)
  const [pageScope, setPageScope] = useState('')
  const [locationStatus, setLocationStatus] = useState(shouldUseRegisteredLocation ? 'Usando o endereço residencial cadastrado como referência.' : '')
  const [favoriteState, setFavoriteState] = useState<FavoriteState>(() => getFavoriteState())
  const [onlyFavorites, setOnlyFavorites] = useState(false)
  const [onlyRated, setOnlyRated] = useState(false)
  const [loggedIn, setLoggedIn] = useState(initiallyLoggedIn)
  const [activeProfile, setActiveProfileState] = useState<PortalProfile | null>(initialActiveProfile)
  const [locationReference, setLocationReference] = useState<LocationReference | null>(() => {
    if (shouldUseRegisteredLocation) return getRegisteredLocationReference()
    return null
  })

  useEffect(() => {
    function syncFavorites() {
      setFavoriteState(getFavoriteState())
    }

    function syncLogin() {
      const session = getStoredSession()
      setLoggedIn(session.authenticated)
      setActiveProfileState(session.activeProfile)
    }

    window.addEventListener('planAssisteFavoritesUpdated', syncFavorites)
    window.addEventListener('planAssisteSessionUpdated', syncLogin)
    window.addEventListener('storage', syncFavorites)
    window.addEventListener('storage', syncLogin)
    return () => {
      window.removeEventListener('planAssisteFavoritesUpdated', syncFavorites)
      window.removeEventListener('planAssisteSessionUpdated', syncLogin)
      window.removeEventListener('storage', syncFavorites)
      window.removeEventListener('storage', syncLogin)
    }
  }, [])

  useEffect(() => {
    if (location.hash !== '#provider-results-title') return

    const timer = window.setTimeout(() => {
      document.getElementById('provider-results-title')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }, 0)

    return () => window.clearTimeout(timer)
  }, [location.hash, location.search])

  const activeLocationReference = locationReference
  const canUsePersonalProviderTools = context === 'beneficiary' || (loggedIn && activeProfile === 'beneficiary')
  const effectiveOnlyFavorites = canUsePersonalProviderTools && onlyFavorites
  const effectiveOnlyRated = canUsePersonalProviderTools && onlyRated
  const canSortByDistance = Boolean(activeLocationReference?.latitude && activeLocationReference.longitude)
  const effectiveSort: ProviderSort = !canUsePersonalProviderTools && sort === 'my-ratings'
    ? (canSortByDistance ? 'nearest' : 'name-asc')
    : sort
  const currentPageScope = JSON.stringify({ filters, quickFilter, sort: effectiveSort })
  const effectivePage = pageScope === currentPageScope ? page : 1

  const filteredProviders = useMemo(() => {
    const query = normalize(filters.query)
    const specialty = normalize(filters.specialty)
    const searchedState = normalize(filters.state)
    const searchedLocation = normalize(filters.location)
    const compactSearchedLocation = compactNormalize(filters.location)
    const networkType = normalize(filters.networkType)

    const result = providers.filter((provider) => {
      const searchable = normalize([
        provider.name,
        provider.category,
        provider.specialties.join(' '),
        provider.services.join(' '),
      ].join(' '))
      const locationText = normalize([
        provider.address.street,
        provider.address.district,
        provider.address.city,
        provider.address.state,
        provider.address.zipCode,
      ].join(' '))
      const compactLocationText = compactNormalize([
        provider.address.street,
        provider.address.district,
        `${provider.address.city}/${provider.address.state}`,
        provider.address.city,
        provider.address.state,
        provider.address.zipCode,
      ].join(' '))

      if (quickFilter !== 'todos' && provider.providerType !== quickFilter) return false
      if (filters.providerType && provider.providerType !== filters.providerType) return false
      if (effectiveOnlyFavorites || effectiveOnlyRated) {
        const isFavorite = favoriteState.favoriteProviderIds.includes(provider.id)
        const isRated = Boolean(favoriteState.providerRatings[provider.id])
        if (effectiveOnlyFavorites && effectiveOnlyRated) {
          if (!isFavorite && !isRated) return false
        } else if (effectiveOnlyFavorites && !isFavorite) {
          return false
        } else if (effectiveOnlyRated && !isRated) {
          return false
        }
      }
      if (query && !searchable.includes(query)) return false
      if (specialty && !normalize(provider.specialties.join(' ')).includes(specialty)) return false
      if (searchedState && normalize(provider.address.state) !== searchedState) return false
      if (searchedLocation && !locationText.includes(searchedLocation) && !compactLocationText.includes(compactSearchedLocation)) return false
      if (networkType && normalize(provider.networkType) !== networkType) return false
      if (filters.telemedicineOnly && !provider.telemedicine && !provider.attendanceTypes.some((item) => ['telemedicina', 'teleatendimento'].includes(normalize(item)))) return false
      if (filters.emergencyOnly && !provider.emergency && !provider.attendanceTypes.some((item) => ['pronto atendimento', 'urgencia e emergencia'].includes(normalize(item)))) return false
      return true
    })

    return [...result].sort((first, second) => {
      if (effectiveSort === 'name-asc') return first.name.localeCompare(second.name, 'pt-BR')
      if (effectiveSort === 'name-desc') return second.name.localeCompare(first.name, 'pt-BR')
      if (effectiveSort === 'my-ratings') {
        const firstRating = favoriteState.providerRatings[first.id] || 0
        const secondRating = favoriteState.providerRatings[second.id] || 0
        if (firstRating !== secondRating) return secondRating - firstRating
        return first.name.localeCompare(second.name, 'pt-BR')
      }
      if (!activeLocationReference?.latitude || !activeLocationReference.longitude) return 0

      const firstDistance = calculateDistanceKm(activeLocationReference, first.address) ?? Number.POSITIVE_INFINITY
      const secondDistance = calculateDistanceKm(activeLocationReference, second.address) ?? Number.POSITIVE_INFINITY
      return firstDistance - secondDistance
    })
  }, [activeLocationReference, effectiveOnlyFavorites, effectiveOnlyRated, effectiveSort, favoriteState.favoriteProviderIds, favoriteState.providerRatings, filters, providers, quickFilter])

  function changePage(nextPage: number) {
    setPageScope(currentPageScope)
    setPage(nextPage)
    window.setTimeout(() => {
      document.getElementById('provider-results-title')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }, 0)
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setLocationStatus('Seu navegador não disponibilizou a localização atual. Você ainda pode informar Cidade/UF.')
      return
    }

    setLocationStatus('Solicitando permissão para usar sua localização atual.')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationReference({
          source: 'current',
          label: 'localização atual do dispositivo',
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
        setSort('nearest')
        setLocationStatus('Localização atual definida para esta busca.')
      },
      () => {
        setLocationStatus('Não foi possível usar sua localização atual. Você ainda pode filtrar por Cidade/UF.')
      },
      { enableHighAccuracy: false, timeout: 8000 },
    )
  }

  function clearLocation() {
    if (context === 'beneficiary' || loggedIn) {
      setLocationReference(getRegisteredLocationReference())
      setSort('nearest')
      setLocationStatus('Localização atual removida. Usando o endereço residencial cadastrado como referência.')
      return
    }

    setLocationReference(null)
    setSort('name-asc')
    setLocationStatus('Localização atual removida.')
  }

  function useRegisteredLocation() {
    setLocationReference(getRegisteredLocationReference())
    setSort('nearest')
    setLocationStatus('Usando o endereço residencial cadastrado como referência.')
  }

  const totalLabel = filteredProviders.length === providers.length
    ? '1.258 credenciados encontrados'
    : filteredProviders.length === 1
      ? '1 credenciado encontrado de 1.258'
      : `${filteredProviders.length} de 1.258 credenciados encontrados`
  const activeFilters = [
    ...getActiveFilterLabels(filters, quickFilter),
    ...(effectiveOnlyFavorites ? ['Favoritos'] : []),
    ...(effectiveOnlyRated ? ['Avaliados'] : []),
  ]
  const totalPages = Math.max(1, Math.ceil(filteredProviders.length / providersPerPage))
  const currentPage = Math.min(effectivePage, totalPages)
  const firstVisibleProvider = (currentPage - 1) * providersPerPage
  const paginatedProviders = filteredProviders.slice(firstVisibleProvider, firstVisibleProvider + providersPerPage)

  function clearFilters() {
    setQuickFilter('todos')
    setOnlyFavorites(false)
    setOnlyRated(false)
    setSort(context === 'beneficiary' || loggedIn ? 'nearest' : 'name-asc')
    setLocationReference(context === 'beneficiary' || loggedIn ? getRegisteredLocationReference() : null)
    setLocationStatus('Filtros removidos. Exibindo todos os resultados disponíveis.')
    navigate(location.pathname)
  }

  function handleProviderFavorite(providerId: string) {
    setFavoriteState(toggleFavoriteProvider(providerId))
  }

  function handleProviderRating(providerId: string, rating: number) {
    setFavoriteState(setProviderRating(providerId, rating))
  }

  function handleRemoveProviderRating(providerId: string) {
    setFavoriteState(removeProviderRating(providerId))
  }

  return (
    <div className="provider-network-page">
      <div className="provider-page-heading">
        <div>
          <h1>Rede credenciada</h1>
          <p className="page-subtitle">
            {context === 'beneficiary'
              ? 'Encontre credenciados, clínicas, hospitais e serviços disponíveis para você e seus dependentes.'
              : 'Consulte médicos, clínicas, laboratórios, hospitais e outros credenciados credenciados ao Plan-Assiste.'}
          </p>
        </div>
      </div>

      <div className="provider-network-content-layout">
        <div className="provider-network-main">
          <ProviderSearch
            context={context}
            locationReference={activeLocationReference}
            locationStatus={locationStatus}
            onUseCurrentLocation={useCurrentLocation}
            onClearLocation={clearLocation}
            onUseRegisteredLocation={canUsePersonalProviderTools ? useRegisteredLocation : undefined}
          />

          <section className="provider-results-section" aria-labelledby="provider-results-title">
            <ResultsHeader
              title="Resultados para você"
              titleId="provider-results-title"
              countLabel={totalLabel}
              displayOptions={canUsePersonalProviderTools ? [{ value: 'all', label: 'Todos' }, { value: 'favorites', label: 'Favoritos' }, { value: 'rated', label: 'Avaliados' }] : undefined}
              displayValue={canUsePersonalProviderTools ? (onlyFavorites ? 'favorites' : onlyRated ? 'rated' : 'all') : undefined}
              onDisplayChange={canUsePersonalProviderTools ? (value) => { setOnlyFavorites(value === 'favorites'); setOnlyRated(value === 'rated'); setPage(1) } : undefined}
              extraActions={(
                <label className="provider-sort">
                  Ordenar por
                  <select value={effectiveSort} onChange={(event) => { setSort(event.target.value as ProviderSort); setPage(1) }}>
                    <option value="nearest" disabled={!canSortByDistance}>Mais próximos</option>
                    <option value="name-asc">Nome A-Z</option>
                    <option value="name-desc">Nome Z-A</option>
                    {canUsePersonalProviderTools && <option value="my-ratings">Minhas avaliações</option>}
                  </select>
                </label>
              )}
            />

            <ActiveFilters filters={activeFilters} onClear={clearFilters} />

            <div className="provider-quick-filters topic-filter-buttons" aria-label="Filtros rápidos">
              {quickFilters.map(([value, label]) => (
                <button
                  type="button"
                  key={value}
                  className={quickFilter === value ? 'selected' : ''}
                  aria-pressed={quickFilter === value}
                  onClick={() => { setQuickFilter(value); setPage(1) }}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="provider-list">
              {paginatedProviders.map((provider) => (
                <ProviderCard
                  key={provider.id}
                  provider={provider}
                  distanceReference={activeLocationReference}
                  detailBasePath="/rede-credenciada/credenciado"
                  loggedIn={canUsePersonalProviderTools}
                  favorite={canUsePersonalProviderTools && favoriteState.favoriteProviderIds.includes(provider.id)}
                  userRating={canUsePersonalProviderTools ? favoriteState.providerRatings[provider.id] : undefined}
                  onFavorite={() => handleProviderFavorite(provider.id)}
                  onRate={(rating) => handleProviderRating(provider.id, rating)}
                  onRemoveRating={() => handleRemoveProviderRating(provider.id)}
                />
              ))}
              {filteredProviders.length === 0 && (
                <div className="provider-empty">
                  <Search aria-hidden="true" />
                  <h3>Nenhum credenciado encontrado</h3>
                  <p>Ajuste os filtros ou tente buscar por Cidade/UF, especialidade ou nome do credenciado.</p>
                </div>
              )}
            </div>
            {filteredProviders.length > 0 && (
              <nav className="provider-pagination" aria-label="Paginação de credenciados">
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
          </section>
        </div>
        <ProviderNetworkSidebar showPersonalActions={canUsePersonalProviderTools} />
      </div>
    </div>
  )
}

function ProviderNetworkSidebar({ showPersonalActions }: { showPersonalActions: boolean }) {
  return (
    <aside className="provider-network-sidebar" aria-label="Redes e apoio à consulta">
      {showPersonalActions && <ProviderQuickActions />}
      <section className="partner-network-list" aria-label="Tipos de rede disponíveis">
        <article className="network-info-card">
          <h3>Rede credenciada direta</h3>
          <p>Credenciados, telemedicina, associações e convênios contratados diretamente pelo Plan-Assiste.</p>
          <p><Link to="/plan-assiste/beneficiarios/tipos-de-redes">Conheça a diferença entre os tipos das redes convencional, intermediária e de alto custo <ExternalLink aria-hidden="true" /></Link></p>
          <h4>Plataformas de telemedicina</h4>
          <ul>
            <li><a href="https://www.conexasaude.com.br/" target="_blank" rel="noreferrer">Conexa Saúde <ExternalLink aria-hidden="true" /></a></li>
            <li><a href="https://nav.dasa.com.br/" target="_blank" rel="noreferrer">Nav Dasa <ExternalLink aria-hidden="true" /></a></li>
            <li><a href="https://accamargo.org.br/form/telemedicina" target="_blank" rel="noreferrer">Telemedicina A. C. Camargo <ExternalLink aria-hidden="true" /></a></li>
            <li><a href="https://telemedicina.einstein.br/" target="_blank" rel="noreferrer">Telemedicina Einstein <ExternalLink aria-hidden="true" /></a></li>
          </ul>
          <h4>Associações e convênios</h4>
          <ul>
            <li><a href="https://amaidf.com.br/" target="_blank" rel="noreferrer">AMAI DF: Distrito Federal <ExternalLink aria-hidden="true" /></a></li>
            <li><a href="https://www.amhp.com.br/" target="_blank" rel="noreferrer">AMHPDF: Distrito Federal e entorno <ExternalLink aria-hidden="true" /></a></li>
            <li><a href="https://coopmedrs.com.br/" target="_blank" rel="noreferrer">COOPMED-RS: Rio Grande do Sul <ExternalLink aria-hidden="true" /></a></li>
            <li><a href="https://www.goianiaclinica.com.br/" target="_blank" rel="noreferrer">Goiânia Clínica <ExternalLink aria-hidden="true" /></a></li>
          </ul>
        </article>
        <article className="network-info-card">
          <h3>Rede credenciada indireta</h3>
          <p>Selecione a Unimed contratada para sua região. Há cobrança de taxa de administração além da coparticipação.</p>
          <h4>Identifique pela carteirinha</h4>
          <ul>
            <li>Unimed Cuiabá: 0056</li>
            <li>Unimed Curitiba: 0032</li>
            <li>Unimed Fesp: 0970</li>
            <li>Unimed Grande Florianópolis: 0025</li>
            <li>Unimed Nacional/CNU: 0865</li>
            <li>Unimed Porto Alegre: 0048</li>
            <li>Unimed Recife: 0034</li>
            <li>Unimed São José Rio Preto/Ferj: 0030 e 0972</li>
          </ul>
          <p>A busca no guia médico pode ser feita pelo número da carteirinha, CPF do titular ou pela operadora Central Nacional Unimed.</p>
        </article>
      </section>
    </aside>
  )
}

function ProviderQuickActions() {
  const providers = useProviderCatalog()
  const [favoriteState, setFavoriteState] = useState<FavoriteState>(() => getFavoriteState())
  const [expanded, setExpanded] = useState<'favorites' | 'rated' | null>(null)
  const detailBasePath = '/rede-credenciada/credenciado'

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

  const favoriteProviders = providers.filter((provider) => favoriteState.favoriteProviderIds.includes(provider.id))
  const ratedProviders = providers.filter((provider) => favoriteState.providerRatings[provider.id])
  const favoriteLabel = favoriteProviders.length === 1 ? 'Credenciado favorito' : 'Credenciados favoritos'
  const ratedLabel = ratedProviders.length === 1 ? 'Credenciado avaliado' : 'Credenciados avaliados'

  function renderProviderResults(items: Provider[], emptyMessage: string, showRating = false) {
    if (items.length === 0) {
      return <p className="provider-side-empty">{emptyMessage}</p>
    }

    return (
      <div className="provider-side-results">
        {items.map((provider) => (
          <Link to={`${detailBasePath}/${provider.id}`} key={provider.id}>
            <strong>{provider.name}</strong>
            <span>
              {provider.category} - {provider.address.city}/{provider.address.state}
              {showRating && favoriteState.providerRatings[provider.id] ? ` - ${favoriteState.providerRatings[provider.id]} ${pluralize(favoriteState.providerRatings[provider.id], 'estrela', 'estrelas')}` : ''}
            </span>
          </Link>
        ))}
      </div>
    )
  }

  return (
    <section className="provider-side-card">
      <h2>Meus favoritos</h2>
      <button
        type="button"
        className={expanded === 'favorites' ? 'selected' : ''}
        aria-expanded={expanded === 'favorites'}
        onClick={() => setExpanded(expanded === 'favorites' ? null : 'favorites')}
      >
        <Heart aria-hidden="true" />
        {favoriteLabel} ({favoriteProviders.length})
        <ArrowRight aria-hidden="true" />
      </button>
      {expanded === 'favorites' && renderProviderResults(favoriteProviders, 'Nenhum credenciado favorito salvo.')}

      <button
        type="button"
        className={expanded === 'rated' ? 'selected' : ''}
        aria-expanded={expanded === 'rated'}
        onClick={() => setExpanded(expanded === 'rated' ? null : 'rated')}
      >
        <Star aria-hidden="true" />
        {ratedLabel} ({ratedProviders.length})
        <ArrowRight aria-hidden="true" />
      </button>
      {expanded === 'rated' && renderProviderResults(ratedProviders, 'Nenhum credenciado avaliado salvo.', true)}

      <Link className="provider-side-all" to="/beneficiario/minhas-preferencias">
        Todos os favoritos <ArrowRight aria-hidden="true" />
      </Link>
    </section>
  )
}

function ActiveFilters({
  filters,
  onClear,
}: {
  filters: string[]
  onClear: () => void
}) {
  if (filters.length === 0) {
    return (
      <div className="active-filters is-empty">
        <span>Nenhum filtro aplicado</span>
      </div>
    )
  }

  return (
    <div className="active-filters" aria-label="Filtros aplicados">
      <div>
        <strong>Filtros aplicados</strong>
        {filters.map((filter) => <span key={filter}>{filter}</span>)}
      </div>
      <button className="filter-clear-button" type="button" onClick={onClear}>Limpar filtros</button>
    </div>
  )
}

function ProviderCard({
  provider,
  distanceReference,
  detailBasePath,
  loggedIn,
  favorite,
  userRating,
  onFavorite,
  onRate,
  onRemoveRating,
}: {
  provider: Provider
  distanceReference: LocationReference | null
  detailBasePath: string
  loggedIn: boolean
  favorite: boolean
  userRating?: number
  onFavorite: () => void
  onRate: (rating: number) => void
  onRemoveRating: () => void
}) {
  const distance = distanceReference ? calculateDistanceKm(distanceReference, provider.address) : null
  const distanceLabel = distance === null
    ? null
    : `${formatDistanceKm(distance)} ${
      distanceReference?.source === 'registered-address'
        ? 'do endereço residencial'
        : distanceReference?.source === 'current'
          ? 'da localização atual'
          : 'do local pesquisado'
    }`
  const Icon = provider.providerType === 'medico' ? Stethoscope : provider.providerType === 'hospital' ? Building2 : provider.providerType === 'dentista' ? ToothIcon : provider.providerType === 'laboratorio' ? Filter : MapPin
  const networkCost = getNetworkCostInfo(provider.networkType)

  return (
    <article className="provider-card">
      {loggedIn && (
        <ProviderPersonalActions
          providerName={provider.name}
          favorite={favorite}
          userRating={userRating}
          onFavorite={onFavorite}
          onRate={onRate}
          onRemoveRating={onRemoveRating}
        />
      )}
      <div className="provider-card-category">
        <span className={`provider-card-icon type-${provider.providerType} ${provider.logoUrl ? 'has-provider-logo' : ''}`} aria-hidden="true">{provider.logoUrl ? <img src={provider.logoUrl} alt="" /> : <Icon />}</span>
        <span className="provider-category">{provider.category}</span>
      </div>
      <div className="provider-card-main">
        <h3>{provider.name}</h3>
      </div>
      <div className="provider-card-address">
        <p>{provider.address.street} - {provider.address.district}</p>
        <p>{provider.address.city}/{provider.address.state} - CEP {provider.address.zipCode}</p>
        {provider.phone && <p className="provider-phone"><Phone aria-hidden="true" /> {provider.phone}</p>}
        {provider.whatsapp && <p className="provider-phone provider-whatsapp"><MessageCircle aria-hidden="true" /> WhatsApp: {provider.whatsapp}</p>}
        <div className="provider-tags">
          {provider.services.slice(0, 3).map((service) => <span key={service}>{service}</span>)}
        </div>
      </div>
      <div className="provider-card-meta">
        {distanceLabel && <strong>{distanceLabel}</strong>}
        {provider.openingStatus && <span className="provider-open"><Clock aria-hidden="true" /> {provider.openingStatus}</span>}
        <a className="provider-cost-label" href="/plan-assiste/beneficiarios/percentuais-de-coparticipacao" target="_blank" rel="noreferrer" title="Abrir percentuais de coparticipação em nova janela">
          {networkCost.label} <ExternalLink aria-hidden="true" />
        </a>
        {userRating && (
          <span className="provider-my-rating" aria-label={`Minha avaliação: ${userRating} de 5 estrelas`}>
            <span>Minha avaliação:</span>
            <span className="provider-my-rating-stars" aria-hidden="true">
              {Array.from({ length: userRating }).map((_, index) => (
                <Star key={index} />
              ))}
            </span>
          </span>
        )}
        <div className="provider-card-actions">
          <Link className="provider-details-link" to={`${detailBasePath}/${provider.id}`}>Ver detalhes</Link>
          <a className="provider-route-link" href={getProviderMapsUrl(provider)} target="_blank" rel="noreferrer">
            Como chegar <Navigation aria-hidden="true" />
          </a>
        </div>
      </div>
    </article>
  )
}

function ProviderPersonalActions({
  providerName,
  favorite,
  userRating,
  onFavorite,
  onRate,
  onRemoveRating,
}: {
  providerName: string
  favorite: boolean
  userRating?: number
  onFavorite: () => void
  onRate: (rating: number) => void
  onRemoveRating: () => void
}) {
  const [ratingOpen, setRatingOpen] = useState(false)
  const [hoverRating, setHoverRating] = useState(0)
  const previewRating = hoverRating || userRating || 0

  function selectRating(rating: number) {
    onRate(rating)
    setRatingOpen(false)
    setHoverRating(0)
  }

  function removeRating() {
    onRemoveRating()
    setRatingOpen(false)
    setHoverRating(0)
  }

  return (
    <div className="provider-personal-actions" aria-label={`Ações pessoais para ${providerName}`}>
      <button
        className={`provider-circle-action ${favorite ? 'is-favorite' : ''}`}
        type="button"
        onClick={onFavorite}
        aria-pressed={favorite}
        aria-label={favorite ? `Remover ${providerName} dos favoritos` : `Adicionar ${providerName} aos favoritos`}
      >
        <Heart aria-hidden="true" />
      </button>
      <div className="provider-rating-action">
        <button
          className={`provider-circle-action provider-rate-trigger ${userRating ? 'is-rated' : ''}`}
          type="button"
          onClick={() => setRatingOpen((current) => !current)}
          aria-expanded={ratingOpen}
          aria-label={userRating ? `Alterar avaliação de ${providerName}` : `Avaliar ${providerName}`}
        >
          <Star aria-hidden="true" />
        </button>
        {ratingOpen && (
          <div className="provider-rating-popover">
            <strong>Avaliar credenciado</strong>
            <div className="rating-star-scale" role="radiogroup" aria-label={`Avaliação de ${providerName}`} onMouseLeave={() => setHoverRating(0)}>
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  type="button"
                  key={rating}
                  className={rating <= previewRating ? 'selected' : ''}
                  onClick={() => selectRating(rating)}
                  onMouseEnter={() => setHoverRating(rating)}
                  onFocus={() => setHoverRating(rating)}
                  onBlur={() => setHoverRating(0)}
                  aria-pressed={userRating === rating}
                  aria-label={`${rating} estrela${rating > 1 ? 's' : ''}`}
                >
                  <Star aria-hidden="true" />
                </button>
              ))}
            </div>
            {userRating && <button className="rating-remove" type="button" onClick={removeRating}>Remover avaliação</button>}
          </div>
        )}
      </div>
    </div>
  )
}

export function ProviderDetails({
  provider,
}: {
  provider: Provider
  context: NetworkContext
}) {
  const [favoriteState, setFavoriteState] = useState<FavoriteState>(() => getFavoriteState())
  const [loggedIn, setLoggedIn] = useState(() => localStorage.getItem('planAssisteLoggedIn') === 'true')
  const [activeProfile, setActiveProfileState] = useState<PortalProfile | null>(() => getStoredSession().activeProfile)
  const favorite = favoriteState.favoriteProviderIds.includes(provider.id)
  const userRating = favoriteState.providerRatings[provider.id]
  const canUsePersonalProviderTools = loggedIn && activeProfile === 'beneficiary'
  const networkCost = getNetworkCostInfo(provider.networkType)

  useEffect(() => {
    function syncFavorites() {
      setFavoriteState(getFavoriteState())
    }

    function syncLogin() {
      const session = getStoredSession()
      setLoggedIn(session.authenticated)
      setActiveProfileState(session.activeProfile)
    }

    window.addEventListener('planAssisteFavoritesUpdated', syncFavorites)
    window.addEventListener('planAssisteSessionUpdated', syncLogin)
    window.addEventListener('storage', syncFavorites)
    window.addEventListener('storage', syncLogin)
    return () => {
      window.removeEventListener('planAssisteFavoritesUpdated', syncFavorites)
      window.removeEventListener('planAssisteSessionUpdated', syncLogin)
      window.removeEventListener('storage', syncFavorites)
      window.removeEventListener('storage', syncLogin)
    }
  }, [])

  function handleFavorite() {
    setFavoriteState(toggleFavoriteProvider(provider.id))
  }

  function handleRating(rating: number) {
    setFavoriteState(setProviderRating(provider.id, rating))
  }

  function handleRemoveRating() {
    setFavoriteState(removeProviderRating(provider.id))
  }

  return (
    <div className="provider-network-content-layout provider-detail-layout">
      <article className="provider-detail-page provider-network-main">
        <Link className="text-link provider-detail-back" to="/rede-credenciada#provider-results-title">
          <ArrowLeft aria-hidden="true" /> Voltar para Rede credenciada
        </Link>

        <section className={`provider-detail-card provider-detail-single ${canUsePersonalProviderTools ? 'has-personal-actions' : ''}`}>
          {canUsePersonalProviderTools && (
            <ProviderPersonalActions
              providerName={provider.name}
              favorite={favorite}
              userRating={userRating}
              onFavorite={handleFavorite}
              onRate={handleRating}
              onRemoveRating={handleRemoveRating}
            />
          )}
          <header className="provider-detail-header">
            <div className="provider-card-category">
              <span className={`provider-card-icon provider-detail-logo type-${provider.providerType} ${provider.logoUrl ? 'has-provider-logo' : ''}`} aria-hidden="true">
                {provider.logoUrl ? <img src={provider.logoUrl} alt="" /> : provider.providerType === 'medico' ? <Stethoscope /> : provider.providerType === 'hospital' ? <Building2 /> : provider.providerType === 'dentista' ? <ToothIcon /> : provider.providerType === 'laboratorio' ? <Filter /> : <MapPin />}
              </span>
              <span className="provider-category">{provider.category}</span>
            </div>
            <div className="provider-detail-title">
              <h1>{provider.name}</h1>
              <p className="page-subtitle">{provider.specialties.join(', ')}</p>
            </div>
          </header>

          <div className="provider-detail-content-grid">
            <section className="provider-detail-section">
              <h2>Dados do credenciado</h2>
              <p><MapPin aria-hidden="true" /> {provider.address.street} - {provider.address.district}, {provider.address.city}/{provider.address.state}</p>
              <p><MapPin aria-hidden="true" /> CEP {provider.address.zipCode}</p>
              {provider.phone && <p><Phone aria-hidden="true" /> {provider.phone}</p>}
              {provider.whatsapp && <p><MessageCircle aria-hidden="true" /> WhatsApp: {provider.whatsapp}</p>}
              {provider.email && <p><a href={`mailto:${provider.email}`}>{provider.email}</a></p>}
              <p><Clock aria-hidden="true" /> {provider.openingStatus || 'Confirme a disponibilidade antes do atendimento.'}</p>
              <p className="provider-detail-cost"><a href="/plan-assiste/beneficiarios/percentuais-de-coparticipacao" target="_blank" rel="noreferrer">{networkCost.label} <ExternalLink aria-hidden="true" /></a></p>
              {canUsePersonalProviderTools && userRating && (
                <p className="provider-my-rating" aria-label={`Minha avaliação: ${userRating} de 5 estrelas`}>
                  <span>Minha avaliação:</span>
                  <span className="provider-my-rating-stars" aria-hidden="true">
                    {Array.from({ length: userRating }).map((_, index) => (
                      <Star key={index} />
                    ))}
                  </span>
                </p>
              )}
            </section>

            <section className="provider-detail-section">
              <h2>Atendimento e serviços</h2>
              <div className="provider-tags">
                {provider.attendanceTypes.map((item) => <span key={item}>{item}</span>)}
                {provider.services.map((item) => <span key={item}>{item}</span>)}
              </div>
            </section>
          </div>

          <div className="provider-detail-actions">
            <a className="primary-button" href={getProviderMapsUrl(provider)} target="_blank" rel="noreferrer">Como chegar</a>
            {provider.website && <a className="secondary-button" href={provider.website} target="_blank" rel="noreferrer">Acessar website <ExternalLink aria-hidden="true" /></a>}
          </div>

          {provider.observation && <p className="provider-detail-observation"><strong>Observação:</strong> {provider.observation}</p>}

          <p className="provider-detail-warning">Confirme endereço, horários e disponibilidade diretamente com o credenciado antes do atendimento.</p>
        </section>
      </article>
    </div>
  )
}
