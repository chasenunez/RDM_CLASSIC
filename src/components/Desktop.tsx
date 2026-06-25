import React, { useCallback } from 'react';
import { useGame } from '../GameContext';
import { Window } from './Window';
import { FileIcon } from './FileIcon';
import { StickyNote } from './StickyNote';
import { TextViewer } from './viewers/TextViewer';
import { CsvViewer } from './viewers/CsvViewer';
import { XlsxViewer } from './viewers/XlsxViewer';
import { ImageViewer } from './viewers/ImageViewer';
import { BinaryViewer } from './viewers/BinaryViewer';
import type { WindowState } from '../types';

function ViewerForWindow({ win }: { win: WindowState }) {
  if (!win.filePath) return null;
  switch (win.viewerType) {
    case 'text':   return <TextViewer filePath={win.filePath} />;
    case 'csv':    return <CsvViewer filePath={win.filePath} />;
    case 'xlsx':   return <XlsxViewer filePath={win.filePath} />;
    case 'image':  return <ImageViewer filePath={win.filePath} />;
    case 'binary': return <BinaryViewer filePath={win.filePath} />;
    default:       return null;
  }
}

function FolderView() {
  const { fileTree } = useGame();
  // Only direct children of sample_project/ (no sub-directories, only files)
  const direct = fileTree.filter(e => {
    const parts = e.path.replace('sample_project/', '').split('/');
    return parts.length === 1 && e.type === 'file';
  });

  return (
    <div className="folder-view">
      {direct.map(entry => (
        <FileIcon key={entry.path} entry={entry} />
      ))}
    </div>
  );
}

export function Desktop() {
  const { gameState, dispatch, showContextMenu } = useGame();
  const { openWindows } = gameState;

  const maxZ = Math.max(0, ...openWindows.map(w => w.zIndex));

  const onDesktopContextMenu = useCallback(
    (e: React.MouseEvent) => {
      // Don't fire if a child (window, icon) already handled it
      if (e.target !== e.currentTarget) return;
      e.preventDefault();
      showContextMenu({
        x: e.clientX,
        y: e.clientY,
        target: { kind: 'desktop' },
      });
    },
    [showContextMenu],
  );

  return (
    <div
      className="desktop"
      onContextMenu={onDesktopContextMenu}
      aria-label="Desktop"
    >
      <StickyNote />

      {openWindows.map(win => {
        const focused = win.zIndex === maxZ;
        return (
          <Window
            key={win.id}
            id={win.id}
            title={win.title}
            x={win.x}
            y={win.y}
            width={win.width}
            height={win.height}
            zIndex={win.zIndex}
            focused={focused}
            onClose={() => dispatch({ type: 'CLOSE_WINDOW', id: win.id })}
          >
            {win.viewerType === 'folder' ? (
              // The folder view: right-clicking empty space in it = desktop target
              <div
                style={{ height: '100%' }}
                onContextMenu={e => {
                  // Only catch clicks on the empty background, not file icons
                  if ((e.target as HTMLElement).closest('.file-icon')) return;
                  e.preventDefault();
                  showContextMenu({
                    x: e.clientX,
                    y: e.clientY,
                    target: { kind: 'desktop' },
                  });
                }}
              >
                <FolderView />
              </div>
            ) : (
              <ViewerForWindow win={win} />
            )}
          </Window>
        );
      })}
    </div>
  );
}
