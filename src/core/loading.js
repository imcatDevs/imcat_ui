/**
 * 로딩 인디케이터
 * @module core/loading
 */

/**
 * 로딩 인디케이터 클래스
 * @class
 * @description 로딩 스피너를 표시하고 숨기는 기능을 제공합니다.
 * 다양한 스타일(spinner, progress)을 지원합니다.
 * 
 * @example
 * const loading = new LoadingIndicator();
 * loading.show('로딩 중...');
 */
export class LoadingIndicator {
  /**
   * LoadingIndicator 생성자
   * @constructor
   */
  constructor() {
    this.element = null;
    this.config = {
      style: 'spinner', // 'spinner', 'bar', 'dots'
      color: '#007bff',
      position: 'center', // 'center', 'top'
      delay: 200 // ms
    };
    this.showTimer = null;
    this.hideTimer = null;
    this.isShowing = false;
  }

  /**
   * 로딩 표시
   * @param {string} [message=''] - 로딩 메시지
   * 
   * @example
   * loading.show('데이터 로딩 중...');
   */
  show(message = '') {
    // 이미 표시 중이면 무시
    if (this.isShowing) return;

    // 기존 타이머 취소
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }

    // delay 후에 표시 (빠른 로딩은 표시 안함)
    this.showTimer = setTimeout(() => {
      this._createElement(message);
      this._show();
      this.isShowing = true;
    }, this.config.delay);
  }

  /**
   * 로딩 숨김
   * 
   * @example
   * loading.hide();
   */
  hide() {
    // 타이머 취소
    if (this.showTimer) {
      clearTimeout(this.showTimer);
      this.showTimer = null;
    }

    if (!this.isShowing) return;

    // 부드러운 페이드아웃
    this.hideTimer = setTimeout(() => {
      this._hide();
      this.isShowing = false;
    }, 100);
  }

  /**
   * 진행률 설정 (프로그레스 바)
   * @param {number} percent - 진행률 (0-100)
   * 
   * @example
   * loading.progress(50); // 50%
   */
  progress(percent) {
    if (!this.element) return;

    const bar = this.element.querySelector('.imcat-loading-bar-fill');
    if (bar) {
      bar.style.width = `${Math.max(0, Math.min(100, percent))}%`;
    }
  }

  /**
   * 설정 변경
   * @param {Object} options - 설정 옵션
   * @param {string} [options.style] - 스타일 ('spinner', 'bar', 'dots')
   * @param {string} [options.color] - 색상
   * @param {string} [options.position] - 위치 ('center', 'top')
   * @param {number} [options.delay] - 지연 시간 (ms)
   * 
   * @example
   * loading.setConfig({
   *   style: 'bar',
   *   color: '#ff0000',
   *   position: 'top',
   *   delay: 300
   * });
   */
  setConfig(options) {
    Object.assign(this.config, options);
  }

  /**
   * 엘리먼트 생성
   * @private
   * @param {string} message - 메시지
   */
  _createElement(message) {
    if (this.element) return;

    this.element = document.createElement('div');
    this.element.className = `imcat-loading imcat-loading-${this.config.position}`;

    let innerHTML = '';

    if (this.config.style === 'spinner') {
      innerHTML = `
        <div class="imcat-loading-spinner">
          <div class="imcat-spinner"></div>
          ${message ? `<div class="imcat-loading-message">${message}</div>` : ''}
        </div>
      `;
    } else if (this.config.style === 'bar') {
      innerHTML = `
        <div class="imcat-loading-bar">
          <div class="imcat-loading-bar-fill"></div>
        </div>
      `;
    } else if (this.config.style === 'dots') {
      innerHTML = `
        <div class="imcat-loading-dots">
          <span></span><span></span><span></span>
          ${message ? `<div class="imcat-loading-message">${message}</div>` : ''}
        </div>
      `;
    }

    this.element.innerHTML = innerHTML;

    // CSS 변수 적용
    this.element.style.setProperty('--imcat-loading-color', this.config.color);

    // 기본 스타일 추가
    this._addDefaultStyles();
  }

  /**
   * 기본 스타일 추가
   * @private
   */
  _addDefaultStyles() {
    if (document.getElementById('imcat-loading-styles')) return;

    const style = document.createElement('style');
    style.id = 'imcat-loading-styles';
    style.textContent = `
      .imcat-loading {
        position: fixed;
        z-index: 9999;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      
      .imcat-loading-center {
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
      }
      
      .imcat-loading-top {
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: transparent;
      }
      
      .imcat-loading-show {
        opacity: 1;
      }
      
      .imcat-loading-spinner {
        text-align: center;
      }
      
      .imcat-spinner {
        width: 50px;
        height: 50px;
        border: 4px solid rgba(255, 255, 255, 0.3);
        border-top-color: var(--imcat-loading-color, #007bff);
        border-radius: 50%;
        animation: imcat-spin 1s linear infinite;
      }
      
      @keyframes imcat-spin {
        to { transform: rotate(360deg); }
      }
      
      .imcat-loading-bar {
        width: 100%;
        height: 4px;
        background: rgba(255, 255, 255, 0.2);
      }
      
      .imcat-loading-bar-fill {
        height: 100%;
        background: var(--imcat-loading-color, #007bff);
        transition: width 0.3s ease;
        width: 0%;
      }
      
      .imcat-loading-dots {
        display: flex;
        gap: 10px;
        align-items: center;
        flex-direction: column;
      }
      
      .imcat-loading-dots > span {
        width: 12px;
        height: 12px;
        background: var(--imcat-loading-color, #007bff);
        border-radius: 50%;
        display: inline-block;
        animation: imcat-bounce 1.4s infinite ease-in-out both;
      }
      
      .imcat-loading-dots > span:nth-child(1) {
        animation-delay: -0.32s;
      }
      
      .imcat-loading-dots > span:nth-child(2) {
        animation-delay: -0.16s;
      }
      
      @keyframes imcat-bounce {
        0%, 80%, 100% {
          transform: scale(0);
        }
        40% {
          transform: scale(1);
        }
      }
      
      .imcat-loading-message {
        margin-top: 15px;
        color: white;
        font-size: 14px;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * 표시
   * @private
   */
  _show() {
    if (!this.element) return;

    document.body.appendChild(this.element);

    // 애니메이션을 위한 reflow
    this.element.offsetHeight;

    this.element.classList.add('imcat-loading-show');
  }

  /**
   * 숨김
   * @private
   */
  _hide() {
    if (!this.element) return;

    this.element.classList.remove('imcat-loading-show');

    setTimeout(() => {
      this.element?.remove();
      this.element = null;
    }, 300);
  }

  /**
   * 현재 표시 상태
   * @returns {boolean}
   */
  isVisible() {
    return this.isShowing;
  }

  /**
   * 강제로 즉시 숨김 (타이머 무시)
   */
  forceHide() {
    if (this.showTimer) {
      clearTimeout(this.showTimer);
      this.showTimer = null;
    }
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
    this.isShowing = false;
  }

  /**
   * 로딩 인디케이터 정리 (메모리 누수 방지)
   * 모든 타이머와 DOM 요소를 정리합니다.
   * 
   * @example
   * // 애플리케이션 종료 시
   * LoadingIndicator.destroy();
   */
  destroy() {
    // 모든 타이머 정리
    if (this.showTimer) {
      clearTimeout(this.showTimer);
      this.showTimer = null;
    }
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
    
    // DOM 요소 제거
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
    
    // 상태 초기화
    this.isShowing = false;
  }
}

// 싱글톤 인스턴스
export default new LoadingIndicator();
