import { AlertTriangle, X } from 'lucide-react'
import type { Referencia } from '../cms/referenciasDeArquivo'

/**
 * Confirmacao de substituicao ou exclusao de um arquivo do acervo, mostrando
 * onde ele esta em uso.
 *
 * A lista e o ponto do dialogo: trocar ou apagar um arquivo referenciado muda
 * paginas que quem apertou o botao talvez nem saiba que existem.
 */
export function DialogoDeReferencias({
  acao,
  arquivo,
  referencias,
  onConfirmar,
  onCancelar,
}: {
  acao: 'substituir' | 'excluir'
  arquivo: string
  referencias: Referencia[]
  onConfirmar: () => void
  onCancelar: () => void
}) {
  const excluindo = acao === 'excluir'
  const emUso = referencias.length > 0

  return (
    <div className="cms-dialogo-fundo" role="presentation" onClick={onCancelar}>
      <div
        className="cms-dialogo"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="cms-referencias-titulo"
        onClick={(evento) => evento.stopPropagation()}
      >
        <header>
          <h2 id="cms-referencias-titulo">{excluindo ? 'Excluir arquivo' : 'Substituir arquivo'}</h2>
          <button type="button" onClick={onCancelar} title="Fechar" aria-label="Fechar">
            <X aria-hidden="true" />
          </button>
        </header>

        <div className="cms-dialogo-corpo">
          <p className="cms-referencias-arquivo"><strong>{arquivo}</strong></p>

          {emUso ? (
            <>
              <p className={excluindo ? 'cms-dialogo-erro' : undefined}>
                <AlertTriangle aria-hidden="true" />
                {excluindo
                  ? `Este arquivo está referenciado em ${referencias.length} lugar(es). Excluí-lo deixa esses links sem destino.`
                  : `Este arquivo está referenciado em ${referencias.length} lugar(es). A substituição vale para todos eles de uma vez.`}
              </p>
              <ul className="cms-referencias-lista">
                {referencias.map((referencia, indice) => (
                  <li key={`${referencia.caminho}-${referencia.onde}-${indice}`}>
                    <strong>{referencia.titulo}</strong>
                    <code>{referencia.caminho}</code>
                    <small>{referencia.onde}</small>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p>
              {excluindo
                ? 'Nenhuma página ou notícia usa este arquivo. Excluir não quebra nada.'
                : 'Nenhuma página ou notícia usa este arquivo ainda.'}
            </p>
          )}
        </div>

        <footer>
          <button className="secondary-button" type="button" onClick={onCancelar}>Cancelar</button>
          <button
            className={excluindo ? 'cms-live-descartar' : 'primary-button'}
            type="button"
            onClick={onConfirmar}
          >
            {excluindo ? 'Excluir mesmo assim' : 'Substituir em todos'}
          </button>
        </footer>
      </div>
    </div>
  )
}
