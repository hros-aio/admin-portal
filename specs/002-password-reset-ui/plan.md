# Implementation Plan: Password Reset UI

**Branch**: `002-password-reset-ui` | **Date**: 2026-07-05 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-password-reset-ui/spec.md`

## Summary

Build the Authentication feature's visual password reset request and confirmation forms and wire the existing `/forgot-password` and `/reset-password` auth routes to those reusable components. The implementation stays inside the auth UI layer: React Hook Form + auth Zod schemas for validation, existing auth visual primitives for layout, and focused component/page tests for validation and loading states. No backend reset service, email flow, token parsing, mutation hook, or API contract work is part of this plan.

## Technical Context

**Language/Version**: TypeScript 5.5.4 with React 18.3.1 and Next.js 14.2.5 App Router

**Primary Dependencies**: React Hook Form 7.52.1, `@hookform/resolvers` 3.9.0, Zod 3.23.8, Tailwind CSS 3.4.6, existing auth UI components

**Storage**: None

**Testing**: Vitest 2.0.4 + React Testing Library + `@testing-library/user-event`

**Target Platform**: Next.js frontend web application

**Project Type**: Web application

**Performance Goals**: Forms render as normal client-side auth surfaces with no network dependency and no additional bundle-level dependencies.

**Constraints**: Keep scope to visual pages/forms, Zod-backed client validation, delegated submit callbacks, and loading UI. Do not add API integration, reset-token parsing, email delivery behavior, token persistence, mutation hooks, services, new dependencies, or unrelated auth-flow changes.

**Scale/Scope**: Two route pages, two reusable auth form components, one visible-field reset confirmation schema export if needed, and focused tests for component behavior and page rendering.

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- P1 Type-safety end-to-end: Use inferred schema input types for reset request and reset confirmation form values and avoid `any`. Pass.
- P3 Feature-based modularity: Components live under `src/features/auth/components`; routes live under `src/app/(auth)`. Pass.
- P5 Composition over configuration sprawl: Add two focused form components instead of expanding route pages with form logic. Pass.
- P6 Boring, explicit, predictable code: Use established login/MFA form patterns directly. Pass.
- P8 Every non-trivial unit of logic is tested: Add component tests for validation, delegated submit, password visibility, and loading states; add page smoke tests where useful. Pass.
- P10 Single responsibility for files: One exported form component per file. Pass.
- Non-negotiable form rule: All forms use React Hook Form + Zod resolver. Pass.
- Layer dependency rules: `src/app/(auth)` imports auth feature components; auth components import shared UI/lib and own schemas only. Pass.
- Forbidden practices: No `useState` for multi-field form state, no validation in `onSubmit`, no token storage, no raw API calls, no hand-written API types. Pass.

**Post-design re-check**: Phase 1 design remains within the same gates. No constitution violations or ADR requirements are expected.

## Project Structure

### Documentation (this feature)

```text
specs/002-password-reset-ui/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-contract.md
└── tasks.md              # Created later by /speckit-tasks
```

### Source Code (repository root)

```text
src/
├── app/
│   └── (auth)/
│       ├── forgot-password/
│       │   ├── page.tsx
│       │   └── page.test.tsx
│       └── reset-password/
│           ├── page.tsx
│           └── page.test.tsx
└── features/
    └── auth/
        ├── components/
        │   ├── forgot-password-form.tsx
        │   ├── forgot-password-form.test.tsx
        │   ├── reset-password-form.tsx
        │   └── reset-password-form.test.tsx
        └── schemas/
            ├── auth.schema.ts
            └── auth.schema.test.ts
```

**Structure Decision**: Keep route composition in `src/app/(auth)` and move form behavior into auth feature components, matching existing `LoginForm` and `MfaChallengeForm` conventions. Reuse FE-01 reset request validation directly and use an auth-schema-owned visible-field reset confirmation schema for the UI if the FE-01 backend payload schema requires a token. Do not create services, hooks, stores, or generated API contracts for this UI-only phase.

## Phase 0: Research

### Decisions

- Use existing React Hook Form + Zod resolver form pattern from `LoginForm` and `MfaChallengeForm`.
- Use `passwordResetRequestSchema` and `PasswordResetRequestInput` directly for the forgot-password form.
- For the reset-password form, validate only the visible password and confirmation fields with a Zod schema owned by `src/features/auth/schemas/auth.schema.ts` that reuses the same strong-password and match rules as FE-01. Do not require or fabricate a token in the UI-only form.
- Keep form submission delegated through props and route-local no-op handlers until backend reset integration is specified.
- Preserve existing auth visual primitives (`AuthCard`, `AuthInput`, `PasswordField`, `AuthButton`, background/header/footer components).
- Test with Vitest + React Testing Library using accessible queries through `src/tests/test-utils.tsx`.

### Out of Scope

- Backend reset service calls.
- TanStack Query mutation hooks.
- Email delivery or success-confirmation flow.
- Reset token query parsing, invalid-token handling, or token field injection.
- Auth token storage or session changes.
- New dependencies or ADRs.

## Phase 1: Design

### Components

- `ForgotPasswordForm`

  - Client component.
  - Props: `onSubmit`, optional `isLoading`, optional `className`.
  - Uses `useForm<PasswordResetRequestInput>` with `zodResolver(passwordResetRequestSchema)`.
  - Renders one email input and submit button.
  - Disables all interactive controls and sets `aria-busy` while loading.

- `ResetPasswordForm`
  - Client component.
  - Props: `onSubmit`, optional `isLoading`, optional `className`.
  - Uses `useForm<PasswordResetFormInput>` with `zodResolver(passwordResetFormSchema)`.
  - The UI form schema contains only `password` and `password_confirmation`; it reuses the FE-01 password policy and match behavior. The backend payload schema with `token` remains for the later integration feature.
  - Renders new-password and confirm-password fields plus submit button.
  - Shows Zod validation feedback from the UI form schema.
  - Disables all interactive controls and sets `aria-busy` while loading.

### Routes

- `src/app/(auth)/forgot-password/page.tsx`

  - Keep auth page shell visuals.
  - Render `ForgotPasswordForm` inside the existing card.
  - Use a local delegated submit placeholder only; no backend integration.

- `src/app/(auth)/reset-password/page.tsx`
  - Keep auth page shell visuals.
  - Render `ResetPasswordForm` inside the existing card.
  - Use a local delegated submit placeholder only; no backend integration.
  - Remove static invalid-link error handling from this phase unless it is purely presentational and does not imply token parsing.

### Tests

- `forgot-password-form.test.tsx`

  - Valid email invokes supplied submit handler with the reset request payload.
  - Blank/invalid email shows validation and does not invoke submit handler.
  - Loading disables email and submit controls.

- `reset-password-form.test.tsx`

  - Valid strong matching passwords invoke supplied submit handler with reset confirmation payload.
  - Weak, blank, or mismatched passwords show validation and do not invoke submit handler.
  - Password visibility toggle works through `PasswordField` without clearing input.
  - Loading disables password fields, toggle controls, and submit control.

- `auth.schema.test.ts`

  - Add or extend coverage for `passwordResetFormSchema` valid, weak, blank, and mismatched password paths if that schema is introduced.

- Route tests:
  - `/forgot-password` page renders the reset request form.
  - `/reset-password` page renders the reset confirmation form.
  - Route tests do not assert backend behavior.

### Validation Commands

```bash
pnpm test src/features/auth/schemas/auth.schema.test.ts src/features/auth/components/forgot-password-form.test.tsx src/features/auth/components/reset-password-form.test.tsx 'src/app/(auth)/forgot-password/page.test.tsx' 'src/app/(auth)/reset-password/page.test.tsx'
pnpm typecheck
```

Run `pnpm lint` if implementation touches shared component patterns or route structure beyond these files.

## Complexity Tracking

No constitution violations anticipated. The implementation uses existing approved frontend stack and existing auth feature boundaries.
