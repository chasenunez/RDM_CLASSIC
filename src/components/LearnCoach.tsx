import { useGame } from '../GameContext';

/**
 * The strip along the bottom of the desktop in learn mode: which step we are
 * on, what to do next, and a way through if the player cannot find it.
 *
 * Learn mode is guided but hands-on, so the usual path is that the coach names
 * a file and the player opens it. The "Show me" button exists so nobody can get
 * stuck hunting for an icon; steps with nothing to open (a missing README, for
 * instance) rely on it entirely.
 */
export function LearnCoach() {
  const {
    isLearnMode,
    learnCurrent,
    learnStepIndex,
    learnTotalSteps,
    learnLessonOpen,
    openLearnLesson,
  } = useGame();

  if (!isLearnMode) return null;

  // Finished the whole curriculum.
  if (!learnCurrent) {
    return (
      <div className="learn-coach learn-coach--done" role="status">
        <span className="learn-coach__step">Done</span>
        <span className="learn-coach__instruction">
          That is all ten. The project is ready to hand over.
        </span>
      </div>
    );
  }

  const { step, tier } = learnCurrent;

  return (
    <div className="learn-coach" role="status" aria-live="polite">
      <span className="learn-coach__step">
        {learnStepIndex + 1}/{learnTotalSteps}
      </span>
      <span className="learn-coach__tier">{tier.title}</span>
      <span className="learn-coach__instruction">{step.instruction}</span>
      {!learnLessonOpen && (
        <button className="mac-button learn-coach__button" onClick={openLearnLesson}>
          {step.target ? 'Show me' : 'Read it'}
        </button>
      )}
    </div>
  );
}
