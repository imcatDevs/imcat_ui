/**
 * URL Module 테스트
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { URLUtil } from '../../src/core/url.js';

describe('URL Module', () => {
  // 테스트 후 URL 복원을 위해 저장
  let originalLocation;

  beforeEach(() => {
    originalLocation = window.location.href;
  });

  afterEach(() => {
    // URL 복원
    window.history.replaceState({}, '', originalLocation);
  });

  describe('parseQuery()', () => {
    it('기본 쿼리 스트링을 파싱해야 함', () => {
      const params = URLUtil.parseQuery('?page=1&sort=name');
      
      expect(params.page).toBe('1');
      expect(params.sort).toBe('name');
    });

    it('? 없이도 파싱해야 함', () => {
      const params = URLUtil.parseQuery('page=1&sort=name');
      
      expect(params.page).toBe('1');
      expect(params.sort).toBe('name');
    });

    it('배열 파라미터를 처리해야 함', () => {
      const params = URLUtil.parseQuery('?tags[]=js&tags[]=css&tags[]=html');
      
      expect(Array.isArray(params.tags)).toBe(true);
      expect(params.tags).toEqual(['js', 'css', 'html']);
    });

    it('URL 인코딩된 값을 디코딩해야 함', () => {
      const params = URLUtil.parseQuery('?name=John%20Doe&email=test%40example.com');
      
      expect(params.name).toBe('John Doe');
      expect(params.email).toBe('test@example.com');
    });

    it('값이 없는 파라미터를 처리해야 함', () => {
      const params = URLUtil.parseQuery('?key1=&key2=value');
      
      expect(params.key1).toBe('');
      expect(params.key2).toBe('value');
    });

    it('빈 쿼리 스트링은 빈 객체를 반환해야 함', () => {
      expect(URLUtil.parseQuery('')).toEqual({});
      expect(URLUtil.parseQuery('?')).toEqual({});
    });

    it('복잡한 쿼리 스트링을 파싱해야 함', () => {
      const params = URLUtil.parseQuery('?id=123&name=John&active=true&tags[]=a&tags[]=b');
      
      expect(params.id).toBe('123');
      expect(params.name).toBe('John');
      expect(params.active).toBe('true');
      expect(params.tags).toEqual(['a', 'b']);
    });
  });

  describe('buildQuery()', () => {
    it('기본 쿼리 스트링을 생성해야 함', () => {
      const query = URLUtil.buildQuery({ page: 1, sort: 'name' });
      
      expect(query).toBe('?page=1&sort=name');
    });

    it('? 없이 생성할 수 있어야 함', () => {
      const query = URLUtil.buildQuery({ page: 1 }, false);
      
      expect(query).toBe('page=1');
    });

    it('배열을 쿼리 스트링으로 변환해야 함', () => {
      const query = URLUtil.buildQuery({ tags: ['js', 'css'] });
      
      expect(query).toBe('?tags[]=js&tags[]=css');
    });

    it('값을 URL 인코딩해야 함', () => {
      const query = URLUtil.buildQuery({ name: 'John Doe', email: 'test@example.com' });
      
      expect(query).toContain('John%20Doe');
      expect(query).toContain('test%40example.com');
    });

    it('null과 undefined를 스킵해야 함', () => {
      const query = URLUtil.buildQuery({ a: 1, b: null, c: undefined, d: 2 });
      
      expect(query).toContain('a=1');
      expect(query).toContain('d=2');
      expect(query).not.toContain('b=');
      expect(query).not.toContain('c=');
    });

    it('빈 객체는 빈 문자열을 반환해야 함', () => {
      expect(URLUtil.buildQuery({})).toBe('');
      expect(URLUtil.buildQuery(null)).toBe('?');
    });
  });

  describe('buildURL()', () => {
    it('URL과 파라미터를 결합해야 함', () => {
      const url = URLUtil.buildURL('/api/users', { page: 1, limit: 10 });
      
      expect(url).toBe('/api/users?page=1&limit=10');
    });

    it('이미 쿼리가 있는 URL에 추가해야 함', () => {
      const url = URLUtil.buildURL('/api/users?sort=name', { page: 1 });
      
      expect(url).toBe('/api/users?sort=name&page=1');
    });

    it('파라미터가 없으면 원본 URL을 반환해야 함', () => {
      expect(URLUtil.buildURL('/api/users', {})).toBe('/api/users');
      expect(URLUtil.buildURL('/api/users', null)).toBe('/api/users');
    });
  });

  describe('getParam()', () => {
    beforeEach(() => {
      // Mock location.search
      delete window.location;
      window.location = { search: '?id=123&name=John&active=true' };
    });

    it('특정 파라미터를 가져와야 함', () => {
      expect(URLUtil.getParam('id')).toBe('123');
      expect(URLUtil.getParam('name')).toBe('John');
    });

    it('없는 파라미터는 기본값을 반환해야 함', () => {
      expect(URLUtil.getParam('age', 0)).toBe(0);
      expect(URLUtil.getParam('email', null)).toBe(null);
    });
  });

  describe('parse()', () => {
    it('URL 전체를 파싱해야 함', () => {
      const info = URLUtil.parse('https://example.com:8080/path/to/page?id=1&name=test#section');
      
      expect(info.protocol).toBe('https:');
      expect(info.hostname).toBe('example.com');
      expect(info.port).toBe('8080');
      expect(info.pathname).toBe('/path/to/page');
      expect(info.search).toBe('?id=1&name=test');
      expect(info.hash).toBe('#section');
      expect(info.query).toEqual({ id: '1', name: 'test' });
    });

    it('포트가 없는 URL을 파싱해야 함', () => {
      const info = URLUtil.parse('https://example.com/path');
      
      expect(info.hostname).toBe('example.com');
      expect(info.port).toBe('');
      expect(info.pathname).toBe('/path');
    });
  });

  describe('실전 시나리오', () => {
    it('페이지네이션 URL 생성', () => {
      const baseUrl = '/api/users';
      
      const page1 = URLUtil.buildURL(baseUrl, { page: 1, limit: 10, sort: 'name' });
      expect(page1).toBe('/api/users?page=1&limit=10&sort=name');
      
      const page2 = URLUtil.buildURL(baseUrl, { page: 2, limit: 10, sort: 'name' });
      expect(page2).toBe('/api/users?page=2&limit=10&sort=name');
    });

    it('필터링 쿼리 스트링', () => {
      const filters = {
        status: 'active',
        role: 'admin',
        tags: ['javascript', 'react']
      };
      
      const query = URLUtil.buildQuery(filters);
      
      expect(query).toContain('status=active');
      expect(query).toContain('role=admin');
      expect(query).toContain('tags[]=javascript');
      expect(query).toContain('tags[]=react');
    });

    it('검색 쿼리 파싱', () => {
      const searchQuery = '?q=javascript%20framework&category=frontend&price_min=0&price_max=100';
      const params = URLUtil.parseQuery(searchQuery);
      
      expect(params.q).toBe('javascript framework');
      expect(params.category).toBe('frontend');
      expect(params.price_min).toBe('0');
      expect(params.price_max).toBe('100');
    });

    it('URL 빌더 체이닝', () => {
      let url = '/api/products';
      
      // 카테고리 추가
      url = URLUtil.buildURL(url, { category: 'electronics' });
      expect(url).toBe('/api/products?category=electronics');
      
      // 정렬 추가
      url = URLUtil.buildURL(url, { sort: 'price' });
      expect(url).toBe('/api/products?category=electronics&sort=price');
    });

    it('쿼리 파라미터 파싱 및 재구성', () => {
      const original = '?page=2&limit=20&sort=name&filter=active';
      
      // 파싱
      const params = URLUtil.parseQuery(original);
      
      // 수정
      params.page = 3;
      params.limit = 50;
      
      // 재구성
      const newQuery = URLUtil.buildQuery(params);
      
      expect(newQuery).toContain('page=3');
      expect(newQuery).toContain('limit=50');
      expect(newQuery).toContain('sort=name');
      expect(newQuery).toContain('filter=active');
    });
  });
});
