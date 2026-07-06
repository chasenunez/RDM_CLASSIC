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

import { asset } from './lib/asset';

/** Default width/height for each window type, in px. */
export const WINDOWS = {
  projectFolder:   { width: 800, height: 600 },
  fileViewer:      { width: 540, height: 360 },
  fileViewerImage: { width: 400, height: 360 },
  fixWindow:       { width: 560, height: 420 },
  trash:           { width: 360, height: 280 },
  subfolder:       { width: 600, height: 400 },
  archive:         { width: 600, height: 400 },
  gif:             { width: 420, height: 340 },
} as const;

/**
 * Easter-egg animated GIFs that live in the Trash. Click one to pop it open
 * in its own window where it plays. Add/remove entries here to change them.
 */
export const TRASH_GIFS = [
  { id: 'flying-toasters', label: 'FlyingToasters.gif', src: asset('/assets/FlyingToasters.gif') },
  { id: 'seal',            label: 'seal.gif',           src: asset('/assets/seal.gif') },
] as const;

/** Image paths (served from public/). Swap these to change the logo / icons. */
export const ASSETS = {
  desktopBackgroundLogo: asset('/assets/LDW_DIGITAL_LIB4RI.png'),
  projectIcon:           asset('/icons/Floppy.png'),
  trashIcon:             asset('/icons/Trash.png'),
} as const;

export const LABELS = {
  projectWindowTitle: 'Side Project 237 B',
  // Desktop icon label matches the window title so they read as the same item.
  projectIconLabel:   'Side Project 237 B',
} as const;
