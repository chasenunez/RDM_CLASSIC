import { useState, useRef, useEffect } from 'react';
import { useGame } from '../GameContext';
import { clearState } from '../lib/persistence';

const MENU_ITEMS: Record<string, string[]> = {
  File: [
    'a complaint with HR',
    'for divorce',
    'under "things I\'ll regret later"',
    'your taxes at the last minute',
    'that under "not my problem"',
    'a missing persons report',
    'into the meeting fashionably late',
    'down those rough edges',
    'away that memory forever',
    'a grievance about the coffee machine',
  ],
  Edit: [
    'out the boring parts of your weekend story',
    'your text before hitting send to your ex',
    'your least favorite cousin out of the family photo',
    'your resume to make that one summer job sound impressive',
    'the truth a little for grandma\'s sake',
    'your story before the rumor spreads',
    'your last text, but they already saw it',
  ],
  View: [
    'from the cheap seats',
    'is better from up here',
    'the world through rose-colored glasses',
    'the wreckage of your inbox',
    'your ex\'s vacation photos at 2am',
    'the damage after the party',
    'with skepticism',
    'from a safe distance',
    'the chaos unfolding',
    'life through your phone screen',
  ],
  Special: [
    'occasion socks',
    'someone',
    'delivery, signature required',
    'guest star nobody asked for',
    'of the day',
    'little snowflake',
    'edition, sold separately',
    'effects',
    'treatment, not in a good way',
    'place in my heart, and nowhere else',
  ],
};

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
          src="/icons/Stop.svg"
          alt="Menu"
          style={{ width: 16, height: 16, imageRendering: 'pixelated', pointerEvents: 'none' }}
        />
        {openMenu === 'apple' && (
          <div className="dropdown" role="menu">
            <div className="dropdown__item disabled">About RDM Chase</div>
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

      {/* Joke menu items */}
      {(Object.keys(MENU_ITEMS) as Array<keyof typeof MENU_ITEMS>).map(label => (
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
              {MENU_ITEMS[label].map(item => (
                <div
                  key={item}
                  className="dropdown__item"
                  role="menuitem"
                  onClick={() => setOpenMenu(null)}
                >
                  {item}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
