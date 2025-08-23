// geohistory-mvp/lib/api.ts
import type { EventsResponse } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;
if (!API_BASE) {
  throw new Error("NEXT_PUBLIC_API_BASE is not set in .env.local");
}

export type EventQuery = {
  q?: string;
  group_event?: string;
  continent?: string;
  country?: string;
  year_from?: string | number;
  year_to?: string | number;
  has_coords?: boolean | "true" | "false"; // <— tieni solo questa riga
  order?: "asc" | "desc";
  limit?: number;
  offset?: number;
};

export async function fetchEvents(params: EventQuery = {}): Promise<EventsResponse> {
  const qs = new URLSearchParams();

  if (params.q) qs.set("q", String(params.q));
  if (params.group_event) qs.set("group_event", String(params.group_event));
  if (params.continent) qs.set("continent", String(params.continent));
  if (params.country) qs.set("country", String(params.country));
  if (params.year_from !== undefined) qs.set("from", String(params.year_from));
  if (params.year_to !== undefined) qs.set("to", String(params.year_to));
  if (params.has_coords !== undefined) qs.set("has_coords", params.has_coords ? "true" : "false");
  if (params.limit !== undefined) qs.set("limit", String(params.limit));
  if (params.offset !== undefined) qs.set("offset", String(params.offset));
  // NB: order per ora ignorato lato backend

  const url = `${API_BASE}/api/events${qs.toString() ? "?" + qs.toString() : ""}`;
  const res = await fetch(url, { method: "GET", cache: "no-store" });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }

  return (await res.json()) as EventsResponse;
}

// 🔹 NUOVO: dettaglio per ID
export async function fetchEventById(id: string) {
  const url = `${API_BASE}/api/events/${id}`;
  const res = await fetch(url, { method: "GET", cache: "no-store" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }
  return await res.json();
}


