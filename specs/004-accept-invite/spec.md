# Feature Specification: Accept Invite UI & Logic

**Feature Branch**: `004-accept-invite`

**Created**: 2026-07-05

**Status**: Draft

**Input**: User description: "Feature: Accept Invite UI & Logic. Goal: Implement the flow for newly invited administrators to activate their accounts. Scope: Create `/accept-invite` page and `AcceptInviteForm`. Create `useAcceptInvite` hook calling `POST /auth/accept-invite`. Read `token` from URL. Validate password complexity. Map `INVITE_EXPIRED` and `INVITE_USED` errors. Files likely affected: `app/(auth)/accept-invite/page.tsx`, `src/features/auth/components/accept-invite-form.tsx`, `src/features/auth/hooks/use-accept-invite.ts`. Dependencies: FE-01. Acceptance Criteria: Completing the form activates the account and redirects to `/login` with a success toast. Expired links (400 `INVITE_EXPIRED`) show error: \"This invitation has expired...\". Out of Scope: Admin management invitation creation. Do not create a new epic if this belongs to an existing feature. Do not expand scope beyond the provided task."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Accept Valid Invitation (Priority: P1)

As a newly invited administrator, I want to open my invitation link, set a compliant password, and activate my account so that I can sign in as an administrator.

**Why this priority**: This is the primary activation path for invited administrators and delivers the core value of the feature.

**Independent Test**: Open the accept-invite page with a valid invitation token, submit a compliant password and matching confirmation, and verify that the account is activated, the administrator is sent to login, and success feedback is shown.

**Acceptance Scenarios**:

1. **Given** an invited administrator opens the accept-invite page with a valid invitation token, **When** they submit a compliant password and matching confirmation, **Then** the invitation is accepted and the account is activated.
2. **Given** invitation acceptance succeeds, **When** the response is handled, **Then** the administrator is redirected to `/login` and sees a success toast.
3. **Given** invitation acceptance is in progress, **When** the administrator views the form, **Then** the form reflects the in-progress state and prevents duplicate submissions.

---

### User Story 2 - Validate Password Before Activation (Priority: P1)

As a newly invited administrator, I want clear password requirements and validation feedback so that I can correct mistakes before submitting my activation request.

**Why this priority**: Account activation must enforce password quality before the administrator can complete setup.

**Independent Test**: Submit the accept-invite form with passwords that are missing required complexity or do not match, and verify that the form blocks submission and shows password-specific feedback.

**Acceptance Scenarios**:

1. **Given** an invited administrator enters a password that does not meet complexity requirements, **When** they attempt to submit the form, **Then** submission is blocked and password-specific validation feedback is shown.
2. **Given** an invited administrator enters a password confirmation that does not match the password, **When** they attempt to submit the form, **Then** submission is blocked and matching-password feedback is shown.

---

### User Story 3 - Handle Invalid Invitation Link (Priority: P1)

As a newly invited administrator using an expired, already-used, or malformed invitation link, I want clear feedback so that I know the link cannot activate my account.

**Why this priority**: Invalid invitation links are common failure paths and must not leave administrators stuck on a form that cannot succeed.

**Independent Test**: Open or submit the accept-invite flow with missing, expired, and already-used invitation tokens, and verify that each case shows clear failure feedback without activating the account.

**Acceptance Scenarios**:

1. **Given** an invited administrator opens the accept-invite page without an invitation token, **When** the page renders, **Then** the administrator sees an invitation-link error and cannot complete activation.
2. **Given** an invited administrator submits an expired invitation, **When** the failure is handled, **Then** the page shows the error "This invitation has expired..." and does not activate the account.
3. **Given** an invited administrator submits an invitation that has already been used, **When** the failure is handled, **Then** the page shows a clear used-invitation message and does not activate the account.

### Edge Cases

- Missing invitation token prevents activation and shows a clear invitation-link error.
- Expired invitation token shows the message "This invitation has expired..." and keeps the administrator from activating the account.
- Already-used invitation token shows a clear used-invitation message and keeps the administrator from activating the account.
- Passwords that do not meet complexity requirements are rejected before account activation.
- Password and confirmation mismatch is rejected before account activation.
- Network or unexpected failures keep the administrator on the accept-invite page and show safe retry feedback.
- Invitation creation, invitation management, and invitation email delivery are not handled by this feature.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The system MUST provide an accept-invite page for newly invited administrators.
- **FR-002**: The accept-invite page MUST read the invitation token from the page link before allowing activation.
- **FR-003**: The system MUST prevent invitation acceptance when no token is present and show a clear invitation-link error.
- **FR-004**: Invited administrators MUST be able to enter a new password and matching password confirmation.
- **FR-005**: The accept-invite form MUST validate password complexity before submitting activation.
- **FR-006**: The accept-invite form MUST validate that password and confirmation match before submitting activation.
- **FR-007**: The system MUST submit valid activation details together with the invitation token to the backend invitation acceptance capability.
- **FR-008**: After invitation acceptance succeeds, the administrator MUST be redirected to `/login`.
- **FR-009**: After invitation acceptance succeeds, the administrator MUST see a success toast indicating the account was activated.
- **FR-010**: The accept-invite form MUST reflect activation loading state and prevent duplicate submissions while processing.
- **FR-011**: Expired invitation failures MUST show the error "This invitation has expired...".
- **FR-012**: Already-used invitation failures MUST show a clear message that the invitation has already been used.
- **FR-013**: Unexpected activation failures MUST show safe retry feedback without exposing token internals.
- **FR-014**: This feature MUST NOT implement invitation creation, invitation management, or invitation email delivery.

### Key Entities _(include if feature involves data)_

- **Invitation Token**: The activation token carried by the invitation link and required to accept an administrator invitation.
- **Administrator Activation**: The password setup and matching confirmation submitted to activate a newly invited administrator account.
- **Invitation Failure Reason**: The failure category returned when activation cannot proceed, including expired invitation, already-used invitation, and unexpected failure.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 100% of successful invitation acceptances redirect the administrator to `/login`.
- **SC-002**: 100% of successful invitation acceptances show an account-activated success toast.
- **SC-003**: 100% of missing-token attempts display a visible invitation-link error and do not submit activation.
- **SC-004**: 100% of expired-invitation failures display "This invitation has expired..." and do not activate the account.
- **SC-005**: 100% of already-used invitation failures display a visible used-invitation message and do not activate the account.
- **SC-006**: 100% of password complexity or password mismatch failures are shown before activation submission.
- **SC-007**: No invitation creation, invitation management, or invitation email delivery behavior is introduced.

## Assumptions

- FE-01 provides the baseline authentication UI, routing, form, toast, and service patterns this feature extends.
- Newly invited administrators receive an invitation link that carries the token in a `token` search parameter.
- Invitation-expired and invitation-used failures are identifiable from the backend error response.
- The existing password complexity policy for administrator authentication applies to invitation activation.
- Login success feedback can be shown after redirect using the project's existing toast or notification pattern.
