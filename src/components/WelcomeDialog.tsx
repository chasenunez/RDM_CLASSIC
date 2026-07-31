import { useEffect, useRef, useState } from 'react';
import { useGame } from '../GameContext';
import { LABELS } from '../theme';

/**
 * The game instructions, styled as a period-appropriate (mid-90s) AOL Instant
 * Messenger conversation from your past self. Lines appear one by one on a
 * short interval, and the dialog is modal until the player dismisses it (the
 * × in the chrome bar is decorative, like a real IM you can't escape).
 *
 * The button is never disabled. It used to wait for the last line, which meant
 * a first-time player spent the opening of the game looking at a greyed-out
 * button; now an impatient click brings the rest of the conversation in at
 * once, and a second click starts the game.
 */

const SCREEN_NAME = 'Lib4ri';

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
  <>Heads up: a messy data file is its own mini-game — you have to find
    <em> every</em> problem inside it before it gets cleaned up. (Files and folders
    out in the project get sorted one at a time as you find them.)</>,
  <>Good luck. Your future self thanks you ;-)</>,
];

// The first line shows immediately, so the whole conversation is up after
// (CHAT_LINES.length - 1) * LINE_INTERVAL_MS, a little over five seconds.
// Fast enough to read at a natural pace without stalling the start of play.
const LINE_INTERVAL_MS = 900;

export function WelcomeDialog() {
  const { dispatch } = useGame();
  const goRef = useRef<HTMLButtonElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const [shownCount, setShownCount] = useState(1);
  const allShown = shownCount >= CHAT_LINES.length;

  useEffect(() => {
    if (allShown) return;
    const t = setInterval(() => setShownCount(n => n + 1), LINE_INTERVAL_MS);
    return () => clearInterval(t);
  }, [allShown]);

  // The button is the only control here and is live from the start, so it takes
  // focus on mount: Enter skips ahead, then Enter again starts the game.
  useEffect(() => { goRef.current?.focus(); }, []);

  // Keep the newest message in view as the conversation fills in.
  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [shownCount]);

  // One button, two jobs: catch up the conversation, then start the game.
  const advance = () => {
    if (allShown) dispatch({ type: 'DISMISS_WELCOME' });
    else setShownCount(CHAT_LINES.length);
  };

  return (
    <div className="dialog-overlay" role="dialog" aria-modal="true" aria-labelledby="welcome-title">
      <div className="dialog aim-window" style={{ padding: 0, overflow: 'hidden' }}>

        <div className="dialog__chrome-bar">
          <button className="window__close" aria-hidden="true" tabIndex={-1}>×</button>
          <span className="window__title" id="welcome-title">
            Instant Message — {SCREEN_NAME}
          </span>
        </div>

        <div className="aim-chat__log" ref={logRef} aria-live="polite">
          {CHAT_LINES.slice(0, shownCount).map((line, i) => (
            <p className="aim-chat__line" key={i}>
              <span className="aim-chat__screenname">{SCREEN_NAME}: </span>
              {line}
            </p>
          ))}
        </div>

        <div className="aim-chat__compose">
          <div className="aim-chat__input" aria-hidden="true" />
          <button
            ref={goRef}
            className="mac-button mac-button--default"
            onClick={advance}
          >
            {allShown ? <>Let&apos;s go!</> : <>Skip ahead</>}
          </button>
        </div>
      </div>
    </div>
  );
}
