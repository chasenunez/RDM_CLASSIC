import { useRef, useEffect } from 'react';
import { useGame } from '../GameContext';

interface FileStructureDialogProps {
  onDone: () => void;
}

export function FileStructureDialog({ onDone }: FileStructureDialogProps) {
  const { dispatch } = useGame();
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    btnRef.current?.focus();
  }, []);

  const handleOrganize = () => {
    dispatch({ type: 'FIX_PROBLEM', id: 'file-structure' });
    onDone();
  };

  return (
    <div
      className="dialog-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="file-structure-title"
      onKeyDown={e => { if (e.key === 'Enter') handleOrganize(); }}
    >
      <div className="dialog" style={{ maxWidth: 500 }}>
        <img
          src="/icons/Info.svg"
          className="dialog__icon-img"
          alt=""
          style={{ width: 32, height: 32 }}
        />
        <h2 className="dialog__title" id="file-structure-title">
          Almost done!
        </h2>
        <div className="dialog__body">
          <p style={{ marginBottom: '10px' }}>
            You've identified every RDM problem — but there's one more best practice
            worth applying: a <strong>hierarchical file structure</strong>.
          </p>
          <p style={{ marginBottom: '10px' }}>
            Grouping files into logical folders — <code>data/</code>, <code>manuscripts/</code>,
            and <code>code/</code> — makes your project immediately navigable by anyone,
            including your future self. It also makes writing a README much easier,
            since you can describe each folder in one sentence instead of listing every file.
          </p>
          <p>
            Without structure, even a well-named project becomes hard to navigate as it grows.
          </p>
        </div>
        <div className="dialog__buttons" style={{ justifyContent: 'center' }}>
          <button
            ref={btnRef}
            className="mac-button mac-button--default"
            onClick={handleOrganize}
          >
            Let's organize!
          </button>
        </div>
      </div>
    </div>
  );
}
