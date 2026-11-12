# Cooperativa

Branch: `feat/frontend-cooperativa`. Base: `feat/frontend-foundation`.

UI scaffolds only; no HTTP requests, authenticated session or persisted data.
Inherited loading/error/template conventions live in `app/(workspace)/`.

| Backend                                                           | Next.js page                                                         | Permission               | DTO                        |
| ----------------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------ | -------------------------- |
| `GET /cooperativa/vendas-conjuntas`                               | `/cooperativa/vendas-conjuntas`                                      | `mercado:consultar`      | `FiltroVendasConjuntasDto` |
| `POST /cooperativa/vendas-conjuntas`                              | `/cooperativa/vendas-conjuntas/novo`                                 | `cooperativa:participar` | `CriarVendaDto`            |
| `GET /cooperativa/vendas-conjuntas/:id`                           | `/cooperativa/vendas-conjuntas/[id]`                                 | `mercado:consultar`      | `—`                        |
| `POST /cooperativa/vendas-conjuntas/:id/contribuicoes`            | `/cooperativa/vendas-conjuntas/[id]/contribuicoes`                   | `cooperativa:participar` | `ContribuirDto`            |
| `PATCH /cooperativa/vendas-conjuntas/:id/contribuicoes/:ordemId`  | `/cooperativa/vendas-conjuntas/[id]/contribuicoes/[ordemId]/editar`  | `cooperativa:participar` | `AlterarContribuicaoDto`   |
| `DELETE /cooperativa/vendas-conjuntas/:id/contribuicoes/:ordemId` | `/cooperativa/vendas-conjuntas/[id]/contribuicoes/[ordemId]/excluir` | `cooperativa:participar` | `—`                        |
| `POST /cooperativa/vendas-conjuntas/:id/distribuir`               | `/cooperativa/vendas-conjuntas/[id]/distribuir`                      | `cooperativa:distribuir` | `—`                        |
| `GET /cooperativa/extrato`                                        | `/cooperativa/extrato`                                               | `mercado:consultar`      | `FiltroTransacoesDto`      |

`definition.ts` preserves the controller contract and DTO fields; `ResourceScreen`
composes the shared primitives. The backend remains authoritative for all
validation and permission checks. Mutations require an `onSubmit` handler in a
future integration pass. No unsupported CRUD operations are added.
