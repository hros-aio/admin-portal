# Engineering Constitution

## Source of Truth

- `.specify/memory/frontend-tech-stack.md` is the binding Source of Truth for all frontend work.
- This constitution is binding for engineering governance; agents MUST read both files before implementing.
- If a task conflicts with either document, stop and report the conflict before writing code.
- No silent deviation is permitted. Any exception requires an approved ADR addendum.

## Architecture Principles

- **P1 — Type-safety end-to-end**: No `any`. API contracts flow from OpenAPI → generated types → hooks → components. A backend contract change must surface as a compile error until addressed.
- **P2 — Server is the source of truth for authorization**: Client-side RBAC is UX-only. Every privileged action is enforced server-side; handle `403` gracefully.
- **P3 — Feature-based modularity**: Code is organized by business capability. A feature is deletable by deleting one folder.
- **P4 — Server state and UI state are separate**: TanStack Query owns server state; Zustand owns UI-only state. They are never mixed.
- **P5 — Composition over configuration sprawl**: Prefer small composable hooks/components over mega-components with prop explosion.
- **P6 — Boring, explicit, predictable code**: Correctness > readability > testability > observability > performance. No clever abstractions.
- **P7 — Confirmation-first UX for destructive actions**: Archive, cancel, remove, and similar actions require explicit, typed, or two-step confirmation.
- **P8 — Every non-trivial unit of logic is tested**: Hooks, utilities, components with business logic, and critical journeys require tests.
- **P9 — Optimistic UI only where safe to roll back**: Allowed only for low-risk, easily-reversible mutations. Forbidden for financial/destructive operations.
- **P10 — Single responsibility for files**: One exported component or hook of meaning per file.

## Non-Negotiable Engineering Rules

- All API request/response types are generated from the backend's committed OpenAPI document. Never hand-write API types.
- Access tokens are kept in memory only. Refresh tokens are stored in HttpOnly, Secure, SameSite=Strict cookies set by the backend.
- No token is ever stored in `localStorage` or `sessionStorage`.
- All forms use React Hook Form + Zod.
- All data tables use TanStack Table in manual/server-driven mode.
- All list endpoints use server-side pagination, sorting, and filtering.
- All mutations go through the typed OpenAPI service layer + TanStack Query. Do not use Next.js Server Actions for mutations.
- All state-changing requests attach `Authorization`, `X-Request-ID`, and `X-CSRF-Token` headers.
- `dangerouslySetInnerHTML` is forbidden.
- WCAG 2.1 AA is mandatory for every shipped surface.
- Exact dependency versions are pinned in `package.json` for core stack packages.
- pnpm is the only package manager. `package-lock.json` and `yarn.lock` must not be committed.

## Layer Dependency Rules

- `app/` may import from `features/`, `components/`, `providers/`, and `lib/`.
- `app/` must NOT import `services/` directly. Route data fetching goes through feature hooks.
- `features/<feature>/` may import from `components/`, `hooks/`, `lib/`, `constants/`, `types/`, and its own `services/<feature>.service.ts`.
- `features/<feature>/` must NOT import internals of other `features/<other>/`.
- `components/` may import from `lib/` and `types/`. Must remain feature-agnostic.
- `components/` must NOT import from `features/` or `services/`.
- `services/` may import from `lib/api/*` and `types/`. No React hooks inside services.
- `services/` must NOT import from `features/`.
- Feature-scoped stores under `features/<feature>/stores/` may import from `lib/` and `types/`. They must NOT import `services/` directly.
- Cross-feature UI stores under `src/stores/` are rare; prefer feature-scoped stores.

## Feature Boundary Rules

- Features are business capabilities: `auth`, `tenants`, `subscriptions`, `plans`, `admins`, `policies`, `audit-logs`, `dashboard`.
- Each feature owns its components, hooks, schemas, mappers, utils, stores, and types.
- Shared reuse across features goes through `components/`, `hooks/`, or `lib/`, never through direct feature-to-feature imports.
- A feature's service layer is the only allowed importer of `rawClient` for that domain.
- Feature-level mappers (`src/features/<feature>/mappers/`) explicitly convert `snake_case` API shapes to camelCase view models. This boundary is explicit, never implicit.

## ADR Policy

- Architecture and technology decisions affecting the stack, security model, state management, routing, or major dependencies must be recorded as an ADR.
- Existing ADRs are authoritative: ADR-FE-001 (token storage), ADR-FE-002 (shadcn/ui + Radix), ADR-FE-003 (TanStack Query over Server Actions), ADR-FE-004 (TanStack Table), ADR-FE-005 (Zod validation).
- A new ADR is required before introducing a dependency not on the approved stack, replacing an approved technology, or changing a forbidden practice.
- ADRs must include context, decision, alternatives considered, and consequence.

## Forbidden Practices

- Storing any auth token in `localStorage` or `sessionStorage`.
- Using `any` explicitly or implicitly.
- Hand-writing API request/response types.
- Calling `rawClient`/`openapi-fetch` directly from components or hooks.
- Putting TanStack Query data into a Zustand store.
- Using `useState` for multi-field forms.
- Writing validation logic in `onSubmit` instead of Zod schemas.
- Implementing client-side pagination/sorting/filtering on server-paginated endpoints.
- Treating `403` from a privileged action as unreachable.
- Making destructive actions optimistic.
- Using `dangerouslySetInnerHTML`.
- Hardcoding error message strings in components.
- Hardcoding hex color values in charts or status badges.
- Building modals, dropdowns, or comboboxes from scratch instead of using Radix-backed shadcn/ui primitives.
- Adding dependencies listed in the forbidden-dependency table.
- Cross-importing one feature's internals into another feature folder.
- Editing `src/types/api.generated.ts` by hand.
- Using `getByTestId` as the default RTL query strategy.
- Shipping a new interactive surface without a corresponding route-segment error boundary.
- Mixing `snake_case` API shapes directly into JSX without passing through a feature mapper when the component expects a camelCase view model.

## AI Implementation Rules

- Read `.specify/memory/frontend-tech-stack.md` and this constitution before every implementation task.
- Do not redesign architecture. Implement within the existing stack and patterns.
- Do not perform unnecessary refactoring. Change only what the task requires.
- Do not add, remove, or upgrade dependencies unless explicitly required and approved via the ADR process.
- Follow the OpenAPI-generated types exactly. Regenerate types when the contract changes and commit the result.
- Respect feature boundaries. Do not import across feature internals.
- Keep changes scoped to the requested feature or fix. Never modify unrelated modules.
- Generate or update tests alongside implementation. Coverage thresholds are binding.
- Follow existing naming, file, export, and component conventions.
- Never create new top-level or feature folders without justification documented in the task or ADR.
- When in conflict with this constitution or the tech stack, stop and report the conflict instead of proceeding.

---

**Version**: 1.0 | **Ratified**: Baseline | **Last Amended**: Baseline
