/**
 * Storage Module - localStorage/sessionStorage 래퍼
 * @module core/storage
 */

/**
 * Storage 유틸리티
 * @class
 * @description localStorage/sessionStorage를 편리하게 사용할 수 있는 래퍼 클래스입니다.
 * 자동 직렬화/역직렬화, TTL(만료 시간) 지원을 제공합니다.
 * 
 * @example
 * Storage.set('user', { name: 'John' });
 * const user = Storage.get('user');
 */
export class Storage {
  /**
   * 값 저장
   * @param {string} key - 키
   * @param {*} value - 값 (자동으로 JSON 직렬화)
   * @param {Object} [options={}] - 옵션
   * @param {number} [options.expires] - 만료 시간 (초)
   * @param {string} [options.storage='local'] - 'local' 또는 'session'
   * @returns {boolean} 성공 여부
   * 
   * @example
   * Storage.set('user', { id: 1, name: 'John' });
   * Storage.set('token', 'abc123', { expires: 3600 }); // 1시간 후 만료
   * Storage.set('temp', 'data', { storage: 'session' }); // sessionStorage
   */
  static set(key, value, options = {}) {
    if (!key || typeof key !== 'string') {
      console.error('Storage.set: key must be a non-empty string');
      return false;
    }

    try {
      const storage = options.storage === 'session' ? sessionStorage : localStorage;
      
      const data = {
        value,
        timestamp: Date.now()
      };

      // 만료 시간 설정
      if (options.expires && typeof options.expires === 'number') {
        data.expires = Date.now() + (options.expires * 1000);
      }

      storage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Storage.set error:', error);
      return false;
    }
  }

  /**
   * 값 가져오기
   * @param {string} key - 키
   * @param {*} [defaultValue] - 기본값 (없거나 만료된 경우 반환)
   * @param {string} [storage='local'] - 'local' 또는 'session'
   * @returns {*} 저장된 값 또는 기본값
   * 
   * @example
   * const user = Storage.get('user');
   * const count = Storage.get('count', 0); // 없으면 0 반환
   */
  static get(key, defaultValue = null, storage = 'local') {
    if (!key || typeof key !== 'string') {
      return defaultValue;
    }

    try {
      const storageObj = storage === 'session' ? sessionStorage : localStorage;
      const item = storageObj.getItem(key);

      if (!item) {
        return defaultValue;
      }

      const data = JSON.parse(item);

      // 만료 확인
      if (data.expires && Date.now() > data.expires) {
        this.remove(key, storage);
        return defaultValue;
      }

      return data.value;
    } catch (error) {
      console.error('Storage.get error:', error);
      return defaultValue;
    }
  }

  /**
   * 값 존재 확인
   * @param {string} key - 키
   * @param {string} [storage='local'] - 'local' 또는 'session'
   * @returns {boolean} 존재 여부
   * 
   * @example
   * if (Storage.has('token')) {
   *   // 토큰이 있음
   * }
   */
  static has(key, storage = 'local') {
    if (!key || typeof key !== 'string') {
      return false;
    }

    try {
      const storageObj = storage === 'session' ? sessionStorage : localStorage;
      const item = storageObj.getItem(key);

      if (!item) {
        return false;
      }

      const data = JSON.parse(item);

      // 만료 확인
      if (data.expires && Date.now() > data.expires) {
        this.remove(key, storage);
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 값 제거
   * @param {string} key - 키
   * @param {string} [storage='local'] - 'local' 또는 'session'
   * @returns {boolean} 성공 여부
   * 
   * @example
   * Storage.remove('token');
   */
  static remove(key, storage = 'local') {
    if (!key || typeof key !== 'string') {
      return false;
    }

    try {
      const storageObj = storage === 'session' ? sessionStorage : localStorage;
      storageObj.removeItem(key);
      return true;
    } catch (error) {
      console.error('Storage.remove error:', error);
      return false;
    }
  }

  /**
   * 모든 값 제거
   * @param {string} [storage='local'] - 'local' 또는 'session'
   * @returns {boolean} 성공 여부
   * 
   * @example
   * Storage.clear(); // localStorage 전체 삭제
   * Storage.clear('session'); // sessionStorage 전체 삭제
   */
  static clear(storage = 'local') {
    try {
      const storageObj = storage === 'session' ? sessionStorage : localStorage;
      storageObj.clear();
      return true;
    } catch (error) {
      console.error('Storage.clear error:', error);
      return false;
    }
  }

  /**
   * 모든 키 목록 가져오기
   * @param {string} [storage='local'] - 'local' 또는 'session'
   * @returns {string[]} 키 배열
   * 
   * @example
   * const keys = Storage.keys(); // ['user', 'token', ...]
   */
  static keys(storage = 'local') {
    try {
      const storageObj = storage === 'session' ? sessionStorage : localStorage;
      return Object.keys(storageObj);
    } catch (error) {
      console.error('Storage.keys error:', error);
      return [];
    }
  }

  /**
   * 스토리지 크기 확인 (대략적)
   * @param {string} [storage='local'] - 'local' 또는 'session'
   * @returns {number} 사용 중인 바이트 수 (근사값)
   * 
   * @example
   * const size = Storage.size(); // 1024 (bytes)
   */
  static size(storage = 'local') {
    try {
      const storageObj = storage === 'session' ? sessionStorage : localStorage;
      let total = 0;

      for (let i = 0; i < storageObj.length; i++) {
        const key = storageObj.key(i);
        const value = storageObj.getItem(key);
        if (key && value) {
          total += key.length + value.length;
        }
      }

      return total * 2; // UTF-16이므로 2배
    } catch (error) {
      console.error('Storage.size error:', error);
      return 0;
    }
  }

  /**
   * 만료된 항목 제거
   * @param {string} [storage='local'] - 'local' 또는 'session'
   * @returns {number} 제거된 항목 수
   * 
   * @example
   * const removed = Storage.cleanExpired(); // 만료된 항목 삭제
   */
  static cleanExpired(storage = 'local') {
    try {
      const storageObj = storage === 'session' ? sessionStorage : localStorage;
      const keys = Object.keys(storageObj);
      let removed = 0;

      keys.forEach(key => {
        try {
          const item = storageObj.getItem(key);
          if (item) {
            const data = JSON.parse(item);
            if (data.expires && Date.now() > data.expires) {
              storageObj.removeItem(key);
              removed++;
            }
          }
        } catch (e) {
          // JSON 파싱 실패는 무시
        }
      });

      return removed;
    } catch (error) {
      console.error('Storage.cleanExpired error:', error);
      return 0;
    }
  }
}

export default Storage;
