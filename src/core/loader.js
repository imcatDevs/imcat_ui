/**
 * 모듈 로더
 * @module core/loader
 */

/**
 * 모듈 로더 클래스
 */
export class ModuleLoader {
  constructor() {
    this.modules = new Map();
    this.loadedCSS = new Set();
    this.basePath = './modules';
  }

  /**
   * 모듈 로드
   * @param {...string} moduleNames - 모듈 이름들
   * @returns {Promise<*>} 단일 또는 배열로 모듈 반환
   * 
   * @example
   * // 단일 모듈
   * const Modal = await loader.use('modal');
   * 
   * // 여러 모듈
   * const [Modal, Dropdown] = await loader.use('modal', 'dropdown');
   */
  async use(...moduleNames) {
    // 단일 모듈
    if (moduleNames.length === 1) {
      return this._loadModule(moduleNames[0]);
    }

    // 여러 모듈
    const modules = await Promise.all(
      moduleNames.map(name => this._loadModule(name))
    );
    return modules;
  }

  /**
   * 모듈 사전 로드 (캐싱)
   * @param {...string} moduleNames - 모듈 이름들
   * @returns {Promise<void>}
   * 
   * @example
   * await loader.preload('modal', 'dropdown', 'tooltip');
   */
  async preload(...moduleNames) {
    await Promise.all(
      moduleNames.map(name => this._loadModule(name))
    );
  }

  /**
   * 모듈 로드 (내부)
   * @private
   * @param {string} moduleName - 모듈 이름
   * @returns {Promise<*>} 모듈
   */
  async _loadModule(moduleName) {
    // 캐시된 모듈 반환
    if (this.modules.has(moduleName)) {
      return this.modules.get(moduleName);
    }

    try {
      // CSS 로드
      await this._loadModuleCSS(moduleName);

      // JS 모듈 로드
      const modulePath = `${this.basePath}/${moduleName}/${moduleName}.js`;
      const module = await import(modulePath);

      // 기본 export 또는 named export
      const moduleExport = module.default || module[this._capitalize(moduleName)];

      if (!moduleExport) {
        throw new Error(`Module "${moduleName}" does not have a default or named export`);
      }

      // 캐시에 저장
      this.modules.set(moduleName, moduleExport);

      return moduleExport;

    } catch (error) {
      console.error(`Failed to load module "${moduleName}":`, error);
      throw new Error(`Module "${moduleName}" not found`);
    }
  }

  /**
   * 모듈 CSS 로드
   * @private
   * @param {string} moduleName - 모듈 이름
   */
  async _loadModuleCSS(moduleName) {
    const cssPath = `${this.basePath}/${moduleName}/${moduleName}.css`;

    // 이미 로드된 CSS는 스킵
    if (this.loadedCSS.has(cssPath)) {
      return;
    }

    try {
      await this.loadCSS(cssPath);
      this.loadedCSS.add(cssPath);
    } catch (error) {
      // CSS가 없으면 무시 (선택적)
      console.warn(`CSS not found for module "${moduleName}"`);
    }
  }

  /**
   * CSS 파일 로드
   * @param {string} url - CSS 파일 URL
   * @returns {Promise<void>}
   * 
   * @example
   * await loader.loadCSS('./styles/custom.css');
   */
  loadCSS(url) {
    return new Promise((resolve, reject) => {
      // 이미 로드된 CSS 확인
      if (this.loadedCSS.has(url)) {
        resolve();
        return;
      }

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = url;

      link.onload = () => {
        this.loadedCSS.add(url);
        resolve();
      };

      link.onerror = () => {
        reject(new Error(`Failed to load CSS: ${url}`));
      };

      document.head.appendChild(link);
    });
  }

  /**
   * 로드된 모듈 가져오기
   * @param {string} moduleName - 모듈 이름
   * @returns {*|null} 모듈 또는 null
   * 
   * @example
   * const Modal = loader.getModule('modal');
   */
  getModule(moduleName) {
    return this.modules.get(moduleName) || null;
  }

  /**
   * 모듈 로드 여부 확인
   * @param {string} moduleName - 모듈 이름
   * @returns {boolean}
   * 
   * @example
   * if (loader.hasModule('modal')) {
   *   console.log('Modal already loaded');
   * }
   */
  hasModule(moduleName) {
    return this.modules.has(moduleName);
  }

  /**
   * 기본 경로 설정
   * @param {string} path - 모듈 기본 경로
   * 
   * @example
   * loader.setBasePath('./custom/modules');
   */
  setBasePath(path) {
    this.basePath = path;
  }

  /**
   * 모듈 캐시 초기화
   * @param {string} [moduleName] - 특정 모듈만 초기화 (선택)
   * 
   * @example
   * loader.clearCache(); // 전체 초기화
   * loader.clearCache('modal'); // 특정 모듈만
   */
  clearCache(moduleName) {
    if (moduleName) {
      this.modules.delete(moduleName);
    } else {
      this.modules.clear();
    }
  }

  /**
   * 로드된 모듈 목록
   * @returns {string[]} 모듈 이름 배열
   */
  getLoadedModules() {
    return Array.from(this.modules.keys());
  }

  /**
   * 로드된 CSS 목록
   * @returns {string[]} CSS URL 배열
   */
  getLoadedCSS() {
    return Array.from(this.loadedCSS);
  }

  /**
   * 첫 글자 대문자 변환
   * @private
   * @param {string} str - 문자열
   * @returns {string}
   */
  _capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

export default ModuleLoader;
