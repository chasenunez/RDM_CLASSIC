import { useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import { useGame, BOSS_FILE } from '../../GameContext';
import { useFileContent } from '../../lib/useFileContent';

interface XlsxViewerProps {
  filePath: string;
}

interface SheetData {
  name: string;
  rows: string[][];
}

const MISSING_VALUES = new Set(['-999', 'NA', 'n/a', '??']);

function cellClass(filePath: string, rowIdx: number, cell: string): string {
  if (filePath !== BOSS_FILE) return '';
  if (rowIdx === 0) return 'xlsx-meta-title';
  if (rowIdx === 1) return 'xlsx-meta-note';
  if (rowIdx === 2) return ''; // header row — styled via th
  if (MISSING_VALUES.has(cell.trim())) return 'xlsx-bad-value';
  if (cell.trim() === '' && rowIdx > 2) return 'xlsx-blank-value';
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

  // Fixed mode: skip meta rows and clean up bad values
  const displayRows = isBoss && bossFileFixed
    ? current.rows.slice(2).map(row =>
        row.map(cell => {
          const v = String(cell ?? '').trim();
          if (MISSING_VALUES.has(v) || v === '') return '';
          return cell;
        })
      )
    : current.rows;

  const maxCols = Math.max(...displayRows.map(r => r.length));

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
          <img src="/icons/Sad Mac.svg" alt="" style={{ width: 12, height: 12, imageRendering: 'pixelated', verticalAlign: 'middle', marginRight: 4 }} />
          Boss Battle — find all {bossTotalErrors} data quality issues! Right-click suspicious cells.
        </div>
      )}

      {isBoss && bossFileFixed && (
        <div className="xlsx-fixed-banner">
          <img src="/icons/Happy Mac.svg" alt="" style={{ width: 12, height: 12, imageRendering: 'pixelated', verticalAlign: 'middle', marginRight: 4 }} />
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
                    const extraClass = bossFileFixed ? '' : cellClass(filePath, rowIdx, cell);

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
