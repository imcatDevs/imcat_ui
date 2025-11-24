/**
 * SPA 뷰 라우터
 * @module core/router
 */

import { Security } from './security.js';

/**
 * 뷰 라우터
 * @class
 * @description SPA(Single Page Application) 라우팅을 처리하는 클래스입니다.
 * History API를 사용하여 페이지 전환을 관리하고, views/ 폴더 하위 경로를 지원합니다.
 * 
 * @example
 * const router = new ViewRouter();
 * router.navigate('views/home.html');
 */
export class ViewRouter {
  /**
   * ViewRouter 생성자
   * @constructor
   */
  constructor() {
    this.container = '#app';
    this.currentPath = '';
    this.hooks = {
      beforeLoad: [],
      afterLoad: [],
      onError: []
    };
    // 인스턴스 관리
    this.instances = new Map();
    this.currentViewInstances = [];
    this.loading = null;
    this._popstateHandler = null;
    
    // History API 사용 여부 (기본값: true)
    this.useHistory = true;
  }

  /**
   * 초기화
   * @param {Object} [options] - 옵션
   * @param {Object} [options.loading] - 로딩 인디케이터 인스턴스
   * @param {boolean} [options.autoNavigate=true] - 초기 hash 경로 자동 로드 여부
   * @param {boolean} [options.useHistory=true] - History API 사용 여부 (false면 URL 변경 안함)
   */
  init(options = {}) {
    if (options.loading) {
      this.loading = options.loading;
    }
    
    // History API 사용 여부 설정
    if ('useHistory' in options) {
      this.useHistory = options.useHistory;
    }

    // History API 이벤트 리스너 (useHistory가 true일 때만)
    if (this.useHistory) {
      this._popstateHandler = (e) => {
        if (e.state?.path) {
          this._loadView(e.state.path, false);
        }
      };
      window.addEventListener('popstate', this._popstateHandler);
    }

    // 초기 경로 자동 로드 (useHistory가 true일 때만)
    const autoNavigate = 'autoNavigate' in options ? options.autoNavigate : true;
    if (autoNavigate && this.useHistory) {
      const initialPath = window.location.hash.slice(1) || '';
      if (initialPath) {
        this.navigate(initialPath, true);
      }
    }
  }

  /**
   * 페이지 이동
   * @param {string} path - 페이지 경로
   * @param {boolean} [replace=false] - 히스토리 교체 여부
   * @returns {Promise<void>}
   * 
   * @example
   * router.navigate('views/home.html');
   * router.navigate('views/login.html', true); // 히스토리 교체
   */
  async navigate(path, replace = false) {
    // 경로 보안 검증
    if (!Security.validatePath(path)) {
      console.error('Invalid path:', path);
      await this._emitHook('onError', new Error('Invalid path'));
      return;
    }

    await this._loadView(path, !replace);
  }

  /**
   * 뷰 로드
   * @private
   * @param {string} path - 경로 (쿼리 스트링 포함 가능)
   * @param {boolean} [pushState=true] - pushState 사용 여부
   */
  async _loadView(path, pushState = true) {
    const from = this.currentPath;

    try {
      // 이전 뷰의 인스턴스 정리
      this._cleanupCurrentView();

      // beforeLoad 훅
      await this._emitHook('beforeLoad', path, from);

      // 로딩 표시
      if (this.loading) {
        this.loading.show('페이지 로딩 중...');
      }

      // 쿼리 스트링 분리 (fetch는 파일 경로만 필요)
      const [filePath] = path.split('?');

      // HTML 파일 가져오기
      const response = await fetch(filePath);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();

      // 뷰 파일 렌더링
      // views/ 폴더 및 하위 폴더의 뷰 파일은 개발자가 작성한 신뢰할 수 있는 파일이므로
      // sanitize를 건너뛰고 스크립트와 스타일을 그대로 허용합니다.
      // 
      // 보안 정책:
      // - Security.validatePath()로 views/ 외부 경로 차단
      // - 경로 순회 공격(..), 절대 경로 차단
      // - 사용자 입력은 뷰 내부에서 IMCAT.escape()로 처리
      // - views/admin/dashboard.html 같은 하위 폴더도 지원
      
      // 컨테이너에 렌더링
      const container = document.querySelector(this.container);
      if (container) {
        container.innerHTML = html;

        // 스크립트 실행
        this._executeScripts(container);
      }

      // History API 업데이트 (useHistory가 true일 때만)
      if (pushState && this.useHistory) {
        window.history.pushState({ path }, '', `#${path}`);
      }

      this.currentPath = path;

      // afterLoad 훅
      await this._emitHook('afterLoad', path);

    } catch (error) {
      console.error('Failed to load view:', error);
      await this._emitHook('onError', error);
    } finally {
      // 로딩 숨김
      if (this.loading) {
        this.loading.hide();
      }
    }
  }

  /**
   * 스크립트 실행
   * @private
   * @param {HTMLElement} container - 컨테이너
   */
  _executeScripts(container) {
    const scripts = container.querySelectorAll('script');
    
    scripts.forEach((oldScript) => {
      const newScript = document.createElement('script');

      // 속성 복사
      Array.from(oldScript.attributes).forEach(attr => {
        newScript.setAttribute(attr.name, attr.value);
      });

      // 내용 복사
      newScript.textContent = oldScript.textContent;

      // 기존 스크립트 교체
      oldScript.parentNode.replaceChild(newScript, oldScript);
    });
  }

  /**
   * URL 파라미터 조회
   * @returns {Object} 파라미터 객체
   * 
   * @example
   * // URL: #views/product.html?id=123&color=red
   * const params = router.params();
   * console.log(params.id); // '123'
   * console.log(params.color); // 'red'
   */
  params() {
    const hash = window.location.hash.slice(1);
    const [, queryString] = hash.split('?');

    if (!queryString) return {};

    const params = {};
    const searchParams = new URLSearchParams(queryString);

    for (const [key, value] of searchParams) {
      // 이스케이프 없이 원본 값 반환 (뷰에서 사용 시)
      params[key] = value;
    }

    return params;
  }

  /**
   * 뒤로 가기
   * 
   * @example
   * router.back();
   */
  back() {
    window.history.back();
  }

  /**
   * 앞으로 가기
   * 
   * @example
   * router.forward();
   */
  forward() {
    window.history.forward();
  }

  /**
   * 현재 경로
   * @returns {string} 현재 경로
   * 
   * @example
   * const path = router.current(); // 'views/home.html'
   */
  current() {
    return this.currentPath;
  }

  /**
   * 컨테이너 설정
   * @param {string} selector - CSS 선택자
   * 
   * @example
   * router.setContainer('#main-content');
   */
  setContainer(selector) {
    this.container = selector;
  }

  /**
   * 인스턴스 등록 (메모리 누수 방지)
   * @param {Object} instance - destroy() 메서드를 가진 인스턴스
   * @returns {Object} 등록된 인스턴스
   * 
   * @example
   * const modal = new Modal();
   * router.registerInstance(modal);
   * // 뷰 전환 시 modal.destroy() 자동 호출됨
   */
  registerInstance(instance) {
    if (instance && typeof instance.destroy === 'function') {
      this.currentViewInstances.push(instance);
      return instance;
    }
    console.warn('Instance must have destroy() method');
    return instance;
  }

  /**
   * 현재 뷰의 모든 인스턴스 정리
   * @private
   */
  _cleanupCurrentView() {
    // 현재 뷰의 모든 인스턴스 정리
    this.currentViewInstances.forEach(instance => {
      try {
        if (instance && typeof instance.destroy === 'function') {
          instance.destroy();
        }
      } catch (error) {
        console.error('Error destroying instance:', error);
      }
    });

    // 인스턴스 배열 초기화
    this.currentViewInstances = [];
  }

  /**
   * beforeLoad 훅 등록
   * @param {Function} handler - 핸들러 (path, from) => {}
   * @returns {Function} 구독 취소 함수
   * 
   * @example
   * const unsubscribe = router.beforeLoad((path, from) => {
   *   console.log(`${from} → ${path}`);
   * });
   */
  beforeLoad(handler) {
    this.hooks.beforeLoad.push(handler);
    return () => this._removeHook('beforeLoad', handler);
  }

  /**
   * afterLoad 훅 등록
   * @param {Function} handler - 핸들러 (path) => {}
   * @returns {Function} 구독 취소 함수
   * 
   * @example
   * router.afterLoad((path) => {
   *   console.log('로드 완료:', path);
   * });
   */
  afterLoad(handler) {
    this.hooks.afterLoad.push(handler);
    return () => this._removeHook('afterLoad', handler);
  }

  /**
   * onError 훅 등록
   * @param {Function} handler - 핸들러 (error) => {}
   * @returns {Function} 구독 취소 함수
   * 
   * @example
   * router.onError((error) => {
   *   console.error('로드 실패:', error);
   * });
   */
  onError(handler) {
    this.hooks.onError.push(handler);
    return () => this._removeHook('onError', handler);
  }

  /**
   * 훅 실행
   * @private
   * @param {string} name - 훅 이름
   * @param {...*} args - 인자
   */
  async _emitHook(name, ...args) {
    const handlers = this.hooks[name] || [];
    for (const handler of handlers) {
      try {
        await handler(...args);
      } catch (error) {
        console.error(`Error in ${name} hook:`, error);
      }
    }
  }

  /**
   * 훅 제거
   * @private
   * @param {string} name - 훅 이름
   * @param {Function} handler - 핸들러
   */
  _removeHook(name, handler) {
    const handlers = this.hooks[name];
    const index = handlers.indexOf(handler);
    if (index !== -1) {
      handlers.splice(index, 1);
    }
  }

  /**
   * 모든 훅 제거
   */
  clearHooks() {
    this.hooks.beforeLoad = [];
    this.hooks.afterLoad = [];
    this.hooks.onError = [];
  }

  /**
   * 등록된 인스턴스 수
   * @returns {number}
   */
  getInstanceCount() {
    return this.currentViewInstances.length;
  }

  /**
   * 라우터 정리 (메모리 누수 방지)
   * 이벤트 리스너와 인스턴스 모두 정리
   */
  destroy() {
    // popstate 이벤트 리스너 제거
    if (this._popstateHandler) {
      window.removeEventListener('popstate', this._popstateHandler);
      this._popstateHandler = null;
    }

    // 현재 뷰의 인스턴스 정리
    this._cleanupCurrentView();

    // 모든 훅 제거
    this.clearHooks();

    // 로딩 인디케이터 정리
    if (this.loading && typeof this.loading.forceHide === 'function') {
      this.loading.forceHide();
    }

    // 상태 초기화
    this.currentPath = '';
    this.instances.clear();
  }
}

export default ViewRouter;
