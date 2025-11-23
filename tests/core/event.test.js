/**
 * Event Module 테스트
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventBus } from '../../src/core/event.js';

describe('Event Module', () => {
  let eventBus;

  beforeEach(() => {
    eventBus = new EventBus();
  });

  describe('on()', () => {
    it('이벤트 리스너를 등록해야 함', () => {
      const handler = vi.fn();
      eventBus.on('test', handler);
      eventBus.emit('test');
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('여러 리스너를 등록할 수 있어야 함', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      eventBus.on('test', handler1);
      eventBus.on('test', handler2);
      eventBus.emit('test');
      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(1);
    });

    it('구독 취소 함수를 반환해야 함', () => {
      const handler = vi.fn();
      const unsubscribe = eventBus.on('test', handler);
      unsubscribe();
      eventBus.emit('test');
      expect(handler).not.toHaveBeenCalled();
    });

    it('인자를 핸들러에 전달해야 함', () => {
      const handler = vi.fn();
      eventBus.on('test', handler);
      eventBus.emit('test', 'arg1', 'arg2');
      expect(handler).toHaveBeenCalledWith('arg1', 'arg2');
    });
  });

  describe('once()', () => {
    it('일회성 리스너를 등록해야 함', () => {
      const handler = vi.fn();
      eventBus.once('test', handler);
      eventBus.emit('test');
      eventBus.emit('test');
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('구독 취소 함수를 반환해야 함', () => {
      const handler = vi.fn();
      const unsubscribe = eventBus.once('test', handler);
      unsubscribe();
      eventBus.emit('test');
      expect(handler).not.toHaveBeenCalled();
    });

    it('인자를 핸들러에 전달해야 함', () => {
      const handler = vi.fn();
      eventBus.once('test', handler);
      eventBus.emit('test', 'arg1', 'arg2');
      expect(handler).toHaveBeenCalledWith('arg1', 'arg2');
    });
  });

  describe('off()', () => {
    it('특정 리스너를 제거해야 함', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      eventBus.on('test', handler1);
      eventBus.on('test', handler2);
      eventBus.off('test', handler1);
      eventBus.emit('test');
      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).toHaveBeenCalledTimes(1);
    });

    it('모든 리스너를 제거할 수 있어야 함', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      eventBus.on('test', handler1);
      eventBus.on('test', handler2);
      eventBus.off('test');
      eventBus.emit('test');
      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();
    });

    it('존재하지 않는 이벤트를 제거해도 에러가 발생하지 않아야 함', () => {
      expect(() => {
        eventBus.off('non-existent');
      }).not.toThrow();
    });

    it('존재하지 않는 핸들러를 제거해도 에러가 발생하지 않아야 함', () => {
      const handler = vi.fn();
      expect(() => {
        eventBus.off('test', handler);
      }).not.toThrow();
    });
  });

  describe('emit()', () => {
    it('등록된 모든 리스너를 호출해야 함', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      const handler3 = vi.fn();
      eventBus.on('test', handler1);
      eventBus.on('test', handler2);
      eventBus.on('test', handler3);
      eventBus.emit('test');
      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(1);
      expect(handler3).toHaveBeenCalledTimes(1);
    });

    it('여러 인자를 전달할 수 있어야 함', () => {
      const handler = vi.fn();
      eventBus.on('test', handler);
      eventBus.emit('test', 'arg1', 'arg2', 'arg3');
      expect(handler).toHaveBeenCalledWith('arg1', 'arg2', 'arg3');
    });

    it('객체를 인자로 전달할 수 있어야 함', () => {
      const handler = vi.fn();
      const data = { id: 1, name: 'Test' };
      eventBus.on('test', handler);
      eventBus.emit('test', data);
      expect(handler).toHaveBeenCalledWith(data);
    });

    it('등록된 리스너가 없으면 아무 일도 하지 않아야 함', () => {
      expect(() => {
        eventBus.emit('non-existent');
      }).not.toThrow();
    });

    it('핸들러 에러를 격리해야 함', () => {
      const handler1 = vi.fn(() => {
        throw new Error('Handler error');
      });
      const handler2 = vi.fn();
      
      eventBus.on('test', handler1);
      eventBus.on('test', handler2);
      
      // 에러가 발생해도 다른 핸들러는 실행되어야 함
      eventBus.emit('test');
      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(1);
    });
  });

  describe('clear()', () => {
    it('모든 이벤트 리스너를 제거해야 함', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      eventBus.on('event1', handler1);
      eventBus.on('event2', handler2);
      eventBus.clear();
      eventBus.emit('event1');
      eventBus.emit('event2');
      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();
    });

    it('clear 후에 새 리스너를 등록할 수 있어야 함', () => {
      const handler = vi.fn();
      eventBus.on('test', handler);
      eventBus.clear();
      
      const newHandler = vi.fn();
      eventBus.on('test', newHandler);
      eventBus.emit('test');
      
      expect(handler).not.toHaveBeenCalled();
      expect(newHandler).toHaveBeenCalledTimes(1);
    });
  });

  describe('getEvents()', () => {
    it('등록된 이벤트 목록을 반환해야 함', () => {
      eventBus.on('event1', vi.fn());
      eventBus.on('event2', vi.fn());
      eventBus.on('event3', vi.fn());
      
      const events = eventBus.getEvents();
      expect(events).toContain('event1');
      expect(events).toContain('event2');
      expect(events).toContain('event3');
      expect(events.length).toBe(3);
    });

    it('리스너가 없으면 빈 배열을 반환해야 함', () => {
      const events = eventBus.getEvents();
      expect(events).toEqual([]);
    });
  });

  describe('listenerCount()', () => {
    it('리스너 수를 반환해야 함', () => {
      eventBus.on('test', vi.fn());
      eventBus.on('test', vi.fn());
      eventBus.on('test', vi.fn());
      expect(eventBus.listenerCount('test')).toBe(3);
    });

    it('리스너가 없으면 0을 반환해야 함', () => {
      expect(eventBus.listenerCount('test')).toBe(0);
    });

    it('리스너 제거 후 수가 감소해야 함', () => {
      const handler = vi.fn();
      eventBus.on('test', handler);
      eventBus.on('test', vi.fn());
      expect(eventBus.listenerCount('test')).toBe(2);
      eventBus.off('test', handler);
      expect(eventBus.listenerCount('test')).toBe(1);
    });
  });

  describe('hasListeners()', () => {
    it('리스너가 있으면 true를 반환해야 함', () => {
      eventBus.on('test', vi.fn());
      expect(eventBus.hasListeners('test')).toBe(true);
    });

    it('리스너가 없으면 false를 반환해야 함', () => {
      expect(eventBus.hasListeners('test')).toBe(false);
    });

    it('모든 리스너 제거 후 false를 반환해야 함', () => {
      const handler = vi.fn();
      eventBus.on('test', handler);
      eventBus.off('test', handler);
      expect(eventBus.hasListeners('test')).toBe(false);
    });
  });

  describe('실전 시나리오', () => {
    it('사용자 로그인 이벤트', () => {
      const onLogin = vi.fn();
      const onAnalytics = vi.fn();
      const onWelcome = vi.fn();

      eventBus.on('user:login', onLogin);
      eventBus.on('user:login', onAnalytics);
      eventBus.once('user:login', onWelcome);

      const user = { id: 1, name: 'John' };
      eventBus.emit('user:login', user);

      expect(onLogin).toHaveBeenCalledWith(user);
      expect(onAnalytics).toHaveBeenCalledWith(user);
      expect(onWelcome).toHaveBeenCalledWith(user);

      // 두 번째 로그인 시 once는 실행되지 않음
      eventBus.emit('user:login', user);
      expect(onLogin).toHaveBeenCalledTimes(2);
      expect(onAnalytics).toHaveBeenCalledTimes(2);
      expect(onWelcome).toHaveBeenCalledTimes(1);
    });

    it('데이터 업데이트 이벤트', () => {
      const updateUI = vi.fn();
      const saveToCache = vi.fn();
      const notifyUsers = vi.fn();

      eventBus.on('data:updated', updateUI);
      eventBus.on('data:updated', saveToCache);
      eventBus.on('data:updated', notifyUsers);

      const data = { items: [1, 2, 3], timestamp: Date.now() };
      eventBus.emit('data:updated', data);

      expect(updateUI).toHaveBeenCalledWith(data);
      expect(saveToCache).toHaveBeenCalledWith(data);
      expect(notifyUsers).toHaveBeenCalledWith(data);
    });

    it('에러 처리 이벤트', () => {
      const logError = vi.fn();
      const showNotification = vi.fn();
      const sendToServer = vi.fn();

      eventBus.on('error:occurred', logError);
      eventBus.on('error:occurred', showNotification);
      eventBus.on('error:occurred', sendToServer);

      const error = new Error('Something went wrong');
      eventBus.emit('error:occurred', error, { context: 'API call' });

      expect(logError).toHaveBeenCalledWith(error, { context: 'API call' });
      expect(showNotification).toHaveBeenCalledWith(error, { context: 'API call' });
      expect(sendToServer).toHaveBeenCalledWith(error, { context: 'API call' });
    });
  });
});
