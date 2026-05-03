/**
 * Central class-name mapping.
 *
 * The school renamed its kindergarten classes:
 *   LKG  →  KG-1
 *   UKG  →  KG-2
 *
 * To avoid breaking historical records, the database may still contain old
 * codes ("LKG", "UKG"). All UI surfaces should use `getClassDisplayName()`
 * so parents always see the new, friendly labels (KG-1 / KG-2).
 *
 * When accepting user input (forms, search, share-links), normalise via
 * `normaliseClassName()` so old links keep working.
 */

/** Map of legacy/internal code → friendly display name shown to parents. */
export const CLASS_DISPLAY_MAP: Record<string, string> = {
  LKG: 'KG-1',
  UKG: 'KG-2',
  lkg: 'KG-1',
  ukg: 'KG-2',
  KG: 'KG-1',
  'KG-1': 'KG-1',
  'KG-2': 'KG-2',
  'KG1': 'KG-1',
  'KG2': 'KG-2',
};

/** Reverse map – friendly label → canonical storage code (for any
 *  legacy joins that still expect "LKG"/"UKG"). */
export const CLASS_STORAGE_ALIASES: Record<string, string[]> = {
  'KG-1': ['KG-1', 'LKG', 'KG', 'KG1', 'lkg'],
  'KG-2': ['KG-2', 'UKG', 'KG2', 'ukg'],
};

/** Convert any stored class code to the parent-facing display label. */
export function getClassDisplayName(code?: string | null): string {
  if (!code) return '';
  return CLASS_DISPLAY_MAP[code] ?? CLASS_DISPLAY_MAP[code.trim()] ?? code;
}

/** Normalise free-text input (e.g. from a query string) to its canonical
 *  storage code (KG-1, KG-2, Nursery, …). */
export function normaliseClassName(input?: string | null): string {
  if (!input) return '';
  const v = input.trim();
  // Direct hit on display map
  if (CLASS_DISPLAY_MAP[v]) return CLASS_DISPLAY_MAP[v];
  // Case-insensitive match
  const lower = v.toLowerCase();
  for (const [code, label] of Object.entries(CLASS_DISPLAY_MAP)) {
    if (code.toLowerCase() === lower) return label;
  }
  return v;
}
