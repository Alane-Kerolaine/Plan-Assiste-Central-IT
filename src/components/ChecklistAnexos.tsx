import type { CasoInstrucaoDocumento } from '../data/serviceFormSchemas'
import { FileAttachmentField } from './FileAttachmentField'

export type ChecklistAnexosDocumento = CasoInstrucaoDocumento & {
  requerido: boolean
  arquivos: File[]
}

type ChecklistAnexosProps = {
  documentos: ChecklistAnexosDocumento[]
  onAdd: (documentoId: string, files: File[]) => void
  onRemove: (documentoId: string, index: number) => void
}

function statusDocumento(documento: ChecklistAnexosDocumento): 'enviado' | 'nao-enviado' | 'nao-requerido' {
  if (!documento.requerido) return 'nao-requerido'
  return documento.arquivos.length > 0 ? 'enviado' : 'nao-enviado'
}

const STATUS_LABEL = {
  enviado: 'Enviado',
  'nao-enviado': 'Não enviado',
  'nao-requerido': 'Não requerido para este caso',
}

const STATUS_BADGE_CLASS = {
  enviado: 'go-badge approved',
  'nao-enviado': 'go-badge pending',
  'nao-requerido': 'go-badge info',
}

export function ChecklistAnexos({ documentos, onAdd, onRemove }: ChecklistAnexosProps) {
  return (
    <div aria-label="Documentos exigidos para este caso" className="checklist-anexos" role="list">
      {documentos.map((documento) => {
        const status = statusDocumento(documento)
        return (
          <div className="checklist-anexos-item" key={documento.id} role="listitem">
            <div className="checklist-anexos-item-header">
              <span className="checklist-anexos-item-label">
                {documento.label}{documento.obrigatorio && documento.requerido ? ' *' : ''}
              </span>
              <span className={STATUS_BADGE_CLASS[status]}>{STATUS_LABEL[status]}</span>
            </div>
            {documento.requerido && (
              <FileAttachmentField
                files={documento.arquivos}
                fullWidth
                helpText="Selecione um ou mais arquivos em PDF, JPG ou PNG, com até 10 MB cada."
                label={documento.label}
                onAdd={(files) => onAdd(documento.id, files)}
                onRemove={(index) => onRemove(documento.id, index)}
              />
            )}
            {!documento.requerido && documento.arquivos.length > 0 && (
              <ul aria-label={`Arquivos mantidos de ${documento.label}`} className="checklist-anexos-arquivos-mantidos">
                {documento.arquivos.map((file, index) => (
                  <li key={`${file.name}-${index}`}>{file.name}</li>
                ))}
              </ul>
            )}
          </div>
        )
      })}
    </div>
  )
}
