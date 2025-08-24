// src/app/HomeClient.tsx
'use client';

import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => <div style={{ padding: 12 }}>Carico…</div>,
});

export default function HomeClient() {
  return <MapView />;
}
