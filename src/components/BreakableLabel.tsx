import { Fragment } from 'react';

/**
 * Renders a file/folder name with a line-break opportunity (<wbr>) after each
 * underscore and dot, so multi-word/versioned identifiers like
 * "microscopy_sample_12.jpg" wrap at those boundaries instead of the browser
 * breaking mid-word to fit the icon's label width.
 */
export function BreakableLabel({ text }: { text: string }) {
  const parts = text.split(/([_.])/);
  return (
    <>
      {parts.map((part, i) => (
        <Fragment key={i}>
          {part}
          {(part === '_' || part === '.') && <wbr />}
        </Fragment>
      ))}
    </>
  );
}
