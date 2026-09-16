# Phase 0 Research: Todo Management

## 1. Not-found behavior for toggle/delete (resolves spec Edge Case ambiguity)

**Decision**: Return HTTP `404 Not Found` with a JSON error body (`{ "error": "Task not found" }`)
when a `PATCH` or `DELETE` targets a task id that doesn't exist. The rest of the list is left
unaffected.

**Rationale**: The spec's edge case left this open ("no-op or return a clear error"). Because this
feature is implemented as a REST API, Constitution Principle II requires errors to carry an
appropriate HTTP status code rather than being distinguished only by body content — a silent `200`
no-op would violate that. `404` is the standard REST idiom for "no resource at this id" and gives
the frontend an unambiguous signal to, e.g., drop a stale item from its local view.

**Alternatives considered**:
- Silent no-op with `200 OK`: simpler client handling, but contradicts Constitution Principle II
  and hides a real error condition from the caller.
- `204 No Content` regardless of whether the row existed: same problem — indistinguishable from a
  successful delete.

## 2. Testing framework

**Decision**: Vitest, run against compiled/ts-node-executed route handler modules directly (not a
full browser), for both contract tests (request/response shape) and integration tests (one per
user-story acceptance scenario).

**Rationale**: Vitest has first-class TypeScript/ESM support with no extra config beyond what
Next.js already uses, is fast, and is the most common pairing with modern Next.js App Router
projects. Next.js App Router route handlers (`route.ts`) export plain async functions, so they can
be imported and invoked directly in tests without spinning up a server.

**Alternatives considered**:
- Jest: works, but needs more transform configuration for ESM/App Router and is slower; no
  material benefit here.
- Playwright end-to-end tests: valuable for full-browser coverage but heavier than this scope
  needs; the quickstart guide covers manual/browser validation instead, keeping automated tests
  focused on the API contract per Constitution Principle II.

## 3. Prisma + SQLite integration pattern

**Decision**: A single `PrismaClient` instance in `lib/prisma.ts`, cached on `globalThis` in
development to survive Next.js dev-server hot reload, matching Prisma's official Next.js guidance.

The installed Prisma version (7.10.0 — confirmed by probing the actual npm registry and CLI
output in this environment, since it postdates this model's training data) changed the setup
considerably from earlier Prisma majors:

- `schema.prisma`'s `datasource` block no longer takes a `url`. The connection string instead
  lives in a `DATABASE_URL` env var, read by a `prisma7.config.ts` file at the repo root (the
  filename is version-branded — Prisma 7's CLI specifically looks for `prisma7.config.ts`) that
  the `prisma` CLI (migrate/generate) uses for schema/migration commands only.
- The client generator is `prisma-client` (not the old `prisma-client-js`) with an explicit
  `output` path — it generates readable TypeScript source into a project-local folder
  (`generated/prisma/`), not compiled JS into `node_modules/.prisma/client`.
- The generated `PrismaClient` **requires** a driver adapter passed to its constructor — there is
  no built-in direct connection anymore. For local SQLite, `@prisma/adapter-better-sqlite3`
  (wrapping the native `better-sqlite3` driver) is used: `new PrismaBetterSqlite3({ url:
  process.env.DATABASE_URL })` passed as the `adapter` option.
- `prisma migrate dev` does **not** regenerate the client automatically in this version — running
  `prisma generate` is a required separate step after any schema change (verified by probing:
  running only `migrate dev` left `generated/prisma` unwritten).

`lib/prisma.ts` therefore builds the adapter from `process.env.DATABASE_URL` (loaded by Next.js's
built-in `.env` support at runtime) and passes it to `new PrismaClient({ adapter })`, caching the
result on `globalThis` exactly as before.

**Rationale**: Without caching, hot reload in `next dev` creates a new `PrismaClient` on every
edit, eventually exhausting file handles/connections — this is Prisma's documented pattern for
Next.js and is unaffected by the driver-adapter changes above. The driver-adapter requirement and
generator/config changes are not a choice made here — they're mandatory in the installed Prisma
version, discovered by running `prisma validate`/`generate`/`migrate dev` directly against a
throwaway probe project and reading the generated output, rather than trusting outdated
assumptions about Prisma's API.

**Alternatives considered**:
- A raw `better-sqlite3` driver without an ORM: rejected — the user explicitly requested Prisma.
- Creating a new `PrismaClient` per request: rejected due to the hot-reload connection-leak issue
  above.
- `@prisma/adapter-libsql` instead of `@prisma/adapter-better-sqlite3`: both work for local
  SQLite; `better-sqlite3` was chosen as the more established, synchronous, Node-native driver
  for a single local file with no remote/embedded-replica needs.

## 4. Request validation without `any`

**Decision**: Parse `request.json()` into `unknown`, then validate with a small hand-written type
guard (e.g., `isCreateTaskInput(body): body is { title: string }`) that checks
`typeof body.title === "string" && body.title.trim().length > 0`. Reject with `400` and a JSON
error body when validation fails.

**Rationale**: The scope is a single field (`title: string`) per write operation. A hand-written
guard satisfies Constitution Principle III (no `any`, explicit narrowing from `unknown`) without
adding a schema-validation dependency (e.g., `zod`) that this small a surface doesn't need.

**Alternatives considered**:
- `zod` or similar schema library: reasonable for larger APIs, but an extra dependency the
  four-operation, one-field scope here doesn't justify (YAGNI).

## 5. Resource naming: "Task" vs "Todo"

**Decision**: The REST resource and Prisma model are named `Task` (`/api/tasks`,
`prisma.task.*`), matching the endpoint path the user specified. The spec's "Todo" entity and this
`Task` model are the same concept — the spec's domain language stays "todo" for the reader; the
API/DB layer uses "task" as the noun for the URL and model name.

**Rationale**: The user explicitly requested `app/api/tasks/route.ts`; renaming the underlying
model to match avoids an awkward mismatch between the URL noun and the persisted entity name.

**Alternatives considered**:
- Keep the Prisma model named `Todo` while the route path stays `/api/tasks`: works, but leaves a
  confusing naming split between the DB layer and the API layer with no benefit.

## 6. Priority as a `String`, not a Prisma `enum`

**Decision**: The 3-level `priority` field (High/Medium/Low, FR-009/FR-010) is modeled in
`schema.prisma` as `priority String @default("MEDIUM")`, storing the literal values `"LOW"`,
`"MEDIUM"`, `"HIGH"`. The allowed set is enforced entirely at the application layer: a
`Priority` TypeScript union type plus a runtime `isPriority` type guard in `lib/priority.ts`,
reused by both the create-task and update-priority validation paths — the same `unknown`-narrowing
style already used for `title` (see decision #4).

**Rationale**: SQLite has no database-level enum type, and Prisma's `enum` schema construct has
never supported the SQLite connector (only Postgres/MySQL/CockroachDB do). Confirmed against the
installed Prisma 7.10.0 with `npx prisma validate` before writing any dependent code, consistent
with this project's practice of verifying Prisma/SQLite behavior directly rather than assuming it
(see decision #3). A `String` column with app-level validation gets the same 3-value guarantee
without a schema feature the database can't back.

**`PATCH` disambiguation**: `PATCH /api/tasks/{id}` already existed as a toggle-`completed`
endpoint taking no body. Rather than add a new route for editing priority, the request body's
shape now decides the action: a body containing a `priority` key updates only `priority`
(validated, 400 on an invalid value); no body, or a body without a `priority` key, keeps today's
toggle-`completed` behavior unchanged. This avoids a second endpoint for a single extra field and
avoids the alternative bug of a priority-only edit accidentally flipping `completed`.

**Alternatives considered**:
- A native Prisma `enum Priority { LOW MEDIUM HIGH }`: rejected — not supported on SQLite;
  `prisma validate` fails immediately.
- A separate endpoint (e.g., `PUT /api/tasks/{id}/priority`) for priority changes: rejected as an
  extra route/file for one field, when the existing `PATCH` can disambiguate by body shape.
- A single request body field like `{ action: "toggle" | "setPriority", priority? }`: more
  explicit but adds a required field to every caller (including the existing no-body toggle calls
  from the UI and tests) for no behavioral benefit at this scope.
