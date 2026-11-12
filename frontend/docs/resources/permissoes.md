# Permissões

Branch: `feat/frontend-permissoes`. Base: `feat/frontend-foundation`.

UI scaffolds only; no HTTP requests, authenticated session or persisted data.
Inherited loading/error/template conventions live in `app/(workspace)/`.

| Backend                  | Next.js page               | Permission              | DTO                  |
| ------------------------ | -------------------------- | ----------------------- | -------------------- |
| `POST /permissoes`       | `/permissoes/novo`         | `permissoes:criar`      | `CreatePermissaoDto` |
| `GET /permissoes`        | `/permissoes`              | `permissoes:listar`     | `FilterPermissaoDto` |
| `GET /permissoes/:id`    | `/permissoes/[id]`         | `permissoes:visualizar` | `—`                  |
| `PATCH /permissoes/:id`  | `/permissoes/[id]/editar`  | `permissoes:editar`     | `UpdatePermissaoDto` |
| `DELETE /permissoes/:id` | `/permissoes/[id]/excluir` | `permissoes:deletar`    | `—`                  |

`definition.ts` preserves the controller contract and DTO fields; `ResourceScreen`
composes the shared primitives. The backend remains authoritative for all
validation and permission checks. Mutations require an `onSubmit` handler in a
future integration pass. No unsupported CRUD operations are added.
