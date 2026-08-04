import { useEffect, useRef } from 'react';
import { ASSETS } from '../theme';

interface AboutDialogProps {
  onClose: () => void;
}

/**
 * The credits, reached from "About RDM Classic" in the menu. Classic Mac OS put
 * its own credits behind the same menu item, so this is where a player expects
 * to find out who made the thing and what they may do with it.
 *
 * Licence rows mirror LICENSE, LICENSE-GRAPHICS.md, and public/fonts/OFL.txt.
 * If those change, change these.
 */
const LICENCES: { what: string; terms: string; href?: string }[] = [
  {
    what: 'Source code',
    terms: 'MIT',
    href: 'https://github.com/chasenunez/RDM_CLASSIC/blob/main/LICENSE',
  },
  {
    what: 'Graphics and icons',
    terms: 'CC BY-ND 4.0, Chase Núñez',
    href: 'https://creativecommons.org/licenses/by-nd/4.0/',
  },
  {
    what: 'Press Start 2P',
    terms: 'OFL 1.1, CodeMan38',
    href: 'https://openfontlicense.org/',
  },
  {
    what: 'Teaching content',
    terms: 'Lib4RI workshop material',
  },
];

const LINKS: { label: string; href: string }[] = [
  { label: 'Lib4RI: research data management', href: 'https://www.lib4ri.ch/research-data-management' },
  { label: 'Source code on GitHub', href: 'https://github.com/chasenunez/RDM_CLASSIC' },
  { label: 'Found a bug? Report it here', href: 'https://github.com/chasenunez/RDM_CLASSIC/issues' },
];

export function AboutDialog({ onClose }: AboutDialogProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  return (
    <div
      className="dialog-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="about-title"
      onKeyDown={e => { if (e.key === 'Escape') onClose(); }}
    >
      <div className="dialog" style={{ padding: 0, overflow: 'hidden', maxWidth: 480 }}>

        <div className="dialog__chrome-bar">
          <button className="window__close" onClick={onClose} aria-label="Close">×</button>
          <span className="window__title" id="about-title">About RDM Classic</span>
        </div>

        <div style={{ padding: '20px 24px', overflowY: 'auto', maxHeight: 'calc(100vh - 120px)' }}>

          <img
            className="about__logo"
            src={ASSETS.desktopBackgroundLogo}
            alt="Lib4RI"
          />

          <div className="about__title">RDM Classic</div>

          <div className="dialog__body">
            <p style={{ lineHeight: 1.9, marginBottom: '14px' }}>
              A scavenger hunt for the things that go wrong in a research project,
              built by <strong>Chase Núñez</strong> for <strong>Lib4RI</strong> as a
              hands-on companion to the Basics of Research Data Management workshop.
            </p>
          </div>

          <div className="about__section-title">Licence</div>
          <dl className="about__licences">
            {LICENCES.map(row => (
              <div className="about__licence-row" key={row.what}>
                <dt className="about__licence-what">{row.what}</dt>
                <dd className="about__licence-terms">
                  {row.href
                    ? <a href={row.href} target="_blank" rel="noopener noreferrer">{row.terms}</a>
                    : row.terms}
                </dd>
              </div>
            ))}
          </dl>

          <div className="dialog__resources">
            <div className="dialog__resources-title">Links</div>
            {LINKS.map(link => (
              <a
                key={link.href}
                className="dialog__resource-link"
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="dialog__buttons">
            <button
              ref={closeRef}
              className="mac-button mac-button--default"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
