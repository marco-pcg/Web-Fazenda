# Talhões

Branch: `feat/frontend-talhoes`. Base: `feat/frontend-foundation`.

UI scaffolds only; no HTTP requests, authenticated session or persisted data.
Inherited loading/error/template conventions live in `app/(workspace)/`.

| Backend               | Next.js page            | Permission           | DTO               |
| --------------------- | ----------------------- | -------------------- | ----------------- |
| `POST /talhoes`       | `/talhoes/novo`         | `talhoes:criar`      | `CreateTalhaoDto` |
| `GET /talhoes`        | `/talhoes`              | `talhoes:listar`     | `FiltroTalhaoDto` |
| `GET /talhoes/:id`    | `/talhoes/[id]`         | `talhoes:visualizar` | `—`               |
| `PATCH /talhoes/:id`  | `/talhoes/[id]/editar`  | `talhoes:editar`     | `UpdateTalhaoDto` |
| `DELETE /talhoes/:id` | `/talhoes/[id]/excluir` | `talhoes:deletar`    | `—`               |

`definition.ts` preserves the controller contract and DTO fields; `ResourceScreen`
composes the shared primitives. The backend remains authoritative for all
validation and permission checks. Mutations require an `onSubmit` handler in a
future integration pass. No unsupported CRUD operations are added.
