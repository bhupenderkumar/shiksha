/**
 * App version and build info.
 * __APP_VERSION__ and __BUILD_TIMESTAMP__ are injected at build time by Vite.
 */

declare const __APP_VERSION__: string;
declare const __BUILD_TIMESTAMP__: string;

export const APP_VERSION: string =
  typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '0.0.0-dev';

export const BUILD_TIMESTAMP: string =
  typeof __BUILD_TIMESTAMP__ !== 'undefined' ? __BUILD_TIMESTAMP__ : new Date().toISOString();

/**
 * Returns a short build ID derived from the timestamp (e.g. "20260220-143052")
 */
export function getBuildId(): string {
  const d = new Date(BUILD_TIMESTAMP);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

/**
 * Log version info to console on startup
 */
export function logVersionInfo(): void {
  console.log(
    `%c🎓 Shiksha v${APP_VERSION} (build: ${getBuildId()})`,
    'color: #6366f1; font-weight: bold; font-size: 14px;'
  );
}
