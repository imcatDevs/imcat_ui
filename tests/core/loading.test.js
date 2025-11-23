/**
 * Loading Indicator 테스트
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { LoadingIndicator } from '../../src/core/loading.js';

describe('Loading Indicator Module', () => {
  let loading;

  beforeEach(() => {
    loading = new LoadingIndicator();
    vi.useFakeTimers();
  });

  afterEach(() => {
    loading.forceHide();
    vi.restoreAllMocks();
  });

  describe('show()', () => {
    it('지연 후 로딩을 표시해야 함', () => {
      loading.show('Loading...');
      expect(loading.isVisible()).toBe(false);

      vi.advanceTimersByTime(200);
      expect(loading.isVisible()).toBe(true);
    });

    it('메시지를 표시해야 함', () => {
      loading.show('테스트 로딩 중...');
      vi.advanceTimersByTime(200);

      const message = document.querySelector('.imcat-loading-message');
      expect(message?.textContent).toBe('테스트 로딩 중...');
    });

    it('메시지 없이 표시할 수 있어야 함', () => {
      loading.show();
      vi.advanceTimersByTime(200);

      const message = document.querySelector('.imcat-loading-message');
      expect(message).toBeNull();
    });

    it('이미 표시 중이면 무시해야 함', () => {
      loading.show('First');
      vi.advanceTimersByTime(200);

      loading.show('Second');
      const messages = document.querySelectorAll('.imcat-loading-message');
      expect(messages.length).toBe(1);
      expect(messages[0].textContent).toBe('First');
    });

    it('빠른 로딩은 표시하지 않아야 함', () => {
      loading.show('Fast loading');
      vi.advanceTimersByTime(100); // delay보다 짧음
      loading.hide();
      vi.advanceTimersByTime(200);

      expect(loading.isVisible()).toBe(false);
    });
  });

  describe('hide()', () => {
    it('로딩을 숨겨야 함', () => {
      loading.show();
      vi.advanceTimersByTime(200);
      expect(loading.isVisible()).toBe(true);

      loading.hide();
      vi.advanceTimersByTime(100);
      expect(loading.isVisible()).toBe(false);
    });

    it('표시되지 않은 상태에서 hide를 호출해도 에러가 발생하지 않아야 함', () => {
      expect(() => {
        loading.hide();
      }).not.toThrow();
    });

    it('show 타이머를 취소해야 함', () => {
      loading.show();
      loading.hide();
      vi.advanceTimersByTime(200);

      expect(loading.isVisible()).toBe(false);
    });
  });

  describe('progress()', () => {
    it('진행률을 설정해야 함', () => {
      loading.setConfig({ style: 'bar' });
      loading.show();
      vi.advanceTimersByTime(200);

      loading.progress(50);
      const bar = document.querySelector('.imcat-loading-bar-fill');
      expect(bar?.style.width).toBe('50%');
    });

    it('진행률을 0-100 범위로 제한해야 함', () => {
      loading.setConfig({ style: 'bar' });
      loading.show();
      vi.advanceTimersByTime(200);

      loading.progress(150);
      const bar = document.querySelector('.imcat-loading-bar-fill');
      expect(bar?.style.width).toBe('100%');

      loading.progress(-10);
      expect(bar?.style.width).toBe('0%');
    });

    it('엘리먼트가 없으면 에러가 발생하지 않아야 함', () => {
      expect(() => {
        loading.progress(50);
      }).not.toThrow();
    });
  });

  describe('setConfig()', () => {
    it('설정을 변경해야 함', () => {
      loading.setConfig({
        style: 'dots',
        color: '#ff0000',
        position: 'top',
        delay: 300
      });

      expect(loading.config.style).toBe('dots');
      expect(loading.config.color).toBe('#ff0000');
      expect(loading.config.position).toBe('top');
      expect(loading.config.delay).toBe(300);
    });

    it('일부 설정만 변경할 수 있어야 함', () => {
      const originalDelay = loading.config.delay;
      loading.setConfig({ color: '#00ff00' });

      expect(loading.config.color).toBe('#00ff00');
      expect(loading.config.delay).toBe(originalDelay);
    });
  });

  describe('스타일', () => {
    it('spinner 스타일을 표시해야 함', () => {
      loading.setConfig({ style: 'spinner' });
      loading.show();
      vi.advanceTimersByTime(200);

      const spinner = document.querySelector('.imcat-spinner');
      expect(spinner).not.toBeNull();
    });

    it('bar 스타일을 표시해야 함', () => {
      loading.setConfig({ style: 'bar' });
      loading.show();
      vi.advanceTimersByTime(200);

      const bar = document.querySelector('.imcat-loading-bar');
      expect(bar).not.toBeNull();
    });

    it('dots 스타일을 표시해야 함', () => {
      loading.setConfig({ style: 'dots' });
      loading.show();
      vi.advanceTimersByTime(200);

      const dots = document.querySelector('.imcat-loading-dots');
      expect(dots).not.toBeNull();
    });
  });

  describe('위치', () => {
    it('center 위치로 표시해야 함', () => {
      loading.setConfig({ position: 'center' });
      loading.show();
      vi.advanceTimersByTime(200);

      const element = document.querySelector('.imcat-loading-center');
      expect(element).not.toBeNull();
    });

    it('top 위치로 표시해야 함', () => {
      loading.setConfig({ position: 'top' });
      loading.show();
      vi.advanceTimersByTime(200);

      const element = document.querySelector('.imcat-loading-top');
      expect(element).not.toBeNull();
    });
  });

  describe('isVisible()', () => {
    it('표시 상태를 반환해야 함', () => {
      expect(loading.isVisible()).toBe(false);

      loading.show();
      vi.advanceTimersByTime(200);
      expect(loading.isVisible()).toBe(true);

      loading.hide();
      vi.advanceTimersByTime(100);
      expect(loading.isVisible()).toBe(false);
    });
  });

  describe('forceHide()', () => {
    it('즉시 로딩을 숨겨야 함', () => {
      loading.show();
      vi.advanceTimersByTime(200);
      expect(loading.isVisible()).toBe(true);

      loading.forceHide();
      expect(loading.isVisible()).toBe(false);
      expect(document.querySelector('.imcat-loading')).toBeNull();
    });

    it('대기 중인 타이머를 취소해야 함', () => {
      loading.show();
      loading.forceHide();
      vi.advanceTimersByTime(200);

      expect(loading.isVisible()).toBe(false);
    });
  });

  describe('CSS 스타일', () => {
    it('기본 스타일을 추가해야 함', () => {
      loading.show();
      vi.advanceTimersByTime(200);

      const styleElement = document.getElementById('imcat-loading-styles');
      expect(styleElement).not.toBeNull();
    });

    it('스타일을 중복으로 추가하지 않아야 함', () => {
      loading.show();
      vi.advanceTimersByTime(200);
      loading.hide();
      vi.advanceTimersByTime(100);

      loading.show();
      vi.advanceTimersByTime(200);

      const styleElements = document.querySelectorAll('#imcat-loading-styles');
      expect(styleElements.length).toBe(1);
    });
  });

  describe('실전 시나리오', () => {
    it('데이터 로딩 시나리오', async () => {
      loading.show('데이터 로딩 중...');
      vi.advanceTimersByTime(200);
      expect(loading.isVisible()).toBe(true);

      // 데이터 로딩 완료
      loading.hide();
      vi.advanceTimersByTime(100);
      expect(loading.isVisible()).toBe(false);
    });

    it('파일 업로드 진행률 시나리오', () => {
      loading.setConfig({ style: 'bar' });
      loading.show();
      vi.advanceTimersByTime(200);

      loading.progress(0);
      loading.progress(25);
      loading.progress(50);
      loading.progress(75);
      loading.progress(100);

      const bar = document.querySelector('.imcat-loading-bar-fill');
      expect(bar?.style.width).toBe('100%');

      loading.hide();
      vi.advanceTimersByTime(100);
    });

    it('페이지 전환 시나리오', () => {
      // 페이지 로딩 시작
      loading.show('페이지 로딩 중...');
      vi.advanceTimersByTime(200);
      expect(loading.isVisible()).toBe(true);

      // 빠르게 로딩 완료
      loading.hide();
      vi.advanceTimersByTime(100);
      expect(loading.isVisible()).toBe(false);
    });
  });
});
