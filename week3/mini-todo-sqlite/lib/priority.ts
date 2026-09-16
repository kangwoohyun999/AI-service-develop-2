export type Priority = "LOW" | "MEDIUM" | "HIGH";

export const PRIORITY_VALUES: readonly Priority[] = ["LOW", "MEDIUM", "HIGH"];

export function isPriority(value: unknown): value is Priority {
  return typeof value === "string" && (PRIORITY_VALUES as readonly string[]).includes(value);
}
