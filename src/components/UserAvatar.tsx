/**
 * Avatar de pessoa: a foto, quando existe; senão as iniciais do nome sobre uma
 * cor fixa por pessoa (a mesma pessoa tem sempre a mesma cor), como nos sistemas
 * corporativos em que o usuário ainda não enviou foto.
 */

const CORES = ['#1d6f8a', '#7a4fa3', '#b4532a', '#2f7d4f', '#a33a63', '#4a5fb0', '#8a6d1f', '#2d6e6a']

function iniciais(nome: string) {
  const partes = nome.trim().split(/\s+/)
  const primeira = partes[0]?.[0] ?? ''
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : ''
  return `${primeira}${ultima}`.toUpperCase()
}

function corDoNome(nome: string) {
  // Hash simples (multiplicador 31) para espalhar bem nomes parecidos entre as cores.
  const hash = [...nome].reduce((total, letra) => (total * 31 + letra.charCodeAt(0)) >>> 0, 7)
  return CORES[hash % CORES.length]
}

export function UserAvatar({ nome, foto }: { nome: string, foto?: string }) {
  if (foto) return <img src={foto} alt="" />
  return (
    <span className="user-avatar-iniciais" style={{ backgroundColor: corDoNome(nome) }} aria-hidden="true">
      {iniciais(nome)}
    </span>
  )
}
