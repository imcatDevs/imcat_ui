/**
 * 기본 유틸리티
 * @module core/utils
 */

/**
 * @class
 * @description 다양한 유틸리티 함수를 제공하는 클래스입니다.
 * 타입 체크, 객체 조작, 디바운스/스로틀 등의 기능을 포함합니다.
 * 
 * @example
 * Utils.isString('hello'); // true
 * Utils.debounce(fn, 300);
 */
export class Utils {
  /**
   * 타입 체크 - 문자열
   * @param {*} value - 검사할 값
   * @returns {boolean}
   */
  static isString(value) {
    return typeof value === 'string';
  }

  /**
   * 타입 체크 - 숫자
   * @param {*} value - 검사할 값
   * @returns {boolean}
   */
  static isNumber(value) {
    return typeof value === 'number' && !isNaN(value);
  }

  /**
   * 타입 체크 - 불리언
   * @param {*} value - 검사할 값
   * @returns {boolean}
   */
  static isBoolean(value) {
    return typeof value === 'boolean';
  }

  /**
   * 타입 체크 - 객체
   * @param {*} value - 검사할 값
   * @returns {boolean}
   */
  static isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  /**
   * 타입 체크 - 배열
   * @param {*} value - 검사할 값
   * @returns {boolean}
   */
  static isArray(value) {
    return Array.isArray(value);
  }

  /**
   * 타입 체크 - 함수
   * @param {*} value - 검사할 값
   * @returns {boolean}
   */
  static isFunction(value) {
    return typeof value === 'function';
  }

  /**
   * 타입 체크 - null
   * @param {*} value - 검사할 값
   * @returns {boolean}
   */
  static isNull(value) {
    return value === null;
  }

  /**
   * 타입 체크 - undefined
   * @param {*} value - 검사할 값
   * @returns {boolean}
   */
  static isUndefined(value) {
    return value === undefined;
  }

  /**
   * 타입 체크 - null 또는 undefined
   * @param {*} value - 검사할 값
   * @returns {boolean}
   */
  static isNullOrUndefined(value) {
    return value === null || value === undefined;
  }

  /**
   * 객체 병합 (깊은 병합)
   * @param {Object} target - 대상 객체
   * @param {...Object} sources - 소스 객체들
   * @returns {Object} 병합된 객체
   * 
   * @example
   * Utils.extend({}, { a: 1 }, { b: 2 }); // { a: 1, b: 2 }
   */
  static extend(target, ...sources) {
    sources.forEach(source => {
      if (this.isObject(source)) {
        Object.keys(source).forEach(key => {
          if (this.isObject(source[key]) && this.isObject(target[key])) {
            target[key] = this.extend({}, target[key], source[key]);
          } else {
            target[key] = source[key];
          }
        });
      }
    });
    return target;
  }

  /**
   * 깊은 복사
   * @param {*} obj - 복사할 객체
   * @returns {*} 복사된 객체
   * 
   * @example
   * const copy = Utils.clone({ a: { b: 1 } });
   * 
   * @note
   * - 일반 객체 및 배열만 지원
   * - Date, RegExp, Map, Set, Function 등 특수 객체는 참조로 복사됨
   * - 순환 참조는 처리하지 않음 (스택 오버플로우 발생 가능)
   * - 복잡한 객체는 lodash.cloneDeep 사용 권장
   */
  static clone(obj) {
    if (this.isNullOrUndefined(obj)) return obj;
    if (this.isArray(obj)) return obj.map(item => this.clone(item));
    if (this.isObject(obj)) {
      const cloned = {};
      Object.keys(obj).forEach(key => {
        cloned[key] = this.clone(obj[key]);
      });
      return cloned;
    }
    return obj;
  }

  /**
   * 배열 중복 제거
   * @param {Array} array - 배열
   * @returns {Array} 중복이 제거된 배열
   * 
   * @example
   * Utils.unique([1, 2, 2, 3]); // [1, 2, 3]
   */
  static unique(array) {
    return [...new Set(array)];
  }

  /**
   * 배열 평탄화
   * @param {Array} array - 배열
   * @returns {Array} 평탄화된 배열
   * 
   * @example
   * Utils.flatten([1, [2, [3, 4]]]); // [1, 2, 3, 4]
   */
  static flatten(array) {
    return array.reduce((acc, val) =>
      Array.isArray(val) ? acc.concat(this.flatten(val)) : acc.concat(val), []);
  }

  /**
   * 디바운스 함수 생성
   * @param {Function} func - 디바운스할 함수
   * @param {number} wait - 대기 시간 (ms)
   * @returns {Function} 디바운스된 함수
   * 
   * @example
   * const debouncedSearch = Utils.debounce(search, 300);
   */
  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const context = this; // this 컨텍스트 유지
      const later = () => {
        clearTimeout(timeout);
        func.apply(context, args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * 스로틀 함수 생성
   * @param {Function} func - 스로틀할 함수
   * @param {number} limit - 제한 시간 (ms)
   * @returns {Function} 스로틀된 함수
   * 
   * @example
   * const throttledScroll = Utils.throttle(onScroll, 100);
   */
  static throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      const context = this; // this 컨텍스트 유지
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * 랜덤 ID 생성
   * @param {string} prefix - 접두사 (기본: 'id')
   * @returns {string} 랜덤 ID
   * 
   * @example
   * Utils.randomId('user'); // 'user-abc123xyz'
   */
  static randomId(prefix = 'id') {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 랜덤 정수 생성
   * @param {number} min - 최소값
   * @param {number} max - 최대값
   * @returns {number} 랜덤 정수
   * 
   * @example
   * Utils.randomInt(1, 100); // 1~100 사이의 랜덤 정수
   */
  static randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * 배열 청크 분할
   * @param {Array} array - 배열
   * @param {number} size - 청크 크기
   * @returns {Array[]} 청크 배열
   * 
   * @example
   * Utils.chunk([1, 2, 3, 4, 5], 2); // [[1, 2], [3, 4], [5]]
   */
  static chunk(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * 배열 범위 생성
   * @param {number} start - 시작값
   * @param {number} end - 종료값
   * @param {number} step - 증가값 (기본: 1)
   * @returns {Array} 범위 배열
   * 
   * @example
   * Utils.range(1, 5); // [1, 2, 3, 4, 5]
   * Utils.range(0, 10, 2); // [0, 2, 4, 6, 8, 10]
   */
  static range(start, end, step = 1) {
    const result = [];
    for (let i = start; i <= end; i += step) {
      result.push(i);
    }
    return result;
  }

  /**
   * 문자열 자르기 (말줄임표)
   * @param {string} str - 문자열
   * @param {number} maxLength - 최대 길이
   * @param {string} suffix - 접미사 (기본: '...')
   * @returns {string} 잘린 문자열
   * 
   * @example
   * Utils.truncate('Hello World', 8); // 'Hello...'
   */
  static truncate(str, maxLength, suffix = '...') {
    if (!this.isString(str) || str.length <= maxLength) return str;
    return str.substring(0, maxLength - suffix.length) + suffix;
  }

  /**
   * 카멜케이스 변환
   * @param {string} str - 문자열
   * @returns {string} 카멜케이스 문자열
   * 
   * @example
   * Utils.camelCase('hello-world'); // 'helloWorld'
   * Utils.camelCase('hello_world'); // 'helloWorld'
   */
  static camelCase(str) {
    return str.replace(/[-_](\w)/g, (_, c) => c.toUpperCase());
  }

  /**
   * 케밥케이스 변환
   * @param {string} str - 문자열
   * @returns {string} 케밥케이스 문자열
   * 
   * @example
   * Utils.kebabCase('helloWorld'); // 'hello-world'
   */
  static kebabCase(str) {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }

  /**
   * 첫 글자 대문자
   * @param {string} str - 문자열
   * @returns {string} 첫 글자가 대문자인 문자열
   * 
   * @example
   * Utils.capitalize('hello'); // 'Hello'
   */
  static capitalize(str) {
    if (!this.isString(str) || str.length === 0) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * 지연 실행 (Promise)
   * @param {number} ms - 지연 시간 (ms)
   * @returns {Promise<void>}
   * 
   * @example
   * await Utils.sleep(1000); // 1초 대기
   */
  static sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 객체에서 특정 키만 선택
   * @param {Object} obj - 객체
   * @param {string[]} keys - 선택할 키 배열
   * @returns {Object} 선택된 키만 포함하는 객체
   * 
   * @example
   * Utils.pick({ a: 1, b: 2, c: 3 }, ['a', 'c']); // { a: 1, c: 3 }
   */
  static pick(obj, keys) {
    const result = {};
    keys.forEach(key => {
      if (key in obj) {
        result[key] = obj[key];
      }
    });
    return result;
  }

  /**
   * 객체에서 특정 키 제거
   * @param {Object} obj - 객체
   * @param {string[]} keys - 제거할 키 배열
   * @returns {Object} 키가 제거된 객체
   * 
   * @example
   * Utils.omit({ a: 1, b: 2, c: 3 }, ['b']); // { a: 1, c: 3 }
   */
  static omit(obj, keys) {
    const result = { ...obj };
    keys.forEach(key => {
      delete result[key];
    });
    return result;
  }
}

// 전역 유틸리티로 내보내기
export default Utils;
