# Feature Specification: Authentication Validation Schemas

**Feature Branch**: `001-authentication-validation-schemas`

**Created**: 2026-07-02

**Status**: Draft

**Input**: User description: "Create the Zod validation schemas for the Authentication feature."

## User Scenarios & Testing

### User Story 1 - Validate Authentication Form Inputs (Priority: P1)

As an admin, I want my login, MFA, password reset, and invitation form inputs validated so that I receive clear feedback before submitting data to the backend.

**Why this priority**: Input validation is foundational to every authentication flow and prevents invalid API requests.

**Independent Test**: Each schema can be unit tested with valid and invalid payloads without UI or API dependencies.

**Acceptance Scenarios**:

1. **Given** a login payload with a valid email, password, and remember_me flag, **When** validated against `loginSchema`, **Then** it parses successfully.
2. **Given** a password reset confirmation with mismatched passwords, **When** validated against `passwordResetConfirmSchema`, **Then** validation fails with a clear password-match error.

---

### User Story 2 - Protect Authenticated Routes (Priority: P1)

As an admin, I want the application to hold my access token in memory and redirect me to login when I am not authenticated so that protected routes are guarded without storing tokens in persistent storage.

**Why this priority**: In-memory token storage and route guarding are foundational security requirements for the admin portal.

**Independent Test**: The auth store can be unit-tested for token set/clear behavior, and the guard can be tested by rendering it with and without a token.

**Acceptance Scenarios**:

1. **Given** the auth store has no access token, **When** an admin navigates to a protected route wrapped by the guard, **Then** they are redirected to `/login`.
2. **Given** the auth store has an access token, **When** an admin navigates to a protected route wrapped by the guard, **Then** the route children render.
3. **Given** `clearSession()` is called, **When** the store state is read, **Then** the access token is `null`.

---

### User Story 3 - Complete Login Form UI (Priority: P1)

As an admin, I want a complete login form with email, password, session-length, SSO, and biometrics controls so that I can start the correct authentication flow from one screen.

**Why this priority**: Login is the entry point for every admin workflow, and the form must be wired to the shared validation rules before authentication API behavior is added.

**Independent Test**: The login form can be rendered and submitted with test input while confirming validation, disabled loading state, password visibility toggle, and placeholder secondary actions without calling an API.

**Acceptance Scenarios**:

1. **Given** an admin enters a valid email and password, **When** the login form is submitted, **Then** the supplied submit handler receives the email, password, and keep-logged-in selection.
2. **Given** an admin is entering a password, **When** they activate the visibility toggle, **Then** the password switches between hidden and visible without changing the entered value.
3. **Given** login submission is in progress, **When** the form renders, **Then** all form controls and placeholder secondary buttons are disabled.

---

### User Story 4 - Submit Credential Login (Priority: P1)

As an admin, I want the login screen to submit my email and password and start an authenticated session when the credentials are accepted so that I can enter the admin portal.

**Why this priority**: Credential login is the primary path from the authentication screen into protected admin workflows.

**Independent Test**: The login behavior can be tested by submitting valid and invalid credentials while confirming session state, redirect behavior, and error messaging.

**Acceptance Scenarios**:

1. **Given** an admin submits accepted credentials, **When** the login response contains an access token, **Then** the application stores the access token for the current session and sends the admin to the dashboard.
2. **Given** an admin submits credentials for a locked account, **When** the login attempt fails with an account-locked result, **Then** the application shows a specific account-locked message.
3. **Given** an admin submits invalid credentials, **When** the login attempt fails for any other authentication reason, **Then** the application shows the generic message "Invalid email or password".

---

### User Story 5 - Complete MFA Challenge (Priority: P1)

As a Super Admin whose credentials require MFA, I want to enter my authenticator-app code after password login so that I can complete secure access to the admin portal.

**Why this priority**: Super Admin access requires the strongest authentication path, and credential login is incomplete when the backend requires MFA.

**Independent Test**: The MFA challenge can be tested by simulating a login result that requires MFA, submitting valid and invalid authenticator codes, and confirming session state, redirect behavior, and validation feedback.

**Acceptance Scenarios**:

1. **Given** credential login succeeds but requires MFA, **When** the login screen receives an MFA challenge token, **Then** the login screen shows the MFA challenge instead of the credential login form.
2. **Given** the MFA challenge is displayed, **When** the Super Admin submits a valid authenticator code, **Then** the application completes authentication, stores the access token for the current session, and sends the Super Admin to the dashboard.
3. **Given** the MFA challenge is displayed, **When** the Super Admin submits an invalid authenticator code, **Then** the application remains on the MFA challenge and shows a clear verification error.

## Requirements

### Functional Requirements

- **FR-001**: The Authentication feature MUST provide a Zod schema for login payloads (`email`, `password`, `remember_me`).
- **FR-002**: The Authentication feature MUST provide a Zod schema for MFA code payloads (`code`).
- **FR-003**: The Authentication feature MUST provide a Zod schema for password reset request payloads (`email`).
- **FR-004**: The Authentication feature MUST provide a Zod schema for password reset confirmation payloads (`token`, `password`, `password_confirmation`) with strong password rules and matching confirmation.
- **FR-005**: The Authentication feature MUST provide a Zod schema for invitation acceptance payloads (`token`, `password`, `password_confirmation`) with strong password rules and matching confirmation.
- **FR-006**: Each schema MUST export its inferred TypeScript type.
- **FR-007**: The Authentication feature MUST provide an in-memory Zustand store that holds `accessToken` (string | null) with `setToken(token)` and `clearSession()` actions and NO persistence middleware.
- **FR-008**: The Authentication feature MUST provide a layout guard component that reads the access token from the auth store and redirects unauthenticated users to `/login`.
- **FR-009**: The Authentication feature MUST provide a reusable login form component with email and password inputs, password visibility control, and a "Keep me logged in for 30 days" checkbox.
- **FR-010**: The login form MUST validate input with the shared login validation rules before invoking its supplied submit handler.
- **FR-011**: The login form MUST expose placeholder controls for SSO and biometrics authentication without implementing those flows.
- **FR-012**: The login form MUST support a loading state that prevents user interaction while submission is in progress.
- **FR-013**: The Authentication feature MUST provide credential-login behavior that submits the validated login payload to the backend authentication endpoint.
- **FR-014**: When credential login succeeds with an access token, the application MUST update the current in-memory auth session.
- **FR-015**: When credential login succeeds with an access token, the application MUST redirect the admin to `/dashboard`.
- **FR-016**: When credential login fails because the account is locked, the application MUST show a specific account-locked error message.
- **FR-017**: When credential login fails for any other authentication error, the application MUST show the generic message "Invalid email or password".
- **FR-018**: When credential login succeeds with an MFA challenge token instead of an access token, the application MUST present an MFA challenge step on the login screen.
- **FR-019**: The MFA challenge step MUST accept and validate a time-based one-time password code before attempting verification.
- **FR-020**: The Authentication feature MUST provide MFA verification behavior that submits the challenge token, the TOTP method, and the entered code to the backend verification endpoint.
- **FR-021**: When MFA verification succeeds with an access token, the application MUST update the current in-memory auth session.
- **FR-022**: When MFA verification succeeds with an access token, the application MUST redirect the Super Admin to `/dashboard`.
- **FR-023**: When MFA verification fails, the application MUST keep the Super Admin on the MFA challenge step and show a clear verification error.

## Success Criteria

### Measurable Outcomes

- **SC-001**: All five schemas are defined in `src/features/auth/schemas/auth.schema.ts`.
- **SC-002**: Each schema exports a corresponding TypeScript type.
- **SC-003**: Strong-password schemas enforce minimum length, uppercase, number, and special-character rules.
- **SC-004**: Password confirmation schemas fail validation when the two password fields do not match.
- **SC-005**: `src/features/auth/stores/auth-store.ts` stores the access token in memory only and exposes `setToken` and `clearSession`.
- **SC-006**: `src/components/layout/auth-guard.tsx` redirects to `/login` when no token exists and renders children when authenticated.
- **SC-007**: `src/features/auth/components/login-form.tsx` renders the required login controls and calls its supplied submit handler only after successful validation.
- **SC-008**: The login form disables all interactive controls while loading.
- **SC-009**: A successful credential-login response with an access token results in the token being available in the current auth session.
- **SC-010**: A successful credential-login response with an access token redirects the admin to the dashboard.
- **SC-011**: A locked-account credential-login failure displays a locked-account message, while other authentication failures display "Invalid email or password".
- **SC-012**: A credential-login response that requires MFA displays the MFA challenge step without losing the challenge token.
- **SC-013**: A valid MFA challenge completion results in the access token being available in the current auth session.
- **SC-014**: A valid MFA challenge completion redirects the Super Admin to the dashboard.
- **SC-015**: Invalid MFA code submissions keep the Super Admin on the challenge step and display a verification error.

## Assumptions

- Zod is already installed and is the project's validation library.
- Shared primitive schemas (email, strong password) exist in `src/lib/validation/primitives.ts` and should be reused where appropriate.
- Authentication API calls are intentionally outside the login form component and will be handled by the consuming route or hook.
- The backend login response includes an access token when credential login is complete and successful, or an MFA challenge token when an additional verification step is required.
- MFA verification for this phase uses authenticator-app TOTP codes only; other MFA methods are outside this phase.
- The MFA challenge is part of the `/login` flow and does not use a separate MFA verification route.
