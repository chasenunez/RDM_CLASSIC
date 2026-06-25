import { useEffect, useState } from 'react';
import Papa from 'papaparse';
import { useGame } from '../../GameContext';

interface CsvViewerProps {
  filePath: string;
}

export function CsvViewer({ filePath }: CsvViewerProps) {
  const { showContextMenu } = useGame();
  const [rows, setRows] = useState<string[][]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/files/sample_project/${encodeURIComponent(filePath)}`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
      })
      .then(text => {
        const result = Papa.parse<string[]>(text, { skipEmptyLines: false });
        setRows(result.data);
      })
      .catch(e => setError(String(e)));
  }, [filePath]);

  if (error) return <div className="loading-msg">Error: {error}</div>;
  if (!rows.length) return <div className="loading-msg">Loading…</div>;

  // Determine max columns across all rows (rows can be jagged)
  const maxCols = Math.max(...rows.map(r => r.length));

  return (
    <div className="table-viewer">
      <table>
        <tbody>
          {rows.map((row, rowIdx) => {
            // Rows 0 and 1 in soil_samples_preview.csv are project metadata
            // (title + note), not actual data rows — styled differently so
            // players notice the structural violation.
            const isMeta = filePath === 'soil_samples_preview.csv' && rowIdx < 2;

            return (
              <tr key={rowIdx} className={isMeta ? 'meta-row' : ''}>
                <td className="row-num">{rowIdx}</td>
                {Array.from({ length: maxCols }, (_, colIdx) => {
                  const cell = row[colIdx] ?? '';
                  return (
                    <td
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
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
