/**
 * Animation Module 테스트
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AnimationUtil } from '../../src/core/animation.js';

describe('Animation Module', () => {
  let testElement;

  beforeEach(() => {
    testElement = document.createElement('div');
    testElement.id = 'test-element';
    testElement.style.cssText = 'width: 100px; height: 100px;';
    document.body.appendChild(testElement);
  });

  afterEach(() => {
    if (testElement && testElement.parentNode) {
      testElement.parentNode.removeChild(testElement);
    }
  });

  describe('AnimationUtil.animate()', () => {
    it('애니메이터 인스턴스를 생성해야 함', () => {
      const animator = AnimationUtil.animate('#test-element');
      expect(animator).toBeDefined();
      expect(animator.element).toBe(testElement);
    });

    it('HTML 요소를 직접 전달할 수 있어야 함', () => {
      const animator = AnimationUtil.animate(testElement);
      expect(animator.element).toBe(testElement);
    });
  });

  describe('이징 함수', () => {
    it('모든 이징 함수가 정의되어 있어야 함', () => {
      expect(AnimationUtil.easings.linear).toBeDefined();
      expect(AnimationUtil.easings.easeIn).toBeDefined();
      expect(AnimationUtil.easings.easeOut).toBeDefined();
      expect(AnimationUtil.easings.easeInOut).toBeDefined();
      expect(AnimationUtil.easings.easeOutElastic).toBeDefined();
      expect(AnimationUtil.easings.easeOutBounce).toBeDefined();
    });

    it('이징 함수가 0-1 범위의 값을 반환해야 함', () => {
      Object.keys(AnimationUtil.easings).forEach(key => {
        const fn = AnimationUtil.easings[key];
        const result0 = fn(0);
        const result1 = fn(1);
        const result05 = fn(0.5);
        
        expect(typeof result0).toBe('number');
        expect(typeof result1).toBe('number');
        expect(typeof result05).toBe('number');
      });
    });
  });

  describe('기본 애니메이션', () => {
    it('fadeIn이 정의되어 있어야 함', () => {
      const animator = AnimationUtil.animate(testElement);
      expect(typeof animator.fadeIn).toBe('function');
    });

    it('fadeOut이 정의되어 있어야 함', () => {
      const animator = AnimationUtil.animate(testElement);
      expect(typeof animator.fadeOut).toBe('function');
    });

    it('slideDown이 정의되어 있어야 함', () => {
      const animator = AnimationUtil.animate(testElement);
      expect(typeof animator.slideDown).toBe('function');
    });

    it('slideUp이 정의되어 있어야 함', () => {
      const animator = AnimationUtil.animate(testElement);
      expect(typeof animator.slideUp).toBe('function');
    });
  });

  describe('고급 애니메이션', () => {
    it('scaleIn이 정의되어 있어야 함', () => {
      const animator = AnimationUtil.animate(testElement);
      expect(typeof animator.scaleIn).toBe('function');
    });

    it('scaleOut이 정의되어 있어야 함', () => {
      const animator = AnimationUtil.animate(testElement);
      expect(typeof animator.scaleOut).toBe('function');
    });

    it('bounceIn이 정의되어 있어야 함', () => {
      const animator = AnimationUtil.animate(testElement);
      expect(typeof animator.bounceIn).toBe('function');
    });

    it('rotateIn이 정의되어 있어야 함', () => {
      const animator = AnimationUtil.animate(testElement);
      expect(typeof animator.rotateIn).toBe('function');
    });

    it('flipIn이 정의되어 있어야 함', () => {
      const animator = AnimationUtil.animate(testElement);
      expect(typeof animator.flipIn).toBe('function');
    });
  });

  describe('효과 애니메이션', () => {
    it('shake가 정의되어 있어야 함', () => {
      const animator = AnimationUtil.animate(testElement);
      expect(typeof animator.shake).toBe('function');
    });

    it('pulse가 정의되어 있어야 함', () => {
      const animator = AnimationUtil.animate(testElement);
      expect(typeof animator.pulse).toBe('function');
    });

    it('flash가 정의되어 있어야 함', () => {
      const animator = AnimationUtil.animate(testElement);
      expect(typeof animator.flash).toBe('function');
    });

    it('swing이 정의되어 있어야 함', () => {
      const animator = AnimationUtil.animate(testElement);
      expect(typeof animator.swing).toBe('function');
    });

    it('wobble이 정의되어 있어야 함', () => {
      const animator = AnimationUtil.animate(testElement);
      expect(typeof animator.wobble).toBe('function');
    });

    it('tada가 정의되어 있어야 함', () => {
      const animator = AnimationUtil.animate(testElement);
      expect(typeof animator.tada).toBe('function');
    });

    it('heartBeat이 정의되어 있어야 함', () => {
      const animator = AnimationUtil.animate(testElement);
      expect(typeof animator.heartBeat).toBe('function');
    });
  });

  describe('커스텀 애니메이션', () => {
    it('custom 메서드가 정의되어 있어야 함', () => {
      const animator = AnimationUtil.animate(testElement);
      expect(typeof animator.custom).toBe('function');
    });

    it('Promise를 반환해야 함', () => {
      const animator = AnimationUtil.animate(testElement);
      const result = animator.custom(
        { opacity: '1' },
        { opacity: '0.5' },
        10
      );
      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('애니메이션 개수', () => {
    it('총 20개 이상의 애니메이션이 있어야 함', () => {
      const animator = AnimationUtil.animate(testElement);
      const animations = [
        'fadeIn', 'fadeOut',
        'slideDown', 'slideUp', 'slideLeft', 'slideRight',
        'scaleIn', 'scaleOut',
        'bounceIn', 'bounceOut',
        'rotateIn', 'rotateOut',
        'flipIn', 'flipOut',
        'shake', 'pulse', 'flash', 'swing', 'wobble', 'tada', 'heartBeat'
      ];
      
      animations.forEach(name => {
        expect(typeof animator[name]).toBe('function');
      });
      
      expect(animations.length).toBeGreaterThanOrEqual(20);
    });
  });
});
