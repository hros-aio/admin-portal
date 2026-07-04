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

## Assumptions

- Zod is already installed and is the project's validation library.
- Shared primitive schemas (email, strong password) exist in `src/lib/validation/primitives.ts` and should be reused where appropriate.
- Authentication API calls are intentionally outside the login form component and will be handled by the consuming route or hook.
