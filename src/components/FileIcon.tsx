import React, { useCallback } from 'react';
import { useGame } from '../GameContext';
import { useLongPress } from '../lib/longPress';
import type { FileEntry, ContextTarget } from '../types';

interface FileIconProps {
  entry: FileEntry;
}

export function FileIcon({ entry }: FileIconProps) {
  const { showContextMenu, openFile } = useGame();

  const openContextMenu = useCallback(
    (x: number, y: number) => {
      const target: ContextTarget =
        entry.type === 'folder'
          ? { kind: 'desktop' }
          : { kind: 'file', path: entry.name };
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
          src={entry.icon}
          alt=""
          draggable={false}
          onError={(e) => {
            // Fallback to Text file icon if specific icon missing
            (e.currentTarget as HTMLImageElement).src = '/icons/Text file.svg';
          }}
        />
      )}
      <span className="file-icon__label">{entry.name}</span>
    </div>
  );
}
