# Repository Structure

## Folder Structure

```text
src/
├── app/                          # Next.js App Router — routing & layout composition only
│   ├── (auth)/
│   ├── (portal)/
│   ├── layout.tsx
│   └── globals.css
│
├── features/                     # Business-capability modules
│   ├── auth/
│   ├── tenants/
│   ├── subscriptions/
│   ├── plans/
│   ├── admins/
│   ├── policies/
│   ├── audit-logs/
│   └── dashboard/
│
├── components/                   # Shared, feature-agnostic UI building blocks
│   ├── ui/                       # shadcn/ui primitives (Button, Card, Dialog, ...)
│   ├── form/                     # RHF field wrappers
│   ├── table/                    # Table shell + shared cell renderers
│   └── layout/                   # Sidebar, TopBar, Breadcrumb, PageHeader
│
├── hooks/                        # Cross-feature generic hooks
│
├── lib/                          # Framework-adjacent infrastructure
│   ├── api/                      # API client, result wrapper, middleware, error messages
│   ├── validation/               # Shared Zod primitives
│   └── utils/                    # cn(), date/currency formatting
│
├── providers/                    # App-wide context providers
│
├── types/                        # Generated + global ambient types
│   ├── api.generated.ts          # openapi-typescript output — DO NOT hand-edit
│   └── global.d.ts
│
├── constants/                    # Enums/maps shared across features
│   ├── permissions.ts
│   └── routes.ts
│
├── services/                     # Thin API service layer
│
├── stores/                       # Cross-feature UI-only Zustand stores (rare)
│
└── tests/                        # Shared test utilities, MSW handlers, fixtures
    ├── msw/
    ├── fixtures/
    └── test-utils.tsx
```

## Responsibility of Every Folder

### `app/`

- Contains Next.js route segments, layouts, and route-level error boundaries.
- Composes feature components into pages.
- `(auth)` layout is minimal and has no sidebar/topbar.
- `(portal)` layout includes Sidebar, TopBar, AuthGuard, and PermissionProvider.
- Does not contain business logic, data fetching hooks, or direct service calls.

### `features/<feature>/`

- Owns a single business capability.
- Subfolders:
  - `components/` — feature-specific React components (tables, forms, modals, pages).
  - `hooks/` — feature-specific TanStack Query and custom hooks, plus `query-keys.ts`.
  - `schemas/` — feature Zod schemas.
  - `mappers/` — API-to-view-model and view-model-to-API mappers.
  - `utils/` — pure helper functions for the feature.
  - `stores/` — feature-scoped Zustand stores for UI-only state.
  - `providers/` — feature-specific context providers.
  - `types/` — feature-local type aliases and extensions.

### `components/`

- `ui/` — shadcn/ui primitives copied into the repo.
- `form/` — shared RHF-controlled wrappers (`FormTextField`, `FormSelectField`, etc.).
- `table/` — `DataTable`, `StatusBadgeCell`, `RowActionsMenu`, `TableAggregateFooter`.
- `layout/` — `Sidebar`, `TopBar`, `Breadcrumb`, `PageHeader`.
- Must remain feature-agnostic. Must not import `features/` or `services/`.

### `hooks/`

- Cross-feature generic hooks such as `use-debounce`, `use-unsaved-changes-guard`, `use-media-query`.
- Must not contain feature-specific logic.

### `lib/`

- `api/` — `client.ts`, `result.ts`, `auth-middleware.ts`, `error-messages.ts`, `csrf-middleware.ts`, `request-id-middleware.ts`.
- `validation/` — shared Zod primitive schemas.
- `utils/` — pure utilities (`cn`, date/currency formatting).
- No business logic. No React hooks in `lib/api/`.

### `providers/`

- App-wide context providers: `query-provider.tsx`, `theme-provider.tsx`, `toast-provider.tsx`.
- Composed once in `app/layout.tsx`.

### `types/`

- `api.generated.ts` — generated OpenAPI types. Committed. Regenerated via `pnpm openapi:types`.
- `global.d.ts` — ambient types.

### `constants/`

- `permissions.ts` — `Module` and `Action` unions, permission constants.
- `routes.ts` — centralized route path builders.

### `services/`

- One file per domain: `tenants.service.ts`, `subscriptions.service.ts`, etc.
- The only place that imports `rawClient` from `lib/api/client.ts`.
- Exports typed service functions and re-exports relevant generated component types.
- Pure async functions; no React hooks.

### `stores/`

- Cross-feature UI-only Zustand stores (e.g., `ui-panel-store.ts`).
- Rare; prefer feature-scoped stores under `features/<feature>/stores/`.

### `tests/`

- Shared MSW handlers, fixtures, and `AppTestProviders` wrapper.

## Import Boundaries

| Folder | May Import From | Must Not Import From |
|---|---|---|
| `app/` | `features/*`, `components/*`, `providers/*`, `lib/*` | `services/*` directly |
| `features/<feature>/` | `components/*`, `hooks/*`, `lib/*`, `services/<own>.service.ts`, `constants/*`, `types/*` | other `features/*` internals |
| `components/*` | `lib/*`, `types/*` | `features/*`, `services/*` |
| `services/*` | `lib/api/*`, `types/*` | `features/*`, React hooks |
| `features/<feature>/stores/` | `lib/*`, `types/*` | `services/*` directly |

- Boundaries are enforced by `eslint-plugin-boundaries`.
- Violations fail CI.

## Feature Module Layout

- Each feature is a self-contained folder under `src/features/`.
- A feature should be deletable by deleting its folder without breaking unrelated code.
- Route pages import feature components but do not contain feature logic.
- Feature hooks live next to the components that use them.
- Feature mappers explicitly convert `snake_case` API shapes to camelCase view models before components consume them.
- Feature stores hold only UI-only state (modals, drafts, wizard steps, panel state). They never cache server data.

## Shared Module Rules

- Shared modules (`components/`, `hooks/`, `lib/`, `providers/`, `constants/`, `types/`) must stay generic and reusable.
- Shared components must accept props and callbacks; they must not reach into feature stores or services.
- Shared hooks must accept arguments and return values; they must not call feature-specific services.
- Shared utilities must be pure unless their purpose is explicitly side-effectful (e.g., API middleware).
- Cross-feature reuse goes through shared modules, never through direct feature-to-feature imports.
