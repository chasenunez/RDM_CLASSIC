import React, { useCallback } from 'react';
import { useGame } from '../GameContext';
import { useLongPress } from '../lib/longPress';
import { asset } from '../lib/asset';
import { BreakableLabel } from './BreakableLabel';
import type { FileEntry, ContextTarget } from '../types';

interface FileIconProps {
  entry: FileEntry;
}

export function FileIcon({ entry }: FileIconProps) {
  const { showContextMenu, openFile } = useGame();

  // Only files are reportable here. Folders used to open the empty-space menu,
  // which since the missing-artifact list landed would have offered "what is
  // this project missing?" while pointing at a folder that plainly exists.
  const openContextMenu = useCallback(
    (x: number, y: number) => {
      if (entry.type !== 'file') return;
      const target: ContextTarget = { kind: 'file', path: entry.name };
      showContextMenu({ x, y, target });
    },
    [entry, showContextMenu],
  );

  const onContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      openContextMenu(e.clientX, e.clientY);
    },
    [openContextMenu],
  );

  const onDoubleClick = useCallback(() => {
    if (entry.type === 'file') openFile(entry);
  }, [entry, openFile]);

  const longPress = useLongPress({
    onLongPress: e => {
      const touch = (e as TouchEvent).touches[0] ?? (e as TouchEvent).changedTouches[0];
      openContextMenu(touch.clientX, touch.clientY);
    },
    onPress: onDoubleClick,
  });

  return (
    <div
      className="file-icon"
      onContextMenu={onContextMenu}
      onDoubleClick={onDoubleClick}
      role="button"
      aria-label={`${entry.type === 'folder' ? 'Folder' : 'File'}: ${entry.name}`}
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter') onDoubleClick();
      }}
      {...longPress}
    >
      {entry.type === 'folder' ? (
        <div className="file-icon__folder-graphic" />
      ) : (
        <img
          className="file-icon__image"
          src={asset(entry.icon)}
          alt=""
          draggable={false}
          onError={(e) => {
            // Fallback to Text file icon if specific icon missing
            (e.currentTarget as HTMLImageElement).src = asset('/icons/Text file.svg');
          }}
        />
      )}
      <span className="file-icon__label"><BreakableLabel text={entry.name} /></span>
    </div>
  );
}
