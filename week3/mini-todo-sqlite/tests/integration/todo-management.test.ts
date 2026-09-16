import { beforeEach, afterAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { GET, POST } from "@/app/api/tasks/route";
import { PATCH, DELETE } from "@/app/api/tasks/[id]/route";

function postRequest(body: unknown): Request {
  return new Request("http://localhost/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function idContext(id: number) {
  return { params: Promise.resolve({ id: String(id) }) };
}

function patchRequest(body?: unknown): Request {
  return new Request("http://localhost", {
    method: "PATCH",
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

async function listTasks() {
  const response = await GET();
  return (await response.json()).data;
}

beforeEach(async () => {
  await prisma.task.deleteMany();
});

afterAll(async () => {
  await prisma.task.deleteMany();
  await prisma.$disconnect();
});

describe("User Story 1 - Add and view todos", () => {
  it("adding a todo to an empty list makes it appear with not-completed status", async () => {
    expect(await listTasks()).toEqual([]);

    await POST(postRequest({ title: "우유 사기" }));

    const tasks = await listTasks();
    expect(tasks).toHaveLength(1);
    expect(tasks[0]).toMatchObject({ title: "우유 사기", completed: false });
  });

  it("adding a second todo does not affect existing todos", async () => {
    await POST(postRequest({ title: "first" }));
    await POST(postRequest({ title: "second" }));

    const tasks = await listTasks();
    expect(tasks.map((t: { title: string }) => t.title)).toEqual(["first", "second"]);
  });

  it("rejects a whitespace-only title and creates nothing", async () => {
    await POST(postRequest({ title: "first" }));

    const response = await POST(postRequest({ title: "   " }));
    expect(response.status).toBe(400);

    const tasks = await listTasks();
    expect(tasks).toHaveLength(1);
  });
});

describe("User Story 2 - Toggle completion status", () => {
  it("toggles a not-completed todo to completed", async () => {
    await POST(postRequest({ title: "우유 사기" }));
    const [task] = await listTasks();

    await PATCH(new Request("http://localhost"), idContext(task.id));

    const [updated] = await listTasks();
    expect(updated.completed).toBe(true);
  });

  it("toggles a completed todo back to not-completed", async () => {
    await POST(postRequest({ title: "우유 사기" }));
    const [task] = await listTasks();

    await PATCH(new Request("http://localhost"), idContext(task.id));
    await PATCH(new Request("http://localhost"), idContext(task.id));

    const [updated] = await listTasks();
    expect(updated.completed).toBe(false);
  });
});

describe("User Story 3 - Delete a todo", () => {
  it("deleting a todo removes only that one", async () => {
    await POST(postRequest({ title: "first" }));
    await POST(postRequest({ title: "second" }));
    const [first, second] = await listTasks();

    await DELETE(new Request("http://localhost"), idContext(first.id));

    const remaining = await listTasks();
    expect(remaining).toHaveLength(1);
    expect(remaining[0].id).toBe(second.id);
  });

  it("remaining todos are unaffected by the delete", async () => {
    await POST(postRequest({ title: "first" }));
    await POST(postRequest({ title: "second" }));
    const [first, second] = await listTasks();

    await DELETE(new Request("http://localhost"), idContext(first.id));

    const [remaining] = await listTasks();
    expect(remaining).toMatchObject({ id: second.id, title: "second", completed: false });
  });
});

describe("User Story 4 - Set and change priority", () => {
  it("defaults a new todo's priority to MEDIUM when none is given", async () => {
    await POST(postRequest({ title: "우유 사기" }));
    const [task] = await listTasks();
    expect(task.priority).toBe("MEDIUM");
  });

  it("creates a todo with the explicitly chosen priority", async () => {
    await POST(postRequest({ title: "급한 일", priority: "HIGH" }));
    const [task] = await listTasks();
    expect(task.priority).toBe("HIGH");
  });

  it("changes an existing todo's priority without affecting its completion status", async () => {
    await POST(postRequest({ title: "우유 사기" }));
    const [task] = await listTasks();

    await PATCH(patchRequest({ priority: "LOW" }), idContext(task.id));

    const [updated] = await listTasks();
    expect(updated).toMatchObject({ priority: "LOW", completed: false });
  });
});
