import { useGame } from '../GameContext';
import { asset } from '../lib/asset';
import { ASSETS, LABELS } from '../theme';

/**
 * Opening title slide, and the fork in the road.
 *
 * Two buttons rather than click-anywhere, because the choice between learning
 * and being tested has to be made before anything else happens and should not
 * be something you can skip past by clicking in the wrong place.
 */
export function TitleSlide() {
  const { dispatch, chooseMode } = useGame();

  const start = (mode: 'learn' | 'test') => {
    chooseMode(mode);
    dispatch({ type: 'DISMISS_TITLE' });
  };

  return (
    <div className="title-slide-overlay">
      <div className="title-slide-window">
        <div className="dialog__chrome-bar">
          <button className="window__close" aria-hidden="true" tabIndex={-1}>×</button>
          <span className="window__title">{LABELS.projectWindowTitle}</span>
        </div>

        <div className="title-slide__content">
          <img
            src={ASSETS.titleHero}
            alt={LABELS.projectWindowTitle}
            className="title-slide__image"
            draggable={false}
            onError={e => {
              (e.currentTarget as HTMLImageElement).src = asset('/assets/welcome_graphic.png');
            }}
          />

          <div className="mode-choice">
            <button
              className="mode-choice__button"
              onClick={() => start('learn')}
              autoFocus
            >
              <span className="mode-choice__label">Learn</span>
              <span className="mode-choice__blurb">
                New to research data management? Be walked through the whole
                project, one fix at a time. Nothing to guess at.
              </span>
            </button>

            <button
              className="mode-choice__button"
              onClick={() => start('test')}
            >
              <span className="mode-choice__label">Test</span>
              <span className="mode-choice__blurb">
                Know this already? Hunt down all ten problems yourself. Wrong
                guesses are counted.
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
