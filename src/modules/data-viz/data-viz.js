/**
 * Data Visualization Module
 * @module modules/data-viz
 * @description 데이터 시각화 컴포넌트 모듈
 * - DataTable: 데이터 테이블 (정렬, 필터, 검색, 페이지네이션)
 * - Chart: 간단한 차트 (bar, line, pie, doughnut)
 * - Masonry: 타일 레이아웃
 * - Kanban: 칸반 보드 (드래그 앤 드롭)
 * - Calendar: 캘린더
 */

// ============================================
// DataTable - 데이터 테이블
// ============================================

class DataTable {
  static defaults() {
    return {
      data: [],
      columns: [],
      sortable: true,
      filterable: false,
      paginate: true,
      pageSize: 10,
      // Empty State 옵션
      emptyIcon: 'inbox',
      emptyTitle: '데이터가 없습니다',
      emptyDescription: '표시할 데이터가 없습니다.',
      showInfo: true,
      selectable: false, // 행 선택 기능
      toolbar: null, // { buttons: [{ text, icon, class, onClick }] }
      onRowClick: null,
      onSort: null,
      onFilter: null,
      onSelect: null,
      onEdit: null,
      onDelete: null
    };
  }

  constructor(selector, options = {}) {
    this.container = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (!this.container) return;

    this.options = { ...DataTable.defaults(), ...options };
    this.data = [...this.options.data];
    this.filteredData = [...this.data];
    this.currentPage = 1;
    this.sortColumn = null;
    this.sortDirection = 'asc';
    this.searchTerm = '';
    this.selectedRows = new Set();

    this._init();
  }

  _init() {
    this.container.classList.add('data-table-wrapper');
    this._render();
    this._bindEvents();
  }

  _render() {
    const { columns, paginate, pageSize, emptyMessage, showInfo, toolbar } = this.options;
    
    // 페이지네이션 계산
    const totalPages = Math.ceil(this.filteredData.length / pageSize);
    const start = (this.currentPage - 1) * pageSize;
    const end = start + pageSize;
    const pageData = paginate ? this.filteredData.slice(start, end) : this.filteredData;

    // 툴바 버튼 렌더링
    const renderToolbarButtons = () => {
      if (!toolbar?.buttons?.length) return '';
      return toolbar.buttons.map((btn, idx) => `
        <button class="data-table__toolbar-btn ${btn.class || ''}" data-action-idx="${idx}">
          ${btn.icon ? `<i class="material-icons-outlined">${btn.icon}</i>` : ''}
          ${btn.text || ''}
        </button>
      `).join('');
    };

    this.container.innerHTML = `
      ${toolbar?.buttons?.length || showInfo ? `
        <div class="data-table__toolbar">
          <div class="data-table__actions">
            ${renderToolbarButtons()}
          </div>
          ${showInfo ? `
            <div class="data-table__info">
              총 <strong>${this.filteredData.length}</strong>개
            </div>
          ` : ''}
        </div>
      ` : ''}
      
      <div class="data-table__container">
        <table class="data-table">
          <thead>
            <tr>
              ${this.options.selectable ? `
                <th class="data-table__th data-table__th--checkbox" style="width: 50px;">
                  <input type="checkbox" class="data-table__select-all" ${this._isAllSelected(pageData, start) ? 'checked' : ''}>
                </th>
              ` : ''}
              ${columns.map(col => `
                <th class="data-table__th ${this.options.sortable && col.sortable !== false ? 'sortable' : ''}" 
                    data-field="${col.field}"
                    style="${col.width ? `width: ${col.width}` : ''}">
                  <span>${col.title}</span>
                  ${this.options.sortable && col.sortable !== false ? `
                    <span class="data-table__sort-icon ${this.sortColumn === col.field ? 'active' : ''}">
                      <i class="material-icons-outlined">${this.sortColumn === col.field && this.sortDirection === 'desc' ? 'arrow_downward' : 'arrow_upward'}</i>
                    </span>
                  ` : ''}
                </th>
              `).join('')}
            </tr>
          </thead>
          <tbody>
            ${pageData.length > 0 ? pageData.map((row, idx) => `
              <tr class="data-table__row ${this.selectedRows.has(start + idx) ? 'selected' : ''}" data-index="${start + idx}">
                ${this.options.selectable ? `
                  <td class="data-table__td data-table__td--checkbox">
                    <input type="checkbox" class="data-table__row-select" ${this.selectedRows.has(start + idx) ? 'checked' : ''}>
                  </td>
                ` : ''}
                ${columns.map(col => `
                  <td class="data-table__td">${col.render ? col.render(row[col.field], row, start + idx) : (row[col.field] ?? '')}</td>
                `).join('')}
              </tr>
            `).join('') : `
              <tr>
                <td colspan="${this.options.selectable ? columns.length + 1 : columns.length}" class="data-table__empty-cell">
                  <div class="empty-state empty-state--sm">
                    <div class="empty-state__icon">
                      <i class="material-icons-outlined">${this.options.emptyIcon}</i>
                    </div>
                    <h3 class="empty-state__title">${this.options.emptyTitle}</h3>
                    <p class="empty-state__description">${this.options.emptyDescription}</p>
                  </div>
                </td>
              </tr>
            `}
          </tbody>
        </table>
      </div>
      
      ${paginate && totalPages > 1 ? `
        <div class="data-table__pagination">
          <button class="data-table__page-btn" data-page="prev" ${this.currentPage === 1 ? 'disabled' : ''}>
            <i class="material-icons-outlined">chevron_left</i>
          </button>
          <span class="data-table__page-info">${this.currentPage} / ${totalPages}</span>
          <button class="data-table__page-btn" data-page="next" ${this.currentPage === totalPages ? 'disabled' : ''}>
            <i class="material-icons-outlined">chevron_right</i>
          </button>
        </div>
      ` : ''}
    `;
  }

  _bindEvents() {
    // 이벤트 핸들러 추적
    this._onClick = (e) => {
      // 툴바 버튼 클릭
      const toolbarBtn = e.target.closest('.data-table__toolbar-btn');
      if (toolbarBtn) {
        const idx = parseInt(toolbarBtn.dataset.actionIdx);
        const btn = this.options.toolbar?.buttons?.[idx];
        if (btn?.onClick) {
          btn.onClick(e);
        }
      }

      // 정렬
      const th = e.target.closest('.data-table__th.sortable');
      if (th) {
        const field = th.dataset.field;
        if (this.sortColumn === field) {
          this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
          this.sortColumn = field;
          this.sortDirection = 'asc';
        }
        this._applySort();
      }

      // 행 클릭 (체크박스 제외)
      const row = e.target.closest('.data-table__row');
      if (row && this.options.onRowClick && !e.target.classList.contains('data-table__row-select')) {
        const index = parseInt(row.dataset.index);
        this.options.onRowClick(this.filteredData[index], index);
      }

      // 페이지네이션
      const pageBtn = e.target.closest('.data-table__page-btn');
      if (pageBtn && !pageBtn.disabled) {
        const action = pageBtn.dataset.page;
        if (action === 'prev') this.currentPage--;
        if (action === 'next') this.currentPage++;
        this._render();
      }
    };

    // 체크박스 이벤트
    this._onChange = (e) => {
      // 전체 선택
      if (e.target.classList.contains('data-table__select-all')) {
        const checked = e.target.checked;
        const checkboxes = this.container.querySelectorAll('.data-table__row-select');
        checkboxes.forEach(cb => {
          const row = cb.closest('.data-table__row');
          const idx = parseInt(row.dataset.index);
          if (checked) {
            this.selectedRows.add(idx);
            row.classList.add('selected');
          } else {
            this.selectedRows.delete(idx);
            row.classList.remove('selected');
          }
          cb.checked = checked;
        });
        this._triggerSelectCallback();
      }

      // 개별 선택
      if (e.target.classList.contains('data-table__row-select')) {
        const row = e.target.closest('.data-table__row');
        const idx = parseInt(row.dataset.index);
        if (e.target.checked) {
          this.selectedRows.add(idx);
          row.classList.add('selected');
        } else {
          this.selectedRows.delete(idx);
          row.classList.remove('selected');
        }
        // 전체 선택 체크박스 상태 업데이트
        const selectAll = this.container.querySelector('.data-table__select-all');
        const allCheckboxes = this.container.querySelectorAll('.data-table__row-select');
        const checkedCount = this.container.querySelectorAll('.data-table__row-select:checked').length;
        if (selectAll) {
          selectAll.checked = checkedCount === allCheckboxes.length;
          selectAll.indeterminate = checkedCount > 0 && checkedCount < allCheckboxes.length;
        }
        this._triggerSelectCallback();
      }
    };
    
    this.container.addEventListener('click', this._onClick);
    this.container.addEventListener('change', this._onChange);
  }

  _isAllSelected(pageData, start) {
    if (!pageData.length) return false;
    return pageData.every((_, idx) => this.selectedRows.has(start + idx));
  }

  _triggerSelectCallback() {
    if (this.options.onSelect) {
      const selectedData = Array.from(this.selectedRows).map(idx => this.filteredData[idx]);
      this.options.onSelect(selectedData, Array.from(this.selectedRows));
    }
  }

  _applySort() {
    if (this.sortColumn) {
      this.filteredData.sort((a, b) => {
        const valA = a[this.sortColumn];
        const valB = b[this.sortColumn];
        let comparison = 0;
        if (valA > valB) comparison = 1;
        if (valA < valB) comparison = -1;
        return this.sortDirection === 'desc' ? -comparison : comparison;
      });
      if (this.options.onSort) {
        this.options.onSort(this.sortColumn, this.sortDirection);
      }
    }
    this._render();
  }

  setData(data) {
    this.data = [...data];
    this.filteredData = [...data];
    this.currentPage = 1;
    this.selectedRows.clear();
    this._render();
  }

  refresh() {
    this._render();
  }

  // 선택 관련 메서드
  getSelectedRows() {
    return Array.from(this.selectedRows).map(idx => this.filteredData[idx]);
  }

  getSelectedIndices() {
    return Array.from(this.selectedRows);
  }

  clearSelection() {
    this.selectedRows.clear();
    this._render();
  }

  selectRow(index) {
    this.selectedRows.add(index);
    this._render();
  }

  deselectRow(index) {
    this.selectedRows.delete(index);
    this._render();
  }

  selectAll() {
    this.filteredData.forEach((_, idx) => this.selectedRows.add(idx));
    this._render();
  }

  // 데이터 조작 메서드
  addRow(row) {
    this.data.push(row);
    this.filteredData.push(row);
    this._render();
  }

  updateRow(index, row) {
    if (this.filteredData[index]) {
      this.filteredData[index] = { ...this.filteredData[index], ...row };
      const dataIdx = this.data.findIndex(d => d === this.filteredData[index]);
      if (dataIdx !== -1) this.data[dataIdx] = this.filteredData[index];
      this._render();
    }
  }

  deleteRow(index) {
    const item = this.filteredData[index];
    this.filteredData.splice(index, 1);
    const dataIdx = this.data.indexOf(item);
    if (dataIdx !== -1) this.data.splice(dataIdx, 1);
    this.selectedRows.delete(index);
    // 인덱스 재조정
    const newSelected = new Set();
    this.selectedRows.forEach(idx => {
      if (idx > index) newSelected.add(idx - 1);
      else newSelected.add(idx);
    });
    this.selectedRows = newSelected;
    this._render();
  }

  deleteSelectedRows() {
    const indices = Array.from(this.selectedRows).sort((a, b) => b - a);
    indices.forEach(idx => {
      const item = this.filteredData[idx];
      this.filteredData.splice(idx, 1);
      const dataIdx = this.data.indexOf(item);
      if (dataIdx !== -1) this.data.splice(dataIdx, 1);
    });
    this.selectedRows.clear();
    this._render();
  }

  destroy() {
    // 이벤트 리스너 제거
    if (this._onClick) this.container.removeEventListener('click', this._onClick);
    if (this._onChange) this.container.removeEventListener('change', this._onChange);
    
    // DOM 정리
    this.container.innerHTML = '';
    this.container.classList.remove('data-table-wrapper');
    
    // 참조 해제
    this.container = null;
    this.data = [];
    this.filteredData = [];
    this.selectedRows = null;
  }
}

// ============================================
// Chart - 간단한 차트
// ============================================

class Chart {
  static defaults() {
    return {
      type: 'bar', // 'bar', 'line', 'pie', 'doughnut'
      data: { labels: [], datasets: [] },
      colors: ['#667eea', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'],
      height: 300,
      showLegend: true,
      showValues: true,
      animate: true
    };
  }

  constructor(selector, options = {}) {
    this.container = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (!this.container) return;

    this.options = { ...Chart.defaults(), ...options };
    this._init();
  }

  _init() {
    this.container.classList.add('chart-wrapper');
    this._render();
  }

  _render() {
    const { type, data, colors, height, showLegend } = this.options;

    if (type === 'bar' || type === 'line') {
      this._renderBarLine();
    } else if (type === 'pie' || type === 'doughnut') {
      this._renderPie();
    }

    if (showLegend && data.datasets.length > 0) {
      this._renderLegend();
    }
  }

  _renderBarLine() {
    const { type, data, colors, height, showValues, animate } = this.options;
    const { labels, datasets } = data;
    const maxValue = Math.max(...datasets.flatMap(d => d.data));
    const chartHeight = height - 40;

    let barsHtml = '';
    const barWidth = 100 / (labels.length * datasets.length + labels.length);
    const groupWidth = barWidth * datasets.length;

    if (type === 'bar') {
      labels.forEach((label, i) => {
        datasets.forEach((dataset, j) => {
          const value = dataset.data[i];
          const barHeight = (value / maxValue) * chartHeight;
          const color = dataset.color || colors[j % colors.length];
          const left = i * (groupWidth + barWidth) + j * barWidth + barWidth / 2;
          
          barsHtml += `
            <div class="chart__bar ${animate ? 'animate' : ''}" 
                 style="left: ${left}%; width: ${barWidth}%; height: ${barHeight}px; background: ${color};"
                 data-value="${value}" data-label="${label}">
              ${showValues ? `<span class="chart__bar-value">${value}</span>` : ''}
            </div>
          `;
        });
      });
    } else if (type === 'line') {
      datasets.forEach((dataset, j) => {
        const color = dataset.color || colors[j % colors.length];
        const points = dataset.data.map((value, i) => {
          const x = (i / (labels.length - 1)) * 100;
          const y = chartHeight - (value / maxValue) * chartHeight;
          return `${x},${y}`;
        }).join(' ');

        barsHtml += `
          <svg class="chart__line-svg" viewBox="0 0 100 ${chartHeight}" preserveAspectRatio="none">
            <polyline class="chart__line ${animate ? 'animate' : ''}" points="${points}" 
                      fill="none" stroke="${color}" stroke-width="2" vector-effect="non-scaling-stroke"/>
          </svg>
        `;
        
        // 점 표시
        dataset.data.forEach((value, i) => {
          const x = (i / (labels.length - 1)) * 100;
          const y = chartHeight - (value / maxValue) * chartHeight;
          barsHtml += `
            <div class="chart__point" style="left: ${x}%; top: ${y}px; background: ${color};" data-value="${value}"></div>
          `;
        });
      });
    }

    // X축 라벨
    const labelsHtml = labels.map((label, i) => {
      const left = type === 'bar' 
        ? i * (groupWidth + barWidth) + groupWidth / 2 + barWidth / 4
        : (i / (labels.length - 1)) * 100;
      return `<span class="chart__label" style="left: ${left}%;">${label}</span>`;
    }).join('');

    this.container.innerHTML = `
      <div class="chart chart--${type}" style="height: ${height}px;">
        <div class="chart__area" style="height: ${chartHeight}px;">
          ${barsHtml}
        </div>
        <div class="chart__labels">
          ${labelsHtml}
        </div>
      </div>
    `;
  }

  _renderPie() {
    const { type, data, colors, height, showValues } = this.options;
    const { labels, datasets } = data;
    const values = datasets[0]?.data || [];
    const total = values.reduce((a, b) => a + b, 0);
    
    let currentAngle = 0;
    const segments = values.map((value, i) => {
      const percentage = (value / total) * 100;
      const angle = (value / total) * 360;
      const startAngle = currentAngle;
      currentAngle += angle;
      return {
        value,
        percentage,
        startAngle,
        angle,
        color: colors[i % colors.length],
        label: labels[i]
      };
    });

    const size = height - 20;
    const center = size / 2;
    const radius = center - 10;
    const innerRadius = type === 'doughnut' ? radius * 0.6 : 0;

    const pathsHtml = segments.map((seg, i) => {
      const startRad = (seg.startAngle - 90) * Math.PI / 180;
      const endRad = (seg.startAngle + seg.angle - 90) * Math.PI / 180;
      const largeArc = seg.angle > 180 ? 1 : 0;
      
      const x1 = center + radius * Math.cos(startRad);
      const y1 = center + radius * Math.sin(startRad);
      const x2 = center + radius * Math.cos(endRad);
      const y2 = center + radius * Math.sin(endRad);

      let d;
      if (innerRadius > 0) {
        const ix1 = center + innerRadius * Math.cos(startRad);
        const iy1 = center + innerRadius * Math.sin(startRad);
        const ix2 = center + innerRadius * Math.cos(endRad);
        const iy2 = center + innerRadius * Math.sin(endRad);
        d = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix1} ${iy1} Z`;
      } else {
        d = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
      }

      return `<path class="chart__pie-segment" d="${d}" fill="${seg.color}" data-value="${seg.value}" data-label="${seg.label}"/>`;
    }).join('');

    this.container.innerHTML = `
      <div class="chart chart--${type}" style="height: ${height}px;">
        <svg class="chart__pie-svg" viewBox="0 0 ${size} ${size}" style="width: ${size}px; height: ${size}px;">
          ${pathsHtml}
        </svg>
        ${type === 'doughnut' && showValues ? `
          <div class="chart__doughnut-center">
            <div class="chart__doughnut-total">${total}</div>
            <div class="chart__doughnut-label">Total</div>
          </div>
        ` : ''}
      </div>
    `;
  }

  _renderLegend() {
    const { colors, data } = this.options;
    const { labels, datasets } = data;
    
    const items = this.options.type === 'pie' || this.options.type === 'doughnut'
      ? labels.map((label, i) => ({ label, color: colors[i % colors.length] }))
      : datasets.map((d, i) => ({ label: d.label || `Dataset ${i + 1}`, color: d.color || colors[i % colors.length] }));

    const legendHtml = `
      <div class="chart__legend">
        ${items.map(item => `
          <div class="chart__legend-item">
            <span class="chart__legend-color" style="background: ${item.color};"></span>
            <span class="chart__legend-label">${item.label}</span>
          </div>
        `).join('')}
      </div>
    `;

    this.container.insertAdjacentHTML('beforeend', legendHtml);
  }

  update(data) {
    this.options.data = data;
    this._render();
  }

  destroy() {
    this.container.innerHTML = '';
    this.container.classList.remove('chart-wrapper');
  }
}

// ============================================
// Masonry - 타일 레이아웃
// ============================================

class Masonry {
  static defaults() {
    return {
      columnWidth: 300,
      gap: 16,
      items: [],
      render: null // (item) => HTML string
    };
  }

  constructor(selector, options = {}) {
    this.container = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (!this.container) return;

    this.options = { ...Masonry.defaults(), ...options };
    this._init();
  }

  _init() {
    this.container.classList.add('masonry');
    this._render();
    this._bindEvents();
  }

  _render() {
    const { items, render, columnWidth, gap } = this.options;
    
    this.container.style.cssText = `
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(${columnWidth}px, 1fr));
      gap: ${gap}px;
      align-items: start;
    `;

    if (render) {
      this.container.innerHTML = items.map((item, i) => `
        <div class="masonry__item" data-index="${i}">${render(item, i)}</div>
      `).join('');
    }
  }

  _bindEvents() {
    // ResizeObserver로 레이아웃 재조정
    this.resizeObserver = new ResizeObserver(() => {
      this._adjustLayout();
    });
    this.resizeObserver.observe(this.container);
  }

  _adjustLayout() {
    // CSS Grid가 자동으로 처리하므로 추가 로직 불필요
  }

  addItem(item) {
    this.options.items.push(item);
    if (this.options.render) {
      const div = document.createElement('div');
      div.className = 'masonry__item';
      div.dataset.index = this.options.items.length - 1;
      div.innerHTML = this.options.render(item, this.options.items.length - 1);
      this.container.appendChild(div);
    }
  }

  removeItem(index) {
    this.options.items.splice(index, 1);
    this._render();
  }

  destroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    this.container.innerHTML = '';
    this.container.classList.remove('masonry');
    this.container.style.cssText = '';
  }
}

// ============================================
// Kanban - 칸반 보드
// ============================================

class Kanban {
  static defaults() {
    return {
      columns: [], // { id, title, cards: [{ id, title, description, tags }] }
      onMove: null,
      onCardClick: null,
      allowAddCard: true
    };
  }

  constructor(selector, options = {}) {
    this.container = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (!this.container) return;

    this.options = { ...Kanban.defaults(), ...options };
    this.draggedCard = null;
    this._init();
  }

  _init() {
    this.container.classList.add('kanban');
    this._render();
    this._bindEvents();
  }

  _render() {
    const { columns, allowAddCard } = this.options;

    this.container.innerHTML = columns.map(col => `
      <div class="kanban__column" data-column-id="${col.id}">
        <div class="kanban__column-header">
          <h3 class="kanban__column-title">${col.title}</h3>
          <span class="kanban__column-count">${col.cards?.length || 0}</span>
        </div>
        <div class="kanban__cards" data-column-id="${col.id}">
          ${(col.cards || []).map(card => this._renderCard(card)).join('')}
        </div>
        ${allowAddCard ? `
          <button class="kanban__add-card" data-column-id="${col.id}">
            <i class="material-icons-outlined">add</i>
            카드 추가
          </button>
        ` : ''}
      </div>
    `).join('');
  }

  _renderCard(card) {
    return `
      <div class="kanban__card" draggable="true" data-card-id="${card.id}">
        <div class="kanban__card-title">${card.title}</div>
        ${card.description ? `<div class="kanban__card-desc">${card.description}</div>` : ''}
        ${card.tags?.length ? `
          <div class="kanban__card-tags">
            ${card.tags.map(tag => `<span class="kanban__tag" style="background: ${tag.color || '#667eea'};">${tag.text}</span>`).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }

  _bindEvents() {
    // 이벤트 핸들러 추적
    this._onDragstart = (e) => {
      const card = e.target.closest('.kanban__card');
      if (card) {
        this.draggedCard = card;
        card.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
      }
    };

    this._onDragend = (e) => {
      if (this.draggedCard) {
        this.draggedCard.classList.remove('dragging');
        this.draggedCard = null;
      }
      this.container.querySelectorAll('.kanban__cards').forEach(col => {
        col.classList.remove('drag-over');
      });
    };

    this._onDragover = (e) => {
      e.preventDefault();
      const cardsContainer = e.target.closest('.kanban__cards');
      if (cardsContainer) {
        cardsContainer.classList.add('drag-over');
      }
    };

    this._onDragleave = (e) => {
      const cardsContainer = e.target.closest('.kanban__cards');
      if (cardsContainer && !cardsContainer.contains(e.relatedTarget)) {
        cardsContainer.classList.remove('drag-over');
      }
    };

    this._onDrop = (e) => {
      e.preventDefault();
      const cardsContainer = e.target.closest('.kanban__cards');
      if (cardsContainer && this.draggedCard) {
        const cardId = this.draggedCard.dataset.cardId;
        const fromColumnId = this.draggedCard.closest('.kanban__column').dataset.columnId;
        const toColumnId = cardsContainer.dataset.columnId;

        cardsContainer.appendChild(this.draggedCard);
        cardsContainer.classList.remove('drag-over');

        this._updateCounts();

        if (this.options.onMove) {
          this.options.onMove(cardId, fromColumnId, toColumnId);
        }
      }
    };

    this._onClick = (e) => {
      const card = e.target.closest('.kanban__card');
      if (card && this.options.onCardClick) {
        this.options.onCardClick(card.dataset.cardId);
      }

      const addBtn = e.target.closest('.kanban__add-card');
      if (addBtn) {
        const columnId = addBtn.dataset.columnId;
        this._showAddCardDialog(columnId);
      }
    };

    this.container.addEventListener('dragstart', this._onDragstart);
    this.container.addEventListener('dragend', this._onDragend);
    this.container.addEventListener('dragover', this._onDragover);
    this.container.addEventListener('dragleave', this._onDragleave);
    this.container.addEventListener('drop', this._onDrop);
    this.container.addEventListener('click', this._onClick);
  }

  _updateCounts() {
    this.container.querySelectorAll('.kanban__column').forEach(col => {
      const count = col.querySelectorAll('.kanban__card').length;
      col.querySelector('.kanban__column-count').textContent = count;
    });
  }

  _showAddCardDialog(columnId) {
    const title = prompt('카드 제목:');
    if (title) {
      this.addCard(columnId, { id: Date.now().toString(), title });
    }
  }

  addCard(columnId, card) {
    const column = this.options.columns.find(c => c.id === columnId);
    if (column) {
      column.cards = column.cards || [];
      column.cards.push(card);
      
      const cardsContainer = this.container.querySelector(`.kanban__cards[data-column-id="${columnId}"]`);
      if (cardsContainer) {
        cardsContainer.insertAdjacentHTML('beforeend', this._renderCard(card));
      }
      this._updateCounts();
    }
  }

  removeCard(cardId) {
    const card = this.container.querySelector(`.kanban__card[data-card-id="${cardId}"]`);
    if (card) {
      card.remove();
      this._updateCounts();
    }
  }

  destroy() {
    // 이벤트 리스너 제거
    if (this._onDragstart) this.container.removeEventListener('dragstart', this._onDragstart);
    if (this._onDragend) this.container.removeEventListener('dragend', this._onDragend);
    if (this._onDragover) this.container.removeEventListener('dragover', this._onDragover);
    if (this._onDragleave) this.container.removeEventListener('dragleave', this._onDragleave);
    if (this._onDrop) this.container.removeEventListener('drop', this._onDrop);
    if (this._onClick) this.container.removeEventListener('click', this._onClick);
    
    // DOM 정리
    this.container.innerHTML = '';
    this.container.classList.remove('kanban');
    
    // 참조 해제
    this.container = null;
    this.draggedCard = null;
  }
}

// ============================================
// Calendar - 캘린더
// ============================================

class Calendar {
  static defaults() {
    return {
      events: [], // { id, title, date, color }
      defaultDate: new Date(),
      onDateClick: null,
      onEventClick: null,
      onMonthChange: null
    };
  }

  constructor(selector, options = {}) {
    this.container = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (!this.container) return;

    this.options = { ...Calendar.defaults(), ...options };
    this.currentDate = new Date(this.options.defaultDate);
    this._init();
  }

  _init() {
    this.container.classList.add('calendar');
    this._render();
    this._bindEvents();
  }

  _render() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

    // 날짜 셀 생성
    const cells = [];
    
    // 이전 달 날짜
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      cells.push({ day: prevMonthLastDay - i, isOtherMonth: true, date: new Date(year, month - 1, prevMonthLastDay - i) });
    }

    // 현재 달 날짜
    for (let i = 1; i <= totalDays; i++) {
      cells.push({ day: i, isOtherMonth: false, date: new Date(year, month, i) });
    }

    // 다음 달 날짜
    const remaining = 42 - cells.length;
    for (let i = 1; i <= remaining; i++) {
      cells.push({ day: i, isOtherMonth: true, date: new Date(year, month + 1, i) });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    this.container.innerHTML = `
      <div class="calendar__header">
        <button class="calendar__nav-btn" data-action="prev">
          <i class="material-icons-outlined">chevron_left</i>
        </button>
        <h3 class="calendar__title">${year}년 ${monthNames[month]}</h3>
        <button class="calendar__nav-btn" data-action="next">
          <i class="material-icons-outlined">chevron_right</i>
        </button>
      </div>
      <div class="calendar__weekdays">
        ${dayNames.map((d, i) => `<div class="calendar__weekday ${i === 0 ? 'sunday' : i === 6 ? 'saturday' : ''}">${d}</div>`).join('')}
      </div>
      <div class="calendar__grid">
        ${cells.map(cell => {
          const dateStr = this._formatDate(cell.date);
          const events = this.options.events.filter(e => this._formatDate(new Date(e.date)) === dateStr);
          const isToday = cell.date.getTime() === today.getTime();
          const dayOfWeek = cell.date.getDay();
          
          return `
            <div class="calendar__cell ${cell.isOtherMonth ? 'other-month' : ''} ${isToday ? 'today' : ''} ${dayOfWeek === 0 ? 'sunday' : ''} ${dayOfWeek === 6 ? 'saturday' : ''}" 
                 data-date="${dateStr}">
              <span class="calendar__day">${cell.day}</span>
              ${events.length > 0 ? `
                <div class="calendar__events">
                  ${events.slice(0, 2).map(e => `
                    <div class="calendar__event" style="background: ${e.color || '#667eea'};" data-event-id="${e.id}">${e.title}</div>
                  `).join('')}
                  ${events.length > 2 ? `<div class="calendar__more">+${events.length - 2}개 더</div>` : ''}
                </div>
              ` : ''}
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  _formatDate(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  _bindEvents() {
    // 이벤트 핸들러 추적
    this._onClick = (e) => {
      // 네비게이션
      const navBtn = e.target.closest('.calendar__nav-btn');
      if (navBtn) {
        const action = navBtn.dataset.action;
        if (action === 'prev') {
          this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        } else {
          this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        }
        this._render();
        if (this.options.onMonthChange) {
          this.options.onMonthChange(this.currentDate);
        }
      }

      // 날짜 클릭
      const cell = e.target.closest('.calendar__cell');
      if (cell && !e.target.closest('.calendar__event') && this.options.onDateClick) {
        this.options.onDateClick(cell.dataset.date);
      }

      // 이벤트 클릭
      const event = e.target.closest('.calendar__event');
      if (event && this.options.onEventClick) {
        this.options.onEventClick(event.dataset.eventId);
      }
    };
    
    this.container.addEventListener('click', this._onClick);
  }

  goToDate(date) {
    this.currentDate = new Date(date);
    this._render();
  }

  addEvent(event) {
    this.options.events.push(event);
    this._render();
  }

  removeEvent(eventId) {
    this.options.events = this.options.events.filter(e => e.id !== eventId);
    this._render();
  }

  getEvents(date) {
    const dateStr = this._formatDate(new Date(date));
    return this.options.events.filter(e => this._formatDate(new Date(e.date)) === dateStr);
  }

  destroy() {
    // 이벤트 리스너 제거
    if (this._onClick) this.container.removeEventListener('click', this._onClick);
    
    // DOM 정리
    this.container.innerHTML = '';
    this.container.classList.remove('calendar');
    
    // 참조 해제
    this.container = null;
  }
}

// ============================================
// Export
// ============================================

export { DataTable, Chart, Masonry, Kanban, Calendar };
export default { DataTable, Chart, Masonry, Kanban, Calendar };
