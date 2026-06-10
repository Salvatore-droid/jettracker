import type { Jet } from '../types';

const STATUS_COLOR: Record<string, string> = {
  scheduled:'#8896b3', taxiing:'#f59e0b', airborne:'#3b82f6',
  cruising:'#10b981', descending:'#f97316', landed:'#8b5cf6',
};

export default function MapHUD({ jet }: { jet: Jet }) {
  const sc = STATUS_COLOR[jet.status] ?? '#10b981';

  return (
    <>
      {/* Top-left flight info */}
      <div style={{
        position: 'absolute', top: 14, left: 14, zIndex: 500,
        background: 'rgba(8,12,20,0.88)', backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.10)',
        borderRadius: 10, padding: '10px 14px',
        minWidth: 170,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
          <span style={{
            width: 7, height: 7, borderRadius: '50%', background: sc, flexShrink: 0,
            boxShadow: `0 0 6px ${sc}`,
            animation: jet.is_playing ? 'pulse-dot 1.5s infinite' : 'none',
          }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 14, color: 'white', letterSpacing: 0.5 }}>
            {jet.callsign}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 0.5 }}>From</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: '#60a5fa' }}>{jet.origin_iata}</div>
          </div>
          <div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 0.5 }}>To</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: '#fb923c' }}>{jet.destination_iata}</div>
          </div>
        </div>
      </div>

      {/* Bottom telemetry bar */}
      <div style={{
        position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)',
        zIndex: 500,
        background: 'rgba(8,12,20,0.88)', backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.10)',
        borderRadius: 10, padding: '8px 20px',
        display: 'flex', gap: 24, alignItems: 'center',
      }}>
        {[
          { label: 'ALT', value: `${(jet.altitude_ft/1000).toFixed(0)}k`, unit: 'ft', color: '#60a5fa' },
          { label: 'SPD', value: `${jet.speed_kts}`, unit: 'kts', color: '#10b981' },
          { label: 'HDG', value: `${Math.round(jet.heading)}°`, unit: '', color: '#f59e0b' },
          { label: 'PROG', value: `${(jet.progress*100).toFixed(0)}%`, unit: '', color: sc },
        ].map((d, i) => (
          <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: i < 3 ? 24 : 0 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                {d.label}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 700, color: d.color, lineHeight: 1.1 }}>
                {d.value}
                <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginLeft: 2 }}>{d.unit}</span>
              </div>
            </div>
            {i < 3 && <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.08)' }} />}
          </div>
        ))}
      </div>
    </>
  );
}
