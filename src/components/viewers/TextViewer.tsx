import { useGame } from '../../GameContext';
import { useFileContent } from '../../lib/useFileContent';
import { useLongPressWithin } from '../../lib/longPress';

interface TextViewerProps {
  filePath: string; // filename within sample_project
}

export function TextViewer({ filePath }: TextViewerProps) {
  const { showContextMenu, mapping } = useGame();
  const { data: text, error } = useFileContent(filePath, 'text');

  const report = (line: number, x: number, y: number) =>
    showContextMenu({ x, y, target: { kind: 'line', path: filePath, line } });

  const longPress = useLongPressWithin('.text-viewer__line', (el, x, y) => {
    const line = Number(el.dataset.line);
    if (line) report(line, x, y);
  });

  if (error) return <div className="loading-msg">Error loading file: {error}</div>;
  if (text === null) return <div className="loading-msg">Loading…</div>;

  const lines = text.split('\n');

  // Which lines carry a trigger, read straight from the mapping rather than
  // kept in a second list here. The two used to be maintained separately, which
  // is one edit away from hinting at lines that report nothing.
  const triggerLineNums = new Set(
    mapping.problems.flatMap(p =>
      p.triggers
        .filter(t => t.type === 'line' && t.path === filePath)
        .map(t => (t as { line: number }).line),
    ),
  );

  return (
    <div className="text-viewer" {...longPress}>
      {lines.map((line, i) => {
        const lineNum = i + 1; // 1-indexed
        const isHint = triggerLineNums.has(lineNum);

        return (
          <div
            key={i}
            data-line={lineNum}
            className={`text-viewer__line${isHint ? ' trigger-hint' : ''}`}
            onContextMenu={e => {
              e.preventDefault();
              report(lineNum, e.clientX, e.clientY);
            }}
            title="Right-click (or long-press) to report an RDM problem on this line"
          >
            <span className="text-viewer__line-num">{lineNum}</span>
            <span className="text-viewer__line-text">{line}</span>
          </div>
        );
      })}
    </div>
  );
}
