# UI Contract: Password Reset UI

## ForgotPasswordForm

### Location

`src/features/auth/components/forgot-password-form.tsx`

### Public Props

```ts
interface ForgotPasswordFormProps {
  onSubmit: SubmitHandler<PasswordResetRequestInput>;
  isLoading?: boolean;
  className?: string;
}
```

### Behavior

- Renders an email field with an accessible label.
- Validates with the existing reset-request schema before calling `onSubmit`.
- Does not call `onSubmit` for blank or invalid email values.
- Disables all interactive controls when `isLoading` is true.
- Sets busy state on the form while loading.
- Does not contact backend reset services.

## ResetPasswordForm

### Location

`src/features/auth/components/reset-password-form.tsx`

### Public Props

```ts
interface ResetPasswordFormProps {
  onSubmit: SubmitHandler<PasswordResetFormInput>;
  isLoading?: boolean;
  className?: string;
}
```

### Behavior

- Renders new-password and confirm-password fields with accessible labels.
- Validates with an auth-schema-owned visible-field reset confirmation schema before calling `onSubmit`.
- Does not call `onSubmit` for blank, weak, or mismatched passwords.
- Disables all interactive controls when `isLoading` is true.
- Sets busy state on the form while loading.
- Does not parse URL tokens, contact backend reset services, send email, or persist tokens.

## Route Contract

- `/forgot-password` renders the reset request page and `ForgotPasswordForm`.
- `/reset-password` renders the reset confirmation page and `ResetPasswordForm`.
- Both pages use route-local delegated submit placeholders until backend integration is specified.
