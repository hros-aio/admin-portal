# Tasks: Authentication Validation Schemas

**Input**: Design documents from `/specs/001-authentication-validation-schemas/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Scope**: STRICTLY schema-only. Implement `src/features/auth/schemas/auth.schema.ts`, exported inferred TypeScript types, and co-located schema unit tests only.

**Explicitly Excluded**: UI components, pages, forms, React Hook Form, loading states, hooks, API integration, services, email flow, routing, and token parsing.

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup

**Purpose**: Confirm the schema-only implementation target and test location.

- [ ] T001 Review existing shared validation primitives in `src/lib/validation/primitives.ts` for reusable email and strong-password rules.
- [ ] T002 Create or confirm the co-located schema test file at `src/features/auth/schemas/auth.schema.test.ts`.

**Checkpoint**: The implementation target and test file are ready; no UI, page, hook, service, or route files are introduced.

---

## Phase 2: Foundational

**Purpose**: Establish imports and exports used by all schema tasks.

- [ ] T003 Define the Zod import and shared primitive imports in `src/features/auth/schemas/auth.schema.ts`.
- [ ] T004 Define exported inferred type placeholders or final type exports in `src/features/auth/schemas/auth.schema.ts` for `LoginInput`, `MfaInput`, `PasswordResetRequestInput`, `PasswordResetConfirmInput`, and `AcceptInviteInput`.

**Checkpoint**: The schema file has the required dependency imports and exported type surface, with no API or UI imports.

---

## Phase 3: User Story 1 - Validate Authentication Form Inputs (Priority: P1) MVP

**Goal**: Provide Zod schemas and inferred types for login, MFA, password reset request, password reset confirmation, and invitation acceptance payloads.

**Independent Test**: Run `pnpm test src/features/auth/schemas/auth.schema.test.ts` and verify each schema accepts valid payloads and rejects invalid payloads without UI or API dependencies.

### Tests for User Story 1

> Write or update these tests first and confirm they fail before completing implementation tasks.

- [ ] T005 [US1] Add `loginSchema` valid and invalid payload tests in `src/features/auth/schemas/auth.schema.test.ts`.
- [ ] T006 [US1] Add `mfaSchema` six-digit, short, long, and non-numeric code tests in `src/features/auth/schemas/auth.schema.test.ts`.
- [ ] T007 [US1] Add `passwordResetRequestSchema` valid, blank, and invalid email tests in `src/features/auth/schemas/auth.schema.test.ts`.
- [ ] T008 [US1] Add `passwordResetConfirmSchema` valid payload, blank token, weak password, blank confirmation, and mismatched confirmation tests in `src/features/auth/schemas/auth.schema.test.ts`.
- [ ] T009 [US1] Add `acceptInviteSchema` valid payload, weak password, and mismatched confirmation tests in `src/features/auth/schemas/auth.schema.test.ts`.

### Implementation for User Story 1

- [ ] T010 [US1] Implement `loginSchema` with `email`, `password`, and `remember_me` validation in `src/features/auth/schemas/auth.schema.ts`.
- [ ] T011 [US1] Implement `mfaSchema` with exactly six numeric digits validation in `src/features/auth/schemas/auth.schema.ts`.
- [ ] T012 [US1] Implement `passwordResetRequestSchema` using shared email validation in `src/features/auth/schemas/auth.schema.ts`.
- [ ] T013 [US1] Implement `passwordResetConfirmSchema` with token, strong password, confirmation, and password-match validation in `src/features/auth/schemas/auth.schema.ts`.
- [ ] T014 [US1] Implement `acceptInviteSchema` with the same token and password confirmation rules as password reset confirmation in `src/features/auth/schemas/auth.schema.ts`.
- [ ] T015 [US1] Export `LoginInput`, `MfaInput`, `PasswordResetRequestInput`, `PasswordResetConfirmInput`, and `AcceptInviteInput` from `src/features/auth/schemas/auth.schema.ts`.

**Checkpoint**: All five schemas and all five inferred types are implemented and tested independently.

---

## Phase 4: Polish & Validation

**Purpose**: Verify the schema-only implementation and guard against accidental scope expansion.

- [ ] T016 Run schema unit tests from `specs/001-authentication-validation-schemas/quickstart.md` with `pnpm test src/features/auth/schemas/auth.schema.test.ts`.
- [ ] T017 Run type checking from `specs/001-authentication-validation-schemas/quickstart.md` with `pnpm typecheck`.
- [ ] T018 Verify the final diff only touches `src/features/auth/schemas/auth.schema.ts` and `src/features/auth/schemas/auth.schema.test.ts` for implementation work.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup completion.
- **User Story 1 (Phase 3)**: Depends on Foundational completion.
- **Polish & Validation (Phase 4)**: Depends on User Story 1 completion.

### User Story Dependencies

- **User Story 1 (P1)**: No dependencies on other user stories. This is the only implementation story in scope for the current plan.

### Within User Story 1

- T005-T009 define the expected schema behavior and should be written before T010-T015.
- T010-T015 all update `src/features/auth/schemas/auth.schema.ts`; perform them sequentially to avoid same-file conflicts.
- T016-T018 validate after implementation.

### Parallel Opportunities

- No same-file test tasks are marked `[P]` because T005-T009 all edit `src/features/auth/schemas/auth.schema.test.ts`.
- No schema implementation tasks are marked `[P]` because T010-T015 all edit `src/features/auth/schemas/auth.schema.ts`.
- A reviewer can inspect T018 scope while validation commands run after implementation.

---

## Implementation Strategy

### MVP First

1. Complete Phase 1 and Phase 2.
2. Complete all User Story 1 tests in `src/features/auth/schemas/auth.schema.test.ts`.
3. Implement the schemas and inferred types in `src/features/auth/schemas/auth.schema.ts`.
4. Run the quickstart validation commands.
5. Stop. Do not continue into UI, pages, hooks, services, API integration, routing, email flow, or token parsing.

### Incremental Delivery

1. Add tests for one schema.
2. Implement that schema and its inferred type.
3. Repeat for the remaining schemas.
4. Run full schema test file and typecheck.

## Notes

- Each task includes an exact file path.
- All implementation tasks map to the single in-scope story, US1.
- Later auth epic work present in the broader specification is intentionally excluded by the current implementation plan.
- Do not modify `src/types/api.generated.ts`.
- Do not create component, hook, service, route, or form files.
