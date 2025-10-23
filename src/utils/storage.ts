/**
 * LocalStorage Utility Functions
 * Provides type-safe localStorage access with error handling
 */

/**
 * Get item from localStorage with error handling
 */
export function getStorageItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.warn(`Failed to get localStorage item "${key}":`, error);
    return null;
  }
}

/**
 * Set item in localStorage with error handling
 */
export function setStorageItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.warn(`Failed to set localStorage item "${key}":`, error);
    return false;
  }
}

/**
 * Remove item from localStorage with error handling
 */
export function removeStorageItem(key: string): boolean {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.warn(`Failed to remove localStorage item "${key}":`, error);
    return false;
  }
}

/**
 * Clear all localStorage with error handling
 */
export function clearStorage(): boolean {
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.warn('Failed to clear localStorage:', error);
    return false;
  }
}

/**
 * Get JSON item from localStorage with parsing
 */
export function getStorageJSON<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.warn(`Failed to parse JSON from localStorage key "${key}":`, error);
    return null;
  }
}

/**
 * Set JSON item in localStorage with serialization
 */
export function setStorageJSON<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`Failed to stringify JSON for localStorage key "${key}":`, error);
    return false;
  }
}
