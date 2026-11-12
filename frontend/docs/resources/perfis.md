# Perfis

Branch: `feat/frontend-perfis`. Base: `feat/frontend-foundation`.

UI scaffolds only; no HTTP requests, authenticated session or persisted data.
Inherited loading/error/template conventions live in `app/(workspace)/`.

| Backend                        | Next.js page              | Permission          | DTO                     |
| ------------------------------ | ------------------------- | ------------------- | ----------------------- |
| `POST /perfis`                 | `/perfis/novo`            | `perfis:criar`      | `CreatePerfilDto`       |
| `GET /perfis`                  | `/perfis`                 | `perfis:listar`     | `FilterPerfilDto`       |
| `GET /perfis/:id`              | `/perfis/[id]`            | `perfis:visualizar` | `—`                     |
| `PATCH /perfis/:id/permissoes` | `/perfis/[id]/permissoes` | `perfis:editar`     | `VincularPermissoesDto` |
| `PATCH /perfis/:id`            | `/perfis/[id]/editar`     | `perfis:editar`     | `UpdatePerfilDto`       |
| `DELETE /perfis/:id`           | `/perfis/[id]/excluir`    | `perfis:deletar`    | `—`                     |

`definition.ts` preserves the controller contract and DTO fields; `ResourceScreen`
composes the shared primitives. The backend remains authoritative for all
validation and permission checks. Mutations require an `onSubmit` handler in a
future integration pass. No unsupported CRUD operations are added.
