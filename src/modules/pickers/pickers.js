/**
 * Pickers Module
 * Date, Time, Color Picker 및 Countdown/D-Day 컴포넌트
 * @module modules/pickers
 */

import { EventBus } from '../../core/event.js';

// ============================================
// DatePicker - 날짜 선택
// ============================================

class DatePicker {
  static defaults() {
    return {
      format: 'YYYY-MM-DD',
      minDate: null,
      maxDate: null,
      locale: 'ko',
      placeholder: '날짜 선택',
      onChange: null
    };
  }

  constructor(element, options = {}) {
    this.element = typeof element === 'string' ? document.querySelector(element) : element;
    if (!this.element) return;
    this.options = { ...DatePicker.defaults(), ...options };
    this.events = new EventBus();
    this.isOpen = false;
    this.selectedDate = null;
    this.currentMonth = new Date();
    this.viewMode = 'days'; // 'days', 'months', 'years'
    this._init();
  }

  _init() {
    this._createWrapper();
    this._createPicker();
    this._bindEvents();
    if (this.element.value) this.setValue(this.element.value);
  }

  _createWrapper() {
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'datepicker';
    this.element.parentNode.insertBefore(this.wrapper, this.element);
    this.wrapper.appendChild(this.element);
    this.element.classList.add('datepicker__input');
    this.element.setAttribute('readonly', 'readonly');
    this.element.placeholder = this.options.placeholder;

    this.icon = document.createElement('span');
    this.icon.className = 'datepicker__icon';
    this.icon.innerHTML = '<i class="material-icons-outlined">calendar_today</i>';
    this.wrapper.appendChild(this.icon);
  }

  _createPicker() {
    this.picker = document.createElement('div');
    this.picker.className = 'datepicker__dropdown';
    this.picker.innerHTML = this._renderCalendar();
    this.wrapper.appendChild(this.picker);
  }

  _renderCalendar() {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    const monthNames = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
    const dayNames = ['일','월','화','수','목','금','토'];

    if (this.viewMode === 'years') {
      return this._renderYears(year);
    }
    
    if (this.viewMode === 'months') {
      return this._renderMonths(year, monthNames);
    }

    return `
      <div class="datepicker__header">
        <button type="button" class="datepicker__nav" data-action="prev"><i class="material-icons-outlined">chevron_left</i></button>
        <span class="datepicker__title">
          <span class="datepicker__year" data-action="showYears">${year}년</span>
          <span class="datepicker__month" data-action="showMonths">${monthNames[month]}</span>
        </span>
        <button type="button" class="datepicker__nav" data-action="next"><i class="material-icons-outlined">chevron_right</i></button>
      </div>
      <div class="datepicker__weekdays">${dayNames.map(d => `<span>${d}</span>`).join('')}</div>
      <div class="datepicker__days">${this._renderDays(year, month)}</div>
      <div class="datepicker__footer"><button type="button" data-action="today">오늘</button></div>
    `;
  }

  _renderYears(currentYear) {
    const startYear = Math.floor(currentYear / 10) * 10 - 1;
    const endYear = startYear + 11;
    let html = '';
    
    for (let y = startYear; y <= endYear; y++) {
      const isSelected = y === currentYear;
      const isOutRange = y === startYear || y === endYear;
      let cls = 'datepicker__year-item';
      if (isSelected) cls += ' datepicker__year-item--selected';
      if (isOutRange) cls += ' datepicker__year-item--other';
      html += `<span class="${cls}" data-year="${y}">${y}</span>`;
    }

    return `
      <div class="datepicker__header">
        <button type="button" class="datepicker__nav" data-action="prevDecade"><i class="material-icons-outlined">chevron_left</i></button>
        <span class="datepicker__title">${startYear + 1} - ${endYear - 1}</span>
        <button type="button" class="datepicker__nav" data-action="nextDecade"><i class="material-icons-outlined">chevron_right</i></button>
      </div>
      <div class="datepicker__years">${html}</div>
    `;
  }

  _renderMonths(year, monthNames) {
    const currentMonth = this.currentMonth.getMonth();
    let html = '';
    
    monthNames.forEach((name, idx) => {
      const isSelected = idx === currentMonth;
      let cls = 'datepicker__month-item';
      if (isSelected) cls += ' datepicker__month-item--selected';
      html += `<span class="${cls}" data-month="${idx}">${name}</span>`;
    });

    return `
      <div class="datepicker__header">
        <button type="button" class="datepicker__nav" data-action="prevYear"><i class="material-icons-outlined">chevron_left</i></button>
        <span class="datepicker__title" data-action="showYears">${year}년</span>
        <button type="button" class="datepicker__nav" data-action="nextYear"><i class="material-icons-outlined">chevron_right</i></button>
      </div>
      <div class="datepicker__months">${html}</div>
    `;
  }

  _renderDays(year, month) {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date(); today.setHours(0,0,0,0);
    let html = '';
    
    for (let i = 0; i < firstDay; i++) html += '<span class="datepicker__day datepicker__day--empty"></span>';
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = this._formatDate(date);
      const isToday = date.getTime() === today.getTime();
      const isSelected = this.selectedDate && date.getTime() === this.selectedDate.getTime();
      let cls = 'datepicker__day';
      if (isToday) cls += ' datepicker__day--today';
      if (isSelected) cls += ' datepicker__day--selected';
      html += `<span class="${cls}" data-date="${dateStr}">${day}</span>`;
    }
    return html;
  }

  _formatDate(date) {
    const y = date.getFullYear(), m = String(date.getMonth()+1).padStart(2,'0'), d = String(date.getDate()).padStart(2,'0');
    return this.options.format.replace('YYYY',y).replace('MM',m).replace('DD',d);
  }

  _parseDate(str) {
    const [y,m,d] = str.split('-').map(Number);
    return new Date(y, m-1, d);
  }

  _bindEvents() {
    this.element.addEventListener('click', () => this.open());
    this.icon.addEventListener('click', () => this.open());
    this.picker.addEventListener('click', (e) => {
      e.stopPropagation(); // 이벤트 전파 방지
      const t = e.target.closest('[data-action],[data-date],[data-year],[data-month]');
      if (!t) return;
      
      const action = t.dataset.action;
      
      // 날짜 뷰 액션
      if (action === 'prev') { this.currentMonth.setMonth(this.currentMonth.getMonth()-1); this._update(); }
      else if (action === 'next') { this.currentMonth.setMonth(this.currentMonth.getMonth()+1); this._update(); }
      else if (action === 'today') { this.viewMode = 'days'; this.setValue(this._formatDate(new Date())); this.close(); }
      
      // 뷰 전환
      else if (action === 'showYears') { this.viewMode = 'years'; this._update(); }
      else if (action === 'showMonths') { this.viewMode = 'months'; this._update(); }
      
      // 년도 뷰 액션
      else if (action === 'prevDecade') { this.currentMonth.setFullYear(this.currentMonth.getFullYear()-10); this._update(); }
      else if (action === 'nextDecade') { this.currentMonth.setFullYear(this.currentMonth.getFullYear()+10); this._update(); }
      
      // 월 뷰 액션
      else if (action === 'prevYear') { this.currentMonth.setFullYear(this.currentMonth.getFullYear()-1); this._update(); }
      else if (action === 'nextYear') { this.currentMonth.setFullYear(this.currentMonth.getFullYear()+1); this._update(); }
      
      // 년도 선택
      else if (t.dataset.year) { 
        this.currentMonth.setFullYear(parseInt(t.dataset.year)); 
        this.viewMode = 'months'; 
        this._update(); 
      }
      
      // 월 선택
      else if (t.dataset.month !== undefined) { 
        this.currentMonth.setMonth(parseInt(t.dataset.month)); 
        this.viewMode = 'days'; 
        this._update(); 
      }
      
      // 날짜 선택
      else if (t.dataset.date) { this.setValue(t.dataset.date); this.close(); }
    });
    this._outside = (e) => { if (!this.wrapper.contains(e.target) && this.isOpen) this.close(); };
    document.addEventListener('click', this._outside);
  }

  _update() { this.picker.innerHTML = this._renderCalendar(); }
  open() { this.viewMode = 'days'; this.isOpen = true; this.picker.classList.add('is-open'); this._update(); }
  close() { this.isOpen = false; this.picker.classList.remove('is-open'); }
  setValue(v) { this.selectedDate = this._parseDate(v); this.element.value = v; this._update(); this.options.onChange?.(v); this.events.emit('change',v); }
  getValue() { return this.element.value; }
  destroy() { document.removeEventListener('click', this._outside); this.wrapper.parentNode.insertBefore(this.element, this.wrapper); this.wrapper.remove(); }
}

// ============================================
// TimePicker - 시간 선택
// ============================================

class TimePicker {
  static defaults() { return { format: 'HH:mm', step: 15, placeholder: '시간 선택', onChange: null }; }

  constructor(element, options = {}) {
    this.element = typeof element === 'string' ? document.querySelector(element) : element;
    if (!this.element) return;
    this.options = { ...TimePicker.defaults(), ...options };
    this.events = new EventBus();
    this.isOpen = false;
    this._init();
  }

  _init() {
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'timepicker';
    this.element.parentNode.insertBefore(this.wrapper, this.element);
    this.wrapper.appendChild(this.element);
    this.element.classList.add('timepicker__input');
    this.element.setAttribute('readonly', 'readonly');
    this.element.placeholder = this.options.placeholder;

    this.icon = document.createElement('span');
    this.icon.className = 'timepicker__icon';
    this.icon.innerHTML = '<i class="material-icons-outlined">schedule</i>';
    this.wrapper.appendChild(this.icon);

    this.picker = document.createElement('div');
    this.picker.className = 'timepicker__dropdown';
    const times = [];
    for (let h=0; h<24; h++) for (let m=0; m<60; m+=this.options.step) times.push(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`);
    this.picker.innerHTML = `<div class="timepicker__list">${times.map(t => `<div class="timepicker__option" data-time="${t}">${t}</div>`).join('')}</div>`;
    this.wrapper.appendChild(this.picker);

    this.element.addEventListener('click', () => this.open());
    this.icon.addEventListener('click', () => this.open());
    this.picker.addEventListener('click', (e) => { const o = e.target.closest('.timepicker__option'); if (o) { this.setValue(o.dataset.time); this.close(); } });
    this._outside = (e) => { if (!this.wrapper.contains(e.target) && this.isOpen) this.close(); };
    document.addEventListener('click', this._outside);
  }

  open() { this.isOpen = true; this.picker.classList.add('is-open'); }
  close() { this.isOpen = false; this.picker.classList.remove('is-open'); }
  setValue(v) { this.element.value = v; this.picker.querySelectorAll('.timepicker__option').forEach(o => o.classList.toggle('is-selected', o.dataset.time===v)); this.options.onChange?.(v); }
  getValue() { return this.element.value; }
  destroy() { document.removeEventListener('click', this._outside); this.wrapper.parentNode.insertBefore(this.element, this.wrapper); this.wrapper.remove(); }
}

// ============================================
// ColorPicker - 색상 선택
// ============================================

class ColorPicker {
  static defaults() {
    return {
      defaultColor: '#667eea',
      presetColors: ['#ef4444','#f97316','#f59e0b','#22c55e','#10b981','#06b6d4','#3b82f6','#6366f1','#8b5cf6','#ec4899','#64748b','#000000'],
      onChange: null
    };
  }

  constructor(element, options = {}) {
    this.element = typeof element === 'string' ? document.querySelector(element) : element;
    if (!this.element) return;
    this.options = { ...ColorPicker.defaults(), ...options };
    this.events = new EventBus();
    this.isOpen = false;
    this._init();
  }

  _init() {
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'colorpicker';
    this.element.parentNode.insertBefore(this.wrapper, this.element);
    this.wrapper.appendChild(this.element);
    this.element.classList.add('colorpicker__input');

    this.preview = document.createElement('span');
    this.preview.className = 'colorpicker__preview';
    this.wrapper.insertBefore(this.preview, this.element);

    this.picker = document.createElement('div');
    this.picker.className = 'colorpicker__dropdown';
    this.picker.innerHTML = `
      <div class="colorpicker__presets">${this.options.presetColors.map(c => `<span class="colorpicker__preset" data-color="${c}" style="background:${c}"></span>`).join('')}</div>
      <div class="colorpicker__custom"><input type="color" class="colorpicker__native" value="${this.options.defaultColor}"></div>
    `;
    this.wrapper.appendChild(this.picker);
    this.nativeInput = this.picker.querySelector('.colorpicker__native');

    this.preview.addEventListener('click', () => this.toggle());
    this.picker.addEventListener('click', (e) => { const p = e.target.closest('.colorpicker__preset'); if (p) this.setValue(p.dataset.color); });
    this.nativeInput.addEventListener('input', (e) => this.setValue(e.target.value));
    this._outside = (e) => { if (!this.wrapper.contains(e.target) && this.isOpen) this.close(); };
    document.addEventListener('click', this._outside);

    this.setValue(this.element.value || this.options.defaultColor);
  }

  toggle() { this.isOpen ? this.close() : this.open(); }
  open() { this.isOpen = true; this.picker.classList.add('is-open'); }
  close() { this.isOpen = false; this.picker.classList.remove('is-open'); }
  setValue(c) { this.element.value = c; this.preview.style.backgroundColor = c; this.nativeInput.value = c; this.options.onChange?.(c); }
  getValue() { return this.element.value; }
  destroy() { document.removeEventListener('click', this._outside); this.wrapper.parentNode.insertBefore(this.element, this.wrapper); this.wrapper.remove(); }
}

// ============================================
// Countdown - 카운트다운 타이머
// ============================================

class Countdown {
  static defaults() {
    return {
      targetDate: null,
      labels: { days: '일', hours: '시간', minutes: '분', seconds: '초' },
      showLabels: true,
      showDays: true,
      showHours: true,
      showMinutes: true,
      showSeconds: true,
      separator: ':',
      onComplete: null,
      onTick: null
    };
  }

  constructor(element, options = {}) {
    this.element = typeof element === 'string' ? document.querySelector(element) : element;
    if (!this.element) return;
    this.options = { ...Countdown.defaults(), ...options };
    this.events = new EventBus();
    this.intervalId = null;
    this._init();
  }

  _init() {
    this.element.classList.add('countdown');
    const { labels, showLabels, showDays, showHours, showMinutes, showSeconds, separator } = this.options;
    
    const parts = [];
    if (showDays) parts.push(`<div class="countdown__item"><span class="countdown__value" data-unit="days">00</span>${showLabels ? `<span class="countdown__label">${labels.days}</span>` : ''}</div>`);
    if (showHours) parts.push(`<div class="countdown__item"><span class="countdown__value" data-unit="hours">00</span>${showLabels ? `<span class="countdown__label">${labels.hours}</span>` : ''}</div>`);
    if (showMinutes) parts.push(`<div class="countdown__item"><span class="countdown__value" data-unit="minutes">00</span>${showLabels ? `<span class="countdown__label">${labels.minutes}</span>` : ''}</div>`);
    if (showSeconds) parts.push(`<div class="countdown__item"><span class="countdown__value" data-unit="seconds">00</span>${showLabels ? `<span class="countdown__label">${labels.seconds}</span>` : ''}</div>`);
    
    this.element.innerHTML = parts.join(`<span class="countdown__sep">${separator}</span>`);
    this.start();
  }

  _calc() {
    const target = new Date(this.options.targetDate).getTime();
    const diff = Math.max(0, target - Date.now());
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
      total: diff
    };
  }

  _update() {
    const t = this._calc();
    const { showDays, showHours, showMinutes, showSeconds } = this.options;
    
    if (showDays) {
      const el = this.element.querySelector('[data-unit="days"]');
      if (el) el.textContent = String(t.days).padStart(2,'0');
    }
    if (showHours) {
      const el = this.element.querySelector('[data-unit="hours"]');
      // showDays가 false면 시간에 일수 추가
      const hrs = showDays ? t.hours : (t.days * 24 + t.hours);
      if (el) el.textContent = String(hrs).padStart(2,'0');
    }
    if (showMinutes) {
      const el = this.element.querySelector('[data-unit="minutes"]');
      if (el) el.textContent = String(t.minutes).padStart(2,'0');
    }
    if (showSeconds) {
      const el = this.element.querySelector('[data-unit="seconds"]');
      if (el) el.textContent = String(t.seconds).padStart(2,'0');
    }
    
    this.options.onTick?.(t);
    if (t.total <= 0) { this.stop(); this.element.classList.add('countdown--complete'); this.options.onComplete?.(); }
  }

  start() { if (!this.intervalId) { this._update(); this.intervalId = setInterval(() => this._update(), 1000); } }
  stop() { if (this.intervalId) { clearInterval(this.intervalId); this.intervalId = null; } }
  setTarget(date) { this.options.targetDate = date; this._update(); }
  destroy() { this.stop(); this.element.innerHTML = ''; this.element.classList.remove('countdown'); }
}

// ============================================
// DDay - 디데이 카운터
// ============================================

class DDay {
  static defaults() {
    return {
      targetDate: null,
      title: 'D-Day',
      showPastDays: true,
      onChange: null
    };
  }

  constructor(element, options = {}) {
    this.element = typeof element === 'string' ? document.querySelector(element) : element;
    if (!this.element) return;
    this.options = { ...DDay.defaults(), ...options };
    this._init();
  }

  _init() {
    this.element.classList.add('dday');
    this._render();
  }

  _calc() {
    const target = new Date(this.options.targetDate);
    target.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.ceil((target - today) / 86400000);
  }

  _render() {
    const diff = this._calc();
    let text, cls = 'dday__count';
    
    if (diff === 0) { text = 'D-Day'; cls += ' dday__count--today'; }
    else if (diff > 0) { text = `D-${diff}`; cls += ' dday__count--future'; }
    else { text = this.options.showPastDays ? `D+${Math.abs(diff)}` : 'D-Day 지남'; cls += ' dday__count--past'; }

    this.element.innerHTML = `
      <div class="dday__title">${this.options.title}</div>
      <div class="${cls}">${text}</div>
      <div class="dday__date">${this._formatDate(new Date(this.options.targetDate))}</div>
    `;
    this.options.onChange?.(diff);
  }

  _formatDate(d) {
    return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`;
  }

  setTarget(date, title) {
    this.options.targetDate = date;
    if (title) this.options.title = title;
    this._render();
  }

  getDays() { return this._calc(); }
  destroy() { this.element.innerHTML = ''; this.element.classList.remove('dday'); }
}

// ============================================
// Export
// ============================================

const Pickers = {
  DatePicker,
  TimePicker,
  ColorPicker,
  Countdown,
  DDay
};

export { DatePicker, TimePicker, ColorPicker, Countdown, DDay };
export default Pickers;
