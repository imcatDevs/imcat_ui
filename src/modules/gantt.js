/**
 * Gantt Chart Module
 * 프로젝트 일정 관리를 위한 간트 차트
 * @module gantt
 */

class Gantt {
  static instances = new Map();

  static defaults() {
    return {
      tasks: [],                    // 작업 데이터
      startDate: null,              // 시작일 (자동 계산)
      endDate: null,                // 종료일 (자동 계산)
      viewMode: 'day',              // 'day' | 'week' | 'month'
      todayLine: true,              // 오늘 날짜 라인 표시
      weekends: true,               // 주말 표시
      editable: false,              // 드래그로 수정 가능
      taskHeight: 36,               // 작업 바 높이
      rowHeight: 48,                // 행 높이
      headerHeight: 60,             // 헤더 높이
      sidebarWidth: 280,            // 사이드바 너비
      showProgress: true,           // 진행률 표시
      showDependencies: true,       // 의존성 선 표시
      colors: {
        primary: '#6366f1',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        info: '#3b82f6'
      },
      locale: 'ko-KR',
      dateFormat: {
        day: { month: 'short', day: 'numeric' },
        week: { month: 'short', day: 'numeric' },
        month: { year: 'numeric', month: 'short' }
      },
      onTaskClick: null,            // 작업 클릭 콜백
      onTaskChange: null,           // 작업 변경 콜백
      onViewChange: null            // 뷰 변경 콜백
    };
  }

  constructor(container, options = {}) {
    this.container = typeof container === 'string'
      ? document.querySelector(container)
      : container;

    if (!this.container) {
      console.error('Gantt: Container not found');
      return;
    }

    if (Gantt.instances.has(this.container)) {
      Gantt.instances.get(this.container).destroy();
    }

    this.options = { ...Gantt.defaults(), ...options };
    this.tasks = this._normalizeTasks(this.options.tasks);
    this.dateRange = this._calculateDateRange();
    this.cellWidth = this._getCellWidth();

    this._handlers = {};
    this._scrollLeft = 0;
    this._dragging = null;

    this.init();
    Gantt.instances.set(this.container, this);
  }

  init() {
    this._render();
    this._bindEvents();
    this._scrollToToday();
  }

  _normalizeTasks(tasks) {
    return tasks.map((task, index) => ({
      id: task.id || `task-${index}`,
      name: task.name || 'Untitled',
      start: new Date(task.start),
      end: new Date(task.end),
      progress: task.progress || 0,
      color: task.color || this.options.colors.primary,
      dependencies: task.dependencies || [],
      assignee: task.assignee || null,
      group: task.group || null,
      collapsed: task.collapsed || false,
      children: task.children ? this._normalizeTasks(task.children) : []
    }));
  }

  _calculateDateRange() {
    let minDate = this.options.startDate ? new Date(this.options.startDate) : null;
    let maxDate = this.options.endDate ? new Date(this.options.endDate) : null;

    const allTasks = this._flattenTasks(this.tasks);

    allTasks.forEach(task => {
      if (!minDate || task.start < minDate) minDate = new Date(task.start);
      if (!maxDate || task.end > maxDate) maxDate = new Date(task.end);
    });

    // 패딩 추가
    if (minDate) {
      minDate.setDate(minDate.getDate() - 3);
    } else {
      minDate = new Date();
    }

    if (maxDate) {
      maxDate.setDate(maxDate.getDate() + 7);
    } else {
      maxDate = new Date();
      maxDate.setMonth(maxDate.getMonth() + 1);
    }

    return { start: minDate, end: maxDate };
  }

  _flattenTasks(tasks) {
    let result = [];
    tasks.forEach(task => {
      result.push(task);
      if (task.children && task.children.length) {
        result = result.concat(this._flattenTasks(task.children));
      }
    });
    return result;
  }

  _getCellWidth() {
    switch (this.options.viewMode) {
      case 'day': return 40;
      case 'week': return 100;
      case 'month': return 120;
      default: return 40;
    }
  }

  _getDaysBetween(start, end) {
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.round((end - start) / oneDay);
  }

  _render() {
    this.container.classList.add('gantt');

    const totalDays = this._getDaysBetween(this.dateRange.start, this.dateRange.end);
    const chartWidth = totalDays * this.cellWidth;

    this.container.innerHTML = `
      <div class="gantt__header">
        <div class="gantt__controls">
          <div class="gantt__view-buttons">
            <button class="gantt__view-btn ${this.options.viewMode === 'day' ? 'gantt__view-btn--active' : ''}" data-view="day">일</button>
            <button class="gantt__view-btn ${this.options.viewMode === 'week' ? 'gantt__view-btn--active' : ''}" data-view="week">주</button>
            <button class="gantt__view-btn ${this.options.viewMode === 'month' ? 'gantt__view-btn--active' : ''}" data-view="month">월</button>
          </div>
          <button class="gantt__today-btn" title="오늘로 이동">
            <i class="material-icons-outlined">today</i>
            오늘
          </button>
        </div>
      </div>
      
      <div class="gantt__body">
        <div class="gantt__sidebar" style="width: ${this.options.sidebarWidth}px;">
          <div class="gantt__sidebar-header" style="height: ${this.options.headerHeight}px;">
            <span>작업명</span>
          </div>
          <div class="gantt__sidebar-content">
            ${this._renderTaskList(this.tasks)}
          </div>
        </div>
        
        <div class="gantt__chart-wrapper">
          <div class="gantt__timeline" style="height: ${this.options.headerHeight}px; width: ${chartWidth}px;">
            ${this._renderTimeline()}
          </div>
          <div class="gantt__chart" style="width: ${chartWidth}px;">
            ${this._renderTasks(this.tasks)}
            ${this.options.todayLine ? this._renderTodayLine() : ''}
            ${this.options.showDependencies ? this._renderDependencies() : ''}
          </div>
        </div>
      </div>
    `;

    // DOM 참조 저장
    this._sidebar = this.container.querySelector('.gantt__sidebar-content');
    this._chartWrapper = this.container.querySelector('.gantt__chart-wrapper');
    this._chart = this.container.querySelector('.gantt__chart');
  }

  _renderTimeline() {
    let html = '<div class="gantt__timeline-cells">';
    const current = new Date(this.dateRange.start);
    const end = this.dateRange.end;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    while (current <= end) {
      const isWeekend = current.getDay() === 0 || current.getDay() === 6;
      const isToday = current.toDateString() === today.toDateString();

      let label = '';
      switch (this.options.viewMode) {
        case 'day':
          label = current.toLocaleDateString(this.options.locale, this.options.dateFormat.day);
          break;
        case 'week':
          if (current.getDay() === 1) { // 월요일
            label = current.toLocaleDateString(this.options.locale, this.options.dateFormat.week);
          }
          break;
        case 'month':
          if (current.getDate() === 1) {
            label = current.toLocaleDateString(this.options.locale, this.options.dateFormat.month);
          }
          break;
      }

      html += `
        <div class="gantt__timeline-cell 
          ${isWeekend && this.options.weekends ? 'gantt__timeline-cell--weekend' : ''}
          ${isToday ? 'gantt__timeline-cell--today' : ''}"
          style="width: ${this.cellWidth}px;">
          ${label ? `<span class="gantt__timeline-label">${label}</span>` : ''}
        </div>
      `;

      current.setDate(current.getDate() + 1);
    }

    html += '</div>';
    return html;
  }

  _renderTaskList(tasks, level = 0) {
    let html = '';

    tasks.forEach(task => {
      const hasChildren = task.children && task.children.length > 0;
      const indent = level * 20;

      html += `
        <div class="gantt__task-row" data-task-id="${task.id}" style="height: ${this.options.rowHeight}px;">
          <div class="gantt__task-name" style="padding-left: ${16 + indent}px;">
            ${hasChildren ? `
              <button class="gantt__collapse-btn" data-task-id="${task.id}">
                <i class="material-icons-outlined">${task.collapsed ? 'chevron_right' : 'expand_more'}</i>
              </button>
            ` : '<span class="gantt__task-bullet"></span>'}
            <span class="gantt__task-title">${task.name}</span>
            ${task.assignee ? `<span class="gantt__task-assignee">${task.assignee}</span>` : ''}
          </div>
        </div>
      `;

      if (hasChildren && !task.collapsed) {
        html += this._renderTaskList(task.children, level + 1);
      }
    });

    return html;
  }

  _renderTasks(tasks, level = 0) {
    let html = '';
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    tasks.forEach(task => {
      const startOffset = this._getDaysBetween(this.dateRange.start, task.start);
      const duration = this._getDaysBetween(task.start, task.end) + 1;
      const left = startOffset * this.cellWidth;
      const width = duration * this.cellWidth - 4;

      // 진행 상태에 따른 색상
      let statusColor = task.color;
      if (task.progress === 100) {
        statusColor = this.options.colors.success;
      } else if (task.end < today && task.progress < 100) {
        statusColor = this.options.colors.danger;
      }

      html += `
        <div class="gantt__bar-row" data-task-id="${task.id}" style="height: ${this.options.rowHeight}px;">
          ${this._renderGridCells()}
          <div class="gantt__bar ${this.options.editable ? 'gantt__bar--draggable' : ''}" 
               data-task-id="${task.id}"
               style="
                 left: ${left}px; 
                 width: ${width}px;
                 height: ${this.options.taskHeight}px;
                 top: ${(this.options.rowHeight - this.options.taskHeight) / 2}px;
                 background: ${statusColor};
               ">
            ${this.options.showProgress ? `
              <div class="gantt__bar-progress" style="width: ${task.progress}%;"></div>
            ` : ''}
            <span class="gantt__bar-label">${task.name}</span>
            ${this.options.editable ? `
              <div class="gantt__bar-handle gantt__bar-handle--left"></div>
              <div class="gantt__bar-handle gantt__bar-handle--right"></div>
            ` : ''}
          </div>
        </div>
      `;

      if (task.children && task.children.length && !task.collapsed) {
        html += this._renderTasks(task.children, level + 1);
      }
    });

    return html;
  }

  _renderGridCells() {
    let html = '';
    const current = new Date(this.dateRange.start);
    const end = this.dateRange.end;

    while (current <= end) {
      const isWeekend = current.getDay() === 0 || current.getDay() === 6;
      html += `
        <div class="gantt__grid-cell ${isWeekend && this.options.weekends ? 'gantt__grid-cell--weekend' : ''}" 
             style="width: ${this.cellWidth}px;"></div>
      `;
      current.setDate(current.getDate() + 1);
    }

    return html;
  }

  _renderTodayLine() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (today < this.dateRange.start || today > this.dateRange.end) {
      return '';
    }

    const offset = this._getDaysBetween(this.dateRange.start, today);
    const left = offset * this.cellWidth + this.cellWidth / 2;

    return `
      <div class="gantt__today-line" style="left: ${left}px;">
        <div class="gantt__today-marker">오늘</div>
      </div>
    `;
  }

  _renderDependencies() {
    let html = '<svg class="gantt__dependencies">';
    const allTasks = this._flattenTasks(this.tasks);

    allTasks.forEach(task => {
      if (task.dependencies && task.dependencies.length) {
        task.dependencies.forEach(depId => {
          const depTask = allTasks.find(t => t.id === depId);
          if (depTask) {
            const fromX = this._getDaysBetween(this.dateRange.start, depTask.end) * this.cellWidth + this.cellWidth;
            const toX = this._getDaysBetween(this.dateRange.start, task.start) * this.cellWidth;

            const fromIndex = allTasks.indexOf(depTask);
            const toIndex = allTasks.indexOf(task);

            const fromY = fromIndex * this.options.rowHeight + this.options.rowHeight / 2;
            const toY = toIndex * this.options.rowHeight + this.options.rowHeight / 2;

            const midX = fromX + (toX - fromX) / 2;

            html += `
              <path class="gantt__dependency-line" 
                    d="M ${fromX} ${fromY} 
                       C ${midX} ${fromY}, ${midX} ${toY}, ${toX} ${toY}"
                    fill="none" 
                    stroke="var(--text-tertiary)" 
                    stroke-width="1.5"
                    marker-end="url(#arrowhead)"/>
            `;
          }
        });
      }
    });

    html += `
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" 
                refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="var(--text-tertiary)"/>
        </marker>
      </defs>
    </svg>`;

    return html;
  }

  _bindEvents() {
    // 뷰 모드 변경
    this._handlers.onViewChange = (e) => {
      const btn = e.target.closest('.gantt__view-btn');
      if (btn) {
        this.setViewMode(btn.dataset.view);
      }
    };

    // 오늘로 이동
    this._handlers.onTodayClick = () => {
      this._scrollToToday();
    };

    // 작업 클릭
    this._handlers.onBarClick = (e) => {
      const bar = e.target.closest('.gantt__bar');
      if (bar && this.options.onTaskClick) {
        const taskId = bar.dataset.taskId;
        const task = this._findTask(taskId);
        if (task) {
          this.options.onTaskClick(task, e);
        }
      }
    };

    // 접기/펼치기
    this._handlers.onCollapseClick = (e) => {
      const btn = e.target.closest('.gantt__collapse-btn');
      if (btn) {
        const taskId = btn.dataset.taskId;
        this._toggleCollapse(taskId);
      }
    };

    // 스크롤 동기화
    this._handlers.onScroll = () => {
      if (this._sidebar && this._chartWrapper) {
        this._sidebar.scrollTop = this._chartWrapper.scrollTop;
      }
    };

    // 이벤트 바인딩
    const controls = this.container.querySelector('.gantt__controls');
    if (controls) {
      controls.addEventListener('click', this._handlers.onViewChange);
    }

    const todayBtn = this.container.querySelector('.gantt__today-btn');
    if (todayBtn) {
      todayBtn.addEventListener('click', this._handlers.onTodayClick);
    }

    if (this._chart) {
      this._chart.addEventListener('click', this._handlers.onBarClick);
    }

    if (this._sidebar) {
      this._sidebar.addEventListener('click', this._handlers.onCollapseClick);
    }

    if (this._chartWrapper) {
      this._chartWrapper.addEventListener('scroll', this._handlers.onScroll);
    }

    // 드래그 (editable 옵션)
    if (this.options.editable) {
      this._setupDrag();
    }
  }

  _setupDrag() {
    this._handlers.onMouseDown = (e) => {
      const bar = e.target.closest('.gantt__bar');
      const handle = e.target.closest('.gantt__bar-handle');

      if (bar) {
        e.preventDefault();
        this._dragging = {
          bar,
          taskId: bar.dataset.taskId,
          startX: e.clientX,
          origLeft: parseInt(bar.style.left),
          origWidth: parseInt(bar.style.width),
          handle: handle ? (handle.classList.contains('gantt__bar-handle--left') ? 'left' : 'right') : 'move'
        };
        bar.classList.add('gantt__bar--dragging');
      }
    };

    this._handlers.onMouseMove = (e) => {
      if (!this._dragging) return;

      const deltaX = e.clientX - this._dragging.startX;
      const bar = this._dragging.bar;

      if (this._dragging.handle === 'move') {
        bar.style.left = `${this._dragging.origLeft + deltaX}px`;
      } else if (this._dragging.handle === 'left') {
        bar.style.left = `${this._dragging.origLeft + deltaX}px`;
        bar.style.width = `${this._dragging.origWidth - deltaX}px`;
      } else if (this._dragging.handle === 'right') {
        bar.style.width = `${this._dragging.origWidth + deltaX}px`;
      }
    };

    this._handlers.onMouseUp = () => {
      if (!this._dragging) return;

      const bar = this._dragging.bar;
      bar.classList.remove('gantt__bar--dragging');

      // 날짜 계산 및 업데이트
      const newLeft = parseInt(bar.style.left);
      const newWidth = parseInt(bar.style.width);
      const newStartDays = Math.round(newLeft / this.cellWidth);
      const newDuration = Math.round(newWidth / this.cellWidth);

      const task = this._findTask(this._dragging.taskId);
      if (task) {
        const newStart = new Date(this.dateRange.start);
        newStart.setDate(newStart.getDate() + newStartDays);

        const newEnd = new Date(newStart);
        newEnd.setDate(newEnd.getDate() + newDuration - 1);

        task.start = newStart;
        task.end = newEnd;

        if (this.options.onTaskChange) {
          this.options.onTaskChange(task);
        }
      }

      this._dragging = null;
    };

    this._chart.addEventListener('mousedown', this._handlers.onMouseDown);
    document.addEventListener('mousemove', this._handlers.onMouseMove);
    document.addEventListener('mouseup', this._handlers.onMouseUp);
  }

  _findTask(id, tasks = this.tasks) {
    for (const task of tasks) {
      if (task.id === id) return task;
      if (task.children && task.children.length) {
        const found = this._findTask(id, task.children);
        if (found) return found;
      }
    }
    return null;
  }

  _toggleCollapse(taskId) {
    const task = this._findTask(taskId);
    if (task) {
      task.collapsed = !task.collapsed;
      this._render();
      this._bindEvents();
    }
  }

  _scrollToToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const offset = this._getDaysBetween(this.dateRange.start, today);
    const scrollPos = offset * this.cellWidth - this._chartWrapper?.clientWidth / 2;

    if (this._chartWrapper) {
      this._chartWrapper.scrollLeft = Math.max(0, scrollPos);
    }
  }

  // Public API
  setViewMode(mode) {
    if (['day', 'week', 'month'].includes(mode)) {
      this.options.viewMode = mode;
      this.cellWidth = this._getCellWidth();
      this._render();
      this._bindEvents();

      if (this.options.onViewChange) {
        this.options.onViewChange(mode);
      }
    }
  }

  setTasks(tasks) {
    this.tasks = this._normalizeTasks(tasks);
    this.dateRange = this._calculateDateRange();
    this._render();
    this._bindEvents();
  }

  addTask(task) {
    this.tasks.push(this._normalizeTasks([task])[0]);
    this.dateRange = this._calculateDateRange();
    this._render();
    this._bindEvents();
  }

  updateTask(id, updates) {
    const task = this._findTask(id);
    if (task) {
      Object.assign(task, updates);
      if (updates.start) task.start = new Date(updates.start);
      if (updates.end) task.end = new Date(updates.end);
      this._render();
      this._bindEvents();
    }
  }

  removeTask(id) {
    const removeFromArray = (tasks) => {
      const index = tasks.findIndex(t => t.id === id);
      if (index !== -1) {
        tasks.splice(index, 1);
        return true;
      }
      for (const task of tasks) {
        if (task.children && removeFromArray(task.children)) {
          return true;
        }
      }
      return false;
    };

    removeFromArray(this.tasks);
    this._render();
    this._bindEvents();
  }

  scrollToTask(id) {
    const task = this._findTask(id);
    if (task && this._chartWrapper) {
      const offset = this._getDaysBetween(this.dateRange.start, task.start);
      this._chartWrapper.scrollLeft = offset * this.cellWidth - 50;
    }
  }

  refresh() {
    this._render();
    this._bindEvents();
  }

  destroy() {
    // 이벤트 리스너 제거
    const controls = this.container.querySelector('.gantt__controls');
    if (controls && this._handlers.onViewChange) {
      controls.removeEventListener('click', this._handlers.onViewChange);
    }

    const todayBtn = this.container.querySelector('.gantt__today-btn');
    if (todayBtn && this._handlers.onTodayClick) {
      todayBtn.removeEventListener('click', this._handlers.onTodayClick);
    }

    if (this._chart && this._handlers.onBarClick) {
      this._chart.removeEventListener('click', this._handlers.onBarClick);
    }

    if (this._sidebar && this._handlers.onCollapseClick) {
      this._sidebar.removeEventListener('click', this._handlers.onCollapseClick);
    }

    if (this._chartWrapper && this._handlers.onScroll) {
      this._chartWrapper.removeEventListener('scroll', this._handlers.onScroll);
    }

    if (this.options.editable) {
      if (this._chart && this._handlers.onMouseDown) {
        this._chart.removeEventListener('mousedown', this._handlers.onMouseDown);
      }
      if (this._handlers.onMouseMove) {
        document.removeEventListener('mousemove', this._handlers.onMouseMove);
      }
      if (this._handlers.onMouseUp) {
        document.removeEventListener('mouseup', this._handlers.onMouseUp);
      }
    }

    Gantt.instances.delete(this.container);

    if (this.container) {
      this.container.innerHTML = '';
      this.container.className = '';
    }

    this.container = null;
    this.tasks = null;
    this._handlers = null;
    this._sidebar = null;
    this._chartWrapper = null;
    this._chart = null;
  }
}


export { Gantt };
export default Gantt;
