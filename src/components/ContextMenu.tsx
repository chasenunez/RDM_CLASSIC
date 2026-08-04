import React, { useEffect, useRef } from 'react';
import { useGame, BOSS_FILE } from '../GameContext';
import { getMissingArtifactMenu } from '../lib/matchTrigger';
import { LABELS } from '../theme';

export function ContextMenu() {
  const {
    contextMenu,
    gameState,
    hideContextMenu,
    openProblemSelection,
    reportMissingArtifact,
    openFile,
    fileTree,
    mapping,
    isBossBattleActive,
    reportBossError,
  } = useGame();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contextMenu) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') hideContextMenu();
    };
    const onOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        hideContextMenu();
      }
    };

    document.addEventListener('keydown', onKey);
    setTimeout(() => document.addEventListener('mousedown', onOutside), 0);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onOutside);
    };
  }, [contextMenu, hideContextMenu]);

  if (!contextMenu) return null;

  const { x, y, target } = contextMenu;

  // During boss battle, only respond to boss file cells
  if (isBossBattleActive) {
    const isBossCell = target.kind === 'cell' && target.path === BOSS_FILE;
    if (!isBossCell) return null;
  }

  // Anchor the menu to whichever corner keeps it on screen, the way a real
  // menu opens away from the edge you clicked near. Anchoring by the far edge
  // means the browser never has to know how wide the menu is, which matters
  // because the missing-artifact list is roughly twice the width of the
  // two-item file menu. The old fixed 200px guess let the wide one run off
  // the right of the screen.
  const style: React.CSSProperties = {
    ...(x > window.innerWidth / 2
      ? { right: window.innerWidth - x }
      : { left: x }),
    ...(y > window.innerHeight / 2
      ? { bottom: window.innerHeight - y }
      : { top: y }),
  };

  // Boss battle: simplified single-action menu
  if (isBossBattleActive && target.kind === 'cell' && target.path === BOSS_FILE) {
    return (
      <div className="context-menu" style={style} ref={menuRef} role="menu">
        <div
          className="context-menu__item"
          role="menuitem"
          onClick={() => reportBossError(target)}
        >
          Report error
        </div>
      </div>
    );
  }

  // Empty space holds no file to inspect, so the only thing worth reporting
  // there is something that *should* be present and isn't. Picking an entry is
  // the whole guess and reports it straight away; some entries are things the
  // project already has, so the list is not a set of free points.
  if (target.kind === 'desktop') {
    const menu = getMissingArtifactMenu(mapping, gameState.foundProblems);
    return (
      <div className="context-menu" style={style} ref={menuRef} role="menu">
        <div className="context-menu__heading">{LABELS.reportMissing}</div>
        {menu.map(item => (
          <div
            key={item.name}
            className="context-menu__item"
            role="menuitem"
            onClick={() => reportMissingArtifact(item.name)}
          >
            {item.label}
          </div>
        ))}
      </div>
    );
  }

  const isFile = target.kind === 'file';

  return (
    <div className="context-menu" style={style} ref={menuRef} role="menu">
      {isFile && (
        <>
          <div
            className="context-menu__item"
            role="menuitem"
            onClick={() => {
              hideContextMenu();
              const filePath = (target as { kind: 'file'; path: string }).path;
              const entry = fileTree.find(e => e.name === filePath);
              if (entry) openFile(entry);
            }}
          >
            Open
          </div>
          <div className="context-menu__separator" />
        </>
      )}

      <div
        className="context-menu__item"
        role="menuitem"
        onClick={() => openProblemSelection(target)}
      >
        {LABELS.reportProblem}
      </div>
    </div>
  );
}
