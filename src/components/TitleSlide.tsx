import { useGame } from '../GameContext';
import { asset } from '../lib/asset';
import { ASSETS, LABELS } from '../theme';

/**
 * Opening title slide — a large windowed "click anywhere to start" screen that
 * appears before the WelcomeDialog instructions. Mirrors the boss-battle intro
 * in structure/behaviour: a centered window (not full-screen) that dismisses on
 * any click, revealing the intro slide underneath.
 */
export function TitleSlide() {
  const { dispatch } = useGame();
  const start = () => dispatch({ type: 'DISMISS_TITLE' });

  return (
    <div
      className="title-slide-overlay"
      role="button"
      tabIndex={0}
      aria-label={`${LABELS.projectWindowTitle} — click to start`}
      onClick={start}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') start(); }}
    >
      <div className="title-slide-window">
        <div className="dialog__chrome-bar">
          <button className="window__close" aria-label="Start" tabIndex={-1}>×</button>
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
          <div className="title-slide__click-hint">Click anywhere to start</div>
        </div>
      </div>
    </div>
  );
}
