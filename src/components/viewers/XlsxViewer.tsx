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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Sheet tabs */}
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

      {/* Table */}
      <div className="table-viewer" style={{ flex: 1 }}>
        <table>
          <tbody>
            {current.rows.map((row, rowIdx) => (
              <tr key={rowIdx}>
                <td className="row-num">{rowIdx}</td>
                {Array.from({ length: maxCols }, (_, colIdx) => {
                  const cell = String(row[colIdx] ?? '');
                  const isHeader = rowIdx === 0;
                  const Tag = isHeader ? 'th' : 'td';
                  return (
                    <Tag
                      key={colIdx}
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
