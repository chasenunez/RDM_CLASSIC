import { useEffect, useRef, useState } from 'react';
import { marked } from 'marked';
import { useGame } from '../GameContext';

type Tab = 'what' | 'why' | 'fix';

export function ProblemReportDialog() {
  const { activeProblem, dismissProblemDialog } = useGame();
  const [tab, setTab] = useState<Tab>('what');
  const okRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (activeProblem) {
      setTab('what');
      okRef.current?.focus();
    }
  }, [activeProblem]);

  if (!activeProblem) return null;

  const renderMd = (src: string) => ({ __html: marked.parse(src) as string });

  return (
    <div
      className="dialog-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="problem-title"
      onKeyDown={e => { if (e.key === 'Escape') dismissProblemDialog(); }}
    >
      <div className="dialog" style={{ maxWidth: 620 }}>
        <span className="dialog__icon">✅</span>
        <h2 className="dialog__title" id="problem-title">
          Found: {activeProblem.fullTitle}
        </h2>

        {/* Tab bar */}
        <div className="problem-tabs" role="tablist">
          {([['what', "What's wrong"], ['why', 'Why it matters'], ['fix', 'How to fix it']] as [Tab, string][]).map(
            ([key, label]) => (
              <button
                key={key}
                className={`problem-tab${tab === key ? ' active' : ''}`}
                role="tab"
                aria-selected={tab === key}
                onClick={() => setTab(key)}
              >
                {label}
              </button>
            ),
          )}
        </div>

        {/* Tab content */}
        <div className="problem-tab-content" role="tabpanel">
          <div
            className="dialog__markdown"
            dangerouslySetInnerHTML={renderMd(activeProblem[tab])}
          />
        </div>

        {/* Resources */}
        {activeProblem.resources.length > 0 && (
          <div className="dialog__resources">
            <div className="dialog__resources-title">Resources</div>
            {activeProblem.resources.map(r => (
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

        <div className="dialog__buttons">
          <button
            ref={okRef}
            className="mac-button mac-button--default"
            onClick={dismissProblemDialog}
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}
