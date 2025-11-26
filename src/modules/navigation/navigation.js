/**
 * Navigation Components Module
 * @module modules/navigation
 * @description Tabs, Accordion, Collapse 등 네비게이션 컴포넌트 모음
 */

import { EventBus } from '../../core/event.js';
import { Utils } from '../../core/utils.js';

/**
 * Tabs 클래스
 * @class
 * @description 탭 네비게이션 컴포넌트
 */
class Tabs {
  /**
   * 기본 옵션
   * @returns {Object}
   */
  static defaults() {
    return {
      activeIndex: 0,        // 초기 활성 탭 인덱스
      orientation: 'horizontal', // horizontal, vertical
      keyboard: true,        // 키보드 네비게이션
      animation: true,       // 애니메이션
      animationDuration: 300, // 애니메이션 시간
      onChange: null,        // 탭 변경 시 콜백
      onDestroy: null        // 삭제 시 콜백
    };
  }

  /**
   * Tabs 생성자
   * @constructor
   * @param {string|HTMLElement} container - 컨테이너 요소
   * @param {Object} options - 옵션
   */
  constructor(container, options = {}) {
    this.options = Utils.extend({}, Tabs.defaults(), options);
    this.id = Utils.randomId('tabs');
    
    // 컨테이너 찾기
    if (typeof container === 'string') {
      this.container = document.querySelector(container);
    } else {
      this.container = container;
    }

    if (!this.container) {
      console.error('Tabs: 컨테이너를 찾을 수 없습니다.');
      return;
    }

    this.tabList = null;
    this.tabs = [];
    this.panels = [];
    this.activeIndex = this.options.activeIndex;
    this.eventBus = new EventBus();

    // 이벤트 핸들러 바인딩
    this._handleTabClick = this._handleTabClick.bind(this);
    this._handleKeydown = this._handleKeydown.bind(this);

    this._init();
  }

  /**
   * 초기화
   * @private
   */
  _init() {
    // 탭 리스트와 패널 찾기
    this.tabList = this.container.querySelector('[role="tablist"]');
    if (!this.tabList) {
      console.error('Tabs: [role="tablist"]를 찾을 수 없습니다.');
      return;
    }

    this.tabs = Array.from(this.tabList.querySelectorAll('[role="tab"]'));
    this.panels = Array.from(this.container.querySelectorAll('[role="tabpanel"]'));

    if (this.tabs.length === 0 || this.panels.length === 0) {
      console.error('Tabs: 탭 또는 패널을 찾을 수 없습니다.');
      return;
    }

    // ARIA 속성 설정
    this.tabList.setAttribute('aria-orientation', this.options.orientation);
    
    this.tabs.forEach((tab, index) => {
      const tabId = tab.id || `${this.id}-tab-${index}`;
      const panelId = this.panels[index]?.id || `${this.id}-panel-${index}`;
      
      tab.id = tabId;
      tab.setAttribute('aria-controls', panelId);
      tab.setAttribute('tabindex', index === this.activeIndex ? '0' : '-1');
      
      if (this.panels[index]) {
        this.panels[index].id = panelId;
        this.panels[index].setAttribute('aria-labelledby', tabId);
      }

      // 이벤트 리스너 추가
      tab.addEventListener('click', this._handleTabClick);
      if (this.options.keyboard) {
        tab.addEventListener('keydown', this._handleKeydown);
      }
    });

    // 초기 활성 탭 설정
    this.select(this.activeIndex, false);
  }

  /**
   * 탭 클릭 핸들러
   * @private
   */
  _handleTabClick(e) {
    const tab = e.currentTarget;
    const index = this.tabs.indexOf(tab);
    
    if (index !== -1 && index !== this.activeIndex) {
      this.select(index);
    }
  }

  /**
   * 키보드 이벤트 핸들러
   * @private
   */
  _handleKeydown(e) {
    const currentIndex = this.tabs.indexOf(e.target);
    let nextIndex = currentIndex;

    const isHorizontal = this.options.orientation === 'horizontal';

    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        if ((isHorizontal && e.key === 'ArrowLeft') || (!isHorizontal && e.key === 'ArrowUp')) {
          nextIndex = currentIndex > 0 ? currentIndex - 1 : this.tabs.length - 1;
        }
        break;
      
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        if ((isHorizontal && e.key === 'ArrowRight') || (!isHorizontal && e.key === 'ArrowDown')) {
          nextIndex = currentIndex < this.tabs.length - 1 ? currentIndex + 1 : 0;
        }
        break;
      
      case 'Home':
        e.preventDefault();
        nextIndex = 0;
        break;
      
      case 'End':
        e.preventDefault();
        nextIndex = this.tabs.length - 1;
        break;
      
      default:
        return;
    }

    if (nextIndex !== currentIndex) {
      this.select(nextIndex);
      this.tabs[nextIndex].focus();
    }
  }

  /**
   * 탭 선택
   * @param {number} index - 탭 인덱스
   * @param {boolean} triggerCallback - 콜백 실행 여부
   */
  select(index, triggerCallback = true) {
    if (index < 0 || index >= this.tabs.length) {
      console.warn('Tabs: 유효하지 않은 인덱스입니다.');
      return;
    }

    const previousIndex = this.activeIndex;
    if (index === previousIndex && triggerCallback) return;

    // 이전 탭 비활성화 (초기화 시가 아닐 때만)
    if (previousIndex !== index && previousIndex >= 0 && previousIndex < this.tabs.length) {
      this.tabs[previousIndex].setAttribute('aria-selected', 'false');
      this.tabs[previousIndex].setAttribute('tabindex', '-1');
      this.panels[previousIndex].setAttribute('aria-hidden', 'true');
      this.panels[previousIndex].style.display = 'none';
    }

    // 새 탭 활성화
    this.tabs[index].setAttribute('aria-selected', 'true');
    this.tabs[index].setAttribute('tabindex', '0');
    this.panels[index].setAttribute('aria-hidden', 'false');
    this.panels[index].style.display = 'block';

    // 애니메이션
    if (this.options.animation) {
      this.panels[index].style.opacity = '0';
      this.panels[index].style.transform = 'translateY(10px)';
      
      requestAnimationFrame(() => {
        this.panels[index].style.transition = `opacity ${this.options.animationDuration}ms ease, transform ${this.options.animationDuration}ms ease`;
        this.panels[index].style.opacity = '1';
        this.panels[index].style.transform = 'translateY(0)';
      });
    }

    this.activeIndex = index;

    // 콜백 실행
    if (triggerCallback && typeof this.options.onChange === 'function') {
      this.options.onChange(index, this.tabs[index], this.panels[index]);
    }

    // 이벤트 발생
    this.eventBus.emit('change', { index, tab: this.tabs[index], panel: this.panels[index] });
  }

  /**
   * 현재 활성 탭 가져오기
   * @returns {number}
   */
  getActiveIndex() {
    return this.activeIndex;
  }

  /**
   * 정리 (메모리 관리)
   */
  destroy() {
    // 이벤트 리스너 제거
    this.tabs.forEach(tab => {
      tab.removeEventListener('click', this._handleTabClick);
      tab.removeEventListener('keydown', this._handleKeydown);
    });

    // 참조 해제
    this.container = null;
    this.tabList = null;
    this.tabs = [];
    this.panels = [];
    this.eventBus.clear();

    // 콜백
    if (typeof this.options.onDestroy === 'function') {
      this.options.onDestroy(this);
    }
  }
}

/**
 * Accordion 클래스
 * @class
 * @description 아코디언 컴포넌트
 */
class Accordion {
  /**
   * 기본 옵션
   * @returns {Object}
   */
  static defaults() {
    return {
      multiple: false,       // 여러 패널 동시 열기
      expandFirst: true,     // 첫 번째 패널 자동 열기
      animation: true,       // 애니메이션
      animationDuration: 300, // 애니메이션 시간
      onChange: null,        // 패널 변경 시 콜백
      onDestroy: null        // 삭제 시 콜백
    };
  }

  /**
   * Accordion 생성자
   * @constructor
   * @param {string|HTMLElement} container - 컨테이너 요소
   * @param {Object} options - 옵션
   */
  constructor(container, options = {}) {
    this.options = Utils.extend({}, Accordion.defaults(), options);
    this.id = Utils.randomId('accordion');
    
    // 컨테이너 찾기
    if (typeof container === 'string') {
      this.container = document.querySelector(container);
    } else {
      this.container = container;
    }

    if (!this.container) {
      console.error('Accordion: 컨테이너를 찾을 수 없습니다.');
      return;
    }

    this.items = [];
    this.eventBus = new EventBus();

    // 이벤트 핸들러 바인딩
    this._handleHeaderClick = this._handleHeaderClick.bind(this);

    this._init();
  }

  /**
   * 초기화
   * @private
   */
  _init() {
    // 아코디언 아이템 찾기
    const itemElements = Array.from(this.container.querySelectorAll('.accordion__item'));
    
    if (itemElements.length === 0) {
      console.error('Accordion: .accordion__item을 찾을 수 없습니다.');
      return;
    }

    // 각 아이템 초기화
    itemElements.forEach((itemEl, index) => {
      const header = itemEl.querySelector('.accordion__header');
      const content = itemEl.querySelector('.accordion__content');
      
      if (!header || !content) {
        console.warn(`Accordion: 아이템 ${index}의 헤더 또는 콘텐츠를 찾을 수 없습니다.`);
        return;
      }

      // ID 설정
      const headerId = header.id || `${this.id}-header-${index}`;
      const contentId = content.id || `${this.id}-content-${index}`;
      
      header.id = headerId;
      content.id = contentId;

      // ARIA 속성 설정
      header.setAttribute('role', 'button');
      header.setAttribute('aria-controls', contentId);
      header.setAttribute('aria-expanded', 'false');
      
      content.setAttribute('role', 'region');
      content.setAttribute('aria-labelledby', headerId);
      content.style.display = 'none';

      // 아이템 정보 저장
      this.items.push({
        element: itemEl,
        header: header,
        content: content,
        isExpanded: false
      });

      // 이벤트 리스너 추가
      header.addEventListener('click', this._handleHeaderClick);
    });

    // 첫 번째 패널 열기
    if (this.options.expandFirst && this.items.length > 0) {
      this.expand(0, false);
    }
  }

  /**
   * 헤더 클릭 핸들러
   * @private
   */
  _handleHeaderClick(e) {
    const header = e.currentTarget;
    const index = this.items.findIndex(item => item.header === header);
    
    if (index !== -1) {
      this.toggle(index);
    }
  }

  /**
   * 패널 토글
   * @param {number} index - 패널 인덱스
   */
  toggle(index) {
    if (index < 0 || index >= this.items.length) {
      console.warn('Accordion: 유효하지 않은 인덱스입니다.');
      return;
    }

    const item = this.items[index];
    
    if (item.isExpanded) {
      this.collapse(index);
    } else {
      this.expand(index);
    }
  }

  /**
   * 패널 펼치기
   * @param {number} index - 패널 인덱스
   * @param {boolean} triggerCallback - 콜백 실행 여부
   */
  expand(index, triggerCallback = true) {
    if (index < 0 || index >= this.items.length) {
      console.warn('Accordion: 유효하지 않은 인덱스입니다.');
      return;
    }

    const item = this.items[index];
    
    if (item.isExpanded) return;

    // multiple이 false면 다른 패널 닫기
    if (!this.options.multiple) {
      this.items.forEach((otherItem, i) => {
        if (i !== index && otherItem.isExpanded) {
          this.collapse(i, false);
        }
      });
    }

    // 패널 열기
    item.isExpanded = true;
    item.header.setAttribute('aria-expanded', 'true');
    item.element.classList.add('accordion__item--expanded');
    
    if (this.options.animation) {
      // 애니메이션과 함께 열기
      item.content.style.display = 'block';
      const height = item.content.scrollHeight;
      item.content.style.height = '0';
      item.content.style.overflow = 'hidden';
      
      requestAnimationFrame(() => {
        item.content.style.transition = `height ${this.options.animationDuration}ms ease`;
        item.content.style.height = height + 'px';
        
        setTimeout(() => {
          item.content.style.height = 'auto';
          item.content.style.overflow = 'visible';
        }, this.options.animationDuration);
      });
    } else {
      item.content.style.display = 'block';
    }

    // 콜백 실행
    if (triggerCallback && typeof this.options.onChange === 'function') {
      this.options.onChange(index, true, item);
    }

    // 이벤트 발생
    this.eventBus.emit('expand', { index, item });
  }

  /**
   * 패널 접기
   * @param {number} index - 패널 인덱스
   * @param {boolean} triggerCallback - 콜백 실행 여부
   */
  collapse(index, triggerCallback = true) {
    if (index < 0 || index >= this.items.length) {
      console.warn('Accordion: 유효하지 않은 인덱스입니다.');
      return;
    }

    const item = this.items[index];
    
    if (!item.isExpanded) return;

    // 패널 닫기
    item.isExpanded = false;
    item.header.setAttribute('aria-expanded', 'false');
    item.element.classList.remove('accordion__item--expanded');
    
    if (this.options.animation) {
      // 애니메이션과 함께 닫기
      const height = item.content.scrollHeight;
      item.content.style.height = height + 'px';
      item.content.style.overflow = 'hidden';
      
      requestAnimationFrame(() => {
        item.content.style.transition = `height ${this.options.animationDuration}ms ease`;
        item.content.style.height = '0';
        
        setTimeout(() => {
          item.content.style.display = 'none';
          item.content.style.height = 'auto';
        }, this.options.animationDuration);
      });
    } else {
      item.content.style.display = 'none';
    }

    // 콜백 실행
    if (triggerCallback && typeof this.options.onChange === 'function') {
      this.options.onChange(index, false, item);
    }

    // 이벤트 발생
    this.eventBus.emit('collapse', { index, item });
  }

  /**
   * 모두 펼치기
   */
  expandAll() {
    this.items.forEach((item, index) => {
      this.expand(index, false);
    });
  }

  /**
   * 모두 접기
   */
  collapseAll() {
    this.items.forEach((item, index) => {
      this.collapse(index, false);
    });
  }

  /**
   * 정리 (메모리 관리)
   */
  destroy() {
    // 이벤트 리스너 제거
    this.items.forEach(item => {
      item.header.removeEventListener('click', this._handleHeaderClick);
    });

    // 참조 해제
    this.container = null;
    this.items = [];
    this.eventBus.clear();

    // 콜백
    if (typeof this.options.onDestroy === 'function') {
      this.options.onDestroy(this);
    }
  }
}

/**
 * Collapse 클래스
 * @class
 * @description 단일 접기/펼치기 컴포넌트
 */
class Collapse {
  /**
   * 기본 옵션
   * @returns {Object}
   */
  static defaults() {
    return {
      expanded: false,       // 초기 펼침 상태
      animation: true,       // 애니메이션
      animationDuration: 300, // 애니메이션 시간
      onChange: null,        // 상태 변경 시 콜백
      onDestroy: null        // 삭제 시 콜백
    };
  }

  /**
   * Collapse 생성자
   * @constructor
   * @param {string|HTMLElement} container - 컨테이너 요소
   * @param {Object} options - 옵션
   */
  constructor(container, options = {}) {
    this.options = Utils.extend({}, Collapse.defaults(), options);
    this.id = Utils.randomId('collapse');
    
    // 컨테이너 찾기
    if (typeof container === 'string') {
      this.container = document.querySelector(container);
    } else {
      this.container = container;
    }

    if (!this.container) {
      console.error('Collapse: 컨테이너를 찾을 수 없습니다.');
      return;
    }

    this.isExpanded = this.options.expanded;
    this.eventBus = new EventBus();

    this._init();
  }

  /**
   * 초기화
   * @private
   */
  _init() {
    // ARIA 속성 설정
    this.container.setAttribute('role', 'region');
    this.container.setAttribute('aria-expanded', this.isExpanded.toString());
    
    // 초기 상태 설정
    if (!this.isExpanded) {
      this.container.style.display = 'none';
    }
  }

  /**
   * 토글
   */
  toggle() {
    if (this.isExpanded) {
      this.collapse();
    } else {
      this.expand();
    }
  }

  /**
   * 펼치기
   */
  expand() {
    if (this.isExpanded) return;

    this.isExpanded = true;
    this.container.setAttribute('aria-expanded', 'true');
    
    if (this.options.animation) {
      this.container.style.display = 'block';
      const height = this.container.scrollHeight;
      this.container.style.height = '0';
      this.container.style.overflow = 'hidden';
      
      requestAnimationFrame(() => {
        this.container.style.transition = `height ${this.options.animationDuration}ms ease`;
        this.container.style.height = height + 'px';
        
        setTimeout(() => {
          this.container.style.height = 'auto';
          this.container.style.overflow = 'visible';
        }, this.options.animationDuration);
      });
    } else {
      this.container.style.display = 'block';
    }

    // 콜백 실행
    if (typeof this.options.onChange === 'function') {
      this.options.onChange(true);
    }

    // 이벤트 발생
    this.eventBus.emit('expand');
  }

  /**
   * 접기
   */
  collapse() {
    if (!this.isExpanded) return;

    this.isExpanded = false;
    this.container.setAttribute('aria-expanded', 'false');
    
    if (this.options.animation) {
      const height = this.container.scrollHeight;
      this.container.style.height = height + 'px';
      this.container.style.overflow = 'hidden';
      
      requestAnimationFrame(() => {
        this.container.style.transition = `height ${this.options.animationDuration}ms ease`;
        this.container.style.height = '0';
        
        setTimeout(() => {
          this.container.style.display = 'none';
          this.container.style.height = 'auto';
        }, this.options.animationDuration);
      });
    } else {
      this.container.style.display = 'none';
    }

    // 콜백 실행
    if (typeof this.options.onChange === 'function') {
      this.options.onChange(false);
    }

    // 이벤트 발생
    this.eventBus.emit('collapse');
  }

  /**
   * 정리 (메모리 관리)
   */
  destroy() {
    // 참조 해제
    this.container = null;
    this.eventBus.clear();

    // 콜백
    if (typeof this.options.onDestroy === 'function') {
      this.options.onDestroy(this);
    }
  }
}

/**
 * MegaMenu 클래스
 * @class
 * @description 메가 메뉴 컴포넌트 (대형 드롭다운 메뉴)
 */
class MegaMenu {
  /**
   * 기본 옵션
   * @returns {Object}
   */
  static defaults() {
    return {
      trigger: 'hover',      // hover, click
      hoverDelay: 200,       // hover 지연 시간
      animation: true,       // 애니메이션
      animationDuration: 300, // 애니메이션 시간
      closeOnOutside: true,  // 외부 클릭 시 닫기
      onChange: null,        // 메뉴 변경 시 콜백
      onDestroy: null        // 삭제 시 콜백
    };
  }

  /**
   * MegaMenu 생성자
   * @constructor
   * @param {string|HTMLElement} container - 컨테이너 요소
   * @param {Object} options - 옵션
   */
  constructor(container, options = {}) {
    this.options = Utils.extend({}, MegaMenu.defaults(), options);
    this.id = Utils.randomId('megamenu');
    
    // 컨테이너 찾기
    if (typeof container === 'string') {
      this.container = document.querySelector(container);
    } else {
      this.container = container;
    }

    if (!this.container) {
      console.error('MegaMenu: 컨테이너를 찾을 수 없습니다.');
      return;
    }

    this.items = [];
    this.activeItem = null;
    this.hoverTimer = null;
    this.eventBus = new EventBus();

    // 이벤트 핸들러 바인딩
    this._handleTriggerClick = this._handleTriggerClick.bind(this);
    this._handleTriggerMouseEnter = this._handleTriggerMouseEnter.bind(this);
    this._handleTriggerMouseLeave = this._handleTriggerMouseLeave.bind(this);
    this._handlePanelMouseEnter = this._handlePanelMouseEnter.bind(this);
    this._handlePanelMouseLeave = this._handlePanelMouseLeave.bind(this);
    this._handleOutsideClick = this._handleOutsideClick.bind(this);

    this._init();
  }

  /**
   * 초기화
   * @private
   */
  _init() {
    // 메가 메뉴 아이템 찾기
    const itemElements = Array.from(this.container.querySelectorAll('.megamenu__item'));
    
    if (itemElements.length === 0) {
      console.error('MegaMenu: .megamenu__item을 찾을 수 없습니다.');
      return;
    }

    // 각 아이템 초기화
    itemElements.forEach((itemEl, index) => {
      const trigger = itemEl.querySelector('.megamenu__trigger');
      const panel = itemEl.querySelector('.megamenu__panel');
      
      if (!trigger || !panel) {
        console.warn(`MegaMenu: 아이템 ${index}의 트리거 또는 패널을 찾을 수 없습니다.`);
        return;
      }

      // ARIA 속성 설정
      const triggerId = trigger.id || `${this.id}-trigger-${index}`;
      const panelId = panel.id || `${this.id}-panel-${index}`;
      
      trigger.id = triggerId;
      trigger.setAttribute('aria-haspopup', 'true');
      trigger.setAttribute('aria-expanded', 'false');
      trigger.setAttribute('aria-controls', panelId);
      
      panel.id = panelId;
      panel.setAttribute('aria-labelledby', triggerId);
      panel.style.display = 'none';

      // 아이템 정보 저장
      this.items.push({
        element: itemEl,
        trigger: trigger,
        panel: panel,
        isOpen: false
      });

      // 이벤트 리스너 추가
      if (this.options.trigger === 'hover') {
        trigger.addEventListener('mouseenter', this._handleTriggerMouseEnter);
        trigger.addEventListener('mouseleave', this._handleTriggerMouseLeave);
        panel.addEventListener('mouseenter', this._handlePanelMouseEnter);
        panel.addEventListener('mouseleave', this._handlePanelMouseLeave);
      } else {
        trigger.addEventListener('click', this._handleTriggerClick);
      }
    });

    // 외부 클릭 감지
    if (this.options.closeOnOutside) {
      document.addEventListener('click', this._handleOutsideClick);
    }
  }

  /**
   * 트리거 클릭 핸들러
   * @private
   */
  _handleTriggerClick(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const trigger = e.currentTarget;
    const index = this.items.findIndex(item => item.trigger === trigger);
    
    if (index !== -1) {
      this.toggle(index);
    }
  }

  /**
   * 트리거 mouseenter 핸들러
   * @private
   */
  _handleTriggerMouseEnter(e) {
    if (this.hoverTimer) {
      clearTimeout(this.hoverTimer);
    }
    
    const trigger = e.currentTarget;
    const index = this.items.findIndex(item => item.trigger === trigger);
    
    this.hoverTimer = setTimeout(() => {
      if (index !== -1) {
        this.open(index);
      }
    }, this.options.hoverDelay);
  }

  /**
   * 트리거 mouseleave 핸들러
   * @private
   */
  _handleTriggerMouseLeave() {
    if (this.hoverTimer) {
      clearTimeout(this.hoverTimer);
      this.hoverTimer = null;
    }
    
    this.hoverTimer = setTimeout(() => {
      this.closeAll();
    }, 300);
  }

  /**
   * 패널 mouseenter 핸들러
   * @private
   */
  _handlePanelMouseEnter() {
    if (this.hoverTimer) {
      clearTimeout(this.hoverTimer);
      this.hoverTimer = null;
    }
  }

  /**
   * 패널 mouseleave 핸들러
   * @private
   */
  _handlePanelMouseLeave() {
    this.hoverTimer = setTimeout(() => {
      this.closeAll();
    }, 300);
  }

  /**
   * 외부 클릭 핸들러
   * @private
   */
  _handleOutsideClick(e) {
    const isInside = this.items.some(item => 
      item.element.contains(e.target)
    );
    
    if (!isInside) {
      this.closeAll();
    }
  }

  /**
   * 메뉴 토글
   * @param {number} index - 아이템 인덱스
   */
  toggle(index) {
    if (index < 0 || index >= this.items.length) {
      console.warn('MegaMenu: 유효하지 않은 인덱스입니다.');
      return;
    }

    const item = this.items[index];
    
    if (item.isOpen) {
      this.close(index);
    } else {
      this.open(index);
    }
  }

  /**
   * 메뉴 열기
   * @param {number} index - 아이템 인덱스
   */
  open(index) {
    if (index < 0 || index >= this.items.length) {
      console.warn('MegaMenu: 유효하지 않은 인덱스입니다.');
      return;
    }

    const item = this.items[index];
    
    if (item.isOpen) return;

    // 다른 메뉴 닫기
    this.closeAll();

    // 메뉴 열기
    item.isOpen = true;
    item.trigger.setAttribute('aria-expanded', 'true');
    item.element.classList.add('megamenu__item--active');
    
    if (this.options.animation) {
      item.panel.style.display = 'block';
      item.panel.style.opacity = '0';
      item.panel.style.transform = 'translateY(-10px)';
      
      requestAnimationFrame(() => {
        item.panel.style.transition = `opacity ${this.options.animationDuration}ms ease, transform ${this.options.animationDuration}ms ease`;
        item.panel.style.opacity = '1';
        item.panel.style.transform = 'translateY(0)';
      });
    } else {
      item.panel.style.display = 'block';
    }

    this.activeItem = item;

    // 콜백 실행
    if (typeof this.options.onChange === 'function') {
      this.options.onChange(index, true, item);
    }

    // 이벤트 발생
    this.eventBus.emit('open', { index, item });
  }

  /**
   * 메뉴 닫기
   * @param {number} index - 아이템 인덱스
   */
  close(index) {
    if (index < 0 || index >= this.items.length) {
      console.warn('MegaMenu: 유효하지 않은 인덱스입니다.');
      return;
    }

    const item = this.items[index];
    
    if (!item.isOpen) return;

    // 메뉴 닫기
    item.isOpen = false;
    item.trigger.setAttribute('aria-expanded', 'false');
    item.element.classList.remove('megamenu__item--active');
    
    if (this.options.animation) {
      item.panel.style.opacity = '0';
      item.panel.style.transform = 'translateY(-10px)';
      
      setTimeout(() => {
        item.panel.style.display = 'none';
      }, this.options.animationDuration);
    } else {
      item.panel.style.display = 'none';
    }

    if (this.activeItem === item) {
      this.activeItem = null;
    }

    // 콜백 실행
    if (typeof this.options.onChange === 'function') {
      this.options.onChange(index, false, item);
    }

    // 이벤트 발생
    this.eventBus.emit('close', { index, item });
  }

  /**
   * 모든 메뉴 닫기
   */
  closeAll() {
    this.items.forEach((item, index) => {
      if (item.isOpen) {
        this.close(index);
      }
    });
  }

  /**
   * 정리 (메모리 관리)
   */
  destroy() {
    // 타이머 클리어
    if (this.hoverTimer) {
      clearTimeout(this.hoverTimer);
      this.hoverTimer = null;
    }

    // 이벤트 리스너 제거
    if (this.items && Array.isArray(this.items)) {
      this.items.forEach(item => {
        if (this.options.trigger === 'hover') {
          item.trigger.removeEventListener('mouseenter', this._handleTriggerMouseEnter);
          item.trigger.removeEventListener('mouseleave', this._handleTriggerMouseLeave);
          item.panel.removeEventListener('mouseenter', this._handlePanelMouseEnter);
          item.panel.removeEventListener('mouseleave', this._handlePanelMouseLeave);
        } else {
          item.trigger.removeEventListener('click', this._handleTriggerClick);
        }
      });
    }

    document.removeEventListener('click', this._handleOutsideClick);

    // 참조 해제
    this.container = null;
    this.items = [];
    this.activeItem = null;
    if (this.eventBus) {
      this.eventBus.clear();
    }

    // 콜백
    if (typeof this.options.onDestroy === 'function') {
      this.options.onDestroy(this);
    }
  }
}

/**
 * TreeView 클래스
 * @class
 * @description 트리 뷰 컴포넌트 (계층적 데이터 표시)
 */
class TreeView {
  /**
   * 기본 옵션
   * @returns {Object}
   */
  static defaults() {
    return {
      expandIcon: 'expand_more',    // 펼침 아이콘
      collapseIcon: 'chevron_right', // 접힘 아이콘
      animation: true,               // 애니메이션
      animationDuration: 300,        // 애니메이션 시간
      multipleSelect: false,         // 다중 선택
      onNodeClick: null,             // 노드 클릭 시 콜백
      onNodeToggle: null,            // 노드 토글 시 콜백
      onDestroy: null                // 삭제 시 콜백
    };
  }

  /**
   * TreeView 생성자
   * @constructor
   * @param {string|HTMLElement} container - 컨테이너 요소
   * @param {Object} options - 옵션
   */
  constructor(container, options = {}) {
    this.options = Utils.extend({}, TreeView.defaults(), options);
    this.id = Utils.randomId('treeview');
    
    // 컨테이너 찾기
    if (typeof container === 'string') {
      this.container = document.querySelector(container);
    } else {
      this.container = container;
    }

    if (!this.container) {
      console.error('TreeView: 컨테이너를 찾을 수 없습니다.');
      return;
    }

    this.nodes = [];
    this.selectedNodes = [];
    this.eventBus = new EventBus();
    this._timers = []; // setTimeout 추적

    // 이벤트 핸들러 바인딩
    this._handleToggleClick = this._handleToggleClick.bind(this);
    this._handleNodeClick = this._handleNodeClick.bind(this);

    this._init();
  }

  /**
   * 초기화
   * @private
   */
  _init() {
    // 트리 노드 찾기
    this._initNodes(this.container);
  }

  /**
   * 노드 초기화
   * @private
   */
  _initNodes(parentElement, level = 0) {
    const nodeElements = Array.from(parentElement.querySelectorAll(':scope > .treeview__item'));
    
    nodeElements.forEach((nodeEl) => {
      const toggle = nodeEl.querySelector('.treeview__toggle');
      const label = nodeEl.querySelector('.treeview__label');
      const children = nodeEl.querySelector('.treeview__children');
      
      if (!label) return;

      const nodeData = {
        element: nodeEl,
        toggle: toggle,
        label: label,
        children: children,
        level: level,
        isExpanded: false,
        isSelected: false,
        hasChildren: !!children
      };

      this.nodes.push(nodeData);

      // ARIA 속성 설정
      if (toggle) {
        toggle.setAttribute('aria-expanded', 'false');
        toggle.addEventListener('click', this._handleToggleClick);
      }

      label.setAttribute('role', 'treeitem');
      label.setAttribute('tabindex', '0');
      label.addEventListener('click', this._handleNodeClick);

      // 자식 노드 초기화
      if (children) {
        children.style.display = 'none';
        this._initNodes(children, level + 1);
      }
    });
  }

  /**
   * 토글 클릭 핸들러
   * @private
   */
  _handleToggleClick(e) {
    e.stopPropagation();
    
    const toggle = e.currentTarget;
    const nodeData = this.nodes.find(n => n.toggle === toggle);
    
    if (nodeData) {
      this.toggleNode(nodeData);
    }
  }

  /**
   * 노드 클릭 핸들러
   * @private
   */
  _handleNodeClick(e) {
    const label = e.currentTarget;
    const nodeData = this.nodes.find(n => n.label === label);
    
    if (nodeData) {
      this.selectNode(nodeData);
    }
  }

  /**
   * 노드 토글
   * @param {Object} nodeData - 노드 데이터
   */
  toggleNode(nodeData) {
    if (!nodeData.hasChildren) return;

    if (nodeData.isExpanded) {
      this.collapseNode(nodeData);
    } else {
      this.expandNode(nodeData);
    }
  }

  /**
   * 노드 펼치기
   * @param {Object} nodeData - 노드 데이터
   */
  expandNode(nodeData) {
    if (!nodeData.hasChildren || nodeData.isExpanded) return;

    nodeData.isExpanded = true;
    nodeData.element.classList.add('treeview__item--expanded');
    
    if (nodeData.toggle) {
      nodeData.toggle.setAttribute('aria-expanded', 'true');
      const icon = nodeData.toggle.querySelector('i');
      if (icon) {
        icon.textContent = this.options.expandIcon;
      }
    }

    if (this.options.animation) {
      nodeData.children.style.display = 'block';
      const height = nodeData.children.scrollHeight;
      nodeData.children.style.height = '0';
      nodeData.children.style.overflow = 'hidden';
      
      requestAnimationFrame(() => {
        nodeData.children.style.transition = `height ${this.options.animationDuration}ms ease`;
        nodeData.children.style.height = height + 'px';
        
        const timerId = setTimeout(() => {
          if (!this.container) return; // destroy 후 안전 체크
          nodeData.children.style.height = 'auto';
          nodeData.children.style.overflow = 'visible';
        }, this.options.animationDuration);
        this._timers.push(timerId);
      });
    } else {
      nodeData.children.style.display = 'block';
    }

    // 콜백 실행
    if (typeof this.options.onNodeToggle === 'function') {
      this.options.onNodeToggle(nodeData, true);
    }

    // 이벤트 발생
    this.eventBus.emit('expand', { node: nodeData });
  }

  /**
   * 노드 접기
   * @param {Object} nodeData - 노드 데이터
   */
  collapseNode(nodeData) {
    if (!nodeData.hasChildren || !nodeData.isExpanded) return;

    nodeData.isExpanded = false;
    nodeData.element.classList.remove('treeview__item--expanded');
    
    if (nodeData.toggle) {
      nodeData.toggle.setAttribute('aria-expanded', 'false');
      const icon = nodeData.toggle.querySelector('i');
      if (icon) {
        icon.textContent = this.options.collapseIcon;
      }
    }

    if (this.options.animation) {
      const height = nodeData.children.scrollHeight;
      nodeData.children.style.height = height + 'px';
      nodeData.children.style.overflow = 'hidden';
      
      requestAnimationFrame(() => {
        nodeData.children.style.transition = `height ${this.options.animationDuration}ms ease`;
        nodeData.children.style.height = '0';
        
        const timerId = setTimeout(() => {
          if (!this.container) return; // destroy 후 안전 체크
          nodeData.children.style.display = 'none';
          nodeData.children.style.height = 'auto';
        }, this.options.animationDuration);
        this._timers.push(timerId);
      });
    } else {
      nodeData.children.style.display = 'none';
    }

    // 콜백 실행
    if (typeof this.options.onNodeToggle === 'function') {
      this.options.onNodeToggle(nodeData, false);
    }

    // 이벤트 발생
    this.eventBus.emit('collapse', { node: nodeData });
  }

  /**
   * 노드 선택
   * @param {Object} nodeData - 노드 데이터
   */
  selectNode(nodeData) {
    // 단일 선택
    if (!this.options.multipleSelect) {
      this.selectedNodes.forEach(node => {
        node.isSelected = false;
        node.label.classList.remove('treeview__label--selected');
        node.label.setAttribute('aria-selected', 'false');
      });
      this.selectedNodes = [];
    }

    // 선택 토글
    nodeData.isSelected = !nodeData.isSelected;
    
    if (nodeData.isSelected) {
      nodeData.label.classList.add('treeview__label--selected');
      nodeData.label.setAttribute('aria-selected', 'true');
      this.selectedNodes.push(nodeData);
    } else {
      nodeData.label.classList.remove('treeview__label--selected');
      nodeData.label.setAttribute('aria-selected', 'false');
      this.selectedNodes = this.selectedNodes.filter(n => n !== nodeData);
    }

    // 콜백 실행
    if (typeof this.options.onNodeClick === 'function') {
      this.options.onNodeClick(nodeData, nodeData.isSelected);
    }

    // 이벤트 발생
    this.eventBus.emit('select', { node: nodeData, selected: nodeData.isSelected });
  }

  /**
   * 모두 펼치기
   */
  expandAll() {
    this.nodes.forEach(node => {
      if (node.hasChildren && !node.isExpanded) {
        this.expandNode(node);
      }
    });
  }

  /**
   * 모두 접기
   */
  collapseAll() {
    this.nodes.forEach(node => {
      if (node.hasChildren && node.isExpanded) {
        this.collapseNode(node);
      }
    });
  }

  /**
   * 정리 (메모리 관리)
   */
  destroy() {
    // 타이머 정리
    this._timers.forEach(id => clearTimeout(id));
    this._timers = [];

    // 이벤트 리스너 제거
    this.nodes.forEach(node => {
      if (node.toggle) {
        node.toggle.removeEventListener('click', this._handleToggleClick);
      }
      node.label.removeEventListener('click', this._handleNodeClick);
    });

    // 참조 해제
    this.container = null;
    this.nodes = [];
    this.selectedNodes = [];
    this.eventBus.clear();

    // 콜백
    if (typeof this.options.onDestroy === 'function') {
      this.options.onDestroy(this);
    }
  }
}

// Export
export { Tabs, Accordion, Collapse, MegaMenu, TreeView };
export default { Tabs, Accordion, Collapse, MegaMenu, TreeView };
