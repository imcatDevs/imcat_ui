/**
 * Module Loader 테스트
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ModuleLoader } from '../../src/core/loader.js';

// Mock dynamic import
const mockImport = vi.fn();
vi.stubGlobal('import', mockImport);

describe('Module Loader', () => {
  let loader;

  beforeEach(() => {
    loader = new ModuleLoader();
    vi.clearAllMocks();
    document.head.innerHTML = '';
  });

  describe('use()', () => {
    it('단일 모듈을 로드해야 함', async () => {
      const MockModal = class Modal {};
      
      // _loadModule을 모킹하되, 캐시에도 저장하도록 함
      loader._loadModule = vi.fn(async (name) => {
        loader.modules.set(name, MockModal);
        return MockModal;
      });

      const result = await loader.use('modal');
      expect(result).toBe(MockModal);
      expect(loader.hasModule('modal')).toBe(true);
    });

    it('여러 모듈을 로드해야 함', async () => {
      const MockModal = class Modal {};
      const MockDropdown = class Dropdown {};

      loader._loadModule = vi.fn()
        .mockResolvedValueOnce(MockModal)
        .mockResolvedValueOnce(MockDropdown);

      const [Modal, Dropdown] = await loader.use('modal', 'dropdown');
      
      expect(Modal).toBe(MockModal);
      expect(Dropdown).toBe(MockDropdown);
      expect(loader._loadModule).toHaveBeenCalledTimes(2);
    });

    it('캐시된 모듈을 반환해야 함', async () => {
      const MockModal = class Modal {};
      loader.modules.set('modal', MockModal);

      const result = await loader.use('modal');
      expect(result).toBe(MockModal);
    });
  });

  describe('preload()', () => {
    it('여러 모듈을 사전 로드해야 함', async () => {
      loader._loadModule = vi.fn().mockResolvedValue(class {});

      await loader.preload('modal', 'dropdown', 'tooltip');
      
      expect(loader._loadModule).toHaveBeenCalledTimes(3);
      expect(loader._loadModule).toHaveBeenCalledWith('modal');
      expect(loader._loadModule).toHaveBeenCalledWith('dropdown');
      expect(loader._loadModule).toHaveBeenCalledWith('tooltip');
    });
  });

  describe('loadCSS()', () => {
    it('CSS 파일을 로드해야 함', async () => {
      const promise = loader.loadCSS('./test.css');

      // link 요소가 생성되었는지 확인
      await vi.waitFor(() => {
        const link = document.head.querySelector('link[href="./test.css"]');
        expect(link).not.toBeNull();
      });

      const link = document.head.querySelector('link[href="./test.css"]');
      expect(link.rel).toBe('stylesheet');

      // onload 트리거
      link.onload();

      await promise;
      expect(loader.loadedCSS.has('./test.css')).toBe(true);
    });

    it('이미 로드된 CSS는 다시 로드하지 않아야 함', async () => {
      const promise1 = loader.loadCSS('./test.css');
      
      await vi.waitFor(() => {
        const link = document.head.querySelector('link[href="./test.css"]');
        expect(link).not.toBeNull();
      });
      
      const link1 = document.head.querySelector('link[href="./test.css"]');
      link1.onload();
      await promise1;

      // 다시 로드 시도
      await loader.loadCSS('./test.css');
      const links = document.head.querySelectorAll('link[href="./test.css"]');
      
      expect(links.length).toBe(1);
    });

    it('CSS 로드 실패를 처리해야 함', async () => {
      const promise = loader.loadCSS('./fail.css');
      const link = document.head.querySelector('link[href="./fail.css"]');
      
      link.onerror();

      await expect(promise).rejects.toThrow('Failed to load CSS: ./fail.css');
    });
  });

  describe('getModule()', () => {
    it('로드된 모듈을 반환해야 함', () => {
      const MockModal = class Modal {};
      loader.modules.set('modal', MockModal);

      const result = loader.getModule('modal');
      expect(result).toBe(MockModal);
    });

    it('로드되지 않은 모듈은 null을 반환해야 함', () => {
      const result = loader.getModule('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('hasModule()', () => {
    it('로드된 모듈은 true를 반환해야 함', () => {
      loader.modules.set('modal', class {});
      expect(loader.hasModule('modal')).toBe(true);
    });

    it('로드되지 않은 모듈은 false를 반환해야 함', () => {
      expect(loader.hasModule('modal')).toBe(false);
    });
  });

  describe('setBasePath()', () => {
    it('기본 경로를 설정해야 함', () => {
      loader.setBasePath('./custom/path');
      expect(loader.basePath).toBe('./custom/path');
    });
  });

  describe('clearCache()', () => {
    it('특정 모듈 캐시를 삭제해야 함', () => {
      loader.modules.set('modal', class {});
      loader.modules.set('dropdown', class {});

      loader.clearCache('modal');

      expect(loader.hasModule('modal')).toBe(false);
      expect(loader.hasModule('dropdown')).toBe(true);
    });

    it('전체 캐시를 삭제해야 함', () => {
      loader.modules.set('modal', class {});
      loader.modules.set('dropdown', class {});

      loader.clearCache();

      expect(loader.hasModule('modal')).toBe(false);
      expect(loader.hasModule('dropdown')).toBe(false);
    });
  });

  describe('getLoadedModules()', () => {
    it('로드된 모듈 목록을 반환해야 함', () => {
      loader.modules.set('modal', class {});
      loader.modules.set('dropdown', class {});
      loader.modules.set('tooltip', class {});

      const modules = loader.getLoadedModules();
      
      expect(modules).toContain('modal');
      expect(modules).toContain('dropdown');
      expect(modules).toContain('tooltip');
      expect(modules.length).toBe(3);
    });

    it('로드된 모듈이 없으면 빈 배열을 반환해야 함', () => {
      const modules = loader.getLoadedModules();
      expect(modules).toEqual([]);
    });
  });

  describe('getLoadedCSS()', () => {
    it('로드된 CSS 목록을 반환해야 함', async () => {
      const promise1 = loader.loadCSS('./test1.css');
      await vi.waitFor(() => {
        const link = document.head.querySelector('link[href="./test1.css"]');
        expect(link).not.toBeNull();
      });
      const link1 = document.head.querySelector('link[href="./test1.css"]');
      link1.onload();
      await promise1;

      const promise2 = loader.loadCSS('./test2.css');
      await vi.waitFor(() => {
        const link = document.head.querySelector('link[href="./test2.css"]');
        expect(link).not.toBeNull();
      });
      const link2 = document.head.querySelector('link[href="./test2.css"]');
      link2.onload();
      await promise2;

      const cssFiles = loader.getLoadedCSS();
      
      expect(cssFiles).toContain('./test1.css');
      expect(cssFiles).toContain('./test2.css');
      expect(cssFiles.length).toBe(2);
    });
  });

  describe('_capitalize()', () => {
    it('첫 글자를 대문자로 변환해야 함', () => {
      expect(loader._capitalize('modal')).toBe('Modal');
      expect(loader._capitalize('dropdown')).toBe('Dropdown');
      expect(loader._capitalize('m')).toBe('M');
    });
  });

  describe('에러 처리', () => {
    it('존재하지 않는 모듈 로드 시 에러를 발생시켜야 함', async () => {
      loader._loadModule = vi.fn().mockRejectedValue(new Error('Module "nonexistent" not found'));

      await expect(loader.use('nonexistent')).rejects.toThrow('Module "nonexistent" not found');
    });
  });

  describe('실전 시나리오', () => {
    it('모듈과 CSS를 함께 로드', async () => {
      const MockModal = class Modal {
        constructor() {
          this.element = null;
        }
      };

      // CSS 로드 모킹
      loader._loadModuleCSS = vi.fn().mockResolvedValue();
      
      // 모듈을 캐시에 직접 추가 (import 모킹 우회)
      loader.modules.set('modal', MockModal);

      const Modal = await loader.use('modal');
      expect(Modal).toBe(MockModal);
      
      const instance = new Modal();
      expect(instance).toBeInstanceOf(MockModal);
    });

    it('여러 모듈을 순차적으로 로드', async () => {
      const modules = ['modal', 'dropdown', 'tooltip', 'tabs'];
      const mocks = modules.map(name => class {});

      // 각 모듈을 캐시에 추가
      modules.forEach((name, index) => {
        loader.modules.set(name, mocks[index]);
      });

      for (const moduleName of modules) {
        const Module = await loader.use(moduleName);
        expect(Module).toBeDefined();
        expect(loader.hasModule(moduleName)).toBe(true);
      }

      expect(loader.getLoadedModules().length).toBe(4);
    });

    it('모듈 재사용 (캐싱)', async () => {
      const MockModal = class Modal {};
      loader.modules.set('modal', MockModal);

      // 첫 번째 로드
      const Modal1 = await loader.use('modal');
      
      // 두 번째 로드 (캐시에서)
      const Modal2 = await loader.use('modal');
      
      // 같은 인스턴스여야 함
      expect(Modal1).toBe(Modal2);
    });

    it('사전 로딩 후 즉시 사용', async () => {
      const MockModal = class Modal {};
      const MockDropdown = class Dropdown {};

      loader.modules.set('modal', MockModal);
      loader.modules.set('dropdown', MockDropdown);

      // 사전 로딩
      await loader.preload('modal', 'dropdown');

      // 즉시 사용 (이미 캐시됨)
      const Modal = loader.getModule('modal');
      const Dropdown = loader.getModule('dropdown');

      expect(Modal).toBe(MockModal);
      expect(Dropdown).toBe(MockDropdown);
    });
  });
});
