# Data Model: Password Reset Integration

## Password Reset Request

Represents an admin's request to begin account recovery.

### Fields

- `email`: Admin email address submitted from the forgot-password form.

### Validation Rules

- Must pass existing authentication email validation before submission.
- User-facing success feedback must not reveal account existence.

### State Transitions

- `idle` -> `submitting` when a valid request is submitted.
- `submitting` -> `success` when the backend accepts the request.
- `submitting` -> `safe_error` when an unexpected failure occurs.

## Password Reset Token

Represents the reset token carried by the reset link.

### Fields

- `token`: Search-parameter value from the reset-password URL.

### Validation Rules

- Required before confirmation can be submitted.
- Must not be stored in browser storage or auth stores.

### State Transitions

- `missing`: No token in the reset-password URL; confirmation disabled.
- `present`: Token exists in page memory and can be submitted.
- `expired`: Backend reports the token has expired.
- `used`: Backend reports the token has already been used.

## Password Reset Confirmation

Represents the final recovery submission.

### Fields

- `token`: Reset token from the URL.
- `password`: New password from the reset form.
- `password_confirmation`: Matching confirmation from the reset form.

### Validation Rules

- Password fields must pass existing Zod validation before submission.
- Backend `PASSWORD_WEAK` failures remain on the reset form.

### State Transitions

- `idle` -> `submitting` when token and valid password input are submitted.
- `submitting` -> `success` when backend confirms the reset.
- `success` -> redirected to login with success feedback.
- `submitting` -> `token_error` for expired or used token failures.
- `submitting` -> `field_error` for weak password failures.
- `submitting` -> `safe_error` for unexpected failures.

## Reset Failure Reason

Represents expected backend failure categories.

### Values

- `TOKEN_EXPIRED`: Reset link has expired.
- `TOKEN_USED`: Reset link has already been used.
- `PASSWORD_WEAK`: New password does not meet backend policy.
- `UNKNOWN`: Any unexpected failure.

## Relationships

- Password Reset Request starts the recovery journey.
- Password Reset Token is required for Password Reset Confirmation.
- Reset Failure Reason controls user-facing feedback during confirmation.
