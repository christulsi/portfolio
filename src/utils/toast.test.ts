import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { attachToastEventListeners, ToastManager } from './toast';

function setupContainer() {
  document.body.innerHTML = '<div id="toast-container"></div>';
  return document.getElementById('toast-container') as HTMLElement;
}

describe('ToastManager', () => {
  beforeEach(() => {
    setupContainer();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = '';
  });

  it('appends a toast element to the container with the message text', () => {
    const container = document.getElementById('toast-container')!;
    const mgr = new ToastManager();
    const id = mgr.show({ message: 'Hello world', type: 'info' });

    expect(id).toMatch(/^toast-/);
    expect(container.children.length).toBe(1);
    expect(container.textContent).toContain('Hello world');
    expect(mgr.getActiveCount()).toBe(1);
  });

  it('inserts the message via textContent (does not execute injected HTML)', () => {
    const container = document.getElementById('toast-container')!;
    const mgr = new ToastManager();
    mgr.show({ message: '<img src=x onerror="alert(1)">' });

    // The literal angle-bracketed text must be visible in the rendered DOM,
    // and there must be no injected <img> element.
    expect(container.textContent).toContain('<img src=x onerror="alert(1)">');
    expect(container.querySelector('img')).toBeNull();
  });

  it('applies the right CSS class for each toast type', () => {
    const container = document.getElementById('toast-container')!;
    const mgr = new ToastManager();
    mgr.show({ message: 'ok', type: 'success' });
    mgr.show({ message: 'bad', type: 'error' });
    mgr.show({ message: 'fyi', type: 'info' });

    const toasts = container.querySelectorAll('.toast');
    expect(toasts[0]?.classList.contains('toast-success')).toBe(true);
    expect(toasts[1]?.classList.contains('toast-error')).toBe(true);
    expect(toasts[2]?.classList.contains('toast-info')).toBe(true);
  });

  it('drops the oldest toast when the max-toasts limit is reached', () => {
    const container = document.getElementById('toast-container')!;
    const mgr = new ToastManager('toast-container', 2);
    mgr.show({ message: 'first', duration: 0 });
    mgr.show({ message: 'second', duration: 0 });
    mgr.show({ message: 'third', duration: 0 });

    // dismiss() animates out before removal — fast-forward past it
    vi.advanceTimersByTime(400);

    expect(mgr.getActiveCount()).toBe(2);
    expect(container.textContent).toContain('second');
    expect(container.textContent).toContain('third');
    expect(container.textContent).not.toContain('first');
  });

  it('auto-dismisses after `duration` ms', () => {
    const mgr = new ToastManager();
    mgr.show({ message: 'gone soon', duration: 1000 });
    expect(mgr.getActiveCount()).toBe(1);

    vi.advanceTimersByTime(1000); // auto-dismiss triggers
    vi.advanceTimersByTime(400); // dismiss removal animation
    expect(mgr.getActiveCount()).toBe(0);
  });

  it('keeps the toast indefinitely when duration is 0', () => {
    const mgr = new ToastManager();
    mgr.show({ message: 'sticky', duration: 0 });
    vi.advanceTimersByTime(60_000);
    expect(mgr.getActiveCount()).toBe(1);
  });

  it('dismissAll removes every active toast', () => {
    const mgr = new ToastManager();
    mgr.show({ message: 'a', duration: 0 });
    mgr.show({ message: 'b', duration: 0 });
    mgr.show({ message: 'c', duration: 0 });
    expect(mgr.getActiveCount()).toBe(3);

    mgr.dismissAll();
    vi.advanceTimersByTime(400);
    expect(mgr.getActiveCount()).toBe(0);
  });

  it('clicking the close button dismisses that toast', () => {
    const container = document.getElementById('toast-container')!;
    const mgr = new ToastManager();
    mgr.show({ message: 'closeable', duration: 0 });

    const closeBtn = container.querySelector('.toast-close') as HTMLButtonElement;
    closeBtn.click();
    vi.advanceTimersByTime(400);
    expect(mgr.getActiveCount()).toBe(0);
  });

  it('returns null and warns when the container is missing', () => {
    document.body.innerHTML = '';
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const mgr = new ToastManager();
    expect(mgr.show({ message: 'no host' })).toBeNull();
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});

describe('attachToastEventListeners', () => {
  beforeEach(() => {
    setupContainer();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = '';
  });

  it('shows a toast when `toast:show` is dispatched on window', () => {
    const mgr = new ToastManager();
    attachToastEventListeners(mgr);

    window.dispatchEvent(
      new CustomEvent('toast:show', {
        detail: { message: 'via event', type: 'success', duration: 0 },
      })
    );

    expect(mgr.getActiveCount()).toBe(1);
    expect(document.body.textContent).toContain('via event');
  });

  it('clears all toasts when `toast:dismiss-all` is dispatched', () => {
    const mgr = new ToastManager();
    attachToastEventListeners(mgr);

    window.dispatchEvent(new CustomEvent('toast:show', { detail: { message: 'a', duration: 0 } }));
    window.dispatchEvent(new CustomEvent('toast:show', { detail: { message: 'b', duration: 0 } }));
    expect(mgr.getActiveCount()).toBe(2);

    window.dispatchEvent(new Event('toast:dismiss-all'));
    vi.advanceTimersByTime(400);
    expect(mgr.getActiveCount()).toBe(0);
  });

  it('teardown function unregisters listeners', () => {
    const mgr = new ToastManager();
    const teardown = attachToastEventListeners(mgr);
    teardown();

    window.dispatchEvent(
      new CustomEvent('toast:show', { detail: { message: 'should not appear' } })
    );
    expect(mgr.getActiveCount()).toBe(0);
  });
});
