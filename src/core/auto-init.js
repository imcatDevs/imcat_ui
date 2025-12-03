/**
 * IMCAT 자동 초기화
 * @module core/auto-init
 * @description HTML data-* 속성만으로 컴포넌트를 자동 초기화합니다.
 */

/**
 * 자동 초기화 관리자
 * @class
 *
 * @example
 * <!-- HTML에서 사용 -->
 * <button data-imcat="dropdown" data-items='[{"text":"메뉴1"},{"text":"메뉴2"}]'>
 *   드롭다운
 * </button>
 *
 * <button data-imcat="modal" data-title="알림" data-content="내용입니다">
 *   모달 열기
 * </button>
 *
 * <span data-imcat="tooltip" data-content="툴팁 내용">
 *   마우스를 올려보세요
 * </span>
 */
export class AutoInit {
  /**
   * 등록된 컴포넌트 초기화 함수
   * @private
   */
  static _components = {};

  /**
   * 초기화된 인스턴스 맵 (WeakMap으로 메모리 관리)
   * @private
   */
  static _instances = new WeakMap();

  /**
   * destroy가 필요한 인스턴스들 (순회 가능하도록 Set 사용)
   * @private
   */
  static _destroyables = new Set();

  /**
   * IMCAT 인스턴스 참조
   * @private
   */
  static _imcat = null;

  /**
   * MutationObserver 인스턴스
   * @private
   */
  static _observer = null;

  /**
   * 초기화 여부
   * @private
   */
  static _initialized = false;

  /**
   * 기본 컴포넌트 등록
   * @private
   */
  static _registerDefaults() {
    // 드롭다운
    AutoInit.register('dropdown', async (el, options, imcat) => {
      const Dropdown = await imcat.use('dropdown');
      const dropdown = new Dropdown(el, options);
      imcat.view.registerInstance(dropdown);
      return dropdown;
    });

    // 모달 (클릭 트리거)
    AutoInit.register('modal', async (el, options, imcat) => {
      const Overlays = await imcat.use('overlays');
      const modal = new Overlays.Modal(options);
      imcat.view.registerInstance(modal);

      el.addEventListener('click', (e) => {
        e.preventDefault();
        modal.show();
      });

      return modal;
    });

    // 드로어 (클릭 트리거)
    AutoInit.register('drawer', async (el, options, imcat) => {
      const Overlays = await imcat.use('overlays');
      const drawer = new Overlays.Drawer(options);
      imcat.view.registerInstance(drawer);

      el.addEventListener('click', (e) => {
        e.preventDefault();
        drawer.show();
      });

      return drawer;
    });

    // 오프캔버스 (클릭 트리거)
    AutoInit.register('offcanvas', async (el, options, imcat) => {
      const Overlays = await imcat.use('overlays');
      const offcanvas = new Overlays.Offcanvas(options);
      imcat.view.registerInstance(offcanvas);

      el.addEventListener('click', (e) => {
        e.preventDefault();
        offcanvas.show();
      });

      return offcanvas;
    });

    // 툴팁
    AutoInit.register('tooltip', async (el, options, imcat) => {
      const Tooltips = await imcat.use('tooltips');
      const tooltip = new Tooltips.Tooltip(el, options);
      imcat.view.registerInstance(tooltip);
      return tooltip;
    });

    // 팝오버
    AutoInit.register('popover', async (el, options, imcat) => {
      const Tooltips = await imcat.use('tooltips');
      const popover = new Tooltips.Popover(el, options);
      imcat.view.registerInstance(popover);
      return popover;
    });

    // 탭
    AutoInit.register('tabs', async (el, options, imcat) => {
      const Navigation = await imcat.use('navigation');
      const tabs = new Navigation.Tabs(el, options);
      imcat.view.registerInstance(tabs);
      return tabs;
    });

    // 아코디언
    AutoInit.register('accordion', async (el, options, imcat) => {
      const Navigation = await imcat.use('navigation');
      const accordion = new Navigation.Accordion(el, options);
      imcat.view.registerInstance(accordion);
      return accordion;
    });

    // 캐러셀
    AutoInit.register('carousel', async (el, options, imcat) => {
      const CarouselModule = await imcat.use('carousel');
      const carousel = new CarouselModule.Carousel(el, options);
      imcat.view.registerInstance(carousel);
      return carousel;
    });

    // 확인 다이얼로그 (클릭 트리거)
    AutoInit.register('confirm', async (el, options, imcat) => {
      el.addEventListener('click', async (e) => {
        e.preventDefault();

        const result = await imcat.confirm({
          title: options.title || '확인',
          message: options.message || options.content || '확인하시겠습니까?',
          confirmText: options.confirmText,
          cancelText: options.cancelText,
          danger: options.danger
        });

        if (result) {
          // 확인 시 액션 실행
          if (options.onConfirm) {
            try {
              const fn = new Function('return ' + options.onConfirm)();
              if (typeof fn === 'function') fn();
            } catch (error) {
              console.error('AutoInit confirm onConfirm error:', error);
            }
          }

          // href가 있으면 이동
          if (options.href) {
            window.location.href = options.href;
          }

          // form이 있으면 제출
          if (options.form) {
            const form = document.querySelector(options.form);
            if (form) form.submit();
          }
        }
      });

      return null;
    });

    // 복사 버튼
    AutoInit.register('copy', async (el, options, imcat) => {
      el.addEventListener('click', async (e) => {
        e.preventDefault();

        let text = options.text || options.content;

        // 선택자로 텍스트 가져오기
        if (options.target) {
          const target = document.querySelector(options.target);
          if (target) {
            text = target.value || target.textContent;
          }
        }

        if (text) {
          const success = await imcat.copy(text);
          if (success && options.toast !== false) {
            await imcat.toast.success(options.message || '복사되었습니다');
          }
        }
      });

      return null;
    });

    // 스크롤 탑 버튼
    AutoInit.register('scroll-top', async (el, options, imcat) => {
      const clickHandler = (e) => {
        e.preventDefault();
        imcat.scrollTop(options.smooth !== false);
      };
      el.addEventListener('click', clickHandler);

      let scrollHandler = null;

      // 스크롤 위치에 따라 버튼 표시/숨김
      if (options.autoHide !== false) {
        const threshold = parseInt(options.threshold) || 300;

        const toggleVisibility = () => {
          if (window.scrollY > threshold) {
            el.classList.remove('is-hidden');
            el.classList.add('is-visible');
          } else {
            el.classList.remove('is-visible');
            el.classList.add('is-hidden');
          }
        };

        scrollHandler = imcat.throttle(toggleVisibility, 100);
        window.addEventListener('scroll', scrollHandler);
        toggleVisibility();
      }

      // 정리용 객체 반환
      return {
        destroy() {
          el.removeEventListener('click', clickHandler);
          if (scrollHandler) {
            window.removeEventListener('scroll', scrollHandler);
          }
        }
      };
    });

    // 스크롤 투 버튼
    AutoInit.register('scroll-to', async (el, options, imcat) => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const target = options.target || el.getAttribute('href');
        if (target) {
          imcat.scrollTo(target, {
            offset: parseInt(options.offset) || 0,
            behavior: options.smooth !== false ? 'smooth' : 'auto'
          });
        }
      });

      return null;
    });

    // 토글 클래스
    AutoInit.register('toggle', async (el, options, imcat) => {
      el.addEventListener('click', (e) => {
        e.preventDefault();

        const target = options.target ? document.querySelector(options.target) : el;
        const className = options.class || 'is-active';

        if (target) {
          target.classList.toggle(className);
        }
      });

      return null;
    });
  }

  /**
   * 컴포넌트 초기화 함수 등록
   * @param {string} name - 컴포넌트 이름 (data-imcat 값)
   * @param {Function} initializer - 초기화 함수 (el, options, imcat) => instance
   *
   * @example
   * AutoInit.register('myComponent', async (el, options, imcat) => {
   *   const MyModule = await imcat.use('my-module');
   *   return new MyModule(el, options);
   * });
   */
  static register(name, initializer) {
    AutoInit._components[name] = initializer;
  }

  /**
   * 컴포넌트 등록 해제
   * @param {string} name - 컴포넌트 이름
   */
  static unregister(name) {
    delete AutoInit._components[name];
  }

  /**
   * 자동 초기화 시작
   * @param {Object} imcat - IMCAT 인스턴스
   *
   * @example
   * AutoInit.init(IMCAT);
   */
  static init(imcat) {
    if (AutoInit._initialized) return;

    AutoInit._imcat = imcat;
    AutoInit._registerDefaults();

    // DOM이 준비되면 초기화
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => AutoInit._initAll());
    } else {
      AutoInit._initAll();
    }

    // DOM 변경 감지 (동적으로 추가되는 요소)
    AutoInit._setupObserver();

    AutoInit._initialized = true;
  }

  /**
   * 모든 data-imcat 요소 초기화
   * @private
   */
  static _initAll() {
    const elements = document.querySelectorAll('[data-imcat]');
    elements.forEach(el => AutoInit._initElement(el));
  }

  /**
   * 특정 요소 초기화
   * @param {HTMLElement} el - 요소
   * @private
   */
  static async _initElement(el) {
    // 이미 초기화되었으면 스킵
    if (AutoInit._instances.has(el)) return;

    const componentName = el.dataset.imcat;
    const initializer = AutoInit._components[componentName];

    if (!initializer) {
      if (AutoInit._imcat && AutoInit._imcat.config && AutoInit._imcat.config.get('debug')) {
        console.warn(`AutoInit: Unknown component "${componentName}"`);
      }
      return;
    }

    try {
      const options = AutoInit._parseOptions(el);
      const instance = await initializer(el, options, AutoInit._imcat);
      AutoInit._instances.set(el, instance);
      
      // destroy 메서드가 있는 인스턴스는 정리용 Set에 추가
      if (instance && typeof instance.destroy === 'function') {
        AutoInit._destroyables.add(instance);
      }
    } catch (error) {
      console.error(`AutoInit: Failed to initialize "${componentName}"`, error);
    }
  }

  /**
   * 요소의 data-* 속성을 옵션 객체로 파싱
   * @param {HTMLElement} el - 요소
   * @returns {Object} 옵션 객체
   * @private
   */
  static _parseOptions(el) {
    const options = {};

    // 모든 data-* 속성 순회
    for (const key in el.dataset) {
      if (key === 'imcat') continue; // 컴포넌트 이름은 제외

      let value = el.dataset[key];

      // JSON 파싱 시도
      try {
        // 배열이나 객체인 경우
        if (value.startsWith('[') || value.startsWith('{')) {
          value = JSON.parse(value);
        }
        // 불리언
        else if (value === 'true') {
          value = true;
        } else if (value === 'false') {
          value = false;
        }
        // 숫자
        else if (!isNaN(value) && value.trim() !== '') {
          value = Number(value);
        }
      } catch {
        // JSON 파싱 실패 시 문자열 그대로 사용
      }

      // camelCase로 변환 (data-my-option -> myOption)
      options[key] = value;
    }

    return options;
  }

  /**
   * MutationObserver 설정 (동적 요소 감지)
   * @private
   */
  static _setupObserver() {
    if (AutoInit._observer) return;

    AutoInit._observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // 추가된 요소가 data-imcat을 가지면 초기화
            if (node.hasAttribute && node.hasAttribute('data-imcat')) {
              AutoInit._initElement(node);
            }

            // 자식 요소 중 data-imcat을 가진 요소 초기화
            if (node.querySelectorAll) {
              node.querySelectorAll('[data-imcat]').forEach(el => {
                AutoInit._initElement(el);
              });
            }
          }
        });
      });
    });

    AutoInit._observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  /**
   * 특정 요소 또는 범위 내 요소 수동 초기화
   * @param {HTMLElement|string} [scope] - 범위 (없으면 전체)
   *
   * @example
   * // 전체 재검색 및 초기화
   * AutoInit.refresh();
   *
   * // 특정 범위 내에서만 초기화
   * AutoInit.refresh('#my-container');
   */
  static refresh(scope) {
    let container = document;

    if (scope) {
      container = typeof scope === 'string'
        ? document.querySelector(scope)
        : scope;
    }

    if (!container) return;

    const elements = container.querySelectorAll
      ? container.querySelectorAll('[data-imcat]')
      : [container];

    elements.forEach(el => {
      // 기존 인스턴스가 없는 요소만 초기화
      if (!AutoInit._instances.has(el)) {
        AutoInit._initElement(el);
      }
    });
  }

  /**
   * 특정 요소의 인스턴스 가져오기
   * @param {HTMLElement} el - 요소
   * @returns {*} 인스턴스
   */
  static getInstance(el) {
    return AutoInit._instances.get(el);
  }

  /**
   * 자동 초기화 정리
   */
  static destroy() {
    // MutationObserver 정리
    if (AutoInit._observer) {
      AutoInit._observer.disconnect();
      AutoInit._observer = null;
    }

    // 모든 인스턴스의 destroy() 호출
    AutoInit._destroyables.forEach(instance => {
      try {
        if (instance && typeof instance.destroy === 'function') {
          instance.destroy();
        }
      } catch (error) {
        console.error('AutoInit: Error destroying instance', error);
      }
    });

    // 정리
    AutoInit._destroyables.clear();
    AutoInit._instances = new WeakMap();
    AutoInit._initialized = false;
    AutoInit._imcat = null;
  }
}

export default AutoInit;
