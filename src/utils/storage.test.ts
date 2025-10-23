import { describe, it, expect, beforeEach } from 'vitest';

import {
  getStorageItem,
  setStorageItem,
  removeStorageItem,
  clearStorage,
  getStorageJSON,
  setStorageJSON,
} from './storage';

describe('Storage Utilities', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('getStorageItem', () => {
    it('should get an item from localStorage', () => {
      localStorage.setItem('test-key', 'test-value');
      expect(getStorageItem('test-key')).toBe('test-value');
    });

    it('should return null for non-existent key', () => {
      expect(getStorageItem('non-existent')).toBeNull();
    });
  });

  describe('setStorageItem', () => {
    it('should set an item in localStorage', () => {
      const result = setStorageItem('test-key', 'test-value');
      expect(result).toBe(true);
      expect(localStorage.getItem('test-key')).toBe('test-value');
    });
  });

  describe('removeStorageItem', () => {
    it('should remove an item from localStorage', () => {
      localStorage.setItem('test-key', 'test-value');
      const result = removeStorageItem('test-key');
      expect(result).toBe(true);
      expect(localStorage.getItem('test-key')).toBeNull();
    });
  });

  describe('clearStorage', () => {
    it('should clear all items from localStorage', () => {
      localStorage.setItem('key1', 'value1');
      localStorage.setItem('key2', 'value2');
      const result = clearStorage();
      expect(result).toBe(true);
      expect(localStorage.getItem('key1')).toBeNull();
      expect(localStorage.getItem('key2')).toBeNull();
    });
  });

  describe('getStorageJSON', () => {
    it('should parse JSON from localStorage', () => {
      const obj = { foo: 'bar', num: 42 };
      localStorage.setItem('json-key', JSON.stringify(obj));
      expect(getStorageJSON('json-key')).toEqual(obj);
    });

    it('should return null for invalid JSON', () => {
      localStorage.setItem('invalid-json', 'not valid json{');
      expect(getStorageJSON('invalid-json')).toBeNull();
    });

    it('should return null for non-existent key', () => {
      expect(getStorageJSON('non-existent')).toBeNull();
    });
  });

  describe('setStorageJSON', () => {
    it('should stringify and store JSON', () => {
      const obj = { foo: 'bar', num: 42 };
      const result = setStorageJSON('json-key', obj);
      expect(result).toBe(true);
      expect(localStorage.getItem('json-key')).toBe(JSON.stringify(obj));
    });
  });
});
