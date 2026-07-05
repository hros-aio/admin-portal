# Data Model: Accept Invite UI & Logic

## Invitation Token

**Purpose**: Identifies the invitation to accept and activates the invited administrator account when paired with a compliant password.

**Fields**:

- `token`: Non-empty string read from the `token` search parameter.

**Validation Rules**:

- Must be present before the form can be submitted.
- Must be trimmed before use.
- Must not be persisted in browser storage, cookies, or Zustand.

**State Transitions**:

- `missing`: No token is present; page shows an invitation-link error and no submittable form.
- `ready`: Token is present; administrator can submit password setup.
- `expired`: Backend reports `INVITE_EXPIRED`; page shows "This invitation has expired...".
- `used`: Backend reports `INVITE_USED`; page shows used-invitation feedback.
- `accepted`: Backend accepts the invite; administrator is redirected to login.

## Administrator Activation

**Purpose**: Captures the password setup values required to activate a newly invited administrator account.

**Fields**:

- `token`: Invitation token.
- `password`: New administrator password.
- `password_confirmation`: Confirmation value that must match `password`.

**Validation Rules**:

- `token` is required.
- `password` must satisfy the existing administrator strong-password policy.
- `password_confirmation` is required.
- `password_confirmation` must match `password`.

**Relationships**:

- Uses exactly one Invitation Token.
- Produces account activation only when backend invitation acceptance succeeds.

## Invitation Failure Reason

**Purpose**: Categorizes backend failures into user-facing UI states.

**Values**:

- `expired`: Invite can no longer be accepted.
- `used`: Invite has already been accepted or consumed.
- `weak-password`: Backend rejected password complexity.
- `unknown`: Any unexpected failure that should produce safe retry feedback.

**Validation Rules**:

- `INVITE_EXPIRED` maps to `expired`.
- `INVITE_USED` maps to `used`.
- `PASSWORD_WEAK` maps to `weak-password`.
- Any other code maps to `unknown`.
