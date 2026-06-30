import { MENU_BAR_H } from './layout';

/**
 * Clamp a window position so it stays on screen, below the menu bar.
 */
export function clampPosition(
  x: number,
  y: number,
  width: number,
): { x: number; y: number } {
  const viewW = window.innerWidth;
  const viewH = window.innerHeight;

  // Keep at least 40px of the title bar visible so user can still grab it
  const clampedX = Math.max(-width + 40, Math.min(viewW - 40, x));
  const clampedY = Math.max(MENU_BAR_H, Math.min(viewH - 20, y));
  return { x: clampedX, y: clampedY };
}
