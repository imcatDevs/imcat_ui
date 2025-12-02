/**
 * Theme Module
 * @module modules/theme
 * @description 라이트/다크 모드 및 커스텀 테마 관리 (전환 효과 포함)
 */

/**
 * 테마 관리 클래스
 * @class Theme
 * @description View Transitions API를 활용한 고급 테마 전환 효과 지원
 *
 * @example
 * const theme = new Theme({
 *   defaultTheme: 'system',
 *   transition: 'circle',
 *   transitionDuration: 800
 * });
 *
 * // 클릭 위치 기반 전환
 * button.addEventListener('click', (e) => {
 *   theme.toggleWithEvent(e);
 * });
 */
export class Theme {
  /**
   * 전환 효과 타입
   * @static
   */
  static TRANSITIONS = {
    NONE: 'none',
    FADE: 'fade',
    SLIDE: 'slide',
    CIRCLE: 'circle',
    CIRCLE_TOP_LEFT: 'circle-top-left',
    CIRCLE_TOP_RIGHT: 'circle-top-right',
    CIRCLE_BOTTOM_LEFT: 'circle-bottom-left',
    CIRCLE_BOTTOM_RIGHT: 'circle-bottom-right',
    CIRCLE_CENTER: 'circle-center'
  };

  /**
   * 기본 옵션
   * @static
   * @returns {Object} 기본 설정 객체
   */
  static defaults() {
    return {
      defaultTheme: 'system',           // 기본 테마: 'light', 'dark', 'system'
      storageKey: 'imcat-theme',        // localStorage 키
      transition: 'none',               // 전환 효과: 'none', 'fade', 'slide', 'circle', 'circle-*'
      transitionDuration: 800,          // 전환 애니메이션 시간 (ms)
      themes: {},                       // 커스텀 테마 정의
      onChange: null                    // 테마 변경 콜백
    };
  }

  /**
   * Theme 생성자
   * @constructor
   * @param {Object} options - 옵션
   * @param {string} [options.defaultTheme='system'] - 기본 테마 ('light', 'dark', 'system')
   * @param {string} [options.storageKey='imcat-theme'] - localStorage 키
   * @param {string} [options.transition='none'] - 전환 효과 타입
   * @param {number} [options.transitionDuration=800] - 전환 시간 (ms)
   * @param {Object} [options.themes={}] - 커스텀 테마 정의
   * @param {Function} [options.onChange] - 테마 변경 콜백
   */
  constructor(options = {}) {
    this.options = { ...Theme.defaults(), ...options };

    this._isTransitioning = false;
    this._currentTheme = null;
    this._listeners = new Set();
    this._mediaQuery = null;
    this._mediaQueryHandler = null;

    // 빌트인 테마 CSS 변수
    this._builtInThemes = {
      light: {
        '--text-primary': '#111827',
        '--text-secondary': '#4b5563',
        '--text-muted': '#9ca3af',
        '--text-inverse': '#ffffff',
        '--bg-primary': '#ffffff',
        '--bg-secondary': '#f9fafb',
        '--bg-tertiary': '#f3f4f6',
        '--border-color': '#e5e7eb',
        '--border-color-dark': '#d1d5db'
      },
      dark: {
        '--text-primary': '#f3f4f6',
        '--text-secondary': '#9ca3af',
        '--text-muted': '#6b7280',
        '--text-inverse': '#111827',
        '--bg-primary': '#111827',
        '--bg-secondary': '#1f2937',
        '--bg-tertiary': '#374151',
        '--border-color': '#374151',
        '--border-color-dark': '#4b5563'
      }
    };

    this._init();
  }

  /**
   * 초기화
   * @private
   */
  _init() {
    const saved = this._getSavedTheme();
    const theme = saved || this.options.defaultTheme;

    this._setupSystemThemeDetection();
    this.set(theme, false, false);
  }

  /**
   * 시스템 테마 감지 설정
   * @private
   */
  _setupSystemThemeDetection() {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    this._mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    this._mediaQueryHandler = (e) => {
      if (this._currentTheme === 'system') {
        this._applyTheme(e.matches ? 'dark' : 'light', false);
        this._notifyListeners();
        this._dispatchEvent('systemthemechange', { theme: e.matches ? 'dark' : 'light' });
      }
    };

    if (this._mediaQuery.addEventListener) {
      this._mediaQuery.addEventListener('change', this._mediaQueryHandler);
    } else {
      this._mediaQuery.addListener(this._mediaQueryHandler);
    }
  }

  /**
   * 저장된 테마 가져오기
   * @private
   * @returns {string|null}
   */
  _getSavedTheme() {
    if (typeof localStorage === 'undefined') return null;
    try {
      return localStorage.getItem(this.options.storageKey);
    } catch {
      return null;
    }
  }

  /**
   * 테마 저장
   * @private
   * @param {string} theme
   */
  _saveTheme(theme) {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(this.options.storageKey, theme);
    } catch {
      // Storage 에러 무시
    }
  }

  // ============================================
  // 전환 효과 메서드
  // ============================================

  /**
   * 테마 CSS 변수 적용 (전환 효과 포함)
   * @private
   * @param {string} themeName - 실제 적용할 테마 ('light' 또는 'dark')
   * @param {boolean} [animate=true] - 전환 애니메이션 적용 여부
   */
  _applyTheme(themeName, animate = true) {
    const { transition } = this.options;

    if (animate && transition !== 'none' && !this._isTransitioning) {
      this._applyWithTransition(themeName);
    } else {
      this._applyThemeImmediate(themeName);
    }
  }

  /**
   * 테마 즉시 적용 (전환 효과 없음)
   * @private
   * @param {string} themeName
   */
  _applyThemeImmediate(themeName) {
    const root = document.documentElement;

    root.classList.remove('theme-light', 'theme-dark');
    root.classList.add(`theme-${themeName}`);
    root.dataset.theme = themeName;

    const themeVars = this.options.themes[themeName] || this._builtInThemes[themeName];

    if (themeVars) {
      Object.entries(themeVars).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });
    }

    this._updateMetaThemeColor(themeName);
  }

  /**
   * 전환 효과와 함께 테마 적용
   * @private
   * @param {string} themeName
   */
  _applyWithTransition(themeName) {
    const { transition, transitionDuration } = this.options;
    this._isTransitioning = true;

    switch (transition) {
      case 'fade':
        this._transitionFade(themeName, transitionDuration);
        break;
      case 'slide':
        this._transitionSlide(themeName, transitionDuration);
        break;
      case 'circle':
      case 'circle-bottom-right':
        this._transitionCircle(themeName, transitionDuration, 'bottom-right');
        break;
      case 'circle-top-left':
        this._transitionCircle(themeName, transitionDuration, 'top-left');
        break;
      case 'circle-top-right':
        this._transitionCircle(themeName, transitionDuration, 'top-right');
        break;
      case 'circle-bottom-left':
        this._transitionCircle(themeName, transitionDuration, 'bottom-left');
        break;
      case 'circle-center':
        this._transitionCircle(themeName, transitionDuration, 'center');
        break;
      default:
        this._applyThemeImmediate(themeName);
        this._isTransitioning = false;
    }
  }

  /**
   * 페이드 전환 효과
   * @private
   */
  _transitionFade(themeName, duration) {
    if (document.startViewTransition) {
      this._transitionFadeNative(themeName, duration);
    } else {
      this._transitionFadeFallback(themeName, duration);
    }
  }

  /**
   * View Transitions API를 사용한 페이드 전환
   * @private
   */
  _transitionFadeNative(themeName, duration) {
    const styleId = 'imcat-view-transition-style';
    let styleEl = document.getElementById(styleId);
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }

    styleEl.textContent = `
      ::view-transition-old(root) {
        animation: fade-out ${duration}ms ease-out forwards;
      }
      ::view-transition-new(root) {
        animation: fade-in ${duration}ms ease-out forwards;
      }
      @keyframes fade-out {
        from { opacity: 1; }
        to { opacity: 0; }
      }
      @keyframes fade-in {
        from { opacity: 0; }
        to { opacity: 1; }
      }
    `;

    const transition = document.startViewTransition(() => {
      this._applyThemeImmediate(themeName);
    });

    transition.finished.then(() => {
      this._isTransitioning = false;
    }).catch(() => {
      this._isTransitioning = false;
    });
  }

  /**
   * 페이드 전환 폴백
   * @private
   */
  _transitionFadeFallback(themeName, duration) {
    const overlay = this._createOverlay();
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: ${themeName === 'dark' ? '#111827' : '#ffffff'};
      z-index: 999999;
      opacity: 0;
      pointer-events: none;
      transition: opacity ${duration / 2}ms ease-in-out;
    `;

    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
      overlay.style.opacity = '1';

      setTimeout(() => {
        this._applyThemeImmediate(themeName);
        overlay.style.opacity = '0';

        setTimeout(() => {
          overlay.remove();
          this._isTransitioning = false;
        }, duration / 2);
      }, duration / 2);
    });
  }

  /**
   * 슬라이드 전환 효과
   * @private
   */
  _transitionSlide(themeName, duration) {
    if (document.startViewTransition) {
      this._transitionSlideNative(themeName, duration);
    } else {
      this._transitionSlideFallback(themeName, duration);
    }
  }

  /**
   * View Transitions API를 사용한 슬라이드 전환
   * @private
   */
  _transitionSlideNative(themeName, duration) {
    const styleId = 'imcat-view-transition-style';
    let styleEl = document.getElementById(styleId);
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }

    styleEl.textContent = `
      ::view-transition-old(root) {
        animation: slide-out-up ${duration}ms ease-out forwards;
        z-index: 999;
      }
      ::view-transition-new(root) {
        animation: slide-in-up ${duration}ms ease-out forwards;
        z-index: 1000;
      }
      @keyframes slide-out-up {
        from { transform: translateY(0); }
        to { transform: translateY(-100%); }
      }
      @keyframes slide-in-up {
        from { transform: translateY(100%); }
        to { transform: translateY(0); }
      }
    `;

    const transition = document.startViewTransition(() => {
      this._applyThemeImmediate(themeName);
    });

    transition.finished.then(() => {
      this._isTransitioning = false;
    }).catch(() => {
      this._isTransitioning = false;
    });
  }

  /**
   * 슬라이드 전환 폴백
   * @private
   */
  _transitionSlideFallback(themeName, duration) {
    const overlay = this._createOverlay();
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: ${themeName === 'dark' ? '#111827' : '#ffffff'};
      z-index: 999999;
      pointer-events: none;
      transform: translateY(-100%);
      transition: transform ${duration / 2}ms ease-in-out;
    `;

    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
      overlay.style.transform = 'translateY(0)';

      setTimeout(() => {
        this._applyThemeImmediate(themeName);
        overlay.style.transform = 'translateY(100%)';

        setTimeout(() => {
          overlay.remove();
          this._isTransitioning = false;
        }, duration / 2);
      }, duration / 2);
    });
  }

  /**
   * 원형 확대 전환 효과
   * @private
   * @param {string} themeName
   * @param {number} duration
   * @param {string} origin - 'top-left', 'top-right', 'bottom-left', 'bottom-right', 'center'
   */
  _transitionCircle(themeName, duration, origin = 'bottom-right') {
    const { x, y } = this._getCircleOrigin(origin);

    if (document.startViewTransition) {
      this._transitionCircleNative(themeName, duration, x, y);
    } else {
      this._transitionCircleFallback(themeName, duration, x, y);
    }
  }

  /**
   * View Transitions API를 사용한 원형 전환
   * @private
   */
  _transitionCircleNative(themeName, duration, x, y) {
    const maxRadius = Math.ceil(
      Math.sqrt(
        Math.pow(Math.max(x, window.innerWidth - x), 2) +
        Math.pow(Math.max(y, window.innerHeight - y), 2)
      )
    );

    document.documentElement.style.setProperty('--circle-x', `${x}px`);
    document.documentElement.style.setProperty('--circle-y', `${y}px`);
    document.documentElement.style.setProperty('--circle-size', `${maxRadius}px`);

    const styleId = 'imcat-view-transition-style';
    let styleEl = document.getElementById(styleId);
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }

    styleEl.textContent = `
      ::view-transition-old(root) {
        animation: none;
        z-index: 999;
      }
      ::view-transition-new(root) {
        animation: circle-reveal ${duration}ms ease-out forwards;
        z-index: 1000;
      }
      @keyframes circle-reveal {
        from {
          clip-path: circle(0px at var(--circle-x) var(--circle-y));
        }
        to {
          clip-path: circle(var(--circle-size) at var(--circle-x) var(--circle-y));
        }
      }
    `;

    const transition = document.startViewTransition(() => {
      this._applyThemeImmediate(themeName);
    });

    transition.finished.then(() => {
      this._isTransitioning = false;
    }).catch(() => {
      this._isTransitioning = false;
    });
  }

  /**
   * 원형 전환 폴백
   * @private
   */
  _transitionCircleFallback(themeName, duration, x, y) {
    const maxRadius = Math.ceil(
      Math.sqrt(
        Math.pow(Math.max(x, window.innerWidth - x), 2) +
        Math.pow(Math.max(y, window.innerHeight - y), 2)
      )
    );

    const newThemeColor = themeName === 'dark' ? '#111827' : '#ffffff';

    const overlay = this._createOverlay();
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: ${newThemeColor};
      z-index: 999999;
      pointer-events: none;
      clip-path: circle(0px at ${x}px ${y}px);
      transition: clip-path ${duration}ms ease-out;
    `;

    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        overlay.style.clipPath = `circle(${maxRadius}px at ${x}px ${y}px)`;

        setTimeout(() => {
          this._applyThemeImmediate(themeName);
          overlay.remove();
          this._isTransitioning = false;
        }, duration);
      });
    });
  }

  /**
   * 원형 효과 시작점 좌표 계산
   * @private
   */
  _getCircleOrigin(origin) {
    const w = window.innerWidth;
    const h = window.innerHeight;

    switch (origin) {
      case 'top-left':
        return { x: 0, y: 0 };
      case 'top-right':
        return { x: w, y: 0 };
      case 'bottom-left':
        return { x: 0, y: h };
      case 'bottom-right':
        return { x: w, y: h };
      case 'center':
        return { x: w / 2, y: h / 2 };
      default:
        return { x: w, y: h };
    }
  }

  /**
   * 오버레이 요소 생성
   * @private
   */
  _createOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'imcat-theme-transition-overlay';
    return overlay;
  }

  /**
   * meta theme-color 업데이트
   * @private
   * @param {string} themeName
   */
  _updateMetaThemeColor(themeName) {
    let meta = document.querySelector('meta[name="theme-color"]');

    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'theme-color';
      document.head.appendChild(meta);
    }

    const colors = { light: '#ffffff', dark: '#111827' };
    meta.content = colors[themeName] || colors.light;
  }

  /**
   * 리스너에게 변경 알림
   * @private
   */
  _notifyListeners() {
    const resolved = this.getResolved();
    this._listeners.forEach(listener => {
      try {
        listener(resolved, this._currentTheme);
      } catch (e) {
        console.error('[Theme] Listener error:', e);
      }
    });

    // 레거시 콜백 지원
    if (this.options.onChange && typeof this.options.onChange === 'function') {
      this.options.onChange(resolved, this._currentTheme);
    }
  }

  /**
   * 커스텀 이벤트 발생
   * @private
   */
  _dispatchEvent(eventName, detail) {
    const event = new CustomEvent(`imcat:${eventName}`, {
      detail,
      bubbles: true,
      cancelable: true
    });
    document.dispatchEvent(event);
  }

  // ============================================
  // Public API
  // ============================================

  /**
   * 시스템 테마 가져오기
   * @returns {string} 'light' 또는 'dark'
   */
  getSystemTheme() {
    if (typeof window === 'undefined' || !window.matchMedia) return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  /**
   * 현재 테마 가져오기 (설정값)
   * @returns {string} 'light', 'dark', 또는 'system'
   */
  get() {
    return this._currentTheme;
  }

  /**
   * 현재 테마 가져오기 (레거시 호환)
   * @returns {string}
   */
  getTheme() {
    return this._currentTheme;
  }

  /**
   * 실제 적용된 테마 가져오기
   * @returns {string} 'light' 또는 'dark'
   */
  getResolved() {
    if (this._currentTheme === 'system') {
      return this.getSystemTheme();
    }
    return this._currentTheme;
  }

  /**
   * 실제 적용된 테마 가져오기 (레거시 호환)
   * @returns {string}
   */
  getActualTheme() {
    return this.getResolved();
  }

  /**
   * 테마 설정
   * @param {string} theme - 'light', 'dark', 또는 'system'
   * @param {boolean} [save=true] - localStorage에 저장 여부
   * @param {boolean} [animate=true] - 전환 애니메이션 적용 여부
   */
  set(theme, save = true, animate = true) {
    const validThemes = ['light', 'dark', 'system', ...Object.keys(this.options.themes)];

    if (!validThemes.includes(theme)) {
      console.warn(`[Theme] Invalid theme: ${theme}. Using 'light'.`);
      theme = 'light';
    }

    const resolvedTheme = theme === 'system' ? this.getSystemTheme() : theme;
    const currentResolved = this.getResolved();

    if (this._currentTheme === theme || (animate && resolvedTheme === currentResolved)) {
      return;
    }

    this._currentTheme = theme;
    this._applyTheme(resolvedTheme, animate);

    if (save) {
      this._saveTheme(theme);
    }

    this._notifyListeners();
    this._dispatchEvent('themechange', { theme, resolvedTheme });
  }

  /**
   * 테마 설정 (레거시 호환)
   * @param {string} theme
   * @param {boolean} [animate=true]
   * @returns {Theme} this
   */
  setTheme(theme, animate = true) {
    this.set(theme, true, animate);
    return this;
  }

  /**
   * 테마 토글 (light ↔ dark)
   * @param {boolean} [animate=true] - 전환 애니메이션 적용 여부
   */
  toggle(animate = true) {
    const current = this.getResolved();
    this.set(current === 'dark' ? 'light' : 'dark', true, animate);
  }

  /**
   * 테마 토글 (레거시 호환)
   * @returns {Theme} this
   */
  toggleTheme() {
    this.toggle(true);
    return this;
  }

  /**
   * 전환 효과 설정
   * @param {string} transition - 전환 효과 타입
   * @param {number} [duration] - 전환 시간 (ms)
   */
  setTransition(transition, duration) {
    this.options.transition = transition;
    if (duration !== undefined) {
      this.options.transitionDuration = duration;
    }
  }

  /**
   * 특정 위치에서 원형 전환 효과 (클릭 위치 기반)
   * @param {string} theme - 전환할 테마
   * @param {number} x - 시작 X 좌표
   * @param {number} y - 시작 Y 좌표
   * @param {number} [duration] - 전환 시간
   */
  setWithCircleAt(theme, x, y, duration = this.options.transitionDuration) {
    if (this._isTransitioning) return;

    const resolvedTheme = theme === 'system' ? this.getSystemTheme() : theme;
    if (resolvedTheme === this.getResolved()) return;

    this._isTransitioning = true;
    this._currentTheme = theme;

    if (document.startViewTransition) {
      this._setWithCircleAtNative(theme, resolvedTheme, x, y, duration);
    } else {
      this._setWithCircleAtFallback(theme, resolvedTheme, x, y, duration);
    }
  }

  /**
   * View Transitions API를 사용한 위치 기반 원형 전환
   * @private
   */
  _setWithCircleAtNative(theme, resolvedTheme, x, y, duration) {
    const maxRadius = Math.ceil(
      Math.sqrt(
        Math.pow(Math.max(x, window.innerWidth - x), 2) +
        Math.pow(Math.max(y, window.innerHeight - y), 2)
      )
    );

    document.documentElement.style.setProperty('--circle-x', `${x}px`);
    document.documentElement.style.setProperty('--circle-y', `${y}px`);
    document.documentElement.style.setProperty('--circle-size', `${maxRadius}px`);

    const styleId = 'imcat-view-transition-style';
    let styleEl = document.getElementById(styleId);
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }

    styleEl.textContent = `
      ::view-transition-old(root) {
        animation: none;
        z-index: 999;
      }
      ::view-transition-new(root) {
        animation: circle-reveal ${duration}ms ease-out forwards;
        z-index: 1000;
      }
      @keyframes circle-reveal {
        from { clip-path: circle(0px at var(--circle-x) var(--circle-y)); }
        to { clip-path: circle(var(--circle-size) at var(--circle-x) var(--circle-y)); }
      }
    `;

    const transition = document.startViewTransition(() => {
      this._applyThemeImmediate(resolvedTheme);
      this._saveTheme(theme);
      this._notifyListeners();
      this._dispatchEvent('themechange', { theme, resolvedTheme });
    });

    transition.finished.then(() => {
      this._isTransitioning = false;
    }).catch(() => {
      this._isTransitioning = false;
    });
  }

  /**
   * 폴백: 위치 기반 원형 전환
   * @private
   */
  _setWithCircleAtFallback(theme, resolvedTheme, x, y, duration) {
    const maxRadius = Math.ceil(
      Math.sqrt(
        Math.pow(Math.max(x, window.innerWidth - x), 2) +
        Math.pow(Math.max(y, window.innerHeight - y), 2)
      )
    );

    const newThemeColor = resolvedTheme === 'dark' ? '#111827' : '#ffffff';

    const overlay = this._createOverlay();
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: ${newThemeColor};
      z-index: 999999;
      pointer-events: none;
      clip-path: circle(0px at ${x}px ${y}px);
      transition: clip-path ${duration}ms ease-out;
    `;

    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        overlay.style.clipPath = `circle(${maxRadius}px at ${x}px ${y}px)`;

        setTimeout(() => {
          this._applyThemeImmediate(resolvedTheme);
          this._saveTheme(theme);
          this._notifyListeners();
          this._dispatchEvent('themechange', { theme, resolvedTheme });
          overlay.remove();
          this._isTransitioning = false;
        }, duration);
      });
    });
  }

  /**
   * 클릭 이벤트 기반 원형 전환
   * @param {MouseEvent|TouchEvent} event - 클릭/터치 이벤트
   * @param {string} [theme] - 전환할 테마 (생략 시 토글)
   */
  toggleWithEvent(event, theme) {
    const target = theme || (this.getResolved() === 'dark' ? 'light' : 'dark');

    let x, y;
    if (event.touches && event.touches[0]) {
      x = event.touches[0].clientX;
      y = event.touches[0].clientY;
    } else {
      x = event.clientX;
      y = event.clientY;
    }

    this.setWithCircleAt(target, x, y);
  }

  /**
   * 테마 변경 리스너 등록
   * @param {Function} listener - 콜백 (resolvedTheme, settingTheme) => void
   * @returns {Function} 구독 해제 함수
   */
  onChange(listener) {
    this._listeners.add(listener);
    return () => this._listeners.delete(listener);
  }

  /**
   * 커스텀 테마 등록
   * @param {string} name - 테마 이름
   * @param {Object} vars - CSS 변수 객체
   */
  register(name, vars) {
    this.options.themes[name] = vars;
  }

  /**
   * 커스텀 테마 등록 (레거시 호환)
   * @param {string} name
   * @param {Object} colors
   * @returns {Theme} this
   */
  registerCustomTheme(name, colors) {
    this.register(name, colors);
    return this;
  }

  /**
   * 다크 모드 여부
   * @returns {boolean}
   */
  isDark() {
    return this.getResolved() === 'dark';
  }

  /**
   * 라이트 모드 여부
   * @returns {boolean}
   */
  isLight() {
    return this.getResolved() === 'light';
  }

  /**
   * 테마 리셋 (기본 테마로)
   * @returns {Theme} this
   */
  reset() {
    this.set(this.options.defaultTheme);
    return this;
  }

  /**
   * 정리 (메모리 누수 방지)
   */
  destroy() {
    // 미디어 쿼리 리스너 제거
    if (this._mediaQuery && this._mediaQueryHandler) {
      if (this._mediaQuery.removeEventListener) {
        this._mediaQuery.removeEventListener('change', this._mediaQueryHandler);
      } else {
        this._mediaQuery.removeListener(this._mediaQueryHandler);
      }
    }

    // 리스너 정리
    if (this._listeners) {
      this._listeners.clear();
    }

    // 참조 해제
    this._mediaQuery = null;
    this._mediaQueryHandler = null;
    this._listeners = null;
    this._currentTheme = null;
    this._isTransitioning = null;
    this._builtInThemes = null;
    this.options = null;
  }
}

// ============================================
// 싱글톤 패턴
// ============================================

let themeInstance = null;

/**
 * Theme 모듈 팩토리
 * @param {Object} options - 테마 옵션
 * @returns {Theme}
 */
function createTheme(options = {}) {
  if (!themeInstance) {
    themeInstance = new Theme(options);
  }
  return themeInstance;
}

/**
 * 싱글톤 인스턴스 가져오기
 * @returns {Theme|null}
 */
function getTheme() {
  return themeInstance;
}

/**
 * 싱글톤 초기화 (새 옵션으로)
 * @param {Object} options
 * @returns {Theme}
 */
function initTheme(options = {}) {
  if (themeInstance) {
    themeInstance.destroy();
  }
  themeInstance = new Theme(options);
  return themeInstance;
}

// ============================================
// Module Export
// ============================================

const ThemeModule = {
  Theme,
  createTheme,
  getTheme,
  initTheme
};

export default ThemeModule;
