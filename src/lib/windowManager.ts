import type { WindowState } from '../types';

/** Return the window with the highest z-index (the one on top). */
export function topWindow(windows: WindowState[]): WindowState | null {
  if (!windows.length) return null;
  return windows.reduce((top, w) => (w.zIndex > top.zIndex ? w : top));
}

/** Check if a given window ID is the topmost focused window. */
export function isFocused(id: string, windows: WindowState[]): boolean {
  const top = topWindow(windows);
  return top?.id === id;
}

/**
 * Clamp a window position so it stays on screen.
 * Accounts for the 20px menu bar at the top.
 */
export function clampPosition(
  x: number,
  y: number,
  width: number,
): { x: number; y: number } {
  const MENU_BAR_H = 20;
  const viewW = window.innerWidth;
  const viewH = window.innerHeight;

  // Keep at least 40px of the title bar visible so user can still grab it
  const clampedX = Math.max(-width + 40, Math.min(viewW - 40, x));
  const clampedY = Math.max(MENU_BAR_H, Math.min(viewH - 20, y));
  return { x: clampedX, y: clampedY };
}
