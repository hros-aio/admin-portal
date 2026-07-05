# Quickstart: Password Reset Integration

## Prerequisites

- Node.js 20 or newer.
- pnpm 9 or newer.
- Generated API types include password reset request and confirm endpoints in `src/types/api.generated.ts`.
- Password reset UI from FE-08 is present.

## Validation Steps

1. Run focused tests:

   ```bash
   pnpm test src/features/auth/services/auth.service.test.ts src/features/auth/hooks/use-password-reset.test.tsx 'src/app/(auth)/forgot-password/page.test.tsx' 'src/app/(auth)/reset-password/page.test.tsx'
   ```

2. Run type checking:

   ```bash
   pnpm typecheck
   ```

3. Optional manual check:

   ```bash
   pnpm dev
   ```

   Visit `/forgot-password`, submit a valid email, and verify the page shows generic "If an account exists..." feedback.

   Visit `/reset-password?token=valid-token`, submit a strong matching password, and verify successful confirmation returns to `/login` with success feedback.

   Visit `/reset-password` without a token and verify confirmation is blocked with a reset-link error.

## Expected Outcomes

- Reset request uses the typed backend reset request endpoint.
- Reset request success feedback does not reveal account existence.
- Reset confirmation uses the typed backend reset confirm endpoint with token and password values.
- Successful confirmation redirects to `/login` with success feedback.
- Expired, used, and weak-password failures produce the expected UI feedback.
- No email delivery behavior is introduced.
