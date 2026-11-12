# Temporadas

Branch: `feat/frontend-temporadas`. Base: `feat/frontend-foundation`.

UI scaffolds only; no HTTP requests, authenticated session or persisted data.
Inherited loading/error/template conventions live in `app/(workspace)/`.

| Backend                        | Next.js page               | Permission           | DTO                  |
| ------------------------------ | -------------------------- | -------------------- | -------------------- |
| `GET /temporadas`              | `/temporadas`              | `temporadas:listar`  | `QueryTemporadaDto`  |
| `POST /temporadas`             | `/temporadas/novo`         | `temporadas:criar`   | `CreateTemporadaDto` |
| `POST /temporadas/:id/avancar` | `/temporadas/[id]/avancar` | `temporadas:avancar` | `—`                  |

`definition.ts` preserves the controller contract and DTO fields; `ResourceScreen`
composes the shared primitives. The backend remains authoritative for all
validation and permission checks. Mutations require an `onSubmit` handler in a
future integration pass. No unsupported CRUD operations are added.
