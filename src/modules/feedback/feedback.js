/**
 * Feedback Module
 * Toast, Notification, ProgressTracker, Skeleton 컴포넌트
 * @module modules/feedback
 */

import { EventBus } from '../../core/event.js';

// ============================================
// Toast - 토스트 메시지
// ============================================

class Toast {
  static container = null;
  static queue = [];

  static init() {
    if (Toast.container) return;
    Toast.container = document.createElement('div');
    Toast.container.className = 'toast-container';
    document.body.appendChild(Toast.container);
  }

  static show(message, type = 'info', duration = 3000) {
    Toast.init();

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;

    const icons = {
      success: 'check_circle',
      error: 'error',
      warning: 'warning',
      info: 'info'
    };

    toast.innerHTML = `
      <i class="material-icons-outlined toast__icon">${icons[type] || 'info'}</i>
      <span class="toast__message">${message}</span>
      <button class="toast__close">&times;</button>
    `;

    toast.querySelector('.toast__close').addEventListener('click', () => {
      Toast.hide(toast);
    });

    Toast.container.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
      toast.classList.add('is-visible');
    });

    if (duration > 0) {
      setTimeout(() => Toast.hide(toast), duration);
    }

    return toast;
  }

  static hide(toast) {
    toast.classList.remove('is-visible');
    toast.classList.add('is-hiding');
    setTimeout(() => toast.remove(), 300);
  }

  static success(message, duration) { return Toast.show(message, 'success', duration); }
  static error(message, duration) { return Toast.show(message, 'error', duration); }
  static warning(message, duration) { return Toast.show(message, 'warning', duration); }
  static info(message, duration) { return Toast.show(message, 'info', duration); }

  static clear() {
    if (Toast.container) {
      Toast.container.innerHTML = '';
    }
  }
}

// ============================================
// Notification - 알림
// ============================================

class Notification {
  static container = null;
  static position = 'top-right';

  static init(position = 'top-right') {
    Notification.position = position;

    if (Notification.container) {
      Notification.container.className = `notification-container notification-container--${position}`;
      return;
    }

    Notification.container = document.createElement('div');
    Notification.container.className = `notification-container notification-container--${position}`;
    document.body.appendChild(Notification.container);
  }

  static show(options = {}) {
    const defaults = {
      title: '',
      message: '',
      type: 'info', // success, error, warning, info
      duration: 5000,
      closable: true,
      icon: null,
      actions: [], // [{ text, onClick }]
      onClose: null
    };

    const config = { ...defaults, ...options };
    Notification.init();

    const notification = document.createElement('div');
    notification.className = `notification notification--${config.type}`;

    const icons = {
      success: 'check_circle',
      error: 'error',
      warning: 'warning',
      info: 'info'
    };

    let actionsHtml = '';
    if (config.actions.length) {
      actionsHtml = '<div class="notification__actions">' +
        config.actions.map((action, i) =>
          `<button class="notification__action" data-action="${i}">${action.text}</button>`
        ).join('') + '</div>';
    }

    notification.innerHTML = `
      <div class="notification__icon">
        <i class="material-icons-outlined">${config.icon || icons[config.type]}</i>
      </div>
      <div class="notification__content">
        ${config.title ? `<div class="notification__title">${config.title}</div>` : ''}
        <div class="notification__message">${config.message}</div>
        ${actionsHtml}
      </div>
      ${config.closable ? '<button class="notification__close">&times;</button>' : ''}
    `;

    // Close button
    const closeBtn = notification.querySelector('.notification__close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        Notification.hide(notification);
        config.onClose?.();
      });
    }

    // Action buttons
    notification.querySelectorAll('.notification__action').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.dataset.action);
        config.actions[index]?.onClick?.();
        Notification.hide(notification);
      });
    });

    Notification.container.appendChild(notification);

    requestAnimationFrame(() => {
      notification.classList.add('is-visible');
    });

    if (config.duration > 0) {
      setTimeout(() => Notification.hide(notification), config.duration);
    }

    return notification;
  }

  static hide(notification) {
    notification.classList.remove('is-visible');
    notification.classList.add('is-hiding');
    setTimeout(() => notification.remove(), 300);
  }

  static success(title, message, options = {}) {
    return Notification.show({ ...options, title, message, type: 'success' });
  }

  static error(title, message, options = {}) {
    return Notification.show({ ...options, title, message, type: 'error' });
  }

  static warning(title, message, options = {}) {
    return Notification.show({ ...options, title, message, type: 'warning' });
  }

  static info(title, message, options = {}) {
    return Notification.show({ ...options, title, message, type: 'info' });
  }

  static clear() {
    if (Notification.container) {
      Notification.container.innerHTML = '';
    }
  }
}

// ============================================
// ProgressTracker - 진행 추적
// ============================================

class ProgressTracker {
  static defaults() {
    return {
      steps: [], // ['Step 1', 'Step 2', ...]
      current: 0,
      vertical: false,
      clickable: false,
      onChange: null
    };
  }

  constructor(element, options = {}) {
    this.element = typeof element === 'string' ? document.querySelector(element) : element;
    if (!this.element) return;
    this.options = { ...ProgressTracker.defaults(), ...options };
    this.events = new EventBus();
    this.current = this.options.current;
    this._init();
  }

  _init() {
    this.element.classList.add('progress-tracker');
    if (this.options.vertical) this.element.classList.add('progress-tracker--vertical');
    this._render();
    if (this.options.clickable) this._bindEvents();
  }

  _render() {
    const html = this.options.steps.map((step, index) => {
      let status = '';
      if (index < this.current) status = 'completed';
      else if (index === this.current) status = 'active';

      return `
        <div class="progress-tracker__step ${status}" data-step="${index}">
          <div class="progress-tracker__indicator">
            ${index < this.current ? '<i class="material-icons-outlined">check</i>' : index + 1}
          </div>
          <div class="progress-tracker__label">${step}</div>
        </div>
      `;
    }).join('');

    this.element.innerHTML = html;
  }

  _bindEvents() {
    this._onClick = (e) => {
      const step = e.target.closest('.progress-tracker__step');
      if (step) {
        const index = parseInt(step.dataset.step);
        this.goTo(index);
      }
    };
    this.element.addEventListener('click', this._onClick);
  }

  goTo(index) {
    if (index < 0 || index >= this.options.steps.length) return;
    this.current = index;
    this._render();
    this.options.onChange?.(this.current);
    this.events.emit('change', this.current);
  }

  next() {
    if (this.current < this.options.steps.length - 1) {
      this.goTo(this.current + 1);
    }
  }

  prev() {
    if (this.current > 0) {
      this.goTo(this.current - 1);
    }
  }

  complete() {
    this.goTo(this.options.steps.length);
    this._render();
  }

  getCurrent() { return this.current; }

  destroy() {
    // 이벤트 리스너 제거
    if (this._onClick) {
      this.element.removeEventListener('click', this._onClick);
      this._onClick = null;
    }

    // 이벤트 버스 정리
    if (this.events) {
      this.events.clear();
    }

    this.element.innerHTML = '';
    this.element.classList.remove('progress-tracker', 'progress-tracker--vertical');
    this.element = null;
  }
}

// ============================================
// Skeleton - 로딩 플레이스홀더
// ============================================

class Skeleton {
  static defaults() {
    return {
      type: 'text', // text, avatar, card, image, list
      lines: 3,
      animated: true,
      width: '100%',
      height: null
    };
  }

  constructor(element, options = {}) {
    this.element = typeof element === 'string' ? document.querySelector(element) : element;
    if (!this.element) return;
    this.options = { ...Skeleton.defaults(), ...options };
    this._init();
  }

  _init() {
    this.element.classList.add('skeleton-wrapper');
    this._render();
  }

  _render() {
    const { type, lines, animated, width, height } = this.options;
    const animClass = animated ? 'skeleton--animated' : '';
    let html = '';

    switch (type) {
      case 'avatar':
        html = `<div class="skeleton skeleton--avatar ${animClass}"></div>`;
        break;

      case 'image':
        html = `<div class="skeleton skeleton--image ${animClass}" style="width: ${width}; ${height ? `height: ${height};` : ''}"></div>`;
        break;

      case 'card':
        html = `
          <div class="skeleton skeleton--card ${animClass}">
            <div class="skeleton skeleton--image ${animClass}"></div>
            <div class="skeleton__body">
              <div class="skeleton skeleton--title ${animClass}"></div>
              <div class="skeleton skeleton--text ${animClass}"></div>
              <div class="skeleton skeleton--text ${animClass}" style="width: 60%;"></div>
            </div>
          </div>
        `;
        break;

      case 'list':
        html = Array(lines).fill('').map(() => `
          <div class="skeleton skeleton--list-item ${animClass}">
            <div class="skeleton skeleton--avatar ${animClass}"></div>
            <div class="skeleton__content">
              <div class="skeleton skeleton--text ${animClass}"></div>
              <div class="skeleton skeleton--text ${animClass}" style="width: 70%;"></div>
            </div>
          </div>
        `).join('');
        break;

      case 'text':
      default:
        html = Array(lines).fill('').map((_, i) =>
          `<div class="skeleton skeleton--text ${animClass}" style="width: ${i === lines - 1 ? '60%' : '100%'};"></div>`
        ).join('');
        break;
    }

    this.element.innerHTML = html;
  }

  destroy() {
    this.element.innerHTML = '';
    this.element.classList.remove('skeleton-wrapper');
  }
}

// ============================================
// Export
// ============================================

export { Toast, Notification, ProgressTracker, Skeleton };
export default { Toast, Notification, ProgressTracker, Skeleton };
