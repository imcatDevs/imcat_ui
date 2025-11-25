# Overlays & Dialogs Module

오버레이 컴포넌트 모듈: Modal, Drawer, Offcanvas, Lightbox

## 📋 개요

Overlays 모듈은 4가지 오버레이 컴포넌트를 제공합니다:

- **Modal**: 모달 다이얼로그
- **Drawer**: 사이드 패널
- **Offcanvas**: 오프캔버스 (Drawer 변형)
- **Lightbox**: 이미지 갤러리/라이트박스

모든 컴포넌트는 공통 `OverlayBase` 클래스를 상속하여 일관된 API를 제공합니다.

## 🚀 사용법

### 모듈 로드

```javascript
// 전체 모듈 로드
const Overlays = await IMCAT.use('overlays');

// 개별 컴포넌트 로드
const { Modal, Drawer, Offcanvas, Lightbox } = await IMCAT.use('overlays');
```

---

## 1️⃣ Modal (모달 다이얼로그)

### 기본 사용법

```javascript
const modal = new Overlays.Modal({
  title: '확인',
  content: '<p>내용을 입력하세요.</p>',
  size: 'md',
  buttons: [
    { text: '취소', action: 'close' },
    { text: '확인', type: 'primary', action: () => console.log('확인!') }
  ]
});

modal.show();
```

### 정적 메서드

#### Confirm Dialog

```javascript
const result = await Modal.confirm({
  title: '삭제 확인',
  content: '정말 삭제하시겠습니까?',
  confirmText: '삭제',
  cancelText: '취소'
});

if (result) {
  console.log('확인 클릭');
} else {
  console.log('취소 클릭');
}
```

#### Alert Dialog

```javascript
await Modal.alert({
  title: '알림',
  content: '저장되었습니다.',
  confirmText: '확인'
});
```

### 옵션

```javascript
{
  // OverlayBase 공통 옵션
  backdrop: true,           // 백드롭 표시 여부
  backdropClose: true,      // 백드롭 클릭 시 닫기
  keyboard: true,           // ESC 키로 닫기
  animation: true,          // 애니메이션 사용
  animationDuration: 300,   // 애니메이션 지속 시간 (ms)
  onShow: null,             // 표시 시 콜백
  onHide: null,             // 숨김 시 콜백
  onDestroy: null,          // 파괴 시 콜백

  // Modal 전용 옵션
  title: '',                // 제목
  content: '',              // 내용 (HTML 또는 HTMLElement)
  size: 'md',               // 크기: sm, md, lg, xl
  centered: false,          // 세로 중앙 정렬
  scrollable: false,        // 스크롤 가능
  closeButton: true,        // 닫기 버튼 표시
  fullscreen: false,        // 전체화면
  buttons: []               // 버튼 배열
}
```

### 버튼 구조

```javascript
buttons: [
  {
    text: '버튼 텍스트',
    type: 'primary',        // primary, secondary, danger 등
    action: () => {}        // 클릭 시 실행할 함수 또는 'close'
  }
]
```

### 메서드

```javascript
modal.show();           // 모달 표시
modal.hide();           // 모달 숨김
modal.destroy();        // 모달 파괴 (메모리 해제)
modal.on('show', fn);   // 이벤트 리스너 등록
```

### 이벤트

- `beforeShow` - 표시 직전
- `show` - 표시 완료
- `beforeHide` - 숨김 직전
- `hide` - 숨김 완료

---

## 2️⃣ Drawer (사이드 패널)

### 기본 사용법

```javascript
const drawer = new Overlays.Drawer({
  position: 'right',
  title: '설정',
  content: '<div>설정 내용</div>',
  width: '320px'
});

drawer.show();
```

### 옵션

```javascript
{
  // OverlayBase 공통 옵션
  backdrop: true,
  backdropClose: true,
  keyboard: true,
  animation: true,
  animationDuration: 300,
  onShow: null,
  onHide: null,
  onDestroy: null,

  // Drawer 전용 옵션
  position: 'right',        // 위치: left, right, top, bottom
  title: '',                // 제목
  content: '',              // 내용 (HTML 또는 HTMLElement)
  closeButton: true,        // 닫기 버튼 표시
  width: '320px',           // 너비 (left/right 위치)
  height: '100%'            // 높이 (top/bottom 위치)
}
```

### 예시: 왼쪽 Drawer

```javascript
const leftDrawer = new Overlays.Drawer({
  position: 'left',
  title: '메뉴',
  content: `
    <ul>
      <li><a href="#home">홈</a></li>
      <li><a href="#about">소개</a></li>
      <li><a href="#contact">연락처</a></li>
    </ul>
  `
});

leftDrawer.show();
```

---

## 3️⃣ Offcanvas

Drawer의 변형으로 동일한 API를 사용합니다.

```javascript
const offcanvas = new Overlays.Offcanvas({
  position: 'right',
  title: '알림',
  content: '<p>새로운 알림이 있습니다.</p>'
});

offcanvas.show();
```

---

## 4️⃣ Lightbox (이미지 갤러리)

### 기본 사용법

```javascript
const lightbox = new Overlays.Lightbox({
  images: [
    { src: 'image1.jpg', title: '이미지 1' },
    { src: 'image2.jpg', title: '이미지 2' },
    { src: 'image3.jpg', title: '이미지 3' }
  ],
  index: 0
});

lightbox.show();
```

### 간단한 이미지 배열

```javascript
const lightbox = new Overlays.Lightbox({
  images: [
    'image1.jpg',
    'image2.jpg',
    'image3.jpg'
  ]
});
```

### 옵션

```javascript
{
  // OverlayBase 공통 옵션
  backdrop: true,
  backdropClose: true,
  keyboard: true,
  animation: true,
  animationDuration: 300,
  onShow: null,
  onHide: null,
  onDestroy: null,

  // Lightbox 전용 옵션
  images: [],               // 이미지 배열
  index: 0,                 // 시작 인덱스
  captions: true,           // 캡션 표시
  thumbnails: false,        // 썸네일 표시 (미구현)
  closeButton: true,        // 닫기 버튼
  navigation: true,         // 이전/다음 버튼
  zoom: false               // 확대/축소 (미구현)
}
```

### 메서드

```javascript
lightbox.show();           // 라이트박스 표시
lightbox.hide();           // 라이트박스 숨김
lightbox.prev();           // 이전 이미지
lightbox.next();           // 다음 이미지
lightbox.destroy();        // 파괴
```

### 키보드 네비게이션

- `ArrowLeft` - 이전 이미지
- `ArrowRight` - 다음 이미지
- `Escape` - 닫기

---

## 🎯 코어 API 활용

이 모듈은 IMCAT UI 코어 API를 적극 활용합니다:

### DOM API

```javascript
// 요소 생성
const element = DOM.create('div', {
  class: 'modal',
  id: 'modal-1'
});

// 이벤트 처리
element.on('click', handler);
```

### Animation API

```javascript
// 페이드 인
await AnimationUtil.animate(element).fadeIn(300);

// 스케일 인
await AnimationUtil.animate(element).scaleIn(300);
```

### Security API

```javascript
// HTML 새니타이징
const safe = Security.sanitize(userHtml);
```

### Utils API

```javascript
// 랜덤 ID 생성
const id = Utils.randomId('modal');

// 객체 병합
const options = Utils.extend({}, defaults, userOptions);
```

---

## 🔧 고급 사용법

### 이벤트 리스너

```javascript
const modal = new Modal({ title: '제목' });

modal.on('beforeShow', () => {
  console.log('모달이 표시되기 전');
});

modal.on('show', () => {
  console.log('모달이 표시됨');
});

modal.on('hide', () => {
  console.log('모달이 숨겨짐');
});
```

### 프로그래밍 방식 제어

```javascript
const modal = new Modal({
  title: '로딩',
  content: '<div>처리 중...</div>',
  closeButton: false,
  backdropClose: false,
  keyboard: false
});

modal.show();

// 작업 완료 후
setTimeout(() => {
  modal.hide();
}, 3000);
```

### 동적 컨텐츠 로드

```javascript
const modal = new Modal({
  title: '사용자 정보',
  content: '<div class="loading">로딩 중...</div>'
});

modal.show();

// API 호출
fetch('/api/user/123')
  .then(res => res.json())
  .then(data => {
    const body = modal.element.querySelector('.modal__body');
    body.innerHTML = `
      <h3>${data.name}</h3>
      <p>${data.email}</p>
    `;
  });
```

---

## ♿ 접근성

모든 오버레이 컴포넌트는 접근성을 고려하여 구현되었습니다:

- **ARIA 속성**: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
- **포커스 트랩**: 모달/Drawer 내부로 포커스 제한
- **키보드 네비게이션**: ESC, Tab, Arrow 키 지원
- **스크린 리더**: 적절한 레이블 제공

---

## 📱 반응형

모든 컴포넌트는 반응형으로 설계되었습니다:

- **모바일**: 전체 너비로 표시
- **태블릿/데스크톱**: 지정된 크기로 표시

---

## 🎨 테마 지원

라이트/다크 테마를 자동으로 지원합니다:

```html
<html data-theme="dark">
  <!-- 다크 테마 적용 -->
</html>
```

---

## 🔒 보안

- 모든 사용자 입력은 `Security.sanitize()`로 새니타이징됩니다.
- XSS 공격 방지를 위한 자동 이스케이프 처리

---

## 💡 예제

### 파일 업로드 모달

```javascript
const uploadModal = new Modal({
  title: '파일 업로드',
  content: `
    <form id="uploadForm">
      <input type="file" id="fileInput" multiple>
      <div class="progress" style="margin-top: 1rem;">
        <div class="progress-bar" style="width: 0%"></div>
      </div>
    </form>
  `,
  buttons: [
    { text: '취소', action: 'close' },
    { 
      text: '업로드', 
      type: 'primary',
      action: () => {
        // 업로드 로직
      }
    }
  ]
});

uploadModal.show();
```

### 이미지 갤러리

```javascript
// 갤러리 아이템에 클릭 이벤트
document.querySelectorAll('.gallery-item').forEach((item, index) => {
  item.addEventListener('click', () => {
    const images = Array.from(document.querySelectorAll('.gallery-item img'))
      .map(img => ({
        src: img.src,
        title: img.alt
      }));

    const lightbox = new Lightbox({
      images,
      index
    });

    lightbox.show();
  });
});
```

---

## 📚 API 레퍼런스

### 공통 메서드 (모든 컴포넌트)

| 메서드 | 설명 | 반환 |
|--------|------|------|
| `show()` | 오버레이 표시 | `Promise<void>` |
| `hide()` | 오버레이 숨김 | `Promise<void>` |
| `destroy()` | 메모리 해제 | `void` |
| `on(event, handler)` | 이벤트 리스너 등록 | `Function` |

### Modal 정적 메서드

| 메서드 | 설명 | 반환 |
|--------|------|------|
| `Modal.confirm(options)` | 확인 대화상자 | `Promise<boolean>` |
| `Modal.alert(options)` | 알림 대화상자 | `Promise<void>` |

### Lightbox 메서드

| 메서드 | 설명 | 반환 |
|--------|------|------|
| `prev()` | 이전 이미지 | `void` |
| `next()` | 다음 이미지 | `void` |

---

## 🐛 문제 해결

### 백드롭이 표시되지 않음

```javascript
// backdrop 옵션 확인
const modal = new Modal({
  backdrop: true,  // 반드시 true
  // ...
});
```

### 애니메이션이 작동하지 않음

```javascript
// animation 옵션 확인
const modal = new Modal({
  animation: true,  // 반드시 true
  animationDuration: 300,
  // ...
});
```

### 메모리 누수

```javascript
// 사용 후 반드시 destroy() 호출
modal.show();
// ... 작업
modal.hide();
modal.destroy();  // 메모리 해제

// 또는 Router에 등록 (자동 정리)
IMCAT.view.registerInstance(modal);
```

---

## 📦 파일 구조

```
src/modules/overlays/
├── overlays.js       # 모듈 JavaScript
├── overlays.scss     # 모듈 스타일
└── README.md         # 문서 (이 파일)
```

---

## 🚀 다음 단계

- Lightbox에 썸네일 기능 추가
- Lightbox에 확대/축소 기능 추가
- Modal에 드래그 가능 기능 추가
- Drawer에 리사이즈 핸들 추가

---

**IMCAT UI Overlays 모듈로 더 나은 사용자 경험을 제공하세요!** 🎉
