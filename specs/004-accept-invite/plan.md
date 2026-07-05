# Implementation Plan: Accept Invite UI & Logic

**Branch**: `004-accept-invite` | **Date**: 2026-07-05 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-accept-invite/spec.md`

## Summary

Connect the existing `/accept-invite` authentication route to the typed backend invitation acceptance contract. Replace the current static accept-invite route content with a composed page that reads the invitation token from the `token` search parameter, renders a dedicated `AcceptInviteForm`, validates password complexity and confirmation matching through the existing auth Zod schema pattern, submits through a TanStack Query mutation hook, maps `INVITE_EXPIRED` and `INVITE_USED` failures to clear UI feedback, and redirects to `/login` with a success toast when activation succeeds. Keep the feature scoped to invited-admin account activation only; do not implement invitation creation, invitation management, email delivery, or unrelated auth flows.

## Technical Context

**Language/Version**: TypeScript 5.5.4 with React 18.3.1 and Next.js 14.2.5 App Router

**Primary Dependencies**: TanStack Query 5.51.11, React Hook Form 7.52.1, Zod 3.23.8, generated `openapi-fetch` client, existing auth UI components, existing toast provider

**Storage**: None; do not persist invitation tokens or authentication tokens

**Testing**: Vitest 2.0.4 + React Testing Library + `@testing-library/user-event`

**Target Platform**: Next.js frontend web application

**Project Type**: Web application

**Performance Goals**: Accept-invite remains a lightweight unauthenticated auth surface; no extra dependencies, polling, or background fetches.

**Constraints**: Use generated OpenAPI types and `rawClient` only inside the auth service layer. Use TanStack Query for the accept-invite mutation. Do not call `rawClient` from components or hooks. Do not store invitation tokens in local/session storage, Zustand, or cookies. Do not implement invitation creation or invitation email delivery. Do not expand to admin management, login, MFA, SSO, biometric, or password reset behavior.

**Scale/Scope**: One existing auth route page, one accept-invite form component, one accept-invite hook file, one auth service method, schema reuse or extension in the existing auth schema module, and focused service/hook/component/page tests.

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- P1 Type-safety end-to-end: Use generated `components["schemas"]["AcceptInviteRequest"]` and `operations["acceptInvite"]` response types from `src/types/api.generated.ts`; no hand-written API request/response types. Pass.
- P3 Feature-based modularity: Changes stay inside the Authentication feature and auth route group. Pass.
- P4 Server state and UI state are separate: TanStack Query owns the activation mutation; no Zustand or persisted invitation-token state. Pass.
- P5 Composition over configuration sprawl: Add a focused form and hook rather than growing the route page with business logic. Pass.
- P6 Boring, explicit, predictable code: Follow the existing password-reset service, hook, page, and test patterns. Pass.
- P8 Every non-trivial unit of logic is tested: Add service, hook, form, schema if changed, and page tests for success, validation, missing token, expired token, and used token. Pass.
- P10 Single responsibility for files: Service method stays in auth service, mutation behavior in `use-accept-invite.ts`, form UI in `accept-invite-form.tsx`, route orchestration in `page.tsx`. Pass.
- Non-negotiable API rule: Mutation goes through typed OpenAPI service layer + TanStack Query. Pass.
- Non-negotiable form rule: Form uses React Hook Form + Zod. Pass.
- Forbidden practices: No raw client calls from components/hooks, no hand-written API types, no token persistence, no Server Actions, no unrelated auth changes. Pass.

**Post-design re-check**: Phase 1 design keeps the backend call in `auth.service.ts`, mutation state in `use-accept-invite.ts`, route token usage in memory only, and form validation in Zod/RHF. No constitution violations or ADR requirements are expected.

## Project Structure

### Documentation (this feature)

```text
specs/004-accept-invite/
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
│       └── accept-invite/
│           ├── page.tsx
│           └── page.test.tsx
└── features/
    └── auth/
        ├── components/
        │   ├── accept-invite-form.tsx
        │   └── accept-invite-form.test.tsx
        ├── hooks/
        │   ├── use-accept-invite.ts
        │   └── use-accept-invite.test.tsx
        ├── schemas/
        │   ├── auth.schema.ts
        │   └── auth.schema.test.ts
        └── services/
            ├── auth.service.ts
            └── auth.service.test.ts
```

**Structure Decision**: Extend the existing Authentication module. `src/features/auth/services/auth.service.ts` remains the only file that calls `rawClient`. `src/features/auth/hooks/use-accept-invite.ts` owns mutation behavior and toast/router side effects. `src/features/auth/components/accept-invite-form.tsx` owns RHF/Zod form rendering. `src/app/(auth)/accept-invite/page.tsx` composes the form, reads URL search params, and renders link/error states.

## Phase 0: Research

### Decisions

- Use the existing generated OpenAPI contract for `/v1/auth/accept-invite`; the generated path, request schema, response shape, and documented 400/422 errors are already present.
- Type service input as `components["schemas"]["AcceptInviteRequest"]` and response as `operations["acceptInvite"]["responses"][200]["content"]["application/json"]`.
- Add `authService.acceptInvite(values)` following `confirmPasswordReset`: call `rawClient.POST("/v1/auth/accept-invite", { body: values })`, preserve backend error codes in `ApiError`, and require a response body.
- Use the existing `acceptInviteSchema` alias in `auth.schema.ts` unless implementation discovers it cannot satisfy UI typing; it already validates `token`, `password`, and `password_confirmation` using the strong-password primitive and matching-password refinement.
- Build `AcceptInviteForm` with React Hook Form and Zod, mirroring `ResetPasswordForm` behavior for password fields, strength feedback, validation messages, disabled state, and caller-provided password errors.
- Implement `useAcceptInvite` as a TanStack Query mutation that maps `INVITE_EXPIRED`, `INVITE_USED`, and `PASSWORD_WEAK`, shows success toast, redirects to `/login`, and leaves unexpected failures as safe retry feedback.
- Read the invitation token from the `token` search parameter in `/accept-invite`; keep it in component memory only and render a missing-link error without showing a submittable form.
- Replace static invite identity/tenant mock content on the current page with generic invited-admin activation copy unless the existing API contract later exposes invite preview data. Do not add invite preview fetching in this task.

### Out of Scope

- Admin management invitation creation or management.
- Invitation email delivery, content, or resend behavior.
- Invite preview/profile lookup before activation.
- New authenticated session behavior after invite acceptance.
- Login, MFA, SSO, biometric, or password-reset changes except reuse of established patterns.
- Regenerating OpenAPI types unless implementation discovers the committed generated contract is stale.

## Phase 1: Design

### Service Method

- `authService.acceptInvite(values)`
  - Input type: generated `AcceptInviteRequest`.
  - Response type: generated `acceptInvite` 200 JSON body.
  - Calls generated accept-invite endpoint.
  - Throws `ApiError` preserving `INVITE_EXPIRED`, `INVITE_USED`, `PASSWORD_WEAK`, and unexpected codes.
  - Returns endpoint message body when present.

### Hook

- `useAcceptInvite`
  - Mutation input: `AcceptInviteInput`.
  - On mutate: clear previous invite error state.
  - On success: show account-activated success toast and navigate to `/login`.
  - On `INVITE_EXPIRED`: expose explicit expired-invitation state/message.
  - On `INVITE_USED`: expose used-invitation state/message.
  - On `PASSWORD_WEAK`: expose password-field feedback and keep the administrator on the form.
  - On unexpected failure: expose safe retry feedback and keep the administrator on the page.
  - Do not retry the mutation.

### Form

- `AcceptInviteForm`
  - Uses `acceptInviteSchema` or a form-only schema derived from the same strong-password rule.
  - Receives `token`, `onSubmit`, `isLoading`, and optional `passwordError`.
  - Does not store or persist token outside form submission values.
  - Shows password and confirmation fields, password strength/requirements, validation messages, and disabled controls while loading.
  - Keeps button text scoped to accepting the invitation and creating the account.

### Page

- `src/app/(auth)/accept-invite/page.tsx`
  - Remains a client route wrapped in `Suspense` because it reads search params.
  - Reads `token` from URL search params and trims it.
  - Renders missing-token error and no form when absent.
  - Renders expired/used/unknown error banners from hook state.
  - Passes token and loading/error state into `AcceptInviteForm`.
  - Removes static Acme/email/role mock data unless replaced by generic copy.

### Tests

- Service tests:

  - `acceptInvite` posts to `/v1/auth/accept-invite` with token, password, and confirmation.
  - Service returns successful message body.
  - Service throws `ApiError` preserving `INVITE_EXPIRED` and `INVITE_USED`.

- Hook tests:

  - Successful invite acceptance calls service, shows success toast, and redirects to `/login`.
  - `INVITE_EXPIRED`, `INVITE_USED`, `PASSWORD_WEAK`, and unknown errors map to expected hook state.
  - Weak/unknown failures show safe toast feedback where appropriate and do not redirect.

- Form tests:

  - Valid password and confirmation submit token plus values.
  - Weak password is blocked by validation.
  - Mismatched confirmation is blocked by validation.
  - Caller-provided password error marks the password field invalid.
  - Loading state disables fields, toggles, and submit button.

- Page tests:
  - Page extracts token from search params and submits it through the hook.
  - Missing token renders an explicit invitation-link error and no form.
  - Expired invite renders "This invitation has expired...".
  - Used invite renders clear used-invitation message.
  - Loading state is reflected in the rendered form.

### Validation Commands

```bash
pnpm test src/features/auth/services/auth.service.test.ts src/features/auth/hooks/use-accept-invite.test.tsx src/features/auth/components/accept-invite-form.test.tsx 'src/app/(auth)/accept-invite/page.test.tsx'
pnpm typecheck
pnpm lint
```

Run `pnpm openapi:check` if implementation touches generated API types or discovers contract drift.

## Complexity Tracking

No constitution violations anticipated. The plan uses existing generated API types, service layer, TanStack Query mutation hooks, React Hook Form, Zod validation, toast provider, and auth route structure.
