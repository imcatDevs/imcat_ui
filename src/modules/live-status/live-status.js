/**
 * Live Status Module
 * 실시간 상태 표시 컴포넌트
 * @module modules/live-status
 */

// ============================================
// OnlineStatus - 온라인/오프라인 상태
// ============================================

/**
 * OnlineStatus 클래스
 * 사용자의 온라인/오프라인 상태 표시
 */
class OnlineStatus {
  /** @type {Map<HTMLElement, OnlineStatus>} */
  static instances = new Map();

  /**
   * 기본 옵션
   * @returns {Object}
   */
  static defaults() {
    return {
      status: 'online',         // 'online' | 'offline' | 'away' | 'busy' | 'dnd'
      showLabel: false,
      size: 'md',               // 'sm' | 'md' | 'lg'
      position: 'bottom-right', // 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
      pulse: true,              // 온라인 시 펄스 애니메이션
      onChange: null           // (status) => {}
    };
  }

  /**
   * @param {string|HTMLElement} selector
   * @param {Object} options
   */
  constructor(selector, options = {}) {
    this.container = typeof selector === 'string'
      ? document.querySelector(selector)
      : selector;

    if (!this.container) {
      console.error('OnlineStatus: Container not found');
      return;
    }

    this.options = { ...OnlineStatus.defaults(), ...options };
    this._status = this.options.status;
    this.indicator = null;

    this.init();
    OnlineStatus.instances.set(this.container, this);
  }

  init() {
    this._render();
  }

  _render() {
    const { size, position, showLabel, pulse } = this.options;

    this.container.classList.add('online-status-wrapper');
    this.container.style.position = 'relative';
    this.container.style.display = 'inline-block';

    this.indicator = document.createElement('span');
    this.indicator.className = `online-status online-status--${size} online-status--${position}`;
    if (pulse && this._status === 'online') {
      this.indicator.classList.add('online-status--pulse');
    }
    this.indicator.setAttribute('data-status', this._status);
    this.indicator.setAttribute('aria-label', this._getStatusLabel());

    if (showLabel) {
      this.indicator.innerHTML = `<span class="online-status__label">${this._getStatusLabel()}</span>`;
    }

    this.container.appendChild(this.indicator);
  }

  _getStatusLabel() {
    const labels = {
      online: '온라인',
      offline: '오프라인',
      away: '자리 비움',
      busy: '바쁨',
      dnd: '방해 금지'
    };
    return labels[this._status] || this._status;
  }

  /**
   * 상태 설정
   * @param {string} status
   */
  setStatus(status) {
    const prevStatus = this._status;
    this._status = status;

    this.indicator.setAttribute('data-status', status);
    this.indicator.setAttribute('aria-label', this._getStatusLabel());

    // 펄스 애니메이션
    if (this.options.pulse) {
      if (status === 'online') {
        this.indicator.classList.add('online-status--pulse');
      } else {
        this.indicator.classList.remove('online-status--pulse');
      }
    }

    // 라벨 업데이트
    if (this.options.showLabel) {
      const label = this.indicator.querySelector('.online-status__label');
      if (label) label.textContent = this._getStatusLabel();
    }

    if (this.options.onChange && prevStatus !== status) {
      this.options.onChange(status);
    }
  }

  /**
   * 현재 상태 반환
   * @returns {string}
   */
  getStatus() {
    return this._status;
  }

  destroy() {
    if (this.indicator) {
      this.indicator.remove();
    }

    this.container.classList.remove('online-status-wrapper');
    OnlineStatus.instances.delete(this.container);

    this.container = null;
    this.indicator = null;
  }
}


// ============================================
// TypingIndicator - 타이핑 인디케이터
// ============================================

/**
 * TypingIndicator 클래스
 * 상대방이 입력 중임을 표시
 */
class TypingIndicator {
  /** @type {Map<HTMLElement, TypingIndicator>} */
  static instances = new Map();

  /**
   * 기본 옵션
   * @returns {Object}
   */
  static defaults() {
    return {
      users: [],                // 타이핑 중인 사용자 배열
      maxDisplay: 3,            // 최대 표시할 사용자 수
      showNames: true,
      hideAfter: 0             // 자동 숨김 (ms), 0이면 비활성
    };
  }

  /**
   * @param {string|HTMLElement} selector
   * @param {Object} options
   */
  constructor(selector, options = {}) {
    this.container = typeof selector === 'string'
      ? document.querySelector(selector)
      : selector;

    if (!this.container) {
      console.error('TypingIndicator: Container not found');
      return;
    }

    this.options = { ...TypingIndicator.defaults(), ...options };
    this._users = [...this.options.users];
    this._hideTimer = null;

    this.init();
    TypingIndicator.instances.set(this.container, this);
  }

  init() {
    this._render();
  }

  _render() {
    this.container.className = 'typing-indicator';
    this.container.setAttribute('role', 'status');
    this.container.setAttribute('aria-live', 'polite');

    this._updateDisplay();
  }

  _updateDisplay() {
    if (this._users.length === 0) {
      this.container.style.display = 'none';
      return;
    }

    this.container.style.display = 'flex';

    const { maxDisplay, showNames } = this.options;
    const displayUsers = this._users.slice(0, maxDisplay);
    const remainingCount = this._users.length - maxDisplay;

    let text = '';
    if (showNames) {
      if (displayUsers.length === 1) {
        text = `${displayUsers[0]}님이 입력 중`;
      } else if (remainingCount > 0) {
        text = `${displayUsers.join(', ')} 외 ${remainingCount}명이 입력 중`;
      } else {
        text = `${displayUsers.join(', ')}님이 입력 중`;
      }
    } else {
      text = '입력 중';
    }

    this.container.innerHTML = `
      <span class="typing-indicator__dots">
        <span class="typing-indicator__dot"></span>
        <span class="typing-indicator__dot"></span>
        <span class="typing-indicator__dot"></span>
      </span>
      <span class="typing-indicator__text">${text}</span>
    `;
  }

  /**
   * 타이핑 사용자 추가
   * @param {string} userName
   */
  addUser(userName) {
    if (!this._users.includes(userName)) {
      this._users.push(userName);
      this._updateDisplay();
      this._setHideTimer();
    }
  }

  /**
   * 타이핑 사용자 제거
   * @param {string} userName
   */
  removeUser(userName) {
    const index = this._users.indexOf(userName);
    if (index > -1) {
      this._users.splice(index, 1);
      this._updateDisplay();
    }
  }

  /**
   * 타이핑 사용자 설정
   * @param {Array<string>} users
   */
  setUsers(users) {
    this._users = [...users];
    this._updateDisplay();
    this._setHideTimer();
  }

  /**
   * 모든 사용자 제거
   */
  clear() {
    this._users = [];
    this._updateDisplay();
  }

  _setHideTimer() {
    if (this.options.hideAfter > 0) {
      if (this._hideTimer) clearTimeout(this._hideTimer);
      this._hideTimer = setTimeout(() => {
        this.clear();
      }, this.options.hideAfter);
    }
  }

  /**
   * 표시
   */
  show() {
    this.container.style.display = 'flex';
  }

  /**
   * 숨김
   */
  hide() {
    this.container.style.display = 'none';
  }

  destroy() {
    if (this._hideTimer) {
      clearTimeout(this._hideTimer);
    }

    TypingIndicator.instances.delete(this.container);

    if (this.container) {
      this.container.innerHTML = '';
    }

    this.container = null;
  }
}


// ============================================
// ActivityStatus - 활동 상태
// ============================================

/**
 * ActivityStatus 클래스
 * 마지막 활동 시간 표시
 */
class ActivityStatus {
  /** @type {Map<HTMLElement, ActivityStatus>} */
  static instances = new Map();

  /**
   * 기본 옵션
   * @returns {Object}
   */
  static defaults() {
    return {
      lastActivity: null,       // Date 객체 또는 timestamp
      updateInterval: 60000,    // 업데이트 간격 (ms)
      format: 'relative',       // 'relative' | 'absolute'
      locale: 'ko-KR',
      prefix: '마지막 활동: '
    };
  }

  /**
   * @param {string|HTMLElement} selector
   * @param {Object} options
   */
  constructor(selector, options = {}) {
    this.container = typeof selector === 'string'
      ? document.querySelector(selector)
      : selector;

    if (!this.container) {
      console.error('ActivityStatus: Container not found');
      return;
    }

    this.options = { ...ActivityStatus.defaults(), ...options };
    this._lastActivity = this.options.lastActivity
      ? new Date(this.options.lastActivity)
      : null;
    this._intervalId = null;

    this.init();
    ActivityStatus.instances.set(this.container, this);
  }

  init() {
    this._render();
    this._startUpdating();
  }

  _render() {
    this.container.className = 'activity-status';
    this._updateDisplay();
  }

  _updateDisplay() {
    if (!this._lastActivity) {
      this.container.textContent = '';
      return;
    }

    const { format, prefix, locale } = this.options;
    let text = '';

    if (format === 'relative') {
      text = this._getRelativeTime();
    } else {
      text = this._lastActivity.toLocaleString(locale);
    }

    this.container.textContent = prefix + text;
  }

  _getRelativeTime() {
    const now = new Date();
    const diff = now - this._lastActivity;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;

    return this._lastActivity.toLocaleDateString(this.options.locale);
  }

  _startUpdating() {
    if (this.options.updateInterval > 0) {
      this._intervalId = setInterval(() => {
        this._updateDisplay();
      }, this.options.updateInterval);
    }
  }

  /**
   * 마지막 활동 시간 설정
   * @param {Date|number} time
   */
  setLastActivity(time) {
    this._lastActivity = new Date(time);
    this._updateDisplay();
  }

  /**
   * 현재 시간으로 업데이트
   */
  updateNow() {
    this._lastActivity = new Date();
    this._updateDisplay();
  }

  destroy() {
    if (this._intervalId) {
      clearInterval(this._intervalId);
    }

    ActivityStatus.instances.delete(this.container);
    this.container = null;
  }
}


// ============================================
// LiveCounter - 실시간 카운터
// ============================================

/**
 * LiveCounter 클래스
 * 실시간으로 변하는 숫자 표시
 */
class LiveCounter {
  /** @type {Map<HTMLElement, LiveCounter>} */
  static instances = new Map();

  /**
   * 기본 옵션
   * @returns {Object}
   */
  static defaults() {
    return {
      value: 0,
      prefix: '',
      suffix: '',
      separator: ',',           // 천 단위 구분자
      decimals: 0,              // 소수점 자릿수
      duration: 1000,           // 애니메이션 시간 (ms)
      easing: 'easeOutExpo',
      onChange: null           // (value) => {}
    };
  }

  /**
   * @param {string|HTMLElement} selector
   * @param {Object} options
   */
  constructor(selector, options = {}) {
    this.container = typeof selector === 'string'
      ? document.querySelector(selector)
      : selector;

    if (!this.container) {
      console.error('LiveCounter: Container not found');
      return;
    }

    this.options = { ...LiveCounter.defaults(), ...options };
    this._value = this.options.value;
    this._displayValue = this.options.value;
    this._animationFrame = null;

    this.init();
    LiveCounter.instances.set(this.container, this);
  }

  init() {
    this._render();
  }

  _render() {
    this.container.className = 'live-counter';
    this._updateDisplay();
  }

  _updateDisplay() {
    const { prefix, suffix, separator, decimals } = this.options;
    const formattedValue = this._formatNumber(this._displayValue, decimals, separator);
    this.container.textContent = prefix + formattedValue + suffix;
  }

  _formatNumber(num, decimals, separator) {
    const fixed = num.toFixed(decimals);
    const parts = fixed.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    return parts.join('.');
  }

  /**
   * 값 설정 (애니메이션)
   * @param {number} value
   * @param {boolean} [withAnimation=true]
   */
  setValue(value, withAnimation = true) {
    this._value = value;

    if (!withAnimation) {
      this._displayValue = value;
      this._updateDisplay();
      if (this.options.onChange) {
        this.options.onChange(value);
      }
      return;
    }

    // 애니메이션
    const { duration } = this.options;
    const start = performance.now();
    const startValue = this._displayValue;
    const diff = value - startValue;

    const animateStep = (currentTime) => {
      const elapsed = currentTime - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = this._ease(progress);

      this._displayValue = startValue + diff * eased;
      this._updateDisplay();

      if (progress < 1) {
        this._animationFrame = requestAnimationFrame(animateStep);
      } else {
        this._displayValue = value;
        this._updateDisplay();
        if (this.options.onChange) {
          this.options.onChange(value);
        }
      }
    };

    if (this._animationFrame) {
      cancelAnimationFrame(this._animationFrame);
    }
    this._animationFrame = requestAnimationFrame(animateStep);
  }

  _ease(t) {
    // easeOutExpo
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  /**
   * 증가
   * @param {number} [amount=1]
   */
  increment(amount = 1) {
    this.setValue(this._value + amount);
  }

  /**
   * 감소
   * @param {number} [amount=1]
   */
  decrement(amount = 1) {
    this.setValue(this._value - amount);
  }

  /**
   * 현재 값 반환
   * @returns {number}
   */
  getValue() {
    return this._value;
  }

  destroy() {
    if (this._animationFrame) {
      cancelAnimationFrame(this._animationFrame);
    }

    LiveCounter.instances.delete(this.container);
    this.container = null;
  }
}


// ============================================
// ConnectionStatus - 연결 상태
// ============================================

/**
 * ConnectionStatus 클래스
 * 네트워크 연결 상태 모니터링
 */
class ConnectionStatus {
  /** @type {ConnectionStatus|null} */
  static instance = null;

  /**
   * 기본 옵션
   * @returns {Object}
   */
  static defaults() {
    return {
      showOnline: false,        // 온라인 상태도 표시할지
      position: 'top',          // 'top' | 'bottom'
      autoHide: true,           // 온라인 복귀 후 자동 숨김
      autoHideDelay: 3000,      // 자동 숨김 지연 (ms)
      onlineMessage: '인터넷에 연결되었습니다',
      offlineMessage: '인터넷 연결이 끊겼습니다',
      onStatusChange: null     // (isOnline) => {}
    };
  }

  /**
   * @param {Object} options
   */
  constructor(options = {}) {
    if (ConnectionStatus.instance) {
      return ConnectionStatus.instance;
    }

    this.options = { ...ConnectionStatus.defaults(), ...options };
    this._isOnline = navigator.onLine;
    this._banner = null;
    this._hideTimer = null;
    this._onOnline = null;
    this._onOffline = null;

    this.init();
    ConnectionStatus.instance = this;
  }

  init() {
    this._createBanner();
    this._bindEvents();

    // 초기 오프라인 상태 표시
    if (!this._isOnline) {
      this._showOffline();
    }
  }

  _createBanner() {
    this._banner = document.createElement('div');
    this._banner.className = `connection-status connection-status--${this.options.position}`;
    this._banner.setAttribute('role', 'alert');
    this._banner.style.display = 'none';
    document.body.appendChild(this._banner);
  }

  _bindEvents() {
    this._onOnline = () => {
      this._isOnline = true;

      if (this.options.showOnline) {
        this._showOnline();
      } else {
        this._hide();
      }

      if (this.options.onStatusChange) {
        this.options.onStatusChange(true);
      }
    };

    this._onOffline = () => {
      this._isOnline = false;
      this._showOffline();

      if (this.options.onStatusChange) {
        this.options.onStatusChange(false);
      }
    };

    window.addEventListener('online', this._onOnline);
    window.addEventListener('offline', this._onOffline);
  }

  _showOnline() {
    this._banner.className = `connection-status connection-status--${this.options.position} connection-status--online is-visible`;
    this._banner.innerHTML = `
      <i class="material-icons-outlined">wifi</i>
      <span>${this.options.onlineMessage}</span>
    `;
    this._banner.style.display = 'flex';

    if (this.options.autoHide) {
      this._hideTimer = setTimeout(() => {
        this._hide();
      }, this.options.autoHideDelay);
    }
  }

  _showOffline() {
    if (this._hideTimer) {
      clearTimeout(this._hideTimer);
    }

    this._banner.className = `connection-status connection-status--${this.options.position} connection-status--offline is-visible`;
    this._banner.innerHTML = `
      <i class="material-icons-outlined">wifi_off</i>
      <span>${this.options.offlineMessage}</span>
    `;
    this._banner.style.display = 'flex';
  }

  _hide() {
    this._banner.classList.remove('is-visible');
    setTimeout(() => {
      this._banner.style.display = 'none';
    }, 300);
  }

  /**
   * 현재 연결 상태 반환
   * @returns {boolean}
   */
  isOnline() {
    return this._isOnline;
  }

  destroy() {
    if (this._onOnline) {
      window.removeEventListener('online', this._onOnline);
    }
    if (this._onOffline) {
      window.removeEventListener('offline', this._onOffline);
    }
    if (this._hideTimer) {
      clearTimeout(this._hideTimer);
    }
    if (this._banner) {
      this._banner.remove();
    }

    ConnectionStatus.instance = null;
    this._banner = null;
  }
}


// ============================================
// Export
// ============================================

export { OnlineStatus, TypingIndicator, ActivityStatus, LiveCounter, ConnectionStatus };
export default { OnlineStatus, TypingIndicator, ActivityStatus, LiveCounter, ConnectionStatus };
