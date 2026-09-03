import { useGame } from '../GameContext';
import { LEARN_PATH } from '../lib/learnPath';

/**
 * The checklist on the desktop.
 *
 * Test mode lists the ten problems in problems.json order and counts finds
 * against wrong guesses. Learn mode lists the same ten grouped into tiers and
 * ordered easiest first, because in learn mode the order *is* the teaching: you
 * rename things before you clean them, and you describe the project last, once
 * everything is in its final shape.
 */
export function StickyNote() {
  const {
    gameState, problems, getSubProgress,
    isLearnMode, learnStepIndex,
  } = useGame();
  const { foundProblems, wrongGuesses } = gameState;

  const mainFound = problems.filter(p => foundProblems.includes(p.id)).length;
  const byId = new Map(problems.map(p => [p.id, p]));

  // ── Learn mode: grouped, ordered, and only the current step is live ────────
  if (isLearnMode) {
    let stepNumber = 0;
    return (
      <div className="sticky-note sticky-note--learn" aria-label="What we are fixing">
        <div className="sticky-note__title">What we are fixing</div>

        {LEARN_PATH.tiers.map(tier => (
          <div className="sticky-note__tier" key={tier.id}>
            <div className="sticky-note__tier-title">{tier.title}</div>
            {tier.steps.map(step => {
              const problem = byId.get(step.problemId);
              const index = stepNumber++;
              const done = index < learnStepIndex;
              const current = index === learnStepIndex;
              return (
                <div
                  className={`sticky-note__item${current ? ' current' : ''}${done ? '' : current ? '' : ' upcoming'}`}
                  key={step.problemId}
                >
                  <div
                    className={`sticky-note__checkbox${done ? ' checked' : current ? ' partial' : ''}`}
                    aria-hidden="true"
                  />
                  <span className={`sticky-note__label${done ? ' found' : ''}`}>
                    {problem?.name ?? step.problemId}
                  </span>
                </div>
              );
            })}
          </div>
        ))}

        <div className="sticky-note__counter">
          {Math.min(learnStepIndex, stepNumber)}/{stepNumber} done
        </div>
      </div>
    );
  }

  // ── Test mode: unchanged ──────────────────────────────────────────────────
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
              {/* A found item's tick is drawn by CSS, since the pixel font has
                  no check-mark glyph. Only the part-done marker is text. */}
              {partiallyFound ? '…' : ''}
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
