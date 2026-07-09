import { useEffect, useRef, useState } from 'react';
import { useGame } from '../GameContext';

/**
 * The game instructions, styled as a period-appropriate (mid-90s) AOL Instant
 * Messenger conversation from your past self. Lines appear one by one on a
 * short interval — the full conversation is on screen in under 5 seconds —
 * and the dialog is modal until the player clicks "Let's go!" (the Send
 * button; the × in the chrome bar is decorative, like a real IM you can't
 * escape).
 */

const SCREEN_NAME = 'Lib4ri';

const CHAT_LINES: React.ReactNode[] = [
  <>Remember that side project that went nowhere? well, now a colleague wants it to go
    somewhere, and they&apos;re asking for the project files.</>,
  <><strong>YOUR MISSION:</strong> use what you now know about good research data
    management to find and fix every problem hiding in the project files.</>,
  <><strong>HOW TO PLAY:</strong> <strong>double-click</strong> a file to open and
    inspect it. <strong>right-click</strong> an offending file, line, or cell to
    report a problem.</>,
  <>if something is <em>missing</em> from the project, right-click the empty space
    in the folder and choose <em>Report missing artifact</em>.</>,
  <>each correct find reveals the explanation and checks it off on the checklist in
    the upper left. wrong guesses are counted, so be strategic!</>,
  <>good luck. your future self thanks you ;-)</>,
];

// All lines are visible after CHAT_LINES.length * LINE_INTERVAL_MS ≈ 3.6s (< 5s).
const LINE_INTERVAL_MS = 2500;

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

  // Keep the newest message in view, and hand focus to the button at the end.
  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
    if (allShown) goRef.current?.focus();
  }, [shownCount, allShown]);

  const dismiss = () => dispatch({ type: 'DISMISS_WELCOME' });

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
            onClick={dismiss}
            disabled={!allShown}
            onKeyDown={e => { if (e.key === 'Enter') dismiss(); }}
          >
            Let&apos;s go!
          </button>
        </div>
      </div>
    </div>
  );
}
