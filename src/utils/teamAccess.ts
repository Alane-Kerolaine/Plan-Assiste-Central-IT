import { useEffect, useState } from 'react'
import { getStoredSession } from './session'

/**
 * Acesso da equipe à Administração do Portal.
 *
 * Gerentes acessam a administração e são os únicos que concedem ou revogam o
 * acesso dos demais membros. Cada concessão ou revogação fica registrada com
 * quem autorizou, quem foi autorizado e quando. No protótipo, as permissões e o
 * registro ficam salvos no navegador.
 */

export type TeamUser = {
  id: string
  nome: string
  matricula: string
  login: string
  cargo: string
  lotacao: string
  gerente: boolean
  /** Também é beneficiária: o login corporativo traz os dois perfis. */
  tambemBeneficiario?: boolean
  /** A foto é a do perfil salvo (Meus dados); sem ela, o avatar mostra as iniciais. */
  usaFotoDoPerfil?: boolean
}

export type AcaoDePermissao = 'concedida' | 'revogada'

export type RegistroDePermissao = {
  id: string
  /** Data e hora em ISO 8601. */
  data: string
  acao: AcaoDePermissao
  usuarioId: string
  autorizadoPorId: string
}

export const TEAM_USERS: readonly TeamUser[] = [
  { id: 'ana.maria', nome: 'Ana Maria de Araújo', matricula: '30003387', login: 'ana.maria', cargo: 'Gerente de atendimento', lotacao: 'Sede (Brasília/DF)', gerente: true, tambemBeneficiario: true, usaFotoDoPerfil: true },
  { id: 'roberto.nunes', nome: 'Roberto Nunes Barbosa', matricula: '30004102', login: 'roberto.nunes', cargo: 'Gerente de comunicação', lotacao: 'Sede (Brasília/DF)', gerente: true },
  { id: 'carlos.lima', nome: 'Carlos Eduardo Lima', matricula: '30005218', login: 'carlos.lima', cargo: 'Analista de comunicação', lotacao: 'Sede (Brasília/DF)', gerente: false },
  { id: 'fernanda.costa', nome: 'Fernanda Souza Costa', matricula: '30005630', login: 'fernanda.costa', cargo: 'Analista de atendimento', lotacao: 'Diretoria São Paulo', gerente: false },
  { id: 'juliana.alves', nome: 'Juliana Ribeiro Alves', matricula: '30006045', login: 'juliana.alves', cargo: 'Técnica administrativa', lotacao: 'Diretoria Nordeste', gerente: false },
  { id: 'marcos.pereira', nome: 'Marcos Vinícius Pereira', matricula: '30006471', login: 'marcos.pereira', cargo: 'Analista de sistemas', lotacao: 'Sede (Brasília/DF)', gerente: false },
  { id: 'patricia.rocha', nome: 'Patrícia Gomes Rocha', matricula: '30007093', login: 'patricia.rocha', cargo: 'Técnica administrativa', lotacao: 'Diretoria Sudeste (exceto São Paulo)', gerente: false },
  { id: 'thiago.oliveira', nome: 'Thiago Martins Oliveira', matricula: '30007548', login: 'thiago.oliveira', cargo: 'Assistente de atendimento', lotacao: 'Diretoria Norte', gerente: false },
]

const PERMISSOES_KEY = 'planAssistePortalAdminPermissions'
const REGISTRO_KEY = 'planAssistePortalAdminLog'
const EVENTO = 'planAssistePortalAdminPermissionsUpdated'

/**
 * Situação inicial do protótipo: um histórico de concessões e revogações que termina
 * com só um membro autorizado (Carlos). O histórico é longo o bastante para paginar.
 */
const PERMISSOES_INICIAIS: readonly string[] = ['carlos.lima']
const REGISTRO_INICIAL: readonly RegistroDePermissao[] = [
  ['2026-03-10T13:05:00.000Z', 'concedida', 'marcos.pereira', 'ana.maria'],
  ['2026-03-18T17:42:00.000Z', 'concedida', 'patricia.rocha', 'roberto.nunes'],
  ['2026-04-02T12:20:00.000Z', 'concedida', 'thiago.oliveira', 'ana.maria'],
  ['2026-04-25T19:10:00.000Z', 'revogada', 'thiago.oliveira', 'ana.maria'],
  ['2026-05-06T14:55:00.000Z', 'concedida', 'juliana.alves', 'roberto.nunes'],
  ['2026-05-30T16:30:00.000Z', 'revogada', 'patricia.rocha', 'roberto.nunes'],
  ['2026-06-12T13:15:00.000Z', 'concedida', 'fernanda.costa', 'ana.maria'],
  ['2026-07-01T18:00:00.000Z', 'revogada', 'marcos.pereira', 'ana.maria'],
  ['2026-07-20T15:25:00.000Z', 'revogada', 'juliana.alves', 'roberto.nunes'],
  ['2026-08-14T12:40:00.000Z', 'revogada', 'fernanda.costa', 'ana.maria'],
  ['2026-08-28T17:05:00.000Z', 'concedida', 'patricia.rocha', 'ana.maria'],
  ['2026-09-02T14:35:00.000Z', 'concedida', 'carlos.lima', 'ana.maria'],
  ['2026-09-10T13:50:00.000Z', 'revogada', 'patricia.rocha', 'ana.maria'],
].map(([data, acao, usuarioId, autorizadoPorId], indice) => ({
  id: `registro-inicial-${indice + 1}`,
  data,
  acao: acao as AcaoDePermissao,
  usuarioId,
  autorizadoPorId,
}))

const EMAIL_INSTITUCIONAL = '@mpu.mp.br'

function normalizar(texto: string) {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
}

function lerLista<T>(chave: string, inicial: readonly T[]): T[] {
  try {
    const salvo = localStorage.getItem(chave)
    if (!salvo) return [...inicial]
    const lista = JSON.parse(salvo)
    return Array.isArray(lista) ? lista : [...inicial]
  } catch {
    return [...inicial]
  }
}

export function getTeamUser(id: string | null | undefined): TeamUser | undefined {
  return TEAM_USERS.find((usuario) => usuario.id === id)
}

/** Localiza o usuário pelo que ele digitou no login: usuário, e-mail institucional ou matrícula. */
export function findTeamUserByLogin(entrada: string): TeamUser | undefined {
  const valor = normalizar(entrada)
  if (!valor) return undefined
  return TEAM_USERS.find((usuario) => (
    usuario.login === valor
    || `${usuario.login}${EMAIL_INSTITUCIONAL}` === valor
    || usuario.matricula === valor.replace(/\D/g, '')
  ))
}

/** Busca por nome (sem acento, em qualquer parte) ou por matrícula. */
export function searchTeamUsers(termo: string): TeamUser[] {
  const valor = normalizar(termo)
  if (!valor) return [...TEAM_USERS]
  const digitos = valor.replace(/\D/g, '')
  return TEAM_USERS.filter((usuario) => (
    normalizar(usuario.nome).includes(valor) || (digitos !== '' && usuario.matricula.includes(digitos))
  ))
}

export function getPortalAdminGrants(): string[] {
  return lerLista(PERMISSOES_KEY, PERMISSOES_INICIAIS)
}

/** Registros do mais recente para o mais antigo. */
export function getPortalAdminLog(): RegistroDePermissao[] {
  return lerLista(REGISTRO_KEY, REGISTRO_INICIAL)
    .slice()
    .sort((primeiro, segundo) => segundo.data.localeCompare(primeiro.data))
}

/** Concessão que está valendo para o membro: a mais recente do registro. */
export function getCurrentGrant(usuarioId: string, registro = getPortalAdminLog()): RegistroDePermissao | undefined {
  return registro.find((item) => item.usuarioId === usuarioId && item.acao === 'concedida')
}

export function canAdministerPortal(usuario: TeamUser | undefined, concedidos = getPortalAdminGrants()): boolean {
  if (!usuario) return false
  return usuario.gerente || concedidos.includes(usuario.id)
}

export function canManagePermissions(usuario: TeamUser | undefined): boolean {
  return usuario?.gerente === true
}

function salvar(concedidos: string[], registro: RegistroDePermissao[]) {
  localStorage.setItem(PERMISSOES_KEY, JSON.stringify(concedidos))
  localStorage.setItem(REGISTRO_KEY, JSON.stringify(registro))
  window.dispatchEvent(new Event(EVENTO))
}

/**
 * Concede ou revoga o acesso de um membro. Só gerentes alteram, e o acesso de
 * gerentes não é alterável (eles sempre acessam).
 */
export function changePortalAdminAccess(gerente: TeamUser, usuarioId: string, acao: AcaoDePermissao): void {
  const usuario = getTeamUser(usuarioId)
  if (!canManagePermissions(gerente)) throw new Error('Somente gerentes podem alterar permissões.')
  if (!usuario) throw new Error('Usuário não encontrado.')
  if (usuario.gerente) throw new Error('Gerentes já têm acesso à Administração do Portal.')

  const concedidos = getPortalAdminGrants()
  const jaTem = concedidos.includes(usuarioId)
  if ((acao === 'concedida') === jaTem) return

  const novosConcedidos = acao === 'concedida'
    ? [...concedidos, usuarioId]
    : concedidos.filter((id) => id !== usuarioId)
  const novoRegistro: RegistroDePermissao = {
    id: `registro-${Date.now()}`,
    data: new Date().toISOString(),
    acao,
    usuarioId,
    autorizadoPorId: gerente.id,
  }
  salvar(novosConcedidos, [...lerLista(REGISTRO_KEY, REGISTRO_INICIAL), novoRegistro])
}

export function getCurrentTeamUser(): TeamUser | undefined {
  const sessao = getStoredSession()
  if (!sessao.authenticated || !sessao.profiles.includes('team')) return undefined
  return getTeamUser(sessao.teamUserId)
}

export type TeamAccess = {
  usuario: TeamUser | undefined
  podeAdministrar: boolean
  podeGerenciarPermissoes: boolean
}

function lerAcesso(): TeamAccess {
  const usuario = getCurrentTeamUser()
  return {
    usuario,
    podeAdministrar: canAdministerPortal(usuario),
    podeGerenciarPermissoes: canManagePermissions(usuario),
  }
}

/** Acesso do usuário logado, atualizado quando a sessão ou as permissões mudam. */
export function useTeamAccess(): TeamAccess {
  const [acesso, setAcesso] = useState(lerAcesso)

  useEffect(() => {
    function atualizar() {
      setAcesso(lerAcesso())
    }
    window.addEventListener(EVENTO, atualizar)
    window.addEventListener('planAssisteSessionUpdated', atualizar)
    window.addEventListener('storage', atualizar)
    return () => {
      window.removeEventListener(EVENTO, atualizar)
      window.removeEventListener('planAssisteSessionUpdated', atualizar)
      window.removeEventListener('storage', atualizar)
    }
  }, [])

  return acesso
}
