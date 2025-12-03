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
import { Shortcuts } from './shortcuts.js';
import { Helpers } from './helpers.js';
import { Formatters } from './formatters.js';
import { Config } from './config.js';
import { AutoInit } from './auto-init.js';

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

    // 단축 API에 IMCAT 인스턴스 바인딩
    this._initShortcuts();

    // 자동 초기화 시작 (DOM ready 후)
    this._initAutoInit();
  }

  /**
   * 단축 API 초기화
   * @private
   */
  _initShortcuts() {
    // toast, notify, theme에 IMCAT 인스턴스 주입
    Shortcuts.toast._imcat = this;
    Shortcuts.notify._imcat = this;
    Shortcuts.theme._imcat = this;
  }

  /**
   * 자동 초기화 시작
   * @private
   */
  _initAutoInit() {
    // DOM ready 후 AutoInit 시작
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        AutoInit.init(this);
      });
    } else {
      AutoInit.init(this);
    }
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

  // ===== Shortcuts API =====
  /**
   * 모달 단축 생성
   * @param {Object} options - 모달 옵션
   * @returns {Promise<Modal>}
   */
  modal(options) {
    return Shortcuts.modal.call(this, options);
  }

  /**
   * 드로어 단축 생성
   * @param {Object} options - 드로어 옵션
   * @returns {Promise<Drawer>}
   */
  drawer(options) {
    return Shortcuts.drawer.call(this, options);
  }

  /**
   * 확인 다이얼로그
   * @param {string|Object} options - 메시지 또는 옵션
   * @returns {Promise<boolean>}
   */
  confirm(options) {
    return Shortcuts.confirm.call(this, options);
  }

  /**
   * 알림 다이얼로그
   * @param {string} message - 메시지
   * @param {Object} [options] - 옵션
   * @returns {Promise<void>}
   */
  alert(message, options) {
    return Shortcuts.alert.call(this, message, options);
  }

  /**
   * 입력 다이얼로그
   * @param {string} message - 메시지
   * @param {Object} [options] - 옵션
   * @returns {Promise<string|null>}
   */
  prompt(message, options) {
    return Shortcuts.prompt.call(this, message, options);
  }

  /**
   * 드롭다운 단축 생성
   * @param {string|HTMLElement} trigger - 트리거
   * @param {Object} options - 옵션
   * @returns {Promise<Dropdown>}
   */
  dropdown(trigger, options) {
    return Shortcuts.dropdown.call(this, trigger, options);
  }

  /**
   * 툴팁 단축 생성
   * @param {string|HTMLElement} element - 대상 요소
   * @param {string|Object} options - 내용 또는 옵션
   * @returns {Promise<Tooltip>}
   */
  tooltip(element, options) {
    return Shortcuts.tooltip.call(this, element, options);
  }

  /**
   * 팝오버 단축 생성
   */
  popover(element, options) {
    return Shortcuts.popover.call(this, element, options);
  }

  /**
   * 탭 단축 생성
   */
  tabs(element, options) {
    return Shortcuts.tabs.call(this, element, options);
  }

  /**
   * 아코디언 단축 생성
   */
  accordion(element, options) {
    return Shortcuts.accordion.call(this, element, options);
  }

  /**
   * 캐러셀 단축 생성
   */
  carousel(element, options) {
    return Shortcuts.carousel.call(this, element, options);
  }

  /**
   * 라이트박스 (이미지 갤러리)
   */
  lightbox(images, options) {
    return Shortcuts.lightbox.call(this, images, options);
  }

  /**
   * 날짜 선택기 단축 생성
   */
  datePicker(element, options) {
    return Shortcuts.datePicker.call(this, element, options);
  }

  /**
   * 시간 선택기 단축 생성
   */
  timePicker(element, options) {
    return Shortcuts.timePicker.call(this, element, options);
  }

  /**
   * 색상 선택기 단축 생성
   */
  colorPicker(element, options) {
    return Shortcuts.colorPicker.call(this, element, options);
  }

  /**
   * 카운트다운 단축 생성
   */
  countdown(element, targetDate, options) {
    return Shortcuts.countdown.call(this, element, targetDate, options);
  }

  /**
   * 자동완성 단축 생성
   */
  autocomplete(element, options) {
    return Shortcuts.autocomplete.call(this, element, options);
  }

  /**
   * 다중 선택 단축 생성
   */
  multiSelect(element, options) {
    return Shortcuts.multiSelect.call(this, element, options);
  }

  /**
   * 범위 슬라이더 단축 생성
   */
  rangeSlider(element, options) {
    return Shortcuts.rangeSlider.call(this, element, options);
  }

  /**
   * 별점 단축 생성
   */
  rating(element, options) {
    return Shortcuts.rating.call(this, element, options);
  }

  /**
   * 파일 업로드 단축 생성
   */
  fileUpload(element, options) {
    return Shortcuts.fileUpload.call(this, element, options);
  }

  /**
   * 데이터 테이블 단축 생성
   */
  dataTable(element, options) {
    return Shortcuts.dataTable.call(this, element, options);
  }

  /**
   * 차트 단축 생성
   */
  chart(element, options) {
    return Shortcuts.chart.call(this, element, options);
  }

  /**
   * 칸반 보드 단축 생성
   */
  kanban(element, options) {
    return Shortcuts.kanban.call(this, element, options);
  }

  /**
   * 스테퍼 단축 생성
   */
  stepper(element, options) {
    return Shortcuts.stepper.call(this, element, options);
  }

  /**
   * QR 코드 생성
   */
  qrCode(element, data, options) {
    return Shortcuts.qrCode.call(this, element, data, options);
  }

  /**
   * 진행률 트래커 단축 생성
   */
  progress(options) {
    return Shortcuts.progress.call(this, options);
  }

  /**
   * 스켈레톤 로딩 표시
   */
  skeleton(element, options) {
    return Shortcuts.skeleton.call(this, element, options);
  }

  /**
   * 무한 스크롤 단축 생성
   */
  infiniteScroll(element, options) {
    return Shortcuts.infiniteScroll.call(this, element, options);
  }

  /**
   * 페이지네이션 단축 생성
   */
  pagination(element, options) {
    return Shortcuts.pagination.call(this, element, options);
  }

  /**
   * 간트 차트 단축 생성
   */
  gantt(element, options) {
    return Shortcuts.gantt.call(this, element, options);
  }

  /**
   * 이미지 목록 (갤러리) 단축 생성
   */
  imageList(element, options) {
    return Shortcuts.imageList.call(this, element, options);
  }

  /**
   * 이미지 비교 슬라이더
   */
  imageCompare(element, options) {
    return Shortcuts.imageCompare.call(this, element, options);
  }

  /**
   * 토스트 API
   * @returns {Object}
   */
  get toast() {
    return Shortcuts.toast;
  }

  /**
   * 알림(Notification) API
   * @returns {Object}
   */
  get notify() {
    return Shortcuts.notify;
  }

  /**
   * 테마 API (전환 효과 포함)
   * @returns {Object}
   * 
   * @example
   * // 테마 토글
   * IMCAT.theme.toggle();
   * 
   * // 클릭 위치 기반 원형 전환 효과
   * btn.addEventListener('click', (e) => IMCAT.theme.toggleWithEvent(e));
   * 
   * // 테마 설정
   * IMCAT.theme.set('dark');
   */
  get theme() {
    return Shortcuts.theme;
  }

  // ===== Helpers API =====
  /**
   * 폼 데이터 수집
   * @param {string|HTMLFormElement} selector - 폼
   * @returns {Object}
   */
  formData(selector) {
    return Helpers.formData(selector);
  }

  /**
   * 폼에 데이터 채우기
   * @param {string|HTMLFormElement} selector - 폼
   * @param {Object} data - 데이터
   */
  fillForm(selector, data) {
    return Helpers.fillForm(selector, data);
  }

  /**
   * 폼 초기화
   * @param {string|HTMLFormElement} selector - 폼
   */
  resetForm(selector) {
    return Helpers.resetForm(selector);
  }

  /**
   * 클립보드 복사
   * @param {string} text - 복사할 텍스트
   * @returns {Promise<boolean>}
   */
  copy(text) {
    return Helpers.copy(text);
  }

  /**
   * 파일 다운로드
   * @param {Blob|string} content - 내용
   * @param {string} filename - 파일명
   */
  download(content, filename) {
    return Helpers.download(content, filename);
  }

  /**
   * JSON 다운로드
   * @param {*} data - JSON 데이터
   * @param {string} filename - 파일명
   */
  downloadJSON(data, filename) {
    return Helpers.downloadJSON(data, filename);
  }

  /**
   * CSV 다운로드
   * @param {Object[]} rows - 행 데이터
   * @param {string} filename - 파일명
   */
  downloadCSV(rows, filename) {
    return Helpers.downloadCSV(rows, filename);
  }

  /**
   * 테이블 데이터 추출
   * @param {string|HTMLTableElement} selector - 테이블
   * @returns {Object[]}
   */
  tableData(selector) {
    return Helpers.tableData(selector);
  }

  /**
   * 스크롤 위치로 이동
   * @param {string|HTMLElement|number} target - 대상
   * @param {Object} [options] - 옵션
   */
  scrollTo(target, options) {
    return Helpers.scrollTo(target, options);
  }

  /**
   * 페이지 최상단으로 스크롤
   * @param {boolean} [smooth=true] - 부드러운 스크롤
   */
  scrollTop(smooth) {
    return Helpers.scrollTop(smooth);
  }

  /**
   * 요소가 뷰포트에 보이는지 확인
   * @param {string|HTMLElement} selector - 선택자
   * @returns {boolean}
   */
  isInViewport(selector) {
    return Helpers.isInViewport(selector);
  }

  /**
   * URL 쿼리 파라미터 파싱
   * @param {string} [url] - URL (기본: 현재 URL)
   * @returns {Object}
   */
  parseQuery(url) {
    return Helpers.parseQuery(url);
  }

  /**
   * 쿼리 스트링 생성
   * @param {Object} params - 파라미터 객체
   * @returns {string}
   */
  buildQuery(params) {
    return Helpers.buildQuery(params);
  }

  /**
   * 로컬 스토리지 안전 조회
   * @param {string} key - 키
   * @param {*} [defaultValue] - 기본값
   * @returns {*}
   */
  getStorage(key, defaultValue) {
    return Helpers.getStorage(key, defaultValue);
  }

  /**
   * 로컬 스토리지 안전 저장
   * @param {string} key - 키
   * @param {*} value - 값
   * @returns {boolean}
   */
  setStorage(key, value) {
    return Helpers.setStorage(key, value);
  }

  // ===== Formatters API =====
  /**
   * 포맷터 유틸리티
   * @returns {Formatters}
   */
  get format() {
    return Formatters;
  }

  // ===== Config API =====
  /**
   * 글로벌 설정
   * @param {Object|string} keyOrOptions - 설정 키 또는 옵션 객체
   * @param {*} [value] - 설정 값
   * @returns {Object}
   *
   * @example
   * // 여러 설정 변경
   * IMCAT.config({ animation: false, theme: 'dark' });
   *
   * // 단일 설정 변경
   * IMCAT.config('animation', false);
   *
   * // 설정 조회
   * const animation = IMCAT.config.get('animation');
   */
  config(keyOrOptions, value) {
    if (arguments.length === 0) {
      return Config.get();
    }
    return Config.set(keyOrOptions, value);
  }

  // ===== AutoInit API =====
  /**
   * 자동 초기화 유틸리티
   * @returns {AutoInit}
   */
  get autoInit() {
    return AutoInit;
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

    // Config 정리
    Config.destroy();

    // AutoInit 정리
    AutoInit.destroy();
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

// config 메서드에 정적 메서드들 추가 (IMCAT.config.get(), IMCAT.config.reset() 등)
IMCATFunction.config.get = Config.get.bind(Config);
IMCATFunction.config.set = Config.set.bind(Config);
IMCATFunction.config.reset = Config.reset.bind(Config);
IMCATFunction.config.onChange = Config.onChange.bind(Config);
IMCATFunction.config.extend = Config.extend.bind(Config);
IMCATFunction.config.getFor = Config.getFor.bind(Config);
IMCATFunction.config.clearListeners = Config.clearListeners.bind(Config);
IMCATFunction.config.destroy = Config.destroy.bind(Config);

// 브라우저 전역에 등록
if (typeof window !== 'undefined') {
  window.IMCAT = IMCATFunction;
}

// ES Module default export
export default IMCATFunction;

// Named exports는 모듈 개발자용
// IIFE 빌드 시에는 default만 사용됨
