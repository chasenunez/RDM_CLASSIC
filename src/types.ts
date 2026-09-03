// ── Data types (loaded from generated JSON) ───────────────────────────────────

export interface Resource {
  title: string;
  url: string;
}

export interface SubProblem {
  id: string;
  name: string;
  what: string;
  why: string;
  fix: string;
  resources: Resource[];
}

export interface Problem {
  id: string;
  name: string;          // short checklist label, e.g. "File naming"
  fullTitle: string;     // e.g. "Bad File Naming"
  what: string;          // markdown
  why: string;           // markdown
  fix: string;           // markdown
  resources: Resource[];
  subProblems?: SubProblem[];  // boss-battle sub-items
}

export interface FileEntry {
  path: string;          // relative to public/files/, e.g. "sample_project/soil samples.xlsx"
  name: string;          // just the filename
  type: 'file' | 'folder';
  size: number;
  mimeGuess: string;
  icon: string;          // URL path, e.g. "/icons/Text file.svg"
  viewerType: 'folder' | 'text' | 'csv' | 'xlsx' | 'image' | 'binary' | 'markdown' | 'subfolder';
  virtual?: boolean;     // true = added by fix logic, not in original file tree
}

// ── Trigger / mapping types ───────────────────────────────────────────────────

export interface FileTrigger {
  type: 'file';
  path: string;
}

export interface CellTrigger {
  type: 'cell';
  path: string;
  row: number;
  col: number;
}

export interface LineTrigger {
  type: 'line';
  path: string;
  line: number; // 1-indexed
}

export interface AbsenceTrigger {
  type: 'project-absence';
  name: string;   // stable id for the missing thing, e.g. "README.md", ".git", "folders"
  label: string;  // how it reads in the "Report something missing" menu
}

export interface DesktopTrigger {
  type: 'desktop';
}

export type Trigger = FileTrigger | CellTrigger | LineTrigger | AbsenceTrigger | DesktopTrigger;

export interface MappedProblem {
  id: string;
  triggers: Trigger[];
  matchRule: 'any';
  parentId?: string;  // set for boss-battle sub-problems
  // Free-text note for whoever hand-edits mapping.json. Ignored at runtime;
  // it exists so the reasoning behind a trigger set lives beside the triggers.
  comment?: string;
}

/**
 * A red herring in the "Report something missing" menu: something a good
 * project needs that this one already has. Reporting it is a wrong guess, and
 * `present` says where to find the thing the player claimed was absent.
 */
export interface MissingArtifactDecoy {
  name: string;
  label: string;
  present: string;
}

export interface Mapping {
  problems: MappedProblem[];
  missingArtifactDecoys?: MissingArtifactDecoy[];
}

// ── Learn mode ────────────────────────────────────────────────────────────────

/**
 * Which half of the app the player chose at startup. "test" is the original
 * scavenger hunt: find the problems yourself and get scored. "learn" walks a
 * beginner through the same ten problems in a deliberate order, explaining each
 * before fixing it, with nothing to guess and nothing to get wrong.
 */
export type GameMode = 'learn' | 'test';

/** What the player has to click to reach a step's lesson. */
export type LearnTarget =
  | { kind: 'file'; path: string }
  | { kind: 'trash' };

/**
 * One stop on a guided tour through a file. Either it carries its own text, or
 * it `ref`s a sub-problem in problems.json so the wording is not duplicated.
 * `cells` and `lines` say what to highlight while the stop is on screen.
 */
export interface TourStop {
  id: string;
  ref?: string;                 // sub-problem id in problems.json
  name?: string;
  what?: string;
  why?: string;
  cells?: [number, number][];   // [row, col] pairs, for spreadsheets
  lines?: number[];             // 1-indexed, for code
}

export interface LearnStep {
  problemId: string;            // the problem in problems.json this teaches
  instruction: string;          // what the coach tells the player to do
  target?: LearnTarget;         // what they click; absent means "just read"
  note?: string;                // learn-only framing, markdown
  resources?: Resource[];       // learn-only links, added to the problem's own
  /** "subProblems" reuses the problem's sub-problems; an array is explicit. */
  tour?: 'subProblems' | TourStop[];
}

export interface LearnTier {
  id: string;
  title: string;
  intro: string;                // why this group comes where it does
  steps: LearnStep[];
}

export interface LearnPath {
  comment?: string;
  tiers: LearnTier[];
}

// ── Context menu target ───────────────────────────────────────────────────────

// What a right-click landed on. Empty space is 'desktop'; the missing-artifact
// menu it opens reports by artifact name instead of through a context target,
// so there is no 'absence' variant here.
export type ContextTarget =
  | { kind: 'file'; path: string }
  | { kind: 'cell'; path: string; row: number; col: number }
  | { kind: 'line'; path: string; line: number }
  | { kind: 'desktop' };

export interface ContextMenuState {
  x: number;
  y: number;
  target: ContextTarget;
}

// ── Window types ──────────────────────────────────────────────────────────────

export type ViewerType = 'folder' | 'text' | 'csv' | 'xlsx' | 'image' | 'binary' | 'trash' | 'markdown' | 'archive' | 'subfolder' | 'gif';

export interface WindowState {
  id: string;
  title: string;
  viewerType: ViewerType;
  filePath?: string;      // relative name within sample_project/, or undefined for folder
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
}

// ── Persisted game state ──────────────────────────────────────────────────────

export interface PersistedState {
  /** null until the player picks Learn or Test on the title screen. */
  mode: GameMode | null;
  /** How far through the learn-mode curriculum they are. Ignored in test mode. */
  learnStep: number;
  foundProblems: string[];   // main problem IDs + sub-problem IDs
  fixedProblems: string[];   // problem IDs where "Let's fix it" was clicked
  wrongGuesses: number;
  hasSeenTitle: boolean;     // dismissed the title slide (click-to-start)
  hasSeenWelcome: boolean;
  hasOpenedTrash: boolean;   // stops the Trash nudging once the player has looked
  isMuted: boolean;
  openWindows: WindowState[];
  nextZIndex: number;
}
