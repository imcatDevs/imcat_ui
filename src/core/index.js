/**
 * IMCAT UI Framework - Core Entry Point
 * @module imcat-ui
 * @version 1.0.0
 */

import { DOM } from './dom.js';
import { EventBus } from './event.js';
import { ModuleLoader } from './loader.js';
import { ViewRouter } from './router.js';
import LoadingIndicator from './loading.js';
import { APIUtil } from './api.js';
import { Security } from './security.js';
import { Utils } from './utils.js';
import { Template } from './template.js';
import { Storage } from './storage.js';
import { URLUtil } from './url.js';
import { StateManager, GlobalState } from './state.js';
import { FormValidator } from './form.js';
import { AnimationUtil } from './animation.js';

/**
 * IMCAT Core Class
 * @class
 * @description IMCAT UI 프레임워크의 핵심 클래스입니다.
 * 모든 코어 모듈을 통합하고 전역 IMCAT 객체를 생성합니다.
 *
 * @example
 * const element = IMCAT('#app');
 * element.addClass('active').text('Hello');
 */
class IMCATCore {
  /**
   * IMCATCore 생성자
   * @constructor
   */
  constructor() {
    // 싱글톤 인스턴스들
    this.eventBus = new EventBus();
    this.loader = new ModuleLoader();
    this.router = new ViewRouter();
    this.loadingIndicator = LoadingIndicator;

    // 이벤트 리스너 추적 (메모리 관리용)
    this._clickHandler = null;
    this._domReadyHandler = null;

    // Router에 Loading 통합 (URL 변경 없이 내부 렌더링만)
    this.router.init({
      loading: this.loadingIndicator,
      useHistory: false
    });

    // catui-href 자동 바인딩 (DOM ready 후)
    this._bindSPALinks();
  }

  /**
   * catui-href 자동 바인딩
   * SPA 링크를 자동으로 처리하여 설정 코드 불필요
   * @private
   */
  _bindSPALinks() {
    // DOM ready 핸들러
    const bindLinks = () => {
      // 기본 컨테이너 자동 감지
      this._detectRouterContainer();

      // 클릭 핸들러 생성 (나중에 제거할 수 있도록 저장)
      this._clickHandler = (e) => {
        // catui-href를 가진 요소 찾기
        const link = e.target.closest('[catui-href]');

        if (link) {
          // 이벤트 기본 동작 방지 (중복 네비게이션 방지)
          e.preventDefault();
          e.stopPropagation();

          const path = link.getAttribute('catui-href');
          const target = link.getAttribute('catui-target');

          if (path) {
            // 링크별 타겟이 있으면 임시로 변경
            const originalContainer = this.router.container;

            if (target) {
              this.router.setContainer(`#${target}`);
            }

            // 네비게이션 실행
            this.router.navigate(path).then(() => {
              // 원래 컨테이너로 복원 (타겟이 지정된 경우만)
              if (target) {
                this.router.setContainer(originalContainer);
              }
            });
          }
        }
      };

      // capture 단계에서 이벤트 캡처 (더 일찍 처리)
      document.addEventListener('click', this._clickHandler, true);
    };

    // DOM이 이미 로드되었으면 즉시 실행, 아니면 대기
    if (document.readyState === 'loading') {
      this._domReadyHandler = bindLinks;
      document.addEventListener('DOMContentLoaded', this._domReadyHandler);
    } else {
      bindLinks();
    }
  }

  /**
   * Router 컨테이너 자동 감지
   * catui-target 속성 또는 기본 선택자 사용
   * @private
   */
  _detectRouterContainer() {
    // 1. catui-target 속성을 가진 요소 찾기
    const targetElement = document.querySelector('[catui-target]');
    if (targetElement) {
      const targetId = targetElement.getAttribute('catui-target');
      if (targetId) {
        this.router.setContainer(`#${targetId}`);
        return;
      }
    }

    // 2. 일반적인 선택자들 시도 (우선순위 순)
    const defaultSelectors = ['#app-content', '#content', '#app', 'main'];
    for (const selector of defaultSelectors) {
      if (document.querySelector(selector)) {
        this.router.setContainer(selector);
        return;
      }
    }

    // 3. 기본값
    this.router.setContainer('#content');
  }

  /**
   * DOM 요소 선택
   * @param {string|HTMLElement} selector - 선택자
   * @returns {DOMElement}
   */
  $(selector) {
    return DOM.select(selector);
  }

  /**
   * 새 요소 생성
   * @param {string} tagName - 태그 이름
   * @param {Object} attributes - 속성
   * @returns {DOMElement}
   */
  create(tagName, attributes) {
    return DOM.create(tagName, attributes);
  }

  /**
   * 모듈 로드
   * @param {...string} moduleNames - 모듈 이름들
   * @returns {Promise<*>}
   */
  use(...moduleNames) {
    return this.loader.use(...moduleNames);
  }

  // ===== View Router API =====
  /**
   * View Router 인스턴스
   * @returns {ViewRouter}
   */
  get view() {
    return this.router;
  }

  // ===== API Utility =====
  /**
   * API 유틸리티
   * @returns {APIUtil}
   */
  get api() {
    return APIUtil;
  }

  // ===== Event Bus API =====
  /**
   * 이벤트 구독
   */
  on(event, handler) {
    return this.eventBus.on(event, handler);
  }

  /**
   * 일회성 이벤트 구독
   */
  once(event, handler) {
    return this.eventBus.once(event, handler);
  }

  /**
   * 이벤트 구독 취소
   */
  off(event, handler) {
    return this.eventBus.off(event, handler);
  }

  /**
   * 이벤트 발행
   */
  emit(event, ...args) {
    return this.eventBus.emit(event, ...args);
  }

  // ===== Loading Indicator API =====
  /**
   * Loading Indicator 인스턴스
   * @returns {LoadingIndicator}
   */
  get loading() {
    return this.loadingIndicator;
  }

  // ===== Template API =====
  /**
   * Template 엔진
   * @returns {Template}
   */
  get template() {
    return Template;
  }

  // ===== Storage API =====
  /**
   * Storage 유틸리티
   * @returns {Storage}
   */
  get storage() {
    return Storage;
  }

  // ===== URL API =====
  /**
   * URL 유틸리티
   * @returns {URLUtil}
   */
  get url() {
    return URLUtil;
  }

  // ===== State API =====
  /**
   * 상태 관리
   * @returns {StateManager}
   */
  get state() {
    return StateManager;
  }

  /**
   * 전역 상태
   * @returns {GlobalState}
   */
  get globalState() {
    return GlobalState;
  }

  // ===== Form API =====
  /**
   * 폼 검증
   * @returns {FormValidator}
   */
  get form() {
    return FormValidator;
  }

  // ===== Animation API =====
  /**
   * 애니메이션
   * @returns {AnimationUtil}
   */
  get animate() {
    return AnimationUtil.animate.bind(AnimationUtil);
  }

  /**
   * 애니메이션 유틸리티
   * @returns {AnimationUtil}
   */
  get animation() {
    return AnimationUtil;
  }

  // ===== Security API =====
  /**
   * HTML 이스케이프
   */
  escape(str) {
    return Security.escape(str);
  }

  /**
   * HTML 새니타이징
   */
  sanitize(html) {
    return Security.sanitize(html);
  }

  /**
   * 경로 검증
   */
  validatePath(path) {
    return Security.validatePath(path);
  }

  // ===== Utils API =====
  /**
   * 타입 체크 - 문자열
   */
  isString(value) {
    return Utils.isString(value);
  }

  /**
   * 타입 체크 - 숫자
   */
  isNumber(value) {
    return Utils.isNumber(value);
  }

  /**
   * 타입 체크 - 배열
   */
  isArray(value) {
    return Utils.isArray(value);
  }

  /**
   * 타입 체크 - 객체
   */
  isObject(value) {
    return Utils.isObject(value);
  }

  /**
   * 타입 체크 - 함수
   */
  isFunction(value) {
    return Utils.isFunction(value);
  }

  /**
   * 객체 병합
   */
  extend(target, ...sources) {
    return Utils.extend(target, ...sources);
  }

  /**
   * 깊은 복사
   */
  clone(obj) {
    return Utils.clone(obj);
  }

  /**
   * 디바운스
   */
  debounce(func, wait) {
    return Utils.debounce(func, wait);
  }

  /**
   * 스로틀
   */
  throttle(func, limit) {
    return Utils.throttle(func, limit);
  }

  /**
   * 랜덤 ID
   */
  randomId(prefix) {
    return Utils.randomId(prefix);
  }

  /**
   * DOM 준비 완료 시 실행
   */
  ready(callback) {
    return DOM.ready(callback);
  }

  /**
   * 버전 정보
   */
  get version() {
    return '1.0.0';
  }

  /**
   * 프레임워크 정리 (메모리 누수 방지)
   * SPA 재시작 또는 테스트 환경에서 사용
   *
   * @example
   * // 애플리케이션 종료 시
   * IMCAT.destroy();
   */
  destroy() {
    // 전역 클릭 리스너 제거 (capture 단계로 등록했으므로 같은 옵션으로 제거)
    if (this._clickHandler) {
      document.removeEventListener('click', this._clickHandler, true);
      this._clickHandler = null;
    }

    // DOMContentLoaded 리스너 제거 (아직 실행 안된 경우)
    if (this._domReadyHandler) {
      document.removeEventListener('DOMContentLoaded', this._domReadyHandler);
      this._domReadyHandler = null;
    }

    // 라우터 정리
    if (this.router && typeof this.router.destroy === 'function') {
      this.router.destroy();
    }

    // 이벤트 버스 정리
    if (this.eventBus && typeof this.eventBus.clear === 'function') {
      this.eventBus.clear();
    }

    // 모듈 로더 정리
    if (this.loader && typeof this.loader.destroy === 'function') {
      this.loader.destroy();
    }

    // 로딩 인디케이터 정리
    if (this.loadingIndicator && typeof this.loadingIndicator.destroy === 'function') {
      this.loadingIndicator.destroy();
    }
  }
}

// 전역 인스턴스 생성
const IMCAT = new IMCATCore();

// 전역 함수로도 사용 가능
function IMCATFunction(selector) {
  return IMCAT.$(selector);
}

// IMCATCore의 프로토타입 메서드와 getter를 복사
const proto = Object.getPrototypeOf(IMCAT);
Object.getOwnPropertyNames(proto).forEach(key => {
  if (key === 'constructor') return;

  const descriptor = Object.getOwnPropertyDescriptor(proto, key);

  if (descriptor.get) {
    // getter인 경우
    Object.defineProperty(IMCATFunction, key, {
      get() {
        return IMCAT[key];
      }
    });
  } else if (typeof descriptor.value === 'function') {
    // 일반 메서드인 경우
    IMCATFunction[key] = IMCAT[key].bind(IMCAT);
  }
});

// 인스턴스 프로퍼티 복사
Object.keys(IMCAT).forEach(key => {
  if (!Object.prototype.hasOwnProperty.call(IMCATFunction, key)) {
    Object.defineProperty(IMCATFunction, key, {
      get() {
        return IMCAT[key];
      }
    });
  }
});

// 브라우저 전역에 등록
if (typeof window !== 'undefined') {
  window.IMCAT = IMCATFunction;
}

// ES Module default export
export default IMCATFunction;

// Named exports는 모듈 개발자용
// IIFE 빌드 시에는 default만 사용됨
