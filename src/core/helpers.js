/**
 * IMCAT 헬퍼 함수
 * @module core/helpers
 * @description 자주 사용하는 유틸리티 함수를 제공합니다.
 */

/**
 * 헬퍼 함수 모음
 * @class
 */
export const Helpers = {
  /**
   * 폼 데이터 수집
   * @param {string|HTMLFormElement} selector - 폼 선택자 또는 요소
   * @returns {Object} 폼 데이터 객체
   *
   * @example
   * const data = IMCAT.formData('#userForm');
   * // { name: '홍길동', email: 'hong@example.com' }
   */
  formData(selector) {
    const form = typeof selector === 'string'
      ? document.querySelector(selector)
      : selector;

    if (!form || !(form instanceof HTMLFormElement)) {
      console.warn('Helpers.formData: 유효한 폼 요소가 아닙니다.');
      return {};
    }

    const formData = new FormData(form);
    const data = {};

    formData.forEach((value, key) => {
      // 같은 키가 여러 개면 배열로 처리
      if (data[key]) {
        if (!Array.isArray(data[key])) {
          data[key] = [data[key]];
        }
        data[key].push(value);
      } else {
        data[key] = value;
      }
    });

    return data;
  },

  /**
   * 폼에 데이터 채우기
   * @param {string|HTMLFormElement} selector - 폼 선택자 또는 요소
   * @param {Object} data - 채울 데이터
   *
   * @example
   * IMCAT.fillForm('#userForm', { name: '홍길동', email: 'hong@example.com' });
   */
  fillForm(selector, data) {
    const form = typeof selector === 'string'
      ? document.querySelector(selector)
      : selector;

    if (!form || !(form instanceof HTMLFormElement)) {
      console.warn('Helpers.fillForm: 유효한 폼 요소가 아닙니다.');
      return;
    }

    Object.entries(data).forEach(([key, value]) => {
      const input = form.elements[key];

      if (!input) return;

      if (input.type === 'checkbox') {
        input.checked = Boolean(value);
      } else if (input.type === 'radio') {
        const radio = form.querySelector(`[name="${key}"][value="${value}"]`);
        if (radio) radio.checked = true;
      } else if (input.tagName === 'SELECT' && input.multiple && Array.isArray(value)) {
        // 다중 선택
        Array.from(input.options).forEach(option => {
          option.selected = value.includes(option.value);
        });
      } else {
        input.value = value;
      }
    });
  },

  /**
   * 폼 초기화
   * @param {string|HTMLFormElement} selector - 폼 선택자 또는 요소
   */
  resetForm(selector) {
    const form = typeof selector === 'string'
      ? document.querySelector(selector)
      : selector;

    if (form && form instanceof HTMLFormElement) {
      form.reset();
    }
  },

  /**
   * 클립보드 복사
   * @param {string} text - 복사할 텍스트
   * @returns {Promise<boolean>} 성공 여부
   *
   * @example
   * if (await IMCAT.copy('복사할 텍스트')) {
   *   IMCAT.toast.success('복사되었습니다');
   * }
   */
  async copy(text) {
    try {
      // Clipboard API 사용 (보안 컨텍스트 필요)
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }

      // 폴백: execCommand 사용
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      textarea.style.top = '-9999px';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();

      try {
        document.execCommand('copy');
        return true;
      } finally {
        textarea.remove();
      }
    } catch (error) {
      console.error('Helpers.copy: 복사 실패', error);
      return false;
    }
  },

  /**
   * 파일 다운로드
   * @param {Blob|string} content - Blob 또는 데이터 URL
   * @param {string} filename - 파일명
   *
   * @example
   * IMCAT.download(blob, 'report.pdf');
   */
  download(content, filename) {
    const url = content instanceof Blob
      ? URL.createObjectURL(content)
      : content;

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    if (content instanceof Blob) {
      URL.revokeObjectURL(url);
    }
  },

  /**
   * JSON 다운로드
   * @param {*} data - JSON 데이터
   * @param {string} filename - 파일명
   *
   * @example
   * IMCAT.downloadJSON({ users: [...] }, 'users.json');
   */
  downloadJSON(data, filename) {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    this.download(blob, filename);
  },

  /**
   * CSV 다운로드
   * @param {Object[]} rows - 행 데이터 배열
   * @param {string} filename - 파일명
   * @param {Object} [options] - 옵션
   *
   * @example
   * IMCAT.downloadCSV([
   *   { name: '홍길동', age: 30 },
   *   { name: '김철수', age: 25 }
   * ], 'users.csv');
   */
  downloadCSV(rows, filename, options = {}) {
    if (!rows || rows.length === 0) {
      console.warn('Helpers.downloadCSV: 데이터가 비어있습니다.');
      return;
    }

    const delimiter = options.delimiter || ',';
    const headers = options.headers || Object.keys(rows[0]);

    // 값 이스케이프 (쉼표, 따옴표, 줄바꿈 처리)
    const escapeValue = (val) => {
      if (val === null || val === undefined) return '';
      const str = String(val);
      if (str.includes(delimiter) || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const csv = [
      headers.map(escapeValue).join(delimiter),
      ...rows.map(row =>
        headers.map(h => escapeValue(row[h])).join(delimiter)
      )
    ].join('\n');

    // BOM 추가 (Excel 한글 호환)
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    this.download(blob, filename);
  },

  /**
   * 테이블 데이터 추출
   * @param {string|HTMLTableElement} selector - 테이블 선택자 또는 요소
   * @returns {Object[]} 행 데이터 배열
   *
   * @example
   * const data = IMCAT.tableData('#userTable');
   */
  tableData(selector) {
    const table = typeof selector === 'string'
      ? document.querySelector(selector)
      : selector;

    if (!table || !(table instanceof HTMLTableElement)) {
      console.warn('Helpers.tableData: 유효한 테이블 요소가 아닙니다.');
      return [];
    }

    // 헤더 추출
    const headers = [];
    const headerRow = table.querySelector('thead tr') || table.querySelector('tr');
    if (headerRow) {
      headerRow.querySelectorAll('th, td').forEach(cell => {
        headers.push(cell.textContent.trim());
      });
    }

    // 데이터 추출
    const rows = [];
    const tbody = table.querySelector('tbody') || table;
    tbody.querySelectorAll('tr').forEach((tr, index) => {
      // 첫 번째 행이 헤더면 스킵
      if (index === 0 && !table.querySelector('thead')) return;

      const row = {};
      tr.querySelectorAll('td').forEach((td, i) => {
        const key = headers[i] || `col${i}`;
        row[key] = td.textContent.trim();
      });

      if (Object.keys(row).length > 0) {
        rows.push(row);
      }
    });

    return rows;
  },

  /**
   * URL 쿼리 파라미터 파싱
   * @param {string} [url] - URL (기본: 현재 URL)
   * @returns {Object} 파라미터 객체
   */
  parseQuery(url) {
    const searchParams = url
      ? new URL(url, window.location.origin).searchParams
      : new URLSearchParams(window.location.search);

    const params = {};
    searchParams.forEach((value, key) => {
      if (params[key]) {
        if (!Array.isArray(params[key])) {
          params[key] = [params[key]];
        }
        params[key].push(value);
      } else {
        params[key] = value;
      }
    });

    return params;
  },

  /**
   * 쿼리 스트링 생성
   * @param {Object} params - 파라미터 객체
   * @returns {string} 쿼리 스트링
   */
  buildQuery(params) {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(v => searchParams.append(key, v));
      } else if (value !== null && value !== undefined) {
        searchParams.append(key, value);
      }
    });

    return searchParams.toString();
  },

  /**
   * 스크롤 위치로 이동
   * @param {string|HTMLElement|number} target - 대상 (선택자, 요소, 또는 y좌표)
   * @param {Object} [options] - 옵션
   */
  scrollTo(target, options = {}) {
    // smooth 옵션과 behavior 옵션 모두 지원
    const behavior = options.behavior || (options.smooth !== false ? 'smooth' : 'auto');
    const offset = options.offset || 0;

    let y = 0;

    if (typeof target === 'number') {
      y = target;
    } else {
      const element = typeof target === 'string'
        ? document.querySelector(target)
        : target;

      if (element) {
        y = element.getBoundingClientRect().top + window.scrollY + offset;
      }
    }

    window.scrollTo({ top: y, behavior });
  },

  /**
   * 페이지 최상단으로 스크롤
   * @param {boolean} [smooth=true] - 부드러운 스크롤 여부
   */
  scrollTop(smooth = true) {
    this.scrollTo(0, { smooth });
  },

  /**
   * 요소가 뷰포트에 보이는지 확인
   * @param {string|HTMLElement} selector - 선택자 또는 요소
   * @param {number} [threshold=0] - 임계값 (0~1)
   * @returns {boolean}
   */
  isInViewport(selector, threshold = 0) {
    const element = typeof selector === 'string'
      ? document.querySelector(selector)
      : selector;

    if (!element) return false;

    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const windowWidth = window.innerWidth || document.documentElement.clientWidth;

    const vertInView = (rect.top <= windowHeight * (1 - threshold)) &&
      ((rect.top + rect.height) >= windowHeight * threshold);
    const horInView = (rect.left <= windowWidth * (1 - threshold)) &&
      ((rect.left + rect.width) >= windowWidth * threshold);

    return vertInView && horInView;
  },

  /**
   * 로컬 스토리지 안전 접근
   * @param {string} key - 키
   * @param {*} [defaultValue] - 기본값
   * @returns {*}
   */
  getStorage(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  /**
   * 로컬 스토리지 안전 저장
   * @param {string} key - 키
   * @param {*} value - 값
   * @returns {boolean} 성공 여부
   */
  setStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }
};

export default Helpers;
