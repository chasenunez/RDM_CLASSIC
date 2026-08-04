import { useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import { useGame, BOSS_FILE } from '../../GameContext';
import { useFileContent } from '../../lib/useFileContent';
import { useLongPressWithin } from '../../lib/longPress';

interface XlsxViewerProps {
  filePath: string;
}

interface SheetData {
  name: string;
  rows: string[][];
}

const MISSING_VALUES = new Set(['-999', 'NA', 'n/a', '??']);

// A number written with a comma decimal separator and stored as text, e.g.
// "42,1". These read as strings (not numbers) and break analysis silently.
const COMMA_DECIMAL = /^-?\d+,\d+$/;

// The cleaned schema is no longer reconstructed here. It lives in the real
// file the fix hands the player, 20260315_AlpineSoil_Chem_v1.0.xlsx, and is
// documented in the sample project's README data dictionary and in the
// dq-col-names fix table in src/data/problems.json.

// Columns holding free-form prose rather than measurements. A blank here means
// "nothing to say about this sample", which is not a data-quality defect, so
// these cells are never tinted. Matched against the header row by name.
const FREE_TEXT_HEADERS = new Set(['notes']);

/**
 * Decide the highlight class for one boss-file cell.
 *
 * The rule this function has to keep: **anything it tints must be reportable.**
 * A tinted cell reads as an invitation (mac.css gives blanks a dashed outline,
 * a "(blank)" placeholder, and a pointer cursor), so a tint with no matching
 * trigger in mapping.json costs the player a wrong guess for being right. The
 * converse is deliberately not true: the ambiguous `col1` / `col2` headers are
 * reportable but left unstyled, because spotting them is the exercise.
 */
function cellClass(
  rowIdx: number,
  colIdx: number,
  cell: string,
  freeTextCols: Set<number>,
): string {
  // Rows 0 and 1 don't belong in the file at all, so the whole row is tinted
  // and every cell in it maps to dq-floating-header / dq-embedded-note.
  if (rowIdx === 0) return 'xlsx-meta-title';
  if (rowIdx === 1) return 'xlsx-meta-note';
  if (rowIdx === 2) return ''; // header row, styled via th
  const v = cell.trim();
  if (MISSING_VALUES.has(v)) return 'xlsx-bad-value';
  if (COMMA_DECIMAL.test(v)) return 'xlsx-bad-value'; // comma-decimal text
  if (v === '' && !freeTextCols.has(colIdx)) return 'xlsx-blank-value';
  return '';
}

export function XlsxViewer({ filePath }: XlsxViewerProps) {
  const {
    showContextMenu,
    isBossBattleActive,
    bossFoundCount,
    bossTotalErrors,
    bossFileFixed,
  } = useGame();

  const [activeSheet, setActiveSheet] = useState(0);
  const { data: buf, error } = useFileContent(filePath, 'arrayBuffer');

  // Touch equivalent of right-clicking a cell. Attached to the table wrapper
  // rather than to each cell, since a hook per cell isn't workable in a grid.
  const longPress = useLongPressWithin('[data-cell]', (el, x, y) => {
    if (el.dataset.locked === 'true') return;
    showContextMenu({
      x, y,
      target: {
        kind: 'cell',
        path: filePath,
        row: Number(el.dataset.row),
        col: Number(el.dataset.col),
      },
    });
  });

  const sheets = useMemo<SheetData[]>(() => {
    if (!buf) return [];
    const wb = XLSX.read(buf, { type: 'array' });
    return wb.SheetNames.map(name => {
      const rows = XLSX.utils.sheet_to_json<string[]>(wb.Sheets[name], { header: 1, defval: '' });
      return { name, rows: rows as string[][] };
    });
  }, [buf]);

  if (error) return <div className="loading-msg">Error parsing xlsx: {error}</div>;
  if (!sheets.length) return <div className="loading-msg">Loading…</div>;

  const current = sheets[activeSheet];
  const isBoss = filePath === BOSS_FILE;
  const errorsRemaining = bossTotalErrors - bossFoundCount;

  // Winning the boss battle no longer re-renders this file as if it were clean.
  // It archives the messy original and opens a real cleaned file
  // (20260315_AlpineSoil_Chem_v1.0.xlsx) in its place, so what the player sees
  // here is always the genuine bytes on disk. Reached from the archive after
  // the fix, this stays messy on purpose: the preserved original is the point.
  const displayRows = current.rows;
  const maxCols = Math.max(...displayRows.map(r => r.length));

  // Header row is row 2 in the messy file (rows 0 and 1 are the stray title
  // and note). Used to spot the free-text columns whose blanks are harmless.
  const freeTextCols = new Set<number>();
  (current.rows[2] ?? []).forEach((h, i) => {
    if (FREE_TEXT_HEADERS.has(String(h ?? '').trim().toLowerCase())) freeTextCols.add(i);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>

      {/* Error counter, upper right, only during active boss battle */}
      {isBoss && !bossFileFixed && (
        <div className="boss-error-counter">
          {errorsRemaining > 0
            ? `${errorsRemaining} error${errorsRemaining !== 1 ? 's' : ''} remaining`
            : 'All errors found!'}
        </div>
      )}

      {sheets.length > 1 && (
        <div className="sheet-tabs">
          {sheets.map((s, i) => (
            <div
              key={s.name}
              className={`sheet-tab${i === activeSheet ? ' active' : ''}`}
              onClick={() => setActiveSheet(i)}
              role="tab"
              aria-selected={i === activeSheet}
            >
              {s.name}
            </div>
          ))}
        </div>
      )}

      {isBoss && !bossFileFixed && (
        <div className="xlsx-boss-hint">
          Minigame: find all {bossTotalErrors} data quality issues! Right-click
          (or long-press) suspicious cells.
        </div>
      )}

      {isBoss && bossFileFixed && (
        <div className="xlsx-fixed-banner">
          Archived original, kept exactly as collected. The cleaned copy is
          20260315_AlpineSoil_Chem_v1.0.xlsx.
        </div>
      )}

      <div className="table-viewer" style={{ flex: 1 }} {...longPress}>
        <table>
          <tbody>
            {displayRows.map((row, rowIdx) => {
              // The messy file buries its header under two stray rows; every
              // other spreadsheet starts with its header, as it should.
              const isHeaderRow = isBoss ? rowIdx === 2 : rowIdx === 0;
              const isMetaRow = isBoss && (rowIdx === 0 || rowIdx === 1);

              return (
                <tr key={rowIdx} className={isMetaRow ? 'meta-row' : ''}>
                  <td className="row-num">{rowIdx}</td>
                  {Array.from({ length: maxCols }, (_, colIdx) => {
                    const cell = String(row[colIdx] ?? '');
                    const Tag = isHeaderRow ? 'th' : 'td';
                    // Tinting stays on after the win: the archived original is
                    // a record of what was wrong, even though it is read-only.
                    const extraClass = isBoss
                      ? cellClass(rowIdx, colIdx, cell, freeTextCols)
                      : '';

                    // Only show context menu for boss cells during active battle,
                    // or for any cell when boss is not active
                    const canRightClick = !isBoss || isBossBattleActive;

                    return (
                      <Tag
                        key={colIdx}
                        className={extraClass || undefined}
                        data-cell=""
                        data-row={rowIdx}
                        data-col={colIdx}
                        data-locked={!canRightClick}
                        onContextMenu={e => {
                          if (!canRightClick) return;
                          e.preventDefault();
                          showContextMenu({
                            x: e.clientX,
                            y: e.clientY,
                            target: { kind: 'cell', path: filePath, row: rowIdx, col: colIdx },
                          });
                        }}
                        title={canRightClick ? `Row ${rowIdx}, Col ${colIdx}: right-click or long-press to report` : undefined}
                      >
                        {cell}
                      </Tag>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
