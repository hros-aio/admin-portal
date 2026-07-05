# Data Model: Password Reset UI

## Password Reset Request

Represents the input collected from an admin who wants to request password recovery instructions.

### Fields

- `email`: Admin work email address.

### Validation Rules

- Required.
- Must match the existing authentication email validation policy.

### State

- `idle`: Form is editable.
- `invalid`: Validation feedback is visible and delegated submit has not run.
- `loading`: Controls are disabled and progress is visible.
- `submitted`: Delegated submit behavior has received a valid payload.

## Password Reset Confirmation

Represents the input collected from an admin who wants to set a new password during recovery.

### Fields

- `password`: New password entered by the admin.
- `password_confirmation`: Confirmation value entered by the admin.

### Validation Rules

- New password is required.
- New password must satisfy the existing strong-password policy.
- Confirmation is required.
- Confirmation must match the new password.
- Token behavior is not introduced by this feature; no URL token parsing, placeholder token fabrication, or invalid-token handling is planned.

### State

- `idle`: Form is editable.
- `invalid`: Validation feedback is visible and delegated submit has not run.
- `loading`: Controls are disabled and progress is visible.
- `submitted`: Delegated submit behavior has received a valid payload.

## Relationships

- Both entities are owned by the Authentication feature.
- Both entities depend on FE-01 validation policy as the source of truth.
- Neither entity contacts backend reset services in this feature.
