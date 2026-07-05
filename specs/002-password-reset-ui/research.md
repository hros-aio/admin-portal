# Research: Password Reset UI

## Decision: Reuse existing React Hook Form + Zod pattern

**Rationale**: The repository already implements authentication forms with `useForm`, `zodResolver`, inferred Zod input types, `aria-busy`, and disabled `fieldset` behavior. Reusing that pattern satisfies the constitution's form-validation rule and keeps behavior consistent with login and MFA.

**Alternatives considered**:

- Inline page-level validation: Rejected because validation logic would move into route components and conflict with the Zod-source-of-truth rule.
- `useState` for form fields: Rejected because multi-field forms must use React Hook Form.

## Decision: Reuse FE-01 validation policy without adding token handling

**Rationale**: `passwordResetRequestSchema` already defines the reset request validation contract. The existing reset confirmation backend payload schema includes a token, but this UI feature is scoped to visible new-password and confirm-password fields and excludes reset-token handling. The reset-password form should therefore use an auth-schema-owned visible-field Zod schema that reuses the same strong-password and password-match policy without fabricating or parsing a token.

**Alternatives considered**:

- Fabricate a placeholder token in the UI form: Rejected because it would blur the explicit out-of-scope reset-token boundary.
- Parse URL tokens in the page: Rejected because reset-token handling is out of scope.
- Validate only HTML input attributes: Rejected because acceptance criteria require Zod schemas.

## Decision: Keep submission delegated and local for this phase

**Rationale**: The spec explicitly excludes backend reset integration. Forms should expose submit callbacks so a later feature can add mutation hooks without changing form internals.

**Alternatives considered**:

- Add TanStack Query mutations now: Rejected as out of scope.
- Add service methods now without calling them: Rejected because it expands API surface before integration is specified.

## Decision: Test components with accessible RTL queries

**Rationale**: Existing auth component tests use `screen.getByLabelText`, `screen.getByRole`, `userEvent`, and `waitFor`. Following this convention keeps tests focused on user-observable behavior and avoids `getByTestId` as the default.

**Alternatives considered**:

- Snapshot tests: Rejected because they do not prove validation or loading behavior.
- End-to-end tests: Rejected for this phase because the behavior is component-local and no backend integration exists.
