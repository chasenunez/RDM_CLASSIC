import React, { useEffect, useRef } from 'react';
import { useGame } from '../GameContext';

export function ContextMenu() {
  const { contextMenu, hideContextMenu, openProblemSelection, openFile, fileTree } = useGame();
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

  const style: React.CSSProperties = {
    left: Math.min(x, window.innerWidth - 200),
    top: Math.min(y, window.innerHeight - 120),
  };

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
        Report a RDM problem…
      </div>
    </div>
  );
}
