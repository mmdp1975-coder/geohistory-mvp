'use client';

import React from 'react';

export type Filters = {
  group_event?: string;
  continent?: string;
  country?: string;
  location?: string;
  year_from?: string; // numeri in string per semplificare input
  year_to?: string;
};

type Props = {
  value: Filters;
  onChange: (next: Filters) => void;
  onReset: () => void;
  resultCount: number;

  // Opzioni per i dropdown (arrivano da /api/events/options)
  groupEvents: string[];
  continents: string[];
  countries: string[];
  locations: string[];
};

export default function FiltersBar({
  value, onChange, onReset, resultCount,
  groupEvents, continents, countries, locations,
}: Props) {
  const update = (patch: Partial<Filters>) => onChange({ ...value, ...patch });

  // 🔁 reset a cascata
  const changeGroup = (v: string) =>
    update({ group_event: emptyToUndef(v), continent: undefined, country: undefined, location: undefined });
  const changeContinent = (v: string) =>
    update({ continent: emptyToUndef(v), country: undefined, location: undefined });
  const changeCountry = (v: string) =>
    update({ country: emptyToUndef(v), location: undefined });
  const changeLocation = (v: string) =>
    update({ location: emptyToUndef(v) });

  return (
    <div style={{
      padding: '8px 12px',
      borderBottom: '1px solid #eee',
      background: '#fafafa',
      position: 'sticky',
      top: 0,
      zIndex: 10,
    }}>
      <div style={{
        display: 'grid',
        gap: 8,
        gridTemplateColumns: 'repeat(6, minmax(140px, 1fr))',
        alignItems: 'end',
      }}>
        <LabeledSelect
          label="Group event"
          value={value.group_event ?? ''}
          onChange={(e) => changeGroup(e.target.value)}
          options={groupEvents}
          placeholder="— tutti —"
          disabled={!groupEvents?.length}
        />

        <LabeledSelect
          label="Continent"
          value={value.continent ?? ''}
          onChange={(e) => changeContinent(e.target.value)}
          options={continents}
          placeholder="— tutti —"
          disabled={!continents?.length}
        />

        <LabeledSelect
          label="Country"
          value={value.country ?? ''}
          onChange={(e) => changeCountry(e.target.value)}
          options={countries}
          placeholder="— tutte —"
          disabled={!countries?.length}
        />

        <LabeledSelect
          label="Location"
          value={value.location ?? ''}
          onChange={(e) => changeLocation(e.target.value)}
          options={locations}
          placeholder="— tutte —"
          disabled={!locations?.length}
        />

        <LabeledInput
          label="Year from"
          type="number"
          placeholder="es. -500"
          value={value.year_from ?? ''}
          onChange={(e) => update({ year_from: emptyToUndef(e.target.value) })}
        />

        <LabeledInput
          label="Year to"
          type="number"
          placeholder="es. 1900"
          value={value.year_to ?? ''}
          onChange={(e) => update({ year_to: emptyToUndef(e.target.value) })}
        />
      </div>

      <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          type="button"
          onClick={onReset}
          style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #ddd', background: '#fff', cursor: 'pointer' }}
        >
          Reset
        </button>

        {/* Badge conteggio risultati */}
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 10px',
          borderRadius: 999,
          border: '1px solid #ddd',
          background: '#fff',
          fontSize: 12
        }}>
          <strong>{resultCount}</strong> events
        </span>
      </div>
    </div>
  );
}

function LabeledSelect({
  label, value, onChange, options, placeholder, disabled,
}: {
  label: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLSelectElement>;
  options: string[];
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <label style={{ display: 'grid', gap: 4, fontSize: 12 }}>
      <span>{label}</span>
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        style={{
          padding: 6,
          borderRadius: 6,
          border: '1px solid #ddd',
          background: disabled ? '#f4f4f4' : '#fff'
        }}
      >
        <option value="">{placeholder ?? 'All'}</option>
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </label>
  );
}

function LabeledInput({
  label, ...rest
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label style={{ display: 'grid', gap: 4, fontSize: 12 }}>
      <span>{label}</span>
      <input {...rest} style={{ padding: 6, borderRadius: 6, border: '1px solid #ddd' }} />
    </label>
  );
}

function emptyToUndef(v: string | undefined) {
  return v ? v : undefined;
}

