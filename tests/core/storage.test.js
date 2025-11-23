/**
 * Storage Module 테스트
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Storage } from '../../src/core/storage.js';

describe('Storage Module', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('set() & get()', () => {
    it('문자열을 저장하고 가져와야 함', () => {
      Storage.set('key', 'value');
      expect(Storage.get('key')).toBe('value');
    });

    it('객체를 저장하고 가져와야 함', () => {
      const obj = { id: 1, name: 'John' };
      Storage.set('user', obj);
      expect(Storage.get('user')).toEqual(obj);
    });

    it('배열을 저장하고 가져와야 함', () => {
      const arr = [1, 2, 3];
      Storage.set('numbers', arr);
      expect(Storage.get('numbers')).toEqual(arr);
    });

    it('숫자를 저장하고 가져와야 함', () => {
      Storage.set('count', 42);
      expect(Storage.get('count')).toBe(42);
    });

    it('boolean을 저장하고 가져와야 함', () => {
      Storage.set('flag', true);
      expect(Storage.get('flag')).toBe(true);
    });

    it('null을 저장하고 가져와야 함', () => {
      Storage.set('nullable', null);
      expect(Storage.get('nullable')).toBe(null);
    });

    it('기본값을 반환해야 함', () => {
      expect(Storage.get('nonexistent', 'default')).toBe('default');
      expect(Storage.get('nonexistent', 0)).toBe(0);
    });

    it('잘못된 키를 처리해야 함', () => {
      expect(Storage.set('', 'value')).toBe(false);
      expect(Storage.set(null, 'value')).toBe(false);
      expect(Storage.get('')).toBe(null);
    });
  });

  describe('expires (만료)', () => {
    it('만료 시간을 설정해야 함', () => {
      Storage.set('temp', 'value', { expires: 1 }); // 1초
      expect(Storage.get('temp')).toBe('value');
    });

    it('만료된 값은 null을 반환해야 함', async () => {
      Storage.set('temp', 'value', { expires: 1 }); // 1초
      
      // 1.1초 대기
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      expect(Storage.get('temp')).toBe(null);
    });

    it('만료되지 않은 값은 가져와야 함', async () => {
      Storage.set('temp', 'value', { expires: 10 }); // 10초
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(Storage.get('temp')).toBe('value');
    });
  });

  describe('sessionStorage', () => {
    it('sessionStorage에 저장해야 함', () => {
      Storage.set('session-key', 'session-value', { storage: 'session' });
      expect(Storage.get('session-key', null, 'session')).toBe('session-value');
    });

    it('localStorage와 sessionStorage는 독립적이어야 함', () => {
      Storage.set('key', 'local-value', { storage: 'local' });
      Storage.set('key', 'session-value', { storage: 'session' });

      expect(Storage.get('key', null, 'local')).toBe('local-value');
      expect(Storage.get('key', null, 'session')).toBe('session-value');
    });
  });

  describe('has()', () => {
    it('존재하는 키는 true를 반환해야 함', () => {
      Storage.set('key', 'value');
      expect(Storage.has('key')).toBe(true);
    });

    it('존재하지 않는 키는 false를 반환해야 함', () => {
      expect(Storage.has('nonexistent')).toBe(false);
    });

    it('만료된 키는 false를 반환해야 함', async () => {
      Storage.set('temp', 'value', { expires: 1 });
      
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      expect(Storage.has('temp')).toBe(false);
    });
  });

  describe('remove()', () => {
    it('값을 제거해야 함', () => {
      Storage.set('key', 'value');
      expect(Storage.has('key')).toBe(true);

      Storage.remove('key');
      expect(Storage.has('key')).toBe(false);
    });

    it('sessionStorage에서 값을 제거해야 함', () => {
      Storage.set('key', 'value', { storage: 'session' });
      expect(Storage.has('key', 'session')).toBe(true);

      Storage.remove('key', 'session');
      expect(Storage.has('key', 'session')).toBe(false);
    });
  });

  describe('clear()', () => {
    it('모든 localStorage 값을 제거해야 함', () => {
      Storage.set('key1', 'value1');
      Storage.set('key2', 'value2');
      Storage.set('key3', 'value3');

      Storage.clear();

      expect(Storage.has('key1')).toBe(false);
      expect(Storage.has('key2')).toBe(false);
      expect(Storage.has('key3')).toBe(false);
    });

    it('sessionStorage만 제거해야 함', () => {
      Storage.set('local-key', 'value', { storage: 'local' });
      Storage.set('session-key', 'value', { storage: 'session' });

      Storage.clear('session');

      expect(Storage.has('local-key', 'local')).toBe(true);
      expect(Storage.has('session-key', 'session')).toBe(false);
    });
  });

  describe('keys()', () => {
    it('모든 키를 반환해야 함', () => {
      Storage.set('key1', 'value1');
      Storage.set('key2', 'value2');
      Storage.set('key3', 'value3');

      const keys = Storage.keys();
      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
      expect(keys).toContain('key3');
    });

    it('sessionStorage의 키를 반환해야 함', () => {
      Storage.set('local-key', 'value', { storage: 'local' });
      Storage.set('session-key', 'value', { storage: 'session' });

      const localKeys = Storage.keys('local');
      const sessionKeys = Storage.keys('session');

      expect(localKeys).toContain('local-key');
      expect(sessionKeys).toContain('session-key');
    });
  });

  describe('size()', () => {
    it('스토리지 크기를 반환해야 함', () => {
      Storage.clear();
      
      const initialSize = Storage.size();
      Storage.set('key', 'value');
      const afterSize = Storage.size();

      expect(afterSize).toBeGreaterThan(initialSize);
    });
  });

  describe('cleanExpired()', () => {
    it('만료된 항목만 제거해야 함', async () => {
      Storage.set('expired1', 'value', { expires: 1 });
      Storage.set('expired2', 'value', { expires: 1 });
      Storage.set('valid', 'value', { expires: 10 });

      await new Promise(resolve => setTimeout(resolve, 1100));

      const removed = Storage.cleanExpired();

      expect(removed).toBe(2);
      expect(Storage.has('expired1')).toBe(false);
      expect(Storage.has('expired2')).toBe(false);
      expect(Storage.has('valid')).toBe(true);
    });

    it('만료 시간이 없는 항목은 유지해야 함', async () => {
      Storage.set('permanent', 'value');
      Storage.set('temp', 'value', { expires: 1 });

      await new Promise(resolve => setTimeout(resolve, 1100));

      Storage.cleanExpired();

      expect(Storage.has('permanent')).toBe(true);
      expect(Storage.has('temp')).toBe(false);
    });
  });

  describe('실전 시나리오', () => {
    it('사용자 세션 관리', () => {
      const user = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        token: 'abc123'
      };

      // 1시간 동안 유효한 세션
      Storage.set('session', user, { expires: 3600 });

      const session = Storage.get('session');
      expect(session.id).toBe(1);
      expect(session.token).toBe('abc123');

      // 로그아웃
      Storage.remove('session');
      expect(Storage.has('session')).toBe(false);
    });

    it('설정 저장 및 불러오기', () => {
      const settings = {
        theme: 'dark',
        language: 'ko',
        notifications: true
      };

      Storage.set('app-settings', settings);

      const loaded = Storage.get('app-settings', {
        theme: 'light',
        language: 'en',
        notifications: false
      });

      expect(loaded.theme).toBe('dark');
      expect(loaded.language).toBe('ko');
    });

    it('장바구니 관리', () => {
      const cart = [
        { id: 1, name: 'Product A', quantity: 2 },
        { id: 2, name: 'Product B', quantity: 1 }
      ];

      Storage.set('shopping-cart', cart);

      // 상품 추가
      const currentCart = Storage.get('shopping-cart', []);
      currentCart.push({ id: 3, name: 'Product C', quantity: 3 });
      Storage.set('shopping-cart', currentCart);

      const updated = Storage.get('shopping-cart');
      expect(updated.length).toBe(3);
      expect(updated[2].id).toBe(3);
    });

    it('임시 데이터 자동 만료', async () => {
      // 검색 결과를 5초간 캐싱
      const searchResults = [
        { id: 1, title: 'Result 1' },
        { id: 2, title: 'Result 2' }
      ];

      Storage.set('search:results', searchResults, { expires: 1 });

      // 즉시 조회 - 있음
      expect(Storage.get('search:results')).toEqual(searchResults);

      // 1초 후 - 만료됨
      await new Promise(resolve => setTimeout(resolve, 1100));
      expect(Storage.get('search:results')).toBe(null);
    });
  });
});
