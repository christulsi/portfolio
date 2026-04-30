/**
 * Toast Notification Manager
 *
 * Renders ephemeral notifications into a `#toast-container` element rendered
 * by `Toast.astro`. Decoupled from any specific component so it can be
 * unit-tested with happy-dom and reused outside Astro if needed.
 *
 * The Astro component wires this up to `toast:show` / `toast:dismiss-all`
 * `CustomEvent`s on `window` — callers should dispatch those events rather
 * than importing `ToastManager` directly.
 */

export type ToastType = 'success' | 'error' | 'info';

export interface ToastOptions {
  message: string;
  type?: ToastType;
  duration?: number;
}

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
  element: HTMLElement;
}

const COLOR_CLASSES: Record<ToastType, string> = {
  success:
    'bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800',
  error:
    'bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800',
  info: 'bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800',
};

const ICON_SVGS: Record<ToastType, string> = {
  success:
    '<svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>',
  error:
    '<svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>',
  info: '<svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>',
};

const CLOSE_ICON_SVG =
  '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>';

const DEFAULT_DURATION_MS = 5000;
const DISMISS_ANIMATION_MS = 300;

export class ToastManager {
  private container: HTMLElement | null;

  private toasts: Toast[] = [];

  private maxToasts: number;

  constructor(containerId = 'toast-container', maxToasts = 3) {
    this.container = document.getElementById(containerId);
    this.maxToasts = maxToasts;
    if (!this.container) {
      // eslint-disable-next-line no-console
      console.warn(`Toast container "#${containerId}" not found`);
    }
  }

  show(options: ToastOptions): string | null {
    if (!this.container) return null;

    const type = options.type ?? 'info';
    const duration = options.duration ?? DEFAULT_DURATION_MS;
    const id = `toast-${Date.now()}-${Math.random()}`;

    const element = this.createToastElement(id, options.message, type, duration);
    const toast: Toast = { id, message: options.message, type, duration, element };

    // Drop oldest when over the limit
    if (this.toasts.length >= this.maxToasts && this.toasts[0]) {
      this.dismiss(this.toasts[0].id);
    }

    this.toasts.push(toast);
    this.container.appendChild(element);

    // Trigger entrance animation on next frame (rAF is unavailable in some test
    // environments — fall back to immediate add).
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(() => element.classList.add('toast-show'));
    } else {
      element.classList.add('toast-show');
    }

    if (duration > 0) {
      setTimeout(() => this.dismiss(id), duration);
    }

    return id;
  }

  dismiss(id: string): void {
    const index = this.toasts.findIndex((t) => t.id === id);
    if (index === -1) return;
    const toast = this.toasts[index];
    if (!toast) return;

    toast.element.classList.remove('toast-show');
    toast.element.classList.add('toast-hide');

    setTimeout(() => {
      toast.element.remove();
      const stillThereIndex = this.toasts.findIndex((t) => t.id === id);
      if (stillThereIndex !== -1) this.toasts.splice(stillThereIndex, 1);
    }, DISMISS_ANIMATION_MS);
  }

  dismissAll(): void {
    // Copy first — dismiss() mutates the list asynchronously.
    [...this.toasts].forEach((t) => this.dismiss(t.id));
  }

  /** Test/inspection helper. Not part of the public API. */
  getActiveCount(): number {
    return this.toasts.length;
  }

  private createToastElement(
    toastId: string,
    message: string,
    type: ToastType,
    duration: number
  ): HTMLElement {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type} pointer-events-auto`;
    toast.dataset.toastId = toastId;

    // Build the toast DOM safely. Icon SVGs and chrome are trusted static
    // strings; the user-supplied `message` is inserted via textContent so it
    // cannot inject HTML even if a caller passes untrusted input.
    const wrapper = document.createElement('div');
    const baseClasses =
      'flex items-start gap-3 p-4 rounded-xl border backdrop-blur-xl shadow-lg relative overflow-hidden';
    wrapper.className = `${baseClasses} ${COLOR_CLASSES[type]}`;

    const iconHost = document.createElement('span');
    iconHost.className = 'flex-shrink-0';
    iconHost.innerHTML = ICON_SVGS[type];
    wrapper.appendChild(iconHost);

    const messageEl = document.createElement('p');
    messageEl.className = 'flex-grow text-sm font-medium';
    messageEl.textContent = message;
    wrapper.appendChild(messageEl);

    const closeBtn = document.createElement('button');
    closeBtn.className =
      'toast-close flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity';
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.innerHTML = CLOSE_ICON_SVG;
    wrapper.appendChild(closeBtn);

    if (duration > 0) {
      const progress = document.createElement('div');
      progress.className = 'toast-progress absolute bottom-0 left-0 h-1 bg-current opacity-30';
      progress.style.animation = `progress ${duration}ms linear forwards`;
      wrapper.appendChild(progress);
    }

    toast.appendChild(wrapper);

    closeBtn.addEventListener('click', () => this.dismiss(toastId));

    return toast;
  }
}

/**
 * Wires a `ToastManager` to the `toast:show` / `toast:dismiss-all` window
 * events. Returns a teardown function that removes the listeners (useful for
 * tests and HMR; production code can ignore the return value).
 */
export function attachToastEventListeners(manager: ToastManager): () => void {
  const onShow = (ev: Event) => {
    const { detail } = ev as CustomEvent<ToastOptions>;
    if (detail) manager.show(detail);
  };
  const onDismissAll = () => manager.dismissAll();

  window.addEventListener('toast:show', onShow);
  window.addEventListener('toast:dismiss-all', onDismissAll);

  return () => {
    window.removeEventListener('toast:show', onShow);
    window.removeEventListener('toast:dismiss-all', onDismissAll);
  };
}
