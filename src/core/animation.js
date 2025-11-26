/**
 * Animation Utilities - 다양한 애니메이션 효과
 * @module core/animation
 */

/**
 * 애니메이션 유틸리티
 * @class
 * @description Web Animations API 기반의 다양한 애니메이션 효과를 제공합니다.
 * GPU 가속을 활용하여 부드러운 60fps 애니메이션을 구현합니다.
 * 
 * @example
 * // Fade In 애니메이션
 * await AnimationUtil.animate('#box').fadeIn(300);
 * 
 * @example
 * // Bounce In 애니메이션
 * await AnimationUtil.animate('.card').bounceIn(600);
 */
export class AnimationUtil {
  /**
   * 애니메이션 생성
   * @param {string|HTMLElement} element - 대상 요소
   * @returns {Animator} 애니메이터 인스턴스
   * 
   * @example
   * await AnimationUtil.animate('#box').fadeIn(300);
   * await AnimationUtil.animate('#box').slideDown(400);
   */
  static animate(element) {
    return new Animator(element);
  }

  /**
   * 이징 함수들
   */
  static easings = {
    linear: t => t,
    easeIn: t => t * t,
    easeOut: t => t * (2 - t),
    easeInOut: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    easeInCubic: t => t * t * t,
    easeOutCubic: t => (--t) * t * t + 1,
    easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
    easeInQuart: t => t * t * t * t,
    easeOutQuart: t => 1 - (--t) * t * t * t,
    easeInOutQuart: t => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t,
    easeInQuint: t => t * t * t * t * t,
    easeOutQuint: t => 1 + (--t) * t * t * t * t,
    easeInOutQuint: t => t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t,
    easeInElastic: t => {
      return t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * ((2 * Math.PI) / 3));
    },
    easeOutElastic: t => {
      return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1;
    },
    easeInBounce: t => 1 - AnimationUtil.easings.easeOutBounce(1 - t),
    easeOutBounce: t => {
      const n1 = 7.5625;
      const d1 = 2.75;
      if (t < 1 / d1) {
        return n1 * t * t;
      } else if (t < 2 / d1) {
        return n1 * (t -= 1.5 / d1) * t + 0.75;
      } else if (t < 2.5 / d1) {
        return n1 * (t -= 2.25 / d1) * t + 0.9375;
      } else {
        return n1 * (t -= 2.625 / d1) * t + 0.984375;
      }
    }
  };
}

/**
 * 애니메이터 클래스
 * @class
 * @description 개별 요소에 대한 애니메이션을 실행하는 클래스입니다.
 * 20가지 이상의 다양한 애니메이션 효과를 제공합니다.
 */
class Animator {
  /**
   * Animator 생성자
   * @constructor
   * @param {string|HTMLElement} element - 애니메이션을 적용할 대상 요소 (CSS 선택자 또는 DOM 요소)
   * 
   * @example
   * const animator = new Animator('#myElement');
   * 
   * @example
   * const animator = new Animator(document.getElementById('myElement'));
   */
  constructor(element) {
    this.element = typeof element === 'string' ? document.querySelector(element) : element;
  }

  /**
   * 커스텀 애니메이션
   * @param {Object} from - 시작 스타일
   * @param {Object} to - 종료 스타일
   * @param {number} duration - 지속 시간 (ms)
   * @param {string|Function} easing - 이징 함수
   * @returns {Promise}
   */
  custom(from, to, duration = 300, easing = 'easeInOut') {
    return new Promise((resolve) => {
      if (!this.element) {
        resolve();
        return;
      }

      const easingFn = typeof easing === 'function' ? easing : AnimationUtil.easings[easing] || AnimationUtil.easings.linear;
      
      // 시작 스타일 적용 (다음 프레임에서)
      requestAnimationFrame(() => {
        Object.keys(from).forEach(key => {
          this.element.style[key] = from[key];
        });
        
        // 리플로우 강제 (브라우저가 from 스타일을 확실히 적용하도록)
        void this.element.offsetHeight;
        
        // 애니메이션 시작
        const startTime = performance.now();
        
        const animate = (currentTime) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const easedProgress = easingFn(progress);

          // 스타일 보간
          Object.keys(to).forEach(key => {
            const fromValue = this._parseValue(from[key]);
            const toValue = this._parseValue(to[key]);
            
            if (fromValue.unit && toValue.unit) {
              const currentValue = fromValue.value + (toValue.value - fromValue.value) * easedProgress;
              this.element.style[key] = `${currentValue}${toValue.unit}`;
            } else {
              this.element.style[key] = to[key];
            }
          });

          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            resolve();
          }
        };

        requestAnimationFrame(animate);
      });
    });
  }

  /**
   * 값 파싱 (숫자 + 단위)
   * @private
   */
  _parseValue(value) {
    if (typeof value !== 'string') return { value, unit: '' };
    
    const match = value.match(/^([-+]?[\d.]+)([a-z%]*)$/i);
    if (match) {
      return {
        value: parseFloat(match[1]),
        unit: match[2] || ''
      };
    }
    return { value: 0, unit: '' };
  }

  /**
   * Fade In
   */
  fadeIn(duration = 300, easing = 'ease-out') {
    if (!this.element) return Promise.resolve();
    
    this.element.style.display = 'block';
    
    const keyframes = [
      { opacity: '0' },
      { opacity: '1' }
    ];
    
    const animation = this.element.animate(keyframes, {
      duration,
      easing,
      fill: 'forwards'
    });
    
    return animation.finished.then(() => {
      this.element.style.opacity = '1';
    });
  }

  /**
   * Fade Out
   */
  fadeOut(duration = 300, easing = 'easeIn') {
    return this.custom(
      { opacity: '1' },
      { opacity: '0' },
      duration,
      easing
    ).then(() => {
      if (this.element) this.element.style.display = 'none';
    });
  }

  /**
   * Slide Down
   */
  slideDown(duration = 400, easing = 'easeOutCubic') {
    if (!this.element) return Promise.resolve();
    
    const element = this.element;
    const originalDisplay = element.style.display;
    element.style.display = 'block';
    const height = element.scrollHeight;
    element.style.height = '0';
    element.style.overflow = 'hidden';
    
    return this.custom(
      { height: '0px' },
      { height: `${height}px` },
      duration,
      easing
    ).then(() => {
      element.style.height = '';
      element.style.overflow = '';
    });
  }

  /**
   * Slide Up
   */
  slideUp(duration = 400, easing = 'easeInCubic') {
    if (!this.element) return Promise.resolve();
    
    const element = this.element;
    const height = element.scrollHeight;
    element.style.height = `${height}px`;
    element.style.overflow = 'hidden';
    
    return this.custom(
      { height: `${height}px` },
      { height: '0px' },
      duration,
      easing
    ).then(() => {
      element.style.display = 'none';
      element.style.height = '';
      element.style.overflow = '';
    });
  }

  /**
   * Slide Left
   */
  slideLeft(duration = 400, easing = 'easeInOut') {
    if (!this.element) return Promise.resolve();
    
    const width = this.element.offsetWidth;
    return this.custom(
      { transform: 'translateX(0)', opacity: '1' },
      { transform: `translateX(-${width}px)`, opacity: '0' },
      duration,
      easing
    ).then(() => {
      if (this.element) this.element.style.display = 'none';
    });
  }

  /**
   * Slide Right
   */
  slideRight(duration = 400, easing = 'easeInOut') {
    if (!this.element) return Promise.resolve();
    
    const width = this.element.offsetWidth;
    return this.custom(
      { transform: 'translateX(0)', opacity: '1' },
      { transform: `translateX(${width}px)`, opacity: '0' },
      duration,
      easing
    ).then(() => {
      if (this.element) this.element.style.display = 'none';
    });
  }

  /**
   * Scale In
   */
  scaleIn(duration = 300, easing = 'ease-out') {
    if (!this.element) return Promise.resolve();
    
    this.element.style.display = 'block';
    
    const keyframes = [
      { transform: 'scale(0)', opacity: '0' },
      { transform: 'scale(1)', opacity: '1' }
    ];
    
    const animation = this.element.animate(keyframes, {
      duration,
      easing,
      fill: 'forwards'
    });
    
    return animation.finished.then(() => {
      this.element.style.transform = 'scale(1)';
      this.element.style.opacity = '1';
    });
  }

  /**
   * Scale Out
   */
  scaleOut(duration = 300, easing = 'easeInCubic') {
    return this.custom(
      { transform: 'scale(1)', opacity: '1' },
      { transform: 'scale(0)', opacity: '0' },
      duration,
      easing
    ).then(() => {
      if (this.element) this.element.style.display = 'none';
    });
  }

  /**
   * Bounce In
   */
  bounceIn(duration = 600, easing = 'cubic-bezier(0.68, -0.55, 0.265, 1.55)') {
    if (!this.element) return Promise.resolve();
    
    this.element.style.display = 'block';
    
    const keyframes = [
      { transform: 'translateY(-100px)', opacity: '0' },
      { transform: 'translateY(0)', opacity: '1' }
    ];
    
    const animation = this.element.animate(keyframes, {
      duration,
      easing,
      fill: 'forwards'
    });
    
    return animation.finished.then(() => {
      this.element.style.transform = 'translateY(0)';
      this.element.style.opacity = '1';
    });
  }

  /**
   * Bounce Out
   */
  bounceOut(duration = 600, easing = 'easeInBounce') {
    return this.custom(
      { transform: 'translateY(0)', opacity: '1' },
      { transform: 'translateY(-100px)', opacity: '0' },
      duration,
      easing
    ).then(() => {
      if (this.element) this.element.style.display = 'none';
    });
  }

  /**
   * Rotate In
   */
  rotateIn(duration = 400, easing = 'easeOut') {
    return this.custom(
      { transform: 'rotate(-180deg) scale(0)', opacity: '0', display: 'block' },
      { transform: 'rotate(0deg) scale(1)', opacity: '1' },
      duration,
      easing
    );
  }

  /**
   * Rotate Out
   */
  rotateOut(duration = 400, easing = 'easeIn') {
    return this.custom(
      { transform: 'rotate(0deg) scale(1)', opacity: '1' },
      { transform: 'rotate(180deg) scale(0)', opacity: '0' },
      duration,
      easing
    ).then(() => {
      if (this.element) this.element.style.display = 'none';
    });
  }

  /**
   * Flip In
   */
  flipIn(duration = 600, easing = 'easeOut') {
    return this.custom(
      { transform: 'perspective(400px) rotateY(90deg)', opacity: '0', display: 'block' },
      { transform: 'perspective(400px) rotateY(0deg)', opacity: '1' },
      duration,
      easing
    );
  }

  /**
   * Flip Out
   */
  flipOut(duration = 600, easing = 'easeIn') {
    return this.custom(
      { transform: 'perspective(400px) rotateY(0deg)', opacity: '1' },
      { transform: 'perspective(400px) rotateY(90deg)', opacity: '0' },
      duration,
      easing
    ).then(() => {
      if (this.element) this.element.style.display = 'none';
    });
  }

  /**
   * Shake
   */
  shake(duration = 500) {
    if (!this.element) return Promise.resolve();
    
    const keyframes = [
      { transform: 'translateX(0)' },
      { transform: 'translateX(-10px)' },
      { transform: 'translateX(10px)' },
      { transform: 'translateX(-10px)' },
      { transform: 'translateX(10px)' },
      { transform: 'translateX(-10px)' },
      { transform: 'translateX(0)' }
    ];
    
    return this.element.animate(keyframes, {
      duration,
      easing: 'ease-in-out'
    }).finished;
  }

  /**
   * Pulse
   */
  pulse(duration = 500) {
    if (!this.element) return Promise.resolve();
    
    const keyframes = [
      { transform: 'scale(1)' },
      { transform: 'scale(1.05)' },
      { transform: 'scale(1)' },
      { transform: 'scale(1.05)' },
      { transform: 'scale(1)' }
    ];
    
    return this.element.animate(keyframes, {
      duration,
      easing: 'ease-in-out'
    }).finished;
  }

  /**
   * Flash
   */
  flash(duration = 500) {
    if (!this.element) return Promise.resolve();
    
    const keyframes = [
      { opacity: '1' },
      { opacity: '0' },
      { opacity: '1' },
      { opacity: '0' },
      { opacity: '1' }
    ];
    
    return this.element.animate(keyframes, {
      duration,
      easing: 'ease-in-out'
    }).finished;
  }

  /**
   * Swing
   */
  swing(duration = 800) {
    if (!this.element) return Promise.resolve();
    
    const keyframes = [
      { transform: 'rotate(0deg)' },
      { transform: 'rotate(15deg)' },
      { transform: 'rotate(-10deg)' },
      { transform: 'rotate(5deg)' },
      { transform: 'rotate(-5deg)' },
      { transform: 'rotate(0deg)' }
    ];
    
    return this.element.animate(keyframes, {
      duration,
      easing: 'ease-in-out'
    }).finished;
  }

  /**
   * Wobble
   */
  wobble(duration = 800) {
    if (!this.element) return Promise.resolve();
    
    const keyframes = [
      { transform: 'translateX(0%) rotate(0deg)' },
      { transform: 'translateX(-25%) rotate(-5deg)' },
      { transform: 'translateX(20%) rotate(3deg)' },
      { transform: 'translateX(-15%) rotate(-3deg)' },
      { transform: 'translateX(10%) rotate(2deg)' },
      { transform: 'translateX(-5%) rotate(-1deg)' },
      { transform: 'translateX(0%) rotate(0deg)' }
    ];
    
    return this.element.animate(keyframes, {
      duration,
      easing: 'ease-in-out'
    }).finished;
  }

  /**
   * Tada
   */
  tada(duration = 800) {
    if (!this.element) return Promise.resolve();
    
    const keyframes = [
      { transform: 'scale(1) rotate(0deg)' },
      { transform: 'scale(0.9) rotate(-3deg)' },
      { transform: 'scale(0.9) rotate(-3deg)' },
      { transform: 'scale(1.1) rotate(3deg)' },
      { transform: 'scale(1.1) rotate(-3deg)' },
      { transform: 'scale(1.1) rotate(3deg)' },
      { transform: 'scale(1.1) rotate(-3deg)' },
      { transform: 'scale(1.1) rotate(3deg)' },
      { transform: 'scale(1.1) rotate(-3deg)' },
      { transform: 'scale(1) rotate(0deg)' }
    ];
    
    return this.element.animate(keyframes, {
      duration,
      easing: 'ease-in-out'
    }).finished;
  }

  /**
   * Heart Beat
   */
  heartBeat(duration = 1000) {
    if (!this.element) return Promise.resolve();
    
    const keyframes = [
      { transform: 'scale(1)' },
      { transform: 'scale(1.3)' },
      { transform: 'scale(1)' },
      { transform: 'scale(1.3)' },
      { transform: 'scale(1)' }
    ];
    
    return this.element.animate(keyframes, {
      duration,
      easing: 'ease-in-out'
    }).finished;
  }
}

export default AnimationUtil;
