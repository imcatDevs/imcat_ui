/**
 * State Module 테스트
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StateManager, GlobalState } from '../../src/core/state.js';

describe('State Module', () => {
  describe('StateManager.create()', () => {
    it('초기 상태로 스토어를 생성해야 함', () => {
      const store = StateManager.create({ count: 0, name: 'Test' });
      
      expect(store.count).toBe(0);
      expect(store.name).toBe('Test');
    });

    it('빈 상태로 스토어를 생성할 수 있어야 함', () => {
      const store = StateManager.create();
      
      expect(typeof store).toBe('object');
    });
  });

  describe('상태 변경', () => {
    it('상태를 변경할 수 있어야 함', () => {
      const store = StateManager.create({ count: 0 });
      
      store.count = 10;
      expect(store.count).toBe(10);
    });

    it('새로운 속성을 추가할 수 있어야 함', () => {
      const store = StateManager.create({ count: 0 });
      
      store.name = 'John';
      expect(store.name).toBe('John');
    });

    it('객체와 배열을 저장할 수 있어야 함', () => {
      const store = StateManager.create({
        user: null,
        items: []
      });
      
      store.user = { id: 1, name: 'John' };
      store.items = [1, 2, 3];
      
      expect(store.user.id).toBe(1);
      expect(store.items.length).toBe(3);
    });
  });

  describe('watch() - 상태 감시', () => {
    it('상태 변경을 감지해야 함', () => {
      const store = StateManager.create({ count: 0 });
      const callback = vi.fn();
      
      store.watch('count', callback);
      store.count = 5;
      
      expect(callback).toHaveBeenCalledWith(5, 0);
    });

    it('여러 감시자를 등록할 수 있어야 함', () => {
      const store = StateManager.create({ count: 0 });
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      
      store.watch('count', callback1);
      store.watch('count', callback2);
      store.count = 5;
      
      expect(callback1).toHaveBeenCalledWith(5, 0);
      expect(callback2).toHaveBeenCalledWith(5, 0);
    });

    it('같은 값으로 변경하면 알림이 없어야 함', () => {
      const store = StateManager.create({ count: 0 });
      const callback = vi.fn();
      
      store.watch('count', callback);
      store.count = 0; // 같은 값
      
      expect(callback).not.toHaveBeenCalled();
    });

    it('구독 취소 함수를 반환해야 함', () => {
      const store = StateManager.create({ count: 0 });
      const callback = vi.fn();
      
      const unsubscribe = store.watch('count', callback);
      unsubscribe();
      
      store.count = 5;
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('unwatch() - 감시 취소', () => {
    it('특정 콜백을 제거해야 함', () => {
      const store = StateManager.create({ count: 0 });
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      
      store.watch('count', callback1);
      store.watch('count', callback2);
      
      store.unwatch('count', callback1);
      store.count = 5;
      
      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalledWith(5, 0);
    });

    it('모든 콜백을 제거할 수 있어야 함', () => {
      const store = StateManager.create({ count: 0 });
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      
      store.watch('count', callback1);
      store.watch('count', callback2);
      
      store.unwatch('count'); // 모두 제거
      store.count = 5;
      
      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).not.toHaveBeenCalled();
    });
  });

  describe('batch() - 배치 업데이트', () => {
    it('여러 변경을 한 번에 처리해야 함', () => {
      const store = StateManager.create({ a: 0, b: 0, c: 0 });
      const callback = vi.fn();
      
      store.watch('a', callback);
      
      store.batch(() => {
        store.a = 1;
        store.b = 2;
        store.c = 3;
      });
      
      // batch 후 한 번만 호출
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(1, 0);
    });

    it('배치 내의 모든 변경이 적용되어야 함', () => {
      const store = StateManager.create({ a: 0, b: 0 });
      
      store.batch(() => {
        store.a = 10;
        store.b = 20;
      });
      
      expect(store.a).toBe(10);
      expect(store.b).toBe(20);
    });
  });

  describe('getState() & setState()', () => {
    it('전체 상태를 가져와야 함', () => {
      const store = StateManager.create({ a: 1, b: 2 });
      const state = store.getState();
      
      expect(state).toEqual({ a: 1, b: 2 });
    });

    it('전체 상태를 설정해야 함 (병합 모드)', () => {
      const store = StateManager.create({ a: 1, b: 2 });
      
      store.setState({ b: 20, c: 30 }); // 병합
      
      expect(store.a).toBe(1); // 유지
      expect(store.b).toBe(20); // 변경
      expect(store.c).toBe(30); // 추가
    });

    it('전체 상태를 교체할 수 있어야 함', () => {
      const store = StateManager.create({ a: 1, b: 2 });
      
      store.setState({ c: 30 }, false); // 교체
      
      expect(store.a).toBeUndefined();
      expect(store.b).toBeUndefined();
      expect(store.c).toBe(30);
    });
  });

  describe('reset()', () => {
    it('초기 상태로 리셋해야 함', () => {
      const store = StateManager.create({ count: 0 });
      
      store.count = 10;
      store.reset({ count: 0 });
      
      expect(store.count).toBe(0);
    });

    it('빈 상태로 리셋할 수 있어야 함', () => {
      const store = StateManager.create({ a: 1, b: 2 });
      
      store.reset();
      
      expect(store.a).toBeUndefined();
      expect(store.b).toBeUndefined();
    });
  });

  describe('compute() - 계산된 속성', () => {
    it('계산된 속성을 생성해야 함', () => {
      const store = StateManager.create({
        firstName: 'John',
        lastName: 'Doe'
      });
      
      store.compute('fullName', function() {
        return `${this.firstName} ${this.lastName}`;
      });
      
      expect(store.fullName).toBe('John Doe');
    });

    it('의존성 변경 시 자동으로 재계산해야 함', () => {
      const store = StateManager.create({
        firstName: 'John',
        lastName: 'Doe'
      });
      
      store.compute('fullName', function() {
        return `${this.firstName} ${this.lastName}`;
      });
      
      store.firstName = 'Jane';
      
      expect(store.fullName).toBe('Jane Doe');
    });
  });

  describe('GlobalState', () => {
    beforeEach(() => {
      GlobalState.clear();
    });

    it('전역 스토어를 생성해야 함', () => {
      const store = GlobalState.use('user', { id: null });
      
      expect(store.id).toBe(null);
    });

    it('같은 이름으로 같은 스토어를 반환해야 함', () => {
      const store1 = GlobalState.use('user', { id: 1 });
      const store2 = GlobalState.use('user');
      
      expect(store1).toBe(store2);
      expect(store2.id).toBe(1);
    });

    it('전역 스토어를 제거할 수 있어야 함', () => {
      const store = GlobalState.use('user', { id: 1 });
      store.id = 10;
      
      GlobalState.remove('user');
      
      const newStore = GlobalState.use('user', { id: 1 });
      expect(newStore.id).toBe(1); // 새 스토어
    });

    it('모든 전역 스토어를 제거할 수 있어야 함', () => {
      GlobalState.use('user', { id: 1 });
      GlobalState.use('app', { theme: 'dark' });
      
      GlobalState.clear();
      
      const userStore = GlobalState.use('user', { id: 0 });
      expect(userStore.id).toBe(0); // 새 스토어
    });
  });

  describe('실전 시나리오', () => {
    it('카운터 앱', () => {
      const store = StateManager.create({ count: 0 });
      
      const increment = () => store.count++;
      const decrement = () => store.count--;
      
      increment();
      increment();
      expect(store.count).toBe(2);
      
      decrement();
      expect(store.count).toBe(1);
    });

    it('투두 리스트', () => {
      const store = StateManager.create({
        todos: [],
        filter: 'all'
      });
      
      // 투두 추가
      store.todos = [
        { id: 1, text: 'Learn IMCAT', done: false },
        { id: 2, text: 'Build app', done: false }
      ];
      
      // 투두 완료
      store.todos[0].done = true;
      
      expect(store.todos[0].done).toBe(true);
    });

    it('사용자 인증 상태 관리', () => {
      const store = StateManager.create({
        user: null,
        isLoggedIn: false,
        token: null
      });
      
      const callbacks = {
        onLogin: vi.fn(),
        onLogout: vi.fn()
      };
      
      store.watch('isLoggedIn', (newValue) => {
        if (newValue) {
          callbacks.onLogin();
        } else {
          callbacks.onLogout();
        }
      });
      
      // 로그인
      store.batch(() => {
        store.user = { id: 1, name: 'John' };
        store.token = 'abc123';
        store.isLoggedIn = true;
      });
      
      expect(callbacks.onLogin).toHaveBeenCalled();
      expect(store.user.id).toBe(1);
      
      // 로그아웃
      store.batch(() => {
        store.user = null;
        store.token = null;
        store.isLoggedIn = false;
      });
      
      expect(callbacks.onLogout).toHaveBeenCalled();
    });

    it('쇼핑 카트', () => {
      const store = StateManager.create({
        items: [],
        total: 0
      });
      
      // 총액 자동 계산
      store.compute('total', function() {
        return this.items.reduce((sum, item) => sum + item.price * item.qty, 0);
      });
      
      // 상품 추가
      store.items = [
        { id: 1, name: 'Product A', price: 100, qty: 2 },
        { id: 2, name: 'Product B', price: 50, qty: 1 }
      ];
      
      expect(store.total).toBe(250); // 100*2 + 50*1
      
      // 수량 변경
      store.items[0].qty = 3;
      store.items = [...store.items]; // 참조 변경하여 재계산 트리거
      
      expect(store.total).toBe(350); // 100*3 + 50*1
    });

    it('테마 전환', () => {
      const appStore = GlobalState.use('app', {
        theme: 'light',
        language: 'en'
      });
      
      const onThemeChange = vi.fn();
      appStore.watch('theme', onThemeChange);
      
      // 다크 모드로 전환
      appStore.theme = 'dark';
      
      expect(onThemeChange).toHaveBeenCalledWith('dark', 'light');
      expect(appStore.theme).toBe('dark');
    });
  });
});
