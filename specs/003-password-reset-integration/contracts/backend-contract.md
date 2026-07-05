# Backend Contract: Password Reset Integration

## Password Reset Request

### Endpoint

`POST /v1/auth/password-reset/request`

### Request Body

Uses generated `components["schemas"]["PasswordResetRequest"]`.

```ts
{
  email: string;
}
```

### Success Response

HTTP 200 with optional message.

Expected UI behavior: show a generic success message beginning with "If an account exists" regardless of account existence.

### Error Response

HTTP 400 or 500 may occur. Expected UI behavior: show safe non-enumerating retry feedback.

## Password Reset Confirm

### Endpoint

`POST /v1/auth/password-reset/confirm`

### Request Body

Uses generated `components["schemas"]["PasswordResetConfirmRequest"]`.

```ts
{
  token: string;
  password: string;
  password_confirmation: string;
}
```

### Success Response

HTTP 200 with optional message.

Expected UI behavior: show password-updated success feedback and redirect to `/login`.

### Error Responses

- HTTP 400 `TOKEN_EXPIRED`: Show explicit expired-link error.
- HTTP 400 `TOKEN_USED`: Show used-link error and prompt for a new reset request.
- HTTP 422 `PASSWORD_WEAK`: Show password-specific feedback on the reset form.
- HTTP 500 or unexpected error: Show safe retry feedback.

## Contract Notes

- Do not hand-write API request/response types; use generated `src/types/api.generated.ts`.
- Do not call generated client directly outside `src/features/auth/services/auth.service.ts`.
- Do not persist reset tokens.
