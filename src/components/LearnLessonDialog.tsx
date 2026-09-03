import { useEffect, useRef } from 'react';
import { marked } from 'marked';
import { useGame } from '../GameContext';
import { asset } from '../lib/asset';

/**
 * The teaching window for one learn-mode step.
 *
 * It has two shapes. A plain step shows what is wrong, why it matters and how
 * to fix it in one window, then applies the fix. A step with a `tour` (the two
 * big ones, the spreadsheet and the script) walks each issue in turn before
 * offering the fix at the end, which is what makes the minigame teach rather
 * than test.
 *
 * The first tier's intro appears above the lesson on the first step of each
 * tier, so the player is told why this group of changes comes where it does.
 */
export function LearnLessonDialog() {
  const {
    learnCurrent,
    learnLessonOpen,
    learnTourStops,
    learnTourIndex,
    advanceLearnTour,
    completeLearnStep,
    dismissLearnLesson,
    problems,
  } = useGame();

  const actionRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { actionRef.current?.focus(); }, [learnTourIndex, learnLessonOpen]);

  if (!learnLessonOpen || !learnCurrent) return null;

  const { step, tier, firstOfTier } = learnCurrent;
  const problem = problems.find(p => p.id === step.problemId);
  if (!problem) return null;

  const md = (src: string) => ({ __html: marked.parse(src) as string });

  const onTour = learnTourStops.length > 0;
  const stop = onTour ? learnTourStops[Math.min(learnTourIndex, learnTourStops.length - 1)] : null;
  // Past the last stop, the tour gives way to the fix.
  const tourFinished = onTour && learnTourIndex >= learnTourStops.length;

  // Learn-only links sit alongside the problem's own, not instead of them.
  const resources = [...(step.resources ?? []), ...problem.resources];

  return (
    <div
      className="dialog-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="learn-lesson-title"
      onKeyDown={e => { if (e.key === 'Escape') dismissLearnLesson(); }}
    >
      <div className="dialog learn-lesson" style={{ maxWidth: 640 }}>

        <div className="dialog__chrome-bar">
          <button className="window__close" onClick={dismissLearnLesson} aria-label="Close">×</button>
          <span className="window__title" id="learn-lesson-title">
            {onTour && !tourFinished && stop
              ? `${problem.name}: ${learnTourIndex + 1} of ${learnTourStops.length}`
              : problem.name}
          </span>
        </div>

        <div className="learn-lesson__body">

          {/* Why this group of changes sits here in the order. Shown once, on
              the first step of each tier. */}
          {firstOfTier && learnTourIndex === 0 && (
            <div className="learn-lesson__tier-intro">
              <div className="learn-lesson__tier-title">{tier.title}</div>
              <p>{tier.intro}</p>
            </div>
          )}

          {onTour && !tourFinished && stop ? (
            <>
              <h3 className="learn-lesson__heading">{stop.name}</h3>
              <div className="dialog__markdown" dangerouslySetInnerHTML={md(stop.what)} />
              <div className="learn-lesson__why">
                <div className="learn-lesson__why-title">Why it matters</div>
                <div className="dialog__markdown" dangerouslySetInnerHTML={md(stop.why)} />
              </div>
            </>
          ) : (
            <>
              {!onTour && (
                <>
                  <div className="dialog__markdown" dangerouslySetInnerHTML={md(problem.what)} />
                  <div className="learn-lesson__why">
                    <div className="learn-lesson__why-title">Why it matters</div>
                    <div className="dialog__markdown" dangerouslySetInnerHTML={md(problem.why)} />
                  </div>
                </>
              )}

              {onTour && (
                <p className="learn-lesson__tour-done">
                  That is all {learnTourStops.length} of them. Here is what to do
                  about it.
                </p>
              )}

              <div className="learn-lesson__fix">
                <div className="learn-lesson__why-title">How to fix it</div>
                <div className="dialog__markdown" dangerouslySetInnerHTML={md(problem.fix)} />
              </div>

              {/* Learn-only framing, e.g. the note about Git and large data. */}
              {step.note && (
                <div className="learn-lesson__note">
                  <div className="dialog__markdown" dangerouslySetInnerHTML={md(step.note)} />
                </div>
              )}

              {resources.length > 0 && (
                <div className="dialog__resources">
                  <div className="dialog__resources-title">Resources</div>
                  {resources.map(r => (
                    <a
                      key={r.url}
                      className="dialog__resource-link"
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {r.title !== r.url ? `${r.title}: ` : ''}{r.url}
                    </a>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <div className="dialog__buttons">
          {onTour && !tourFinished ? (
            <button ref={actionRef} className="mac-button mac-button--default" onClick={advanceLearnTour}>
              {learnTourIndex + 1 < learnTourStops.length ? 'Next problem' : 'How do we fix it?'}
            </button>
          ) : (
            <button ref={actionRef} className="mac-button mac-button--default" onClick={completeLearnStep}>
              <img
                src={asset('/assets/cute_mac.png')}
                alt=""
                style={{ width: 14, height: 14, imageRendering: 'pixelated', verticalAlign: 'middle', marginRight: 6 }}
              />
              Fix it
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
