/**
 * theme.ts — central place for AESTHETIC / LAYOUT choices.
 *
 * Change things here to re-skin the game without hunting through components:
 *   • WINDOWS  — default size of each kind of window
 *   • ASSETS   — image paths for the desktop background and desktop icons
 *   • LABELS   — the project's display name
 *
 * Other aesthetics live in dedicated files:
 *   • Colours / chrome → src/styles/mac.css  (see the :root palette at the top)
 *   • Fonts            → src/styles/fonts.css (--font-pixel / --font-mono)
 *   • File icons in the folder view → the `icon` field in src/data/file-tree.json
 */

/** Default width/height for each window type, in px. */
export const WINDOWS = {
  projectFolder:   { width: 800, height: 600 },
  fileViewer:      { width: 540, height: 360 },
  fileViewerImage: { width: 400, height: 360 },
  fixWindow:       { width: 560, height: 420 },
  trash:           { width: 360, height: 280 },
  subfolder:       { width: 600, height: 400 },
  archive:         { width: 600, height: 400 },
} as const;

/** Image paths (served from public/). Swap these to change the logo / icons. */
export const ASSETS = {
  desktopBackgroundLogo: '/assets/LDW_DIGITAL_LIB4RI.png',
  projectIcon:           '/icons/Floppy.png',
  trashIcon:             '/icons/Trash.png',
} as const;

export const LABELS = {
  projectWindowTitle: 'Side Project 237 B',
  // Desktop icon label matches the window title so they read as the same item.
  projectIconLabel:   'Side Project 237 B',
} as const;
