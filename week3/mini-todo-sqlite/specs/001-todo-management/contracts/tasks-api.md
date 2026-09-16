# API Contract: Tasks

Base path: `/api/tasks`. Every response — success or error — is JSON (Constitution Principle II).
No endpoint requires authentication (spec Assumptions: single-user, no login).

## Shared types

```ts
type Priority = "LOW" | "MEDIUM" | "HIGH";

interface Task {
  id: number;
  title: string;
  completed: boolean;
  priority: Priority;
  createdAt: string; // ISO 8601
}

interface ErrorBody {
  error: string;
}
```

## `GET /api/tasks`

List all tasks (FR-004).

- **Success — 200**
  ```json
  { "data": [ { "id": 1, "title": "우유 사기", "completed": false, "priority": "MEDIUM", "createdAt": "2026-09-16T00:00:00.000Z" } ] }
  ```
  Returns `{ "data": [] }` when there are no tasks (spec Edge Cases: empty list).
- Ordered by `createdAt` ascending (creation order, per spec Assumptions — unaffected by
  `priority`).

## `POST /api/tasks`

Create a task (FR-001, FR-002, FR-003, FR-009).

- **Request body** — `priority` is optional
  ```json
  { "title": "우유 사기", "priority": "HIGH" }
  ```
- **Success — 201**
  ```json
  { "data": { "id": 1, "title": "우유 사기", "completed": false, "priority": "HIGH", "createdAt": "2026-09-16T00:00:00.000Z" } }
  ```
  When `priority` is omitted, it defaults to `"MEDIUM"`.
- **Error — 400** (missing `title`, non-string `title`, or empty/whitespace-only after trim)
  ```json
  { "error": "Title is required" }
  ```
- **Error — 400** (`priority` present but not one of `"LOW"` / `"MEDIUM"` / `"HIGH"`)
  ```json
  { "error": "Invalid priority" }
  ```

## `PATCH /api/tasks/{id}`

Toggle completion (FR-005) **or** change priority (FR-010), decided by the request body (see
[research.md](../research.md#6-priority-as-a-string-not-a-prisma-enum)):

- **No body, or a body without a `priority` key** → toggles the current `completed` value.
  - **Success — 200**
    ```json
    { "data": { "id": 1, "title": "우유 사기", "completed": true, "priority": "MEDIUM", "createdAt": "2026-09-16T00:00:00.000Z" } }
    ```
- **Body contains a `priority` key** → sets `priority` to that value; `completed` is unchanged.
  - **Request body**
    ```json
    { "priority": "LOW" }
    ```
  - **Success — 200**
    ```json
    { "data": { "id": 1, "title": "우유 사기", "completed": false, "priority": "LOW", "createdAt": "2026-09-16T00:00:00.000Z" } }
    ```
  - **Error — 400** (`priority` not one of `"LOW"` / `"MEDIUM"` / `"HIGH"`)
    ```json
    { "error": "Invalid priority" }
    ```
- **Error — 404** (no task with this `id`, either case; see [research.md](../research.md#1-not-found-behavior-for-toggledelete-resolves-spec-edge-case-ambiguity))
  ```json
  { "error": "Task not found" }
  ```

## `DELETE /api/tasks/{id}`

Delete a task (FR-006).

- **Success — 200**
  ```json
  { "data": { "id": 1 } }
  ```
- **Error — 404** (no task with this `id`)
  ```json
  { "error": "Task not found" }
  ```

## Cross-cutting contract rules

- All 4xx/5xx responses use `ErrorBody` and an appropriate status code — never a 200 with an
  error flag buried in the body (Constitution Principle II; FR-008).
- All success responses wrap the payload in `{ "data": ... }` for a single, predictable shape
  across list/single/delete responses.
