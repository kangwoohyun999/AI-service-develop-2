<!--
Sync Impact Report
Version change: [TEMPLATE] → 1.0.0 (initial ratification)
Modified principles: N/A (first adoption)
Added sections:
  - I. Next.js App Router + TypeScript
  - II. Uniform JSON API Responses
  - III. No `any` Types (Strict Typing)
  - Governance
Removed sections:
  - [SECTION_2_NAME] / [SECTION_2_CONTENT] generic placeholder — omitted; the user specified
    exactly three governance rules and no additional constraints section was requested
  - [SECTION_3_NAME] / [SECTION_3_CONTENT] generic placeholder — omitted for the same reason
Deferred / TODO placeholders: none
Templates requiring follow-up review (not modified by this command):
  - .specify/templates (plan/spec/tasks, if present) — confirm they assume App Router
    (app/*/route.ts) rather than Pages Router, and don't suggest `any` or non-JSON API
    responses in generated examples
-->

# mini-todo-sqlite Constitution

## Core Principles

### I. Next.js App Router + TypeScript
The project MUST be built with Next.js using the App Router (the `app/` directory), and all
source code MUST be written in TypeScript (`.ts`/`.tsx`). Plain JavaScript source files
(`.js`/`.jsx`) MUST NOT be added to application or API code. Route handlers, layouts, and pages
MUST follow App Router conventions (e.g., `app/api/*/route.ts`) rather than the legacy Pages
Router (`pages/`).
**Rationale**: App Router is the project's chosen architecture; mixing it with the Pages Router
or untyped JavaScript fragments the codebase and defeats the type-safety guarantees the team
relies on.

### II. Uniform JSON API Responses
Every API route handler MUST return its response as JSON, including error responses. Successful
and error responses MUST share a consistent, predictable shape (e.g., via `NextResponse.json(...)`),
and errors MUST carry an appropriate HTTP status code rather than being distinguished only by
body content. No route handler may return plain text, HTML, or an empty body as its primary
response format.
**Rationale**: A single, uniform response contract lets every client — the frontend, tests, and
any external consumer — parse API responses the same way, without per-endpoint special-casing.

### III. No `any` Types (Strict Typing)
The `any` type MUST NOT be used anywhere in the codebase — not in application code, API
handlers, or tests. Where a type is genuinely unknown at compile time, `unknown` MUST be used
together with explicit narrowing, and TypeScript's `strict` compiler option MUST remain enabled.
Suppressing type errors (e.g., `// @ts-ignore`, `// @ts-expect-error` without justification) to
smuggle in untyped values is likewise prohibited.
**Rationale**: `any` silently disables the type checker; forbidding it preserves the correctness
guarantees TypeScript is chosen for and prevents type errors from resurfacing at runtime.

## Governance
This constitution supersedes any conflicting convention, prior practice, or ad-hoc decision. Every
pull request or code review MUST verify that changes comply with the three principles above; a
reviewer who finds a violation MUST block the change until it is fixed or the constitution is
formally amended.

Amendments to this constitution require: (1) a written proposal describing the change and its
rationale, (2) an explicit version bump following semantic versioning — MAJOR for
backward-incompatible principle removal or redefinition, MINOR for a new or materially expanded
principle, PATCH for wording or clarification fixes — and (3) updating `Last Amended` to the date
of the change. Any deviation from a principle (e.g., a one-off non-JSON response, a necessary
Pages Router file, an unavoidable `any`) MUST be explicitly justified in the pull request
description; unjustified deviations MUST be rejected in review.

**Version**: 1.0.0 | **Ratified**: 2026-09-16 | **Last Amended**: 2026-09-16
