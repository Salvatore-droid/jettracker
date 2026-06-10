import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Jet } from '../types';

interface Props { jet: Jet }

const STATUS_COLOR: Record<string, string> = {
  scheduled: '#8896b3',
  taxiing:   '#f59e0b',
  airborne:  '#3b82f6',
  cruising:  '#10b981',
  descending:'#f97316',
  landed:    '#8b5cf6',
};

export default function FlightMap({ jet }: Props) {
  const mapRef       = useRef<L.Map | null>(null);
  const markerRef    = useRef<L.Marker | null>(null);
  const trailRef     = useRef<L.Polyline | null>(null);
  const routeRef     = useRef<L.Polyline | null>(null);
  const trailCoords  = useRef<[number,number][]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const initJetId    = useRef<string | null>(null);

  /* ── init map once ─────────────────────────────────────── */
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      center: [30, 10], zoom: 2,
      zoomControl: false,
      attributionControl: false,
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(map);
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  /* ── draw route when jet changes ───────────────────────── */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !jet.route_points.length || initJetId.current === jet.id) return;
    initJetId.current = jet.id;
    trailCoords.current = [];
    if (trailRef.current) { trailRef.current.remove(); trailRef.current = null; }
    if (markerRef.current) { markerRef.current.remove(); markerRef.current = null; }

    const coords: [number,number][] = jet.route_points.map(p => [p.lat, p.lng]);
    if (routeRef.current) routeRef.current.remove();
    routeRef.current = L.polyline(coords, {
      color: 'rgba(255,255,255,0.12)', weight: 2, dashArray: '5 6',
    }).addTo(map);

    const pinIcon = (iata: string, color: string) => L.divIcon({
      className: '',
      html: `
        <div style="position:relative;display:flex;flex-direction:column;align-items:center">
          <div style="background:${color};color:#fff;font-size:10px;font-weight:700;
            padding:3px 7px;border-radius:4px;letter-spacing:0.5px;
            box-shadow:0 0 12px ${color}88;white-space:nowrap;">${iata}</div>
          <div style="width:1px;height:8px;background:${color};opacity:0.5"></div>
          <div style="width:5px;height:5px;border-radius:50%;background:${color}"></div>
        </div>`,
      iconSize: [40, 36], iconAnchor: [20, 36],
    });

    const o = jet.route_points[0];
    const d = jet.route_points[jet.route_points.length - 1];
    L.marker([o.lat, o.lng], { icon: pinIcon(jet.origin_iata, '#3b82f6') }).addTo(map);
    L.marker([d.lat, d.lng], { icon: pinIcon(jet.destination_iata, '#f97316') }).addTo(map);

    map.fitBounds(routeRef.current.getBounds(), { padding: [60, 60] });
  }, [jet.id]);

  /* ── animate marker on position change ─────────────────── */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || jet.current_lat == null || jet.current_lng == null) return;

    const pos: [number,number] = [jet.current_lat, jet.current_lng];
    const color = STATUS_COLOR[jet.status] ?? '#10b981';
    const h = jet.heading ?? 0;

    const jetIcon = L.divIcon({
      className: '',
      html: `
        <div style="position:relative;display:flex;align-items:center;justify-content:center;width:44px;height:44px;">
          <div style="position:absolute;width:44px;height:44px;border-radius:50%;
            background:radial-gradient(circle,${color}22 0%,transparent 70%);
            animation:pulse-dot 2s ease-in-out infinite;"></div>
          <div style="transform:rotate(${h}deg);display:flex;align-items:center;justify-content:center;
            filter:drop-shadow(0 0 6px ${color});z-index:1;">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="${color}" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2 1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"/>
            </svg>
          </div>
        </div>`,
      iconSize: [44, 44], iconAnchor: [22, 22],
    });

    if (!markerRef.current) {
      markerRef.current = L.marker(pos, { icon: jetIcon, zIndexOffset: 1000 }).addTo(map);
    } else {
      markerRef.current.setLatLng(pos).setIcon(jetIcon);
    }

    trailCoords.current = [...trailCoords.current.slice(-120), pos];
    if (trailRef.current) trailRef.current.remove();
    if (trailCoords.current.length > 1) {
      trailRef.current = L.polyline(trailCoords.current, {
        color, weight: 2, opacity: 0.65,
      }).addTo(map);
    }
  }, [jet.current_lat, jet.current_lng, jet.heading, jet.status]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
}
