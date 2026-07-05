# Tasks: Password Reset Integration

**Input**: Design documents from `/specs/003-password-reset-integration/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/backend-contract.md`, `contracts/ui-contract.md`, `quickstart.md`

**Tests**: Test tasks are included because the feature requires API integration behavior, success feedback, redirects, loading states, and reset-specific error handling to be independently verifiable.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of reset request, successful reset confirmation, and invalid reset confirmation handling.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it touches different files or does not depend on incomplete tasks
- **[Story]**: Maps the task to a user story from `spec.md`
- Every task includes an exact file path

## Phase 1: Setup

**Purpose**: Confirm existing auth API, hook, toast, and page conventions before implementation.

- [x] T001 [P] Review generated password reset endpoint types in `src/types/api.generated.ts`
- [x] T002 [P] Review existing auth service request/error conventions in `src/features/auth/services/auth.service.ts`
- [x] T003 [P] Review existing auth mutation hook conventions in `src/features/auth/hooks/use-login.ts`
- [x] T004 [P] Review existing password reset route/page composition in `src/app/(auth)/forgot-password/page.tsx` and `src/app/(auth)/reset-password/page.tsx`

---

## Phase 2: Foundational

**Purpose**: Add shared typed backend reset service methods required by all password reset integration stories.

**CRITICAL**: Complete this phase before all user story phases.

- [x] T005 [P] Add failing service tests for reset request and reset confirmation POST calls in `src/features/auth/services/auth.service.test.ts`
- [x] T006 Add `requestPasswordReset` and `confirmPasswordReset` methods using generated reset request/confirm types in `src/features/auth/services/auth.service.ts`
- [ ] T007 Run and fix focused auth service tests in `src/features/auth/services/auth.service.test.ts`

**Checkpoint**: Typed auth service methods exist and preserve backend reset error codes as `ApiError`.

---

## Phase 3: User Story 1 - Request Reset Instructions (Priority: P1) MVP

**Goal**: Admin submits the forgot-password form and receives generic non-enumerating success feedback while duplicate submissions are prevented.

**Independent Test**: Render `/forgot-password`, submit a valid email, and verify reset request mutation, generic "If an account exists..." success feedback, and loading disabled state without revealing account existence.

### Tests for User Story 1

- [x] T008 [P] [US1] Add failing hook tests for generic request success and safe request failure feedback in `src/features/auth/hooks/use-password-reset.test.tsx`
- [x] T009 [P] [US1] Add failing page tests for forgot-password submit, generic success feedback, and pending disabled state in `src/app/(auth)/forgot-password/page.test.tsx`

### Implementation for User Story 1

- [x] T010 [US1] Implement `useRequestPasswordReset` mutation with generic success and safe error feedback in `src/features/auth/hooks/use-password-reset.ts`
- [x] T011 [US1] Wire `useRequestPasswordReset` into the forgot-password page and pass pending state to the form in `src/app/(auth)/forgot-password/page.tsx`
- [ ] T012 [US1] Run and fix focused request flow tests for `src/features/auth/hooks/use-password-reset.test.tsx` and `src/app/(auth)/forgot-password/page.test.tsx`

**Checkpoint**: User Story 1 is independently functional and testable.

---

## Phase 4: User Story 2 - Confirm Reset With Valid Token (Priority: P1)

**Goal**: Admin opens `/reset-password?token=...`, submits a valid new password, and is redirected to `/login` with password-updated success feedback after successful confirmation.

**Independent Test**: Render `/reset-password` with a token, submit valid matching passwords, and verify token is passed to confirmation, success toast appears, and navigation goes to `/login`.

### Tests for User Story 2

- [x] T013 [P] [US2] Add failing hook tests for successful reset confirmation toast and `/login` redirect in `src/features/auth/hooks/use-password-reset.test.tsx`
- [x] T014 [P] [US2] Add failing page tests for extracting the `token` search parameter and submitting confirmation values in `src/app/(auth)/reset-password/page.test.tsx`

### Implementation for User Story 2

- [x] T015 [US2] Implement `useConfirmPasswordReset` success behavior with success toast and `/login` navigation in `src/features/auth/hooks/use-password-reset.ts`
- [x] T016 [US2] Read `token` search parameter and submit token plus reset form values from `src/app/(auth)/reset-password/page.tsx`
- [ ] T017 [US2] Run and fix focused successful confirmation tests for `src/features/auth/hooks/use-password-reset.test.tsx` and `src/app/(auth)/reset-password/page.test.tsx`

**Checkpoint**: User Story 2 is independently functional and testable when a valid token is present.

---

## Phase 5: User Story 3 - Handle Invalid Reset Confirmation (Priority: P1)

**Goal**: Admin sees clear, safe feedback for missing, expired, used, or weak-password reset attempts without completing confirmation.

**Independent Test**: Render reset-password failure states and simulate `TOKEN_EXPIRED`, `TOKEN_USED`, and `PASSWORD_WEAK` responses; verify explicit link errors or password feedback and no redirect.

### Tests for User Story 3

- [x] T018 [P] [US3] Add failing hook tests for `TOKEN_EXPIRED`, `TOKEN_USED`, `PASSWORD_WEAK`, and unexpected confirmation errors in `src/features/auth/hooks/use-password-reset.test.tsx`
- [x] T019 [P] [US3] Add failing page tests for missing-token and expired-token reset-password messages in `src/app/(auth)/reset-password/page.test.tsx`

### Implementation for User Story 3

- [x] T020 [US3] Expose mapped reset confirmation error state for expired token, used token, weak password, and unexpected errors in `src/features/auth/hooks/use-password-reset.ts`
- [x] T021 [US3] Render missing-token, expired-token, used-token, and weak-password feedback on the reset-password page in `src/app/(auth)/reset-password/page.tsx`
- [ ] T022 [US3] Run and fix focused invalid confirmation tests for `src/features/auth/hooks/use-password-reset.test.tsx` and `src/app/(auth)/reset-password/page.test.tsx`

**Checkpoint**: User Story 3 is independently functional and testable for expected reset failure states.

---

## Phase 6: Polish & Cross-Cutting

**Purpose**: Validate the full scoped feature and confirm no unrelated epic work was introduced.

- [ ] T023 Run focused password reset integration test command from `specs/003-password-reset-integration/quickstart.md`
- [ ] T024 Run TypeScript type checking for the full project using `package.json`
- [x] T025 [P] Confirm no email delivery, reset-token persistence, new auth session behavior, login/MFA/biometric/invite changes, or raw client calls outside `src/features/auth/services/auth.service.ts`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup and blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational.
- **User Story 2 (Phase 4)**: Depends on Foundational.
- **User Story 3 (Phase 5)**: Depends on Foundational; can be implemented after or alongside US2 if hook/page contracts are coordinated.
- **Polish (Phase 6)**: Depends on completed target stories.

### User Story Dependencies

- **US1 Request Reset Instructions**: MVP after Foundational; no dependency on US2 or US3.
- **US2 Confirm Reset With Valid Token**: Can start after Foundational; no dependency on US1.
- **US3 Handle Invalid Reset Confirmation**: Can start after Foundational; shares `useConfirmPasswordReset` and reset page with US2, so coordinate file edits.

### Within Each User Story

- Write failing tests first.
- Implement hook behavior.
- Wire page behavior.
- Run focused tests for that story.

## Parallel Opportunities

- T001, T002, T003, and T004 can run in parallel.
- T008 and T009 can run in parallel after Foundational.
- T013 and T014 can run in parallel after Foundational.
- T018 and T019 can run in parallel after Foundational.
- US1 and US2 can proceed in parallel after Foundational if edits are coordinated by file.
- T023 and T024 can run in parallel after implementation.

## Parallel Example: User Story 1

```bash
Task: "Add failing hook tests for generic request success and safe request failure feedback in src/features/auth/hooks/use-password-reset.test.tsx"
Task: "Add failing page tests for forgot-password submit, generic success feedback, and pending disabled state in src/app/(auth)/forgot-password/page.test.tsx"
```

## Parallel Example: User Story 2

```bash
Task: "Add failing hook tests for successful reset confirmation toast and /login redirect in src/features/auth/hooks/use-password-reset.test.tsx"
Task: "Add failing page tests for extracting the token search parameter and submitting confirmation values in src/app/(auth)/reset-password/page.test.tsx"
```

## Parallel Example: User Story 3

```bash
Task: "Add failing hook tests for TOKEN_EXPIRED, TOKEN_USED, PASSWORD_WEAK, and unexpected confirmation errors in src/features/auth/hooks/use-password-reset.test.tsx"
Task: "Add failing page tests for missing-token and expired-token reset-password messages in src/app/(auth)/reset-password/page.test.tsx"
```

## Implementation Strategy

### MVP First

1. Complete Phase 1.
2. Complete Phase 2.
3. Complete Phase 3 for User Story 1.
4. Validate reset request flow independently.

### Incremental Delivery

1. Add typed service methods.
2. Deliver US1 reset request flow.
3. Deliver US2 successful confirmation flow.
4. Deliver US3 expected failure handling.
5. Run focused tests and type checking.

### Scope Guardrails

- Do not implement email delivery or reset email content.
- Do not persist reset tokens in local storage, session storage, Zustand, or auth stores.
- Do not add new authentication session behavior.
- Do not modify login, MFA, biometric, accept-invite, or SSO flows except where existing shared tests require harmless compatibility.
- Do not call `rawClient` outside `src/features/auth/services/auth.service.ts`.
