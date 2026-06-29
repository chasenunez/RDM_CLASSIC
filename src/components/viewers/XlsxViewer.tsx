import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { useGame } from '../../GameContext';

interface XlsxViewerProps {
  filePath: string;
}

interface SheetData {
  name: string;
  rows: string[][];
}

const BOSS_FILE = 'soil samples.xlsx';
const MISSING_VALUES = new Set(['-999', 'NA', 'n/a', '??']);

function cellClass(filePath: string, rowIdx: number, cell: string): string {
  if (filePath !== BOSS_FILE) return '';
  if (rowIdx === 0) return 'xlsx-meta-title';
  if (rowIdx === 1) return 'xlsx-meta-note';
  if (rowIdx === 2) return ''; // header row — styled via th
  // Data rows: highlight bad missing values
  if (MISSING_VALUES.has(cell.trim())) return 'xlsx-bad-value';
  if (cell.trim() === '' && rowIdx > 2) return 'xlsx-blank-value';
  return '';
}

export function XlsxViewer({ filePath }: XlsxViewerProps) {
  const { showContextMenu } = useGame();
  const [sheets, setSheets] = useState<SheetData[]>([]);
  const [activeSheet, setActiveSheet] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/files/sample_project/${encodeURIComponent(filePath)}`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.arrayBuffer();
      })
      .then(buf => {
        const wb = XLSX.read(buf, { type: 'array' });
        const parsed: SheetData[] = wb.SheetNames.map(name => {
          const ws = wb.Sheets[name];
          const rows = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1, defval: '' });
          return { name, rows: rows as string[][] };
        });
        setSheets(parsed);
      })
      .catch(e => setError(String(e)));
  }, [filePath]);

  if (error) return <div className="loading-msg">Error parsing xlsx: {error}</div>;
  if (!sheets.length) return <div className="loading-msg">Loading…</div>;

  const current = sheets[activeSheet];
  const maxCols = Math.max(...current.rows.map(r => r.length));
  const isBoss = filePath === BOSS_FILE;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
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

      {isBoss && (
        <div className="xlsx-boss-hint">
          👾 Boss Battle — find all 8 data quality issues! Right-click suspicious cells.
        </div>
      )}

      <div className="table-viewer" style={{ flex: 1 }}>
        <table>
          <tbody>
            {current.rows.map((row, rowIdx) => {
              // For boss battle: rows 0 and 1 are meta rows (not real data)
              const isMetaRow = isBoss && (rowIdx === 0 || rowIdx === 1);
              // Row 2 in boss file is the actual header; row 0 in normal files is header
              const isHeaderRow = isBoss ? rowIdx === 2 : rowIdx === 0;

              return (
                <tr key={rowIdx} className={isMetaRow ? 'meta-row' : ''}>
                  <td className="row-num">{rowIdx}</td>
                  {Array.from({ length: maxCols }, (_, colIdx) => {
                    const cell = String(row[colIdx] ?? '');
                    const Tag = isHeaderRow ? 'th' : 'td';
                    const extraClass = cellClass(filePath, rowIdx, cell);

                    return (
                      <Tag
                        key={colIdx}
                        className={extraClass || undefined}
                        onContextMenu={e => {
                          e.preventDefault();
                          showContextMenu({
                            x: e.clientX,
                            y: e.clientY,
                            target: { kind: 'cell', path: filePath, row: rowIdx, col: colIdx },
                          });
                        }}
                        title={`Row ${rowIdx}, Col ${colIdx} — right-click to report`}
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
