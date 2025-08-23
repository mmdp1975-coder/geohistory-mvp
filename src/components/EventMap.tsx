// src/components/EventMap.tsx
"use client";

// Tutto ciò che tocca `window` deve essere dinamico
import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";

// Import CSS solo lato client
import "leaflet/dist/leaflet.css";

// Carico i componenti react‑leaflet dinamicamente per evitare SSR
const MapContainer = dynamic(
  async () => (await import("react-leaflet")).MapContainer,
  { ssr: false }
);
const TileLayer = dynamic(
  async () => (await import("react-leaflet")).TileLayer,
  { ssr: false }
);
const Marker = dynamic(
  async () => (await import("react-leaflet")).Marker,
  { ssr: false }
);
const Popup = dynamic(async () => (await import("react-leaflet")).Popup, {
  ssr: false,
});

// Tipi base (snelli) per quello che usiamo a mappa
type EventItem = {
  id: string;
  title?: string | null;
  title_it?: string | null;
  title_en?: string | null;
  continent?: string | null;
  country?: string | null;
  location?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  wikipedia?: string | null;
  image_url?: string | null;
  year_from?: number | null;
  year_to?: number | null;
};

type ApiListResponse = {
  items: EventItem[];
  total?: number;
  count?: number;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE?.trim() ||
  "https://geohistory-backend.onrender.com";

const MAPTILER_KEY =
  process.env.NEXT_PUBLIC_MAPTILER_API_KEY?.trim() || "";

export default function EventMap() {
  const [items, setItems] = useState<EventItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  // centro Europa di default
  const center = useMemo<[number, number]>(() => [46.2, 9.2], []);

  useEffect(() => {
    let aborted = false;

    async function load() {
      try {
        setError(null);
        const url = `${API_BASE}/api/events?lang=it`;
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error(`API ${res.status}`);
        const json: ApiListResponse = await res.json();

        // filtro solo i records con coordinate valide
        const withCoords = (json.items || []).filter(
          (it) =>
            typeof it.latitude === "number" &&
            typeof it.longitude === "number"
        );

        if (!aborted) setItems(withCoords);
      } catch (e: any) {
        if (!aborted) setError(e?.message ?? "Errore caricamento dati");
      }
    }

    load();
    return () => {
      aborted = true;
    };
  }, []);

  // Se manca la MapTiler key, non crashiamo: usiamo OSM tile pubbliche
  const tileUrl = MAPTILER_KEY
    ? `https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`
    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  const tileAttribution = MAPTILER_KEY
    ? '&copy; <a href="https://www.maptiler.com/copyright/" target="_blank" rel="noreferrer">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
    : '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors';

  return (
    <div className="w-full h-full">
      {error ? (
        <div className="p-4 text-red-700 bg-red-50 border border-red-200">
          Errore lato client: {error}
        </div>
      ) : null}

      {/* il container deve avere height esplicita */}
      <div className="w-full h-[100dvh]">
        <MapContainer
          center={center}
          zoom={5}
          scrollWheelZoom
          style={{ width: "100%", height: "100%" }}
        >
          <TileLayer url={tileUrl} attribution={tileAttribution} />
          {items.map((ev) => {
            const lat = ev.latitude!;
            const lon = ev.longitude!;
            const title =
              ev.title ??
              ev.title_it ??
              ev.title_en ??
              ev.location ??
              "Evento";

            if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;

            return (
              <Marker key={ev.id} position={[lat, lon]}>
                <Popup>
                  <div className="text-sm leading-snug">
                    <div className="font-semibold">{title}</div>
                    {ev.country || ev.location ? (
                      <div className="opacity-80">
                        {[ev.location, ev.country].filter(Boolean).join(", ")}
                      </div>
                    ) : null}
                    {ev.year_from || ev.year_to ? (
                      <div className="opacity-70 mt-1">
                        {ev.year_from ?? "?"} – {ev.year_to ?? "?"}
                      </div>
                    ) : null}
                    {ev.wikipedia ? (
                      <div className="mt-1">
                        <a
                          href={ev.wikipedia}
                          target="_blank"
                          rel="noreferrer"
                          className="underline"
                        >
                          Wikipedia
                        </a>
                      </div>
                    ) : null}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}


