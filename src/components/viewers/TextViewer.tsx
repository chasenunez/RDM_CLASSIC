import { useEffect, useState } from 'react';
import { useGame } from '../../GameContext';

interface TextViewerProps {
  filePath: string; // filename within sample_project
}

// Lines that have a game trigger assigned — highlight them subtly so players
// notice they can right-click. Populated from the known trigger lines in mapping.
const TRIGGER_LINES: Record<string, number[]> = {
  'script.py': [7, 8],
};

export function TextViewer({ filePath }: TextViewerProps) {
  const { showContextMenu } = useGame();
  const [lines, setLines] = useState<string[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/files/sample_project/${encodeURIComponent(filePath)}`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
      })
      .then(text => setLines(text.split('\n')))
      .catch(e => setError(String(e)));
  }, [filePath]);

  if (error) return <div className="loading-msg">Error loading file: {error}</div>;
  if (!lines.length) return <div className="loading-msg">Loading…</div>;

  const triggerLineNums = TRIGGER_LINES[filePath] ?? [];

  return (
    <div className="text-viewer">
      {lines.map((line, i) => {
        const lineNum = i + 1; // 1-indexed
        const isHint = triggerLineNums.includes(lineNum);

        return (
          <div
            key={i}
            className={`text-viewer__line${isHint ? ' trigger-hint' : ''}`}
            onContextMenu={e => {
              e.preventDefault();
              showContextMenu({
                x: e.clientX,
                y: e.clientY,
                target: { kind: 'line', path: filePath, line: lineNum },
              });
            }}
            title="Right-click to report a RDM problem on this line"
          >
            <span className="text-viewer__line-num">{lineNum}</span>
            <span className="text-viewer__line-text">{line}</span>
          </div>
        );
      })}
    </div>
  );
}
