/**
 * Security Input Module
 * OTP 입력, PIN 입력 등 보안 관련 입력 컴포넌트
 * @module security-input
 */

/**
 * OTP 입력 컴포넌트
 * 6자리 인증 코드 입력에 최적화
 */
class OTPInput {
  static instances = new Map();

  static defaults() {
    return {
      length: 6,              // OTP 길이
      type: 'number',         // 'number' | 'text' | 'password'
      autoFocus: true,        // 첫 번째 입력에 자동 포커스
      autoSubmit: true,       // 모든 입력 완료 시 자동 제출
      separator: false,       // 구분선 표시 (3-3 형태)
      separatorPosition: 3,   // 구분선 위치
      mask: false,            // 입력 마스킹
      placeholder: '○',       // 플레이스홀더
      disabled: false,
      error: false,
      errorMessage: '',
      onComplete: null,       // 완료 콜백
      onChange: null,         // 변경 콜백
      onFocus: null,
      onBlur: null
    };
  }

  constructor(container, options = {}) {
    this.container = typeof container === 'string' 
      ? document.querySelector(container) 
      : container;
    
    if (!this.container) {
      console.error('OTPInput: Container not found');
      return;
    }

    if (OTPInput.instances.has(this.container)) {
      OTPInput.instances.get(this.container).destroy();
    }

    this.options = { ...OTPInput.defaults(), ...options };
    this.inputs = [];
    this.value = '';
    
    this._onInput = null;
    this._onKeyDown = null;
    this._onPaste = null;
    this._onFocus = null;
    this._onBlur = null;

    this.init();
    OTPInput.instances.set(this.container, this);
  }

  init() {
    this._render();
    this._bindEvents();
    
    if (this.options.autoFocus && !this.options.disabled) {
      setTimeout(() => this.inputs[0]?.focus(), 0);
    }
  }

  _render() {
    const { length, type, separator, separatorPosition, placeholder, disabled, error, errorMessage, mask } = this.options;
    
    this.container.classList.add('otp-input');
    if (error) this.container.classList.add('otp-input--error');
    if (disabled) this.container.classList.add('otp-input--disabled');
    
    let html = '<div class="otp-input__fields">';
    
    for (let i = 0; i < length; i++) {
      if (separator && i === separatorPosition) {
        html += '<span class="otp-input__separator">-</span>';
      }
      
      const inputType = mask ? 'password' : (type === 'number' ? 'tel' : type);
      html += `
        <input 
          type="${inputType}"
          class="otp-input__field"
          maxlength="1"
          placeholder="${placeholder}"
          ${type === 'number' ? 'inputmode="numeric" pattern="[0-9]*"' : ''}
          ${disabled ? 'disabled' : ''}
          data-index="${i}"
          autocomplete="one-time-code"
        >
      `;
    }
    
    html += '</div>';
    
    if (errorMessage) {
      html += `<div class="otp-input__error">${errorMessage}</div>`;
    }
    
    this.container.innerHTML = html;
    this.inputs = Array.from(this.container.querySelectorAll('.otp-input__field'));
  }

  _bindEvents() {
    this._onInput = (e) => {
      const input = e.target;
      const index = parseInt(input.dataset.index);
      const value = input.value;
      
      // 숫자만 허용 (number 타입일 때)
      if (this.options.type === 'number' && !/^\d*$/.test(value)) {
        input.value = '';
        return;
      }
      
      // 값이 있으면 다음 입력으로 이동
      if (value && index < this.options.length - 1) {
        this.inputs[index + 1].focus();
      }
      
      this._updateValue();
      
      // 완료 체크
      if (this.value.length === this.options.length && this.options.autoSubmit) {
        if (this.options.onComplete) {
          this.options.onComplete(this.value);
        }
      }
    };

    this._onKeyDown = (e) => {
      const input = e.target;
      const index = parseInt(input.dataset.index);
      
      switch (e.key) {
        case 'Backspace':
          if (!input.value && index > 0) {
            this.inputs[index - 1].focus();
            this.inputs[index - 1].value = '';
          }
          break;
        case 'ArrowLeft':
          if (index > 0) {
            e.preventDefault();
            this.inputs[index - 1].focus();
          }
          break;
        case 'ArrowRight':
          if (index < this.options.length - 1) {
            e.preventDefault();
            this.inputs[index + 1].focus();
          }
          break;
      }
    };

    this._onPaste = (e) => {
      e.preventDefault();
      const pastedData = e.clipboardData.getData('text').trim();
      const chars = pastedData.split('').slice(0, this.options.length);
      
      chars.forEach((char, i) => {
        if (this.inputs[i]) {
          if (this.options.type === 'number' && !/^\d$/.test(char)) return;
          this.inputs[i].value = char;
        }
      });
      
      // 마지막 입력으로 포커스
      const lastIndex = Math.min(chars.length, this.options.length) - 1;
      if (lastIndex >= 0) {
        this.inputs[lastIndex].focus();
      }
      
      this._updateValue();
      
      if (this.value.length === this.options.length && this.options.autoSubmit) {
        if (this.options.onComplete) {
          this.options.onComplete(this.value);
        }
      }
    };

    this._onFocus = (e) => {
      e.target.select();
      if (this.options.onFocus) this.options.onFocus(e);
    };

    this._onBlur = (e) => {
      if (this.options.onBlur) this.options.onBlur(e);
    };

    this.inputs.forEach(input => {
      input.addEventListener('input', this._onInput);
      input.addEventListener('keydown', this._onKeyDown);
      input.addEventListener('paste', this._onPaste);
      input.addEventListener('focus', this._onFocus);
      input.addEventListener('blur', this._onBlur);
    });
  }

  _updateValue() {
    this.value = this.inputs.map(input => input.value).join('');
    if (this.options.onChange) {
      this.options.onChange(this.value);
    }
  }

  // Public API
  getValue() {
    return this.value;
  }

  setValue(value) {
    const chars = String(value).split('').slice(0, this.options.length);
    this.inputs.forEach((input, i) => {
      input.value = chars[i] || '';
    });
    this._updateValue();
  }

  clear() {
    this.inputs.forEach(input => input.value = '');
    this.value = '';
    if (this.options.autoFocus) {
      this.inputs[0]?.focus();
    }
  }

  focus() {
    this.inputs[0]?.focus();
  }

  setError(message) {
    this.container.classList.add('otp-input--error');
    const errorEl = this.container.querySelector('.otp-input__error');
    if (errorEl) {
      errorEl.textContent = message;
    } else {
      const errorDiv = document.createElement('div');
      errorDiv.className = 'otp-input__error';
      errorDiv.textContent = message;
      this.container.appendChild(errorDiv);
    }
  }

  clearError() {
    this.container.classList.remove('otp-input--error');
    const errorEl = this.container.querySelector('.otp-input__error');
    if (errorEl) errorEl.remove();
  }

  disable() {
    this.options.disabled = true;
    this.container.classList.add('otp-input--disabled');
    this.inputs.forEach(input => input.disabled = true);
  }

  enable() {
    this.options.disabled = false;
    this.container.classList.remove('otp-input--disabled');
    this.inputs.forEach(input => input.disabled = false);
  }

  destroy() {
    this.inputs.forEach(input => {
      if (this._onInput) input.removeEventListener('input', this._onInput);
      if (this._onKeyDown) input.removeEventListener('keydown', this._onKeyDown);
      if (this._onPaste) input.removeEventListener('paste', this._onPaste);
      if (this._onFocus) input.removeEventListener('focus', this._onFocus);
      if (this._onBlur) input.removeEventListener('blur', this._onBlur);
    });
    
    OTPInput.instances.delete(this.container);
    
    if (this.container) {
      this.container.innerHTML = '';
      this.container.className = '';
    }
    
    this.container = null;
    this.inputs = null;
  }
}


/**
 * PIN 입력 컴포넌트
 * 4-6자리 PIN 코드 입력 (보안 강화)
 */
class PinInput {
  static instances = new Map();

  static defaults() {
    return {
      length: 4,              // PIN 길이
      mask: true,             // 입력 마스킹 (●으로 표시)
      showToggle: true,       // 보이기/숨기기 토글
      numeric: true,          // 숫자만 허용
      autoFocus: true,
      autoSubmit: true,
      disabled: false,
      error: false,
      errorMessage: '',
      keypad: false,          // 가상 키패드 표시
      shuffleKeypad: false,   // 키패드 셔플 (보안)
      onComplete: null,
      onChange: null
    };
  }

  constructor(container, options = {}) {
    this.container = typeof container === 'string' 
      ? document.querySelector(container) 
      : container;
    
    if (!this.container) {
      console.error('PinInput: Container not found');
      return;
    }

    if (PinInput.instances.has(this.container)) {
      PinInput.instances.get(this.container).destroy();
    }

    this.options = { ...PinInput.defaults(), ...options };
    this.inputs = [];
    this.value = '';
    this.isVisible = false;
    
    this._handlers = {};

    this.init();
    PinInput.instances.set(this.container, this);
  }

  init() {
    this._render();
    this._bindEvents();
    
    if (this.options.autoFocus && !this.options.disabled) {
      setTimeout(() => this.inputs[0]?.focus(), 0);
    }
  }

  _render() {
    const { length, mask, showToggle, disabled, error, errorMessage, keypad } = this.options;
    
    this.container.classList.add('pin-input');
    if (error) this.container.classList.add('pin-input--error');
    if (disabled) this.container.classList.add('pin-input--disabled');
    
    let html = `
      <div class="pin-input__wrapper">
        <div class="pin-input__fields">
    `;
    
    for (let i = 0; i < length; i++) {
      html += `
        <div class="pin-input__field-wrapper">
          <input 
            type="${mask ? 'password' : 'tel'}"
            class="pin-input__field"
            maxlength="1"
            inputmode="numeric"
            pattern="[0-9]*"
            ${disabled ? 'disabled' : ''}
            data-index="${i}"
            autocomplete="off"
          >
          <div class="pin-input__dot ${mask ? '' : 'pin-input__dot--hidden'}"></div>
        </div>
      `;
    }
    
    html += '</div>';
    
    if (showToggle) {
      html += `
        <button type="button" class="pin-input__toggle" aria-label="Toggle visibility">
          <i class="material-icons-outlined">${mask ? 'visibility' : 'visibility_off'}</i>
        </button>
      `;
    }
    
    html += '</div>';
    
    if (errorMessage) {
      html += `<div class="pin-input__error">${errorMessage}</div>`;
    }
    
    if (keypad) {
      html += this._renderKeypad();
    }
    
    this.container.innerHTML = html;
    this.inputs = Array.from(this.container.querySelectorAll('.pin-input__field'));
  }

  _renderKeypad() {
    let numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'backspace'];
    
    if (this.options.shuffleKeypad) {
      // 0-9 셔플
      const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
      for (let i = digits.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [digits[i], digits[j]] = [digits[j], digits[i]];
      }
      numbers = [...digits.slice(0, 9), '', digits[9], 'backspace'];
    }
    
    let html = '<div class="pin-input__keypad">';
    
    numbers.forEach(num => {
      if (num === '') {
        html += '<button type="button" class="pin-input__key pin-input__key--empty" disabled></button>';
      } else if (num === 'backspace') {
        html += `
          <button type="button" class="pin-input__key pin-input__key--backspace" data-key="backspace">
            <i class="material-icons-outlined">backspace</i>
          </button>
        `;
      } else {
        html += `<button type="button" class="pin-input__key" data-key="${num}">${num}</button>`;
      }
    });
    
    html += '</div>';
    return html;
  }

  _bindEvents() {
    this._handlers.onInput = (e) => {
      const input = e.target;
      const index = parseInt(input.dataset.index);
      let value = input.value;
      
      // 숫자만 허용
      if (this.options.numeric && !/^\d*$/.test(value)) {
        input.value = '';
        return;
      }
      
      // 다음 입력으로 이동
      if (value && index < this.options.length - 1) {
        this.inputs[index + 1].focus();
      }
      
      this._updateValue();
      this._checkComplete();
    };

    this._handlers.onKeyDown = (e) => {
      const input = e.target;
      const index = parseInt(input.dataset.index);
      
      if (e.key === 'Backspace' && !input.value && index > 0) {
        this.inputs[index - 1].focus();
        this.inputs[index - 1].value = '';
        this._updateValue();
      }
    };

    this._handlers.onFocus = (e) => {
      e.target.select();
    };

    this._handlers.onToggle = () => {
      this.isVisible = !this.isVisible;
      const type = this.isVisible ? 'tel' : 'password';
      this.inputs.forEach(input => input.type = type);
      
      const toggle = this.container.querySelector('.pin-input__toggle i');
      if (toggle) {
        toggle.textContent = this.isVisible ? 'visibility_off' : 'visibility';
      }
      
      // 점 표시 토글
      this.container.querySelectorAll('.pin-input__dot').forEach(dot => {
        dot.classList.toggle('pin-input__dot--hidden', this.isVisible);
      });
    };

    this._handlers.onKeypadClick = (e) => {
      const key = e.target.closest('.pin-input__key')?.dataset.key;
      if (!key) return;
      
      if (key === 'backspace') {
        // 마지막 입력된 값 삭제
        for (let i = this.options.length - 1; i >= 0; i--) {
          if (this.inputs[i].value) {
            this.inputs[i].value = '';
            this.inputs[i].focus();
            break;
          }
        }
      } else {
        // 다음 빈 칸에 입력
        for (let i = 0; i < this.options.length; i++) {
          if (!this.inputs[i].value) {
            this.inputs[i].value = key;
            if (i < this.options.length - 1) {
              this.inputs[i + 1].focus();
            }
            break;
          }
        }
      }
      
      this._updateValue();
      this._checkComplete();
    };

    // 이벤트 바인딩
    this.inputs.forEach(input => {
      input.addEventListener('input', this._handlers.onInput);
      input.addEventListener('keydown', this._handlers.onKeyDown);
      input.addEventListener('focus', this._handlers.onFocus);
    });

    const toggle = this.container.querySelector('.pin-input__toggle');
    if (toggle) {
      toggle.addEventListener('click', this._handlers.onToggle);
    }

    const keypad = this.container.querySelector('.pin-input__keypad');
    if (keypad) {
      keypad.addEventListener('click', this._handlers.onKeypadClick);
    }
  }

  _updateValue() {
    this.value = this.inputs.map(input => input.value).join('');
    if (this.options.onChange) {
      this.options.onChange(this.value);
    }
  }

  _checkComplete() {
    if (this.value.length === this.options.length && this.options.autoSubmit) {
      if (this.options.onComplete) {
        this.options.onComplete(this.value);
      }
    }
  }

  // Public API
  getValue() {
    return this.value;
  }

  setValue(value) {
    const chars = String(value).split('').slice(0, this.options.length);
    this.inputs.forEach((input, i) => {
      input.value = chars[i] || '';
    });
    this._updateValue();
  }

  clear() {
    this.inputs.forEach(input => input.value = '');
    this.value = '';
    if (this.options.autoFocus) {
      this.inputs[0]?.focus();
    }
  }

  focus() {
    this.inputs[0]?.focus();
  }

  setError(message) {
    this.container.classList.add('pin-input--error');
    let errorEl = this.container.querySelector('.pin-input__error');
    if (!errorEl) {
      errorEl = document.createElement('div');
      errorEl.className = 'pin-input__error';
      this.container.querySelector('.pin-input__wrapper').after(errorEl);
    }
    errorEl.textContent = message;
  }

  clearError() {
    this.container.classList.remove('pin-input--error');
    const errorEl = this.container.querySelector('.pin-input__error');
    if (errorEl) errorEl.remove();
  }

  shuffleKeypad() {
    const keypad = this.container.querySelector('.pin-input__keypad');
    if (keypad) {
      keypad.remove();
      this.container.insertAdjacentHTML('beforeend', this._renderKeypad());
    }
  }

  disable() {
    this.options.disabled = true;
    this.container.classList.add('pin-input--disabled');
    this.inputs.forEach(input => input.disabled = true);
  }

  enable() {
    this.options.disabled = false;
    this.container.classList.remove('pin-input--disabled');
    this.inputs.forEach(input => input.disabled = false);
  }

  destroy() {
    this.inputs.forEach(input => {
      input.removeEventListener('input', this._handlers.onInput);
      input.removeEventListener('keydown', this._handlers.onKeyDown);
      input.removeEventListener('focus', this._handlers.onFocus);
    });
    
    const toggle = this.container.querySelector('.pin-input__toggle');
    if (toggle) {
      toggle.removeEventListener('click', this._handlers.onToggle);
    }

    const keypad = this.container.querySelector('.pin-input__keypad');
    if (keypad) {
      keypad.removeEventListener('click', this._handlers.onKeypadClick);
    }
    
    PinInput.instances.delete(this.container);
    
    if (this.container) {
      this.container.innerHTML = '';
      this.container.className = '';
    }
    
    this.container = null;
    this.inputs = null;
    this._handlers = null;
  }
}


export { OTPInput, PinInput };
export default { OTPInput, PinInput };
