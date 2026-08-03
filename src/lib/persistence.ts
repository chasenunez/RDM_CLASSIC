import type { PersistedState } from '../types';

// Bumped to v4 when "File/folder organization" was split into a folder-layout
// problem and a separate "Version control" problem, and the end-of-game
// file-structure step was retired. Older saves reference ids that no longer
// mean the same thing, so they're discarded on load.
const STORAGE_KEY = 'rdm-scavenger-hunt:v4';

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
