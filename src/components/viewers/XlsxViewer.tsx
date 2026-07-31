import { useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import { useGame, BOSS_FILE } from '../../GameContext';
import { useFileContent } from '../../lib/useFileContent';
import { asset } from '../../lib/asset';

interface XlsxViewerProps {
  filePath: string;
}

interface SheetData {
  name: string;
  rows: string[][];
}

const MISSING_VALUES = new Set(['-999', 'NA', 'n/a', '??']);

// The single explicit missing-value code the fixed file uses everywhere, so the
// spreadsheet matches the written advice ("use one explicit code such as NA").
const MISSING_CODE = 'NA';

// A number written with a comma decimal separator and stored as text, e.g.
// "42,1". These read as strings (not numbers) and break analysis silently.
const COMMA_DECIMAL = /^-?\d+,\d+$/;

/**
 * Ambiguous headers renamed to self-descriptive names (with units) when the
 * file is shown in its fixed state.
 *
 * This is the canonical cleaned schema for the sample project. Three other
 * files quote it and must be kept in step:
 *   - the dq-col-names fix table in src/data/problems.json
 *   - the data dictionary in public/files/sample_project/README.md
 *   - the column names used by 20260410_AlpineSoil_Analysis_v1.0.py
 * `pH` and `notes` are already clear and pass through unchanged.
 */
const HEADER_RENAME: Record<string, string> = {
  id:   'site_id',
  col1: 'soil_moisture_pct',
  col2: 'organic_carbon_g_per_kg',
  col3: 'bulk_density_g_per_cm3',
  temp: 'air_temperature_degC',
};

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

  // Fixed mode: skip the two meta rows, then clean up the data so the file
  // reflects the advice the game gives — one explicit missing-value code,
  // consistent decimals, and self-descriptive column headers. Row 0 of the
  // sliced rows is the header (was row 2 in the original).
  const displayRows = isBoss && bossFileFixed
    ? current.rows.slice(2).map((row, rowIdx) =>
        row.map(cell => {
          const v = String(cell ?? '').trim();
          if (rowIdx === 0) return HEADER_RENAME[v] ?? cell;   // header row
          if (MISSING_VALUES.has(v) || v === '') return MISSING_CODE;
          const m = v.match(COMMA_DECIMAL);
          if (m) return v.replace(',', '.');                    // 42,1 -> 42.1
          return cell;
        })
      )
    : current.rows;

  const maxCols = Math.max(...displayRows.map(r => r.length));

  // Header row is row 2 in the messy file (rows 0 and 1 are the stray title
  // and note). Used to spot the free-text columns whose blanks are harmless.
  const freeTextCols = new Set<number>();
  (current.rows[2] ?? []).forEach((h, i) => {
    if (FREE_TEXT_HEADERS.has(String(h ?? '').trim().toLowerCase())) freeTextCols.add(i);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>

      {/* Error counter — upper right, only during active boss battle */}
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
          <img src={asset('/assets/dead_mac.png')} alt="" style={{ width: 12, height: 12, imageRendering: 'pixelated', verticalAlign: 'middle', marginRight: 4 }} />
          Boss Battle — find all {bossTotalErrors} data quality issues! Right-click suspicious cells.
        </div>
      )}

      {isBoss && bossFileFixed && (
        <div className="xlsx-fixed-banner">
          Fixed! All data quality issues have been corrected.
        </div>
      )}

      <div className="table-viewer" style={{ flex: 1 }}>
        <table>
          <tbody>
            {displayRows.map((row, rowIdx) => {
              // In fixed mode, row 0 is the header (was row 2 in original)
              const isHeaderRow = bossFileFixed ? rowIdx === 0 : (isBoss ? rowIdx === 2 : rowIdx === 0);
              const isMetaRow = !bossFileFixed && isBoss && (rowIdx === 0 || rowIdx === 1);

              return (
                <tr key={rowIdx} className={isMetaRow ? 'meta-row' : ''}>
                  {!bossFileFixed && <td className="row-num">{rowIdx}</td>}
                  {Array.from({ length: maxCols }, (_, colIdx) => {
                    const cell = String(row[colIdx] ?? '');
                    const Tag = isHeaderRow ? 'th' : 'td';
                    const extraClass = isBoss && !bossFileFixed
                      ? cellClass(rowIdx, colIdx, cell, freeTextCols)
                      : '';

                    // Only show context menu for boss cells during active battle,
                    // or for any cell when boss is not active
                    const canRightClick = !isBoss || isBossBattleActive;

                    return (
                      <Tag
                        key={colIdx}
                        className={extraClass || undefined}
                        onContextMenu={e => {
                          if (!canRightClick) return;
                          e.preventDefault();
                          showContextMenu({
                            x: e.clientX,
                            y: e.clientY,
                            target: { kind: 'cell', path: filePath, row: rowIdx, col: colIdx },
                          });
                        }}
                        title={canRightClick ? `Row ${rowIdx}, Col ${colIdx} — right-click to report` : undefined}
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
