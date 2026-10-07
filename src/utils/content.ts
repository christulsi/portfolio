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
