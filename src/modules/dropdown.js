/**
 * Dropdown Module
 * @module modules/dropdown
 * @description 드롭다운 메뉴 컴포넌트
 */

import { EventBus } from '../core/event.js';
import { Utils } from '../core/utils.js';

/**
 * Dropdown 클래스
 * @class
 * @description 트리거 요소에 바인딩되는 드롭다운 메뉴
 */
class Dropdown {
  /**
   * 기본 옵션
   * @returns {Object}
   */
  static defaults() {
    return {
      items: [],              // 메뉴 아이템 배열
      position: 'bottom',     // top, bottom, left, right
      align: 'start',         // start, center, end
      offset: 8,              // 트리거로부터의 거리
      closeOnClick: true,     // 아이템 클릭 시 닫기
      closeOnOutside: true,   // 외부 클릭 시 닫기
      openOnHover: false,     // hover 시 열기
      hoverDelay: 200,        // hover 지연 시간 (ms)
      keyboard: true,         // 키보드 네비게이션
      animation: true,        // 애니메이션 활성화
      animationDuration: 200, // 애니메이션 시간
      onShow: null,
      onHide: null,
      onSelect: null,
      onDestroy: null
    };
  }

  /**
   * Dropdown 생성자
   * @constructor
   * @param {string|HTMLElement} trigger - 트리거 요소 (선택자 또는 요소)
   * @param {Object} options - 옵션
   */
  constructor(trigger, options = {}) {
    this.options = Utils.extend({}, Dropdown.defaults(), options);
    this.id = Utils.randomId('dropdown');
    this.isOpen = false;

    // 트리거 요소 찾기
    if (typeof trigger === 'string') {
      this.trigger = document.querySelector(trigger);
    } else {
      this.trigger = trigger;
    }

    if (!this.trigger) {
      console.error('Dropdown: 트리거 요소를 찾을 수 없습니다.');
      return;
    }

    this.menu = null;
    this.currentIndex = -1;
    this.eventBus = new EventBus();
    this.hoverTimer = null;  // hover 지연 타이머

    // 이벤트 핸들러 바인딩 (메모리 누수 방지)
    this._handleTriggerClick = this._handleTriggerClick.bind(this);
    this._handleTriggerMouseEnter = this._handleTriggerMouseEnter.bind(this);
    this._handleTriggerMouseLeave = this._handleTriggerMouseLeave.bind(this);
    this._handleMenuMouseEnter = this._handleMenuMouseEnter.bind(this);
    this._handleMenuMouseLeave = this._handleMenuMouseLeave.bind(this);
    this._handleOutsideClick = this._handleOutsideClick.bind(this);
    this._handleKeydown = this._handleKeydown.bind(this);
    this._handleResize = this._handleResize.bind(this);

    this._init();
  }

  /**
   * 초기화
   * @private
   */
  _init() {
    // 트리거에 이벤트 리스너 추가
    this.trigger.addEventListener('click', this._handleTriggerClick);

    // hover 옵션이 활성화되면 hover 이벤트 추가
    if (this.options.openOnHover) {
      this.trigger.addEventListener('mouseenter', this._handleTriggerMouseEnter);
      this.trigger.addEventListener('mouseleave', this._handleTriggerMouseLeave);
    }

    // 트리거에 속성 추가
    this.trigger.setAttribute('aria-haspopup', 'true');
    this.trigger.setAttribute('aria-expanded', 'false');
    this.trigger.setAttribute('data-dropdown-id', this.id);

    // 메뉴 생성
    this._createMenu();
  }

  /**
   * 메뉴 생성
   * @private
   */
  _createMenu() {
    this.menu = document.createElement('div');
    this.menu.className = 'dropdown';
    this.menu.id = this.id;
    this.menu.setAttribute('role', 'menu');
    this.menu.setAttribute('aria-hidden', 'true');
    this.menu.style.position = 'absolute';
    this.menu.style.zIndex = '1000';

    // 아이템 추가
    this._renderItems();

    // body에 추가 (숨김 상태)
    this.menu.style.display = 'none';
    document.body.appendChild(this.menu);
  }

  /**
   * 아이템 렌더링
   * @private
   */
  _renderItems() {
    this.menu.innerHTML = '';

    this.options.items.forEach((item, index) => {
      if (item.divider) {
        // 구분선
        const divider = document.createElement('div');
        divider.className = 'dropdown__divider';
        divider.setAttribute('role', 'separator');
        this.menu.appendChild(divider);
      } else {
        // 메뉴 아이템
        const menuItem = document.createElement('button');
        menuItem.className = 'dropdown__item';
        menuItem.setAttribute('role', 'menuitem');
        menuItem.setAttribute('type', 'button');
        menuItem.setAttribute('data-index', index);

        if (item.disabled) {
          menuItem.classList.add('dropdown__item--disabled');
          menuItem.setAttribute('disabled', 'true');
        }

        // 아이콘
        if (item.icon) {
          const icon = document.createElement('i');
          icon.className = 'material-icons-outlined dropdown__item-icon';
          icon.textContent = item.icon;
          menuItem.appendChild(icon);
        }

        // 텍스트
        const text = document.createElement('span');
        text.className = 'dropdown__item-text';
        text.textContent = item.text || '';
        menuItem.appendChild(text);

        // 클릭 이벤트
        if (!item.disabled && item.action) {
          menuItem.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (typeof item.action === 'function') {
              item.action(item, index);
            }

            // onSelect 콜백
            if (typeof this.options.onSelect === 'function') {
              this.options.onSelect(item, index);
            }

            // 클릭 후 닫기
            if (this.options.closeOnClick) {
              this.hide();
            }
          });
        }

        this.menu.appendChild(menuItem);
      }
    });
  }

  /**
   * 트리거 클릭 핸들러
   * @private
   */
  _handleTriggerClick(e) {
    e.preventDefault();
    e.stopPropagation();
    this.toggle();
  }

  /**
   * 트리거 mouseenter 핸들러
   * @private
   */
  _handleTriggerMouseEnter() {
    // 이전 타이머 클리어
    if (this.hoverTimer) {
      clearTimeout(this.hoverTimer);
    }

    // 지연 후 열기
    this.hoverTimer = setTimeout(() => {
      if (!this.isOpen) {
        this.show();
      }
    }, this.options.hoverDelay);
  }

  /**
   * 트리거 mouseleave 핸들러
   * @private
   */
  _handleTriggerMouseLeave() {
    // 타이머 클리어
    if (this.hoverTimer) {
      clearTimeout(this.hoverTimer);
      this.hoverTimer = null;
    }

    // 메뉴가 열려있으면 타이머 후 닫기
    if (this.isOpen) {
      this.hoverTimer = setTimeout(() => {
        this.hide();
      }, 300);
    }
  }

  /**
   * 메뉴 mouseenter 핸들러
   * @private
   */
  _handleMenuMouseEnter() {
    // 닫기 타이머 클리어 (메뉴 위에 있으면 닫지 않음)
    if (this.hoverTimer) {
      clearTimeout(this.hoverTimer);
      this.hoverTimer = null;
    }
  }

  /**
   * 메뉴 mouseleave 핸들러
   * @private
   */
  _handleMenuMouseLeave() {
    // 메뉴에서 벗어나면 닫기
    this.hoverTimer = setTimeout(() => {
      this.hide();
    }, 300);
  }

  /**
   * 외부 클릭 핸들러
   * @private
   */
  _handleOutsideClick(e) {
    if (!this.options.closeOnOutside) return;

    if (!this.menu.contains(e.target) && !this.trigger.contains(e.target)) {
      this.hide();
    }
  }

  /**
   * 키보드 핸들러
   * @private
   */
  _handleKeydown(e) {
    if (!this.options.keyboard) return;

    const items = this.menu.querySelectorAll('.dropdown__item:not(.dropdown__item--disabled)');

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        this.hide();
        this.trigger.focus();
        break;

      case 'ArrowDown':
        e.preventDefault();
        this.currentIndex = (this.currentIndex + 1) % items.length;
        items[this.currentIndex].focus();
        break;

      case 'ArrowUp':
        e.preventDefault();
        this.currentIndex = this.currentIndex <= 0 ? items.length - 1 : this.currentIndex - 1;
        items[this.currentIndex].focus();
        break;

      case 'Home':
        e.preventDefault();
        this.currentIndex = 0;
        items[0].focus();
        break;

      case 'End':
        e.preventDefault();
        this.currentIndex = items.length - 1;
        items[this.currentIndex].focus();
        break;

      case 'Tab':
        this.hide();
        break;
    }
  }

  /**
   * 리사이즈 핸들러
   * @private
   */
  _handleResize() {
    if (this.isOpen) {
      this._positionMenu();
    }
  }

  /**
   * 메뉴 위치 계산
   * @private
   */
  _positionMenu() {
    const triggerRect = this.trigger.getBoundingClientRect();
    const menuRect = this.menu.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    let top, left;

    // position에 따른 기본 위치 계산
    switch (this.options.position) {
      case 'top':
        top = triggerRect.top - menuRect.height - this.options.offset;
        left = this._calculateAlignPosition(triggerRect, menuRect);
        break;

      case 'bottom':
        top = triggerRect.bottom + this.options.offset;
        left = this._calculateAlignPosition(triggerRect, menuRect);
        break;

      case 'left':
        top = this._calculateAlignPosition(triggerRect, menuRect, true);
        left = triggerRect.left - menuRect.width - this.options.offset;
        break;

      case 'right':
        top = this._calculateAlignPosition(triggerRect, menuRect, true);
        left = triggerRect.right + this.options.offset;
        break;

      default:
        top = triggerRect.bottom + this.options.offset;
        left = this._calculateAlignPosition(triggerRect, menuRect);
    }

    // 화면 경계 체크 및 조정
    // 오른쪽 경계
    if (left + menuRect.width > viewport.width) {
      left = viewport.width - menuRect.width - 10;
    }
    // 왼쪽 경계
    if (left < 10) {
      left = 10;
    }
    // 하단 경계
    if (top + menuRect.height > viewport.height) {
      top = triggerRect.top - menuRect.height - this.options.offset;
    }
    // 상단 경계
    if (top < 10) {
      top = 10;
    }

    // 스크롤 위치 반영
    this.menu.style.top = `${top + window.scrollY}px`;
    this.menu.style.left = `${left + window.scrollX}px`;
  }

  /**
   * 정렬 위치 계산
   * @private
   */
  _calculateAlignPosition(triggerRect, menuRect, isVertical = false) {
    const triggerSize = isVertical ? triggerRect.height : triggerRect.width;
    const menuSize = isVertical ? menuRect.height : menuRect.width;
    const triggerStart = isVertical ? triggerRect.top : triggerRect.left;

    switch (this.options.align) {
      case 'center':
        return triggerStart + (triggerSize - menuSize) / 2;
      case 'end':
        return triggerStart + triggerSize - menuSize;
      case 'start':
      default:
        return triggerStart;
    }
  }

  /**
   * 메뉴 표시
   */
  show() {
    if (this.isOpen) return;

    this.isOpen = true;
    this.menu.style.display = 'block';

    // 위치 계산
    this._positionMenu();

    // 애니메이션
    if (this.options.animation) {
      this.menu.classList.add('dropdown--opening');
      setTimeout(() => {
        this.menu.classList.remove('dropdown--opening');
        this.menu.classList.add('dropdown--open');
      }, 10);
    } else {
      this.menu.classList.add('dropdown--open');
    }

    // 속성 업데이트
    this.trigger.setAttribute('aria-expanded', 'true');
    this.menu.setAttribute('aria-hidden', 'false');

    // 이벤트 리스너 추가
    setTimeout(() => {
      document.addEventListener('click', this._handleOutsideClick);
      document.addEventListener('keydown', this._handleKeydown);
      window.addEventListener('resize', this._handleResize);

      // hover 옵션이 활성화되면 메뉴에도 hover 이벤트 추가
      if (this.options.openOnHover) {
        this.menu.addEventListener('mouseenter', this._handleMenuMouseEnter);
        this.menu.addEventListener('mouseleave', this._handleMenuMouseLeave);
      }
    }, 0);

    // 첫 번째 아이템에 포커스
    this.currentIndex = -1;
    const firstItem = this.menu.querySelector('.dropdown__item:not(.dropdown__item--disabled)');
    if (firstItem && this.options.keyboard) {
      firstItem.focus();
      this.currentIndex = 0;
    }

    // 콜백
    if (typeof this.options.onShow === 'function') {
      this.options.onShow(this);
    }

    // 이벤트 발생
    this.eventBus.emit('imcat:dropdownshow', { dropdown: this });
  }

  /**
   * 메뉴 숨김
   */
  hide() {
    if (!this.isOpen) return;

    this.isOpen = false;

    // 포커스 관리 (aria-hidden 경고 방지)
    const focusedElement = this.menu.querySelector(':focus');
    if (focusedElement) {
      focusedElement.blur();  // 포커스 제거
      this.trigger.focus();   // 트리거로 포커스 이동
    }

    // 속성 업데이트 (포커스 제거 후 설정)
    this.trigger.setAttribute('aria-expanded', 'false');
    this.menu.setAttribute('aria-hidden', 'true');

    // 애니메이션
    if (this.options.animation) {
      this.menu.classList.remove('dropdown--open');
      this.menu.classList.add('dropdown--closing');

      setTimeout(() => {
        this.menu.style.display = 'none';
        this.menu.classList.remove('dropdown--closing');
      }, this.options.animationDuration);
    } else {
      this.menu.style.display = 'none';
      this.menu.classList.remove('dropdown--open');
    }

    // 이벤트 리스너 제거
    document.removeEventListener('click', this._handleOutsideClick);
    document.removeEventListener('keydown', this._handleKeydown);
    window.removeEventListener('resize', this._handleResize);

    // hover 이벤트 리스너 제거
    if (this.options.openOnHover) {
      this.menu.removeEventListener('mouseenter', this._handleMenuMouseEnter);
      this.menu.removeEventListener('mouseleave', this._handleMenuMouseLeave);
    }

    // hover 타이머 클리어
    if (this.hoverTimer) {
      clearTimeout(this.hoverTimer);
      this.hoverTimer = null;
    }

    // 인덱스 리셋
    this.currentIndex = -1;

    // 콜백
    if (typeof this.options.onHide === 'function') {
      this.options.onHide(this);
    }

    // 이벤트 발생
    this.eventBus.emit('imcat:dropdownhide', { dropdown: this });
  }

  /**
   * 토글
   */
  toggle() {
    if (this.isOpen) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * 메뉴 아이템 업데이트
   * @param {Array} items - 새로운 아이템 배열
   */
  updateItems(items) {
    this.options.items = items;
    this._renderItems();
  }

  /**
   * 정리 (메모리 관리)
   */
  destroy() {
    // 열려있으면 닫기
    if (this.isOpen) {
      this.hide();
    }

    // 이벤트 리스너 제거
    this.trigger.removeEventListener('click', this._handleTriggerClick);

    // hover 이벤트 리스너 제거
    if (this.options.openOnHover) {
      this.trigger.removeEventListener('mouseenter', this._handleTriggerMouseEnter);
      this.trigger.removeEventListener('mouseleave', this._handleTriggerMouseLeave);
      if (this.menu) {
        this.menu.removeEventListener('mouseenter', this._handleMenuMouseEnter);
        this.menu.removeEventListener('mouseleave', this._handleMenuMouseLeave);
      }
    }

    document.removeEventListener('click', this._handleOutsideClick);
    document.removeEventListener('keydown', this._handleKeydown);
    window.removeEventListener('resize', this._handleResize);

    // hover 타이머 클리어
    if (this.hoverTimer) {
      clearTimeout(this.hoverTimer);
      this.hoverTimer = null;
    }

    // DOM 요소 제거
    if (this.menu && this.menu.parentNode) {
      this.menu.parentNode.removeChild(this.menu);
    }

    // 트리거 속성 제거
    this.trigger.removeAttribute('aria-haspopup');
    this.trigger.removeAttribute('aria-expanded');
    this.trigger.removeAttribute('data-dropdown-id');

    // 참조 해제
    this.trigger = null;
    this.menu = null;
    this.eventBus = null;

    // 콜백
    if (typeof this.options.onDestroy === 'function') {
      this.options.onDestroy();
    }
  }
}

export default Dropdown;
