# Frontend scaffolding

This iteration provides components and App Router structure only. There are no
HTTP calls, saved records, JWT persistence, or working login/logout yet. Pages are
public scaffolds, not protected application routes. Backend guards remain the
security boundary once API integration is implemented.

## Structure

- `components/ui/`: official shadcn/ui source, installed with its CLI; Lucide icons.
- `components/shared/`: `ThemeToggle`, `WorkspaceShell`, `PageHeader`,
  `PaginatedContent`, `RecordTable`, and loading/empty/error states.
- `components/providers/context-provider.tsx`: next-themes plus an in-memory user
  context and `PermissionGate`. It does not authenticate or authorize requests.
- `components/resources/`: reusable forms, endpoint screens and navigation.
- `features/<resource>/`: endpoint contracts and the resource-specific screen.
- `app/(workspace)/<resource>/`: pages, resource layout and inherited template,
  loading, error and not-found conventions. The template resets form state during
  navigation; the root layout preserves the providers.
- `app/globals.css`: replaceable monochrome semantic tokens; layout uses Tailwind
  utility classes. No final visual design or wireframes are assumed.

## Forms and data

`EndpointForm` accepts DTO field metadata, `initialValues` and an async `onSubmit`.
Without that callback it intentionally disables submission and explains that the
operation is unavailable. With a callback it handles native validation, typed
numbers/booleans/arrays, pending/error state and duplicate-submit prevention.
Destructive operations require explicit confirmation. API response handling,
server validation and cache invalidation belong to the later integration pass.
Optional blank fields are omitted, not sent as null or treated as a clear action.
Server DTO validation remains authoritative; these fields are not a full
replacement for class-validator rules.

`PaginatedContent` accepts records, backend-style pagination metadata, rendering,
page change and retry callbacks. It handles loading/error/empty states and prevents
out-of-range navigation. Navigation is disabled until a callback is supplied.
`RecordTable` supplies typed columns and stable row keys without assuming a schema.

Contracts are captured from controller decorators and DTOs, including inherited
pagination fields and `PartialType`/`OmitType`. Regenerate the audited snapshot with:

```sh
cd frontend
node scripts/inspect-backend.mjs
```

Review changes in `docs/backend-endpoints.json` and then update the corresponding
resource definition/pages. The snapshot is development metadata, never a request
handler or a runtime dependency on backend code.

## Branch model

`feat/frontend-foundation` contains shared infrastructure. Each
`feat/frontend-<resource>` branch starts from that foundation and contains only
its resource-specific additions. Merge the foundation before the resource branch.
`feat/frontend-endpoint-scaffolds` collects the features for a complete preview;
it does not modify `main`. See `docs/endpoint-branches.md` on that branch for the
full resource/branch/route mapping.

This is a component scaffolding pass. Integration tests against a running API,
real session management and the supplied design system are separate follow-ups.
