import { useState, useRef, useEffect } from 'react';
import { useGame } from '../GameContext';
import { clearState } from '../lib/persistence';

export function MenuBar() {
  const { gameState, dispatch } = useGame();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
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
    <div className="menu-bar" ref={barRef} role="menubar">
      {/* Apple menu */}
      <div
        className={`menu-bar__apple${openMenu === 'apple' ? ' open' : ''}`}
        onClick={() => toggleMenu('apple')}
        role="menuitem"
        aria-haspopup="true"
        aria-expanded={openMenu === 'apple'}
        aria-label="Apple menu"
      >
        🍎
        {openMenu === 'apple' && (
          <div className="dropdown" role="menu">
            <div className="dropdown__item disabled">About RDM Scavenger Hunt</div>
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
                dispatch({ type: 'DISMISS_WELCOME' });
                // Re-show welcome by temporarily clearing hasSeenWelcome
                // (handled in App.tsx by watching this menu item)
                dispatch({ type: 'RESET' });
                // Easier: just reload after clearing
                clearState();
                window.location.reload();
              }}
            >
              Help / Show Welcome
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
              {gameState.isMuted ? '🔇 Unmute Sounds' : '🔊 Mute Sounds'}
            </div>
          </div>
        )}
      </div>

      {/* Decorative menu items */}
      {['File', 'Edit', 'View', 'Special'].map(label => (
        <div
          key={label}
          className={`menu-bar__item${openMenu === label ? ' open' : ''}`}
          onClick={() => toggleMenu(label)}
          role="menuitem"
          aria-haspopup="true"
          aria-expanded={openMenu === label}
        >
          {label}
          {openMenu === label && (
            <div className="dropdown" role="menu">
              <div className="dropdown__item disabled">(decorative)</div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
