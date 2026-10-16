import { useState } from 'react'
import { ChevronLeft, ChevronRight, Search, ShieldCheck, ShieldOff } from 'lucide-react'
import { RestrictedAreaPageFrame, type PublicPageProps } from './PublicPages'
import {
  TEAM_USERS,
  canAdministerPortal,
  changePortalAdminAccess,
  getCurrentGrant,
  getPortalAdminGrants,
  getPortalAdminLog,
  getTeamUser,
  searchTeamUsers,
  useTeamAccess,
  type AcaoDePermissao,
  type RegistroDePermissao,
  type TeamUser,
} from '../utils/teamAccess'

type Confirmacao = { usuario: TeamUser, acao: AcaoDePermissao }
type Aviso = { tipo: 'sucesso' | 'erro', texto: string }

const REGISTROS_POR_PAGINA = 10
const formatoDataHora = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' })

function normalizar(texto: string) {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
}

function descreverUsuario(id: string) {
  const usuario = getTeamUser(id)
  return usuario ? `${usuario.nome} (matrícula ${usuario.matricula})` : 'Usuário não identificado'
}

function mensagemDeSucesso({ usuario, acao }: Confirmacao) {
  return acao === 'concedida'
    ? `Acesso à Administração do Portal concedido a ${usuario.nome}.`
    : `Acesso à Administração do Portal revogado de ${usuario.nome}.`
}

/** Busca no registro por nome ou matrícula de quem foi autorizado ou de quem autorizou, e pela ação. */
function filtrarRegistro(registro: RegistroDePermissao[], termo: string) {
  const valor = normalizar(termo)
  if (!valor) return registro
  return registro.filter((item) => {
    const acao = item.acao === 'concedida' ? 'acesso concedido' : 'acesso revogado'
    return normalizar(`${descreverUsuario(item.usuarioId)} ${descreverUsuario(item.autorizadoPorId)} ${acao}`).includes(valor)
  })
}

export function PortalAdminPermissionsPage({ loggedIn, onLogout }: PublicPageProps) {
  // O hook rele sessao e permissoes a cada alteracao, o que atualiza as tabelas.
  const { usuario: gerente } = useTeamAccess()
  const [confirmacao, setConfirmacao] = useState<Confirmacao | null>(null)
  const [aviso, setAviso] = useState<Aviso | null>(null)

  const concedidos = getPortalAdminGrants()
  const registro = getPortalAdminLog()
  const autorizados = TEAM_USERS
    .filter((usuario) => !usuario.gerente && concedidos.includes(usuario.id))
    .sort((primeiro, segundo) => primeiro.nome.localeCompare(segundo.nome, 'pt-BR'))

  function pedirConfirmacao(usuario: TeamUser, acao: AcaoDePermissao) {
    setAviso(null)
    setConfirmacao({ usuario, acao })
  }

  function confirmar() {
    if (!confirmacao || !gerente) return
    try {
      changePortalAdminAccess(gerente, confirmacao.usuario.id, confirmacao.acao)
      setAviso({ tipo: 'sucesso', texto: mensagemDeSucesso(confirmacao) })
    } catch (erro) {
      setAviso({ tipo: 'erro', texto: erro instanceof Error ? erro.message : 'Não foi possível alterar a permissão.' })
    }
    setConfirmacao(null)
  }

  return (
    <RestrictedAreaPageFrame area="team" breadcrumb="Permissão Administração Portal" loggedIn={loggedIn} onLogout={onLogout}>
      <section className="simple-page-heading provider-dashboard-heading">
        <div>
          <h1>Permissão Administração Portal</h1>
          <p>Autorize quais membros da equipe podem acessar a Administração do Portal. Gerentes têm acesso automático.</p>
        </div>
      </section>

      <div role="status" aria-live="polite">
        {aviso && <p className={`permissoes-aviso permissoes-aviso-${aviso.tipo}`}>{aviso.texto}</p>}
      </div>

      <ConcederAcesso concedidos={concedidos} onConceder={(usuario) => pedirConfirmacao(usuario, 'concedida')} />

      <section className="permissoes-secao" aria-labelledby="permissoes-autorizados-titulo">
        <h2 id="permissoes-autorizados-titulo">Usuários com acesso</h2>
        <p className="permissoes-secao-descricao">Membros autorizados a acessar a Administração do Portal. Os gerentes não aparecem aqui porque têm acesso automático.</p>
        <div className="permissoes-tabela-wrap">
          <table className="permissoes-tabela" aria-labelledby="permissoes-autorizados-titulo">
            <thead>
              <tr>
                <th scope="col">Nome</th>
                <th scope="col">Matrícula</th>
                <th scope="col">Cargo e lotação</th>
                <th scope="col">Autorizado em</th>
                <th scope="col">Autorizado por</th>
                <th scope="col"><span className="sr-only">Ação</span></th>
              </tr>
            </thead>
            <tbody>
              {autorizados.length === 0 && (
                <tr><td colSpan={6} className="permissoes-vazio">Nenhum membro autorizado no momento.</td></tr>
              )}
              {autorizados.map((usuario) => {
                const concessao = getCurrentGrant(usuario.id, registro)
                return (
                  <tr key={usuario.id}>
                    <th scope="row">{usuario.nome}</th>
                    <td>{usuario.matricula}</td>
                    <td>{usuario.cargo}<br /><small>{usuario.lotacao}</small></td>
                    <td>{concessao ? formatoDataHora.format(new Date(concessao.data)) : '—'}</td>
                    <td>{concessao ? getTeamUser(concessao.autorizadoPorId)?.nome ?? '—' : '—'}</td>
                    <td className="permissoes-acao">
                      <button type="button" className="secondary-button" onClick={() => pedirConfirmacao(usuario, 'revogada')}>
                        <ShieldOff aria-hidden="true" /> Revogar acesso
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      <RegistroDeAutorizacoes registro={registro} />

      {confirmacao && (
        <ConfirmacaoDePermissao
          confirmacao={confirmacao}
          onConfirmar={confirmar}
          onCancelar={() => setConfirmacao(null)}
        />
      )}
    </RestrictedAreaPageFrame>
  )
}

/** Busca de usuários para conceder acesso. Mostra resultados só depois que algo é digitado. */
function ConcederAcesso({ concedidos, onConceder }: {
  concedidos: string[]
  onConceder: (usuario: TeamUser) => void
}) {
  const [busca, setBusca] = useState('')
  const termo = busca.trim()
  const encontrados = termo ? searchTeamUsers(termo) : []

  return (
    <section className="permissoes-secao" aria-labelledby="permissoes-conceder-titulo">
      <h2 id="permissoes-conceder-titulo">Conceder acesso</h2>
      <p className="permissoes-secao-descricao">Pesquise o membro da equipe por nome ou matrícula e conceda o acesso.</p>
      <label className="permissoes-busca">
        <span>Pesquisar por nome ou matrícula</span>
        <span className="permissoes-busca-campo">
          <Search aria-hidden="true" />
          <input
            type="search"
            value={busca}
            onChange={(evento) => setBusca(evento.target.value)}
            placeholder="Digite o nome ou a matrícula"
          />
        </span>
      </label>

      {termo && (
        <ul className="permissoes-resultados" aria-label="Resultados da pesquisa">
          {encontrados.length === 0 && <li className="permissoes-vazio">Nenhum usuário encontrado para “{termo}”.</li>}
          {encontrados.map((usuario) => (
            <ResultadoDaBusca
              key={usuario.id}
              usuario={usuario}
              temAcesso={canAdministerPortal(usuario, concedidos)}
              onConceder={() => onConceder(usuario)}
            />
          ))}
        </ul>
      )}
    </section>
  )
}

function ResultadoDaBusca({ usuario, temAcesso, onConceder }: {
  usuario: TeamUser
  temAcesso: boolean
  onConceder: () => void
}) {
  let situacao = null
  if (usuario.gerente) situacao = <span className="permissoes-selo permissoes-selo-gerente">Gerente — acesso automático</span>
  else if (temAcesso) situacao = <span className="permissoes-selo permissoes-selo-concedida">Já tem acesso</span>

  return (
    <li className="permissoes-resultado">
      <div>
        <strong>{usuario.nome}</strong>
        <small>Matrícula {usuario.matricula} · {usuario.cargo} · {usuario.lotacao}</small>
      </div>
      {situacao ?? (
        <button type="button" className="primary-button" onClick={onConceder}>
          <ShieldCheck aria-hidden="true" /> Conceder acesso
        </button>
      )}
    </li>
  )
}

function RegistroDeAutorizacoes({ registro }: { registro: RegistroDePermissao[] }) {
  const [busca, setBusca] = useState('')
  const [pagina, setPagina] = useState(1)

  const filtrados = filtrarRegistro(registro, busca)
  const totalDePaginas = Math.max(1, Math.ceil(filtrados.length / REGISTROS_POR_PAGINA))
  const paginaAtual = Math.min(pagina, totalDePaginas)
  const inicio = (paginaAtual - 1) * REGISTROS_POR_PAGINA
  const visiveis = filtrados.slice(inicio, inicio + REGISTROS_POR_PAGINA)

  return (
    <section className="permissoes-secao" aria-labelledby="permissoes-registro-titulo">
      <div className="permissoes-secao-cabecalho">
        <div>
          <h2 id="permissoes-registro-titulo">Registro de autorizações</h2>
          <p className="permissoes-secao-descricao">Quem concedeu ou revogou acesso, para quem e quando. Os mais recentes aparecem primeiro.</p>
        </div>
        <label className="permissoes-busca">
          <span>Pesquisar no registro</span>
          <span className="permissoes-busca-campo">
            <Search aria-hidden="true" />
            <input
              type="search"
              value={busca}
              onChange={(evento) => { setBusca(evento.target.value); setPagina(1) }}
              placeholder="Nome, matrícula ou ação"
            />
          </span>
        </label>
      </div>

      <div className="permissoes-tabela-wrap">
        <table className="permissoes-tabela" aria-labelledby="permissoes-registro-titulo">
          <thead>
            <tr>
              <th scope="col">Data e hora</th>
              <th scope="col">Ação</th>
              <th scope="col">Usuário autorizado</th>
              <th scope="col">Autorizado por</th>
            </tr>
          </thead>
          <tbody>
            {visiveis.length === 0 && (
              <tr>
                <td colSpan={4} className="permissoes-vazio">
                  {busca.trim() ? `Nenhum registro encontrado para “${busca.trim()}”.` : 'Nenhuma autorização registrada.'}
                </td>
              </tr>
            )}
            {visiveis.map((item) => (
              <tr key={item.id}>
                <td>{formatoDataHora.format(new Date(item.data))}</td>
                <td>
                  <span className={`permissoes-selo permissoes-selo-${item.acao}`}>
                    {item.acao === 'concedida' ? 'Acesso concedido' : 'Acesso revogado'}
                  </span>
                </td>
                <td>{descreverUsuario(item.usuarioId)}</td>
                <td>{descreverUsuario(item.autorizadoPorId)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtrados.length > 0 && (
        <p className="permissoes-contagem">
          Mostrando {inicio + 1}–{inicio + visiveis.length} de {filtrados.length} {filtrados.length === 1 ? 'registro' : 'registros'}
        </p>
      )}
      {totalDePaginas > 1 && (
        <nav className="provider-pagination services-pagination" aria-label="Paginação do registro de autorizações">
          <button type="button" disabled={paginaAtual === 1} onClick={() => setPagina(paginaAtual - 1)}>
            <ChevronLeft aria-hidden="true" /> Anterior
          </button>
          {Array.from({ length: totalDePaginas }, (_, indice) => indice + 1).map((numero) => (
            <button
              type="button"
              key={numero}
              className={paginaAtual === numero ? 'selected' : ''}
              aria-current={paginaAtual === numero ? 'page' : undefined}
              onClick={() => setPagina(numero)}
            >
              {numero}
            </button>
          ))}
          <button type="button" disabled={paginaAtual === totalDePaginas} onClick={() => setPagina(paginaAtual + 1)}>
            Próxima <ChevronRight aria-hidden="true" />
          </button>
        </nav>
      )}
    </section>
  )
}

function ConfirmacaoDePermissao({ confirmacao, onConfirmar, onCancelar }: {
  confirmacao: Confirmacao
  onConfirmar: () => void
  onCancelar: () => void
}) {
  const { usuario, acao } = confirmacao
  const concedendo = acao === 'concedida'

  return (
    <div className="permissoes-modal-fundo" role="presentation">
      <section
        className="permissoes-modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="permissoes-modal-titulo"
        aria-describedby="permissoes-modal-texto"
        onKeyDown={(evento) => { if (evento.key === 'Escape') onCancelar() }}
      >
        <h2 id="permissoes-modal-titulo">{concedendo ? 'Conceder acesso' : 'Revogar acesso'}</h2>
        <p id="permissoes-modal-texto">
          {concedendo
            ? `Conceder a ${usuario.nome} (matrícula ${usuario.matricula}) acesso à Administração do Portal?`
            : `Revogar o acesso de ${usuario.nome} (matrícula ${usuario.matricula}) à Administração do Portal?`}
        </p>
        <p className="permissoes-modal-nota">A alteração fica registrada com o seu nome, a data e a hora.</p>
        <div className="permissoes-modal-acoes">
          <button type="button" className="secondary-button" onClick={onCancelar}>Cancelar</button>
          <button type="button" className="primary-button" onClick={onConfirmar} autoFocus>
            {concedendo ? 'Conceder acesso' : 'Revogar acesso'}
          </button>
        </div>
      </section>
    </div>
  )
}
