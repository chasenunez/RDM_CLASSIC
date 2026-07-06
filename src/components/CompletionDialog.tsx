import { useEffect, useRef } from 'react';
import { useGame } from '../GameContext';

interface CompletionDialogProps {
  onLookAtWork: () => void;
}

export function CompletionDialog({ onLookAtWork }: CompletionDialogProps) {
  const { gameState, problems } = useGame();
  const { wrongGuesses } = gameState;
  const lookRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    lookRef.current?.focus();
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
      onKeyDown={e => { if (e.key === 'Enter') onLookAtWork(); }}
    >
      <div className="dialog">
        <span className="dialog__icon"></span>
        <h2 className="dialog__title" id="completion-title">
          Congratulations! All {total} problems found!
        </h2>

        <img
          src="/assets/finale_mac.png"
          alt=""
          style={{ display: 'block', margin: '12px auto', maxWidth: '50%', height: 'auto' }}
        />

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
            Download RDM Guide
          </a>
          <button
            ref={lookRef}
            className="mac-button mac-button--default"
            onClick={onLookAtWork}
          >
            Look at my work
          </button>
        </div>
      </div>
    </div>
  );
}
