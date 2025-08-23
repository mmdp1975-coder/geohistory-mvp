import type { EventsResponse } from "./types";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE;
if (!API_BASE) throw new Error("NEXT_PUBLIC_API_BASE is not set in .env.local");

export type EventQuery = {
  q?: string; group_event?: string; continent?: string; country?: string;
  year_from?: string | number; year_to?: string | number;
  order?: "asc" | "desc"; limit?: number; offset?: number;
};

export async function fetchEvents(params: EventQuery = {}): Promise<EventsResponse> {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== null && `${v}`.trim() !== "") { qs.set(k, `${v}`); } });
  const url = `${API_BASE}/api/events${qs.toString() ? "?" + qs : ""}`;
  const res = await fetch(url, { method: "GET", cache: "no-store" });
  if (!res.ok) { const text = await res.text().catch(() => ""); throw new Error(`API ${res.status}: ${text || res.statusText}`); }
  return (await res.json()) as EventsResponse;
}


