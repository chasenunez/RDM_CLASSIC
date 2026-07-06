import { useState, useEffect } from 'react';
import { GameProvider, useGame } from './GameContext';
import { MenuBar } from './components/MenuBar';
import { Desktop } from './components/Desktop';
import { ContextMenu } from './components/ContextMenu';
import { WelcomeDialog } from './components/WelcomeDialog';
import { ProblemReportDialog } from './components/ProblemReportDialog';
import { ProblemSelectionDialog } from './components/ProblemSelectionDialog';
import { WrongGuessDialog } from './components/WrongGuessDialog';
import { CompletionDialog } from './components/CompletionDialog';
import { BossBattleIntro } from './components/BossBattleIntro';
import { BossBattleComplete } from './components/BossBattleComplete';
import { FileStructureDialog } from './components/FileStructureDialog';
import { centeredAt } from './lib/layout';
import { WINDOWS, LABELS } from './theme';

import './styles/reset.css';
import './styles/fonts.css';
import './styles/mac.css';

// One modal dialog at a time, shown in this order. Several can become
// eligible on the same tick — e.g. finishing the boss battle (the minigame)
// as the final task fires boss-complete, file-structure, and completion
// together. Instead of stacking them, we surface them one at a time in this
// order; a newer dialog waits until the older one above it is dismissed. The
// list is chronological, so "higher priority" also means "triggered earlier".
const MODAL_ORDER = [
  'welcome',
  'problemSelection',
  'problemReport',
  'wrongGuess',
  'bossIntro',
  'bossComplete',
  'fileStructure',
  'completion',
] as const;

// Pop-ups that appear automatically as part of the end-of-game sequence, rather
// than as direct feedback to a user action. Only these wait 1s before showing,
// so they don't flash in on top of one another. Everything else — problem
// selection and the problem/wrong-guess feedback answering a user's guess —
// appears instantly.
const AUTO_MODALS = new Set<string>(['fileStructure', 'completion']);

function GameUI() {
  const {
    gameState,
    problems,
    dispatch,
    pendingTarget,
    activeProblem,
    showWrong,
    alreadyFoundName,
    bossIntroShowing,
    bossCompletionShowing,
  } = useGame();
  const { foundProblems, hasSeenWelcome } = gameState;

  const [showFileStructure, setShowFileStructure] = useState(false);
  const [fileStructureDone, setFileStructureDone] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);

  // Only count main problems (not sub-problems) toward completion
  const mainProblemIds = problems.map(p => p.id);
  const foundMainCount = foundProblems.filter(id => mainProblemIds.includes(id)).length;
  const allFound = problems.length > 0 && foundMainCount >= problems.length;

  // Show file structure dialog once all problems are found, before the win screen
  const shouldShowFileStructure = allFound && !fileStructureDone && !showFileStructure;
  if (shouldShowFileStructure) {
    setShowFileStructure(true);
  }

  // Decide which single modal is allowed on screen right now. Each dialog's
  // underlying "wants to show" state persists while it's suppressed, so it
  // renders as soon as the ones ahead of it are resolved.
  const modalWants: Record<(typeof MODAL_ORDER)[number], boolean> = {
    welcome: !hasSeenWelcome,
    problemSelection: pendingTarget != null,
    problemReport: activeProblem != null,
    wrongGuess: showWrong || alreadyFoundName != null,
    bossIntro: bossIntroShowing,
    bossComplete: bossCompletionShowing,
    fileStructure: showFileStructure,
    completion: showCompletion,
  };
  const activeModal = MODAL_ORDER.find(id => modalWants[id]) ?? null;

  // `activeModal` is what *should* be showing; `visibleModal` is what actually
  // is. Automatic pop-ups (AUTO_MODALS) wait 1s before appearing so the
  // end-of-game windows don't flash in back-to-back. User-driven dialogs —
  // problem selection and the feedback that answers a user's guess — appear
  // instantly, so identifying a problem gives immediate feedback.
  const [visibleModal, setVisibleModal] = useState<string | null>(null);
  useEffect(() => {
    if (activeModal === visibleModal) return;
    if (activeModal !== null && AUTO_MODALS.has(activeModal)) {
      setVisibleModal(null); // hide the current one during the 1s gap
      const t = setTimeout(() => setVisibleModal(activeModal), 1000);
      return () => clearTimeout(t);
    }
    setVisibleModal(activeModal);
  }, [activeModal, visibleModal]);

  const handleFileStructureDone = () => {
    setShowFileStructure(false);
    setFileStructureDone(true);

    // Open the project folder so the player can see the new folder structure
    dispatch({
      type: 'OPEN_WINDOW',
      window: {
        id: 'project-folder',
        title: LABELS.projectWindowTitle,
        viewerType: 'folder',
        ...centeredAt(WINDOWS.projectFolder.width, WINDOWS.projectFolder.height),
        ...WINDOWS.projectFolder,
      },
    });

    // Queue the win screen. Its 1s AUTO_MODALS delay gives the player a beat to
    // see the reorganized folder before the completion dialog appears.
    setShowCompletion(true);
  };

  const handleLookAtWork = () => {
    setShowCompletion(false);
    // game state stays intact — player can explore freely
  };

  return (
    <>
      <MenuBar />
      <Desktop />
      <ContextMenu />

      {/* At most one modal renders at a time, with a 1s gap between them —
          see MODAL_ORDER / activeModal / visibleModal. */}
      {visibleModal === 'problemSelection' && <ProblemSelectionDialog />}
      {visibleModal === 'welcome' && <WelcomeDialog />}
      {visibleModal === 'problemReport' && <ProblemReportDialog />}
      {visibleModal === 'wrongGuess' && <WrongGuessDialog />}
      {visibleModal === 'bossIntro' && <BossBattleIntro />}
      {visibleModal === 'bossComplete' && <BossBattleComplete />}
      {visibleModal === 'fileStructure' && (
        <FileStructureDialog onDone={handleFileStructureDone} />
      )}
      {visibleModal === 'completion' && (
        <CompletionDialog onLookAtWork={handleLookAtWork} />
      )}
    </>
  );
}

export function App() {
  return (
    <GameProvider>
      <GameUI />
    </GameProvider>
  );
}
