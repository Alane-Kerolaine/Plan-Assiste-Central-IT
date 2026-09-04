import { Send } from 'lucide-react'
import type { FormEvent } from 'react'

const MAX_CHAT_MESSAGE_LENGTH = 1000

type ChatMessageComposerProps = {
  value: string
  onChange: (value: string) => void
  onSubmit: (event: FormEvent) => void
}

export function ChatMessageComposer({ value, onChange, onSubmit }: ChatMessageComposerProps) {
  const isNearLimit = value.length >= MAX_CHAT_MESSAGE_LENGTH - 100

  return (
    <form className="solicitacao-chat-compose" onSubmit={onSubmit}>
      <div className="solicitacao-chat-textarea-wrap">
        <textarea
          rows={3}
          maxLength={MAX_CHAT_MESSAGE_LENGTH}
          placeholder="Escreva uma mensagem para o atendente..."
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              event.currentTarget.form?.requestSubmit()
            }
          }}
          aria-label="Mensagem para o atendente"
        />
        <span className={`solicitacao-chat-char-count${isNearLimit ? ' is-near-limit' : ''}`}>
          {value.length}/{MAX_CHAT_MESSAGE_LENGTH}
        </span>
        <button className="primary-button solicitacao-chat-send" type="submit" aria-label="Enviar mensagem">
          <Send aria-hidden="true" /> Enviar
        </button>
      </div>
    </form>
  )
}
