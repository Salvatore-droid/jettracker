import type { Jet } from '../types';

interface Props {
  jet: Jet;
  onPlay: () => void; onPause: () => void; onReset: () => void;
  onJump: (p: number) => void; onSetSpeed: (s: number) => void;
}

function DataCell({ label, value, unit, color, mono }: {
  label: string; value: string | number; unit?: string; color?: string; mono?: boolean;
}) {
  return (
    <div style={{
      padding: '10px 12px', borderRadius: 8,
      background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
    }}>
      <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
        <span style={{
          fontSize: 18, fontWeight: 700, color: color ?? 'var(--text-primary)',
          fontFamily: mono ? 'var(--font-mono)' : 'var(--font-ui)',
          lineHeight: 1,
        }}>{value}</span>
        {unit && <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{unit}</span>}
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 9, fontWeight: 700, color: 'var(--text-muted)',
      textTransform: 'uppercase', letterSpacing: 1,
      marginBottom: 8, marginTop: 4,
      display: 'flex', alignItems: 'center', gap: 8,
    }}>
      <span>{children}</span>
      <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
    </div>
  );
}

const STATUS_COLOR: Record<string, string> = {
  scheduled:'#8896b3', taxiing:'#f59e0b', airborne:'#3b82f6',
  cruising:'#10b981', descending:'#f97316', landed:'#8b5cf6',
};

export default function ControlPanel({ jet, onPlay, onPause, onReset, onJump, onSetSpeed }: Props) {
  const sc = STATUS_COLOR[jet.status] ?? '#10b981';

  const btn = (label: string, onClick: () => void, variant: 'primary'|'secondary'|'danger', disabled?: boolean) => {
    const bg = {
      primary: disabled ? 'var(--bg-elevated)' : 'linear-gradient(135deg,#1d4ed8,#2563eb)',
      secondary: 'var(--bg-card)',
      danger: 'var(--bg-card)',
    }[variant];
    const color = {
      primary: disabled ? 'var(--text-muted)' : 'white',
      secondary: 'var(--text-secondary)',
      danger: 'var(--red)',
    }[variant];
    const border = {
      primary: 'none',
      secondary: '1px solid var(--border-dim)',
      danger: '1px solid rgba(239,68,68,0.25)',
    }[variant];
    return (
      <button onClick={onClick} disabled={disabled} style={{
        padding: '8px 0', borderRadius: 7,
        border, background: bg, color,
        fontSize: 11, fontWeight: 600, cursor: disabled ? 'default' : 'pointer',
        transition: 'all 0.15s', letterSpacing: 0.3, flex: 1,
      }}
      onMouseEnter={e => { if (!disabled && variant !== 'primary') (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-hover)'; }}
      onMouseLeave={e => { if (!disabled && variant !== 'primary') (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-card)'; }}
      >{label}</button>
    );
  };

  const pct = (jet.progress * 100).toFixed(1);
  const eta = jet.is_playing && jet.progress < 1
    ? `~${Math.ceil((1 - jet.progress) / (0.001 * jet.simulation_speed) * 0.25 / 60)} min`
    : jet.progress >= 1 ? 'Arrived' : '—';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%', overflowY: 'auto', paddingBottom: 8 }}>

      {/* Aircraft card */}
      <div style={{
        padding: '14px', borderRadius: 10,
        background: 'linear-gradient(135deg,rgba(59,130,246,0.08),rgba(59,130,246,0.03))',
        border: '1px solid rgba(59,130,246,0.20)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 8,
            background: `${sc}18`, border: `1px solid ${sc}44`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill={sc}>
              <path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2 1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"/>
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
              {jet.callsign}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{jet.aircraft_type}</div>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div style={{
              fontSize: 10, fontWeight: 700, color: sc, textTransform: 'uppercase',
              letterSpacing: 0.8, padding: '2px 8px',
              background: `${sc}18`, borderRadius: 4,
            }}>
              {jet.status}
            </div>
          </div>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', gap: 6 }}>
          <span style={{ fontFamily: 'var(--font-mono)', color: '#60a5fa', fontWeight: 600 }}>{jet.origin_iata}</span>
          <span style={{ color: 'var(--text-muted)' }}>·</span>
          <span>{jet.origin_name}</span>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', gap: 6, marginTop: 2 }}>
          <span style={{ fontFamily: 'var(--font-mono)', color: '#fb923c', fontWeight: 600 }}>{jet.destination_iata}</span>
          <span style={{ color: 'var(--text-muted)' }}>·</span>
          <span>{jet.destination_name}</span>
        </div>
      </div>

      {/* Telemetry grid */}
      <div>
        <SectionLabel>Telemetry</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          <DataCell label="Altitude" value={jet.altitude_ft > 0 ? `${(jet.altitude_ft/1000).toFixed(0)}` : '0'} unit="k ft" color="#60a5fa" mono />
          <DataCell label="Speed" value={jet.speed_kts} unit="kts" color="#10b981" mono />
          <DataCell label="Heading" value={`${Math.round(jet.heading)}°`} color="#f59e0b" mono />
          <DataCell label="Progress" value={`${pct}%`} color={sc} mono />
        </div>
        {jet.current_lat != null && (
          <div style={{
            marginTop: 6, padding: '7px 10px', borderRadius: 7,
            background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
            fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)',
            display: 'flex', justifyContent: 'space-between',
          }}>
            <span>LAT {jet.current_lat.toFixed(4)}°</span>
            <span>LNG {jet.current_lng?.toFixed(4)}°</span>
          </div>
        )}
      </div>

      {/* Playback */}
      <div>
        <SectionLabel>Playback Control</SectionLabel>
        <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
          {btn('▶  PLAY', onPlay, 'primary', jet.is_playing)}
          {btn('⏸  PAUSE', onPause, 'secondary', !jet.is_playing)}
          {btn('↺  RESET', onReset, 'secondary')}
        </div>
      </div>

      {/* Route scrubber */}
      <div>
        <SectionLabel>Route Position</SectionLabel>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 10 }}>
          <span style={{ color: '#60a5fa', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{jet.origin_iata}</span>
          <span style={{ color: 'var(--text-muted)' }}>ETA {eta}</span>
          <span style={{ color: '#fb923c', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{jet.destination_iata}</span>
        </div>
        <div style={{ position: 'relative', marginBottom: 4 }}>
          <input type="range" min={0} max={100} step={1}
            value={Math.round(jet.progress * 100)}
            onChange={e => onJump(Number(e.target.value) / 100)}
            style={{ width: '100%' }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          <span>0%</span>
          <span style={{ color: sc, fontWeight: 700 }}>{pct}%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Sim speed */}
      <div>
        <SectionLabel>Simulation Speed</SectionLabel>
        <div style={{
          display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap',
        }}>
          {[1, 2, 5, 10, 20].map(s => (
            <button key={s} onClick={() => onSetSpeed(s)} style={{
              padding: '5px 10px', borderRadius: 6,
              border: jet.simulation_speed === s ? '1px solid #3b82f6' : '1px solid var(--border-subtle)',
              background: jet.simulation_speed === s ? 'rgba(59,130,246,0.18)' : 'var(--bg-card)',
              color: jet.simulation_speed === s ? '#60a5fa' : 'var(--text-muted)',
              fontSize: 11, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
            }}>{s}x</button>
          ))}
        </div>
        <input type="range" min={1} max={20} step={1}
          value={jet.simulation_speed}
          onChange={e => onSetSpeed(Number(e.target.value))}
          style={{ width: '100%' }}
        />
        <div style={{ marginTop: 4, fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textAlign: 'center' }}>
          {jet.simulation_speed}x real-time
        </div>
      </div>
    </div>
  );
}
