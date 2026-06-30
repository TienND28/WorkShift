/** Resolve avatar/logo paths for <img src> (Google URLs or /uploads via Vite proxy). */
export function mediaUrl(path?: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("/")) return path;
  return `/${path.replace(/^\//, "")}`;
}
