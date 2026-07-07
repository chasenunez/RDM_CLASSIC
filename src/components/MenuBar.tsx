import { useState, useRef, useEffect } from 'react';
import { useGame } from '../GameContext';
import { clearState } from '../lib/persistence';
import { asset } from '../lib/asset';
import { RulesDialog } from './RulesDialog';

export function MenuBar() {
  const { gameState, dispatch } = useGame();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [showRules, setShowRules] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!openMenu) return;
    const onOutside = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, [openMenu]);

  const toggleMenu = (name: string) =>
    setOpenMenu(prev => (prev === name ? null : name));

  const resetGame = () => {
    clearState();
    window.location.reload();
  };

  return (
    <>
      <div className="menu-bar" ref={barRef} role="menubar">
        {/* Spaceward Ho menu */}
        <div
          className={`menu-bar__apple${openMenu === 'apple' ? ' open' : ''}`}
          onClick={() => toggleMenu('apple')}
          role="menuitem"
          aria-haspopup="true"
          aria-expanded={openMenu === 'apple'}
          aria-label="App menu"
        >
          <img
            src={asset('/assets/orange.png')}
            alt="Menu"
            style={{ width: 16, height: 16, objectFit: 'contain', imageRendering: 'pixelated', pointerEvents: 'none' }}
          />
          {openMenu === 'apple' && (
            <div className="dropdown" role="menu">
              <div className="dropdown__item disabled">About RDM Classic</div>
              <div className="dropdown__separator" />
              <div
                className="dropdown__item"
                role="menuitem"
                onClick={resetGame}
              >
                Reset Game
              </div>
              <div className="dropdown__separator" />
              <div
                className="dropdown__item"
                role="menuitem"
                onClick={() => {
                  setOpenMenu(null);
                  dispatch({ type: 'TOGGLE_MUTE' });
                }}
              >
                {gameState.isMuted ? '[off] Unmute Sounds' : '[on] Mute Sounds'}
              </div>
            </div>
          )}
        </div>

        <div
          className="menu-bar__item"
          onClick={() => setShowRules(true)}
          role="menuitem"
        >
          Rules
        </div>
      </div>

      {showRules && <RulesDialog onClose={() => setShowRules(false)} />}
    </>
  );
}
