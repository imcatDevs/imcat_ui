/**
 * API Module 테스트
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { APIUtil } from '../../src/core/api.js';

// Mock fetch
global.fetch = vi.fn();

describe('API Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('success()', () => {
    it('성공 응답을 생성해야 함', () => {
      const response = APIUtil.success({ id: 1, name: 'John' });
      
      expect(response.success).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.data).toEqual({ id: 1, name: 'John' });
      expect(response.message).toBe('Success');
      expect(response.error).toBeNull();
      expect(response.timestamp).toBeGreaterThan(0);
    });

    it('커스텀 메시지를 설정할 수 있어야 함', () => {
      const response = APIUtil.success({}, 'User created');
      expect(response.message).toBe('User created');
    });

    it('커스텀 상태 코드를 설정할 수 있어야 함', () => {
      const response = APIUtil.success({}, 'Created', 201);
      expect(response.statusCode).toBe(201);
    });
  });

  describe('error()', () => {
    it('에러 응답을 생성해야 함', () => {
      const response = APIUtil.error('Something went wrong');
      
      expect(response.success).toBe(false);
      expect(response.statusCode).toBe(400);
      expect(response.data).toBeNull();
      expect(response.message).toBe('Something went wrong');
      expect(response.error).toBeDefined();
      expect(response.error.message).toBe('Something went wrong');
      expect(response.timestamp).toBeGreaterThan(0);
    });

    it('커스텀 상태 코드를 설정할 수 있어야 함', () => {
      const response = APIUtil.error('Not found', 404);
      expect(response.statusCode).toBe(404);
    });

    it('에러 객체를 포함할 수 있어야 함', () => {
      const error = new Error('Server error');
      error.name = 'ServerError';
      
      const response = APIUtil.error('Error occurred', 500, error);
      expect(response.error.message).toBe('Server error');
      expect(response.error.name).toBe('ServerError');
    });
  });

  describe('paginated()', () => {
    it('페이지네이션 응답을 생성해야 함', () => {
      const items = [1, 2, 3, 4, 5];
      const response = APIUtil.paginated(items, {
        page: 1,
        limit: 5,
        total: 50
      });

      expect(response.success).toBe(true);
      expect(response.data.items).toEqual(items);
      expect(response.data.pagination.page).toBe(1);
      expect(response.data.pagination.limit).toBe(5);
      expect(response.data.pagination.total).toBe(50);
      expect(response.data.pagination.totalPages).toBe(10);
      expect(response.data.pagination.hasNext).toBe(true);
      expect(response.data.pagination.hasPrev).toBe(false);
    });

    it('마지막 페이지를 올바르게 처리해야 함', () => {
      const items = [1, 2];
      const response = APIUtil.paginated(items, {
        page: 10,
        limit: 5,
        total: 50
      });

      expect(response.data.pagination.hasNext).toBe(false);
      expect(response.data.pagination.hasPrev).toBe(true);
    });
  });

  describe('request()', () => {
    it('성공적인 요청을 처리해야 함', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, name: 'John' })
      });

      const response = await APIUtil.request('/api/users');
      
      expect(response.success).toBe(true);
      expect(response.data).toEqual({ id: 1, name: 'John' });
    });

    it('서버의 표준 형식 응답을 그대로 반환해야 함', async () => {
      const standardResponse = {
        success: true,
        statusCode: 200,
        data: { id: 1 },
        message: 'Success',
        error: null,
        timestamp: Date.now()
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => standardResponse
      });

      const response = await APIUtil.request('/api/users');
      expect(response).toEqual(standardResponse);
    });

    it('HTTP 에러를 처리해야 함', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ message: 'Not found' })
      });

      const response = await APIUtil.request('/api/users');
      
      expect(response.success).toBe(false);
      expect(response.statusCode).toBe(404);
      expect(response.message).toBe('Not found');
    });

    it('네트워크 에러를 처리해야 함', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      const response = await APIUtil.request('/api/users');
      
      expect(response.success).toBe(false);
      expect(response.statusCode).toBe(0);
      expect(response.message).toBe('Network error');
    });

    it('커스텀 헤더를 추가할 수 있어야 함', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({})
      });

      await APIUtil.request('/api/users', {
        headers: {
          'Authorization': 'Bearer token123'
        }
      });

      expect(global.fetch).toHaveBeenCalledWith('/api/users', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer token123'
        }
      });
    });
  });

  describe('HTTP 메서드', () => {
    describe('get()', () => {
      it('GET 요청을 보내야 함', async () => {
        global.fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: 'test' })
        });

        await APIUtil.get('/api/users');
        
        expect(global.fetch).toHaveBeenCalledWith('/api/users', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
      });
    });

    describe('post()', () => {
      it('POST 요청을 보내야 함', async () => {
        global.fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: 1 })
        });

        const body = { name: 'John', email: 'john@example.com' };
        await APIUtil.post('/api/users', body);
        
        expect(global.fetch).toHaveBeenCalledWith('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        });
      });
    });

    describe('put()', () => {
      it('PUT 요청을 보내야 함', async () => {
        global.fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: 1 })
        });

        const body = { name: 'Jane' };
        await APIUtil.put('/api/users/1', body);
        
        expect(global.fetch).toHaveBeenCalledWith('/api/users/1', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        });
      });
    });

    describe('patch()', () => {
      it('PATCH 요청을 보내야 함', async () => {
        global.fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: 1 })
        });

        const body = { age: 31 };
        await APIUtil.patch('/api/users/1', body);
        
        expect(global.fetch).toHaveBeenCalledWith('/api/users/1', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        });
      });
    });

    describe('delete()', () => {
      it('DELETE 요청을 보내야 함', async () => {
        global.fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true })
        });

        await APIUtil.delete('/api/users/1');
        
        expect(global.fetch).toHaveBeenCalledWith('/api/users/1', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        });
      });
    });
  });

  describe('all()', () => {
    it('여러 요청을 병렬로 실행해야 함', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ data: 'test' })
      });

      const [r1, r2, r3] = await APIUtil.all(
        APIUtil.get('/api/users'),
        APIUtil.get('/api/posts'),
        APIUtil.get('/api/comments')
      );

      expect(r1.success).toBe(true);
      expect(r2.success).toBe(true);
      expect(r3.success).toBe(true);
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('모든 요청이 완료될 때까지 대기해야 함', async () => {
      let resolved = 0;

      global.fetch.mockImplementation(() => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolved++;
            resolve({
              ok: true,
              json: async () => ({ data: resolved })
            });
          }, 10);
        });
      });

      const results = await APIUtil.all(
        APIUtil.get('/api/1'),
        APIUtil.get('/api/2'),
        APIUtil.get('/api/3')
      );

      expect(results.length).toBe(3);
      expect(resolved).toBe(3);
    });
  });

  describe('race()', () => {
    it('가장 빠른 요청만 반환해야 함', async () => {
      global.fetch
        .mockImplementationOnce(() => {
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                ok: true,
                json: async () => ({ server: 1 })
              });
            }, 100);
          });
        })
        .mockImplementationOnce(() => {
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                ok: true,
                json: async () => ({ server: 2 })
              });
            }, 10); // 더 빠름
          });
        });

      const response = await APIUtil.race(
        APIUtil.get('/api/server1'),
        APIUtil.get('/api/server2')
      );

      expect(response.data.server).toBe(2);
    });
  });

  describe('실전 시나리오', () => {
    it('CRUD 작업', async () => {
      // Create
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, name: 'John' })
      });
      const created = await APIUtil.post('/api/users', { name: 'John' });
      expect(created.success).toBe(true);

      // Read
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, name: 'John' })
      });
      const user = await APIUtil.get('/api/users/1');
      expect(user.success).toBe(true);

      // Update
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, name: 'Jane' })
      });
      const updated = await APIUtil.put('/api/users/1', { name: 'Jane' });
      expect(updated.success).toBe(true);

      // Delete
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });
      const deleted = await APIUtil.delete('/api/users/1');
      expect(deleted.success).toBe(true);
    });

    it('에러 처리 시나리오', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ message: 'User not found' })
      });

      const response = await APIUtil.get('/api/users/999');
      
      if (!response.success) {
        expect(response.statusCode).toBe(404);
        expect(response.message).toBe('User not found');
      }
    });

    it('페이지네이션 시나리오', async () => {
      const items = Array.from({ length: 10 }, (_, i) => ({ id: i + 1 }));
      const response = APIUtil.paginated(items, {
        page: 2,
        limit: 10,
        total: 100
      });

      expect(response.data.items.length).toBe(10);
      expect(response.data.pagination.page).toBe(2);
      expect(response.data.pagination.totalPages).toBe(10);
      expect(response.data.pagination.hasNext).toBe(true);
      expect(response.data.pagination.hasPrev).toBe(true);
    });
  });

  describe('Interceptors (인터셉터)', () => {
    beforeEach(() => {
      // 인터셉터 초기화
      APIUtil._requestInterceptors = [];
      APIUtil._responseInterceptors = [];
    });

    describe('request interceptor', () => {
      it('요청 인터셉터를 추가할 수 있어야 함', () => {
        const id = APIUtil.interceptors.request.use((config) => config);
        expect(typeof id).toBe('number');
        expect(APIUtil._requestInterceptors.length).toBe(1);
      });

      it('요청 헤더를 수정할 수 있어야 함', async () => {
        // 인증 토큰 추가 인터셉터
        APIUtil.interceptors.request.use((config) => {
          config.headers['Authorization'] = 'Bearer test-token';
          return config;
        });

        global.fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true })
        });

        await APIUtil.get('/api/protected');

        expect(global.fetch).toHaveBeenCalledWith(
          '/api/protected',
          expect.objectContaining({
            headers: expect.objectContaining({
              'Authorization': 'Bearer test-token'
            })
          })
        );
      });

      it('URL을 수정할 수 있어야 함', async () => {
        APIUtil.interceptors.request.use((config) => {
          config.url = config.url.replace('/api', '/api/v2');
          return config;
        });

        global.fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true })
        });

        await APIUtil.get('/api/users');

        expect(global.fetch).toHaveBeenCalledWith(
          '/api/v2/users',
          expect.any(Object)
        );
      });

      it('여러 요청 인터셉터를 순서대로 실행해야 함', async () => {
        const order = [];

        APIUtil.interceptors.request.use((config) => {
          order.push(1);
          return config;
        });

        APIUtil.interceptors.request.use((config) => {
          order.push(2);
          return config;
        });

        global.fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true })
        });

        await APIUtil.get('/api/test');

        expect(order).toEqual([1, 2]);
      });

      it('요청 인터셉터를 제거할 수 있어야 함', async () => {
        const id = APIUtil.interceptors.request.use((config) => {
          config.headers['X-Test'] = 'should-not-appear';
          return config;
        });

        APIUtil.interceptors.request.eject(id);

        global.fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true })
        });

        await APIUtil.get('/api/test');

        expect(global.fetch).toHaveBeenCalledWith(
          '/api/test',
          expect.objectContaining({
            headers: expect.not.objectContaining({
              'X-Test': 'should-not-appear'
            })
          })
        );
      });
    });

    describe('response interceptor', () => {
      it('응답 인터셉터를 추가할 수 있어야 함', () => {
        const id = APIUtil.interceptors.response.use((response) => response);
        expect(typeof id).toBe('number');
        expect(APIUtil._responseInterceptors.length).toBe(1);
      });

      it('성공 응답을 수정할 수 있어야 함', async () => {
        APIUtil.interceptors.response.use((response) => {
          response.data.modified = true;
          return response;
        });

        global.fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: 1, name: 'John' })
        });

        const response = await APIUtil.get('/api/users/1');

        expect(response.data.modified).toBe(true);
      });

      it('에러 응답을 처리할 수 있어야 함', async () => {
        let errorHandled = false;

        APIUtil.interceptors.response.use(
          (response) => response,
          (error) => {
            errorHandled = true;
            return error;
          }
        );

        global.fetch.mockResolvedValueOnce({
          ok: false,
          status: 404,
          json: async () => ({ message: 'Not found' })
        });

        await APIUtil.get('/api/users/999');

        expect(errorHandled).toBe(true);
      });

      it('401 에러 시 로그아웃 처리 시나리오', async () => {
        let logoutCalled = false;

        APIUtil.interceptors.response.use(
          (response) => response,
          (error) => {
            if (error.statusCode === 401) {
              logoutCalled = true;
              // 로그아웃 처리
            }
            return error;
          }
        );

        global.fetch.mockResolvedValueOnce({
          ok: false,
          status: 401,
          json: async () => ({ message: 'Unauthorized' })
        });

        await APIUtil.get('/api/protected');

        expect(logoutCalled).toBe(true);
      });

      it('응답 인터셉터를 제거할 수 있어야 함', async () => {
        let callbackCalled = false;

        const id = APIUtil.interceptors.response.use((response) => {
          callbackCalled = true;
          return response;
        });

        APIUtil.interceptors.response.eject(id);

        global.fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true })
        });

        await APIUtil.get('/api/test');

        expect(callbackCalled).toBe(false);
      });
    });

    describe('실전 시나리오', () => {
      it('인증 토큰 자동 추가 및 만료 처리', async () => {
        let token = 'valid-token';

        // 요청 인터셉터: 토큰 추가
        APIUtil.interceptors.request.use((config) => {
          if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
          }
          return config;
        });

        // 응답 인터셉터: 401 에러 처리
        APIUtil.interceptors.response.use(
          (response) => response,
          (error) => {
            if (error.statusCode === 401) {
              token = null; // 토큰 무효화
            }
            return error;
          }
        );

        // 첫 요청 - 성공
        global.fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true })
        });

        await APIUtil.get('/api/data');
        expect(token).toBe('valid-token');

        // 두 번째 요청 - 401 에러
        global.fetch.mockResolvedValueOnce({
          ok: false,
          status: 401,
          json: async () => ({ message: 'Token expired' })
        });

        await APIUtil.get('/api/data');
        expect(token).toBe(null);
      });

      it('로깅 인터셉터', async () => {
        const logs = [];

        // 요청 로깅
        APIUtil.interceptors.request.use((config) => {
          logs.push({ type: 'request', url: config.url });
          return config;
        });

        // 응답 로깅
        APIUtil.interceptors.response.use((response) => {
          logs.push({ type: 'response', success: response.success });
          return response;
        });

        global.fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true })
        });

        await APIUtil.get('/api/test');

        expect(logs.length).toBe(2);
        expect(logs[0].type).toBe('request');
        expect(logs[1].type).toBe('response');
      });
    });
  });
});
