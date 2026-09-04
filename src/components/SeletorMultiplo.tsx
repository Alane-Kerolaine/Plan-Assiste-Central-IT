/**
 * Escolha de varias opcoes em caixas de marcacao.
 *
 * Caixas em vez de lista suspensa: com selecao multipla, a lista esconde o que
 * ja foi escolhido atras de um clique.
 */
export function SeletorMultiplo({
  rotulo,
  opcoes,
  valor,
  onChange,
  avisoVazio,
}: {
  rotulo: string
  opcoes: string[]
  valor: string[]
  onChange: (valor: string[]) => void
  /** Explica o que acontece quando nada e escolhido. */
  avisoVazio?: string
}) {
  function alternar(opcao: string) {
    onChange(valor.includes(opcao)
      ? valor.filter((item) => item !== opcao)
      : [...valor, opcao])
  }

  return (
    <div className="cms-publicos">
      <span className="cms-campo-rotulo">{rotulo}</span>
      <div className="cms-publicos-lista" role="group" aria-label={rotulo}>
        {opcoes.map((opcao) => (
          <label key={opcao}>
            <input type="checkbox" checked={valor.includes(opcao)} onChange={() => alternar(opcao)} />
            <span>{opcao}</span>
          </label>
        ))}
      </div>
      {valor.length === 0 && avisoVazio && <small className="cms-publicos-aviso">{avisoVazio}</small>}
    </div>
  )
}
