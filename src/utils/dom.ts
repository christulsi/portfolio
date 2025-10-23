/**
 * DOM Manipulation Utilities
 */

/**
 * Safely query selector with type assertion
 */
export function querySelector<T extends Element = Element>(selector: string): T | null {
  return document.querySelector<T>(selector);
}

/**
 * Safely query all with type assertion
 */
export function querySelectorAll<T extends Element = Element>(selector: string): NodeListOf<T> {
  return document.querySelectorAll<T>(selector);
}

/**
 * Get element by ID with type assertion
 */
export function getElementById<T extends HTMLElement = HTMLElement>(id: string): T | null {
  return document.getElementById(id) as T | null;
}

/**
 * Add class to element(s)
 */
export function addClass(element: Element | NodeListOf<Element>, ...classNames: string[]): void {
  if (element instanceof Element) {
    element.classList.add(...classNames);
  } else {
    element.forEach((el) => el.classList.add(...classNames));
  }
}

/**
 * Remove class from element(s)
 */
export function removeClass(element: Element | NodeListOf<Element>, ...classNames: string[]): void {
  if (element instanceof Element) {
    element.classList.remove(...classNames);
  } else {
    element.forEach((el) => el.classList.remove(...classNames));
  }
}

/**
 * Toggle class on element(s)
 */
export function toggleClass(element: Element | NodeListOf<Element>, className: string): void {
  if (element instanceof Element) {
    element.classList.toggle(className);
  } else {
    element.forEach((el) => el.classList.toggle(className));
  }
}

/**
 * Check if element has class
 */
export function hasClass(element: Element, className: string): boolean {
  return element.classList.contains(className);
}

/**
 * Set attribute on element
 */
export function setAttribute(element: Element, name: string, value: string): void {
  element.setAttribute(name, value);
}

/**
 * Get attribute from element
 */
export function getAttribute(element: Element, name: string): string | null {
  return element.getAttribute(name);
}

/**
 * Remove attribute from element
 */
export function removeAttribute(element: Element, name: string): void {
  element.removeAttribute(name);
}

/**
 * Scroll to element smoothly
 */
export function scrollToElement(
  element: Element | string,
  options: ScrollIntoViewOptions = { behavior: 'smooth' }
): void {
  const el = typeof element === 'string' ? querySelector(element) : element;
  if (el) {
    el.scrollIntoView(options);
  }
}

/**
 * Debounce function calls
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function calls
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function throttle<T extends (...args: any[]) => void>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Check if element is in viewport
 */
export function isInViewport(element: Element): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}
