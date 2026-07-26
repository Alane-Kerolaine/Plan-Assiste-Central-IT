import { useEffect } from 'react'

declare module 'react' {
  // React exige o mesmo parâmetro genérico da interface original nesta extensão.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface HTMLAttributes<T> {
    vw?: string
    'vw-access-button'?: string
    'vw-plugin-wrapper'?: string
  }
}

declare global {
  interface Window {
    VLibras?: {
      Widget: new (appUrl: string) => unknown
    }
  }
}

const VLIBRAS_APP_URL = 'https://vlibras.gov.br/app'
const VLIBRAS_SCRIPT_ID = 'vlibras-plugin-script'

export function VLibrasWidget() {
  useEffect(() => {
    let cancelled = false

    function initializeWidget() {
      if (cancelled || !window.VLibras?.Widget) {
        return
      }

      const widgetRoot = document.querySelector('[vw].enabled')

      if (widgetRoot?.getAttribute('data-vlibras-ready') === 'true') {
        return
      }

      new window.VLibras.Widget(VLIBRAS_APP_URL)
      widgetRoot?.setAttribute('data-vlibras-ready', 'true')
    }

    const existingScript = document.getElementById(VLIBRAS_SCRIPT_ID) as HTMLScriptElement | null

    if (existingScript) {
      if (window.VLibras?.Widget) {
        initializeWidget()
      } else {
        existingScript.addEventListener('load', initializeWidget, { once: true })
      }

      return () => {
        cancelled = true
        existingScript.removeEventListener('load', initializeWidget)
      }
    }

    const script = document.createElement('script')
    script.id = VLIBRAS_SCRIPT_ID
    script.src = `${VLIBRAS_APP_URL}/vlibras-plugin.js`
    script.async = true
    script.onload = initializeWidget
    document.body.appendChild(script)

    return () => {
      cancelled = true
      script.onload = null
    }
  }, [])

  return (
    <div vw="" className="enabled" data-vlibras-widget="" aria-label="Acessível com VLibras">
      <div vw-access-button="" className="active" />
      <div vw-plugin-wrapper="">
        <div className="vw-plugin-top-wrapper" />
      </div>
    </div>
  )
}
