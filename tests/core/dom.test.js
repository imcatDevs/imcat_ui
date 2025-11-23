/**
 * DOM Module 테스트
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DOM } from '../../src/core/dom.js';

describe('DOM Module', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('DOM.select()', () => {
    it('CSS 선택자로 요소를 선택해야 함', () => {
      document.body.innerHTML = '<div id="test">Test</div>';
      const el = DOM.select('#test');
      expect(el.length).toBe(1);
      expect(el.get(0).id).toBe('test');
    });

    it('여러 요소를 선택할 수 있어야 함', () => {
      document.body.innerHTML = '<div class="item"></div><div class="item"></div>';
      const els = DOM.select('.item');
      expect(els.length).toBe(2);
    });

    it('HTMLElement를 전달받을 수 있어야 함', () => {
      const div = document.createElement('div');
      const el = DOM.select(div);
      expect(el.length).toBe(1);
      expect(el.get(0)).toBe(div);
    });

    it('존재하지 않는 요소는 빈 배열을 반환해야 함', () => {
      const el = DOM.select('.non-existent');
      expect(el.length).toBe(0);
    });
  });

  describe('DOM.create()', () => {
    it('새 요소를 생성해야 함', () => {
      const el = DOM.create('div');
      expect(el.get(0).tagName).toBe('DIV');
    });

    it('클래스를 지정할 수 있어야 함', () => {
      const el = DOM.create('div', { class: 'test-class' });
      expect(el.hasClass('test-class')).toBe(true);
    });

    it('텍스트를 지정할 수 있어야 함', () => {
      const el = DOM.create('p', { text: 'Hello' });
      expect(el.text()).toBe('Hello');
    });

    it('HTML을 지정할 수 있어야 함', () => {
      const el = DOM.create('div', { html: '<span>Test</span>' });
      expect(el.html()).toContain('<span>Test</span>');
    });

    it('속성을 자동으로 이스케이프해야 함', () => {
      const el = DOM.create('div', { title: '<script>alert(1)</script>' });
      const title = el.attr('title');
      expect(title).toContain('&lt;');
      expect(title).not.toContain('<script>');
    });
  });

  describe('클래스 조작', () => {
    let el;

    beforeEach(() => {
      document.body.innerHTML = '<div id="test"></div>';
      el = DOM.select('#test');
    });

    it('addClass() - 클래스를 추가해야 함', () => {
      el.addClass('active');
      expect(el.hasClass('active')).toBe(true);
    });

    it('removeClass() - 클래스를 제거해야 함', () => {
      el.addClass('active');
      el.removeClass('active');
      expect(el.hasClass('active')).toBe(false);
    });

    it('toggleClass() - 클래스를 토글해야 함', () => {
      el.toggleClass('active');
      expect(el.hasClass('active')).toBe(true);
      el.toggleClass('active');
      expect(el.hasClass('active')).toBe(false);
    });

    it('hasClass() - 클래스 포함 여부를 확인해야 함', () => {
      expect(el.hasClass('active')).toBe(false);
      el.addClass('active');
      expect(el.hasClass('active')).toBe(true);
    });
  });

  describe('텍스트 및 HTML', () => {
    let el;

    beforeEach(() => {
      document.body.innerHTML = '<div id="test"></div>';
      el = DOM.select('#test');
    });

    it('text() - 텍스트를 설정하고 가져와야 함', () => {
      el.text('Hello World');
      expect(el.text()).toBe('Hello World');
    });

    it('text() - XSS를 자동으로 이스케이프해야 함', () => {
      el.text('<script>alert(1)</script>');
      expect(el.text()).toContain('&lt;');
      expect(el.get(0).innerHTML).not.toContain('<script>');
    });

    it('html() - HTML을 설정하고 가져와야 함', () => {
      el.html('<span>Test</span>');
      expect(el.html()).toContain('<span>Test</span>');
    });

    it('html() - 위험한 태그를 제거해야 함', () => {
      el.html('<script>alert(1)</script><p>Safe</p>');
      expect(el.html()).not.toContain('<script>');
      expect(el.html()).toContain('<p>Safe</p>');
    });
  });

  describe('속성 조작', () => {
    let el;

    beforeEach(() => {
      document.body.innerHTML = '<div id="test"></div>';
      el = DOM.select('#test');
    });

    it('attr() - 속성을 설정하고 가져와야 함', () => {
      el.attr('title', 'Test Title');
      expect(el.attr('title')).toBe('Test Title');
    });

    it('removeAttr() - 속성을 제거해야 함', () => {
      el.attr('title', 'Test');
      el.removeAttr('title');
      expect(el.attr('title')).toBeNull();
    });

    it('data() - 데이터 속성을 설정하고 가져와야 함', () => {
      el.data('id', '123');
      expect(el.data('id')).toBe('123');
    });
  });

  describe('CSS 스타일', () => {
    let el;

    beforeEach(() => {
      document.body.innerHTML = '<div id="test"></div>';
      el = DOM.select('#test');
    });

    it('css() - 단일 스타일을 설정해야 함', () => {
      el.css('color', 'red');
      expect(el.get(0).style.color).toBe('red');
    });

    it('css() - 여러 스타일을 설정해야 함', () => {
      el.css({ color: 'red', fontSize: '16px' });
      expect(el.get(0).style.color).toBe('red');
      expect(el.get(0).style.fontSize).toBe('16px');
    });

    it('css() - 위험한 CSS를 제거해야 함', () => {
      el.css('background', 'url(javascript:alert(1))');
      expect(el.get(0).style.background).not.toContain('javascript:');
    });
  });

  describe('이벤트', () => {
    let el;

    beforeEach(() => {
      document.body.innerHTML = '<div id="test"><button class="btn">Click</button></div>';
      el = DOM.select('#test');
    });

    it('on() - 이벤트 리스너를 추가해야 함', () => {
      const handler = vi.fn();
      el.on('click', handler);
      el.get(0).click();
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('on() - 이벤트 위임을 지원해야 함', () => {
      const handler = vi.fn();
      el.on('click', '.btn', handler);
      el.find('.btn').get(0).click();
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('off() - 이벤트 리스너를 제거해야 함', () => {
      const handler = vi.fn();
      el.on('click', handler);
      el.off('click', handler);
      el.get(0).click();
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('표시/숨김', () => {
    let el;

    beforeEach(() => {
      document.body.innerHTML = '<div id="test">Test</div>';
      el = DOM.select('#test');
    });

    it('show() - 요소를 보여야 함', () => {
      el.hide();
      el.show();
      expect(el.get(0).style.display).toBe('');
    });

    it('hide() - 요소를 숨겨야 함', () => {
      el.hide();
      expect(el.get(0).style.display).toBe('none');
    });

    it('toggle() - 표시를 토글해야 함', () => {
      el.toggle();
      expect(el.get(0).style.display).toBe('none');
      el.toggle();
      expect(el.get(0).style.display).toBe('');
    });
  });

  describe('DOM 조작', () => {
    let el;

    beforeEach(() => {
      document.body.innerHTML = '<div id="test"></div>';
      el = DOM.select('#test');
    });

    it('append() - 자식 요소를 추가해야 함', () => {
      el.append('<span>Child</span>');
      expect(el.html()).toContain('<span>Child</span>');
    });

    it('prepend() - 자식 요소를 앞에 추가해야 함', () => {
      el.html('<span>Second</span>');
      el.prepend('<span>First</span>');
      expect(el.get(0).firstChild.textContent).toBe('First');
    });

    it('appendTo() - 부모에 추가해야 함', () => {
      const child = DOM.create('span', { text: 'Child' });
      child.appendTo('#test');
      expect(el.html()).toContain('<span>Child</span>');
    });

    it('remove() - 요소를 제거해야 함', () => {
      el.remove();
      expect(document.querySelector('#test')).toBeNull();
    });

    it('empty() - 내용을 비워야 함', () => {
      el.html('<span>Content</span>');
      el.empty();
      expect(el.html()).toBe('');
    });
  });

  describe('탐색', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div id="parent">
          <div class="child">
            <span class="nested">Nested</span>
          </div>
          <div class="child"></div>
        </div>
      `;
    });

    it('find() - 하위 요소를 찾아야 함', () => {
      const parent = DOM.select('#parent');
      const children = parent.find('.child');
      expect(children.length).toBe(2);
    });

    it('parent() - 부모 요소를 찾아야 함', () => {
      const child = DOM.select('.child');
      const parent = child.parent();
      expect(parent.get(0).id).toBe('parent');
    });

    it('closest() - 가장 가까운 조상을 찾아야 함', () => {
      const nested = DOM.select('.nested');
      const parent = nested.closest('#parent');
      expect(parent.get(0).id).toBe('parent');
    });

    it('siblings() - 형제 요소를 찾아야 함', () => {
      const first = DOM.select('.child').first();
      const siblings = first.siblings();
      expect(siblings.length).toBe(1);
    });

    it('next() - 다음 형제를 찾아야 함', () => {
      const first = DOM.select('.child').first();
      const next = first.next();
      expect(next.hasClass('child')).toBe(true);
    });

    it('first() - 첫 번째 요소를 반환해야 함', () => {
      const children = DOM.select('.child');
      const first = children.first();
      expect(first.length).toBe(1);
    });

    it('last() - 마지막 요소를 반환해야 함', () => {
      const children = DOM.select('.child');
      const last = children.last();
      expect(last.length).toBe(1);
    });

    it('eq() - 특정 인덱스 요소를 반환해야 함', () => {
      const children = DOM.select('.child');
      const second = children.eq(1);
      expect(second.length).toBe(1);
    });
  });

  describe('체이닝', () => {
    it('여러 메서드를 체이닝할 수 있어야 함', () => {
      document.body.innerHTML = '<div id="test"></div>';
      DOM.select('#test')
        .addClass('active')
        .text('Hello')
        .attr('title', 'Test')
        .css('color', 'red');

      const el = document.querySelector('#test');
      expect(el.classList.contains('active')).toBe(true);
      expect(el.textContent).toBe('Hello');
      expect(el.getAttribute('title')).toBe('Test');
      expect(el.style.color).toBe('red');
    });
  });

  describe('each()', () => {
    it('각 요소에 함수를 실행해야 함', () => {
      document.body.innerHTML = '<div class="item"></div><div class="item"></div>';
      const items = DOM.select('.item');
      const indices = [];
      
      items.each((el, index) => {
        indices.push(index);
      });

      expect(indices).toEqual([0, 1]);
    });
  });

  describe('DOM.ready()', () => {
    it('DOM 준비 완료 시 콜백을 실행해야 함', () => {
      const callback = vi.fn();
      DOM.ready(callback);
      // readyState가 이미 complete이므로 즉시 실행됨
      expect(callback).toHaveBeenCalled();
    });
  });
});
