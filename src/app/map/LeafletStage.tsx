'use client';

import React from 'react';
import Link from 'next/link';
import {
  MapContainer, TileLayer, Marker, Popup,
  LayersControl, useMap, ZoomControl
} from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';
import L from 'leaflet';

// icone Leaflet
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

type EventListItem = {
  id: string | number;
  title?: string | null;
  event_en?: string | null;
  event_it?: string | null;
  event_year?: number | null;
  year_from?: number | null;
  year_to?: number | null;
  location: string | null;
  country: string | null;
  coordinates?: { type: 'Point'; coordinates: [number, number] } | null;
  latitude?: number | null;
  longitude?: number | null;
};

function titleOf(e: EventListItem) {
  return e.title || e.event_en || e.event_it || 'Untitled event';
}
function yearsOf(e: EventListItem) {
  const yf = (e.year_from ?? e.event_year ?? null) as number | null;
  const yt = (e.year_to   ?? e.event_year ?? null) as number | null;
  if (yf == null && yt == null) return '';
  if (yf != null && yt != null && yf !== yt) return `${yf}–${yt}`;
  return `${yf ?? yt}`;
}
function toLatLng(e: EventListItem): LatLngExpression | null {
  if (e.coordinates && Array.isArray(e.coordinates?.coordinates)) {
    const [lon, lat] = e.coordinates.coordinates;
    if (typeof lat === 'number' && typeof lon === 'number') return [lat, lon];
  }
  if (typeof e.latitude === 'number' && typeof e.longitude === 'number') {
    return [e.latitude, e.longitude];
  }
  return null;
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

export default function LeafletStage({
  events,
  overlayEmpty,
  overlayLoading,
  overlayError,
}: {
  events: EventListItem[];
  overlayEmpty: boolean;
  overlayLoading: boolean;
  overlayError: string | null;
}) {
  // Non montare nulla finché non c'è window (ulteriore safety)
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const points = (events ?? [])
    .map(toLatLng)
    .filter((p): p is LatLngExpression => Array.isArray(p) && typeof p[0] === 'number' && typeof p[1] === 'number');

  const center: LatLngExpression = [20, 0];

  return (
    <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
      {overlayEmpty && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 5, background: 'rgba(255,255,255,0.75)', fontSize: 14
        }}>
          Imposta uno o più filtri per caricare gli eventi dalla tabella.
        </div>
      )}
      {(overlayLoading || overlayError) && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 6, background: 'rgba(255,255,255,0.75)'
        }}>
          {overlayLoading ? <span>Loading…</span> : <span style={{ color: 'crimson' }}>{overlayError}</span>}
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
          <LayersControl.BaseLayer checked name="Satellite (Esri)">
            <TileLayer
              attribution="Tiles &copy; Esri"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="OpenStreetMap">
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>

          <LayersControl.Overlay checked name="Labels (Carto)">
            <TileLayer
              attribution='&copy; CARTO'
              url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png"
            />
          </LayersControl.Overlay>
        </LayersControl>

        <FitToMarkers points={points} />

        {events?.map((e) => {
          const pos = toLatLng(e);
          if (!pos) return null;
          const title = titleOf(e);
          const when  = yearsOf(e);
          const place = [e.location, e.country].filter(Boolean).join(', ');
          return (
            <Marker key={String(e.id)} position={pos}>
              <Popup maxWidth={280}>
                <div style={{ display: 'grid', gap: 6 }}>
                  <strong style={{ fontSize: 14 }}>{title}</strong>
                  {when && <div><small>Years: {when}</small></div>}
                  {place && <div><small>Place: {place}</small></div>}
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
