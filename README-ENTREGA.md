# Portal Plan-Assiste — pacote de entrega

Este pacote contém o código-fonte e os ativos necessários para executar, avaliar e dar continuidade ao desenvolvimento do protótipo do Portal Plan-Assiste.

## Requisitos

- Node.js 20.19 ou superior (recomenda-se uma versão LTS atual)
- npm 10 ou superior

## Instalação e execução local

No terminal, dentro desta pasta:

```bash
npm ci
npm run dev
```

O terminal informará o endereço local do portal, normalmente `http://localhost:5173`.

## Validação e build de produção

```bash
npm run lint
npm run build
npm run preview
```

O comando `npm run build` recria a pasta `dist`. Ela não foi incluída nesta entrega porque é um artefato gerado automaticamente.

## Estrutura principal

- `src/`: código-fonte da aplicação React/TypeScript.
- `public/`: documentos, imagens, fontes e demais ativos públicos usados pelo protótipo.
- `scripts/`: rotinas auxiliares, incluindo a geração do catálogo de ativos.
- `package.json` e `package-lock.json`: dependências e comandos do projeto.
- `public/manual-portal.html`: manual visual e de componentes do portal.
- `RELATORIO-CORRECOES-REEMBOLSO-OPME.md`: registro das correções e limitações do protótipo.

## Observações importantes

- O projeto entregue é um protótipo front-end. Dados, autenticação, persistência, uploads, notificações e integrações com sistemas corporativos ainda devem ser conectados aos serviços definitivos.
- Parte dos dados exibidos é simulada localmente para demonstrar fluxos e interfaces.
- Não há credenciais, variáveis de ambiente privadas, histórico Git ou dados pessoais do repositório nesta cópia.
- `node_modules`, `dist`, caches, logs e arquivos temporários foram removidos. As dependências devem ser reinstaladas com `npm ci`.
- Antes da publicação, a equipe responsável deve revisar requisitos de segurança, acessibilidade, LGPD, infraestrutura, APIs, autenticação e regras de negócio.
