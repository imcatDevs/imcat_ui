# Tooltips & Popovers 모듈

툴팁과 팝오버 컴포넌트를 제공합니다.

## 설치

```javascript
const Tooltips = await IMCAT.use('tooltips');
```

## Tooltip

간단한 텍스트 힌트를 표시합니다.

### 기본 사용법

```javascript
// JavaScript로 생성
const tooltip = new Tooltips.Tooltip('#myButton', {
  content: '버튼 설명입니다'
});

// HTML data 속성으로 생성
<button data-tooltip="버튼 설명입니다">버튼</button>
Tooltips.Tooltip.initAll(); // 자동 초기화
```

### 옵션

| 옵션 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `content` | string | - | 툴팁 내용 |
| `placement` | string | `'top'` | 위치 (top, bottom, left, right) |
| `trigger` | string | `'hover'` | 트리거 (hover, focus, click, manual) |
| `delay` | object | `{ show: 0, hide: 100 }` | 표시/숨김 지연 시간(ms) |
| `offset` | number | `8` | 요소와의 거리(px) |
| `animation` | boolean | `true` | 애니메이션 사용 |
| `html` | boolean | `false` | HTML 콘텐츠 허용 |

### 메서드

```javascript
tooltip.show();              // 표시
tooltip.hide();              // 숨김
tooltip.toggle();            // 토글
tooltip.setContent('새 내용'); // 내용 변경
tooltip.destroy();           // 제거
```

### HTML 속성

```html
<button 
  data-tooltip="툴팁 내용"
  data-placement="bottom"
  data-trigger="click">
  버튼
</button>
```

## Popover

풍부한 콘텐츠를 포함하는 팝업을 표시합니다.

### 기본 사용법

```javascript
const popover = new Tooltips.Popover('#myButton', {
  title: '제목',
  content: '<p>팝오버 내용입니다.</p>'
});
```

### 옵션

| 옵션 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `title` | string | `''` | 팝오버 제목 |
| `content` | string | `''` | 팝오버 내용 (HTML 지원) |
| `placement` | string | `'top'` | 위치 (top, bottom, left, right) |
| `trigger` | string | `'click'` | 트리거 (click, hover, focus, manual) |
| `dismissible` | boolean | `true` | 외부 클릭으로 닫기 |
| `offset` | number | `10` | 요소와의 거리(px) |
| `animation` | boolean | `true` | 애니메이션 사용 |

### 메서드

```javascript
popover.show();               // 표시
popover.hide();               // 숨김
popover.toggle();             // 토글
popover.setContent('새 내용');  // 내용 변경
popover.setTitle('새 제목');    // 제목 변경
popover.destroy();            // 제거
```

### HTML 속성

```html
<button 
  data-popover-title="제목"
  data-popover-content="<p>내용</p>"
  data-placement="right"
  data-trigger="click">
  버튼
</button>
```

## 유틸리티 메서드

```javascript
// 모든 툴팁/팝오버 자동 초기화
Tooltips.initAll();

// 모든 인스턴스 제거
Tooltips.destroyAll();

// 팩토리 메서드
const tooltip = Tooltips.create('tooltip', element, options);
const popover = Tooltips.create('popover', element, options);
```

## 스타일 커스터마이징

### CSS 변수

```css
/* 툴팁 */
.tooltip {
  --tooltip-bg: #1e293b;
  --tooltip-color: #ffffff;
}

/* 팝오버 */
.popover {
  --popover-bg: var(--bg-primary);
  --popover-border: var(--border-color);
}
```

### 크기 변형

```html
<div class="popover popover--sm">...</div>
<div class="popover popover--lg">...</div>
```

### 색상 변형

```html
<div class="popover popover--info">...</div>
<div class="popover popover--success">...</div>
<div class="popover popover--warning">...</div>
<div class="popover popover--danger">...</div>
```

## 접근성

- `role="tooltip"` / `role="dialog"` 자동 설정
- `aria-expanded` 상태 관리
- ESC 키로 닫기 (Popover)
- 포커스 트리거 지원

## 예제

### 다양한 위치

```javascript
// 상단
new Tooltips.Tooltip(el, { placement: 'top', content: '상단' });

// 하단
new Tooltips.Tooltip(el, { placement: 'bottom', content: '하단' });

// 좌측
new Tooltips.Tooltip(el, { placement: 'left', content: '좌측' });

// 우측
new Tooltips.Tooltip(el, { placement: 'right', content: '우측' });
```

### 클릭 트리거 팝오버

```javascript
const popover = new Tooltips.Popover('#btn', {
  title: '확인',
  content: `
    <p>정말 삭제하시겠습니까?</p>
    <div style="display: flex; gap: 8px; margin-top: 12px;">
      <button class="btn btn--danger btn--sm" onclick="deleteItem()">삭제</button>
      <button class="btn btn--secondary btn--sm" onclick="popover.hide()">취소</button>
    </div>
  `,
  placement: 'bottom'
});
```

### 호버 정보 팝오버

```javascript
new Tooltips.Popover('#user', {
  title: '사용자 정보',
  content: `
    <div style="display: flex; gap: 12px;">
      <img src="avatar.jpg" style="width: 48px; height: 48px; border-radius: 50%;">
      <div>
        <strong>홍길동</strong>
        <p style="margin: 4px 0 0; color: var(--text-secondary);">개발자</p>
      </div>
    </div>
  `,
  trigger: 'hover',
  placement: 'right'
});
```
