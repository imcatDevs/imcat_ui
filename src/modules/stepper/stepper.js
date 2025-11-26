/**
 * Stepper Module
 * 단계별 진행 표시 컴포넌트
 * @module modules/stepper
 */

// ============================================
// Stepper - 단계별 진행 표시
// ============================================

/**
 * Stepper 클래스
 * 단계별 진행을 시각적으로 표시
 */
class Stepper {
  /** @type {Map<HTMLElement, Stepper>} */
  static instances = new Map();

  /**
   * 기본 옵션
   * @returns {Object}
   */
  static defaults() {
    return {
      steps: [],              // [{title, subtitle, icon, content}]
      currentStep: 0,         // 현재 단계 (0부터 시작)
      orientation: 'horizontal', // 'horizontal' | 'vertical'
      clickable: true,        // 단계 클릭 가능 여부
      linear: false,          // 순차적으로만 진행 (이전 단계 완료 필수)
      showStepNumber: true,   // 단계 번호 표시
      animated: true,         // 애니메이션 사용
      connector: 'line',      // 'line' | 'arrow' | 'none'
      size: 'md',             // 'sm' | 'md' | 'lg'
      variant: 'default',     // 'default' | 'dots' | 'pills'
      onChange: null,         // (step, prevStep) => {}
      onComplete: null,       // () => {}
    };
  }

  /**
   * @param {string|HTMLElement} selector - 컨테이너 선택자
   * @param {Object} options - 옵션
   */
  constructor(selector, options = {}) {
    this.container = typeof selector === 'string' 
      ? document.querySelector(selector) 
      : selector;
    
    if (!this.container) {
      console.error('Stepper: Container not found');
      return;
    }

    this.options = { ...Stepper.defaults(), ...options };
    this._completedSteps = new Set();
    this._eventHandlers = [];
    this._timers = []; // setTimeout 추적
    
    this.init();
    Stepper.instances.set(this.container, this);
  }

  /**
   * 초기화
   */
  init() {
    this._render();
    this._bindEvents();
    this.goTo(this.options.currentStep);
  }

  /**
   * 렌더링
   * @private
   */
  _render() {
    const { steps, orientation, size, variant, connector } = this.options;
    
    this.container.className = `stepper stepper--${orientation} stepper--${size} stepper--${variant}`;
    if (connector !== 'none') {
      this.container.classList.add(`stepper--connector-${connector}`);
    }
    
    this.container.setAttribute('role', 'navigation');
    this.container.setAttribute('aria-label', 'Progress steps');
    
    // 단계 목록
    const stepsHtml = steps.map((step, index) => this._renderStep(step, index)).join('');
    
    this.container.innerHTML = `
      <div class="stepper__steps" role="tablist">
        ${stepsHtml}
      </div>
      ${this._hasContent() ? `<div class="stepper__content"></div>` : ''}
    `;
    
    this.stepsContainer = this.container.querySelector('.stepper__steps');
    this.contentContainer = this.container.querySelector('.stepper__content');
  }

  /**
   * 단계 렌더링
   * @private
   */
  _renderStep(step, index) {
    const { showStepNumber, clickable, connector, orientation, steps } = this.options;
    const isLast = index === steps.length - 1;
    
    const iconContent = step.icon 
      ? `<i class="material-icons-outlined">${step.icon}</i>`
      : (showStepNumber ? index + 1 : '');
    
    return `
      <div class="stepper__step" 
           data-step="${index}" 
           role="tab"
           aria-selected="false"
           aria-controls="step-panel-${index}"
           tabindex="${clickable ? 0 : -1}">
        <div class="stepper__indicator">
          <span class="stepper__number">${iconContent}</span>
          <span class="stepper__check">
            <i class="material-icons-outlined">check</i>
          </span>
        </div>
        ${!isLast && connector !== 'none' ? `<div class="stepper__connector"></div>` : ''}
        <div class="stepper__label">
          <span class="stepper__title">${step.title || `Step ${index + 1}`}</span>
          ${step.subtitle ? `<span class="stepper__subtitle">${step.subtitle}</span>` : ''}
        </div>
      </div>
    `;
  }

  /**
   * 콘텐츠 존재 여부 확인
   * @private
   */
  _hasContent() {
    return this.options.steps.some(step => step.content);
  }

  /**
   * 이벤트 바인딩
   * @private
   */
  _bindEvents() {
    if (!this.options.clickable) return;

    const handleClick = (e) => {
      const stepEl = e.target.closest('.stepper__step');
      if (!stepEl) return;
      
      const stepIndex = parseInt(stepEl.dataset.step, 10);
      this.goTo(stepIndex);
    };

    const handleKeydown = (e) => {
      const stepEl = e.target.closest('.stepper__step');
      if (!stepEl) return;

      const currentIndex = parseInt(stepEl.dataset.step, 10);
      let newIndex = currentIndex;

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          newIndex = Math.min(currentIndex + 1, this.options.steps.length - 1);
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          newIndex = Math.max(currentIndex - 1, 0);
          break;
        case 'Home':
          e.preventDefault();
          newIndex = 0;
          break;
        case 'End':
          e.preventDefault();
          newIndex = this.options.steps.length - 1;
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          this.goTo(currentIndex);
          return;
        default:
          return;
      }

      const targetStep = this.stepsContainer.querySelector(`[data-step="${newIndex}"]`);
      if (targetStep) {
        targetStep.focus();
      }
    };

    this.stepsContainer.addEventListener('click', handleClick);
    this.stepsContainer.addEventListener('keydown', handleKeydown);
    
    this._eventHandlers.push(
      { element: this.stepsContainer, type: 'click', handler: handleClick },
      { element: this.stepsContainer, type: 'keydown', handler: handleKeydown }
    );
  }

  /**
   * 특정 단계로 이동
   * @param {number} stepIndex - 단계 인덱스
   * @returns {boolean} 성공 여부
   */
  goTo(stepIndex) {
    const { steps, linear, onChange, onComplete, animated } = this.options;
    
    if (stepIndex < 0 || stepIndex >= steps.length) return false;
    
    // 순차 모드에서는 이전 단계가 완료되어야 함
    if (linear && stepIndex > 0) {
      for (let i = 0; i < stepIndex; i++) {
        if (!this._completedSteps.has(i)) {
          return false;
        }
      }
    }

    const prevStep = this.options.currentStep;
    this.options.currentStep = stepIndex;
    
    this._updateSteps();
    this._updateContent();
    
    if (onChange && prevStep !== stepIndex) {
      onChange(stepIndex, prevStep);
    }
    
    // 마지막 단계 완료 시
    if (stepIndex === steps.length - 1 && this._completedSteps.has(stepIndex)) {
      if (onComplete) onComplete();
    }
    
    return true;
  }

  /**
   * 다음 단계로 이동
   * @returns {boolean}
   */
  next() {
    this.complete(this.options.currentStep);
    return this.goTo(this.options.currentStep + 1);
  }

  /**
   * 이전 단계로 이동
   * @returns {boolean}
   */
  prev() {
    return this.goTo(this.options.currentStep - 1);
  }

  /**
   * 단계 완료 처리
   * @param {number} stepIndex
   */
  complete(stepIndex) {
    this._completedSteps.add(stepIndex);
    this._updateSteps();
    
    // 모든 단계 완료 확인
    if (this._completedSteps.size === this.options.steps.length) {
      if (this.options.onComplete) {
        this.options.onComplete();
      }
    }
  }

  /**
   * 단계 완료 취소
   * @param {number} stepIndex
   */
  uncomplete(stepIndex) {
    this._completedSteps.delete(stepIndex);
    this._updateSteps();
  }

  /**
   * 모든 단계 초기화
   */
  reset() {
    this._completedSteps.clear();
    this.goTo(0);
  }

  /**
   * 단계 상태 업데이트
   * @private
   */
  _updateSteps() {
    const stepEls = this.stepsContainer.querySelectorAll('.stepper__step');
    const currentStep = this.options.currentStep;
    
    stepEls.forEach((stepEl, index) => {
      stepEl.classList.remove('is-active', 'is-completed', 'is-disabled');
      stepEl.setAttribute('aria-selected', 'false');
      
      if (index === currentStep) {
        stepEl.classList.add('is-active');
        stepEl.setAttribute('aria-selected', 'true');
      } else if (this._completedSteps.has(index)) {
        stepEl.classList.add('is-completed');
      } else if (this.options.linear && index > currentStep) {
        stepEl.classList.add('is-disabled');
        stepEl.setAttribute('tabindex', '-1');
      }
    });
  }

  /**
   * 콘텐츠 업데이트
   * @private
   */
  _updateContent() {
    if (!this.contentContainer) return;
    
    const step = this.options.steps[this.options.currentStep];
    if (!step || !step.content) {
      this.contentContainer.innerHTML = '';
      return;
    }

    const content = typeof step.content === 'function' 
      ? step.content(this.options.currentStep) 
      : step.content;

    if (this.options.animated) {
      this.contentContainer.classList.add('is-changing');
      const timerId = setTimeout(() => {
        if (!this.contentContainer) return; // destroy 후 안전 체크
        this.contentContainer.innerHTML = `
          <div class="stepper__panel" 
               id="step-panel-${this.options.currentStep}"
               role="tabpanel"
               aria-labelledby="step-${this.options.currentStep}">
            ${content}
          </div>
        `;
        this.contentContainer.classList.remove('is-changing');
      }, 150);
      this._timers.push(timerId);
    } else {
      this.contentContainer.innerHTML = `
        <div class="stepper__panel" 
             id="step-panel-${this.options.currentStep}"
             role="tabpanel">
          ${content}
        </div>
      `;
    }
  }

  /**
   * 단계 추가
   * @param {Object} step
   * @param {number} [index]
   */
  addStep(step, index) {
    if (index === undefined) {
      this.options.steps.push(step);
    } else {
      this.options.steps.splice(index, 0, step);
    }
    this._render();
    this._bindEvents();
    this.goTo(this.options.currentStep);
  }

  /**
   * 단계 제거
   * @param {number} index
   */
  removeStep(index) {
    if (index < 0 || index >= this.options.steps.length) return;
    
    this.options.steps.splice(index, 1);
    this._completedSteps.delete(index);
    
    // 현재 단계 조정
    if (this.options.currentStep >= this.options.steps.length) {
      this.options.currentStep = Math.max(0, this.options.steps.length - 1);
    }
    
    this._render();
    this._bindEvents();
    this.goTo(this.options.currentStep);
  }

  /**
   * 현재 단계 반환
   * @returns {number}
   */
  getCurrentStep() {
    return this.options.currentStep;
  }

  /**
   * 완료된 단계 목록 반환
   * @returns {number[]}
   */
  getCompletedSteps() {
    return Array.from(this._completedSteps);
  }

  /**
   * 완료 여부 확인
   * @returns {boolean}
   */
  isComplete() {
    return this._completedSteps.size === this.options.steps.length;
  }

  /**
   * 정리
   */
  destroy() {
    // 타이머 정리
    this._timers.forEach(id => clearTimeout(id));
    this._timers = [];
    
    // 이벤트 리스너 제거
    this._eventHandlers.forEach(({ element, type, handler }) => {
      element.removeEventListener(type, handler);
    });
    this._eventHandlers = [];
    
    // 인스턴스 제거
    Stepper.instances.delete(this.container);
    
    // DOM 정리
    if (this.container) {
      this.container.innerHTML = '';
      this.container.className = '';
    }
    
    // 참조 해제
    this.container = null;
    this.stepsContainer = null;
    this.contentContainer = null;
    this._completedSteps = null;
  }
}


// ============================================
// VerticalStepper - 수직 스텝퍼 (콘텐츠 인라인)
// ============================================

/**
 * VerticalStepper 클래스
 * 각 단계에 콘텐츠가 인라인으로 표시되는 수직 스텝퍼
 */
class VerticalStepper {
  /** @type {Map<HTMLElement, VerticalStepper>} */
  static instances = new Map();

  /**
   * 기본 옵션
   * @returns {Object}
   */
  static defaults() {
    return {
      steps: [],              // [{title, subtitle, icon, content}]
      currentStep: 0,
      expandable: true,       // 이전 단계 펼치기 가능
      editable: true,         // 이전 단계 수정 가능
      animated: true,
      onChange: null,
      onComplete: null,
    };
  }

  /**
   * @param {string|HTMLElement} selector
   * @param {Object} options
   */
  constructor(selector, options = {}) {
    this.container = typeof selector === 'string' 
      ? document.querySelector(selector) 
      : selector;
    
    if (!this.container) {
      console.error('VerticalStepper: Container not found');
      return;
    }

    this.options = { ...VerticalStepper.defaults(), ...options };
    this._completedSteps = new Set();
    this._expandedSteps = new Set([this.options.currentStep]);
    this._eventHandlers = [];
    
    this.init();
    VerticalStepper.instances.set(this.container, this);
  }

  init() {
    this._render();
    this._bindEvents();
  }

  _render() {
    const { steps } = this.options;
    
    this.container.className = 'vertical-stepper';
    this.container.setAttribute('role', 'navigation');
    
    this.container.innerHTML = steps.map((step, index) => `
      <div class="vertical-stepper__item ${index === this.options.currentStep ? 'is-active' : ''} ${this._completedSteps.has(index) ? 'is-completed' : ''}" 
           data-step="${index}">
        <div class="vertical-stepper__header" role="button" tabindex="0">
          <div class="vertical-stepper__indicator">
            <span class="vertical-stepper__number">${step.icon ? `<i class="material-icons-outlined">${step.icon}</i>` : index + 1}</span>
            <span class="vertical-stepper__check"><i class="material-icons-outlined">check</i></span>
          </div>
          <div class="vertical-stepper__label">
            <span class="vertical-stepper__title">${step.title || `Step ${index + 1}`}</span>
            ${step.subtitle ? `<span class="vertical-stepper__subtitle">${step.subtitle}</span>` : ''}
          </div>
          ${this._completedSteps.has(index) && this.options.editable ? `
            <button class="vertical-stepper__edit" type="button">
              <i class="material-icons-outlined">edit</i>
            </button>
          ` : ''}
        </div>
        <div class="vertical-stepper__connector"></div>
        <div class="vertical-stepper__content" ${this._expandedSteps.has(index) ? '' : 'hidden'}>
          <div class="vertical-stepper__body">
            ${step.content || ''}
          </div>
          <div class="vertical-stepper__actions">
            ${index > 0 ? `<button type="button" class="btn btn--outline-secondary" data-action="prev">이전</button>` : ''}
            ${index < steps.length - 1 
              ? `<button type="button" class="btn btn--primary" data-action="next">다음</button>`
              : `<button type="button" class="btn btn--primary" data-action="complete">완료</button>`
            }
          </div>
        </div>
      </div>
    `).join('');
  }

  _bindEvents() {
    const handleClick = (e) => {
      const action = e.target.closest('[data-action]');
      if (action) {
        const actionType = action.dataset.action;
        if (actionType === 'next') this.next();
        else if (actionType === 'prev') this.prev();
        else if (actionType === 'complete') this._handleComplete();
        return;
      }

      const editBtn = e.target.closest('.vertical-stepper__edit');
      if (editBtn) {
        const item = editBtn.closest('.vertical-stepper__item');
        const stepIndex = parseInt(item.dataset.step, 10);
        this._uncompleteAndGoTo(stepIndex);
        return;
      }

      const header = e.target.closest('.vertical-stepper__header');
      if (header && this.options.expandable) {
        const item = header.closest('.vertical-stepper__item');
        const stepIndex = parseInt(item.dataset.step, 10);
        
        if (this._completedSteps.has(stepIndex) || stepIndex === this.options.currentStep) {
          this._toggleExpand(stepIndex);
        }
      }
    };

    const handleKeydown = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const header = e.target.closest('.vertical-stepper__header');
        if (header) {
          e.preventDefault();
          header.click();
        }
      }
    };

    this.container.addEventListener('click', handleClick);
    this.container.addEventListener('keydown', handleKeydown);
    
    this._eventHandlers.push(
      { element: this.container, type: 'click', handler: handleClick },
      { element: this.container, type: 'keydown', handler: handleKeydown }
    );
  }

  _toggleExpand(stepIndex) {
    if (this._expandedSteps.has(stepIndex)) {
      this._expandedSteps.delete(stepIndex);
    } else {
      this._expandedSteps.add(stepIndex);
    }
    this._updateUI();
  }

  _uncompleteAndGoTo(stepIndex) {
    // 해당 단계 이후의 모든 완료 상태 취소
    for (let i = stepIndex; i < this.options.steps.length; i++) {
      this._completedSteps.delete(i);
    }
    this.goTo(stepIndex);
  }

  _handleComplete() {
    this.complete(this.options.currentStep);
    if (this.options.onComplete) {
      this.options.onComplete();
    }
  }

  goTo(stepIndex) {
    if (stepIndex < 0 || stepIndex >= this.options.steps.length) return false;
    
    const prevStep = this.options.currentStep;
    this.options.currentStep = stepIndex;
    
    // 현재 단계는 항상 펼침
    this._expandedSteps.add(stepIndex);
    
    this._updateUI();
    
    if (this.options.onChange && prevStep !== stepIndex) {
      this.options.onChange(stepIndex, prevStep);
    }
    
    return true;
  }

  next() {
    this.complete(this.options.currentStep);
    return this.goTo(this.options.currentStep + 1);
  }

  prev() {
    return this.goTo(this.options.currentStep - 1);
  }

  complete(stepIndex) {
    this._completedSteps.add(stepIndex);
    this._expandedSteps.delete(stepIndex);
    this._updateUI();
  }

  reset() {
    this._completedSteps.clear();
    this._expandedSteps.clear();
    this._expandedSteps.add(0);
    this.goTo(0);
  }

  _updateUI() {
    const items = this.container.querySelectorAll('.vertical-stepper__item');
    
    items.forEach((item, index) => {
      item.classList.remove('is-active', 'is-completed');
      
      if (index === this.options.currentStep) {
        item.classList.add('is-active');
      }
      if (this._completedSteps.has(index)) {
        item.classList.add('is-completed');
      }
      
      const content = item.querySelector('.vertical-stepper__content');
      if (content) {
        content.hidden = !this._expandedSteps.has(index);
      }
      
      // 편집 버튼 표시
      const header = item.querySelector('.vertical-stepper__header');
      let editBtn = header.querySelector('.vertical-stepper__edit');
      
      if (this._completedSteps.has(index) && this.options.editable) {
        if (!editBtn) {
          editBtn = document.createElement('button');
          editBtn.className = 'vertical-stepper__edit';
          editBtn.type = 'button';
          editBtn.innerHTML = '<i class="material-icons-outlined">edit</i>';
          header.appendChild(editBtn);
        }
      } else if (editBtn) {
        editBtn.remove();
      }
    });
  }

  getCurrentStep() {
    return this.options.currentStep;
  }

  getCompletedSteps() {
    return Array.from(this._completedSteps);
  }

  isComplete() {
    return this._completedSteps.size === this.options.steps.length;
  }

  destroy() {
    this._eventHandlers.forEach(({ element, type, handler }) => {
      element.removeEventListener(type, handler);
    });
    this._eventHandlers = [];
    
    VerticalStepper.instances.delete(this.container);
    
    if (this.container) {
      this.container.innerHTML = '';
      this.container.className = '';
    }
    
    this.container = null;
    this._completedSteps = null;
    this._expandedSteps = null;
  }
}


// ============================================
// Export
// ============================================

export { Stepper, VerticalStepper };
export default { Stepper, VerticalStepper };
