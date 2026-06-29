import { useGame } from '../GameContext';

export function StickyNote() {
  const { gameState, problems, getSubProgress } = useGame();
  const { foundProblems, wrongGuesses } = gameState;

  const mainFound = problems.filter(p => foundProblems.includes(p.id)).length;

  return (
    <div className="sticky-note" aria-label="RDM checklist">
      <div className="sticky-note__title">RDM Checklist</div>

      {problems.map(p => {
        const found = foundProblems.includes(p.id);
        const hasSubs = (p.subProblems?.length ?? 0) > 0;
        const sub = hasSubs ? getSubProgress(p.id) : null;
        const partiallyFound = sub && sub.found > 0 && !found;

        return (
          <div key={p.id} className="sticky-note__item">
            <div
              className={`sticky-note__checkbox${found ? ' checked' : partiallyFound ? ' partial' : ''}`}
              aria-hidden="true"
            >
              {found ? '✓' : partiallyFound ? '…' : ''}
            </div>
            <span className={`sticky-note__label${found ? ' found' : ''}`}>
              {p.name}
              {sub && !found && sub.total > 0 && (
                <span className="sticky-note__sub-progress"> ({sub.found}/{sub.total})</span>
              )}
            </span>
          </div>
        );
      })}

      <div className="sticky-note__counter">
        {mainFound}/{problems.length} found
        {wrongGuesses > 0 && (
          <>
            <br />
            Wrong: {wrongGuesses}
          </>
        )}
      </div>
    </div>
  );
}
