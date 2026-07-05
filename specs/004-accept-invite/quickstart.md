# Quickstart: Accept Invite UI & Logic

## Prerequisites

- Dependencies installed with `pnpm install`.
- Generated OpenAPI types present in `src/types/api.generated.ts`.
- Test environment configured with Vitest and React Testing Library.

## Focused Validation

Run the focused test set for this feature:

```bash
pnpm test src/features/auth/services/auth.service.test.ts src/features/auth/hooks/use-accept-invite.test.tsx src/features/auth/components/accept-invite-form.test.tsx 'src/app/(auth)/accept-invite/page.test.tsx'
```

Expected outcomes:

- Service posts to `/v1/auth/accept-invite` using generated types.
- Hook maps success and expected backend errors.
- Form blocks weak and mismatched passwords.
- Page reads the URL token, handles missing token, and renders expected error states.

## Type and Lint Validation

```bash
pnpm typecheck
pnpm lint
```

Expected outcomes:

- No TypeScript errors.
- No import-boundary, accessibility, or lint errors.

## Manual Browser Validation

Start the app:

```bash
pnpm dev
```

Validate these scenarios:

- Visit `/accept-invite` without a token. The page shows an invitation-link error and no submit form.
- Visit `/accept-invite?token=valid-token`. The page shows password and confirmation fields.
- Submit weak or mismatched passwords. The form blocks submission and shows validation feedback.
- Simulate a successful backend response. The page shows success feedback and redirects to `/login`.
- Simulate `INVITE_EXPIRED`. The page shows "This invitation has expired..." and does not redirect.
- Simulate `INVITE_USED`. The page shows used-invitation feedback and does not redirect.

## Scope Guard

Do not validate or implement invitation creation, invitation management, invitation email delivery, invite preview lookup, or unrelated auth flows as part of this feature.
