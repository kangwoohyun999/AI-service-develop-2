export function isCreateTaskInput(body: unknown): body is { title: string } {
  if (typeof body !== "object" || body === null || !("title" in body)) {
    return false;
  }

  const { title } = body as { title: unknown };
  return typeof title === "string" && title.trim().length > 0;
}
