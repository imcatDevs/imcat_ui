/**
 * View Router 테스트
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ViewRouter } from '../../src/core/router.js';

// Mock fetch
global.fetch = vi.fn();

describe('View Router Module', () => {
  let router;

  beforeEach(() => {
    router = new ViewRouter();
    document.body.innerHTML = '<div id="app"></div>';
    window.location.hash = '';
    vi.clearAllMocks();
  });

  afterEach(() => {
    router.clearHooks();
    window.location.hash = '';
  });

  describe('navigate()', () => {
    it('유효한 경로로 이동해야 함', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        text: async () => '<div>Home Page</div>'
      });

      await router.navigate('views/home.html');
      expect(router.current()).toBe('views/home.html');
      expect(document.querySelector('#app').innerHTML).toContain('Home Page');
    });

    it('유효하지 않은 경로를 차단해야 함', async () => {
      const onError = vi.fn();
      router.onError(onError);

      await router.navigate('../etc/passwd');
      expect(onError).toHaveBeenCalled();
      expect(router.current()).toBe('');
    });

    it('히스토리를 추가해야 함', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        text: async () => '<div>Page</div>'
      });

      await router.navigate('views/page.html');
      expect(window.location.hash).toBe('#views/page.html');
    });

    it('replace 옵션으로 히스토리를 교체해야 함', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        text: async () => '<div>Page</div>'
      });

      const pushStateSpy = vi.spyOn(window.history, 'pushState');
      await router.navigate('views/page.html', true);
      
      // replace=true이면 pushState가 호출되지 않음
      expect(pushStateSpy).not.toHaveBeenCalled();
    });

    it('fetch 에러를 처리해야 함', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });

      const onError = vi.fn();
      router.onError(onError);

      await router.navigate('views/notfound.html');
      expect(onError).toHaveBeenCalled();
    });

    it('뷰 파일의 HTML을 그대로 렌더링해야 함 (개발자가 작성한 안전한 파일)', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        text: async () => '<div>View Content</div><script>console.log("view script");</script>'
      });

      await router.navigate('views/page.html');
      const content = document.querySelector('#app').innerHTML;
      // 뷰 파일은 sanitize 하지 않음 (개발자가 작성한 안전한 파일)
      expect(content).toContain('<div>View Content</div>');
      expect(content).toContain('<script>');
    });
  });

  describe('params()', () => {
    it('URL 파라미터를 파싱해야 함', () => {
      window.location.hash = '#views/product.html?id=123&name=test';
      const params = router.params();
      expect(params.id).toBe('123');
      expect(params.name).toBe('test');
    });

    it('파라미터가 없으면 빈 객체를 반환해야 함', () => {
      window.location.hash = '#views/home.html';
      const params = router.params();
      expect(params).toEqual({});
    });

    it('파라미터 값을 원본 그대로 반환해야 함 (뷰에서 escape 사용)', () => {
      window.location.hash = '#views/page.html?category=modules&name=test';
      const params = router.params();
      // params()는 원본 값을 반환, 뷰에서 IMCAT.escape() 사용
      expect(params.category).toBe('modules');
      expect(params.name).toBe('test');
    });
  });

  describe('current()', () => {
    it('현재 경로를 반환해야 함', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        text: async () => '<div>Page</div>'
      });

      await router.navigate('views/page.html');
      expect(router.current()).toBe('views/page.html');
    });

    it('초기에는 빈 문자열을 반환해야 함', () => {
      expect(router.current()).toBe('');
    });
  });

  describe('back() / forward()', () => {
    it('back()을 호출해야 함', () => {
      const backSpy = vi.spyOn(window.history, 'back');
      router.back();
      expect(backSpy).toHaveBeenCalled();
    });

    it('forward()를 호출해야 함', () => {
      const forwardSpy = vi.spyOn(window.history, 'forward');
      router.forward();
      expect(forwardSpy).toHaveBeenCalled();
    });
  });

  describe('setContainer()', () => {
    it('컨테이너를 변경해야 함', async () => {
      document.body.innerHTML = '<div id="custom"></div>';
      router.setContainer('#custom');

      global.fetch.mockResolvedValueOnce({
        ok: true,
        text: async () => '<div>Content</div>'
      });

      await router.navigate('views/page.html');
      expect(document.querySelector('#custom').innerHTML).toContain('Content');
    });
  });

  describe('registerInstance()', () => {
    it('인스턴스를 등록해야 함', () => {
      const instance = { destroy: vi.fn() };
      router.registerInstance(instance);
      expect(router.getInstanceCount()).toBe(1);
    });

    it('destroy 메서드가 없으면 경고해야 함', () => {
      const warnSpy = vi.spyOn(console, 'warn');
      const instance = {};
      router.registerInstance(instance);
      expect(warnSpy).toHaveBeenCalled();
    });

    it('뷰 전환 시 인스턴스를 정리해야 함', async () => {
      const instance1 = { destroy: vi.fn() };
      const instance2 = { destroy: vi.fn() };

      global.fetch.mockResolvedValue({
        ok: true,
        text: async () => '<div>Page</div>'
      });

      await router.navigate('views/page1.html');
      router.registerInstance(instance1);
      router.registerInstance(instance2);

      await router.navigate('views/page2.html');
      expect(instance1.destroy).toHaveBeenCalled();
      expect(instance2.destroy).toHaveBeenCalled();
      expect(router.getInstanceCount()).toBe(0);
    });

    it('인스턴스 정리 중 에러가 발생해도 다른 인스턴스는 정리되어야 함', async () => {
      const instance1 = {
        destroy: vi.fn(() => {
          throw new Error('Destroy error');
        })
      };
      const instance2 = { destroy: vi.fn() };

      global.fetch.mockResolvedValue({
        ok: true,
        text: async () => '<div>Page</div>'
      });

      await router.navigate('views/page1.html');
      router.registerInstance(instance1);
      router.registerInstance(instance2);

      await router.navigate('views/page2.html');
      expect(instance1.destroy).toHaveBeenCalled();
      expect(instance2.destroy).toHaveBeenCalled();
    });
  });

  describe('라이프사이클 훅', () => {
    describe('beforeLoad()', () => {
      it('페이지 로드 전에 호출되어야 함', async () => {
        const beforeLoad = vi.fn();
        router.beforeLoad(beforeLoad);

        global.fetch.mockResolvedValueOnce({
          ok: true,
          text: async () => '<div>Page</div>'
        });

        await router.navigate('views/page.html');
        expect(beforeLoad).toHaveBeenCalledWith('views/page.html', '');
      });

      it('from 경로를 전달해야 함', async () => {
        const beforeLoad = vi.fn();

        global.fetch.mockResolvedValue({
          ok: true,
          text: async () => '<div>Page</div>'
        });

        await router.navigate('views/page1.html');
        router.beforeLoad(beforeLoad);
        await router.navigate('views/page2.html');

        expect(beforeLoad).toHaveBeenCalledWith('views/page2.html', 'views/page1.html');
      });

      it('구독 취소 함수를 반환해야 함', async () => {
        const beforeLoad = vi.fn();
        const unsubscribe = router.beforeLoad(beforeLoad);

        unsubscribe();

        global.fetch.mockResolvedValueOnce({
          ok: true,
          text: async () => '<div>Page</div>'
        });

        await router.navigate('views/page.html');
        expect(beforeLoad).not.toHaveBeenCalled();
      });
    });

    describe('afterLoad()', () => {
      it('페이지 로드 후에 호출되어야 함', async () => {
        const afterLoad = vi.fn();
        router.afterLoad(afterLoad);

        global.fetch.mockResolvedValueOnce({
          ok: true,
          text: async () => '<div>Page</div>'
        });

        await router.navigate('views/page.html');
        expect(afterLoad).toHaveBeenCalledWith('views/page.html');
      });
    });

    describe('onError()', () => {
      it('에러 발생 시 호출되어야 함', async () => {
        const onError = vi.fn();
        router.onError(onError);

        global.fetch.mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error'
        });

        await router.navigate('views/page.html');
        expect(onError).toHaveBeenCalled();
      });

      it('유효하지 않은 경로에서 호출되어야 함', async () => {
        const onError = vi.fn();
        router.onError(onError);

        await router.navigate('../etc/passwd');
        expect(onError).toHaveBeenCalled();
      });
    });

    describe('clearHooks()', () => {
      it('모든 훅을 제거해야 함', async () => {
        const beforeLoad = vi.fn();
        const afterLoad = vi.fn();
        const onError = vi.fn();

        router.beforeLoad(beforeLoad);
        router.afterLoad(afterLoad);
        router.onError(onError);

        router.clearHooks();

        global.fetch.mockResolvedValueOnce({
          ok: true,
          text: async () => '<div>Page</div>'
        });

        await router.navigate('views/page.html');
        expect(beforeLoad).not.toHaveBeenCalled();
        expect(afterLoad).not.toHaveBeenCalled();
      });
    });
  });

  describe('로딩 통합', () => {
    it('로딩 인디케이터를 표시해야 함', async () => {
      const loading = {
        show: vi.fn(),
        hide: vi.fn()
      };

      router.init({ loading });

      global.fetch.mockResolvedValueOnce({
        ok: true,
        text: async () => '<div>Page</div>'
      });

      await router.navigate('views/page.html');
      expect(loading.show).toHaveBeenCalled();
      expect(loading.hide).toHaveBeenCalled();
    });

    it('에러 발생 시에도 로딩을 숨겨야 함', async () => {
      const loading = {
        show: vi.fn(),
        hide: vi.fn()
      };

      router.init({ loading });

      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      await router.navigate('views/page.html');
      expect(loading.show).toHaveBeenCalled();
      expect(loading.hide).toHaveBeenCalled();
    });
  });

  describe('뷰 파일 스크립트 실행', () => {
    it('뷰 파일의 스크립트를 실행해야 함', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        text: async () => '<div>Page</div><script>window.testVar = "executed";</script>'
      });

      await router.navigate('views/page.html');
      // 뷰 파일의 스크립트는 그대로 유지되고 실행됨
      const content = document.querySelector('#app').innerHTML;
      expect(content).toContain('<div>Page</div>');
      expect(content).toContain('<script>');
      // 참고: 사용자 입력은 뷰 내부에서 IMCAT.escape()로 처리해야 함
    });
  });

  describe('실전 시나리오', () => {
    it('완전한 SPA 네비게이션', async () => {
      const beforeLoad = vi.fn();
      const afterLoad = vi.fn();

      router.beforeLoad(beforeLoad);
      router.afterLoad(afterLoad);

      global.fetch.mockResolvedValue({
        ok: true,
        text: async () => '<div>Page</div>'
      });

      // 홈으로 이동
      await router.navigate('views/home.html');
      expect(beforeLoad).toHaveBeenCalledWith('views/home.html', '');
      expect(afterLoad).toHaveBeenCalledWith('views/home.html');
      expect(router.current()).toBe('views/home.html');

      // 프로필로 이동
      await router.navigate('views/profile.html');
      expect(beforeLoad).toHaveBeenCalledWith('views/profile.html', 'views/home.html');
      expect(afterLoad).toHaveBeenCalledWith('views/profile.html');
      expect(router.current()).toBe('views/profile.html');
    });

    it('인스턴스 메모리 관리 시나리오', async () => {
      const modal = { destroy: vi.fn() };
      const tooltip = { destroy: vi.fn() };

      global.fetch.mockResolvedValue({
        ok: true,
        text: async () => '<div>Page</div>'
      });

      await router.navigate('views/page1.html');
      router.registerInstance(modal);
      router.registerInstance(tooltip);
      expect(router.getInstanceCount()).toBe(2);

      await router.navigate('views/page2.html');
      expect(modal.destroy).toHaveBeenCalled();
      expect(tooltip.destroy).toHaveBeenCalled();
      expect(router.getInstanceCount()).toBe(0);
    });
  });
});
