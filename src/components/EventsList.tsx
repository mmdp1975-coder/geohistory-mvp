'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchEvents } from '@/lib/api';

// Tipi allineati alla risposta del backend
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

export default function EventsList() {
  const [q, setQ] = useState('rome');
  const [items, setItems] = useState<Row[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setErr(null);
      // puoi togliere has_coords se vuoi vedere anche eventi senza coordinate
      const res = await fetchEvents({ q, has_coords: true, limit: 50, offset: 0 });
      setCount((res as any).count ?? res.items.length);

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
      setCount(0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div style={{ padding: 16, maxWidth: 900, margin: '0 auto' }}>
      <h1>Eventi (con coordinate)</h1>

      <div style={{ display: 'flex', gap: 8, margin: '12px 0' }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cerca (es. rome, crusade, ...)"
          style={{ flex: 1, padding: 8 }}
        />
        <button onClick={load} disabled={loading} style={{ padding: '8px 12px' }}>
          {loading ? 'Carico…' : 'Cerca'}
        </button>
      </div>

      {err && <pre style={{ color: 'crimson', whiteSpace: 'pre-wrap' }}>{err}</pre>}

      <p><b>Totale:</b> {count} — <b>Mostrati:</b> {items.length}</p>

      <ul>
        {items.map((ev) => {
          const title = ev.event_en || ev.event_it || ev.location || '(senza titolo)';
          const coords = (ev.latitude != null && ev.longitude != null) ? ' 📍' : '';
          return (
            <li key={ev.id} style={{ margin: '6px 0' }}>
              {/* LINK AL DETTAGLIO */}
              <Link href={`/events/${ev.id}`} style={{ fontWeight: 600, textDecoration: 'underline' }}>
                {title}
              </Link>
              {ev.year_from ? ` — ${ev.year_from}` : ''} {ev.location ? ` — ${ev.location}` : ''}{coords}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
