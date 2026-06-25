# RDM Scavenger Hunt

A browser-based educational game teaching Research Data Management (RDM) best practices through a faithful recreation of the Classic Mac OS (System 7) desktop. Players inherit a deliberately broken fake research project, explore its files, and right-click anything that looks wrong to report an RDM violation. Each correct find reveals a full explanation drawn from the original workshop answer key.

Designed as a hands-on companion to the Lib4RI **Basics of Research Data Management** workshop.

---

## How it works

When you open the game you are placed at a System 7 Finder desktop. A project folder window is already open, showing 24 files from a fictional alpine soil study — every one of them violating at least one RDM principle.

- **Right-click** (or long-press on touch) any file icon to open a context menu.
- Choose **Report a RDM problem** to flag the file. If correct, a dialog explains what is wrong, why it matters, and how to fix it.
- **Double-click** a file to open it in a viewer (CSV table, code with line numbers, hex dump for binaries, etc.) and right-click individual cells or lines to find subtler violations.
- Right-click **empty space** in the folder or on the desktop, then choose **Report missing artifact** to flag things that should be there but aren't — a README, a license, a DOI, a backup plan.
- A sticky-note checklist in the corner tracks your 13 finds. Wrong guesses increment a counter but never block you.
- When all 13 are found, pixelated fireworks play and you are offered a downloadable copy of the full answer key.

Progress is saved to `localStorage` automatically. The Apple menu has a **Reset Game** option if you want to start over.

---

## Prerequisites

| Requirement | Version |
|-------------|---------|
| Node.js | 18 or later |
| npm | 9 or later |
| Source repo | `~/PANTHEON/RDM_BASICS` on the local machine |
| Icon repo | `~/PANTHEON/Classic-Mac-icons` on the local machine |

Both source paths are configurable via environment variables — see [Customising source paths](#customising-source-paths) below.

---

## Quick start

```bash
# 1. Clone this repository
git clone <repo-url>
cd rdm-scavenger-hunt

# 2. Install dependencies
npm install

# 3. Run the content pipeline
#    This extracts the messy project archive, parses the answer key,
#    copies icons, and writes the JSON data files the app reads at runtime.
npm run content

# 4. Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser. The game loads immediately — no login, no backend.

> **Note:** Steps 3 and 4 are separate because the dev server does not run the content pipeline automatically. You only need to re-run `npm run content` if the source materials change.

---

## Production build

```bash
npm run build
```

`npm run build` runs the content pipeline first (`prebuild` hook), then Vite bundles everything into `dist/`. The folder is entirely self-contained — copy it to any static host and it works.

```bash
# Preview the production build before deploying
npm run preview
```

### Deploying

The `dist/` directory can be served from any static host with no configuration:

| Host | How |
|------|-----|
| **GitHub Pages** | Push `dist/` to your `gh-pages` branch, or point Pages at `/dist` |
| **Netlify / Vercel** | Set the publish directory to `dist` and build command to `npm run build` |
| **nginx / Apache** | Copy `dist/` to your web root |
| **S3 / R2** | Sync `dist/` to a bucket with static website hosting enabled |

There is no server-side rendering, no API, and no database. Every asset is a file.

---

## Customising source paths

The content pipeline reads from two locations. Override them with environment variables if your files live elsewhere:

| Variable | Default | Contents |
|----------|---------|----------|
| `RDM_SOURCE_REPO` | `~/PANTHEON/RDM_BASICS` | The tarball of the messy project (`RDM_SCAVENGER_HUNT/sample_messy_project.tar.gz`) and the answer key (`.git/info/RDM_Problems_and_Fixes_Guide.md`) |
| `RDM_ICONS_DIR` | `~/PANTHEON/Classic-Mac-icons` | SVG and PNG Classic Mac icon set |

```bash
RDM_SOURCE_REPO=/path/to/RDM_BASICS \
RDM_ICONS_DIR=/path/to/icons \
npm run content
```

---

## What the content pipeline does

`scripts/build-content.mjs` runs before every production build and manually via `npm run content`. Each run:

1. **Extracts** `sample_messy_project.tar.gz` into `public/files/`, preserving filenames exactly — spaces, ampersands, parentheses and all. The broken names are evidence in the game.
2. **Walks** the extracted tree and writes `src/data/file-tree.json` — the list of all 24 files, their MIME guesses, and which icon and viewer to use for each.
3. **Parses** `RDM_Problems_and_Fixes_Guide.md` and writes `src/data/problems.json` — all 13 problem entries with their `what`, `why`, `fix`, and `resources` fields in Markdown, derived strictly from the answer key.
4. **Proposes** `src/data/mapping.json` (only on first run — the file is never overwritten once it exists). Also writes `src/data/mapping.proposal.json` on every run so you can compare.
5. **Copies** all SVGs from the icon directory into `public/icons/` and writes `public/icons/manifest.json`.
6. **Generates** `public/downloads/RDM_Guide.html` — a standalone HTML rendering of the full answer key offered as a download at the end of the game.

---

## Editing `mapping.json`

`src/data/mapping.json` is the bridge between what a player right-clicks and which problem ID that reveals. It is generated once, then **protected from overwrite** so you can refine it without your edits being stomped.

```jsonc
{
  "problems": [
    {
      "id": "file-naming",
      "triggers": [
        { "type": "file",  "path": "soil samples.xlsx" },
        { "type": "file",  "path": "cleaned data.xlsx" }
      ],
      "matchRule": "any"
    },
    {
      "id": "no-metadata",
      "triggers": [
        { "type": "cell", "path": "soil_samples_preview.csv", "row": 2, "col": 1 }
      ],
      "matchRule": "any"
    }
  ]
}
```

### Trigger types

| Type | When it fires | Required fields |
|------|---------------|-----------------|
| `file` | Right-clicking a file icon | `path` — the bare filename (e.g. `"soil samples.xlsx"`) |
| `cell` | Right-clicking a cell inside the CSV or XLSX viewer | `path`, `row` (0-indexed from top of file), `col` (0-indexed) |
| `line` | Right-clicking a line inside the text/code viewer | `path`, `line` (1-indexed) |
| `project-absence` | Choosing an item from the "Report missing artifact" submenu | `name` — must match one of: `README`, `LICENSE`, `Data availability statement`, `DOI`, `Backup plan` |
| `desktop` | Right-clicking empty space in the folder window or desktop background | *(no extra fields)* |

`matchRule: "any"` means **any one** matching trigger marks the problem as found. This is the only supported value; there is no "all" mode.

To reset `mapping.json` to the latest auto-proposal:

```bash
rm src/data/mapping.json && npm run content
```

After hand-editing, compare your file against `src/data/mapping.proposal.json` to see what the auto-detection would have suggested.

---

## Project structure

```
rdm-scavenger-hunt/
├── public/
│   ├── files/                   # extracted messy project (24 files, verbatim names)
│   ├── icons/                   # SVG icons + manifest.json
│   ├── downloads/               # RDM_Guide.html — offered as download at game end
│   ├── fonts/                   # empty — add font files here for offline use
│   └── sounds/                  # empty — sounds are generated via Web Audio API
├── src/
│   ├── components/
│   │   ├── Desktop.tsx          # desktop area, folder view, window rendering
│   │   ├── MenuBar.tsx          # top menu bar with Apple menu
│   │   ├── Window.tsx           # generic draggable, focusable window chrome
│   │   ├── FileIcon.tsx         # individual file icon with right-click / long-press
│   │   ├── ContextMenu.tsx      # right-click menu with Report / Report missing
│   │   ├── StickyNote.tsx       # 13-item checklist, top-left of desktop
│   │   ├── WelcomeDialog.tsx    # first-load instructions
│   │   ├── ProblemReportDialog.tsx  # shown on correct find (tabbed: what / why / fix)
│   │   ├── WrongGuessDialog.tsx # shown on wrong guess or already-found repeat
│   │   ├── CompletionDialog.tsx # shown after all 13 found
│   │   ├── Fireworks.tsx        # pixel canvas animation on completion
│   │   └── viewers/
│   │       ├── TextViewer.tsx   # .txt .py .md — line-by-line with right-click
│   │       ├── CsvViewer.tsx    # .csv — table with right-clickable cells
│   │       ├── XlsxViewer.tsx   # .xlsx — SheetJS parse, same table UI, sheet tabs
│   │       ├── ImageViewer.tsx  # .jpg .png — centred image, right-click for format issues
│   │       └── BinaryViewer.tsx # .dat .docx — text preview + hex dump
│   ├── data/
│   │   ├── problems.json        # GENERATED — do not hand-edit
│   │   ├── file-tree.json       # GENERATED — do not hand-edit
│   │   ├── mapping.json         # generated on first run, then HAND-EDIT to refine
│   │   └── mapping.proposal.json # GENERATED every run — compare against mapping.json
│   ├── lib/
│   │   ├── matchTrigger.ts      # maps a right-click target to a problem ID
│   │   ├── persistence.ts       # localStorage read/write
│   │   ├── longPress.ts         # touch long-press hook (500 ms threshold)
│   │   ├── windowManager.ts     # z-order and drag clamping utilities
│   │   └── sounds.ts            # procedural chime / bonk / fanfare via Web Audio API
│   ├── styles/
│   │   ├── reset.css            # minimal reset
│   │   ├── fonts.css            # font-family custom properties
│   │   └── mac.css              # all System 7 chrome: title bars, dialogs, menus, icons
│   ├── types.ts                 # shared TypeScript interfaces
│   ├── GameContext.tsx          # global state — useReducer + localStorage persistence
│   ├── App.tsx                  # root component, overlays, completion sequence
│   └── main.tsx                 # React entry point
├── scripts/
│   └── build-content.mjs        # content pipeline (runs before every build)
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## Font

The game uses **Press Start 2P** by CodeMan38, licensed under the Open Font License (OFL 1.1). It is loaded from the Google Fonts CDN, so an internet connection is required in development and in production unless you self-host it.

**To host the font locally (for offline or air-gapped use):**

1. Download `PressStart2P-Regular.woff2` from [Google Fonts](https://fonts.google.com/specimen/Press+Start+2P)
2. Place it at `public/fonts/PressStart2P.woff2`
3. Download the [OFL license](https://scripts.sil.org/OFL) and save it as `public/fonts/OFL.txt`
4. Uncomment the `@font-face` block in `src/styles/fonts.css`
5. Remove the two `<link>` tags for Google Fonts in `index.html`

---

## Sounds

All sounds are generated at runtime using the Web Audio API — a short ascending chime on correct finds, a low thud on wrong guesses, and a five-note fanfare on completion. No external audio files are needed. The **Mute/Unmute** toggle in the Apple menu persists to `localStorage`.

---

## Troubleshooting

**`npm run content` fails with "Tarball not found"**
The script is looking for the source archive at the default path. Set `RDM_SOURCE_REPO` to the correct location:
```bash
RDM_SOURCE_REPO=/path/to/your/RDM_BASICS npm run content
```

**`npm run content` fails with "Icons dir not found"**
Set `RDM_ICONS_DIR` to point at your clone of the icon repository:
```bash
RDM_ICONS_DIR=/path/to/Classic-Mac-icons npm run content
```

**`npm run dev` starts but the game shows an empty folder window**
The content pipeline has not run yet. Stop the server, run `npm run content`, then restart with `npm run dev`.

**Fonts look wrong or fall back to system monospace**
The CDN link in `index.html` requires internet access. Either connect to the internet or self-host the font following the steps in the [Font](#font) section above.

**Progress resets every time**
Check that `localStorage` is enabled in your browser and that the site is not in private/incognito mode. You can also check the stored state in the browser console:
```js
JSON.parse(localStorage.getItem('rdm-scavenger-hunt:v1'))
```

---

## npm scripts

| Script | What it does |
|--------|--------------|
| `npm run content` | Runs the content pipeline (extract, parse, copy, generate JSON) |
| `npm run dev` | Starts the Vite dev server at http://localhost:5173 |
| `npm run build` | Runs content pipeline then produces `dist/` for deployment |
| `npm run preview` | Serves the production `dist/` locally for final checks |
| `npm run typecheck` | Runs `tsc --noEmit` without building |

---

## License

| Component | License |
|-----------|---------|
| Game source code | MIT |
| Press Start 2P font | OFL 1.1 (CodeMan38) |
| Classic Mac OS icons | Recreations — no explicit license in source repo; use for educational purposes |
| RDM answer key content | © Lib4RI — Basics of Research Data Management workshop |
