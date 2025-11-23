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
 */
class IMCATCore {
  constructor() {
    // 싱글톤 인스턴스들
    this.eventBus = new EventBus();
    this.loader = new ModuleLoader();
    this.router = new ViewRouter();
    this.loadingIndicator = LoadingIndicator;
    
    // Router에 Loading 통합
    this.router.init({ loading: this.loadingIndicator });
    
    // catui-href 자동 바인딩 (DOM ready 후)
    this._bindSPALinks();
  }

  /**
   * catui-href 자동 바인딩
   * SPA 링크를 자동으로 처리하여 설정 코드 불필요
   * @private
   */
  _bindSPALinks() {
    // DOM ready 대기
    const bindLinks = () => {
      document.addEventListener('click', (e) => {
        const link = e.target.closest('[catui-href]');
        if (link) {
          e.preventDefault();
          const path = link.getAttribute('catui-href');
          if (path) {
            this.router.navigate(path);
          }
        }
      });
    };

    // DOM이 이미 로드되었으면 즉시 실행, 아니면 대기
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', bindLinks);
    } else {
      bindLinks();
    }
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
  if (!IMCATFunction.hasOwnProperty(key)) {
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

// Named exports
export {
  DOM,
  EventBus,
  ModuleLoader,
  ViewRouter,
  LoadingIndicator,
  APIUtil,
  Security,
  Utils,
  Template,
  Storage,
  URLUtil,
  StateManager,
  GlobalState,
  FormValidator,
  AnimationUtil
};
