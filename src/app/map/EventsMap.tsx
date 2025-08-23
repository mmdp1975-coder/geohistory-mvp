'use client';

import React from 'react';
import Link from 'next/link';
import { MapContainer, TileLayer, Marker, LayersControl, useMap, ZoomControl } from 'react-leaflet';
import type { LatLngExpression, Map as LeafletMap } from 'leaflet';
import type * as LeafletNS from 'leaflet';
import FiltersBar, { type Filters } from './FiltersBar';
import TourControls, { type TourState } from './TourControls';

// === Parametri usati in query verso il backend (allineati al backend)
const API_PARAM = {
  group_event: 'group_event',
  continent:   'continent',
  country:     'country',
  location:    'location',
  year_from:   'year_from',
  year_to:     'year_to',
  has_coords:  'has_coords',
};

// Inject animazione CSS una tantum (safe in SSR)
if (typeof document !== 'undefined' && !document.getElementById('gh-pulse-style')) {
  const style = document.createElement('style');
  style.id = 'gh-pulse-style';
  style.innerHTML = `
  @keyframes pulse {
    0% { box-shadow: 0 0 0 0 rgba(0,112,243,0.35); }
    70% { box-shadow: 0 0 0 14px rgba(0,112,243,0); }
    100% { box-shadow: 0 0 0 0 rgba(0,112,243,0); }
  }`;
  document.head.appendChild(style);
}

type EventListItem = {
  id: string | number;
  title?: string | null;
  event_en?: string | null;
  event_it?: string | null;
  event_year?: number | null;
  year_from?: number | null;
  year_to: number | null;

  group_event?: string | null;
  group_event_en?: string | null;
  group_event_it?: string | null;

  continent: string | null;
  country: string | null;
  location: string | null;

  latitude?: number | null;
  longitude?: number | null;
  coordinates?: any;

  image_url?: string | null;
};

type EventDetail = {
  id: string;
  event_en: string | null;
  event_it: string | null;
  description_en: string | null;
  description_it: string | null;
  description_short_en: string | null;
  year_from: number | null;
  year_to: number | null;
  exact_date: string | null;
  continent: string | null;
  country: string | null;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  wikipedia_en: string | null;
  wikipedia_it: string | null;
  image_url?: string | null;
  group_event_en?: string | null;
  group_event_it?: string | null;
};

type ApiListPayload = { items: EventListItem[]; total?: number } | EventListItem[];
type OptionsPayload = {
  groupEvents: string[];
  continents: string[];
  countries: string[];
  locations: string[];
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? '';
const abs = (p: string) => (API_BASE ? `${API_BASE}${p}` : p);

// ===== i18n helpers (locale minimo in-page)
type Lang = 'en' | 'it';
const UI = {
  title_panel: { en: 'Event panel', it: 'Pannello evento' },
  voice_on:    { en: 'Voice ON', it: 'Voce ON' },
  voice_off:   { en: 'Voice OFF', it: 'Voce OFF' },
  play_tour:   { en: 'Play tour', it: 'Avvia tour' },
  pause_tour:  { en: 'Pause tour', it: 'Pausa tour' },
  years:       { en: 'Years', it: 'Anni' },
  place:       { en: 'Place', it: 'Luogo' },
  open_detail: { en: 'Open detail', it: 'Apri dettaglio' },
  focus:       { en: 'Focus', it: 'Focus' },
  start_hint:  { en: 'Start the tour or select a marker.', it: 'Avvia il tour o seleziona un marker.' },
  detail_title:{ en: 'Event detail', it: 'Dettaglio evento' },
  loading:     { en: 'Loading…', it: 'Caricamento…' },
  loading_detail:{ en: 'Loading detail…', it: 'Carico dettaglio…' },
  none_selected:{ en: 'No event selected.', it: 'Nessun evento selezionato.' },
  wiki_en:     { en: 'Wikipedia (EN)', it: 'Wikipedia (EN)' },
  wiki_it:     { en: 'Wikipedia (IT)', it: 'Wikipedia (IT)' },
  voice_not_supported: { en: 'Voice not supported by this browser.', it: 'Voce non supportata da questo browser.' },
  filters_hint:{ en: 'Set one or more filters to load events and start the tour.', it: 'Imposta uno o più filtri per caricare gli eventi e avviare il tour.' },
};
const t = (k: keyof typeof UI, lang: Lang) => UI[k][lang];
const txt = (lang: Lang, en?: string|null, it?: string|null, fallback = '') =>
  (lang === 'en' ? (en || it || fallback) : (it || en || fallback));

function useDebounced<T>(value: T, ms = 250) {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

function hasActiveFilters(f: Filters) {
  return Boolean(f.group_event || f.continent || f.country || f.location || f.year_from || f.year_to);
}

function yearsOf(e: {year_from?: number|null; year_to?: number|null; event_year?: number|null}) {
  const yf = (e.year_from ?? e.event_year ?? null) as number | null;
  const yt = (e.year_to   ?? e.event_year ?? null) as number | null;
  if (yf == null && yt == null) return '';
  if (yf != null && yt != null && yf !== yt) return `${yf}–${yt}`;
  return `${yf ?? yt}`;
}

// estrai lat/lng robustamente
function toLatLng(e: EventListItem): LatLngExpression | null {
  const g = e.coordinates as any;
  if (g && typeof g === 'object') {
    if (g.type === 'Point' && Array.isArray(g.coordinates)) {
      const [lon, lat] = g.coordinates;
      const latN = Number(lat), lonN = Number(lon);
      if (Number.isFinite(latN) && Number.isFinite(lonN)) return [latN, lonN];
    }
    const latCand = g.lat ?? g.latitude;
    const lonCand = g.lng ?? g.lon ?? g.longitude;
    if (latCand != null && lonCand != null) {
      const latN = Number(latCand), lonN = Number(lonCand);
      if (Number.isFinite(latN) && Number.isFinite(lonN)) return [latN, lonN];
    }
    if (Array.isArray(g) && g.length >= 2) {
      const latN = Number(g[0]), lonN = Number(g[1]);
      if (Number.isFinite(latN) && Number.isFinite(lonN)) return [latN, lonN];
    }
    if (typeof g === 'string' && g.toUpperCase().startsWith('POINT(')) {
      const m = g.match(/POINT\s*\(\s*([-\d.]+)\s+([-\d.]+)\s*\)/i);
      if (m) {
        const lonN = Number(m[1]), latN = Number(m[2]);
        if (Number.isFinite(latN) && Number.isFinite(lonN)) return [latN, lonN];
      }
    }
  }
  if (e.latitude != null && e.longitude != null) {
    const latN = Number(e.latitude), lonN = Number(e.longitude);
    if (Number.isFinite(latN) && Number.isFinite(lonN)) return [latN, lonN];
  }
  return null;
}

function rangesOverlap(a1: number, a2: number, b1: number, b2: number) {
  return a1 <= b2 && b1 <= a2;
}

// === Hook TTS (voce)
function useSpeech() {
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : undefined;
  const speak = React.useCallback((text: string, lang: 'it-IT'|'en-US') => {
    if (!synth || !text) return;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = 1;
    u.pitch = 1;
    synth.speak(u);
  }, [synth]);
  const pause = React.useCallback(() => synth?.pause(), [synth]);
  const resume = React.useCallback(() => synth?.resume(), [synth]);
  const stop = React.useCallback(() => synth?.cancel(), [synth]);
  return { speak, pause, resume, stop, supported: !!synth };
}

export default function EventsMap() {
  // === lingua
  const [lang, setLang] = React.useState<Lang>('it');

  const [events, setEvents] = React.useState<EventListItem[]>([]);
  const [resultTotal, setResultTotal] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // === Leaflet dynamic import (no SSR break)
  const [leaflet, setLeaflet] = React.useState<typeof import('leaflet') | null>(null);
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      const mod = await import('leaflet');
      if (!mounted) return;
      mod.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });
      setLeaflet(mod);
    })();
    return () => { mounted = false; };
  }, []);

  // TOUR
  const [tour, setTour] = React.useState<TourState>({ isPlaying: false, index: 0, speedMs: 2000, loop: true, total: 0 });
  const timerRef = React.useRef<number | null>(null);
  const mapRef = React.useRef<LeafletMap | null>(null);

  const [filters, setFilters] = React.useState<Filters>({});
  const debouncedFilters = useDebounced(filters, 250);

  const [options, setOptions] = React.useState<OptionsPayload>({
    groupEvents: [],
    continents: [],
    countries: [],
    locations: [],
  });

  // Dettaglio evento attivo (per pannello destro)
  const [activeDetail, setActiveDetail] = React.useState<EventDetail | null>(null);
  const [detailLoading, setDetailLoading] = React.useState(false);

  // === UI stato descrizione (preview/full)
  const [descExpanded, setDescExpanded] = React.useState(false);

  // === VOCE
  const voice = useSpeech();
  const [voiceEnabled, setVoiceEnabled] = React.useState(true);

  // helper: carica opzioni coerenti con TUTTI i filtri
  const fetchOptions = (signal?: AbortSignal, f?: Filters) => {
    const ff = f ?? filters;
    const q = new URLSearchParams();
    if (ff.group_event) q.set(API_PARAM.group_event, ff.group_event);
    if (ff.continent)   q.set(API_PARAM.continent,   ff.continent);
    if (ff.country)     q.set(API_PARAM.country,     ff.country);
    if (ff.location)    q.set(API_PARAM.location,    ff.location);
    if (ff.year_from)   q.set(API_PARAM.year_from,   ff.year_from);
    if (ff.year_to)     q.set(API_PARAM.year_to,     ff.year_to);
    q.set(API_PARAM.has_coords, 'true');

    const path = q.toString() ? `/api/events/options?${q.toString()}` : '/api/events/options';
    return fetch(abs(path), { signal, cache: 'no-store' })
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<OptionsPayload>;
      })
      .then((opts) => setOptions(opts));
  };

  // (A) iniziale
  React.useEffect(() => {
    const ac = new AbortController();
    fetchOptions(ac.signal, {}).catch((e) => {
      if (e.name !== 'AbortError') console.error('Options fetch failed (initial):', e);
    });
    return () => ac.abort();
  }, []);

  // (B) restringi opzioni su QUALSIASI filtro
  React.useEffect(() => {
    const ac = new AbortController();
    fetchOptions(ac.signal).catch((e) => {
      if (e.name !== 'AbortError') console.error('Options fetch failed (filtered):', e);
    });
    return () => ac.abort();
  }, [filters.group_event, filters.continent, filters.country, filters.location, filters.year_from, filters.year_to]);

  // (C) carica eventi quando ci sono filtri
  React.useEffect(() => {
    const ac = new AbortController();

    if (!hasActiveFilters(debouncedFilters)) {
      setEvents([]);
      setResultTotal(0);
      setLoading(false);
      setError(null);
      setTour((t) => ({ ...t, total: 0, index: 0, isPlaying: false }));
      setActiveDetail(null);
      return;
    }

    setLoading(true);
    setError(null);

    const qs = new URLSearchParams();
    if (debouncedFilters.group_event) qs.set(API_PARAM.group_event, debouncedFilters.group_event);
    if (debouncedFilters.continent)   qs.set(API_PARAM.continent,   debouncedFilters.continent);
    if (debouncedFilters.country)     qs.set(API_PARAM.country,     debouncedFilters.country);
    if (debouncedFilters.location)    qs.set(API_PARAM.location,    debouncedFilters.location);
    if (debouncedFilters.year_from)   qs.set(API_PARAM.year_from,   debouncedFilters.year_from);
    if (debouncedFilters.year_to)     qs.set(API_PARAM.year_to,     debouncedFilters.year_to);
    qs.set(API_PARAM.has_coords, 'true');

    fetch(abs(`/api/events?${qs.toString()}`), { signal: ac.signal, cache: 'no-store' })
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data: ApiListPayload = await r.json();
        const items = Array.isArray(data) ? data : (data.items ?? []);
        const total = Array.isArray(data) ? items.length : (data.total ?? items.length);

        let normalized = items.map((it: any) => ({ ...it, id: String(it.id) }));

        // Safety client range anni
        const hasFrom = !!debouncedFilters.year_from;
        const hasTo   = !!debouncedFilters.year_to;
        if (hasFrom || hasTo) {
          const from = hasFrom ? Number(debouncedFilters.year_from) : Number.MIN_SAFE_INTEGER;
          const to   = hasTo   ? Number(debouncedFilters.year_to)   : Number.MAX_SAFE_INTEGER;
          normalized = normalized.filter((e) => {
            const y1 = (e.year_from ?? e.event_year ?? null);
            const y2 = (e.year_to   ?? e.event_year ?? null);
            if (y1 == null && y2 == null) return false;
            const a1 = (y1 ?? y2) as number;
            const a2 = (y2 ?? y1) as number;
            return rangesOverlap(a1, a2, from, to);
          });
        }

        // Ordina per anno
        normalized.sort((a,b) => {
          const ay = Number(a.year_from ?? a.event_year ?? 0);
          const by = Number(b.year_from ?? b.event_year ?? 0);
          return ay - by;
        });

        setEvents(normalized);
        setResultTotal(total);

        // reset tour all’aggiornamento dataset
        setTour(t => ({
          ...t,
          total: normalized.length,
          index: 0,
          isPlaying: t.isPlaying && normalized.length > 0 ? true : false,
        }));
      })
      .catch((e) => {
        if (e.name !== 'AbortError') setError(`Failed to load events: ${e.message}`);
      })
      .finally(() => setLoading(false));

    return () => ac.abort();
  }, [debouncedFilters]);

  // === Autoplay del tour
  React.useEffect(() => {
    if (!tour.isPlaying || tour.total === 0) return;

    const id = window.setInterval(() => {
      setTour((t) => {
        const last = t.total - 1;
        if (t.index < last) return { ...t, index: t.index + 1 };
        if (t.loop) return { ...t, index: 0 };
        return { ...t, isPlaying: false };
      });
    }, tour.speedMs);
    timerRef.current = id as unknown as number;

    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [tour.isPlaying, tour.speedMs, tour.total, tour.loop]);

  // mappa → ref
  const MapRefCapture = () => {
    const map = useMap();
    React.useEffect(() => { mapRef.current = map; }, [map]);
    return null;
  };

  // Fit su markers all’inizio / cambio dati
  const points = React.useMemo<LatLngExpression[]>(() => {
    return (events ?? [])
      .map(toLatLng)
      .filter((p): p is LatLngExpression => Array.isArray(p) && typeof p[0] === 'number' && typeof p[1] === 'number');
  }, [events]);

  React.useEffect(() => {
    const map = mapRef.current;
    if (!map || points.length === 0 || !leaflet) return;
    const bounds = leaflet.latLngBounds(points as any);
    map.fitBounds(bounds, { padding: [40, 40] });
    setTimeout(() => map.invalidateSize(), 120);
  }, [points, leaflet]);

  // Vai all’evento corrente quando cambia index (flyTo)
  React.useEffect(() => {
    const map = mapRef.current;
    if (!map || tour.total === 0) return;
    const current = events[tour.index];
    const pos = current ? toLatLng(current) : null;
    if (pos) {
      map.flyTo(pos as any, Math.max(map.getZoom(), 4), { duration: 0.8 });
    }
  }, [tour.index, tour.total, events]);

  // Carica il DETTAGLIO quando cambia evento attivo
  React.useEffect(() => {
    const current = events[tour.index];
    if (!current) { setActiveDetail(null); return; }
    const id = String(current.id);
    const ac = new AbortController();
    setDetailLoading(true);
    setDescExpanded(false); // reset espansione descrizione quando cambia evento
    fetch(abs(`/api/events/${id}`), { signal: ac.signal, cache: 'no-store' })
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const d = await r.json() as EventDetail;
        setActiveDetail(d);
      })
      .catch((e) => {
        if (e.name !== 'AbortError') console.error('Detail fetch failed:', e);
        setActiveDetail(null);
      })
      .finally(() => setDetailLoading(false));
    return () => ac.abort();
  }, [events, tour.index]);

  // Voce automatica su cambio evento quando il tour è in play, nella lingua scelta
  React.useEffect(() => {
    if (!voice.supported || !voiceEnabled) return;
    if (!tour.isPlaying) return;
    const d = activeDetail;
    const title = txt(lang, d?.event_en, d?.event_it) || txt(lang, events[tour.index]?.event_en, events[tour.index]?.event_it) || '';
    const short = txt(lang, d?.description_short_en || d?.description_en, d?.description_it) || '';
    const text = [title, short].filter(Boolean).join('. ');
    if (text) voice.speak(text, lang === 'en' ? 'en-US' : 'it-IT');
  }, [tour.index, tour.isPlaying, activeDetail, voice, voiceEnabled, events, lang]);

  const center: LatLngExpression = [20, 0];

  const handleReset = () => {
    setFilters({});
    setTour({ isPlaying: false, index: 0, speedMs: tour.speedMs, loop: tour.loop, total: 0 });
    setActiveDetail(null);
    fetchOptions(undefined, {}).catch(() => {});
  };

  const resultCount = resultTotal ?? (events?.length ?? 0);

  // === Handlers Tour
  const onPlayPause = () =>
    setTour(t => ({ ...t, isPlaying: t.total > 0 ? !t.isPlaying : false }));

  const onPrev = () =>
    setTour(t => ({ ...t, isPlaying: false, index: t.total ? (t.index - 1 + t.total) % t.total : 0 }));

  const onNext = () =>
    setTour(t => ({ ...t, isPlaying: false, index: t.total ? (t.index + 1) % t.total : 0 }));

  const onChangeSpeed = (ms: number) => setTour(t => ({ ...t, speedMs: ms }));
  const onToggleLoop = () => setTour(t => ({ ...t, loop: !t.loop }));

  const onStop = () => {
    setTour(t => ({ ...t, isPlaying: false, index: 0 }));
    voice.stop();
    const map = mapRef.current;
    if (map && points.length > 0 && leaflet) {
      setTimeout(() => {
        const bounds = leaflet.latLngBounds(points as any);
        map.fitBounds(bounds, { padding: [40, 40] });
      }, 120);
    }
  };

  // ==== UI
  return (
    <div style={{ height: '100%', width: '100%', position: 'relative', display: 'flex', flexDirection: 'column' }}>
      <FiltersBar
        value={filters}
        onChange={setFilters}
        onReset={handleReset}
        resultCount={resultCount}
        groupEvents={options.groupEvents}
        continents={options.continents}
        countries={options.countries}
        locations={options.locations}
      />

      <div style={{ flex: 1, minHeight: 0, position: 'relative', display: 'flex', gap: 12 }}>
        {/* MAPPA (sinistra) */}
        <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
          {(!hasActiveFilters(filters) && !loading && !error) && (
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
              justifyContent: 'center', zIndex: 5, background: 'rgba(255,255,255,0.75)', fontSize: 14
            }}>
              {t('filters_hint', lang)}
            </div>
          )}

          {(loading || error) && (
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
              justifyContent: 'center', zIndex: 6, background: 'rgba(255,255,255,0.75)'
            }}>
              {loading ? <span>{t('loading', lang)}</span> : <span style={{ color: 'crimson' }}>{error}</span>}
            </div>
          )}

          <MapContainer
            center={center}
            zoom={2}
            minZoom={2}
            maxZoom={18}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
            worldCopyJump
            preferCanvas
          >
            <MapRefCapture />
            <ZoomControl position="topright" />

            <LayersControl position="topright">
              <LayersControl.BaseLayer checked name="Satellite (Esri)">
                <TileLayer
                  attribution="Tiles &copy; Esri"
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                />
              </LayersControl.BaseLayer>

              <LayersControl.BaseLayer name="OpenStreetMap">
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
              </LayersControl.BaseLayer>

              <LayersControl.Overlay checked name="Labels (Carto)">
                <TileLayer
                  attribution='&copy; CARTO'
                  url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png"
                />
              </LayersControl.Overlay>
            </LayersControl>

            {/* Markers (senza Popup) */}
            {events?.map((e, i) => {
              const pos = toLatLng(e);
              if (!pos) return null;

              const isActive = tour.total > 0 && i === tour.index;

              return (
                <Marker
                  key={String(e.id)}
                  position={pos}
                  {...(isActive && leaflet ? { icon: new leaflet.DivIcon({
                    html: `
                      <div style="position: relative; transform: translate(-50%, -50%);">
                        <div style="
                          width: 14px; height: 14px; border-radius: 50%;
                          background: #0070f3; border: 2px solid white;
                          box-shadow: 0 0 0 6px rgba(0,112,243,0.25);
                          animation: pulse 1.6s ease-out infinite;
                        "></div>
                      </div>
                    `,
                    className: 'gh-active-marker',
                    iconSize: [1,1],
                    iconAnchor: [0,0],
                  }) } : {})}
                  eventHandlers={{ click: () => setTour(t => ({ ...t, isPlaying: false, index: i })) }}
                />
              );
            })}
          </MapContainer>

          {/* Controlli Tour */}
          <TourControls
            state={{ ...tour }}
            onPlayPause={onPlayPause}
            onPrev={onPrev}
            onNext={onNext}
            onChangeSpeed={onChangeSpeed}
            onToggleLoop={onToggleLoop}
            onStop={onStop}
          />
        </div>

        {/* PANNELLO DESTRO */}
        <aside style={{
          width: 420, minWidth: 320, maxWidth: 520, overflow: 'auto',
          borderLeft: '1px solid #eee', padding: 12, display: 'flex', flexDirection: 'column', gap: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <h3 style={{ margin: 0, fontSize: 16 }}>{t('title_panel', lang)}</h3>

            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {/* Language switcher */}
              <div style={{ border:'1px solid #ddd', borderRadius:6, overflow:'hidden' }}>
                <button
                  type="button"
                  onClick={() => setLang('it')}
                  style={{ padding:'4px 8px', background: lang==='it' ? '#eef6ff' : '#fff', border:'none', cursor:'pointer' }}
                >IT</button>
                <button
                  type="button"
                  onClick={() => setLang('en')}
                  style={{ padding:'4px 8px', background: lang==='en' ? '#eef6ff' : '#fff', border:'none', cursor:'pointer' }}
                >EN</button>
              </div>

              <button
                type="button"
                onClick={() => setVoiceEnabled(v => !v)}
                title="Enable/Disable voice"
                style={{ border:'1px solid #ddd', background: voiceEnabled ? '#eef6ff' : '#fff', borderRadius:6, padding:'4px 8px', cursor:'pointer' }}
              >
                {voiceEnabled ? t('voice_on', lang) : t('voice_off', lang)}
              </button>

              <button
                type="button"
                onClick={onPlayPause}
                style={{ border:'1px solid #ddd', background:'#fff', borderRadius:6, padding:'4px 8px', cursor:'pointer' }}
              >
                {tour.isPlaying ? t('pause_tour', lang) : t('play_tour', lang)}
              </button>
            </div>
          </div>

          {/* 1) TOUR CARD (ex popup) */}
          {events[tour.index] ? (() => {
            const e = events[tour.index];
            const title = txt(lang, e.event_en, e.event_it, e.title || 'Untitled event');
            const when  = yearsOf(e);
            const place = [e.location, e.country].filter(Boolean).join(', ');
            return (
              <section style={{ border:'1px solid #eaeaea', borderRadius:8, padding:10 }}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>{title}</div>
                {when && <div style={{ fontSize: 12, color:'#555' }}>{t('years', lang)}: {when}</div>}
                {place && <div style={{ fontSize: 12, color:'#555' }}>{t('place', lang)}: {place}</div>}
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <Link href={`/events/${e.id}`} style={{ textDecoration: 'underline' }}>
                    {t('open_detail', lang)}
                  </Link>
                  <button
                    type="button"
                    onClick={()=> setTour(t => ({ ...t, isPlaying: false, index: tour.index }))}
                    style={{ border:'1px solid #ddd', background:'#fff', borderRadius:6, padding:'2px 6px', cursor:'pointer' }}
                  >
                    {t('focus', lang)}
                  </button>
                </div>
              </section>
            );
          })() : (
            <section style={{ color:'#777' }}>{t('start_hint', lang)}</section>
          )}

          {/* 2) DETTAGLIO EVENTO */}
          <section style={{ border:'1px solid #eaeaea', borderRadius:8, padding:10 }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: 14, fontWeight: 700 }}>{t('detail_title', lang)}</h4>
            {detailLoading && <div style={{ opacity: 0.7 }}>{t('loading_detail', lang)}</div>}
            {!detailLoading && !activeDetail && <div style={{ opacity: 0.7 }}>{t('none_selected', lang)}</div>}

            {activeDetail && (
              <div style={{ display: 'grid', gap: 8 }}>
                <div>
                  <div style={{ fontWeight: 700 }}>
                    {txt(lang, activeDetail.event_en, activeDetail.event_it, 'Untitled event')}
                  </div>
                  <div style={{ fontSize: 12, color: '#555' }}>
                    {yearsOf(activeDetail)}
                    {activeDetail.location ? ` • ${activeDetail.location}` : ''}
                    {activeDetail.country ? `, ${activeDetail.country}` : ''}
                  </div>
                  {activeDetail.group_event_en || activeDetail.group_event_it ? (
                    <div style={{ fontSize: 12, color: '#777' }}>
                      {txt(lang, activeDetail.group_event_en, activeDetail.group_event_it)}
                    </div>
                  ) : null}
                </div>

                {activeDetail.image_url ? (
                  <img
                    src={activeDetail.image_url}
                    alt=""
                    style={{ width: '100%', maxHeight: 160, objectFit: 'cover', borderRadius: 8, border: '1px solid #eee' }}
                  />
                ) : null}

                {/* Descrizione: FULL di default con anteprima + toggle */}
                {(() => {
                  const full = txt(lang, activeDetail.description_en, activeDetail.description_it, '');
                  const shortEN = activeDetail.description_short_en ?? '';
                  // Se in futuro aggiungi description_short_it, sostituisci '' qui sotto
                  const short = lang === 'en' ? shortEN : '';
                  const fallback = '—';

                  if (!full && !short) {
                    return <div style={{ fontSize: 14, lineHeight: 1.45 }}>{fallback}</div>;
                  }

                  const PREVIEW_CHARS = 420;
                  const preview =
                    short ||
                    (full.length > PREVIEW_CHARS ? full.slice(0, PREVIEW_CHARS).replace(/\s+\S*$/, '') : full);

                  const textToShow = descExpanded ? (full || short) : preview;

                  const paragraphs = (textToShow || '').split(/\n{2,}/g).filter(Boolean);

                  return (
                    <div>
                      <div style={{ fontSize: 14, lineHeight: 1.6 }}>
                        {paragraphs.map((p, i) => (
                          <p key={i} style={{ margin: '0 0 8px 0', whiteSpace: 'pre-wrap' }}>{p}</p>
                        ))}
                      </div>

                      {(full && full !== preview) && (
                        <button
                          type="button"
                          onClick={() => setDescExpanded(v => !v)}
                          style={{
                            marginTop: 6, border:'1px solid #ddd', background:'#fff',
                            borderRadius:6, padding:'4px 8px', cursor:'pointer', fontSize: 12
                          }}
                        >
                          {descExpanded ? (lang==='en' ? 'Show less' : 'Mostra meno')
                                        : (lang==='en' ? 'Show more' : 'Mostra tutto')}
                        </button>
                      )}
                    </div>
                  );
                })()}

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {activeDetail.wikipedia_en && (
                    <a href={activeDetail.wikipedia_en} target="_blank" rel="noreferrer" style={{ textDecoration: 'underline' }}>
                      {t('wiki_en', lang)}
                    </a>
                  )}
                  {activeDetail.wikipedia_it && (
                    <a href={activeDetail.wikipedia_it} target="_blank" rel="noreferrer" style={{ textDecoration: 'underline' }}>
                      {t('wiki_it', lang)}
                    </a>
                  )}
                  <Link href={`/events/${activeDetail.id}`} style={{ textDecoration: 'underline' }}>
                    {t('open_detail', lang)}
                  </Link>
                </div>

                {/* Controlli voce locali */}
                {voice.supported ? (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="button" onClick={() => {
                      const title = txt(lang, activeDetail.event_en, activeDetail.event_it);
                      const short = txt(lang, activeDetail.description_short_en || activeDetail.description_en, activeDetail.description_it);
                      const text = [title, short].filter(Boolean).join('. ');
                      voice.speak(text, lang === 'en' ? 'en-US' : 'it-IT');
                    }} style={{ border:'1px solid #ddd', background:'#fff', borderRadius:6, padding:'4px 8px', cursor:'pointer' }}>
                      {tour.isPlaying ? t('pause_tour', lang) : t('play_tour', lang)} (voice)
                    </button>
                    <button type="button" onClick={voice.pause}  style={{ border:'1px solid #ddd', background:'#fff', borderRadius:6, padding:'4px 8px', cursor:'pointer' }}>Pause</button>
                    <button type="button" onClick={voice.resume} style={{ border:'1px solid #ddd', background:'#fff', borderRadius:6, padding:'4px 8px', cursor:'pointer' }}>Resume</button>
                    <button type="button" onClick={voice.stop}   style={{ border:'1px solid #ddd', background:'#fff', borderRadius:6, padding:'4px 8px', cursor:'pointer' }}>Stop</button>
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: '#888' }}>{t('voice_not_supported', lang)}</div>
                )}
              </div>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}


