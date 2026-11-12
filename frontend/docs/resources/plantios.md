# Plantios

Branch: `feat/frontend-plantios`. Base: `feat/frontend-foundation`.

UI scaffolds only; no HTTP requests, authenticated session or persisted data.
Inherited loading/error/template conventions live in `app/(workspace)/`.

| Backend                     | Next.js page            | Permission            | DTO                |
| --------------------------- | ----------------------- | --------------------- | ------------------ |
| `POST /plantios`            | `/plantios/novo`        | `plantios:criar`      | `CreatePlantioDto` |
| `GET /plantios`             | `/plantios`             | `plantios:listar`     | `FiltroPlantioDto` |
| `GET /plantios/:id`         | `/plantios/[id]`        | `plantios:visualizar` | `—`                |
| `POST /plantios/:id/colher` | `/plantios/[id]/colher` | `plantios:colher`     | `ColherPlantioDto` |

`definition.ts` preserves the controller contract and DTO fields; `ResourceScreen`
composes the shared primitives. The backend remains authoritative for all
validation and permission checks. Mutations require an `onSubmit` handler in a
future integration pass. No unsupported CRUD operations are added.
