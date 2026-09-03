import type { PersistedState } from '../types';

// Bumped to v5 when learn mode arrived and PersistedState gained `mode` and
// `learnStep`. Older saves have neither and no idea which mode they belong
// to, so they are discarded rather than guessed at.
const STORAGE_KEY = 'rdm-scavenger-hunt:v5';

export function loadState(): PersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Validate minimum shape: reject states from incompatible older versions
    if (
      !Array.isArray(parsed.foundProblems) ||
      !Array.isArray(parsed.openWindows) ||
      typeof parsed.hasSeenWelcome !== 'boolean'
    ) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    // Default fields added in later versions so older saves stay valid.
    if (typeof parsed.hasSeenTitle !== 'boolean') parsed.hasSeenTitle = false;
    if (typeof parsed.hasOpenedTrash !== 'boolean') parsed.hasOpenedTrash = false;
    if (parsed.mode !== 'learn' && parsed.mode !== 'test') parsed.mode = null;
    if (typeof parsed.learnStep !== 'number') parsed.learnStep = 0;
    return parsed as PersistedState;
  } catch {
    return null;
  }
}

export function saveState(state: PersistedState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage quota exceeded or private mode, ignore
  }
}

export function clearState(): void {
  localStorage.removeItem(STORAGE_KEY);
}
