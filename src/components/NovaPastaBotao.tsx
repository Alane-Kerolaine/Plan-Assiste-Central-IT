import { useState } from 'react'
import { FolderPlus, X } from 'lucide-react'

/**
 * Criacao de pasta no lugar onde ela vai nascer.
 *
 * O campo abre ali mesmo, em vez de uma janela de pergunta: quem cria precisa
 * ver em que pasta esta antes de dar o nome.
 */
export function NovaPastaBotao({ onCriar, rotulo = 'Nova pasta' }: { onCriar: (nome: string) => void, rotulo?: string }) {
  const [aberto, setAberto] = useState(false)
  const [nome, setNome] = useState('')

  function confirmar() {
    if (!nome.trim()) return
    onCriar(nome)
    setNome('')
    setAberto(false)
  }

  if (!aberto) {
    return (
      <button className="secondary-button" type="button" onClick={() => setAberto(true)}>
        <FolderPlus aria-hidden="true" /> {rotulo}
      </button>
    )
  }

  return (
    <div className="cms-nova-pasta">
      <label>
        <span className="sr-only">Nome da nova pasta</span>
        <input
          autoFocus
          value={nome}
          onChange={(evento) => setNome(evento.target.value)}
          onKeyDown={(evento) => {
            if (evento.key === 'Enter') { evento.preventDefault(); confirmar() }
            if (evento.key === 'Escape') { setAberto(false); setNome('') }
          }}
          placeholder="Nome da pasta"
        />
      </label>
      <button className="primary-button" type="button" onClick={confirmar} disabled={!nome.trim()}>Criar</button>
      <button type="button" onClick={() => { setAberto(false); setNome('') }} title="Cancelar" aria-label="Cancelar">
        <X aria-hidden="true" />
      </button>
    </div>
  )
}
