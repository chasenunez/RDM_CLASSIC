import { useEffect, useRef } from 'react';
import { useGame } from '../GameContext';

export function WrongGuessDialog() {
  const { showWrong, alreadyFoundName, dismissWrongDialog, dismissAlreadyFound } = useGame();
  const okRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (showWrong || alreadyFoundName) {
      okRef.current?.focus();
    }
  }, [showWrong, alreadyFoundName]);

  if (!showWrong && !alreadyFoundName) return null;

  const isAlreadyFound = !!alreadyFoundName;
  const dismiss = isAlreadyFound ? dismissAlreadyFound : dismissWrongDialog;

  return (
    <div
      className="dialog-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wrong-title"
      onKeyDown={e => { if (e.key === 'Escape' || e.key === 'Enter') dismiss(); }}
    >
      <div className="dialog" style={{ maxWidth: 360 }}>
        {isAlreadyFound
          ? <span className="dialog__icon">🔁</span>
          : <img src="/icons/Alert.png" className="dialog__icon" alt="Alert" style={{ imageRendering: 'pixelated' }} />
        }
        <h2 className="dialog__title" id="wrong-title">
          {isAlreadyFound ? 'Already found!' : 'No RDM problem here.'}
        </h2>
        <p className="dialog__body">
          {isAlreadyFound
            ? `You already found "${alreadyFoundName}". Keep looking for the others!`
            : 'That target does not reveal an RDM violation. Keep exploring — right-click files, open them and inspect cells or lines.'}
        </p>
        <div className="dialog__buttons">
          <button
            ref={okRef}
            className="mac-button mac-button--default"
            onClick={dismiss}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
