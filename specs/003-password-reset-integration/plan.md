# Implementation Plan: Password Reset Integration

**Branch**: `003-password-reset-integration` | **Date**: 2026-07-05 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-password-reset-integration/spec.md`

## Summary

Connect the existing Authentication password reset UI to the typed backend reset endpoints. Add password reset request and confirmation service methods using the generated OpenAPI client, add TanStack Query mutation hooks for request and confirm flows, wire the existing `/forgot-password` and `/reset-password` pages to those hooks, read the reset token from the `token` search parameter, and map reset-specific failure codes to safe UI feedback. Keep the feature scoped to reset request/confirmation integration only; do not implement email delivery, new authentication flows, token persistence, or unrelated auth work.

## Technical Context

**Language/Version**: TypeScript 5.5.4 with React 18.3.1 and Next.js 14.2.5 App Router

**Primary Dependencies**: TanStack Query 5.51.11, React Hook Form 7.52.1, Zod 3.23.8, generated `openapi-fetch` client, existing auth UI components, existing toast provider

**Storage**: None; do not persist reset tokens or authentication tokens

**Testing**: Vitest 2.0.4 + React Testing Library + `@testing-library/user-event`

**Target Platform**: Next.js frontend web application

**Project Type**: Web application

**Performance Goals**: Auth reset pages remain lightweight client-side auth surfaces; no extra dependencies or polling behavior.

**Constraints**: Use generated OpenAPI types and `rawClient` only inside the auth service layer. Use TanStack Query for mutations. Do not call `rawClient` from components or hooks. Do not store reset tokens in local/session storage or Zustand. Do not implement email delivery. Do not expand to login, MFA, invite, or biometric behavior.

**Scale/Scope**: One auth service file, one password-reset hook file, two auth route pages, and focused service/hook/page tests.

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- P1 Type-safety end-to-end: Use generated `components["schemas"]` request/response types from `src/types/api.generated.ts`; no hand-written API request/response types. Pass.
- P3 Feature-based modularity: Service/hook/page changes stay inside the Authentication feature and auth route group. Pass.
- P4 Server state and UI state are separate: TanStack Query owns reset request/confirm mutations; no Zustand reset state. Pass.
- P5 Composition over configuration sprawl: Add two focused hooks in one auth reset hook module and reuse existing forms/pages. Pass.
- P6 Boring, explicit, predictable code: Follow current `authService`, `useLogin`, and `useVerifyMfa` patterns. Pass.
- P8 Every non-trivial unit of logic is tested: Add service, hook, and page tests for success and mapped failures. Pass.
- P10 Single responsibility for files: Keep service methods in auth service, mutation hooks in auth hook file, and route orchestration in route pages. Pass.
- Non-negotiable API rule: Mutations go through typed OpenAPI service layer + TanStack Query. Pass.
- Non-negotiable form rule: Existing forms continue to use React Hook Form + Zod. Pass.
- Forbidden practices: No raw client calls from components/hooks, no hand-written API types, no token persistence, no Server Actions. Pass.

**Post-design re-check**: Phase 1 design keeps all calls in `auth.service.ts`, all mutation state in TanStack Query hooks, and all reset-token usage in route memory only. No constitution violations or ADR requirements are expected.

## Project Structure

### Documentation (this feature)

```text
specs/003-password-reset-integration/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── backend-contract.md
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
        ├── hooks/
        │   ├── use-password-reset.ts
        │   └── use-password-reset.test.tsx
        ├── services/
        │   ├── auth.service.ts
        │   └── auth.service.test.ts
        └── components/
            ├── forgot-password-form.tsx
            └── reset-password-form.tsx
```

**Structure Decision**: Extend the existing Authentication service and hook patterns. `src/features/auth/services/auth.service.ts` is the only file that calls `rawClient`. `src/features/auth/hooks/use-password-reset.ts` owns mutation behavior and toast/router side effects. Auth route pages compose hooks with existing form components and read URL search params only in the reset page.

## Phase 0: Research

### Decisions

- Use generated OpenAPI paths `/v1/auth/password-reset/request` and `/v1/auth/password-reset/confirm`, which correspond to the product-level reset endpoints in the spec.
- Type service inputs from `components["schemas"]["PasswordResetRequest"]` and `components["schemas"]["PasswordResetConfirmRequest"]`.
- Return endpoint message bodies where present, but use the generic request success message in UI regardless of account existence.
- Implement `useRequestPasswordReset` and `useConfirmPasswordReset` with TanStack Query `useMutation`.
- Map `TOKEN_EXPIRED`, `TOKEN_USED`, and `PASSWORD_WEAK` in hook/page orchestration so UI behavior is testable without duplicating service behavior.
- Read the reset token from the `token` search parameter in `/reset-password`; keep it in component memory only.

### Out of Scope

- Email delivery or email content.
- Reset-token persistence.
- New auth session behavior.
- Login, MFA, biometric, accept-invite, or SSO behavior.
- Regenerating OpenAPI types unless implementation discovers the generated contract is stale.

## Phase 1: Design

### Service Methods

- `authService.requestPasswordReset(values)`

  - Calls generated reset request endpoint.
  - Throws `ApiError` on typed error responses.
  - Returns a message body if the backend provides one.

- `authService.confirmPasswordReset(values)`
  - Calls generated reset confirmation endpoint with `token`, `password`, and `password_confirmation`.
  - Throws `ApiError` preserving `TOKEN_EXPIRED`, `TOKEN_USED`, and `PASSWORD_WEAK`.
  - Returns a message body if the backend provides one.

### Hooks

- `useRequestPasswordReset`

  - Mutation input: existing `PasswordResetRequestInput`.
  - On success: show generic "If an account exists..." success toast/message.
  - On expected/unexpected request failure: show safe non-enumerating retry feedback.

- `useConfirmPasswordReset`
  - Mutation input: token plus existing reset form values.
  - On success: show password-updated success toast and navigate to `/login`.
  - On `TOKEN_EXPIRED`: expose explicit expired-link state/message.
  - On `TOKEN_USED`: expose used-link state/message.
  - On `PASSWORD_WEAK`: expose password-field feedback and keep the admin on the form.
  - On unexpected failure: show safe retry feedback.

### Pages

- `src/app/(auth)/forgot-password/page.tsx`

  - Use `useRequestPasswordReset`.
  - Pass `mutate` and `isPending` to `ForgotPasswordForm`.
  - Render or toast generic success feedback without account enumeration.

- `src/app/(auth)/reset-password/page.tsx`
  - Read `token` from URL search params.
  - Render explicit missing-token error when absent and prevent submit.
  - Use `useConfirmPasswordReset` when token exists.
  - Pass loading state to `ResetPasswordForm`.
  - Render expired/used link messages from mapped errors.

### Tests

- Service tests:

  - Request reset posts to `/v1/auth/password-reset/request`.
  - Confirm reset posts to `/v1/auth/password-reset/confirm`.
  - Service throws `ApiError` with mapped backend error codes.

- Hook tests:

  - Request hook shows generic success feedback.
  - Request hook avoids account enumeration on failure.
  - Confirm hook redirects to `/login` and shows success toast on success.
  - Confirm hook maps `TOKEN_EXPIRED`, `TOKEN_USED`, and `PASSWORD_WEAK`.

- Page tests:
  - Forgot-password page submits through request hook and disables while pending.
  - Reset-password page extracts token from search params and passes it to confirm mutation.
  - Reset-password page renders missing-token and expired-token messages.

### Validation Commands

```bash
pnpm test src/features/auth/services/auth.service.test.ts src/features/auth/hooks/use-password-reset.test.tsx 'src/app/(auth)/forgot-password/page.test.tsx' 'src/app/(auth)/reset-password/page.test.tsx'
pnpm typecheck
```

Run `pnpm lint` if implementation touches shared form/component APIs.

## Complexity Tracking

No constitution violations anticipated. The plan uses existing generated API types, service layer, TanStack Query mutation hooks, toast provider, and auth route structure.
