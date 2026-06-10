import type { Jet } from '../types';

interface Props {
  jets: Jet[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
}

const STATUS_DOT: Record<string, string> = {
  scheduled: '#4a5568', taxiing: '#f59e0b', airborne: '#3b82f6',
  cruising: '#10b981', descending: '#f97316', landed: '#8b5cf6',
};

function FlightRow({ jet, selected, onSelect, onDelete }: {
  jet: Jet; selected: boolean;
  onSelect: () => void; onDelete: () => void;
}) {
  const dot = STATUS_DOT[jet.status] ?? '#4a5568';
  return (
    <div
      onClick={onSelect}
      style={{
        position: 'relative',
        padding: '11px 14px',
        cursor: 'pointer',
        borderRadius: '8px',
        border: selected
          ? '1px solid rgba(59,130,246,0.40)'
          : '1px solid transparent',
        background: selected
          ? 'linear-gradient(135deg,rgba(59,130,246,0.10),rgba(59,130,246,0.04))'
          : 'transparent',
        transition: 'all 0.15s',
        marginBottom: 2,
      }}
      onMouseEnter={e => { if (!selected) (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-hover)'; }}
      onMouseLeave={e => { if (!selected) (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
    >
      {/* delete */}
      <button
        onClick={e => { e.stopPropagation(); onDelete(); }}
        style={{
          position: 'absolute', top: 8, right: 8,
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text-muted)', fontSize: 15, lineHeight: 1,
          padding: '0 3px', borderRadius: 3, transition: 'color 0.1s',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--red)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
      >×</button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
        <span style={{
          width: 7, height: 7, borderRadius: '50%', background: dot, flexShrink: 0,
          boxShadow: jet.is_playing ? `0 0 6px ${dot}` : 'none',
          animation: jet.is_playing ? 'pulse-dot 1.5s ease-in-out infinite' : 'none',
        }} />
        <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', letterSpacing: 0.4 }}>
          {jet.callsign}
        </span>
        <span style={{
          fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8,
          padding: '2px 6px', borderRadius: 3,
          background: `${dot}22`, color: dot,
        }}>{jet.status}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-secondary)' }}>
          {jet.origin_iata}
        </span>
        <svg width="24" height="8" viewBox="0 0 24 8" style={{ opacity: 0.35 }}>
          <line x1="0" y1="4" x2="18" y2="4" stroke="currentColor" strokeWidth="1"/>
          <polyline points="14,1 18,4 14,7" fill="none" stroke="currentColor" strokeWidth="1"/>
        </svg>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-secondary)' }}>
          {jet.destination_iata}
        </span>
        <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--text-muted)' }}>
          {jet.aircraft_type.split(' ').slice(-1)[0]}
        </span>
      </div>

      {/* progress bar */}
      <div style={{ height: 2, background: 'var(--border-subtle)', borderRadius: 1, overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 1, transition: 'width 0.4s ease',
          width: `${(jet.progress * 100).toFixed(1)}%`,
          background: jet.is_playing
            ? `linear-gradient(90deg,${dot},${dot}aa)`
            : dot,
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
        <span style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          {jet.altitude_ft > 0 ? `${(jet.altitude_ft/1000).toFixed(0)}k ft` : '— ft'}
        </span>
        <span style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          {(jet.progress * 100).toFixed(0)}%
        </span>
      </div>
    </div>
  );
}

export default function Sidebar({ jets, selectedId, onSelect, onDelete, onNew }: Props) {
  const active = jets.filter(j => j.is_playing).length;

  return (
    <div style={{
      width: 268,
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border-subtle)',
      flexShrink: 0,
      height: '100%',
    }}>
      {/* Logo / Header */}
      <div style={{
        padding: '18px 16px 14px',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 16px rgba(59,130,246,0.35)',
            flexShrink: 0,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2 1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"/>
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--text-primary)', letterSpacing: 0.3 }}>
              JetTracker
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: 0.5, textTransform: 'uppercase' }}>
              Command Centre
            </div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%', background: 'var(--green)',
              animation: 'pulse-dot 2s ease-in-out infinite',
              boxShadow: '0 0 6px var(--green)',
            }} />
            <span style={{ fontSize: 9, color: 'var(--green)', fontWeight: 600, letterSpacing: 0.5 }}>
              LIVE
            </span>
          </div>
        </div>

        {/* Stats row */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 12,
        }}>
          {[
            { label: 'Total', value: jets.length },
            { label: 'Active', value: active, color: 'var(--green)' },
            { label: 'Landed', value: jets.filter(j => j.status === 'landed').length, color: 'var(--purple)' },
          ].map(s => (
            <div key={s.label} style={{
              background: 'var(--bg-card)', borderRadius: 6, padding: '7px 8px',
              border: '1px solid var(--border-subtle)',
            }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: s.color ?? 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                {s.value}
              </div>
              <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 1 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onNew}
          style={{
            width: '100%', padding: '9px 0',
            borderRadius: 8, border: '1px solid rgba(59,130,246,0.35)',
            background: 'linear-gradient(135deg,rgba(59,130,246,0.18),rgba(59,130,246,0.08))',
            color: '#93c5fd', fontSize: 12, fontWeight: 600,
            cursor: 'pointer', letterSpacing: 0.3,
            transition: 'all 0.15s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(59,130,246,0.25)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'linear-gradient(135deg,rgba(59,130,246,0.18),rgba(59,130,246,0.08))')}
        >
          <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> New Flight
        </button>
      </div>

      {/* Section label */}
      <div style={{ padding: '10px 16px 6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 600 }}>
          Flights
        </span>
        <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          {jets.length} tracked
        </span>
      </div>

      {/* Flight list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px 12px' }}>
        {jets.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-muted)', fontSize: 12 }}>
            <div style={{ fontSize: 28, marginBottom: 10, opacity: 0.3 }}>✈</div>
            No flights tracked.<br/>Click "New Flight" to begin.
          </div>
        ) : jets.map(j => (
          <FlightRow key={j.id} jet={j}
            selected={j.id === selectedId}
            onSelect={() => onSelect(j.id)}
            onDelete={() => onDelete(j.id)}
          />
        ))}
      </div>
    </div>
  );
}
