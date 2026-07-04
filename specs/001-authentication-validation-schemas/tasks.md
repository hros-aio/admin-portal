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

---

## Phase 5: Login Business Logic & Hook

**Purpose**: Connect the reusable login form to the credential-login API through feature-scoped business logic.

- [x] T007 Add `login()` to `src/features/auth/services/auth.service.ts` that calls `POST /v1/auth/login`, returns the typed login response, and throws `ApiError` for backend errors or empty responses.
- [x] T008 [P] Add service tests in `src/features/auth/services/auth.service.test.ts` for `login()` success, backend error, and empty response paths.
- [x] T009 Create `src/features/auth/hooks/use-login.ts` using TanStack Query `useMutation`; on successful `access_token`, update `useAuthStore` and redirect to `/dashboard`; on `ACCOUNT_LOCKED`, show the locked-account toast; otherwise show "Invalid email or password".
- [x] T010 Wire `useLogin()` into `src/app/(auth)/login/page.tsx` and pass mutation submit/loading state to `LoginForm`.

**Checkpoint**: Submitting the login page uses the credential-login API, stores the access token in memory on success, redirects to the dashboard, and shows the required toast messages on failure.

---

## Phase 5 Dependencies & Execution Order

- T007 depends on T004 because it extends the existing auth service.
- T008 depends on T007 and may run independently from page wiring after the service signature is defined.
- T009 depends on T007, T002, and the project toast provider.
- T010 depends on T005 and T009.

## Phase 5 Implementation Strategy

1. Complete T007.
2. Complete T008.
3. Complete T009.
4. Complete T010.
5. Validate with `pnpm typecheck`, targeted auth service tests, and relevant hook or page tests.

## Phase 5 Notes

- Keep API calls out of `LoginForm`; it remains a visual form with delegated submission.
- Keep access tokens in the in-memory auth store only.
- Do not implement MFA, SSO, biometrics, or password reset flows as part of Phase 5.

---

## Phase 6: MFA Challenge Flow

**Purpose**: Complete the Super Admin MFA challenge step when credential login returns an MFA token.

- [x] T011 [US5] Create `src/features/auth/components/mfa-challenge-form.tsx` with React Hook Form, `zodResolver(mfaSchema)`, an `mfaToken` prop, TOTP code input, delegated `onSubmit`, and `isLoading`.
- [x] T012 [P] [US5] Add component tests in `src/features/auth/components/mfa-challenge-form.test.tsx` for valid submit payload, validation errors, and loading disabled state.
- [x] T013 Add `verifyMfa()` to `src/features/auth/services/auth.service.ts` that calls `POST /auth/mfa/verify` with `{ mfa_token, method: 'totp', code }`, returns the typed response, and throws `ApiError` for backend errors or empty responses.
- [x] T014 [P] Add service tests in `src/features/auth/services/auth.service.test.ts` for `verifyMfa()` success, expected request payload, backend error, and empty response paths.
- [x] T015 Create `src/features/auth/hooks/use-verify-mfa.ts` using TanStack Query `useMutation`; on successful `access_token`, update `useAuthStore` and redirect to `/dashboard`; on verification failure, show a clear MFA verification error.
- [x] T016 Update `src/features/auth/hooks/use-login.ts` so credential-login success with `mfa_token` exposes or returns the MFA challenge state without storing an access token or redirecting.
- [x] T017 Update `src/app/(auth)/login/page.tsx` to conditionally render `MfaChallengeForm` instead of `LoginForm` when an MFA challenge token is present, and wire `useVerifyMfa()` submit/loading state into the MFA form.
- [x] T018 [P] Add hook or route-level tests verifying `mfa_token` switches the login page to the MFA challenge, successful MFA verification stores the access token and redirects to `/dashboard`, and failed verification remains on the challenge.

**Checkpoint**: A Super Admin whose credential login requires MFA sees the TOTP challenge, can verify it, receives an in-memory access token, and lands on the dashboard.

---

## Phase 6 Dependencies & Execution Order

- T011 depends on T001 because it uses the shared MFA validation schema.
- T012 depends on T011.
- T013 depends on T004 because it extends the existing auth service.
- T014 depends on T013 and may run independently from page wiring after the service signature is defined.
- T015 depends on T013, T002, and the project toast provider.
- T016 depends on T009 and the agreed login response shape that can include `mfa_token`.
- T017 depends on T011, T015, and T016.
- T018 depends on T015, T016, and T017.

## Phase 6 Implementation Strategy

1. Complete T011.
2. Complete T013.
3. Complete T015.
4. Complete T016.
5. Complete T017.
6. Add T012, T014, and T018 coverage.
7. Validate with `pnpm typecheck`, targeted auth service tests, and relevant component or route tests.

## Phase 6 Notes

- Keep API calls out of `MfaChallengeForm`; it remains a visual form with delegated submission.
- Keep access tokens in the in-memory auth store only.
- MFA scope is limited to TOTP verification for this phase; SSO, biometrics, backup codes, and MFA enrollment are out of scope.
- The old standalone `/mfa-verification` page is removed so the login MFA challenge is the only MFA verification surface.
