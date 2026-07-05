# Quickstart: Authentication Validation Schemas

## Scope

Validate only the schema implementation in `src/features/auth/schemas/auth.schema.ts` and its co-located unit tests.

## Commands

```bash
pnpm test src/features/auth/schemas/auth.schema.test.ts
pnpm typecheck
```

## Expected Outcomes

- `loginSchema` accepts valid login payloads and rejects invalid email, blank password, and invalid remember flag values.
- `mfaSchema` accepts exactly six numeric digits and rejects malformed codes.
- `passwordResetRequestSchema` accepts valid email payloads and rejects blank or invalid email values.
- `passwordResetConfirmSchema` accepts valid token plus strong matching passwords and rejects blank token, weak password, blank confirmation, or mismatched confirmation.
- `acceptInviteSchema` validates the same token and password confirmation shape as password reset confirmation.
- `LoginInput`, `MfaInput`, `PasswordResetRequestInput`, `PasswordResetConfirmInput`, and `AcceptInviteInput` are exported from the schema file.

## Explicit Non-Goals

- Do not add UI components.
- Do not add pages.
- Do not add forms or React Hook Form usage.
- Do not add loading states.
- Do not add hooks.
- Do not add API integration or services.
- Do not add email flow.
- Do not add routing.
- Do not add token parsing.
