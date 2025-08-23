'use client';

// geohistory-mvp/src/app/events/[id]/page.tsx
import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';

type AnyObj = Record<string, any>;

type EventView = {
  id: string;
  title: string;
  descEN?: string | null;
  descIT?: string | null;
  yearFrom?: number | null;
  yearTo?: number | null;
  exactDate?: string | null;
  continent?: string | null;
  country?: string | null;
  location?: string | null;
  lat?: number | null;
  lon?: number | null;
  wikipediaEN?: string | null;
  wikipediaIT?: string | null;
  wikipedia?: string | null;
  createdAt?: string | null;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';

/* -------------------- utils -------------------- */
function pick<T = any>(o: AnyObj, keys: string[], fallback: T | null = null): T | null {
  for (const k of keys) {
    if (!o) continue;
    const v = o[k];
    if (v !== undefined && v !== null && v !== '') return v as T;
  }
  return fallback;
}

function normalize(raw: AnyObj): EventView {
  // coords: o GeoJSON [lon, lat] o campi singoli
  const geo = pick<any>(raw, ['coordinates', 'geom', 'geojson'], null);
  let lon: number | null = null;
  let lat: number | null = null;
  if (geo && Array.isArray(geo.coordinates)) {
    lon = geo.coordinates[0] ?? null;
    lat = geo.coordinates[1] ?? null;
  } else {
    lon = pick<number>(raw, ['longitude', 'lon'], null);
    lat = pick<number>(raw, ['latitude', 'lat'], null);
  }

  // titolo con fallback intelligenti
  const title =
    pick<string>(raw, ['event_en', 'event_it', 'title']) ??
    pick<string>(raw, ['description_short_en', 'description']) ??
    pick<string>(raw, ['location']) ??
    '(senza titolo)';

  return {
    id: String(pick<string>(raw, ['id'], '')),
    title,
    descEN: pick<string>(raw, ['description_en', 'description'], null),
    descIT: pick<string>(raw, ['description_it'], null),
    yearFrom: pick<number>(raw, ['year_from', 'event_year'], null),
    yearTo: pick<number>(raw, ['year_to'], null),
    exactDate: pick<string>(raw, ['exact_date'], null),
    continent: pick<string>(raw, ['continent'], null),
    country: pick<string>(raw, ['country'], null),
    location: pick<string>(raw, ['location'], null),
    lat,
    lon,
    wikipediaEN: pick<string>(raw, ['wikipedia_en'], null),
    wikipediaIT: pick<string>(raw, ['wikipedia_it'], null),
    wikipedia: pick<string>(raw, ['wikipedia_url'], null),
    createdAt: pick<string>(raw, ['created_at'], null),
  };
}

function formatWhen(ev: EventView): string | null {
  if (ev.exactDate) return ev.exactDate;
  if (ev.yearFrom && ev.yearTo && ev.yearFrom !== ev.yearTo) return `${ev.yearFrom} – ${ev.yearTo}`;
  if (ev.yearFrom) return `${ev.yearFrom}`;
  if (ev.yearTo) return `${ev.yearTo}`;
  return null;
}

/* -------------------- component -------------------- */
export default function EventPage() {
  // Leggiamo l’ID direttamente dalla URL (niente params di Next)
  const pathname = usePathname();
  const id = useMemo(() => {
    const m = (pathname || '').match(/\/events\/([^/?#]+)/i);
    return m ? decodeURIComponent(m[1]).trim() : '';
  }, [pathname]);

  const [data, setData] = useState<EventView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!id) {
        setError('Missing id in route.');
        setLoading(false);
        return;
      }
      try {
        const url = `${API_BASE}/api/events/${encodeURIComponent(id)}`;
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) {
          const txt = await res.text().catch(() => '');
          throw new Error(`API ${res.status}: ${txt || res.statusText}`);
        }
        let json: any = await res.json();

        // Se per errore arrivasse una lista { items: [...] }, pesca l'elemento giusto
        if (json && typeof json === 'object' && Array.isArray(json.items)) {
          const found = json.items.find((x: any) => String(x?.id) === id);
          if (!found) throw new Error('Event not found in returned list.');
          json = found;
        }

        const ev = normalize(json);
        if (!cancelled) {
          setData(ev);
          setLoading(false);
          if (ev?.title) document.title = ev.title;
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(String(e?.message ?? e));
          setLoading(false);
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return (
      <main style={{ padding: 24, maxWidth: 980, margin: '0 auto' }}>
        <a href="/" style={{ textDecoration: 'none', fontSize: 14 }}>← Back</a>
        <p>Loading…</p>
      </main>
    );
  }

  if (error) {
    return (
      <main style={{ padding: 24, maxWidth: 980, margin: '0 auto' }}>
        <a href="/" style={{ textDecoration: 'none', fontSize: 14 }}>← Back</a>
        <h1 style={{ color: 'crimson', marginTop: 12 }}>Errore caricando evento</h1>
        <pre style={{ whiteSpace: 'pre-wrap' }}>{error}</pre>
      </main>
    );
  }

  if (!data) {
    return (
      <main style={{ padding: 24, maxWidth: 980, margin: '0 auto' }}>
        <a href="/" style={{ textDecoration: 'none', fontSize: 14 }}>← Back</a>
        <p>Nessun dato.</p>
      </main>
    );
  }

  const when = formatWhen(data);
  const where = [data.location, data.country, data.continent].filter(Boolean).join(' — ');

  return (
    <main style={{ padding: 24, maxWidth: 980, margin: '0 auto' }}>
      <div style={{ marginBottom: 12 }}>
        <a href="/" style={{ textDecoration: 'none', fontSize: 14 }}>← Back</a>
      </div>

      <h1 style={{ fontSize: 36, lineHeight: 1.15, margin: '6px 0 10px' }}>
        {data.title}
      </h1>

      <div style={{ opacity: 0.85, marginBottom: 18 }}>
        {when ? <span>{when}</span> : null}
        {when && where ? <span> · </span> : null}
        {where ? <span>{where}</span> : null}
      </div>

      {data.descEN && (
        <>
          <h3>Description (EN)</h3>
          <p style={{ lineHeight: 1.7 }}>{data.descEN}</p>
        </>
      )}
      {data.descIT && (
        <>
          <h3>Descrizione (IT)</h3>
          <p style={{ lineHeight: 1.7 }}>{data.descIT}</p>
        </>
      )}

      {(data.wikipedia || data.wikipediaEN || data.wikipediaIT) && (
        <>
          <h3>Wikipedia</h3>
          <ul style={{ paddingLeft: 18, lineHeight: 1.6 }}>
            {data.wikipedia && <li><a href={data.wikipedia} target="_blank">Wikipedia</a></li>}
            {data.wikipediaEN && <li><a href={data.wikipediaEN} target="_blank">EN</a></li>}
            {data.wikipediaIT && <li><a href={data.wikipediaIT} target="_blank">IT</a></li>}
          </ul>
        </>
      )}

      {(data.lat != null && data.lon != null) && (
        <p>Coordinate: {data.lat}, {data.lon} 📍</p>
      )}
    </main>
  );
}








