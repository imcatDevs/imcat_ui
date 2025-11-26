/**
 * Tooltips & Popovers Module
 * 툴팁과 팝오버 컴포넌트
 * @module modules/tooltips
 */

// ============================================
// Tooltip - 간단한 텍스트 힌트
// ============================================

class Tooltip {
  static instances = new Map();
  
  static defaults() {
    return {
      placement: 'top',      // top, bottom, left, right
      trigger: 'hover',      // hover, focus, click, manual
      delay: { show: 0, hide: 100 },
      offset: 8,
      animation: true,
      html: false,
      container: document.body
    };
  }
  
  constructor(element, options = {}) {
    if (typeof element === 'string') {
      element = document.querySelector(element);
    }
    
    if (!element) {
      console.error('Tooltip: Element not found');
      return;
    }
    
    // 이미 인스턴스가 있으면 반환
    if (Tooltip.instances.has(element)) {
      return Tooltip.instances.get(element);
    }
    
    this.element = element;
    this.options = { ...Tooltip.defaults(), ...options };
    this.tooltip = null;
    this.isVisible = false;
    this.showTimeout = null;
    this.hideTimeout = null;
    
    // data 속성에서 옵션 읽기
    this._readDataAttributes();
    
    this.init();
    Tooltip.instances.set(element, this);
  }
  
  _readDataAttributes() {
    const content = this.element.getAttribute('data-tooltip') || 
                    this.element.getAttribute('title');
    if (content) {
      this.options.content = content;
      this.element.removeAttribute('title'); // 기본 툴팁 제거
    }
    
    const placement = this.element.getAttribute('data-placement');
    if (placement) this.options.placement = placement;
    
    const trigger = this.element.getAttribute('data-trigger');
    if (trigger) this.options.trigger = trigger;
  }
  
  init() {
    this._bindEvents();
  }
  
  _bindEvents() {
    const triggers = this.options.trigger.split(' ');
    
    triggers.forEach(trigger => {
      switch (trigger) {
        case 'hover':
          this._onMouseEnter = () => this.show();
          this._onMouseLeave = () => this.hide();
          this.element.addEventListener('mouseenter', this._onMouseEnter);
          this.element.addEventListener('mouseleave', this._onMouseLeave);
          break;
          
        case 'focus':
          this._onFocus = () => this.show();
          this._onBlur = () => this.hide();
          this.element.addEventListener('focus', this._onFocus);
          this.element.addEventListener('blur', this._onBlur);
          break;
          
        case 'click':
          this._onClick = (e) => {
            e.preventDefault();
            this.toggle();
          };
          this.element.addEventListener('click', this._onClick);
          break;
      }
    });
  }
  
  _createTooltip() {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.setAttribute('role', 'tooltip');
    
    const arrow = document.createElement('div');
    arrow.className = 'tooltip__arrow';
    
    const content = document.createElement('div');
    content.className = 'tooltip__content';
    
    if (this.options.html) {
      content.innerHTML = this.options.content;
    } else {
      content.textContent = this.options.content;
    }
    
    tooltip.appendChild(arrow);
    tooltip.appendChild(content);
    
    if (this.options.animation) {
      tooltip.classList.add('tooltip--animated');
    }
    
    return tooltip;
  }
  
  _positionTooltip() {
    if (!this.tooltip) return;
    
    const rect = this.element.getBoundingClientRect();
    const tooltipRect = this.tooltip.getBoundingClientRect();
    const { placement, offset } = this.options;
    
    let top, left;
    
    // 위치 계산
    switch (placement) {
      case 'top':
        top = rect.top - tooltipRect.height - offset;
        left = rect.left + (rect.width - tooltipRect.width) / 2;
        break;
      case 'bottom':
        top = rect.bottom + offset;
        left = rect.left + (rect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = rect.top + (rect.height - tooltipRect.height) / 2;
        left = rect.left - tooltipRect.width - offset;
        break;
      case 'right':
        top = rect.top + (rect.height - tooltipRect.height) / 2;
        left = rect.right + offset;
        break;
    }
    
    // 스크롤 오프셋 추가
    top += window.scrollY;
    left += window.scrollX;
    
    // 화면 밖으로 나가면 조정
    const actualPlacement = this._adjustPlacement(top, left, tooltipRect, placement);
    
    this.tooltip.style.top = `${top}px`;
    this.tooltip.style.left = `${left}px`;
    this.tooltip.setAttribute('data-placement', actualPlacement);
  }
  
  _adjustPlacement(top, left, tooltipRect, placement) {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // 간단한 경계 체크
    if (left < 0) left = this.options.offset;
    if (left + tooltipRect.width > viewportWidth) {
      left = viewportWidth - tooltipRect.width - this.options.offset;
    }
    if (top < window.scrollY) {
      // top이 화면 위로 나가면 bottom으로
      if (placement === 'top') {
        const rect = this.element.getBoundingClientRect();
        top = rect.bottom + this.options.offset + window.scrollY;
        return 'bottom';
      }
    }
    
    return placement;
  }
  
  show() {
    if (this.isVisible) return;
    
    clearTimeout(this.hideTimeout);
    
    this.showTimeout = setTimeout(() => {
      if (!this.tooltip) {
        this.tooltip = this._createTooltip();
        this.options.container.appendChild(this.tooltip);
      }
      
      this._positionTooltip();
      
      requestAnimationFrame(() => {
        this.tooltip.classList.add('is-visible');
        this.isVisible = true;
      });
    }, this.options.delay.show);
  }
  
  hide() {
    if (!this.isVisible) return;
    
    clearTimeout(this.showTimeout);
    
    this.hideTimeout = setTimeout(() => {
      if (this.tooltip) {
        this.tooltip.classList.remove('is-visible');
        
        setTimeout(() => {
          if (this.tooltip && this.tooltip.parentNode) {
            this.tooltip.parentNode.removeChild(this.tooltip);
            this.tooltip = null;
          }
          this.isVisible = false;
        }, 200);
      }
    }, this.options.delay.hide);
  }
  
  toggle() {
    this.isVisible ? this.hide() : this.show();
  }
  
  setContent(content) {
    this.options.content = content;
    if (this.tooltip) {
      const contentEl = this.tooltip.querySelector('.tooltip__content');
      if (this.options.html) {
        contentEl.innerHTML = content;
      } else {
        contentEl.textContent = content;
      }
      this._positionTooltip();
    }
  }
  
  destroy() {
    clearTimeout(this.showTimeout);
    clearTimeout(this.hideTimeout);
    
    // 이벤트 리스너 제거
    if (this._onMouseEnter) {
      this.element.removeEventListener('mouseenter', this._onMouseEnter);
      this.element.removeEventListener('mouseleave', this._onMouseLeave);
    }
    if (this._onFocus) {
      this.element.removeEventListener('focus', this._onFocus);
      this.element.removeEventListener('blur', this._onBlur);
    }
    if (this._onClick) {
      this.element.removeEventListener('click', this._onClick);
    }
    
    // 툴팁 제거
    if (this.tooltip && this.tooltip.parentNode) {
      this.tooltip.parentNode.removeChild(this.tooltip);
    }
    
    Tooltip.instances.delete(this.element);
  }
  
  // 정적 메서드: 자동 초기화
  static initAll(selector = '[data-tooltip], [title]') {
    document.querySelectorAll(selector).forEach(el => {
      if (!Tooltip.instances.has(el)) {
        new Tooltip(el);
      }
    });
  }
}

// ============================================
// Popover - 풍부한 콘텐츠 팝업
// ============================================

class Popover {
  static instances = new Map();
  static activePopover = null;
  
  static defaults() {
    return {
      placement: 'top',
      trigger: 'click',        // click, hover, focus, manual
      title: '',
      content: '',
      html: true,
      offset: 10,
      animation: true,
      dismissible: true,       // 외부 클릭으로 닫기
      container: document.body
    };
  }
  
  constructor(element, options = {}) {
    if (typeof element === 'string') {
      element = document.querySelector(element);
    }
    
    if (!element) {
      console.error('Popover: Element not found');
      return;
    }
    
    if (Popover.instances.has(element)) {
      return Popover.instances.get(element);
    }
    
    this.element = element;
    this.options = { ...Popover.defaults(), ...options };
    this.popover = null;
    this.isVisible = false;
    
    this._readDataAttributes();
    this.init();
    Popover.instances.set(element, this);
  }
  
  _readDataAttributes() {
    const title = this.element.getAttribute('data-popover-title');
    if (title) this.options.title = title;
    
    const content = this.element.getAttribute('data-popover-content') ||
                    this.element.getAttribute('data-content');
    if (content) this.options.content = content;
    
    const placement = this.element.getAttribute('data-placement');
    if (placement) this.options.placement = placement;
    
    const trigger = this.element.getAttribute('data-trigger');
    if (trigger) this.options.trigger = trigger;
  }
  
  init() {
    this._bindEvents();
  }
  
  _bindEvents() {
    const triggers = this.options.trigger.split(' ');
    
    triggers.forEach(trigger => {
      switch (trigger) {
        case 'click':
          this._onClick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggle();
          };
          this.element.addEventListener('click', this._onClick);
          break;
          
        case 'hover':
          this._hoverTimeout = null;
          this._isHoveringPopover = false;
          this._onMouseEnter = () => {
            clearTimeout(this._hoverTimeout);
            this.show();
          };
          this._onMouseLeave = () => {
            this._hoverTimeout = setTimeout(() => {
              if (!this._isHoveringPopover) {
                this.hide();
              }
            }, 150);
          };
          this.element.addEventListener('mouseenter', this._onMouseEnter);
          this.element.addEventListener('mouseleave', this._onMouseLeave);
          break;
          
        case 'focus':
          this._onFocus = () => this.show();
          this._onBlur = () => this.hide();
          this.element.addEventListener('focus', this._onFocus);
          this.element.addEventListener('blur', this._onBlur);
          break;
      }
    });
    
    // 외부 클릭으로 닫기
    if (this.options.dismissible && this.options.trigger === 'click') {
      this._onDocumentClick = (e) => {
        if (this.isVisible && 
            !this.element.contains(e.target) && 
            !this.popover?.contains(e.target)) {
          this.hide();
        }
      };
      document.addEventListener('click', this._onDocumentClick);
    }
  }
  
  _createPopover() {
    const popover = document.createElement('div');
    popover.className = 'popover';
    popover.setAttribute('role', 'dialog');
    
    const arrow = document.createElement('div');
    arrow.className = 'popover__arrow';
    
    let html = '';
    
    if (this.options.title) {
      html += `<div class="popover__header">
        <h4 class="popover__title">${this.options.title}</h4>
        ${this.options.dismissible ? '<button class="popover__close" aria-label="닫기">&times;</button>' : ''}
      </div>`;
    }
    
    html += `<div class="popover__body">${this.options.content}</div>`;
    
    popover.innerHTML = html;
    popover.insertBefore(arrow, popover.firstChild);
    
    if (this.options.animation) {
      popover.classList.add('popover--animated');
    }
    
    // 닫기 버튼 이벤트
    const closeBtn = popover.querySelector('.popover__close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hide());
    }
    
    return popover;
  }
  
  _positionPopover() {
    if (!this.popover) return;
    
    const rect = this.element.getBoundingClientRect();
    const popoverRect = this.popover.getBoundingClientRect();
    const { placement, offset } = this.options;
    
    let top, left;
    
    switch (placement) {
      case 'top':
        top = rect.top - popoverRect.height - offset;
        left = rect.left + (rect.width - popoverRect.width) / 2;
        break;
      case 'bottom':
        top = rect.bottom + offset;
        left = rect.left + (rect.width - popoverRect.width) / 2;
        break;
      case 'left':
        top = rect.top + (rect.height - popoverRect.height) / 2;
        left = rect.left - popoverRect.width - offset;
        break;
      case 'right':
        top = rect.top + (rect.height - popoverRect.height) / 2;
        left = rect.right + offset;
        break;
    }
    
    top += window.scrollY;
    left += window.scrollX;
    
    // 화면 경계 조정
    if (left < 10) left = 10;
    if (left + popoverRect.width > window.innerWidth - 10) {
      left = window.innerWidth - popoverRect.width - 10;
    }
    
    this.popover.style.top = `${top}px`;
    this.popover.style.left = `${left}px`;
    this.popover.setAttribute('data-placement', placement);
  }
  
  show() {
    // 다른 팝오버 닫기
    if (Popover.activePopover && Popover.activePopover !== this) {
      Popover.activePopover.hide();
    }
    
    if (this.isVisible) return;
    
    if (!this.popover) {
      this.popover = this._createPopover();
      this.options.container.appendChild(this.popover);
      
      // hover 트리거일 때 popover에도 이벤트 바인딩
      if (this.options.trigger === 'hover') {
        this.popover.addEventListener('mouseenter', () => {
          clearTimeout(this._hoverTimeout);
          this._isHoveringPopover = true;
        });
        this.popover.addEventListener('mouseleave', () => {
          this._isHoveringPopover = false;
          this._hoverTimeout = setTimeout(() => this.hide(), 150);
        });
      }
    }
    
    this._positionPopover();
    
    requestAnimationFrame(() => {
      this.popover.classList.add('is-visible');
      this.isVisible = true;
      Popover.activePopover = this;
      
      this.element.setAttribute('aria-expanded', 'true');
    });
  }
  
  hide() {
    if (!this.isVisible) return;
    
    if (this.popover) {
      this.popover.classList.remove('is-visible');
      
      setTimeout(() => {
        if (this.popover && this.popover.parentNode) {
          this.popover.parentNode.removeChild(this.popover);
          this.popover = null;
        }
        this.isVisible = false;
        
        if (Popover.activePopover === this) {
          Popover.activePopover = null;
        }
      }, 200);
    }
    
    this.element.setAttribute('aria-expanded', 'false');
  }
  
  toggle() {
    this.isVisible ? this.hide() : this.show();
  }
  
  setContent(content) {
    this.options.content = content;
    if (this.popover) {
      const body = this.popover.querySelector('.popover__body');
      body.innerHTML = content;
      this._positionPopover();
    }
  }
  
  setTitle(title) {
    this.options.title = title;
    if (this.popover) {
      const titleEl = this.popover.querySelector('.popover__title');
      if (titleEl) titleEl.textContent = title;
    }
  }
  
  destroy() {
    if (this._onClick) {
      this.element.removeEventListener('click', this._onClick);
    }
    if (this._onMouseEnter) {
      this.element.removeEventListener('mouseenter', this._onMouseEnter);
      this.element.removeEventListener('mouseleave', this._onMouseLeave);
    }
    if (this._onFocus) {
      this.element.removeEventListener('focus', this._onFocus);
      this.element.removeEventListener('blur', this._onBlur);
    }
    if (this._onDocumentClick) {
      document.removeEventListener('click', this._onDocumentClick);
    }
    
    if (this.popover && this.popover.parentNode) {
      this.popover.parentNode.removeChild(this.popover);
    }
    
    Popover.instances.delete(this.element);
  }
  
  static initAll(selector = '[data-popover-content], [data-content]') {
    document.querySelectorAll(selector).forEach(el => {
      if (!Popover.instances.has(el)) {
        new Popover(el);
      }
    });
  }
}

// ============================================
// Tooltips 통합 모듈
// ============================================

const Tooltips = {
  Tooltip,
  Popover,
  
  // 편의 메서드
  create(type, element, options) {
    switch (type) {
      case 'tooltip':
        return new Tooltip(element, options);
      case 'popover':
        return new Popover(element, options);
      default:
        throw new Error(`Unknown type: ${type}`);
    }
  },
  
  // 모든 인스턴스 초기화
  initAll() {
    Tooltip.initAll();
    Popover.initAll();
  },
  
  // 모든 인스턴스 정리
  destroyAll() {
    Tooltip.instances.forEach(instance => instance.destroy());
    Popover.instances.forEach(instance => instance.destroy());
  }
};

export default Tooltips;
export { Tooltip, Popover };
