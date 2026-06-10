import { useRef } from "react";;
import type { FlightEvent } from '../types';

const EV_META: Record<string, { color: string; icon: string; label: string }> = {
  play:         { color: '#10b981', icon: '▶', label: 'PLAY' },
  pause:        { color: '#f59e0b', icon: '⏸', label: 'PAUSE' },
  reset:        { color: '#8896b3', icon: '↺', label: 'RESET' },
  jump:         { color: '#3b82f6', icon: '⤷', label: 'JUMP' },
  created:      { color: '#8b5cf6', icon: '✦', label: 'INIT' },
  landed:       { color: '#8b5cf6', icon: '✓', label: 'LANDED' },
  taxiing:      { color: '#f59e0b', icon: '→', label: 'TAXI' },
  airborne:     { color: '#3b82f6', icon: '↑', label: 'AIRBORNE' },
  cruising:     { color: '#10b981', icon: '—', label: 'CRUISE' },
  descending:   { color: '#f97316', icon: '↓', label: 'DESCENT' },
  speed_change: { color: '#06b6d4', icon: '⚡', label: 'SPEED' },
};

export default function EventLog({ events }: { events: FlightEvent[] }) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px 10px',
        borderBottom: '1px solid var(--border-subtle)',
        flexShrink: 0,
      }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>Flight Event Log</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>Real-time flight status changes</div>
        </div>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 11,
          color: 'var(--text-muted)',
          padding: '4px 10px', background: 'var(--bg-card)',
          borderRadius: 6, border: '1px solid var(--border-subtle)',
        }}>
          {events.length} events
        </div>
      </div>

      <div ref={ref} style={{ flex: 1, overflowY: 'auto', padding: '8px 16px' }}>
        {events.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)', fontSize: 12 }}>
            <div style={{ fontSize: 24, marginBottom: 10, opacity: 0.3 }}>📋</div>
            No events recorded yet.<br/>Start the simulation to see log entries.
          </div>
        )}
        {events.map((ev, i) => {
          const meta = EV_META[ev.event_type] ?? { color: '#8896b3', icon: '·', label: ev.event_type.toUpperCase() };
          const ts = new Date(ev.timestamp);
          return (
            <div key={ev.id} style={{
              display: 'flex', gap: 12, padding: '10px 0',
              borderBottom: '1px solid var(--border-subtle)',
              animation: i === 0 ? 'slide-in 0.2s ease' : 'none',
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, flexShrink: 0 }}>
                <div style={{
                  width: 26, height: 26, borderRadius: 7,
                  background: `${meta.color}18`, border: `1px solid ${meta.color}44`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, color: meta.color, fontWeight: 700,
                }}>{meta.icon}</div>
                {i < events.length - 1 && (
                  <div style={{ width: 1, flex: 1, minHeight: 10, background: 'var(--border-subtle)', marginTop: 2 }} />
                )}
              </div>
              <div style={{ flex: 1, paddingTop: 3 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                  <span style={{
                    fontSize: 9, fontWeight: 700, color: meta.color,
                    letterSpacing: 0.8, padding: '1px 5px',
                    background: `${meta.color}15`, borderRadius: 3,
                  }}>{meta.label}</span>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {ts.toLocaleTimeString('en-GB')}
                  </span>
                  {ev.lat != null && (
                    <span style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginLeft: 'auto' }}>
                      {ev.lat.toFixed(2)}, {ev.lng?.toFixed(2)}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{ev.message}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
