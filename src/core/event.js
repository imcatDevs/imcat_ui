/**
 * 이벤트 시스템
 * @module core/event
 */

/**
 * 이벤트 버스
 * @class
 * @description 전역 이벤트 버스를 통한 publish-subscribe 패턴을 제공합니다.
 * 컴포넌트 간 느슨한 결합으로 통신할 수 있습니다.
 * 
 * @example
 * const bus = new EventBus();
 * bus.on('user:login', (data) => console.log(data));
 * bus.emit('user:login', { username: 'John' });
 */
export class EventBus {
  /**
   * EventBus 생성자
   * @constructor
   */
  constructor() {
    this.events = new Map();
  }

  /**
   * 이벤트 리스너 등록
   * @param {string} event - 이벤트 이름
   * @param {Function} handler - 이벤트 핸들러
   * @returns {Function} 구독 취소 함수
   * 
   * @example
   * const unsubscribe = eventBus.on('user:login', (user) => {
   *   console.log('User logged in:', user);
   * });
   * // 구독 취소
   * unsubscribe();
   */
  on(event, handler) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event).push(handler);

    // 구독 취소 함수 반환
    return () => this.off(event, handler);
  }

  /**
   * 일회성 이벤트 리스너 등록
   * @param {string} event - 이벤트 이름
   * @param {Function} handler - 이벤트 핸들러
   * @returns {Function} 구독 취소 함수
   * 
   * @example
   * eventBus.once('data:loaded', () => {
   *   console.log('Data loaded - this runs only once');
   * });
   */
  once(event, handler) {
    const wrapper = (...args) => {
      handler(...args);
      this.off(event, wrapper);
    };
    return this.on(event, wrapper);
  }

  /**
   * 이벤트 리스너 제거
   * @param {string} event - 이벤트 이름
   * @param {Function} [handler] - 이벤트 핸들러 (없으면 모든 핸들러 제거)
   * 
   * @example
   * eventBus.off('user:login', handler); // 특정 핸들러 제거
   * eventBus.off('user:login'); // 모든 핸들러 제거
   */
  off(event, handler) {
    if (!this.events.has(event)) return;

    if (handler) {
      const handlers = this.events.get(event);
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
      // 핸들러가 없으면 이벤트 자체를 제거
      if (handlers.length === 0) {
        this.events.delete(event);
      }
    } else {
      // 핸들러가 지정되지 않으면 모든 핸들러 제거
      this.events.delete(event);
    }
  }

  /**
   * 이벤트 발생
   * @param {string} event - 이벤트 이름
   * @param {...*} args - 핸들러에 전달할 인자들
   * 
   * @example
   * eventBus.emit('user:login', { id: 1, name: 'John' });
   * eventBus.emit('data:updated', data, timestamp);
   */
  emit(event, ...args) {
    if (!this.events.has(event)) return;

    // 핸들러 배열 복사 (순회 중 변경 방지)
    const handlers = [...this.events.get(event)];
    handlers.forEach(handler => {
      try {
        handler(...args);
      } catch (error) {
        console.error(`Error in event handler for "${event}":`, error);
      }
    });
  }

  /**
   * 모든 리스너 제거
   * 
   * @example
   * eventBus.clear(); // 모든 이벤트 리스너 제거
   */
  clear() {
    this.events.clear();
  }

  /**
   * 등록된 이벤트 목록 조회
   * @returns {string[]} 이벤트 이름 배열
   */
  getEvents() {
    return Array.from(this.events.keys());
  }

  /**
   * 특정 이벤트의 리스너 수 조회
   * @param {string} event - 이벤트 이름
   * @returns {number} 리스너 수
   */
  listenerCount(event) {
    return this.events.has(event) ? this.events.get(event).length : 0;
  }

  /**
   * 이벤트에 리스너가 있는지 확인
   * @param {string} event - 이벤트 이름
   * @returns {boolean}
   */
  hasListeners(event) {
    return this.events.has(event) && this.events.get(event).length > 0;
  }
}

export default EventBus;
