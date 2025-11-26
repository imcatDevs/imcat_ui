/**
 * Media Viewer Module
 * Video Player, Audio Player, Image Viewer, Gallery
 * @module modules/media-viewer
 */

// ============================================
// VideoPlayer - 비디오 플레이어
// ============================================

/**
 * VideoPlayer 클래스
 * 커스텀 컨트롤을 가진 비디오 플레이어
 */
class VideoPlayer {
  /** @type {Map<HTMLElement, VideoPlayer>} */
  static instances = new Map();

  /**
   * 기본 옵션
   * @returns {Object}
   */
  static defaults() {
    return {
      src: '',
      poster: '',
      autoplay: false,
      muted: false,
      loop: false,
      controls: true,
      customControls: true,
      playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 2],
      volume: 1,
      onPlay: null,
      onPause: null,
      onEnded: null,
      onTimeUpdate: null,
      onError: null,
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
      console.error('VideoPlayer: Container not found');
      return;
    }

    this.options = { ...VideoPlayer.defaults(), ...options };
    this.video = null;
    this.controls = null;
    this._isPlaying = false;
    this._isMuted = this.options.muted;
    this._isFullscreen = false;
    this._hideControlsTimer = null;
    
    // 이벤트 핸들러
    this._handlers = {};
    
    this.init();
    VideoPlayer.instances.set(this.container, this);
  }

  init() {
    this._render();
    this._bindEvents();
  }

  _render() {
    const { src, poster, autoplay, muted, loop, controls, customControls } = this.options;
    
    this.container.className = 'video-player';
    
    this.container.innerHTML = `
      <div class="video-player__wrapper">
        <video 
          class="video-player__video"
          ${poster ? `poster="${poster}"` : ''}
          ${autoplay ? 'autoplay' : ''}
          ${muted ? 'muted' : ''}
          ${loop ? 'loop' : ''}
          ${controls && !customControls ? 'controls' : ''}
          playsinline
        >
          <source src="${src}" type="video/mp4">
          브라우저가 비디오를 지원하지 않습니다.
        </video>
        
        ${customControls ? this._renderCustomControls() : ''}
        
        <div class="video-player__overlay">
          <button class="video-player__big-play" type="button" aria-label="재생">
            <i class="material-icons-outlined">play_arrow</i>
          </button>
        </div>
        
        <div class="video-player__loading">
          <div class="video-player__spinner"></div>
        </div>
      </div>
    `;
    
    this.video = this.container.querySelector('.video-player__video');
    this.controls = this.container.querySelector('.video-player__controls');
    this.overlay = this.container.querySelector('.video-player__overlay');
    this.loading = this.container.querySelector('.video-player__loading');
    
    // 초기 볼륨 설정
    this.video.volume = this.options.volume;
  }

  _renderCustomControls() {
    return `
      <div class="video-player__controls">
        <div class="video-player__progress">
          <div class="video-player__progress-bar">
            <div class="video-player__progress-buffered"></div>
            <div class="video-player__progress-played"></div>
            <div class="video-player__progress-handle"></div>
          </div>
        </div>
        
        <div class="video-player__controls-bar">
          <div class="video-player__controls-left">
            <button class="video-player__btn video-player__btn--play" type="button" aria-label="재생">
              <i class="material-icons-outlined">play_arrow</i>
            </button>
            
            <div class="video-player__volume">
              <button class="video-player__btn video-player__btn--volume" type="button" aria-label="음소거">
                <i class="material-icons-outlined">volume_up</i>
              </button>
              <div class="video-player__volume-slider">
                <input type="range" min="0" max="1" step="0.1" value="1" class="video-player__volume-input">
              </div>
            </div>
            
            <div class="video-player__time">
              <span class="video-player__current">0:00</span>
              <span class="video-player__separator">/</span>
              <span class="video-player__duration">0:00</span>
            </div>
          </div>
          
          <div class="video-player__controls-right">
            <div class="video-player__speed">
              <button class="video-player__btn video-player__btn--speed" type="button" aria-label="재생 속도">
                <span>1x</span>
              </button>
            </div>
            
            <button class="video-player__btn video-player__btn--pip" type="button" aria-label="PIP 모드">
              <i class="material-icons-outlined">picture_in_picture_alt</i>
            </button>
            
            <button class="video-player__btn video-player__btn--fullscreen" type="button" aria-label="전체 화면">
              <i class="material-icons-outlined">fullscreen</i>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  _bindEvents() {
    // 비디오 이벤트
    this._handlers.play = () => {
      this._isPlaying = true;
      this._updatePlayButton();
      this.container.classList.add('is-playing');
      if (this.options.onPlay) this.options.onPlay();
    };
    this.video.addEventListener('play', this._handlers.play);
    
    this._handlers.pause = () => {
      this._isPlaying = false;
      this._updatePlayButton();
      this.container.classList.remove('is-playing');
      if (this.options.onPause) this.options.onPause();
    };
    this.video.addEventListener('pause', this._handlers.pause);
    
    this._handlers.ended = () => {
      this._isPlaying = false;
      this._updatePlayButton();
      this.container.classList.remove('is-playing');
      if (this.options.onEnded) this.options.onEnded();
    };
    this.video.addEventListener('ended', this._handlers.ended);
    
    this._handlers.timeupdate = () => {
      this._updateProgress();
      this._updateTime();
      if (this.options.onTimeUpdate) this.options.onTimeUpdate(this.video.currentTime);
    };
    this.video.addEventListener('timeupdate', this._handlers.timeupdate);
    
    this._handlers.loadedmetadata = () => {
      this._updateTime();
    };
    this.video.addEventListener('loadedmetadata', this._handlers.loadedmetadata);
    
    this._handlers.waiting = () => {
      this.loading.classList.add('is-visible');
    };
    this.video.addEventListener('waiting', this._handlers.waiting);
    
    this._handlers.canplay = () => {
      this.loading.classList.remove('is-visible');
    };
    this.video.addEventListener('canplay', this._handlers.canplay);
    
    this._handlers.error = () => {
      if (this.options.onError) this.options.onError();
    };
    this.video.addEventListener('error', this._handlers.error);
    
    // 컨트롤 이벤트
    if (this.controls) {
      // 재생 버튼
      const playBtn = this.controls.querySelector('.video-player__btn--play');
      playBtn.addEventListener('click', () => this.togglePlay());
      
      // 오버레이 재생 버튼
      const bigPlayBtn = this.overlay.querySelector('.video-player__big-play');
      bigPlayBtn.addEventListener('click', () => this.play());
      
      // 볼륨
      const volumeBtn = this.controls.querySelector('.video-player__btn--volume');
      volumeBtn.addEventListener('click', () => this.toggleMute());
      
      const volumeInput = this.controls.querySelector('.video-player__volume-input');
      volumeInput.addEventListener('input', (e) => this.setVolume(e.target.value));
      
      // 진행 바
      const progressBar = this.controls.querySelector('.video-player__progress-bar');
      progressBar.addEventListener('click', (e) => this._seekTo(e));
      
      // 속도
      const speedBtn = this.controls.querySelector('.video-player__btn--speed');
      speedBtn.addEventListener('click', () => this._cycleSpeed());
      
      // PIP
      const pipBtn = this.controls.querySelector('.video-player__btn--pip');
      pipBtn.addEventListener('click', () => this.togglePIP());
      
      // 전체 화면
      const fullscreenBtn = this.controls.querySelector('.video-player__btn--fullscreen');
      fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
    }
    
    // 비디오 클릭으로 재생/일시정지
    this.video.addEventListener('click', () => this.togglePlay());
    
    // 키보드 단축키
    this._handlers.keydown = (e) => {
      if (!this.container.contains(document.activeElement)) return;
      
      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          this.togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          this.seek(this.video.currentTime - 10);
          break;
        case 'ArrowRight':
          e.preventDefault();
          this.seek(this.video.currentTime + 10);
          break;
        case 'ArrowUp':
          e.preventDefault();
          this.setVolume(Math.min(1, this.video.volume + 0.1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          this.setVolume(Math.max(0, this.video.volume - 0.1));
          break;
        case 'm':
          e.preventDefault();
          this.toggleMute();
          break;
        case 'f':
          e.preventDefault();
          this.toggleFullscreen();
          break;
      }
    };
    document.addEventListener('keydown', this._handlers.keydown);
    
    // 컨트롤 자동 숨김
    this._handlers.mousemove = () => {
      this._showControls();
    };
    this.container.addEventListener('mousemove', this._handlers.mousemove);
    
    this._handlers.mouseleave = () => {
      if (this._isPlaying) {
        this._hideControls();
      }
    };
    this.container.addEventListener('mouseleave', this._handlers.mouseleave);
  }

  _updatePlayButton() {
    const playBtn = this.controls?.querySelector('.video-player__btn--play i');
    if (playBtn) {
      playBtn.textContent = this._isPlaying ? 'pause' : 'play_arrow';
    }
  }

  _updateProgress() {
    const progress = this.controls?.querySelector('.video-player__progress-played');
    const handle = this.controls?.querySelector('.video-player__progress-handle');
    if (progress && this.video.duration) {
      const percent = (this.video.currentTime / this.video.duration) * 100;
      progress.style.width = `${percent}%`;
      if (handle) handle.style.left = `${percent}%`;
    }
  }

  _updateTime() {
    const current = this.controls?.querySelector('.video-player__current');
    const duration = this.controls?.querySelector('.video-player__duration');
    
    if (current) current.textContent = this._formatTime(this.video.currentTime);
    if (duration) duration.textContent = this._formatTime(this.video.duration || 0);
  }

  _formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  _seekTo(e) {
    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    this.video.currentTime = percent * this.video.duration;
  }

  _cycleSpeed() {
    const rates = this.options.playbackRates;
    const currentIndex = rates.indexOf(this.video.playbackRate);
    const nextIndex = (currentIndex + 1) % rates.length;
    this.setPlaybackRate(rates[nextIndex]);
  }

  _showControls() {
    this.container.classList.remove('controls-hidden');
    if (this._hideControlsTimer) {
      clearTimeout(this._hideControlsTimer);
    }
    if (this._isPlaying) {
      this._hideControlsTimer = setTimeout(() => {
        this._hideControls();
      }, 3000);
    }
  }

  _hideControls() {
    this.container.classList.add('controls-hidden');
  }

  // Public API
  play() {
    this.video.play();
  }

  pause() {
    this.video.pause();
  }

  togglePlay() {
    if (this._isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  seek(time) {
    this.video.currentTime = Math.max(0, Math.min(time, this.video.duration));
  }

  setVolume(volume) {
    this.video.volume = Math.max(0, Math.min(1, volume));
    this._updateVolumeUI();
  }

  toggleMute() {
    this._isMuted = !this._isMuted;
    this.video.muted = this._isMuted;
    this._updateVolumeUI();
  }

  _updateVolumeUI() {
    const volumeBtn = this.controls?.querySelector('.video-player__btn--volume i');
    const volumeInput = this.controls?.querySelector('.video-player__volume-input');
    
    if (volumeBtn) {
      if (this._isMuted || this.video.volume === 0) {
        volumeBtn.textContent = 'volume_off';
      } else if (this.video.volume < 0.5) {
        volumeBtn.textContent = 'volume_down';
      } else {
        volumeBtn.textContent = 'volume_up';
      }
    }
    
    if (volumeInput) {
      volumeInput.value = this._isMuted ? 0 : this.video.volume;
    }
  }

  setPlaybackRate(rate) {
    this.video.playbackRate = rate;
    const speedBtn = this.controls?.querySelector('.video-player__btn--speed span');
    if (speedBtn) speedBtn.textContent = `${rate}x`;
  }

  async togglePIP() {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await this.video.requestPictureInPicture();
      }
    } catch (err) {
      console.error('PIP error:', err);
    }
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      this.container.requestFullscreen();
      this._isFullscreen = true;
    } else {
      document.exitFullscreen();
      this._isFullscreen = false;
    }
    
    const btn = this.controls?.querySelector('.video-player__btn--fullscreen i');
    if (btn) {
      btn.textContent = this._isFullscreen ? 'fullscreen_exit' : 'fullscreen';
    }
  }

  setSrc(src, poster = '') {
    this.video.src = src;
    if (poster) this.video.poster = poster;
  }

  getCurrentTime() {
    return this.video.currentTime;
  }

  getDuration() {
    return this.video.duration;
  }

  destroy() {
    // 이벤트 제거
    Object.entries(this._handlers).forEach(([event, handler]) => {
      if (event === 'keydown') {
        document.removeEventListener('keydown', handler);
      }
    });
    
    if (this._hideControlsTimer) {
      clearTimeout(this._hideControlsTimer);
    }
    
    VideoPlayer.instances.delete(this.container);
    
    if (this.container) {
      this.container.innerHTML = '';
    }
    
    this.container = null;
    this.video = null;
    this.controls = null;
  }
}


// ============================================
// AudioPlayer - 오디오 플레이어
// ============================================

/**
 * AudioPlayer 클래스
 * 커스텀 오디오 플레이어
 */
class AudioPlayer {
  /** @type {Map<HTMLElement, AudioPlayer>} */
  static instances = new Map();

  /**
   * 기본 옵션
   * @returns {Object}
   */
  static defaults() {
    return {
      src: '',
      title: '',
      artist: '',
      cover: '',
      autoplay: false,
      loop: false,
      volume: 1,
      onPlay: null,
      onPause: null,
      onEnded: null,
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
      console.error('AudioPlayer: Container not found');
      return;
    }

    this.options = { ...AudioPlayer.defaults(), ...options };
    this.audio = null;
    this._isPlaying = false;
    
    this.init();
    AudioPlayer.instances.set(this.container, this);
  }

  init() {
    this._render();
    this._bindEvents();
  }

  _render() {
    const { src, title, artist, cover, autoplay, loop } = this.options;
    
    this.container.className = 'audio-player';
    
    this.container.innerHTML = `
      <audio 
        src="${src}"
        ${autoplay ? 'autoplay' : ''}
        ${loop ? 'loop' : ''}
        preload="metadata"
      ></audio>
      
      <div class="audio-player__cover">
        ${cover 
          ? `<img src="${cover}" alt="${title}">`
          : `<i class="material-icons-outlined">music_note</i>`
        }
      </div>
      
      <div class="audio-player__info">
        <div class="audio-player__title">${title || '알 수 없는 제목'}</div>
        <div class="audio-player__artist">${artist || '알 수 없는 아티스트'}</div>
      </div>
      
      <div class="audio-player__controls">
        <div class="audio-player__progress">
          <span class="audio-player__time audio-player__current">0:00</span>
          <div class="audio-player__progress-bar">
            <div class="audio-player__progress-fill"></div>
          </div>
          <span class="audio-player__time audio-player__duration">0:00</span>
        </div>
        
        <div class="audio-player__buttons">
          <button class="audio-player__btn audio-player__btn--prev" type="button" aria-label="이전">
            <i class="material-icons-outlined">skip_previous</i>
          </button>
          <button class="audio-player__btn audio-player__btn--play" type="button" aria-label="재생">
            <i class="material-icons-outlined">play_arrow</i>
          </button>
          <button class="audio-player__btn audio-player__btn--next" type="button" aria-label="다음">
            <i class="material-icons-outlined">skip_next</i>
          </button>
          
          <div class="audio-player__volume">
            <button class="audio-player__btn audio-player__btn--volume" type="button" aria-label="볼륨">
              <i class="material-icons-outlined">volume_up</i>
            </button>
            <input type="range" class="audio-player__volume-slider" min="0" max="1" step="0.1" value="1">
          </div>
        </div>
      </div>
    `;
    
    this.audio = this.container.querySelector('audio');
    this.audio.volume = this.options.volume;
  }

  _bindEvents() {
    // 재생 버튼
    const playBtn = this.container.querySelector('.audio-player__btn--play');
    playBtn.addEventListener('click', () => this.togglePlay());
    
    // 볼륨
    const volumeSlider = this.container.querySelector('.audio-player__volume-slider');
    volumeSlider.addEventListener('input', (e) => {
      this.audio.volume = e.target.value;
    });
    
    // 진행 바
    const progressBar = this.container.querySelector('.audio-player__progress-bar');
    progressBar.addEventListener('click', (e) => {
      const rect = progressBar.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      this.audio.currentTime = percent * this.audio.duration;
    });
    
    // 오디오 이벤트
    this.audio.addEventListener('play', () => {
      this._isPlaying = true;
      this._updatePlayButton();
      if (this.options.onPlay) this.options.onPlay();
    });
    
    this.audio.addEventListener('pause', () => {
      this._isPlaying = false;
      this._updatePlayButton();
      if (this.options.onPause) this.options.onPause();
    });
    
    this.audio.addEventListener('ended', () => {
      this._isPlaying = false;
      this._updatePlayButton();
      if (this.options.onEnded) this.options.onEnded();
    });
    
    this.audio.addEventListener('timeupdate', () => {
      this._updateProgress();
    });
    
    this.audio.addEventListener('loadedmetadata', () => {
      this._updateDuration();
    });
  }

  _updatePlayButton() {
    const icon = this.container.querySelector('.audio-player__btn--play i');
    icon.textContent = this._isPlaying ? 'pause' : 'play_arrow';
  }

  _updateProgress() {
    const fill = this.container.querySelector('.audio-player__progress-fill');
    const current = this.container.querySelector('.audio-player__current');
    
    if (this.audio.duration) {
      const percent = (this.audio.currentTime / this.audio.duration) * 100;
      fill.style.width = `${percent}%`;
    }
    
    current.textContent = this._formatTime(this.audio.currentTime);
  }

  _updateDuration() {
    const duration = this.container.querySelector('.audio-player__duration');
    duration.textContent = this._formatTime(this.audio.duration || 0);
  }

  _formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  play() { this.audio.play(); }
  pause() { this.audio.pause(); }
  togglePlay() { this._isPlaying ? this.pause() : this.play(); }
  
  setTrack(src, title = '', artist = '', cover = '') {
    this.audio.src = src;
    this.container.querySelector('.audio-player__title').textContent = title || '알 수 없는 제목';
    this.container.querySelector('.audio-player__artist').textContent = artist || '알 수 없는 아티스트';
    
    const coverEl = this.container.querySelector('.audio-player__cover');
    if (cover) {
      coverEl.innerHTML = `<img src="${cover}" alt="${title}">`;
    } else {
      coverEl.innerHTML = `<i class="material-icons-outlined">music_note</i>`;
    }
  }

  destroy() {
    AudioPlayer.instances.delete(this.container);
    this.audio.pause();
    this.container.innerHTML = '';
    this.container = null;
    this.audio = null;
  }
}


// ============================================
// ImageViewer - 이미지 뷰어
// ============================================

/**
 * ImageViewer 클래스
 * 이미지 확대/축소, 회전 기능
 */
class ImageViewer {
  /** @type {Map<HTMLElement, ImageViewer>} */
  static instances = new Map();

  /**
   * 기본 옵션
   * @returns {Object}
   */
  static defaults() {
    return {
      src: '',
      alt: '',
      zoomable: true,
      rotatable: true,
      downloadable: true,
      minZoom: 0.5,
      maxZoom: 3,
      zoomStep: 0.25,
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
      console.error('ImageViewer: Container not found');
      return;
    }

    this.options = { ...ImageViewer.defaults(), ...options };
    this._zoom = 1;
    this._rotation = 0;
    
    this.init();
    ImageViewer.instances.set(this.container, this);
  }

  init() {
    this._render();
    this._bindEvents();
  }

  _render() {
    const { src, alt, zoomable, rotatable, downloadable } = this.options;
    
    this.container.className = 'image-viewer';
    
    this.container.innerHTML = `
      <div class="image-viewer__wrapper">
        <img src="${src}" alt="${alt}" class="image-viewer__image" draggable="false">
      </div>
      
      <div class="image-viewer__toolbar">
        ${zoomable ? `
          <button class="image-viewer__btn" data-action="zoom-out" title="축소">
            <i class="material-icons-outlined">remove</i>
          </button>
          <span class="image-viewer__zoom-level">100%</span>
          <button class="image-viewer__btn" data-action="zoom-in" title="확대">
            <i class="material-icons-outlined">add</i>
          </button>
        ` : ''}
        
        ${rotatable ? `
          <button class="image-viewer__btn" data-action="rotate-left" title="왼쪽 회전">
            <i class="material-icons-outlined">rotate_left</i>
          </button>
          <button class="image-viewer__btn" data-action="rotate-right" title="오른쪽 회전">
            <i class="material-icons-outlined">rotate_right</i>
          </button>
        ` : ''}
        
        <button class="image-viewer__btn" data-action="reset" title="초기화">
          <i class="material-icons-outlined">restart_alt</i>
        </button>
        
        ${downloadable ? `
          <button class="image-viewer__btn" data-action="download" title="다운로드">
            <i class="material-icons-outlined">download</i>
          </button>
        ` : ''}
      </div>
    `;
    
    this.image = this.container.querySelector('.image-viewer__image');
    this.zoomLevel = this.container.querySelector('.image-viewer__zoom-level');
  }

  _bindEvents() {
    // 툴바 버튼
    this.container.addEventListener('click', (e) => {
      const btn = e.target.closest('.image-viewer__btn');
      if (!btn) return;
      
      const action = btn.dataset.action;
      switch (action) {
        case 'zoom-in':
          this.zoomIn();
          break;
        case 'zoom-out':
          this.zoomOut();
          break;
        case 'rotate-left':
          this.rotate(-90);
          break;
        case 'rotate-right':
          this.rotate(90);
          break;
        case 'reset':
          this.reset();
          break;
        case 'download':
          this.download();
          break;
      }
    });
    
    // 마우스 휠 줌
    this.container.querySelector('.image-viewer__wrapper').addEventListener('wheel', (e) => {
      if (!this.options.zoomable) return;
      e.preventDefault();
      if (e.deltaY < 0) {
        this.zoomIn();
      } else {
        this.zoomOut();
      }
    });
  }

  _updateTransform() {
    this.image.style.transform = `scale(${this._zoom}) rotate(${this._rotation}deg)`;
    if (this.zoomLevel) {
      this.zoomLevel.textContent = `${Math.round(this._zoom * 100)}%`;
    }
  }

  zoomIn() {
    this._zoom = Math.min(this.options.maxZoom, this._zoom + this.options.zoomStep);
    this._updateTransform();
  }

  zoomOut() {
    this._zoom = Math.max(this.options.minZoom, this._zoom - this.options.zoomStep);
    this._updateTransform();
  }

  setZoom(level) {
    this._zoom = Math.max(this.options.minZoom, Math.min(this.options.maxZoom, level));
    this._updateTransform();
  }

  rotate(degrees) {
    this._rotation = (this._rotation + degrees) % 360;
    this._updateTransform();
  }

  reset() {
    this._zoom = 1;
    this._rotation = 0;
    this._updateTransform();
  }

  download() {
    const link = document.createElement('a');
    link.href = this.options.src;
    link.download = this.options.alt || 'image';
    link.click();
  }

  setSrc(src, alt = '') {
    this.options.src = src;
    this.options.alt = alt;
    this.image.src = src;
    this.image.alt = alt;
    this.reset();
  }

  destroy() {
    ImageViewer.instances.delete(this.container);
    this.container.innerHTML = '';
    this.container = null;
    this.image = null;
  }
}


// ============================================
// Export
// ============================================

export { VideoPlayer, AudioPlayer, ImageViewer };
export default { VideoPlayer, AudioPlayer, ImageViewer };
