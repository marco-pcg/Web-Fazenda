# Turmas

Branch: `feat/frontend-turmas`. Base: `feat/frontend-foundation`.

UI scaffolds only; no HTTP requests, authenticated session or persisted data.
Inherited loading/error/template conventions live in `app/(workspace)/`.

| Backend                   | Next.js page           | Permission          | DTO                 |
| ------------------------- | ---------------------- | ------------------- | ------------------- |
| `POST /turmas`            | `/turmas/novo`         | `turmas:criar`      | `CreateTurmaDto`    |
| `GET /turmas`             | `/turmas`              | `turmas:listar`     | `FilterTurmaDto`    |
| `GET /turmas/:id`         | `/turmas/[id]`         | `turmas:visualizar` | `—`                 |
| `PATCH /turmas/:id`       | `/turmas/[id]/editar`  | `turmas:editar`     | `UpdateTurmaDto`    |
| `DELETE /turmas/:id`      | `/turmas/[id]/excluir` | `turmas:deletar`    | `—`                 |
| `POST /turmas/:id/alunos` | `/turmas/[id]/alunos`  | `turmas:editar`     | `AdicionarAlunoDto` |

`definition.ts` preserves the controller contract and DTO fields; `ResourceScreen`
composes the shared primitives. The backend remains authoritative for all
validation and permission checks. Mutations require an `onSubmit` handler in a
future integration pass. No unsupported CRUD operations are added.
