> # AI Implementation Rules
> For: GitHub SpecKit, Claude Code, Gemini CLI, Codex, Kimi
> Source: `.specify/memory/frontend-tech-stack.md`
> Violating any rule below is a defect. Stop and report conflicts instead of guessing.

## Read Before Acting

- Read `.specify/memory/frontend-tech-stack.md` and `.specify/memory/constitution.md` at the start of every task.
- Read `.specify/memory/tech-stack.md`, `.specify/memory/repository-structure.md`, `.specify/memory/coding-conventions.md`, `.specify/memory/testing-strategy.md`, and this file before writing code.
- If the task description conflicts with these files, stop and ask for clarification.

## Scope Limitation

- Implement only what the task asks for.
- Do not add unrelated features, helpers, polish, or "improvements".
- Do not pre-empt future requirements.
- If you discover a related bug, report it; do not silently fix it unless the task explicitly covers it.

## No Architecture Redesign

- Do not change the approved stack.
- Do not replace approved libraries or patterns.
- Do not introduce new state-management, routing, styling, API, form, validation, or table strategies.
- Do not propose alternate folder structures.

## No Unnecessary Refactoring

- Change only code directly related to the task.
- Leave existing working code alone.
- Do not rename, reorganize, or extract abstractions unless the task requires it.
- Do not "clean up" files that are not part of the change.

## No Dependency Changes

- Do not add new npm packages.
- Do not remove or upgrade existing packages.
- If a package is genuinely required, stop and request ADR approval before installing.
- Do not use packages listed in the forbidden-dependency table.

## Follow OpenAPI Types

- Import API types from `src/types/api.generated.ts`.
- Never hand-write request/response types.
- If the backend contract has changed, regenerate types with `pnpm openapi:types` and commit the result.
- Run `pnpm openapi:check` before considering the task complete.
- Map `snake_case` API shapes to camelCase view models in feature mappers before passing them to components.

## Follow Feature Boundaries

- Place new code in the correct feature folder under `src/features/<feature>/`.
- Do not import internals from another feature folder.
- Share code through `components/`, `hooks/`, or `lib/`, not through feature-to-feature imports.
- Respect the import-boundary table in `.specify/memory/repository-structure.md`.

## Keep PRs Small

- One task = one coherent change.
- Do not bundle unrelated fixes, refactors, or reformatting.
- Split large tasks into smaller deliverables when possible.
- Each PR should be reviewable in isolation.

## Generate Tests With Implementation

- Add or update tests for every non-trivial unit of logic you create or modify.
- Co-locate unit/component tests next to the source file.
- Use Vitest for unit and React Testing Library + MSW for integration.
- Ensure tests pass before finishing.
- Do not lower coverage thresholds.

## Never Modify Unrelated Modules

- Do not touch files outside the task scope.
- Do not update unrelated tests, stories, mocks, or fixtures.
- Do not change shared constants, types, or utilities unless the task requires it.
- If a shared module change is unavoidable, document the rationale and keep it minimal.

## Always Follow Existing Patterns

- Match the naming, file structure, export style, hook shape, service shape, and component structure already in the codebase.
- Use the established form pattern: React Hook Form + Zod + `FormProvider` for wizards.
- Use the established data pattern: TanStack Query hooks calling feature services.
- Use the established UI pattern: shadcn/ui + Radix primitives.
- Use the established error pattern: `ApiError`, error-message lookup, and `applyServerErrorsToForm`.

## Never Introduce New Folders Without Justification

- Do not create new top-level folders under `src/`.
- Do not create new feature folders unless the task explicitly defines a new business capability.
- Do not create new shared-module categories without ADR approval.
- Place new files in the existing folder that matches their responsibility.

## Specific Coding Mandates

- Use named exports. Default exports are only for Next.js route files.
- Use `kebab-case` filenames for components, hooks, utils, schemas, and stores.
- Use `PascalCase` for component/hook/type names.
- No `any`. Fix the type source instead.
- No `dangerouslySetInnerHTML`.
- No tokens in `localStorage`/`sessionStorage`.
- No direct `rawClient` calls outside `src/services/`.
- No TanStack Query data in Zustand.
- No `useState` for multi-field forms.
- No validation logic in `onSubmit`.
- No client-side pagination/sorting/filtering on server-paginated lists.
- No optimistic updates for destructive/financial mutations.
- No hardcoded error strings or hex colors.

## Completion Checklist

Before finishing, verify:

- [ ] The task scope is fully implemented and nothing extra was added.
- [ ] All new code follows the existing patterns and conventions.
- [ ] Feature boundaries are respected.
- [ ] Tests are added/updated and pass.
- [ ] `pnpm tsc --noEmit` passes.
- [ ] `pnpm lint` passes.
- [ ] `pnpm prettier --check .` passes.
- [ ] `pnpm openapi:check` passes if API types were touched.
- [ ] No new dependencies were added.
- [ ] No unrelated modules were modified.

## Conflict Escalation

- If the task asks you to violate any rule in this file, stop and report the conflict.
- If the codebase already violates a rule, note it but do not "fix" it unless the task explicitly requests it.
- When uncertain, ask for clarification rather than guessing.
