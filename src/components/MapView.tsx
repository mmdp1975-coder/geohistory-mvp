// src/components/MapView.tsx
'use client';

import { useMemo, useState } from 'react';
import EventMap from '@/components/EventMap';

type Params = {
  q?: string;
  has_coords?: boolean;
  order?: 'asc' | 'desc';
  lang?: 'it' | 'en';
};

function toQuery(p: Params): string {
  const usp = new URLSearchParams();
  usp.set('lang', p.lang || 'it');
  if (p.q && p.q.trim()) usp.set('q', p.q.trim());
  if (p.has_coords) usp.set('has_coords', 'true');
  if (p.order) usp.set('order', p.order);
  return `?${usp.toString()}`;
}

export default function MapView() {
  const [q, setQ] = useState('');
  const [hasCoords, setHasCoords] = useState(true);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [lang, setLang] = useState<'it' | 'en'>('it');

  const query = useMemo(
    () => toQuery({ q, has_coords: hasCoords, order, lang }),
    [q, hasCoords, order, lang]
  );

  return (
    <div className="w-full h-[100dvh] flex flex-col">
      {/* Toolbar filtri */}
      <div className="border-b p-3 flex gap-3 items-center">
        <strong>GeoHistory — Map (2.8)</strong>

        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cerca (q)…"
          className="border rounded px-2 py-1 text-sm"
          style={{ minWidth: 180 }}
        />

        <label className="text-sm flex items-center gap-2">
          <input
            type="checkbox"
            checked={hasCoords}
            onChange={(e) => setHasCoords(e.target.checked)}
          />
          Solo con coordinate
        </label>

        <label className="text-sm">
          Ordine:{' '}
          <select
            value={order}
            onChange={(e) => setOrder(e.target.value as 'asc' | 'desc')}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value="asc">Asc</option>
            <option value="desc">Desc</option>
          </select>
        </label>

        <label className="text-sm">
          Lingua:{' '}
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as 'it' | 'en')}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value="it">IT</option>
            <option value="en">EN</option>
          </select>
        </label>

        <span className="ml-auto text-xs opacity-60">
          query: <code>{query}</code>
        </span>
      </div>

      {/* Mappa */}
      <div className="flex-1 min-h-0">
        <EventMap query={query} />
      </div>
    </div>
  );
}





