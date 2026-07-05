# Data Model: Authentication Validation Schemas

This feature introduces no persisted entities and no API contracts. The data model is limited to validation payload shapes.

## Login Payload

### Fields

- `email`: Admin email address.
- `password`: Admin password.
- `remember_me`: Whether the admin requested an extended session.

### Validation Rules

- `email` must satisfy the shared email validation primitive.
- `password` is required and must be non-empty.
- `remember_me` must be a boolean.

## MFA Payload

### Fields

- `code`: Time-based one-time password code.

### Validation Rules

- `code` must be exactly six numeric digits.

## Password Reset Request Payload

### Fields

- `email`: Admin email address.

### Validation Rules

- `email` must satisfy the shared email validation primitive.

## Password Reset Confirmation Payload

### Fields

- `token`: Password reset token.
- `password`: New password.
- `password_confirmation`: Confirmation of the new password.

### Validation Rules

- `token` is required and must be non-empty.
- `password` must satisfy the shared strong-password validation primitive.
- `password_confirmation` is required and must be non-empty.
- `password` and `password_confirmation` must match.

## Invitation Acceptance Payload

### Fields

- `token`: Invitation token.
- `password`: New password.
- `password_confirmation`: Confirmation of the new password.

### Validation Rules

- Same validation rules as password reset confirmation.
