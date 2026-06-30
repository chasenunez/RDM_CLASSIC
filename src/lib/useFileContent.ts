import { useEffect, useState } from 'react';

// All game files are served from this base path (Vite serves public/ at root).
// Change this if you move the sample project out of public/files/sample_project/.
const FILES_BASE = '/files/sample_project';

/**
 * Fetch a file from the sample project. Shared by every viewer so the path
 * scheme, error handling, and loading state live in exactly one place.
 *
 * Returns `{ data, error }`:
 *   - `data` is `null` while loading, then the file contents.
 *   - `error` is `null` unless the fetch failed.
 *
 * Overloaded by mode: `'text'` yields a string, `'arrayBuffer'` an ArrayBuffer.
 */
export function useFileContent(filePath: string, mode: 'text'): { data: string | null; error: string | null };
export function useFileContent(filePath: string, mode: 'arrayBuffer'): { data: ArrayBuffer | null; error: string | null };
export function useFileContent(filePath: string, mode: 'text' | 'arrayBuffer') {
  const [data, setData] = useState<string | ArrayBuffer | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setData(null);
    setError(null);
    let cancelled = false; // guard against a stale fetch resolving after filePath changes

    (async () => {
      try {
        const r = await fetch(`${FILES_BASE}/${encodeURIComponent(filePath)}`);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const d: string | ArrayBuffer = mode === 'text' ? await r.text() : await r.arrayBuffer();
        if (!cancelled) setData(d);
      } catch (e) {
        if (!cancelled) setError(String(e));
      }
    })();

    return () => { cancelled = true; };
  }, [filePath, mode]);

  return { data, error };
}
