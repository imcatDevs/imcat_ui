/**
 * Theme Module
 * @module modules/theme
 */

/**
 * 테마 관리 모듈
 * @class
 * @description 라이트/다크 테마 전환, 커스텀 테마 적용, 시스템 설정 감지 등을 관리합니다.
 *
 * @example
 * const theme = new Theme({
 *   defaultTheme: 'light',
 *   storageKey: 'app-theme',
 *   transition: true
 * });
 */
export class Theme {
  /**
   * 기본 옵션
   * @static
   * @returns {Object} 기본 설정 객체
   */
  static defaults() {
    return {
      defaultTheme: 'system',           // 기본 테마: 'light', 'dark', 'system'
      storageKey: 'imcat-theme',        // localStorage 키
      transition: true,                 // 테마 전환 애니메이션
      transitionDuration: 500,          // 전환 애니메이션 시간 (ms)
      autoInit: true,                   // 자동 초기화
      customThemes: {},                 // 커스텀 테마 정의
      onChange: null                    // 테마 변경 콜백
    };
  }

  /**
   * Theme 생성자
   * @constructor
   * @param {Object} options - 옵션
   * @param {string} [options.defaultTheme='system'] - 기본 테마
   * @param {string} [options.storageKey='imcat-theme'] - localStorage 키
   * @param {boolean} [options.transition=true] - 전환 애니메이션 활성화
   * @param {number} [options.transitionDuration=500] - 전환 시간
   * @param {boolean} [options.autoInit=true] - 자동 초기화
   * @param {Object} [options.customThemes={}] - 커스텀 테마
   * @param {Function} [options.onChange] - 테마 변경 콜백
   */
  constructor(options = {}) {
    this.options = { ...Theme.defaults(), ...options };

    this.currentTheme = null;
    this.systemTheme = null;
    this.mediaQuery = null;
    this.boundHandlers = {};
    this._transitionTimer = null;

    if (this.options.autoInit) {
      this.init();
    }
  }

  /**
   * 초기화
   * @returns {Theme} this
   */
  init() {
    // 시스템 다크 모드 감지
    this._setupMediaQuery();

    // 저장된 테마 로드 또는 기본 테마 적용
    const savedTheme = this._loadTheme();
    const theme = savedTheme || this.options.defaultTheme;

    this.setTheme(theme, false); // 초기 로드는 애니메이션 없이

    return this;
  }

  /**
   * 테마 설정
   * @param {string} theme - 테마 이름 ('light', 'dark', 'system', 또는 커스텀)
   * @param {boolean} [animate=true] - 전환 애니메이션 적용 여부
   * @returns {Theme} this
   *
   * @example
   * theme.setTheme('dark');
   * theme.setTheme('light', false); // 애니메이션 없이
   */
  setTheme(theme, animate = true) {
    // 전환 애니메이션
    if (animate && this.options.transition) {
      this._enableTransition();
    }

    // 이전 테마 기록
    const oldTheme = this.currentTheme;
    this.currentTheme = theme;

    // 실제 적용할 테마 결정
    const actualTheme = this._resolveTheme(theme);

    // HTML에 테마 적용
    this._applyTheme(actualTheme);

    // 저장
    this._saveTheme(theme);

    // 콜백 실행
    if (this.options.onChange && typeof this.options.onChange === 'function') {
      this.options.onChange(theme, actualTheme, oldTheme);
    }

    // 커스텀 이벤트 발생
    this._dispatchEvent('themechange', {
      theme,
      actualTheme,
      oldTheme
    });

    return this;
  }

  /**
   * 현재 테마 가져오기
   * @returns {string} 현재 테마
   *
   * @example
   * const current = theme.getTheme(); // 'dark'
   */
  getTheme() {
    return this.currentTheme;
  }

  /**
   * 실제 적용된 테마 가져오기
   * @returns {string} 실제 테마 ('light' 또는 'dark')
   *
   * @example
   * theme.setTheme('system');
   * const actual = theme.getActualTheme(); // 'dark' (시스템이 다크 모드인 경우)
   */
  getActualTheme() {
    return this._resolveTheme(this.currentTheme);
  }

  /**
   * 테마 토글
   * @returns {Theme} this
   *
   * @example
   * theme.toggleTheme(); // light ↔ dark
   */
  toggleTheme() {
    const current = this.getActualTheme();
    const newTheme = current === 'dark' ? 'light' : 'dark';
    return this.setTheme(newTheme);
  }

  /**
   * 시스템 테마 감지
   * @returns {string} 시스템 테마 ('light' 또는 'dark')
   *
   * @example
   * const system = theme.getSystemTheme(); // 'dark'
   */
  getSystemTheme() {
    if (window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  }

  /**
   * 커스텀 테마 등록
   * @param {string} name - 테마 이름
   * @param {Object} colors - 색상 맵
   * @returns {Theme} this
   *
   * @example
   * theme.registerCustomTheme('ocean', {
   *   primary: '#0077be',
   *   secondary: '#4fc3f7',
   *   background: '#e0f7fa',
   *   text: '#004d7a'
   * });
   */
  registerCustomTheme(name, colors) {
    this.options.customThemes[name] = colors;
    return this;
  }

  /**
   * 커스텀 테마 적용
   * @param {string} name - 테마 이름
   * @returns {Theme} this
   *
   * @example
   * theme.applyCustomTheme('ocean');
   */
  applyCustomTheme(name) {
    const colors = this.options.customThemes[name];

    if (!colors) {
      console.warn(`Theme: Custom theme "${name}" not found`);
      return this;
    }

    const root = document.documentElement;

    // CSS 변수 적용
    Object.keys(colors).forEach(key => {
      const cssVar = `--${key}-color`;
      root.style.setProperty(cssVar, colors[key]);
    });

    // data-theme 속성 설정
    root.setAttribute('data-theme', name);

    return this;
  }

  /**
   * 테마 리셋 (기본 테마로)
   * @returns {Theme} this
   *
   * @example
   * theme.reset();
   */
  reset() {
    return this.setTheme(this.options.defaultTheme);
  }

  /**
   * 정리 (메모리 누수 방지)
   * @returns {void}
   *
   * @example
   * theme.destroy();
   */
  destroy() {
    // 타이머 정리
    if (this._transitionTimer) {
      clearTimeout(this._transitionTimer);
      this._transitionTimer = null;
    }

    // 미디어 쿼리 리스너 제거
    if (this.mediaQuery && this.boundHandlers.mediaQueryChange) {
      this.mediaQuery.removeEventListener('change', this.boundHandlers.mediaQueryChange);
    }

    // 참조 제거
    this.mediaQuery = null;
    this.boundHandlers = {};
    this.currentTheme = null;
    this.systemTheme = null;
  }

  // ============================================
  // Private Methods
  // ============================================

  /**
   * 미디어 쿼리 설정
   * @private
   */
  _setupMediaQuery() {
    if (!window.matchMedia) return;

    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.systemTheme = this.mediaQuery.matches ? 'dark' : 'light';

    // 시스템 테마 변경 감지
    this.boundHandlers.mediaQueryChange = (e) => {
      this.systemTheme = e.matches ? 'dark' : 'light';

      // 현재 'system' 모드인 경우에만 자동 전환
      if (this.currentTheme === 'system') {
        this._applyTheme(this.systemTheme);

        // 이벤트 발생
        this._dispatchEvent('systemthemechange', {
          theme: this.systemTheme
        });
      }
    };

    this.mediaQuery.addEventListener('change', this.boundHandlers.mediaQueryChange);
  }

  /**
   * 테마 해석 (system → light/dark)
   * @private
   * @param {string} theme - 테마
   * @returns {string} 실제 테마
   */
  _resolveTheme(theme) {
    if (theme === 'system') {
      return this.getSystemTheme();
    }

    // 커스텀 테마인 경우 그대로 반환
    if (this.options.customThemes[theme]) {
      return theme;
    }

    // light 또는 dark
    return theme;
  }

  /**
   * HTML에 테마 적용
   * @private
   * @param {string} theme - 테마
   */
  _applyTheme(theme) {
    const root = document.documentElement;

    // 커스텀 테마인 경우
    if (this.options.customThemes[theme]) {
      this.applyCustomTheme(theme);
      return;
    }

    // 기본 테마 (light/dark)
    if (theme === 'light' || theme === 'dark') {
      root.setAttribute('data-theme', theme);
    } else {
      root.removeAttribute('data-theme');
    }
  }

  /**
   * 전환 애니메이션 활성화
   * @private
   */
  _enableTransition() {
    const root = document.documentElement;
    root.classList.add('theme-transition');

    this._transitionTimer = setTimeout(() => {
      root.classList.remove('theme-transition');
    }, this.options.transitionDuration);
  }

  /**
   * localStorage에 테마 저장
   * @private
   * @param {string} theme - 테마
   */
  _saveTheme(theme) {
    try {
      localStorage.setItem(this.options.storageKey, theme);
    } catch (e) {
      console.warn('Theme: Failed to save theme to localStorage', e);
    }
  }

  /**
   * localStorage에서 테마 로드
   * @private
   * @returns {string|null} 저장된 테마
   */
  _loadTheme() {
    try {
      return localStorage.getItem(this.options.storageKey);
    } catch (e) {
      console.warn('Theme: Failed to load theme from localStorage', e);
      return null;
    }
  }

  /**
   * 커스텀 이벤트 발생
   * @private
   * @param {string} eventName - 이벤트 이름
   * @param {Object} detail - 이벤트 데이터
   */
  _dispatchEvent(eventName, detail) {
    const event = new CustomEvent(`imcat:${eventName}`, {
      detail,
      bubbles: true,
      cancelable: true
    });

    document.dispatchEvent(event);
  }
}

/**
 * 싱글톤 인스턴스 (옵션)
 * @example
 * import { themeInstance } from './theme.js';
 * themeInstance.setTheme('dark');
 */
export const themeInstance = new Theme();

export default Theme;
