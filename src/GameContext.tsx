import React, { createContext, useContext, useReducer, useState, useEffect, useCallback, useRef } from 'react';
import type {
  Problem,
  SubProblem,
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
import { matchTrigger, matchSelectedProblem, getParentId } from './lib/matchTrigger';
import { playChime, playBonk, playFanfare, playSosumi } from './lib/sounds';
import { centeredAt } from './lib/layout';
import { WINDOWS, LABELS } from './theme';

// ── Typed data ────────────────────────────────────────────────────────────────

const problems = problemsData as Problem[];
const fileTree = fileTreeData as FileEntry[];
const mapping = mappingData as Mapping;

// Flat list of all sub-problems keyed by id
const subProblemMap = new Map<string, SubProblem & { parentId: string }>();
for (const p of problems) {
  for (const sp of p.subProblems ?? []) {
    subProblemMap.set(sp.id, { ...sp, parentId: p.id });
  }
}

function getSubProblemIds(parentId: string): string[] {
  return [...subProblemMap.values()]
    .filter(sp => sp.parentId === parentId)
    .map(sp => sp.id);
}

// ── Boss battle constants ─────────────────────────────────────────────────────

export const BOSS_FILE = 'soil samples.xlsx';
export const BOSS_PARENT_ID = 'data-quality';
// Single source of truth for the boss sub-problems: problems.json (via
// subProblemMap), the same list every other sub-problem code path uses.
// mapping.json still defines how each sub-problem is *triggered* (the cell
// clicks), but the *set* of sub-problems is owned by problems.json only.
export const BOSS_SUB_IDS = getSubProblemIds(BOSS_PARENT_ID);

// ── Default state ─────────────────────────────────────────────────────────────

function getDefaultState(): PersistedState {
  return {
    foundProblems: [],
    fixedProblems: [],
    wrongGuesses: 0,
    hasSeenWelcome: false,
    isMuted: false,
    openWindows: [
      {
        id: 'project-folder',
        title: LABELS.projectWindowTitle,
        viewerType: 'folder',
        ...centeredAt(WINDOWS.projectFolder.width, WINDOWS.projectFolder.height),
        ...WINDOWS.projectFolder,
        zIndex: 1,
      },
    ],
    nextZIndex: 2,
  };
}

// ── Reducer ───────────────────────────────────────────────────────────────────

type Action =
  | { type: 'FIND_PROBLEM'; id: string }
  | { type: 'FIX_PROBLEM'; id: string }
  | { type: 'WRONG_GUESS' }
  | { type: 'DISMISS_WELCOME' }
  | { type: 'OPEN_WINDOW'; window: Omit<WindowState, 'zIndex'> }
  | { type: 'CLOSE_WINDOW'; id: string }
  | { type: 'FOCUS_WINDOW'; id: string }
  | { type: 'MOVE_WINDOW'; id: string; x: number; y: number }
  | { type: 'TOGGLE_MUTE' };

function reducer(state: PersistedState, action: Action): PersistedState {
  switch (action.type) {
    case 'FIND_PROBLEM':
      if (state.foundProblems.includes(action.id)) return state;
      return { ...state, foundProblems: [...state.foundProblems, action.id] };

    case 'FIX_PROBLEM':
      if (state.fixedProblems.includes(action.id)) return state;
      return { ...state, fixedProblems: [...state.fixedProblems, action.id] };

    case 'WRONG_GUESS':
      return { ...state, wrongGuesses: state.wrongGuesses + 1 };

    case 'DISMISS_WELCOME':
      return { ...state, hasSeenWelcome: true };

    case 'OPEN_WINDOW': {
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
      return { ...state, openWindows: state.openWindows.filter(w => w.id !== action.id) };

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

    default:
      return state;
  }
}

// ── Context type ──────────────────────────────────────────────────────────────

interface GameContextType {
  gameState: PersistedState;
  dispatch: React.Dispatch<Action>;

  contextMenu: ContextMenuState | null;
  activeProblem: Problem | SubProblem | null;
  activeParentId: string | null;
  showWrong: boolean;
  wrongKind: 'no_problem' | 'wrong_problem';
  alreadyFoundName: string | null;
  pendingTarget: ContextTarget | null;

  problems: Problem[];
  fileTree: FileEntry[];
  mapping: Mapping;

  // Boss battle
  isBossBattleActive: boolean;
  bossIntroShowing: boolean;
  bossCompletionShowing: boolean;
  bossFileFixed: boolean;
  bossFoundCount: number;
  bossTotalErrors: number;
  dismissBossIntro: () => void;
  dismissBossComplete: () => void;
  reportBossError: (target: ContextTarget) => void;

  openFile: (entry: FileEntry) => void;
  showContextMenu: (menu: ContextMenuState) => void;
  hideContextMenu: () => void;
  openProblemSelection: (target: ContextTarget) => void;
  handleProblemSelection: (selectedProblemId: string) => void;
  cancelProblemSelection: () => void;
  handleFixProblem: (problemId: string) => void;
  dismissProblemDialog: () => void;
  dismissWrongDialog: () => void;
  dismissAlreadyFound: () => void;
  getSubProgress: (parentId: string) => { found: number; total: number };
  isMainProblemSolved: (id: string) => boolean;
}

const GameContext = createContext<GameContextType | null>(null);

export function useGame(): GameContextType {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [gameState, dispatch] = useReducer(reducer, undefined, () => loadState() ?? getDefaultState());

  useEffect(() => {
    saveState(gameState);
  }, [gameState]);

  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [activeProblem, setActiveProblem] = useState<Problem | SubProblem | null>(null);
  const [activeParentId, setActiveParentId] = useState<string | null>(null);
  const [showWrong, setShowWrong] = useState(false);
  const [wrongKind, setWrongKind] = useState<'no_problem' | 'wrong_problem'>('no_problem');
  const [alreadyFoundName, setAlreadyFoundName] = useState<string | null>(null);
  const [pendingTarget, setPendingTarget] = useState<ContextTarget | null>(null);

  // ── Boss battle state ──────────────────────────────────────────────────────
  const [bossIntroShowing, setBossIntroShowing] = useState(false);
  const [bossCompletionShowing, setBossCompletionShowing] = useState(false);
  const [bossFileFixed, setBossFileFixed] = useState(false);

  const bossFoundCount = BOSS_SUB_IDS.filter(id => gameState.foundProblems.includes(id)).length;
  const bossComplete = bossFoundCount === BOSS_SUB_IDS.length;
  const bossWindowOpen = gameState.openWindows.some(w => w.filePath === BOSS_FILE);
  const isBossBattleActive = bossWindowOpen && !bossIntroShowing && !bossFileFixed;

  // Detect the moment boss becomes complete and show completion popup
  const prevBossComplete = useRef(false);
  useEffect(() => {
    if (bossComplete && !prevBossComplete.current && bossWindowOpen && !bossFileFixed) {
      setBossCompletionShowing(true);
    }
    prevBossComplete.current = bossComplete;
  }, [bossComplete, bossWindowOpen, bossFileFixed]);

  const dismissBossIntro = useCallback(() => setBossIntroShowing(false), []);
  const dismissBossComplete = useCallback(() => {
    setBossCompletionShowing(false);
    setBossFileFixed(true);
  }, []);
  // Direct boss error report — skips the problem selection dialog
  const reportBossError = useCallback(
    (target: ContextTarget) => {
      setContextMenu(null);
      const matchedId = matchTrigger(target, mapping);

      if (!matchedId || !BOSS_SUB_IDS.includes(matchedId)) {
        dispatch({ type: 'WRONG_GUESS' });
        setWrongKind('no_problem');
        setShowWrong(true);
        if (!gameState.isMuted) playBonk();
        return;
      }

      if (gameState.foundProblems.includes(matchedId)) {
        const sub = subProblemMap.get(matchedId);
        setAlreadyFoundName(sub?.name ?? matchedId);
        return;
      }

      dispatch({ type: 'FIND_PROBLEM', id: matchedId });

      // Check if all boss subs are now found → mark parent found too
      const nowFound = [...gameState.foundProblems, matchedId];
      const allDone = BOSS_SUB_IDS.every(id => nowFound.includes(id));
      if (allDone && !gameState.foundProblems.includes(BOSS_PARENT_ID)) {
        dispatch({ type: 'FIND_PROBLEM', id: BOSS_PARENT_ID });
      }

      const sub = subProblemMap.get(matchedId);
      setActiveProblem(sub ?? null);
      setActiveParentId(BOSS_PARENT_ID);

      if (!gameState.isMuted) playChime();
    },
    [gameState.foundProblems, gameState.isMuted, mapping],
  );

  // ──────────────────────────────────────────────────────────────────────────

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
      const cascade = (gameState.openWindows.length % 5) * 20;
      const { width: w, height: h } =
        viewerType === 'image' ? WINDOWS.fileViewerImage : WINDOWS.fileViewer;
      dispatch({
        type: 'OPEN_WINDOW',
        window: {
          id: windowId,
          title: entry.name,
          viewerType,
          filePath: entry.name,
          ...centeredAt(w, h, cascade),
          width: w,
          height: h,
        },
      });

      // Trigger boss battle intro when opening the boss file for the first time
      if (entry.name === BOSS_FILE && !bossFileFixed) {
        const alreadyOpen = gameState.openWindows.some(w => w.id === windowId);
        if (!alreadyOpen) {
          if (!gameState.isMuted) playSosumi();
          setBossIntroShowing(true);
        }
      }
    },
    [gameState.openWindows, gameState.isMuted, bossFileFixed],
  );

  // Open problem selection dialog
  const openProblemSelection = useCallback((target: ContextTarget) => {
    setContextMenu(null);
    setPendingTarget(target);
  }, []);

  // Called when user picks a problem from the selection dialog
  const handleProblemSelection = useCallback(
    (selectedProblemId: string) => {
      if (!pendingTarget) return;
      setPendingTarget(null);

      const result = matchSelectedProblem(selectedProblemId, pendingTarget, mapping);

      if (result === 'no_problem') {
        dispatch({ type: 'WRONG_GUESS' });
        setWrongKind('no_problem');
        setShowWrong(true);
        if (!gameState.isMuted) playBonk();
        return;
      }

      if (result === 'wrong_problem') {
        dispatch({ type: 'WRONG_GUESS' });
        setWrongKind('wrong_problem');
        setShowWrong(true);
        if (!gameState.isMuted) playBonk();
        return;
      }

      // Correct! Find the actual matched ID (may be a sub-problem)
      const actualMatchedId = matchTrigger(pendingTarget, mapping) ?? selectedProblemId;
      const parentId = getParentId(actualMatchedId, mapping);

      // Determine the problem object to show
      let foundProblemObj: Problem | SubProblem | null = null;
      let parentIdForDialog: string | null = null;

      if (parentId) {
        // Sub-problem hit
        const sub = subProblemMap.get(actualMatchedId);
        if (sub) {
          foundProblemObj = sub;
          parentIdForDialog = parentId;
        }
      } else {
        foundProblemObj = problems.find(p => p.id === actualMatchedId) ?? null;
      }

      // Check if already found
      if (gameState.foundProblems.includes(actualMatchedId)) {
        const name = foundProblemObj?.name ?? actualMatchedId;
        setAlreadyFoundName(name);
        return;
      }

      // Mark found
      dispatch({ type: 'FIND_PROBLEM', id: actualMatchedId });

      // For sub-problems: check if all subs of the parent are now found
      let parentJustCompleted = false;
      if (parentId) {
        const allSubIds = getSubProblemIds(parentId);
        const nowFound = [...gameState.foundProblems, actualMatchedId];
        const allDone = allSubIds.every(id => nowFound.includes(id));
        if (allDone && !gameState.foundProblems.includes(parentId)) {
          dispatch({ type: 'FIND_PROBLEM', id: parentId });
          parentJustCompleted = true;
        }
      }

      setActiveProblem(foundProblemObj);
      setActiveParentId(parentIdForDialog);

      if (!gameState.isMuted) {
        // Fanfare only when the final *main* problem is found. foundProblems
        // also holds sub-problem ids, so count main ids explicitly.
        const foundIds = new Set(gameState.foundProblems);
        foundIds.add(actualMatchedId);
        if (parentJustCompleted) foundIds.add(parentId!);
        const allMainFound = problems.every(p => foundIds.has(p.id));
        allMainFound ? playFanfare() : playChime();
      }
    },
    [pendingTarget, gameState.foundProblems, gameState.isMuted, mapping],
  );

  const cancelProblemSelection = useCallback(() => {
    setPendingTarget(null);
  }, []);

  // Open "Let's fix it" window for a problem
  const handleFixProblem = useCallback(
    (problemId: string) => {
      // Mark as fixed
      dispatch({ type: 'FIX_PROBLEM', id: problemId });

      const prob = problems.find(p => p.id === problemId)
        ?? [...subProblemMap.values()].find(sp => sp.id === problemId);
      if (!prob) return;

      // For sub-problems, use the parent's fix content
      const fixProblemId = subProblemMap.has(problemId)
        ? (subProblemMap.get(problemId)!.parentId)
        : problemId;

      const cascade = (gameState.openWindows.length % 5) * 20;
      dispatch({
        type: 'OPEN_WINDOW',
        window: {
          id: `fix:${fixProblemId}`,
          title: `Let's fix: ${prob.name}`,
          viewerType: 'fix',
          problemId: fixProblemId,
          ...centeredAt(WINDOWS.fixWindow.width, WINDOWS.fixWindow.height, cascade),
          ...WINDOWS.fixWindow,
        },
      });
    },
    [gameState.openWindows.length],
  );

  const dismissProblemDialog = useCallback(() => {
    setActiveProblem(null);
    setActiveParentId(null);
  }, []);

  const dismissWrongDialog = useCallback(() => setShowWrong(false), []);
  const dismissAlreadyFound = useCallback(() => setAlreadyFoundName(null), []);

  const getSubProgress = useCallback(
    (parentId: string): { found: number; total: number } => {
      const allSubIds = getSubProblemIds(parentId);
      const found = allSubIds.filter(id => gameState.foundProblems.includes(id)).length;
      return { found, total: allSubIds.length };
    },
    [gameState.foundProblems],
  );

  const isMainProblemSolved = useCallback(
    (id: string): boolean => gameState.foundProblems.includes(id),
    [gameState.foundProblems],
  );

  const value: GameContextType = {
    gameState,
    dispatch,
    contextMenu,
    activeProblem,
    activeParentId,
    showWrong,
    wrongKind,
    alreadyFoundName,
    pendingTarget,
    problems,
    fileTree,
    mapping,
    isBossBattleActive,
    bossIntroShowing,
    bossCompletionShowing,
    bossFileFixed,
    bossFoundCount,
    bossTotalErrors: BOSS_SUB_IDS.length,
    dismissBossIntro,
    dismissBossComplete,
    reportBossError,
    openFile,
    showContextMenu,
    hideContextMenu,
    openProblemSelection,
    handleProblemSelection,
    cancelProblemSelection,
    handleFixProblem,
    dismissProblemDialog,
    dismissWrongDialog,
    dismissAlreadyFound,
    getSubProgress,
    isMainProblemSolved,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
