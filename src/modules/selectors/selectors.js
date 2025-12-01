/**
 * Selectors Module
 * Autocomplete, MultiSelect, RangeSlider 컴포넌트
 * @module modules/selectors
 */

import { EventBus } from '../../core/event.js';

// ============================================
// Autocomplete - 자동완성
// ============================================

class Autocomplete {
  static defaults() {
    return {
      source: [], // 배열 또는 async 함수
      minLength: 1,
      delay: 300,
      maxResults: 10,
      highlight: true,
      placeholder: '검색...',
      noResultsText: '검색 결과가 없습니다',
      onSelect: null,
      onChange: null,
      renderItem: null // 커스텀 렌더링 함수
    };
  }

  constructor(element, options = {}) {
    this.element = typeof element === 'string' ? document.querySelector(element) : element;
    if (!this.element) return;
    this.options = { ...Autocomplete.defaults(), ...options };
    this.events = new EventBus();
    this.isOpen = false;
    this.selectedIndex = -1;
    this.results = [];
    this.debounceTimer = null;
    this._init();
  }

  _init() {
    this._createWrapper();
    this._bindEvents();
  }

  _createWrapper() {
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'autocomplete';
    this.element.parentNode.insertBefore(this.wrapper, this.element);
    this.wrapper.appendChild(this.element);
    this.element.classList.add('autocomplete__input');
    this.element.setAttribute('autocomplete', 'off');
    this.element.placeholder = this.options.placeholder;

    this.dropdown = document.createElement('div');
    this.dropdown.className = 'autocomplete__dropdown';
    this.wrapper.appendChild(this.dropdown);
  }

  _bindEvents() {
    // 이벤트 핸들러 추적
    this._onInput = () => this._handleInput();
    this._onFocus = () => { if (this.results.length) this._open(); };
    this._onKeydown = (e) => this._handleKeydown(e);
    this._outside = (e) => { if (!this.wrapper.contains(e.target)) this._close(); };

    this.element.addEventListener('input', this._onInput);
    this.element.addEventListener('focus', this._onFocus);
    this.element.addEventListener('keydown', this._onKeydown);
    document.addEventListener('click', this._outside);
  }

  _handleInput() {
    const query = this.element.value.trim();

    if (query.length < this.options.minLength) {
      this._close();
      return;
    }

    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => this._search(query), this.options.delay);
  }

  async _search(query) {
    let results;

    if (typeof this.options.source === 'function') {
      this.wrapper.classList.add('is-loading');
      try {
        results = await this.options.source(query);
      } catch (e) {
        results = [];
      }
      this.wrapper.classList.remove('is-loading');
    } else {
      const lowerQuery = query.toLowerCase();
      results = this.options.source.filter(item => {
        const text = typeof item === 'string' ? item : item.label || item.text || '';
        return text.toLowerCase().includes(lowerQuery);
      });
    }

    this.results = results.slice(0, this.options.maxResults);
    this._renderResults(query);
  }

  _renderResults(query) {
    if (!this.results.length) {
      this.dropdown.innerHTML = `<div class="autocomplete__no-results">${this.options.noResultsText}</div>`;
      this._open();
      return;
    }

    const html = this.results.map((item, index) => {
      const text = typeof item === 'string' ? item : item.label || item.text || '';
      const highlighted = this.options.highlight ? this._highlight(text, query) : text;

      if (this.options.renderItem) {
        return `<div class="autocomplete__item" data-index="${index}">${this.options.renderItem(item, highlighted)}</div>`;
      }

      return `<div class="autocomplete__item" data-index="${index}">${highlighted}</div>`;
    }).join('');

    this.dropdown.innerHTML = html;
    this.selectedIndex = -1;
    this._open();

    // 클릭 이벤트
    this.dropdown.querySelectorAll('.autocomplete__item').forEach(item => {
      item.addEventListener('click', () => {
        const idx = parseInt(item.dataset.index);
        this._selectItem(idx);
      });
    });
  }

  _highlight(text, query) {
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  _handleKeydown(e) {
    if (!this.isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this._moveSelection(1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        this._moveSelection(-1);
        break;
      case 'Enter':
        e.preventDefault();
        if (this.selectedIndex >= 0) this._selectItem(this.selectedIndex);
        break;
      case 'Escape':
        this._close();
        break;
    }
  }

  _moveSelection(delta) {
    const items = this.dropdown.querySelectorAll('.autocomplete__item');
    if (!items.length) return;

    items.forEach(item => item.classList.remove('is-selected'));
    this.selectedIndex = Math.max(0, Math.min(items.length - 1, this.selectedIndex + delta));
    items[this.selectedIndex].classList.add('is-selected');
    items[this.selectedIndex].scrollIntoView({ block: 'nearest' });
  }

  _selectItem(index) {
    const item = this.results[index];
    const text = typeof item === 'string' ? item : item.label || item.text || '';
    this.element.value = text;
    this._close();
    this.options.onSelect?.(item);
    this.events.emit('select', item);
  }

  _open() {
    this.isOpen = true;
    this.dropdown.classList.add('is-open');
  }

  _close() {
    this.isOpen = false;
    this.dropdown.classList.remove('is-open');
    this.selectedIndex = -1;
  }

  setValue(value) {
    this.element.value = value;
  }

  getValue() {
    return this.element.value;
  }

  clear() {
    this.element.value = '';
    this.results = [];
    this._close();
  }

  destroy() {
    clearTimeout(this.debounceTimer);

    // 이벤트 리스너 제거
    if (this._onInput) this.element.removeEventListener('input', this._onInput);
    if (this._onFocus) this.element.removeEventListener('focus', this._onFocus);
    if (this._onKeydown) this.element.removeEventListener('keydown', this._onKeydown);
    document.removeEventListener('click', this._outside);
    if (this.events) this.events.clear();

    // DOM 정리
    this.wrapper.parentNode.insertBefore(this.element, this.wrapper);
    this.wrapper.remove();

    // 참조 해제
    this.element = null;
    this.wrapper = null;
    this.dropdown = null;
    this.results = [];
  }
}

// ============================================
// MultiSelect - 다중 선택
// ============================================

class MultiSelect {
  static defaults() {
    return {
      options: [], // { value, label }
      selected: [],
      maxItems: null,
      placeholder: '선택...',
      searchable: true,
      searchPlaceholder: '검색...',
      allowCreate: false,
      onChange: null
    };
  }

  constructor(element, options = {}) {
    this.element = typeof element === 'string' ? document.querySelector(element) : element;
    if (!this.element) return;
    this.options = { ...MultiSelect.defaults(), ...options };
    this.events = new EventBus();
    this.selectedValues = [...this.options.selected];
    this.isOpen = false;
    this._init();
  }

  _init() {
    this._createWrapper();
    this._renderTags();
    this._renderDropdown();
    this._bindEvents();
  }

  _createWrapper() {
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'multiselect';
    this.element.parentNode.insertBefore(this.wrapper, this.element);
    this.element.style.display = 'none';
    this.wrapper.appendChild(this.element);

    this.tagsContainer = document.createElement('div');
    this.tagsContainer.className = 'multiselect__tags';
    this.wrapper.appendChild(this.tagsContainer);

    this.dropdown = document.createElement('div');
    this.dropdown.className = 'multiselect__dropdown';
    this.wrapper.appendChild(this.dropdown);
  }

  _renderTags() {
    const tagsHtml = this.selectedValues.map(val => {
      const opt = this.options.options.find(o => o.value === val);
      const label = opt ? opt.label : val;
      return `<span class="multiselect__tag" data-value="${val}">${label}<button type="button" class="multiselect__tag-remove" data-value="${val}">&times;</button></span>`;
    }).join('');

    const inputHtml = `<input type="text" class="multiselect__input" placeholder="${this.selectedValues.length ? '' : this.options.placeholder}">`;

    this.tagsContainer.innerHTML = tagsHtml + inputHtml;
    this.searchInput = this.tagsContainer.querySelector('.multiselect__input');
  }

  _renderDropdown(filter = '') {
    const lowerFilter = filter.toLowerCase();
    const availableOptions = this.options.options.filter(opt =>
      !this.selectedValues.includes(opt.value) &&
      (!filter || opt.label.toLowerCase().includes(lowerFilter))
    );

    if (!availableOptions.length) {
      if (this.options.allowCreate && filter) {
        this.dropdown.innerHTML = `<div class="multiselect__option multiselect__option--create" data-value="${filter}">+ "${filter}" 추가</div>`;
      } else {
        this.dropdown.innerHTML = '<div class="multiselect__no-options">선택 가능한 옵션이 없습니다</div>';
      }
    } else {
      this.dropdown.innerHTML = availableOptions.map(opt =>
        `<div class="multiselect__option" data-value="${opt.value}">${opt.label}</div>`
      ).join('');
    }

    // 클릭 이벤트
    this.dropdown.querySelectorAll('.multiselect__option').forEach(item => {
      item.addEventListener('click', () => this._addValue(item.dataset.value));
    });
  }

  _bindEvents() {
    // 이벤트 핸들러 추적
    this._onTagsClick = (e) => {
      if (e.target.classList.contains('multiselect__tag-remove')) {
        this._removeValue(e.target.dataset.value);
      } else {
        this._open();
        this.searchInput.focus();
      }
    };
    this._onSearchInput = () => {
      this._renderDropdown(this.searchInput.value);
      if (!this.isOpen) this._open();
    };
    this._onSearchKeydown = (e) => {
      if (e.key === 'Backspace' && !this.searchInput.value && this.selectedValues.length) {
        this._removeValue(this.selectedValues[this.selectedValues.length - 1]);
      }
      if (e.key === 'Escape') this._close();
    };
    this._outside = (e) => { if (!this.wrapper.contains(e.target)) this._close(); };

    this.tagsContainer.addEventListener('click', this._onTagsClick);
    this.searchInput.addEventListener('input', this._onSearchInput);
    this.searchInput.addEventListener('keydown', this._onSearchKeydown);
    document.addEventListener('click', this._outside);
  }

  _addValue(value) {
    if (this.options.maxItems && this.selectedValues.length >= this.options.maxItems) return;

    // allowCreate인 경우 새 옵션 추가
    if (!this.options.options.find(o => o.value === value)) {
      this.options.options.push({ value, label: value });
    }

    this.selectedValues.push(value);
    this._update();
  }

  _removeValue(value) {
    this.selectedValues = this.selectedValues.filter(v => v !== value);
    this._update();
  }

  _update() {
    this._renderTags();
    this._renderDropdown();
    this.searchInput.value = '';
    this.searchInput.focus();
    this.options.onChange?.(this.selectedValues);
    this.events.emit('change', this.selectedValues);
  }

  _open() {
    this.isOpen = true;
    this.wrapper.classList.add('is-open');
    this.dropdown.classList.add('is-open');
    this._renderDropdown();
  }

  _close() {
    this.isOpen = false;
    this.wrapper.classList.remove('is-open');
    this.dropdown.classList.remove('is-open');
  }

  getValue() {
    return [...this.selectedValues];
  }

  setValue(values) {
    this.selectedValues = [...values];
    this._renderTags();
    this.options.onChange?.(this.selectedValues);
  }

  clear() {
    this.selectedValues = [];
    this._update();
  }

  destroy() {
    // 이벤트 리스너 제거
    if (this._onTagsClick) this.tagsContainer.removeEventListener('click', this._onTagsClick);
    if (this._onSearchInput && this.searchInput) this.searchInput.removeEventListener('input', this._onSearchInput);
    if (this._onSearchKeydown && this.searchInput) this.searchInput.removeEventListener('keydown', this._onSearchKeydown);
    document.removeEventListener('click', this._outside);
    if (this.events) this.events.clear();

    // DOM 정리
    this.element.style.display = '';
    this.wrapper.parentNode.insertBefore(this.element, this.wrapper);
    this.wrapper.remove();

    // 참조 해제
    this.element = null;
    this.wrapper = null;
    this.dropdown = null;
    this.tagsContainer = null;
    this.searchInput = null;
    this.selectedValues = [];
  }
}

// ============================================
// RangeSlider - 범위 선택
// ============================================

class RangeSlider {
  static defaults() {
    return {
      min: 0,
      max: 100,
      step: 1,
      value: [25, 75], // [min, max] 또는 단일 값
      range: true, // true: 범위, false: 단일
      showTooltip: true,
      showLabels: true,
      formatValue: (v) => v,
      onChange: null,
      onDragEnd: null
    };
  }

  constructor(element, options = {}) {
    this.element = typeof element === 'string' ? document.querySelector(element) : element;
    if (!this.element) return;
    this.options = { ...RangeSlider.defaults(), ...options };
    this.events = new EventBus();
    this.isDragging = false;
    this.activeHandle = null;
    this._init();
  }

  _init() {
    this._normalizeValue();
    this._createSlider();
    this._bindEvents();
    this._updateUI();
  }

  _normalizeValue() {
    if (this.options.range) {
      this.value = Array.isArray(this.options.value) ? [...this.options.value] : [this.options.min, this.options.value];
    } else {
      this.value = Array.isArray(this.options.value) ? this.options.value[0] : this.options.value;
    }
  }

  _createSlider() {
    this.element.classList.add('range-slider');

    let html = `
      <div class="range-slider__track">
        <div class="range-slider__fill"></div>
      </div>
    `;

    if (this.options.range) {
      html += `
        <div class="range-slider__handle range-slider__handle--min" data-handle="min">
          ${this.options.showTooltip ? '<span class="range-slider__tooltip"></span>' : ''}
        </div>
        <div class="range-slider__handle range-slider__handle--max" data-handle="max">
          ${this.options.showTooltip ? '<span class="range-slider__tooltip"></span>' : ''}
        </div>
      `;
    } else {
      html += `
        <div class="range-slider__handle" data-handle="single">
          ${this.options.showTooltip ? '<span class="range-slider__tooltip"></span>' : ''}
        </div>
      `;
    }

    if (this.options.showLabels) {
      html += `
        <div class="range-slider__labels">
          <span class="range-slider__label--min">${this.options.formatValue(this.options.min)}</span>
          <span class="range-slider__label--max">${this.options.formatValue(this.options.max)}</span>
        </div>
      `;
    }

    this.element.innerHTML = html;

    this.track = this.element.querySelector('.range-slider__track');
    this.fill = this.element.querySelector('.range-slider__fill');
    this.handles = this.element.querySelectorAll('.range-slider__handle');
  }

  _bindEvents() {
    // 핸들 이벤트 핸들러 추적
    this._handleEvents = [];
    this.handles.forEach(handle => {
      const onMouseDown = (e) => this._startDrag(e, handle);
      const onTouchStart = (e) => this._startDrag(e, handle);
      handle.addEventListener('mousedown', onMouseDown);
      handle.addEventListener('touchstart', onTouchStart, { passive: false });
      this._handleEvents.push({ handle, onMouseDown, onTouchStart });
    });

    this._onTrackClick = (e) => this._handleTrackClick(e);
    this.track.addEventListener('click', this._onTrackClick);

    this._onMove = (e) => this._drag(e);
    this._onEnd = () => this._endDrag();
  }

  _startDrag(e, handle) {
    e.preventDefault();
    this.isDragging = true;
    this.activeHandle = handle.dataset.handle;
    this.element.classList.add('is-dragging');

    document.addEventListener('mousemove', this._onMove);
    document.addEventListener('mouseup', this._onEnd);
    document.addEventListener('touchmove', this._onMove, { passive: false });
    document.addEventListener('touchend', this._onEnd);
  }

  _drag(e) {
    if (!this.isDragging) return;
    e.preventDefault();

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const rect = this.track.getBoundingClientRect();
    let percent = (clientX - rect.left) / rect.width;
    percent = Math.max(0, Math.min(1, percent));

    const newValue = this._percentToValue(percent);
    this._setValue(this.activeHandle, newValue);
  }

  _endDrag() {
    if (!this.isDragging) return;
    this.isDragging = false;
    this.activeHandle = null;
    this.element.classList.remove('is-dragging');

    document.removeEventListener('mousemove', this._onMove);
    document.removeEventListener('mouseup', this._onEnd);
    document.removeEventListener('touchmove', this._onMove);
    document.removeEventListener('touchend', this._onEnd);

    this.options.onDragEnd?.(this.getValue());
    this.events.emit('dragend', this.getValue());
  }

  _handleTrackClick(e) {
    if (this.isDragging) return;

    const rect = this.track.getBoundingClientRect();
    let percent = (e.clientX - rect.left) / rect.width;
    percent = Math.max(0, Math.min(1, percent));

    const newValue = this._percentToValue(percent);

    if (this.options.range) {
      // 가까운 핸들 선택
      const distMin = Math.abs(newValue - this.value[0]);
      const distMax = Math.abs(newValue - this.value[1]);
      this._setValue(distMin < distMax ? 'min' : 'max', newValue);
    } else {
      this._setValue('single', newValue);
    }
  }

  _setValue(handle, newValue) {
    // step에 맞춰 조정
    newValue = Math.round(newValue / this.options.step) * this.options.step;
    newValue = Math.max(this.options.min, Math.min(this.options.max, newValue));

    if (this.options.range) {
      if (handle === 'min') {
        this.value[0] = Math.min(newValue, this.value[1]);
      } else {
        this.value[1] = Math.max(newValue, this.value[0]);
      }
    } else {
      this.value = newValue;
    }

    this._updateUI();
    this.options.onChange?.(this.getValue());
    this.events.emit('change', this.getValue());
  }

  _updateUI() {
    if (this.options.range) {
      const minPercent = this._valueToPercent(this.value[0]);
      const maxPercent = this._valueToPercent(this.value[1]);

      this.fill.style.left = `${minPercent}%`;
      this.fill.style.width = `${maxPercent - minPercent}%`;

      const minHandle = this.element.querySelector('[data-handle="min"]');
      const maxHandle = this.element.querySelector('[data-handle="max"]');

      minHandle.style.left = `${minPercent}%`;
      maxHandle.style.left = `${maxPercent}%`;

      if (this.options.showTooltip) {
        minHandle.querySelector('.range-slider__tooltip').textContent = this.options.formatValue(this.value[0]);
        maxHandle.querySelector('.range-slider__tooltip').textContent = this.options.formatValue(this.value[1]);
      }
    } else {
      const percent = this._valueToPercent(this.value);

      this.fill.style.left = '0';
      this.fill.style.width = `${percent}%`;

      const handle = this.element.querySelector('[data-handle="single"]');
      handle.style.left = `${percent}%`;

      if (this.options.showTooltip) {
        handle.querySelector('.range-slider__tooltip').textContent = this.options.formatValue(this.value);
      }
    }
  }

  _valueToPercent(value) {
    return ((value - this.options.min) / (this.options.max - this.options.min)) * 100;
  }

  _percentToValue(percent) {
    return this.options.min + percent * (this.options.max - this.options.min);
  }

  getValue() {
    return this.options.range ? [...this.value] : this.value;
  }

  setValue(value) {
    if (this.options.range) {
      this.value = Array.isArray(value) ? [...value] : [this.options.min, value];
    } else {
      this.value = Array.isArray(value) ? value[0] : value;
    }
    this._updateUI();
  }

  destroy() {
    // document 이벤트 리스너 제거
    document.removeEventListener('mousemove', this._onMove);
    document.removeEventListener('mouseup', this._onEnd);
    document.removeEventListener('touchmove', this._onMove);
    document.removeEventListener('touchend', this._onEnd);

    // 핸들 이벤트 리스너 제거
    if (this._handleEvents) {
      this._handleEvents.forEach(({ handle, onMouseDown, onTouchStart }) => {
        handle.removeEventListener('mousedown', onMouseDown);
        handle.removeEventListener('touchstart', onTouchStart);
      });
      this._handleEvents = [];
    }

    // 트랙 이벤트 리스너 제거
    if (this._onTrackClick && this.track) {
      this.track.removeEventListener('click', this._onTrackClick);
    }

    if (this.events) this.events.clear();

    // DOM 정리
    this.element.innerHTML = '';
    this.element.classList.remove('range-slider');

    // 참조 해제
    this.element = null;
    this.track = null;
    this.fill = null;
    this.handles = null;
  }
}

// ============================================
// Export
// ============================================

export { Autocomplete, MultiSelect, RangeSlider };
export default { Autocomplete, MultiSelect, RangeSlider };
