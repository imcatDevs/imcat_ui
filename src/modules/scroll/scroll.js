/**
 * Scroll Components Module
 * Virtual Scroll, Scrollspy, Infinite Scroll 컴포넌트
 * @module modules/scroll
 */

// ============================================
// VirtualScroll - 가상 스크롤
// ============================================

/**
 * VirtualScroll 클래스
 * 대용량 리스트를 효율적으로 렌더링
 */
class VirtualScroll {
  /** @type {Map<HTMLElement, VirtualScroll>} */
  static instances = new Map();

  /**
   * 기본 옵션
   * @returns {Object}
   */
  static defaults() {
    return {
      itemHeight: 50,           // 아이템 높이 (px)
      bufferSize: 5,            // 버퍼 아이템 수
      items: [],                // 데이터 배열
      renderItem: null,         // (item, index) => html
      containerHeight: 400,     // 컨테이너 높이
      onScroll: null           // (scrollTop, visibleRange) => {}
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
      console.error('VirtualScroll: Container not found');
      return;
    }

    this.options = { ...VirtualScroll.defaults(), ...options };
    this._scrollTop = 0;
    this._visibleRange = { start: 0, end: 0 };
    this._onScroll = null;

    this.init();
    VirtualScroll.instances.set(this.container, this);
  }

  init() {
    this._render();
    this._bindEvents();
    this._updateVisibleItems();
  }

  _render() {
    const { containerHeight, items, itemHeight } = this.options;
    const totalHeight = items.length * itemHeight;

    this.container.className = 'virtual-scroll';
    this.container.style.height = `${containerHeight}px`;
    this.container.style.overflow = 'auto';
    this.container.style.position = 'relative';

    this.container.innerHTML = `
      <div class="virtual-scroll__spacer" style="height: ${totalHeight}px; position: relative;">
        <div class="virtual-scroll__content"></div>
      </div>
    `;

    this.spacer = this.container.querySelector('.virtual-scroll__spacer');
    this.content = this.container.querySelector('.virtual-scroll__content');
  }

  _bindEvents() {
    this._onScroll = () => {
      this._scrollTop = this.container.scrollTop;
      this._updateVisibleItems();

      if (this.options.onScroll) {
        this.options.onScroll(this._scrollTop, this._visibleRange);
      }
    };

    this.container.addEventListener('scroll', this._onScroll, { passive: true });
  }

  _updateVisibleItems() {
    const { itemHeight, bufferSize, items, containerHeight, renderItem } = this.options;

    if (!renderItem) return;

    const scrollTop = this._scrollTop;
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - bufferSize);
    const endIndex = Math.min(
      items.length,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + bufferSize
    );

    this._visibleRange = { start: startIndex, end: endIndex };

    // 콘텐츠 위치 조정
    this.content.style.position = 'absolute';
    this.content.style.top = `${startIndex * itemHeight}px`;
    this.content.style.left = '0';
    this.content.style.right = '0';

    // 보이는 아이템만 렌더링
    const visibleItems = items.slice(startIndex, endIndex);
    this.content.innerHTML = visibleItems.map((item, idx) =>
      `<div class="virtual-scroll__item" style="height: ${itemHeight}px;" data-index="${startIndex + idx}">
        ${renderItem(item, startIndex + idx)}
      </div>`
    ).join('');
  }

  /**
   * 데이터 업데이트
   * @param {Array} items
   */
  setItems(items) {
    this.options.items = items;
    const totalHeight = items.length * this.options.itemHeight;
    this.spacer.style.height = `${totalHeight}px`;
    this._updateVisibleItems();
  }

  /**
   * 특정 인덱스로 스크롤
   * @param {number} index
   * @param {boolean} [smooth=true]
   */
  scrollToIndex(index, smooth = true) {
    const top = index * this.options.itemHeight;
    this.container.scrollTo({
      top,
      behavior: smooth ? 'smooth' : 'auto'
    });
  }

  /**
   * 현재 보이는 범위 반환
   * @returns {{start: number, end: number}}
   */
  getVisibleRange() {
    return { ...this._visibleRange };
  }

  /**
   * 새로고침
   */
  refresh() {
    this._updateVisibleItems();
  }

  destroy() {
    if (this._onScroll) {
      this.container.removeEventListener('scroll', this._onScroll);
    }

    VirtualScroll.instances.delete(this.container);

    if (this.container) {
      this.container.innerHTML = '';
    }

    this.container = null;
    this.spacer = null;
    this.content = null;
  }
}


// ============================================
// Scrollspy - 스크롤 스파이
// ============================================

/**
 * Scrollspy 클래스
 * 스크롤 위치에 따라 네비게이션 활성화
 */
class Scrollspy {
  /** @type {Map<HTMLElement, Scrollspy>} */
  static instances = new Map();

  /**
   * 기본 옵션
   * @returns {Object}
   */
  static defaults() {
    return {
      target: null,             // 네비게이션 컨테이너 선택자
      sections: [],             // 섹션 선택자 배열 또는 자동 감지
      offset: 100,              // 활성화 오프셋 (px)
      activeClass: 'is-active', // 활성 클래스
      smoothScroll: true,       // 부드러운 스크롤
      onChange: null           // (activeId, prevId) => {}
    };
  }

  /**
   * @param {string|HTMLElement} selector - 스크롤 컨테이너
   * @param {Object} options
   */
  constructor(selector, options = {}) {
    this.scrollContainer = typeof selector === 'string'
      ? (selector === 'window' ? window : document.querySelector(selector))
      : selector;

    if (!this.scrollContainer) {
      console.error('Scrollspy: Container not found');
      return;
    }

    this.options = { ...Scrollspy.defaults(), ...options };
    this.navContainer = this.options.target
      ? document.querySelector(this.options.target)
      : null;

    this._sections = [];
    this._activeId = null;
    this._onScroll = null;
    this._onNavClick = null;

    this.init();

    const key = this.scrollContainer === window ? document.body : this.scrollContainer;
    Scrollspy.instances.set(key, this);
  }

  init() {
    this._collectSections();
    this._bindEvents();
    this._update();
  }

  _collectSections() {
    const { sections } = this.options;

    if (sections && sections.length > 0) {
      // 명시적으로 지정된 섹션
      this._sections = sections.map(sel => {
        const el = document.querySelector(sel);
        return el ? { id: el.id || sel, element: el } : null;
      }).filter(Boolean);
    } else if (this.navContainer) {
      // 네비게이션의 링크에서 섹션 추출
      const links = this.navContainer.querySelectorAll('a[href^="#"]');
      this._sections = Array.from(links).map(link => {
        const id = link.getAttribute('href').slice(1);
        const el = document.getElementById(id);
        return el ? { id, element: el } : null;
      }).filter(Boolean);
    }
  }

  _bindEvents() {
    // 스크롤 이벤트
    this._onScroll = () => {
      requestAnimationFrame(() => this._update());
    };

    this.scrollContainer.addEventListener('scroll', this._onScroll, { passive: true });

    // 네비게이션 클릭 이벤트
    if (this.navContainer && this.options.smoothScroll) {
      this._onNavClick = (e) => {
        const link = e.target.closest('a[href^="#"]');
        if (!link) return;

        const id = link.getAttribute('href').slice(1);
        const section = this._sections.find(s => s.id === id);

        if (section) {
          e.preventDefault();
          this.scrollTo(id);
        }
      };

      this.navContainer.addEventListener('click', this._onNavClick);
    }
  }

  _update() {
    const { offset, activeClass, onChange } = this.options;

    const scrollTop = this.scrollContainer === window
      ? window.scrollY
      : this.scrollContainer.scrollTop;

    let activeSection = null;

    // 현재 위치에서 가장 가까운 섹션 찾기
    for (const section of this._sections) {
      const rect = section.element.getBoundingClientRect();
      const top = this.scrollContainer === window
        ? rect.top + scrollTop
        : rect.top + this.scrollContainer.scrollTop - this.scrollContainer.getBoundingClientRect().top;

      if (top <= scrollTop + offset) {
        activeSection = section;
      }
    }

    // 맨 아래 스크롤 시 마지막 섹션 활성화
    const isAtBottom = this.scrollContainer === window
      ? window.innerHeight + scrollTop >= document.documentElement.scrollHeight - 10
      : this.scrollContainer.scrollTop + this.scrollContainer.clientHeight >= this.scrollContainer.scrollHeight - 10;

    if (isAtBottom && this._sections.length > 0) {
      activeSection = this._sections[this._sections.length - 1];
    }

    const newActiveId = activeSection ? activeSection.id : null;

    if (newActiveId !== this._activeId) {
      const prevId = this._activeId;
      this._activeId = newActiveId;

      // 네비게이션 업데이트
      if (this.navContainer) {
        this.navContainer.querySelectorAll('a[href^="#"]').forEach(link => {
          link.classList.remove(activeClass);
          const parent = link.parentElement;
          if (parent) parent.classList.remove(activeClass);
        });

        if (newActiveId) {
          const activeLink = this.navContainer.querySelector(`a[href="#${newActiveId}"]`);
          if (activeLink) {
            activeLink.classList.add(activeClass);
            const parent = activeLink.parentElement;
            if (parent) parent.classList.add(activeClass);
          }
        }
      }

      if (onChange) {
        onChange(newActiveId, prevId);
      }
    }
  }

  /**
   * 특정 섹션으로 스크롤
   * @param {string} id
   */
  scrollTo(id) {
    const section = this._sections.find(s => s.id === id);
    if (!section) return;

    const { offset } = this.options;
    const rect = section.element.getBoundingClientRect();

    if (this.scrollContainer === window) {
      const top = rect.top + window.scrollY - offset + 1;
      window.scrollTo({ top, behavior: 'smooth' });
    } else {
      const containerRect = this.scrollContainer.getBoundingClientRect();
      const top = rect.top - containerRect.top + this.scrollContainer.scrollTop - offset + 1;
      this.scrollContainer.scrollTo({ top, behavior: 'smooth' });
    }
  }

  /**
   * 현재 활성 섹션 ID 반환
   * @returns {string|null}
   */
  getActive() {
    return this._activeId;
  }

  /**
   * 섹션 목록 새로고침
   */
  refresh() {
    this._collectSections();
    this._update();
  }

  destroy() {
    if (this._onScroll) {
      this.scrollContainer.removeEventListener('scroll', this._onScroll);
    }

    if (this._onNavClick && this.navContainer) {
      this.navContainer.removeEventListener('click', this._onNavClick);
    }

    const key = this.scrollContainer === window ? document.body : this.scrollContainer;
    Scrollspy.instances.delete(key);

    this.scrollContainer = null;
    this.navContainer = null;
    this._sections = null;
  }
}


// ============================================
// InfiniteScroll - 무한 스크롤
// ============================================

/**
 * InfiniteScroll 클래스
 * 스크롤 시 자동으로 콘텐츠 로드
 */
class InfiniteScroll {
  /** @type {Map<HTMLElement, InfiniteScroll>} */
  static instances = new Map();

  /**
   * 기본 옵션
   * @returns {Object}
   */
  static defaults() {
    return {
      threshold: 200,           // 트리거 임계값 (px)
      loadMore: null,           // async () => items
      renderItem: null,         // (item, index) => html
      hasMore: true,            // 더 로드할 데이터 존재 여부
      loadingHTML: '<div class="infinite-scroll__loading"><div class="spinner"></div></div>',
      endHTML: '<div class="infinite-scroll__end">모든 항목을 불러왔습니다.</div>',
      errorHTML: '<div class="infinite-scroll__error">오류가 발생했습니다. <button class="infinite-scroll__retry">다시 시도</button></div>',
      onLoad: null             // (items, totalLoaded) => {}
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
      console.error('InfiniteScroll: Container not found');
      return;
    }

    this.options = { ...InfiniteScroll.defaults(), ...options };
    this._loading = false;
    this._hasMore = this.options.hasMore;
    this._totalLoaded = 0;
    this._onScroll = null;
    this._sentinel = null;
    this._observer = null;

    this.init();
    InfiniteScroll.instances.set(this.container, this);
  }

  init() {
    this._render();
    this._setupObserver();
  }

  _render() {
    this.container.classList.add('infinite-scroll');

    // 콘텐츠 컨테이너
    if (!this.container.querySelector('.infinite-scroll__items')) {
      const items = document.createElement('div');
      items.className = 'infinite-scroll__items';

      // 기존 내용을 items로 이동
      while (this.container.firstChild) {
        items.appendChild(this.container.firstChild);
      }

      this.container.appendChild(items);
    }

    this.itemsContainer = this.container.querySelector('.infinite-scroll__items');

    // 센티널 (로드 트리거 요소)
    this._sentinel = document.createElement('div');
    this._sentinel.className = 'infinite-scroll__sentinel';
    this.container.appendChild(this._sentinel);

    // 상태 표시 영역
    this._statusEl = document.createElement('div');
    this._statusEl.className = 'infinite-scroll__status';
    this.container.appendChild(this._statusEl);
  }

  _setupObserver() {
    const { threshold } = this.options;

    this._observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !this._loading && this._hasMore) {
          this._loadMore();
        }
      },
      {
        root: null,
        rootMargin: `${threshold}px`,
        threshold: 0
      }
    );

    this._observer.observe(this._sentinel);
  }

  async _loadMore() {
    const { loadMore, renderItem, loadingHTML, endHTML, errorHTML, onLoad } = this.options;

    if (!loadMore || this._loading || !this._hasMore) return;

    this._loading = true;
    this._statusEl.innerHTML = loadingHTML;

    try {
      const items = await loadMore();

      if (!items || items.length === 0) {
        this._hasMore = false;
        this._statusEl.innerHTML = endHTML;
      } else {
        // 아이템 렌더링
        if (renderItem) {
          const fragment = document.createDocumentFragment();
          items.forEach((item, idx) => {
            const div = document.createElement('div');
            div.className = 'infinite-scroll__item';
            div.innerHTML = renderItem(item, this._totalLoaded + idx);
            fragment.appendChild(div);
          });
          this.itemsContainer.appendChild(fragment);
        }

        this._totalLoaded += items.length;
        this._statusEl.innerHTML = '';

        if (onLoad) {
          onLoad(items, this._totalLoaded);
        }
      }
    } catch (error) {
      console.error('InfiniteScroll load error:', error);
      this._statusEl.innerHTML = errorHTML;

      // 재시도 버튼
      const retryBtn = this._statusEl.querySelector('.infinite-scroll__retry');
      if (retryBtn) {
        retryBtn.addEventListener('click', () => {
          this._loading = false;
          this._loadMore();
        }, { once: true });
      }
    } finally {
      this._loading = false;
    }
  }

  /**
   * 수동으로 로드 트리거
   */
  loadMore() {
    this._loadMore();
  }

  /**
   * 더 로드할 데이터 설정
   * @param {boolean} hasMore
   */
  setHasMore(hasMore) {
    this._hasMore = hasMore;
    if (!hasMore) {
      this._statusEl.innerHTML = this.options.endHTML;
    }
  }

  /**
   * 리스트 초기화
   */
  reset() {
    this.itemsContainer.innerHTML = '';
    this._totalLoaded = 0;
    this._hasMore = true;
    this._loading = false;
    this._statusEl.innerHTML = '';
  }

  /**
   * 아이템 추가
   * @param {Array} items
   */
  appendItems(items) {
    const { renderItem } = this.options;
    if (!renderItem) return;

    const fragment = document.createDocumentFragment();
    items.forEach((item, idx) => {
      const div = document.createElement('div');
      div.className = 'infinite-scroll__item';
      div.innerHTML = renderItem(item, this._totalLoaded + idx);
      fragment.appendChild(div);
    });
    this.itemsContainer.appendChild(fragment);
    this._totalLoaded += items.length;
  }

  destroy() {
    if (this._observer) {
      this._observer.disconnect();
    }

    InfiniteScroll.instances.delete(this.container);

    if (this.container) {
      this.container.classList.remove('infinite-scroll');
    }

    this.container = null;
    this.itemsContainer = null;
    this._sentinel = null;
    this._statusEl = null;
  }
}


// ============================================
// SmoothScroll - 부드러운 스크롤
// ============================================

/**
 * SmoothScroll 유틸리티
 * 부드러운 스크롤 헬퍼 함수들
 */
const SmoothScroll = {
  /**
   * 요소로 스크롤
   * @param {string|HTMLElement} target
   * @param {Object} options
   */
  to(target, options = {}) {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return;

    const { offset = 0, duration = 500, easing = 'easeInOutCubic' } = options;
    const start = window.scrollY;
    const targetTop = el.getBoundingClientRect().top + start - offset;
    const distance = targetTop - start;
    let startTime = null;

    const easings = {
      linear: t => t,
      easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
      easeOutQuad: t => 1 - (1 - t) * (1 - t),
      easeInOutQuad: t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
    };

    const easingFn = easings[easing] || easings.easeInOutCubic;

    function animate(currentTime) {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      window.scrollTo(0, start + distance * easingFn(progress));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }

    requestAnimationFrame(animate);
  },

  /**
   * 맨 위로 스크롤
   * @param {Object} options
   */
  toTop(options = {}) {
    const { duration = 500, easing = 'easeInOutCubic' } = options;
    const start = window.scrollY;
    let startTime = null;

    const easings = {
      linear: t => t,
      easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
    };

    function animate(currentTime) {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      window.scrollTo(0, start * (1 - easings[easing](progress)));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }

    requestAnimationFrame(animate);
  },

  /**
   * 맨 아래로 스크롤
   * @param {Object} options
   */
  toBottom(options = {}) {
    const { duration = 500 } = options;
    const targetTop = document.documentElement.scrollHeight - window.innerHeight;

    window.scrollTo({
      top: targetTop,
      behavior: duration > 0 ? 'smooth' : 'auto'
    });
  }
};


// ============================================
// BackToTop - 맨 위로 버튼
// ============================================

/**
 * BackToTop 클래스
 * 스크롤 시 나타나는 맨 위로 버튼
 */
class BackToTop {
  /** @type {BackToTop|null} */
  static instance = null;

  /**
   * 기본 옵션
   * @returns {Object}
   */
  static defaults() {
    return {
      threshold: 300,           // 표시 임계값 (px)
      position: 'bottom-right', // 'bottom-right' | 'bottom-left'
      icon: 'arrow_upward',
      title: '맨 위로',
      smooth: true
    };
  }

  /**
   * @param {Object} options
   */
  constructor(options = {}) {
    if (BackToTop.instance) {
      return BackToTop.instance;
    }

    this.options = { ...BackToTop.defaults(), ...options };
    this.button = null;
    this._onScroll = null;
    this._onClick = null;

    this.init();
    BackToTop.instance = this;
  }

  init() {
    this._render();
    this._bindEvents();
    this._update();
  }

  _render() {
    const { position, icon, title } = this.options;

    this.button = document.createElement('button');
    this.button.className = `back-to-top back-to-top--${position}`;
    this.button.setAttribute('aria-label', title);
    this.button.setAttribute('title', title);
    this.button.innerHTML = `<i class="material-icons-outlined">${icon}</i>`;

    document.body.appendChild(this.button);
  }

  _bindEvents() {
    this._onScroll = () => {
      requestAnimationFrame(() => this._update());
    };

    this._onClick = () => {
      if (this.options.smooth) {
        SmoothScroll.toTop();
      } else {
        window.scrollTo(0, 0);
      }
    };

    window.addEventListener('scroll', this._onScroll, { passive: true });
    this.button.addEventListener('click', this._onClick);
  }

  _update() {
    const show = window.scrollY > this.options.threshold;
    this.button.classList.toggle('is-visible', show);
  }

  /**
   * 버튼 표시
   */
  show() {
    this.button.classList.add('is-visible');
  }

  /**
   * 버튼 숨김
   */
  hide() {
    this.button.classList.remove('is-visible');
  }

  destroy() {
    if (this._onScroll) {
      window.removeEventListener('scroll', this._onScroll);
    }

    if (this._onClick && this.button) {
      this.button.removeEventListener('click', this._onClick);
    }

    if (this.button) {
      this.button.remove();
    }

    BackToTop.instance = null;
    this.button = null;
  }
}


// ============================================
// Export
// ============================================

export { VirtualScroll, Scrollspy, InfiniteScroll, SmoothScroll, BackToTop };
export default { VirtualScroll, Scrollspy, InfiniteScroll, SmoothScroll, BackToTop };
