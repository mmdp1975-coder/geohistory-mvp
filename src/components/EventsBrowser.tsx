// geohistory-mvp/components/EventsBrowser.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchEvents, type EventQuery } from "../lib/api";
import type { EventItem } from "../lib/types";

type State =
  | { status: "idle"; data: null; error: null }
  | { status: "loading"; data: null; error: null }
  | { status: "loaded"; data: EventItem[]; error: null }
  | { status: "error"; data: null; error: string };

export default function EventsBrowser() {
  const [q, setQ] = useState("");
  const [groupEvent, setGroupEvent] = useState("");
  const [continent, setContinent] = useState("");
  const [country, setCountry] = useState("");
  const [yearFrom, setYearFrom] = useState<string>("");
  const [yearTo, setYearTo] = useState<string>("");
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [limit, setLimit] = useState<number>(50);
  const [offset, setOffset] = useState<number>(0);

  const [state, setState] = useState<State>({ status: "idle", data: null, error: null });

  const params: EventQuery = useMemo(
    () => ({
      q,
      group_event: groupEvent,
      continent,
      country,
      year_from: yearFrom || undefined,
      year_to: yearTo || undefined,
      order,
      limit,
      offset,
    }),
    [q, groupEvent, continent, country, yearFrom, yearTo, order, limit, offset]
  );

  async function runSearch() {
    setState({ status: "loading", data: null, error: null });
    try {
      const res = await fetchEvents(params);
      setState({ status: "loaded", data: res.items, error: null });
    } catch (err: any) {
      setState({ status: "error", data: null, error: err?.message || "Unknown error" });
    }
  }

  // Primo load
  useEffect(() => {
    runSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canPrev = offset > 0;
  const canNext = state.status === "loaded" && (state.data?.length ?? 0) >= limit;

  return (
    <div className="mx-auto max-w-5xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold">GeoHistory — Events</h1>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm mb-1">Search (title)</label>
          <input
            className="w-full border rounded-lg px-3 py-2"
            placeholder="e.g. Rome"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Group event</label>
          <input
            className="w-full border rounded-lg px-3 py-2"
            placeholder="e.g. Renaissance"
            value={groupEvent}
            onChange={(e) => setGroupEvent(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Continent</label>
          <input
            className="w-full border rounded-lg px-3 py-2"
            placeholder="e.g. Europe"
            value={continent}
            onChange={(e) => setContinent(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Country</label>
          <input
            className="w-full border rounded-lg px-3 py-2"
            placeholder="e.g. Italy"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Year from</label>
          <input
            type="number"
            className="w-full border rounded-lg px-3 py-2"
            placeholder="e.g. 1400"
            value={yearFrom}
            onChange={(e) => setYearFrom(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Year to</label>
          <input
            type="number"
            className="w-full border rounded-lg px-3 py-2"
            placeholder="e.g. 1600"
            value={yearTo}
            onChange={(e) => setYearTo(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Order</label>
          <select
            className="w-full border rounded-lg px-3 py-2"
            value={order}
            onChange={(e) => setOrder(e.target.value as "asc" | "desc")}
          >
            <option value="asc">Old → New</option>
            <option value="desc">New → Old</option>
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">Limit</label>
          <input
            type="number"
            className="w-full border rounded-lg px-3 py-2"
            min={1}
            max={500}
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
          />
        </div>

        <div className="flex items-end gap-2">
          <button
            onClick={() => {
              setOffset(0);
              runSearch();
            }}
            className="border rounded-lg px-4 py-2"
          >
            Search
          </button>
          <button
            onClick={() => {
              setQ("");
              setGroupEvent("");
              setContinent("");
              setCountry("");
              setYearFrom("");
              setYearTo("");
              setOrder("asc");
              setLimit(50);
              setOffset(0);
              runSearch();
            }}
            className="border rounded-lg px-4 py-2"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="border rounded-xl p-4">
        {state.status === "loading" && <p>Loading…</p>}
        {state.status === "error" && <p className="text-red-600">Error: {state.error}</p>}
        {state.status === "loaded" && (
          <>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm">
                Showing <strong>{state.data.length}</strong> item(s)
              </p>
              <div className="flex gap-2">
                <button
                  disabled={!canPrev}
                  onClick={() => {
                    if (!canPrev) return;
                    const next = Math.max(0, offset - limit);
                    setOffset(next);
                    runSearch();
                  }}
                  className="border rounded-lg px-3 py-1 disabled:opacity-50"
                >
                  ◀ Prev
                </button>
                <button
                  disabled={!canNext}
                  onClick={() => {
                    if (!canNext) return;
                    const next = offset + limit;
                    setOffset(next);
                    runSearch();
                  }}
                  className="border rounded-lg px-3 py-1 disabled:opacity-50"
                >
                  Next ▶
                </button>
              </div>
            </div>
            <ul className="space-y-3">
              {state.data.map((ev) => (
                <li key={ev.id} className="border rounded-lg p-3">
                  <div className="text-lg font-medium">
                    {ev.title} {ev.event_year !== null ? <span className="text-sm opacity-70">({ev.event_year})</span> : null}
                  </div>
                  <div className="text-sm opacity-80">
                    {[ev.location, ev.country, ev.continent].filter(Boolean).join(" · ")}
                  </div>
                  {ev.wikipedia_url ? (
                    <div className="mt-1">
                      <a href={ev.wikipedia_url} target="_blank" rel="noreferrer" className="underline">
                        Wikipedia
                      </a>
                    </div>
                  ) : null}
                  {ev.description ? <p className="mt-2 text-sm">{ev.description}</p> : null}
                </li>
              ))}
            </ul>
          </>
        )}
        {state.status === "idle" && <p>Ready.</p>}
      </div>
    </div>
  );
}
