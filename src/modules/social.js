/**
 * Social Components Module
 * Chat UI, Comments, Share, Reactions
 * @module modules/social
 */

// ============================================
// ChatUI - 채팅 인터페이스
// ============================================

/**
 * ChatUI 클래스
 * 실시간 채팅 인터페이스
 */
class ChatUI {
  /** @type {Map<HTMLElement, ChatUI>} */
  static instances = new Map();

  /**
   * 기본 옵션
   * @returns {Object}
   */
  static defaults() {
    return {
      messages: [],
      currentUser: { id: 'user1', name: '나', avatar: '' },
      placeholder: '메시지를 입력하세요...',
      showTimestamp: true,
      showAvatar: true,
      groupMessages: true,
      onSend: null,          // (message) => {}
      onTyping: null        // () => {}
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
      console.error('ChatUI: Container not found');
      return;
    }

    this.options = { ...ChatUI.defaults(), ...options };
    this._messages = [...this.options.messages];
    this._typingUsers = [];

    this.init();
    ChatUI.instances.set(this.container, this);
  }

  init() {
    this._render();
    this._bindEvents();
    this._scrollToBottom();
  }

  _render() {
    this.container.className = 'chat-ui';

    this.container.innerHTML = `
      <div class="chat-ui__messages"></div>
      <div class="chat-ui__typing"></div>
      <div class="chat-ui__input-area">
        <button class="chat-ui__btn chat-ui__btn--attach" type="button" aria-label="파일 첨부">
          <i class="material-icons-outlined">attach_file</i>
        </button>
        <div class="chat-ui__input-wrapper">
          <textarea class="chat-ui__input" placeholder="${this.options.placeholder}" rows="1"></textarea>
        </div>
        <button class="chat-ui__btn chat-ui__btn--emoji" type="button" aria-label="이모지">
          <i class="material-icons-outlined">emoji_emotions</i>
        </button>
        <button class="chat-ui__btn chat-ui__btn--send" type="button" aria-label="전송">
          <i class="material-icons-outlined">send</i>
        </button>
      </div>
    `;

    this.messagesContainer = this.container.querySelector('.chat-ui__messages');
    this.typingContainer = this.container.querySelector('.chat-ui__typing');
    this.input = this.container.querySelector('.chat-ui__input');
    this.sendBtn = this.container.querySelector('.chat-ui__btn--send');

    this._renderMessages();
  }

  _renderMessages() {
    let html = '';
    let lastUserId = null;
    let lastDate = null;

    this._messages.forEach((msg, _index) => {
      const isOwn = msg.userId === this.options.currentUser.id;
      const isSameUser = msg.userId === lastUserId;
      const msgDate = new Date(msg.timestamp).toDateString();
      const isNewDate = msgDate !== lastDate;

      // 날짜 구분선
      if (isNewDate) {
        html += `<div class="chat-ui__date-divider">${this._formatDate(msg.timestamp)}</div>`;
        lastDate = msgDate;
      }

      // 그룹화된 메시지인지 확인
      const isGrouped = this.options.groupMessages && isSameUser && !isNewDate;

      html += `
        <div class="chat-ui__message ${isOwn ? 'chat-ui__message--own' : ''} ${isGrouped ? 'chat-ui__message--grouped' : ''}">
          ${!isOwn && this.options.showAvatar && !isGrouped ? `
            <div class="chat-ui__avatar">
              ${msg.avatar
    ? `<img src="${msg.avatar}" alt="${msg.userName}">`
    : `<span>${msg.userName?.charAt(0) || '?'}</span>`
}
            </div>
          ` : ''}
          
          <div class="chat-ui__bubble">
            ${!isOwn && !isGrouped ? `<div class="chat-ui__sender">${msg.userName}</div>` : ''}
            <div class="chat-ui__text">${this._escapeHtml(msg.text)}</div>
            ${this.options.showTimestamp ? `
              <div class="chat-ui__time">${this._formatTime(msg.timestamp)}</div>
            ` : ''}
          </div>
        </div>
      `;

      lastUserId = msg.userId;
    });

    this.messagesContainer.innerHTML = html;
  }

  _bindEvents() {
    // 전송 버튼
    this.sendBtn.addEventListener('click', () => this._sendMessage());

    // Enter 키로 전송
    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this._sendMessage();
      }
    });

    // 입력 시 타이핑 이벤트
    let typingTimer;
    this.input.addEventListener('input', () => {
      // 자동 높이 조절
      this.input.style.height = 'auto';
      this.input.style.height = Math.min(this.input.scrollHeight, 120) + 'px';

      // 타이핑 이벤트
      if (this.options.onTyping) {
        this.options.onTyping();
      }

      clearTimeout(typingTimer);
      typingTimer = setTimeout(() => {
        // 타이핑 종료
      }, 1000);
    });
  }

  _sendMessage() {
    const text = this.input.value.trim();
    if (!text) return;

    const message = {
      id: Date.now().toString(),
      userId: this.options.currentUser.id,
      userName: this.options.currentUser.name,
      avatar: this.options.currentUser.avatar,
      text,
      timestamp: new Date().toISOString()
    };

    this.addMessage(message);
    this.input.value = '';
    this.input.style.height = 'auto';

    if (this.options.onSend) {
      this.options.onSend(message);
    }
  }

  _formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  }

  _formatDate(timestamp) {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return '오늘';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return '어제';
    }

    return date.toLocaleDateString('ko-KR', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  _escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML.replace(/\n/g, '<br>');
  }

  _scrollToBottom() {
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }

  // Public API
  addMessage(message) {
    this._messages.push(message);
    this._renderMessages();
    this._scrollToBottom();
  }

  setMessages(messages) {
    this._messages = [...messages];
    this._renderMessages();
    this._scrollToBottom();
  }

  clearMessages() {
    this._messages = [];
    this._renderMessages();
  }

  showTyping(users) {
    this._typingUsers = users;
    if (users.length > 0) {
      const names = users.map(u => u.name).join(', ');
      this.typingContainer.innerHTML = `
        <span class="chat-ui__typing-indicator">
          <span class="chat-ui__typing-dot"></span>
          <span class="chat-ui__typing-dot"></span>
          <span class="chat-ui__typing-dot"></span>
        </span>
        <span>${names}님이 입력 중...</span>
      `;
      this.typingContainer.classList.add('is-visible');
    } else {
      this.typingContainer.classList.remove('is-visible');
    }
  }

  hideTyping() {
    this._typingUsers = [];
    this.typingContainer.classList.remove('is-visible');
  }

  destroy() {
    ChatUI.instances.delete(this.container);
    this.container.innerHTML = '';
    this.container = null;
  }
}


// ============================================
// Comments - 댓글 시스템
// ============================================

/**
 * Comments 클래스
 * 댓글/답글 시스템
 */
class Comments {
  /** @type {Map<HTMLElement, Comments>} */
  static instances = new Map();

  /**
   * 기본 옵션
   * @returns {Object}
   */
  static defaults() {
    return {
      comments: [],
      currentUser: null,      // { id, name, avatar }
      allowReplies: true,
      allowEdit: true,
      allowDelete: true,
      maxDepth: 3,            // 답글 최대 깊이
      placeholder: '댓글을 입력하세요...',
      onSubmit: null,         // (comment) => {}
      onEdit: null,           // (id, newText) => {}
      onDelete: null,         // (id) => {}
      onLike: null           // (id) => {}
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
      console.error('Comments: Container not found');
      return;
    }

    this.options = { ...Comments.defaults(), ...options };
    this._comments = [...this.options.comments];

    this.init();
    Comments.instances.set(this.container, this);
  }

  init() {
    this._render();
    this._bindEvents();
  }

  _render() {
    this.container.className = 'comments';

    const commentsHtml = this._renderComments(this._comments, 0);

    this.container.innerHTML = `
      <div class="comments__header">
        <h3 class="comments__title">댓글 <span class="comments__count">${this._countComments()}</span></h3>
      </div>
      
      ${this.options.currentUser ? `
        <div class="comments__form comments__form--main">
          <div class="comments__avatar">
            ${this.options.currentUser.avatar
    ? `<img src="${this.options.currentUser.avatar}" alt="${this.options.currentUser.name}">`
    : `<span>${this.options.currentUser.name?.charAt(0) || '?'}</span>`
}
          </div>
          <div class="comments__input-area">
            <textarea class="comments__input" placeholder="${this.options.placeholder}"></textarea>
            <div class="comments__form-actions">
              <button class="btn btn--primary btn--sm comments__submit" type="button">댓글 작성</button>
            </div>
          </div>
        </div>
      ` : ''}
      
      <div class="comments__list">${commentsHtml}</div>
    `;
  }

  _renderComments(comments, depth) {
    return comments.map(comment => this._renderComment(comment, depth)).join('');
  }

  _renderComment(comment, depth) {
    const isOwn = comment.userId === this.options.currentUser?.id;
    const canReply = this.options.allowReplies && depth < this.options.maxDepth;
    const canEdit = this.options.allowEdit && isOwn;
    const canDelete = this.options.allowDelete && isOwn;

    const repliesHtml = comment.replies?.length > 0
      ? `<div class="comments__replies">${this._renderComments(comment.replies, depth + 1)}</div>`
      : '';

    return `
      <div class="comments__item" data-id="${comment.id}" data-depth="${depth}">
        <div class="comments__avatar">
          ${comment.avatar
    ? `<img src="${comment.avatar}" alt="${comment.userName}">`
    : `<span>${comment.userName?.charAt(0) || '?'}</span>`
}
        </div>
        
        <div class="comments__content">
          <div class="comments__meta">
            <span class="comments__author">${comment.userName}</span>
            <span class="comments__date">${this._formatDate(comment.createdAt)}</span>
            ${comment.edited ? '<span class="comments__edited">(수정됨)</span>' : ''}
          </div>
          
          <div class="comments__text">${this._escapeHtml(comment.text)}</div>
          
          <div class="comments__actions">
            <button class="comments__action comments__action--like ${comment.liked ? 'is-liked' : ''}" data-action="like">
              <i class="material-icons-outlined">${comment.liked ? 'favorite' : 'favorite_border'}</i>
              <span>${comment.likes || 0}</span>
            </button>
            
            ${canReply ? `
              <button class="comments__action" data-action="reply">
                <i class="material-icons-outlined">reply</i>
                <span>답글</span>
              </button>
            ` : ''}
            
            ${canEdit ? `
              <button class="comments__action" data-action="edit">
                <i class="material-icons-outlined">edit</i>
                <span>수정</span>
              </button>
            ` : ''}
            
            ${canDelete ? `
              <button class="comments__action" data-action="delete">
                <i class="material-icons-outlined">delete</i>
                <span>삭제</span>
              </button>
            ` : ''}
          </div>
          
          <div class="comments__reply-form" style="display: none;"></div>
        </div>
        
        ${repliesHtml}
      </div>
    `;
  }

  _bindEvents() {
    // 메인 폼 제출
    const mainSubmit = this.container.querySelector('.comments__form--main .comments__submit');
    if (mainSubmit) {
      mainSubmit.addEventListener('click', () => {
        const input = this.container.querySelector('.comments__form--main .comments__input');
        this._submitComment(input.value.trim());
        input.value = '';
      });
    }

    // 댓글 액션
    this.container.addEventListener('click', (e) => {
      const btn = e.target.closest('.comments__action');
      if (!btn) return;

      const item = btn.closest('.comments__item');
      const id = item.dataset.id;
      const action = btn.dataset.action;

      switch (action) {
        case 'like':
          this._handleLike(id);
          break;
        case 'reply':
          this._showReplyForm(item);
          break;
        case 'edit':
          this._handleEdit(id);
          break;
        case 'delete':
          this._handleDelete(id);
          break;
      }
    });
  }

  _submitComment(text, parentId = null) {
    if (!text || !this.options.currentUser) return;

    const comment = {
      id: Date.now().toString(),
      userId: this.options.currentUser.id,
      userName: this.options.currentUser.name,
      avatar: this.options.currentUser.avatar,
      text,
      createdAt: new Date().toISOString(),
      likes: 0,
      liked: false,
      replies: []
    };

    if (parentId) {
      this._addReply(this._comments, parentId, comment);
    } else {
      this._comments.unshift(comment);
    }

    this._render();
    this._bindEvents();

    if (this.options.onSubmit) {
      this.options.onSubmit({ ...comment, parentId });
    }
  }

  _addReply(comments, parentId, reply) {
    for (const comment of comments) {
      if (comment.id === parentId) {
        comment.replies = comment.replies || [];
        comment.replies.push(reply);
        return true;
      }
      if (comment.replies?.length > 0) {
        if (this._addReply(comment.replies, parentId, reply)) return true;
      }
    }
    return false;
  }

  _showReplyForm(item) {
    const replyForm = item.querySelector('.comments__reply-form');
    const isVisible = replyForm.style.display !== 'none';

    if (isVisible) {
      replyForm.style.display = 'none';
      replyForm.innerHTML = '';
      return;
    }

    replyForm.style.display = 'block';
    replyForm.innerHTML = `
      <div class="comments__form">
        <textarea class="comments__input comments__input--reply" placeholder="답글을 입력하세요..."></textarea>
        <div class="comments__form-actions">
          <button class="btn btn--outline-secondary btn--sm comments__cancel" type="button">취소</button>
          <button class="btn btn--primary btn--sm comments__reply-submit" type="button">답글 작성</button>
        </div>
      </div>
    `;

    const input = replyForm.querySelector('.comments__input--reply');
    input.focus();

    replyForm.querySelector('.comments__cancel').addEventListener('click', () => {
      replyForm.style.display = 'none';
      replyForm.innerHTML = '';
    });

    replyForm.querySelector('.comments__reply-submit').addEventListener('click', () => {
      const text = input.value.trim();
      if (text) {
        this._submitComment(text, item.dataset.id);
      }
    });
  }

  _handleLike(id) {
    this._toggleLike(this._comments, id);
    this._render();
    this._bindEvents();

    if (this.options.onLike) {
      this.options.onLike(id);
    }
  }

  _toggleLike(comments, id) {
    for (const comment of comments) {
      if (comment.id === id) {
        comment.liked = !comment.liked;
        comment.likes = (comment.likes || 0) + (comment.liked ? 1 : -1);
        return true;
      }
      if (comment.replies?.length > 0) {
        if (this._toggleLike(comment.replies, id)) return true;
      }
    }
    return false;
  }

  _handleEdit(id) {
    const newText = prompt('댓글 수정:');
    if (newText === null) return;

    this._editComment(this._comments, id, newText);
    this._render();
    this._bindEvents();

    if (this.options.onEdit) {
      this.options.onEdit(id, newText);
    }
  }

  _editComment(comments, id, newText) {
    for (const comment of comments) {
      if (comment.id === id) {
        comment.text = newText;
        comment.edited = true;
        return true;
      }
      if (comment.replies?.length > 0) {
        if (this._editComment(comment.replies, id, newText)) return true;
      }
    }
    return false;
  }

  _handleDelete(id) {
    if (!confirm('댓글을 삭제하시겠습니까?')) return;

    this._deleteComment(this._comments, id);
    this._render();
    this._bindEvents();

    if (this.options.onDelete) {
      this.options.onDelete(id);
    }
  }

  _deleteComment(comments, id, _parent = null) {
    const index = comments.findIndex(c => c.id === id);
    if (index !== -1) {
      comments.splice(index, 1);
      return true;
    }

    for (const comment of comments) {
      if (comment.replies?.length > 0) {
        if (this._deleteComment(comment.replies, id, comment)) return true;
      }
    }
    return false;
  }

  _countComments() {
    const count = (comments) => comments.reduce((sum, c) => sum + 1 + (c.replies ? count(c.replies) : 0), 0);
    return count(this._comments);
  }

  _formatDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;

    return date.toLocaleDateString('ko-KR');
  }

  _escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML.replace(/\n/g, '<br>');
  }

  // Public API
  addComment(comment) {
    this._comments.unshift(comment);
    this._render();
    this._bindEvents();
  }

  setComments(comments) {
    this._comments = [...comments];
    this._render();
    this._bindEvents();
  }

  destroy() {
    Comments.instances.delete(this.container);
    this.container.innerHTML = '';
    this.container = null;
  }
}


// ============================================
// ShareButtons - 공유 버튼
// ============================================

/**
 * ShareButtons 클래스
 * 소셜 공유 버튼
 */
class ShareButtons {
  /** @type {Map<HTMLElement, ShareButtons>} */
  static instances = new Map();

  /**
   * 기본 옵션
   * @returns {Object}
   */
  static defaults() {
    return {
      url: '',               // 공유할 URL (기본: 현재 페이지)
      title: '',             // 공유 제목
      description: '',       // 공유 설명
      image: '',             // 공유 이미지
      platforms: ['copy', 'twitter', 'facebook', 'linkedin', 'email'],
      layout: 'horizontal',  // 'horizontal' | 'vertical'
      size: 'md',            // 'sm' | 'md' | 'lg'
      showLabels: false,
      onShare: null         // (platform) => {}
    };
  }

  /**
   * 플랫폼 정의
   */
  static platforms = {
    copy: { icon: 'content_copy', label: '링크 복사', color: '#6b7280' },
    twitter: { icon: 'X', label: 'Twitter', color: '#1DA1F2' },
    facebook: { icon: 'f', label: 'Facebook', color: '#4267B2' },
    linkedin: { icon: 'in', label: 'LinkedIn', color: '#0077B5' },
    email: { icon: 'email', label: 'Email', color: '#EA4335' },
    whatsapp: { icon: 'W', label: 'WhatsApp', color: '#25D366' },
    telegram: { icon: 'T', label: 'Telegram', color: '#0088cc' },
    kakaotalk: { icon: 'K', label: 'KakaoTalk', color: '#FEE500' }
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
      console.error('ShareButtons: Container not found');
      return;
    }

    this.options = { ...ShareButtons.defaults(), ...options };

    // URL 기본값
    if (!this.options.url) {
      this.options.url = window.location.href;
    }
    if (!this.options.title) {
      this.options.title = document.title;
    }

    this.init();
    ShareButtons.instances.set(this.container, this);
  }

  init() {
    this._render();
    this._bindEvents();
  }

  _render() {
    const { platforms, layout, size, showLabels } = this.options;

    this.container.className = `share-buttons share-buttons--${layout} share-buttons--${size}`;

    this.container.innerHTML = platforms.map(platform => {
      const p = ShareButtons.platforms[platform];
      if (!p) return '';

      const isIconMaterial = p.icon.length > 2;

      return `
        <button class="share-buttons__btn share-buttons__btn--${platform}" 
                data-platform="${platform}"
                style="--share-color: ${p.color}"
                type="button"
                aria-label="${p.label}">
          ${isIconMaterial
    ? `<i class="material-icons-outlined">${p.icon}</i>`
    : `<span class="share-buttons__icon-text">${p.icon}</span>`
}
          ${showLabels ? `<span class="share-buttons__label">${p.label}</span>` : ''}
        </button>
      `;
    }).join('');
  }

  _bindEvents() {
    this.container.addEventListener('click', (e) => {
      const btn = e.target.closest('.share-buttons__btn');
      if (!btn) return;

      const platform = btn.dataset.platform;
      this._share(platform);
    });
  }

  async _share(platform) {
    const { url, title, description } = this.options;
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);
    const encodedDesc = encodeURIComponent(description);

    let shareUrl = '';

    switch (platform) {
      case 'copy':
        await this._copyToClipboard(url);
        return;

      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
        break;

      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;

      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;

      case 'email':
        shareUrl = `mailto:?subject=${encodedTitle}&body=${encodedDesc}%0A%0A${encodedUrl}`;
        window.location.href = shareUrl;
        if (this.options.onShare) this.options.onShare(platform);
        return;

      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`;
        break;

      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`;
        break;

      case 'kakaotalk':
        // KakaoTalk SDK 필요
        alert('KakaoTalk 공유는 Kakao SDK가 필요합니다.');
        return;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }

    if (this.options.onShare) {
      this.options.onShare(platform);
    }
  }

  async _copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);

      // 복사 완료 피드백
      const copyBtn = this.container.querySelector('.share-buttons__btn--copy');
      if (copyBtn) {
        copyBtn.classList.add('is-copied');
        const icon = copyBtn.querySelector('.material-icons-outlined');
        if (icon) icon.textContent = 'check';

        setTimeout(() => {
          copyBtn.classList.remove('is-copied');
          if (icon) icon.textContent = 'content_copy';
        }, 2000);
      }

      if (this.options.onShare) {
        this.options.onShare('copy');
      }
    } catch (err) {
      console.error('Copy failed:', err);
    }
  }

  // Public API
  setUrl(url) {
    this.options.url = url;
  }

  setTitle(title) {
    this.options.title = title;
  }

  destroy() {
    ShareButtons.instances.delete(this.container);
    this.container.innerHTML = '';
    this.container = null;
  }
}


// ============================================
// Reactions - 리액션 버튼
// ============================================

/**
 * Reactions 클래스
 * 이모지 리액션 시스템
 */
class Reactions {
  /** @type {Map<HTMLElement, Reactions>} */
  static instances = new Map();

  /**
   * 기본 옵션
   * @returns {Object}
   */
  static defaults() {
    return {
      reactions: [
        { emoji: '👍', label: '좋아요', count: 0, active: false },
        { emoji: '❤️', label: '사랑해요', count: 0, active: false },
        { emoji: '😂', label: '웃겨요', count: 0, active: false },
        { emoji: '😮', label: '놀랐어요', count: 0, active: false },
        { emoji: '😢', label: '슬퍼요', count: 0, active: false },
        { emoji: '😡', label: '화나요', count: 0, active: false }
      ],
      onReact: null         // (emoji, active) => {}
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
      console.error('Reactions: Container not found');
      return;
    }

    this.options = { ...Reactions.defaults(), ...options };
    this._reactions = [...this.options.reactions];

    this.init();
    Reactions.instances.set(this.container, this);
  }

  init() {
    this._render();
    this._bindEvents();
  }

  _render() {
    this.container.className = 'reactions';

    this.container.innerHTML = this._reactions.map(r => `
      <button class="reactions__btn ${r.active ? 'is-active' : ''}" 
              data-emoji="${r.emoji}"
              type="button"
              title="${r.label}">
        <span class="reactions__emoji">${r.emoji}</span>
        ${r.count > 0 ? `<span class="reactions__count">${r.count}</span>` : ''}
      </button>
    `).join('');
  }

  _bindEvents() {
    this.container.addEventListener('click', (e) => {
      const btn = e.target.closest('.reactions__btn');
      if (!btn) return;

      const emoji = btn.dataset.emoji;
      this._toggleReaction(emoji);
    });
  }

  _toggleReaction(emoji) {
    const reaction = this._reactions.find(r => r.emoji === emoji);
    if (!reaction) return;

    reaction.active = !reaction.active;
    reaction.count = Math.max(0, reaction.count + (reaction.active ? 1 : -1));

    this._render();
    this._bindEvents();

    if (this.options.onReact) {
      this.options.onReact(emoji, reaction.active);
    }
  }

  // Public API
  setReactions(reactions) {
    this._reactions = [...reactions];
    this._render();
    this._bindEvents();
  }

  getReactions() {
    return [...this._reactions];
  }

  destroy() {
    Reactions.instances.delete(this.container);
    this.container.innerHTML = '';
    this.container = null;
  }
}


// ============================================
// Export
// ============================================

export { ChatUI, Comments, ShareButtons, Reactions };
export default { ChatUI, Comments, ShareButtons, Reactions };
