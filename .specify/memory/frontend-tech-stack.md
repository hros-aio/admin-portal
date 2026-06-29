# Frontend Tech Stack & Architecture Specification
## HROS Admin — Super Admin Portal (Frontend)
**Document ID:** HROS-FE-TS-001 | **Version:** 1.0
**Status:** Baseline — Source of Truth | **Classification:** Internal — Confidential
**Audience:** Frontend Engineers, AI Coding Agents (GitHub SpecKit / Gemini / Codex), Reviewers
**Companion Backend Docs:** `tech-stack.md` (Go/Echo/GORM backend), `06_APISpecification.md`, `07_PermissionMatrix.md`, `08_MultiTenantArchitecture.md`
 
> This document is binding. Any deviation from it in a PR, spec, or generated code must be explicitly justified in an ADR addendum (Section 24) and reviewed before merge. AI coding agents (Gemini implementation, Codex review) must treat this file as the contract for "correct" frontend code.
 
---
 
## Table of Contents
 
1. [Overview](#1-overview)
2. [Architectural Principles](#2-architectural-principles)
3. [Technology Selection Matrix](#3-technology-selection-matrix)
4. [Frontend Architecture](#4-frontend-architecture)
5. [Routing Strategy](#5-routing-strategy)
6. [Authentication Strategy](#6-authentication-strategy)
7. [Authorization & RBAC Strategy](#7-authorization--rbac-strategy)
8. [State Management Strategy](#8-state-management-strategy)
9. [API Communication Strategy](#9-api-communication-strategy)
10. [Form Handling Strategy](#10-form-handling-strategy)
11. [Validation Strategy](#11-validation-strategy)
12. [Data Fetching & Caching Strategy](#12-data-fetching--caching-strategy)
13. [Table & Pagination Strategy](#13-table--pagination-strategy)
14. [Error Handling Strategy](#14-error-handling-strategy)
15. [Dashboard & Visualization Strategy](#15-dashboard--visualization-strategy)
16. [Testing Strategy](#16-testing-strategy)
17. [Folder Structure Standards](#17-folder-structure-standards)
18. [Coding Standards](#18-coding-standards)
19. [Performance Optimization Guidelines](#19-performance-optimization-guidelines)
20. [Accessibility Requirements](#20-accessibility-requirements)
21. [Security Requirements](#21-security-requirements)
22. [CI/CD Requirements](#22-cicd-requirements)
23. [Dependency Management Rules](#23-dependency-management-rules)
24. [Technology Decision Records (ADR)](#24-technology-decision-records-adr)
25. [Anti-Patterns and Forbidden Practices](#25-anti-patterns-and-forbidden-practices)
---
 
## 1. Overview
 
### 1.1 Purpose
 
HROS Admin is an **internal-facing, multi-tenant SaaS control-plane console** used exclusively by HROS operations, billing, and support staff to manage:
 
- Tenants (lifecycle: create → update → archive)
- Subscriptions & Plans (billing, quotas, trials, proration)
- Admin Users & Roles
- Permissions (module-level RBAC + contextual policy conditions)
- Audit Logs (immutable, compliance-grade)
- Dashboard Analytics (KPIs, trends, activity feed)
Although internal-facing, this portal handles **sensitive multi-tenant billing and PII-adjacent metadata** and must be engineered to the same rigor as a customer-facing product: type-safe, accessible, testable, observable, and secure by default.
 
### 1.2 Relationship to Backend
 
The backend (see `tech-stack.md`) is a **Go + Echo + GORM + PostgreSQL + Redis** service following Clean Architecture, exposing a versioned REST API at `/api/v1` documented in OpenAPI (`api/openapi.yaml`), as detailed in `06_APISpecification.md`. The frontend:
 
- **Never** hand-writes API types — all request/response types are generated from the backend's committed OpenAPI document (Section 9).
- Mirrors the backend's RBAC model (module × action permission matrix + Super Admin double-gates) on the client for UX purposes only — the backend remains the sole source of authorization truth (Section 7).
- Treats every mutating action as auditable; the UI must reflect the audit-log-aware nature of the system (confirmation modals, diff previews, "this affects N tenants" warnings) per `02_FunctionalSpec.md` and `04_AcceptanceCriteria.md`.
### 1.3 Non-Goals
 
- This is **not** the tenant-facing HRMS application. No employee/payroll UI lives in this codebase.
- This is **not** a public marketing site — no SEO, no SSR-for-SEO concerns. Next.js is chosen for its application architecture (routing, layouts, server components for data-heavy admin views), not for SEO.
### 1.4 Document Authority
 
When a generated spec (SpecKit), an AI agent's implementation plan, or a code review (Codex) conflicts with this document, **this document wins** unless an approved ADR addendum supersedes it. Silent deviation is treated as a defect.
 
---
 
## 2. Architectural Principles
 
These principles are non-negotiable and apply to every feature built on top of this stack.
 
| # | Principle | Implication |
|---|-----------|-------------|
| P1 | **Type-safety end-to-end** | No `any`. API contracts flow from OpenAPI → generated types → hooks → components. A backend contract change must be a *compile error* on the frontend until addressed. |
| P2 | **Server is the source of truth for authorization** | The UI may hide/disable controls for UX, but every privileged action must also be enforced server-side. Client-side RBAC is a convenience layer, never a security boundary. |
| P3 | **Feature-based modularity** | Code is organized by business capability (`tenants`, `subscriptions`, `plans`, `admins`, `policies`, `audit`, `dashboard`), not by technical layer alone. A feature should be deletable by deleting one folder. |
| P4 | **Server state and UI state are different things** | TanStack Query owns *server* state (cached, revalidated, async). Zustand owns *UI-only* state (modals, wizard steps, table column visibility, draft form state for "Unsaved Changes" panels). They are never mixed. |
| P5 | **Composition over configuration sprawl** | Prefer small composable hooks/components over mega-components with prop explosion. |
| P6 | **Boring, explicit, predictable code** | Mirrors the backend's coding-conventions.md philosophy: correctness > readability > testability > observability > performance. No clever abstractions for their own sake. |
| P7 | **Accessibility and confirmation-first UX for destructive actions** | Archive Tenant, Cancel Subscription, Remove Admin, etc. always require explicit, typed, or two-step confirmation (per `04_AcceptanceCriteria.md`). |
| P8 | **Every non-trivial unit of logic is tested** | Hooks, utilities, and components with business logic require unit/integration tests; critical user journeys require E2E coverage (Section 16). |
| P9 | **Optimistic UI only where safe to roll back** | Optimistic updates are permitted for low-risk, easily-reversible mutations (e.g., toggling a plan's visibility) and forbidden for financial/destructive operations (e.g., proration, archive, cancel) where the proper pattern is pessimistic update + clear loading/confirmation state. |
| P10 | **Single Responsibility for files** | One exported component/hook of meaning per file (matches backend `_test.go` 1:1 file convention spirit). |
 
---
 
## 3. Technology Selection Matrix
 
| Concern | Technology | Version Baseline | Rationale Summary |
|---|---|---|---|
| Framework | Next.js (App Router) | 14.x+ | Server Components, layouts, streaming, file-based routing, built-in code-splitting |
| UI Library | React | 18.x+ | Industry standard, concurrent rendering, ecosystem maturity |
| Language | TypeScript | 5.x+ (strict) | Compile-time contract enforcement across the entire stack |
| Styling | Tailwind CSS | 3.x+ | Utility-first, no CSS sprawl, design-token driven |
| Component Primitives | shadcn/ui + Radix UI | latest | Accessible, unstyled primitives + copy-in components (no opaque runtime dependency) |
| Server State / Data Fetching | TanStack Query | 5.x+ | De-facto standard for async server-state caching, invalidation, retries |
| API Client | OpenAPI Generated Client (`openapi-typescript` + `openapi-fetch`) | latest | Generated from backend's committed `openapi.yaml`; zero hand-written API types |
| Forms | React Hook Form | 7.x+ | Performant uncontrolled forms, minimal re-renders, mature ecosystem |
| Schema Validation | Zod | 3.x+ | Single source of truth for runtime + static validation, integrates with RHF |
| Tables | TanStack Table | 8.x+ | Headless, composable, handles 10k+ row tenant/audit lists without bloat |
| UI-only State | Zustand | 4.x+ | Minimal boilerplate, no context-provider hell, devtools support |
| Charts | Recharts | 2.x+ | Declarative, React-native composition, sufficient for KPI/trend charts |
| Unit/Component Testing | Vitest + React Testing Library | latest | Fast (Vite-powered), Jest-compatible API, RTL enforces accessible queries |
| E2E Testing | Playwright | latest | Cross-browser, reliable auto-waiting, trace viewer for debugging |
| Linting | ESLint (flat config) | 9.x+ | Enforce architectural boundaries via custom rules (e.g., `eslint-plugin-boundaries`) |
| Formatting | Prettier | 3.x+ | Zero-debate formatting |
| Git Hooks | Husky + lint-staged | latest | Enforce lint/format/type-check before commit; fast (staged-files only) |
| Package Manager | pnpm | 9.x+ | Strict, disk-efficient, monorepo-ready if this becomes part of a larger workspace |
 
> **Pinning policy:** Exact versions are pinned in `package.json` (no `^`/`~` for direct dependencies in this repo — see Section 23). The table above states *baselines*, not exact pins, since pins evolve.
 
---
 
## 4. Frontend Architecture
 
### 4.1 High-Level Shape
 
```
┌──────────────────────────────────────────────────────────────────┐
│                        Next.js App Router                        │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────────┐ │
│  │ (auth) routes │  │ (portal)     │  │ Route Handlers (BFF-lite)│ │
│  │ /login        │  │  /dashboard  │  │ /api/* (rare; mostly    │ │
│  │ /forgot-pw    │  │  /tenants    │  │  proxy/edge concerns)   │ │
│  │ /reset-pw     │  │  /plans      │  └─────────────────────────┘ │
│  │ /accept-invite│  │  /admins     │                              │
│  │               │  │  /policies   │                              │
│  │               │  │  /audit-logs │                              │
│  └──────────────┘  └──────────────┘                               │
└───────────────────────────┬────────────────────────────────────────┘
                            │ openapi-fetch client (typed)
                 ┌──────────▼───────────┐
                 │   HROS Admin REST API│
                 │   /api/v1/* (Go/Echo)│
                 └───────────────────────┘
```
 
### 4.2 Rendering Strategy
 
| Surface | Rendering Mode | Why |
|---|---|---|
| `/login`, `/forgot-password`, `/reset-password`, `/accept-invite` | Client Components, statically rendered shell | No auth context needed pre-login; fast first paint |
| `/dashboard`, `/tenants`, `/plans`, `/admins`, `/policies`, `/audit-logs` | Server Component shell + Client Component islands | Server Components fetch initial/SEO-irrelevant-but-cacheable shell data (e.g., role-gated nav); interactive widgets (tables, forms, charts) are Client Components hydrated with TanStack Query |
| Modals / slide-in panels (Invite Admin, Edit Plan inline) | Client Components only | Inherently interactive, no server rendering benefit |
 
**Rule:** Server Components fetch *only* what's needed to render layout chrome and perform auth/role gating before paint (avoids "flash of unauthorized content"). All data that needs caching, refetching, optimistic updates, or pagination is fetched client-side via TanStack Query inside Client Components. We deliberately do **not** use Next.js Server Actions as the primary mutation mechanism — see ADR-FE-003 (Section 24) for rationale (consistency with the typed OpenAPI client and TanStack Query's mutation/cache-invalidation model).
 
### 4.3 Layout Composition
 
```
app/
  (auth)/
    layout.tsx          # minimal centered layout, no sidebar/topbar
    login/page.tsx
    forgot-password/page.tsx
    reset-password/page.tsx
    accept-invite/page.tsx
  (portal)/
    layout.tsx           # Sidebar + TopBar + AuthGuard + RoleProvider
    dashboard/page.tsx
    tenants/
      page.tsx            # list
      new/page.tsx         # create
      [tenantId]/
        page.tsx            # update tenant
        subscription/page.tsx
        subscription/manage/page.tsx
    plans/
      page.tsx
      new/page.tsx
      [planId]/page.tsx
    admins/page.tsx
    policies/page.tsx
    audit-logs/page.tsx
  layout.tsx              # root: <html>, fonts, providers
  globals.css
```
 
---
 
## 5. Routing Strategy
 
### 5.1 Route Groups
 
- `(auth)` — unauthenticated routes. No sidebar, no `RoleProvider`. Redirects to `/dashboard` if a valid session already exists.
- `(portal)` — authenticated routes. Wrapped by `AuthGuard` (Section 6) and `PermissionProvider` (Section 7). All breadcrumb/navigation chrome lives here, mirroring the breadcrumb map in `02_FunctionalSpec.md §8.4`.
### 5.2 URL Design Rules
 
- Plural nouns for collections, matching backend conventions: `/tenants`, `/plans`, `/admins`.
- Singular resource detail by dynamic segment: `/tenants/[tenantId]`.
- Actions that are "pages" (not modals) get their own segment: `/tenants/[tenantId]/subscription/manage`.
- Actions that are inherently transient (Invite Admin, Edit Plan quick panel) are **never** routed — they are modal/sheet state controlled by a Zustand UI store or `useSearchParams`-driven sheet (e.g., `?panel=invite-admin`), never a dedicated page, to avoid orphaned routes for ephemeral UI.
### 5.3 Route-Level Protection
 
Every route under `(portal)` is protected by a layout-level guard **and** a declarative per-route permission requirement:
 
```tsx
// app/(portal)/admins/page.tsx
import { RequirePermission } from "@/features/auth/components/require-permission";
import { AdminListPage } from "@/features/admins/components/admin-list-page";
 
export default function Page() {
  return (
    <RequirePermission module="admin_management" action="can_view">
      <AdminListPage />
    </RequirePermission>
  );
}
```
 
`RequirePermission` (Section 7) renders a `<ForbiddenState />` (not a silent blank page) when the permission check fails, and never flashes the protected content first.
 
### 5.4 Navigation Guards
 
- **Unsaved changes guard**: routes with draft state (Manage Subscription, Edit Plan) register a `beforeunload`/Next.js `useBeforeLeave`-equivalent (via a custom `useUnsavedChangesGuard` hook) that blocks navigation with a confirmation dialog, matching `04_AcceptanceCriteria.md` AC-SUB-05.
- **Auth redirect guard**: `AuthGuard` redirects unauthenticated users to `/login?from=<path>` and authenticated users away from `(auth)` routes to `/dashboard`.
---
 
## 6. Authentication Strategy
 
### 6.1 Token Model
 
Mirrors backend (`06_APISpecification.md §2`, `08_MultiTenantArchitecture.md §5.2`):
 
- **Access token** (JWT, RS256, 15 min) — kept **in memory only** (a module-level variable inside the API client / an `AuthStore`), never in `localStorage`/`sessionStorage`.
- **Refresh token** — stored in an **HttpOnly, Secure, SameSite=Strict cookie** set by the backend (preferred) so it is inaccessible to JS (mitigates XSS token theft). If the backend instead returns it in the JSON body (as shown in `06_APISpecification.md`), the frontend immediately forwards it to a same-origin Next.js Route Handler (`/api/session`) whose only job is to set it as an HttpOnly cookie — it must never be persisted in client-readable storage.
> **Rationale:** Storing any token in `localStorage` exposes it to any XSS payload that ever executes on the page. Given this portal manages billing and tenant data for 1,000+ organizations, token-theft blast radius is unacceptable. See ADR-FE-001.
 
### 6.2 Auth Flow Implementation
 
```ts
// src/features/auth/stores/auth-store.ts
import { create } from "zustand";
 
interface AuthState {
  accessToken: string | null;
  admin: AdminProfile | null;
  status: "idle" | "authenticated" | "unauthenticated" | "mfa_required";
  mfaToken: string | null;
  setSession: (token: string, admin: AdminProfile) => void;
  setMfaRequired: (mfaToken: string) => void;
  clearSession: () => void;
}
 
export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  admin: null,
  status: "idle",
  mfaToken: null,
  setSession: (accessToken, admin) =>
    set({ accessToken, admin, status: "authenticated", mfaToken: null }),
  setMfaRequired: (mfaToken) => set({ status: "mfa_required", mfaToken }),
  clearSession: () => set({ accessToken: null, admin: null, status: "unauthenticated" }),
}));
```
 
This Zustand store holds **only the in-memory access token and admin profile** — it is explicitly *not* persisted (no `persist` middleware), so a hard refresh always re-bootstraps via a silent `POST /auth/refresh` call (relying on the HttpOnly refresh cookie).
 
### 6.3 Silent Refresh & 401 Handling
 
The generated OpenAPI client (Section 9) is wrapped with middleware that:
 
1. Attaches `Authorization: Bearer <accessToken>` from `useAuthStore.getState().accessToken`.
2. On `401`, attempts exactly one `POST /auth/refresh` (deduplicated across concurrent requests via a shared in-flight promise), updates the in-memory token, and replays the original request.
3. If refresh also fails → `clearSession()` + redirect to `/login?from=<path>`.
```ts
// src/lib/api/auth-middleware.ts
let refreshPromise: Promise<string> | null = null;
 
async function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = client.POST("/auth/refresh", {}).then((res) => {
      refreshPromise = null;
      if (res.error) throw new ApiError(res.error);
      useAuthStore.getState().setSession(res.data.data.access_token, useAuthStore.getState().admin!);
      return res.data.data.access_token;
    });
  }
  return refreshPromise;
}
```
 
### 6.4 MFA, SSO, Biometric
 
- **MFA (Super Admin)**: `/login` → on `mfa_required: true`, route to an MFA challenge step (same page, not a new route) that calls `POST /auth/mfa/verify`. No session exists until this succeeds (per `08_MultiTenantArchitecture.md §5.3`).
- **SSO**: `/login` "Continue with SSO" triggers a full-page redirect (`window.location.href = '/auth/sso/initiate?provider=saml'`); this is intentionally **not** a client-side fetch since it must follow a browser redirect chain to the IdP.
- **WebAuthn/Biometric**: Implemented via the browser `navigator.credentials` API behind a feature-detected button; gracefully hidden on unsupported devices/browsers.
### 6.5 Session Bootstrap
 
`AuthGuard` (in the `(portal)` layout) performs a one-time bootstrap on app shell mount:
 
```tsx
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { status } = useAuthStore();
  const { data, isLoading } = useBootstrapSession(); // calls /auth/refresh once on mount if status === 'idle'
 
  if (status === "idle" && isLoading) return <FullPageSpinner />;
  if (status !== "authenticated") return <RedirectToLogin />;
  return <>{children}</>;
}
```
 
### 6.6 Logout
 
`DELETE /auth/session` is called, then `clearSession()`, then a hard `router.push('/login')`. We deliberately do a **full client-state reset** (including clearing the TanStack Query cache via `queryClient.clear()`) on logout to prevent any residual tenant data leaking into a subsequent admin's session on a shared workstation.
 
---
 
## 7. Authorization & RBAC Strategy
 
### 7.1 Model Recap (from `07_PermissionMatrix.md`)
 
- **Module-level CRUD matrix**: `{ module: tenant_management|plan_management|admin_management|policy_management|subscription_management|audit_logs|dashboard, action: can_view|can_create|can_update|can_delete|can_approve|can_export }`.
- **Sensitive double-gates**: some actions additionally require `role === 'Super Admin'` (e.g., Archive Tenant, Cancel Subscription) regardless of module permission.
- **Self-protection rules**: an admin cannot deactivate/remove/change-role-of themselves.
- **Super Admin matrix is always full-access and immutable** in the UI.
### 7.2 Client-Side Authority Boundary
 
> **Restated from P2:** The frontend RBAC layer exists purely for UX (hide/disable controls, avoid dead-end navigation, show `<ForbiddenState/>` early). **Every** privileged mutation is re-validated server-side; a `403 PERMISSION_DENIED` from the API must always be handled gracefully (Section 14), because client-side checks can be stale (e.g., a role was changed in another tab) or bypassed by a determined user.
 
### 7.3 Permission Data Source
 
On login (and on every `/auth/refresh`), the backend's `admin` payload includes `role` and `role_id`. Immediately after authentication, the frontend fetches `GET /policies/roles` filtered to the current admin's role (or the backend should — and per `08_MultiTenantArchitecture.md`, JWT claims include `role`) to populate a normalized permission map. This is cached via TanStack Query under a stable key (`['permissions', adminId]`, `staleTime: 5 * 60_000`) and invalidated whenever:
 
- `admin.role_changed` occurs for the current session (forces re-login per backend session-invalidation rules — Section 6.6 applies).
- The Super Admin explicitly saves a permission-matrix change in the Policies module (own-tab live update; other affected admins pick it up on next token refresh / page load, consistent with backend's "new permissions take effect on next login" rule in `02_FunctionalSpec.md §6.2`).
### 7.4 Permission Provider & Hooks
 
```ts
// src/features/auth/types/permission.ts
export type Module =
  | "dashboard" | "tenant_management" | "plan_management"
  | "admin_management" | "policy_management"
  | "subscription_management" | "audit_logs";
 
export type Action = "can_view" | "can_create" | "can_update" | "can_delete" | "can_approve" | "can_export";
 
export type PermissionMatrix = Record<Module, Record<Action, boolean>>;
```
 
```tsx
// src/features/auth/providers/permission-provider.tsx
const PermissionContext = createContext<{
  matrix: PermissionMatrix | null;
  role: string | null;
  isSuperAdmin: boolean;
} | null>(null);
 
export function PermissionProvider({ children }: { children: React.ReactNode }) {
  const admin = useAuthStore((s) => s.admin);
  const { data: matrix } = usePermissionMatrix(admin?.roleId); // TanStack Query hook
 
  const value = useMemo(
    () => ({
      matrix: matrix ?? null,
      role: admin?.role ?? null,
      isSuperAdmin: admin?.role === "Super Admin",
    }),
    [matrix, admin]
  );
 
  return <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>;
}
 
export function usePermission() {
  const ctx = useContext(PermissionContext);
  if (!ctx) throw new Error("usePermission must be used within PermissionProvider");
  return ctx;
}
 
export function useCan(module: Module, action: Action): boolean {
  const { matrix, isSuperAdmin } = usePermission();
  if (isSuperAdmin) return true; // Super Admin matrix is always full-access (07_PermissionMatrix.md §1)
  return matrix?.[module]?.[action] ?? false;
}
```
 
### 7.5 Route-Level Protection
 
```tsx
// src/features/auth/components/require-permission.tsx
export function RequirePermission({
  module,
  action,
  superAdminOnly = false,
  children,
}: {
  module: Module;
  action: Action;
  superAdminOnly?: boolean;
  children: React.ReactNode;
}) {
  const { isSuperAdmin } = usePermission();
  const can = useCan(module, action);
 
  if (superAdminOnly && !isSuperAdmin) return <ForbiddenState reason="super_admin_only" />;
  if (!can) return <ForbiddenState reason="missing_permission" module={module} action={action} />;
  return <>{children}</>;
}
```
 
### 7.6 Component-Level Protection
 
For inline UI elements (buttons, menu items) rather than whole pages, use a non-blocking variant that renders nothing (not an error state) when unauthorized — consistent with `07_PermissionMatrix.md` note: *"the Archive Tenant button is not visible on the tenant edit page"* for Managers.
 
```tsx
// src/features/auth/components/can.tsx
export function Can({
  module,
  action,
  superAdminOnly,
  fallback = null,
  children,
}: {
  module: Module;
  action: Action;
  superAdminOnly?: boolean;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { isSuperAdmin } = usePermission();
  const can = useCan(module, action);
  const allowed = (superAdminOnly ? isSuperAdmin : true) && can;
  return allowed ? <>{children}</> : <>{fallback}</>;
}
```
 
```tsx
<Can module="tenant_management" action="can_delete" superAdminOnly>
  <Button variant="destructive" onClick={openArchiveModal}>
    Archive Tenant
  </Button>
</Can>
```
 
### 7.7 Feature-Level Protection (Self-Protection Rules)
 
Self-protection rules (an admin cannot deactivate/remove/change-role-of themselves — `AC-AM-02`) are **not** generic permission checks; they are encoded as explicit feature-level guards colocated with the feature:
 
```ts
// src/features/admins/utils/can-modify-admin.ts
export function canModifyAdmin(currentAdminId: string, targetAdminId: string): boolean {
  return currentAdminId !== targetAdminId;
}
```
 
Used directly in the admin row actions menu, with a disabled state + tooltip ("You cannot modify your own account") rather than hiding the control — matching the AC's specified disabled-with-tooltip UX, distinct from the hide-on-no-permission pattern used for module RBAC.
 
### 7.8 Mutation-Time Authorization Errors
 
Every mutation hook (Section 9.4) must handle `403 PERMISSION_DENIED` and the more specific double-gate errors (`SUPER_ADMIN_IMMUTABLE`, `SELF_ROLE_CHANGE`, `SELF_DEACTIVATION`, `SELF_REMOVAL`, `SUPER_ADMIN_INVITE_RESTRICTED`) from `06_APISpecification.md §10` with a **toast + no optimistic rollback surprises** (since these actions are never optimistic per P9).
 
---
 
## 8. State Management Strategy
 
### 8.1 The Three State Categories
 
| Category | Owner | Examples |
|---|---|---|
| **Server state** (anything that lives in the DB and is fetched over HTTP) | TanStack Query | tenant list, subscription detail, plan catalog, audit logs, permission matrix |
| **UI-only state** (ephemeral, client-only, not persisted server-side) | Zustand | active modal/sheet, wizard step index, table column visibility/order, sidebar collapsed state, "Unsaved Changes" draft tracking, MFA in-flight step |
| **Local component state** (single-component concern, no cross-component sharing) | `useState`/`useReducer` | input focus, hover state, local collapsible toggle |
 
**Rule:** If two unrelated components need the same piece of UI state, it graduates from `useState` to a Zustand store slice. If a piece of state can be derived from a server response, it is **never** duplicated into Zustand — derive it via a selector/hook from the TanStack Query cache instead.
 
### 8.2 Zustand Store Slicing
 
Stores are **feature-scoped**, not global mega-stores:
 
```ts
// src/features/subscriptions/stores/manage-subscription-store.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";
 
interface ManageSubscriptionDraft {
  billingCycle: "monthly" | "yearly";
  autoRenew: boolean;
  quotaOverrides: QuotaOverrides;
  internalNotes: string;
}
 
interface ManageSubscriptionState {
  original: ManageSubscriptionDraft | null;
  draft: ManageSubscriptionDraft | null;
  hasUnsavedChanges: boolean;
  hydrate: (data: ManageSubscriptionDraft) => void;
  updateDraft: (patch: Partial<ManageSubscriptionDraft>) => void;
  discardDraft: () => void;
  commitDraft: () => void;
}
 
export const useManageSubscriptionStore = create<ManageSubscriptionState>()(
  devtools((set, get) => ({
    original: null,
    draft: null,
    hasUnsavedChanges: false,
    hydrate: (data) => set({ original: data, draft: data, hasUnsavedChanges: false }),
    updateDraft: (patch) =>
      set((state) => {
        const draft = { ...state.draft!, ...patch };
        return { draft, hasUnsavedChanges: !isEqual(draft, state.original) };
      }),
    discardDraft: () => set((state) => ({ draft: state.original, hasUnsavedChanges: false })),
    commitDraft: () => set((state) => ({ original: state.draft, hasUnsavedChanges: false })),
  }))
);
```
 
This directly implements the "Unsaved Changes" sticky panel + Discard Draft behavior from `02_FunctionalSpec.md §4.5` / `04_AcceptanceCriteria.md AC-SUB-05`, without polluting TanStack Query's cache with draft/uncommitted data.
 
### 8.3 Forbidden Patterns
 
- **Never** put a TanStack Query result into a Zustand store ("sync to global state") — this creates dual sources of truth and stale-cache bugs. Read query results directly via hooks where needed.
- **Never** use Zustand for data that must survive a hard refresh and represent committed server truth (re-fetch instead).
- **Never** create one giant `useAppStore()` — always feature-scoped stores under `src/features/<feature>/stores/`.
---
 
## 9. API Communication Strategy
 
### 9.1 OpenAPI-First, Generated Client
 
The backend publishes `api/openapi.yaml` (per backend `tech-stack.md §5`). The frontend generates:
 
1. **Types** via `openapi-typescript`:
   ```bash
   pnpm openapi:types
   # openapi-typescript ../backend/api/openapi.yaml -o src/types/api.generated.ts
   ```
2. **A typed fetch client** via `openapi-fetch`, which uses the generated types to give compile-time-checked `client.GET("/tenants", { params: { query: { page: 1 } } })` calls — no hand-written `axios` wrapper types, no `any`.
```ts
// src/lib/api/client.ts
import createClient from "openapi-fetch";
import type { paths } from "@/types/api.generated";
 
export const rawClient = createClient<paths>({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
});
 
rawClient.use(authMiddleware); // attaches Bearer token, handles 401 refresh (Section 6.3)
rawClient.use(requestIdMiddleware); // injects X-Request-ID (UUID v4) per 06_APISpecification.md §1.3
rawClient.use(csrfMiddleware); // injects X-CSRF-Token on state-changing requests (NFR-S-11)
```
 
### 9.2 Contract Drift Is a CI Failure
 
`pnpm openapi:types` output is committed. CI runs `pnpm openapi:check` (regenerate + `git diff --exit-code`) on every PR that touches API-consuming code, so a backend contract change without a corresponding frontend type regeneration **fails CI** — implementing the "no two conflicting API contracts" spirit of the backend's own rules, applied bidirectionally.
 
### 9.3 Response/Error Envelope Mapping
 
Per `06_APISpecification.md §1.4`, all responses follow `{ data, meta? }` and all errors follow `{ error: { code, message, details } }`. A typed wrapper normalizes this:
 
```ts
// src/lib/api/result.ts
export class ApiError extends Error {
  code: string;
  details?: { field: string; issue: string }[];
  status: number;
 
  constructor(status: number, body: { code: string; message: string; details?: any[] }) {
    super(body.message);
    this.status = status;
    this.code = body.code;
    this.details = body.details;
  }
}
 
export async function unwrap<T>(
  promise: Promise<{ data?: { data: T }; error?: any; response: Response }>
): Promise<T> {
  const { data, error, response } = await promise;
  if (error) throw new ApiError(response.status, error.error ?? error);
  return data!.data;
}
```
 
### 9.4 Service Layer (`src/services`)
 
Raw client calls are never made directly from components or even from query hooks — they go through a thin **service layer** per feature, which is the only place that imports `rawClient`:
 
```ts
// src/services/tenants.service.ts
import { rawClient } from "@/lib/api/client";
import { unwrap } from "@/lib/api/result";
import type { components } from "@/types/api.generated";
 
export type Tenant = components["schemas"]["Tenant"];
export type CreateTenantPayload = components["schemas"]["CreateTenantRequest"];
 
export const tenantsService = {
  list: (params: TenantListParams) =>
    unwrap(rawClient.GET("/tenants", { params: { query: params } })),
 
  getById: (id: string) =>
    unwrap(rawClient.GET("/tenants/{id}", { params: { path: { id } } })),
 
  create: (payload: CreateTenantPayload) =>
    unwrap(rawClient.POST("/tenants", { body: payload })),
 
  update: (id: string, payload: Partial<CreateTenantPayload>) =>
    unwrap(rawClient.PUT("/tenants/{id}", { params: { path: { id } }, body: payload })),
 
  archive: (id: string, body: { confirmation_name: string; reason: string }) =>
    unwrap(rawClient.POST("/tenants/{id}/archive", { params: { path: { id } }, body })),
};
```
 
**Why a service layer at all, if the client is already typed?** Because hooks (Section 12) need a stable, mockable seam for testing (Section 16), and because cross-cutting concerns (e.g., mapping `quota_overrides` snake_case → camelCase view models, computing derived fields) belong in one place per resource, not duplicated across every hook that touches tenants.
 
### 9.5 Naming & Casing Convention
 
The backend API uses `snake_case` JSON (per `06_APISpecification.md`). The frontend **does not** silently camelCase everything at the client layer (this caused subtle bugs in past projects when generated types and runtime data shapes diverged). Instead:
 
- Generated types and service-layer functions use the **exact backend shape** (`snake_case`) up to and including the service layer return value.
- Feature-level **view-model mappers** (`src/features/<feature>/mappers/`) explicitly convert to camelCase, UI-friendly shapes (e.g., computed `usagePercentage`, formatted `createdAtLabel`) for use in components. This explicit mapping boundary is intentional and documented — never implicit.
---
 
## 10. Form Handling Strategy
 
### 10.1 React Hook Form + Zod, Always Together
 
Every form in this portal — from the 5-section Create Tenant wizard to the Invite Admin slide-in panel — uses **React Hook Form** for field state/validation orchestration and **Zod** for the schema (Section 11). No form uses plain `useState` for multi-field forms.
 
```tsx
// src/features/tenants/components/create-tenant-form.tsx
const form = useForm<CreateTenantFormValues>({
  resolver: zodResolver(createTenantSchema),
  defaultValues: createTenantDefaults,
  mode: "onBlur", // inline real-time validation on blur, per 01_SRS.md §3.6
});
 
const { mutate: createTenant, isPending } = useCreateTenant();
 
function onSubmit(values: CreateTenantFormValues) {
  createTenant(toCreateTenantPayload(values), {
    onSuccess: (tenant) => {
      toast.success(`Tenant ${tenant.name} created successfully`);
      router.push(`/tenants/${tenant.id}`);
    },
  });
}
```
 
### 10.2 Multi-Section Wizard Forms
 
Create Tenant and Create Plan are **5-section forms** per `02_FunctionalSpec.md §3.1` / `§5.2`. These are implemented as a **single RHF form instance** (not 5 separate forms stitched together) using `useFieldArray`/section components that each consume `useFormContext()`, ensuring validation runs holistically (e.g., cross-section trial-date-vs-start-date validation) rather than per-section, while still allowing section-by-section visual layout and per-section error summaries.
 
```tsx
<FormProvider {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <TenantInfoSection />
    <OwnerInfoSection />
    <InitialAdminSection />
    <SubscriptionSetupSection />
    <TenantSettingsSection />
    <FormFooterActions isSubmitting={isPending} />
  </form>
</FormProvider>
```
 
### 10.3 Diff-Based Update Forms
 
Update Tenant and Update Plan implement **diff-based save** per `02_FunctionalSpec.md §3.2`: RHF's `formState.dirtyFields` is used to compute the changed-fields-only payload, matching the backend's diff-based `PUT` semantics exactly — we never send the full form payload on update, only dirty fields.
 
```ts
function buildDiffPayload<T extends FieldValues>(values: T, dirtyFields: Partial<Record<keyof T, boolean>>): Partial<T> {
  return Object.fromEntries(
    Object.entries(values).filter(([key]) => dirtyFields[key as keyof T])
  ) as Partial<T>;
}
```
 
If no fields are dirty, the Save action is disabled and shows "No changes detected" (matching `02_FunctionalSpec.md §3.2`) rather than firing a no-op request.
 
### 10.4 Slide-In Panel Forms
 
Invite Admin and quick Edit Plan panels use the **same form components** as their full-page counterparts where the field set overlaps (DRY) but are mounted/unmounted via a Zustand-controlled sheet (`useUiPanelStore`), each resetting RHF state on close via `form.reset()` in a cleanup effect, so a previously half-filled invite never leaks into the next time the panel opens.
 
### 10.5 Standard Field Components
 
All form fields go through a small set of shadcn/ui-based controlled wrappers in `src/components/form/` (`FormTextField`, `FormSelectField`, `FormDatePickerField`, `FormCheckboxField`, `FormNumberStepperField`) that wire RHF's `Controller` + Zod error messages + label/required-asterisk/help-text consistently, so no feature reimplements field-level error rendering.
 
### 10.6 Common Mistakes to Avoid
 
- Do not call `form.watch()` broadly at the top of a large form component — it forces the whole form to re-render on every keystroke. Use `useWatch({ control, name })` scoped to the specific field, or subscribe via `form.subscribe` callbacks where only derived UI (e.g., "Enable Trial" reveals "Trial End Date") needs it.
- Do not duplicate Zod validation logic in `onSubmit` — the resolver is the single validation gate; `onSubmit` only runs for already-valid data.
- Do not store form values in a Zustand store "just in case" — RHF's internal state plus the Section 8.2 draft-store pattern (only for forms that need a persistent cross-navigation "Unsaved Changes" banner) is sufficient.
---
 
## 11. Validation Strategy
 
### 11.1 Zod as Single Source of Truth
 
Every form's validation rules are expressed once, as a Zod schema, and reused for:
1. RHF's `zodResolver`.
2. Static type inference (`z.infer<typeof schema>`) — eliminates separately hand-maintained TS interfaces for form values.
3. Optional server-adjacent re-validation of query params (e.g., tenant list filters from `useSearchParams`).
```ts
// src/features/tenants/schemas/create-tenant.schema.ts
import { z } from "zod";
 
export const createTenantSchema = z
  .object({
    tenant: z.object({
      name: z.string().min(1, "Tenant name is required").max(200),
      code: z
        .string()
        .min(1, "Tenant code is required")
        .max(50)
        .regex(/^[A-Za-z0-9_]+$/, "Code must be alphanumeric or underscore"),
      legalName: z.string().max(200).optional(),
      industry: z.string().optional(),
      country: z.string().length(2).optional(),
      timezone: z.string().default("UTC"),
      status: z.enum(["active", "pending", "suspended"]).default("active"),
    }),
    owner: z.object({
      name: z.string().min(1, "Owner name is required"),
      email: z.string().email("Enter a valid email address"),
      phone: z.string().optional(),
    }),
    initialAdmin: z.object({
      name: z.string().min(1, "Admin name is required"),
      email: z.string().email("Enter a valid email address"),
      forcePasswordReset: z.boolean().default(false),
    }),
    subscription: z
      .object({
        planId: z.string().uuid("Select a plan"),
        billingCycle: z.enum(["monthly", "yearly"]).default("monthly"),
        startDate: z.string().date().optional(),
        endDate: z.string().date().optional(),
        trialEnabled: z.boolean().default(false),
        trialEndDate: z.string().date().optional(),
      })
      .refine(
        (data) => !data.trialEnabled || (data.trialEndDate && data.startDate && data.trialEndDate > data.startDate),
        { message: "Trial end date must be after start date", path: ["trialEndDate"] }
      ),
    settings: z.object({
      defaultLanguage: z.string().default("en-US"),
      defaultCurrency: z.string().default("USD"),
      employeeLimitOverride: z.number().int().positive().optional(),
      adminLimitOverride: z.number().int().positive().optional(),
      deploymentNotes: z.string().max(2000).optional(),
    }),
  })
  .refine(
    (data) => data.owner.email.toLowerCase() !== data.initialAdmin.email.toLowerCase(),
    { message: "Admin email must differ from owner email", path: ["initialAdmin", "email"] }
  );
 
export type CreateTenantFormValues = z.infer<typeof createTenantSchema>;
```
 
### 11.2 Cross-Field & Async Validation
 
- **Cross-field** (trial end > start date, quota override ≥ plan default): expressed via `.refine()`/`.superRefine()` directly on the Zod schema, co-located with the rest of the field rules — never as ad-hoc `onSubmit` checks.
- **Async/uniqueness** (Tenant Code already exists, Admin Email already in use): these are **server-validated** (the backend returns `409 TENANT_CODE_EXISTS` / `EMAIL_DUPLICATE`). The frontend optionally adds a debounced "check availability" UX (calling a lightweight existence-check, if backend exposes one) but **must** treat the server's `409` as the authoritative validation result and map it back onto the relevant RHF field via `form.setError("tenant.code", { message: ... })` (Section 14.3) rather than only relying on a pre-check that could race.
### 11.3 Shared Primitive Schemas
 
Common shapes (email, UUID, money amount, ISO date, password policy) are centralized in `src/lib/validation/primitives.ts` so the password policy (`min 10 chars, 1 uppercase, 1 number, 1 special char` per `04_AcceptanceCriteria.md AC-AUTH-04`) is defined exactly once and reused across Reset Password, Accept Invite, and any future change-password form:
 
```ts
export const strongPasswordSchema = z
  .string()
  .min(10, "Password must be at least 10 characters")
  .regex(/[A-Z]/, "Must include an uppercase letter")
  .regex(/[0-9]/, "Must include a number")
  .regex(/[^A-Za-z0-9]/, "Must include a special character");
```
 
---
 
## 12. Data Fetching & Caching Strategy
 
### 12.1 Query Key Convention
 
Query keys are **structured arrays**, namespaced by feature, following the pattern `[domain, resourceType, ...identifiers, filters?]`:
 
```ts
// src/features/tenants/hooks/query-keys.ts
export const tenantKeys = {
  all: ["tenants"] as const,
  list: (filters: TenantListFilters) => [...tenantKeys.all, "list", filters] as const,
  detail: (id: string) => [...tenantKeys.all, "detail", id] as const,
  search: (q: string) => [...tenantKeys.all, "search", q] as const,
};
```
 
This mirrors TanStack Query's recommended hierarchical key factory pattern and enables precise, surgical invalidation (`queryClient.invalidateQueries({ queryKey: tenantKeys.all })` vs. just one detail key).
 
### 12.2 Standard Query Hook Shape
 
```ts
// src/features/tenants/hooks/use-tenants.ts
export function useTenants(filters: TenantListFilters) {
  return useQuery({
    queryKey: tenantKeys.list(filters),
    queryFn: () => tenantsService.list(filters),
    placeholderData: keepPreviousData, // smooth pagination/filter transitions
    staleTime: 30_000, // matches Redis tenant-list cache TTL assumption in 08_MultiTenantArchitecture.md §7.1
  });
}
 
export function useTenant(id: string) {
  return useQuery({
    queryKey: tenantKeys.detail(id),
    queryFn: () => tenantsService.getById(id),
    enabled: Boolean(id),
    staleTime: 120_000,
  });
}
```
 
### 12.3 Standard Mutation Hook Shape & Cache Invalidation
 
```ts
// src/features/tenants/hooks/use-create-tenant.ts
export function useCreateTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: tenantsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.kpis }); // tenant creation affects dashboard KPIs
    },
  });
}
 
export function useArchiveTenant(tenantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: ArchiveTenantPayload) => tenantsService.archive(tenantId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.detail(tenantId) });
      queryClient.invalidateQueries({ queryKey: tenantKeys.list });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}
```
 
### 12.4 Refetch Intervals for "Live" Surfaces
 
Per `01_SRS.md` and `02_FunctionalSpec.md`, the Dashboard KPI cards, trend chart, and activity feed refresh automatically:
 
```ts
export function useDashboardActivity() {
  return useQuery({
    queryKey: dashboardKeys.activity,
    queryFn: dashboardService.getActivity,
    refetchInterval: 60_000, // SRS-DASH-003: auto-refresh every 60s
    refetchIntervalInBackground: false, // pause when tab is not visible (perf)
  });
}
```
 
### 12.5 Optimistic Updates — Scoped and Rare
 
Per P9, optimistic updates are used **only** for low-risk toggles (e.g., Plan visibility toggle, `PATCH /plans/:id/toggle-status`):
 
```ts
export function useTogglePlanStatus(planId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (status: "active" | "inactive") => plansService.toggleStatus(planId, status),
    onMutate: async (status) => {
      await queryClient.cancelQueries({ queryKey: planKeys.detail(planId) });
      const previous = queryClient.getQueryData(planKeys.detail(planId));
      queryClient.setQueryData(planKeys.detail(planId), (old: Plan) => ({ ...old, status }));
      return { previous };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(planKeys.detail(planId), context?.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: planKeys.detail(planId) }),
  });
}
```
 
Archive Tenant, Cancel/Pause Subscription, Plan Upgrade/Downgrade, and any operation that generates an invoice or audit-critical state change are **never** optimistic — they show a pessimistic loading state on the confirm button and only update the UI after the server confirms success.
 
### 12.6 Global QueryClient Configuration
 
```ts
// src/providers/query-provider.tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (error instanceof ApiError && [400, 401, 403, 404, 409, 422].includes(error.status)) return false;
        return failureCount < 2; // retry network/5xx errors twice
      },
      refetchOnWindowFocus: true, // operators frequently tab-switch; keep data fresh
    },
    mutations: {
      retry: false, // never silently retry a mutation (avoid duplicate tenant creation, etc.)
    },
  },
});
```
 
---
 
## 13. Table & Pagination Strategy
 
### 13.1 TanStack Table as the Single Table Engine
 
Every data table — Tenant List, Plan Catalog (cards, not table, but list-state shares the same hook pattern), Admin List, Audit Log Browser — is built on **TanStack Table** (headless) + shadcn/ui's `<Table>` primitives for rendering. No table is hand-rolled with raw `<table>` markup and bespoke sort/filter state.
 
### 13.2 Server-Side Pagination, Sorting, Filtering
 
Per `06_APISpecification.md §1.7`, all list endpoints are server-paginated (`?page&per_page&sort_by&sort_dir`). TanStack Table is configured in **manual mode** — it never paginates/sorts client-side data that was only partially fetched:
 
```tsx
// src/features/tenants/components/tenant-table.tsx
const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
const [sorting, setSorting] = useState<SortingState>([{ id: "created_at", desc: true }]);
const [filters, setFilters] = useState<TenantFilters>(defaultTenantFilters);
 
const { data, isLoading } = useTenants({
  page: pagination.pageIndex + 1,
  per_page: pagination.pageSize,
  sort_by: sorting[0]?.id,
  sort_dir: sorting[0]?.desc ? "desc" : "asc",
  ...filters,
});
 
const table = useReactTable({
  data: data?.data ?? [],
  columns: tenantColumns,
  pageCount: data?.meta.total_pages ?? -1,
  state: { pagination, sorting },
  onPaginationChange: setPagination,
  onSortingChange: setSorting,
  manualPagination: true,
  manualSorting: true,
  manualFiltering: true,
  getCoreRowModel: getCoreRowModel(),
});
```
 
### 13.3 URL-Synced Table State
 
Pagination, sort, and filter state for primary list views (Tenants, Admins, Audit Logs) is **synced to the URL** (`useSearchParams` + `router.replace` with `scroll: false`) so operators can bookmark/share a filtered view and back/forward browser navigation works intuitively. This state is intentionally **not** in Zustand — it is URL state, a distinct fourth category kept thin and derived.
 
### 13.4 Column Definitions
 
Column definitions live in `src/features/<feature>/components/<resource>-columns.tsx`, are typed against the feature's view-model type (not the raw API type), and reuse shared cell renderers from `src/components/table/` (`StatusBadgeCell`, `AvatarInitialsCell`, `DateCell`, `MoneyCell`, `RowActionsMenu`).
 
### 13.5 Large Audit Log Volumes
 
The Audit Log Browser additionally uses TanStack Table's column-pinning (sticky entity/timestamp columns) and a virtualized row renderer is **not** required for V1 since pagination caps page size at 25 (per `06_APISpecification.md §9.1`), but the architecture leaves room to swap in `@tanstack/react-virtual` later without restructuring (the table is already headless).
 
### 13.6 Aggregate Footer Rows
 
The Tenant List's aggregate footer (Active Tenants, Total MRR, Suspended, Expiring 30d — `07_PermissionMatrix.md`/`04_AcceptanceCriteria.md AC-TM-01`) is **not** computed client-side from the paginated page; it comes from the API's `aggregate` envelope field (per `06_APISpecification.md §4.1`) and is rendered via a dedicated `<TableAggregateFooter aggregate={data?.aggregate} />`, decoupled from TanStack Table's own footer APIs.
 
---
 
## 14. Error Handling Strategy
 
### 14.1 Error Taxonomy
 
| Layer | Mechanism | UX |
|---|---|---|
| Render-time crash (bug) | React Error Boundary (per route segment) | Full-section fallback with "Something went wrong" + reload action; reported to error monitoring |
| Query fetch failure (network/5xx/4xx) | TanStack Query `error` state | Inline `<QueryErrorState />` with retry button inside the affected panel only — never a full-page crash for a failed widget |
| Mutation failure (validation/business rule) | `ApiError` thrown from service layer, caught in `onError` | Toast + (if field-mappable) inline form error |
| Auth failure (401 after refresh attempt) | Auth middleware | Redirect to `/login` |
| Permission failure (403) | `ApiError` with `code: PERMISSION_DENIED` or specific double-gate code | Toast: "You don't have permission to do this" (generic) or specific message from `error.code` mapping table |
 
### 14.2 Error Boundaries Per Route Segment
 
```tsx
// app/(portal)/tenants/error.tsx
"use client";
export default function TenantsError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { reportError(error); }, [error]);
  return <RouteErrorFallback onRetry={reset} />;
}
```
 
Next.js App Router's file-based `error.tsx` boundaries are used at each feature segment so a crash in, e.g., the Subscription Trend Chart, does not take down the entire Dashboard.
 
### 14.3 Mapping Server Errors Onto Forms
 
A shared utility maps the backend's `error.details: [{ field, issue }]` (per `06_APISpecification.md §1.4`) onto RHF field errors automatically:
 
```ts
export function applyServerErrorsToForm<T extends FieldValues>(error: ApiError, form: UseFormReturn<T>) {
  if (error.details?.length) {
    error.details.forEach(({ field, issue }) => {
      form.setError(field as FieldPath<T>, { type: "server", message: issue });
    });
  } else {
    toast.error(error.message);
  }
}
```
 
Used uniformly in every mutation's `onError`:
 
```ts
createTenant(payload, {
  onError: (error) => {
    if (error instanceof ApiError) applyServerErrorsToForm(error, form);
  },
});
```
 
### 14.4 Error Code → UX Message Table
 
A single lookup (`src/lib/api/error-messages.ts`) maps every backend error code from `06_APISpecification.md §10` to a human-readable, non-technical message, so no component hardcodes its own error strings:
 
```ts
export const ERROR_MESSAGES: Record<string, string> = {
  TENANT_CODE_EXISTS: "This tenant code is already in use.",
  CONFIRMATION_MISMATCH: "The name you typed doesn't match. Please try again.",
  LAST_ACTIVE_PLAN: "You can't archive the only active plan.",
  DOWNGRADE_EMPLOYEE_LIMIT: "Current employee count exceeds the new plan's limit.",
  SELF_DEACTIVATION: "You cannot modify your own account.",
  SUPER_ADMIN_IMMUTABLE: "Super Admin permissions cannot be modified.",
  // ...full table maintained alongside backend's error code reference
};
```
 
### 14.5 Global Toast & Notification Conventions
 
- **Success**: green toast, auto-dismiss 4s.
- **Validation/business error**: amber/destructive toast, auto-dismiss 6s, manually dismissible.
- **Network/unknown error**: destructive toast + "Try again" action button when the action is idempotent/safely retryable.
- Destructive-action confirmations (Archive, Cancel, Remove) are **modals**, never toasts — toasts confirm outcomes, modals confirm intent.
---
 
## 15. Dashboard & Visualization Strategy
 
### 15.1 Recharts Usage Boundaries
 
Recharts is used exclusively for the **Subscription Trend Chart** (`SRS-DASH-002`) and any future KPI trend visualizations. It is not used for tables, gauges that are better served by simple progress bars (Resource Usage meters use plain styled `<progress>`/div bars per Section 15.3, not Recharts), or anything where a simpler primitive suffices — Recharts is reserved for genuine multi-series time-series/categorical charts.
 
```tsx
// src/features/dashboard/components/subscription-trend-chart.tsx
<ResponsiveContainer width="100%" height={320}>
  <LineChart data={trendData}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="month" />
    <YAxis />
    <Tooltip content={<TrendTooltip />} />
    <Legend />
    <Line type="monotone" dataKey="active" stroke="var(--chart-active)" />
    <Line type="monotone" dataKey="trial" stroke="var(--chart-trial)" />
    <Line type="monotone" dataKey="expired" stroke="var(--chart-expired)" />
  </LineChart>
</ResponsiveContainer>
```
 
Chart colors are sourced from CSS variables defined in the Tailwind theme (`--chart-active`, `--chart-trial`, `--chart-expired`), never hardcoded hex values, so the chart respects light/dark theme and any future rebrand.
 
### 15.2 Period Toggle State
 
The 6M/1Y toggle (`AC-DASH-03`) is local UI state (`useState`) scoped to the chart component — it does not warrant a Zustand store since nothing outside the chart needs it. It drives the TanStack Query key (`dashboardKeys.trends(period)`), triggering a refetch on toggle.
 
### 15.3 KPI Cards & Resource Usage Meters
 
KPI cards (`SRS-DASH-001`) and resource usage meters (employees/admins/storage/API calls, `SRS-SUB-001`) are plain composed shadcn/ui `<Card>` + custom `<UsageMeterBar>` components — not chart-library elements — implementing the exact color-coding rule from `02_FunctionalSpec.md §4.1` (`<70%` blue, `70–89%` orange, `≥90%` red) via a pure utility function:
 
```ts
export function usageMeterColor(pct: number): "default" | "warning" | "critical" {
  if (pct >= 90) return "critical";
  if (pct >= 70) return "warning";
  return "default";
}
```
 
### 15.4 Live Activity Feed
 
The Recent Activity Feed (`SRS-DASH-003`) is a simple virtualization-free list (capped at 20 items server-side) rendered from `useDashboardActivity()` (Section 12.4), with status badges mapped via the same `StatusBadgeCell` used in tables (Section 13.4) for visual consistency between the dashboard and audit log.
 
### 15.5 Export
 
Dashboard PDF/CSV export (`SRS-DASH-005`) triggers a `GET /dashboard/export?format=` request that returns a file stream; the frontend handles this via a plain anchor-download pattern (not a TanStack Query hook, since it's a one-shot file download, not cached state):
 
```ts
async function downloadDashboardExport(format: "pdf" | "csv") {
  const res = await fetch(`${API_BASE}/dashboard/export?format=${format}`, {
    headers: { Authorization: `Bearer ${getAccessToken()}` },
  });
  const blob = await res.blob();
  triggerBrowserDownload(blob, `dashboard-export-${todayISO()}.${format}`);
}
```
 
---
 
## 16. Testing Strategy
 
### 16.1 Test Pyramid
 
```
        Few E2E (Playwright)         — critical multi-step journeys
     Some Integration (RTL + MSW)    — feature flows with mocked API
  Many Unit (Vitest)                 — hooks, utils, schemas, mappers
```
 
### 16.2 Unit Tests (Vitest)
 
**Must cover:**
- Zod schemas (valid input passes, invalid input produces expected error paths/messages).
- Pure utility functions (`usageMeterColor`, `buildDiffPayload`, `canModifyAdmin`, proration display formatting).
- View-model mappers (snake_case API shape → camelCase UI shape).
- Zustand store logic (`useManageSubscriptionStore` draft/discard/commit transitions).
```ts
// src/features/subscriptions/utils/usage-meter-color.test.ts
describe("usageMeterColor", () => {
  it.each([
    [45, "default"],
    [75, "warning"],
    [92, "critical"],
    [100, "critical"],
  ])("returns %s color for %i%%", (pct, expected) => {
    expect(usageMeterColor(pct as number)).toBe(expected);
  });
});
```
 
### 16.3 Component / Integration Tests (RTL + MSW)
 
Component tests render with **real TanStack Query + real RHF**, mocking only the network boundary via **MSW (Mock Service Worker)** against the same OpenAPI-derived paths — never mocking the service layer with hand-rolled stubs that can drift from the real contract.
 
```tsx
// src/features/tenants/components/create-tenant-form.test.tsx
const server = setupServer(
  http.post("*/tenants", () => HttpResponse.json({ data: { id: "t1", name: "Acme", code: "ACME_1" } }, { status: 201 }))
);
 
test("shows inline error when tenant code already exists", async () => {
  server.use(
    http.post("*/tenants", () =>
      HttpResponse.json({ error: { code: "TENANT_CODE_EXISTS", message: "Tenant code already exists" } }, { status: 409 })
    )
  );
  render(<CreateTenantForm />, { wrapper: AppTestProviders });
  await fillRequiredFields();
  await userEvent.click(screen.getByRole("button", { name: /create tenant/i }));
  expect(await screen.findByText(/tenant code already exists/i)).toBeInTheDocument();
});
```
 
RTL queries are restricted to **accessible queries** (`getByRole`, `getByLabelText`) — `getByTestId` is a last resort, never the default, reinforcing Section 20's accessibility requirements.
 
### 16.4 E2E Tests (Playwright)
 
E2E coverage is reserved for the **critical journeys** explicitly enumerated in `03_UserStories.md`/`04_AcceptanceCriteria.md` as Must-Have:
 
- Login (credential + MFA) → Dashboard.
- Create Tenant (happy path, full 5-section wizard) → appears in list.
- Archive Tenant (typed confirmation gate).
- Upgrade Subscription Plan with proration preview confirm.
- Invite Admin → accept invite → first login.
- Edit Role Permission Matrix → conflict detection banner appears.
```ts
// e2e/tenants/create-tenant.spec.ts
test("Super Admin can create a tenant end-to-end", async ({ page }) => {
  await loginAsSuperAdmin(page);
  await page.goto("/tenants/new");
  await fillTenantWizard(page, validTenantFixture);
  await page.getByRole("button", { name: "Create Tenant" }).click();
  await expect(page.getByText(/created successfully/i)).toBeVisible();
  await expect(page).toHaveURL(/\/tenants\/[\w-]+$/);
});
```
 
E2E tests run against a **seeded test backend** (or a containerized stack), never against production data, and use dedicated seed fixtures analogous to `HROS_AUTH_TestCaseSpec_Epic1.md §3`.
 
### 16.5 Coverage Expectations
 
| Layer | Minimum Coverage |
|---|---:|
| Schemas (Zod) | 95% |
| Hooks (query/mutation) | 85% |
| Utils/Mappers | 90% |
| Components (RTL) | 70% (focus on logic-bearing components, not pure presentational ones) |
| Critical E2E journeys | 100% of P1 user stories listed above |
 
### 16.6 Required Test Commands
 
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```
 
CI runs `pnpm test:coverage` and `pnpm test:e2e` on every PR (Section 22).
 
---
 
## 17. Folder Structure Standards
 
```text
src/
├── app/                          # Next.js App Router — routing & layout composition ONLY
│   ├── (auth)/
│   ├── (portal)/
│   ├── layout.tsx
│   └── globals.css
│
├── features/                     # Business-capability modules — the heart of the codebase
│   ├── auth/
│   │   ├── components/           # RequirePermission, Can, LoginForm, MfaChallenge
│   │   ├── hooks/                # useLogin, useBootstrapSession, usePermissionMatrix
│   │   ├── providers/            # PermissionProvider
│   │   ├── stores/               # auth-store.ts
│   │   ├── schemas/              # login.schema.ts, reset-password.schema.ts
│   │   └── types/
│   ├── tenants/
│   │   ├── components/           # TenantTable, TenantFilters, CreateTenantForm, ArchiveTenantModal
│   │   ├── hooks/                # useTenants, useTenant, useCreateTenant, useArchiveTenant, query-keys.ts
│   │   ├── schemas/
│   │   ├── mappers/              # toTenantViewModel, toCreateTenantPayload
│   │   └── utils/
│   ├── subscriptions/
│   ├── plans/
│   ├── admins/
│   ├── policies/
│   ├── audit-logs/
│   └── dashboard/
│
├── components/                   # Shared, feature-agnostic UI building blocks
│   ├── ui/                       # shadcn/ui generated primitives (Button, Card, Dialog, ...)
│   ├── form/                     # FormTextField, FormSelectField, FormDatePickerField, ...
│   ├── table/                    # DataTable, StatusBadgeCell, RowActionsMenu, TableAggregateFooter
│   └── layout/                   # Sidebar, TopBar, Breadcrumb, PageHeader
│
├── hooks/                        # Cross-feature generic hooks (NOT feature-specific)
│   ├── use-debounce.ts
│   ├── use-unsaved-changes-guard.ts
│   └── use-media-query.ts
│
├── lib/                          # Framework-adjacent infrastructure, no business logic
│   ├── api/                      # client.ts, result.ts, auth-middleware.ts, error-messages.ts
│   ├── validation/                # shared Zod primitives
│   └── utils/                     # cn(), date formatting, currency formatting
│
├── providers/                     # App-wide context providers, composed once in root layout
│   ├── query-provider.tsx
│   ├── theme-provider.tsx
│   └── toast-provider.tsx
│
├── types/                         # Generated + global ambient types
│   ├── api.generated.ts            # openapi-typescript output — DO NOT hand-edit
│   └── global.d.ts
│
├── constants/                     # Enums/maps shared across features
│   ├── permissions.ts              # Module/Action union types + permission constants
│   └── routes.ts                   # Centralized route path builders
│
├── services/                      # Thin API service layer — ONLY place importing rawClient
│   ├── tenants.service.ts
│   ├── subscriptions.service.ts
│   ├── plans.service.ts
│   ├── admins.service.ts
│   ├── policies.service.ts
│   ├── audit-logs.service.ts
│   └── dashboard.service.ts
│
├── stores/                        # Cross-feature UI-only Zustand stores (rare; prefer feature-scoped)
│   └── ui-panel-store.ts            # active slide-in panel/sheet
│
└── tests/                          # Shared test utilities, MSW handlers, fixtures
    ├── msw/
    │   ├── handlers/
    │   └── server.ts
    ├── fixtures/
    └── test-utils.tsx               # AppTestProviders wrapper
```
 
### 17.1 Folder Responsibility Rules
 
| Folder | May Import From | Must Not Import From |
|---|---|---|
| `app/` | `features/*`, `components/*`, `providers/*` | `services/*` directly (route data fetching goes through feature hooks) |
| `features/*` | `components/*`, `hooks/*`, `lib/*`, `services/*` (own feature's service), `constants/*`, `types/*` | other `features/*` internals (cross-feature reuse goes through `components/` or `lib/`, not direct feature-to-feature imports) |
| `components/*` | `lib/*`, `types/*` | `features/*`, `services/*` (must stay feature-agnostic) |
| `services/*` | `lib/api/*`, `types/*` | `features/*`, React itself (no hooks in services — pure async functions) |
| `stores/*` (feature-scoped, under `features/<x>/stores`) | `lib/*`, `types/*` | `services/*` directly (stores hold UI state, not fetch logic) |
 
This boundary table is enforced via `eslint-plugin-boundaries` (Section 18.4) — violations fail CI, not just code review.
 
---
 
## 18. Coding Standards
 
### 18.1 General Principles (mirrors backend `coding-conventions.md` philosophy)
 
Priorities, in order: **Correctness → Readability → Testability → Observability → Performance.** No premature optimization, no clever abstractions for their own sake.
 
### 18.2 Naming Conventions
 
| Artifact | Convention | Example |
|---|---|---|
| Component file | `kebab-case.tsx`, exports `PascalCase` | `tenant-table.tsx` → `export function TenantTable()` |
| Hook file | `kebab-case.ts`, exports `camelCase` starting `use` | `use-create-tenant.ts` → `useCreateTenant` |
| Service file | `<resource>.service.ts` | `tenants.service.ts` |
| Schema file | `<form-name>.schema.ts` | `create-tenant.schema.ts` |
| Store file | `<feature>-store.ts` | `manage-subscription-store.ts` |
| Type | `PascalCase`, no `I`/`T` Hungarian prefixes | `Tenant`, `CreateTenantPayload` |
| Constant | `UPPER_SNAKE_CASE` for true constants; `camelCase` for config objects | `MAX_PAGE_SIZE`, `defaultTenantFilters` |
 
### 18.3 Component Structure Convention
 
```tsx
// 1. Imports (external → internal absolute (@/) → relative)
// 2. Types/interfaces for props
// 3. Component function (named export, not default, except for app/ route files)
// 4. Local helper functions (or extract to utils/ if reused)
 
interface TenantTableProps {
  filters: TenantFilters;
  onFilterChange: (filters: TenantFilters) => void;
}
 
export function TenantTable({ filters, onFilterChange }: TenantTableProps) {
  // hooks first, in a stable order: state → queries → mutations → derived → effects
  const [pagination, setPagination] = useState<PaginationState>(initialPagination);
  const { data, isLoading, error } = useTenants({ ...filters, ...pagination });
  // ...
}
```
 
### 18.4 ESLint Architectural Rules (selected, non-exhaustive)
 
```js
// eslint.config.js (flat config, excerpt)
export default [
  {
    plugins: { boundaries: boundariesPlugin },
    settings: {
      "boundaries/elements": [
        { type: "app", pattern: "src/app/*" },
        { type: "features", pattern: "src/features/*" },
        { type: "components", pattern: "src/components/*" },
        { type: "services", pattern: "src/services/*" },
        { type: "lib", pattern: "src/lib/*" },
      ],
    },
    rules: {
      "boundaries/element-types": [
        "error",
        {
          default: "disallow",
          rules: [
            { from: "app", allow: ["features", "components", "lib"] },
            { from: "features", allow: ["components", "services", "lib"] },
            { from: "components", allow: ["lib"] },
            { from: "services", allow: ["lib"] },
          ],
        },
      ],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": "error",
      "no-restricted-imports": [
        "error",
        { paths: [{ name: "axios", message: "Use the generated openapi-fetch client (src/lib/api/client.ts) instead." }] },
      ],
      "react-hooks/exhaustive-deps": "error",
    },
  },
];
```
 
### 18.5 TypeScript Compiler Strictness
 
```json
// tsconfig.json (excerpt)
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": true,
    "verbatimModuleSyntax": true,
    "paths": { "@/*": ["./src/*"] }
  }
}
```
 
### 18.6 Comments Policy
 
Comment **why**, not **what** — identical to backend convention. JSDoc on every exported hook/service function describing intent and any non-obvious business rule reference (e.g., `// Per AC-SUB-03: blocks downgrade if usage exceeds new plan limits`).
 
---
 
## 19. Performance Optimization Guidelines
 
### 19.1 Bundle & Code-Splitting
 
- Route-level code-splitting is automatic via the App Router; **feature-level lazy loading** is additionally used for heavy, rarely-opened surfaces: the Policy Condition Builder and the full Audit Log export modal are `dynamic(() => import(...), { ssr: false })`.
- Recharts is dynamically imported within the Dashboard feature only — it must never end up in the shared vendor chunk loaded on `/login` or `/tenants`.
- shadcn/ui components are **copied into the repo** (not a runtime npm dependency tree beyond Radix primitives), so there is no risk of an opaque component-library bundle bloating the build — this is one of the explicit reasons shadcn/ui was chosen over a monolithic component library (Section 24, ADR-FE-002).
### 19.2 Rendering Performance
 
- Tables: column definitions and cell renderers are memoized (`useMemo`/module-level constants); row-level callbacks use stable references (`useCallback`) to avoid re-rendering all rows on unrelated state changes.
- Forms: `mode: "onBlur"` (not `onChange`) for validation triggers on large multi-section forms to avoid re-render storms on every keystroke; per-field `useWatch` instead of broad `form.watch()` (Section 10.6).
- Avoid prop-drilling-induced re-renders by colocating state as close to its consumer as possible (P5); lift to Context/Zustand only when genuinely shared.
### 19.3 Data Fetching Performance
 
- `staleTime` is tuned per resource based on backend cache TTLs documented in `08_MultiTenantArchitecture.md §7.1` (e.g., dashboard KPIs `staleTime: 60_000` matching the Redis 60s TTL — refetching faster than the backend cache refreshes is wasted work).
- `keepPreviousData`/`placeholderData` is used on every paginated list query to avoid layout-shifting loading spinners on page/filter changes.
- Search/autocomplete inputs (Tenant global search, per `06_APISpecification.md §4.6`, target <300ms) are debounced client-side (250ms) before firing the query, in addition to the backend's own <300ms SLA — reduces redundant network chatter while typing.
### 19.4 Image & Asset Performance
 
- Avatar initials are rendered as styled text (no image avatars in V1, per the design's "avatar initials" pattern) — zero image payload for the most frequently rendered "avatar" element across tenant/admin lists.
- `next/font` is used for self-hosted, zero-layout-shift font loading.
### 19.5 Web Vitals Budget
 
| Metric | Target |
|---|---|
| LCP (largest content on Dashboard) | < 2.0s (aligns with backend NFR-P-01) |
| INP | < 200ms |
| CLS | < 0.1 |
| JS bundle (initial, gzip) per route | < 200KB (excluding Recharts chunk, which is route-isolated) |
 
---
 
## 20. Accessibility Requirements
 
### 20.1 Baseline Standard
 
**WCAG 2.1 AA** compliance is mandatory for every shipped surface — this is an internal tool, but HROS staff include users relying on screen readers, keyboard navigation, and high-contrast modes; accessibility is not optional.
 
### 20.2 Why Radix UI Was Non-Negotiable
 
Radix UI primitives (underlying shadcn/ui) ship with correct ARIA roles, focus management, and keyboard interaction patterns (Escape to close dialogs, arrow-key navigation in menus/selects, focus trapping in modals) out of the box. This is the primary reason a hand-rolled component set was rejected (Section 24, ADR-FE-002) — reimplementing correct focus-trap/ARIA behavior for every Dialog, Dropdown, and Combobox in this portal is high-risk, low-leverage work.
 
### 20.3 Concrete Rules
 
- Every form field has a programmatically associated `<label>` (via shadcn/ui `FormLabel` + RHF field id wiring) — never a placeholder-only field.
- Every destructive action (Archive Tenant, Cancel Subscription) confirmation modal traps focus, returns focus to the triggering element on close, and is dismissible via Escape.
- Status badges (Active/Suspended/Expired, audit Success/Failed) convey meaning via **text + icon**, never color alone (colorblind-safe).
- All interactive elements are reachable and operable via keyboard alone; E2E smoke tests include a keyboard-only navigation pass for the Create Tenant wizard and Permission Matrix editor.
- Tables expose proper `<th scope="col">` semantics via TanStack Table's header rendering wired into accessible `<table>` markup (not div-based fake tables).
- Color contrast for all Tailwind theme tokens (including chart colors in Section 15.1) is verified ≥ 4.5:1 for text, ≥ 3:1 for graphical/chart elements.
- `prefers-reduced-motion` is respected — sheet/modal/toast transitions degrade to instant or minimal-motion variants.
### 20.4 Testing Accessibility
 
- RTL tests query by role/label by default (Section 16.3), which inherently catches missing labels/roles as test failures.
- `eslint-plugin-jsx-a11y` runs as part of the standard lint pass (Section 22).
- A Playwright + `@axe-core/playwright` automated scan runs against the Dashboard, Tenant List, Create Tenant wizard, and Permission Matrix pages in CI, failing on any new serious/critical violation.
---
 
## 21. Security Requirements
 
### 21.1 Token & Session Security
 
- No token ever touches `localStorage`/`sessionStorage` (Section 6.1). This is the single most important frontend security rule in this document.
- CSRF tokens are attached to every state-changing request per `01_SRS.md NFR-S-11` via `csrfMiddleware` (Section 9.1), sourced from a non-HttpOnly cookie set by the backend specifically for CSRF-token-readability (separate from the HttpOnly refresh-token cookie).
- `X-Request-ID` (UUID v4) is attached to every request for tracing, matching backend convention.
### 21.2 XSS Prevention
 
- React's default JSX escaping is relied upon; `dangerouslySetInnerHTML` is **forbidden** anywhere in this codebase (enforced via ESLint `react/no-danger`) — no feature in this portal has a legitimate need for raw HTML injection (no rich-text tenant descriptions, no markdown rendering in V1).
- Any future rich-text need (e.g., plan descriptions) must go through a sanitization library (e.g., `dompurify`) reviewed via ADR before introduction.
### 21.3 Sensitive Data Handling
 
- No sensitive field (password, MFA secret, raw refresh token, full card number) is ever logged to the browser console, sent to client-side error monitoring breadcrumbs, or stored in Zustand/React state beyond the lifetime of the form submission.
- Payment method display is limited to brand + last 4 digits, exactly mirroring the backend's `payment_method` JSONB shape (`06_APISpecification.md §5.1`) — the frontend never requests or renders full card numbers.
- Internal Admin Notes (Super-Admin-only subscription notes) are rendered conditionally based on `isSuperAdmin` (Section 7.4), not merely hidden via CSS — the component tree itself does not mount/fetch this data for non-Super-Admin sessions where avoidable.
### 21.4 Content Security Policy
 
A strict CSP is configured via Next.js headers (`next.config.js`):
 
```js
const csp = `
  default-src 'self';
  script-src 'self' 'nonce-${nonce}';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' ${process.env.NEXT_PUBLIC_API_BASE_URL};
  frame-ancestors 'none';
`;
```
 
`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and `Strict-Transport-Security` headers are also set, matching `08_MultiTenantArchitecture.md §11.1` Layer 2 requirements.
 
### 21.5 Dependency Security
 
- `pnpm audit` runs in CI on every PR; any new **critical/high** advisory blocks merge (Section 22, Section 23).
- Renovate (or Dependabot) is configured for automated dependency update PRs with CI gating, not manual ad-hoc bumps.
### 21.6 Environment & Secrets
 
- No secret/API key is ever embedded in client bundles. `NEXT_PUBLIC_*` env vars are limited strictly to the public API base URL and similarly non-sensitive runtime config — never tokens, never internal service URLs.
- `.env.local` is gitignored; `.env.example` documents required variables with placeholder values only.
---
 
## 22. CI/CD Requirements
 
### 22.1 Required Pipeline Stages (every PR)
 
```yaml
# .github/workflows/ci.yml (excerpt)
jobs:
  install:
    steps: [checkout, setup-pnpm, pnpm install --frozen-lockfile]
  lint:
    steps: [eslint ., prettier --check .]
  typecheck:
    steps: [tsc --noEmit]
  openapi-contract-check:
    steps: [pnpm openapi:types, git diff --exit-code src/types/api.generated.ts]
  unit-test:
    steps: [vitest run --coverage]
  build:
    steps: [next build]
  e2e:
    needs: [build]
    steps: [playwright install --with-deps, playwright test]
  a11y-scan:
    needs: [build]
    steps: [axe-core scan against key routes]
  audit:
    steps: [pnpm audit --audit-level=high]
```
 
### 22.2 Merge Gates
 
A PR **cannot merge** unless all of the following pass:
 
```text
[ ] ESLint (zero errors; warnings tracked but non-blocking only if pre-approved)
[ ] Prettier check
[ ] tsc --noEmit (zero errors)
[ ] OpenAPI contract check (generated types match committed backend spec reference)
[ ] Unit + component test suite (coverage thresholds from Section 16.5 met)
[ ] Production build succeeds
[ ] Playwright E2E suite (critical journeys) passes
[ ] Accessibility scan: no new serious/critical violations
[ ] pnpm audit: no new high/critical advisories
[ ] Husky/lint-staged checks were satisfied at commit time (defense in depth, not a substitute for CI)
```
 
### 22.3 Preview Deployments
 
Every PR deploys to an isolated preview environment pointed at a staging backend, enabling reviewers (human or Codex) to interact with the actual UI before merge — critical for a portal this UI/workflow-heavy.
 
### 22.4 Branch & Release Strategy
 
- `main` is always deployable.
- Feature branches: `feat/<epic>-<short-desc>` (e.g., `feat/tenants-archive-flow`), matching the Epic naming in `HROS Super Admin Implementation Roadmap`.
- Conventional Commits (`feat:`, `fix:`, `chore:`, `test:`) are enforced via a commit-msg Husky hook, enabling automated changelog generation.
---
 
## 23. Dependency Management Rules
 
### 23.1 Package Manager
 
**pnpm** is mandatory. `package-lock.json`/`yarn.lock` must never be committed. CI installs with `--frozen-lockfile`.
 
### 23.2 Versioning Policy
 
- **Exact versions** (no `^`/`~`) for: Next.js, React, TypeScript, TanStack Query, TanStack Table, React Hook Form, Zod, Zustand, Recharts, the OpenAPI codegen tools — i.e., anything where a transitive minor/patch bump has historically caused subtle breakage in this class of app.
- **Caret ranges** permitted only for low-risk, well-behaved tooling (Prettier plugins, ESLint plugins) where patch updates are reliably non-breaking.
- All dependency bumps (manual or Renovate/Dependabot) go through the full CI gate (Section 22) before merge — no "drive-by" version bumps inside unrelated feature PRs.
### 23.3 Adding a New Dependency — Required Checklist
 
Before adding any new npm package:
 
```text
[ ] Is this capability already covered by an approved stack technology (Section 3)? If yes, do not add a new dependency.
[ ] Is the package actively maintained (commit activity within last 6 months, no critical open security advisories)?
[ ] Bundle size impact assessed (checked via bundlephobia or local build diff)?
[ ] Does it have first-class TypeScript types (own or via @types)?
[ ] Is it tree-shakeable / does it support ESM?
[ ] Has it been discussed/approved via an ADR addendum if it affects an architectural layer (Section 24)?
```
 
### 23.4 Forbidden Redundant Dependencies
 
To prevent stack drift, the following categories are **explicitly forbidden** because an approved tool already covers the need:
 
| Forbidden | Reason |
|---|---|
| `axios`, `ky`, `swr` | Superseded by `openapi-fetch` + TanStack Query (Section 9, 12) |
| `redux`, `redux-toolkit`, `mobx`, `recoil`, `jotai` | Superseded by Zustand (UI state) + TanStack Query (server state) (Section 8) |
| `formik`, `final-form` | Superseded by React Hook Form (Section 10) |
| `yup`, `joi`, `superstruct` | Superseded by Zod (Section 11) |
| `moment` | Use native `Intl`/`date-fns` (lightweight, tree-shakeable) if date utilities beyond native are needed |
| `material-ui`, `chakra-ui`, `ant-design`, `mantine` | Superseded by shadcn/ui + Radix + Tailwind (Section 3, ADR-FE-002) |
| `chart.js`, `victory`, `nivo`, `d3` (direct) | Superseded by Recharts for this portal's chart needs (Section 15) |
| `react-table` v7 (legacy) | Use `@tanstack/react-table` v8 only |
| `jest` | Superseded by Vitest (Section 16) |
| `cypress` | Superseded by Playwright (Section 16) |
 
---
 
## 24. Technology Decision Records (ADR)
 
### ADR-FE-001: In-Memory Access Token + HttpOnly Refresh Cookie (Rejecting localStorage)
 
**Context:** The portal handles multi-tenant billing metadata; an XSS payload that steals a `localStorage` token would grant the attacker the same access as the admin for up to 15 minutes (access token) or, worse, 30 days (refresh token) if both were stored client-readable.
 
**Decision:** Access token lives only in memory (Zustand, non-persisted). Refresh token is HttpOnly/Secure/SameSite=Strict, inaccessible to JS.
 
**Alternatives Considered:**
- `localStorage` for both tokens — simplest to implement, rejected due to XSS exposure.
- `sessionStorage` — marginally better (cleared on tab close) but still JS-readable; same XSS exposure profile.
- Cookies for both tokens with CSRF tokens for all requests — viable, but mixing a JS-readable short-lived access token cookie adds no benefit over in-memory storage while adding cookie-size/CORS complexity for the access token specifically.
**Consequence:** Requires a one-time silent-refresh bootstrap on every hard page load (Section 6.5), adding a small amount of initial-load latency/complexity, accepted as the correct trade-off for this risk profile.
 
---
 
### ADR-FE-002: shadcn/ui + Radix UI over a Monolithic Component Library
 
**Context:** Need an accessible, themeable component set for a data-dense admin portal (tables, forms, modals, slide-in panels, dropdowns, comboboxes).
 
**Decision:** shadcn/ui (copy-in components built on Radix UI primitives + Tailwind) is the component foundation.
 
**Alternatives Considered:**
- **Material UI**: comprehensive, but opinionated visual language fights Tailwind's utility-first model; harder to achieve the specific dense, brand-neutral admin aesthetic; larger runtime bundle; theming requires its own (non-Tailwind) theme object, creating two styling systems in one app.
- **Ant Design**: excellent admin-table/form components out of the box, but heavy bundle, CSS-in-JS runtime conflicts with Tailwind's build-time approach, and customizing beyond its design language is friction-heavy.
- **Chakra UI**: good accessibility and DX, but again a separate styling runtime/theme system parallel to Tailwind, and component ownership (can't easily eject/modify a component's internals) is worse than shadcn/ui's copy-in model.
- **Hand-rolled components on bare Radix**: rejected only because shadcn/ui already *is* this approach, pre-built and battle-tested — reinventing it would be wasted effort, not a meaningfully different architecture.
**Consequence:** Components are copied into `src/components/ui/` and become part of the codebase (not a black-box dependency) — the team owns and can modify them directly, but must also keep them in sync manually when upstream shadcn/ui templates improve (mitigated by periodic, deliberate re-sync passes, not automatic updates).
 
---
 
### ADR-FE-003: TanStack Query Mutations over Next.js Server Actions
 
**Context:** Next.js App Router offers Server Actions as a built-in mutation mechanism (`"use server"` functions callable directly from forms/components).
 
**Decision:** All mutations go through the typed OpenAPI service layer + TanStack Query `useMutation`, not Server Actions.
 
**Alternatives Considered:**
- **Server Actions calling the backend API directly**: would mean every mutation's request/response typing, error handling, and revalidation logic is split between a Next.js server function and the client — duplicating the typed-client benefits already provided by `openapi-fetch`, and losing TanStack Query's mature client-side cache-invalidation, optimistic-update, and retry primitives (Section 12) that this portal relies on extensively (Unsaved Changes drafts, optimistic toggles, granular invalidation).
- **Server Actions as a thin proxy that still uses TanStack Query on the client**: adds an unnecessary network hop (browser → Next.js server → backend) for every mutation, increasing latency for an admin tool where operators are doing many sequential actions (e.g., reviewing/approving multiple tenants).
**Consequence:** The Next.js server layer is used for **routing, layout, and auth/permission gating shells**, not as a mutation proxy. This keeps exactly one client-to-backend communication path (typed `openapi-fetch` client), simplifying mental model and debugging.
 
---
 
### ADR-FE-004: TanStack Table (Headless) over a Pre-Styled Data-Grid Library
 
**Context:** Need rich tables (server pagination, sorting, multi-select filters, column visibility, aggregate footers) for Tenants, Admins, Plans (catalog cards reuse list-state, not table-rendered), and Audit Logs.
 
**Decision:** TanStack Table (headless) + shadcn/ui `<Table>` primitives.
 
**Alternatives Considered:**
- **AG Grid**: extremely feature-rich (virtualization, Excel-like editing) but heavy bundle, separate licensing considerations for enterprise features, and its own styling system fights Tailwind.
- **MUI DataGrid**: tied to Material UI's design system (rejected per ADR-FE-002); Community edition lacks some needed features, Pro/Premium adds licensing cost for an internal tool where it's not justified at current scale (NFR-SC-01: 10,000+ tenants, paginated 10/page server-side — virtualization is not required at V1).
**Consequence:** More integration code is required per table (column defs, manual pagination wiring) compared to a batteries-included grid, but the team retains full control over markup (accessibility, Tailwind styling) and avoids licensing/bundle-size trade-offs inappropriate for this portal's actual scale requirements.
 
---
 
### ADR-FE-005: Zod as the Single Validation Source (Not Duplicating Backend Validation Logic)
 
**Context:** The backend already validates everything server-side (Go handler/use-case validation per backend `coding-conventions.md §10`). Should the frontend re-implement these same rules?
 
**Decision:** Yes — Zod schemas duplicate the *shape* of backend validation rules (required fields, format, ranges) for immediate UX feedback, but the frontend treats the backend's response as the **authoritative** outcome for anything involving server state (uniqueness, business rules dependent on other tenants' data) — see Section 11.2.
 
**Alternatives Considered:**
- **No client-side validation, rely entirely on server round-trip**: rejected — produces poor UX (every typo requires a network round trip) inappropriate for a form-heavy admin tool with 5-section wizards.
- **Generate Zod schemas automatically from the OpenAPI spec**: considered for the future (tools like `openapi-zod-client` exist) but rejected for V1 because the OpenAPI spec's validation annotations are not yet rich enough (per `06_APISpecification.md`, many business rules like "trial end > start date" are cross-field and documented only in prose, not in the schema) — hand-written Zod schemas remain necessary for these cases regardless, so full auto-generation would only cover a subset and add a build-step dependency for partial benefit. Revisit once backend OpenAPI schemas are annotated with full JSON Schema constraints.
**Consequence:** There is intentional, accepted duplication between backend validation and frontend Zod schemas. This duplication is mitigated by treating `04_AcceptanceCriteria.md` validation rules as the shared spec both sides implement against, and by always deferring to server error responses as the final word (Section 14.3).
 
---
 
## 25. Anti-Patterns and Forbidden Practices
 
The following are **forbidden** in this codebase. A PR exhibiting any of these should be rejected in review (including by Codex automated review):
 
```text
[ ] Storing any auth token in localStorage or sessionStorage
[ ] Using `any` (explicit or implicit) — use `unknown` + narrowing, or fix the generated type source
[ ] Hand-writing types for API request/response shapes instead of using generated OpenAPI types
[ ] Calling rawClient/openapi-fetch directly from a component or hook — must go through src/services/
[ ] Putting TanStack Query data into a Zustand store ("sync to global state")
[ ] Using useState for multi-field forms instead of React Hook Form
[ ] Writing validation logic in onSubmit instead of in the Zod schema
[ ] Implementing client-side pagination/sorting on a server-paginated endpoint's full unpaginated result
[ ] Treating a 403 from a privileged action as unreachable ("the UI already hides this") — must always handle gracefully
[ ] Making a destructive action (archive/cancel/remove) optimistic
[ ] Using dangerouslySetInnerHTML anywhere
[ ] Hardcoding error message strings in components instead of using the error-code lookup table
[ ] Hardcoding hex color values in chart/status-badge components instead of theme CSS variables
[ ] Building a new modal/dropdown/combobox from scratch instead of using Radix-backed shadcn/ui primitives
[ ] Adding a dependency from the forbidden list in Section 23.4
[ ] Cross-importing one feature's internals directly into another feature folder
[ ] Skipping the OpenAPI contract-check step locally before pushing (CI will catch it, but it wastes a cycle)
[ ] Committing `src/types/api.generated.ts` edits by hand
[ ] Using `getByTestId` as the default RTL query strategy
[ ] Shipping a new interactive surface without a corresponding error boundary at its route segment
[ ] Mixing snake_case API shapes directly into JSX without going through a feature mapper, where the component expects a stable camelCase view model
```
 
---
 