/**
 * Security Module 테스트
 */

import { describe, it, expect } from 'vitest';
import { Security } from '../../src/core/security.js';

describe('Security Module', () => {
  describe('escape()', () => {
    it('HTML 특수 문자를 이스케이프해야 함', () => {
      expect(Security.escape('<script>alert("XSS")</script>'))
        .toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;');
    });

    it('& 문자를 이스케이프해야 함', () => {
      expect(Security.escape('Tom & Jerry')).toBe('Tom &amp; Jerry');
    });

    it('작은따옴표를 이스케이프해야 함', () => {
      expect(Security.escape("It's fine")).toBe('It&#x27;s fine');
    });

    it('문자열이 아닌 값은 그대로 반환해야 함', () => {
      expect(Security.escape(123)).toBe(123);
      expect(Security.escape(null)).toBe(null);
      expect(Security.escape(undefined)).toBe(undefined);
    });
  });

  describe('sanitize()', () => {
    it('script 태그를 제거해야 함', () => {
      const html = '<p>안전</p><script>alert("XSS")</script>';
      const result = Security.sanitize(html);
      expect(result).not.toContain('<script>');
      expect(result).toContain('<p>안전</p>');
    });

    it('iframe 태그를 제거해야 함', () => {
      const html = '<div>내용</div><iframe src="evil.com"></iframe>';
      const result = Security.sanitize(html);
      expect(result).not.toContain('<iframe');
      expect(result).toContain('<div>내용</div>');
    });

    it('on* 이벤트 핸들러를 제거해야 함', () => {
      const html = '<button onclick="alert(1)">클릭</button>';
      const result = Security.sanitize(html);
      expect(result).not.toContain('onclick');
      expect(result).toContain('<button>클릭</button>');
    });

    it('javascript: URL을 제거해야 함', () => {
      const html = '<a href="javascript:alert(1)">링크</a>';
      const result = Security.sanitize(html);
      expect(result).not.toContain('javascript:');
    });

    it('안전한 HTML은 그대로 유지해야 함', () => {
      const html = '<div><h1>제목</h1><p>내용</p><a href="/page">링크</a></div>';
      const result = Security.sanitize(html);
      expect(result).toContain('<h1>제목</h1>');
      expect(result).toContain('<p>내용</p>');
      expect(result).toContain('<a href="/page">링크</a>');
    });

    it('빈 문자열을 반환해야 함 (문자열이 아닌 경우)', () => {
      expect(Security.sanitize(null)).toBe('');
      expect(Security.sanitize(123)).toBe('');
    });
  });

  describe('validatePath()', () => {
    it('안전한 경로는 true를 반환해야 함', () => {
      expect(Security.validatePath('views/home.html')).toBe(true);
      expect(Security.validatePath('views/users/profile.html')).toBe(true);
      expect(Security.validatePath('views/admin/dashboard.php')).toBe(true);
    });

    it('URL 쿼리 스트링이 포함된 경로를 허용해야 함', () => {
      expect(Security.validatePath('views/products.html?id=1')).toBe(true);
      expect(Security.validatePath('views/products.html?category=all&sort=asc')).toBe(true);
      expect(Security.validatePath('views/user.html?name=john')).toBe(true);
    });

    it('상위 디렉토리 접근을 차단해야 함', () => {
      expect(Security.validatePath('../etc/passwd')).toBe(false);
      expect(Security.validatePath('views/../config.php')).toBe(false);
      expect(Security.validatePath('views/..\\..\\config.php')).toBe(false);
    });

    it('절대 경로를 차단해야 함', () => {
      expect(Security.validatePath('/etc/passwd')).toBe(false);
      expect(Security.validatePath('/views/home.html')).toBe(false);
    });

    it('views/ 폴더 외부 경로를 차단해야 함', () => {
      expect(Security.validatePath('config/database.php')).toBe(false);
      expect(Security.validatePath('home.html')).toBe(false);
    });

    it('null byte를 차단해야 함', () => {
      expect(Security.validatePath('views/home.html\0.txt')).toBe(false);
      expect(Security.validatePath('views/home.html%00.txt')).toBe(false);
    });

    it('URL 인코딩 우회를 차단해야 함', () => {
      expect(Security.validatePath('views/%2e%2e%2fetc/passwd')).toBe(false);
    });

    it('허용되지 않은 확장자를 차단해야 함', () => {
      expect(Security.validatePath('views/script.js')).toBe(false);
      expect(Security.validatePath('views/data.json')).toBe(false);
    });

    it('위험한 문자를 차단해야 함', () => {
      expect(Security.validatePath('views/home<script>.html')).toBe(false);
      expect(Security.validatePath('views/home;rm -rf.html')).toBe(false);
    });

    it('빈 문자열이나 null을 차단해야 함', () => {
      expect(Security.validatePath('')).toBe(false);
      expect(Security.validatePath(null)).toBe(false);
    });
  });

  describe('isSafeFilename()', () => {
    it('안전한 파일명은 true를 반환해야 함', () => {
      expect(Security.isSafeFilename('document.pdf')).toBe(true);
      expect(Security.isSafeFilename('report_2024.xlsx')).toBe(true);
      expect(Security.isSafeFilename('image-01.png')).toBe(true);
    });

    it('경로 구분자를 포함하면 false를 반환해야 함', () => {
      expect(Security.isSafeFilename('folder/file.txt')).toBe(false);
      expect(Security.isSafeFilename('..\\..\\config.ini')).toBe(false);
    });

    it('.. 를 포함하면 false를 반환해야 함', () => {
      expect(Security.isSafeFilename('..file.txt')).toBe(false);
      expect(Security.isSafeFilename('file..txt')).toBe(false);
    });

    it('null byte를 차단해야 함', () => {
      expect(Security.isSafeFilename('file.txt\0.exe')).toBe(false);
    });

    it('위험한 문자를 차단해야 함', () => {
      expect(Security.isSafeFilename('file<script>.txt')).toBe(false);
      expect(Security.isSafeFilename('file;rm.txt')).toBe(false);
    });

    it('너무 긴 파일명을 차단해야 함', () => {
      const longName = 'a'.repeat(300) + '.txt';
      expect(Security.isSafeFilename(longName)).toBe(false);
    });

    it('빈 문자열이나 null을 차단해야 함', () => {
      expect(Security.isSafeFilename('')).toBe(false);
      expect(Security.isSafeFilename(null)).toBe(false);
    });
  });

  describe('isSafeUrl()', () => {
    it('안전한 URL은 true를 반환해야 함', () => {
      expect(Security.isSafeUrl('https://example.com')).toBe(true);
      expect(Security.isSafeUrl('http://example.com/page')).toBe(true);
      expect(Security.isSafeUrl('/relative/path')).toBe(true);
      expect(Security.isSafeUrl('data:image/png;base64,ABC')).toBe(true);
    });

    it('javascript: 프로토콜을 차단해야 함', () => {
      expect(Security.isSafeUrl('javascript:alert(1)')).toBe(false);
      expect(Security.isSafeUrl('JavaScript:alert(1)')).toBe(false);
    });

    it('vbscript: 프로토콜을 차단해야 함', () => {
      expect(Security.isSafeUrl('vbscript:msgbox(1)')).toBe(false);
    });

    it('file: 프로토콜을 차단해야 함', () => {
      expect(Security.isSafeUrl('file:///etc/passwd')).toBe(false);
    });

    it('data: 프로토콜(이미지 제외)을 차단해야 함', () => {
      expect(Security.isSafeUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
    });

    it('빈 문자열이나 null을 차단해야 함', () => {
      expect(Security.isSafeUrl('')).toBe(false);
      expect(Security.isSafeUrl(null)).toBe(false);
    });
  });

  describe('sanitizeCSS()', () => {
    it('안전한 CSS 값은 그대로 유지해야 함', () => {
      expect(Security.sanitizeCSS('red')).toBe('red');
      expect(Security.sanitizeCSS('100px')).toBe('100px');
      expect(Security.sanitizeCSS('#ff0000')).toBe('#ff0000');
    });

    it('expression()을 제거해야 함', () => {
      const css = 'width: expression(alert(1))';
      const result = Security.sanitizeCSS(css);
      expect(result).not.toContain('expression');
    });

    it('javascript: URL을 제거해야 함', () => {
      const css = 'background: url(javascript:alert(1))';
      const result = Security.sanitizeCSS(css);
      expect(result).not.toContain('javascript:');
    });

    it('@import를 제거해야 함', () => {
      const css = '@import url(evil.css)';
      const result = Security.sanitizeCSS(css);
      expect(result).not.toContain('@import');
    });

    it('빈 문자열을 반환해야 함 (문자열이 아닌 경우)', () => {
      expect(Security.sanitizeCSS(null)).toBe('');
      expect(Security.sanitizeCSS(123)).toBe('');
    });
  });

  describe('sanitizeParam()', () => {
    it('SQL 인젝션 문자를 제거해야 함', () => {
      expect(Security.sanitizeParam("'; DROP TABLE users--")).not.toContain("'");
      expect(Security.sanitizeParam('"; DROP TABLE users--')).not.toContain('"');
    });

    it('XSS 문자를 이스케이프해야 함', () => {
      const result = Security.sanitizeParam('<script>alert(1)</script>');
      expect(result).toContain('&lt;');
      expect(result).toContain('&gt;');
    });

    it('백슬래시를 제거해야 함', () => {
      expect(Security.sanitizeParam('test\\value')).not.toContain('\\');
    });

    it('문자열이 아닌 값은 그대로 반환해야 함', () => {
      expect(Security.sanitizeParam(123)).toBe(123);
      expect(Security.sanitizeParam(null)).toBe(null);
    });
  });
});
