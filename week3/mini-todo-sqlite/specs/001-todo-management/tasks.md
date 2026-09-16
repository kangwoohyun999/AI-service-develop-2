---

description: "Task list template for feature implementation"
---

# Tasks: Todo Management

**Input**: Design documents from `/specs/001-todo-management/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/tasks-api.md](./contracts/tasks-api.md), [quickstart.md](./quickstart.md)

**Tests**: plan.md's Technical Context and research.md decision #2 explicitly chose Vitest for
contract and integration tests as part of this feature's design, so test tasks are included below.

**Organization**: Tasks are grouped by user story to enable independent implementation and
testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Single Next.js App Router project (per plan.md Project Structure): `app/`, `lib/`, `prisma/`,
`tests/` at repository root.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic tooling

- [X] T001 Add `prisma` and `@prisma/client` as dependencies (`npm install prisma @prisma/client`) and add `"db:migrate": "prisma migrate dev"` / `"db:generate": "prisma generate"` scripts to `package.json`
- [X] T002 Add `vitest` as a devDependency (`npm install -D vitest`) and create `vitest.config.ts` at the repo root configured for TypeScript route-handler modules under `app/api/` and `tests/**/*.test.ts` (per [research.md](./research.md#2-testing-framework))
- [X] T003 [P] Add `prisma/dev.db`, `prisma/dev.db-journal` to `.gitignore` so the local SQLite file is never committed

**Checkpoint**: Tooling installed; no code yet.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 Create `prisma/schema.prisma` with the sqlite datasource, the `prisma-client` generator outputting to `generated/prisma`, and the `Task` model exactly as specified in [data-model.md](./data-model.md#prisma-schema-sketch): `id Int @id @default(autoincrement())`, `title String` (required, no max length), `completed Boolean @default(false)`, `createdAt DateTime @default(now())` — **note**: Prisma 7 moved the datasource `url` out of `schema.prisma` into `prisma7.config.ts` / `DATABASE_URL`, and the client now requires a driver adapter (`@prisma/adapter-better-sqlite3`); see updated [research.md](./research.md#3-prisma--sqlite-integration-pattern) (depends on: T001)
- [X] T005 Run `npx prisma migrate dev --name init` to generate `prisma/migrations/` and create the local `prisma/dev.db` file, then run `npx prisma generate` (required separately — `migrate dev` does not regenerate the client in this version) to emit `generated/prisma/` (depends on: T004)
- [X] T006 [P] Create the Prisma Client singleton in `lib/prisma.ts`, constructing a `PrismaBetterSqlite3` adapter from `DATABASE_URL` and caching the client instance on `globalThis` in development to survive Next.js hot reload, per [research.md](./research.md#3-prisma--sqlite-integration-pattern) (depends on: T005)
- [X] T007 [P] Create JSON response helpers `jsonData<T>(data: T, init?)` and `jsonError(message: string, status: number)` in `lib/api-response.ts` that both return `NextResponse.json(...)`, implementing the `{ "data": ... }` / `{ "error": ... }` envelope from [contracts/tasks-api.md](./contracts/tasks-api.md) (Constitution Principle II: uniform JSON responses, no `any`)
- [X] T008 [P] Create the request validation guard in `lib/validation.ts`: a function `isCreateTaskInput(body: unknown): body is { title: string }` that returns true only when `body` is an object whose `title` is `typeof "string"` and `body.title.trim().length > 0`, per [data-model.md](./data-model.md#validation-rules) and [research.md](./research.md#4-request-validation-without-any) (no `any`, narrow from `unknown`)

**Checkpoint**: Foundation ready — user story implementation can now begin.

---

## Phase 3: User Story 1 - Add and view todos (Priority: P1) 🎯 MVP

**Goal**: Users can add a todo with a title and see it in the list, with empty titles rejected.

**Independent Test**: Add one or more todos via `POST /api/tasks` and confirm each appears via
`GET /api/tasks` with `completed: false`; confirm an empty/whitespace title is rejected with `400`
and creates nothing.

### Tests for User Story 1

- [X] T009 [P] [US1] Contract test in `tests/contract/tasks-api.test.ts` for `GET /api/tasks` (200, returns `{ data: [] }` on an empty table) and `POST /api/tasks` (201 with `{ data: Task }` on a valid title; 400 with `{ error: string }` on missing/empty/whitespace-only title), per [contracts/tasks-api.md](./contracts/tasks-api.md#get-apitasks) and [contracts/tasks-api.md](./contracts/tasks-api.md#post-apitasks)
- [X] T010 [P] [US1] Integration test in `tests/integration/todo-management.test.ts` covering spec.md User Story 1's three acceptance scenarios: adding "우유 사기" to an empty list, adding a second todo without disturbing the first, and rejecting a whitespace-only title (FR-001, FR-002, FR-003) — tests run against an isolated `prisma/test.db` via `tests/global-setup.ts`, not the dev database, since Vitest's cross-file parallelism otherwise races against shared SQLite state

### Implementation for User Story 1

- [X] T011 [US1] Implement `GET` and `POST` handlers in `app/api/tasks/route.ts`: `GET` returns all tasks ordered by `createdAt` ascending via `jsonData`; `POST` parses `request.json()`, validates with `isCreateTaskInput`, on failure returns `jsonError("Title is required", 400)`, on success creates a task with `completed: false` via Prisma and returns `jsonData(task, { status: 201 })` (depends on: T006, T007, T008)
- [X] T012 [US1] Build the todo list UI in `app/page.tsx`: on mount, `fetch("/api/tasks")` and render each task's title and completed state (or an empty-state message when the list is empty); render a form with a text input and submit button that `POST`s to `/api/tasks` and prepends/refetches the new task, showing a validation message when the API returns 400 (depends on: T011)
- [X] T013 [US1] Manually run the User Story 1 steps in [quickstart.md](./quickstart.md#validate-user-story-1--add-and-view-todos-p1) (add a valid todo, confirm it appears; submit a whitespace title, confirm it's rejected and the list is unchanged) and confirm SC-001/SC-002 (depends on: T012) — verified via direct API calls against the running dev server plus an SSR render check (`curl http://localhost:3000/`); no browser automation tool was available in this environment to click through the UI directly

**Checkpoint**: User Story 1 is fully functional and independently testable/demoable as a basic
todo list.

---

## Phase 4: User Story 2 - Toggle completion status (Priority: P2)

**Goal**: Users can mark a todo completed and un-completed again.

**Independent Test**: Take an existing todo, call `PATCH /api/tasks/{id}` and confirm
`completed` flips to `true`; call it again and confirm it flips back to `false`.

### Tests for User Story 2

- [X] T014 [P] [US2] Contract test in `tests/contract/tasks-api.test.ts` for `PATCH /api/tasks/{id}`: 200 with `{ data: Task }` and `completed` flipped for an existing id; 404 with `{ error: string }` for a non-existent id, per [contracts/tasks-api.md](./contracts/tasks-api.md#patch-apitasksid)
- [X] T015 [P] [US2] Integration test in `tests/integration/todo-management.test.ts` covering spec.md User Story 2's two acceptance scenarios: toggling a not-completed todo to completed, and toggling it back to not-completed (FR-005)

### Implementation for User Story 2

- [X] T016 [US2] Implement the `PATCH` handler in `app/api/tasks/[id]/route.ts`: look up the task by id, if absent return `jsonError("Task not found", 404)` (per [research.md](./research.md#1-not-found-behavior-for-toggledelete-resolves-spec-edge-case-ambiguity)), otherwise flip `completed` via Prisma `update` and return `jsonData(task)` (depends on: T006, T007, T008) — Next.js 16 route context `params` is a `Promise<{ id: string }>` (confirmed via `node_modules/next/dist/docs/.../route.md`), awaited before use
- [X] T017 [US2] Add a toggle control (e.g., checkbox) to each list item in `app/page.tsx` that calls `PATCH /api/tasks/{id}` and updates that task's `completed` state in local UI state on success (depends on: T012, T016)

**Checkpoint**: User Stories 1 AND 2 both work independently.

---

## Phase 5: User Story 3 - Delete a todo (Priority: P3)

**Goal**: Users can permanently remove a todo from the list.

**Independent Test**: Delete an existing todo via `DELETE /api/tasks/{id}` and confirm it no
longer appears in `GET /api/tasks` while other todos are unaffected.

### Tests for User Story 3

- [X] T018 [P] [US3] Contract test in `tests/contract/tasks-api.test.ts` for `DELETE /api/tasks/{id}`: 200 with `{ data: { id } }` for an existing id; 404 with `{ error: string }` for a non-existent id (e.g., deleting the same id twice), per [contracts/tasks-api.md](./contracts/tasks-api.md#delete-apitasksid)
- [X] T019 [P] [US3] Integration test in `tests/integration/todo-management.test.ts` covering spec.md User Story 3's two acceptance scenarios: deleting a todo removes only that one, and remaining todos are unaffected (FR-006, FR-008)

### Implementation for User Story 3

- [X] T020 [US3] Implement the `DELETE` handler in `app/api/tasks/[id]/route.ts`: look up the task by id, if absent return `jsonError("Task not found", 404)`, otherwise delete it via Prisma and return `jsonData({ id })` (depends on: T016, since it edits the same file)
- [X] T021 [US3] Add a delete button to each list item in `app/page.tsx` that calls `DELETE /api/tasks/{id}` and removes that task from local UI state on success (depends on: T012, T020)

**Checkpoint**: All user stories are independently functional — full add/view/toggle/delete todo
management works end-to-end.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validation and cleanup across all stories

- [X] T022 [P] Run the full [quickstart.md](./quickstart.md) validation end-to-end (all three user stories, including the repeat-delete 404 case) against a freshly migrated `prisma/dev.db` (depends on: T013, T017, T021)
- [X] T023 [P] Polish empty-state and loading-state presentation in `app/page.tsx` using the existing Tailwind setup, consistent with the current scaffold's styling (depends on: T012)
- [X] T024 Run `npm run lint` and `npx tsc --noEmit` and fix any findings to confirm no `any` types and strict-mode compliance (Constitution Principles I & III) (depends on: T022, T023) — both clean; confirmed with a grep for `any` across `app/`, `lib/`, `tests/` with zero matches

---

## Phase 7: User Story 4 - Set and change priority (Priority: P2)

**Goal**: Each todo carries a High/Medium/Low priority, settable at creation (default Medium) and
editable afterward, without reordering the list.

**Independent Test**: Create a todo without a priority and confirm it defaults to Medium; create
one with an explicit priority and confirm it's stored as given; change an existing todo's
priority and confirm it updates without touching `completed`.

- [X] T025 [P] [US4] Create `lib/priority.ts`: `Priority` union type (`"LOW" | "MEDIUM" | "HIGH"`), `PRIORITY_VALUES`, and `isPriority(value: unknown): value is Priority` guard, per [research.md](./research.md#6-priority-as-a-string-not-a-prisma-enum) (no native Prisma enum on SQLite)
- [X] T026 [US4] Add `priority String @default("MEDIUM")` to the `Task` model in `prisma/schema.prisma`; run `npx prisma validate`, then `npx prisma migrate dev --name add_priority`, then `npx prisma generate` (depends on: T025)
- [X] T027 [US4] Extend `POST` in `app/api/tasks/route.ts`: accept optional `priority` in the body, default to `"MEDIUM"` when absent, `jsonError("Invalid priority", 400)` when present but invalid (depends on: T025, T026)
- [X] T028 [US4] Extend `PATCH` in `app/api/tasks/[id]/route.ts`: read the request body; if it contains a `priority` key, validate and update only `priority` (400 on invalid, `completed` untouched); otherwise keep the existing toggle-`completed` behavior (depends on: T025, T026)
- [X] T029 [P] [US4] Contract tests in `tests/contract/tasks-api.test.ts`: POST default/explicit/invalid priority; PATCH priority-only update leaves `completed` unchanged; PATCH invalid priority returns 400; PATCH with no body still toggles (regression) (depends on: T027, T028)
- [X] T030 [P] [US4] Integration tests in `tests/integration/todo-management.test.ts`: new "User Story 4" block covering default-to-Medium, explicit-priority creation, and change-priority-after-creation (depends on: T027, T028)
- [X] T031 [US4] Add a priority `<select>` to the add form (defaults to Medium) and an editable, color-coded priority badge/`<select>` on each card in `app/page.tsx`, wired to `PATCH { priority }` (depends on: T027, T028)
- [X] T032 [P] Update spec-kit docs for this increment: `spec.md` (FR-009/FR-010, User Story 4, Key Entities, edge case, SC-006), `data-model.md`, `research.md` (#6), `contracts/tasks-api.md`, `quickstart.md` (depends on: T025-T031)

**Checkpoint**: Priority is settable at creation, editable afterward, validated on both paths, and
does not affect list order or completion state — verified via automated tests and manual API
smoke tests against the dev server.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup (T001) completion — BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational (Phase 2) completion
  - Can proceed in priority order (P1 → P2 → P3) for incremental delivery, or in parallel if
    staffed, since each story touches `app/api/tasks/[id]/route.ts` and `app/page.tsx`
    sequentially (see per-task file-conflict notes below)
- **Polish (Phase 6)**: Depends on all three user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: No dependencies on other stories — the MVP
- **User Story 2 (P2)**: Independently testable via the API, but its UI task (T017) builds on
  User Story 1's list UI (T012); its route file (`app/api/tasks/[id]/route.ts`) is created here
- **User Story 3 (P3)**: Independently testable via the API, but its UI task (T021) builds on
  User Story 1's list UI (T012); its implementation (T020) edits the same route file User Story 2
  created (T016), so T020 must follow T016

### Within Each User Story

- Tests are written first (T009/T010, T014/T015, T018/T019) and should fail before the
  corresponding implementation task
- API route implementation before UI wiring
- Story complete (checkpoint) before moving to the next priority

### Parallel Opportunities

- T003 can run alongside T001/T002 (different file)
- T006, T007, T008 can run in parallel once T005 is done (three independent files)
- Within each story's Tests subsection, the contract test and integration test tasks are marked
  [P] (different files)
- Different user stories' route-file implementation tasks (T011, T016, T020) are NOT parallel
  with each other where they share a file (T016 and T020 both edit
  `app/api/tasks/[id]/route.ts`); T011 (a different file, `app/api/tasks/route.ts`) could start
  in parallel with T016 if staffed, since Foundational is already done

---

## Parallel Example: User Story 1

```bash
# Launch both tests for User Story 1 together:
Task: "Contract test for GET/POST /api/tasks in tests/contract/tasks-api.test.ts"
Task: "Integration test for add/view acceptance scenarios in tests/integration/todo-management.test.ts"
```

## Parallel Example: Foundational Phase

```bash
# After T005 (migration) completes, launch these together:
Task: "Create Prisma Client singleton in lib/prisma.ts"
Task: "Create JSON response helpers in lib/api-response.ts"
Task: "Create isCreateTaskInput validation guard in lib/validation.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T008) — CRITICAL, blocks all stories
3. Complete Phase 3: User Story 1 (T009-T013)
4. **STOP and VALIDATE**: run quickstart.md's User Story 1 section independently
5. Demo: a working add/view todo list

### Incremental Delivery

1. Setup + Foundational → foundation ready
2. Add User Story 1 → validate independently → demo (MVP!)
3. Add User Story 2 → validate independently → demo (todos can now be completed)
4. Add User Story 3 → validate independently → demo (full add/view/toggle/delete)
5. Polish (T022-T024) → final quickstart pass + lint/type-check

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Every write to `app/api/tasks/[id]/route.ts` (T016, then T020) must be sequential — same file
- Commit after each task or logical group
- Stop at any checkpoint to validate a story independently
