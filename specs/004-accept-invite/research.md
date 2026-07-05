# Research: Accept Invite UI & Logic

## Decision: Use the Existing Generated Accept-Invite Contract

**Rationale**: `src/types/api.generated.ts` already contains `/v1/auth/accept-invite`, `components["schemas"]["AcceptInviteRequest"]`, `operations["acceptInvite"]`, and documented `INVITE_EXPIRED`, `INVITE_USED`, and `PASSWORD_WEAK` responses. This satisfies the constitution requirement that API contracts flow from OpenAPI-generated types.

**Alternatives considered**:

- Hand-write request/response types: rejected because the constitution forbids hand-written API types.
- Regenerate OpenAPI types immediately: rejected because the committed generated contract already contains the needed endpoint and schemas.

## Decision: Extend the Existing Auth Service

**Rationale**: `auth.service.ts` already owns login, MFA, biometric, refresh, and password-reset calls. Adding `acceptInvite` there keeps `rawClient` use inside the service layer and matches the current password-reset implementation style.

**Alternatives considered**:

- Call the generated client directly from the hook or page: rejected because components/hooks must not call `rawClient`.
- Create a new invite service file: rejected because this task is an auth activation flow and the repository currently centralizes auth endpoint calls in `auth.service.ts`.

## Decision: Add a Dedicated Accept-Invite Mutation Hook

**Rationale**: A focused `useAcceptInvite` hook keeps route orchestration small and follows the existing `useConfirmPasswordReset` pattern for mutation execution, toast feedback, redirect, and error-state mapping.

**Alternatives considered**:

- Reuse `useConfirmPasswordReset`: rejected because invitation errors and success messaging are different, and coupling reset behavior to invite acceptance would blur responsibilities.
- Put mutation state in the route page: rejected because existing architecture keeps server mutation behavior in feature hooks.

## Decision: Reuse the Existing Strong Password Validation Rule

**Rationale**: `acceptInviteSchema` already aliases the password-reset confirmation schema, which validates `token`, `password`, and `password_confirmation` with the shared strong-password primitive and matching confirmation refinement. This matches the feature requirement without adding a separate policy.

**Alternatives considered**:

- Define a new password complexity rule for invitations: rejected because the spec assumes the existing administrator password policy applies and the task does not require a new policy.
- Validate password complexity in `onSubmit`: rejected because project rules require Zod validation for forms.

## Decision: Keep the Invitation Token in Route/Form Memory Only

**Rationale**: The token arrives in the URL and is required only for one mutation. Keeping it in component memory and form submission values avoids token persistence and follows the same security posture as reset tokens.

**Alternatives considered**:

- Store token in Zustand: rejected because it is not UI state and should not outlive the route.
- Store token in browser storage: rejected because auth-related tokens must not be persisted in `localStorage` or `sessionStorage`.

## Decision: Do Not Fetch Invite Preview Data

**Rationale**: The current route contains static mock invite identity details, but the provided scope only requires accepting the invite, validating password complexity, and mapping errors. The generated contract exposes accept-invite, not a preview endpoint.

**Alternatives considered**:

- Add a preview fetch to populate organization/email/role: rejected as scope expansion.
- Keep static Acme/email mock data: rejected because it would misrepresent the actual invite and is not backed by the scoped contract.
