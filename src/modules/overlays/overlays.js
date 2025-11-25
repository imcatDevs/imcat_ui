/**
 * Overlays & Dialogs Module
 * @module modules/overlays
 * @description Modal, Drawer, Offcanvas, Lightbox를 포함한 오버레이 컴포넌트 모음
 */

import { DOM } from '../../core/dom.js';
import { AnimationUtil } from '../../core/animation.js';
import { EventBus } from '../../core/event.js';
import { Security } from '../../core/security.js';
import { Utils } from '../../core/utils.js';

/**
 * 오버레이 베이스 클래스
 * @class
 * @description 모든 오버레이 컴포넌트의 공통 기능을 제공하는 베이스 클래스
 */
class OverlayBase {
  /**
   * 기본 옵션
   * @returns {Object}
   */
  static defaults() {
    return {
      backdrop: true,
      backdropClose: true,
      keyboard: true,
      animation: true,
      animationDuration: 300,
      onShow: null,
      onHide: null,
      onDestroy: null
    };
  }

  /**
   * OverlayBase 생성자
   * @constructor
   * @param {Object} options - 옵션
   */
  constructor(options = {}) {
    this.options = Utils.extend({}, this.constructor.defaults(), options);
    this.id = Utils.randomId('overlay');
    this.isOpen = false;
    this.element = null;
    this.backdropElement = null;
    this.eventBus = new EventBus();
    
    // 이벤트 핸들러 바인딩 (메모리 누수 방지)
    this._handleEscKey = this._handleEscKey.bind(this);
    this._handleBackdropClick = this._handleBackdropClick.bind(this);
  }

  /**
   * 백드롭 생성
   * @private
   */
  _createBackdrop() {
    if (!this.options.backdrop) return;

    this.backdropElement = DOM.create('div', {
      class: 'overlay-backdrop',
      'data-overlay-id': this.id
    }).get(0);

    document.body.appendChild(this.backdropElement);

    // 백드롭 클릭 이벤트
    if (this.options.backdropClose) {
      this.backdropElement.addEventListener('click', this._handleBackdropClick);
    }
  }

  /**
   * 백드롭 제거
   * @private
   */
  async _removeBackdrop() {
    if (!this.backdropElement) return;

    if (this.options.animation) {
      await AnimationUtil.animate(this.backdropElement).fadeOut(this.options.animationDuration);
    }
    
    this.backdropElement.removeEventListener('click', this._handleBackdropClick);
    this.backdropElement.remove();
    this.backdropElement = null;
  }

  /**
   * ESC 키 핸들러
   * @private
   * @param {KeyboardEvent} e
   */
  _handleEscKey(e) {
    if (e.key === 'Escape' && this.options.keyboard && this.isOpen) {
      this.hide();
    }
  }

  /**
   * 백드롭 클릭 핸들러
   * @private
   * @param {MouseEvent} e
   */
  _handleBackdropClick(e) {
    if (e.target === this.backdropElement) {
      this.hide();
    }
  }

  /**
   * 포커스 트랩 설정
   * @private
   */
  _setupFocusTrap() {
    if (!this.element) return;

    const focusableElements = this.element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    this._focusTrapHandler = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    this.element.addEventListener('keydown', this._focusTrapHandler);
    firstElement.focus();
  }

  /**
   * 포커스 트랩 해제
   * @private
   */
  _removeFocusTrap() {
    if (this.element && this._focusTrapHandler) {
      this.element.removeEventListener('keydown', this._focusTrapHandler);
      this._focusTrapHandler = null;
    }
  }

  /**
   * 스크롤 방지 설정
   * @private
   */
  _preventBodyScroll() {
    document.body.style.overflow = 'hidden';
  }

  /**
   * 스크롤 방지 해제
   * @private
   */
  _restoreBodyScroll() {
    document.body.style.overflow = '';
  }

  /**
   * 오버레이 표시
   * @returns {Promise<void>}
   */
  async show() {
    if (this.isOpen) return;

    // beforeShow 이벤트
    this.eventBus.emit('beforeShow');

    // 백드롭 생성
    this._createBackdrop();

    // 백드롭 애니메이션
    if (this.options.backdrop && this.options.animation) {
      await AnimationUtil.animate(this.backdropElement).fadeIn(this.options.animationDuration);
    }

    // 스크롤 방지
    this._preventBodyScroll();

    // ESC 키 이벤트
    if (this.options.keyboard) {
      document.addEventListener('keydown', this._handleEscKey);
    }

    // 포커스 트랩
    this._setupFocusTrap();

    this.isOpen = true;

    // onShow 콜백
    if (typeof this.options.onShow === 'function') {
      this.options.onShow();
    }

    // show 이벤트
    this.eventBus.emit('show');
  }

  /**
   * 오버레이 숨김
   * @returns {Promise<void>}
   */
  async hide() {
    if (!this.isOpen) return;

    // beforeHide 이벤트
    this.eventBus.emit('beforeHide');

    // 포커스 트랩 해제
    this._removeFocusTrap();

    // ESC 키 이벤트 제거
    if (this.options.keyboard) {
      document.removeEventListener('keydown', this._handleEscKey);
    }

    // 스크롤 복원
    this._restoreBodyScroll();

    // 백드롭 제거
    await this._removeBackdrop();

    this.isOpen = false;

    // onHide 콜백
    if (typeof this.options.onHide === 'function') {
      this.options.onHide();
    }

    // hide 이벤트
    this.eventBus.emit('hide');
  }

  /**
   * 이벤트 리스너 등록
   * @param {string} event - 이벤트 이름
   * @param {Function} handler - 핸들러 함수
   * @returns {Function} 구독 취소 함수
   */
  on(event, handler) {
    return this.eventBus.on(event, handler);
  }

  /**
   * 정리 (메모리 해제)
   */
  destroy() {
    // 열려있으면 먼저 닫기
    if (this.isOpen) {
      this.hide();
    }

    // 이벤트 리스너 제거
    if (this.element && this._focusTrapHandler) {
      this.element.removeEventListener('keydown', this._focusTrapHandler);
    }

    document.removeEventListener('keydown', this._handleEscKey);

    if (this.backdropElement) {
      this.backdropElement.removeEventListener('click', this._handleBackdropClick);
      this.backdropElement.remove();
    }

    // DOM 요소 제거
    if (this.element) {
      this.element.remove();
    }

    // 이벤트 버스 정리
    this.eventBus.clear();

    // 참조 해제
    this.element = null;
    this.backdropElement = null;
    this.eventBus = null;

    // onDestroy 콜백
    if (typeof this.options.onDestroy === 'function') {
      this.options.onDestroy();
    }
  }
}

/**
 * Modal 클래스
 * @class
 * @extends OverlayBase
 * @description 모달 다이얼로그 컴포넌트
 * 
 * @example
 * const modal = new Modal({
 *   title: '확인',
 *   content: '저장하시겠습니까?',
 *   buttons: [
 *     { text: '취소', action: 'close' },
 *     { text: '확인', type: 'primary', action: () => console.log('확인') }
 *   ]
 * });
 * modal.show();
 */
class Modal extends OverlayBase {
  /**
   * Modal 기본 옵션
   * @returns {Object}
   */
  static defaults() {
    return {
      ...super.defaults(),
      title: '',
      content: '',
      size: 'md', // sm, md, lg, xl
      centered: false,
      scrollable: false,
      closeButton: true,
      buttons: [],
      fullscreen: false
    };
  }

  /**
   * Modal 생성자
   * @constructor
   * @param {Object} options - 옵션
   */
  constructor(options = {}) {
    super(options);
    this._init();
  }

  /**
   * 초기화
   * @private
   */
  _init() {
    this.element = this._createModal();
    document.body.appendChild(this.element);
  }

  /**
   * 모달 DOM 생성
   * @private
   * @returns {HTMLElement}
   */
  _createModal() {
    const modalClasses = ['modal'];
    if (this.options.centered) modalClasses.push('modal--centered');
    if (this.options.fullscreen) modalClasses.push('modal--fullscreen');

    const dialogClasses = ['modal__dialog'];
    dialogClasses.push(`modal__dialog--${this.options.size}`);
    if (this.options.scrollable) dialogClasses.push('modal__dialog--scrollable');

    const modal = DOM.create('div', {
      class: modalClasses.join(' '),
      id: this.id,
      role: 'dialog',
      'aria-modal': 'true',
      'aria-labelledby': `${this.id}-title`
    }).get(0);

    const dialog = DOM.create('div', {
      class: dialogClasses.join(' ')
    }).get(0);

    const content = DOM.create('div', {
      class: 'modal__content'
    }).get(0);

    // 헤더 (title이 있거나 closeButton이 있으면 표시)
    if (this.options.title || this.options.closeButton) {
      const header = this._createHeader();
      content.appendChild(header);
    }

    // 바디
    const body = this._createBody();
    content.appendChild(body);

    // 푸터 (버튼이 있으면)
    if (this.options.buttons && this.options.buttons.length > 0) {
      const footer = this._createFooter();
      content.appendChild(footer);
    }

    dialog.appendChild(content);
    modal.appendChild(dialog);

    return modal;
  }

  /**
   * 모달 헤더 생성
   * @private
   * @returns {HTMLElement}
   */
  _createHeader() {
    const header = DOM.create('div', {
      class: 'modal__header'
    }).get(0);

    if (this.options.title) {
      const title = DOM.create('h5', {
        class: 'modal__title',
        id: `${this.id}-title`,
        text: this.options.title
      }).get(0);
      header.appendChild(title);
    }

    if (this.options.closeButton) {
      const closeBtn = DOM.create('button', {
        class: 'modal__close',
        type: 'button',
        'aria-label': '닫기'
      }).get(0);
      closeBtn.innerHTML = '<i class="material-icons-outlined">close</i>';
      closeBtn.addEventListener('click', () => this.hide());
      header.appendChild(closeBtn);
    }

    return header;
  }

  /**
   * 모달 바디 생성
   * @private
   * @returns {HTMLElement}
   */
  _createBody() {
    const body = DOM.create('div', {
      class: 'modal__body'
    }).get(0);

    if (typeof this.options.content === 'string') {
      body.innerHTML = Security.sanitize(this.options.content);
    } else if (this.options.content instanceof HTMLElement) {
      body.appendChild(this.options.content);
    }

    return body;
  }

  /**
   * 모달 푸터 생성
   * @private
   * @returns {HTMLElement}
   */
  _createFooter() {
    const footer = DOM.create('div', {
      class: 'modal__footer'
    }).get(0);

    this.options.buttons.forEach(btn => {
      const button = DOM.create('button', {
        class: `btn btn--${btn.type || 'secondary'}`,
        type: 'button',
        text: btn.text || '버튼'
      }).get(0);

      button.addEventListener('click', () => {
        if (btn.action === 'close') {
          this.hide();
        } else if (typeof btn.action === 'function') {
          btn.action();
        }
      });

      footer.appendChild(button);
    });

    return footer;
  }

  /**
   * 모달 표시
   * @returns {Promise<void>}
   */
  async show() {
    await super.show();

    this.element.style.display = 'flex';
  }

  /**
   * 모달 숨김
   * @returns {Promise<void>}
   */
  async hide() {
    this.element.style.display = 'none';

    await super.hide();
  }

  /**
   * 정적 메서드: 확인 대화상자
   * @static
   * @param {Object} options - 옵션
   * @returns {Promise<boolean>}
   */
  static async confirm(options = {}) {
    return new Promise((resolve) => {
      const modal = new Modal({
        title: options.title || '확인',
        content: options.content || '계속하시겠습니까?',
        buttons: [
          { 
            text: options.cancelText || '취소', 
            action: () => {
              modal.hide();
              resolve(false);
            }
          },
          { 
            text: options.confirmText || '확인', 
            type: 'primary',
            action: () => {
              modal.hide();
              resolve(true);
            }
          }
        ],
        onDestroy: () => resolve(false)
      });
      modal.show();
    });
  }

  /**
   * 정적 메서드: 알림 대화상자
   * @static
   * @param {Object} options - 옵션
   * @returns {Promise<void>}
   */
  static async alert(options = {}) {
    return new Promise((resolve) => {
      const modal = new Modal({
        title: options.title || '알림',
        content: options.content || '',
        buttons: [
          { 
            text: options.confirmText || '확인', 
            type: 'primary',
            action: () => {
              modal.hide();
              resolve();
            }
          }
        ],
        onDestroy: () => resolve()
      });
      modal.show();
    });
  }
}

/**
 * Drawer 클래스
 * @class
 * @extends OverlayBase
 * @description 사이드 패널 컴포넌트
 * 
 * @example
 * const drawer = new Drawer({
 *   position: 'right',
 *   title: '설정',
 *   content: '<div>설정 내용</div>'
 * });
 * drawer.show();
 */
class Drawer extends OverlayBase {
  /**
   * Drawer 기본 옵션
   * @returns {Object}
   */
  static defaults() {
    return {
      ...super.defaults(),
      position: 'right', // left, right, top, bottom
      title: '',
      content: '',
      closeButton: true,
      width: '320px',
      height: '100%'
    };
  }

  /**
   * Drawer 생성자
   * @constructor
   * @param {Object} options - 옵션
   */
  constructor(options = {}) {
    super(options);
    this._init();
  }

  /**
   * 초기화
   * @private
   */
  _init() {
    this.element = this._createDrawer();
    document.body.appendChild(this.element);
  }

  /**
   * Drawer DOM 생성
   * @private
   * @returns {HTMLElement}
   */
  _createDrawer() {
    const drawer = DOM.create('div', {
      class: `drawer drawer--${this.options.position}`,
      id: this.id,
      role: 'dialog',
      'aria-modal': 'true'
    }).get(0);

    // 너비/높이 설정
    if (this.options.position === 'left' || this.options.position === 'right') {
      drawer.style.width = this.options.width;
    } else {
      drawer.style.height = this.options.height;
    }

    // 헤더 (title이 있거나 closeButton이 있으면 표시)
    if (this.options.title || this.options.closeButton) {
      const header = this._createHeader();
      drawer.appendChild(header);
    }

    // 바디
    const body = this._createBody();
    drawer.appendChild(body);

    return drawer;
  }

  /**
   * Drawer 헤더 생성
   * @private
   * @returns {HTMLElement}
   */
  _createHeader() {
    const header = DOM.create('div', {
      class: 'drawer__header'
    }).get(0);

    if (this.options.title) {
      const title = DOM.create('h5', {
        class: 'drawer__title',
        text: this.options.title
      }).get(0);
      header.appendChild(title);
    }

    if (this.options.closeButton) {
      const closeBtn = DOM.create('button', {
        class: 'drawer__close',
        type: 'button',
        'aria-label': '닫기'
      }).get(0);
      closeBtn.innerHTML = '<i class="material-icons-outlined">close</i>';
      closeBtn.addEventListener('click', () => this.hide());
      header.appendChild(closeBtn);
    }

    return header;
  }

  /**
   * Drawer 바디 생성
   * @private
   * @returns {HTMLElement}
   */
  _createBody() {
    const body = DOM.create('div', {
      class: 'drawer__body'
    }).get(0);

    if (typeof this.options.content === 'string') {
      body.innerHTML = Security.sanitize(this.options.content);
    } else if (this.options.content instanceof HTMLElement) {
      body.appendChild(this.options.content);
    }

    return body;
  }

  /**
   * Drawer 표시
   * @returns {Promise<void>}
   */
  async show() {
    await super.show();

    this.element.style.display = 'flex';
    
    // transform을 0으로 설정하여 보이게 함
    this.element.style.transform = 'translateX(0) translateY(0)';
  }

  /**
   * Drawer 숨김
   * @returns {Promise<void>}
   */
  async hide() {
    // transform을 원래 위치로 복원
    const position = this.options.position;
    if (position === 'left') {
      this.element.style.transform = 'translateX(-100%)';
    } else if (position === 'right') {
      this.element.style.transform = 'translateX(100%)';
    } else if (position === 'top') {
      this.element.style.transform = 'translateY(-100%)';
    } else if (position === 'bottom') {
      this.element.style.transform = 'translateY(100%)';
    }

    this.element.style.display = 'none';

    await super.hide();
  }
}

/**
 * Offcanvas 클래스
 * @class
 * @extends Drawer
 * @description 오프캔버스 컴포넌트 (Drawer의 변형)
 */
class Offcanvas extends Drawer {
  constructor(options = {}) {
    super(options);
    this.element.classList.add('offcanvas');
  }
}

/**
 * Lightbox 클래스
 * @class
 * @extends OverlayBase
 * @description 이미지 갤러리/라이트박스 컴포넌트
 * 
 * @example
 * const lightbox = new Lightbox({
 *   images: [
 *     { src: 'image1.jpg', title: '이미지 1' },
 *     { src: 'image2.jpg', title: '이미지 2' }
 *   ]
 * });
 * lightbox.show();
 */
class Lightbox extends OverlayBase {
  /**
   * Lightbox 기본 옵션
   * @returns {Object}
   */
  static defaults() {
    return {
      ...super.defaults(),
      images: [],
      index: 0,
      captions: true,
      thumbnails: false,
      closeButton: true,
      navigation: true,
      zoom: false
    };
  }

  /**
   * Lightbox 생성자
   * @constructor
   * @param {Object} options - 옵션
   */
  constructor(options = {}) {
    super(options);
    this.currentIndex = this.options.index || 0;
    this._init();
  }

  /**
   * 초기화
   * @private
   */
  _init() {
    this.element = this._createLightbox();
    document.body.appendChild(this.element);
  }

  /**
   * Lightbox DOM 생성
   * @private
   * @returns {HTMLElement}
   */
  _createLightbox() {
    const lightbox = DOM.create('div', {
      class: 'lightbox',
      id: this.id,
      role: 'dialog',
      'aria-modal': 'true'
    }).get(0);

    // 닫기 버튼
    if (this.options.closeButton) {
      const closeBtn = DOM.create('button', {
        class: 'lightbox__close',
        type: 'button',
        'aria-label': '닫기'
      }).get(0);
      closeBtn.innerHTML = '<i class="material-icons-outlined">close</i>';
      closeBtn.addEventListener('click', () => this.hide());
      lightbox.appendChild(closeBtn);
    }

    // 이미지 컨테이너
    const imageContainer = DOM.create('div', {
      class: 'lightbox__container'
    }).get(0);

    const img = DOM.create('img', {
      class: 'lightbox__image',
      alt: ''
    }).get(0);
    imageContainer.appendChild(img);

    // 캡션
    if (this.options.captions) {
      const caption = DOM.create('div', {
        class: 'lightbox__caption'
      }).get(0);
      imageContainer.appendChild(caption);
    }

    lightbox.appendChild(imageContainer);

    // 네비게이션
    if (this.options.navigation && this.options.images.length > 1) {
      const prevBtn = DOM.create('button', {
        class: 'lightbox__nav lightbox__nav--prev',
        type: 'button',
        'aria-label': '이전'
      }).get(0);
      prevBtn.innerHTML = '<i class="material-icons-outlined">chevron_left</i>';
      prevBtn.addEventListener('click', () => this.prev());

      const nextBtn = DOM.create('button', {
        class: 'lightbox__nav lightbox__nav--next',
        type: 'button',
        'aria-label': '다음'
      }).get(0);
      nextBtn.innerHTML = '<i class="material-icons-outlined">chevron_right</i>';
      nextBtn.addEventListener('click', () => this.next());

      lightbox.appendChild(prevBtn);
      lightbox.appendChild(nextBtn);
    }

    return lightbox;
  }

  /**
   * 이미지 로드
   * @private
   * @param {number} index - 이미지 인덱스
   */
  _loadImage(index) {
    if (index < 0 || index >= this.options.images.length) return;

    this.currentIndex = index;
    const imageData = this.options.images[index];

    const img = this.element.querySelector('.lightbox__image');
    img.src = imageData.src || imageData;
    img.alt = imageData.title || '';

    // 캡션 업데이트
    if (this.options.captions) {
      const caption = this.element.querySelector('.lightbox__caption');
      if (caption && imageData.title) {
        caption.textContent = imageData.title;
      }
    }
  }

  /**
   * 이전 이미지
   */
  prev() {
    const newIndex = this.currentIndex - 1;
    if (newIndex >= 0) {
      this._loadImage(newIndex);
    } else if (this.options.images.length > 0) {
      // 순환
      this._loadImage(this.options.images.length - 1);
    }
  }

  /**
   * 다음 이미지
   */
  next() {
    const newIndex = this.currentIndex + 1;
    if (newIndex < this.options.images.length) {
      this._loadImage(newIndex);
    } else {
      // 순환
      this._loadImage(0);
    }
  }

  /**
   * Lightbox 표시
   * @returns {Promise<void>}
   */
  async show() {
    await super.show();

    this.element.style.display = 'flex';
    this._loadImage(this.currentIndex);

    if (this.options.animation) {
      await AnimationUtil.animate(this.element.querySelector('.lightbox__container'))
        .scaleIn(this.options.animationDuration);
    }

    // 키보드 네비게이션
    this._keyboardHandler = (e) => {
      if (e.key === 'ArrowLeft') this.prev();
      if (e.key === 'ArrowRight') this.next();
    };
    document.addEventListener('keydown', this._keyboardHandler);
  }

  /**
   * Lightbox 숨김
   * @returns {Promise<void>}
   */
  async hide() {
    if (this._keyboardHandler) {
      document.removeEventListener('keydown', this._keyboardHandler);
      this._keyboardHandler = null;
    }

    if (this.options.animation) {
      await AnimationUtil.animate(this.element.querySelector('.lightbox__container'))
        .fadeOut(this.options.animationDuration);
    }

    this.element.style.display = 'none';

    await super.hide();
  }
}

/**
 * Overlays 모듈 (네임스페이스)
 */
const Overlays = {
  Modal,
  Drawer,
  Offcanvas,
  Lightbox
};

export { Modal, Drawer, Offcanvas, Lightbox };
export default Overlays;
