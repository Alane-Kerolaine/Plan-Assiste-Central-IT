import { Pencil } from 'lucide-react'
import { abrirNaAdministracao, dentroDoEditor } from '../utils/modoEdicao'

/**
 * Atalho que leva direto à tela de administração do elemento sob o qual aparece.
 * Só é renderizado quando o portal está sendo exibido dentro do navegador da
 * Área da equipe, então nunca chega ao público.
 */
export function AtalhoDeEdicao({
  para,
  rotulo = 'Editar',
  titulo,
}: {
  /** Caminho dentro da administração, a partir de /administracao-do-portal. */
  para: string
  rotulo?: string
  titulo: string
}) {
  if (!dentroDoEditor()) return null

  return (
    <button
      className="atalho-edicao"
      type="button"
      title={titulo}
      aria-label={titulo}
      onClick={() => abrirNaAdministracao(para)}
    >
      <Pencil aria-hidden="true" /> {rotulo}
    </button>
  )
}
