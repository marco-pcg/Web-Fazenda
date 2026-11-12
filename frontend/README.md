# Web Fazenda — frontend

Interface em Next.js, React e TypeScript.

## Desenvolvimento

Use Node.js 24 (a versão usada no CI, definida em `.nvmrc`):

```sh
cd frontend
nvm use
npm ci
npm run dev
```

Abra http://localhost:3000.

## Verificações

Execute todas as verificações antes de enviar alterações:

```sh
npm run check
```

O comando executa, em ordem: ESLint sem avisos, geração dos tipos de rotas e
checagem TypeScript, todos os testes com cobertura e build de produção.
A primeira falha interrompe o comando com código de saída diferente de zero.

Comandos individuais:

| Comando                 | Finalidade                                   |
| ----------------------- | -------------------------------------------- |
| `npm run lint`          | ESLint                                       |
| `npm run typecheck`     | Tipos das rotas Next.js e TypeScript         |
| `npm test`              | Todos os arquivos `*.test.ts` e `*.test.tsx` |
| `npm run test:watch`    | Testes em modo interativo                    |
| `npm run test:coverage` | Testes e relatórios em `coverage/`           |
| `npm run build`         | Build de produção                            |

Os testes usam Vitest, jsdom e React Testing Library. A configuração está em
`vitest.config.mts`; `tests/setup.ts` registra os matchers de DOM e limpa a página
entre os testes. A suíte verifica serialização dos formulários, confirmações, paginação,
permissões de componentes e troca de tema. Não depende do backend.
O relatório HTML pode ser aberto em `coverage/index.html` após rodar a cobertura.

## GitHub Actions

O workflow `.github/workflows/frontend-ci.yml` executa as mesmas verificações
em pushes e pull requests que alterem `frontend/` ou o próprio workflow.
Ele usa Node.js 24, instalação reproduzível com `npm ci`, cache do npm,
permissão de leitura e cancelamento de execuções anteriores da mesma branch/PR.
Os passos separados mostram qual verificação falhou. Também há acionamento
manual em **Actions → Frontend CI → Run workflow** após o workflow estar na
branch padrão.

Para exigir sucesso antes do merge, configure o check **Frontend checks** nas
regras de proteção da branch. O workflow precisa executar primeiro para que o
check possa ser selecionado. Como há filtro por caminho, use essa exigência
somente com uma regra que considere PRs sem alterações no frontend.

O build usa `next/font/google` e precisa acessar o Google Fonts. Este workflow
valida o frontend; deployment automático depende da escolha do provedor e das
credenciais do ambiente.

## Componentes e rotas

A base de componentes usa shadcn/ui, ícones Lucide, Tailwind e next-themes.
Consulte [a estrutura e os limites desta etapa](docs/frontend-foundation.md).
A fonte dos contratos está em `docs/backend-endpoints.json`.
