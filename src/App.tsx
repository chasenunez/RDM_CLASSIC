import { useState } from 'react';
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

function GameUI() {
  const { gameState, problems, dispatch } = useGame();
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

    // Brief pause so the player sees the reorganized folder before the win screen
    setTimeout(() => setShowCompletion(true), 1200);
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
