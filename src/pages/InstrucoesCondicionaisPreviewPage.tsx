import { useState } from 'react'
import { AvisoNormativo } from '../components/AvisoNormativo'
import { ChecklistAnexos, type ChecklistAnexosDocumento } from '../components/ChecklistAnexos'
import { PerguntaChaveSelector } from '../components/PerguntaChaveSelector'
import type { CasoInstrucaoServico } from '../data/serviceFormSchemas'
import { isFeatureInstrucoesCondicionaisEnabled } from '../utils/featureFlags'
import { NotFoundPage } from './NotFoundPage'

const CASOS_MOCK: CasoInstrucaoServico[] = [
  {
    id: 'medicamento_geral',
    titulo: 'Medicamento de uso geral',
    documentos: [
      { id: 'receita', label: 'Receita médica', obrigatorio: true },
      { id: 'relatorio', label: 'Relatório médico', obrigatorio: true },
      { id: 'nota-fiscal', label: 'Nota fiscal', obrigatorio: true },
    ],
  },
  {
    id: 'somatropina',
    titulo: 'Somatropina',
    documentos: [
      { id: 'comprovante-desabastecimento', label: 'Comprovante de desabastecimento na rede pública', obrigatorio: true },
      { id: 'relatorio', label: 'Relatório médico', obrigatorio: true },
      { id: 'nota-fiscal', label: 'Nota fiscal', obrigatorio: true },
    ],
  },
  {
    id: 'obesidade',
    titulo: 'Obesidade',
    documentos: [
      { id: 'relatorio-imc', label: 'Relatório médico detalhado com IMC', obrigatorio: true },
      { id: 'receita', label: 'Receita médica', obrigatorio: true },
      { id: 'nota-fiscal', label: 'Nota fiscal', obrigatorio: true },
    ],
    avisoNormativo: {
      titulo: 'Antes de enviar sua solicitação',
      conteudo: 'Este é um texto de exemplo (mock) para o aviso normativo. O conteúdo real será extraído do documento de instruções na Fase 3.\n\nSegundo parágrafo de exemplo, demonstrando a quebra em múltiplos parágrafos.',
      exigeConfirmacao: true,
    },
  },
]

function dedupeDocumentos(casos: CasoInstrucaoServico[]) {
  const seen = new Set<string>()
  return casos.flatMap((caso) => caso.documentos).filter((documento) => {
    if (seen.has(documento.id)) return false
    seen.add(documento.id)
    return true
  })
}

const TODOS_DOCUMENTOS = dedupeDocumentos(CASOS_MOCK)

export function InstrucoesCondicionaisPreviewPage() {
  const [casoId, setCasoId] = useState(CASOS_MOCK[0].id)
  const [arquivosPorDocumento, setArquivosPorDocumento] = useState<Record<string, File[]>>({})
  const [confirmado, setConfirmado] = useState(false)

  if (!isFeatureInstrucoesCondicionaisEnabled()) {
    return <NotFoundPage />
  }

  const casoSelecionado = CASOS_MOCK.find((caso) => caso.id === casoId) ?? CASOS_MOCK[0]
  const documentosRequeridos = new Set(casoSelecionado.documentos.map((documento) => documento.id))

  function addFiles(documentoId: string, files: File[]) {
    setArquivosPorDocumento((current) => ({ ...current, [documentoId]: [...(current[documentoId] ?? []), ...files] }))
  }

  function removeFile(documentoId: string, index: number) {
    setArquivosPorDocumento((current) => ({ ...current, [documentoId]: (current[documentoId] ?? []).filter((_, i) => i !== index) }))
  }

  const checklistDocumentos: ChecklistAnexosDocumento[] = TODOS_DOCUMENTOS.map((documento) => ({
    ...documento,
    requerido: documentosRequeridos.has(documento.id),
    arquivos: arquivosPorDocumento[documento.id] ?? [],
  }))

  return (
    <div className="requests-page">
      <div className="provider-page-heading">
        <h1>Preview — Instruções condicionais (dev)</h1>
        <p className="page-subtitle">
          Playground dos componentes PerguntaChaveSelector, ChecklistAnexos e AvisoNormativo com dados mock.
          Troque o caso para ver o checklist se recompor sem apagar arquivos já anexados.
        </p>
      </div>

      <section className="reimbursement-card">
        <h2>1. Pergunta-chave</h2>
        <PerguntaChaveSelector
          casos={CASOS_MOCK}
          enunciado="Sua dúvida é sobre qual tipo de medicamento?"
          onChange={setCasoId}
          value={casoId}
        />
      </section>

      <section className="reimbursement-card">
        <h2>2. Checklist de anexos — {casoSelecionado.titulo}</h2>
        <ChecklistAnexos documentos={checklistDocumentos} onAdd={addFiles} onRemove={removeFile} />
      </section>

      {casoSelecionado.avisoNormativo && (
        <section className="reimbursement-card">
          <h2>3. Aviso normativo</h2>
          <AvisoNormativo
            {...casoSelecionado.avisoNormativo}
            confirmado={confirmado}
            onConfirmar={setConfirmado}
          />
        </section>
      )}
    </div>
  )
}
