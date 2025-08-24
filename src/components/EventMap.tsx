// src/components/EventMap.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

// Dynamic import (client only)
const MapContainer = dynamic(
  () => import('react-leaflet').then(m => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then(m => m.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then(m => m.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then(m => m.Popup),
  { ssr: false }
);

// Tipi minimi
type EventItem = {
  id: string;
  title?: string | null;
  title_it?: string | null;
  title_en?: string | null;
  continent?: string | null;
  country?: string | null;
  location?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  wikipedia?: string | null;
  image_url?: string | null;
  year_from?: number | null;
  year_to?: number | null;
};
type ApiListResponse = { items: EventItem[]; total?: number; count?: number };

// Config base
const RAW_BASE = (process.env.NEXT_PUBLIC_API_BASE || '').trim();
const API_BASE = RAW_BASE.replace(/\/+$/, '');
const MAPTILER_KEY = (process.env.NEXT_PUBLIC_MAPTILER_API_KEY || '').trim();

// Builder URL assoluti verso il backend (niente // o /api/api)
const abs = (path: string) => `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;

export default function EventMap({ query }: { query?: string }) {
  const [items, setItems] = useState<EventItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  // centro Europa
  const center = useMemo<[number, number]>(() => [46.2, 9.2], []);

  useEffect(() => {
    const ac = new AbortController();

    (async () => {
      try {
        setError(null);
        const q = query && query.trim().length ? query.trim() : '?lang=it';
        const res = await fetch(abs('/api/events' + (q.startsWith('?') ? q : `?${q}`)), {
          cache: 'no-store',
          signal: ac.signal,
        });
        if (!res.ok) throw new Error(`API ${res.status}`);
        const json: ApiListResponse = await res.json();

        const withCoords = (json.items || []).filter((it) => {
          const lat = Number(it.latitude);
          const lon = Number(it.longitude);
          return Number.isFinite(lat) && Number.isFinite(lon);
        });

        setItems(withCoords);
      } catch (e: any) {
        if (e?.name === 'AbortError') return;
        setError(e?.message ?? 'Errore caricamento dati');
      }
    })();

    return () => ac.abort();
  }, [query]);

  // Tiles
  const tileUrl = MAPTILER_KEY
    ? `https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  const tileAttribution = MAPTILER_KEY
    ? '&copy; <a href="https://www.maptiler.com/copyright/" target="_blank" rel="noreferrer">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
    : '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors';

  return (
    <div className="w-full h-full relative">
      {/* pannellino di debug */}
      <div
        className="fixed left-2 top-2 z-[1000] text-xs rounded border bg-white/85 px-2 py-1"
        style={{ pointerEvents: 'none' }}
      >
        items: {items.length} {error ? `| err: ${error}` : ''} {query ? `| q: ${query}` : ''}
      </div>

      {error && (
        <div className="p-4 text-red-700 bg-red-50 border border-red-200">
          Errore lato client: {error}
        </div>
      )}

      <div className="w-full" style={{ height: '100vh', minHeight: '600px' }}>
        <MapContainer
          center={center}
          zoom={5}
          scrollWheelZoom
          style={{ width: '100%', height: '100%' }}
        >
          <TileLayer url={tileUrl} attribution={tileAttribution} />
          {items.map((ev) => {
            const lat = Number(ev.latitude);
            const lon = Number(ev.longitude);
            if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;

            const title =
              ev.title ?? ev.title_it ?? ev.title_en ?? ev.location ?? 'Evento';

            return (
              <Marker key={ev.id} position={[lat, lon] as [number, number]}>
                <Popup>
                  <div className="text-sm leading-snug">
                    <div className="font-semibold">{title}</div>
                    {(ev.country || ev.location) && (
                      <div className="opacity-80">
                        {[ev.location, ev.country].filter(Boolean).join(', ')}
                      </div>
                    )}
                    {(ev.year_from || ev.year_to) && (
                      <div className="opacity-70 mt-1">
                        {ev.year_from ?? '?'} – {ev.year_to ?? '?'}
                      </div>
                    )}
                    {ev.wikipedia && (
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
                    )}
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
