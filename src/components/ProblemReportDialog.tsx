import { useEffect, useRef, useState } from 'react';
import { marked } from 'marked';
import { useGame } from '../GameContext';
import { asset } from '../lib/asset';

type Tab = 'what' | 'why';

export function ProblemReportDialog() {
  const { activeProblem, activeParentId, dismissProblemDialog, handleFixProblem, isBossBattleActive, problems } = useGame();
  const hideFix = isBossBattleActive || activeParentId === 'data-quality';
  const [tab, setTab] = useState<Tab>('what');
  const [showFix, setShowFix] = useState(false);
  const fixRef = useRef<HTMLButtonElement>(null);
  const doneRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (activeProblem) {
      setTab('what');
      setShowFix(false);
      fixRef.current?.focus();
    }
  }, [activeProblem]);

  useEffect(() => {
    if (showFix) doneRef.current?.focus();
  }, [showFix]);

  if (!activeProblem) return null;

  const renderMd = (src: string) => ({ __html: marked.parse(src) as string });

  // The problem ID for the fix action is the parent if this is a sub-problem
  const fixId = activeParentId ?? activeProblem.id;
  // Fix content lives on the (parent) problem, not the sub-problem
  const fixProblem = problems.find(p => p.id === fixId);

  return (
    <div
      className="dialog-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="problem-title"
      onKeyDown={e => { if (e.key === 'Escape') dismissProblemDialog(); }}
    >
      <div className="dialog" style={{ maxWidth: 620 }}>
        <img
          src={asset('/icons/Happy Mac.svg')}
          className="dialog__icon-img"
          alt="[OK]"
          style={{ width: 96, height: 96 }}
        />
        <h2 className="dialog__title" id="problem-title">
          {showFix && fixProblem ? `How to fix: ${fixProblem.name}` : `Found: ${activeProblem.name}`}
        </h2>
        {!showFix && activeParentId && (
          <p style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: '#666', marginBottom: 8 }}>
            Boss Battle: Data Quality issue {activeParentId ? '— find all 8 to complete!' : ''}
          </p>
        )}

        {showFix && fixProblem ? (
          <>
            <div className="problem-tab-content" role="tabpanel">
              <div
                className="dialog__markdown"
                dangerouslySetInnerHTML={renderMd(fixProblem.fix)}
              />
            </div>

            {fixProblem.resources.length > 0 && (
              <div className="dialog__resources">
                <div className="dialog__resources-title">Resources</div>
                {fixProblem.resources.map(r => (
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
                ref={doneRef}
                className="mac-button mac-button--default"
                onClick={dismissProblemDialog}
              >
                Done
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="problem-tabs" role="tablist">
              {([['what', "What's wrong"], ['why', 'Why it matters']] as [Tab, string][]).map(
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

            <div className="problem-tab-content" role="tabpanel">
              <div
                className="dialog__markdown"
                dangerouslySetInnerHTML={renderMd(activeProblem[tab])}
              />
            </div>

            {'resources' in activeProblem && activeProblem.resources.length > 0 && (
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
              {hideFix ? (
                <button
                  className="mac-button"
                  onClick={dismissProblemDialog}
                >
                  OK
                </button>
              ) : (
                <button
                  ref={fixRef}
                  className="mac-button mac-button--default"
                  onClick={() => {
                    handleFixProblem(fixId);
                    setShowFix(true);
                  }}
                >
                  Let&apos;s fix it!
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
