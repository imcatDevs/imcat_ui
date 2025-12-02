/**
 * Pagination Module
 * @module modules/pagination
 * @description 동적 페이지네이션 컴포넌트 - JSON 데이터와 함께 사용 가능
 */

import { EventBus } from '../../core/event.js';
import { Utils } from '../../core/utils.js';

/**
 * Pagination 클래스
 * @class
 * @description 데이터 기반 동적 페이지네이션
 */
class Pagination {
  /**
   * 인스턴스 맵
   * @static
   */
  static instances = new Map();

  /**
   * 기본 옵션
   * @returns {Object}
   */
  static defaults() {
    return {
      totalItems: 0,            // 총 아이템 수
      itemsPerPage: 10,         // 페이지당 아이템 수
      currentPage: 1,           // 현재 페이지
      maxVisiblePages: 5,       // 표시할 최대 페이지 수
      showFirstLast: true,      // 처음/마지막 버튼 표시
      showPrevNext: true,       // 이전/다음 버튼 표시
      showEllipsis: true,       // 생략 부호(...) 표시
      showInfo: false,          // 정보 텍스트 표시 ("1-10 of 100")
      size: 'default',          // 'sm', 'default', 'lg'
      rounded: false,           // 원형 스타일
      align: 'start',           // 'start', 'center', 'end'
      icons: true,              // 아이콘 사용
      labels: {
        first: 'first_page',
        prev: 'chevron_left',
        next: 'chevron_right',
        last: 'last_page',
        firstText: '처음',
        prevText: '이전',
        nextText: '다음',
        lastText: '마지막'
      },
      infoTemplate: '{{start}}-{{end}} / {{total}}',
      onChange: null,           // 페이지 변경 콜백
      onInit: null,             // 초기화 콜백
      onDestroy: null           // 정리 콜백
    };
  }

  /**
   * Pagination 생성자
   * @constructor
   * @param {string|HTMLElement} container - 컨테이너 요소
   * @param {Object} options - 옵션
   */
  constructor(container, options = {}) {
    this.options = Utils.extend({}, Pagination.defaults(), options);
    this.id = Utils.randomId('pagination');
    this.eventBus = new EventBus();

    // 컨테이너 요소 찾기
    if (typeof container === 'string') {
      this.container = document.querySelector(container);
    } else {
      this.container = container;
    }

    if (!this.container) {
      console.error('Pagination: 컨테이너 요소를 찾을 수 없습니다.');
      return;
    }

    // 상태
    this.currentPage = this.options.currentPage;
    this.totalPages = Math.ceil(this.options.totalItems / this.options.itemsPerPage);

    // DOM 요소
    this.nav = null;
    this.ul = null;
    this.infoEl = null;

    // 이벤트 핸들러 바인딩
    this._handleClick = this._handleClick.bind(this);
    this._handleKeydown = this._handleKeydown.bind(this);

    // 초기화
    this._init();

    // 인스턴스 등록
    Pagination.instances.set(this.container, this);
  }

  /**
   * 초기화
   * @private
   */
  _init() {
    this._createStructure();
    this._render();
    this._bindEvents();

    // 초기화 콜백
    if (typeof this.options.onInit === 'function') {
      this.options.onInit(this);
    }

    this.eventBus.emit('imcat:paginationinit', { pagination: this });
  }

  /**
   * DOM 구조 생성
   * @private
   */
  _createStructure() {
    // 래퍼 생성
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'pagination-wrapper';
    this.wrapper.id = this.id;

    // 정렬 클래스 추가
    if (this.options.align === 'center') {
      this.wrapper.classList.add('pagination-wrapper--center');
    } else if (this.options.align === 'end') {
      this.wrapper.classList.add('pagination-wrapper--end');
    }

    // 정보 텍스트
    if (this.options.showInfo) {
      this.infoEl = document.createElement('span');
      this.infoEl.className = 'pagination-info';
      this.wrapper.appendChild(this.infoEl);
    }

    // nav 요소 생성
    this.nav = document.createElement('nav');
    this.nav.setAttribute('aria-label', 'Pagination');

    // ul 요소 생성
    this.ul = document.createElement('ul');
    this.ul.className = 'pagination';

    // 크기 클래스
    if (this.options.size === 'sm') {
      this.ul.classList.add('pagination-sm');
    } else if (this.options.size === 'lg') {
      this.ul.classList.add('pagination-lg');
    }

    // 원형 클래스
    if (this.options.rounded) {
      this.ul.classList.add('pagination-rounded');
    }

    this.nav.appendChild(this.ul);
    this.wrapper.appendChild(this.nav);
    this.container.appendChild(this.wrapper);
  }

  /**
   * 페이지네이션 렌더링
   * @private
   */
  _render() {
    this.ul.innerHTML = '';
    this.totalPages = Math.ceil(this.options.totalItems / this.options.itemsPerPage);

    if (this.totalPages <= 0) {
      this._updateInfo();
      return;
    }

    // 처음 버튼
    if (this.options.showFirstLast) {
      this._createPageItem('first', this.currentPage === 1);
    }

    // 이전 버튼
    if (this.options.showPrevNext) {
      this._createPageItem('prev', this.currentPage === 1);
    }

    // 페이지 번호들
    const pages = this._calculateVisiblePages();
    pages.forEach(page => {
      if (page === 'ellipsis-start' || page === 'ellipsis-end') {
        this._createEllipsis();
      } else {
        this._createPageItem(page, false, page === this.currentPage);
      }
    });

    // 다음 버튼
    if (this.options.showPrevNext) {
      this._createPageItem('next', this.currentPage === this.totalPages);
    }

    // 마지막 버튼
    if (this.options.showFirstLast) {
      this._createPageItem('last', this.currentPage === this.totalPages);
    }

    // 정보 업데이트
    this._updateInfo();
  }

  /**
   * 표시할 페이지 번호 계산
   * @private
   * @returns {Array}
   */
  _calculateVisiblePages() {
    const pages = [];
    const maxVisible = this.options.maxVisiblePages;
    const total = this.totalPages;
    const current = this.currentPage;

    if (total <= maxVisible) {
      // 전체 페이지 수가 최대 표시 수보다 작으면 모두 표시
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      // 현재 페이지 주변 페이지 계산
      const sidePages = Math.floor((maxVisible - 3) / 2); // 양쪽에 표시할 페이지 수
      let startPage = current - sidePages;
      let endPage = current + sidePages;

      // 시작 페이지 조정
      if (startPage <= 2) {
        startPage = 1;
        endPage = maxVisible - 2;
      }

      // 끝 페이지 조정
      if (endPage >= total - 1) {
        endPage = total;
        startPage = total - maxVisible + 3;
      }

      // 첫 페이지
      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2 && this.options.showEllipsis) {
          pages.push('ellipsis-start');
        }
      }

      // 중간 페이지들
      for (let i = Math.max(startPage, 1); i <= Math.min(endPage, total); i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }

      // 마지막 페이지
      if (endPage < total) {
        if (endPage < total - 1 && this.options.showEllipsis) {
          pages.push('ellipsis-end');
        }
        if (!pages.includes(total)) {
          pages.push(total);
        }
      }
    }

    return pages;
  }

  /**
   * 페이지 아이템 생성
   * @private
   * @param {number|string} page - 페이지 번호 또는 타입
   * @param {boolean} disabled - 비활성화 여부
   * @param {boolean} active - 활성화 여부
   */
  _createPageItem(page, disabled = false, active = false) {
    const li = document.createElement('li');
    li.className = 'page-item';

    if (disabled) {
      li.classList.add('disabled');
    }
    if (active) {
      li.classList.add('active');
    }

    const link = document.createElement('a');
    link.className = 'page-link';
    link.href = '#';
    link.setAttribute('role', 'button');

    // 타입에 따른 컨텐츠 설정
    if (typeof page === 'number') {
      link.textContent = page;
      link.setAttribute('data-page', page);
      link.setAttribute('aria-label', `${page} 페이지`);
      if (active) {
        link.setAttribute('aria-current', 'page');
      }
    } else {
      link.setAttribute('data-action', page);
      if (this.options.icons) {
        const icon = document.createElement('i');
        icon.className = 'material-icons-outlined';
        icon.textContent = this.options.labels[page];
        link.appendChild(icon);
      } else {
        link.textContent = this.options.labels[page + 'Text'];
      }

      // aria-label 설정
      const ariaLabels = {
        first: '처음 페이지',
        prev: '이전 페이지',
        next: '다음 페이지',
        last: '마지막 페이지'
      };
      link.setAttribute('aria-label', ariaLabels[page]);
    }

    if (disabled) {
      link.setAttribute('tabindex', '-1');
      link.setAttribute('aria-disabled', 'true');
    }

    li.appendChild(link);
    this.ul.appendChild(li);
  }

  /**
   * 생략 부호 생성
   * @private
   */
  _createEllipsis() {
    const li = document.createElement('li');
    li.className = 'page-item disabled';

    const span = document.createElement('span');
    span.className = 'page-link';
    span.textContent = '...';
    span.setAttribute('aria-hidden', 'true');

    li.appendChild(span);
    this.ul.appendChild(li);
  }

  /**
   * 정보 텍스트 업데이트
   * @private
   */
  _updateInfo() {
    if (!this.infoEl) return;

    const start = this.options.totalItems === 0 ? 0 : (this.currentPage - 1) * this.options.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.options.itemsPerPage, this.options.totalItems);
    const total = this.options.totalItems;

    let info = this.options.infoTemplate
      .replace('{{start}}', start)
      .replace('{{end}}', end)
      .replace('{{total}}', total)
      .replace('{{currentPage}}', this.currentPage)
      .replace('{{totalPages}}', this.totalPages);

    this.infoEl.textContent = info;
  }

  /**
   * 이벤트 바인딩
   * @private
   */
  _bindEvents() {
    this.ul.addEventListener('click', this._handleClick);
    this.ul.addEventListener('keydown', this._handleKeydown);
  }

  /**
   * 클릭 핸들러
   * @private
   * @param {Event} e
   */
  _handleClick(e) {
    e.preventDefault();

    const link = e.target.closest('.page-link');
    if (!link) return;

    const li = link.closest('.page-item');
    if (li.classList.contains('disabled') || li.classList.contains('active')) return;

    const page = link.getAttribute('data-page');
    const action = link.getAttribute('data-action');

    if (page) {
      this.goToPage(parseInt(page, 10));
    } else if (action) {
      switch (action) {
        case 'first':
          this.goToPage(1);
          break;
        case 'prev':
          this.goToPage(this.currentPage - 1);
          break;
        case 'next':
          this.goToPage(this.currentPage + 1);
          break;
        case 'last':
          this.goToPage(this.totalPages);
          break;
      }
    }
  }

  /**
   * 키보드 핸들러
   * @private
   * @param {KeyboardEvent} e
   */
  _handleKeydown(e) {
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        if (this.currentPage > 1) {
          this.goToPage(this.currentPage - 1);
        }
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (this.currentPage < this.totalPages) {
          this.goToPage(this.currentPage + 1);
        }
        break;
      case 'Home':
        e.preventDefault();
        this.goToPage(1);
        break;
      case 'End':
        e.preventDefault();
        this.goToPage(this.totalPages);
        break;
    }
  }

  /**
   * 특정 페이지로 이동
   * @param {number} page - 이동할 페이지 번호
   */
  goToPage(page) {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;

    const prevPage = this.currentPage;
    this.currentPage = page;
    this._render();

    // 콜백 실행
    if (typeof this.options.onChange === 'function') {
      const pageData = this.getPageData();
      this.options.onChange(pageData, prevPage);
    }

    // 이벤트 발행
    this.eventBus.emit('imcat:paginationchange', {
      pagination: this,
      currentPage: this.currentPage,
      prevPage: prevPage,
      pageData: this.getPageData()
    });
  }

  /**
   * 현재 페이지 데이터 가져오기
   * @returns {Object}
   */
  getPageData() {
    const start = (this.currentPage - 1) * this.options.itemsPerPage;
    const end = Math.min(start + this.options.itemsPerPage, this.options.totalItems);

    return {
      currentPage: this.currentPage,
      totalPages: this.totalPages,
      totalItems: this.options.totalItems,
      itemsPerPage: this.options.itemsPerPage,
      startIndex: start,
      endIndex: end,
      startNumber: start + 1,
      endNumber: end,
      isFirstPage: this.currentPage === 1,
      isLastPage: this.currentPage === this.totalPages
    };
  }

  /**
   * 총 아이템 수 업데이트
   * @param {number} totalItems - 새로운 총 아이템 수
   * @param {number} [resetPage=1] - 리셋할 페이지 (null이면 현재 페이지 유지)
   */
  setTotalItems(totalItems, resetPage = null) {
    this.options.totalItems = totalItems;
    this.totalPages = Math.ceil(totalItems / this.options.itemsPerPage);

    if (resetPage !== null) {
      this.currentPage = resetPage;
    } else if (this.currentPage > this.totalPages) {
      this.currentPage = Math.max(1, this.totalPages);
    }

    this._render();
  }

  /**
   * 페이지당 아이템 수 변경
   * @param {number} itemsPerPage - 페이지당 아이템 수
   */
  setItemsPerPage(itemsPerPage) {
    this.options.itemsPerPage = itemsPerPage;
    this.totalPages = Math.ceil(this.options.totalItems / itemsPerPage);
    this.currentPage = 1;
    this._render();
  }

  /**
   * 옵션 업데이트
   * @param {Object} newOptions - 새로운 옵션
   */
  updateOptions(newOptions) {
    Utils.extend(this.options, newOptions);
    this.totalPages = Math.ceil(this.options.totalItems / this.options.itemsPerPage);

    if (this.currentPage > this.totalPages) {
      this.currentPage = Math.max(1, this.totalPages);
    }

    this._render();
  }

  /**
   * 새로고침
   */
  refresh() {
    this._render();
  }

  /**
   * 정리 (메모리 관리)
   */
  destroy() {
    // 이벤트 리스너 제거
    if (this.ul) {
      this.ul.removeEventListener('click', this._handleClick);
      this.ul.removeEventListener('keydown', this._handleKeydown);
    }

    // DOM 요소 제거
    if (this.wrapper && this.wrapper.parentNode) {
      this.wrapper.parentNode.removeChild(this.wrapper);
    }

    // 인스턴스 맵에서 제거
    Pagination.instances.delete(this.container);

    // 콜백
    if (typeof this.options.onDestroy === 'function') {
      this.options.onDestroy();
    }

    // EventBus 정리
    if (this.eventBus) {
      this.eventBus.clear();
    }

    // 참조 해제
    this.container = null;
    this.wrapper = null;
    this.nav = null;
    this.ul = null;
    this.infoEl = null;
    this.eventBus = null;
    this.options = null;
    this._handleClick = null;
    this._handleKeydown = null;
  }
}

/**
 * DataPaginator 클래스
 * @class
 * @description JSON 데이터와 함께 사용하는 페이지네이션
 */
class DataPaginator {
  /**
   * 기본 옵션
   * @returns {Object}
   */
  static defaults() {
    return {
      data: [],                 // 원본 데이터 배열
      itemsPerPage: 10,         // 페이지당 아이템 수
      currentPage: 1,           // 시작 페이지
      renderItem: null,         // 아이템 렌더링 함수
      emptyMessage: '데이터가 없습니다.',
      paginationOptions: {},    // Pagination 컴포넌트 옵션
      onPageChange: null,       // 페이지 변경 콜백
      onDataLoad: null          // 데이터 로드 콜백
    };
  }

  /**
   * DataPaginator 생성자
   * @constructor
   * @param {Object} options - 옵션
   */
  constructor(options = {}) {
    this.options = Utils.extend({}, DataPaginator.defaults(), options);
    this.id = Utils.randomId('datapaginator');

    // 컨테이너 요소 찾기
    if (typeof options.container === 'string') {
      this.container = document.querySelector(options.container);
    } else {
      this.container = options.container;
    }

    if (!this.container) {
      console.error('DataPaginator: 컨테이너 요소를 찾을 수 없습니다.');
      return;
    }

    // 데이터
    this.data = [...this.options.data];
    this.filteredData = [...this.data];

    // DOM 요소
    this.contentEl = null;
    this.paginationEl = null;
    this.pagination = null;

    // 초기화
    this._init();
  }

  /**
   * 초기화
   * @private
   */
  _init() {
    this._createStructure();
    this._createPagination();
    this._renderCurrentPage();
  }

  /**
   * DOM 구조 생성
   * @private
   */
  _createStructure() {
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'data-paginator';
    this.wrapper.id = this.id;

    // 콘텐츠 영역
    this.contentEl = document.createElement('div');
    this.contentEl.className = 'data-paginator__content';

    // 페이지네이션 영역
    this.paginationEl = document.createElement('div');
    this.paginationEl.className = 'data-paginator__pagination';

    this.wrapper.appendChild(this.contentEl);
    this.wrapper.appendChild(this.paginationEl);
    this.container.appendChild(this.wrapper);
  }

  /**
   * 페이지네이션 생성
   * @private
   */
  _createPagination() {
    const paginationOptions = Utils.extend({}, this.options.paginationOptions, {
      totalItems: this.filteredData.length,
      itemsPerPage: this.options.itemsPerPage,
      currentPage: this.options.currentPage,
      onChange: (pageData, prevPage) => {
        this._renderCurrentPage();
        if (typeof this.options.onPageChange === 'function') {
          this.options.onPageChange(pageData, prevPage, this.getCurrentPageData());
        }
      }
    });

    this.pagination = new Pagination(this.paginationEl, paginationOptions);
  }

  /**
   * 현재 페이지 렌더링
   * @private
   */
  _renderCurrentPage() {
    const pageData = this.pagination.getPageData();
    const items = this.filteredData.slice(pageData.startIndex, pageData.endIndex);

    this.contentEl.innerHTML = '';

    if (items.length === 0) {
      const emptyEl = document.createElement('div');
      emptyEl.className = 'data-paginator__empty';
      emptyEl.textContent = this.options.emptyMessage;
      this.contentEl.appendChild(emptyEl);
      return;
    }

    // 커스텀 렌더러가 있으면 사용
    if (typeof this.options.renderItem === 'function') {
      items.forEach((item, index) => {
        const itemEl = this.options.renderItem(item, pageData.startIndex + index, pageData);
        if (itemEl) {
          if (typeof itemEl === 'string') {
            this.contentEl.insertAdjacentHTML('beforeend', itemEl);
          } else {
            this.contentEl.appendChild(itemEl);
          }
        }
      });
    } else {
      // 기본 렌더링 (JSON 표시)
      items.forEach((item, index) => {
        const itemEl = document.createElement('div');
        itemEl.className = 'data-paginator__item';
        itemEl.textContent = JSON.stringify(item);
        this.contentEl.appendChild(itemEl);
      });
    }

    // 데이터 로드 콜백
    if (typeof this.options.onDataLoad === 'function') {
      this.options.onDataLoad(items, pageData);
    }
  }

  /**
   * 데이터 설정
   * @param {Array} data - 새로운 데이터 배열
   * @param {boolean} [resetPage=true] - 페이지 초기화 여부
   */
  setData(data, resetPage = true) {
    this.data = [...data];
    this.filteredData = [...this.data];
    this.pagination.setTotalItems(this.filteredData.length, resetPage ? 1 : null);
    this._renderCurrentPage();
  }

  /**
   * 데이터 필터링
   * @param {Function} filterFn - 필터 함수
   */
  filter(filterFn) {
    if (typeof filterFn === 'function') {
      this.filteredData = this.data.filter(filterFn);
    } else {
      this.filteredData = [...this.data];
    }
    this.pagination.setTotalItems(this.filteredData.length, 1);
    this._renderCurrentPage();
  }

  /**
   * 데이터 정렬
   * @param {Function} compareFn - 비교 함수
   */
  sort(compareFn) {
    if (typeof compareFn === 'function') {
      this.filteredData.sort(compareFn);
      this._renderCurrentPage();
    }
  }

  /**
   * 검색
   * @param {string} query - 검색어
   * @param {Array<string>} fields - 검색할 필드 배열
   */
  search(query, fields = []) {
    if (!query || query.trim() === '') {
      this.filteredData = [...this.data];
    } else {
      const lowerQuery = query.toLowerCase();
      this.filteredData = this.data.filter(item => {
        if (fields.length === 0) {
          // 모든 필드 검색
          return Object.values(item).some(value =>
            String(value).toLowerCase().includes(lowerQuery)
          );
        } else {
          // 지정된 필드만 검색
          return fields.some(field =>
            String(item[field] || '').toLowerCase().includes(lowerQuery)
          );
        }
      });
    }
    this.pagination.setTotalItems(this.filteredData.length, 1);
    this._renderCurrentPage();
  }

  /**
   * 필터 초기화
   */
  resetFilter() {
    this.filteredData = [...this.data];
    this.pagination.setTotalItems(this.filteredData.length, 1);
    this._renderCurrentPage();
  }

  /**
   * 현재 페이지 데이터 가져오기
   * @returns {Array}
   */
  getCurrentPageData() {
    const pageData = this.pagination.getPageData();
    return this.filteredData.slice(pageData.startIndex, pageData.endIndex);
  }

  /**
   * 전체 필터된 데이터 가져오기
   * @returns {Array}
   */
  getFilteredData() {
    return [...this.filteredData];
  }

  /**
   * 페이지 이동
   * @param {number} page - 페이지 번호
   */
  goToPage(page) {
    this.pagination.goToPage(page);
  }

  /**
   * 정리 (메모리 관리)
   */
  destroy() {
    // Pagination 정리
    if (this.pagination) {
      this.pagination.destroy();
      this.pagination = null;
    }

    // DOM 요소 제거
    if (this.wrapper && this.wrapper.parentNode) {
      this.wrapper.parentNode.removeChild(this.wrapper);
    }

    // 참조 해제
    this.container = null;
    this.wrapper = null;
    this.contentEl = null;
    this.paginationEl = null;
    this.data = null;
    this.filteredData = null;
    this.options = null;
  }
}

// ============================================
// Module Export
// ============================================

const PaginationModule = {
  Pagination,
  DataPaginator,

  /**
   * 팩토리 메서드
   * @param {string} type - 'pagination' 또는 'dataPaginator'
   * @param {string|HTMLElement|Object} containerOrOptions - 컨테이너 또는 옵션
   * @param {Object} [options] - 옵션
   * @returns {Pagination|DataPaginator}
   */
  create(type, containerOrOptions, options) {
    switch (type) {
      case 'pagination':
        return new Pagination(containerOrOptions, options);
      case 'dataPaginator':
        return new DataPaginator(containerOrOptions);
      default:
        throw new Error(`Unknown pagination type: ${type}`);
    }
  }
};

export default PaginationModule;
