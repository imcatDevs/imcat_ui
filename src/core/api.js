/**
 * API 유틸리티
 * @module core/api
 */

/**
 * API 유틸리티 클래스
 * @class
 * @description HTTP 요청을 위한 fetch API 래퍼 클래스입니다.
 * 표준화된 응답 형식, 인터셉터, 에러 처리 등을 제공합니다.
 *
 * @example
 * // GET 요청
 * const response = await APIUtil.get('/api/users');
 *
 * @example
 * // POST 요청
 * const response = await APIUtil.post('/api/users', { name: 'John' });
 */
export class APIUtil {
  // 인터셉터 저장소
  static _requestInterceptors = [];
  static _responseInterceptors = [];

  /**
   * 인터셉터 객체
   */
  static interceptors = {
    /**
     * 요청 인터셉터
     */
    request: {
      /**
       * 요청 인터셉터 추가
       * @param {Function} onFulfilled - 성공 핸들러
       * @param {Function} [onRejected] - 실패 핸들러
       * @returns {number} 인터셉터 ID
       *
       * @example
       * const id = APIUtil.interceptors.request.use(
       *   (config) => {
       *     config.headers['Authorization'] = `Bearer ${token}`;
       *     return config;
       *   }
       * );
       */
      use(onFulfilled, onRejected) {
        APIUtil._requestInterceptors.push({ onFulfilled, onRejected });
        return APIUtil._requestInterceptors.length - 1;
      },

      /**
       * 요청 인터셉터 제거
       * @param {number} id - 인터셉터 ID
       */
      eject(id) {
        if (APIUtil._requestInterceptors[id]) {
          APIUtil._requestInterceptors[id] = null;
        }
      },

      /**
       * 모든 요청 인터셉터 제거
       */
      clear() {
        APIUtil._requestInterceptors = [];
      }
    },

    /**
     * 응답 인터셉터
     */
    response: {
      /**
       * 응답 인터셉터 추가
       * @param {Function} onFulfilled - 성공 핸들러
       * @param {Function} [onRejected] - 실패 핸들러
       * @returns {number} 인터셉터 ID
       *
       * @example
       * APIUtil.interceptors.response.use(
       *   (response) => response,
       *   (error) => {
       *     if (error.statusCode === 401) {
       *       // 로그아웃 처리
       *     }
       *     return Promise.reject(error);
       *   }
       * );
       */
      use(onFulfilled, onRejected) {
        APIUtil._responseInterceptors.push({ onFulfilled, onRejected });
        return APIUtil._responseInterceptors.length - 1;
      },

      /**
       * 응답 인터셉터 제거
       * @param {number} id - 인터셉터 ID
       */
      eject(id) {
        if (APIUtil._responseInterceptors[id]) {
          APIUtil._responseInterceptors[id] = null;
        }
      },

      /**
       * 모든 응답 인터셉터 제거
       */
      clear() {
        APIUtil._responseInterceptors = [];
      }
    },

    /**
     * 모든 인터셉터 제거
     */
    clear() {
      APIUtil._requestInterceptors = [];
      APIUtil._responseInterceptors = [];
    }
  };
  /**
   * 성공 응답 생성
   * @param {*} data - 응답 데이터
   * @param {string} [message='Success'] - 메시지
   * @param {number} [statusCode=200] - HTTP 상태 코드
   * @returns {Object} 표준 응답 객체
   *
   * @example
   * const response = APIUtil.success({ id: 1, name: 'John' }, 'User created', 201);
   */
  static success(data, message = 'Success', statusCode = 200) {
    return {
      success: true,
      statusCode,
      data,
      message,
      error: null,
      timestamp: Date.now()
    };
  }

  /**
   * 에러 응답 생성
   * @param {string} message - 에러 메시지
   * @param {number} [statusCode=400] - HTTP 상태 코드
   * @param {Object} [error=null] - 에러 상세
   * @returns {Object} 표준 에러 객체
   *
   * @example
   * const response = APIUtil.error('User not found', 404);
   */
  static error(message, statusCode = 400, error = null) {
    return {
      success: false,
      statusCode,
      data: null,
      message,
      error: error ? {
        message: error.message || message,
        name: error.name,
        type: error.type
      } : { message },
      timestamp: Date.now()
    };
  }

  /**
   * 페이지네이션 응답 생성
   * @param {Array} items - 아이템 배열
   * @param {Object} pagination - 페이지 정보
   * @param {number} pagination.page - 현재 페이지
   * @param {number} pagination.limit - 페이지당 아이템 수
   * @param {number} pagination.total - 전체 아이템 수
   * @returns {Object} 페이지네이션 응답
   *
   * @example
   * const response = APIUtil.paginated(items, {
   *   page: 1,
   *   limit: 10,
   *   total: 100
   * });
   */
  static paginated(items, pagination) {
    const { page, limit, total } = pagination;
    const totalPages = Math.ceil(total / limit);

    return this.success({
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  }

  /**
   * HTTP 요청 (기본)
   * @param {string} url - 요청 URL
   * @param {Object} [options={}] - fetch 옵션
   * @returns {Promise<Object>} API 응답
   *
   * @example
   * const response = await APIUtil.request('/api/users', {
   *   method: 'POST',
   *   body: JSON.stringify({ name: 'John' })
   * });
   */
  static async request(url, options = {}) {
    try {
      // 기본 헤더 설정
      const headers = {
        'Content-Type': 'application/json',
        ...options.headers
      };

      let config = {
        ...options,
        headers,
        url // URL도 config에 포함
      };

      // 요청 인터셉터 실행
      for (const interceptor of this._requestInterceptors) {
        if (interceptor && interceptor.onFulfilled) {
          try {
            config = await interceptor.onFulfilled(config);
          } catch (error) {
            if (interceptor.onRejected) {
              config = await interceptor.onRejected(error);
            } else {
              throw error;
            }
          }
        }
      }

      // URL 추출 (인터셉터에서 변경되었을 수 있음)
      const finalUrl = config.url || url;
      delete config.url; // fetch에 전달하지 않음

      const response = await fetch(finalUrl, config);

      // JSON 파싱 (실패 시 텍스트로 처리)
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        try {
          data = await response.json();
        } catch (parseError) {
          data = { message: 'Invalid JSON response' };
        }
      } else {
        const text = await response.text();
        data = { message: text || 'Non-JSON response' };
      }

      let result;
      if (!response.ok) {
        result = this.error(
          data.message || 'Request failed',
          response.status,
          data.error
        );
      } else {
        // 서버가 표준 형식을 반환하면 그대로 사용
        if (data.success !== undefined) {
          result = data;
        } else {
          // 아니면 표준 형식으로 래핑
          result = this.success(data);
        }
      }

      // 응답 인터셉터 실행
      for (const interceptor of this._responseInterceptors) {
        if (interceptor) {
          if (result.success && interceptor.onFulfilled) {
            result = await interceptor.onFulfilled(result);
          } else if (!result.success && interceptor.onRejected) {
            result = await interceptor.onRejected(result);
          }
        }
      }

      return result;

    } catch (error) {
      // 네트워크 오류
      let result = this.error(
        error.message || 'Network error',
        0, // 0 = 네트워크 오류
        error
      );

      // 에러에 대한 응답 인터셉터 실행
      for (const interceptor of this._responseInterceptors) {
        if (interceptor && interceptor.onRejected) {
          try {
            result = await interceptor.onRejected(result);
          } catch (e) {
            // 인터셉터에서 에러가 발생하면 원래 에러 반환
            break;
          }
        }
      }

      return result;
    }
  }

  /**
   * GET 요청
   * @param {string} url - 요청 URL
   * @param {Object} [options={}] - fetch 옵션
   * @returns {Promise<Object>} API 응답
   *
   * @example
   * const response = await APIUtil.get('/api/users');
   * if (response.success) {
   *   console.log(response.data);
   * }
   */
  static async get(url, options = {}) {
    return this.request(url, {
      ...options,
      method: 'GET'
    });
  }

  /**
   * POST 요청
   * @param {string} url - 요청 URL
   * @param {Object} body - 요청 바디
   * @param {Object} [options={}] - fetch 옵션
   * @returns {Promise<Object>} API 응답
   *
   * @example
   * const response = await APIUtil.post('/api/users', {
   *   name: 'John',
   *   email: 'john@example.com'
   * });
   */
  static async post(url, body, options = {}) {
    return this.request(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body)
    });
  }

  /**
   * PUT 요청
   * @param {string} url - 요청 URL
   * @param {Object} body - 요청 바디
   * @param {Object} [options={}] - fetch 옵션
   * @returns {Promise<Object>} API 응답
   *
   * @example
   * const response = await APIUtil.put('/api/users/123', {
   *   name: 'Jane'
   * });
   */
  static async put(url, body, options = {}) {
    return this.request(url, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body)
    });
  }

  /**
   * PATCH 요청
   * @param {string} url - 요청 URL
   * @param {Object} body - 요청 바디
   * @param {Object} [options={}] - fetch 옵션
   * @returns {Promise<Object>} API 응답
   *
   * @example
   * const response = await APIUtil.patch('/api/users/123', {
   *   age: 31
   * });
   */
  static async patch(url, body, options = {}) {
    return this.request(url, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(body)
    });
  }

  /**
   * DELETE 요청
   * @param {string} url - 요청 URL
   * @param {Object} [options={}] - fetch 옵션
   * @returns {Promise<Object>} API 응답
   *
   * @example
   * const response = await APIUtil.delete('/api/users/123');
   */
  static async delete(url, options = {}) {
    return this.request(url, {
      ...options,
      method: 'DELETE'
    });
  }

  /**
   * 여러 요청을 병렬로 실행
   * @param {...Promise} requests - 요청 프로미스들
   * @returns {Promise<Array>} 모든 응답 배열
   *
   * @example
   * const [users, posts, comments] = await APIUtil.all(
   *   APIUtil.get('/api/users'),
   *   APIUtil.get('/api/posts'),
   *   APIUtil.get('/api/comments')
   * );
   */
  static async all(...requests) {
    return Promise.all(requests);
  }

  /**
   * 여러 요청 중 가장 빠른 것만 반환
   * @param {...Promise} requests - 요청 프로미스들
   * @returns {Promise<Object>} 가장 빠른 응답
   *
   * @example
   * const response = await APIUtil.race(
   *   APIUtil.get('/api/server1/data'),
   *   APIUtil.get('/api/server2/data')
   * );
   */
  static async race(...requests) {
    return Promise.race(requests);
  }
}

export default APIUtil;
