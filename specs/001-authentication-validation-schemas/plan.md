# Implementation Plan: Authentication Validation Schemas

**Branch**: `001-authentication-validation-schemas` | **Date**: 2026-07-05 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-authentication-validation-schemas/spec.md`

## Summary

Implement only the Authentication feature's Zod validation schemas and exported inferred TypeScript types in `src/features/auth/schemas/auth.schema.ts`, with co-located unit tests for valid and invalid payloads.

This implementation plan is strictly limited to the schema requirements in the specification:

- `FR-001`: login payload schema
- `FR-002`: MFA code payload schema
- `FR-003`: password reset request payload schema
- `FR-004`: password reset confirmation payload schema
- `FR-005`: invitation acceptance payload schema
- `FR-006`: exported inferred TypeScript types for each schema

No UI, pages, forms, React Hook Form integration, loading states, hooks, services, API integration, email flow, routing, or token parsing are part of this plan.

## Technical Context

**Language/Version**: TypeScript 5.x

**Primary Dependencies**: Zod

**Storage**: None

**Testing**: Vitest unit tests

**Target Platform**: Next.js frontend codebase

**Project Type**: Web application

**Performance Goals**: N/A

**Constraints**: Schema-only implementation. Use existing shared validation primitives where available. Do not introduce UI behavior, route behavior, service behavior, API calls, hooks, React Hook Form, loading states, token parsing, email flow, or generated API type changes.

**Scale/Scope**: One schema file and one co-located schema unit test file under the Authentication feature.

## Constitution Check

_GATE: Must pass before implementation._

- P1 Type-safety: Each schema exports an inferred TypeScript type. Pass.
- P3 Feature-based modularity: Auth schemas live under `src/features/auth/schemas/`. Pass.
- P6 Boring, explicit, predictable code: Use direct Zod object schemas and shared primitives without new abstractions. Pass.
- P8 Every non-trivial unit of logic is tested: Add unit tests for every schema's valid and invalid paths. Pass.
- P10 Single responsibility: Keep validation schemas in `auth.schema.ts`; keep tests in co-located `auth.schema.test.ts`. Pass.
- Non-negotiable form validation rule: Validation logic lives in Zod schemas. Pass.
- Forbidden practices: No `any`, no hand-written API types, no API client usage, no token storage, no React Hook Form, no UI implementation. Pass.

## Project Structure

### Documentation (this feature)

```text
specs/001-authentication-validation-schemas/
├── data-model.md
├── plan.md
├── quickstart.md
├── research.md
├── spec.md
└── tasks.md
```

### Source Code (repository root)

```text
src/features/auth/schemas/
├── auth.schema.ts
└── auth.schema.test.ts
```

**Structure Decision**: The Authentication feature owns its schema definitions. Tests are co-located with the schema file per repository testing conventions.

## Phase 0: Research

### Decisions

- Use Zod as the only runtime validation library.
- Reuse shared `emailSchema` and `strongPasswordSchema` primitives from `src/lib/validation/primitives.ts`.
- Keep all schema output types inferred with `z.infer`.
- Unit test schemas directly with `safeParse`/`parse`, without rendering UI or invoking services.

### Out of Scope

- UI components.
- Pages.
- Forms or React Hook Form.
- Loading states.
- Hooks.
- API integration.
- Services.
- Email flow.
- Routing.
- Token parsing.

## Phase 1: Schema Design

### Schemas

- `loginSchema`
  - Fields: `email`, `password`, `remember_me`.
  - Validation: valid email, non-empty password, boolean remember flag.
- `mfaSchema`
  - Fields: `code`.
  - Validation: exactly six numeric digits.
- `passwordResetRequestSchema`
  - Fields: `email`.
  - Validation: valid email.
- `passwordResetConfirmSchema`
  - Fields: `token`, `password`, `password_confirmation`.
  - Validation: non-empty token, strong password, non-empty confirmation, matching password confirmation.
- `acceptInviteSchema`
  - Fields: `token`, `password`, `password_confirmation`.
  - Validation: same rules as password reset confirmation.

### Exported Types

- `LoginInput`
- `MfaInput`
- `PasswordResetRequestInput`
- `PasswordResetConfirmInput`
- `AcceptInviteInput`

## Phase 2: Implementation Plan

### Changes

- Create or update `src/features/auth/schemas/auth.schema.ts`.
- Define the five schemas listed above.
- Export each inferred TypeScript type.
- Reuse existing shared validation primitives instead of duplicating email or password policy rules.
- Do not import React, React Hook Form, services, hooks, generated API types, or route modules.

### Tests

- Create or update `src/features/auth/schemas/auth.schema.test.ts`.
- Test `loginSchema`:
  - valid email/password/remember payload passes.
  - invalid email fails.
  - blank password fails.
  - missing or invalid `remember_me` fails.
- Test `mfaSchema`:
  - six numeric digits pass.
  - short, long, or non-numeric codes fail.
- Test `passwordResetRequestSchema`:
  - valid email passes.
  - blank or invalid email fails.
- Test `passwordResetConfirmSchema`:
  - valid token and strong matching passwords pass.
  - blank token fails.
  - weak password fails.
  - blank confirmation fails.
  - mismatched confirmation fails on `password_confirmation`.
- Test `acceptInviteSchema`:
  - valid token and strong matching passwords pass.
  - weak or mismatched passwords fail.

### Validation Commands

```bash
pnpm test src/features/auth/schemas/auth.schema.test.ts
pnpm typecheck
```

Run broader checks only if the schema change unexpectedly affects shared validation behavior.

## Complexity Tracking

No constitution violations anticipated. The plan stays inside the Authentication feature schema layer and does not touch UI, routing, services, hooks, API contracts, token handling, or email behavior.
