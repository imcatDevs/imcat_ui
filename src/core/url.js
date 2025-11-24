/**
 * URL & Query String 유틸리티
 * @module core/url
 */

/**
 * URL 파싱 및 빌딩 유틸리티
 * @class
 * @description URL 과 쿠리 스트링을 파싱하고 조작하는 유틸리티 클래스입니다.
 * URLSearchParams를 래핑하여 편리한 API를 제공합니다.
 * 
 * @example
 * const params = URLUtil.parse('?id=1&name=John');
 * const query = URLUtil.stringify({ id: 1, name: 'John' });
 */
export class URLUtil {
  /**
   * 쿼리 스트링 파싱
   * @param {string} [queryString] - 쿼리 스트링 (없으면 현재 URL 사용)
   * @returns {Object} 파싱된 객체
   * 
   * @example
   * const params = URLUtil.parseQuery('?page=1&sort=name');
   * // { page: '1', sort: 'name' }
   * 
   * @example
   * const params = URLUtil.parseQuery(); // 현재 URL의 쿼리 파싱
   */
  static parseQuery(queryString) {
    const query = queryString || window.location.search;
    const params = {};

    if (!query) return params;

    // ? 제거
    const cleaned = query.startsWith('?') ? query.slice(1) : query;

    if (!cleaned) return params;

    // & 로 분리하여 파싱
    cleaned.split('&').forEach(pair => {
      const [key, value] = pair.split('=');
      if (key) {
        const decodedKey = decodeURIComponent(key);
        const decodedValue = value ? decodeURIComponent(value) : '';
        
        // 배열 처리 (key[])
        if (decodedKey.endsWith('[]')) {
          const arrayKey = decodedKey.slice(0, -2);
          if (!params[arrayKey]) {
            params[arrayKey] = [];
          }
          params[arrayKey].push(decodedValue);
        } else {
          params[decodedKey] = decodedValue;
        }
      }
    });

    return params;
  }

  /**
   * 쿼리 스트링 빌딩
   * @param {Object} params - 파라미터 객체
   * @param {boolean} [includeQuestion=true] - ? 포함 여부
   * @returns {string} 쿼리 스트링
   * 
   * @example
   * const query = URLUtil.buildQuery({ page: 2, sort: 'name' });
   * // '?page=2&sort=name'
   * 
   * @example
   * const query = URLUtil.buildQuery({ tags: ['js', 'css'] });
   * // '?tags[]=js&tags[]=css'
   */
  static buildQuery(params, includeQuestion = true) {
    if (!params || typeof params !== 'object') {
      return includeQuestion ? '?' : '';
    }

    const pairs = [];

    Object.keys(params).forEach(key => {
      const value = params[key];

      if (value === null || value === undefined) {
        return; // skip
      }

      if (Array.isArray(value)) {
        // 배열 처리
        value.forEach(item => {
          pairs.push(`${encodeURIComponent(key)}[]=${encodeURIComponent(item)}`);
        });
      } else {
        pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
      }
    });

    const query = pairs.join('&');
    return query ? (includeQuestion ? '?' : '') + query : '';
  }

  /**
   * URL과 쿼리 파라미터 결합
   * @param {string} url - 기본 URL
   * @param {Object} params - 파라미터 객체
   * @returns {string} 결합된 URL
   * 
   * @example
   * const url = URLUtil.buildURL('/api/users', { page: 1, limit: 10 });
   * // '/api/users?page=1&limit=10'
   */
  static buildURL(url, params) {
    if (!params || Object.keys(params).length === 0) {
      return url;
    }

    const query = this.buildQuery(params, false);
    
    if (!query) return url;

    // 이미 쿼리 스트링이 있는 경우
    if (url.includes('?')) {
      return `${url}&${query}`;
    }

    return `${url}?${query}`;
  }

  /**
   * 현재 URL에 파라미터 추가/업데이트 (히스토리 없이)
   * @param {Object} params - 추가할 파라미터
   * @param {boolean} [replace=false] - replace 모드 (기존 파라미터 유지 여부)
   * 
   * @example
   * // 현재 URL: /page?foo=bar
   * URLUtil.updateQuery({ page: 2 });
   * // 결과: /page?foo=bar&page=2
   * 
   * @example
   * URLUtil.updateQuery({ page: 2 }, true); // replace 모드
   * // 결과: /page?page=2
   */
  static updateQuery(params, replace = false) {
    const currentParams = replace ? {} : this.parseQuery();
    const newParams = { ...currentParams, ...params };
    
    const query = this.buildQuery(newParams);
    const newURL = window.location.pathname + query;
    
    window.history.replaceState({}, '', newURL);
  }

  /**
   * 특정 쿼리 파라미터 가져오기
   * @param {string} key - 파라미터 키
   * @param {*} [defaultValue] - 기본값
   * @returns {*} 파라미터 값
   * 
   * @example
   * // 현재 URL: /page?id=123&name=John
   * const id = URLUtil.getParam('id'); // '123'
   * const age = URLUtil.getParam('age', 0); // 0 (기본값)
   */
  static getParam(key, defaultValue = null) {
    const params = this.parseQuery();
    return params[key] !== undefined ? params[key] : defaultValue;
  }

  /**
   * 특정 쿼리 파라미터 제거
   * @param {string|string[]} keys - 제거할 키 (배열 가능)
   * 
   * @example
   * // 현재 URL: /page?id=123&name=John&age=30
   * URLUtil.removeParam('age');
   * // 결과: /page?id=123&name=John
   * 
   * @example
   * URLUtil.removeParam(['id', 'age']);
   * // 결과: /page?name=John
   */
  static removeParam(keys) {
    const params = this.parseQuery();
    const keysToRemove = Array.isArray(keys) ? keys : [keys];
    
    keysToRemove.forEach(key => {
      delete params[key];
    });

    const query = this.buildQuery(params);
    const newURL = window.location.pathname + query;
    
    window.history.replaceState({}, '', newURL);
  }

  /**
   * 모든 쿼리 파라미터 제거
   * 
   * @example
   * // 현재 URL: /page?id=123&name=John
   * URLUtil.clearQuery();
   * // 결과: /page
   */
  static clearQuery() {
    window.history.replaceState({}, '', window.location.pathname);
  }

  /**
   * URL 파싱 (전체)
   * @param {string} [url] - 파싱할 URL (없으면 현재 URL)
   * @returns {Object} 파싱된 URL 정보
   * 
   * @example
   * const info = URLUtil.parse('https://example.com:8080/path?id=1#section');
   * // {
   * //   protocol: 'https:',
   * //   host: 'example.com:8080',
   * //   hostname: 'example.com',
   * //   port: '8080',
   * //   pathname: '/path',
   * //   search: '?id=1',
   * //   hash: '#section',
   * //   query: { id: '1' }
   * // }
   */
  static parse(url) {
    const urlObj = url ? new URL(url, window.location.origin) : window.location;

    return {
      protocol: urlObj.protocol,
      host: urlObj.host,
      hostname: urlObj.hostname,
      port: urlObj.port,
      pathname: urlObj.pathname,
      search: urlObj.search,
      hash: urlObj.hash,
      query: this.parseQuery(urlObj.search)
    };
  }
}

export default URLUtil;
