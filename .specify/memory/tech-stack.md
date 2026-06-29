# Tech Stack

## Frameworks

- **Framework**: Next.js App Router, 14.x+
- **UI Library**: React, 18.x+
- **Language**: TypeScript, 5.x+ (strict mode)
- **UI Primitives**: shadcn/ui + Radix UI
- **Charts**: Recharts, 2.x+

## Runtime

- Next.js runs on Node.js via the App Router.
- Server Components render layout shells and auth/role gating.
- Client Components hydrate interactive islands.

## State Management

- **Server state**: TanStack Query, 5.x+
- **UI-only state**: Zustand, 4.x+, feature-scoped stores
- **Local component state**: `useState` / `useReducer`
- **URL state**: `useSearchParams` for list view pagination/sort/filter

## Routing

- Next.js App Router file-based routing.
- Route groups: `(auth)` for unauthenticated routes, `(portal)` for authenticated routes.
- URL design: plural nouns for collections, singular dynamic segment for resources, dedicated segment for page actions.
- Transient actions (modals/panels) use query params or Zustand UI state, not dedicated routes.

## Styling

- Tailwind CSS, 3.x+, utility-first.
- Design tokens via Tailwind theme and CSS variables.
- Chart and status colors sourced from CSS variables, not hardcoded hex values.
- shadcn/ui components are copied into `src/components/ui/`, not consumed as an opaque runtime dependency.

## API Strategy

- OpenAPI-first generated client.
- **Types**: `openapi-typescript` generates `src/types/api.generated.ts`.
- **Client**: `openapi-fetch` provides typed `client.GET/POST/PUT/DELETE`.
- Service layer in `src/services/` is the only consumer of `rawClient`.
- Backend uses `snake_case` JSON. Service layer returns exact backend shapes. Feature mappers convert to camelCase view models.
- Contract drift fails CI via `pnpm openapi:check`.

## Authentication

- Access token: JWT, RS256, 15-minute TTL, stored in memory only (Zustand `auth-store`, non-persisted).
- Refresh token: HttpOnly, Secure, SameSite=Strict cookie set by the backend.
- If backend returns refresh token in JSON body, frontend forwards it to a same-origin Next.js Route Handler (`/api/session`) to set the HttpOnly cookie.
- Silent refresh on `401` via `POST /auth/refresh` (deduplicated in-flight promise).
- MFA challenge step is inline on `/login`, not a separate route.
- SSO uses full-page redirect (`window.location.href = '/auth/sso/initiate?provider=saml'`).
- Logout calls `DELETE /auth/session`, clears session, clears TanStack Query cache, and redirects to `/login`.

## Authorization

- Client-side RBAC exists for UX only. Backend is the sole enforcement point.
- Permission matrix: module × action (`can_view`, `can_create`, `can_update`, `can_delete`, `can_approve`, `can_export`).
- Super Admin has full access and immutable permissions.
- Self-protection rules: an admin cannot deactivate/remove/change-role-of themselves.
- `RequirePermission` guards routes; `Can` guards inline controls.
- Every mutation handles `403 PERMISSION_DENIED` and double-gate error codes gracefully.

## Form Handling

- React Hook Form, 7.x+, for every form.
- Multi-section wizards use a single RHF form instance with `FormProvider` and section components consuming `useFormContext`.
- Update forms use `formState.dirtyFields` to compute diff-only payloads.
- Slide-in panels reuse full-page form components and reset RHF state on close.
- Standard controlled wrappers in `src/components/form/` wire RHF, Zod errors, labels, and help text.
- Validation mode is `onBlur` for large forms.

## Validation

- Zod, 3.x+, is the single source of truth for form validation.
- Form value types are inferred from schemas (`z.infer<typeof schema>`).
- Cross-field rules use `.refine()` / `.superRefine()`.
- Async/uniqueness checks are server-authoritative; map `409` responses onto RHF fields via `form.setError`.
- Shared primitives (email, UUID, money, ISO date, password policy) live in `src/lib/validation/primitives.ts`.

## Testing Stack

- **Unit / component**: Vitest + React Testing Library.
- **Integration**: React Testing Library + MSW (Mock Service Worker).
- **E2E**: Playwright.
- **Accessibility**: `eslint-plugin-jsx-a11y`, Playwright + `@axe-core/playwright`.
- **Linting**: ESLint 9.x+ flat config with `eslint-plugin-boundaries`.
- **Formatting**: Prettier 3.x+.
- **Git hooks**: Husky + lint-staged.

## Build Tools

- Next.js build pipeline.
- ESLint flat config enforces architectural boundaries.
- Prettier enforces formatting.
- TypeScript `tsc --noEmit` enforces strict type checking.
- `tsconfig.json`: `strict`, `noUncheckedIndexedAccess`, `noImplicitOverride`, `exactOptionalPropertyTypes`, `verbatimModuleSyntax`.

## Package Manager

- pnpm, 9.x+.
- `--frozen-lockfile` in CI.
- Exact versions for core dependencies; caret ranges permitted only for low-risk tooling.
