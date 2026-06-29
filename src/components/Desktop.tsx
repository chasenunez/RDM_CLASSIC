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
import { MarkdownViewer } from './viewers/MarkdownViewer';
import { FixViewer } from './viewers/FixViewer';
import type { WindowState, FileEntry } from '../types';
import { computeDisplayFiles, computeArchiveFiles } from '../lib/fixActions';

function TrashView() {
  const { showContextMenu } = useGame();

  const onContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    showContextMenu({ x: e.clientX, y: e.clientY, target: { kind: 'file', path: 'raw_data.xlsx' } });
  }, [showContextMenu]);

  return (
    <div className="folder-view" style={{ height: '100%' }}>
      <div
        className="file-icon"
        onContextMenu={onContextMenu}
        role="button"
        aria-label="File: raw_data.xlsx"
        tabIndex={0}
      >
        <img
          className="file-icon__image"
          src="/icons/Spreadsheet file.svg"
          alt=""
          draggable={false}
          onError={e => { (e.currentTarget as HTMLImageElement).src = '/icons/Text file.svg'; }}
        />
        <span className="file-icon__label">raw_data.xlsx</span>
      </div>
    </div>
  );
}

function ArchiveView({ files }: { files: FileEntry[] }) {
  return (
    <div className="folder-view" style={{ height: '100%' }}>
      {files.length === 0 && (
        <div className="loading-msg">Archive is empty.</div>
      )}
      {files.map(entry => (
        <FileIcon key={entry.path} entry={entry} />
      ))}
    </div>
  );
}

function ViewerForWindow({ win }: { win: WindowState }) {
  const { gameState, fileTree } = useGame();
  const archiveFiles = computeArchiveFiles(fileTree, gameState.fixedProblems);

  if (win.viewerType === 'archive') return <ArchiveView files={archiveFiles} />;
  if (!win.filePath && win.viewerType !== 'trash' && win.viewerType !== 'fix') return null;

  switch (win.viewerType) {
    case 'text':     return <TextViewer filePath={win.filePath!} />;
    case 'csv':      return <CsvViewer filePath={win.filePath!} />;
    case 'xlsx':     return <XlsxViewer filePath={win.filePath!} />;
    case 'image':    return <ImageViewer filePath={win.filePath!} />;
    case 'binary':   return <BinaryViewer filePath={win.filePath!} />;
    case 'markdown': return <MarkdownViewer filePath={win.filePath!} />;
    case 'fix':      return <FixViewer problemId={win.problemId!} />;
    case 'trash':    return <TrashView />;
    default:         return null;
  }
}

function FolderView() {
  const { gameState, fileTree, dispatch } = useGame();
  const displayFiles = computeDisplayFiles(fileTree, gameState.fixedProblems);
  const archiveFiles = computeArchiveFiles(fileTree, gameState.fixedProblems);
  const showArchive = archiveFiles.length > 0;

  const openArchive = useCallback(() => {
    dispatch({
      type: 'OPEN_WINDOW',
      window: {
        id: 'archive',
        title: 'archive/',
        viewerType: 'archive',
        x: 480,
        y: 100,
        width: 600,
        height: 400,
      },
    });
  }, [dispatch]);

  const direct = displayFiles.filter(e => {
    const parts = e.path.replace('sample_project/', '').split('/');
    return parts.length === 1 && e.type === 'file';
  });

  const folders = displayFiles.filter(e => e.type === 'folder');

  return (
    <div className="folder-view">
      {folders.map(entry => (
        <div
          key={entry.path}
          className="file-icon"
          role="button"
          tabIndex={0}
          aria-label={`Folder: ${entry.name}`}
        >
          <img
            className="file-icon__image"
            src={entry.icon}
            alt=""
            draggable={false}
          />
          <span className="file-icon__label">{entry.name}</span>
        </div>
      ))}

      {direct.map(entry => (
        <FileIcon key={entry.path} entry={entry} />
      ))}

      {showArchive && (
        <div
          className="file-icon"
          role="button"
          tabIndex={0}
          aria-label="archive/ (double-click to open)"
          onDoubleClick={openArchive}
          onKeyDown={e => { if (e.key === 'Enter') openArchive(); }}
        >
          <img
            className="file-icon__image"
            src="/icons/Floppy.svg"
            alt=""
            draggable={false}
          />
          <span className="file-icon__label">archive/</span>
        </div>
      )}
    </div>
  );
}

export function Desktop() {
  const { gameState, dispatch, showContextMenu } = useGame();
  const { openWindows } = gameState;

  const maxZ = Math.max(0, ...openWindows.map(w => w.zIndex));

  const onDesktopContextMenu = useCallback(
    (e: React.MouseEvent) => {
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

  const openTrash = useCallback(() => {
    dispatch({
      type: 'OPEN_WINDOW',
      window: {
        id: 'trash',
        title: 'Trash',
        viewerType: 'trash',
        x: 460,
        y: 60,
        width: 360,
        height: 280,
      },
    });
  }, [dispatch]);

  const openProjectFolder = useCallback(() => {
    dispatch({
      type: 'OPEN_WINDOW',
      window: {
        id: 'project-folder',
        title: 'Side Project 237 B',
        viewerType: 'folder',
        x: 420,
        y: 30,
        width: 800,
        height: 500,
      },
    });
  }, [dispatch]);

  return (
    <div
      className="desktop"
      onContextMenu={onDesktopContextMenu}
      onDragStart={e => e.preventDefault()}
      aria-label="Desktop"
    >
      <img
        src="/assets/LDW_DIGITAL_LIB4RI.png"
        className="desktop__bg-logo"
        alt=""
        draggable={false}
      />

      <StickyNote />

      {/* Floppy disk icon */}
      <div
        className="desktop-icon"
        style={{ right: 16, top: 8 }}
        onDoubleClick={openProjectFolder}
        role="button"
        aria-label="Side Project 237 B (double-click to open)"
        tabIndex={0}
        onKeyDown={e => { if (e.key === 'Enter') openProjectFolder(); }}
      >
        <img className="desktop-icon__image" src="/icons/Floppy.png" alt="" draggable={false} />
        <span className="desktop-icon__label">Side Project</span>
      </div>

      {/* Trash icon */}
      <div
        className="desktop-icon"
        style={{ right: 16, bottom: 8 }}
        onDoubleClick={openTrash}
        role="button"
        aria-label="Trash (double-click to open)"
        tabIndex={0}
        onKeyDown={e => { if (e.key === 'Enter') openTrash(); }}
      >
        <img className="desktop-icon__image" src="/icons/Trash.png" alt="" draggable={false} />
        <span className="desktop-icon__label">Trash</span>
      </div>

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
              <div
                style={{ height: '100%' }}
                onContextMenu={e => {
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
