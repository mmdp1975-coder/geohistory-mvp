'use client';

import React from 'react';
import Link from 'next/link';
import { MapContainer, TileLayer, Marker, Popup, LayersControl, useMap, ZoomControl } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';
import L from 'leaflet';

// Fix icone default (niente pacchetti aggiuntivi)
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

type EventListItem = {
  id: string;
  event_en: string | null;
  event_it: string | null;
  year_from: number | null;
  year_to: number | null;
  exact_date: string | null;
  continent: string | null;
  country: string | null;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
};

type ApiResponse = {
  items: EventListItem[];
  total?: number;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? '';

const fetchUrl = (path: string) => (API_BASE ? `${API_BASE}${path}` : path);

function formatYears(e: EventListItem) {
  const yf = e.year_from != null ? e.year_from : null;
  const yt = e.year_to != null ? e.year_to : null;
  if (yf == null && yt == null) return '';
  if (yf != null && yt != null && yf !== yt) return `${yf}–${yt}`;
  return `${yf ?? yt}`;
}

function FitToMarkers({ points }: { points: LatLngExpression[] }) {
  const map = useMap();
  React.useEffect(() => {
    if (!points.length) return;
    const bounds = L.latLngBounds(points as any);
    map.fitBounds(bounds, { padding: [40, 40] });
    setTimeout(() => map.invalidateSize(), 120);
  }, [map, points]);
  return null;
}

export default function EventsMap() {
  const [events, setEvents] = React.useState<EventListItem[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const ac = new AbortController();
    setLoading(true);
    setError(null);

    const url = fetchUrl(`/api/events?limit=2000`);
    fetch(url, { signal: ac.signal, cache: 'no-store' })
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data: ApiResponse | EventListItem[] = await r.json();
        const items = Array.isArray(data) ? data : data.items ?? [];
        setEvents(items.map(it => ({ ...it, id: String(it.id) })));
      })
      .catch((e) => {
        if (e.name !== 'AbortError') setError(`Failed to load events: ${e.message}`);
      })
      .finally(() => setLoading(false));

    return () => ac.abort();
  }, []);

  const points = React.useMemo<LatLngExpression[]>(() => {
    if (!events) return [];
    return events
      .filter(e => typeof e.latitude === 'number' && typeof e.longitude === 'number')
      .map(e => [e.latitude as number, e.longitude as number]);
  }, [events]);

  const center: LatLngExpression = [20, 0];

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      {(loading || error) && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 999, background: 'rgba(255,255,255,0.75)'
        }}>
          {loading ? <span>Loading events…</span> : <span style={{ color: 'crimson' }}>{error}</span>}
        </div>
      )}

      <MapContainer
        center={center}
        zoom={2}
        minZoom={2}
        maxZoom={18}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        worldCopyJump
        preferCanvas
      >
        <ZoomControl position="topright" />

        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="OpenStreetMap">
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="Satellite (Esri)">
            <TileLayer
              attribution='Tiles &copy; Esri'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </LayersControl.BaseLayer>

          <LayersControl.Overlay name="Labels (Carto)">
            <TileLayer
              attribution='&copy; CARTO'
              url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png"
            />
          </LayersControl.Overlay>
        </LayersControl>

        <FitToMarkers points={points} />

        {events?.map((e) => {
          if (typeof e.latitude !== 'number' || typeof e.longitude !== 'number') return null;

          const title = e.event_en || e.event_it || 'Untitled event';
          const when = formatYears(e);
          const placeBits = [e.location, e.country].filter(Boolean).join(', ');

          return (
            <Marker key={e.id} position={[e.latitude as number, e.longitude as number]}>
              <Popup maxWidth={280}>
                <div style={{ display: 'grid', gap: 6 }}>
                  <strong style={{ fontSize: 14 }}>{title}</strong>
                  {when && <div><small>Years: {when}</small></div>}
                  {placeBits && <div><small>Place: {placeBits}</small></div>}
                  <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                    <Link href={`/events/${e.id}`} style={{ textDecoration: 'underline' }}>
                      Open detail
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

