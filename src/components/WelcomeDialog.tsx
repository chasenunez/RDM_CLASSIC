import { useEffect, useRef, useState } from 'react';
import { useGame } from '../GameContext';
import { LABELS } from '../theme';

/**
 * The game instructions, styled as a period-appropriate (mid-90s) AOL Instant
 * Messenger conversation from your past self. The dialog is modal until the
 * player dismisses it (the × in the chrome bar is decorative, like a real IM
 * you can't escape).
 *
 * The player advances the conversation themselves with the Next button, which
 * pulses so it reads as the thing to click. Lines used to arrive on a timer,
 * which meant reading at the game's pace rather than your own. On the last
 * line the same button becomes "Let's go!" and starts the game.
 */

const SCREEN_NAME = 'Lib4RI';

const CHAT_LINES: React.ReactNode[] = [
  <>Remember that side project that went nowhere? A new colleague wants to pick it up,
    and they&apos;re asking for the project files.</>,
  <><strong>YOUR MISSION:</strong> Use what you know about good research data
    management to find and fix every problem hiding in the project files.</>,
  <><strong>HOW TO PLAY:</strong> Explore the project. Look at the files, and inside them.</>,
  <>Right-click a file, or a cell or line within one, and choose
    <em> "{LABELS.reportProblem}"</em>. Right-click empty space to report something
    the project is <em>missing</em>, but check first: not everything on that list
    is actually gone.</>,
  <>Each correct find reveals an explanation and checks it off the list in the
    upper left. Wrong guesses count against you, so be strategic!</>,
  <>Heads up: a messy data file is its own mini-game. You have to find
    <em> every</em> problem inside it before it gets cleaned up. (Files and folders
    out in the project get sorted one at a time as you find them.)</>,
  <>Good luck. Your future self thanks you ;-)</>,
];

export function WelcomeDialog() {
  const { dispatch } = useGame();
  const goRef = useRef<HTMLButtonElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const [shownCount, setShownCount] = useState(1);
  const allShown = shownCount >= CHAT_LINES.length;

  // The button is the only control here, so it takes focus on mount and Enter
  // walks through the whole conversation.
  useEffect(() => { goRef.current?.focus(); }, []);

  // Normally the whole conversation fits and there is nothing to scroll. Only
  // on a viewport short enough to hit the log's max-height do we follow the
  // newest line down, and even then we never scroll past it.
  useEffect(() => {
    const log = logRef.current;
    if (!log || log.scrollHeight <= log.clientHeight) return;
    const newest = log.children[shownCount - 1] as HTMLElement | undefined;
    newest?.scrollIntoView({ block: 'nearest' });
  }, [shownCount]);

  // One button, two jobs: step through the conversation, then start the game.
  const advance = () => {
    if (allShown) dispatch({ type: 'DISMISS_WELCOME' });
    else setShownCount(n => n + 1);
  };

  return (
    <div className="dialog-overlay" role="dialog" aria-modal="true" aria-labelledby="welcome-title">
      <div className="dialog aim-window" style={{ padding: 0, overflow: 'hidden' }}>

        <div className="dialog__chrome-bar">
          <button className="window__close" aria-hidden="true" tabIndex={-1}>×</button>
          <span className="window__title" id="welcome-title">
            Instant Message from {SCREEN_NAME}
          </span>
        </div>

        <div className="aim-chat__log" ref={logRef} aria-live="polite">
          {/* Every line is rendered from the start; the ones not yet said are
              invisible but still take up their space, so the window opens at
              its full height and the whole conversation is readable at once
              without the box growing or scrolling as lines arrive. */}
          {CHAT_LINES.map((line, i) => (
            <p
              className={`aim-chat__line${i < shownCount ? '' : ' aim-chat__line--pending'}`}
              key={i}
              aria-hidden={i < shownCount ? undefined : true}
            >
              <span className="aim-chat__screenname">{SCREEN_NAME}: </span>
              {line}
            </p>
          ))}
        </div>

        <div className="aim-chat__compose">
          <div className="aim-chat__input" aria-hidden="true" />
          <button
            ref={goRef}
            className={`mac-button mac-button--default${allShown ? '' : ' mac-button--pulse'}`}
            onClick={advance}
          >
            {allShown ? <>Let&apos;s go!</> : <>Next</>}
          </button>
        </div>
      </div>
    </div>
  );
}
