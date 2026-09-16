import { NextResponse } from "next/server";

export function jsonData<T>(data: T, init?: ResponseInit): NextResponse<{ data: T }> {
  return NextResponse.json({ data }, init);
}

export function jsonError(message: string, status: number): NextResponse<{ error: string }> {
  return NextResponse.json({ error: message }, { status });
}
