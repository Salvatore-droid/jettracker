import axios from 'axios';
import type { Jet, PresetRoute } from './types';

const BASE = 'http://localhost:8000/api';
const api = axios.create({ baseURL: BASE });

export const getJets = () => api.get<Jet[]>('/jets/');
export const getJet = (id: string) => api.get<Jet>(`/jets/${id}/`);
export const deleteJet = (id: string) => api.delete(`/jets/${id}/delete/`);
export const getPresets = () => api.get<PresetRoute[]>('/jets/presets/');

export const createJet = (data: PresetRoute) =>
  api.post<Jet>('/jets/create/', data);

export const controlJet = (
  id: string,
  action: 'play' | 'pause' | 'reset' | 'jump' | 'set_speed',
  extra?: { progress?: number; simulation_speed?: number }
) => api.post<Jet>(`/jets/${id}/control/`, { action, ...extra });

export const tickJet = (id: string) =>
  api.post(`/jets/${id}/tick/`);

export const WS_BASE = 'ws://localhost:8000/ws/jet';
