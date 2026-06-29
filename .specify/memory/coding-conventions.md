# Coding Conventions

## General Priorities

Correctness → Readability → Testability → Observability → Performance.
No premature optimization. No clever abstractions.

## Naming Conventions

| Artifact | Convention | Example |
|---|---|---|
| Component file | `kebab-case.tsx` | `tenant-table.tsx` |
| Exported component | `PascalCase` | `TenantTable` |
| Hook file | `kebab-case.ts` | `use-create-tenant.ts` |
| Exported hook | `camelCase` starting with `use` | `useCreateTenant` |
| Service file | `<resource>.service.ts` | `tenants.service.ts` |
| Service object | `camelCase` | `tenantsService` |
| Schema file | `<form-name>.schema.ts` | `create-tenant.schema.ts` |
| Exported schema | `camelCase` | `createTenantSchema` |
| Store file | `<feature>-store.ts` | `auth-store.ts` |
| Exported store hook | `camelCase` starting with `use` | `useAuthStore` |
| Type / interface | `PascalCase` | `Tenant`, `CreateTenantPayload` |
| Constant | `UPPER_SNAKE_CASE` | `MAX_PAGE_SIZE` |
| Config object | `camelCase` | `defaultTenantFilters` |
| Utility file | `kebab-case.ts` | `usage-meter-color.ts` |
| Exported utility | `camelCase` | `usageMeterColor` |

No `I` or `T` Hungarian prefixes on types.

## File Naming

- React components: `kebab-case.tsx`.
- Custom hooks: `use-kebab-case.ts`.
- Services: `<resource>.service.ts`.
- Schemas: `<form>.schema.ts`.
- Stores: `<feature>-store.ts`.
- Utilities: `kebab-case.ts`.
- Test files: co-located `*.test.ts` or `*.test.tsx` next to the file under test.
- Query keys: `query-keys.ts`.
- Column definitions: `<resource>-columns.tsx`.

## Export Conventions

- Use named exports for all components and hooks.
- Use default exports only for Next.js App Router route files (`page.tsx`, `layout.tsx`, `error.tsx`).
- Each file exports one primary component or hook of meaning.
- Re-export types from generated schemas at the service layer when useful.

## Component Conventions

- Define a props interface for every component that accepts props.
- Order inside a component:
  1. Hooks first: state → queries → mutations → derived values → effects.
  2. Early returns for loading/error/unauthorized states.
  3. Render last.
- Server Components fetch only layout chrome and auth/role gating data.
- Interactive widgets (tables, forms, charts, modals) are Client Components.
- Keep components focused. Extract helpers to `utils/` if reused.
- Memoize column definitions and cell renderers in tables.
- Use stable callback references (`useCallback`) for row-level actions.
- Avoid prop drilling; colocate state as close to consumers as possible.

## Hook Conventions

- Custom hooks start with `use`.
- Query hooks return the result of `useQuery` or `useInfiniteQuery`.
- Mutation hooks return the result of `useMutation` and handle cache invalidation.
- Query keys live in `src/features/<feature>/hooks/query-keys.ts`.
- Use structured array keys: `[domain, resourceType, ...identifiers, filters?]`.
- Query hooks accept filter/pagination params and pass them to the service layer.
- Mutation hooks accept payloads and call the service layer.
- `onSuccess` invalidates affected query keys.
- `onError` handles `ApiError` and maps field errors where applicable.
- Never put TanStack Query results into Zustand.

## Service Conventions

- One service object per domain in `src/services/<resource>.service.ts`.
- The service layer is the only importer of `rawClient`.
- Service functions are pure async functions; no React hooks.
- Use the generated OpenAPI path literals (`"/tenants"`, `"/tenants/{id}"`).
- Return unwrapped data via `unwrap()`; throw `ApiError` on errors.
- Export types aliased from `components["schemas"]["..."]` when needed by hooks/components.
- Keep service functions close to the backend contract shape (`snake_case`).

## Store Conventions

- Stores are feature-scoped under `src/features/<feature>/stores/`.
- Cross-feature UI stores are rare and live in `src/stores/`.
- Stores hold only UI-only state (modals, wizard steps, drafts, panel state, sidebar state).
- Stores do not hold server state or fetch logic.
- Auth store holds only the in-memory access token and admin profile; it is not persisted.
- Use `devtools` middleware in development.

## Type Conventions

- `strict: true` plus `noUncheckedIndexedAccess`, `noImplicitOverride`, `exactOptionalPropertyTypes`, `verbatimModuleSyntax`.
- Use path alias `@/*` mapped to `./src/*`.
- Use `consistent-type-imports` for type-only imports.
- No `any`. Use `unknown` + narrowing if a type is genuinely unclear, then fix the source.
- Form value types are inferred from Zod schemas: `z.infer<typeof createTenantSchema>`.
- API types are imported from `src/types/api.generated.ts`.
- View-model types live in feature folders and use camelCase.

## Error Handling Conventions

- Render errors: use Next.js route-segment `error.tsx` boundaries.
- Query fetch failures: render inline `<QueryErrorState />` with retry.
- Mutation failures: catch `ApiError` in `onError`, show toast, and map field errors onto the form.
- Auth failures: auth middleware redirects to `/login?from=<path>` after refresh failure.
- Permission failures: show toast "You don't have permission to do this" or a code-specific message.
- Use `applyServerErrorsToForm` to map `error.details` onto RHF fields.
- Error messages are looked up from `src/lib/api/error-messages.ts`; do not hardcode error strings in components.
- Destructive-action confirmations are modals, never toasts.

## API Conventions

- All API calls go through `src/services/`.
- Attach `Authorization: Bearer <accessToken>` on every authenticated request.
- Attach `X-Request-ID: <uuid-v4>` on every request.
- Attach `X-CSRF-Token` on every state-changing request.
- Responses follow `{ data, meta? }`; errors follow `{ error: { code, message, details } }`.
- Handle `401` with exactly one silent refresh attempt; redirect to `/login` on refresh failure.
- Handle `403` gracefully even when the UI hides the control.
- Handle `409` business-rule errors by mapping field errors or showing a code-specific message.
- Retry network and 5xx errors up to two times for queries. Never retry mutations.
- `refetchOnWindowFocus: true` for portal routes.
- Use `placeholderData: keepPreviousData` on paginated list queries.

## Comment Policy

- Comment why, not what.
- JSDoc every exported hook and service function describing intent and non-obvious business rule references (e.g., `// Per AC-SUB-03`).

## Import Order

1. External dependencies.
2. Internal absolute aliases (`@/`).
3. Relative imports.
