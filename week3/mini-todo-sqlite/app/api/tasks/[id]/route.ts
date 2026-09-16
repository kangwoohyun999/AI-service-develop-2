import { prisma } from "@/lib/prisma";
import { jsonData, jsonError } from "@/lib/api-response";
import { isPriority } from "@/lib/priority";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteContext) {
  const id = Number((await params).id);

  const existing = await prisma.task.findUnique({ where: { id } });
  if (!existing) {
    return jsonError("Task not found", 404);
  }

  const bodyText = await request.text();
  const body: unknown = bodyText.length > 0 ? JSON.parse(bodyText) : undefined;
  const hasPriorityKey =
    typeof body === "object" && body !== null && "priority" in body;

  if (hasPriorityKey) {
    const rawPriority = (body as { priority?: unknown }).priority;
    if (!isPriority(rawPriority)) {
      return jsonError("Invalid priority", 400);
    }

    const task = await prisma.task.update({
      where: { id },
      data: { priority: rawPriority },
    });
    return jsonData(task);
  }

  const task = await prisma.task.update({
    where: { id },
    data: { completed: !existing.completed },
  });

  return jsonData(task);
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const id = Number((await params).id);

  const existing = await prisma.task.findUnique({ where: { id } });
  if (!existing) {
    return jsonError("Task not found", 404);
  }

  await prisma.task.delete({ where: { id } });

  return jsonData({ id });
}
