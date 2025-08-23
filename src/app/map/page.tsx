// src/app/map/page.tsx
'use client';

import dynamic from 'next/dynamic';

// Carica la mappa solo lato client (Leaflet richiede window/document)
const EventsMap = dynamic(() => import('@/components/EventMap'), {
  ssr: false,
  loading: () => (
    <div style={{ padding: '12px', textAlign: 'center', color: '#555' }}>
      Loading map…
    </div>
  ),
});

export default function MapPage() {
  return (
    <main style={{ height: '100vh', width: '100%', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '8px 12px', borderBottom: '1px solid #eee' }}>
        <h1 style={{ margin: 0, fontSize: 18 }}>GeoHistory — Events Map</h1>
        <small>Step 2.5: Filters + API</small>
      </header>
      <div style={{ flex: 1, minHeight: 0 }}>
        <EventsMap />
      </div>
    </main>
  );
}


