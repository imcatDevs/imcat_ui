/**
 * State Management - 리액티브 상태 관리
 * @module core/state
 */

/**
 * 리액티브 상태 관리 클래스
 * @class
 * @description 리액티브 상태 관리를 제공하는 클래스입니다.
 * watch, computed 등의 기능으로 상태 변화를 감지하고 자동 UI 업데이트를 지원합니다.
 * 
 * @example
 * const manager = new StateManager();
 * const state = manager.create({ count: 0 });
 */
export class StateManager {
  /**
   * 상태 스토어 생성
   * @param {Object} initialState - 초기 상태
   * @returns {Proxy} 리액티브 상태 객체
   * 
   * @example
   * const store = StateManager.create({
   *   count: 0,
   *   user: null
   * });
   * 
   * // 상태 변경 감지
   * store.watch('count', (newValue, oldValue) => {
   *   console.log(`count: ${oldValue} -> ${newValue}`);
   * });
   * 
   * store.count++; // 자동으로 감지됨
   */
  static create(initialState = {}) {
    const state = new StateStore(initialState);
    return state.getProxy();
  }
}

/**
 * 상태 스토어 내부 클래스
 * @class
 * @private
 * @description 상태를 저장하고 관리하는 내부 클래스입니다.
 */
class StateStore {
  /**
   * StateStore 생성자
   * @constructor
   * @param {Object} initialState - 초기 상태
   */
  constructor(initialState) {
    this._state = { ...initialState };
    this._watchers = new Map(); // key -> [callback, callback, ...]
    this._computedCache = new Map();
    this._computedDeps = new Map();
    this._isUpdating = false;
    this._batchedUpdates = [];
  }

  /**
   * 리액티브 프록시 생성
   */
  getProxy() {
    const self = this;
    
    const proxy = new Proxy(this._state, {
      get(target, property) {
        // 내부 메서드 접근
        if (property === '_store') return self;
        if (property === 'watch') return self.watch.bind(self);
        if (property === 'unwatch') return self.unwatch.bind(self);
        if (property === 'compute') return self.compute.bind(self);
        if (property === 'batch') return self.batch.bind(self);
        if (property === 'getState') return self.getState.bind(self);
        if (property === 'setState') return self.setState.bind(self);
        if (property === 'reset') return self.reset.bind(self);
        if (property === 'destroy') return self.destroy.bind(self);

        return target[property];
      },
      
      set(target, property, value) {
        const oldValue = target[property];
        
        // 값이 같으면 무시
        if (oldValue === value) return true;
        
        // 상태 업데이트
        target[property] = value;
        
        // 배치 모드가 아니면 즉시 알림
        if (!self._isUpdating) {
          self._notifyWatchers(property, value, oldValue);
        } else {
          // 배치 모드면 대기열에 추가
          self._batchedUpdates.push({ property, value, oldValue });
        }
        
        return true;
      }
    });

    return proxy;
  }

  /**
   * 상태 변경 감시
   * @param {string} key - 감시할 키
   * @param {Function} callback - 콜백 (newValue, oldValue)
   * @returns {Function} 구독 취소 함수
   */
  watch(key, callback) {
    if (!this._watchers.has(key)) {
      this._watchers.set(key, []);
    }
    
    this._watchers.get(key).push(callback);
    
    // 구독 취소 함수 반환
    return () => this.unwatch(key, callback);
  }

  /**
   * 감시 취소
   * @param {string} key - 키
   * @param {Function} [callback] - 콜백 (없으면 모두 제거)
   */
  unwatch(key, callback) {
    if (!this._watchers.has(key)) return;
    
    if (callback) {
      const callbacks = this._watchers.get(key);
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
      
      // 콜백이 없으면 키 제거
      if (callbacks.length === 0) {
        this._watchers.delete(key);
      }
    } else {
      // 모든 콜백 제거
      this._watchers.delete(key);
    }
  }

  /**
   * 계산된 속성 (computed property)
   * @param {string} key - 키
   * @param {Function} getter - 계산 함수
   * @returns {*} 계산된 값
   * 
   * @example
   * store.compute('fullName', () => {
   *   return `${store.firstName} ${store.lastName}`;
   * });
   */
  compute(key, getter) {
    const self = this;
    
    // 의존성 추적
    const deps = this._trackDependencies(getter);
    this._computedDeps.set(key, deps);
    
    // 의존성 변경 시 캐시 무효화
    deps.forEach(dep => {
      this.watch(dep, () => {
        this._computedCache.delete(key);
      });
    });
    
    // getter를 상태에 추가
    Object.defineProperty(this._state, key, {
      get: () => {
        if (self._computedCache.has(key)) {
          return self._computedCache.get(key);
        }
        
        // getter를 state 컨텍스트로 실행
        const value = getter.call(self._state);
        self._computedCache.set(key, value);
        return value;
      },
      enumerable: true,
      configurable: true
    });
    
    return this._state[key];
  }

  /**
   * 의존성 추적 (간단한 구현)
   * @private
   */
  _trackDependencies(getter) {
    const deps = new Set();
    const proxy = new Proxy(this._state, {
      get(target, property) {
        deps.add(property);
        return target[property];
      }
    });
    
    // getter 실행하여 의존성 수집
    try {
      getter.call(proxy);
    } catch (e) {
      // 에러 무시 (의존성만 수집)
    }
    
    return Array.from(deps);
  }

  /**
   * 배치 업데이트 (여러 변경을 한 번에)
   * @param {Function} fn - 업데이트 함수
   * 
   * @example
   * store.batch(() => {
   *   store.count++;
   *   store.name = 'John';
   *   store.age = 30;
   * }); // 모든 변경 후 한 번만 알림
   */
  batch(fn) {
    this._isUpdating = true;
    this._batchedUpdates = [];
    
    try {
      fn();
    } finally {
      this._isUpdating = false;
      
      // 배치된 업데이트 알림
      this._batchedUpdates.forEach(({ property, value, oldValue }) => {
        this._notifyWatchers(property, value, oldValue);
      });
      
      this._batchedUpdates = [];
    }
  }

  /**
   * 전체 상태 가져오기
   * @returns {Object} 상태 복사본
   */
  getState() {
    return { ...this._state };
  }

  /**
   * 전체 상태 설정
   * @param {Object} newState - 새 상태
   * @param {boolean} [merge=true] - 병합 여부
   */
  setState(newState, merge = true) {
    this.batch(() => {
      if (merge) {
        Object.keys(newState).forEach(key => {
          this._state[key] = newState[key];
        });
      } else {
        // 전체 교체
        Object.keys(this._state).forEach(key => {
          if (!(key in newState)) {
            delete this._state[key];
          }
        });
        Object.keys(newState).forEach(key => {
          this._state[key] = newState[key];
        });
      }
    });
  }

  /**
   * 초기 상태로 리셋
   * @param {Object} [initialState] - 새 초기 상태 (없으면 빈 객체)
   */
  reset(initialState = {}) {
    this.setState(initialState, false);
  }

  /**
   * 감시자에게 알림
   * @private
   */
  _notifyWatchers(key, newValue, oldValue) {
    if (!this._watchers.has(key)) return;
    
    const callbacks = this._watchers.get(key);
    callbacks.forEach(callback => {
      try {
        callback(newValue, oldValue);
      } catch (error) {
        console.error(`Error in watcher for "${key}":`, error);
      }
    });
  }

  /**
   * 상태 스토어 정리 (메모리 누수 방지)
   * 모든 watcher와 computed 속성을 제거합니다.
   * 
   * @example
   * const state = StateManager.create({ count: 0 });
   * state.watch('count', handler);
   * // 사용 종료 시
   * state.destroy();
   */
  destroy() {
    // 모든 watcher 제거
    this._watchers.clear();
    
    // computed 캐시 및 의존성 제거
    this._computedCache.clear();
    this._computedDeps.clear();
    
    // 배치 업데이트 큐 정리
    this._batchedUpdates = [];
    this._isUpdating = false;
    
    // 상태 초기화
    this._state = {};
  }
}

/**
 * 전역 상태 스토어 (옵션)
 * @class
 * @description 앱 전체에서 공유하는 전역 상태를 관리합니다.
 * 여러 컴포넌트간 상태를 공유할 때 사용합니다.
 * 
 * @example
 * GlobalState.set('user', { name: 'John' });
 * const user = GlobalState.get('user');
 */
export class GlobalState {
  static _stores = new Map();

  /**
   * 전역 스토어 생성 또는 가져오기
   * @param {string} name - 스토어 이름
   * @param {Object} [initialState] - 초기 상태
   * @returns {Proxy} 스토어
   * 
   * @example
   * const userStore = GlobalState.use('user', { id: null, name: '' });
   * const appStore = GlobalState.use('app', { theme: 'light' });
   */
  static use(name, initialState = {}) {
    if (!this._stores.has(name)) {
      this._stores.set(name, StateManager.create(initialState));
    }
    return this._stores.get(name);
  }

  /**
   * 전역 스토어 제거
   * @param {string} name - 스토어 이름
   */
  static remove(name) {
    const store = this._stores.get(name);
    if (store && typeof store.destroy === 'function') {
      store.destroy();
    }
    this._stores.delete(name);
  }

  /**
   * 모든 전역 스토어 제거
   */
  static clear() {
    // 모든 스토어의 destroy() 호출
    this._stores.forEach(store => {
      if (store && typeof store.destroy === 'function') {
        store.destroy();
      }
    });
    this._stores.clear();
  }
}

export default StateManager;
