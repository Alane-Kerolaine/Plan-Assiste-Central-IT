import { ArrowRight } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { Footer, Header, MainMenu } from '../components/PortalComponents'
import { ProviderDetails, ProviderNetworkContent } from '../components/ProviderNetwork'
import { useProviderCatalog } from '../utils/providerPublicProfile'

function PublicBreadcrumb({ current }: { current: string }) {
  return (
    <nav className="breadcrumb public-breadcrumb" aria-label="Breadcrumb">
      <Link to="/">Início</Link><ArrowRight />
      <span>{current}</span>
    </nav>
  )
}

export function PublicProviderNetworkPage({
  loggedIn,
  onLogout,
}: {
  loggedIn: boolean
  onLogout: () => void
}) {
  return (
    <>
      <Header loggedIn={loggedIn} onLogout={onLogout} />
      <MainMenu loggedIn={loggedIn} />
      <main className="container public-network-page">
        <PublicBreadcrumb current="Rede credenciada" />
        <ProviderNetworkContent context="public" />
      </main>
      <Footer />
    </>
  )
}

export function BeneficiaryProviderNetworkPage() {
  return <Navigate to="/rede-credenciada" replace />
}

export function PublicProviderDetailsPage({
  loggedIn,
  onLogout,
}: {
  loggedIn: boolean
  onLogout: () => void
}) {
  const { id } = useParams()
  const providers = useProviderCatalog()
  const provider = providers.find((item) => item.id === id)

  if (!provider) return <Navigate to="/rede-credenciada" replace />

  return (
    <>
      <Header loggedIn={loggedIn} onLogout={onLogout} />
      <MainMenu loggedIn={loggedIn} />
      <main className="container public-network-page">
        <PublicBreadcrumb current="Detalhes do credenciado" />
        <ProviderDetails provider={provider} context="public" />
      </main>
      <Footer />
    </>
  )
}

export function BeneficiaryProviderDetailsPage() {
  const { id } = useParams()
  const providers = useProviderCatalog()
  const provider = providers.find((item) => item.id === id)

  if (!provider) return <Navigate to="/rede-credenciada" replace />

  return <Navigate to={`/rede-credenciada/credenciado/${provider.id}`} replace />
}
