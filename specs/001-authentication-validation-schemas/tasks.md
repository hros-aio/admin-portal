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

## Dependencies & Execution Order

- T001 has no dependencies and can start immediately.

---

## Implementation Strategy

### MVP First

1. Complete T001.
2. Validate the file with `pnpm tsc --noEmit`.

---

## Notes

- Scope is limited to the schema file only.
- Do not create UI components, pages, routing, API client code, or authentication logic.
