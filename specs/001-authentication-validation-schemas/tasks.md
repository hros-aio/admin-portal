# Tasks: Authentication Validation Schemas

**Input**: Design documents from `/specs/001-authentication-validation-schemas/`

**Prerequisites**: plan.md (required), spec.md (required)

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Foundational

**Purpose**: Create the Zod validation schemas for the Authentication feature.

- [x] T001 Create `src/features/auth/schemas/auth.schema.ts` defining `loginSchema`, `mfaSchema`, `passwordResetRequestSchema`, `passwordResetConfirmSchema`, and `acceptInviteSchema`, and export inferred TypeScript types.

**Checkpoint**: All schemas are defined and inferred types are exported.

---

## Phase 2: Auth State Management & Layout Guards

**Purpose**: Implement the in-memory auth store and the authenticated-route layout guard.

- [x] T002 Create `src/features/auth/stores/auth-store.ts` with `accessToken` (string | null), `setToken(token)`, and `clearSession()`; do not use persistence middleware.
- [x] T003 Create `src/components/layout/auth-guard.tsx` that reads `accessToken` from `useAuthStore` and redirects to `/login` when unauthenticated; render children when authenticated.

**Checkpoint**: The auth store holds the token in memory and the guard redirects unauthenticated users.

---

## Phase 3: Silent Refresh API Interceptor

**Purpose**: Configure the OpenAPI fetch client to attach access tokens and silently refresh them on 401 responses.

- [x] T004 Add `src/features/auth/services/auth.service.ts` with `refreshSession()` calling `POST /v1/auth/refresh`, and extend `src/lib/api/auth-middleware.ts` to inject `Authorization`, intercept 401s, retry after refresh, redirect to `/login` on refresh failure, and deduplicate concurrent refresh attempts.

**Checkpoint**: Authenticated requests carry a Bearer token, a single 401 triggers at most one silent refresh, and refresh failure clears the session and redirects to login.

---

## Phase 4: Login UI Component

**Purpose**: Build the reusable visual login form using the existing auth validation schema and auth UI primitives.

- [x] T005 [US3] Create `src/features/auth/components/login-form.tsx` with React Hook Form, `zodResolver(loginSchema)`, email/password/remember controls, SSO and biometrics placeholders, `onSubmit`, and `isLoading`.
- [x] T006 [P] [US3] Add component tests in `src/features/auth/components/login-form.test.tsx` for submit payload, password visibility toggle, and loading disabled state.

**Checkpoint**: The login form validates with the shared schema, delegates submission to its prop, and has no API call implementation.

---

## Dependencies & Execution Order

- T001 has no dependencies and can start immediately.
- T002 has no dependencies and can start immediately.
- T003 depends on T002.
- T004 depends on T002.
- T005 depends on T001.
- T006 depends on T005.

---

## Implementation Strategy

### MVP First

1. Complete T001.
2. Complete T002.
3. Complete T003.
4. Complete T004.
5. Complete T005.
6. Complete T006.
7. Validate with `pnpm tsc --noEmit` and targeted component tests.

---

## Notes

- T001 scope is limited to the schema file only.
- T002/T003 scope is limited to the auth store and layout guard; no pages, routing changes, API client changes, or authentication business logic.
- T004 scope is limited to the auth service and existing auth middleware; no pages, routing changes, or new API client code.
- T005 scope is limited to the visual login form; no API calls or route wiring.
