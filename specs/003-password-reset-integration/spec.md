# Feature Specification: Password Reset Integration

**Feature Branch**: `003-password-reset-integration`

**Created**: 2026-07-05

**Status**: Draft

**Input**: User description: "Wire the password reset UI to the backend API. Create `useRequestPasswordReset` calling `POST /auth/password-reset/request`. Create `useConfirmPasswordReset` calling `POST /auth/password-reset/confirm`. Extract the `token` from URL search params in `/reset-password` and pass to the mutation. Map `TOKEN_EXPIRED`, `TOKEN_USED`, and `PASSWORD_WEAK` 400/422 errors to UI toasts/fields. Dependencies: FE-08. Request always shows a generic \"If an account exists...\" success message. Confirmation redirects to `/login` with a success toast upon HTTP 200. Expired tokens render an explicit error message. Email delivery is out of scope."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Request Reset Instructions (Priority: P1)

As an admin who forgot my password, I want to submit my email address and receive a neutral confirmation message so that I can safely request reset instructions without revealing whether the account exists.

**Why this priority**: Reset request is the first step in account recovery and must protect account enumeration while giving the admin clear next-step feedback.

**Independent Test**: Submit the forgot-password form with a valid email and verify that the same generic success message is shown for successful request handling without exposing account existence.

**Acceptance Scenarios**:

1. **Given** an admin enters a valid email on the forgot-password page, **When** they submit the form, **Then** the reset request is sent for processing and the admin sees a generic success message that begins with "If an account exists".
2. **Given** the reset request is being processed, **When** the admin views the form, **Then** the form reflects the in-progress state and prevents duplicate submissions.
3. **Given** the reset request is accepted for processing, **When** feedback is shown, **Then** the page does not reveal whether the email belongs to an account.

---

### User Story 2 - Confirm Reset With Valid Token (Priority: P1)

As an admin with a valid reset link, I want to submit a new password and be returned to login with success feedback so that I can sign in using my updated password.

**Why this priority**: Confirmation completes the recovery journey and must provide a clear path back to authentication.

**Independent Test**: Open the reset-password page with a token, submit a valid matching password, and verify the admin is redirected to login with success feedback after confirmation succeeds.

**Acceptance Scenarios**:

1. **Given** an admin opens the reset-password page with a reset token in the link, **When** they submit a valid new password and matching confirmation, **Then** the reset confirmation is sent with the token and password details.
2. **Given** password reset confirmation succeeds, **When** the response is handled, **Then** the admin is redirected to `/login` and sees a success toast.
3. **Given** confirmation is in progress, **When** the admin views the form, **Then** the form reflects the in-progress state and prevents duplicate submissions.

---

### User Story 3 - Handle Invalid Reset Confirmation (Priority: P1)

As an admin using an invalid, expired, used, or weak reset attempt, I want specific feedback so that I understand whether to request a new link or choose a stronger password.

**Why this priority**: Recovery failures are common and must be clear enough to unblock the admin without exposing sensitive account details.

**Independent Test**: Simulate expired-token, used-token, missing-token, and weak-password failure responses and verify each produces the correct visible feedback without completing the reset.

**Acceptance Scenarios**:

1. **Given** an admin opens the reset-password page with an expired token, **When** the failure is handled, **Then** the page shows an explicit expired-link error message.
2. **Given** an admin submits a reset link that has already been used, **When** the failure is handled, **Then** the page shows a clear message instructing the admin to request a new link.
3. **Given** an admin submits a weak new password, **When** the failure is handled, **Then** the password form displays password-strength feedback and keeps the admin on the reset-password page.
4. **Given** an admin opens the reset-password page without a token, **When** the page renders, **Then** the admin sees a reset-link error and cannot complete confirmation.

### Edge Cases

- Reset request submission with a valid email always shows the same generic success feedback, regardless of account existence.
- Reset request failures that cannot be tied to account existence show non-enumerating generic feedback.
- Missing reset token prevents confirmation and prompts the admin to request a new reset link.
- Expired reset token shows an explicit expired-link message.
- Already-used reset token prompts the admin to request a new reset link.
- Weak password failure is shown on the password form and does not redirect.
- Network or unexpected failures keep the admin on the current page and show a safe retry message.
- Email delivery, inbox behavior, and link delivery timing are not handled by this feature.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The Authentication feature MUST submit valid forgot-password form input to the backend password reset request capability.
- **FR-002**: The forgot-password page MUST show a generic success message beginning with "If an account exists" after a reset request is accepted for handling.
- **FR-003**: The forgot-password page MUST NOT reveal whether the submitted email belongs to an account.
- **FR-004**: The forgot-password page MUST reflect request loading state and prevent duplicate request submissions while processing.
- **FR-005**: The reset-password page MUST read the reset token from the page link before allowing confirmation.
- **FR-006**: The reset-password page MUST prevent reset confirmation when no token is present and show a clear reset-link error.
- **FR-007**: The Authentication feature MUST submit valid reset-password form input together with the reset token to the backend password reset confirmation capability.
- **FR-008**: After reset confirmation succeeds, the admin MUST be redirected to `/login`.
- **FR-009**: After reset confirmation succeeds, the admin MUST see a success toast indicating the password was updated.
- **FR-010**: The reset-password page MUST reflect confirmation loading state and prevent duplicate confirmation submissions while processing.
- **FR-011**: Expired reset token failures MUST render an explicit expired-link error message.
- **FR-012**: Already-used reset token failures MUST render a clear message instructing the admin to request a new link.
- **FR-013**: Weak-password failures returned during confirmation MUST be shown on the password form rather than redirecting.
- **FR-014**: Unexpected reset request or confirmation failures MUST show safe retry feedback without exposing account existence or token internals.
- **FR-015**: This feature MUST NOT implement email delivery, inbox behavior, or reset email content.

### Key Entities _(include if feature involves data)_

- **Password Reset Request**: The admin email submitted to begin password recovery, with neutral user-facing feedback.
- **Password Reset Token**: The recovery token carried by the reset link and required to confirm a password change.
- **Password Reset Confirmation**: The token, new password, and matching confirmation submitted to complete recovery.
- **Reset Failure Reason**: The failure category returned when a reset cannot proceed, including expired token, used token, and weak password.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 100% of accepted reset request submissions show a generic success message beginning with "If an account exists".
- **SC-002**: Reset request feedback never indicates whether the submitted email is registered.
- **SC-003**: 100% of successful reset confirmations redirect the admin to `/login`.
- **SC-004**: 100% of successful reset confirmations show a password-updated success toast.
- **SC-005**: 100% of missing or expired-token attempts display a visible reset-link error and do not complete confirmation.
- **SC-006**: 100% of weak-password confirmation failures remain on the reset form and show password-specific feedback.
- **SC-007**: No email delivery behavior, inbox behavior, or reset email content is introduced.

## Assumptions

- FE-08 provides the password reset UI pages and forms that this feature connects to backend behavior.
- The backend exposes reset request and confirmation capabilities matching the committed authentication contract.
- The reset link carries the token in a `token` search parameter.
- Token-expired, token-used, and weak-password failures are identifiable from the backend error response.
- Login success feedback can be shown after redirect using the project's existing toast or notification pattern.
