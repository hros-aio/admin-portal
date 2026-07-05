# UI Contract: Password Reset Integration

## Forgot Password Page

### Route

`/forgot-password`

### Behavior

- Submits valid `ForgotPasswordForm` email values to the reset request mutation.
- Disables the form while request mutation is pending.
- Shows generic success feedback beginning with "If an account exists" after accepted request handling.
- Does not reveal whether the submitted email exists.

## Reset Password Page

### Route

`/reset-password?token=<reset-token>`

### Behavior

- Reads `token` from URL search params.
- When token is missing, shows a clear reset-link error and prevents confirmation.
- When token is present, submits token plus valid reset form values to the confirm mutation.
- Disables the form while confirm mutation is pending.
- On success, shows password-updated success feedback and redirects to `/login`.
- On `TOKEN_EXPIRED`, renders an explicit expired-link error.
- On `TOKEN_USED`, renders a used-link error prompting the admin to request a new link.
- On `PASSWORD_WEAK`, keeps the admin on the reset form and shows password-specific feedback.

## Hook Contract

### `useRequestPasswordReset`

- Input: `PasswordResetRequestInput`.
- Mutation function delegates to `authService.requestPasswordReset`.
- Success feedback must be non-enumerating.

### `useConfirmPasswordReset`

- Input: reset token plus `PasswordResetFormInput`.
- Mutation function delegates to `authService.confirmPasswordReset`.
- Success redirects to `/login`.
- Expected reset error codes are exposed or mapped for route/page feedback.
