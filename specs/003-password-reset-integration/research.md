# Research: Password Reset Integration

## Decision: Use generated OpenAPI client through authService

**Rationale**: The generated API types already include `/v1/auth/password-reset/request` and `/v1/auth/password-reset/confirm`, including `PasswordResetRequest`, `PasswordResetConfirmRequest`, and reset-specific error responses. The constitution requires API calls to flow through generated types and service layer.

**Alternatives considered**:

- Calling `rawClient` directly from pages or hooks: Rejected by layer dependency rules.
- Hand-writing request types: Rejected by the generated API type rule.
- Regenerating API types during this feature: Not required unless implementation discovers stale generated types.

## Decision: Use TanStack Query mutations for reset flows

**Rationale**: Password reset request and confirmation are state-changing backend interactions. Existing auth hooks use TanStack Query `useMutation` for login/MFA/biometrics, so password reset should follow the same pattern.

**Alternatives considered**:

- Next.js Server Actions: Rejected by the frontend architecture and ADR-FE-003.
- Local component state only: Rejected because mutation status, success, and errors should follow existing async state conventions.

## Decision: Keep reset token in route memory only

**Rationale**: The reset token is sensitive and short-lived. The spec requires extracting it from the reset-password link, but the constitution forbids token persistence in local/session storage.

**Alternatives considered**:

- Storing token in Zustand: Rejected because it is unnecessary UI/server state mixing.
- Storing token in local/session storage: Rejected by security rules.

## Decision: Map expected reset errors at hook/page boundary

**Rationale**: The service should preserve backend error codes as `ApiError`. Hooks and pages can map `TOKEN_EXPIRED`, `TOKEN_USED`, and `PASSWORD_WEAK` to user-facing feedback while keeping service behavior testable and generic.

**Alternatives considered**:

- Hardcoding all UI messages in service layer: Rejected because services should not own UI copy.
- Letting raw backend messages pass through directly: Rejected because account recovery feedback must be safe and consistent.
