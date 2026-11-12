# Usuários

Branch: `feat/frontend-usuarios`. Base: `feat/frontend-foundation`.

UI scaffolds only; no HTTP requests, authenticated session or persisted data.
Inherited loading/error/template conventions live in `app/(workspace)/`.

| Backend                      | Next.js page              | Permission            | DTO                |
| ---------------------------- | ------------------------- | --------------------- | ------------------ |
| `POST /usuarios`             | `/usuarios/novo`          | `usuarios:criar`      | `CreateUsuarioDto` |
| `GET /usuarios`              | `/usuarios`               | `usuarios:listar`     | `FilterUsuarioDto` |
| `GET /usuarios/:id`          | `/usuarios/[id]`          | `usuarios:visualizar` | `—`                |
| `GET /usuarios/email/:email` | `/usuarios/email/[email]` | `usuarios:visualizar` | `—`                |
| `PATCH /usuarios/:id`        | `/usuarios/[id]/editar`   | `usuarios:editar`     | `UpdateUsuarioDto` |
| `DELETE /usuarios/:id`       | `/usuarios/[id]/excluir`  | `usuarios:deletar`    | `—`                |

`definition.ts` preserves the controller contract and DTO fields; `ResourceScreen`
composes the shared primitives. The backend remains authoritative for all
validation and permission checks. Mutations require an `onSubmit` handler in a
future integration pass. No unsupported CRUD operations are added.
