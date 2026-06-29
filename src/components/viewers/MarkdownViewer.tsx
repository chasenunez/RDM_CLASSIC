import { useEffect, useState, useCallback } from 'react';
import { marked } from 'marked';
import { useGame } from '../../GameContext';

interface MarkdownViewerProps {
  filePath: string;
}

export function MarkdownViewer({ filePath }: MarkdownViewerProps) {
  const { showContextMenu } = useGame();
  const [html, setHtml] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/files/sample_project/${encodeURIComponent(filePath)}`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
      })
      .then(text => setHtml(marked.parse(text) as string))
      .catch(e => setError(String(e)));
  }, [filePath]);

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
