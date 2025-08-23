import type { Metadata } from 'next';
import EventsMap from './EventsMap';

export const metadata: Metadata = {
  title: 'GeoHistory – Map',
};

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

