import type { Jet } from '../types';

interface Props { jet: Jet }

const STATUS_COLOR: Record<string, string> = {
  scheduled:'#8896b3', taxiing:'#f59e0b', airborne:'#3b82f6',
  cruising:'#10b981', descending:'#f97316', landed:'#8b5cf6',
};

function Gauge({ label, value, max, unit, color }: {
  label: string; value: number; max: number; unit: string; color: string;
}) {
  const pct = Math.min(100, (value / max) * 100);
  const circumference = 2 * Math.PI * 36;
  const strokeDash = (pct / 100) * circumference;

  return (
    <div style={{
      padding: '18px', borderRadius: 12,
      background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
    }}>
      <svg width="88" height="88" viewBox="0 0 88 88">
        <circle cx="44" cy="44" r="36" fill="none" stroke="var(--border-subtle)" strokeWidth="5"/>
        <circle cx="44" cy="44" r="36" fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={`${strokeDash} ${circumference}`}
          strokeLinecap="round"
          transform="rotate(-90 44 44)"
          style={{ transition: 'stroke-dasharray 0.6s ease', filter: `drop-shadow(0 0 4px ${color})` }}
        />
        <text x="44" y="40" textAnchor="middle" fill="var(--text-primary)"
          fontSize="14" fontWeight="700" fontFamily="var(--font-mono)">
          {value.toLocaleString()}
        </text>
        <text x="44" y="54" textAnchor="middle" fill="var(--text-muted)" fontSize="9">
          {unit}
        </text>
      </svg>
      <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 600 }}>
        {label}
      </div>
    </div>
  );
}

function DataRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '10px 14px', borderBottom: '1px solid var(--border-subtle)',
    }}>
      <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: color ?? 'var(--text-primary)' }}>
        {value}
      </span>
    </div>
  );
}

export default function TelemetryPanel({ jet }: Props) {
  const sc = STATUS_COLOR[jet.status] ?? '#10b981';

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '20px' }}>
      <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 4 }}>
        Telemetry Dashboard
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 20 }}>
        Live instrument data for <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{jet.callsign}</span>
      </div>

      {/* Gauges */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        <Gauge label="Altitude" value={jet.altitude_ft} max={45000} unit="FT" color="#60a5fa" />
        <Gauge label="Airspeed" value={jet.speed_kts} max={600} unit="KTS" color="#10b981" />
        <Gauge label="Progress" value={Math.round(jet.progress * 100)} max={100} unit="%" color={sc} />
      </div>

      {/* Data table */}
      <div style={{ borderRadius: 10, border: '1px solid var(--border-subtle)', overflow: 'hidden', marginBottom: 16 }}>
        <div style={{ padding: '10px 14px', background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.8 }}>
            Navigation Data
          </span>
        </div>
        <DataRow label="Callsign"     value={jet.callsign}              color="var(--text-accent)" />
        <DataRow label="Registration" value={jet.registration}          color="var(--text-secondary)" />
        <DataRow label="Aircraft"     value={jet.aircraft_type}         color="var(--text-secondary)" />
        <DataRow label="Origin"       value={`${jet.origin_iata} · ${jet.origin_name}`} />
        <DataRow label="Destination"  value={`${jet.destination_iata} · ${jet.destination_name}`} />
        <DataRow label="Status"       value={jet.status.toUpperCase()}   color={sc} />
        <DataRow label="Heading"      value={`${Math.round(jet.heading)}°`} color="#f59e0b" />
        <DataRow label="Sim Speed"    value={`${jet.simulation_speed}x`} color="#06b6d4" />
      </div>

      {/* Position block */}
      {jet.current_lat != null && (
        <div style={{
          padding: '14px 16px', borderRadius: 10,
          background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
        }}>
          <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>
            GPS Position
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { label: 'Latitude', value: `${jet.current_lat.toFixed(5)}°` },
              { label: 'Longitude', value: `${jet.current_lng?.toFixed(5)}°` },
            ].map(f => (
              <div key={f.label}>
                <div style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 3 }}>{f.label}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: '#10b981', fontWeight: 600 }}>{f.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
