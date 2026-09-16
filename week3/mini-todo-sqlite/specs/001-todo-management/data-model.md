# Data Model: Todo Management

## Task (spec entity: "Todo")

Represents a single task the user wants to track. Corresponds one-to-one with the "Todo" entity
in [spec.md](./spec.md#key-entities); named `Task` here to match the `/api/tasks` resource path
(see [research.md](./research.md#5-resource-naming-task-vs-todo)).

| Field       | Type      | Constraints                                            | Notes |
|-------------|-----------|---------------------------------------------------------|-------|
| `id`        | `Int`     | Primary key, auto-increment                             | Stable identity for toggle/delete (FR-005, FR-006, FR-008) |
| `title`     | `String`  | Required; must be non-empty after trimming whitespace   | FR-001, FR-002 |
| `completed` | `Boolean` | Required; defaults to `false`                           | FR-003, FR-005 |
| `priority`  | `String`  | One of `"LOW"` \| `"MEDIUM"` \| `"HIGH"`; defaults to `"MEDIUM"` | FR-009, FR-010 — modeled as `String`, not a Prisma `enum` (see [research.md](./research.md#6-priority-as-a-string-not-a-prisma-enum)) |
| `createdAt` | `DateTime`| Required; defaults to current time on creation           | Determines default list order (spec Assumptions: creation order) |

### Prisma schema sketch

Prisma 7 moved the datasource connection string out of `schema.prisma` and into
`prisma7.config.ts` / a `DATABASE_URL` env var, and generates the client as TypeScript source to
a project-local `generated/` folder rather than into `node_modules` (see
[research.md](./research.md#3-prisma--sqlite-integration-pattern)):

```prisma
generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}

datasource db {
  provider = "sqlite"
}

model Task {
  id        Int      @id @default(autoincrement())
  title     String
  completed Boolean  @default(false)
  priority  String   @default("MEDIUM")
  createdAt DateTime @default(now())
}
```

### Validation rules

- `title`: required on create; reject (HTTP 400) when absent, not a string, or empty/whitespace
  after `.trim()` (FR-002). No maximum length is enforced — SQLite `TEXT`/Prisma `String` stores
  arbitrarily long values without loss (spec Edge Cases: long titles).
- `completed`: not accepted as client input on create — always starts `false` (FR-003). Only
  changed via the toggle operation, which flips the current value (no client-supplied target
  value needed).
- `id`: not accepted as client input on create; assigned by the database.
- `priority`: optional on create (defaults to `"MEDIUM"` when absent); if present, must be one of
  `"LOW"`, `"MEDIUM"`, `"HIGH"` (case-sensitive) — reject (HTTP 400 `"Invalid priority"`)
  otherwise (FR-009). Changeable after creation via `PATCH` with a `priority` field in the body,
  independently of `completed` (FR-010).

### State transitions

```text
[created] --(POST /api/tasks)--> completed = false, priority = given or "MEDIUM"
completed = false --(PATCH /api/tasks/:id, no body/no priority key — toggle)--> completed = true
completed = true  --(PATCH /api/tasks/:id, no body/no priority key — toggle)--> completed = false
priority = X --(PATCH /api/tasks/:id, body has priority key — set)--> priority = Y (completed unchanged)
[any state] --(DELETE /api/tasks/:id)--> [removed, no further transitions]
```

`PATCH`'s action is decided by whether the request body contains a `priority` key — see
[research.md](./research.md#6-priority-as-a-string-not-a-prisma-enum) for the toggle-vs-update
disambiguation.

There is no state for a deleted task — deletion is permanent (spec Assumptions: no undo).

### Relationships

None. Tasks are independent flat records; no ownership/user relation since the app is
single-user (spec Assumptions), and no grouping/hierarchy entity exists in this feature's scope.
