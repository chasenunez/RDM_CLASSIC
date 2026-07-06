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
  );
}
