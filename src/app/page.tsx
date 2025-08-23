// app/page.tsx
import dynamic from 'next/dynamic';

// Carico la mappa solo lato client per evitare errori durante lo static render
const EventsMap = dynamic(() => import('@/components/EventMap'), { ssr: false });

export default function Page() {
  return (
    <main style={{ height: '100vh', width: '100vw' }}>
      <EventsMap />
    </main>
  );
}
