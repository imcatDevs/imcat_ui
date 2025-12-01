/**
 * XSS 보안 필터
 * @module core/security
 */

/**
 * 보안 유틸리티
 * @class
 * @description XSS 공격 방지, HTML 새니타이징, 경로 검증 등의 보안 기능을 제공합니다.
 * 모든 사용자 입력은 자동으로 이스케이프됩니다.
 *
 * @example
 * const safe = Security.escape('<script>alert("XSS")</script>');
 * const clean = Security.sanitize(userHtml);
 */
export class Security {
  /**
   * HTML 이스케이프
   * @param {string} str - 이스케이프할 문자열
   * @returns {string} 이스케이프된 문자열
   *
   * @example
   * Security.escape('<script>alert("XSS")</script>');
   * // '&lt;script&gt;alert("XSS")&lt;/script&gt;'
   */
  static escape(str) {
    if (typeof str !== 'string') return str;

    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;'
    };

    return str.replace(/[&<>"'/]/g, char => map[char]);
  }

  /**
   * HTML 새니타이징 (위험한 요소 및 속성 제거)
   * @param {string} html - 새니타이징할 HTML
   * @returns {string} 새니타이징된 HTML
   *
   * @example
   * Security.sanitize('<script>alert()</script><p>안전</p>');
   * // '<p>안전</p>'
   */
  static sanitize(html) {
    if (typeof html !== 'string') return '';

    // DOMParser로 파싱
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // 위험한 요소 제거
    this._removeDangerousElements(doc.body);

    // 위험한 속성 제거
    this._removeDangerousAttributes(doc.body);

    return doc.body.innerHTML;
  }

  /**
   * 위험한 요소 제거
   * @private
   * @param {HTMLElement} element - 대상 요소
   */
  static _removeDangerousElements(element) {
    const dangerous = ['script', 'iframe', 'object', 'embed', 'link', 'style'];

    dangerous.forEach(tag => {
      const elements = element.querySelectorAll(tag);
      elements.forEach(el => el.remove());
    });
  }

  /**
   * 위험한 속성 제거
   * @private
   * @param {HTMLElement} element - 대상 요소
   */
  static _removeDangerousAttributes(element) {
    const all = element.querySelectorAll('*');

    all.forEach(el => {
      // on* 이벤트 핸들러 제거
      Array.from(el.attributes).forEach(attr => {
        if (attr.name.startsWith('on')) {
          el.removeAttribute(attr.name);
        }

        // javascript: URL 제거
        if (attr.value && attr.value.trim().toLowerCase().startsWith('javascript:')) {
          el.removeAttribute(attr.name);
        }

        // data: URL (이미지만 허용)
        if (attr.name === 'src' || attr.name === 'href') {
          if (attr.value && attr.value.trim().toLowerCase().startsWith('data:')) {
            // 이미지 data URL만 허용
            if (!attr.value.trim().toLowerCase().startsWith('data:image/')) {
              el.removeAttribute(attr.name);
            }
          }
        }
      });
    });
  }

  /**
   * 경로 검증 (경로 순회 공격 방지)
   * @param {string} path - 검증할 경로
   * @returns {boolean} 안전한 경로 여부
   *
   * @description
   * views/ 폴더 및 그 하위 폴더의 뷰 파일만 허용합니다.
   * 경로 순회 공격(..), 절대 경로, null byte 등을 차단합니다.
   *
   * @example
   * Security.validatePath('views/home.html'); // true
   * Security.validatePath('views/products.html?id=1'); // true
   * Security.validatePath('views/admin/dashboard.html'); // true (하위 폴더)
   * Security.validatePath('views/user/profile/edit.html'); // true (깊은 하위 폴더)
   * Security.validatePath('../etc/passwd'); // false
   * Security.validatePath('/etc/passwd'); // false
   * Security.validatePath('templates/page.html'); // false (views/ 외부)
   */
  static validatePath(path) {
    if (typeof path !== 'string' || !path) return false;

    // 쿼리 스트링 분리
    const [pathOnly] = path.split('?');

    // ../ 포함 차단 (상위 디렉토리 접근)
    if (pathOnly.includes('../') || pathOnly.includes('..\\')) {
      return false;
    }

    // 절대 경로 차단 (/ 로 시작)
    if (pathOnly.startsWith('/')) {
      return false;
    }

    // views/ 폴더 및 하위 폴더만 허용 (views/로 시작하는 모든 경로)
    if (!pathOnly.startsWith('views/')) {
      return false;
    }

    // null byte 포함 차단
    if (pathOnly.includes('\0') || pathOnly.includes('%00')) {
      return false;
    }

    // URL 인코딩 우회 시도 탐지
    const decoded = decodeURIComponent(pathOnly);
    if (decoded.includes('../') || decoded.includes('..\\')) {
      return false;
    }

    // .html, .php 확장자만 허용
    if (!pathOnly.endsWith('.html') && !pathOnly.endsWith('.php')) {
      return false;
    }

    // 안전한 문자만 허용 (영문, 숫자, 하이픈, 언더스코어, 슬래시, 점)
    const safePattern = /^[a-zA-Z0-9\-_/.]+$/;
    if (!safePattern.test(pathOnly)) {
      return false;
    }

    // 경로 정규화 후 재검증
    const normalized = pathOnly.replace(/\/+/g, '/');
    if (normalized !== pathOnly) {
      return false;
    }

    return true;
  }

  /**
   * 안전한 파일명 검증
   * @param {string} filename - 검증할 파일명
   * @returns {boolean} 안전한 파일명 여부
   *
   * @example
   * Security.isSafeFilename('document.pdf'); // true
   * Security.isSafeFilename('../../../etc/passwd'); // false
   */
  static isSafeFilename(filename) {
    if (typeof filename !== 'string' || !filename) return false;

    // 경로 구분자 포함 차단
    if (filename.includes('/') || filename.includes('\\')) {
      return false;
    }

    // ..를 포함하는 파일명 차단
    if (filename.includes('..')) {
      return false;
    }

    // null byte 차단
    if (filename.includes('\0') || filename.includes('%00')) {
      return false;
    }

    // 안전한 문자만 허용
    const safePattern = /^[a-zA-Z0-9\-_.]+$/;
    if (!safePattern.test(filename)) {
      return false;
    }

    // 파일명 길이 제한 (최대 255자)
    if (filename.length > 255) {
      return false;
    }

    return true;
  }

  /**
   * URL 안전성 검증
   * @param {string} url - 검증할 URL
   * @returns {boolean} 안전한 URL 여부
   *
   * @example
   * Security.isSafeUrl('https://example.com'); // true
   * Security.isSafeUrl('javascript:alert(1)'); // false
   */
  static isSafeUrl(url) {
    if (typeof url !== 'string' || !url) return false;

    const lower = url.trim().toLowerCase();

    // javascript: 프로토콜 차단
    if (lower.startsWith('javascript:')) {
      return false;
    }

    // data: 프로토콜 차단 (이미지 제외)
    if (lower.startsWith('data:') && !lower.startsWith('data:image/')) {
      return false;
    }

    // vbscript: 프로토콜 차단
    if (lower.startsWith('vbscript:')) {
      return false;
    }

    // file: 프로토콜 차단
    if (lower.startsWith('file:')) {
      return false;
    }

    return true;
  }

  /**
   * CSS 값 새니타이징 (CSS 인젝션 방지)
   * @param {string} value - CSS 값
   * @returns {string} 새니타이징된 CSS 값
   *
   * @example
   * Security.sanitizeCSS('red'); // 'red'
   * Security.sanitizeCSS('red; background: url(javascript:...)'); // 'red'
   */
  static sanitizeCSS(value) {
    if (typeof value !== 'string') return '';

    // expression(), url(javascript:), import 등 위험한 패턴 제거
    const dangerous = [
      /expression\s*\(/gi,
      /javascript:/gi,
      /vbscript:/gi,
      /@import/gi,
      /behavior:/gi
    ];

    let sanitized = value;
    dangerous.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });

    return sanitized.trim();
  }

  /**
   * 파라미터 새니타이징 (SQL 인젝션, XSS 방지)
   * @param {*} value - 새니타이징할 값
   * @returns {*} 새니타이징된 값
   *
   * @example
   * Security.sanitizeParam("'; DROP TABLE users--"); // " DROP TABLE users--"
   */
  static sanitizeParam(value) {
    if (typeof value !== 'string') return value;

    // SQL 인젝션 패턴 제거
    let sanitized = value.replace(/['";\\]/g, '');

    // HTML 이스케이프
    sanitized = this.escape(sanitized);

    return sanitized;
  }
}

export default Security;
