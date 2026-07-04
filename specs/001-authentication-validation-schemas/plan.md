# Implementation Plan: Authentication Validation Schemas

**Branch**: `001-authentication-validation-schemas` | **Date**: 2026-07-02 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-authentication-validation-schemas/spec.md`

## Summary

Create a feature-scoped Zod schema file at `src/features/auth/schemas/auth.schema.ts` that defines and exports schemas and inferred types for login, MFA, password reset, and invitation acceptance forms. Additionally, implement an in-memory auth store, a layout guard that redirects unauthenticated users to `/login`, silent refresh request handling, a reusable visual login form component, and credential-login business logic that connects the login page to the authentication API.

## Technical Context

**Language/Version**: TypeScript 5.x

**Primary Dependencies**: Zod, Zustand, Next.js, React Hook Form, @hookform/resolvers, Tailwind CSS

**Storage**: In-memory only (no persistence for access tokens per ADR-FE-001).

**Testing**: Vitest

**Target Platform**: Next.js frontend

**Project Type**: Web application

**Performance Goals**: N/A

**Constraints**: Frontend only. Phase 4 must not implement the login API call; the login form receives a submit callback and loading state from its consumer.

**Scale/Scope**: Schema file, auth store, layout guard, silent refresh service/middleware, login form component, credential-login hook, and login page wiring for the Authentication feature.

## Constitution Check

_GATE: Must pass before implementation._

- P1 Type-safety: Schemas export inferred TypeScript types; store and guard are typed. ✅
- P1 Type-safety: Login form props and submitted values use the inferred login schema type. ✅
- P3 Feature-based modularity: Schema and store live under `src/features/auth/`. ✅
- No forbidden practices: Validation lives in Zod schemas, not `onSubmit`. ✅
- Token storage: Access token is kept in memory only; no persistence middleware. ✅
- Form rules: Login form uses React Hook Form + Zod and delegates API behavior to its consumer. ✅
- Login business logic: API submission stays in a feature hook/service and not inside the visual login form. ✅

## Project Structure

### Documentation (this feature)

```text
specs/001-authentication-validation-schemas/
├── spec.md
├── plan.md
└── tasks.md
```

### Source Code (repository root)

```text
src/features/auth/schemas/
├── .gitkeep
└── auth.schema.ts

src/features/auth/components/
└── login-form.tsx

src/features/auth/stores/
└── auth-store.ts

src/features/auth/services/
└── auth.service.ts

src/features/auth/hooks/
└── use-login.ts

src/components/layout/
├── .gitkeep
└── auth-guard.tsx
```

**Structure Decision**: Single-project Next.js frontend. The schema and store files live in their respective feature folders following the `src/features/<feature>/<category>/` convention. The layout guard is placed in `src/components/layout/` as a shared route-protection primitive.

## Phase 3: Silent Refresh API Interceptor

### Goal

Extend the existing `authMiddleware` so that every authenticated request carries the in-memory access token, a 401 response triggers a single silent refresh via `authService.refreshSession()`, the original request is retried with the new token, and refresh failure clears the session and redirects to `/login`. Concurrent 401s must share one refresh attempt.

### Changes

- Create `src/features/auth/services/auth.service.ts` with `authService.refreshSession()`.
- Update `src/lib/api/auth-middleware.ts`:
  - Preserve existing `Authorization: Bearer <accessToken>` injection from `useAuthStore`.
  - Add `onResponse` handling for 401 responses.
  - Skip refresh for the refresh endpoint itself to avoid loops.
  - Deduplicate concurrent refresh attempts with a shared promise.
  - Update `useAuthStore.getState().setToken` after a successful refresh.
  - Retry the original request with the new token.
  - Call `useAuthStore.getState().clearSession()` and redirect to `/login` when refresh fails.

### Tests

- Unit test `authService.refreshSession` for success and failure paths.
- Unit test the middleware's token injection, 401 retry, refresh failure redirect, and refresh deduplication.

## Phase 4: Login UI Component

### Goal

Create a reusable visual `LoginForm` component that validates with `loginSchema`, renders the email/password/session controls, exposes placeholder SSO and biometrics buttons, and delegates submission to a supplied callback.

### Changes

- Create `src/features/auth/components/login-form.tsx`.
- Use React Hook Form with `zodResolver(loginSchema)` and the inferred `LoginInput` type.
- Render:
  - Email input.
  - Password input with visibility toggle.
  - "Keep me logged in for 30 days" checkbox mapped to `remember_me`.
  - Submit button.
  - Placeholder "Continue with SSO" and "Use Biometrics" buttons.
- Accept `onSubmit` and `isLoading` props.
- Disable all interactive form controls while `isLoading` is true.
- Do not call authentication APIs from this component.

### Tests

- Component test validates rendering, successful submit payload, password visibility toggle, and disabled loading state.

## Phase 5: Login Business Logic & Hook

### Goal

Connect the reusable `LoginForm` to the backend credential-login endpoint through a feature-scoped service method and TanStack Query mutation hook. Successful login responses that contain an access token update the in-memory auth store and redirect to `/dashboard`. Login failures show either the locked-account toast or the generic invalid-credentials toast.

### Changes

- Extend `src/features/auth/services/auth.service.ts` with `authService.login()` that calls `POST /v1/auth/login`.
- Create `src/features/auth/hooks/use-login.ts`:
  - Use TanStack Query `useMutation`.
  - Submit the validated login payload through `authService.login()`.
  - On success, check for `access_token`.
  - If `access_token` exists, call `useAuthStore` token setter and redirect to `/dashboard`.
  - On error, map `ACCOUNT_LOCKED` to a specific account-locked toast.
  - For all other errors, show "Invalid email or password".
- Update `src/app/(auth)/login/page.tsx` to use `useLogin()` and pass its submit/loading state into `LoginForm`.

### Tests

- Unit test `authService.login` for success, API error, and empty response paths.
- Hook or route-level test verifies success updates auth state and navigates to `/dashboard`.
- Hook or route-level test verifies `ACCOUNT_LOCKED` and generic login errors show the correct toast messages.

## Complexity Tracking

No constitution violations anticipated. The layout guard and auth middleware import from the auth feature store; this is a deliberate cross-cutting concern analogous to the existing `src/lib/api/auth-middleware.ts`.
