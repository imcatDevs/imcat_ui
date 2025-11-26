/**
 * Text Editors Module
 * Rich Text Editor, Markdown Editor/Preview
 * @module modules/text-editors
 */

// ============================================
// RichTextEditor - 리치 텍스트 에디터
// ============================================

/**
 * RichTextEditor 클래스
 * 간단한 WYSIWYG 에디터
 */
class RichTextEditor {
  /** @type {Map<HTMLElement, RichTextEditor>} */
  static instances = new Map();

  /**
   * 기본 옵션
   * @returns {Object}
   */
  static defaults() {
    return {
      placeholder: '내용을 입력하세요...',
      toolbar: ['bold', 'italic', 'underline', '|', 'heading', 'quote', '|', 
                'ul', 'ol', '|', 'link', 'image', '|', 'code', 'hr', '|', 'undo', 'redo'],
      minHeight: 200,
      maxHeight: 600,
      onChange: null,
      onFocus: null,
      onBlur: null,
    };
  }

  /**
   * 툴바 버튼 정의
   */
  static toolbarButtons = {
    bold: { icon: 'format_bold', title: '굵게', command: 'bold' },
    italic: { icon: 'format_italic', title: '기울임', command: 'italic' },
    underline: { icon: 'format_underlined', title: '밑줄', command: 'underline' },
    strikethrough: { icon: 'strikethrough_s', title: '취소선', command: 'strikethrough' },
    heading: { icon: 'title', title: '제목', command: 'formatBlock', value: 'h3' },
    quote: { icon: 'format_quote', title: '인용구', command: 'formatBlock', value: 'blockquote' },
    ul: { icon: 'format_list_bulleted', title: '순서 없는 목록', command: 'insertUnorderedList' },
    ol: { icon: 'format_list_numbered', title: '순서 있는 목록', command: 'insertOrderedList' },
    link: { icon: 'link', title: '링크 삽입', command: 'createLink' },
    image: { icon: 'image', title: '이미지 삽입', command: 'insertImage' },
    code: { icon: 'code', title: '코드', command: 'formatBlock', value: 'pre' },
    hr: { icon: 'horizontal_rule', title: '구분선', command: 'insertHorizontalRule' },
    undo: { icon: 'undo', title: '실행 취소', command: 'undo' },
    redo: { icon: 'redo', title: '다시 실행', command: 'redo' },
    alignLeft: { icon: 'format_align_left', title: '왼쪽 정렬', command: 'justifyLeft' },
    alignCenter: { icon: 'format_align_center', title: '가운데 정렬', command: 'justifyCenter' },
    alignRight: { icon: 'format_align_right', title: '오른쪽 정렬', command: 'justifyRight' },
  };

  /**
   * @param {string|HTMLElement} selector
   * @param {Object} options
   */
  constructor(selector, options = {}) {
    this.container = typeof selector === 'string' 
      ? document.querySelector(selector) 
      : selector;
    
    if (!this.container) {
      console.error('RichTextEditor: Container not found');
      return;
    }

    this.options = { ...RichTextEditor.defaults(), ...options };
    this.toolbar = null;
    this.editor = null;
    this._onInput = null;
    this._onFocus = null;
    this._onBlur = null;
    
    this.init();
    RichTextEditor.instances.set(this.container, this);
  }

  init() {
    this._render();
    this._bindEvents();
  }

  _render() {
    this.container.className = 'rich-text-editor';
    
    // 툴바 생성
    this.toolbar = document.createElement('div');
    this.toolbar.className = 'rich-text-editor__toolbar';
    this.toolbar.innerHTML = this._renderToolbar();
    
    // 에디터 영역 생성
    this.editor = document.createElement('div');
    this.editor.className = 'rich-text-editor__content';
    this.editor.contentEditable = 'true';
    this.editor.setAttribute('data-placeholder', this.options.placeholder);
    this.editor.style.minHeight = `${this.options.minHeight}px`;
    this.editor.style.maxHeight = `${this.options.maxHeight}px`;
    
    this.container.appendChild(this.toolbar);
    this.container.appendChild(this.editor);
  }

  _renderToolbar() {
    return this.options.toolbar.map(item => {
      if (item === '|') {
        return '<span class="rich-text-editor__separator"></span>';
      }
      
      const btn = RichTextEditor.toolbarButtons[item];
      if (!btn) return '';
      
      return `
        <button type="button" class="rich-text-editor__btn" data-command="${btn.command}" 
                data-value="${btn.value || ''}" title="${btn.title}">
          <i class="material-icons-outlined">${btn.icon}</i>
        </button>
      `;
    }).join('');
  }

  _bindEvents() {
    // 툴바 클릭
    this.toolbar.addEventListener('click', (e) => {
      const btn = e.target.closest('.rich-text-editor__btn');
      if (!btn) return;
      
      e.preventDefault();
      const command = btn.dataset.command;
      const value = btn.dataset.value;
      
      this._execCommand(command, value);
    });
    
    // 에디터 이벤트
    this._onInput = () => {
      if (this.options.onChange) {
        this.options.onChange(this.getHTML());
      }
    };
    this.editor.addEventListener('input', this._onInput);
    
    this._onFocus = () => {
      this.container.classList.add('is-focused');
      if (this.options.onFocus) {
        this.options.onFocus();
      }
    };
    this.editor.addEventListener('focus', this._onFocus);
    
    this._onBlur = () => {
      this.container.classList.remove('is-focused');
      if (this.options.onBlur) {
        this.options.onBlur();
      }
    };
    this.editor.addEventListener('blur', this._onBlur);
    
    // 키보드 단축키
    this.editor.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'b':
            e.preventDefault();
            this._execCommand('bold');
            break;
          case 'i':
            e.preventDefault();
            this._execCommand('italic');
            break;
          case 'u':
            e.preventDefault();
            this._execCommand('underline');
            break;
        }
      }
    });
  }

  _execCommand(command, value = '') {
    if (command === 'createLink') {
      value = prompt('링크 URL을 입력하세요:', 'https://');
      if (!value) return;
    }
    
    if (command === 'insertImage') {
      value = prompt('이미지 URL을 입력하세요:', 'https://');
      if (!value) return;
    }
    
    document.execCommand(command, false, value);
    this.editor.focus();
    
    if (this.options.onChange) {
      this.options.onChange(this.getHTML());
    }
  }

  /**
   * HTML 내용 반환
   * @returns {string}
   */
  getHTML() {
    return this.editor.innerHTML;
  }

  /**
   * HTML 내용 설정
   * @param {string} html
   */
  setHTML(html) {
    this.editor.innerHTML = html;
  }

  /**
   * 텍스트 내용 반환
   * @returns {string}
   */
  getText() {
    return this.editor.textContent || '';
  }

  /**
   * 내용 초기화
   */
  clear() {
    this.editor.innerHTML = '';
  }

  /**
   * 포커스
   */
  focus() {
    this.editor.focus();
  }

  destroy() {
    if (this._onInput) {
      this.editor.removeEventListener('input', this._onInput);
    }
    if (this._onFocus) {
      this.editor.removeEventListener('focus', this._onFocus);
    }
    if (this._onBlur) {
      this.editor.removeEventListener('blur', this._onBlur);
    }
    
    RichTextEditor.instances.delete(this.container);
    
    if (this.container) {
      this.container.innerHTML = '';
    }
    
    this.container = null;
    this.toolbar = null;
    this.editor = null;
  }
}


// ============================================
// MarkdownEditor - 마크다운 에디터
// ============================================

/**
 * MarkdownEditor 클래스
 * 마크다운 에디터 + 실시간 프리뷰
 */
class MarkdownEditor {
  /** @type {Map<HTMLElement, MarkdownEditor>} */
  static instances = new Map();

  /**
   * 기본 옵션
   * @returns {Object}
   */
  static defaults() {
    return {
      value: '',
      placeholder: '마크다운을 입력하세요...',
      preview: true,            // 프리뷰 표시 여부
      splitView: true,          // 분할 뷰 (false면 탭)
      toolbar: ['bold', 'italic', 'strikethrough', '|', 
                'h1', 'h2', 'h3', '|', 'ul', 'ol', 'task', '|',
                'link', 'image', 'code', 'codeblock', '|', 'quote', 'hr', 'table'],
      minHeight: 300,
      onChange: null,
    };
  }

  /**
   * 툴바 버튼 정의
   */
  static toolbarButtons = {
    bold: { icon: 'format_bold', title: '굵게', prefix: '**', suffix: '**' },
    italic: { icon: 'format_italic', title: '기울임', prefix: '_', suffix: '_' },
    strikethrough: { icon: 'strikethrough_s', title: '취소선', prefix: '~~', suffix: '~~' },
    h1: { icon: 'looks_one', title: '제목 1', prefix: '# ', suffix: '' },
    h2: { icon: 'looks_two', title: '제목 2', prefix: '## ', suffix: '' },
    h3: { icon: 'looks_3', title: '제목 3', prefix: '### ', suffix: '' },
    ul: { icon: 'format_list_bulleted', title: '순서 없는 목록', prefix: '- ', suffix: '' },
    ol: { icon: 'format_list_numbered', title: '순서 있는 목록', prefix: '1. ', suffix: '' },
    task: { icon: 'check_box', title: '체크리스트', prefix: '- [ ] ', suffix: '' },
    link: { icon: 'link', title: '링크', prefix: '[', suffix: '](url)' },
    image: { icon: 'image', title: '이미지', prefix: '![alt](', suffix: ')' },
    code: { icon: 'code', title: '인라인 코드', prefix: '`', suffix: '`' },
    codeblock: { icon: 'integration_instructions', title: '코드 블록', prefix: '```\n', suffix: '\n```' },
    quote: { icon: 'format_quote', title: '인용구', prefix: '> ', suffix: '' },
    hr: { icon: 'horizontal_rule', title: '구분선', insert: '\n---\n' },
    table: { icon: 'table_chart', title: '테이블', insert: '\n| 제목 1 | 제목 2 |\n|--------|--------|\n| 내용 1 | 내용 2 |\n' },
  };

  /**
   * @param {string|HTMLElement} selector
   * @param {Object} options
   */
  constructor(selector, options = {}) {
    this.container = typeof selector === 'string' 
      ? document.querySelector(selector) 
      : selector;
    
    if (!this.container) {
      console.error('MarkdownEditor: Container not found');
      return;
    }

    this.options = { ...MarkdownEditor.defaults(), ...options };
    this.toolbar = null;
    this.textarea = null;
    this.preview = null;
    this._activeTab = 'edit';
    this._onInput = null;
    
    this.init();
    MarkdownEditor.instances.set(this.container, this);
  }

  init() {
    this._render();
    this._bindEvents();
    
    if (this.options.value) {
      this.setValue(this.options.value);
    }
  }

  _render() {
    const { splitView, preview, minHeight } = this.options;
    
    this.container.className = `markdown-editor ${splitView ? 'markdown-editor--split' : 'markdown-editor--tabs'}`;
    
    // 툴바
    this.toolbar = document.createElement('div');
    this.toolbar.className = 'markdown-editor__toolbar';
    this.toolbar.innerHTML = this._renderToolbar();
    
    // 탭 (split view 아닐 때)
    let tabs = '';
    if (!splitView && preview) {
      tabs = `
        <div class="markdown-editor__tabs">
          <button type="button" class="markdown-editor__tab is-active" data-tab="edit">편집</button>
          <button type="button" class="markdown-editor__tab" data-tab="preview">미리보기</button>
        </div>
      `;
    }
    
    // 에디터 영역
    const editorArea = document.createElement('div');
    editorArea.className = 'markdown-editor__body';
    editorArea.style.minHeight = `${minHeight}px`;
    
    // Textarea
    this.textarea = document.createElement('textarea');
    this.textarea.className = 'markdown-editor__input';
    this.textarea.placeholder = this.options.placeholder;
    
    // Preview
    if (preview) {
      this.preview = document.createElement('div');
      this.preview.className = 'markdown-editor__preview markdown-content';
    }
    
    editorArea.innerHTML = splitView ? `
      <div class="markdown-editor__pane markdown-editor__pane--edit"></div>
      ${preview ? '<div class="markdown-editor__pane markdown-editor__pane--preview"></div>' : ''}
    ` : `
      <div class="markdown-editor__pane markdown-editor__pane--edit"></div>
      ${preview ? '<div class="markdown-editor__pane markdown-editor__pane--preview" style="display:none;"></div>' : ''}
    `;
    
    this.container.innerHTML = '';
    this.container.appendChild(this.toolbar);
    
    if (tabs) {
      this.container.insertAdjacentHTML('beforeend', tabs);
    }
    
    this.container.appendChild(editorArea);
    
    // Append textarea and preview
    const editPane = editorArea.querySelector('.markdown-editor__pane--edit');
    editPane.appendChild(this.textarea);
    
    if (this.preview) {
      const previewPane = editorArea.querySelector('.markdown-editor__pane--preview');
      previewPane.appendChild(this.preview);
    }
  }

  _renderToolbar() {
    return this.options.toolbar.map(item => {
      if (item === '|') {
        return '<span class="markdown-editor__separator"></span>';
      }
      
      const btn = MarkdownEditor.toolbarButtons[item];
      if (!btn) return '';
      
      return `
        <button type="button" class="markdown-editor__btn" data-action="${item}" title="${btn.title}">
          <i class="material-icons-outlined">${btn.icon}</i>
        </button>
      `;
    }).join('');
  }

  _bindEvents() {
    // 툴바 클릭
    this.toolbar.addEventListener('click', (e) => {
      const btn = e.target.closest('.markdown-editor__btn');
      if (!btn) return;
      
      e.preventDefault();
      const action = btn.dataset.action;
      this._handleToolbarAction(action);
    });
    
    // 입력 이벤트
    this._onInput = () => {
      this._updatePreview();
      if (this.options.onChange) {
        this.options.onChange(this.getValue());
      }
    };
    this.textarea.addEventListener('input', this._onInput);
    
    // 탭 전환
    const tabs = this.container.querySelector('.markdown-editor__tabs');
    if (tabs) {
      tabs.addEventListener('click', (e) => {
        const tab = e.target.closest('.markdown-editor__tab');
        if (!tab) return;
        
        this._switchTab(tab.dataset.tab);
      });
    }
    
    // 키보드 단축키
    this.textarea.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'b':
            e.preventDefault();
            this._handleToolbarAction('bold');
            break;
          case 'i':
            e.preventDefault();
            this._handleToolbarAction('italic');
            break;
        }
      }
      
      // Tab 키로 들여쓰기
      if (e.key === 'Tab') {
        e.preventDefault();
        const start = this.textarea.selectionStart;
        const end = this.textarea.selectionEnd;
        const value = this.textarea.value;
        
        this.textarea.value = value.substring(0, start) + '  ' + value.substring(end);
        this.textarea.selectionStart = this.textarea.selectionEnd = start + 2;
        this._updatePreview();
      }
    });
  }

  _handleToolbarAction(action) {
    const btn = MarkdownEditor.toolbarButtons[action];
    if (!btn) return;
    
    const start = this.textarea.selectionStart;
    const end = this.textarea.selectionEnd;
    const value = this.textarea.value;
    const selection = value.substring(start, end);
    
    let newText;
    let cursorPos;
    
    if (btn.insert) {
      // 삽입형 (테이블, 구분선 등)
      newText = value.substring(0, start) + btn.insert + value.substring(end);
      cursorPos = start + btn.insert.length;
    } else {
      // 래핑형
      const prefix = btn.prefix || '';
      const suffix = btn.suffix || '';
      
      newText = value.substring(0, start) + prefix + selection + suffix + value.substring(end);
      cursorPos = selection ? start + prefix.length + selection.length + suffix.length : start + prefix.length;
    }
    
    this.textarea.value = newText;
    this.textarea.selectionStart = this.textarea.selectionEnd = cursorPos;
    this.textarea.focus();
    this._updatePreview();
    
    if (this.options.onChange) {
      this.options.onChange(this.getValue());
    }
  }

  _switchTab(tab) {
    this._activeTab = tab;
    
    const tabs = this.container.querySelectorAll('.markdown-editor__tab');
    tabs.forEach(t => t.classList.toggle('is-active', t.dataset.tab === tab));
    
    const editPane = this.container.querySelector('.markdown-editor__pane--edit');
    const previewPane = this.container.querySelector('.markdown-editor__pane--preview');
    
    if (tab === 'edit') {
      editPane.style.display = '';
      if (previewPane) previewPane.style.display = 'none';
    } else {
      editPane.style.display = 'none';
      if (previewPane) previewPane.style.display = '';
      this._updatePreview();
    }
  }

  _updatePreview() {
    if (!this.preview) return;
    
    const markdown = this.textarea.value;
    this.preview.innerHTML = this._parseMarkdown(markdown);
  }

  /**
   * 간단한 마크다운 파서 (데모용)
   * 실제 프로젝트에서는 marked.js 등 사용 권장
   */
  _parseMarkdown(text) {
    if (!text) return '';
    
    let html = text;
    
    // Escape HTML
    html = html.replace(/&/g, '&amp;')
               .replace(/</g, '&lt;')
               .replace(/>/g, '&gt;');
    
    // Code blocks (triple backticks)
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');
    
    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    
    // Bold
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    // Italic
    html = html.replace(/_([^_]+)_/g, '<em>$1</em>');
    
    // Strikethrough
    html = html.replace(/~~([^~]+)~~/g, '<del>$1</del>');
    
    // Blockquotes
    html = html.replace(/^&gt; (.*$)/gim, '<blockquote>$1</blockquote>');
    
    // Horizontal rules
    html = html.replace(/^---$/gim, '<hr>');
    
    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    
    // Images
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');
    
    // Task lists
    html = html.replace(/^- \[x\] (.*$)/gim, '<div class="task-item"><input type="checkbox" checked disabled> $1</div>');
    html = html.replace(/^- \[ \] (.*$)/gim, '<div class="task-item"><input type="checkbox" disabled> $1</div>');
    
    // Unordered lists
    html = html.replace(/^- (.*$)/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');
    
    // Ordered lists
    html = html.replace(/^\d+\. (.*$)/gim, '<li>$1</li>');
    
    // Paragraphs
    html = html.replace(/\n\n/g, '</p><p>');
    html = '<p>' + html + '</p>';
    html = html.replace(/<p><\/p>/g, '');
    html = html.replace(/<p>(<h[1-6]>)/g, '$1');
    html = html.replace(/(<\/h[1-6]>)<\/p>/g, '$1');
    html = html.replace(/<p>(<pre>)/g, '$1');
    html = html.replace(/(<\/pre>)<\/p>/g, '$1');
    html = html.replace(/<p>(<ul>)/g, '$1');
    html = html.replace(/(<\/ul>)<\/p>/g, '$1');
    html = html.replace(/<p>(<blockquote>)/g, '$1');
    html = html.replace(/(<\/blockquote>)<\/p>/g, '$1');
    html = html.replace(/<p>(<hr>)<\/p>/g, '$1');
    
    // Line breaks
    html = html.replace(/\n/g, '<br>');
    
    return html;
  }

  /**
   * 값 설정
   * @param {string} value
   */
  setValue(value) {
    this.textarea.value = value;
    this._updatePreview();
  }

  /**
   * 값 반환
   * @returns {string}
   */
  getValue() {
    return this.textarea.value;
  }

  /**
   * HTML 반환 (파싱된)
   * @returns {string}
   */
  getHTML() {
    return this._parseMarkdown(this.textarea.value);
  }

  /**
   * 내용 초기화
   */
  clear() {
    this.textarea.value = '';
    this._updatePreview();
  }

  /**
   * 포커스
   */
  focus() {
    this.textarea.focus();
  }

  destroy() {
    if (this._onInput) {
      this.textarea.removeEventListener('input', this._onInput);
    }
    
    MarkdownEditor.instances.delete(this.container);
    
    if (this.container) {
      this.container.innerHTML = '';
    }
    
    this.container = null;
    this.toolbar = null;
    this.textarea = null;
    this.preview = null;
  }
}


// ============================================
// TextareaAutosize - 자동 높이 조절 Textarea
// ============================================

/**
 * TextareaAutosize 클래스
 * 내용에 따라 자동으로 높이 조절
 */
class TextareaAutosize {
  /** @type {Map<HTMLElement, TextareaAutosize>} */
  static instances = new Map();

  /**
   * 기본 옵션
   * @returns {Object}
   */
  static defaults() {
    return {
      minRows: 2,
      maxRows: 10,
      onChange: null,
    };
  }

  /**
   * @param {string|HTMLElement} selector
   * @param {Object} options
   */
  constructor(selector, options = {}) {
    this.textarea = typeof selector === 'string' 
      ? document.querySelector(selector) 
      : selector;
    
    if (!this.textarea || this.textarea.tagName !== 'TEXTAREA') {
      console.error('TextareaAutosize: Textarea not found');
      return;
    }

    this.options = { ...TextareaAutosize.defaults(), ...options };
    this._onInput = null;
    this._lineHeight = 0;
    
    this.init();
    TextareaAutosize.instances.set(this.textarea, this);
  }

  init() {
    this._calculateLineHeight();
    this._bindEvents();
    this._resize();
  }

  _calculateLineHeight() {
    const computed = window.getComputedStyle(this.textarea);
    this._lineHeight = parseFloat(computed.lineHeight) || parseFloat(computed.fontSize) * 1.2;
    
    const { minRows, maxRows } = this.options;
    const paddingY = parseFloat(computed.paddingTop) + parseFloat(computed.paddingBottom);
    const borderY = parseFloat(computed.borderTopWidth) + parseFloat(computed.borderBottomWidth);
    
    this.textarea.style.minHeight = `${minRows * this._lineHeight + paddingY + borderY}px`;
    if (maxRows) {
      this.textarea.style.maxHeight = `${maxRows * this._lineHeight + paddingY + borderY}px`;
    }
    this.textarea.style.overflow = 'hidden';
  }

  _bindEvents() {
    this._onInput = () => {
      this._resize();
      if (this.options.onChange) {
        this.options.onChange(this.textarea.value);
      }
    };
    
    this.textarea.addEventListener('input', this._onInput);
  }

  _resize() {
    this.textarea.style.height = 'auto';
    this.textarea.style.height = `${this.textarea.scrollHeight}px`;
  }

  /**
   * 수동으로 리사이즈
   */
  resize() {
    this._resize();
  }

  destroy() {
    if (this._onInput) {
      this.textarea.removeEventListener('input', this._onInput);
    }
    
    this.textarea.style.minHeight = '';
    this.textarea.style.maxHeight = '';
    this.textarea.style.height = '';
    this.textarea.style.overflow = '';
    
    TextareaAutosize.instances.delete(this.textarea);
    this.textarea = null;
  }
}


// ============================================
// Export
// ============================================

export { RichTextEditor, MarkdownEditor, TextareaAutosize };
export default { RichTextEditor, MarkdownEditor, TextareaAutosize };
