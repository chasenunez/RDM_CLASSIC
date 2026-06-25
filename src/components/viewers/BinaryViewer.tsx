import React, { useEffect, useState, useCallback } from 'react';
import { useGame } from '../../GameContext';

interface BinaryViewerProps {
  filePath: string;
}

function toHexRows(buf: Uint8Array, bytesPerRow = 16) {
  const rows: { offset: string; hex: string; ascii: string }[] = [];
  for (let i = 0; i < buf.length; i += bytesPerRow) {
    const slice = buf.slice(i, i + bytesPerRow);
    const hex = Array.from(slice)
      .map(b => b.toString(16).padStart(2, '0'))
      .join(' ');
    const ascii = Array.from(slice)
      .map(b => (b >= 32 && b < 127 ? String.fromCharCode(b) : '.'))
      .join('');
    rows.push({
      offset: i.toString(16).padStart(8, '0'),
      hex: hex.padEnd(bytesPerRow * 3 - 1, ' '),
      ascii,
    });
  }
  return rows;
}

// Preview limit — show first 64 bytes as hex + first 20 lines as text (if ASCII)
const PREVIEW_BYTES = 64;

export function BinaryViewer({ filePath }: BinaryViewerProps) {
  const { showContextMenu } = useGame();
  const [hexRows, setHexRows] = useState<ReturnType<typeof toHexRows>>([]);
  const [textPreview, setTextPreview] = useState<string[]>([]);
  const [meta, setMeta] = useState({ size: 0, mime: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/files/sample_project/${encodeURIComponent(filePath)}`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const size = parseInt(r.headers.get('content-length') ?? '0', 10);
        const mime = r.headers.get('content-type') ?? 'unknown';
        setMeta({ size, mime });
        return r.arrayBuffer();
      })
      .then(buf => {
        const bytes = new Uint8Array(buf);
        setHexRows(toHexRows(bytes.slice(0, PREVIEW_BYTES)));

        // Try to decode as UTF-8 text for a friendlier preview
        try {
          const text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
          setTextPreview(text.split('\n').slice(0, 20));
        } catch {
          // Not valid UTF-8 — hex only
        }
      })
      .catch(e => setError(String(e)));
  }, [filePath]);

  const onContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      showContextMenu({
        x: e.clientX,
        y: e.clientY,
        target: { kind: 'file', path: filePath },
      });
    },
    [filePath, showContextMenu],
  );

  if (error) return <div className="loading-msg" style={{ background: '#1a1a1a', color: '#33ff33' }}>Error: {error}</div>;

  return (
    <div className="binary-viewer" onContextMenu={onContextMenu}>
      <div className="binary-viewer__meta">
        File: {filePath} | Size: {meta.size} bytes
        <br />
        Right-click to report a RDM problem (format issue, proprietary format, etc.)
      </div>

      {/* Text preview when readable — .dat files are actually ASCII */}
      {textPreview.length > 0 && (
        <>
          <div className="binary-viewer__meta" style={{ color: '#ffaa00', marginTop: '8px' }}>
            ── Text preview (first 20 lines) ──
          </div>
          {textPreview.map((line, i) => (
            <div key={i} className="binary-viewer__row">
              <span className="binary-viewer__offset">{String(i + 1).padStart(3, ' ')}</span>
              <span style={{ color: '#33ff33' }}>{line}</span>
            </div>
          ))}
          <br />
        </>
      )}

      {/* Hex dump */}
      <div className="binary-viewer__meta" style={{ color: '#ffaa00' }}>
        ── Hex dump (first {PREVIEW_BYTES} bytes) ──
      </div>
      {hexRows.map((row, i) => (
        <div key={i} className="binary-viewer__row">
          <span className="binary-viewer__offset">{row.offset}</span>
          <span className="binary-viewer__hex">{row.hex}</span>
          <span className="binary-viewer__ascii">{row.ascii}</span>
        </div>
      ))}
    </div>
  );
}
