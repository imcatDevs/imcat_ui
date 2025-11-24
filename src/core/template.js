/**
 * 템플릿 엔진
 * @module core/template
 */

/**
 * 간단하고 빠른 템플릿 엔진
 * @class
 * @description {{key}} 문법을 사용하는 간단한 템플릿 엔진입니다.
 * 자동 XSS 방어(이스케이프)를 제공하며, 조건부/리스트 렌더링을 지원합니다.
 * 
 * @example
 * const html = Template.render('Hello {{name}}!', { name: 'John' });
 */
export class Template {
  /**
   * 템플릿 렌더링 (자동 XSS 방어)
   * @param {string} template - 템플릿 문자열 ({{key}} 형식)
   * @param {Object} [data={}] - 데이터 객체
   * @returns {string} 렌더링된 HTML
   * 
   * @example
   * const html = Template.render('Hello {{name}}!', { name: 'John' });
   * // 'Hello John!'
   * 
   * @example
   * // XSS 자동 방어
   * const html = Template.render('{{userInput}}', { 
   *   userInput: '<script>alert("XSS")</script>' 
   * });
   * // '&lt;script&gt;alert("XSS")&lt;/script&gt;'
   */
  static render(template, data = {}) {
    if (typeof template !== 'string') {
      return '';
    }

    // {{key}} 형식의 플레이스홀더를 데이터로 치환
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      const value = data[key];
      
      // undefined/null은 빈 문자열로
      if (value === undefined || value === null) {
        return '';
      }
      
      // 자동 이스케이프 (XSS 방어)
      return this._escape(String(value));
    });
  }

  /**
   * 안전하지 않은 렌더링 (이스케이프 없음)
   * 신뢰할 수 있는 HTML만 사용!
   * @param {string} template - 템플릿 문자열
   * @param {Object} [data={}] - 데이터 객체
   * @returns {string} 렌더링된 HTML
   * 
   * @example
   * const html = Template.renderRaw('{{content}}', { 
   *   content: '<b>Bold</b>' 
   * });
   * // '<b>Bold</b>'
   */
  static renderRaw(template, data = {}) {
    if (typeof template !== 'string') {
      return '';
    }

    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      const value = data[key];
      return value !== undefined && value !== null ? String(value) : '';
    });
  }

  /**
   * 조건부 렌더링
   * @param {boolean} condition - 조건
   * @param {string} template - 템플릿 문자열
   * @param {Object} [data={}] - 데이터 객체
   * @returns {string} 렌더링된 HTML 또는 빈 문자열
   * 
   * @example
   * const html = Template.if(user.isAdmin, '<button>Admin Panel</button>', user);
   * 
   * @example
   * const html = Template.if(false, '<button>Hidden</button>');
   * // ''
   */
  static if(condition, template, data = {}) {
    return condition ? this.render(template, data) : '';
  }

  /**
   * 리스트 렌더링
   * @param {Array} items - 아이템 배열
   * @param {string} template - 각 아이템의 템플릿
   * @returns {string} 렌더링된 HTML
   * 
   * @example
   * const users = [
   *   { name: 'John', age: 30 },
   *   { name: 'Jane', age: 25 }
   * ];
   * 
   * const html = Template.each(users, '<li>{{name}} ({{age}})</li>');
   * // '<li>John (30)</li><li>Jane (25)</li>'
   */
  static each(items, template) {
    if (!Array.isArray(items) || items.length === 0) {
      return '';
    }

    return items.map(item => this.render(template, item)).join('');
  }

  /**
   * 템플릿 컴파일 (재사용을 위한 함수 생성)
   * @param {string} template - 템플릿 문자열
   * @returns {Function} 렌더링 함수
   * 
   * @example
   * const greeting = Template.compile('Hello {{name}}!');
   * greeting({ name: 'John' }); // 'Hello John!'
   * greeting({ name: 'Jane' }); // 'Hello Jane!'
   * 
   * @performance
   * - 같은 템플릿을 여러 번 사용할 경우 compile()로 최적화
   * - 정규표현식이 매번 실행되지만, 간단한 패턴이므로 충분히 빠름
   * - 복잡한 템플릿 엔진이 필요하면 Handlebars, Mustache 권장
   */
  static compile(template) {
    return (data = {}) => this.render(template, data);
  }

  /**
   * HTML 이스케이프 (내부용)
   * @private
   * @param {string} str - 문자열
   * @returns {string} 이스케이프된 문자열
   */
  static _escape(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}

export default Template;
