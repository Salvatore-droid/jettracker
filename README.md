# JetTracker — Simulated Jet Tracking System

A full-stack live jet tracking system with a Django backend and React TypeScript frontend.
You control simulated flights from your dashboard; clients see a live moving jet on a real map.

## Stack

- **Backend**: Django 5 + Django Channels (WebSocket) + Django REST Framework
- **Frontend**: React 18 + TypeScript + Leaflet.js (real OpenStreetMap tiles)
- **Database**: SQLite (dev) — swap to PostgreSQL for production
- **Realtime**: WebSocket via Django Channels (InMemoryChannelLayer, no Redis needed for dev)

---

## Quick Start

### 1. Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Backend runs on **http://localhost:8000**

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on **http://localhost:3000**

---

## How It Works

1. Open http://localhost:3000 in your browser
2. Click **"+ New flight"** and pick a preset route
3. The flight appears in the sidebar — select it
4. Hit **▶ Play** on the right panel — the jet starts moving on the map
5. Use the **Position slider** to jump the jet anywhere on the route instantly
6. Adjust **Sim speed** (1x–20x) to fast-forward
7. Switch to **Flight log** tab to see all events

### Dashboard controls (your admin view)
- Play / Pause / Reset a flight
- Jump to any position on the route (instant teleport)
- Set simulation speed (1x to 20x)
- Delete flights

### What clients would see
The map view with the live moving marker, altitude, speed, and heading HUD — that's exactly
what you'd expose on a public tracking URL. The WebSocket pushes updates every 250ms.

---

## API Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| GET | /api/jets/ | List all flights |
| POST | /api/jets/create/ | Create a new flight |
| GET | /api/jets/presets/ | Get preset routes |
| GET | /api/jets/{id}/ | Get flight details |
| DELETE | /api/jets/{id}/delete/ | Delete a flight |
| POST | /api/jets/{id}/control/ | Control playback |
| POST | /api/jets/{id}/tick/ | Advance one tick (called by frontend) |

### Control actions

```json
{ "action": "play" }
{ "action": "pause" }
{ "action": "reset" }
{ "action": "jump", "progress": 0.45 }
{ "action": "set_speed", "simulation_speed": 5.0 }
```

### WebSocket

```
ws://localhost:8000/ws/jet/{id}/
```

Receives JSON updates:
```json
{
  "id": "uuid",
  "status": "cruising",
  "progress": 0.4231,
  "lat": 51.2,
  "lng": -20.1,
  "altitude_ft": 35000,
  "speed_kts": 490,
  "heading": 82.4,
  "is_playing": true
}
```

---

## Preset Routes

| Callsign | Route | Aircraft |
|----------|-------|----------|
| GTF001 | New York JFK → London Heathrow | Gulfstream G650ER |
| GTF002 | Dubai DXB → Singapore SIN | Bombardier Global 7500 |
| GTF003 | Paris Le Bourget → Nairobi Wilson | Dassault Falcon 8X |
| GTF004 | Los Angeles LAX → Tokyo Haneda | Gulfstream G700 |

---

## Production Notes

- Replace `InMemoryChannelLayer` with `channels_redis` for multi-process deployments
- Replace SQLite with PostgreSQL
- Serve with `daphne config.asgi:application` instead of `manage.py runserver`
- Set `DEBUG=False` and a proper `SECRET_KEY` in environment variables
