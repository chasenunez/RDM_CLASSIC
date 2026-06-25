import { useState } from 'react';
import { GameProvider, useGame } from './GameContext';
import { MenuBar } from './components/MenuBar';
import { Desktop } from './components/Desktop';
import { ContextMenu } from './components/ContextMenu';
import { WelcomeDialog } from './components/WelcomeDialog';
import { ProblemReportDialog } from './components/ProblemReportDialog';
import { WrongGuessDialog } from './components/WrongGuessDialog';
import { CompletionDialog } from './components/CompletionDialog';
import { Fireworks } from './components/Fireworks';

import './styles/reset.css';
import './styles/fonts.css';
import './styles/mac.css';

function GameUI() {
  const { gameState, problems } = useGame();
  const { foundProblems, hasSeenWelcome } = gameState;

  const [fireworksDone, setFireworksDone] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);

  const allFound = problems.length > 0 && foundProblems.length >= problems.length;

  return (
    <>
      <MenuBar />
      <Desktop />
      <ContextMenu />

      {/* Overlays in priority order (highest z first) */}
      {!hasSeenWelcome && <WelcomeDialog />}
      <ProblemReportDialog />
      <WrongGuessDialog />

      {/* Fireworks → completion dialog sequence */}
      {allFound && !fireworksDone && (
        <Fireworks
          onDone={() => {
            setFireworksDone(true);
            setShowCompletion(true);
          }}
        />
      )}
      {showCompletion && (
        <CompletionDialog
          onClose={() => {
            // "Play again" resets but keeps the completion visible until reload
            setShowCompletion(false);
          }}
        />
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
