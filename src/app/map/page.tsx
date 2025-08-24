// src/app/map/page.tsx
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import MapClient from './MapClient';

export default function MapPage() {
  return <MapClient />;
}


