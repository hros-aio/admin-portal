# Implementation Plan: Authentication Validation Schemas

**Branch**: `001-authentication-validation-schemas` | **Date**: 2026-07-02 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-authentication-validation-schemas/spec.md`

## Summary

Create a feature-scoped Zod schema file at `src/features/auth/schemas/auth.schema.ts` that defines and exports schemas and inferred types for login, MFA, password reset, and invitation acceptance forms. Additionally, implement an in-memory auth store and a layout guard that redirects unauthenticated users to `/login`.

## Technical Context

**Language/Version**: TypeScript 5.x

**Primary Dependencies**: Zod, Zustand, Next.js

**Storage**: In-memory only (no persistence for access tokens per ADR-FE-001).

**Testing**: Vitest

**Target Platform**: Next.js frontend

**Project Type**: Web application

**Performance Goals**: N/A

**Constraints**: Frontend only; no pages, routing changes, API client changes, or authentication business logic. The layout guard is a cross-cutting wrapper, not a page-level UI component.

**Scale/Scope**: Schema file, auth store, and layout guard for the Authentication feature.

## Constitution Check

_GATE: Must pass before implementation._

- P1 Type-safety: Schemas export inferred TypeScript types; store and guard are typed. ✅
- P3 Feature-based modularity: Schema and store live under `src/features/auth/`. ✅
- No forbidden practices: Validation lives in Zod schemas, not `onSubmit`. ✅
- Token storage: Access token is kept in memory only; no persistence middleware. ✅

## Project Structure

### Documentation (this feature)

```text
specs/001-authentication-validation-schemas/
├── spec.md
├── plan.md
└── tasks.md
```

### Source Code (repository root)

```text
src/features/auth/schemas/
├── .gitkeep
└── auth.schema.ts

src/features/auth/stores/
└── auth-store.ts

src/components/layout/
├── .gitkeep
└── auth-guard.tsx
```

**Structure Decision**: Single-project Next.js frontend. The schema and store files live in their respective feature folders following the `src/features/<feature>/<category>/` convention. The layout guard is placed in `src/components/layout/` as a shared route-protection primitive.

## Complexity Tracking

No constitution violations anticipated. The layout guard imports from the auth feature store; this is a deliberate cross-cutting concern analogous to the existing `src/lib/api/auth-middleware.ts`.
