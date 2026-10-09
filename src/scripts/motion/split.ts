/**
 * NEW: Split an element's text into masked words for staggered reveals.
 *
 * Each word becomes `<span class="split-word"><span class="split-inner">word</span></span>`,
 * with the original whitespace kept as plain text between them. The outer span
 * clips (overflow: hidden) so the inner one can rise into view. No ARIA
 * rewriting is needed: the words stay real inline text, so screen readers and
 * search engines read the heading exactly as before.
 *
 * Only direct text nodes are split; nested elements are left untouched.
 * Idempotent: an element is split at most once.
 */
export function splitWords(el: HTMLElement): HTMLElement[] {
  if (el.dataset.split === 'words') {
    return Array.from(el.querySelectorAll<HTMLElement>('.split-inner'));
  }

  const inners: HTMLElement[] = [];
  const textNodes = Array.from(el.childNodes).filter(
    (node): node is Text => node.nodeType === Node.TEXT_NODE
  );

  for (const node of textNodes) {
    const parts = (node.textContent ?? '').split(/(\s+)/);
    const fragment = document.createDocumentFragment();

    for (const part of parts) {
      if (part === '') continue;
      if (/^\s+$/.test(part)) {
        fragment.appendChild(document.createTextNode(part));
        continue;
      }
      const outer = document.createElement('span');
      outer.className = 'split-word';
      const inner = document.createElement('span');
      inner.className = 'split-inner';
      inner.textContent = part;
      outer.appendChild(inner);
      fragment.appendChild(outer);
      inners.push(inner);
    }

    node.replaceWith(fragment);
  }

  el.dataset.split = 'words';
  return inners;
}
