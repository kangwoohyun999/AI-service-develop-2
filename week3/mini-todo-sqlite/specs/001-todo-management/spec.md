# Feature Specification: Todo Management

**Feature Branch**: `001-todo-management`

**Created**: 2026-09-16

**Status**: Draft

**Input**: User description: "사용자가 할 일을 추가하고, 목록을 확인하고, 완료 여부를 토글하고, 삭제할 수 있는 기능이 필요하다. 할 일에는 제목(필수)과 완료 여부가 있다."

**Amendment (2026-09-16)**: "할 일 카드에 중요도(priority)를 넣으시오. 우선순위는 3단계(High, Medium, Low)로
하시오." — adds a 3-level priority to each todo, settable at creation (default Medium) and
editable afterward; the list stays in creation order (not re-sorted by priority).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Add and view todos (Priority: P1)

A user wants to capture a task they need to do and see it alongside their other tasks so nothing
gets forgotten.

**Why this priority**: Capturing and viewing tasks is the core value of the feature. Without the
ability to add and see todos, no other capability (toggling, deleting) has anything to act on.
This alone is a viable MVP: a simple running list of tasks.

**Independent Test**: Can be fully tested by adding one or more todos with a title and confirming
each one appears in the todo list, delivering standalone value as a task list.

**Acceptance Scenarios**:

1. **Given** an empty todo list, **When** the user adds a todo with the title "우유 사기", **Then**
   the todo appears in the list with that title and a "not completed" status.
2. **Given** a todo list with existing todos, **When** the user adds another todo, **Then** the
   new todo appears in the list without affecting the existing todos.
3. **Given** the user attempts to add a todo without entering a title (or only whitespace),
   **When** they submit it, **Then** the system rejects the submission and no todo is created.

---

### User Story 2 - Toggle completion status (Priority: P2)

A user wants to mark a task as done when they finish it, and be able to mark it as not done again
if that was a mistake.

**Why this priority**: Tracking progress is the second most valuable capability after capturing
tasks — it's what turns a list into something actionable, but it depends on todos already
existing from User Story 1.

**Independent Test**: Can be fully tested by taking an existing todo, toggling its completion
status, and confirming the displayed status flips accordingly (and flips back on a second toggle).

**Acceptance Scenarios**:

1. **Given** a todo that is not completed, **When** the user toggles its completion status,
   **Then** the todo is shown as completed.
2. **Given** a todo that is completed, **When** the user toggles its completion status again,
   **Then** the todo is shown as not completed.

---

### User Story 3 - Delete a todo (Priority: P3)

A user wants to remove a task from their list that is no longer relevant, whether it was added by
mistake or is no longer needed.

**Why this priority**: Deletion keeps the list clean and trustworthy over time, but it is the
least critical of the three capabilities since a growing list of stale todos is an inconvenience
rather than a blocker.

**Independent Test**: Can be fully tested by deleting an existing todo and confirming it no longer
appears in the list, while other todos remain unaffected.

**Acceptance Scenarios**:

1. **Given** a todo list with at least one todo, **When** the user deletes a todo, **Then** that
   todo no longer appears in the list.
2. **Given** a todo list with multiple todos, **When** the user deletes one of them, **Then** the
   remaining todos are still present and unchanged.

---

### User Story 4 - Set and change priority (Priority: P2)

A user wants to mark how important a task is — High, Medium, or Low — when they add it, and be
able to change that later if the task becomes more or less urgent.

**Why this priority**: Distinguishing urgent tasks from routine ones is valuable as soon as the
list has more than a couple of items, but it's an enhancement to an existing todo, not something
that has to exist before todos can be tracked at all — hence P2, alongside completion tracking.

**Independent Test**: Can be fully tested by creating a todo without specifying a priority and
confirming it defaults to Medium, creating one with an explicit priority and confirming it's
stored as given, and changing an existing todo's priority and confirming it updates without
affecting its completion status.

**Acceptance Scenarios**:

1. **Given** a user is adding a new todo without choosing a priority, **When** the todo is
   created, **Then** its priority is "Medium".
2. **Given** a user is adding a new todo and chooses "High" (or "Low"), **When** the todo is
   created, **Then** its priority is stored as chosen.
3. **Given** an existing todo, **When** the user changes its priority, **Then** the new priority
   is shown and the todo's completion status is unchanged.

---

### Edge Cases

- What happens when a user submits a todo title that is empty or only whitespace? The system MUST
  reject it and the list MUST remain unchanged.
- What happens when the user tries to toggle or delete a todo that no longer exists (e.g., already
  deleted in another tab/session)? The system MUST treat it as a no-op or return a clear error,
  without affecting other todos.
- What happens when the todo list has no todos at all? The system MUST show an empty list rather
  than an error.
- What happens when a todo title is very long? The system MUST still store and display it without
  data loss (display may truncate visually, but the stored title is not shortened).
- What happens when a user tries to set a priority that isn't High, Medium, or Low? The system
  MUST reject it and leave the todo's existing priority (or, on creation, the whole creation)
  unchanged.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to add a new todo by providing a title.
- **FR-002**: System MUST require a non-empty, non-whitespace-only title to create a todo, and
  MUST reject creation attempts that don't meet this requirement.
- **FR-003**: System MUST set a newly created todo's completion status to "not completed" by
  default.
- **FR-004**: System MUST allow users to view the list of all todos, including their title and
  completion status.
- **FR-005**: System MUST allow users to toggle a todo's completion status between "completed" and
  "not completed".
- **FR-006**: System MUST allow users to delete a todo, permanently removing it from the list.
- **FR-007**: System MUST persist todos so that they remain available the next time the list is
  viewed (e.g., after a page refresh or restarting the application).
- **FR-008**: System MUST NOT allow toggling or deleting a todo that does not exist, and MUST
  leave the rest of the list unaffected when such an attempt is made.
- **FR-009**: System MUST allow a priority of "High", "Medium", or "Low" to be set on a todo when
  it is created, defaulting to "Medium" when none is chosen, and MUST reject any other value.
- **FR-010**: System MUST allow a todo's priority to be changed after creation to "High",
  "Medium", or "Low", without changing its completion status, and MUST reject any other value.

### Key Entities

- **Todo**: Represents a single task a user wants to track. Key attributes: a unique identifier,
  a title (required, non-empty text), a completion status (boolean: completed / not completed),
  and a priority (one of "High", "Medium", "Low"; defaults to "Medium"). Todos are independent of
  one another — no grouping or hierarchy beyond a flat list.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can add a new todo and see it appear in the list in under 5 seconds of
  effort (excluding typing time).
- **SC-002**: 100% of todos with a non-empty title are successfully saved and appear in the list;
  100% of empty-title submissions are rejected.
- **SC-003**: A user can change a todo's completion status with a single action, and the updated
  status is reflected immediately (within 1 second).
- **SC-004**: A user can remove a todo from their list with a single action, and it no longer
  appears in the list immediately (within 1 second) afterward.
- **SC-005**: 95% of first-time users can add, complete, and delete a todo without needing
  instructions.
- **SC-006**: A user can set or change a todo's priority with a single action, and the updated
  priority is reflected immediately (within 1 second).

## Assumptions

- This is a single-user application; there is no login, account system, or sharing of todos
  between different users.
- Todos persist across sessions (e.g., browser refresh or app restart) rather than existing only
  in temporary/in-memory state.
- Editing an existing todo's title is out of scope for this feature — only add, view, toggle
  completion, and delete are required.
- Todos are not organized by due date, category, or tags. Priority is a per-todo attribute (High
  / Medium / Low) but does not reorder the list — the list stays in creation order regardless of
  priority.
- There is no undo for deletion; once deleted, a todo cannot be recovered.
