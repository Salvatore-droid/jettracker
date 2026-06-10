import { useState, useEffect, useRef, useCallback } from 'react';
import { getJet, controlJet, tickJet, WS_BASE } from '../api';
import type { Jet, FlightEvent, TickData } from '../types';

export function useJetTracker(jetId: string | null) {
  const [jet, setJet] = useState<Jet | null>(null);
  const [loading, setLoading] = useState(false);
  const [liveEvents, setLiveEvents] = useState<FlightEvent[]>([]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const fetchJet = useCallback(async () => {
    if (!jetId) return;
    setLoading(true);
    try {
      const { data } = await getJet(jetId);
      setJet(data);
      setLiveEvents(data.events.slice(0, 50));
    } finally {
      setLoading(false);
    }
  }, [jetId]);

  useEffect(() => {
    if (!jetId) { setJet(null); return; }
    fetchJet();
    wsRef.current = new WebSocket(`${WS_BASE}/${jetId}/`);
    wsRef.current.onmessage = (e) => {
      const d: TickData & { type?: string } = JSON.parse(e.data);
      if (d.type === 'connected') return;
      setJet(prev => prev ? { ...prev, ...d } : prev);
    };
    return () => { wsRef.current?.close(); };
  }, [jetId, fetchJet]);

  useEffect(() => {
    if (!jetId || !jet?.is_playing) {
      if (tickRef.current) clearInterval(tickRef.current);
      return;
    }
    tickRef.current = setInterval(async () => {
      try {
        const { data } = await tickJet(jetId);
        if (!data.skipped) {
          setJet(prev => prev ? { ...prev, ...data } : prev);
        }
      } catch (_) {}
    }, 250);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [jetId, jet?.is_playing]);

  const addEvent = (type: string, message: string) => {
    const ev: FlightEvent = {
      id: Date.now(), timestamp: new Date().toISOString(),
      event_type: type, message, lat: null, lng: null,
    };
    setLiveEvents(prev => [ev, ...prev.slice(0, 49)]);
  };

  const play = async () => {
    if (!jetId) return;
    const { data } = await controlJet(jetId, 'play');
    setJet(data); addEvent('play', 'Simulation started');
  };
  const pause = async () => {
    if (!jetId) return;
    const { data } = await controlJet(jetId, 'pause');
    setJet(data); addEvent('pause', 'Simulation paused');
  };
  const reset = async () => {
    if (!jetId) return;
    const { data } = await controlJet(jetId, 'reset');
    setJet(data); setLiveEvents([]); addEvent('reset', 'Flight reset');
  };
  const jump = async (progress: number) => {
    if (!jetId) return;
    const { data } = await controlJet(jetId, 'jump', { progress });
    setJet(data); addEvent('jump', `Jumped to ${(progress * 100).toFixed(0)}%`);
  };
  const setSpeed = async (simulation_speed: number) => {
    if (!jetId) return;
    const { data } = await controlJet(jetId, 'set_speed', { simulation_speed });
    setJet(data);
  };

  return { jet, loading, liveEvents, play, pause, reset, jump, setSpeed, refresh: fetchJet };
}
