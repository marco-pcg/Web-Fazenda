# Estações

Branch: `feat/frontend-estacoes`. Base: `feat/frontend-foundation`.

UI scaffolds only; no HTTP requests, authenticated session or persisted data.
Inherited loading/error/template conventions live in `app/(workspace)/`.

| Backend          | Next.js page     | Permission        | DTO                |
| ---------------- | ---------------- | ----------------- | ------------------ |
| `GET /estacoes`  | `/estacoes`      | `estacoes:listar` | `QueryEstacaoDto`  |
| `POST /estacoes` | `/estacoes/novo` | `estacoes:criar`  | `CreateEstacaoDto` |

`definition.ts` preserves the controller contract and DTO fields; `ResourceScreen`
composes the shared primitives. The backend remains authoritative for all
validation and permission checks. Mutations require an `onSubmit` handler in a
future integration pass. No unsupported CRUD operations are added.
