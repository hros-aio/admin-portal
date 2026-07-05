# Tasks: Password Reset UI

**Input**: Design documents from `/specs/002-password-reset-ui/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/ui-contract.md`, `quickstart.md`

**Tests**: Test tasks are included because the feature requires Zod validation and loading-state behavior to be independently verifiable.

**Organization**: Tasks are grouped by user story so each password reset page/form can be implemented and tested independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it touches different files or does not depend on incomplete tasks
- **[Story]**: Maps the task to a user story from `spec.md`
- Every task includes an exact file path

## Phase 1: Setup

**Purpose**: Confirm the existing auth UI and test conventions before story work begins.

- [x] T001 [P] Review existing React Hook Form and Zod form conventions in `src/features/auth/components/login-form.tsx`
- [x] T002 [P] Review existing auth route shell composition in `src/app/(auth)/forgot-password/page.tsx`
- [x] T003 [P] Review existing auth route shell composition in `src/app/(auth)/reset-password/page.tsx`

---

## Phase 2: Foundational

**Purpose**: Shared validation prerequisite needed by the reset confirmation form while keeping reset-token handling out of scope.

**CRITICAL**: Complete this phase before User Story 2. User Story 1 can proceed independently after Phase 1.

- [x] T004 [P] Add failing schema tests for visible-field reset password validation in `src/features/auth/schemas/auth.schema.test.ts`
- [x] T005 Implement `passwordResetFormSchema` and `PasswordResetFormInput` in `src/features/auth/schemas/auth.schema.ts`

**Checkpoint**: Reset-password UI validation schema is available without adding backend reset service behavior, URL token parsing, or placeholder token fabrication.

---

## Phase 3: User Story 1 - Request Password Reset (Priority: P1) MVP

**Goal**: Admin can reach `/forgot-password`, enter an email address, receive validation feedback, and submit a valid reset request payload through delegated form behavior.

**Independent Test**: Render the forgot-password form/page, submit valid and invalid email input, and verify delegated submission and loading-state behavior without contacting backend reset services.

### Tests for User Story 1

- [x] T006 [P] [US1] Add failing form tests for valid email submit, invalid email blocking, and loading disabled state in `src/features/auth/components/forgot-password-form.test.tsx`
- [x] T007 [P] [US1] Add failing page render test for the forgot-password route in `src/app/(auth)/forgot-password/page.test.tsx`

### Implementation for User Story 1

- [x] T008 [US1] Implement `ForgotPasswordForm` with React Hook Form, `passwordResetRequestSchema`, delegated submit, validation errors, and loading fieldset in `src/features/auth/components/forgot-password-form.tsx`
- [x] T009 [US1] Replace inline forgot-password form markup with `ForgotPasswordForm` while preserving the auth page shell in `src/app/(auth)/forgot-password/page.tsx`
- [ ] T010 [US1] Run and fix focused forgot-password tests for `src/features/auth/components/forgot-password-form.test.tsx` and `src/app/(auth)/forgot-password/page.test.tsx`

**Checkpoint**: User Story 1 is fully functional and testable independently.

---

## Phase 4: User Story 2 - Confirm Password Reset (Priority: P1)

**Goal**: Admin can reach `/reset-password`, enter a new password and confirmation, receive validation feedback, and submit a valid reset confirmation payload through delegated form behavior.

**Independent Test**: Render the reset-password form/page, submit valid, weak, blank, and mismatched password input, and verify delegated submission and loading-state behavior without contacting backend reset services or parsing reset tokens.

### Tests for User Story 2

- [x] T011 [P] [US2] Add failing form tests for valid matching password submit, weak password blocking, mismatched password blocking, password visibility toggle, and loading disabled state in `src/features/auth/components/reset-password-form.test.tsx`
- [x] T012 [P] [US2] Add failing page render test for the reset-password route in `src/app/(auth)/reset-password/page.test.tsx`

### Implementation for User Story 2

- [x] T013 [US2] Implement `ResetPasswordForm` with React Hook Form, `passwordResetFormSchema`, delegated submit, validation errors, password fields, and loading fieldset in `src/features/auth/components/reset-password-form.tsx`
- [x] T014 [US2] Replace inline reset-password form markup with `ResetPasswordForm` while preserving the auth page shell and excluding token/error-link behavior in `src/app/(auth)/reset-password/page.tsx`
- [ ] T015 [US2] Run and fix focused reset-password tests for `src/features/auth/schemas/auth.schema.test.ts`, `src/features/auth/components/reset-password-form.test.tsx`, and `src/app/(auth)/reset-password/page.test.tsx`

**Checkpoint**: User Story 2 is fully functional and testable independently.

---

## Phase 5: Polish & Cross-Cutting

**Purpose**: Validate both stories together and ensure the implementation remains scoped.

- [ ] T016 Run focused password reset UI test command from `specs/002-password-reset-ui/quickstart.md`
- [ ] T017 Run TypeScript type checking for the full project using `package.json`
- [x] T018 [P] Confirm no backend reset service, mutation hook, email delivery, URL token parsing, placeholder token fabrication, or token persistence was added outside `src/features/auth/components/`, `src/features/auth/schemas/`, and `src/app/(auth)/`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup. Blocks User Story 2 only.
- **User Story 1 (Phase 3)**: Can start after Setup and does not depend on Phase 2.
- **User Story 2 (Phase 4)**: Depends on Setup and Foundational.
- **Polish (Phase 5)**: Depends on completed target user stories.

### User Story Dependencies

- **US1 Request Password Reset**: Independent after Setup; MVP scope.
- **US2 Confirm Password Reset**: Independent after the visible-field reset password schema exists.

### Within Each User Story

- Write failing tests first.
- Implement the form component.
- Wire the route page to the component.
- Run the focused tests for that story.

## Parallel Opportunities

- T001, T002, and T003 can run in parallel.
- T004 can be prepared while US1 work begins because it touches schema tests only.
- T006 and T007 can run in parallel.
- T011 and T012 can run in parallel after T005.
- US1 implementation can proceed while Phase 2 prepares the reset-password schema.
- T016 and T017 can run in parallel after implementation is complete.

## Parallel Example: User Story 1

```bash
Task: "Add failing form tests for valid email submit, invalid email blocking, and loading disabled state in src/features/auth/components/forgot-password-form.test.tsx"
Task: "Add failing page render test for the forgot-password route in src/app/(auth)/forgot-password/page.test.tsx"
```

## Parallel Example: User Story 2

```bash
Task: "Add failing form tests for valid matching password submit, weak password blocking, mismatched password blocking, password visibility toggle, and loading disabled state in src/features/auth/components/reset-password-form.test.tsx"
Task: "Add failing page render test for the reset-password route in src/app/(auth)/reset-password/page.test.tsx"
```

## Implementation Strategy

### MVP First

1. Complete Phase 1.
2. Complete Phase 3 for User Story 1.
3. Validate `/forgot-password` independently.
4. Stop if only the reset request MVP is needed.

### Incremental Delivery

1. Complete Setup.
2. Deliver US1 forgot-password form and page.
3. Complete the reset-password visible-field schema prerequisite.
4. Deliver US2 reset-password form and page.
5. Run focused tests and type checking.

### Scope Guardrails

- Do not add backend reset API integration.
- Do not add TanStack Query mutation hooks.
- Do not parse reset tokens from the URL.
- Do not fabricate placeholder reset tokens.
- Do not add email delivery, success-screen, or invalid-link behavior.
- Do not persist authentication tokens.
