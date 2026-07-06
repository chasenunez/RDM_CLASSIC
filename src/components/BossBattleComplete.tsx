import { useGame } from '../GameContext';
import { asset } from '../lib/asset';

export function BossBattleComplete() {
  const { bossCompletionShowing, dismissBossComplete } = useGame();

  if (!bossCompletionShowing) return null;

  return (
    <div
      className="dialog-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="boss-complete-title"
      onKeyDown={e => { if (e.key === 'Enter') dismissBossComplete(); }}
    >
      <div className="dialog" style={{ maxWidth: 480, textAlign: 'center' }}>
        <img src={asset('/icons/Happy Mac.svg')} className="dialog__icon-img" alt="[WIN]" style={{ width: 160, height: 160, display: 'block', margin: '0 auto 16px' }} />
        <h2 className="dialog__title" id="boss-complete-title">
          Great job!
        </h2>
        <p className="dialog__body">
          You found all the errors in the spreadsheet!<br />
          The file will now reload with the issues fixed.
        </p>
        <div className="dialog__buttons" style={{ justifyContent: 'center' }}>
          <button
            className="mac-button mac-button--default"
            onClick={dismissBossComplete}
            autoFocus
          >
            See the fixed file
          </button>
        </div>
      </div>
    </div>
  );
}
