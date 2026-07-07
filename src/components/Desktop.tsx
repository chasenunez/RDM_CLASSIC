import React, { useCallback } from 'react';
import { useGame } from '../GameContext';
import { Window } from './Window';
import { FileIcon } from './FileIcon';
import { BreakableLabel } from './BreakableLabel';
import { StickyNote } from './StickyNote';
import { TextViewer } from './viewers/TextViewer';
import { CsvViewer } from './viewers/CsvViewer';
import { XlsxViewer } from './viewers/XlsxViewer';
import { ImageViewer } from './viewers/ImageViewer';
import { BinaryViewer } from './viewers/BinaryViewer';
import { MarkdownViewer } from './viewers/MarkdownViewer';
import { FixViewer } from './viewers/FixViewer';
import { GifViewer } from './viewers/GifViewer';
import type { WindowState, FileEntry } from '../types';
import { computeDisplayFiles, computeArchiveFiles, FIX_ACTIONS } from '../lib/fixActions';
import { centeredAt } from '../lib/layout';
import { asset } from '../lib/asset';
import { WINDOWS, ASSETS, LABELS, TRASH_GIFS } from '../theme';

function TrashView() {
  const { showContextMenu, gameState, dispatch } = useGame();
  const isFixed = gameState.fixedProblems.includes('no-backup');

  const onContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    showContextMenu({ x: e.clientX, y: e.clientY, target: { kind: 'file', path: 'raw_alpine_soil_data.xlsx' } });
  }, [showContextMenu]);

  const openGif = useCallback((gif: { id: string; label: string; src: string }) => {
    dispatch({
      type: 'OPEN_WINDOW',
      window: {
        id: `gif:${gif.id}`,
        title: gif.label,
        viewerType: 'gif',
        filePath: gif.src,
        ...centeredAt(WINDOWS.gif.width, WINDOWS.gif.height),
        ...WINDOWS.gif,
      },
    });
  }, [dispatch]);

  const gifIcons = TRASH_GIFS.map(gif => (
    <div
      key={gif.id}
      className="file-icon"
      onClick={() => openGif(gif)}
      onDoubleClick={() => openGif(gif)}
      role="button"
      aria-label={`Play ${gif.label}`}
      tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter') openGif(gif); }}
    >
      <img className="file-icon__image" src={gif.src} alt="" draggable={false} />
      <span className="file-icon__label"><BreakableLabel text={gif.label} /></span>
    </div>
  ));

  if (isFixed) {
    return (
      <div className="folder-view" style={{ height: '100%' }}>
        {gifIcons}
      </div>
    );
  }

  return (
    <div className="folder-view" style={{ height: '100%' }}>
      <div
        className="file-icon"
        onContextMenu={onContextMenu}
        role="button"
        aria-label="File: raw_alpine_soil_data.xlsx"
        tabIndex={0}
      >
        <img
          className="file-icon__image"
          src={asset('/icons/Spreadsheet file.svg')}
          alt=""
          draggable={false}
          onError={e => { (e.currentTarget as HTMLImageElement).src = asset('/icons/Text file.svg'); }}
        />
        <span className="file-icon__label"><BreakableLabel text="raw_alpine_soil_data.xlsx" /></span>
      </div>
      {gifIcons}
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

function SubfolderView({ folderName }: { folderName: string }) {
  const { gameState, fileTree } = useGame();
  const files = computeDisplayFiles(fileTree, gameState.fixedProblems)
    .filter(e => e.type === 'file' && e.path.startsWith(`_sub/${folderName}/`));

  return (
    <div className="folder-view" style={{ height: '100%' }}>
      {files.length === 0 && <div className="loading-msg">Empty folder.</div>}
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
  if (win.viewerType === 'subfolder') return <SubfolderView folderName={win.filePath!} />;
  if (!win.filePath && win.viewerType !== 'trash' && win.viewerType !== 'fix') return null;

  switch (win.viewerType) {
    case 'text':     return <TextViewer filePath={win.filePath!} />;
    case 'csv':      return <CsvViewer filePath={win.filePath!} />;
    case 'xlsx':     return <XlsxViewer filePath={win.filePath!} />;
    case 'image':    return <ImageViewer filePath={win.filePath!} />;
    case 'binary':   return <BinaryViewer filePath={win.filePath!} />;
    case 'markdown': return <MarkdownViewer filePath={win.filePath!} />;
    case 'fix':      return <FixViewer problemId={win.problemId!} />;
    case 'gif':      return <GifViewer src={win.filePath!} />;
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
        ...centeredAt(WINDOWS.archive.width, WINDOWS.archive.height),
        ...WINDOWS.archive,
      },
    });
  }, [dispatch]);

  const openSubfolder = useCallback((folderName: string) => {
    dispatch({
      type: 'OPEN_WINDOW',
      window: {
        id: `subfolder:${folderName}`,
        title: `${folderName}/`,
        viewerType: 'subfolder',
        filePath: folderName,
        ...centeredAt(WINDOWS.subfolder.width, WINDOWS.subfolder.height),
        ...WINDOWS.subfolder,
      },
    });
  }, [dispatch]);

  const direct = displayFiles.filter(e => {
    const parts = e.path.replace('sample_project/', '').split('/');
    return parts.length === 1 && e.type === 'file';
  });

  const folders = displayFiles.filter(e => e.type === 'folder');

  // Subfolder names that contain organized files (double-click opens them)
  const organizeMap = FIX_ACTIONS['file-structure']?.organize ?? {};
  const openableFolders = new Set(Object.keys(organizeMap));

  return (
    <div className="folder-view">
      {folders.map(entry => {
        const folderKey = entry.name.replace(/\/$/, '');
        const isOpenable = openableFolders.has(folderKey);
        return (
          <div
            key={entry.path}
            className="file-icon"
            role="button"
            tabIndex={0}
            aria-label={`Folder: ${entry.name}${isOpenable ? ' (double-click to open)' : ''}`}
            onDoubleClick={isOpenable ? () => openSubfolder(folderKey) : undefined}
            onKeyDown={isOpenable ? e => { if (e.key === 'Enter') openSubfolder(folderKey); } : undefined}
          >
            <img
              className="file-icon__image"
              src={asset(entry.icon)}
              alt=""
              draggable={false}
            />
            <span className="file-icon__label"><BreakableLabel text={entry.name} /></span>
          </div>
        );
      })}

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
            src={asset('/assets/folder.png')}
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
  const { gameState, dispatch, showContextMenu, problems } = useGame();
  const { openWindows } = gameState;

  const maxZ = Math.max(0, ...openWindows.map(w => w.zIndex));

  // Only count main problems (not sub-problems) toward completion, same as App.tsx
  const mainProblemIds = problems.map(p => p.id);
  const foundMainCount = gameState.foundProblems.filter(id => mainProblemIds.includes(id)).length;
  const allFound = problems.length > 0 && foundMainCount >= problems.length;
  const projectIcon = allFound ? ASSETS.projectIconComplete : ASSETS.projectIconActive;

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
        ...centeredAt(WINDOWS.trash.width, WINDOWS.trash.height),
        ...WINDOWS.trash,
      },
    });
  }, [dispatch]);

  const openProjectFolder = useCallback(() => {
    dispatch({
      type: 'OPEN_WINDOW',
      window: {
        id: 'project-folder',
        title: LABELS.projectWindowTitle,
        viewerType: 'folder',
        ...centeredAt(WINDOWS.projectFolder.width, WINDOWS.projectFolder.height),
        ...WINDOWS.projectFolder,
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
      <div
        className="desktop__bg-logo"
        style={{ backgroundImage: `url(${ASSETS.desktopBackgroundLogo})` }}
        aria-hidden="true"
      />

      <StickyNote />

      {/* Project folder icon */}
      <div
        className="desktop-icon"
        style={{ right: 16, top: 8 }}
        onDoubleClick={openProjectFolder}
        role="button"
        aria-label={`${LABELS.projectWindowTitle} (double-click to open)`}
        tabIndex={0}
        onKeyDown={e => { if (e.key === 'Enter') openProjectFolder(); }}
      >
        <img className="desktop-icon__image" src={projectIcon} alt="" draggable={false} />
        <span className="desktop-icon__label">{LABELS.projectIconLabel}</span>
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
        <img className="desktop-icon__image" src={ASSETS.trashIcon} alt="" draggable={false} />
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
