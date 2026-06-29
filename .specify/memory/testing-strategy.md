# Testing Strategy

## Test Pyramid

- Many unit tests (Vitest) for schemas, utilities, mappers, and store logic.
- Some integration tests (React Testing Library + MSW) for feature flows with mocked API.
- Few E2E tests (Playwright) for critical multi-step user journeys.

## Unit Testing Rules

- Cover every Zod schema: valid input passes, invalid input produces expected error paths and messages.
- Cover pure utility functions (`usageMeterColor`, `buildDiffPayload`, `canModifyAdmin`, formatting helpers).
- Cover view-model mappers (snake_case API shape → camelCase UI shape and back).
- Cover Zustand store state transitions (hydrate, updateDraft, discardDraft, commitDraft).
- Co-locate test files next to source files: `*.test.ts` / `*.test.tsx`.
- Use `it.each` for parameterized cases where applicable.

## Integration Testing Rules

- Render with real TanStack Query and real React Hook Form.
- Mock only the network boundary via MSW.
- Mock against the same OpenAPI-derived paths; do not hand-roll service stubs that can drift from the contract.
- Use `AppTestProviders` wrapper from `src/tests/test-utils.tsx`.
- Query DOM with accessible queries (`getByRole`, `getByLabelText`) by default.
- `getByTestId` is a last resort, never the default.
- Test user-visible behavior: validation messages, loading states, error states, success feedback, navigation outcomes.
- Test mapping of server `409`/`422` errors onto inline form fields.

## E2E Testing Rules

- Reserve E2E for critical journeys from `03_UserStories.md` / `04_AcceptanceCriteria.md`:
  - Login (credential + MFA) → Dashboard.
  - Create Tenant (full 5-section wizard) → appears in list.
  - Archive Tenant (typed confirmation gate).
  - Upgrade Subscription Plan with proration preview confirm.
  - Invite Admin → accept invite → first login.
  - Edit Role Permission Matrix → conflict detection banner appears.
- E2E tests run against a seeded test backend or containerized stack, never production.
- Use dedicated seed fixtures.
- Include a keyboard-only navigation pass for the Create Tenant wizard and Permission Matrix editor.
- Place E2E specs in `e2e/<feature>/<scenario>.spec.ts`.

## Coverage Requirements

| Layer | Minimum Coverage |
|---|---:|
| Zod schemas | 95% |
| Hooks (query/mutation) | 85% |
| Utils / Mappers | 90% |
| Components (RTL) | 70% (focus on logic-bearing components) |
| Critical E2E journeys | 100% of P1 user stories listed above |

CI runs `pnpm test:coverage` and `pnpm test:e2e` on every PR.

## Mocking Strategy

- Unit tests: mock dependencies at the function/module boundary.
- Integration tests: use MSW to intercept HTTP requests and return typed responses matching the OpenAPI envelope.
- Never mock the service layer with hand-rolled stubs in integration tests.
- E2E tests: mock the backend by running a seeded test instance; do not mock the browser network layer.
- Shared MSW handlers and fixtures live in `src/tests/msw/` and `src/tests/fixtures/`.

## Test Folder Conventions

- Unit and component tests: co-located with source (`src/features/<feature>/components/*.test.tsx`).
- Shared test utilities: `src/tests/test-utils.tsx`.
- Shared MSW handlers: `src/tests/msw/handlers/` and `src/tests/msw/server.ts`.
- Shared fixtures: `src/tests/fixtures/`.
- E2E tests: `e2e/<feature>/<scenario>.spec.ts`.

## Required Test Commands

```json
{
  "test": "vitest run",
  "test:watch": "vitest",
  "test:coverage": "vitest run --coverage",
  "test:e2e": "playwright test",
  "test:e2e:ui": "playwright test --ui"
}
```

## Accessibility Testing

- RTL tests query by role/label by default.
- `eslint-plugin-jsx-a11y` runs in lint.
- Playwright + `@axe-core/playwright` scans Dashboard, Tenant List, Create Tenant wizard, and Permission Matrix pages in CI.
- Fail CI on any new serious or critical violation.
