import { useEffect, useRef } from 'react';
import { useGame } from '../GameContext';
import { asset } from '../lib/asset';

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
            src={asset('/assets/welcome_graphic.png')}
            className="dialog__hero-img"
            alt="RDM Classic welcome graphic"
          />

          <div className="dialog__body">
            <p style={{ marginBottom: '10px', lineHeight: 2 }}>
              Uh oh. Remember that side project you did a while ago that went nowhere? Well now a colleague wants it to go somewhere, and is asked you for the project file.
              The only thing standing between you and a productive collaborative project is your past-self.</p>
            <p style={{ marginBottom: '10px', lineHeight: 2 }}>
              <strong>Your mission:</strong> use what you now know about good reserach data management practices to find and fix all the
              problems hiding in the project files.
            </p>
            <p style={{ marginBottom: '10px', lineHeight: 2 }}>
              <strong>How to play:</strong>
            </p>
            <ul style={{ lineHeight: 2.2, paddingLeft: '16px', marginBottom: '10px' }}>
              <li style={{ listStyle: 'disc', marginBottom: '4px' }}>
                Inspect every file in this project folder. <strong>Double-click</strong> a file to open it and inspect the contents.
                Right-click offending file, individual lines, or cells to report a problem in the file.
              </li>
              
              <li style={{ listStyle: 'disc', marginBottom: '4px' }}>
                To report items that are <em>missing</em> from the project,
                right-click on the empty space in the folder, then choose
                <em> Report missing artifact</em>.
              </li>
              <li style={{ listStyle: 'disc' }}>
                Each correct find reveals the explanation and marks it off on the checklist in the upper left of your screen.
                Wrong guesses are counted, so be strategic!
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
