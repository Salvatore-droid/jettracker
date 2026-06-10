import type { Jet } from '../types';

interface Props { jet: Jet; activeTab: string; onTab: (t: string) => void; }

const STATUS_COLOR: Record<string, string> = {
  scheduled:'#8896b3', taxiing:'#f59e0b', airborne:'#3b82f6',
  cruising:'#10b981', descending:'#f97316', landed:'#8b5cf6',
};

function Tab({ label, active, onClick }: { label:string; active:boolean; onClick:()=>void }) {
  return (
    <button onClick={onClick} style={{
      padding: '0 16px', height: '100%', border: 'none', cursor: 'pointer',
      background: 'none', fontSize: 12, fontWeight: active ? 600 : 400,
      color: active ? 'var(--text-primary)' : 'var(--text-muted)',
      borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent',
      letterSpacing: 0.2, transition: 'all 0.15s',
    }}
    onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)'; }}
    onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; }}
    >{label}</button>
  );
}

export default function TopBar({ jet, activeTab, onTab }: Props) {
  const sc = STATUS_COLOR[jet.status] ?? '#8896b3';

  return (
    <div style={{
      height: 48, display: 'flex', alignItems: 'center',
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-subtle)',
      paddingLeft: 20, gap: 0, flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginRight: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            width: 7, height: 7, borderRadius: '50%', background: sc,
            boxShadow: jet.is_playing ? `0 0 8px ${sc}` : 'none',
            animation: jet.is_playing ? 'pulse-dot 1.5s ease-in-out infinite' : 'none',
          }} />
          <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--text-primary)', letterSpacing: 0.5, fontFamily: 'var(--font-mono)' }}>
            {jet.callsign}
          </span>
        </div>
        <span style={{ color: 'var(--border-dim)', fontSize: 16 }}>|</span>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          <span style={{ fontFamily: 'var(--font-mono)', color: '#60a5fa' }}>{jet.origin_iata}</span>
          <span style={{ margin: '0 6px', color: 'var(--text-muted)' }}>→</span>
          <span style={{ fontFamily: 'var(--font-mono)', color: '#fb923c' }}>{jet.destination_iata}</span>
        </span>
        <span style={{ color: 'var(--border-dim)', fontSize: 16 }}>|</span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{jet.aircraft_type}</span>
        <span style={{ color: 'var(--border-dim)', fontSize: 16 }}>|</span>
        <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          REG {jet.registration}
        </span>
      </div>

      <div style={{ display: 'flex', height: '100%', gap: 0 }}>
        <Tab label="Live Map"   active={activeTab==='map'}       onClick={() => onTab('map')} />
        <Tab label="Flight Log" active={activeTab==='log'}       onClick={() => onTab('log')} />
        <Tab label="Telemetry"  active={activeTab==='telemetry'} onClick={() => onTab('telemetry')} />
      </div>

      <div style={{ marginLeft: 'auto', paddingRight: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: 0.5, textTransform:'uppercase' }}>UTC</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-secondary)' }}>
            {new Date().toISOString().slice(11,19)}Z
          </div>
        </div>
        <div style={{
          padding: '4px 10px', borderRadius: 5,
          background: `${sc}18`, border: `1px solid ${sc}44`,
          fontSize: 10, fontWeight: 700, color: sc, letterSpacing: 0.8, textTransform: 'uppercase',
        }}>
          {jet.status}
        </div>
      </div>
    </div>
  );
}
