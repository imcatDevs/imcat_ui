/**
 * Form Validation Module 테스트
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { FormValidator } from '../../src/core/form.js';

describe('Form Module', () => {
  let form;

  beforeEach(() => {
    // 테스트용 폼 생성
    form = document.createElement('form');
    form.id = 'test-form';
    form.innerHTML = `
      <input type="text" name="username" />
      <input type="email" name="email" />
      <input type="password" name="password" />
      <input type="password" name="confirmPassword" />
      <input type="text" name="age" />
      <input type="url" name="website" />
      <input type="text" name="phone" />
    `;
    document.body.appendChild(form);
  });

  afterEach(() => {
    if (form && form.parentNode) {
      form.parentNode.removeChild(form);
    }
  });

  describe('FormValidator.create()', () => {
    it('폼 검증기를 생성해야 함', () => {
      const validator = FormValidator.create('#test-form', {
        username: { required: true }
      });
      
      expect(validator).toBeInstanceOf(FormValidator);
      expect(validator.form).toBe(form);
    });

    it('HTML 요소를 직접 전달할 수 있어야 함', () => {
      const validator = FormValidator.create(form, {
        username: { required: true }
      });
      
      expect(validator.form).toBe(form);
    });
  });

  describe('필수 입력 (required)', () => {
    it('빈 값은 실패해야 함', () => {
      const validator = FormValidator.create(form, {
        username: { required: true }
      });
      
      form.elements.username.value = '';
      expect(validator.validate()).toBe(false);
      expect(validator.getError('username')).toContain('필수');
    });

    it('값이 있으면 성공해야 함', () => {
      const validator = FormValidator.create(form, {
        username: { required: true }
      });
      
      form.elements.username.value = 'john';
      expect(validator.validate()).toBe(true);
      expect(validator.getError('username')).toBe(null);
    });

    it('공백만 있으면 실패해야 함', () => {
      const validator = FormValidator.create(form, {
        username: { required: true }
      });
      
      form.elements.username.value = '   ';
      expect(validator.validate()).toBe(false);
    });
  });

  describe('이메일 검증 (email)', () => {
    it('올바른 이메일은 성공해야 함', () => {
      const validator = FormValidator.create(form, {
        email: { email: true }
      });
      
      form.elements.email.value = 'test@example.com';
      expect(validator.validate()).toBe(true);
    });

    it('잘못된 이메일은 실패해야 함', () => {
      const validator = FormValidator.create(form, {
        email: { email: true }
      });
      
      const invalidEmails = [
        'test',
        'test@',
        '@example.com',
        'test @example.com',
        'test@example'
      ];
      
      invalidEmails.forEach(email => {
        form.elements.email.value = email;
        expect(validator.validate()).toBe(false);
      });
    });

    it('빈 값은 통과해야 함 (required 없을 때)', () => {
      const validator = FormValidator.create(form, {
        email: { email: true }
      });
      
      form.elements.email.value = '';
      expect(validator.validate()).toBe(true);
    });
  });

  describe('길이 검증 (minLength, maxLength)', () => {
    it('minLength - 최소 길이 미만은 실패', () => {
      const validator = FormValidator.create(form, {
        password: { minLength: 8 }
      });
      
      form.elements.password.value = '1234567';
      expect(validator.validate()).toBe(false);
      expect(validator.getError('password')).toContain('8자');
    });

    it('minLength - 최소 길이 이상은 성공', () => {
      const validator = FormValidator.create(form, {
        password: { minLength: 8 }
      });
      
      form.elements.password.value = '12345678';
      expect(validator.validate()).toBe(true);
    });

    it('maxLength - 최대 길이 초과는 실패', () => {
      const validator = FormValidator.create(form, {
        username: { maxLength: 10 }
      });
      
      form.elements.username.value = '12345678901';
      expect(validator.validate()).toBe(false);
      expect(validator.getError('username')).toContain('10자');
    });

    it('maxLength - 최대 길이 이하는 성공', () => {
      const validator = FormValidator.create(form, {
        username: { maxLength: 10 }
      });
      
      form.elements.username.value = '1234567890';
      expect(validator.validate()).toBe(true);
    });
  });

  describe('숫자 범위 검증 (min, max)', () => {
    it('min - 최소값 미만은 실패', () => {
      const validator = FormValidator.create(form, {
        age: { min: 18 }
      });
      
      form.elements.age.value = '17';
      expect(validator.validate()).toBe(false);
      expect(validator.getError('age')).toContain('18');
    });

    it('min - 최소값 이상은 성공', () => {
      const validator = FormValidator.create(form, {
        age: { min: 18 }
      });
      
      form.elements.age.value = '18';
      expect(validator.validate()).toBe(true);
    });

    it('max - 최대값 초과는 실패', () => {
      const validator = FormValidator.create(form, {
        age: { max: 100 }
      });
      
      form.elements.age.value = '101';
      expect(validator.validate()).toBe(false);
      expect(validator.getError('age')).toContain('100');
    });

    it('max - 최대값 이하는 성공', () => {
      const validator = FormValidator.create(form, {
        age: { max: 100 }
      });
      
      form.elements.age.value = '100';
      expect(validator.validate()).toBe(true);
    });
  });

  describe('패턴 검증 (pattern)', () => {
    it('정규식 문자열로 패턴 검증', () => {
      const validator = FormValidator.create(form, {
        phone: { pattern: '^01[0-9]-\\d{3,4}-\\d{4}$' }
      });
      
      form.elements.phone.value = '010-1234-5678';
      expect(validator.validate()).toBe(true);
      
      form.elements.phone.value = '02-1234-5678';
      expect(validator.validate()).toBe(false);
    });

    it('RegExp 객체로 패턴 검증', () => {
      const validator = FormValidator.create(form, {
        phone: { pattern: /^01[0-9]-\d{3,4}-\d{4}$/ }
      });
      
      form.elements.phone.value = '010-1234-5678';
      expect(validator.validate()).toBe(true);
    });
  });

  describe('숫자 검증 (number)', () => {
    it('숫자는 성공해야 함', () => {
      const validator = FormValidator.create(form, {
        age: { number: true }
      });
      
      form.elements.age.value = '25';
      expect(validator.validate()).toBe(true);
    });

    it('문자는 실패해야 함', () => {
      const validator = FormValidator.create(form, {
        age: { number: true }
      });
      
      form.elements.age.value = 'abc';
      expect(validator.validate()).toBe(false);
      expect(validator.getError('age')).toContain('숫자');
    });

    it('소수는 성공해야 함', () => {
      const validator = FormValidator.create(form, {
        age: { number: true }
      });
      
      form.elements.age.value = '25.5';
      expect(validator.validate()).toBe(true);
    });
  });

  describe('URL 검증 (url)', () => {
    it('올바른 URL은 성공해야 함', () => {
      const validator = FormValidator.create(form, {
        website: { url: true }
      });
      
      const validUrls = [
        'https://example.com',
        'http://example.com',
        'https://www.example.com/path',
        'https://example.com:8080'
      ];
      
      validUrls.forEach(url => {
        form.elements.website.value = url;
        expect(validator.validate()).toBe(true);
      });
    });

    it('잘못된 URL은 실패해야 함', () => {
      const validator = FormValidator.create(form, {
        website: { url: true }
      });
      
      const invalidUrls = [
        'example',
        'example.com',
        '//example.com'
      ];
      
      invalidUrls.forEach(url => {
        form.elements.website.value = url;
        expect(validator.validate()).toBe(false);
      });
    });
  });

  describe('필드 일치 검증 (match)', () => {
    it('같은 값이면 성공해야 함', () => {
      const validator = FormValidator.create(form, {
        password: { required: true },
        confirmPassword: { match: 'password' }
      });
      
      form.elements.password.value = 'password123';
      form.elements.confirmPassword.value = 'password123';
      expect(validator.validate()).toBe(true);
    });

    it('다른 값이면 실패해야 함', () => {
      const validator = FormValidator.create(form, {
        password: { required: true },
        confirmPassword: { match: 'password' }
      });
      
      form.elements.password.value = 'password123';
      form.elements.confirmPassword.value = 'password456';
      expect(validator.validate()).toBe(false);
      expect(validator.getError('confirmPassword')).toContain('일치');
    });
  });

  describe('복합 검증', () => {
    it('여러 규칙을 동시에 검증해야 함', () => {
      const validator = FormValidator.create(form, {
        email: { required: true, email: true },
        password: { required: true, minLength: 8 },
        age: { required: true, number: true, min: 18, max: 100 }
      });
      
      // 모두 유효
      form.elements.email.value = 'test@example.com';
      form.elements.password.value = 'password123';
      form.elements.age.value = '25';
      expect(validator.validate()).toBe(true);
      
      // password가 너무 짧음
      form.elements.password.value = '1234567';
      expect(validator.validate()).toBe(false);
      expect(validator.getError('password')).toContain('8자');
    });

    it('첫 번째 실패한 규칙의 에러를 반환해야 함', () => {
      const validator = FormValidator.create(form, {
        password: { required: true, minLength: 8 }
      });
      
      form.elements.password.value = '';
      validator.validate();
      expect(validator.getError('password')).toContain('필수');
    });
  });

  describe('getErrors()', () => {
    it('모든 에러를 반환해야 함', () => {
      const validator = FormValidator.create(form, {
        email: { required: true, email: true },
        password: { required: true, minLength: 8 }
      });
      
      form.elements.email.value = 'invalid';
      form.elements.password.value = '123';
      
      validator.validate();
      const errors = validator.getErrors();
      
      expect(Object.keys(errors).length).toBe(2);
      expect(errors.email).toBeDefined();
      expect(errors.password).toBeDefined();
    });
  });

  describe('isValid()', () => {
    it('에러가 없으면 true를 반환해야 함', () => {
      const validator = FormValidator.create(form, {
        username: { required: true }
      });
      
      form.elements.username.value = 'john';
      validator.validate();
      expect(validator.isValid()).toBe(true);
    });

    it('에러가 있으면 false를 반환해야 함', () => {
      const validator = FormValidator.create(form, {
        username: { required: true }
      });
      
      form.elements.username.value = '';
      validator.validate();
      expect(validator.isValid()).toBe(false);
    });
  });

  describe('reset()', () => {
    it('폼과 에러를 리셋해야 함', () => {
      const validator = FormValidator.create(form, {
        username: { required: true }
      });
      
      form.elements.username.value = 'john';
      validator.validate();
      
      validator.reset();
      
      expect(form.elements.username.value).toBe('');
      expect(validator.getErrors()).toEqual({});
    });
  });

  describe('destroy()', () => {
    it('이벤트 리스너를 제거해야 함', () => {
      const validator = FormValidator.create(form, {
        username: { required: true }
      }, { validateOnBlur: true });
      
      expect(validator._eventHandlers.length).toBeGreaterThan(0);
      
      validator.destroy();
      
      expect(validator._eventHandlers.length).toBe(0);
    });
  });

  describe('커스텀 검증 (custom)', () => {
    it('커스텀 함수로 검증할 수 있어야 함', () => {
      const validator = FormValidator.create(form, {
        username: {
          custom: (value) => {
            return {
              valid: value.length >= 3 && value.length <= 10,
              message: '3-10자 사이여야 합니다.'
            };
          }
        }
      });
      
      form.elements.username.value = 'ab';
      expect(validator.validate()).toBe(false);
      expect(validator.getError('username')).toContain('3-10자');
      
      form.elements.username.value = 'abc';
      expect(validator.validate()).toBe(true);
    });

    it('boolean만 반환하는 커스텀 함수', () => {
      const validator = FormValidator.create(form, {
        username: {
          custom: (value) => value.startsWith('user_')
        }
      });
      
      form.elements.username.value = 'john';
      expect(validator.validate()).toBe(false);
      
      form.elements.username.value = 'user_john';
      expect(validator.validate()).toBe(true);
    });
  });

  describe('addValidator() - 검증 규칙 추가', () => {
    it('새로운 검증 규칙을 추가할 수 있어야 함', () => {
      const validator = FormValidator.create(form, {
        phone: { custom: (value) => true }
      });
      
      validator.addValidator('koreanPhone', {
        validate: (value) => ({
          valid: /^01[0-9]-\d{3,4}-\d{4}$/.test(value),
          message: '올바른 전화번호 형식이 아닙니다.'
        })
      });
      
      expect(validator.validators.koreanPhone).toBeDefined();
    });
  });

  describe('실전 시나리오', () => {
    it('회원가입 폼 검증', () => {
      const validator = FormValidator.create(form, {
        username: { required: true, minLength: 3, maxLength: 20 },
        email: { required: true, email: true },
        password: { 
          required: true, 
          minLength: 8,
          pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/
        },
        confirmPassword: { required: true, match: 'password' },
        age: { required: true, number: true, min: 18 }
      });
      
      // 유효한 데이터
      form.elements.username.value = 'john_doe';
      form.elements.email.value = 'john@example.com';
      form.elements.password.value = 'password123';
      form.elements.confirmPassword.value = 'password123';
      form.elements.age.value = '25';
      
      expect(validator.validate()).toBe(true);
      expect(validator.isValid()).toBe(true);
    });

    it('로그인 폼 검증', () => {
      const validator = FormValidator.create(form, {
        email: { required: true, email: true },
        password: { required: true }
      });
      
      // 빈 폼
      form.elements.email.value = '';
      form.elements.password.value = '';
      expect(validator.validate()).toBe(false);
      
      const errors = validator.getErrors();
      expect(Object.keys(errors).length).toBe(2);
      
      // 유효한 데이터
      form.elements.email.value = 'user@example.com';
      form.elements.password.value = 'mypassword';
      expect(validator.validate()).toBe(true);
    });
  });
});
