import React, { useCallback } from 'react';
import { useGame } from '../../GameContext';
import { asset } from '../../lib/asset';

interface ImageViewerProps {
  filePath: string;
}

export function ImageViewer({ filePath }: ImageViewerProps) {
  const { showContextMenu } = useGame();

  const onContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      showContextMenu({
        x: e.clientX,
        y: e.clientY,
        // Image files are file-level triggers (format violation — lossy jpeg, etc.)
        target: { kind: 'file', path: filePath },
      });
    },
    [filePath, showContextMenu],
  );

  return (
    <div className="image-viewer" onContextMenu={onContextMenu}>
      <img
        src={asset(`/files/sample_project/${encodeURIComponent(filePath)}`)}
        alt={filePath}
        title="Right-click to report a RDM problem"
      />
    </div>
  );
}
