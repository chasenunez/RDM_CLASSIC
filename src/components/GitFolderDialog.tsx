import { useEffect, useRef } from 'react';

interface GitFolderDialogProps {
  onClose: () => void;
}

/**
 * Shown when the player clicks the .git folder that appears after fixing the
 * version-control problem. There is nothing inside it worth rendering, and
 * opening it like an ordinary folder would suggest there is, so this explains
 * why it is normally invisible and points at the real documentation instead.
 */
export function GitFolderDialog({ onClose }: GitFolderDialogProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  return (
    <div
      className="dialog-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="git-folder-title"
      onKeyDown={e => { if (e.key === 'Escape') onClose(); }}
    >
      <div className="dialog" style={{ padding: 0, overflow: 'hidden', maxWidth: 520 }}>

        <div className="dialog__chrome-bar">
          <button className="window__close" onClick={onClose} aria-label="Close">×</button>
          <span className="window__title" id="git-folder-title">.git</span>
        </div>

        <div style={{ padding: '20px 24px' }}>
          <div className="dialog__body">
            <p style={{ marginBottom: '10px', lineHeight: 1.9 }}>
              This folder is usually hidden: A leading dot marks a file or folder
              as hidden  most operating systems.
            </p>
            <p style={{ marginBottom: '10px', lineHeight: 1.9 }}>
              Inside are all the file that Git uses to maintain a full history of all the files in this folder. 
              You usually never edit anything in here by hand. Git writes and edits them all for you.
            </p>
            <p style={{ lineHeight: 1.9 }}>
              If you are curious about how that actually works, take a look here:
            </p>
          </div>

          <div className="dialog__resources">
            <div className="dialog__resources-title">Resources</div>
            <a
              className="dialog__resource-link"
              href="https://git-scm.com/book/en/v2/Git-Internals-Git-Objects"
              target="_blank"
              rel="noopener noreferrer"
            >
              Git Internals, Git Objects: https://git-scm.com/book/en/v2/Git-Internals-Git-Objects
            </a>
          </div>

          <div className="dialog__buttons">
            <button
              ref={closeRef}
              className="mac-button mac-button--default"
              onClick={onClose}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
