import { useGame } from '../../GameContext';
import { useFileContent } from '../../lib/useFileContent';

interface TextViewerProps {
  filePath: string; // filename within sample_project
}

// Lines that have a game trigger assigned — highlight them subtly so players
// notice they can right-click. Populated from the known trigger lines in mapping.
const TRIGGER_LINES: Record<string, number[]> = {
  'script.py': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
};

export function TextViewer({ filePath }: TextViewerProps) {
  const { showContextMenu } = useGame();
  const { data: text, error } = useFileContent(filePath, 'text');

  if (error) return <div className="loading-msg">Error loading file: {error}</div>;
  if (text === null) return <div className="loading-msg">Loading…</div>;

  const lines = text.split('\n');
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
