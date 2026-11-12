# Endpoint feature branches

All feature branches start at `feat/frontend-foundation` (`97f751c`).
Merge the foundation first, then any desired resource branch. The independent
resource branches do not depend on one another. `feat/frontend-endpoint-scaffolds`
collects all resources and adds the home-page directory plus integration checks.
The original `main` branch is unchanged.

83 backend HTTP routes are represented by 83 endpoint pages across 23 resources,
plus landing pages for resources without a root GET route. All pages are
component scaffolds; API integration and the final design system remain pending.

| Resource                                   | Branch                      | Entry page     | HTTP routes |
| ------------------------------------------ | --------------------------- | -------------- | ----------- |
| [health](resources/saude.md)               | `feat/frontend-saude`       | `/saude`       | 1           |
| [Auth](resources/auth.md)                  | `feat/frontend-auth`        | `/auth`        | 3           |
| [Colheitas](resources/colheitas.md)        | `feat/frontend-colheitas`   | `/colheitas`   | 2           |
| [Culturas](resources/culturas.md)          | `feat/frontend-culturas`    | `/culturas`    | 5           |
| [Espécies](resources/especies.md)          | `feat/frontend-especies`    | `/especies`    | 3           |
| [Estações](resources/estacoes.md)          | `feat/frontend-estacoes`    | `/estacoes`    | 2           |
| [Eventos climáticos](resources/eventos.md) | `feat/frontend-eventos`     | `/eventos`     | 3           |
| [Produções](resources/producoes.md)        | `feat/frontend-producoes`   | `/producoes`   | 1           |
| [Rebanhos](resources/rebanhos.md)          | `feat/frontend-rebanhos`    | `/rebanhos`    | 3           |
| [Temporadas](resources/temporadas.md)      | `feat/frontend-temporadas`  | `/temporadas`  | 3           |
| [Fazendas](resources/fazendas.md)          | `feat/frontend-fazendas`    | `/fazendas`    | 5           |
| [Cooperativa](resources/cooperativa.md)    | `feat/frontend-cooperativa` | `/cooperativa` | 8           |
| [Cotações](resources/cotacoes.md)          | `feat/frontend-cotacoes`    | `/cotacoes`    | 2           |
| [Estoque](resources/estoque.md)            | `feat/frontend-estoque`     | `/estoque`     | 1           |
| [Ordens](resources/ordens.md)              | `feat/frontend-ordens`      | `/ordens`      | 5           |
| [Produtos](resources/produtos.md)          | `feat/frontend-produtos`    | `/produtos`    | 3           |
| [Transações](resources/transacoes.md)      | `feat/frontend-transacoes`  | `/transacoes`  | 1           |
| [Perfis](resources/perfis.md)              | `feat/frontend-perfis`      | `/perfis`      | 6           |
| [Permissões](resources/permissoes.md)      | `feat/frontend-permissoes`  | `/permissoes`  | 5           |
| [Plantios](resources/plantios.md)          | `feat/frontend-plantios`    | `/plantios`    | 4           |
| [Talhões](resources/talhoes.md)            | `feat/frontend-talhoes`     | `/talhoes`     | 5           |
| [Turmas](resources/turmas.md)              | `feat/frontend-turmas`      | `/turmas`      | 6           |
| [Usuários](resources/usuarios.md)          | `feat/frontend-usuarios`    | `/usuarios`    | 6           |

A static route such as `/cooperativa/vendas-conjuntas/novo` is used for creation;
`[id]` and `[ordemId]` segments are awaited server-side. Edit/delete and special
actions are separate pages. Only operations present in backend controllers are
represented. The ID lookup form in each layout opens dynamic routes without
requiring fake records. All documentation links point to the per-resource mapping.

Verification: each feature was type-checked alone; the combined branch runs
`npm run check` and checks route coverage against the audited controller snapshot.
