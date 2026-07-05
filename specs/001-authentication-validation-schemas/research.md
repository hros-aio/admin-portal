# Research: Authentication Validation Schemas

## Decision: Use Zod for all authentication validation schemas

**Rationale**: The project constitution requires validation logic to live in Zod schemas, and the frontend source of truth lists Zod as the validation strategy.

**Alternatives considered**: Inline validation, custom validators, React Hook Form-only rules, and API-only validation were rejected because they would violate the schema-only requirement and the project's validation rules.

## Decision: Reuse shared validation primitives

**Rationale**: Email and strong-password policies are shared validation concerns and should be sourced from `src/lib/validation/primitives.ts` to avoid duplicated rules.

**Alternatives considered**: Duplicating regexes or password rules inside the auth schema file was rejected because it would create drift from shared validation behavior.

## Decision: Export inferred TypeScript types from schemas

**Rationale**: The specification requires each schema to export its inferred type. This keeps runtime validation and static form payload types aligned.

**Alternatives considered**: Hand-written interfaces were rejected because they can drift from the schemas.

## Decision: Test schemas directly with Vitest

**Rationale**: The implementation scope is schema-only. Direct unit tests are sufficient to validate accepted and rejected payloads without UI, routing, services, hooks, or API dependencies.

**Alternatives considered**: Component tests, route tests, hook tests, and MSW-backed integration tests were rejected as out of scope.
