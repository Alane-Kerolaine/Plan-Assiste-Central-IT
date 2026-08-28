/**
 * O portal e exibido dentro do navegador da Area da equipe por um quadro
 * embutido. Detectar esse contexto permite mostrar atalhos de edicao sobre os
 * elementos — banners, por exemplo — sem que eles vazem para o publico.
 */
export function dentroDoEditor(): boolean {
  try {
    return typeof window !== 'undefined' && window.self !== window.top
  } catch {
    // Origem diferente ao consultar window.top: nao e o nosso editor.
    return false
  }
}

const RAIZ_ADMIN = '/area-da-equipe/administracao-do-portal'

/** Abre uma tela da administracao na janela que contem o quadro. */
export function abrirNaAdministracao(caminho: string): void {
  const destino = `${RAIZ_ADMIN}${caminho}`
  const janela = window.top ?? window
  janela.location.href = destino
}
