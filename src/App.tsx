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
import { Fireworks } from './components/Fireworks';

import './styles/reset.css';
import './styles/fonts.css';
import './styles/mac.css';

function GameUI() {
  const { gameState, problems, dispatch } = useGame();
  const { foundProblems, hasSeenWelcome } = gameState;

  const [fireworksDone, setFireworksDone] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);

  // Only count main problems (not sub-problems) toward completion
  const mainProblemIds = problems.map(p => p.id);
  const foundMainCount = foundProblems.filter(id => mainProblemIds.includes(id)).length;
  const allFound = problems.length > 0 && foundMainCount >= problems.length;

  const handlePlayAgain = () => {
    dispatch({ type: 'RESET' });
    setShowCompletion(false);
    setFireworksDone(false);
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

      {allFound && !fireworksDone && (
        <Fireworks
          onDone={() => {
            setFireworksDone(true);
            setShowCompletion(true);
          }}
        />
      )}
      {showCompletion && (
        <CompletionDialog onClose={handlePlayAgain} />
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
