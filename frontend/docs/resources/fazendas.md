# Fazendas

Branch: `feat/frontend-fazendas`. Base: `feat/frontend-foundation`.

UI scaffolds only; no HTTP requests, authenticated session or persisted data.
Inherited loading/error/template conventions live in `app/(workspace)/`.

| Backend                | Next.js page             | Permission            | DTO                |
| ---------------------- | ------------------------ | --------------------- | ------------------ |
| `POST /fazendas`       | `/fazendas/novo`         | `fazendas:criar`      | `CreateFazendaDto` |
| `GET /fazendas`        | `/fazendas`              | `fazendas:listar`     | `FiltroFazendaDto` |
| `GET /fazendas/:id`    | `/fazendas/[id]`         | `fazendas:visualizar` | `—`                |
| `PATCH /fazendas/:id`  | `/fazendas/[id]/editar`  | `fazendas:editar`     | `UpdateFazendaDto` |
| `DELETE /fazendas/:id` | `/fazendas/[id]/excluir` | `fazendas:deletar`    | `—`                |

`definition.ts` preserves the controller contract and DTO fields; `ResourceScreen`
composes the shared primitives. The backend remains authoritative for all
validation and permission checks. Mutations require an `onSubmit` handler in a
future integration pass. No unsupported CRUD operations are added.
