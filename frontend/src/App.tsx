import { useState, useEffect, useCallback, useRef } from 'react';
import { getJets, deleteJet } from './api';
import { useJetTracker } from './hooks/useJetTracker';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import FlightMap from './components/FlightMap';
import MapHUD from './components/MapHUD';
import ControlPanel from './components/ControlPanel';
import EventLog from './components/EventLog';
import TelemetryPanel from './components/TelemetryPanel';
import NewFlightModal from './components/NewFlightModal';
import type { Jet } from './types';

type Tab = 'map' | 'log' | 'telemetry';

export default function App() {
  const [jets, setJets] = useState<Jet[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [tab, setTab] = useState<Tab>('map');
  const clockRef = useRef<HTMLSpanElement>(null);

  const { jet, loading, liveEvents, play, pause, reset, jump, setSpeed } = useJetTracker(selectedId);

  // UTC clock tick
  useEffect(() => {
    const t = setInterval(() => {
      if (clockRef.current) {
        clockRef.current.textContent = new Date().toISOString().slice(11, 19) + 'Z';
      }
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const loadJets = useCallback(async () => {
    const { data } = await getJets();
    setJets(data);
    if (data.length > 0 && !selectedId) setSelectedId(data[0].id);
  }, [selectedId]);

  useEffect(() => { loadJets(); }, []);

  // Sync live jet data back into list
  useEffect(() => {
    if (!jet) return;
    setJets(prev => prev.map(j => j.id === jet.id
      ? { ...j, status: jet.status, progress: jet.progress, is_playing: jet.is_playing,
          altitude_ft: jet.altitude_ft, speed_kts: jet.speed_kts, heading: jet.heading,
          current_lat: jet.current_lat, current_lng: jet.current_lng }
      : j
    ));
  }, [jet?.status, jet?.progress, jet?.is_playing, jet?.altitude_ft]);

  const handleDelete = async (id: string) => {
    await deleteJet(id);
    const remaining = jets.filter(j => j.id !== id);
    setJets(remaining);
    if (selectedId === id) setSelectedId(remaining[0]?.id ?? null);
  };

  const handleCreated = (newJet: Jet) => {
    setJets(prev => [newJet, ...prev]);
    setSelectedId(newJet.id);
    setShowModal(false);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg-base)' }}>
      <Sidebar
        jets={jets}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onDelete={handleDelete}
        onNew={() => setShowModal(true)}
      />

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {jet ? (
          <>
            <TopBar jet={jet} activeTab={tab} onTab={t => setTab(t as Tab)} />

            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
              {/* Content area */}
              <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
                {tab === 'map' && (
                  <div style={{ height: '100%', position: 'relative' }}>
                    <FlightMap jet={jet} />
                    <MapHUD jet={jet} />
                  </div>
                )}
                {tab === 'log' && (
                  <div style={{ height: '100%', background: 'var(--bg-surface)', overflow: 'hidden' }}>
                    <EventLog events={liveEvents} />
                  </div>
                )}
                {tab === 'telemetry' && (
                  <div style={{ height: '100%', background: 'var(--bg-surface)', overflow: 'hidden' }}>
                    <TelemetryPanel jet={jet} />
                  </div>
                )}
              </div>

              {/* Right control panel */}
              <div style={{
                width: 272, flexShrink: 0,
                background: 'var(--bg-surface)',
                borderLeft: '1px solid var(--border-subtle)',
                padding: '16px 14px',
                overflowY: 'auto',
              }}>
                <ControlPanel
                  jet={jet}
                  onPlay={play} onPause={pause} onReset={reset}
                  onJump={jump} onSetSpeed={setSpeed}
                />
              </div>
            </div>
          </>
        ) : (
          /* Empty state */
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            background: 'var(--bg-base)',
          }}>
            <div style={{
              width: 80, height: 80, borderRadius: 20, marginBottom: 24,
              background: 'linear-gradient(135deg,rgba(59,130,246,0.15),rgba(59,130,246,0.05))',
              border: '1px solid rgba(59,130,246,0.20)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="rgba(96,165,250,0.6)">
                <path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2 1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"/>
              </svg>
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
              {loading ? 'Loading flights…' : 'No flight selected'}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24, textAlign: 'center', lineHeight: 1.7 }}>
              {jets.length === 0
                ? 'Dispatch a new flight to begin simulated tracking'
                : 'Select a flight from the sidebar to view live tracking'}
            </div>
            {jets.length === 0 && (
              <button onClick={() => setShowModal(true)} style={{
                padding: '10px 24px', borderRadius: 8, border: 'none',
                background: 'linear-gradient(135deg,#1d4ed8,#2563eb)',
                color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(37,99,235,0.35)',
              }}>
                ✈ Dispatch First Flight
              </button>
            )}
          </div>
        )}
      </div>

      {showModal && <NewFlightModal onCreated={handleCreated} onClose={() => setShowModal(false)} />}
    </div>
  );
}
