import { useEffect, useRef } from 'react';

interface RulesDialogProps {
  onClose: () => void;
}

export function RulesDialog({ onClose }: RulesDialogProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  return (
    <div className="dialog-overlay" role="dialog" aria-modal="true" aria-labelledby="rules-title">
      <div className="dialog" style={{ padding: 0, overflow: 'hidden' }}>

        <div className="dialog__chrome-bar">
          <button className="window__close" onClick={onClose} aria-label="Close">×</button>
          <span className="window__title" id="rules-title">Rules</span>
        </div>

        <div style={{ padding: '20px 24px', overflowY: 'auto', maxHeight: 'calc(100vh - 120px)' }}>
          <div className="dialog__body">
            <p style={{ marginBottom: '10px', lineHeight: 2 }}>
              <strong>How to play:</strong>
            </p>
            <ul style={{ lineHeight: 2.2, paddingLeft: '16px', marginBottom: '10px' }}>
              <li style={{ listStyle: 'disc', marginBottom: '4px' }}>
                When you find a problem, <strong>Right-click</strong> (or long-press on touch) any file icon,
                then choose <em>Report a RDM problem</em>.
              </li>
              <li style={{ listStyle: 'disc', marginBottom: '4px' }}>
                <strong>Double-click</strong> a file to open it and inspect the contents.
                Right-click individual lines or cells inside the viewer to report a problem in the file.
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
              ref={closeRef}
              className="mac-button mac-button--default"
              onClick={onClose}
              onKeyDown={e => { if (e.key === 'Enter') onClose(); }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
