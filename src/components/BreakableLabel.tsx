import { Fragment } from 'react';

/**
 * Renders a file/folder name with a line-break opportunity (<wbr>) after each
 * underscore, so multi-word identifiers like "microscopy_sample_12.jpg" wrap
 * at the underscores instead of the browser breaking mid-word to fit the
 * icon's label width.
 */
export function BreakableLabel({ text }: { text: string }) {
  const parts = text.split('_');
  return (
    <>
      {parts.map((part, i) => (
        <Fragment key={i}>
          {part}
          {i < parts.length - 1 && (
            <>
              _<wbr />
            </>
          )}
        </Fragment>
      ))}
    </>
  );
}
