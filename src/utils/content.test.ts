import { describe, expect, it } from 'vitest';

import {
  findCurrent,
  periodStart,
  projectPath,
  seededRandom,
  sortByOrder,
  splitOutcome,
} from './content';

describe('sortByOrder', () => {
  it('sorts ascending by order', () => {
    const items = [
      { id: 'c', order: 3 },
      { id: 'a', order: 1 },
      { id: 'b', order: 2 },
    ];
    expect(sortByOrder(items).map((i) => i.id)).toEqual(['a', 'b', 'c']);
  });

  it('places unordered entries last, keeping their original relative order', () => {
    const items = [{ id: 'x' }, { id: 'b', order: 2 }, { id: 'y' }, { id: 'a', order: 1 }];
    expect(sortByOrder(items).map((i) => i.id)).toEqual(['a', 'b', 'x', 'y']);
  });

  it('is stable for equal order values', () => {
    const items = [
      { id: 'first', order: 1 },
      { id: 'second', order: 1 },
    ];
    expect(sortByOrder(items).map((i) => i.id)).toEqual(['first', 'second']);
  });

  it('does not mutate the input', () => {
    const items = [{ order: 2 }, { order: 1 }];
    const copy = [...items];
    sortByOrder(items);
    expect(items).toEqual(copy);
  });
});

describe('findCurrent', () => {
  it('returns the entry whose period runs to the present', () => {
    const items = [
      { title: 'Old', period: 'Aug 2019 - Jan 2023' },
      { title: 'Now', period: 'Feb 2023 - Present' },
    ];
    expect(findCurrent(items)?.title).toBe('Now');
  });

  it('falls back to the first entry', () => {
    const items = [{ title: 'A', period: '2019 - 2020' }];
    expect(findCurrent(items)?.title).toBe('A');
  });

  it('returns undefined for an empty list', () => {
    expect(findCurrent([])).toBeUndefined();
  });
});

describe('periodStart', () => {
  it('returns the start of a hyphenated period', () => {
    expect(periodStart('Feb 2023 - Present')).toBe('Feb 2023');
  });

  it('handles en and em dashes', () => {
    expect(periodStart('2019 – 2023')).toBe('2019');
    expect(periodStart('2019 — 2023')).toBe('2019');
  });

  it('returns the whole string when there is no range', () => {
    expect(periodStart('2023')).toBe('2023');
  });
});

describe('projectPath', () => {
  it('joins base and slug with a trailing slash', () => {
    expect(projectPath('/portfolio', 'erp')).toBe('/portfolio/projects/erp/');
  });

  it('tolerates a trailing slash on the base', () => {
    expect(projectPath('/portfolio/', 'erp')).toBe('/portfolio/projects/erp/');
    expect(projectPath('/', 'erp')).toBe('/projects/erp/');
  });
});

describe('splitOutcome', () => {
  it('separates the figure from the description', () => {
    expect(splitOutcome('40% faster processing')).toEqual({
      figure: '40%',
      rest: 'faster processing',
    });
  });

  it('handles multipliers and decimals', () => {
    expect(splitOutcome('2.5x more throughput')?.figure).toBe('2.5x');
  });

  it('returns null when there is no leading figure', () => {
    expect(splitOutcome('Faster processing')).toBeNull();
  });
});

describe('seededRandom', () => {
  it('is deterministic per key', () => {
    const a = seededRandom('erp');
    const b = seededRandom('erp');
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it('differs between keys and stays within 0..1', () => {
    const a = seededRandom('erp')();
    const b = seededRandom('cicd')();
    expect(a).not.toBe(b);
    expect(a).toBeGreaterThanOrEqual(0);
    expect(a).toBeLessThan(1);
  });
});
