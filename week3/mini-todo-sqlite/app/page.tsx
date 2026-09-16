"use client";

import { useEffect, useState } from "react";
import type { Priority } from "@/lib/priority";

interface Task {
  id: number;
  title: string;
  completed: boolean;
  priority: Priority;
  createdAt: string;
}

const PRIORITY_LABELS: Record<Priority, string> = {
  HIGH: "높음",
  MEDIUM: "보통",
  LOW: "낮음",
};

const PRIORITY_BADGE_CLASSES: Record<Priority, string> = {
  HIGH: "border-red-600/30 bg-red-600/10 text-red-700 dark:text-red-400",
  MEDIUM: "border-amber-600/30 bg-amber-600/10 text-amber-700 dark:text-amber-400",
  LOW: "border-zinc-500/30 bg-zinc-500/10 text-zinc-600 dark:text-zinc-400",
};

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    setLoading(true);
    const response = await fetch("/api/tasks");
    const body: { data: Task[] } = await response.json();
    setTasks(body.data);
    setLoading(false);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const response = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, priority }),
    });

    if (!response.ok) {
      const body: { error: string } = await response.json();
      setError(body.error);
      return;
    }

    setTitle("");
    setPriority("MEDIUM");
    await fetchTasks();
  }

  async function handleToggle(id: number) {
    await fetch(`/api/tasks/${id}`, { method: "PATCH" });
    await fetchTasks();
  }

  async function handlePriorityChange(id: number, nextPriority: Priority) {
    await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priority: nextPriority }),
    });
    await fetchTasks();
  }

  async function handleDelete(id: number) {
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    await fetchTasks();
  }

  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-xl flex-col gap-6 px-6 py-16">
        <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">할 일 목록</h1>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="할 일을 입력하세요"
            className="flex-1 rounded-md border border-black/[.08] bg-white px-3 py-2 text-black dark:border-white/[.145] dark:bg-black dark:text-zinc-50"
          />
          <select
            value={priority}
            onChange={(event) => setPriority(event.target.value as Priority)}
            className="rounded-md border border-black/[.08] bg-white px-2 py-2 text-black dark:border-white/[.145] dark:bg-black dark:text-zinc-50"
          >
            <option value="HIGH">{PRIORITY_LABELS.HIGH}</option>
            <option value="MEDIUM">{PRIORITY_LABELS.MEDIUM}</option>
            <option value="LOW">{PRIORITY_LABELS.LOW}</option>
          </select>
          <button
            type="submit"
            disabled={title.trim().length === 0}
            className="rounded-md bg-foreground px-4 py-2 text-background hover:bg-[#383838] disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-[#ccc]"
          >
            추가
          </button>
        </form>

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

        {loading ? (
          <p className="rounded-md border border-dashed border-black/[.08] px-3 py-6 text-center text-zinc-600 dark:border-white/[.145] dark:text-zinc-400">
            불러오는 중...
          </p>
        ) : tasks.length === 0 ? (
          <p className="rounded-md border border-dashed border-black/[.08] px-3 py-6 text-center text-zinc-600 dark:border-white/[.145] dark:text-zinc-400">
            할 일이 없습니다. 위에서 새 할 일을 추가해 보세요.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {tasks.map((task) => (
              <li
                key={task.id}
                className="flex items-center justify-between rounded-md border border-black/[.08] px-3 py-2 dark:border-white/[.145]"
              >
                <label className="flex flex-1 items-center gap-2">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleToggle(task.id)}
                  />
                  <span
                    className={
                      task.completed
                        ? "text-zinc-400 line-through dark:text-zinc-500"
                        : "text-black dark:text-zinc-50"
                    }
                  >
                    {task.title}
                  </span>
                </label>
                <select
                  value={task.priority}
                  onChange={(event) =>
                    handlePriorityChange(task.id, event.target.value as Priority)
                  }
                  className={`ml-3 rounded-full border px-2 py-1 text-xs font-medium ${PRIORITY_BADGE_CLASSES[task.priority]}`}
                >
                  <option value="HIGH">{PRIORITY_LABELS.HIGH}</option>
                  <option value="MEDIUM">{PRIORITY_LABELS.MEDIUM}</option>
                  <option value="LOW">{PRIORITY_LABELS.LOW}</option>
                </select>
                <button
                  type="button"
                  onClick={() => handleDelete(task.id)}
                  className="ml-3 text-sm text-zinc-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400"
                >
                  삭제
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
