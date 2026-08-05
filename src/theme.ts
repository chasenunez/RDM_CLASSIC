/**
 * theme.ts: central place for AESTHETIC / LAYOUT choices.
 *
 * Change things here to re-skin the game without hunting through components:
 *   • WINDOWS: default size of each kind of window
 *   • ASSETS: image paths for the desktop background and desktop icons
 *   • LABELS: the project's display name and UI command names
 *
 * Other aesthetics live in dedicated files:
 *   • Colours / chrome → src/styles/mac.css  (see the :root palette at the top)
 *   • Fonts            → src/styles/fonts.css (--font-pixel / --font-mono)
 *   • File icons in the folder view → the `icon` field in src/data/file-tree.json
 */

import { asset } from './lib/asset';

/**
 * Default width/height for each window type, in px. The project-folder
 * window is sized dynamically instead; see computeProjectFolderLayout().
 */
export const WINDOWS = {
  fileViewer:      { width: 540, height: 360 },
  fileViewerImage: { width: 400, height: 360 },
  trash:           { width: 540, height: 360 },
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
  { id: 'surf',            label: 'surf.gif',           src: asset('/assets/seal.gif') },
  { id: 'scan',            label: 'scan.png',           src: asset('/assets/scan.png') },
] as const;

/** Image paths (served from public/). Swap these to change the logo / icons. */
export const ASSETS = {
  desktopBackgroundLogo: asset('/assets/LDW_DIGITAL_LIB4RI.png'),
  // Hero art for the opening title slide (click-to-start). Placeholder for now:
  // swap public/assets/title_hero.png for the final artwork.
  titleHero:             asset('/assets/title_hero.png'),
  // Desktop project icon: "on fire" while problems remain, calms down to a
  // plain folder once the player has fixed everything.
  projectIconActive:     asset('/assets/folder_fire.png'),
  projectIconComplete:   asset('/assets/folder.png'),
  trashIcon:             asset('/assets/trash.png'),
  lib4rilogo:            asset('/assets/lib4riblank.png'),
  // Buddy-list portraits for the welcome chat. The player's is original pixel
  // art rather than a stock image, so it ships under the project's own licence.
  chatAvatarSender:      asset('/assets/lib4riblank.png'),
  chatAvatarPlayer:      asset('/assets/pixel_avatar.svg'),
} as const;

/**
 * The buddy list in the welcome chat. Decorative, so the names are the joke:
 * period screen-name punctuation, and most of them are an RDM sin the player is
 * about to go and find. Edit freely, nothing reads these but the chat window.
 */
export const CHAT_CONTACTS = {
  online: [
    'Lib4RI',
    '~*LUV_D4t4*~',
  ],
  offline: [
    'xXx_DARK_UNICORN_xXx',
    'Reviewer_two_much',
    'ctrl_alt_defeat',
    'iLL_b4ckup_2moro',
    'Dr_Keller_PI',
  ],
} as const;

export const LABELS = {
  projectWindowTitle: 'Side Project 237 B',
  // Desktop icon label matches the window title so they read as the same item.
  projectIconLabel:   'Side Project 237 B',
  // The two report commands. Kept here because the welcome chat, the Rules
  // dialog, and the README all quote them; when they drifted apart, the
  // instructions ended up naming a command the menu didn't have.
  reportProblem:      'Report an RDM problem…',
  // Heading over the missing-artifact list. Mirrors the problem-selection
  // dialog's "What's the problem here?", and takes no ellipsis because it names
  // the question being asked rather than a command that opens something.
  reportMissing:      "What's missing here?",
} as const;
