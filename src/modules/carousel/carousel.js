/**
 * Carousel Module
 * 이미지/콘텐츠 슬라이더
 * @module modules/carousel
 */

// ============================================
// 내장 이징 함수 (코어 AnimationUtil과 호환)
// ============================================

const EASINGS = {
  // CSS 이징
  'linear': 'linear',
  'ease': 'ease',
  'ease-in': 'ease-in',
  'ease-out': 'ease-out',
  'ease-in-out': 'ease-in-out',
  
  // Cubic Bezier 프리셋
  'easeInCubic': 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
  'easeOutCubic': 'cubic-bezier(0.215, 0.61, 0.355, 1)',
  'easeInOutCubic': 'cubic-bezier(0.645, 0.045, 0.355, 1)',
  
  'easeInQuart': 'cubic-bezier(0.895, 0.03, 0.685, 0.22)',
  'easeOutQuart': 'cubic-bezier(0.165, 0.84, 0.44, 1)',
  'easeInOutQuart': 'cubic-bezier(0.77, 0, 0.175, 1)',
  
  'easeInQuint': 'cubic-bezier(0.755, 0.05, 0.855, 0.06)',
  'easeOutQuint': 'cubic-bezier(0.23, 1, 0.32, 1)',
  'easeInOutQuint': 'cubic-bezier(0.86, 0, 0.07, 1)',
  
  'easeInExpo': 'cubic-bezier(0.95, 0.05, 0.795, 0.035)',
  'easeOutExpo': 'cubic-bezier(0.19, 1, 0.22, 1)',
  'easeInOutExpo': 'cubic-bezier(1, 0, 0, 1)',
  
  'easeInBack': 'cubic-bezier(0.6, -0.28, 0.735, 0.045)',
  'easeOutBack': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  'easeInOutBack': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  
  'easeOutElastic': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
};

// ============================================
// Carousel - 캐러셀 슬라이더
// ============================================

class Carousel {
  static instances = new Map();
  static easings = EASINGS;
  
  static defaults() {
    return {
      // 기본 옵션
      items: [],                    // 슬라이드 아이템 배열 [{src, alt, title, description}]
      startIndex: 0,                // 시작 인덱스
      
      // 네비게이션
      arrows: true,                 // 좌우 화살표
      dots: true,                   // 하단 도트 인디케이터
      counter: false,               // 현재/전체 카운터
      thumbnails: false,            // 썸네일 네비게이션
      
      // 자동 재생
      autoplay: false,              // 자동 재생
      autoplaySpeed: 3000,          // 자동 재생 간격 (ms)
      pauseOnHover: true,           // 호버 시 일시 정지
      
      // 동작
      loop: true,                   // 무한 루프
      slidesToShow: 1,              // 한 번에 보여줄 슬라이드 수
      slidesToScroll: 1,            // 한 번에 스크롤할 슬라이드 수
      speed: 300,                   // 전환 속도 (ms)
      easing: 'easeOutCubic',       // 전환 이징 (EASINGS 키 또는 CSS 값)
      effect: 'slide',              // 전환 효과: slide, fade, scale, flip, cube
      
      // 터치/드래그
      draggable: true,              // 드래그 가능
      swipeThreshold: 50,           // 스와이프 인식 임계값 (px)
      
      // 반응형
      responsive: null,             // [{breakpoint: 768, settings: {...}}]
      
      // 콜백
      onSlideChange: null,          // (currentIndex, prevIndex) => {}
      onInit: null,                 // (carousel) => {}
      
      // 접근성
      ariaLabel: '캐러셀'
    };
  }
  
  constructor(element, options = {}) {
    if (typeof element === 'string') {
      element = document.querySelector(element);
    }
    
    if (!element) {
      console.error('Carousel: Element not found');
      return;
    }
    
    if (Carousel.instances.has(element)) {
      return Carousel.instances.get(element);
    }
    
    this.element = element;
    this.options = { ...Carousel.defaults(), ...options };
    this.currentIndex = this.options.startIndex;
    this._trackIndex = this.options.startIndex; // 내부 트랙 위치 (클론 포함)
    this.isAnimating = false;
    this.autoplayTimer = null;
    this.touchStartX = 0;
    this.touchEndX = 0;
    this._timers = []; // 타이머 추적용
    this._clones = []; // 클론 요소 추적용
    
    this._readDataAttributes();
    this.init();
    Carousel.instances.set(element, this);
  }
  
  _readDataAttributes() {
    const autoplay = this.element.getAttribute('data-autoplay');
    if (autoplay !== null) this.options.autoplay = autoplay === 'true';
    
    const speed = this.element.getAttribute('data-speed');
    if (speed) this.options.autoplaySpeed = parseInt(speed, 10);
    
    const loop = this.element.getAttribute('data-loop');
    if (loop !== null) this.options.loop = loop === 'true';
    
    const arrows = this.element.getAttribute('data-arrows');
    if (arrows !== null) this.options.arrows = arrows === 'true';
    
    const dots = this.element.getAttribute('data-dots');
    if (dots !== null) this.options.dots = dots === 'true';
  }
  
  init() {
    this._buildStructure();
    this._bindEvents();
    this._applyResponsive();
    this._goToSlide(this.currentIndex, false);
    
    if (this.options.autoplay) {
      this._startAutoplay();
    }
    
    if (this.options.onInit) {
      this.options.onInit(this);
    }
  }
  
  _getEasing(easing) {
    // EASINGS에서 찾거나 그대로 반환 (CSS 값으로 간주)
    return EASINGS[easing] || easing;
  }
  
  _applyEffect() {
    const effect = this.options.effect;
    
    // effect에 따른 클래스 추가
    this.element.classList.remove('carousel--slide', 'carousel--fade', 'carousel--scale', 'carousel--flip', 'carousel--cube');
    this.element.classList.add(`carousel--${effect}`);
    
    // fade, scale, flip, cube 효과는 특별한 슬라이드 스타일 필요
    if (effect !== 'slide') {
      // 먼저 높이 계산 (이미지 로드 대기)
      this._setTrackHeight();
      
      this.slides.forEach((slide, i) => {
        slide.style.position = 'absolute';
        slide.style.top = '0';
        slide.style.left = '0';
        slide.style.width = '100%';
        slide.style.opacity = i === this.currentIndex ? '1' : '0';
        slide.style.transition = `opacity ${this.options.speed}ms ${this._getEasing(this.options.easing)}, transform ${this.options.speed}ms ${this._getEasing(this.options.easing)}`;
        
        if (effect === 'scale') {
          slide.style.transform = i === this.currentIndex ? 'scale(1)' : 'scale(0.8)';
        } else if (effect === 'flip') {
          slide.style.transform = i === this.currentIndex ? 'rotateY(0deg)' : 'rotateY(90deg)';
          slide.style.backfaceVisibility = 'hidden';
        } else if (effect === 'cube') {
          slide.style.transform = i === this.currentIndex ? 'rotateY(0deg)' : 'rotateY(90deg)';
          slide.style.transformOrigin = 'center center';
        }
      });
      
      // track perspective 설정
      if (this.track) {
        this.track.style.position = 'relative';
        this.track.style.perspective = effect === 'flip' || effect === 'cube' ? '1000px' : '';
      }
    }
  }
  
  _setTrackHeight() {
    if (!this.track || !this.slides.length) return;
    
    // 첫 번째 슬라이드의 이미지 찾기
    const firstSlide = this.slides[0];
    const img = firstSlide.querySelector('img');
    
    const setHeight = () => {
      if (!this.track) return; // destroy 후 호출 방지
      // 슬라이드 높이 계산 (최소 200px 보장)
      let height = firstSlide.offsetHeight;
      if (height < 50) {
        // 이미지 비율로 계산 (16:9 기본)
        const width = this.element?.offsetWidth || 0;
        height = Math.round(width * 0.5625); // 16:9 ratio
      }
      if (this.track) this.track.style.height = height + 'px';
    };
    
    if (img && !img.complete) {
      // 이미지 로드 대기
      img.addEventListener('load', setHeight, { once: true });
      // 타임아웃으로 fallback (추적)
      const timerId = setTimeout(setHeight, 100);
      this._timers.push(timerId);
    } else {
      setHeight();
    }
  }
  
  _buildStructure() {
    this.element.classList.add('carousel');
    this.element.setAttribute('role', 'region');
    this.element.setAttribute('aria-label', this.options.ariaLabel);
    
    // 기존 콘텐츠에서 슬라이드 가져오기 또는 options.items 사용
    let slides = this.element.querySelectorAll('.carousel__slide');
    
    if (slides.length === 0 && this.options.items.length > 0) {
      // items 옵션으로 슬라이드 생성
      this.element.innerHTML = '';
      const track = document.createElement('div');
      track.className = 'carousel__track';
      
      this.options.items.forEach((item, index) => {
        const slide = document.createElement('div');
        slide.className = 'carousel__slide';
        slide.setAttribute('role', 'tabpanel');
        slide.setAttribute('aria-label', `슬라이드 ${index + 1}`);
        
        if (typeof item === 'string') {
          // 이미지 URL만 제공된 경우
          slide.innerHTML = `<img src="${item}" alt="슬라이드 ${index + 1}" class="carousel__image">`;
        } else {
          // 객체로 제공된 경우
          let html = '';
          if (item.src) {
            html += `<img src="${item.src}" alt="${item.alt || ''}" class="carousel__image">`;
          }
          if (item.content) {
            html += `<div class="carousel__content">${item.content}</div>`;
          }
          if (item.title || item.description) {
            html += `<div class="carousel__caption">`;
            if (item.title) html += `<h3 class="carousel__title">${item.title}</h3>`;
            if (item.description) html += `<p class="carousel__description">${item.description}</p>`;
            html += `</div>`;
          }
          slide.innerHTML = html;
        }
        
        track.appendChild(slide);
      });
      
      this.element.appendChild(track);
      slides = track.querySelectorAll('.carousel__slide');
    } else {
      // 기존 슬라이드 래핑
      const existingContent = this.element.innerHTML;
      this.element.innerHTML = '';
      
      const track = document.createElement('div');
      track.className = 'carousel__track';
      track.innerHTML = existingContent;
      this.element.appendChild(track);
      
      slides = track.querySelectorAll('.carousel__slide');
    }
    
    this.track = this.element.querySelector('.carousel__track');
    this.slides = Array.from(slides);
    this.totalSlides = this.slides.length;
    this.cloneCount = this.options.slidesToShow; // 복제할 슬라이드 수
    
    // 무한 루프용 클론 생성
    if (this.options.loop && this.totalSlides > 1) {
      this._createClones();
    }
    
    // 슬라이드 너비 설정 (클론 포함)
    const slideWidth = 100 / this.options.slidesToShow;
    const allSlides = this.track.querySelectorAll('.carousel__slide');
    allSlides.forEach(slide => {
      slide.style.width = `${slideWidth}%`;
    });
    
    // 화살표 추가
    if (this.options.arrows && this.totalSlides > 1) {
      this._createArrows();
    }
    
    // 도트 인디케이터 추가
    if (this.options.dots && this.totalSlides > 1) {
      this._createDots();
    }
    
    // 카운터 추가
    if (this.options.counter && this.totalSlides > 1) {
      this._createCounter();
    }
    
    // 썸네일 추가
    if (this.options.thumbnails && this.totalSlides > 1) {
      this._createThumbnails();
    }
    
    // 효과 적용
    if (this.options.effect !== 'slide') {
      this._applyEffect();
    }
  }
  
  _createClones() {
    this._clones = []; // 클론 초기화
    
    // 앞에 마지막 슬라이드들 복제 (뒤로 갈 때 자연스럽게)
    for (let i = this.totalSlides - 1; i >= Math.max(0, this.totalSlides - this.cloneCount); i--) {
      const clone = this.slides[i].cloneNode(true);
      clone.classList.add('carousel__slide--clone');
      clone.setAttribute('aria-hidden', 'true');
      this.track.insertBefore(clone, this.track.firstChild);
      this._clones.push(clone);
    }
    
    // 뒤에 처음 슬라이드들 복제 (앞으로 갈 때 자연스럽게)
    for (let i = 0; i < Math.min(this.cloneCount, this.totalSlides); i++) {
      const clone = this.slides[i].cloneNode(true);
      clone.classList.add('carousel__slide--clone');
      clone.setAttribute('aria-hidden', 'true');
      this.track.appendChild(clone);
      this._clones.push(clone);
    }
  }
  
  _createArrows() {
    const prevBtn = document.createElement('button');
    prevBtn.className = 'carousel__arrow carousel__arrow--prev';
    prevBtn.innerHTML = '<i class="material-icons-outlined">chevron_left</i>';
    prevBtn.setAttribute('aria-label', '이전 슬라이드');
    prevBtn.type = 'button';
    
    const nextBtn = document.createElement('button');
    nextBtn.className = 'carousel__arrow carousel__arrow--next';
    nextBtn.innerHTML = '<i class="material-icons-outlined">chevron_right</i>';
    nextBtn.setAttribute('aria-label', '다음 슬라이드');
    nextBtn.type = 'button';
    
    this.element.appendChild(prevBtn);
    this.element.appendChild(nextBtn);
    
    this.prevBtn = prevBtn;
    this.nextBtn = nextBtn;
  }
  
  _createDots() {
    const dotsContainer = document.createElement('div');
    dotsContainer.className = 'carousel__dots';
    dotsContainer.setAttribute('role', 'tablist');
    
    const dotCount = Math.ceil((this.totalSlides - this.options.slidesToShow + 1) / this.options.slidesToScroll);
    
    for (let i = 0; i < Math.max(dotCount, this.totalSlides); i++) {
      const dot = document.createElement('button');
      dot.className = 'carousel__dot';
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `슬라이드 ${i + 1}로 이동`);
      dot.setAttribute('data-index', i);
      dot.type = 'button';
      
      if (i === this.currentIndex) {
        dot.classList.add('is-active');
        dot.setAttribute('aria-selected', 'true');
      }
      
      dotsContainer.appendChild(dot);
    }
    
    this.element.appendChild(dotsContainer);
    this.dotsContainer = dotsContainer;
  }
  
  _createCounter() {
    const counter = document.createElement('div');
    counter.className = 'carousel__counter';
    counter.innerHTML = `<span class="carousel__current">${this.currentIndex + 1}</span> / <span class="carousel__total">${this.totalSlides}</span>`;
    
    this.element.appendChild(counter);
    this.counter = counter;
  }
  
  _createThumbnails() {
    const thumbsContainer = document.createElement('div');
    thumbsContainer.className = 'carousel__thumbnails';
    
    this.slides.forEach((slide, index) => {
      const thumb = document.createElement('button');
      thumb.className = 'carousel__thumbnail';
      thumb.setAttribute('data-index', index);
      thumb.type = 'button';
      
      const img = slide.querySelector('img');
      if (img) {
        thumb.innerHTML = `<img src="${img.src}" alt="썸네일 ${index + 1}">`;
      } else {
        thumb.innerHTML = `<span>${index + 1}</span>`;
      }
      
      if (index === this.currentIndex) {
        thumb.classList.add('is-active');
      }
      
      thumbsContainer.appendChild(thumb);
    });
    
    this.element.appendChild(thumbsContainer);
    this.thumbsContainer = thumbsContainer;
  }
  
  _bindEvents() {
    // 화살표 클릭
    if (this.prevBtn) {
      this._onPrevClick = () => this.prev();
      this.prevBtn.addEventListener('click', this._onPrevClick);
    }
    
    if (this.nextBtn) {
      this._onNextClick = () => this.next();
      this.nextBtn.addEventListener('click', this._onNextClick);
    }
    
    // 도트 클릭
    if (this.dotsContainer) {
      this._onDotClick = (e) => {
        const dot = e.target.closest('.carousel__dot');
        if (dot) {
          const index = parseInt(dot.getAttribute('data-index'), 10);
          this.goTo(index);
        }
      };
      this.dotsContainer.addEventListener('click', this._onDotClick);
    }
    
    // 썸네일 클릭
    if (this.thumbsContainer) {
      this._onThumbClick = (e) => {
        const thumb = e.target.closest('.carousel__thumbnail');
        if (thumb) {
          const index = parseInt(thumb.getAttribute('data-index'), 10);
          this.goTo(index);
        }
      };
      this.thumbsContainer.addEventListener('click', this._onThumbClick);
    }
    
    // 터치/드래그
    if (this.options.draggable) {
      this._onTouchStart = (e) => {
        this.touchStartX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
        this._stopAutoplay();
      };
      
      this._onTouchEnd = (e) => {
        this.touchEndX = e.type === 'touchend' ? e.changedTouches[0].clientX : e.clientX;
        this._handleSwipe();
        if (this.options.autoplay) this._startAutoplay();
      };
      
      this.track.addEventListener('touchstart', this._onTouchStart, { passive: true });
      this.track.addEventListener('touchend', this._onTouchEnd);
      this.track.addEventListener('mousedown', this._onTouchStart);
      this.track.addEventListener('mouseup', this._onTouchEnd);
    }
    
    // 호버 시 자동 재생 일시 정지
    if (this.options.pauseOnHover && this.options.autoplay) {
      this._onMouseEnter = () => this._stopAutoplay();
      this._onMouseLeave = () => this._startAutoplay();
      
      this.element.addEventListener('mouseenter', this._onMouseEnter);
      this.element.addEventListener('mouseleave', this._onMouseLeave);
    }
    
    // 키보드 네비게이션
    this._onKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        this.prev();
      } else if (e.key === 'ArrowRight') {
        this.next();
      }
    };
    this.element.setAttribute('tabindex', '0');
    this.element.addEventListener('keydown', this._onKeyDown);
    
    // 반응형
    if (this.options.responsive) {
      this._onResize = () => this._applyResponsive();
      window.addEventListener('resize', this._onResize);
    }
  }
  
  _handleSwipe() {
    const diff = this.touchStartX - this.touchEndX;
    
    if (Math.abs(diff) > this.options.swipeThreshold) {
      if (diff > 0) {
        this.next();
      } else {
        this.prev();
      }
    }
  }
  
  _applyResponsive() {
    if (!this.options.responsive) return;
    
    const windowWidth = window.innerWidth;
    let settings = {};
    
    // 현재 화면 크기에 맞는 설정 찾기
    this.options.responsive
      .sort((a, b) => b.breakpoint - a.breakpoint)
      .forEach(bp => {
        if (windowWidth <= bp.breakpoint) {
          settings = { ...settings, ...bp.settings };
        }
      });
    
    // 설정 적용
    if (Object.keys(settings).length > 0) {
      Object.assign(this.options, settings);
      
      // 슬라이드 너비 재계산
      const slideWidth = 100 / this.options.slidesToShow;
      this.slides.forEach(slide => {
        slide.style.width = `${slideWidth}%`;
      });
      
      this._goToSlide(this.currentIndex, false);
    }
  }
  
  _goToSlide(index, animate = true) {
    if (this.isAnimating) return;
    
    const prevIndex = this.currentIndex;
    const hasClones = this.options.loop && this.totalSlides > 1 && this.options.effect === 'slide';
    const effect = this.options.effect;
    const easing = this._getEasing(this.options.easing);
    
    // 실제 인덱스 (UI 표시용)
    let realIndex = index;
    
    // 인덱스 범위 처리
    if (effect !== 'slide' || !hasClones) {
      // fade, scale, flip, cube 효과는 루프를 다르게 처리
      if (this.options.loop) {
        realIndex = ((index % this.totalSlides) + this.totalSlides) % this.totalSlides;
      } else {
        const maxIndex = this.totalSlides - this.options.slidesToShow;
        if (index < 0) index = 0;
        if (index > maxIndex) index = maxIndex;
        realIndex = index;
      }
    } else {
      // 클론 기반 무한 루프: 인덱스는 그대로 진행
      realIndex = ((index % this.totalSlides) + this.totalSlides) % this.totalSlides;
    }
    
    this.currentIndex = realIndex;
    
    // 효과별 처리
    if (effect === 'slide') {
      // 기존 slide 효과
      if (animate) {
        this.isAnimating = true;
        this.track.style.transition = `transform ${this.options.speed}ms ${easing}`;
      } else {
        this.track.style.transition = '';
      }
      
      // 트랙 이동 (클론 오프셋 포함)
      const cloneOffset = hasClones ? this.cloneCount : 0;
      const trackIndex = hasClones ? index + cloneOffset : realIndex;
      const offset = -(trackIndex * (100 / this.options.slidesToShow));
      this.track.style.transform = `translateX(${offset}%)`;
      
      // 클론 경계 처리 (애니메이션 후 점프)
      if (animate && hasClones) {
        const timerId = setTimeout(() => {
          if (!this.track) return; // destroy 후 안전 체크
          this.isAnimating = false;
          this.track.style.transition = '';
          
          // 클론 영역에서 실제 슬라이드로 점프
          if (index < 0) {
            const jumpTo = this.totalSlides + index;
            const jumpOffset = -((jumpTo + cloneOffset) * (100 / this.options.slidesToShow));
            this.track.style.transform = `translateX(${jumpOffset}%)`;
            this._trackIndex = jumpTo;
          } else if (index >= this.totalSlides) {
            const jumpTo = index - this.totalSlides;
            const jumpOffset = -((jumpTo + cloneOffset) * (100 / this.options.slidesToShow));
            this.track.style.transform = `translateX(${jumpOffset}%)`;
            this._trackIndex = jumpTo;
          }
        }, this.options.speed);
        this._timers.push(timerId);
      } else if (!animate) {
        this.isAnimating = false;
      } else {
        const timerId = setTimeout(() => {
          if (!this.track) return; // destroy 후 안전 체크
          this.isAnimating = false;
          this.track.style.transition = '';
        }, this.options.speed);
        this._timers.push(timerId);
      }
    } else {
      // fade, scale, flip, cube 효과
      this.isAnimating = true;
      
      this.slides.forEach((slide, i) => {
        const isActive = i === realIndex;
        
        if (effect === 'fade') {
          slide.style.opacity = isActive ? '1' : '0';
          slide.style.zIndex = isActive ? '1' : '0';
        } else if (effect === 'scale') {
          slide.style.opacity = isActive ? '1' : '0';
          slide.style.transform = isActive ? 'scale(1)' : 'scale(0.8)';
          slide.style.zIndex = isActive ? '1' : '0';
        } else if (effect === 'flip') {
          const direction = index > prevIndex ? 1 : -1;
          slide.style.opacity = isActive ? '1' : '0';
          slide.style.transform = isActive ? 'rotateY(0deg)' : `rotateY(${direction * 90}deg)`;
          slide.style.zIndex = isActive ? '1' : '0';
        } else if (effect === 'cube') {
          const direction = index > prevIndex ? 1 : -1;
          slide.style.opacity = isActive ? '1' : '0';
          slide.style.transform = isActive ? 'rotateY(0deg) translateZ(0)' : `rotateY(${direction * 90}deg) translateZ(-100px)`;
          slide.style.zIndex = isActive ? '1' : '0';
        }
      });
      
      const timerId = setTimeout(() => {
        this.isAnimating = false;
      }, this.options.speed);
      this._timers.push(timerId);
    }
    
    // UI 업데이트
    this._updateDots();
    this._updateThumbnails();
    this._updateCounter();
    this._updateArrows();
    
    // 콜백 호출
    if (animate && this.options.onSlideChange && prevIndex !== realIndex) {
      this.options.onSlideChange(realIndex, prevIndex);
    }
  }
  
  _updateDots() {
    if (!this.dotsContainer) return;
    
    const dots = this.dotsContainer.querySelectorAll('.carousel__dot');
    dots.forEach((dot, i) => {
      if (i === this.currentIndex) {
        dot.classList.add('is-active');
        dot.setAttribute('aria-selected', 'true');
      } else {
        dot.classList.remove('is-active');
        dot.setAttribute('aria-selected', 'false');
      }
    });
  }
  
  _updateThumbnails() {
    if (!this.thumbsContainer) return;
    
    const thumbs = this.thumbsContainer.querySelectorAll('.carousel__thumbnail');
    thumbs.forEach((thumb, i) => {
      thumb.classList.toggle('is-active', i === this.currentIndex);
    });
  }
  
  _updateCounter() {
    if (!this.counter) return;
    
    const currentEl = this.counter.querySelector('.carousel__current');
    if (currentEl) {
      currentEl.textContent = this.currentIndex + 1;
    }
  }
  
  _updateArrows() {
    if (!this.options.loop) {
      if (this.prevBtn) {
        this.prevBtn.disabled = this.currentIndex === 0;
      }
      if (this.nextBtn) {
        this.nextBtn.disabled = this.currentIndex >= this.totalSlides - this.options.slidesToShow;
      }
    }
  }
  
  _startAutoplay() {
    this._stopAutoplay();
    this.autoplayTimer = setInterval(() => {
      this.next();
    }, this.options.autoplaySpeed);
  }
  
  _stopAutoplay() {
    if (this.autoplayTimer) {
      clearInterval(this.autoplayTimer);
      this.autoplayTimer = null;
    }
  }
  
  // ===== Public Methods =====
  
  next() {
    const hasClones = this.options.loop && this.totalSlides > 1;
    if (hasClones) {
      this._trackIndex += this.options.slidesToScroll;
      this._goToSlide(this._trackIndex);
    } else {
      this._goToSlide(this.currentIndex + this.options.slidesToScroll);
    }
  }
  
  prev() {
    const hasClones = this.options.loop && this.totalSlides > 1;
    if (hasClones) {
      this._trackIndex -= this.options.slidesToScroll;
      this._goToSlide(this._trackIndex);
    } else {
      this._goToSlide(this.currentIndex - this.options.slidesToScroll);
    }
  }
  
  goTo(index) {
    this._trackIndex = index;
    this._goToSlide(index);
  }
  
  play() {
    this.options.autoplay = true;
    this._startAutoplay();
  }
  
  pause() {
    this._stopAutoplay();
  }
  
  getCurrentIndex() {
    return this.currentIndex;
  }
  
  getSlideCount() {
    return this.totalSlides;
  }
  
  destroy() {
    this._stopAutoplay();
    
    // 모든 타이머 정리
    if (this._timers) {
      this._timers.forEach(id => clearTimeout(id));
      this._timers = [];
    }
    
    // 이벤트 리스너 제거
    if (this.prevBtn) {
      this.prevBtn.removeEventListener('click', this._onPrevClick);
    }
    if (this.nextBtn) {
      this.nextBtn.removeEventListener('click', this._onNextClick);
    }
    if (this.dotsContainer) {
      this.dotsContainer.removeEventListener('click', this._onDotClick);
    }
    if (this.thumbsContainer) {
      this.thumbsContainer.removeEventListener('click', this._onThumbClick);
    }
    if (this._onTouchStart && this.track) {
      this.track.removeEventListener('touchstart', this._onTouchStart);
      this.track.removeEventListener('touchend', this._onTouchEnd);
      this.track.removeEventListener('mousedown', this._onTouchStart);
      this.track.removeEventListener('mouseup', this._onTouchEnd);
    }
    if (this._onMouseEnter && this.element) {
      this.element.removeEventListener('mouseenter', this._onMouseEnter);
      this.element.removeEventListener('mouseleave', this._onMouseLeave);
    }
    if (this.element) {
      this.element.removeEventListener('keydown', this._onKeyDown);
    }
    if (this._onResize) {
      window.removeEventListener('resize', this._onResize);
    }
    
    // 클론 요소 제거
    if (this._clones) {
      this._clones.forEach(clone => clone.remove());
      this._clones = [];
    }
    
    // 인스턴스 맵에서 제거
    if (this.element) {
      Carousel.instances.delete(this.element);
    }
    
    // 참조 해제
    this.element = null;
    this.track = null;
    this.slides = null;
    this.prevBtn = null;
    this.nextBtn = null;
    this.dotsContainer = null;
    this.thumbsContainer = null;
    this._onPrevClick = null;
    this._onNextClick = null;
    this._onDotClick = null;
    this._onThumbClick = null;
    this._onTouchStart = null;
    this._onTouchEnd = null;
    this._onMouseEnter = null;
    this._onMouseLeave = null;
    this._onKeyDown = null;
    this._onResize = null;
  }
  
  static initAll(selector = '.carousel, [data-carousel]') {
    const elements = document.querySelectorAll(selector);
    return Array.from(elements).map(el => new Carousel(el));
  }
}

// ============================================
// Lightbox - 이미지 라이트박스
// ============================================

class Lightbox {
  static instance = null;
  
  static defaults() {
    return {
      gallery: null,                // 갤러리 요소/셀렉터
      selector: 'a[data-lightbox], img[data-lightbox]',
      startIndex: 0,
      loop: true,
      
      // 표시 옵션
      showCounter: true,
      showCaption: true,
      showThumbnails: false,
      
      // 동작
      closeOnBackdrop: true,
      closeOnEscape: true,
      swipeToClose: true,
      zoom: false,
      
      // 애니메이션
      animation: true,
      animationDuration: 300,
      
      // 콜백
      onOpen: null,
      onClose: null,
      onChange: null
    };
  }
  
  constructor(options = {}) {
    // 싱글톤 패턴
    if (Lightbox.instance) {
      return Lightbox.instance;
    }
    
    this.options = { ...Lightbox.defaults(), ...options };
    this.currentIndex = 0;
    this.items = [];
    this.isOpen = false;
    this.lightbox = null;
    
    // 이벤트 핸들러 추적용
    this._onDocClick = null;
    this._onDocKeydown = null;
    
    this.init();
    Lightbox.instance = this;
  }
  
  init() {
    this._createLightbox();
    this._bindGlobalEvents();
  }
  
  _createLightbox() {
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
      <div class="lightbox__backdrop"></div>
      <div class="lightbox__container">
        <button class="lightbox__close" aria-label="닫기">
          <i class="material-icons-outlined">close</i>
        </button>
        <button class="lightbox__arrow lightbox__arrow--prev" aria-label="이전">
          <i class="material-icons-outlined">chevron_left</i>
        </button>
        <button class="lightbox__arrow lightbox__arrow--next" aria-label="다음">
          <i class="material-icons-outlined">chevron_right</i>
        </button>
        <div class="lightbox__content">
          <img class="lightbox__image" src="" alt="">
        </div>
        <div class="lightbox__footer">
          <div class="lightbox__caption"></div>
          <div class="lightbox__counter"></div>
        </div>
      </div>
    `;
    
    document.body.appendChild(lightbox);
    this.lightbox = lightbox;
    
    // 요소 캐싱
    this.backdrop = lightbox.querySelector('.lightbox__backdrop');
    this.container = lightbox.querySelector('.lightbox__container');
    this.closeBtn = lightbox.querySelector('.lightbox__close');
    this.prevBtn = lightbox.querySelector('.lightbox__arrow--prev');
    this.nextBtn = lightbox.querySelector('.lightbox__arrow--next');
    this.image = lightbox.querySelector('.lightbox__image');
    this.caption = lightbox.querySelector('.lightbox__caption');
    this.counter = lightbox.querySelector('.lightbox__counter');
    
    // 이벤트 바인딩
    this.closeBtn.addEventListener('click', () => this.close());
    this.prevBtn.addEventListener('click', () => this.prev());
    this.nextBtn.addEventListener('click', () => this.next());
    
    if (this.options.closeOnBackdrop) {
      this.backdrop.addEventListener('click', () => this.close());
    }
    
    // 터치 스와이프
    let touchStartX = 0;
    this.container.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });
    
    this.container.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const diff = touchStartX - touchEndX;
      
      if (Math.abs(diff) > 50) {
        if (diff > 0) this.next();
        else this.prev();
      }
    });
  }
  
  _bindGlobalEvents() {
    // 클릭 이벤트 위임
    this._onDocClick = (e) => {
      const trigger = e.target.closest(this.options.selector);
      if (trigger) {
        e.preventDefault();
        this._openFromTrigger(trigger);
      }
    };
    document.addEventListener('click', this._onDocClick);
    
    // ESC 키
    if (this.options.closeOnEscape) {
      this._onDocKeydown = (e) => {
        if (!this.isOpen) return;
        
        if (e.key === 'Escape') this.close();
        else if (e.key === 'ArrowLeft') this.prev();
        else if (e.key === 'ArrowRight') this.next();
      };
      document.addEventListener('keydown', this._onDocKeydown);
    }
  }
  
  _openFromTrigger(trigger) {
    // 갤러리 수집
    const galleryName = trigger.getAttribute('data-lightbox');
    let items;
    
    if (galleryName && galleryName !== 'true') {
      items = document.querySelectorAll(`[data-lightbox="${galleryName}"]`);
    } else {
      items = [trigger];
    }
    
    this.items = Array.from(items).map(item => {
      const isImage = item.tagName === 'IMG';
      return {
        src: isImage ? item.src : (item.href || item.getAttribute('data-src')),
        alt: isImage ? item.alt : item.getAttribute('data-alt'),
        caption: item.getAttribute('data-caption') || item.getAttribute('title')
      };
    });
    
    // 시작 인덱스 찾기
    const startIndex = Array.from(items).indexOf(trigger);
    this.open(startIndex >= 0 ? startIndex : 0);
  }
  
  open(index = 0) {
    if (this.isOpen) return;
    
    this.currentIndex = index;
    this.isOpen = true;
    
    this.lightbox.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    
    this._showSlide(index);
    
    if (this.options.onOpen) {
      this.options.onOpen(this);
    }
  }
  
  close() {
    if (!this.isOpen) return;
    
    this.isOpen = false;
    this.lightbox.classList.remove('is-open');
    document.body.style.overflow = '';
    
    if (this.options.onClose) {
      this.options.onClose(this);
    }
  }
  
  next() {
    if (this.items.length <= 1) return;
    
    let nextIndex = this.currentIndex + 1;
    if (nextIndex >= this.items.length) {
      nextIndex = this.options.loop ? 0 : this.items.length - 1;
    }
    
    this._showSlide(nextIndex);
  }
  
  prev() {
    if (this.items.length <= 1) return;
    
    let prevIndex = this.currentIndex - 1;
    if (prevIndex < 0) {
      prevIndex = this.options.loop ? this.items.length - 1 : 0;
    }
    
    this._showSlide(prevIndex);
  }
  
  _showSlide(index) {
    const prevIndex = this.currentIndex;
    this.currentIndex = index;
    
    const item = this.items[index];
    if (!item) return;
    
    // 이미지 로드
    this.image.classList.add('is-loading');
    this.image.src = item.src;
    this.image.alt = item.alt || '';
    
    this.image.onload = () => {
      this.image.classList.remove('is-loading');
    };
    
    // 캡션
    if (this.options.showCaption && item.caption) {
      this.caption.textContent = item.caption;
      this.caption.style.display = '';
    } else {
      this.caption.style.display = 'none';
    }
    
    // 카운터
    if (this.options.showCounter && this.items.length > 1) {
      this.counter.textContent = `${index + 1} / ${this.items.length}`;
      this.counter.style.display = '';
    } else {
      this.counter.style.display = 'none';
    }
    
    // 화살표 표시/숨김
    if (this.items.length <= 1) {
      this.prevBtn.style.display = 'none';
      this.nextBtn.style.display = 'none';
    } else {
      this.prevBtn.style.display = '';
      this.nextBtn.style.display = '';
      
      if (!this.options.loop) {
        this.prevBtn.disabled = index === 0;
        this.nextBtn.disabled = index === this.items.length - 1;
      }
    }
    
    // 콜백
    if (this.options.onChange && prevIndex !== index) {
      this.options.onChange(index, prevIndex);
    }
  }
  
  destroy() {
    // document 이벤트 리스너 제거
    if (this._onDocClick) {
      document.removeEventListener('click', this._onDocClick);
      this._onDocClick = null;
    }
    if (this._onDocKeydown) {
      document.removeEventListener('keydown', this._onDocKeydown);
      this._onDocKeydown = null;
    }
    
    // DOM 요소 제거
    if (this.lightbox) {
      this.lightbox.remove();
      this.lightbox = null;
    }
    
    // 참조 해제
    this.items = [];
    this.closeBtn = null;
    this.prevBtn = null;
    this.nextBtn = null;
    this.container = null;
    this.caption = null;
    this.counter = null;
    this.backdrop = null;
    
    Lightbox.instance = null;
  }
}

// ============================================
// Export
// ============================================

const CarouselModule = {
  Carousel,
  Lightbox,
  
  create(type, elementOrOptions, options) {
    switch (type) {
      case 'carousel':
        return new Carousel(elementOrOptions, options);
      case 'lightbox':
        return new Lightbox(elementOrOptions);
      default:
        throw new Error(`Unknown carousel type: ${type}`);
    }
  },
  
  initAll() {
    Carousel.initAll();
    new Lightbox(); // 라이트박스 싱글톤 초기화
  },
  
  destroyAll() {
    Carousel.instances.forEach(instance => instance.destroy());
    if (Lightbox.instance) Lightbox.instance.destroy();
  }
};

export default CarouselModule;
export { Carousel, Lightbox };
