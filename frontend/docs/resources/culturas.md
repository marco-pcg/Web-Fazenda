# Culturas

Branch: `feat/frontend-culturas`. Base: `feat/frontend-foundation`.

UI scaffolds only; no HTTP requests, authenticated session or persisted data.
Inherited loading/error/template conventions live in `app/(workspace)/`.

| Backend                | Next.js page             | Permission            | DTO                |
| ---------------------- | ------------------------ | --------------------- | ------------------ |
| `POST /culturas`       | `/culturas/novo`         | `culturas:criar`      | `CreateCulturaDto` |
| `GET /culturas`        | `/culturas`              | `culturas:listar`     | `FiltroCulturaDto` |
| `GET /culturas/:id`    | `/culturas/[id]`         | `culturas:visualizar` | `—`                |
| `PATCH /culturas/:id`  | `/culturas/[id]/editar`  | `culturas:editar`     | `UpdateCulturaDto` |
| `DELETE /culturas/:id` | `/culturas/[id]/excluir` | `culturas:deletar`    | `—`                |

`definition.ts` preserves the controller contract and DTO fields; `ResourceScreen`
composes the shared primitives. The backend remains authoritative for all
validation and permission checks. Mutations require an `onSubmit` handler in a
future integration pass. No unsupported CRUD operations are added.
