/**
 * ImageList Module
 * @module modules/imagelist
 * @description 이미지 갤러리 컴포넌트
 * - ImageList: 다양한 레이아웃 이미지 그리드
 * - Lightbox: 이미지 확대 오버레이
 * - ImageCompare: Before/After 비교
 * - LazyImage: 지연 로딩
 */

// ============================================
// ImageList - 이미지 그리드
// ============================================

class ImageList {
  static instances = new Map();

  static defaults() {
    return {
      images: [],               // [{ src, thumb?, title?, alt?, width?, height? }]
      layout: 'grid',           // grid, masonry, quilted
      columns: 4,               // 열 개수
      gap: 8,                   // 간격 (px)
      aspectRatio: '1:1',       // 1:1, 4:3, 16:9, auto
      hover: 'zoom',            // zoom, fade, overlay, none
      lightbox: true,           // 클릭 시 라이트박스
      lazy: true,               // 지연 로딩
      rounded: 8,               // border-radius
      showTitle: false,         // 타이틀 표시
      responsive: {             // 반응형 columns
        768: 3,
        480: 2
      },
      onClick: null,
      onLoad: null
    };
  }

  constructor(selector, options = {}) {
    this.container = typeof selector === 'string'
      ? document.querySelector(selector)
      : selector;

    if (!this.container) {
      console.error('ImageList: Container not found');
      return;
    }

    this.options = { ...ImageList.defaults(), ...options };
    this._lightbox = null;
    this._observer = null;
    this._onClick = null;
    this._onResize = null;
    this._resizeTimer = null;

    this.init();
    ImageList.instances.set(this.container, this);
  }

  init() {
    this._render();
    this._bindEvents();

    if (this.options.lazy) {
      this._setupLazyLoad();
    }
  }

  _render() {
    const { images, layout, gap, aspectRatio, hover, rounded, showTitle } = this.options;

    // 반응형 columns 계산
    const currentColumns = this._getResponsiveColumns();

    this.container.classList.add('image-list', `image-list--${layout}`);
    this.container.style.cssText = `
      display: grid;
      grid-template-columns: repeat(${currentColumns}, 1fr);
      gap: ${gap}px;
    `;

    // 이미지 아이템 생성
    this.container.innerHTML = images.map((img, index) => {
      const thumbSrc = img.thumb || img.src;
      const aspectClass = aspectRatio !== 'auto' ? `image-list__item--${aspectRatio.replace(':', '-')}` : '';
      const hoverClass = hover !== 'none' ? `image-list__item--hover-${hover}` : '';

      // Quilted 레이아웃: 첫 번째나 특정 이미지 크게
      let gridSpan = '';
      if (layout === 'quilted' && (index === 0 || (img.featured))) {
        gridSpan = 'grid-column: span 2; grid-row: span 2;';
      }

      return `
        <div class="image-list__item ${aspectClass} ${hoverClass}" 
             data-index="${index}" 
             style="border-radius: ${rounded}px; ${gridSpan}">
          <img 
            ${this.options.lazy ? `data-src="${thumbSrc}"` : `src="${thumbSrc}"`}
            alt="${img.alt || img.title || ''}"
            class="image-list__img ${this.options.lazy ? 'lazy' : ''}"
            loading="lazy"
          >
          ${hover === 'overlay' || showTitle ? `
            <div class="image-list__overlay">
              ${showTitle && img.title ? `<span class="image-list__title">${img.title}</span>` : ''}
            </div>
          ` : ''}
        </div>
      `;
    }).join('');

    // Masonry 레이아웃
    if (layout === 'masonry') {
      this._applyMasonry();
    }
  }

  _getResponsiveColumns() {
    const { columns, responsive } = this.options;
    const width = window.innerWidth;

    const breakpoints = Object.keys(responsive)
      .map(Number)
      .sort((a, b) => b - a);

    for (const bp of breakpoints) {
      if (width <= bp) {
        return responsive[bp];
      }
    }

    return columns;
  }

  _applyMasonry() {
    // CSS columns 기반 masonry
    const cols = this._getResponsiveColumns();
    this.container.style.cssText = `
      column-count: ${cols};
      column-gap: ${this.options.gap}px;
    `;

    this.container.querySelectorAll('.image-list__item').forEach(item => {
      item.style.cssText += `
        break-inside: avoid;
        margin-bottom: ${this.options.gap}px;
      `;
    });
  }

  _setupLazyLoad() {
    if ('IntersectionObserver' in window) {
      this._observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
              img.classList.remove('lazy');
              img.classList.add('loaded');
              this._observer.unobserve(img);

              if (this.options.onLoad) {
                this.options.onLoad(img);
              }
            }
          }
        });
      }, {
        rootMargin: '50px',
        threshold: 0.1
      });

      this.container.querySelectorAll('.lazy').forEach(img => {
        this._observer.observe(img);
      });
    } else {
      // Fallback: 모두 로드
      this.container.querySelectorAll('.lazy').forEach(img => {
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.classList.remove('lazy');
        }
      });
    }
  }

  _bindEvents() {
    // 기존 리스너 제거 (재호출 시 중복 방지)
    this._unbindEvents();

    this._onClick = (e) => {
      const item = e.target.closest('.image-list__item');
      if (!item) return;

      const index = parseInt(item.dataset.index);

      if (this.options.onClick) {
        this.options.onClick(this.options.images[index], index, e);
      }

      if (this.options.lightbox) {
        this._openLightbox(index);
      }
    };

    this._onResize = () => {
      if (this._resizeTimer) clearTimeout(this._resizeTimer);
      this._resizeTimer = setTimeout(() => {
        const cols = this._getResponsiveColumns();
        if (this.options.layout === 'masonry') {
          this._applyMasonry();
        } else {
          this.container.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        }
      }, 200);
    };

    this.container.addEventListener('click', this._onClick);
    window.addEventListener('resize', this._onResize);
  }

  _openLightbox(startIndex) {
    if (this._lightbox) {
      this._lightbox.destroy();
    }

    this._lightbox = new Lightbox({
      images: this.options.images,
      startIndex,
      onClose: () => {
        this._lightbox = null;
      }
    });

    this._lightbox.open();
  }

  _unbindEvents() {
    if (this._onClick && this.container) {
      this.container.removeEventListener('click', this._onClick);
      this._onClick = null;
    }
    if (this._onResize) {
      window.removeEventListener('resize', this._onResize);
      this._onResize = null;
    }
  }

  // 공개 API
  setImages(images) {
    this.options.images = images;
    if (this._observer) this._observer.disconnect();
    this._render();
    if (this.options.lazy) this._setupLazyLoad();
    this._bindEvents();
  }

  addImage(image) {
    this.options.images.push(image);
    this._render();
    if (this.options.lazy) this._setupLazyLoad();
  }

  removeImage(index) {
    this.options.images.splice(index, 1);
    this._render();
    if (this.options.lazy) this._setupLazyLoad();
  }

  refresh() {
    this._render();
    if (this.options.lazy) this._setupLazyLoad();
  }

  destroy() {
    this._unbindEvents();
    if (this._resizeTimer) clearTimeout(this._resizeTimer);
    if (this._observer) this._observer.disconnect();
    if (this._lightbox) this._lightbox.destroy();

    ImageList.instances.delete(this.container);

    if (this.container) {
      this.container.innerHTML = '';
      this.container.className = '';
      this.container.style.cssText = '';
    }

    this.container = null;
  }
}


// ============================================
// Lightbox - 이미지 확대 뷰어
// ============================================

class Lightbox {
  static instance = null;

  static defaults() {
    return {
      images: [],               // [{ src, thumb?, title?, alt? }]
      startIndex: 0,
      zoom: true,
      download: true,
      counter: true,
      thumbnails: false,
      keyboard: true,
      swipe: true,
      closeOnBackdrop: true,
      animation: 'fade',        // fade, zoom
      backdropColor: 'rgba(0,0,0,0.95)',
      onOpen: null,
      onClose: null,
      onChange: null
    };
  }

  constructor(options = {}) {
    // 싱글톤: 기존 인스턴스 제거
    if (Lightbox.instance) {
      Lightbox.instance.destroy();
    }

    this.options = { ...Lightbox.defaults(), ...options };
    this.currentIndex = this.options.startIndex;
    this.isOpen = false;
    this.isZoomed = false;
    this.element = null;

    // 이벤트 핸들러 참조
    this._onKeyDown = null;
    this._onTouchStart = null;
    this._onTouchEnd = null;
    this._onClick = null;
    this._onImgClick = null;
    this._touchStartX = 0;

    // DOM 캐시
    this._img = null;
    this._loading = null;
    this._counter = null;
    this._caption = null;
    this._prevBtn = null;
    this._nextBtn = null;

    Lightbox.instance = this;
  }

  _create() {
    const { images, counter, download, thumbnails, backdropColor } = this.options;

    this.element = document.createElement('div');
    this.element.className = 'lightbox';
    this.element.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 9999;
      background: ${backdropColor};
      display: flex;
      flex-direction: column;
      opacity: 0;
      transition: opacity 0.3s;
    `;

    this.element.innerHTML = `
      <div class="lightbox__header">
        ${counter ? `<span class="lightbox__counter">${this.currentIndex + 1} / ${images.length}</span>` : ''}
        <div class="lightbox__actions">
          ${download ? '<button class="lightbox__btn" data-action="download" title="다운로드"><i class="material-icons-outlined">download</i></button>' : ''}
          <button class="lightbox__btn" data-action="close" title="닫기"><i class="material-icons-outlined">close</i></button>
        </div>
      </div>
      
      <div class="lightbox__main">
        <button class="lightbox__nav lightbox__nav--prev" data-action="prev">
          <i class="material-icons-outlined">chevron_left</i>
        </button>
        
        <div class="lightbox__content">
          <img class="lightbox__img" src="" alt="">
          <div class="lightbox__loading"><div class="spinner"></div></div>
        </div>
        
        <button class="lightbox__nav lightbox__nav--next" data-action="next">
          <i class="material-icons-outlined">chevron_right</i>
        </button>
      </div>
      
      ${thumbnails ? `
        <div class="lightbox__thumbnails">
          ${images.map((img, i) => `
            <div class="lightbox__thumb ${i === this.currentIndex ? 'active' : ''}" data-index="${i}">
              <img src="${img.thumb || img.src}" alt="">
            </div>
          `).join('')}
        </div>
      ` : ''}
      
      <div class="lightbox__caption"></div>
    `;

    document.body.appendChild(this.element);

    // 요소 캐싱
    this._img = this.element.querySelector('.lightbox__img');
    this._loading = this.element.querySelector('.lightbox__loading');
    this._counter = this.element.querySelector('.lightbox__counter');
    this._caption = this.element.querySelector('.lightbox__caption');
    this._prevBtn = this.element.querySelector('.lightbox__nav--prev');
    this._nextBtn = this.element.querySelector('.lightbox__nav--next');

    this._bindEvents();
  }

  _bindEvents() {
    // 버튼 클릭
    this._onClick = (e) => {
      const action = e.target.closest('[data-action]')?.dataset.action;
      const thumbIndex = e.target.closest('.lightbox__thumb')?.dataset.index;

      if (action === 'close' || (this.options.closeOnBackdrop && e.target === this.element.querySelector('.lightbox__main'))) {
        this.close();
      } else if (action === 'prev') {
        this.prev();
      } else if (action === 'next') {
        this.next();
      } else if (action === 'download') {
        this._download();
      } else if (thumbIndex !== undefined) {
        this.goTo(parseInt(thumbIndex));
      }
    };
    this.element.addEventListener('click', this._onClick);

    // 이미지 줌
    if (this.options.zoom && this._img) {
      this._onImgClick = (e) => {
        e.stopPropagation();
        this._toggleZoom();
      };
      this._img.addEventListener('click', this._onImgClick);
    }

    // 키보드
    if (this.options.keyboard) {
      this._onKeyDown = (e) => {
        if (!this.isOpen) return;

        switch (e.key) {
          case 'Escape': this.close(); break;
          case 'ArrowLeft': this.prev(); break;
          case 'ArrowRight': this.next(); break;
        }
      };
      document.addEventListener('keydown', this._onKeyDown);
    }

    // 터치 스와이프
    if (this.options.swipe) {
      this._onTouchStart = (e) => {
        this._touchStartX = e.touches[0].clientX;
      };

      this._onTouchEnd = (e) => {
        const deltaX = e.changedTouches[0].clientX - this._touchStartX;
        if (Math.abs(deltaX) > 50) {
          deltaX > 0 ? this.prev() : this.next();
        }
      };

      this.element.addEventListener('touchstart', this._onTouchStart, { passive: true });
      this.element.addEventListener('touchend', this._onTouchEnd, { passive: true });
    }
  }

  _loadImage(index) {
    const img = this.options.images[index];
    if (!img) return;

    this._loading.style.display = 'flex';
    this._img.style.opacity = '0';

    const newImg = new Image();
    newImg.onload = () => {
      this._img.src = img.src;
      this._img.alt = img.alt || img.title || '';
      this._loading.style.display = 'none';
      this._img.style.opacity = '1';
    };
    newImg.onerror = () => {
      this._loading.style.display = 'none';
      this._img.src = '';
      this._img.alt = '이미지 로드 실패';
    };
    newImg.src = img.src;

    // UI 업데이트
    if (this._counter) {
      this._counter.textContent = `${index + 1} / ${this.options.images.length}`;
    }

    if (this._caption && img.title) {
      this._caption.textContent = img.title;
      this._caption.style.display = 'block';
    } else if (this._caption) {
      this._caption.style.display = 'none';
    }

    // 썸네일 활성화
    this.element.querySelectorAll('.lightbox__thumb').forEach((thumb, i) => {
      thumb.classList.toggle('active', i === index);
    });

    // 네비게이션 버튼
    if (this._prevBtn) this._prevBtn.style.visibility = index > 0 ? 'visible' : 'hidden';
    if (this._nextBtn) this._nextBtn.style.visibility = index < this.options.images.length - 1 ? 'visible' : 'hidden';

    // 줌 리셋
    this.isZoomed = false;
    this._img.classList.remove('zoomed');
  }

  _toggleZoom() {
    this.isZoomed = !this.isZoomed;
    this._img.classList.toggle('zoomed', this.isZoomed);
    this._img.style.cursor = this.isZoomed ? 'zoom-out' : 'zoom-in';
  }

  _download() {
    const img = this.options.images[this.currentIndex];
    if (!img) return;

    const link = document.createElement('a');
    link.href = img.src;
    link.download = img.title || `image-${this.currentIndex + 1}`;
    link.click();
  }

  // 공개 API
  open(index = this.options.startIndex) {
    if (!this.element) this._create();

    this.currentIndex = index;
    this._loadImage(index);

    document.body.style.overflow = 'hidden';
    this.isOpen = true;

    requestAnimationFrame(() => {
      this.element.style.opacity = '1';
    });

    if (this.options.onOpen) {
      this.options.onOpen(index);
    }
  }

  close() {
    if (!this.element) return;

    this.element.style.opacity = '0';

    setTimeout(() => {
      document.body.style.overflow = '';
      this.isOpen = false;

      if (this.options.onClose) {
        this.options.onClose();
      }

      // 닫힌 후 DOM 및 이벤트 정리
      this.destroy();
    }, 300);
  }

  prev() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this._loadImage(this.currentIndex);
      if (this.options.onChange) this.options.onChange(this.currentIndex);
    }
  }

  next() {
    if (this.currentIndex < this.options.images.length - 1) {
      this.currentIndex++;
      this._loadImage(this.currentIndex);
      if (this.options.onChange) this.options.onChange(this.currentIndex);
    }
  }

  goTo(index) {
    if (index >= 0 && index < this.options.images.length) {
      this.currentIndex = index;
      this._loadImage(index);
      if (this.options.onChange) this.options.onChange(index);
    }
  }

  destroy() {
    // 키보드 이벤트 제거
    if (this._onKeyDown) {
      document.removeEventListener('keydown', this._onKeyDown);
      this._onKeyDown = null;
    }

    // element 이벤트 제거
    if (this.element) {
      if (this._onClick) {
        this.element.removeEventListener('click', this._onClick);
        this._onClick = null;
      }
      if (this._onTouchStart) {
        this.element.removeEventListener('touchstart', this._onTouchStart);
        this._onTouchStart = null;
      }
      if (this._onTouchEnd) {
        this.element.removeEventListener('touchend', this._onTouchEnd);
        this._onTouchEnd = null;
      }
    }

    // 이미지 클릭 이벤트 제거
    if (this._img && this._onImgClick) {
      this._img.removeEventListener('click', this._onImgClick);
      this._onImgClick = null;
    }

    // DOM 제거
    if (this.element) {
      this.element.remove();
    }

    // body 스크롤 복원
    document.body.style.overflow = '';

    // 싱글톤 해제
    Lightbox.instance = null;

    // 참조 정리
    this.element = null;
    this._img = null;
    this._loading = null;
    this._counter = null;
    this._caption = null;
    this._prevBtn = null;
    this._nextBtn = null;
    this.isOpen = false;
    this.isZoomed = false;
  }
}


// ============================================
// ImageCompare - Before/After 비교
// ============================================

class ImageCompare {
  static instances = new Map();

  static defaults() {
    return {
      before: { src: '', label: 'Before' },
      after: { src: '', label: 'After' },
      orientation: 'horizontal',  // horizontal, vertical
      initialPosition: 50,        // 0-100
      showLabels: true,
      showHandle: true,
      handleSize: 40,
      handleColor: '#fff',
      lineWidth: 3,
      lineColor: '#fff',
      onSlide: null
    };
  }

  constructor(selector, options = {}) {
    this.container = typeof selector === 'string'
      ? document.querySelector(selector)
      : selector;

    if (!this.container) {
      console.error('ImageCompare: Container not found');
      return;
    }

    this.options = { ...ImageCompare.defaults(), ...options };
    this.position = this.options.initialPosition;
    this.isDragging = false;

    this._onMouseDown = null;
    this._onMouseMove = null;
    this._onMouseUp = null;
    this._onTouchStart = null;
    this._onTouchMove = null;
    this._onTouchEnd = null;

    this.init();
    ImageCompare.instances.set(this.container, this);
  }

  init() {
    this._render();
    this._bindEvents();
  }

  _render() {
    const { before, after, orientation, showLabels, showHandle, handleSize, handleColor, lineWidth, lineColor } = this.options;
    const isHorizontal = orientation === 'horizontal';

    this.container.classList.add('image-compare', `image-compare--${orientation}`);
    this.container.style.cssText = `
      position: relative;
      overflow: hidden;
      user-select: none;
      touch-action: none;
    `;

    this.container.innerHTML = `
      <div class="image-compare__after" style="
        position: relative;
        width: 100%;
        height: 100%;
      ">
        <img src="${after.src}" alt="${after.label}" style="width: 100%; height: 100%; object-fit: cover;">
        ${showLabels ? `<span class="image-compare__label image-compare__label--after">${after.label}</span>` : ''}
      </div>
      
      <div class="image-compare__before" style="
        position: absolute;
        inset: 0;
        z-index: 1;
        ${isHorizontal ? `clip-path: inset(0 ${100 - this.position}% 0 0);` : `clip-path: inset(0 0 ${100 - this.position}% 0);`}
      ">
        <img src="${before.src}" alt="${before.label}" style="width: 100%; height: 100%; object-fit: cover;">
        ${showLabels ? `<span class="image-compare__label image-compare__label--before">${before.label}</span>` : ''}
      </div>
      
      <div class="image-compare__handle" style="
        position: absolute;
        ${isHorizontal ? `
          left: ${this.position}%;
          top: 0;
          bottom: 0;
          width: ${lineWidth}px;
          transform: translateX(-50%);
        ` : `
          top: ${this.position}%;
          left: 0;
          right: 0;
          height: ${lineWidth}px;
          transform: translateY(-50%);
        `}
        background: ${lineColor};
        cursor: ${isHorizontal ? 'ew-resize' : 'ns-resize'};
        z-index: 10;
      ">
        ${showHandle ? `
          <div class="image-compare__handle-icon" style="
            position: absolute;
            ${isHorizontal ? `
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
            ` : `
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
            `}
            width: ${handleSize}px;
            height: ${handleSize}px;
            background: ${handleColor};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          ">
            <i class="material-icons-outlined" style="font-size: 20px; color: #333;">${isHorizontal ? 'compare_arrows' : 'unfold_more'}</i>
          </div>
        ` : ''}
      </div>
    `;

    this._before = this.container.querySelector('.image-compare__before');
    this._handle = this.container.querySelector('.image-compare__handle');
  }

  _bindEvents() {
    // 기존 리스너 제거 (재호출 시 중복 방지)
    this._unbindEvents();

    const isHorizontal = this.options.orientation === 'horizontal';

    const updatePosition = (clientX, clientY) => {
      const rect = this.container.getBoundingClientRect();
      let pos;

      if (isHorizontal) {
        pos = ((clientX - rect.left) / rect.width) * 100;
      } else {
        pos = ((clientY - rect.top) / rect.height) * 100;
      }

      pos = Math.max(0, Math.min(100, pos));
      this.setPosition(pos);
    };

    // 마우스 이벤트
    this._onMouseDown = (e) => {
      this.isDragging = true;
      updatePosition(e.clientX, e.clientY);
    };

    this._onMouseMove = (e) => {
      if (!this.isDragging) return;
      updatePosition(e.clientX, e.clientY);
    };

    this._onMouseUp = () => {
      this.isDragging = false;
    };

    // 터치 이벤트
    this._onTouchStart = (e) => {
      this.isDragging = true;
      const touch = e.touches[0];
      updatePosition(touch.clientX, touch.clientY);
    };

    this._onTouchMove = (e) => {
      if (!this.isDragging) return;
      const touch = e.touches[0];
      updatePosition(touch.clientX, touch.clientY);
    };

    this._onTouchEnd = () => {
      this.isDragging = false;
    };

    this.container.addEventListener('mousedown', this._onMouseDown);
    document.addEventListener('mousemove', this._onMouseMove);
    document.addEventListener('mouseup', this._onMouseUp);

    this.container.addEventListener('touchstart', this._onTouchStart, { passive: true });
    document.addEventListener('touchmove', this._onTouchMove, { passive: true });
    document.addEventListener('touchend', this._onTouchEnd);
  }

  // 공개 API
  setPosition(pos) {
    this.position = pos;
    const isHorizontal = this.options.orientation === 'horizontal';

    if (isHorizontal) {
      this._before.style.clipPath = `inset(0 ${100 - pos}% 0 0)`;
      this._handle.style.left = `${pos}%`;
    } else {
      this._before.style.clipPath = `inset(0 0 ${100 - pos}% 0)`;
      this._handle.style.top = `${pos}%`;
    }

    if (this.options.onSlide) {
      this.options.onSlide(pos);
    }
  }

  getPosition() {
    return this.position;
  }

  setImages(before, after) {
    this.options.before = before;
    this.options.after = after;
    this._render();
    this._bindEvents();
  }

  _unbindEvents() {
    if (this._onMouseDown && this.container) {
      this.container.removeEventListener('mousedown', this._onMouseDown);
      this._onMouseDown = null;
    }
    if (this._onMouseMove) {
      document.removeEventListener('mousemove', this._onMouseMove);
      this._onMouseMove = null;
    }
    if (this._onMouseUp) {
      document.removeEventListener('mouseup', this._onMouseUp);
      this._onMouseUp = null;
    }
    if (this._onTouchStart && this.container) {
      this.container.removeEventListener('touchstart', this._onTouchStart);
      this._onTouchStart = null;
    }
    if (this._onTouchMove) {
      document.removeEventListener('touchmove', this._onTouchMove);
      this._onTouchMove = null;
    }
    if (this._onTouchEnd) {
      document.removeEventListener('touchend', this._onTouchEnd);
      this._onTouchEnd = null;
    }
  }

  destroy() {
    this._unbindEvents();

    ImageCompare.instances.delete(this.container);

    if (this.container) {
      this.container.innerHTML = '';
      this.container.className = '';
    }

    this.container = null;
  }
}


// ============================================
// LazyImage - 지연 로딩
// ============================================

class LazyImage {
  static instance = null;

  static defaults() {
    return {
      selector: '[data-lazy-src]',
      root: null,
      rootMargin: '50px',
      threshold: 0.1,
      placeholder: 'blur',      // blur, skeleton, color, none
      placeholderColor: '#e5e7eb',
      animation: 'fade',        // fade, none
      animationDuration: 300,
      onLoad: null,
      onError: null
    };
  }

  constructor(options = {}) {
    this.options = { ...LazyImage.defaults(), ...options };
    this._observer = null;
    this._images = [];

    this.init();
    LazyImage.instance = this;
  }

  init() {
    this._images = document.querySelectorAll(this.options.selector);

    if ('IntersectionObserver' in window) {
      this._setupObserver();
    } else {
      this._loadAll();
    }
  }

  _setupObserver() {
    const { root, rootMargin, threshold } = this.options;

    this._observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this._loadImage(entry.target);
          this._observer.unobserve(entry.target);
        }
      });
    }, { root, rootMargin, threshold });

    this._images.forEach(img => {
      this._setupPlaceholder(img);
      this._observer.observe(img);
    });
  }

  _setupPlaceholder(img) {
    const { placeholder, placeholderColor, animation, animationDuration } = this.options;

    img.style.transition = animation === 'fade' ? `opacity ${animationDuration}ms` : 'none';

    switch (placeholder) {
      case 'blur': {
        const thumbSrc = img.dataset.lazyThumb || img.dataset.lazyPlaceholder;
        if (thumbSrc) {
          img.src = thumbSrc;
          img.style.filter = 'blur(10px)';
        } else {
          img.style.backgroundColor = placeholderColor;
        }
        break;
      }

      case 'skeleton':
        img.style.backgroundColor = placeholderColor;
        img.style.animation = 'skeleton-pulse 1.5s ease-in-out infinite';
        break;

      case 'color':
        img.style.backgroundColor = placeholderColor;
        break;
    }

    if (animation === 'fade') {
      img.style.opacity = '0.5';
    }
  }

  _loadImage(img) {
    const src = img.dataset.lazySrc || img.dataset.src;
    if (!src) return;

    const newImg = new Image();

    newImg.onload = () => {
      img.src = src;
      img.style.filter = '';
      img.style.backgroundColor = '';
      img.style.animation = '';
      img.style.opacity = '1';
      img.classList.add('lazy-loaded');
      img.removeAttribute('data-lazy-src');
      img.removeAttribute('data-src');

      if (this.options.onLoad) {
        this.options.onLoad(img);
      }
    };

    newImg.onerror = () => {
      img.classList.add('lazy-error');

      if (this.options.onError) {
        this.options.onError(img);
      }
    };

    newImg.src = src;
  }

  _loadAll() {
    this._images.forEach(img => this._loadImage(img));
  }

  // 공개 API
  observe(element) {
    if (this._observer) {
      this._setupPlaceholder(element);
      this._observer.observe(element);
    }
  }

  refresh() {
    const newImages = document.querySelectorAll(this.options.selector + ':not(.lazy-loaded)');
    newImages.forEach(img => {
      if (this._observer) {
        this._setupPlaceholder(img);
        this._observer.observe(img);
      }
    });
  }

  destroy() {
    if (this._observer) {
      this._observer.disconnect();
    }

    LazyImage.instance = null;
    this._observer = null;
    this._images = null;
  }
}


// ============================================
// Export
// ============================================

export { ImageList, Lightbox, ImageCompare, LazyImage };
export default { ImageList, Lightbox, ImageCompare, LazyImage };
