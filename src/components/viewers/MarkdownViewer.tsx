import { useMemo, useCallback } from 'react';
import { marked } from 'marked';
import { useGame } from '../../GameContext';
import { useFileContent } from '../../lib/useFileContent';

interface MarkdownViewerProps {
  filePath: string;
}

export function MarkdownViewer({ filePath }: MarkdownViewerProps) {
  const { showContextMenu } = useGame();
  const { data: text, error } = useFileContent(filePath, 'text');
  const html = useMemo(() => (text ? (marked.parse(text) as string) : ''), [text]);

  const onContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      showContextMenu({
        x: e.clientX,
        y: e.clientY,
        target: { kind: 'file', path: filePath },
      });
    },
    [filePath, showContextMenu],
  );

  if (error) return <div className="loading-msg">Error loading file: {error}</div>;
  if (!html) return <div className="loading-msg">Loading…</div>;

  return (
    <div
      className="markdown-viewer"
      onContextMenu={onContextMenu}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
