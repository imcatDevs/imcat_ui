/**
 * DOM 조작 유틸리티
 * @module core/dom
 */

import { Security } from './security.js';

/**
 * DOM Element Wrapper
 * @class
 * @description jQuery 스타일의 체이닝 가능한 DOM 조작 API를 제공하는 래퍼 클래스입니다.
 * 하나 또는 여러 개의 DOM 요소를 감싸서 편리한 메서드 체이닝을 제공합니다.
 * 
 * @example
 * // jQuery 스타일 체이닝
 * new DOMElement(element)
 *   .addClass('active')
 *   .text('Hello')
 *   .on('click', handler);
 */
class DOMElement {
  /**
   * DOMElement 생성자
   * @constructor
   * @param {HTMLElement|HTMLElement[]} elements - DOM 요소 또는 요소 배열
   * 
   * @example
   * const elem = new DOMElement(document.getElementById('app'));
   * 
   * @example
   * const elems = new DOMElement(document.querySelectorAll('.item'));
   */
  constructor(elements) {
    this.elements = Array.isArray(elements) ? elements : [elements];
    this.length = this.elements.length;
  }

  /**
   * 각 요소에 대해 함수 실행
   * @param {Function} callback - 콜백 함수 (element, index)
   * @returns {DOMElement} 체이닝을 위한 this
   */
  each(callback) {
    this.elements.forEach((el, index) => callback.call(el, el, index));
    return this;
  }

  /**
   * 클래스 추가
   * @param {string} className - CSS 클래스 이름
   * @returns {DOMElement}
   */
  addClass(className) {
    return this.each(el => el.classList.add(className));
  }

  /**
   * 클래스 제거
   * @param {string} className - CSS 클래스 이름
   * @returns {DOMElement}
   */
  removeClass(className) {
    return this.each(el => el.classList.remove(className));
  }

  /**
   * 클래스 토글
   * @param {string} className - CSS 클래스 이름
   * @returns {DOMElement}
   */
  toggleClass(className) {
    return this.each(el => el.classList.toggle(className));
  }

  /**
   * 클래스 포함 여부
   * @param {string} className - CSS 클래스 이름
   * @returns {boolean}
   */
  hasClass(className) {
    return this.elements.some(el => el.classList.contains(className));
  }

  /**
   * 텍스트 설정/조회
   * @param {string} [value] - 설정할 텍스트
   * @returns {string|DOMElement}
   * 
   * @note textContent는 브라우저에서 자동으로 안전하게 처리됨
   * (HTML 태그가 텍스트로 표시됨, XSS 위험 없음)
   */
  text(value) {
    if (value === undefined) {
      return this.elements[0]?.textContent || '';
    }
    // textContent는 자동으로 안전함 (HTML 파싱 안 함)
    return this.each(el => el.textContent = value);
  }

  /**
   * HTML 설정/조회 (자동 새니타이징)
   * @param {string} [value] - 설정할 HTML
   * @returns {string|DOMElement}
   */
  html(value) {
    if (value === undefined) {
      return this.elements[0]?.innerHTML || '';
    }
    // 자동 새니타이징
    const sanitized = Security.sanitize(value);
    return this.each(el => el.innerHTML = sanitized);
  }

  /**
   * 원본 HTML 설정 (새니타이징 없음)
   * 주의: 신뢰할 수 있는 소스에서만 사용!
   * @param {string} value - HTML
   * @returns {DOMElement}
   */
  rawHtml(value) {
    return this.each(el => el.innerHTML = value);
  }

  /**
   * 속성 설정/조회 (자동 이스케이프)
   * @param {string} name - 속성 이름
   * @param {string} [value] - 속성 값
   * @returns {string|DOMElement}
   */
  attr(name, value) {
    if (value === undefined) {
      return this.elements[0]?.getAttribute(name);
    }
    // 자동 이스케이프
    const escaped = Security.escape(value);
    return this.each(el => el.setAttribute(name, escaped));
  }

  /**
   * 속성 제거
   * @param {string} name - 속성 이름
   * @returns {DOMElement}
   */
  removeAttr(name) {
    return this.each(el => el.removeAttribute(name));
  }

  /**
   * 데이터 속성 설정/조회
   * @param {string} key - 데이터 키
   * @param {*} [value] - 데이터 값
   * @returns {*|DOMElement}
   */
  data(key, value) {
    if (value === undefined) {
      return this.elements[0]?.dataset[key];
    }
    return this.each(el => el.dataset[key] = value);
  }

  /**
   * CSS 스타일 설정/조회
   * @param {string|Object} property - CSS 속성 이름 또는 속성 객체
   * @param {string} [value] - CSS 값
   * @returns {string|DOMElement}
   */
  css(property, value) {
    if (typeof property === 'object') {
      // 여러 속성 설정
      return this.each(el => {
        Object.entries(property).forEach(([prop, val]) => {
          el.style[prop] = Security.sanitizeCSS(val);
        });
      });
    }

    if (value === undefined) {
      return getComputedStyle(this.elements[0])[property];
    }

    // 위험한 CSS 값 필터링
    const sanitized = Security.sanitizeCSS(value);
    return this.each(el => el.style[property] = sanitized);
  }

  /**
   * 이벤트 리스너 추가
   * @param {string} event - 이벤트 이름
   * @param {string|Function} selector - 선택자 또는 핸들러
   * @param {Function} [handler] - 핸들러
   * @returns {DOMElement}
   * 
   * @example
   * // 직접 바인딩
   * IMCAT('#button').on('click', (e) => console.log('clicked'));
   * 
   * @example
   * // 이벤트 위임 (권장: 동적 요소에 유리)
   * IMCAT('#list').on('click', '.item', (e) => console.log('item clicked'));
   * 
   * @performance
   * - 이벤트 위임 사용 시 메모리 효율적 (리스너 1개로 여러 요소 처리)
   * - _delegates Map으로 off() 시 정확한 cleanup 보장
   */
  on(event, selector, handler) {
    // 인자 처리
    if (typeof selector === 'function') {
      handler = selector;
      selector = null;
    }

    return this.each(el => {
      if (selector) {
        // 이벤트 위임
        const delegateHandler = (e) => {
          const target = e.target.closest(selector);
          if (target && el.contains(target)) {
            handler.call(target, e);
          }
        };
        el.addEventListener(event, delegateHandler);
        // 나중에 제거할 수 있도록 저장
        if (!el._delegates) el._delegates = new Map();
        if (!el._delegates.has(handler)) {
          el._delegates.set(handler, new Map());
        }
        el._delegates.get(handler).set(event, delegateHandler);
      } else {
        el.addEventListener(event, handler);
      }
    });
  }

  /**
   * 이벤트 리스너 제거
   * @param {string} event - 이벤트 이름
   * @param {Function} handler - 핸들러
   * @returns {DOMElement}
   */
  off(event, handler) {
    return this.each(el => {
      if (el._delegates?.has(handler)) {
        const eventMap = el._delegates.get(handler);
        if (eventMap.has(event)) {
          el.removeEventListener(event, eventMap.get(event));
          eventMap.delete(event);
          if (eventMap.size === 0) {
            el._delegates.delete(handler);
          }
        }
      } else {
        el.removeEventListener(event, handler);
      }
    });
  }

  /**
   * 보이기
   * @returns {DOMElement}
   */
  show() {
    return this.each(el => el.style.display = '');
  }

  /**
   * 숨기기
   * @returns {DOMElement}
   */
  hide() {
    return this.each(el => el.style.display = 'none');
  }

  /**
   * 토글
   * @returns {DOMElement}
   */
  toggle() {
    return this.each(el => {
      el.style.display = el.style.display === 'none' ? '' : 'none';
    });
  }

  /**
   * 자식 요소 추가
   * @param {string|HTMLElement|DOMElement} content - 추가할 내용
   * @returns {DOMElement}
   */
  append(content) {
    return this.each(el => {
      if (typeof content === 'string') {
        const sanitized = Security.sanitize(content);
        el.insertAdjacentHTML('beforeend', sanitized);
      } else if (content instanceof DOMElement) {
        content.elements.forEach(child => el.appendChild(child.cloneNode(true)));
      } else if (content instanceof HTMLElement) {
        el.appendChild(content.cloneNode(true));
      }
    });
  }

  /**
   * 자식 요소 앞에 추가
   * @param {string|HTMLElement|DOMElement} content - 추가할 내용
   * @returns {DOMElement}
   */
  prepend(content) {
    return this.each(el => {
      if (typeof content === 'string') {
        const sanitized = Security.sanitize(content);
        el.insertAdjacentHTML('afterbegin', sanitized);
      } else if (content instanceof DOMElement) {
        content.elements.forEach(child => el.insertBefore(child.cloneNode(true), el.firstChild));
      } else if (content instanceof HTMLElement) {
        el.insertBefore(content.cloneNode(true), el.firstChild);
      }
    });
  }

  /**
   * 부모 요소에 추가
   * @param {string|HTMLElement} parent - 부모 선택자 또는 요소
   * @returns {DOMElement}
   */
  appendTo(parent) {
    const parentEl = typeof parent === 'string'
      ? document.querySelector(parent)
      : parent;

    if (parentEl) {
      this.elements.forEach(el => parentEl.appendChild(el));
    }
    return this;
  }

  /**
   * 요소 제거
   * @returns {DOMElement}
   */
  remove() {
    return this.each(el => el.remove());
  }

  /**
   * 내용 비우기
   * @returns {DOMElement}
   */
  empty() {
    return this.each(el => el.innerHTML = '');
  }

  /**
   * 하위 요소 검색
   * @param {string} selector - CSS 선택자
   * @returns {DOMElement}
   */
  find(selector) {
    const found = [];
    this.each(el => {
      found.push(...el.querySelectorAll(selector));
    });
    return new DOMElement(found);
  }

  /**
   * 부모 요소 검색
   * @returns {DOMElement}
   */
  parent() {
    const parents = this.elements.map(el => el.parentElement).filter(Boolean);
    return new DOMElement(parents);
  }

  /**
   * 가장 가까운 조상 요소 검색
   * @param {string} selector - CSS 선택자
   * @returns {DOMElement}
   */
  closest(selector) {
    const found = this.elements.map(el => el.closest(selector)).filter(Boolean);
    return new DOMElement(found);
  }

  /**
   * 형제 요소 검색
   * @returns {DOMElement}
   */
  siblings() {
    const siblings = [];
    this.each(el => {
      const parent = el.parentElement;
      if (parent) {
        Array.from(parent.children).forEach(child => {
          if (child !== el && !siblings.includes(child)) {
            siblings.push(child);
          }
        });
      }
    });
    return new DOMElement(siblings);
  }

  /**
   * 다음 형제 요소
   * @returns {DOMElement}
   */
  next() {
    const next = this.elements.map(el => el.nextElementSibling).filter(Boolean);
    return new DOMElement(next);
  }

  /**
   * 이전 형제 요소
   * @returns {DOMElement}
   */
  prev() {
    const prev = this.elements.map(el => el.previousElementSibling).filter(Boolean);
    return new DOMElement(prev);
  }

  /**
   * 첫 번째 요소
   * @returns {DOMElement}
   */
  first() {
    return new DOMElement(this.elements[0] || []);
  }

  /**
   * 마지막 요소
   * @returns {DOMElement}
   */
  last() {
    return new DOMElement(this.elements[this.elements.length - 1] || []);
  }

  /**
   * 특정 인덱스 요소
   * @param {number} index - 인덱스
   * @returns {DOMElement}
   */
  eq(index) {
    return new DOMElement(this.elements[index] || []);
  }

  /**
   * 원본 DOM 요소 가져오기
   * @param {number} [index] - 인덱스 (없으면 전체 배열)
   * @returns {HTMLElement|HTMLElement[]}
   */
  get(index) {
    return index === undefined ? this.elements : this.elements[index];
  }
}

/**
 * DOM 유틸리티 클래스
 * @class
 * @description DOM 선택, 요소 생성 등의 유틸리티 메서드를 제공합니다.
 * IMCAT() 함수의 기본 구현체입니다.
 * 
 * @example
 * // 요소 선택
 * const element = DOM.select('#app');
 * 
 * @example
 * // 요소 생성
 * const div = DOM.create('div', { class: 'container' });
 */
export class DOM {
  /**
   * 요소 선택
   * @param {string|HTMLElement|DOMElement} selector - 선택자
   * @returns {DOMElement}
   */
  static select(selector) {
    if (!selector) return new DOMElement([]);

    if (typeof selector === 'string') {
      const elements = Array.from(document.querySelectorAll(selector));
      return new DOMElement(elements);
    }

    if (selector instanceof HTMLElement) {
      return new DOMElement([selector]);
    }

    if (selector instanceof DOMElement) {
      return selector;
    }

    return new DOMElement([]);
  }

  /**
   * 새 요소 생성
   * @param {string} tagName - HTML 태그 이름
   * @param {Object} [attributes] - 속성 객체
   * @returns {DOMElement}
   */
  static create(tagName, attributes = {}) {
    const el = document.createElement(tagName);

    Object.entries(attributes).forEach(([key, value]) => {
      if (key === 'class') {
        el.className = value;
      } else if (key === 'html') {
        el.innerHTML = Security.sanitize(value);
      } else if (key === 'text') {
        el.textContent = value;
      } else {
        el.setAttribute(key, Security.escape(value));
      }
    });

    return new DOMElement([el]);
  }

  /**
   * DOM 준비 완료 시 실행
   * @param {Function} callback - 콜백 함수
   */
  static ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }
}

export default DOM;
