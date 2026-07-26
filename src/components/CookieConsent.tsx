import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const POLICY_VERSION = '2026-07-19'
const CONSENT_KEY = 'planAssisteCookieConsent'

type CookiePreferences = { version: string, functional: boolean, analytics: boolean, acceptedAt: string }

function readConsent(): CookiePreferences | null {
  try {
    const value = JSON.parse(localStorage.getItem(CONSENT_KEY) || 'null') as CookiePreferences | null
    return value?.version === POLICY_VERSION ? value : null
  } catch { return null }
}

// eslint-disable-next-line react-refresh/only-export-components
export function reopenCookiePreferences() {
  window.dispatchEvent(new Event('planAssisteOpenCookiePreferences'))
}

export function CookieConsent() {
  const [open, setOpen] = useState(() => !readConsent())
  const [functional, setFunctional] = useState(() => readConsent()?.functional ?? false)
  const [analytics, setAnalytics] = useState(() => readConsent()?.analytics ?? false)

  useEffect(() => {
    const reopen = () => { const saved = readConsent(); setFunctional(saved?.functional ?? false); setAnalytics(saved?.analytics ?? false); setOpen(true) }
    window.addEventListener('planAssisteOpenCookiePreferences', reopen)
    return () => window.removeEventListener('planAssisteOpenCookiePreferences', reopen)
  }, [])

  function save(nextFunctional = functional, nextAnalytics = analytics) {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({ version: POLICY_VERSION, functional: nextFunctional, analytics: nextAnalytics, acceptedAt: new Date().toISOString() }))
    setOpen(false)
    window.dispatchEvent(new Event('planAssisteCookieConsentUpdated'))
  }

  if (!open) return null
  return <div className="cookie-consent-backdrop" role="presentation">
    <section className="cookie-consent-dialog" role="dialog" aria-modal="true" aria-labelledby="cookie-consent-title">
      <p className="eyebrow">Privacidade e cookies</p>
      <h2 id="cookie-consent-title">Escolha como seus dados de navegação podem ser utilizados</h2>
      <p>O Plan-Assiste utiliza cookies necessários para o funcionamento e, mediante sua autorização, cookies funcionais e de medição. Uma nova concordância será solicitada sempre que esta política for atualizada.</p>
      <div className="cookie-policy-links"><Link to="/lgpd" target="_blank">Política de privacidade e LGPD</Link><a href="https://www.mpf.mp.br/servicos/lgpd/politicas/privacidade/politica-de-cookies" target="_blank" rel="noreferrer">Política de cookies</a></div>
      <div className="cookie-preference-list">
        <label><span><strong>Cookies necessários</strong><small>Autenticação, segurança, acessibilidade e preferências essenciais.</small></span><input type="checkbox" checked disabled aria-label="Cookies necessários, sempre ativos" /></label>
        <label><span><strong>Cookies funcionais</strong><small>Memorizam escolhas que facilitam o uso do portal.</small></span><input type="checkbox" checked={functional} onChange={(event) => setFunctional(event.target.checked)} /></label>
        <label><span><strong>Cookies de medição</strong><small>Ajudam a compreender o uso do portal por dados estatísticos.</small></span><input type="checkbox" checked={analytics} onChange={(event) => setAnalytics(event.target.checked)} /></label>
      </div>
      <div className="cookie-consent-actions"><button className="secondary-button" type="button" onClick={() => save(false, false)}>Somente necessários</button><button className="secondary-button" type="button" onClick={() => save()}>Salvar preferências</button><button className="primary-button" type="button" onClick={() => save(true, true)}>Aceitar todos</button></div>
    </section>
  </div>
}
