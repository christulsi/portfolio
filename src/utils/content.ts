/**
 * Content Collection Helpers
 */

/**
 * Sort collection entries by their optional `order` field (ascending).
 *
 * Collections load in filename order, which rarely matches the order a reader
 * expects (e.g. newest role first). Entries without an `order` keep their
 * relative position and sort after every ordered entry. Returns a new array.
 */
export function sortByOrder<T extends { order?: number }>(items: readonly T[]): T[] {
  return items
    .map((item, index) => ({ item, index }))
    .sort((a, b) => {
      const ao = a.item.order ?? Number.POSITIVE_INFINITY;
      const bo = b.item.order ?? Number.POSITIVE_INFINITY;
      if (ao === bo) return a.index - b.index;
      return ao < bo ? -1 : 1;
    })
    .map(({ item }) => item);
}

/**
 * Pick the entry whose period is still running ("… - Present"), falling back
 * to the first entry. Used to describe the current role.
 */
export function findCurrent<T extends { period: string }>(items: readonly T[]): T | undefined {
  return items.find((item) => /present/i.test(item.period)) ?? items[0];
}

/**
 * The start of a "Start - End" period string, e.g. "Feb 2023 - Present" → "Feb 2023".
 */
export function periodStart(period: string): string {
  return period.split(/\s+[-–—]\s+/)[0]?.trim() ?? period;
}

/**
 * NEW: URL of a project's detail page under the site base, e.g.
 * ("/portfolio", "erp") → "/portfolio/projects/erp/".
 */
export function projectPath(base: string, slug: string): string {
  return `${base.replace(/\/+$/, '')}/projects/${slug}/`;
}

/**
 * NEW: Split a headline outcome into its figure and the rest, for display:
 * "40% faster processing" → { figure: "40%", rest: "faster processing" }.
 * Returns null when the outcome doesn't start with a number.
 */
export function splitOutcome(outcome: string): { figure: string; rest: string } | null {
  const match = /^([\d.,]+\s?[%x×]?)\s+(.+)$/.exec(outcome.trim());
  return match ? { figure: (match[1] ?? '').replace(/\s+/g, ''), rest: match[2] ?? '' } : null;
}

/**
 * NEW: Small deterministic PRNG (mulberry32) seeded from a string, so
 * generated artwork is stable between builds.
 */
export function seededRandom(key: string): () => number {
  let a = 0;
  for (let i = 0; i < key.length; i++) a = (Math.imul(31, a) + key.charCodeAt(i)) | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
