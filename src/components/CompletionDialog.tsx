import { useEffect, useRef } from 'react';
import { useGame } from '../GameContext';

interface CompletionDialogProps {
  onClose: () => void;
}

export function CompletionDialog({ onClose }: CompletionDialogProps) {
  const { gameState, problems } = useGame();
  const { wrongGuesses } = gameState;
  const okRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    okRef.current?.focus();
  }, []);

  const total = problems.length;
  const rating =
    wrongGuesses === 0
      ? 'Flawless. RDM legend.'
      : wrongGuesses <= 3
      ? 'RDM expert. Your future self thanks you.'
      : wrongGuesses <= 8
      ? 'Solid instincts. A few blind spots to work on.'
      : 'Good start! Review the FAIR principles and try again.';

  return (
    <div
      className="dialog-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="completion-title"
      onKeyDown={e => { if (e.key === 'Enter') onClose(); }}
    >
      <div className="dialog" style={{ maxWidth: 480 }}>
        <span className="dialog__icon"></span>
        <h2 className="dialog__title" id="completion-title">
          Congratulations! All {total} problems found!
        </h2>

        <div className="dialog__body">
          <p style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', lineHeight: 2, marginBottom: '10px' }}>
            {rating}
          </p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
            <span className="score-chip good">{total}/{total} found</span>
            <span className="score-chip">
              {wrongGuesses} wrong guess{wrongGuesses !== 1 ? 'es' : ''}
            </span>
          </div>
          <p style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', lineHeight: 2, marginBottom: '10px' }}>
            Download the full RDM guide with all explanations and resources
            to share with your team or keep as a reference.
          </p>
        </div>

        <div className="dialog__buttons">
          <a
            href="/downloads/RDM_Guide.html"
            download="RDM_Problems_and_Fixes_Guide.html"
            className="mac-button"
            style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}
          >
            ⬇ Download RDM Guide
          </a>
          <button
            ref={okRef}
            className="mac-button mac-button--default"
            onClick={onClose}
          >
            Play Again
          </button>
        </div>
      </div>
    </div>
  );
}
