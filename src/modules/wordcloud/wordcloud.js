/**
 * WordCloud Module
 * @module modules/wordcloud
 * @description 워드 클라우드 컴포넌트 (Canvas 기반, 픽셀 충돌 검사)
 * - WordCloud: 단어 빈도 기반 시각화 (Canvas)
 * - TagCloud: 인터랙티브 태그 클라우드 (DOM)
 */

// ============================================
// WordCloud - Canvas 기반 워드 클라우드
// ============================================

/**
 * WordCloud 클래스
 * Canvas 기반 워드클라우드 (wordcloud2.js 방식)
 */
class WordCloud {
  /** @type {Map<HTMLElement, WordCloud>} */
  static instances = new Map();

  /**
   * 기본 옵션
   */
  static defaults() {
    return {
      words: [],                    // [{ text, weight, color? }]
      width: null,                  // null = 컨테이너 너비
      height: 400,
      minFontSize: 12,
      maxFontSize: 100,
      fontFamily: '"Noto Sans KR", Arial, sans-serif',
      fontWeight: 'bold',
      colors: ['#667eea', '#764ba2', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6', '#ec4899'],
      rotate: true,                 // 회전 활성화
      rotateAngles: [0, 90],        // 회전 각도 배열
      gridSize: 4,                  // 충돌 검사 그리드 크기
      maskIcon: null,               // Material Icons 이름 (예: 'favorite', 'cloud')
      maskSize: 400,                // 마스크 크기
      shrinkToFit: true,            // 배치 실패 시 크기 줄여서 재시도
      backgroundColor: null,        // 배경색 (null = 투명)
      tooltip: true,
      onClick: null,                // (wordData, event) => {}
      onWordPlaced: null,           // (wordData) => {}
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
      console.error('WordCloud: Container not found');
      return;
    }

    this.options = { ...WordCloud.defaults(), ...options };
    this.canvas = null;
    this.ctx = null;
    this.placedWords = [];
    this.grid = null;
    this.maskData = null;
    this._tooltip = null;
    this._onClick = null;
    this._onMouseMove = null;
    
    this.init();
    WordCloud.instances.set(this.container, this);
  }

  init() {
    const { maskIcon } = this.options;
    
    if (maskIcon) {
      this._createMask(maskIcon, () => this._render());
    } else {
      this._render();
    }
    
    this._bindEvents();
  }

  // ==================== 마스크 생성 ====================

  /**
   * 마스크 아이콘 생성
   */
  _createMask(iconName, callback) {
    const size = this.options.maskSize;
    
    // 하트 아이콘
    if (iconName === 'favorite' || iconName === 'heart') {
      this._createHeartMask(size, callback);
      return;
    }
    
    // 원형
    if (iconName === 'circle') {
      this._createCircleMask(size, callback);
      return;
    }
    
    // 클라우드 모양
    if (iconName === 'cloud') {
      this._createCloudMask(size, callback);
      return;
    }
    
    // 별 모양
    if (iconName === 'star') {
      this._createStarMask(size, callback);
      return;
    }
    
    // Material Icons
    this._createIconMask(iconName, size, callback);
  }

  /**
   * 하트 마스크
   */
  _createHeartMask(size, callback) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = size;
    canvas.height = size;
    
    ctx.fillStyle = '#000';
    ctx.beginPath();
    
    const cx = size / 2;
    const cy = size / 2.2;
    const s = size / 100;
    
    ctx.moveTo(cx, cy + 30 * s);
    ctx.bezierCurveTo(cx, cy + 20 * s, cx - 25 * s, cy - 10 * s, cx - 25 * s, cy - 20 * s);
    ctx.bezierCurveTo(cx - 25 * s, cy - 35 * s, cx - 10 * s, cy - 40 * s, cx, cy - 30 * s);
    ctx.bezierCurveTo(cx + 10 * s, cy - 40 * s, cx + 25 * s, cy - 35 * s, cx + 25 * s, cy - 20 * s);
    ctx.bezierCurveTo(cx + 25 * s, cy - 10 * s, cx, cy + 20 * s, cx, cy + 30 * s);
    ctx.closePath();
    ctx.fill();
    
    this._extractMaskPixels(ctx, size, size, callback);
  }

  /**
   * 원형 마스크
   */
  _createCircleMask(size, callback) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = size;
    canvas.height = size;
    
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 10, 0, Math.PI * 2);
    ctx.fill();
    
    this._extractMaskPixels(ctx, size, size, callback);
  }

  /**
   * 클라우드 마스크
   */
  _createCloudMask(size, callback) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = size;
    canvas.height = size;
    
    ctx.fillStyle = '#000';
    ctx.beginPath();
    
    const cx = size / 2;
    const cy = size / 2;
    const s = size / 200;
    
    // 구름 모양 그리기
    ctx.arc(cx - 40 * s, cy + 10 * s, 35 * s, 0, Math.PI * 2);
    ctx.arc(cx, cy - 20 * s, 50 * s, 0, Math.PI * 2);
    ctx.arc(cx + 50 * s, cy, 40 * s, 0, Math.PI * 2);
    ctx.arc(cx + 20 * s, cy + 20 * s, 35 * s, 0, Math.PI * 2);
    ctx.arc(cx - 20 * s, cy + 25 * s, 30 * s, 0, Math.PI * 2);
    ctx.fill();
    
    this._extractMaskPixels(ctx, size, size, callback);
  }

  /**
   * 별 마스크
   */
  _createStarMask(size, callback) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = size;
    canvas.height = size;
    
    ctx.fillStyle = '#000';
    ctx.beginPath();
    
    const cx = size / 2;
    const cy = size / 2;
    const outerR = size / 2 - 20;
    const innerR = outerR * 0.4;
    const points = 5;
    
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const angle = (i * Math.PI / points) - Math.PI / 2;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    
    this._extractMaskPixels(ctx, size, size, callback);
  }

  /**
   * Material Icons 마스크
   */
  _createIconMask(iconName, size, callback) {
    const render = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = size;
      canvas.height = size;
      
      ctx.font = `${size * 0.8}px "Material Icons"`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#000';
      ctx.fillText(iconName, size / 2, size / 2);
      
      this._extractMaskPixels(ctx, size, size, callback);
    };
    
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => setTimeout(render, 50));
    } else {
      setTimeout(render, 200);
    }
  }

  /**
   * 마스크 픽셀 추출
   */
  _extractMaskPixels(ctx, width, height, callback) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const pixels = [];
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        if (imageData.data[i + 3] > 0) {
          pixels.push({ x, y });
        }
      }
    }
    
    this.maskData = { width, height, pixels };
    callback();
  }

  // ==================== 렌더링 ====================

  _render() {
    const { words, width, height, backgroundColor } = this.options;
    
    // 컨테이너 설정
    this.container.innerHTML = '';
    this.container.classList.add('wordcloud');
    
    const containerWidth = width || this.container.clientWidth || 800;
    const containerHeight = height;
    
    this.container.style.cssText = `
      position: relative;
      width: ${containerWidth}px;
      height: ${containerHeight}px;
      overflow: hidden;
    `;
    
    if (!words || words.length === 0) {
      this.container.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-tertiary);">단어 데이터가 없습니다</div>';
      return;
    }
    
    // Canvas 생성
    this.canvas = document.createElement('canvas');
    this.canvas.width = containerWidth;
    this.canvas.height = containerHeight;
    this.canvas.className = 'wordcloud__canvas';
    this.canvas.style.cssText = 'display:block;width:100%;height:100%;';
    this.container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    
    // 배경
    if (backgroundColor) {
      this.ctx.fillStyle = backgroundColor;
      this.ctx.fillRect(0, 0, containerWidth, containerHeight);
    }
    
    // 마스크가 있으면 마스크 렌더링
    if (this.maskData) {
      this._renderWithMask(containerWidth, containerHeight);
    } else {
      this._renderNormal(containerWidth, containerHeight);
    }
    
    // 툴팁 생성
    if (this.options.tooltip) {
      this._createTooltip();
    }
  }

  /**
   * 일반 렌더링 (마스크 없음)
   */
  _renderNormal(width, height) {
    const { words, gridSize } = this.options;
    
    // 그리드 초기화
    const ngx = Math.ceil(width / gridSize);
    const ngy = Math.ceil(height / gridSize);
    this.grid = this._createGrid(ngx, ngy, true);
    
    this._placeWords(words, width, height, ngx, ngy);
  }

  /**
   * 마스크 렌더링
   */
  _renderWithMask(containerWidth, containerHeight) {
    const { words, gridSize } = this.options;
    const { width: maskW, height: maskH, pixels } = this.maskData;
    
    // 마스크를 컨테이너에 맞게 스케일
    const scaleX = containerWidth / maskW;
    const scaleY = containerHeight / maskH;
    const scale = Math.min(scaleX, scaleY) * 0.9;
    
    const offsetX = (containerWidth - maskW * scale) / 2;
    const offsetY = (containerHeight - maskH * scale) / 2;
    
    // 그리드 초기화 (모두 false = 배치 불가)
    const ngx = Math.ceil(containerWidth / gridSize);
    const ngy = Math.ceil(containerHeight / gridSize);
    this.grid = this._createGrid(ngx, ngy, false);
    
    // 마스크 영역만 true로 설정
    for (const p of pixels) {
      const sx = Math.floor(p.x * scale + offsetX);
      const sy = Math.floor(p.y * scale + offsetY);
      const gx = Math.floor(sx / gridSize);
      const gy = Math.floor(sy / gridSize);
      
      if (gx >= 0 && gx < ngx && gy >= 0 && gy < ngy) {
        this.grid[gx][gy] = true;
      }
    }
    
    this._placeWords(words, containerWidth, containerHeight, ngx, ngy);
  }

  /**
   * 2D 그리드 생성
   */
  _createGrid(ngx, ngy, defaultValue) {
    const grid = [];
    for (let i = 0; i < ngx; i++) {
      grid[i] = [];
      for (let j = 0; j < ngy; j++) {
        grid[i][j] = defaultValue;
      }
    }
    return grid;
  }

  /**
   * 단어 배치
   */
  _placeWords(words, width, height, ngx, ngy) {
    const opts = this.options;
    const g = opts.gridSize;
    
    // 가중치 범위
    const weights = words.map(w => w.weight);
    const minW = Math.min(...weights);
    const maxW = Math.max(...weights);
    
    // 정렬 (큰 것부터)
    const sorted = [...words].sort((a, b) => b.weight - a.weight);
    
    // 중심
    const center = [ngx / 2, ngy / 2];
    const maxRadius = Math.max(ngx, ngy);
    
    // 반지름별 포인트 캐시
    const pointsCache = [];
    const getPoints = (r) => {
      if (pointsCache[r]) return pointsCache[r];
      
      const pts = [];
      if (r === 0) {
        pts.push([center[0], center[1]]);
      } else {
        const T = r * 8;
        for (let t = 0; t < T; t++) {
          const angle = (t / T) * 2 * Math.PI;
          pts.push([
            center[0] + r * Math.cos(angle),
            center[1] + r * Math.sin(angle)
          ]);
        }
      }
      pointsCache[r] = pts;
      return pts;
    };
    
    this.placedWords = [];
    
    for (const word of sorted) {
      const initialSize = this._calcFontSize(word.weight, minW, maxW);
      this._tryPlaceWord(word, initialSize, g, ngx, ngy, maxRadius, getPoints);
    }
  }

  /**
   * 폰트 크기 계산
   */
  _calcFontSize(weight, minW, maxW) {
    const { minFontSize, maxFontSize } = this.options;
    const factor = maxFontSize / maxW;
    let size = weight * factor;
    if (size < minFontSize) size = minFontSize;
    return Math.floor(size);
  }

  /**
   * 단어 배치 시도 (shrinkToFit 포함)
   */
  _tryPlaceWord(word, fontSize, g, ngx, ngy, maxRadius, getPoints) {
    const opts = this.options;
    
    // 회전 각도
    let rotation = 0;
    if (opts.rotate && opts.rotateAngles.length > 0) {
      rotation = opts.rotateAngles[Math.floor(Math.random() * opts.rotateAngles.length)];
    }
    
    // 텍스트 정보 추출
    const info = this._getTextInfo(word.text, fontSize, rotation);
    if (!info) return false;
    
    // 중심에서 바깥으로 확장하며 배치
    for (let r = maxRadius; r >= 0; r--) {
      const points = getPoints(maxRadius - r);
      
      for (const pt of points) {
        const gx = Math.floor(pt[0] - info.gw / 2);
        const gy = Math.floor(pt[1] - info.gh / 2);
        
        if (this._canFit(gx, gy, info.occupied, ngx, ngy)) {
          // 그리드에 표시
          this._markGrid(gx, gy, info.occupied);
          
          // Canvas에 그리기
          const drawX = (gx + info.gw / 2) * g;
          const drawY = (gy + info.gh / 2) * g;
          const color = word.color || this._getRandomColor();
          
          this._drawWord(word.text, drawX, drawY, fontSize, color, rotation);
          
          // 배치 정보 저장
          this.placedWords.push({
            text: word.text,
            weight: word.weight,
            x: drawX - info.width / 2,
            y: drawY - info.height / 2,
            width: info.width,
            height: info.height,
            centerX: drawX,
            centerY: drawY,
            fontSize,
            color,
            rotation
          });
          
          if (opts.onWordPlaced) opts.onWordPlaced(word);
          return true;
        }
      }
    }
    
    // shrinkToFit: 크기 줄여서 재시도
    if (opts.shrinkToFit && fontSize > opts.minFontSize) {
      const nextSize = Math.max(Math.floor(fontSize * 0.7), opts.minFontSize);
      return this._tryPlaceWord(word, nextSize, g, ngx, ngy, maxRadius, getPoints);
    }
    
    return false;
  }

  /**
   * 텍스트 픽셀 정보 추출
   */
  _getTextInfo(text, fontSize, rotation) {
    const { fontFamily, fontWeight, gridSize: g } = this.options;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    const metrics = ctx.measureText(text);
    const textW = metrics.width;
    const textH = fontSize * 1.2;
    
    // 회전 고려한 크기
    const rad = rotation * Math.PI / 180;
    const cos = Math.abs(Math.cos(rad));
    const sin = Math.abs(Math.sin(rad));
    const width = Math.ceil(textW * cos + textH * sin) + 10;
    const height = Math.ceil(textW * sin + textH * cos) + 10;
    
    canvas.width = width;
    canvas.height = height;
    
    ctx.translate(width / 2, height / 2);
    ctx.rotate(rad);
    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    ctx.fillStyle = '#000';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.fillText(text, 0, 0);
    
    // 픽셀 데이터 추출
    const imageData = ctx.getImageData(0, 0, width, height).data;
    const gw = Math.ceil(width / g);
    const gh = Math.ceil(height / g);
    const occupied = [];
    
    for (let gx = 0; gx < gw; gx++) {
      for (let gy = 0; gy < gh; gy++) {
        let hasPixel = false;
        
        for (let x = 0; x < g && !hasPixel; x++) {
          for (let y = 0; y < g && !hasPixel; y++) {
            const px = gx * g + x;
            const py = gy * g + y;
            if (px < width && py < height) {
              const idx = (py * width + px) * 4 + 3;
              if (imageData[idx] > 0) hasPixel = true;
            }
          }
        }
        
        if (hasPixel) {
          occupied.push([gx, gy]);
        }
      }
    }
    
    return { occupied, gw, gh, width, height };
  }

  /**
   * 배치 가능 여부 확인
   */
  _canFit(gx, gy, occupied, ngx, ngy) {
    for (const [ox, oy] of occupied) {
      const px = gx + ox;
      const py = gy + oy;
      
      if (px < 0 || py < 0 || px >= ngx || py >= ngy) return false;
      if (!this.grid[px][py]) return false;
    }
    return true;
  }

  /**
   * 그리드에 표시
   */
  _markGrid(gx, gy, occupied) {
    for (const [ox, oy] of occupied) {
      this.grid[gx + ox][gy + oy] = false;
    }
  }

  /**
   * Canvas에 단어 그리기
   */
  _drawWord(text, x, y, fontSize, color, rotation) {
    const { fontFamily, fontWeight } = this.options;
    const ctx = this.ctx;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation * Math.PI / 180);
    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    ctx.fillStyle = color;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.fillText(text, 0, 0);
    ctx.restore();
  }

  /**
   * 랜덤 색상
   */
  _getRandomColor() {
    const { colors } = this.options;
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // ==================== 이벤트 ====================

  _createTooltip() {
    this._tooltip = document.createElement('div');
    this._tooltip.className = 'wordcloud__tooltip';
    this._tooltip.style.cssText = `
      position: fixed;
      padding: 8px 12px;
      background: var(--bg-primary, #fff);
      border: 1px solid var(--border-color, #e5e7eb);
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      font-size: 13px;
      color: var(--text-primary, #1f2937);
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.2s;
      z-index: 1000;
    `;
    document.body.appendChild(this._tooltip);
  }

  _bindEvents() {
    if (!this.canvas) return;
    
    this._onClick = (e) => {
      const word = this._getWordAt(e);
      if (word && this.options.onClick) {
        this.options.onClick(word, e);
      }
    };
    
    this._onMouseMove = (e) => {
      const word = this._getWordAt(e);
      
      if (word) {
        this.canvas.style.cursor = 'pointer';
        
        if (this._tooltip) {
          this._tooltip.innerHTML = `<strong>${word.text}</strong><span style="color:var(--text-secondary);margin-left:8px;">가중치: ${word.weight}</span>`;
          this._tooltip.style.opacity = '1';
          this._tooltip.style.left = `${e.clientX + 10}px`;
          this._tooltip.style.top = `${e.clientY + 10}px`;
        }
      } else {
        this.canvas.style.cursor = 'default';
        if (this._tooltip) this._tooltip.style.opacity = '0';
      }
    };
    
    this.canvas.addEventListener('click', this._onClick);
    this.canvas.addEventListener('mousemove', this._onMouseMove);
  }

  /**
   * 좌표에 있는 단어 찾기
   */
  _getWordAt(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    for (const word of this.placedWords) {
      if (x >= word.x && x <= word.x + word.width &&
          y >= word.y && y <= word.y + word.height) {
        return word;
      }
    }
    return null;
  }

  // ==================== 공개 API ====================

  /**
   * 단어 업데이트
   */
  setWords(words) {
    this.options.words = words;
    this._render();
  }

  /**
   * 새로고침
   */
  refresh() {
    this._render();
  }

  /**
   * 이미지로 내보내기
   */
  toDataURL(type = 'image/png') {
    return this.canvas ? this.canvas.toDataURL(type) : '';
  }

  /**
   * 다운로드
   */
  download(filename = 'wordcloud.png') {
    const dataUrl = this.toDataURL();
    if (!dataUrl) return;
    
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
  }

  destroy() {
    if (this._onClick && this.canvas) {
      this.canvas.removeEventListener('click', this._onClick);
    }
    if (this._onMouseMove && this.canvas) {
      this.canvas.removeEventListener('mousemove', this._onMouseMove);
    }
    if (this._tooltip && this._tooltip.parentNode) {
      this._tooltip.parentNode.removeChild(this._tooltip);
    }
    
    WordCloud.instances.delete(this.container);
    
    if (this.container) {
      this.container.innerHTML = '';
      this.container.classList.remove('wordcloud');
    }
    
    this.container = null;
    this.canvas = null;
    this.ctx = null;
    this.grid = null;
    this.placedWords = null;
    this.maskData = null;
  }
}


// ============================================
// TagCloud - DOM 기반 태그 클라우드
// ============================================

/**
 * TagCloud 클래스
 * 인터랙티브 태그 UI (목적이 다름: 선택, 삭제, 필터링)
 */
class TagCloud {
  static instances = new Map();

  static defaults() {
    return {
      tags: [],                     // [{ text, count?, color?, href? }]
      variant: 'default',           // 'default', 'pill', 'outlined', 'gradient'
      size: 'md',                   // 'sm', 'md', 'lg'
      sizeByCount: false,
      showCount: false,
      removable: false,
      selectable: false,
      multiSelect: false,
      maxVisible: null,
      sortBy: null,                 // 'text', 'count'
      colors: ['#667eea', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6', '#ec4899'],
      animate: true,
      onClick: null,
      onRemove: null,
      onSelect: null,
    };
  }

  constructor(selector, options = {}) {
    this.container = typeof selector === 'string' 
      ? document.querySelector(selector) 
      : selector;
    
    if (!this.container) {
      console.error('TagCloud: Container not found');
      return;
    }

    this.options = { ...TagCloud.defaults(), ...options };
    this._tags = [];
    this._selectedTags = new Set();
    this._onClick = null;
    
    this.init();
    TagCloud.instances.set(this.container, this);
  }

  init() {
    this._processTags();
    this._render();
    this._bindEvents();
  }

  _processTags() {
    const { tags, colors, sortBy } = this.options;
    
    this._tags = tags.map((tag, i) => ({
      ...tag,
      color: tag.color || colors[i % colors.length],
      count: tag.count || 0
    }));
    
    if (sortBy) {
      this._tags.sort((a, b) => {
        if (sortBy === 'text') return a.text.localeCompare(b.text);
        if (sortBy === 'count') return b.count - a.count;
        return 0;
      });
    }
  }

  _render() {
    const { variant, size, sizeByCount, showCount, removable, selectable, maxVisible, animate } = this.options;
    
    this.container.className = `tagcloud tagcloud--${variant} tagcloud--${size}`;
    
    let visible = this._tags;
    let hidden = 0;
    
    if (maxVisible && this._tags.length > maxVisible) {
      visible = this._tags.slice(0, maxVisible);
      hidden = this._tags.length - maxVisible;
    }
    
    let minC = 0, maxC = 1, range = 1;
    if (sizeByCount && this._tags.length) {
      const counts = this._tags.map(t => t.count);
      minC = Math.min(...counts);
      maxC = Math.max(...counts);
      range = maxC - minC || 1;
    }
    
    const html = visible.map((tag, i) => {
      const selected = this._selectedTags.has(tag.text);
      let scale = 1;
      if (sizeByCount) {
        scale = 0.85 + ((tag.count - minC) / range) * 0.3;
      }
      
      return `
        <span class="tagcloud__tag ${selected ? 'is-selected' : ''}" 
              data-index="${i}" data-text="${tag.text}"
              style="${this._getStyle(tag, variant, scale)}; ${animate ? `animation-delay:${i * 30}ms` : ''}"
              ${selectable ? 'tabindex="0"' : ''}>
          <span class="tagcloud__text">${tag.text}</span>
          ${showCount && tag.count ? `<span class="tagcloud__count">${this._formatCount(tag.count)}</span>` : ''}
          ${removable ? `<button class="tagcloud__remove" type="button"><i class="material-icons-outlined">close</i></button>` : ''}
        </span>
      `;
    }).join('');
    
    const more = hidden > 0 ? `<span class="tagcloud__more" data-hidden="${hidden}">+${hidden} more</span>` : '';
    
    this.container.innerHTML = `<div class="tagcloud__list ${animate ? 'tagcloud--animate' : ''}">${html}${more}</div>`;
  }

  _getStyle(tag, variant, scale) {
    const c = tag.color;
    switch (variant) {
      case 'pill': return `background:${c};color:#fff;transform:scale(${scale})`;
      case 'outlined': return `border-color:${c};color:${c};transform:scale(${scale})`;
      case 'gradient': return `background:linear-gradient(135deg,${c} 0%,${this._darken(c)} 100%);color:#fff;transform:scale(${scale})`;
      default: return `background:${this._lighten(c)};color:${c};transform:scale(${scale})`;
    }
  }

  _lighten(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const f = 0.85;
    return `rgb(${Math.round(r + (255 - r) * f)},${Math.round(g + (255 - g) * f)},${Math.round(b + (255 - b) * f)})`;
  }

  _darken(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const f = 0.8;
    return `rgb(${Math.round(r * f)},${Math.round(g * f)},${Math.round(b * f)})`;
  }

  _formatCount(c) {
    if (c >= 1000000) return (c / 1000000).toFixed(1) + 'M';
    if (c >= 1000) return (c / 1000).toFixed(1) + 'K';
    return c.toString();
  }

  _bindEvents() {
    // 기존 리스너 제거 (재호출 시 중복 방지)
    this._unbindEvents();
    
    this._onClick = (e) => {
      const rm = e.target.closest('.tagcloud__remove');
      if (rm) {
        const el = rm.closest('.tagcloud__tag');
        const text = el.dataset.text;
        this._remove(text);
        if (this.options.onRemove) this.options.onRemove(this._tags.find(t => t.text === text), e);
        return;
      }
      
      const more = e.target.closest('.tagcloud__more');
      if (more) {
        this.options.maxVisible = null;
        this._render();
        this._bindEvents();
        return;
      }
      
      const tag = e.target.closest('.tagcloud__tag');
      if (!tag) return;
      
      const t = this._tags[parseInt(tag.dataset.index)];
      
      if (t.href) {
        window.location.href = t.href;
        return;
      }
      
      if (this.options.selectable) this._toggle(t.text, tag);
      if (this.options.onClick) this.options.onClick(t, e);
    };
    
    this.container.addEventListener('click', this._onClick);
  }

  _toggle(text, el) {
    const { multiSelect, onSelect } = this.options;
    
    if (this._selectedTags.has(text)) {
      this._selectedTags.delete(text);
      el.classList.remove('is-selected');
    } else {
      if (!multiSelect) {
        this._selectedTags.clear();
        this.container.querySelectorAll('.tagcloud__tag').forEach(e => e.classList.remove('is-selected'));
      }
      this._selectedTags.add(text);
      el.classList.add('is-selected');
    }
    
    if (onSelect) onSelect(this._tags.filter(t => this._selectedTags.has(t.text)));
  }

  _remove(text) {
    this._tags = this._tags.filter(t => t.text !== text);
    this.options.tags = this.options.tags.filter(t => t.text !== text);
    this._selectedTags.delete(text);
    this._render();
    this._bindEvents();
  }

  setTags(tags) {
    this.options.tags = tags;
    this._selectedTags.clear();
    this._processTags();
    this._render();
    this._bindEvents();
  }

  addTag(tag) {
    this.options.tags.push(tag);
    this._processTags();
    this._render();
    this._bindEvents();
  }

  removeTag(text) {
    this._remove(text);
  }

  getSelected() {
    return this._tags.filter(t => this._selectedTags.has(t.text));
  }

  clearSelection() {
    this._selectedTags.clear();
    this.container.querySelectorAll('.tagcloud__tag').forEach(e => e.classList.remove('is-selected'));
  }

  filter(query) {
    const q = query.toLowerCase();
    this.container.querySelectorAll('.tagcloud__tag').forEach(el => {
      el.style.display = el.dataset.text.toLowerCase().includes(q) ? '' : 'none';
    });
  }

  clearFilter() {
    this.container.querySelectorAll('.tagcloud__tag').forEach(el => {
      el.style.display = '';
    });
  }

  _unbindEvents() {
    if (this._onClick && this.container) {
      this.container.removeEventListener('click', this._onClick);
      this._onClick = null;
    }
  }

  destroy() {
    this._unbindEvents();
    TagCloud.instances.delete(this.container);
    if (this.container) {
      this.container.innerHTML = '';
      this.container.className = '';
    }
    this.container = null;
    this._tags = null;
    this._selectedTags = null;
  }
}


// ============================================
// Export
// ============================================

export { WordCloud, TagCloud };
export default { WordCloud, TagCloud };
