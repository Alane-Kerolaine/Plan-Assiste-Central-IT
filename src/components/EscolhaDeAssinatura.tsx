import { useRef, type ChangeEvent } from 'react'
import { AlertCircle, Download, FileCheck2, PenLine, Trash2, Upload } from 'lucide-react'
import type { ServiceFormSchema, ServiceFormSection } from '../data/serviceFormSchemas'
import { baixarDocumentoPdf } from '../utils/documentoSolicitacao'

export type MetodoDeAssinatura = 'govbr' | 'externa'

const LIMITE_MB = 10

/** Tamanho legível do arquivo anexado. */
function tamanhoLegivel(bytes: number): string {
  return bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(0)} KB`
    : `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

/**
 * Escolha entre assinar pelo gov.br ou anexar o documento assinado por fora.
 *
 * O caminho externo aparece em três etapas numeradas porque ele acontece fora
 * do portal: quem baixa o PDF precisa saber que ainda falta assinar e voltar
 * para anexar, senão abandona o fluxo achando que terminou.
 */
export function EscolhaDeAssinatura({
  schema,
  sections,
  values,
  attachments,
  metodo,
  onMetodo,
  arquivoAssinado,
  onArquivoAssinado,
}: {
  schema: ServiceFormSchema
  sections: ServiceFormSection[]
  values: Record<string, string>
  attachments: Record<string, File[]>
  metodo: MetodoDeAssinatura
  onMetodo: (metodo: MetodoDeAssinatura) => void
  arquivoAssinado?: File
  onArquivoAssinado: (arquivo?: File) => void
}) {
  const entrada = useRef<HTMLInputElement>(null)

  function anexar(evento: ChangeEvent<HTMLInputElement>) {
    const arquivo = evento.target.files?.[0]
    evento.target.value = ''
    if (!arquivo) return
    if (arquivo.type !== 'application/pdf') {
      window.alert('Anexe o documento em PDF.')
      return
    }
    if (arquivo.size > LIMITE_MB * 1024 * 1024) {
      window.alert(`O arquivo excede ${LIMITE_MB} MB.`)
      return
    }
    onArquivoAssinado(arquivo)
  }

  return (
    <section className="assinatura-escolha" aria-labelledby="assinatura-escolha-titulo">
      <h3 id="assinatura-escolha-titulo"><PenLine aria-hidden="true" /> Como você prefere assinar a sua solicitação?</h3>

      <div className="assinatura-opcoes" role="radiogroup" aria-labelledby="assinatura-escolha-titulo">
        <label className={metodo === 'govbr' ? 'is-escolhida' : undefined}>
          <input
            type="radio"
            name="metodo-assinatura"
            checked={metodo === 'govbr'}
            onChange={() => onMetodo('govbr')}
          />
          <span>
            <strong>Assinatura digital gov.br <em className="assinatura-recomendada">Recomendado</em></strong>
            <small>Assine na hora com sua conta do Governo Federal, sem precisar anexar arquivo.</small>
          </span>
        </label>

        <label className={metodo === 'externa' ? 'is-escolhida' : undefined}>
          <input
            type="radio"
            name="metodo-assinatura"
            checked={metodo === 'externa'}
            onChange={() => onMetodo('externa')}
          />
          <span>
            <strong>Assinatura externa ou manual</strong>
            <small>Baixe o PDF, assine com seu certificado ou à mão, e anexe o documento assinado.</small>
          </span>
        </label>
      </div>

      {metodo === 'externa' && (
        <div className="assinatura-externa">
          <header>
            <strong><AlertCircle aria-hidden="true" /> Fluxo de assinatura externa</strong>
            <span>Siga as três etapas abaixo</span>
          </header>

          <ol className="assinatura-etapas">
            <li>
              <h4>1. Obter o formulário</h4>
              <p>Baixe o PDF gerado pelo sistema com os dados da sua solicitação.</p>
              <button
                className="secondary-button"
                type="button"
                onClick={() => baixarDocumentoPdf(schema, sections, values, attachments)}
              >
                <Download aria-hidden="true" /> Baixar PDF original
              </button>
            </li>
            <li>
              <h4>2. Assinar o documento</h4>
              <p>Assine o PDF com seu certificado digital, por um sistema externo, ou imprima e assine à mão.</p>
              <small>Aceitos: ICP-Brasil, Docusign, Adobe Sign e assinatura física digitalizada.</small>
            </li>
            <li>
              <h4>3. Anexar o assinado</h4>
              <p>Envie o PDF já assinado. Ele substitui o documento da solicitação.</p>
              <button className="primary-button" type="button" onClick={() => entrada.current?.click()}>
                <Upload aria-hidden="true" /> Anexar PDF assinado
              </button>
              <input ref={entrada} hidden type="file" accept="application/pdf" onChange={anexar} />
            </li>
          </ol>

          {arquivoAssinado && (
            <div className="assinatura-anexado">
              <FileCheck2 aria-hidden="true" />
              <div>
                <strong>{arquivoAssinado.name}</strong>
                <small>{tamanhoLegivel(arquivoAssinado.size)} · anexado agora</small>
              </div>
              <span className="assinatura-etiqueta">Documento assinado</span>
              <button type="button" onClick={() => onArquivoAssinado(undefined)}>
                <Trash2 aria-hidden="true" /> Remover
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
