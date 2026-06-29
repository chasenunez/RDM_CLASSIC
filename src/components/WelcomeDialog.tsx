import { useEffect, useRef } from 'react';
import { useGame } from '../GameContext';

export function WelcomeDialog() {
  const { dispatch } = useGame();
  const okRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    okRef.current?.focus();
  }, []);

  const dismiss = () => dispatch({ type: 'DISMISS_WELCOME' });

  return (
    <div className="dialog-overlay" role="dialog" aria-modal="true" aria-labelledby="welcome-title">
      <div className="dialog" style={{ padding: 0, overflow: 'hidden' }}>

        <div className="dialog__chrome-bar">
          <button className="window__close" onClick={dismiss} aria-label="Close">×</button>
          <span className="window__title" id="welcome-title"></span>
        </div>

        <div style={{ padding: '20px 24px', overflowY: 'auto', maxHeight: 'calc(100vh - 120px)' }}>
          <img
            src="/assets/welcome_graphic.png"
            className="dialog__hero-img"
            alt="RDM Chase welcome graphic"
          />

          <div className="dialog__body">
            <p style={{ marginBottom: '10px', lineHeight: 2 }}>
              You have just inherited a colleague&apos;s research project.
              It's a mess. Your mission: find all 13 research data management
              violations hiding in the project files.
            </p>
            <p style={{ marginBottom: '10px', lineHeight: 2 }}>
              <strong>How to play:</strong>
            </p>
            <ul style={{ lineHeight: 2.2, paddingLeft: '16px', marginBottom: '10px' }}>
              <li style={{ listStyle: 'disc', marginBottom: '4px' }}>
                <strong>Right-click</strong> (or long-press on touch) any file icon,
                then choose <em>Report a RDM problem</em>.
              </li>
              <li style={{ listStyle: 'disc', marginBottom: '4px' }}>
                <strong>Double-click</strong> a file to open it and inspect the contents.
                Right-click individual lines or cells inside the viewer.
              </li>
              <li style={{ listStyle: 'disc', marginBottom: '4px' }}>
                For issues that are <em>missing</em> from the project,
                right-click the desktop background or empty space in the folder, then choose
                <em> Report missing artifact</em>.
              </li>
              <li style={{ listStyle: 'disc' }}>
                Each correct find reveals the explanation and marks the checklist.
                Wrong guesses are counted but never block you.
              </li>
            </ul>
            <p style={{ lineHeight: 2 }}>
              Good luck. Your future self thanks you.
            </p>
          </div>

          <div className="dialog__buttons">
            <button
              ref={okRef}
              className="mac-button mac-button--default"
              onClick={dismiss}
              onKeyDown={e => { if (e.key === 'Enter') dismiss(); }}
            >
              Let&apos;s go!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
