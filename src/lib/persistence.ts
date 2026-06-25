import type { PersistedState } from '../types';

const STORAGE_KEY = 'rdm-scavenger-hunt:v1';

export function loadState(): PersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedState;
  } catch {
    return null;
  }
}

export function saveState(state: PersistedState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage quota exceeded or private mode — ignore
  }
}

export function clearState(): void {
  localStorage.removeItem(STORAGE_KEY);
}
