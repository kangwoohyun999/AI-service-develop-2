import { prisma } from "@/lib/prisma";
import { jsonData, jsonError } from "@/lib/api-response";
import { isCreateTaskInput } from "@/lib/validation";
import { isPriority } from "@/lib/priority";

export async function GET() {
  const tasks = await prisma.task.findMany({ orderBy: { createdAt: "asc" } });
  return jsonData(tasks);
}

export async function POST(request: Request) {
  const body: unknown = await request.json();

  if (!isCreateTaskInput(body)) {
    return jsonError("Title is required", 400);
  }

  const rawPriority = (body as { priority?: unknown }).priority;
  if (rawPriority !== undefined && !isPriority(rawPriority)) {
    return jsonError("Invalid priority", 400);
  }

  const task = await prisma.task.create({
    data: {
      title: body.title.trim(),
      priority: isPriority(rawPriority) ? rawPriority : "MEDIUM",
    },
  });

  return jsonData(task, { status: 201 });
}
