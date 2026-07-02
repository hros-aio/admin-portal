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

## Dependencies & Execution Order

- T001 has no dependencies and can start immediately.
- T002 has no dependencies and can start immediately.
- T003 depends on T002.

---

## Implementation Strategy

### MVP First

1. Complete T001.
2. Complete T002.
3. Complete T003.
4. Validate with `pnpm tsc --noEmit`.

---

## Notes

- T001 scope is limited to the schema file only.
- T002/T003 scope is limited to the auth store and layout guard; no pages, routing changes, API client changes, or authentication business logic.
