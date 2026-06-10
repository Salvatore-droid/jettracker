import type { Jet } from '../types';

interface Props {
  jet: Jet;
  selected: boolean;
  onClick: () => void;
  onDelete: () => void;
}

const STATUS_COLOR: Record<string, string> = {
  scheduled: '#94a3b8', taxiing: '#f59e0b', airborne: '#3b82f6',
  cruising: '#1D9E75', descending: '#f97316', landed: '#8b5cf6',
};
const STATUS_BG: Record<string, string> = {
  scheduled: '#f1f5f9', taxiing: '#fffbeb', airborne: '#eff6ff',
  cruising: '#f0fdf4', descending: '#fff7ed', landed: '#f5f3ff',
};

export default function FlightCard({ jet, selected, onClick, onDelete }: Props) {
  return (
    <div
      onClick={onClick}
      style={{
        border: selected ? '2px solid #1D9E75' : '1px solid #e2e8f0',
        borderRadius: 10, padding: '12px 14px', cursor: 'pointer',
        background: selected ? '#f0fdf4' : 'white',
        transition: 'all 0.15s',
        position: 'relative',
      }}
    >
      <button
        onClick={e => { e.stopPropagation(); onDelete(); }}
        style={{
          position: 'absolute', top: 8, right: 8, background: 'none',
          border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 16, lineHeight: 1,
        }}
        title="Delete flight"
      >×</button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{jet.callsign}</span>
        <span style={{
          fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 99,
          background: STATUS_BG[jet.status], color: STATUS_COLOR[jet.status],
          textTransform: 'uppercase', letterSpacing: 0.5,
        }}>{jet.status}</span>
        {jet.is_playing && (
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#1D9E75',
            animation: 'pulse 1.2s infinite', display: 'inline-block' }} />
        )}
      </div>

      <div style={{ fontSize: 12, color: '#475569', marginBottom: 4 }}>
        <strong>{jet.origin_iata}</strong>
        <span style={{ margin: '0 6px', color: '#94a3b8' }}>→</span>
        <strong>{jet.destination_iata}</strong>
        <span style={{ marginLeft: 8, color: '#94a3b8' }}>{jet.aircraft_type}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
        <div style={{ flex: 1, height: 4, background: '#e2e8f0', borderRadius: 2 }}>
          <div style={{
            width: `${(jet.progress * 100).toFixed(1)}%`, height: '100%',
            background: jet.is_playing ? '#1D9E75' : STATUS_COLOR[jet.status],
            borderRadius: 2, transition: 'width 0.3s',
          }} />
        </div>
        <span style={{ fontSize: 11, color: '#64748b', minWidth: 32, textAlign: 'right' }}>
          {(jet.progress * 100).toFixed(0)}%
        </span>
      </div>
    </div>
  );
}
