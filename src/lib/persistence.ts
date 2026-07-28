import type { PersistedState } from '../types';

// Bumped to v3 when the problem set was restructured (versioning rescoped to
// files, a "File/folder organization" problem added, a new data-quality issue).
// Older saves reference retired problem ids, so they're discarded on load.
const STORAGE_KEY = 'rdm-scavenger-hunt:v3';

export function loadState(): PersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Validate minimum shape — reject states from incompatible older versions
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
    // Storage quota exceeded or private mode — ignore
  }
}

export function clearState(): void {
  localStorage.removeItem(STORAGE_KEY);
}
