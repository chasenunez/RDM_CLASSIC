import { useEffect, useRef } from 'react';
import { useGame } from '../GameContext';
import { asset } from '../lib/asset';

export function ProblemSelectionDialog() {
  const {
    pendingTarget,
    problems,
    handleProblemSelection,
    cancelProblemSelection,
    getSubProgress,
    isMainProblemSolved,
  } = useGame();

  const firstButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (pendingTarget) {
      firstButtonRef.current?.focus();
    }
  }, [pendingTarget]);

  if (!pendingTarget) return null;

  // Show all unsolved main problems
  const unsolvedProblems = problems.filter(p => !isMainProblemSolved(p.id));

  return (
    <div
      className="dialog-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="selection-title"
      onKeyDown={e => { if (e.key === 'Escape') cancelProblemSelection(); }}
    >
      <div className="dialog" style={{ maxWidth: 420 }}>
        <img src={asset('/icons/Info.svg')} className="dialog__icon-img" alt="[?]" />
        <h2 className="dialog__title" id="selection-title">
          What's the problem here?
        </h2>
        <p className="dialog__body" style={{ marginBottom: 12 }}>
          Select the RDM issue you've identified:
        </p>

        <div className="problem-selection-list">
          {unsolvedProblems.map((p, i) => {
            const sub = p.subProblems && p.subProblems.length > 0
              ? getSubProgress(p.id)
              : null;
            return (
              <button
                key={p.id}
                ref={i === 0 ? firstButtonRef : undefined}
                className="problem-selection-item mac-button"
                onClick={() => handleProblemSelection(p.id)}
              >
                <span className="problem-selection-item__name">{p.name}</span>
                {sub && sub.total > 0 && (
                  <span className="problem-selection-item__badge">
                    {sub.found}/{sub.total}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="dialog__buttons" style={{ marginTop: 12 }}>
          <button
            className="mac-button"
            onClick={cancelProblemSelection}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
