import { useGame } from '../GameContext';
import { BOSS_SUB_IDS } from '../GameContext';
import { asset } from '../lib/asset';

export function BossBattleIntro() {
  const { bossIntroShowing, dismissBossIntro } = useGame();

  if (!bossIntroShowing) return null;

  return (
    <div className="boss-intro-overlay" onClick={dismissBossIntro} role="button" tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') dismissBossIntro(); }}
      aria-label="Boss Battle intro — click to start"
    >
      <div className="boss-intro-window">
        <div className="dialog__chrome-bar">
          <button className="window__close" aria-label="Start" tabIndex={-1}>×</button>
          <span className="window__title">Boss Battle: Data Quality</span>
        </div>

        <div className="boss-intro__content">
          <img
            src={asset('/assets/mini_game.png')}
            alt="Boss Battle: Data Quality"
            className="boss-intro__image"
            draggable={false}
          />
          <div className="boss-intro__subtitle">
            Find all {BOSS_SUB_IDS.length} data quality errors to win!
          </div>
          <div className="boss-intro__click-hint">Click anywhere to start</div>
        </div>
      </div>
    </div>
  );
}
