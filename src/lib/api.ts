// src/lib/api.ts
const RAW_BASE =
  process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';

// normalizza: niente slash finale
export const API_BASE = RAW_BASE.replace(/\/+$/, '');

// join sicuro: evita slash doppi e NON raddoppia /api
const join = (base: string, path: string) => {
  const cleanBase = base.replace(/\/+$/, '');
  const cleanPath = path.replace(/^\/+/, '');
  return `${cleanBase}/${cleanPath}`;
};

export const buildUrl = (
  path: string,
  query?: Record<string, string | number | boolean | null | undefined>
) => {
  const url = new URL(join(API_BASE, path));
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== null && v !== undefined && v !== '') {
        url.searchParams.set(k, String(v));
      }
    }
  }
  return url.toString();
};

export async function fetchEvents(params: {
  lang?: string;
  q?: string;
  group_event?: string;
  continent?: string;
  country?: string;
  location?: string;
  year_from?: number | string;
  year_to?: number | string;
  has_coords?: boolean | string;
}) {
  const url = buildUrl('/api/events', params);
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(`API ${res.status}: ${msg}`);
  }
  return res.json();
}



