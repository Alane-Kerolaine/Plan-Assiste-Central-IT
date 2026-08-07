import { FileText, Paperclip, X } from 'lucide-react'

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

type FileAttachmentFieldProps = {
  label: string
  helpText?: string
  fullWidth?: boolean
  hideLabel?: boolean
  required?: boolean
  files: File[]
  onAdd: (files: File[]) => void
  onRemove: (index: number) => void
}

export function FileAttachmentField({ label, helpText, fullWidth, hideLabel, required, files, onAdd, onRemove }: FileAttachmentFieldProps) {
  const inputId = `file-${label.replace(/\s+/g, '-').toLowerCase()}`
  return (
    <div className={`service-file-field ${fullWidth ? 'wide' : ''}`.trim()}>
      {!hideLabel && <span>{label}{required ? ' *' : ''}</span>}
      <div className="service-file-dropzone">
        <Paperclip aria-hidden="true" />
        <label className="service-file-select" htmlFor={inputId}>
          Selecionar arquivos
          <input
            id={inputId}
            type="file"
            multiple
            onChange={(event) => {
              onAdd(Array.from(event.target.files ?? []))
              event.target.value = ''
            }}
          />
        </label>
        {helpText && <span className="service-field-hint">{helpText}</span>}
      </div>
      {files.length > 0 && (
        <ul className="service-file-list">
          {files.map((file, index) => (
            <li className="service-file-item" key={`${file.name}-${file.size}-${index}`}>
              <FileText aria-hidden="true" />
              <span className="service-file-name">{file.name}</span>
              <span className="service-file-size">{formatFileSize(file.size)}</span>
              <button type="button" aria-label={`Remover ${file.name}`} onClick={() => onRemove(index)}>
                <X aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
