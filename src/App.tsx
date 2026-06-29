import { useState, useRef } from 'react';
import { GameProvider, useGame } from './GameContext';
import { MenuBar } from './components/MenuBar';
import { Desktop } from './components/Desktop';
import { ContextMenu } from './components/ContextMenu';
import { WelcomeDialog } from './components/WelcomeDialog';
import { ProblemReportDialog } from './components/ProblemReportDialog';
import { ProblemSelectionDialog } from './components/ProblemSelectionDialog';
import { WrongGuessDialog } from './components/WrongGuessDialog';
import { CompletionDialog } from './components/CompletionDialog';
import { Fireworks } from './components/Fireworks';
import { BossBattleIntro } from './components/BossBattleIntro';
import { BossBattleComplete } from './components/BossBattleComplete';
import { FileStructureDialog } from './components/FileStructureDialog';
import { centeredAt } from './lib/layout';

import './styles/reset.css';
import './styles/fonts.css';
import './styles/mac.css';

// Flip to true to re-enable the fireworks sequence before the completion screen
const FIREWORKS_ENABLED = false;

function GameUI() {
  const { gameState, problems, dispatch } = useGame();
  const { foundProblems, hasSeenWelcome } = gameState;

  const [fireworksDone, setFireworksDone] = useState(false);
  const [showFileStructure, setShowFileStructure] = useState(false);
  const [fileStructureDone, setFileStructureDone] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const winTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Only count main problems (not sub-problems) toward completion
  const mainProblemIds = problems.map(p => p.id);
  const foundMainCount = foundProblems.filter(id => mainProblemIds.includes(id)).length;
  const allFound = problems.length > 0 && foundMainCount >= problems.length;

  // Show file structure dialog once all problems are found, before the win screen
  const shouldShowFileStructure = allFound && !fileStructureDone && !showFileStructure;
  if (shouldShowFileStructure) {
    setShowFileStructure(true);
  }

  const handleFileStructureDone = () => {
    setShowFileStructure(false);
    setFileStructureDone(true);

    // Open the project folder so the player can see the new folder structure
    dispatch({
      type: 'OPEN_WINDOW',
      window: {
        id: 'project-folder',
        title: 'Side Project 237 B',
        viewerType: 'folder',
        ...centeredAt(800, 500),
        width: 800,
        height: 500,
      },
    });

    // Brief pause so the player sees the reorganized folder before the win screen
    winTimerRef.current = setTimeout(() => {
      winTimerRef.current = null;
      if (FIREWORKS_ENABLED) {
        // fireworks condition below picks this up
      } else {
        setShowCompletion(true);
      }
    }, 1200);
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
      <ProblemSelectionDialog />

      {!hasSeenWelcome && <WelcomeDialog />}
      <ProblemReportDialog />
      <WrongGuessDialog />

      <BossBattleIntro />
      <BossBattleComplete />

      {showFileStructure && (
        <FileStructureDialog onDone={handleFileStructureDone} />
      )}

      {FIREWORKS_ENABLED && fileStructureDone && !fireworksDone && (
        <Fireworks
          onDone={() => {
            setFireworksDone(true);
            setShowCompletion(true);
          }}
        />
      )}
      {showCompletion && (
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
