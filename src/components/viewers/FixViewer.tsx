import { marked } from 'marked';
import { useGame } from '../../GameContext';

interface FixViewerProps {
  problemId: string;
}

export function FixViewer({ problemId }: FixViewerProps) {
  const { problems } = useGame();
  const problem = problems.find(p => p.id === problemId);

  if (!problem) {
    return <div className="loading-msg">Problem not found: {problemId}</div>;
  }

  const renderMd = (src: string) => ({ __html: marked.parse(src) as string });

  return (
    <div className="fix-viewer">
      <div className="fix-viewer__header">
        <span className="fix-viewer__checkmark">✅</span>
        <h3 className="fix-viewer__title">How to fix: {problem.name}</h3>
      </div>
      <div
        className="dialog__markdown fix-viewer__content"
        dangerouslySetInnerHTML={renderMd(problem.fix)}
      />
      {problem.resources.length > 0 && (
        <div className="dialog__resources">
          <div className="dialog__resources-title">Resources</div>
          {problem.resources.map(r => (
            <a
              key={r.url}
              className="dialog__resource-link"
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {r.title !== r.url ? `${r.title}: ` : ''}{r.url}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
