// src/app/page.tsx
import dynamic from 'next/dynamic';

const EventMap = dynamic(() => import('@/components/EventMap'), {
  ssr: false,
  loading: () => <div style={{ padding: 12 }}>Loading…</div>,
});

export default function Page() {
  return (
    <main style={{ height: '100vh', width: '100%', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '8px 12px', borderBottom: '1px solid #eee' }}>
        <h1 style={{ margin: 0, fontSize: 18 }}>GeoHistory — MVP</h1>
        <small>Leaflet + API Render</small>
      </header>
      <div style={{ flex: 1, minHeight: 0 }}>
        <EventMap />
      </div>
    </main>
  );
}
