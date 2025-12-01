/**
 * Forms Module
 * FileUpload, Rating, SignaturePad, FormWizard 컴포넌트
 * @module modules/forms
 */

import { EventBus } from '../../core/event.js';

// ============================================
// FileUpload - 파일 업로드
// ============================================

class FileUpload {
  static defaults() {
    return {
      accept: '*/*',
      multiple: false,
      maxSize: 10 * 1024 * 1024, // 10MB
      maxFiles: 10,
      dropzone: true,
      preview: true,
      showProgress: false, // 업로드 진행률 표시
      dropzoneText: '파일을 드래그하거나 클릭하여 업로드',
      onChange: null,
      onRemove: null,
      onError: null,
      onUploadStart: null,
      onUploadProgress: null,
      onUploadComplete: null
    };
  }

  constructor(element, options = {}) {
    this.element = typeof element === 'string' ? document.querySelector(element) : element;
    if (!this.element) return;
    this.options = { ...FileUpload.defaults(), ...options };
    this.events = new EventBus();
    this.files = [];
    this._init();
  }

  _init() {
    this._createUI();
    this._bindEvents();
  }

  _createUI() {
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'file-upload';
    this.element.parentNode.insertBefore(this.wrapper, this.element);
    this.element.style.display = 'none';
    this.wrapper.appendChild(this.element);

    // Dropzone
    if (this.options.dropzone) {
      this.dropzone = document.createElement('div');
      this.dropzone.className = 'file-upload__dropzone';
      this.dropzone.innerHTML = `
        <i class="material-icons-outlined" style="font-size: 48px; color: var(--text-secondary); margin-bottom: 1rem;">cloud_upload</i>
        <p class="file-upload__text">${this.options.dropzoneText}</p>
        <p class="file-upload__hint">최대 ${this._formatSize(this.options.maxSize)}${this.options.multiple ? `, ${this.options.maxFiles}개 파일` : ''}</p>
      `;
      this.wrapper.appendChild(this.dropzone);
    }

    // Hidden input
    this.input = document.createElement('input');
    this.input.type = 'file';
    this.input.className = 'file-upload__input';
    this.input.accept = this.options.accept;
    this.input.multiple = this.options.multiple;
    this.wrapper.appendChild(this.input);

    // Preview container
    if (this.options.preview) {
      this.previewContainer = document.createElement('div');
      this.previewContainer.className = 'file-upload__preview';
      this.wrapper.appendChild(this.previewContainer);
    }
  }

  _bindEvents() {
    // 이벤트 핸들러 추적
    this._onInputChange = (e) => this._handleFiles(e.target.files);
    this.input.addEventListener('change', this._onInputChange);

    if (this.dropzone) {
      this._onDropzoneClick = () => this.input.click();
      this._onDragover = (e) => {
        e.preventDefault();
        this.dropzone.classList.add('is-dragover');
      };
      this._onDragleave = () => {
        this.dropzone.classList.remove('is-dragover');
      };
      this._onDrop = (e) => {
        e.preventDefault();
        this.dropzone.classList.remove('is-dragover');
        this._handleFiles(e.dataTransfer.files);
      };

      this.dropzone.addEventListener('click', this._onDropzoneClick);
      this.dropzone.addEventListener('dragover', this._onDragover);
      this.dropzone.addEventListener('dragleave', this._onDragleave);
      this.dropzone.addEventListener('drop', this._onDrop);
    }
  }

  _handleFiles(fileList) {
    const newFiles = Array.from(fileList);

    for (const file of newFiles) {
      // 파일 타입 체크
      if (!this._isValidFileType(file)) {
        this._emitError(`허용되지 않는 파일 형식입니다: ${file.name}`);
        continue;
      }

      // 크기 체크
      if (file.size > this.options.maxSize) {
        this._emitError(`파일 크기가 너무 큽니다: ${file.name}`);
        continue;
      }

      // 파일 수 체크
      if (this.files.length >= this.options.maxFiles) {
        this._emitError(`최대 ${this.options.maxFiles}개까지 업로드 가능합니다`);
        break;
      }

      this.files.push(file);
      if (this.options.preview) this._addPreview(file);
    }

    this.input.value = '';
    this.options.onChange?.(this.files);
    this.events.emit('change', this.files);
  }

  _isValidFileType(file) {
    const accept = this.options.accept;
    if (accept === '*/*' || !accept) return true;

    const acceptList = accept.split(',').map(t => t.trim().toLowerCase());
    const fileType = file.type.toLowerCase();
    const fileExt = '.' + file.name.split('.').pop().toLowerCase();

    for (const pattern of acceptList) {
      // MIME 타입 와일드카드 (예: image/*)
      if (pattern.endsWith('/*')) {
        const category = pattern.replace('/*', '');
        if (fileType.startsWith(category + '/')) return true;
      }
      // 확장자 (예: .pdf, .doc)
      else if (pattern.startsWith('.')) {
        if (fileExt === pattern) return true;
      }
      // 정확한 MIME 타입 (예: application/pdf)
      else if (fileType === pattern) {
        return true;
      }
    }
    return false;
  }

  _addPreview(file) {
    const item = document.createElement('div');
    item.className = 'file-upload__item';
    item.dataset.fileName = file.name;

    const isImage = file.type.startsWith('image/');
    const progressHtml = this.options.showProgress ?
      '<div class="file-upload__progress"><div class="file-upload__progress-bar" style="width: 0%"></div></div>' : '';

    const bindRemoveEvent = () => {
      const removeBtn = item.querySelector('.file-upload__remove');
      if (removeBtn) {
        removeBtn.addEventListener('click', () => {
          this._removeFile(file.name);
          item.remove();
        });
      }
    };

    if (isImage) {
      const reader = new FileReader();
      reader.onload = (e) => {
        item.innerHTML = `
          <div class="file-upload__thumb" style="background-image: url(${e.target.result})"></div>
          <div class="file-upload__info">
            <span class="file-upload__name">${file.name}</span>
            <span class="file-upload__size">${this._formatSize(file.size)}</span>
            ${progressHtml}
          </div>
          <button type="button" class="file-upload__remove" data-name="${file.name}">&times;</button>
        `;
        bindRemoveEvent();
      };
      reader.readAsDataURL(file);
    } else {
      item.innerHTML = `
        <div class="file-upload__icon"><i class="material-icons-outlined">description</i></div>
        <div class="file-upload__info">
          <span class="file-upload__name">${file.name}</span>
          <span class="file-upload__size">${this._formatSize(file.size)}</span>
          ${progressHtml}
        </div>
        <button type="button" class="file-upload__remove" data-name="${file.name}">&times;</button>
      `;
      bindRemoveEvent();
    }

    this.previewContainer.appendChild(item);
  }

  // 업로드 진행률 업데이트
  setProgress(fileName, percent) {
    const item = this.previewContainer?.querySelector(`[data-file-name="${fileName}"]`);
    if (item) {
      const progressBar = item.querySelector('.file-upload__progress-bar');
      if (progressBar) {
        progressBar.style.width = `${Math.min(100, Math.max(0, percent))}%`;
      }
      if (percent >= 100) {
        item.classList.add('is-complete');
      }
    }
  }

  // 업로드 시뮬레이션
  async simulateUpload(duration = 2000) {
    this.options.onUploadStart?.(this.files);
    this.events.emit('uploadStart', this.files);

    for (const file of this.files) {
      const steps = 20;
      const stepDuration = duration / steps;

      for (let i = 1; i <= steps; i++) {
        await new Promise(r => setTimeout(r, stepDuration));
        const percent = (i / steps) * 100;
        this.setProgress(file.name, percent);
        this.options.onUploadProgress?.(file, percent);
        this.events.emit('uploadProgress', { file, percent });
      }
    }

    this.options.onUploadComplete?.(this.files);
    this.events.emit('uploadComplete', this.files);
  }

  _removeFile(name) {
    this.files = this.files.filter(f => f.name !== name);
    this.options.onRemove?.(name);
    this.options.onChange?.(this.files);
    this.events.emit('change', this.files);
  }

  _emitError(message) {
    this.options.onError?.(message);
    this.events.emit('error', message);
  }

  _formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  getFiles() { return [...this.files]; }

  clear() {
    this.files = [];
    if (this.previewContainer) this.previewContainer.innerHTML = '';
    this.options.onChange?.(this.files);
  }

  destroy() {
    // 이벤트 리스너 제거
    if (this._onInputChange) this.input.removeEventListener('change', this._onInputChange);
    if (this.dropzone) {
      if (this._onDropzoneClick) this.dropzone.removeEventListener('click', this._onDropzoneClick);
      if (this._onDragover) this.dropzone.removeEventListener('dragover', this._onDragover);
      if (this._onDragleave) this.dropzone.removeEventListener('dragleave', this._onDragleave);
      if (this._onDrop) this.dropzone.removeEventListener('drop', this._onDrop);
    }
    if (this.events) this.events.clear();

    // DOM 정리
    this.element.style.display = '';
    this.wrapper.parentNode.insertBefore(this.element, this.wrapper);
    this.wrapper.remove();

    // 참조 해제
    this.element = null;
    this.wrapper = null;
    this.dropzone = null;
    this.input = null;
    this.previewContainer = null;
    this.files = [];
  }
}

// ============================================
// Rating - 별점 입력
// ============================================

class Rating {
  static defaults() {
    return {
      max: 5,
      value: 0,
      readonly: false,
      icon: 'star',
      iconEmpty: 'star_border',
      size: 'md', // sm, md, lg
      color: '#f59e0b',
      onChange: null
    };
  }

  constructor(element, options = {}) {
    this.element = typeof element === 'string' ? document.querySelector(element) : element;
    if (!this.element) return;
    this.options = { ...Rating.defaults(), ...options };
    this.events = new EventBus();
    this.value = this.options.value;
    this._init();
  }

  _init() {
    this.element.classList.add('rating', `rating--${this.options.size}`);
    if (this.options.readonly) this.element.classList.add('rating--readonly');
    this._render();
    this._bindEvents();
  }

  _render() {
    let html = '';
    for (let i = 1; i <= this.options.max; i++) {
      const icon = i <= this.value ? this.options.icon : this.options.iconEmpty;
      const filled = i <= this.value ? 'is-filled' : '';
      html += `<span class="rating__star ${filled}" data-value="${i}" style="color: ${this.options.color}"><i class="material-icons-outlined">${icon}</i></span>`;
    }
    this.element.innerHTML = html;
  }

  _bindEvents() {
    if (this.options.readonly) return;

    // 이벤트 핸들러 추적
    this._onClick = (e) => {
      const star = e.target.closest('.rating__star');
      if (star) {
        this.setValue(parseInt(star.dataset.value));
      }
    };
    this._onMouseover = (e) => {
      const star = e.target.closest('.rating__star');
      if (star) {
        this._highlight(parseInt(star.dataset.value));
      }
    };
    this._onMouseout = () => {
      this._render();
    };

    this.element.addEventListener('click', this._onClick);
    this.element.addEventListener('mouseover', this._onMouseover);
    this.element.addEventListener('mouseout', this._onMouseout);
  }

  _highlight(value) {
    const stars = this.element.querySelectorAll('.rating__star');
    stars.forEach((star, index) => {
      const icon = index < value ? this.options.icon : this.options.iconEmpty;
      star.querySelector('i').textContent = icon;
      star.classList.toggle('is-filled', index < value);
    });
  }

  getValue() { return this.value; }

  setValue(value) {
    this.value = Math.max(0, Math.min(this.options.max, value));
    this._render();
    this.options.onChange?.(this.value);
    this.events.emit('change', this.value);
  }

  destroy() {
    // 이벤트 리스너 제거
    if (!this.options.readonly) {
      if (this._onClick) this.element.removeEventListener('click', this._onClick);
      if (this._onMouseover) this.element.removeEventListener('mouseover', this._onMouseover);
      if (this._onMouseout) this.element.removeEventListener('mouseout', this._onMouseout);
    }
    if (this.events) this.events.clear();

    // DOM 정리
    this.element.innerHTML = '';
    this.element.classList.remove('rating', `rating--${this.options.size}`, 'rating--readonly');

    // 참조 해제
    this.element = null;
  }
}

// ============================================
// SignaturePad - 서명 패드
// ============================================

class SignaturePad {
  static defaults() {
    return {
      width: 400,
      height: 200,
      backgroundColor: '#ffffff',
      penColor: '#000000',
      penWidth: 2,
      onBegin: null,
      onEnd: null
    };
  }

  constructor(element, options = {}) {
    this.element = typeof element === 'string' ? document.querySelector(element) : element;
    if (!this.element) return;
    this.options = { ...SignaturePad.defaults(), ...options };
    this.events = new EventBus();
    this.isDrawing = false;
    this.points = [];
    this._init();
  }

  _init() {
    this._createUI();
    this._bindEvents();
    this.clear();
  }

  _createUI() {
    this.element.classList.add('signature-pad');

    this.canvas = document.createElement('canvas');
    this.canvas.className = 'signature-pad__canvas';
    this.canvas.width = this.options.width;
    this.canvas.height = this.options.height;
    this.element.appendChild(this.canvas);

    this.ctx = this.canvas.getContext('2d');
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    // Toolbar
    this.toolbar = document.createElement('div');
    this.toolbar.className = 'signature-pad__toolbar';
    this.toolbar.innerHTML = `
      <button type="button" class="signature-pad__btn" data-action="clear"><i class="material-icons-outlined">delete</i> 지우기</button>
      <button type="button" class="signature-pad__btn signature-pad__btn--primary" data-action="save"><i class="material-icons-outlined">save</i> 저장</button>
    `;
    this.element.appendChild(this.toolbar);

    this.toolbar.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      if (btn.dataset.action === 'clear') this.clear();
      if (btn.dataset.action === 'save') this._save();
    });
  }

  _bindEvents() {
    // 이벤트 핸들러 추적 - Mouse events
    this._onMouseDown = (e) => this._startDrawing(e);
    this._onMouseMove = (e) => this._draw(e);
    this._onMouseUp = () => this._stopDrawing();
    this._onMouseLeave = () => this._stopDrawing();

    this.canvas.addEventListener('mousedown', this._onMouseDown);
    this.canvas.addEventListener('mousemove', this._onMouseMove);
    this.canvas.addEventListener('mouseup', this._onMouseUp);
    this.canvas.addEventListener('mouseleave', this._onMouseLeave);

    // Touch events
    this._onTouchStart = (e) => {
      e.preventDefault();
      this._startDrawing(e.touches[0]);
    };
    this._onTouchMove = (e) => {
      e.preventDefault();
      this._draw(e.touches[0]);
    };
    this._onTouchEnd = () => this._stopDrawing();

    this.canvas.addEventListener('touchstart', this._onTouchStart, { passive: false });
    this.canvas.addEventListener('touchmove', this._onTouchMove, { passive: false });
    this.canvas.addEventListener('touchend', this._onTouchEnd);
  }

  _getPosition(e) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  _startDrawing(e) {
    this.isDrawing = true;
    const pos = this._getPosition(e);
    this.points = [pos];
    this.ctx.beginPath();
    this.ctx.moveTo(pos.x, pos.y);
    this.options.onBegin?.();
    this.events.emit('begin');
  }

  _draw(e) {
    if (!this.isDrawing) return;
    const pos = this._getPosition(e);
    this.points.push(pos);

    this.ctx.strokeStyle = this.options.penColor;
    this.ctx.lineWidth = this.options.penWidth;
    this.ctx.lineTo(pos.x, pos.y);
    this.ctx.stroke();
  }

  _stopDrawing() {
    if (this.isDrawing) {
      this.isDrawing = false;
      this.options.onEnd?.();
      this.events.emit('end');
    }
  }

  _save() {
    const dataUrl = this.canvas.toDataURL('image/png');
    this.events.emit('save', dataUrl);
    return dataUrl;
  }

  clear() {
    this.ctx.fillStyle = this.options.backgroundColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.points = [];
    this.events.emit('clear');
  }

  isEmpty() {
    return this.points.length === 0;
  }

  toDataURL(type = 'image/png') {
    return this.canvas.toDataURL(type);
  }

  destroy() {
    // 이벤트 리스너 제거
    if (this.canvas) {
      if (this._onMouseDown) this.canvas.removeEventListener('mousedown', this._onMouseDown);
      if (this._onMouseMove) this.canvas.removeEventListener('mousemove', this._onMouseMove);
      if (this._onMouseUp) this.canvas.removeEventListener('mouseup', this._onMouseUp);
      if (this._onMouseLeave) this.canvas.removeEventListener('mouseleave', this._onMouseLeave);
      if (this._onTouchStart) this.canvas.removeEventListener('touchstart', this._onTouchStart);
      if (this._onTouchMove) this.canvas.removeEventListener('touchmove', this._onTouchMove);
      if (this._onTouchEnd) this.canvas.removeEventListener('touchend', this._onTouchEnd);
    }
    if (this.events) this.events.clear();

    // DOM 정리
    this.element.innerHTML = '';
    this.element.classList.remove('signature-pad');

    // 참조 해제
    this.element = null;
    this.canvas = null;
    this.ctx = null;
    this.toolbar = null;
    this.points = [];
  }
}

// ============================================
// FormWizard - 단계별 폼
// ============================================

class FormWizard {
  static defaults() {
    return {
      steps: [], // { title, content, validate? }
      startStep: 0,
      showProgress: true,
      showNavigation: true,
      prevText: '이전',
      nextText: '다음',
      submitText: '완료',
      onStepChange: null,
      onComplete: null,
      onValidationError: null
    };
  }

  constructor(element, options = {}) {
    this.element = typeof element === 'string' ? document.querySelector(element) : element;
    if (!this.element) return;
    this.options = { ...FormWizard.defaults(), ...options };
    this.events = new EventBus();
    this.currentStep = this.options.startStep;
    this._init();
  }

  _init() {
    this.element.classList.add('form-wizard');
    this._createUI();
    this._bindEvents();
  }

  _createUI() {
    let html = '';

    // Progress
    if (this.options.showProgress) {
      html += '<div class="form-wizard__progress">';
      this.options.steps.forEach((step, index) => {
        html += `
          <div class="form-wizard__step" data-step="${index}">
            <div class="form-wizard__step-number">${index + 1}</div>
            <div class="form-wizard__step-title">${step.title}</div>
          </div>
        `;
      });
      html += '</div>';
    }

    // Content - 모든 패널 미리 생성
    html += '<div class="form-wizard__content">';
    this.options.steps.forEach((step, index) => {
      html += `<div class="form-wizard__panel" data-panel="${index}">${step.content}</div>`;
    });
    html += '</div>';

    // Navigation
    if (this.options.showNavigation) {
      html += `
        <div class="form-wizard__nav">
          <button type="button" class="form-wizard__btn form-wizard__btn--prev" data-action="prev">
            ${this.options.prevText}
          </button>
          <button type="button" class="form-wizard__btn form-wizard__btn--next form-wizard__btn--primary" data-action="next">
            ${this.options.nextText}
          </button>
        </div>
      `;
    }

    this.element.innerHTML = html;
    this._updateUI();
  }

  _updateUI() {
    // Progress 업데이트
    const steps = this.element.querySelectorAll('.form-wizard__step');
    steps.forEach((step, index) => {
      step.classList.remove('active', 'completed');
      if (index < this.currentStep) step.classList.add('completed');
      if (index === this.currentStep) step.classList.add('active');
    });

    // Panel 업데이트
    const panels = this.element.querySelectorAll('.form-wizard__panel');
    panels.forEach((panel, index) => {
      panel.classList.toggle('is-active', index === this.currentStep);
    });

    // Navigation 업데이트
    const prevBtn = this.element.querySelector('[data-action="prev"]');
    const nextBtn = this.element.querySelector('[data-action="next"], [data-action="submit"]');

    if (prevBtn) {
      prevBtn.disabled = this.currentStep === 0;
    }

    if (nextBtn) {
      const isLast = this.currentStep === this.options.steps.length - 1;
      nextBtn.dataset.action = isLast ? 'submit' : 'next';
      nextBtn.textContent = isLast ? this.options.submitText : this.options.nextText;
    }
  }

  _bindEvents() {
    // 이벤트 핸들러 추적
    this._onClick = (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;

      if (btn.dataset.action === 'prev') this.prev();
      if (btn.dataset.action === 'next') this.next();
      if (btn.dataset.action === 'submit') this._submit();
    };

    this.element.addEventListener('click', this._onClick);
  }

  async _validateCurrentStep() {
    const step = this.options.steps[this.currentStep];
    if (step.validate) {
      const result = await step.validate();
      if (!result) {
        this.options.onValidationError?.(this.currentStep);
        this.events.emit('validationError', this.currentStep);
        return false;
      }
    }
    return true;
  }

  async next() {
    if (this.currentStep >= this.options.steps.length - 1) return;

    const isValid = await this._validateCurrentStep();
    if (!isValid) return;

    this.currentStep++;
    this._updateUI();
    this.options.onStepChange?.(this.currentStep);
    this.events.emit('stepChange', this.currentStep);
  }

  prev() {
    if (this.currentStep <= 0) return;
    this.currentStep--;
    this._updateUI();
    this.options.onStepChange?.(this.currentStep);
    this.events.emit('stepChange', this.currentStep);
  }

  async _submit() {
    const isValid = await this._validateCurrentStep();
    if (!isValid) return;

    // Collect form data from all panels
    const data = {};
    const panels = this.element.querySelectorAll('.form-wizard__panel');
    panels.forEach(panel => {
      const inputs = panel.querySelectorAll('input, select, textarea');
      inputs.forEach(input => {
        if (input.name) {
          if (input.type === 'checkbox') {
            data[input.name] = input.checked;
          } else if (input.type === 'radio') {
            if (input.checked) data[input.name] = input.value;
          } else {
            data[input.name] = input.value;
          }
        }
      });
    });

    this.options.onComplete?.(data);
    this.events.emit('complete', data);
  }

  goToStep(index) {
    if (index < 0 || index >= this.options.steps.length) return;
    this.currentStep = index;
    this._updateUI();
    this.options.onStepChange?.(this.currentStep);
  }

  getCurrentStep() { return this.currentStep; }

  destroy() {
    // 이벤트 리스너 제거
    if (this._onClick) this.element.removeEventListener('click', this._onClick);
    if (this.events) this.events.clear();

    // DOM 정리
    this.element.innerHTML = '';
    this.element.classList.remove('form-wizard');

    // 참조 해제
    this.element = null;
  }
}

// ============================================
// Export
// ============================================

export { FileUpload, Rating, SignaturePad, FormWizard };
export default { FileUpload, Rating, SignaturePad, FormWizard };
