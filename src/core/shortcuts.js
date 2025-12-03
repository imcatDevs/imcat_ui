/**
 * IMCAT 단축 API
 * @module core/shortcuts
 * @description 자주 사용하는 패턴의 단축 함수를 제공합니다.
 */

import { Security } from './security.js';
import { Utils } from './utils.js';

/**
 * 단축 API 모음
 * @class
 */
export const Shortcuts = {
  /**
   * 모달 단축 생성
   * @param {Object} options - 모달 옵션
   * @returns {Promise<Modal>}
   * 
   * @example
   * const modal = await IMCAT.modal({ title: '알림', content: '완료!' });
   * modal.show();
   */
  async modal(options) {
    const Overlays = await this.use('overlays');
    const modal = new Overlays.Modal(options);
    this.view.registerInstance(modal);
    return modal;
  },

  /**
   * 드로어 단축 생성
   * @param {Object} options - 드로어 옵션
   * @returns {Promise<Drawer>}
   */
  async drawer(options) {
    const Overlays = await this.use('overlays');
    const drawer = new Overlays.Drawer(options);
    this.view.registerInstance(drawer);
    return drawer;
  },

  /**
   * 확인 다이얼로그
   * @param {string|Object} options - 메시지 또는 옵션 객체
   * @returns {Promise<boolean>}
   * 
   * @example
   * if (await IMCAT.confirm('삭제하시겠습니까?')) {
   *   // 삭제 로직
   * }
   */
  async confirm(options) {
    const Overlays = await this.use('overlays');

    if (typeof options === 'string') {
      options = { message: options };
    }

    return new Promise((resolve) => {
      const modal = new Overlays.Modal({
        title: options.title || '확인',
        content: `<p style="margin: 0; font-size: 15px; color: var(--text-primary);">${Security.escape(options.message)}</p>`,
        size: 'sm',
        buttons: [
          {
            text: options.cancelText || '취소',
            variant: 'secondary',
            action: () => { modal.hide(); modal.destroy(); resolve(false); }
          },
          {
            text: options.confirmText || '확인',
            variant: options.danger ? 'danger' : 'primary',
            action: () => { modal.hide(); modal.destroy(); resolve(true); }
          }
        ]
      });
      modal.show();
    });
  },

  /**
   * 알림 다이얼로그
   * @param {string} message - 메시지
   * @param {Object} [options] - 추가 옵션
   * @returns {Promise<void>}
   * 
   * @example
   * await IMCAT.alert('저장되었습니다');
   */
  async alert(message, options = {}) {
    const Overlays = await this.use('overlays');

    return new Promise((resolve) => {
      const modal = new Overlays.Modal({
        title: options.title || '알림',
        content: `<p style="margin: 0; font-size: 15px; color: var(--text-primary);">${Security.escape(message)}</p>`,
        size: 'sm',
        buttons: [
          {
            text: options.buttonText || '확인',
            variant: 'primary',
            action: () => { modal.hide(); modal.destroy(); resolve(); }
          }
        ]
      });
      modal.show();
    });
  },

  /**
   * 입력 다이얼로그
   * @param {string} message - 메시지
   * @param {Object} [options] - 추가 옵션
   * @returns {Promise<string|null>}
   * 
   * @example
   * const name = await IMCAT.prompt('이름을 입력하세요');
   * if (name) console.log('입력:', name);
   */
  async prompt(message, options = {}) {
    const Overlays = await this.use('overlays');

    return new Promise((resolve) => {
      const inputId = Utils.randomId('prompt-input');
      const modal = new Overlays.Modal({
        title: options.title || '입력',
        content: `
          <p style="margin: 0 0 12px 0; font-size: 15px; color: var(--text-primary);">${Security.escape(message)}</p>
          <input type="${options.type || 'text'}" 
                 id="${inputId}"
                 class="form-input" 
                 value="${Security.escape(options.defaultValue || '')}"
                 placeholder="${Security.escape(options.placeholder || '')}"
                 style="width: 100%; padding: 10px 12px; border: 1px solid var(--border-color); border-radius: 6px; font-size: 14px;">
        `,
        size: 'sm',
        buttons: [
          {
            text: options.cancelText || '취소',
            variant: 'secondary',
            action: () => { modal.hide(); modal.destroy(); resolve(null); }
          },
          {
            text: options.confirmText || '확인',
            variant: 'primary',
            action: () => {
              const input = document.getElementById(inputId);
              const value = input?.value || '';
              modal.hide();
              modal.destroy();
              resolve(value);
            }
          }
        ]
      });
      modal.show();

      // 자동 포커스
      setTimeout(() => {
        const input = document.getElementById(inputId);
        if (input) {
          input.focus();
          input.select();
        }
      }, 100);
    });
  },

  /**
   * 토스트 단축 API
   */
  toast: {
    _imcat: null,

    async _getModule() {
      if (!this._imcat) {
        throw new Error('Toast: IMCAT 인스턴스가 설정되지 않았습니다.');
      }
      return await this._imcat.use('feedback');
    },

    async show(message, type = 'info', duration = 3000) {
      const Feedback = await this._getModule();
      return Feedback.Toast.show(message, type, duration);
    },

    async success(message, duration) {
      return this.show(message, 'success', duration);
    },

    async error(message, duration) {
      return this.show(message, 'error', duration);
    },

    async warning(message, duration) {
      return this.show(message, 'warning', duration);
    },

    async info(message, duration) {
      return this.show(message, 'info', duration);
    },

    async clear() {
      const Feedback = await this._getModule();
      Feedback.Toast.clear();
    }
  },

  /**
   * 알림(Notification) 단축 API
   */
  notify: {
    _imcat: null,

    async _getModule() {
      if (!this._imcat) {
        throw new Error('Notify: IMCAT 인스턴스가 설정되지 않았습니다.');
      }
      return await this._imcat.use('feedback');
    },

    async show(options) {
      const Feedback = await this._getModule();
      return Feedback.Notification.show(options);
    },

    async success(message, title = '') {
      return this.show({ message, title, type: 'success' });
    },

    async error(message, title = '') {
      return this.show({ message, title, type: 'error' });
    },

    async warning(message, title = '') {
      return this.show({ message, title, type: 'warning' });
    },

    async info(message, title = '') {
      return this.show({ message, title, type: 'info' });
    }
  },

  /**
   * 드롭다운 단축 생성
   * @param {string|HTMLElement} trigger - 트리거 요소
   * @param {Object} options - 드롭다운 옵션
   * @returns {Promise<Dropdown>}
   */
  async dropdown(trigger, options) {
    const Dropdown = await this.use('dropdown');
    const dropdown = new Dropdown(trigger, options);
    this.view.registerInstance(dropdown);
    return dropdown;
  },

  /**
   * 툴팁 단축 생성
   * @param {string|HTMLElement} element - 대상 요소
   * @param {string|Object} options - 내용 또는 옵션
   * @returns {Promise<Tooltip>}
   */
  async tooltip(element, options) {
    const Tooltips = await this.use('tooltips');
    if (typeof options === 'string') {
      options = { content: options };
    }
    const tooltip = new Tooltips.Tooltip(element, options);
    this.view.registerInstance(tooltip);
    return tooltip;
  }
};

export default Shortcuts;
