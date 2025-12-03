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
  },

  /**
   * 팝오버 단축 생성
   * @param {string|HTMLElement} element - 대상 요소
   * @param {string|Object} options - 내용 또는 옵션
   * @returns {Promise<Popover>}
   */
  async popover(element, options) {
    const Tooltips = await this.use('tooltips');
    if (typeof options === 'string') {
      options = { content: options };
    }
    const popover = new Tooltips.Popover(element, options);
    this.view.registerInstance(popover);
    return popover;
  },

  /**
   * 탭 단축 생성
   * @param {string|HTMLElement} element - 탭 컨테이너
   * @param {Object} [options] - 옵션
   * @returns {Promise<Tabs>}
   */
  async tabs(element, options = {}) {
    const Navigation = await this.use('navigation');
    const tabs = new Navigation.Tabs(element, options);
    this.view.registerInstance(tabs);
    return tabs;
  },

  /**
   * 아코디언 단축 생성
   * @param {string|HTMLElement} element - 아코디언 컨테이너
   * @param {Object} [options] - 옵션
   * @returns {Promise<Accordion>}
   */
  async accordion(element, options = {}) {
    const Navigation = await this.use('navigation');
    const accordion = new Navigation.Accordion(element, options);
    this.view.registerInstance(accordion);
    return accordion;
  },

  /**
   * 캐러셀 단축 생성
   * @param {string|HTMLElement} element - 캐러셀 컨테이너
   * @param {Object} [options] - 옵션
   * @returns {Promise<Carousel>}
   */
  async carousel(element, options = {}) {
    const CarouselModule = await this.use('carousel');
    const carousel = new CarouselModule.Carousel(element, options);
    this.view.registerInstance(carousel);
    return carousel;
  },

  /**
   * 라이트박스 (이미지 갤러리)
   * @param {string[]|Object[]} images - 이미지 배열
   * @param {Object} [options] - 옵션
   * @returns {Promise<Lightbox>}
   * 
   * @example
   * await IMCAT.lightbox(['img1.jpg', 'img2.jpg']);
   * await IMCAT.lightbox([{ src: 'img.jpg', title: '제목' }]);
   */
  async lightbox(images, options = {}) {
    const Overlays = await this.use('overlays');
    const lightbox = new Overlays.Lightbox({ images, ...options });
    this.view.registerInstance(lightbox);
    lightbox.show();
    return lightbox;
  },

  /**
   * 날짜 선택기 단축 생성
   * @param {string|HTMLElement} element - 입력 요소
   * @param {Object} [options] - 옵션
   * @returns {Promise<DatePicker>}
   */
  async datePicker(element, options = {}) {
    const Pickers = await this.use('pickers');
    const picker = new Pickers.DatePicker(element, options);
    this.view.registerInstance(picker);
    return picker;
  },

  /**
   * 시간 선택기 단축 생성
   * @param {string|HTMLElement} element - 입력 요소
   * @param {Object} [options] - 옵션
   * @returns {Promise<TimePicker>}
   */
  async timePicker(element, options = {}) {
    const Pickers = await this.use('pickers');
    const picker = new Pickers.TimePicker(element, options);
    this.view.registerInstance(picker);
    return picker;
  },

  /**
   * 색상 선택기 단축 생성
   * @param {string|HTMLElement} element - 입력 요소
   * @param {Object} [options] - 옵션
   * @returns {Promise<ColorPicker>}
   */
  async colorPicker(element, options = {}) {
    const Pickers = await this.use('pickers');
    const picker = new Pickers.ColorPicker(element, options);
    this.view.registerInstance(picker);
    return picker;
  },

  /**
   * 카운트다운 단축 생성
   * @param {string|HTMLElement} element - 표시 요소
   * @param {Date|string|number} targetDate - 목표 날짜
   * @param {Object} [options] - 옵션
   * @returns {Promise<Countdown>}
   */
  async countdown(element, targetDate, options = {}) {
    const Pickers = await this.use('pickers');
    const countdown = new Pickers.Countdown(element, { targetDate, ...options });
    this.view.registerInstance(countdown);
    return countdown;
  },

  /**
   * 자동완성 단축 생성
   * @param {string|HTMLElement} element - 입력 요소
   * @param {Object} options - 옵션 (source 필수)
   * @returns {Promise<Autocomplete>}
   */
  async autocomplete(element, options) {
    const Selectors = await this.use('selectors');
    const autocomplete = new Selectors.Autocomplete(element, options);
    this.view.registerInstance(autocomplete);
    return autocomplete;
  },

  /**
   * 다중 선택 단축 생성
   * @param {string|HTMLElement} element - select 요소
   * @param {Object} [options] - 옵션
   * @returns {Promise<MultiSelect>}
   */
  async multiSelect(element, options = {}) {
    const Selectors = await this.use('selectors');
    const multiSelect = new Selectors.MultiSelect(element, options);
    this.view.registerInstance(multiSelect);
    return multiSelect;
  },

  /**
   * 범위 슬라이더 단축 생성
   * @param {string|HTMLElement} element - 컨테이너
   * @param {Object} [options] - 옵션
   * @returns {Promise<RangeSlider>}
   */
  async rangeSlider(element, options = {}) {
    const Selectors = await this.use('selectors');
    const slider = new Selectors.RangeSlider(element, options);
    this.view.registerInstance(slider);
    return slider;
  },

  /**
   * 별점 단축 생성
   * @param {string|HTMLElement} element - 컨테이너
   * @param {Object} [options] - 옵션
   * @returns {Promise<Rating>}
   */
  async rating(element, options = {}) {
    const Forms = await this.use('forms');
    const rating = new Forms.Rating(element, options);
    this.view.registerInstance(rating);
    return rating;
  },

  /**
   * 파일 업로드 단축 생성
   * @param {string|HTMLElement} element - 컨테이너
   * @param {Object} [options] - 옵션
   * @returns {Promise<FileUpload>}
   */
  async fileUpload(element, options = {}) {
    const Forms = await this.use('forms');
    const upload = new Forms.FileUpload(element, options);
    this.view.registerInstance(upload);
    return upload;
  },

  /**
   * 데이터 테이블 단축 생성
   * @param {string|HTMLElement} element - 테이블 컨테이너
   * @param {Object} options - 옵션 (columns, data)
   * @returns {Promise<DataTable>}
   */
  async dataTable(element, options) {
    const DataViz = await this.use('data-viz');
    const table = new DataViz.DataTable(element, options);
    this.view.registerInstance(table);
    return table;
  },

  /**
   * 차트 단축 생성
   * @param {string|HTMLElement} element - 캔버스/SVG 컨테이너
   * @param {Object} options - 차트 옵션
   * @returns {Promise<Chart>}
   */
  async chart(element, options) {
    const DataViz = await this.use('data-viz');
    const chart = new DataViz.Chart(element, options);
    this.view.registerInstance(chart);
    return chart;
  },

  /**
   * 칸반 보드 단축 생성
   * @param {string|HTMLElement} element - 컨테이너
   * @param {Object} options - 옵션
   * @returns {Promise<Kanban>}
   */
  async kanban(element, options) {
    const DataViz = await this.use('data-viz');
    const kanban = new DataViz.Kanban(element, options);
    this.view.registerInstance(kanban);
    return kanban;
  },

  /**
   * 스테퍼 단축 생성
   * @param {string|HTMLElement} element - 컨테이너
   * @param {Object} [options] - 옵션
   * @returns {Promise<Stepper>}
   */
  async stepper(element, options = {}) {
    const StepperModule = await this.use('stepper');
    const stepper = new StepperModule.Stepper(element, options);
    this.view.registerInstance(stepper);
    return stepper;
  },

  /**
   * QR 코드 생성
   * @param {string|HTMLElement} element - 컨테이너
   * @param {string} data - QR 코드 데이터
   * @param {Object} [options] - 옵션 (size, color 등)
   * @returns {Promise<QRCode>}
   */
  async qrCode(element, data, options = {}) {
    const AdvancedUI = await this.use('advanced-ui');
    const qr = new AdvancedUI.QRCode(element, { data, ...options });
    this.view.registerInstance(qr);
    return qr;
  },

  /**
   * 진행률 트래커 단축 생성
   * @param {Object} options - 옵션 (steps, current 등)
   * @returns {Promise<ProgressTracker>}
   */
  async progress(options) {
    const Feedback = await this.use('feedback');
    const tracker = new Feedback.ProgressTracker(options);
    this.view.registerInstance(tracker);
    return tracker;
  },

  /**
   * 스켈레톤 로딩 표시
   * @param {string|HTMLElement} element - 대상 요소
   * @param {Object} [options] - 옵션
   * @returns {Promise<Skeleton>}
   */
  async skeleton(element, options = {}) {
    const Feedback = await this.use('feedback');
    const skeleton = new Feedback.Skeleton(element, options);
    return skeleton;
  },

  /**
   * 무한 스크롤 단축 생성
   * @param {string|HTMLElement} element - 스크롤 컨테이너
   * @param {Object} options - 옵션 (loadMore 콜백)
   * @returns {Promise<InfiniteScroll>}
   */
  async infiniteScroll(element, options) {
    const Scroll = await this.use('scroll');
    const scroll = new Scroll.InfiniteScroll(element, options);
    this.view.registerInstance(scroll);
    return scroll;
  },

  /**
   * 페이지네이션 단축 생성
   * @param {string|HTMLElement} element - 컨테이너
   * @param {Object} options - 옵션
   * @returns {Promise<Pagination>}
   */
  async pagination(element, options) {
    const PaginationModule = await this.use('pagination');
    const pagination = new PaginationModule.Pagination(element, options);
    this.view.registerInstance(pagination);
    return pagination;
  },

  /**
   * 간트 차트 단축 생성
   * @param {string|HTMLElement} element - 컨테이너
   * @param {Object} options - 옵션
   * @returns {Promise<Gantt>}
   */
  async gantt(element, options) {
    const Gantt = await this.use('gantt');
    const gantt = new Gantt(element, options);
    this.view.registerInstance(gantt);
    return gantt;
  },

  /**
   * 이미지 목록 (갤러리) 단축 생성
   * @param {string|HTMLElement} element - 컨테이너
   * @param {Object} options - 옵션
   * @returns {Promise<ImageList>}
   */
  async imageList(element, options) {
    const ImageModule = await this.use('imagelist');
    const imageList = new ImageModule.ImageList(element, options);
    this.view.registerInstance(imageList);
    return imageList;
  },

  /**
   * 이미지 비교 슬라이더
   * @param {string|HTMLElement} element - 컨테이너
   * @param {Object} options - 옵션 (before, after 이미지)
   * @returns {Promise<ImageCompare>}
   */
  async imageCompare(element, options) {
    const ImageModule = await this.use('imagelist');
    const compare = new ImageModule.ImageCompare(element, options);
    this.view.registerInstance(compare);
    return compare;
  },

  // ===== Theme API =====
  /**
   * 테마 관리 객체
   * @description 테마 전환 효과를 포함한 테마 관리 API
   * 
   * @example
   * // 기본 토글
   * IMCAT.theme.toggle();
   * 
   * // 클릭 위치 기반 원형 전환 (View Transitions API)
   * btn.addEventListener('click', (e) => IMCAT.theme.toggleWithEvent(e));
   * 
   * // 전환 효과 초기화
   * IMCAT.theme.init({ transition: 'circle', transitionDuration: 800 });
   */
  theme: {
    _imcat: null,
    _instance: null,

    /**
     * 사용 가능한 전환 효과 타입
     * @type {Object}
     * @property {string} NONE - 즉시 전환 (애니메이션 없음)
     * @property {string} FADE - 페이드 효과
     * @property {string} SLIDE - 슬라이드 효과
     * @property {string} CIRCLE - 클릭 위치 기반 원형 확산
     * @property {string} CIRCLE_TOP_LEFT - 좌상단에서 원형 확산
     * @property {string} CIRCLE_TOP_RIGHT - 우상단에서 원형 확산
     * @property {string} CIRCLE_BOTTOM_LEFT - 좌하단에서 원형 확산
     * @property {string} CIRCLE_BOTTOM_RIGHT - 우하단에서 원형 확산
     * @property {string} CIRCLE_CENTER - 화면 중앙에서 원형 확산
     */
    TRANSITIONS: {
      NONE: 'none',
      FADE: 'fade',
      SLIDE: 'slide',
      CIRCLE: 'circle',
      CIRCLE_TOP_LEFT: 'circle-top-left',
      CIRCLE_TOP_RIGHT: 'circle-top-right',
      CIRCLE_BOTTOM_LEFT: 'circle-bottom-left',
      CIRCLE_BOTTOM_RIGHT: 'circle-bottom-right',
      CIRCLE_CENTER: 'circle-center'
    },

    async _getModule() {
      if (!this._imcat) {
        throw new Error('Theme: IMCAT 인스턴스가 설정되지 않았습니다.');
      }
      return await this._imcat.use('theme');
    },

    async _getInstance() {
      if (!this._instance) {
        const ThemeModule = await this._getModule();
        this._instance = ThemeModule.initTheme({
          transition: 'circle',
          transitionDuration: 500
        });
      }
      return this._instance;
    },

    /**
     * 테마 초기화 (전환 효과 설정)
     * @param {Object} options - 옵션
     * @returns {Promise<Theme>}
     * 
     * @example
     * IMCAT.theme.init({ transition: 'circle', transitionDuration: 800 });
     */
    async init(options = {}) {
      const ThemeModule = await this._getModule();
      this._instance = ThemeModule.initTheme({
        transition: 'circle',
        transitionDuration: 500,
        ...options
      });
      return this._instance;
    },

    /**
     * 테마 토글 (light ↔ dark)
     * @param {boolean} [animate=true] - 애니메이션 적용 여부
     * 
     * @example
     * IMCAT.theme.toggle();
     */
    async toggle(animate = true) {
      const instance = await this._getInstance();
      instance.toggle(animate);
    },

    /**
     * 클릭 이벤트 기반 테마 전환 (원형 효과)
     * @param {MouseEvent} event - 클릭 이벤트
     * @param {string} [theme] - 테마 ('light', 'dark'). 생략 시 토글
     * 
     * @example
     * button.addEventListener('click', (e) => IMCAT.theme.toggleWithEvent(e));
     */
    async toggleWithEvent(event, theme) {
      const instance = await this._getInstance();
      instance.toggleWithEvent(event, theme);
    },

    /**
     * 테마 설정
     * @param {string} theme - 테마 ('light', 'dark', 'system')
     * @param {boolean} [animate=true] - 애니메이션 적용 여부
     * 
     * @example
     * IMCAT.theme.set('dark');
     */
    async set(theme, animate = true) {
      const instance = await this._getInstance();
      instance.setTheme(theme, animate);
    },

    /**
     * 현재 테마 가져오기
     * @returns {Promise<string>} 'light' | 'dark'
     */
    async get() {
      const instance = await this._getInstance();
      return instance.getResolved();
    },

    /**
     * 다크 모드 여부
     * @returns {Promise<boolean>}
     */
    async isDark() {
      const theme = await this.get();
      return theme === 'dark';
    },

    /**
     * 라이트 모드 여부
     * @returns {Promise<boolean>}
     */
    async isLight() {
      const theme = await this.get();
      return theme === 'light';
    }
  }
};

export default Shortcuts;
