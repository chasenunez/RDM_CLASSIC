// Height of the System 7 menu bar (.menu-bar in mac.css). Shared so window
// centering and drag-clamping agree.
export const MENU_BAR_H = 30;

// .desktop is `position: fixed; inset: 20px 0 0 0` (mac.css) — windows are
// absolutely positioned inside it, so a window's `top` is relative to that
// 20px inset, not the viewport. Anything computing a *viewport*-relative Y
// (e.g. "N px below the menu bar") must subtract this before storing it as
// a window's y.
const DESKTOP_TOP_INSET = 20;

// Must match .window's min-width/min-height in mac.css.
export const MIN_WINDOW_WIDTH = 200;
export const MIN_WINDOW_HEIGHT = 100;

export function centeredAt(width: number, height: number, cascade = 0) {
  const vw = window.innerWidth;
  const vh = window.innerHeight - MENU_BAR_H;
  return {
    x: Math.max(0, Math.round((vw - width) / 2) + cascade),
    y: Math.max(MENU_BAR_H, MENU_BAR_H + Math.round((vh - height) / 2) + cascade),
  };
}

// Must match .sticky-note's left/width, and .desktop-icon's width plus the
// `right` offset it's positioned with (see Desktop.tsx), in mac.css.
const STICKY_NOTE_LEFT = 16;
const STICKY_NOTE_WIDTH = 300;
const DESKTOP_ICON_WIDTH = 100;
const DESKTOP_ICON_RIGHT = 16;

// Breathing room kept between the window and the sticky note / desktop
// icons, and used again as the top/bottom margin so the desktop stays
// visible above and below the window.
const CHROME_GAP = 24;

/**
 * Size and position the project-folder window so it fills the space
 * between the sticky-note checklist (top-left) and the desktop icons
 * (top-right) without overlapping either, with equal top/bottom margins so
 * the desktop wallpaper stays visible above and below it — except height is
 * capped at width (never a taller-than-wide window), which only eats into
 * the bottom margin; x, y, and width are unaffected by that cap.
 */
export function computeProjectFolderLayout(): { x: number; y: number; width: number; height: number } {
  const viewW = window.innerWidth;
  const viewH = window.innerHeight;

  const leftBound = STICKY_NOTE_LEFT + STICKY_NOTE_WIDTH + CHROME_GAP;
  const rightBound = viewW - DESKTOP_ICON_RIGHT - DESKTOP_ICON_WIDTH - CHROME_GAP;
  const width = Math.max(MIN_WINDOW_WIDTH, rightBound - leftBound);

  // Available space below the menu bar, in viewport coordinates. `y` is
  // derived from the equal-margins height so the top position doesn't shift
  // when the height cap below kicks in — any space the cap frees up is left
  // for the bottom margin only.
  const availableH = viewH - MENU_BAR_H;
  const equalMarginsHeight = Math.max(MIN_WINDOW_HEIGHT, availableH - CHROME_GAP * 2);
  const viewportY = MENU_BAR_H + Math.round((availableH - equalMarginsHeight) / 2);
  const y = viewportY - DESKTOP_TOP_INSET;

  const height = Math.min(width, equalMarginsHeight);

  return { x: Math.round(leftBound), y: Math.round(y), width: Math.round(width), height: Math.round(height) };
}
