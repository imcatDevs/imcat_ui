/**
 * Template Module 테스트
 */

import { describe, it, expect } from 'vitest';
import { Template } from '../../src/core/template.js';

describe('Template Module', () => {
  describe('render()', () => {
    it('기본 렌더링을 수행해야 함', () => {
      const html = Template.render('Hello {{name}}!', { name: 'John' });
      expect(html).toBe('Hello John!');
    });

    it('여러 플레이스홀더를 치환해야 함', () => {
      const html = Template.render(
        '{{name}} is {{age}} years old',
        { name: 'John', age: 30 }
      );
      expect(html).toBe('John is 30 years old');
    });

    it('undefined 값은 빈 문자열로 치환해야 함', () => {
      const html = Template.render('{{name}} {{missing}}', { name: 'John' });
      expect(html).toBe('John ');
    });

    it('null 값은 빈 문자열로 치환해야 함', () => {
      const html = Template.render('{{name}}', { name: null });
      expect(html).toBe('');
    });

    it('XSS 공격을 자동으로 방어해야 함', () => {
      const html = Template.render('{{userInput}}', { 
        userInput: '<script>alert("XSS")</script>' 
      });
      
      expect(html).not.toContain('<script>');
      expect(html).toContain('&lt;');
      expect(html).toContain('&gt;');
    });

    it('HTML 특수 문자를 이스케이프해야 함', () => {
      const html = Template.render('{{html}}', { 
        html: '<b>Bold</b> & text' 
      });
      
      expect(html).toContain('&lt;b&gt;');
      expect(html).toContain('&amp;');
      expect(html).toContain('Bold');
    });

    it('숫자를 문자열로 변환해야 함', () => {
      const html = Template.render('{{count}}', { count: 42 });
      expect(html).toBe('42');
    });

    it('빈 템플릿을 처리해야 함', () => {
      const html = Template.render('', { name: 'John' });
      expect(html).toBe('');
    });

    it('데이터 없이도 동작해야 함', () => {
      const html = Template.render('Hello World');
      expect(html).toBe('Hello World');
    });

    it('잘못된 템플릿 타입을 처리해야 함', () => {
      const html = Template.render(null, { name: 'John' });
      expect(html).toBe('');
    });
  });

  describe('renderRaw()', () => {
    it('이스케이프 없이 렌더링해야 함', () => {
      const html = Template.renderRaw('{{content}}', { 
        content: '<b>Bold</b>' 
      });
      expect(html).toBe('<b>Bold</b>');
    });

    it('HTML 태그를 그대로 유지해야 함', () => {
      const html = Template.renderRaw('{{html}}', { 
        html: '<script>alert(1)</script>' 
      });
      expect(html).toBe('<script>alert(1)</script>');
    });

    it('undefined 값은 빈 문자열로 치환해야 함', () => {
      const html = Template.renderRaw('{{missing}}', {});
      expect(html).toBe('');
    });
  });

  describe('if()', () => {
    it('조건이 true일 때 렌더링해야 함', () => {
      const html = Template.if(true, 'Hello {{name}}', { name: 'John' });
      expect(html).toBe('Hello John');
    });

    it('조건이 false일 때 빈 문자열을 반환해야 함', () => {
      const html = Template.if(false, 'Hello {{name}}', { name: 'John' });
      expect(html).toBe('');
    });

    it('truthy 값을 처리해야 함', () => {
      expect(Template.if(1, 'Show')).toBe('Show');
      expect(Template.if('text', 'Show')).toBe('Show');
      expect(Template.if({}, 'Show')).toBe('Show');
    });

    it('falsy 값을 처리해야 함', () => {
      expect(Template.if(0, 'Show')).toBe('');
      expect(Template.if('', 'Show')).toBe('');
      expect(Template.if(null, 'Show')).toBe('');
      expect(Template.if(undefined, 'Show')).toBe('');
    });

    it('데이터 없이도 동작해야 함', () => {
      const html = Template.if(true, 'Static text');
      expect(html).toBe('Static text');
    });
  });

  describe('each()', () => {
    it('배열의 각 아이템을 렌더링해야 함', () => {
      const items = [
        { name: 'John', age: 30 },
        { name: 'Jane', age: 25 }
      ];

      const html = Template.each(items, '<li>{{name}} ({{age}})</li>');
      expect(html).toBe('<li>John (30)</li><li>Jane (25)</li>');
    });

    it('빈 배열은 빈 문자열을 반환해야 함', () => {
      const html = Template.each([], '<li>{{name}}</li>');
      expect(html).toBe('');
    });

    it('배열이 아닌 값은 빈 문자열을 반환해야 함', () => {
      expect(Template.each(null, '<li>{{name}}</li>')).toBe('');
      expect(Template.each(undefined, '<li>{{name}}</li>')).toBe('');
      expect(Template.each('not array', '<li>{{name}}</li>')).toBe('');
      expect(Template.each({}, '<li>{{name}}</li>')).toBe('');
    });

    it('단일 아이템 배열을 처리해야 함', () => {
      const items = [{ name: 'John' }];
      const html = Template.each(items, '<li>{{name}}</li>');
      expect(html).toBe('<li>John</li>');
    });

    it('복잡한 템플릿을 처리해야 함', () => {
      const items = [
        { id: 1, title: 'Task 1', done: 'Yes' },
        { id: 2, title: 'Task 2', done: 'No' }
      ];

      const html = Template.each(items, `
        <div data-id="{{id}}">
          <h3>{{title}}</h3>
          <p>Done: {{done}}</p>
        </div>
      `);

      expect(html).toContain('data-id="1"');
      expect(html).toContain('Task 1');
      expect(html).toContain('data-id="2"');
      expect(html).toContain('Task 2');
    });
  });

  describe('compile()', () => {
    it('재사용 가능한 함수를 생성해야 함', () => {
      const greeting = Template.compile('Hello {{name}}!');

      expect(greeting({ name: 'John' })).toBe('Hello John!');
      expect(greeting({ name: 'Jane' })).toBe('Hello Jane!');
    });

    it('복잡한 템플릿을 컴파일해야 함', () => {
      const userCard = Template.compile(`
        <div class="card">
          <h3>{{name}}</h3>
          <p>{{email}}</p>
          <p>Age: {{age}}</p>
        </div>
      `);

      const html = userCard({ 
        name: 'John', 
        email: 'john@example.com',
        age: 30 
      });

      expect(html).toContain('<h3>John</h3>');
      expect(html).toContain('john@example.com');
      expect(html).toContain('Age: 30');
    });

    it('데이터 없이도 호출 가능해야 함', () => {
      const template = Template.compile('Static text');
      expect(template()).toBe('Static text');
    });
  });

  describe('실전 시나리오', () => {
    it('사용자 카드 렌더링', () => {
      const user = {
        name: 'John Doe',
        email: 'john@example.com',
        role: 'Admin',
        isActive: true
      };

      const html = Template.render(`
        <div class="user-card">
          <h3>{{name}}</h3>
          <p>{{email}}</p>
          <p>Role: {{role}}</p>
          ${Template.if(user.isActive, '<span class="badge">Active</span>')}
        </div>
      `, user);

      expect(html).toContain('John Doe');
      expect(html).toContain('john@example.com');
      expect(html).toContain('Role: Admin');
      expect(html).toContain('Active');
    });

    it('제품 목록 렌더링', () => {
      const products = [
        { id: 1, name: 'Laptop', price: '1,200,000', inStock: true },
        { id: 2, name: 'Mouse', price: '30,000', inStock: false },
        { id: 3, name: 'Keyboard', price: '80,000', inStock: true }
      ];

      const html = `
        <div class="products">
          ${Template.each(products, `
            <div class="product" data-id="{{id}}">
              <h4>{{name}}</h4>
              <p class="price">₩{{price}}</p>
            </div>
          `)}
        </div>
      `;

      expect(html).toContain('Laptop');
      expect(html).toContain('₩1,200,000');
      expect(html).toContain('Mouse');
      expect(html).toContain('₩30,000');
      expect(html).toContain('Keyboard');
    });

    it('조건부 알림 렌더링', () => {
      const notification = {
        type: 'error',
        message: 'Something went wrong',
        hasDetails: true,
        details: 'Network timeout'
      };

      const html = Template.render(`
        <div class="alert alert-{{type}}">
          <p>{{message}}</p>
          ${Template.if(notification.hasDetails, '<p class="details">{{details}}</p>', notification)}
        </div>
      `, notification);

      expect(html).toContain('alert-error');
      expect(html).toContain('Something went wrong');
      expect(html).toContain('Network timeout');
    });

    it('테이블 행 렌더링', () => {
      const users = [
        { id: 1, name: 'John', email: 'john@ex.com' },
        { id: 2, name: 'Jane', email: 'jane@ex.com' }
      ];

      const tbody = Template.each(users, `
        <tr data-id="{{id}}">
          <td>{{id}}</td>
          <td>{{name}}</td>
          <td>{{email}}</td>
        </tr>
      `);

      expect(tbody).toContain('<tr data-id="1">');
      expect(tbody).toContain('<td>John</td>');
      expect(tbody).toContain('<td>john@ex.com</td>');
    });

    it('XSS 방어 시나리오', () => {
      const comment = {
        author: '<script>alert("XSS")</script>',
        text: '<img src=x onerror=alert(1)>',
        date: '2025-11-23'
      };

      const html = Template.render(`
        <div class="comment">
          <strong>{{author}}</strong>
          <p>{{text}}</p>
          <time>{{date}}</time>
        </div>
      `, comment);

      // 스크립트 태그가 이스케이프되었는지 확인
      expect(html).not.toContain('<script>');
      expect(html).not.toContain('<img');
      expect(html).toContain('&lt;');
      expect(html).toContain('&gt;');
      
      // 정상 데이터는 그대로
      expect(html).toContain('2025-11-23');
    });
  });
});
