import { describe, expect, it } from 'vitest';

import { splitWords } from './split';

function heading(html: string): HTMLElement {
  const el = document.createElement('h2');
  el.innerHTML = html;
  return el;
}

describe('splitWords', () => {
  it('wraps each word in a masked span pair', () => {
    const el = heading('Selected work');
    const inners = splitWords(el);

    expect(inners.map((i) => i.textContent)).toEqual(['Selected', 'work']);
    expect(el.querySelectorAll('.split-word > .split-inner')).toHaveLength(2);
  });

  it('keeps the text content identical for screen readers and search engines', () => {
    const el = heading('  From the people\nI work with ');
    const before = el.textContent;
    splitWords(el);
    expect(el.textContent).toBe(before);
  });

  it('leaves nested elements untouched', () => {
    const el = heading('Hello <em>big</em> world');
    const inners = splitWords(el);

    expect(inners.map((i) => i.textContent)).toEqual(['Hello', 'world']);
    expect(el.querySelector('em')?.textContent).toBe('big');
  });

  it('is idempotent', () => {
    const el = heading('About me');
    splitWords(el);
    const second = splitWords(el);

    expect(second).toHaveLength(2);
    expect(el.querySelectorAll('.split-word')).toHaveLength(2);
  });

  it('handles empty elements', () => {
    expect(splitWords(heading(''))).toEqual([]);
  });
});
