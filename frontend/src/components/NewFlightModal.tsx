import { useState, useEffect } from 'react';
import { getPresets, createJet } from '../api';
import type { PresetRoute, Jet } from '../types';

interface Props { onCreated: (jet: Jet) => void; onClose: () => void; }

const ROUTE_ICONS: Record<string, string> = {
  'JFK': '🗽', 'LHR': '🇬🇧', 'DXB': '🌆', 'SIN': '🦁',
  'LBG': '🗼', 'WIL': '🦁', 'LAX': '🎬', 'HND': '⛩️',
};

export default function NewFlightModal({ onCreated, onClose }: Props) {
  const [presets, setPresets] = useState<PresetRoute[]>([]);
  const [selected, setSelected] = useState<PresetRoute | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { getPresets().then(r => setPresets(r.data)); }, []);

  const handleCreate = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      const { data } = await createJet(selected);
      onCreated(data);
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.75)',
      backdropFilter: 'blur(6px)',
      zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'fade-in 0.15s ease',
    }} onClick={onClose}>
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-mid)',
        borderRadius: 16, padding: 28, width: 520, maxWidth: '95vw',
        boxShadow: '0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04)',
        animation: 'slide-in 0.2s ease',
      }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: 'var(--text-primary)' }}>
              Dispatch New Flight
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: 11, color: 'var(--text-muted)' }}>
              Select a preset route to initialize tracking
            </p>
          </div>
          <button onClick={onClose} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-dim)',
            color: 'var(--text-muted)', width: 28, height: 28, borderRadius: 7,
            cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>×</button>
        </div>

        {/* Route list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 22 }}>
          {presets.map((p) => {
            const isSel = selected?.callsign === p.callsign;
            return (
              <div key={p.callsign} onClick={() => setSelected(p)} style={{
                padding: '14px 16px',
                borderRadius: 10,
                border: isSel ? '1px solid rgba(59,130,246,0.50)' : '1px solid var(--border-dim)',
                background: isSel
                  ? 'linear-gradient(135deg,rgba(59,130,246,0.12),rgba(59,130,246,0.05))'
                  : 'var(--bg-card)',
                cursor: 'pointer', transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (!isSel) (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-bright)'; }}
              onMouseLeave={e => { if (!isSel) (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-dim)'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: isSel ? '#3b82f6' : 'var(--border-mid)',
                      boxShadow: isSel ? '0 0 8px #3b82f6' : 'none',
                      transition: 'all 0.15s',
                    }} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>
                      {p.callsign}
                    </span>
                  </div>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{p.aircraft_type}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 16 }}>{ROUTE_ICONS[p.origin_iata] ?? '🛫'}</span>
                    <div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: '#60a5fa' }}>{p.origin_iata}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{p.origin_name}</div>
                    </div>
                  </div>
                  <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)', position: 'relative', margin: '0 8px' }}>
                    <div style={{
                      position: 'absolute', top: '50%', left: '50%',
                      transform: 'translate(-50%, -50%)',
                      background: 'var(--bg-card)', padding: '0 6px',
                      fontSize: 14,
                    }}>✈</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, textAlign: 'right' }}>
                    <div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: '#fb923c' }}>{p.destination_iata}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{p.destination_name}</div>
                    </div>
                    <span style={{ fontSize: 16 }}>{ROUTE_ICONS[p.destination_iata] ?? '🛬'}</span>
                  </div>
                </div>
                <div style={{ marginTop: 8, fontSize: 10, color: 'var(--text-muted)' }}>
                  {p.route_points.length} waypoints · {p.registration}
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: '10px 0', borderRadius: 8,
            border: '1px solid var(--border-dim)', background: 'var(--bg-card)',
            color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}>Cancel</button>
          <button onClick={handleCreate} disabled={!selected || loading} style={{
            flex: 2, padding: '10px 0', borderRadius: 8, border: 'none',
            background: selected
              ? 'linear-gradient(135deg,#1d4ed8,#2563eb)'
              : 'var(--bg-elevated)',
            color: selected ? 'white' : 'var(--text-muted)',
            fontSize: 12, fontWeight: 700, cursor: selected ? 'pointer' : 'default',
            letterSpacing: 0.3,
            boxShadow: selected ? '0 4px 20px rgba(37,99,235,0.35)' : 'none',
            transition: 'all 0.15s',
          }}>
            {loading ? '⟳  Dispatching…' : '✈  Dispatch Flight'}
          </button>
        </div>
      </div>
    </div>
  );
}
