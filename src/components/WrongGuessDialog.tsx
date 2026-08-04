import { useEffect, useRef } from 'react';
import { useGame } from '../GameContext';
import { asset } from '../lib/asset';

export function WrongGuessDialog() {
  const { showWrong, wrongKind, notMissingReason, alreadyFoundName, dismissWrongDialog, dismissAlreadyFound } = useGame();
  const okRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (showWrong || alreadyFoundName) {
      okRef.current?.focus();
    }
  }, [showWrong, alreadyFoundName]);

  if (!showWrong && !alreadyFoundName) return null;

  const isAlreadyFound = !!alreadyFoundName;
  const dismiss = isAlreadyFound ? dismissAlreadyFound : dismissWrongDialog;

  let icon: React.ReactNode;
  let title: string;
  let body: string;

  if (isAlreadyFound) {
    icon = <img src={asset('/assets/dead_mac.png')} className="dialog__icon-img" alt="[!]" />;
    title = 'Already found!';
    body = `You already found "${alreadyFoundName}". Keep looking for the others!`;
  } else if (wrongKind === 'not_missing') {
    icon = <img src={asset('/assets/uhoh_mac.png')} className="dialog__icon" alt="Alert" style={{ imageRendering: 'pixelated' }} />;
    title = "That one's already here.";
    body = notMissingReason
      ? `${notMissingReason} Check what the project has before reporting it missing.`
      : 'That one is already in the project. Check what the project has before reporting it missing.';
  } else if (wrongKind === 'look_inside') {
    icon = <img src={asset('/assets/uhoh_mac.png')} className="dialog__icon" alt="Alert" style={{ imageRendering: 'pixelated' }} />;
    title = 'Have you opened it?';
    body = "Something in this file is a problem, but not the file itself. You can't tell what from the icon alone. Double-click to open it, then right-click the line or cell that looks wrong.";
  } else if (wrongKind === 'wrong_problem') {
    icon = <img src={asset('/assets/uhoh_mac.png')} className="dialog__icon" alt="Alert" style={{ imageRendering: 'pixelated' }} />;
    title = 'Something IS wrong here…';
    body = 'You\'ve spotted a real RDM problem, but you\'ve labeled it incorrectly. Take another look and try a different category.';
  } else {
    icon = <img src={asset('/assets/uhoh_mac.png')} className="dialog__icon" alt="Alert" style={{ imageRendering: 'pixelated' }} />;
    title = 'Looks fine here.';
    body = 'This one checks out. Not everything in the project is broken; some files (a well-named script, say) are perfectly good. Keep exploring: open files and right-click the cells or lines inside them.';
  }

  return (
    <div
      className="dialog-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wrong-title"
      onKeyDown={e => { if (e.key === 'Escape' || e.key === 'Enter') dismiss(); }}
    >
      <div className="dialog" style={{ maxWidth: 380 }}>
        {icon}
        <h2 className="dialog__title" id="wrong-title">{title}</h2>
        <p className="dialog__body">{body}</p>
        <div className="dialog__buttons">
          <button
            ref={okRef}
            className="mac-button mac-button--default"
            onClick={dismiss}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
