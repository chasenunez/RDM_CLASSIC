/**
 * Resolve a public asset path against the app's base URL.
 *
 * The app is served from a sub-path on GitHub Pages (e.g. "/RDM_CLASSIC/"),
 * so root-relative literals like "/icons/Trash.png" would 404. Vite exposes
 * the configured base as `import.meta.env.BASE_URL` (always ends with "/",
 * and is just "/" during local dev), so prefixing every runtime asset URL
 * with it makes the same code work at the root and at a sub-path.
 *
 *   asset('/icons/Trash.png')  ->  '/RDM_CLASSIC/icons/Trash.png'  (prod)
 *                              ->  '/icons/Trash.png'              (dev)
 */
export function asset(path: string): string {
  return import.meta.env.BASE_URL + path.replace(/^\//, '');
}
