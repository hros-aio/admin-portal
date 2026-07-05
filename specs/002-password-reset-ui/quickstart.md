# Quickstart: Password Reset UI

## Prerequisites

- Node.js 20 or newer.
- pnpm 9 or newer.
- FE-01 authentication schemas are present in `src/features/auth/schemas/auth.schema.ts`.

## Validation Steps

1. Run focused component and route tests:

   ```bash
   pnpm test src/features/auth/schemas/auth.schema.test.ts src/features/auth/components/forgot-password-form.test.tsx src/features/auth/components/reset-password-form.test.tsx 'src/app/(auth)/forgot-password/page.test.tsx' 'src/app/(auth)/reset-password/page.test.tsx'
   ```

2. Run type checking:

   ```bash
   pnpm typecheck
   ```

3. Optional manual check:

   ```bash
   pnpm dev
   ```

   Visit `/forgot-password` and verify the page shows one email field, rejects blank/invalid email, and disables controls when the form is loading in a test harness.

   Visit `/reset-password` and verify the page shows new-password and confirm-password fields, rejects weak or mismatched passwords, and disables controls when the form is loading in a test harness.

## Expected Outcomes

- Valid reset request input reaches the delegated submit handler.
- Invalid reset request input displays validation feedback and does not submit.
- Valid reset confirmation input reaches the delegated submit handler.
- Weak, blank, or mismatched reset confirmation input displays validation feedback and does not submit.
- No backend reset request, email delivery behavior, URL token parsing, placeholder token fabrication, or token persistence is introduced.
