/**
 * IMCAT 글로벌 설정
 * @module core/config
 * @description 모든 컴포넌트에 적용되는 기본값을 관리합니다.
 */

import { Utils } from './utils.js';

/**
 * 글로벌 설정 관리자
 * @class
 */
export class Config {
  /**
   * 기본 설정값
   * @private
   */
  static _defaults = {
    // 애니메이션 설정
    animation: true,
    animationDuration: 300,

    // 모듈 CSS 자동 로드 (false면 메인 CSS만 사용)
    autoLoadModuleCSS: false,

    // 오버레이 설정
    backdrop: true,
    backdropClose: true,
    escapeClose: true,

    // 테마 설정
    theme: 'system', // 'light' | 'dark' | 'system'

    // 로케일 설정
    locale: 'ko-KR',
    currency: 'KRW',

    // z-index 설정 (CSS와 일치)
    zIndex: {
      dropdown: 1000,
      modal: 1050,
      drawer: 1050,
      popover: 1060,
      tooltip: 1070,
      loading: 9999,
      toast: 10000,
      notification: 10000
    },

    // 토스트 설정
    toast: {
      duration: 3000,
      position: 'top-right', // 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center'
      maxCount: 5
    },

    // 알림 설정
    notification: {
      duration: 5000,
      position: 'top-right',
      closable: true
    },

    // 모달 설정
    modal: {
      size: 'md', // 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen'
      closeButton: true,
      animation: 'fade' // 'fade' | 'zoom' | 'slide'
    },

    // 드로어 설정
    drawer: {
      position: 'right', // 'left' | 'right' | 'top' | 'bottom'
      width: '320px',
      closeButton: true
    },

    // 드롭다운 설정
    dropdown: {
      position: 'bottom',
      align: 'start',
      offset: 8,
      closeOnClick: true,
      closeOnOutside: true
    },

    // 툴팁 설정
    tooltip: {
      position: 'top',
      delay: 200,
      offset: 8
    },

    // API 설정
    api: {
      baseURL: '',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    },

    // 폼 검증 설정
    form: {
      validateOnBlur: true,
      validateOnInput: false,
      showErrorMessage: true
    },

    // 날짜 형식
    dateFormat: {
      date: { year: 'numeric', month: '2-digit', day: '2-digit' },
      time: { hour: '2-digit', minute: '2-digit' },
      datetime: { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }
    },

    // 디버그 모드
    debug: false
  };

  /**
   * 현재 설정값
   * @private
   */
  static _settings = null;

  /**
   * 설정 변경 리스너들
   * @private
   */
  static _listeners = [];

  /**
   * 설정 초기화
   * @private
   */
  static _init() {
    if (Config._settings === null) {
      Config._settings = Utils.clone(Config._defaults);
    }
  }

  /**
   * 설정 값 설정
   * @param {Object|string} keyOrOptions - 설정 키 또는 옵션 객체
   * @param {*} [value] - 설정 값 (키를 문자열로 전달한 경우)
   * @returns {Object} 현재 설정
   *
   * @example
   * // 객체로 여러 설정 변경
   * IMCAT.config({
   *   animation: false,
   *   theme: 'dark',
   *   locale: 'en-US'
   * });
   *
   * // 단일 설정 변경
   * IMCAT.config('animation', false);
   *
   * // 중첩 설정 변경
   * IMCAT.config('zIndex.modal', 2000);
   */
  static set(keyOrOptions, value) {
    Config._init();

    let changes = {};

    if (typeof keyOrOptions === 'string') {
      // 단일 키 설정
      Config._setNestedValue(Config._settings, keyOrOptions, value);
      changes[keyOrOptions] = value;
    } else if (typeof keyOrOptions === 'object') {
      // 객체로 여러 설정
      Config._settings = Config._deepMerge(Config._settings, keyOrOptions);
      changes = keyOrOptions;
    }

    // 변경 이벤트 발생
    Config._notifyListeners(changes);

    return Config._settings;
  }

  /**
   * 설정 값 조회
   * @param {string} [key] - 설정 키 (없으면 전체 반환)
   * @param {*} [defaultValue] - 기본값
   * @returns {*} 설정 값
   *
   * @example
   * // 전체 설정 조회
   * const settings = IMCAT.config.get();
   *
   * // 단일 설정 조회
   * const animation = IMCAT.config.get('animation');
   *
   * // 중첩 설정 조회
   * const modalZIndex = IMCAT.config.get('zIndex.modal');
   *
   * // 기본값과 함께 조회
   * const custom = IMCAT.config.get('customKey', 'default');
   */
  static get(key, defaultValue) {
    Config._init();

    if (!key) {
      return Utils.clone(Config._settings);
    }

    const value = Config._getNestedValue(Config._settings, key);
    return value !== undefined ? value : defaultValue;
  }

  /**
   * 특정 컴포넌트의 설정 조회 (기본값과 병합)
   * @param {string} component - 컴포넌트 이름
   * @param {Object} [options] - 사용자 옵션
   * @returns {Object} 병합된 옵션
   *
   * @example
   * // 모달 옵션 가져오기
   * const modalOptions = IMCAT.config.getFor('modal', { title: '제목' });
   */
  static getFor(component, options = {}) {
    Config._init();

    const globalOptions = {
      animation: Config._settings.animation,
      animationDuration: Config._settings.animationDuration,
      backdrop: Config._settings.backdrop,
      backdropClose: Config._settings.backdropClose,
      escapeClose: Config._settings.escapeClose
    };

    const componentOptions = Config._settings[component] || {};

    return Utils.extend({}, globalOptions, componentOptions, options);
  }

  /**
   * 설정 초기화 (기본값으로 복원)
   * @param {string} [key] - 특정 키만 초기화 (없으면 전체)
   *
   * @example
   * // 전체 초기화
   * IMCAT.config.reset();
   *
   * // 특정 설정만 초기화
   * IMCAT.config.reset('animation');
   */
  static reset(key) {
    Config._init(); // null 체크
    
    if (key) {
      const defaultValue = Config._getNestedValue(Config._defaults, key);
      if (defaultValue !== undefined) {
        Config._setNestedValue(Config._settings, key, Utils.clone(defaultValue));
        Config._notifyListeners({ [key]: defaultValue });
      }
    } else {
      Config._settings = Utils.clone(Config._defaults);
      Config._notifyListeners(Config._settings);
    }
  }

  /**
   * 설정 변경 리스너 등록
   * @param {Function} callback - 콜백 함수
   * @returns {Function} 구독 해제 함수
   *
   * @example
   * const unsubscribe = IMCAT.config.onChange((changes) => {
   *   console.log('설정 변경:', changes);
   * });
   *
   * // 구독 해제
   * unsubscribe();
   */
  static onChange(callback) {
    Config._listeners.push(callback);
    return () => {
      const index = Config._listeners.indexOf(callback);
      if (index > -1) {
        Config._listeners.splice(index, 1);
      }
    };
  }

  /**
   * 기본값 확장 (플러그인용)
   * @param {Object} defaults - 추가할 기본값
   *
   * @example
   * // 플러그인에서 기본값 추가
   * IMCAT.config.extend({
   *   myPlugin: {
   *     option1: true,
   *     option2: 'value'
   *   }
   * });
   */
  static extend(defaults) {
    Config._defaults = Config._deepMerge(Config._defaults, defaults);
    Config._settings = Config._deepMerge(Config._settings || {}, defaults);
  }

  /**
   * 모든 리스너 정리 (메모리 누수 방지)
   */
  static clearListeners() {
    Config._listeners = [];
  }

  /**
   * 전체 정리 (destroy)
   */
  static destroy() {
    Config._settings = null;
    Config._listeners = [];
  }

  /**
   * 중첩 값 설정
   * @private
   */
  static _setNestedValue(obj, path, value) {
    const keys = path.split('.');
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      if (!(keys[i] in current)) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
  }

  /**
   * 중첩 값 조회
   * @private
   */
  static _getNestedValue(obj, path) {
    const keys = path.split('.');
    let current = obj;

    for (const key of keys) {
      if (current === null || current === undefined || !(key in current)) {
        return undefined;
      }
      current = current[key];
    }

    return current;
  }

  /**
   * 깊은 병합
   * @private
   */
  static _deepMerge(target, source) {
    const result = Utils.clone(target);

    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        if (
          source[key] &&
          typeof source[key] === 'object' &&
          !Array.isArray(source[key]) &&
          result[key] &&
          typeof result[key] === 'object' &&
          !Array.isArray(result[key])
        ) {
          result[key] = Config._deepMerge(result[key], source[key]);
        } else {
          result[key] = Utils.clone(source[key]);
        }
      }
    }

    return result;
  }

  /**
   * 리스너에게 변경 알림
   * @private
   */
  static _notifyListeners(changes) {
    Config._listeners.forEach(callback => {
      try {
        callback(changes, Config._settings);
      } catch (error) {
        console.error('Config change listener error:', error);
      }
    });
  }
}

export default Config;
