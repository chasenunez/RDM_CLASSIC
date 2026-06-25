
import { useGame } from '../GameContext';

export function StickyNote() {
  const { gameState, problems } = useGame();
  const { foundProblems, wrongGuesses } = gameState;

  return (
    <div className="sticky-note" aria-label="RDM checklist">
      <div className="sticky-note__title">RDM Checklist</div>

      {problems.map(p => {
        const found = foundProblems.includes(p.id);
        return (
          <div key={p.id} className="sticky-note__item">
            <div
              className={`sticky-note__checkbox${found ? ' checked' : ''}`}
              aria-hidden="true"
            >
              {found ? '✓' : ''}
            </div>
            <span className={`sticky-note__label${found ? ' found' : ''}`}>
              {p.name}
            </span>
          </div>
        );
      })}

      <div className="sticky-note__counter">
        {foundProblems.length}/{problems.length} found
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
