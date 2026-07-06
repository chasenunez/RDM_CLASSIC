# RDM Scavenger Hunt

[Play a beta version here](https://chasenunez.github.io/RDM_CLASSIC/)
[Submit bugs here](https://github.com/chasenunez/RDM_CLASSIC/issues)

A browser-based educational game teaching Research Data Management (RDM) best practices through a faithful recreation of the Classic Mac OS (System 7) desktop. Players inherit a deliberately broken fake research project, explore its files, and right-click anything that looks wrong to report an RDM violation. Each correct find reveals a full explanation drawn from the original workshop answer key.

Designed as a hands-on companion to the Lib4RI **Basics of Research Data Management** workshop.

![overview_graphics](assets/rdm_classic_overview.png)

---

## How it works

When you open the game you are placed at a System 7 Finder desktop. A project folder window is already open, showing the files of a fictional alpine soil study — most of them violating at least one RDM principle.

- **Right-click** (or long-press on touch) any file icon to open a context menu.
- Choose **Report a RDM problem** to flag the file. If correct, a dialog explains what is wrong, why it matters, and how to fix it.
- **Double-click** a file to open it in a viewer (CSV table, code with line numbers, hex dump for binaries, etc.) and right-click individual cells or lines to find subtler violations.
- Right-click **empty space** in the folder or on the desktop, then choose **Report missing artifact** to flag things that should be there but aren't — a README, a license, a DOI, a backup plan.
- A sticky-note checklist in the corner tracks your finds across the 8 problem categories. Wrong guesses increment a counter but never block you.
- When every problem is found, pixelated fireworks play and you are offered a downloadable copy of the full answer key.

Progress is saved to `localStorage` automatically. The Apple menu has a **Reset Game** option if you want to start over.

---

## Prerequisites

| Requirement | Version |
|-------------|---------|
| Node.js | 18 or later |
| npm | 9 or later |

That's all — every asset the game needs is committed in this repo. There are no external source repositories or build-time downloads.

---

## Quick start

```bash
# 1. Clone this repository
git clone <repo-url>
cd rdm-scavenger-hunt

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser. The game loads immediately — no login, no backend.

> **The repo is self-contained.** All game content (`public/files/`, `public/icons/`, `public/downloads/`, `src/data/*.json`) is committed and is the source of truth. A fresh clone runs and builds with **no external files and no content-generation step**. To change the game, edit those committed files directly — see [Guide for future additions](#guide-for-future-additions).

---

## Production build

```bash
npm run build
```

`npm run build` runs Vite directly against the committed artifacts. Everything is bundled into `dist/`, which is entirely self-contained: copy it to any static host and it works.

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

## Guide for future additions

### The four moving parts

Everything the game shows and reacts to comes from four places:

| Part | Path | Role |
|------|------|------|
| **The file on disk** | `public/files/sample_project/…` | The actual bytes a viewer loads (served at `/files/sample_project/…`) |
| **The file tree** | `src/data/file-tree.json` | Makes the file appear as an icon and picks its viewer. **This is what the desktop renders — if a file isn't here, it isn't shown.** |
| **The problem** | `src/data/problems.json` | The teaching content (`what` / `why` / `fix` / `resources`) shown when the item is found |
| **The mapping** | `src/data/mapping.json` | Connects a click target (file / cell / line / absence) to a problem `id` |

A "clickable item" only counts as a finding when a **mapping trigger** matches it **and** the referenced problem `id` exists in `problems.json`. Adding a file without a trigger just creates a harmless decoy; adding a trigger whose file isn't in `file-tree.json` creates an unreachable problem (this was a real bug — `raw_data.xlsx` had a trigger but no tree entry).

### Route A: add a new file at the project root with a clickable problem

1. **Drop the file in** `public/files/sample_project/`. Keep the exact name you want shown (spaces and odd characters are fine — they're often the point).

2. **Register it in `src/data/file-tree.json`** so it renders. Add one entry; `path` is relative to `public/files/`, `name` is the bare filename:

   ```jsonc
   {
     "path": "sample_project/lab_notebook.txt",
     "name": "lab_notebook.txt",
     "type": "file",
     "size": 1234,                       // byte size; cosmetic, doesn't need to be exact
     "mimeGuess": "text/plain",
     "icon": "/icons/Text file.svg",     // any name from public/icons/ (see manifest.json)
     "viewerType": "text"
   }
   ```

   `viewerType` decides how a double-click opens it **and** which trigger types are available:

   | `viewerType` | Use for | Supports triggers |
   |--------------|---------|-------------------|
   | `text` | `.txt`, `.py`, `.r`, `.sh` | `file`, `line` |
   | `markdown` | `.md`, `.docx` (rendered) | `file` |
   | `csv` | `.csv` | `file`, `cell` |
   | `xlsx` | `.xlsx` | `file`, `cell` |
   | `image` | `.jpg`, `.png`, `.tif` | `file` |
   | `binary` | `.dat` and other opaque blobs | `file` |

3. **Make sure a problem exists** in `src/data/problems.json`. Reuse an existing `id` (e.g. `file-naming`) or add a new object:

   ```jsonc
   {
     "id": "my-new-problem",
     "name": "Short checklist label",
     "fullTitle": "My New Problem",
     "what": "Markdown explaining what's wrong.",
     "why": "Markdown explaining why it matters.",
     "fix": "Markdown explaining how to fix it.",
     "resources": [{ "title": "A helpful link", "url": "https://example.org" }]
   }
   ```

4. **Wire the click to the problem** in `src/data/mapping.json`. To make the **whole file** clickable, add a `file` trigger; for a specific cell or line, use `cell` / `line`:

   ```jsonc
   {
     "id": "my-new-problem",
     "triggers": [
       { "type": "file", "path": "lab_notebook.txt" },     // bare filename
       { "type": "line", "path": "lab_notebook.txt", "line": 4 }  // 1-indexed
     ],
     "matchRule": "any"
   }
   ```

   - `cell` triggers need `row` (0-indexed from the top of the file) and `col` (0-indexed).
   - `line` triggers need `line` (1-indexed).
   - One file can carry several triggers, and a problem can have triggers across several files.

5. **Run `npm run typecheck` and `npm run dev`**, then double-click your file and right-click the item to confirm the correct problem is revealed. The app reads these JSON files directly — there is no build or generation step to run.

### Route B: put the file in a **new location** (a subfolder)

The folder window shows root-level files plus folder icons. Files are placed into a subfolder by **name**, via the organize map — there are two ways to do it:

**B1 — a subfolder that exists from the start.** Add a `folder` entry and give the file a nested `path`. The folder name is matched by the part of `path` after `sample_project/`:

```jsonc
// in src/data/file-tree.json
{ "path": "sample_project/archive", "name": "archive/", "type": "folder",
  "size": 0, "mimeGuess": "inode/directory", "icon": "/icons/Floppy.svg", "viewerType": "folder" },
{ "path": "sample_project/archive/old_readme.txt", "name": "old_readme.txt", "type": "file",
  "size": 200, "mimeGuess": "text/plain", "icon": "/icons/Text file.svg", "viewerType": "text" }
```

Put the real file at `public/files/sample_project/archive/old_readme.txt`. Triggers still use the **bare filename** (`"path": "old_readme.txt"`), not the nested path.

**B2 — a subfolder that appears as a reward after a fix.** This is how the existing game does "organize your files." Subfolders that open on double-click are driven by `FIX_ACTIONS['file-structure'].organize` in `src/lib/fixActions.ts` — a map of `folder name → file names`. When `file-structure` is fixed, those files move into `_sub/<folder>/…` and the folder becomes openable. To add a file to an organized subfolder, add its **name** to the relevant array:

```ts
organize: {
  'data':        ['raw_data.xlsx', 'fig1_updated.png', 'my_new_data.csv'],  // ← added
  'manuscripts': [ … ],
  'code':        [ … ],
},
```

### How to make the file change after a fix

`src/lib/fixActions.ts` controls what happens to the folder view when a problem is fixed (the "Let's fix it!" flow). Each problem `id` maps to a `FixAction`:

- `remove` — filenames to hide from the folder view
- `archive` — filenames to move into the `archive/` window (must be a subset of `remove`)
- `add` — new `FileEntry` objects to display (these are **virtual** — set `virtual: true`; they're loaded from `public/files/` by path, so the file must exist on disk if it has a viewer)
- `organize` — only on `file-structure`; the subfolder map from Route B2

> A file that lives in `file-tree.json` (a base file) must **not** also appear in a fix's `add` array, or it renders twice after the fix (`computeDisplayFiles` doesn't dedupe base vs. add). Use `add` only for files that don't exist until a fix happens.

### Checklist before you commit

- [ ] File exists under `public/files/sample_project/…`
- [ ] Entry added to `src/data/file-tree.json` with the right `viewerType`
- [ ] Problem `id` exists in `src/data/problems.json`
- [ ] Trigger in `src/data/mapping.json` references the **bare filename** and a real problem `id`
- [ ] `npm run typecheck` passes and the item is findable in `npm run dev`

## Editing `mapping.json`

`src/data/mapping.json` is the bridge between what a player right-clicks and which problem ID that reveals. It is hand-edited and committed — the source of truth for every trigger.

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
| `project-absence` | Choosing an item from the "Report missing artifact" submenu | `name` — must match the `name` on a `project-absence` trigger (currently `.git`, `README`, `LICENSE.md`) |
| `desktop` | Right-clicking empty space in the folder window or desktop background | *(no extra fields)* |

`matchRule: "any"` means **any one** matching trigger marks the problem as found. This is the only supported value; there is no "all" mode.

Edit `src/data/mapping.json` directly and reload — the app reads it at runtime, so there is no regeneration step.

## Project structure

```
rdm-scavenger-hunt/
├── public/
│   ├── files/                   # the sample project files (verbatim names — served at /files/)
│   ├── icons/                   # SVG icons + manifest.json
│   ├── downloads/               # RDM_Guide.html — offered as download at game end
│   ├── fonts/                   # locally hosted Press Start 2P font
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
│   │   ├── problems.json        # SOURCE OF TRUTH — hand-edit (teaching content)
│   │   ├── file-tree.json       # SOURCE OF TRUTH — hand-edit (what the desktop shows)
│   │   ├── mapping.json         # SOURCE OF TRUTH — hand-edit (click → problem)
│   │   └── sub-problems.json    # SOURCE OF TRUTH — hand-edit (data-quality boss sub-items)
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
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## Sounds

All sounds are generated at runtime using the Web Audio API and no external audio files are used. 

## License

| Component | License |
|-----------|---------|
| Game source code | MIT |
| Press Start 2P font | OFL 1.1 (CodeMan38) |
| Classic Mac OS icons | Recreations — no explicit license in source repo; use for educational purposes |
| RDM answer key content | © Lib4RI — Basics of Research Data Management workshop |
