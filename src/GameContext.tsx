import React, { createContext, useContext, useReducer, useState, useEffect, useCallback } from 'react';
import type {
  Problem,
  FileEntry,
  Mapping,
  PersistedState,
  WindowState,
  ContextMenuState,
  ContextTarget,
  ViewerType,
} from './types';
import problemsData from './data/problems.json';
import fileTreeData from './data/file-tree.json';
import mappingData from './data/mapping.json';
import { loadState, saveState } from './lib/persistence';
import { matchTrigger } from './lib/matchTrigger';
import { playChime, playBonk, playFanfare } from './lib/sounds';

// ── Typed data from generated JSON ───────────────────────────────────────

const problems = problemsData as Problem[];
const fileTree = fileTreeData as FileEntry[];
const mapping = mappingData as Mapping;

// ── Default state ─────────────────────────────────────────────────────────

const DEFAULT_STATE: PersistedState = {
  foundProblems: [],
  wrongGuesses: 0,
  hasSeenWelcome: false,
  isMuted: false,
  openWindows: [
    // Project folder window — open by default, positioned slightly right of center
    {
      id: 'project-folder',
      title: 'sample_project',
      viewerType: 'folder',
      x: 535,
      y: 80,
      width: 800,
      height: 600,
      zIndex: 1,
    },
  ],
  nextZIndex: 2,
};

// ── Reducer ───────────────────────────────────────────────────────────────

type Action =
  | { type: 'FIND_PROBLEM'; id: string }
  | { type: 'WRONG_GUESS' }
  | { type: 'DISMISS_WELCOME' }
  | { type: 'SHOW_WELCOME' }
  | { type: 'OPEN_WINDOW'; window: Omit<WindowState, 'zIndex'> }
  | { type: 'CLOSE_WINDOW'; id: string }
  | { type: 'FOCUS_WINDOW'; id: string }
  | { type: 'MOVE_WINDOW'; id: string; x: number; y: number }
  | { type: 'TOGGLE_MUTE' }
  | { type: 'RESET' };

function reducer(state: PersistedState, action: Action): PersistedState {
  switch (action.type) {
    case 'FIND_PROBLEM':
      return {
        ...state,
        foundProblems: state.foundProblems.includes(action.id)
          ? state.foundProblems
          : [...state.foundProblems, action.id],
      };

    case 'WRONG_GUESS':
      return { ...state, wrongGuesses: state.wrongGuesses + 1 };

    case 'DISMISS_WELCOME':
      return { ...state, hasSeenWelcome: true };

    case 'SHOW_WELCOME':
      return { ...state, hasSeenWelcome: false };

    case 'OPEN_WINDOW': {
      // If a window for this file is already open, just bring it to front
      const exists = state.openWindows.find(w => w.id === action.window.id);
      if (exists) {
        return {
          ...state,
          openWindows: state.openWindows.map(w =>
            w.id === action.window.id ? { ...w, zIndex: state.nextZIndex } : w,
          ),
          nextZIndex: state.nextZIndex + 1,
        };
      }
      return {
        ...state,
        openWindows: [
          ...state.openWindows,
          { ...action.window, zIndex: state.nextZIndex },
        ],
        nextZIndex: state.nextZIndex + 1,
      };
    }

    case 'CLOSE_WINDOW':
      return {
        ...state,
        openWindows: state.openWindows.filter(w => w.id !== action.id),
      };

    case 'FOCUS_WINDOW':
      return {
        ...state,
        openWindows: state.openWindows.map(w =>
          w.id === action.id ? { ...w, zIndex: state.nextZIndex } : w,
        ),
        nextZIndex: state.nextZIndex + 1,
      };

    case 'MOVE_WINDOW':
      return {
        ...state,
        openWindows: state.openWindows.map(w =>
          w.id === action.id ? { ...w, x: action.x, y: action.y } : w,
        ),
      };

    case 'TOGGLE_MUTE':
      return { ...state, isMuted: !state.isMuted };

    case 'RESET':
      return { ...DEFAULT_STATE, hasSeenWelcome: false };

    default:
      return state;
  }
}

// ── Context type ──────────────────────────────────────────────────────────

interface GameContextType {
  // Persisted state
  gameState: PersistedState;
  dispatch: React.Dispatch<Action>;

  // Transient UI state (not persisted)
  contextMenu: ContextMenuState | null;
  activeProblem: Problem | null;
  showWrong: boolean;
  alreadyFoundName: string | null; // non-null → show already-found dialog

  // Static data
  problems: Problem[];
  fileTree: FileEntry[];
  mapping: Mapping;

  // Actions
  openFile: (entry: FileEntry) => void;
  showContextMenu: (menu: ContextMenuState) => void;
  hideContextMenu: () => void;
  handleReportProblem: (target: ContextTarget) => void;
  handleReportAbsence: (name: string) => void;
  dismissProblemDialog: () => void;
  dismissWrongDialog: () => void;
  dismissAlreadyFound: () => void;
}

const GameContext = createContext<GameContextType | null>(null);

export function useGame(): GameContextType {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}

// ── Provider ──────────────────────────────────────────────────────────────

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [gameState, dispatch] = useReducer(reducer, loadState() ?? DEFAULT_STATE);

  // Persist to localStorage whenever gameState changes
  useEffect(() => {
    saveState(gameState);
  }, [gameState]);

  // Transient UI state
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [activeProblem, setActiveProblem] = useState<Problem | null>(null);
  const [showWrong, setShowWrong] = useState(false);
  const [alreadyFoundName, setAlreadyFoundName] = useState<string | null>(null);

  const showContextMenu = useCallback((menu: ContextMenuState) => {
    setContextMenu(menu);
  }, []);

  const hideContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  const openFile = useCallback(
    (entry: FileEntry) => {
      const viewerType: ViewerType = entry.viewerType as ViewerType;
      const windowId = `file:${entry.name}`;
      // Stagger new windows slightly so they don't exactly overlap
      const offset = (gameState.openWindows.length % 5) * 20;
      dispatch({
        type: 'OPEN_WINDOW',
        window: {
          id: windowId,
          title: entry.name,
          viewerType,
          filePath: entry.name,
          x: 240 + offset,
          y: 50 + offset,
          width: viewerType === 'image' ? 400 : 520,
          height: viewerType === 'image' ? 360 : 340,
        },
      });
    },
    [gameState.openWindows.length],
  );

  // Core game logic: given a right-click target, try to match to a problem
  const handleReportProblem = useCallback(
    (target: ContextTarget) => {
      setContextMenu(null);
      const matchedId = matchTrigger(target, mapping);

      if (!matchedId) {
        dispatch({ type: 'WRONG_GUESS' });
        setShowWrong(true);
        if (!gameState.isMuted) playBonk();
        return;
      }

      if (gameState.foundProblems.includes(matchedId)) {
        const p = problems.find(p => p.id === matchedId);
        setAlreadyFoundName(p?.name ?? matchedId);
        return;
      }

      dispatch({ type: 'FIND_PROBLEM', id: matchedId });
      const found = problems.find(p => p.id === matchedId) ?? null;
      setActiveProblem(found);
      if (!gameState.isMuted) {
        const allFound = gameState.foundProblems.length + 1 >= problems.length;
        allFound ? playFanfare() : playChime();
      }
    },
    [gameState.foundProblems, gameState.isMuted, mapping],
  );

  // Convenience for the "Report missing artifact" submenu
  const handleReportAbsence = useCallback(
    (name: string) => {
      handleReportProblem({ kind: 'absence', name });
    },
    [handleReportProblem],
  );

  const dismissProblemDialog = useCallback(() => setActiveProblem(null), []);
  const dismissWrongDialog = useCallback(() => setShowWrong(false), []);
  const dismissAlreadyFound = useCallback(() => setAlreadyFoundName(null), []);

  const value: GameContextType = {
    gameState,
    dispatch,
    contextMenu,
    activeProblem,
    showWrong,
    alreadyFoundName,
    problems,
    fileTree,
    mapping,
    openFile,
    showContextMenu,
    hideContextMenu,
    handleReportProblem,
    handleReportAbsence,
    dismissProblemDialog,
    dismissWrongDialog,
    dismissAlreadyFound,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
