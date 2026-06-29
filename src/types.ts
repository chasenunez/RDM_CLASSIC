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
  viewerType: 'folder' | 'text' | 'csv' | 'xlsx' | 'image' | 'binary' | 'markdown' | 'fix';
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
  name: string; // e.g. "README", "LICENSE", ".git"
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
}

export interface Mapping {
  problems: MappedProblem[];
}

// ── Context menu target ───────────────────────────────────────────────────────

export type ContextTarget =
  | { kind: 'file'; path: string }
  | { kind: 'cell'; path: string; row: number; col: number }
  | { kind: 'line'; path: string; line: number }
  | { kind: 'desktop' }
  | { kind: 'absence'; name: string };

export interface ContextMenuState {
  x: number;
  y: number;
  target: ContextTarget;
}

// ── Window types ──────────────────────────────────────────────────────────────

export type ViewerType = 'folder' | 'text' | 'csv' | 'xlsx' | 'image' | 'binary' | 'trash' | 'markdown' | 'fix' | 'archive';

export interface WindowState {
  id: string;
  title: string;
  viewerType: ViewerType;
  filePath?: string;      // relative name within sample_project/, or undefined for folder
  problemId?: string;     // set for fix windows
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
}

// ── Persisted game state ──────────────────────────────────────────────────────

export interface PersistedState {
  foundProblems: string[];   // main problem IDs + sub-problem IDs
  fixedProblems: string[];   // problem IDs where "Let's fix it" was clicked
  wrongGuesses: number;
  hasSeenWelcome: boolean;
  isMuted: boolean;
  openWindows: WindowState[];
  nextZIndex: number;
}
