'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { fetchEvents } from '@/lib/api';

// Fix icone Leaflet (altrimenti non si vedono in Next)
const markerIcon = L.icon({
  iconUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Tipo minimale per i punti che visualizziamo
type Row = {
  id: string;
  event_en: string | null;
  event_it: string | null;
  year_from: number | null;
  location: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
};

export default function Map() {
  const [items, setItems] = useState<Row[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // centro su Europa
  const center: LatLngExpression = [48.5, 11];

  async function load() {
    try {
      setLoading(true);
      setErr(null);
      const res = await fetchEvents({
        has_coords: true,
        limit: 500,
        offset: 0,
      });
      const rows = (res.items as any[]).map((ev) => ({
        id: ev.id,
        event_en: ev.event_en ?? null,
        event_it: ev.event_it ?? null,
        year_from: ev.year_from ?? null,
        location: ev.location ?? null,
        country: ev.country ?? null,
        latitude: ev.latitude ?? null,
        longitude: ev.longitude ?? null,
      }));
      setItems(rows);
    } catch (e: any) {
      setErr(e?.message || String(e));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div style={{ height: '75vh', width: '100%', borderRadius: 8, overflow: 'hidden' }}>
      {err && <div style={{ color: 'crimson', padding: 8 }}>{err}</div>}

      <MapContainer
        center={center}
        zoom={5}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {items
          .filter((r) => r.latitude != null && r.longitude != null)
          .map((r) => {
            const title = r.event_en || r.event_it || r.location || '(senza titolo)';
            return (
              <Marker
                key={r.id}
                position={[r.latitude as number, r.longitude as number]}
                icon={markerIcon}
              >
                <Popup>
                  <div style={{ maxWidth: 240 }}>
                    <b>{title}</b>
                    {r.year_from ? ` — ${r.year_from}` : ''}
                    {r.location ? ` — ${r.location}` : ''}
                    {r.country ? ` (${r.country})` : ''}
                  </div>
                </Popup>
              </Marker>
            );
          })}
      </MapContainer>

      {loading && <div style={{ position: 'absolute', top: 8, left: 8 }}>Carico…</div>}
    </div>
  );
}
