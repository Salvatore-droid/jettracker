export interface RoutePoint {
  order: number;
  lat: number;
  lng: number;
}

export interface FlightEvent {
  id: number;
  timestamp: string;
  event_type: string;
  message: string;
  lat: number | null;
  lng: number | null;
}

export type FlightStatus =
  | 'scheduled'
  | 'taxiing'
  | 'airborne'
  | 'cruising'
  | 'descending'
  | 'landed';

export interface Jet {
  id: string;
  callsign: string;
  registration: string;
  aircraft_type: string;
  origin_name: string;
  destination_name: string;
  origin_iata: string;
  destination_iata: string;
  status: FlightStatus;
  progress: number;
  current_lat: number | null;
  current_lng: number | null;
  altitude_ft: number;
  speed_kts: number;
  heading: number;
  simulation_speed: number;
  is_playing: boolean;
  route_points: RoutePoint[];
  events: FlightEvent[];
  created_at: string;
  updated_at: string;
}

export interface PresetRoute {
  callsign: string;
  registration: string;
  aircraft_type: string;
  origin_name: string;
  destination_name: string;
  origin_iata: string;
  destination_iata: string;
  route_points: { order: number; lat: number; lng: number }[];
}

export type TickData = {
  progress: number;
  lat: number;
  lng: number;
  altitude_ft: number;
  speed_kts: number;
  heading: number;
  status: FlightStatus;
};
