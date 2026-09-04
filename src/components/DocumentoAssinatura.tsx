import { useEffect, useMemo } from 'react'
import { Download } from 'lucide-react'
import type { ServiceFormSchema, ServiceFormSection } from '../data/serviceFormSchemas'
import { montarPdf } from '../utils/documentoPdf'
import {
  documentoDaSolicitacao,
  nomeArquivoDocumento,
  type AssinaturaDocumento,
} from '../utils/documentoSolicitacao'

/**
 * Pré-visualização do documento em PDF. O arquivo exibido aqui é o mesmo que o
 * usuário baixa, então a via na tela e a via salva nunca divergem.
 */
export function DocumentoPdfPreview({
  schema,
  sections,
  values,
  attachments,
  assinatura,
  protocolo,
  titulo,
  descricao,
  permitirDownload = false,
}: {
  schema: ServiceFormSchema
  sections: ServiceFormSection[]
  values: Record<string, string>
  attachments: Record<string, File[]>
  assinatura?: AssinaturaDocumento
  protocolo?: string
  titulo: string
  descricao: string
  permitirDownload?: boolean
}) {
  const url = useMemo(
    () => URL.createObjectURL(montarPdf(documentoDaSolicitacao(schema, sections, values, attachments, assinatura))),
    [schema, sections, values, attachments, assinatura],
  )

  useEffect(() => () => URL.revokeObjectURL(url), [url])

  function baixar() {
    const ancora = document.createElement('a')
    ancora.href = url
    ancora.download = nomeArquivoDocumento(schema, protocolo)
    ancora.click()
  }

  return (
    <div className="documento-pdf">
      <div className="documento-pdf-heading">
        <div>
          <h3>{titulo}</h3>
          <p>{descricao}</p>
        </div>
        {permitirDownload && (
          <button className="secondary-button" type="button" onClick={baixar}>
            <Download aria-hidden="true" /> Baixar PDF
          </button>
        )}
      </div>
      <iframe className="documento-pdf-frame" src={url} title={`${titulo} — ${schema.title}`} />
    </div>
  )
}
