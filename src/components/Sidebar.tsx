"use client";

import { useState, useEffect } from "react";
import { useSelection } from "@/store/useSelection";
import { useFilters } from "@/store/useFilters";
import AuthBox from "@/components/AuthBox";

export default function Sidebar() {
  const { selected, setSelected } = useSelection();
  const { from, to, setFrom, setTo } = useFilters();

  // UI
  const [query, setQuery] = useState("");

  // inizializza gli input leggendo i valori già presenti nello store (se ci sono)
  const [fromInput, setFromInput] = useState<string>(
    from !== undefined ? String(from) : ""
  );
  const [toInput, setToInput] = useState<string>(
    to !== undefined ? String(to) : ""
  );

  // quando l'utente scrive, aggiorniamo lo store (from/to)
  useEffect(() => {
    setFrom(fromInput === "" ? undefined : Number(fromInput));
  }, [fromInput, setFrom]);

  useEffect(() => {
    setTo(toInput === "" ? undefined : Number(toInput));
  }, [toInput, setTo]);

  return (
    <aside className="flex h-full flex-col gap-3 p-4">
      {/* QUI: box di login */}
        <AuthBox />
          
      {/* Filtri */}
      <div className="space-y-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cerca evento/luogo (solo UI)"
          className="w-full rounded border p-2"
        />
        <div className="flex gap-2">
          <input
            type="number"
            value={fromInput}
            onChange={(e) => setFromInput(e.target.value)}
            placeholder="Anno da"
            className="w-1/2 rounded border p-2"
          />
        <input
            type="number"
            value={toInput}
            onChange={(e) => setToInput(e.target.value)}
            placeholder="Anno a"
            className="w-1/2 rounded border p-2"
          />
        </div>
        <p className="text-xs text-neutral-500">
          I filtri anno sono collegati all’API: i marker si aggiornano mentre scrivi.
        </p>
      </div>

      {/* Dettaglio evento */}
      <div className="grow overflow-auto rounded border p-3">
        <h2 className="mb-1 text-lg font-semibold">Evento selezionato</h2>
        {selected ? (
          <div className="space-y-1 text-sm">
            <div><span className="font-medium">Titolo:</span> {selected.title}</div>
            {selected.year !== undefined && (
              <div><span className="font-medium">Anno:</span> {selected.year}</div>
            )}
            <div className="text-neutral-600">
              Coord: {selected.lat.toFixed(4)}, {selected.lng.toFixed(4)}
            </div>
            <button onClick={() => setSelected(null)} className="mt-2 rounded border px-3 py-1">
              Pulisci selezione
            </button>
          </div>
        ) : (
          <p className="text-sm text-neutral-600">
            Clicca un marker sulla mappa per vedere i dettagli.
          </p>
        )}
      </div>
    </aside>
  );
}


