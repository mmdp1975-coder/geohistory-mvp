'use client';

import React from 'react';

export type TourState = {
  isPlaying: boolean;
  index: number;      // indice evento corrente nella lista visibile
  speedMs: number;    // intervallo autoplay
  loop: boolean;      // riparte da capo al termine
  total: number;      // numero eventi disponibili
};

type Props = {
  state: TourState;
  onPlayPause: () => void;
  onPrev: () => void;
  onNext: () => void;
  onChangeSpeed: (ms: number) => void;
  onToggleLoop: () => void;
  onStop: () => void;
};

export default function TourControls({
  state, onPlayPause, onPrev, onNext, onChangeSpeed, onToggleLoop, onStop,
}: Props) {
  const disabled = state.total === 0;

  return (
    <div style={{
      position: 'absolute',
      left: 12, bottom: 12,
      zIndex: 1000,
      background: 'rgba(255,255,255,0.95)',
      border: '1px solid #e5e5e5',
      borderRadius: 10,
      padding: 10,
      boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
      display: 'grid',
      gap: 8,
      minWidth: 260,
    }}>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:8}}>
        <strong>Tour</strong>
        <span style={{fontSize:12, opacity:0.7}}>
          {state.total ? `${state.index+1}/${state.total}` : '0/0'}
        </span>
      </div>

      <div style={{display:'flex', gap:8}}>
        <button type="button" onClick={onPrev} disabled={disabled}
          title="Indietro"
          style={btnStyle}>⟵</button>

        <button type="button" onClick={onPlayPause} disabled={disabled}
          title={state.isPlaying ? 'Pausa' : 'Play'}
          style={{...btnStyle, minWidth:80}}>
          {state.isPlaying ? 'Pausa' : 'Play'}
        </button>

        <button type="button" onClick={onNext} disabled={disabled}
          title="Avanti"
          style={btnStyle}>⟶</button>

        <button type="button" onClick={onStop} disabled={disabled}
          title="Stop"
          style={{...btnStyle, background:'#fff3f3', borderColor:'#ffd7d7', color:'#a70000'}}>
          Stop
        </button>
      </div>

      <label style={{display:'grid', gap:4, fontSize:12}}>
        <span>Velocità (ms): {state.speedMs}</span>
        <input
          type="range"
          min={500}
          max={8000}
          step={250}
          value={state.speedMs}
          onChange={(e)=> onChangeSpeed(Number(e.target.value))}
        />
      </label>

      <label style={{display:'flex', alignItems:'center', gap:8, fontSize:12}}>
        <input type="checkbox" checked={state.loop} onChange={onToggleLoop} />
        Loop
      </label>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  padding: '6px 10px',
  borderRadius: 8,
  border: '1px solid #ddd',
  background: '#fff',
  cursor: 'pointer',
};
