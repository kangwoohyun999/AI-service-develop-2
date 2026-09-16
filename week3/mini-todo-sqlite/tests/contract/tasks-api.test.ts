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

beforeEach(async () => {
  await prisma.task.deleteMany();
});

afterAll(async () => {
  await prisma.task.deleteMany();
  await prisma.$disconnect();
});

describe("GET /api/tasks", () => {
  it("returns an empty data array when there are no tasks", async () => {
    const response = await GET();
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual({ data: [] });
  });

  it("returns all tasks ordered by creation", async () => {
    await prisma.task.create({ data: { title: "first" } });
    await prisma.task.create({ data: { title: "second" } });

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.map((t: { title: string }) => t.title)).toEqual(["first", "second"]);
  });
});

describe("POST /api/tasks", () => {
  it("creates a task with a valid title, defaulting completed to false and priority to MEDIUM", async () => {
    const response = await POST(postRequest({ title: "우유 사기" }));
    expect(response.status).toBe(201);

    const body = await response.json();
    expect(body.data).toMatchObject({ title: "우유 사기", completed: false, priority: "MEDIUM" });
    expect(typeof body.data.id).toBe("number");
  });

  it("rejects a missing title with 400", async () => {
    const response = await POST(postRequest({}));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Title is required" });
  });

  it("rejects a whitespace-only title with 400", async () => {
    const response = await POST(postRequest({ title: "   " }));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Title is required" });
  });

  it("creates a task with an explicit valid priority", async () => {
    const response = await POST(postRequest({ title: "급한 일", priority: "HIGH" }));
    expect(response.status).toBe(201);
    expect((await response.json()).data).toMatchObject({ title: "급한 일", priority: "HIGH" });
  });

  it("rejects an invalid priority with 400", async () => {
    const response = await POST(postRequest({ title: "급한 일", priority: "URGENT" }));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Invalid priority" });
  });
});

describe("PATCH /api/tasks/[id]", () => {
  it("toggles completed from false to true and back to false", async () => {
    const created = await prisma.task.create({ data: { title: "toggle me" } });

    const first = await PATCH(new Request("http://localhost"), idContext(created.id));
    expect(first.status).toBe(200);
    expect((await first.json()).data.completed).toBe(true);

    const second = await PATCH(new Request("http://localhost"), idContext(created.id));
    expect(second.status).toBe(200);
    expect((await second.json()).data.completed).toBe(false);
  });

  it("returns 404 for a non-existent id", async () => {
    const response = await PATCH(new Request("http://localhost"), idContext(999999));
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "Task not found" });
  });

  it("updates only priority when the body includes a priority, leaving completed unchanged", async () => {
    const created = await prisma.task.create({ data: { title: "prioritize me" } });

    const response = await PATCH(patchRequest({ priority: "LOW" }), idContext(created.id));
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.data).toMatchObject({ priority: "LOW", completed: false });
  });

  it("rejects an invalid priority in the body with 400", async () => {
    const created = await prisma.task.create({ data: { title: "prioritize me" } });

    const response = await PATCH(patchRequest({ priority: "URGENT" }), idContext(created.id));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Invalid priority" });
  });

  it("still toggles completed when the body has no priority key", async () => {
    const created = await prisma.task.create({ data: { title: "toggle me" } });

    const response = await PATCH(patchRequest({}), idContext(created.id));
    expect(response.status).toBe(200);
    expect((await response.json()).data.completed).toBe(true);
  });
});

describe("DELETE /api/tasks/[id]", () => {
  it("deletes an existing task", async () => {
    const created = await prisma.task.create({ data: { title: "delete me" } });

    const response = await DELETE(new Request("http://localhost"), idContext(created.id));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ data: { id: created.id } });

    expect(await prisma.task.findUnique({ where: { id: created.id } })).toBeNull();
  });

  it("returns 404 when deleting the same id twice", async () => {
    const created = await prisma.task.create({ data: { title: "delete me" } });

    await DELETE(new Request("http://localhost"), idContext(created.id));
    const second = await DELETE(new Request("http://localhost"), idContext(created.id));

    expect(second.status).toBe(404);
    expect(await second.json()).toEqual({ error: "Task not found" });
  });
});
