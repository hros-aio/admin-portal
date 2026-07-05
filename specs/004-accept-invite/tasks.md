# Tasks: Accept Invite UI & Logic

**Input**: Design documents from `/specs/004-accept-invite/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Included because the plan and constitution require focused service, hook, form, schema/page tests for this auth flow.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it touches different files and has no dependency on incomplete tasks in the same phase.
- **[Story]**: Maps to user stories from `spec.md`.
- Every task includes an exact file path.

## Phase 1: Setup

**Purpose**: Confirm existing accept-invite contract and auth patterns before implementation.

- [x] T001 Verify generated accept-invite request/response types and path in `src/types/api.generated.ts`
- [x] T002 Verify existing password complexity schema and accept-invite schema alias in `src/features/auth/schemas/auth.schema.ts`
- [x] T003 Verify existing static accept-invite route state in `src/app/(auth)/accept-invite/page.tsx`

---

## Phase 2: Foundational

**Purpose**: Add the typed backend boundary and reusable mutation foundation required by all user stories.

**CRITICAL**: No user story implementation should start until this phase is complete.

- [x] T004 [P] Add accept-invite service tests for success and preserved `INVITE_EXPIRED`/`INVITE_USED` errors in `src/features/auth/services/auth.service.test.ts`
- [x] T005 Add generated `AcceptInviteRequest` and `AcceptInviteResponse` type aliases plus `authService.acceptInvite` in `src/features/auth/services/auth.service.ts`
- [x] T006 [P] Add `useAcceptInvite` hook tests for success redirect, success toast, and mapped `INVITE_EXPIRED`/`INVITE_USED`/`PASSWORD_WEAK`/unknown states in `src/features/auth/hooks/use-accept-invite.test.tsx`
- [x] T007 Implement `useAcceptInvite` mutation, invite error mapping, success toast, and `/login` redirect in `src/features/auth/hooks/use-accept-invite.ts`

**Checkpoint**: Service and hook can be tested without page or form UI.

---

## Phase 3: User Story 1 - Accept Valid Invitation (Priority: P1) MVP

**Goal**: A newly invited administrator can open a valid invitation link, submit a compliant password, activate the account, and be redirected to login with success feedback.

**Independent Test**: Open `/accept-invite?token=invite-token`, submit a strong matching password, and verify the hook receives token/password values and success behavior redirects to `/login` with a success toast.

### Tests for User Story 1

- [x] T008 [P] [US1] Add successful submit test for token, password, and confirmation in `src/features/auth/components/accept-invite-form.test.tsx`
- [x] T009 [P] [US1] Add page test for rendering valid-token accept-invite flow and submitting token through the hook in `src/app/(auth)/accept-invite/page.test.tsx`

### Implementation for User Story 1

- [x] T010 [US1] Create `AcceptInviteForm` with React Hook Form, `acceptInviteSchema`, password fields, strength feedback, and submit button in `src/features/auth/components/accept-invite-form.tsx`
- [x] T011 [US1] Replace static route form with Suspense-wrapped token reading and `AcceptInviteForm` composition in `src/app/(auth)/accept-invite/page.tsx`
- [x] T012 [US1] Wire valid-token form submission to `useAcceptInvite().mutate` with token, password, and confirmation in `src/app/(auth)/accept-invite/page.tsx`

**Checkpoint**: User Story 1 is independently functional and testable.

---

## Phase 4: User Story 2 - Validate Password Before Activation (Priority: P1)

**Goal**: The accept-invite form blocks weak passwords and mismatched confirmations before activation submission.

**Independent Test**: Submit weak and mismatched passwords on the accept-invite form and verify validation feedback appears and no activation mutation is called.

### Tests for User Story 2

- [x] T013 [P] [US2] Add weak-password validation test for `acceptInviteSchema` in `src/features/auth/schemas/auth.schema.test.ts`
- [x] T014 [P] [US2] Add mismatched-password validation test for `acceptInviteSchema` in `src/features/auth/schemas/auth.schema.test.ts`
- [x] T015 [P] [US2] Add weak-password and mismatched-password blocked-submit tests in `src/features/auth/components/accept-invite-form.test.tsx`
- [x] T016 [P] [US2] Add loading-state disabled controls test in `src/features/auth/components/accept-invite-form.test.tsx`

### Implementation for User Story 2

- [x] T017 [US2] Preserve `acceptInviteSchema` token, strong password, and matching confirmation validation exports in `src/features/auth/schemas/auth.schema.ts`
- [x] T018 [US2] Ensure `AcceptInviteForm` displays schema validation messages and caller-provided password errors in `src/features/auth/components/accept-invite-form.tsx`
- [x] T019 [US2] Ensure `AcceptInviteForm` disables fields, visibility toggles, and submit button while loading in `src/features/auth/components/accept-invite-form.tsx`

**Checkpoint**: User Story 2 validation behavior is independently functional and testable.

---

## Phase 5: User Story 3 - Handle Invalid Invitation Link (Priority: P1)

**Goal**: Missing, expired, used, weak-password, and unexpected invitation failures show clear feedback without activating the account.

**Independent Test**: Render `/accept-invite` without a token and with hook error states for expired/used/weak/unknown failures, then verify the expected messages, no incorrect redirect, and no submittable form when token is missing.

### Tests for User Story 3

- [x] T020 [P] [US3] Add missing-token page test that renders an invitation-link error and no form in `src/app/(auth)/accept-invite/page.test.tsx`
- [x] T021 [P] [US3] Add expired-invite page test that renders "This invitation has expired..." in `src/app/(auth)/accept-invite/page.test.tsx`
- [x] T022 [P] [US3] Add used-invite and unknown-error page tests in `src/app/(auth)/accept-invite/page.test.tsx`
- [x] T023 [P] [US3] Add weak-password page test that maps hook state to password-field feedback in `src/app/(auth)/accept-invite/page.test.tsx`

### Implementation for User Story 3

- [x] T024 [US3] Add missing-token, expired, used, weak-password, and unknown error-banner state handling in `src/app/(auth)/accept-invite/page.tsx`
- [x] T025 [US3] Remove static Acme/email/role mock invitation content from `src/app/(auth)/accept-invite/page.tsx`
- [x] T026 [US3] Ensure `useAcceptInvite` does not redirect on `INVITE_EXPIRED`, `INVITE_USED`, `PASSWORD_WEAK`, or unknown failures in `src/features/auth/hooks/use-accept-invite.ts`

**Checkpoint**: User Story 3 invalid-link and mapped-error behavior is independently functional and testable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and scope guard.

- [ ] T027 Run focused feature tests with `pnpm test src/features/auth/services/auth.service.test.ts src/features/auth/hooks/use-accept-invite.test.tsx src/features/auth/components/accept-invite-form.test.tsx 'src/app/(auth)/accept-invite/page.test.tsx'`
- [ ] T028 Run type checking with `pnpm typecheck` against `tsconfig.json`
- [ ] T029 Run linting with `pnpm lint` against `eslint.config.mjs`
- [x] T030 Verify no invitation creation, invitation management, invitation email delivery, invite preview lookup, or unrelated auth changes were added outside scoped files listed in `specs/004-accept-invite/plan.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational completion.
- **User Story 2 (Phase 4)**: Depends on Foundational completion and can be validated at form/schema level; it may reuse `AcceptInviteForm` from US1 if implemented sequentially.
- **User Story 3 (Phase 5)**: Depends on Foundational completion and can be validated at page/hook error-state level; it may reuse `AcceptInviteForm` from US1 if implemented sequentially.
- **Polish (Phase 6)**: Depends on selected user stories being complete.

### User Story Dependencies

- **US1 - Accept Valid Invitation**: MVP path; can start after Foundational.
- **US2 - Validate Password Before Activation**: Can start after Foundational; form implementation is easiest after T010.
- **US3 - Handle Invalid Invitation Link**: Can start after Foundational; page implementation is easiest after T011.

### Within Each User Story

- Write listed tests before implementation tasks.
- Complete implementation tasks in ID order when multiple tasks touch the same file.
- Stop at each checkpoint and run that story's focused tests before moving on.

### Parallel Opportunities

- T004 and T006 can run in parallel because they touch service and hook test files.
- T008 and T009 can run in parallel because they touch form and page test files.
- T013/T014 and T015/T016 can run in parallel because schema tests and form tests are separate files.
- T020/T021/T022/T023 can be drafted in parallel if coordinated because they target the same page test file sections; merge carefully.
- US2 and US3 can proceed in parallel after Foundational if one developer owns form/schema files and another owns page error-state files.

---

## Parallel Example: User Story 1

```bash
Task: "Add successful submit test for token, password, and confirmation in src/features/auth/components/accept-invite-form.test.tsx"
Task: "Add page test for rendering valid-token accept-invite flow and submitting token through the hook in src/app/(auth)/accept-invite/page.test.tsx"
```

## Parallel Example: User Story 2

```bash
Task: "Add weak-password validation test for acceptInviteSchema in src/features/auth/schemas/auth.schema.test.ts"
Task: "Add weak-password and mismatched-password blocked-submit tests in src/features/auth/components/accept-invite-form.test.tsx"
```

## Parallel Example: User Story 3

```bash
Task: "Add missing-token page test that renders an invitation-link error and no form in src/app/(auth)/accept-invite/page.test.tsx"
Task: "Add expired-invite page test that renders This invitation has expired... in src/app/(auth)/accept-invite/page.test.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 setup checks.
2. Complete Phase 2 service and hook foundation.
3. Complete Phase 3 valid-invitation flow.
4. Run focused service, hook, form, and page tests for US1.
5. Stop and validate that valid invitation acceptance redirects to `/login` with success feedback.

### Incremental Delivery

1. Add service and hook foundation.
2. Add US1 valid activation path.
3. Add US2 password validation hardening.
4. Add US3 invalid-link and mapped-error handling.
5. Run focused tests, typecheck, lint, and scope guard.

### Scope Guard

- Do not add invitation creation or admin management UI.
- Do not add invitation email delivery or resend behavior.
- Do not add invite preview API calls.
- Do not persist invitation tokens.
- Do not modify login, MFA, SSO, biometric, or password reset behavior except where shared auth tests require imports to compile.

## Notes

- [P] tasks indicate likely parallelism, not a requirement to execute in parallel.
- Tests are intentionally co-located with source files per repository convention.
- Use accessible RTL queries by default; avoid `getByTestId`.
- Keep all backend mutation calls inside `src/features/auth/services/auth.service.ts`.
