/**
 * Form Validation Module
 * @module core/form
 */

/**
 * 폼 검증 유틸리티
 * @class
 * @description 폼 입력 값의 검증을 수행하는 클래스입니다.
 * 다양한 검증 규칙(required, email, min, max 등)을 제공합니다.
 *
 * @example
 * const validator = new FormValidator('#myForm', {
 *   rules: { email: ['required', 'email'] }
 * });
 */
export class FormValidator {
  /**
   * 폼 검증기 생성
   * @param {string|HTMLElement} form - 폼 선택자 또는 요소
   * @param {Object} rules - 검증 규칙
   * @param {Object} [options={}] - 옵션
   * @returns {FormValidator} 검증기 인스턴스
   *
   * @example
   * const validator = FormValidator.create('#login-form', {
   *   email: { required: true, email: true },
   *   password: { required: true, minLength: 8 }
   * });
   */
  static create(form, rules, options = {}) {
    return new FormValidator(form, rules, options);
  }

  constructor(form, rules, options = {}) {
    this.form = typeof form === 'string' ? document.querySelector(form) : form;
    this.rules = rules;
    this.options = {
      validateOnBlur: true,
      validateOnInput: false,
      errorClass: 'is-invalid',
      successClass: 'is-valid',
      errorMessageClass: 'error-message',
      showErrorMessages: true,
      ...options
    };

    this.errors = {};
    this.touched = {};
    this._eventHandlers = [];

    this._init();
  }

  /**
   * 초기화
   * @private
   */
  _init() {
    if (!this.form) return;

    // 각 필드에 이벤트 리스너 추가
    Object.keys(this.rules).forEach(fieldName => {
      const field = this.form.elements[fieldName];
      if (!field) return;

      if (this.options.validateOnBlur) {
        const blurHandler = () => this._validateField(fieldName);
        field.addEventListener('blur', blurHandler);
        this._eventHandlers.push({ element: field, event: 'blur', handler: blurHandler });
      }

      if (this.options.validateOnInput) {
        const inputHandler = () => this._validateField(fieldName);
        field.addEventListener('input', inputHandler);
        this._eventHandlers.push({ element: field, event: 'input', handler: inputHandler });
      }
    });

    // 폼 제출 이벤트
    const submitHandler = (e) => {
      if (!this.validate()) {
        e.preventDefault();
      }
    };
    this.form.addEventListener('submit', submitHandler);
    this._eventHandlers.push({ element: this.form, event: 'submit', handler: submitHandler });
  }

  /**
   * 단일 필드 검증
   * @param {string} fieldName - 필드 이름
   * @returns {boolean} 검증 성공 여부
   */
  _validateField(fieldName) {
    const field = this.form.elements[fieldName];
    if (!field) return true;

    const rules = this.rules[fieldName];
    const value = field.value;

    this.touched[fieldName] = true;

    // 모든 규칙 검사
    for (const [ruleName, ruleValue] of Object.entries(rules)) {
      const validator = this.validators[ruleName];
      if (!validator) continue;

      const result = validator.validate(value, ruleValue, this.form);
      if (!result.valid) {
        this.errors[fieldName] = result.message;
        this._updateFieldUI(field, false, result.message);
        return false;
      }
    }

    // 모든 규칙 통과
    delete this.errors[fieldName];
    this._updateFieldUI(field, true);
    return true;
  }

  /**
   * 전체 폼 검증
   * @returns {boolean} 검증 성공 여부
   */
  validate() {
    let isValid = true;

    Object.keys(this.rules).forEach(fieldName => {
      if (!this._validateField(fieldName)) {
        isValid = false;
      }
    });

    return isValid;
  }

  /**
   * 필드 UI 업데이트
   * @private
   */
  _updateFieldUI(field, isValid, errorMessage = '') {
    // 클래스 업데이트
    field.classList.remove(this.options.errorClass, this.options.successClass);
    field.classList.add(isValid ? this.options.successClass : this.options.errorClass);

    // 에러 메시지 표시
    if (this.options.showErrorMessages) {
      let errorEl = field.parentElement.querySelector(`.${this.options.errorMessageClass}`);

      if (!isValid && errorMessage) {
        if (!errorEl) {
          errorEl = document.createElement('div');
          errorEl.className = this.options.errorMessageClass;
          field.parentElement.appendChild(errorEl);
        }
        errorEl.textContent = errorMessage;
        errorEl.style.display = 'block';
      } else if (errorEl) {
        errorEl.style.display = 'none';
      }
    }
  }

  /**
   * 에러 목록 가져오기
   * @returns {Object} 에러 객체
   */
  getErrors() {
    return { ...this.errors };
  }

  /**
   * 특정 필드의 에러 가져오기
   * @param {string} fieldName - 필드 이름
   * @returns {string|null} 에러 메시지
   */
  getError(fieldName) {
    return this.errors[fieldName] || null;
  }

  /**
   * 검증 성공 여부
   * @returns {boolean}
   */
  isValid() {
    return Object.keys(this.errors).length === 0;
  }

  /**
   * 폼 리셋
   */
  reset() {
    this.errors = {};
    this.touched = {};

    if (this.form) {
      this.form.reset();

      // UI 초기화
      Object.keys(this.rules).forEach(fieldName => {
        const field = this.form.elements[fieldName];
        if (field) {
          field.classList.remove(this.options.errorClass, this.options.successClass);
          const errorEl = field.parentElement.querySelector(`.${this.options.errorMessageClass}`);
          if (errorEl) {
            errorEl.style.display = 'none';
          }
        }
      });
    }
  }

  /**
   * 이벤트 리스너 정리
   */
  destroy() {
    this._eventHandlers.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this._eventHandlers = [];
  }

  /**
   * 기본 검증 규칙
   */
  validators = {
    required: {
      validate: (value) => ({
        valid: value !== null && value !== undefined && value.trim() !== '',
        message: '필수 입력 항목입니다.'
      })
    },

    email: {
      validate: (value) => {
        if (!value) return { valid: true };
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return {
          valid: regex.test(value),
          message: '올바른 이메일 형식이 아닙니다.'
        };
      }
    },

    minLength: {
      validate: (value, min) => ({
        valid: !value || value.length >= min,
        message: `최소 ${min}자 이상 입력해주세요.`
      })
    },

    maxLength: {
      validate: (value, max) => ({
        valid: !value || value.length <= max,
        message: `최대 ${max}자까지 입력 가능합니다.`
      })
    },

    min: {
      validate: (value, min) => {
        if (!value) return { valid: true };
        const num = Number(value);
        return {
          valid: !isNaN(num) && num >= min,
          message: `${min} 이상의 값을 입력해주세요.`
        };
      }
    },

    max: {
      validate: (value, max) => {
        if (!value) return { valid: true };
        const num = Number(value);
        return {
          valid: !isNaN(num) && num <= max,
          message: `${max} 이하의 값을 입력해주세요.`
        };
      }
    },

    pattern: {
      validate: (value, pattern) => {
        if (!value) return { valid: true };
        const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
        return {
          valid: regex.test(value),
          message: '입력 형식이 올바르지 않습니다.'
        };
      }
    },

    number: {
      validate: (value) => {
        if (!value || value.trim() === '') return { valid: true };
        return {
          valid: !isNaN(Number(value)) && value.trim() !== '',
          message: '숫자만 입력 가능합니다.'
        };
      }
    },

    url: {
      validate: (value) => {
        if (!value) return { valid: true };
        try {
          new URL(value);
          return { valid: true };
        } catch {
          return {
            valid: false,
            message: '올바른 URL 형식이 아닙니다.'
          };
        }
      }
    },

    match: {
      validate: (value, targetFieldName, form) => {
        if (!value) return { valid: true };
        const targetField = form.elements[targetFieldName];
        return {
          valid: targetField && value === targetField.value,
          message: '입력값이 일치하지 않습니다.'
        };
      }
    },

    custom: {
      validate: (value, fn) => {
        const result = fn(value);
        if (typeof result === 'boolean') {
          return {
            valid: result,
            message: '유효하지 않은 값입니다.'
          };
        }
        return result;
      }
    }
  };

  /**
   * 커스텀 검증 규칙 추가
   * @param {string} name - 규칙 이름
   * @param {Function} validator - 검증 함수
   */
  addValidator(name, validator) {
    this.validators[name] = validator;
  }
}

export default FormValidator;
