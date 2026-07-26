import { Send, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { getAssistantReply } from '../utils/aiAssistant'

const INPUT_MAX_HEIGHT = 200

type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  text: string
  cta?: { label: string; to: string }
}

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  text: 'Olá! Sou o assistente virtual do Plan-Assiste. Posso ajudar com dúvidas sobre cadastro, financeiro, cobertura, autorização de procedimentos e rede credenciada. O que você gostaria de saber?',
}

const SUGGESTED_QUESTIONS = [
  'Como solicitar reembolso de despesas?',
  'Como consultar a rede credenciada?',
  'Como solicito a 2ª via dos cartões?',
  'Quais são os percentuais de coparticipação?',
]

function createMessageId(role: ChatMessage['role']) {
  return `${role}-${Math.random().toString(36).slice(2, 10)}`
}

function getTypingDelay() {
  return 600 + Math.random() * 500
}

export function AiChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const openButtonRef = useRef<HTMLButtonElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (!open) return

    const compactViewport = window.matchMedia('(max-width: 640px)').matches
    ;(compactViewport ? closeButtonRef.current : inputRef.current)?.focus()
    const triggerButton = openButtonRef.current
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const viewport = window.visualViewport
    function syncVisualViewport() {
      if (!viewport) return
      document.documentElement.style.setProperty('--chat-viewport-height', `${viewport.height}px`)
      document.documentElement.style.setProperty('--chat-viewport-top', `${viewport.offsetTop}px`)
    }

    syncVisualViewport()
    viewport?.addEventListener('resize', syncVisualViewport)
    viewport?.addEventListener('scroll', syncVisualViewport)

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      document.documentElement.style.removeProperty('--chat-viewport-height')
      document.documentElement.style.removeProperty('--chat-viewport-top')
      viewport?.removeEventListener('resize', syncVisualViewport)
      viewport?.removeEventListener('scroll', syncVisualViewport)
      document.removeEventListener('keydown', closeOnEscape)
      triggerButton?.focus()
    }
  }, [open])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, typing])

  useEffect(() => {
    return () => window.clearTimeout(typingTimeoutRef.current)
  }, [])

  function resizeInput() {
    const textarea = inputRef.current
    if (!textarea) return
    if (!textarea.value) {
      textarea.style.height = ''
      return
    }
    textarea.style.height = 'auto'
    const { borderTopWidth, borderBottomWidth } = getComputedStyle(textarea)
    const borderHeight = parseFloat(borderTopWidth) + parseFloat(borderBottomWidth)
    textarea.style.height = `${Math.min(textarea.scrollHeight + borderHeight, INPUT_MAX_HEIGHT)}px`
  }

  function sendMessage(rawText: string) {
    const text = rawText.trim()
    if (!text) return

    setMessages((current) => [...current, { id: createMessageId('user'), role: 'user', text }])
    setInput('')
    setTyping(true)
    requestAnimationFrame(resizeInput)

    typingTimeoutRef.current = window.setTimeout(() => {
      const reply = getAssistantReply(text)
      setMessages((current) => [
        ...current,
        { id: createMessageId('assistant'), role: 'assistant', text: reply.text, cta: reply.cta },
      ])
      setTyping(false)
    }, getTypingDelay())
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    sendMessage(input)
  }

  function handleKeyDown(event: ReactKeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <>
      <button
        className="ai-chat-button"
        ref={openButtonRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Fale com a IA do Plan-Assiste"
        title="Abrir assistente virtual"
      >
        <img src="/assets/assistente-virtual.svg" alt="" aria-hidden="true" />
      </button>

      {open && (
        <div
          className="go-modal-overlay ai-chat-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false)
          }}
        >
          <div className="go-modal ai-chat-modal" role="dialog" aria-modal="true" aria-labelledby="ai-chat-title">
            <div className="go-modal-header ai-chat-header">
              <div className="ai-chat-header-info">
                <span className="ai-chat-header-icon">
                  <img src="/assets/assistente-virtual.svg" alt="" aria-hidden="true" />
                </span>
                <div>
                  <h2 id="ai-chat-title">Assistente virtual Plan-Assiste</h2>
                  <span>Respostas automáticas sobre o Programa</span>
                </div>
              </div>
              <button ref={closeButtonRef} className="go-modal-close" type="button" aria-label="Fechar chat" onClick={() => setOpen(false)}>
                <X />
              </button>
            </div>

            <div className="ai-chat-messages" role="log" aria-live="polite">
              {messages.map((message) => (
                <div key={message.id} className={`ai-chat-bubble ai-chat-bubble-${message.role}`}>
                  <p>{message.text}</p>
                  {message.cta && (
                    <Link className="ai-chat-cta" to={message.cta.to} onClick={() => setOpen(false)}>
                      {message.cta.label}
                    </Link>
                  )}
                </div>
              ))}
              {typing && (
                <div className="ai-chat-bubble ai-chat-bubble-assistant ai-chat-typing" aria-label="Assistente digitando">
                  <span /><span /><span />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {messages.length === 1 && (
              <div className="ai-chat-suggestions">
                {SUGGESTED_QUESTIONS.map((question) => (
                  <button key={question} type="button" onClick={() => sendMessage(question)}>
                    {question}
                  </button>
                ))}
              </div>
            )}

            <form className="ai-chat-form" onSubmit={handleSubmit}>
              <label className="sr-only" htmlFor="ai-chat-input">Digite sua dúvida sobre o Plan-Assiste</label>
              <textarea
                id="ai-chat-input"
                ref={inputRef}
                value={input}
                onChange={(event) => {
                  setInput(event.target.value)
                  resizeInput()
                }}
                onKeyDown={handleKeyDown}
                placeholder="Digite sua dúvida sobre o Plan-Assiste"
                autoComplete="off"
                rows={1}
              />
              <button type="submit" aria-label="Enviar mensagem" disabled={!input.trim()}>
                <Send />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
