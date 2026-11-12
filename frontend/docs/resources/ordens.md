# Ordens

Branch: `feat/frontend-ordens`. Base: `feat/frontend-foundation`.

UI scaffolds only; no HTTP requests, authenticated session or persisted data.
Inherited loading/error/template conventions live in `app/(workspace)/`.

| Backend                      | Next.js page            | Permission          | DTO               |
| ---------------------------- | ----------------------- | ------------------- | ----------------- |
| `GET /ordens`                | `/ordens`               | `mercado:consultar` | `FiltroOrdensDto` |
| `POST /ordens/venda`         | `/ordens/venda`         | `mercado:vender`    | `CriarVendaDto`   |
| `POST /ordens/compra`        | `/ordens/compra`        | `mercado:comprar`   | `ComprarDto`      |
| `GET /ordens/:id`            | `/ordens/[id]`          | `mercado:consultar` | `—`               |
| `PATCH /ordens/:id/cancelar` | `/ordens/[id]/cancelar` | `mercado:vender`    | `—`               |

`definition.ts` preserves the controller contract and DTO fields; `ResourceScreen`
composes the shared primitives. The backend remains authoritative for all
validation and permission checks. Mutations require an `onSubmit` handler in a
future integration pass. No unsupported CRUD operations are added.
