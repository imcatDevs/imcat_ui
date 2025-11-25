# Navigation Components

네비게이션 컴포넌트 모음 - Tabs, Accordion, Collapse

## 설치

```javascript
const Navigation = await IMCAT.use('navigation');
```

---

## Tabs

탭 네비게이션 컴포넌트

### 기본 사용법

```html
<div class="tabs tabs--horizontal" id="myTabs">
  <div role="tablist" class="tabs__list">
    <button role="tab" class="tabs__tab" aria-selected="true">
      탭 1
    </button>
    <button role="tab" class="tabs__tab">
      탭 2
    </button>
    <button role="tab" class="tabs__tab">
      탭 3
    </button>
  </div>

  <div class="tabs__panels">
    <div role="tabpanel" class="tabs__panel">
      탭 1 콘텐츠
    </div>
    <div role="tabpanel" class="tabs__panel">
      탭 2 콘텐츠
    </div>
    <div role="tabpanel" class="tabs__panel">
      탭 3 콘텐츠
    </div>
  </div>
</div>
```

```javascript
const tabs = new Navigation.Tabs('#myTabs', {
  activeIndex: 0,
  onChange: (index, tab, panel) => {
    console.log('탭 변경:', index);
  }
});
```

### 옵션

| 옵션 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| activeIndex | Number | 0 | 초기 활성 탭 인덱스 |
| orientation | String | 'horizontal' | 방향 (horizontal, vertical) |
| keyboard | Boolean | true | 키보드 네비게이션 활성화 |
| animation | Boolean | true | 애니메이션 활성화 |
| animationDuration | Number | 300 | 애니메이션 시간 (ms) |
| onChange | Function | null | 탭 변경 시 콜백 |
| onDestroy | Function | null | 삭제 시 콜백 |

### 메서드

#### select(index)
특정 탭 선택
```javascript
tabs.select(2); // 3번째 탭 선택
```

#### getActiveIndex()
현재 활성 탭 인덱스 가져오기
```javascript
const index = tabs.getActiveIndex();
```

#### destroy()
Tabs 인스턴스 제거
```javascript
tabs.destroy();
```

### 키보드 단축키

| 키 | 동작 |
|----|------|
| ← / ↑ | 이전 탭 (수평/수직) |
| → / ↓ | 다음 탭 (수평/수직) |
| Home | 첫 번째 탭 |
| End | 마지막 탭 |

### 예제

#### 수직 탭
```javascript
const tabs = new Navigation.Tabs('#myTabs', {
  orientation: 'vertical'
});
```

#### 아이콘 + 텍스트
```html
<button role="tab" class="tabs__tab">
  <i class="material-icons-outlined tabs__tab-icon">home</i>
  홈
</button>
```

#### 배지 포함
```html
<button role="tab" class="tabs__tab">
  메시지
  <span class="tabs__tab-badge">5</span>
</button>
```

---

## Accordion

**상태:** 향후 구현 예정

---

## Collapse

**상태:** 향후 구현 예정

---

## 접근성

- **ARIA 속성** 자동 관리
- **키보드 네비게이션** 완전 지원
- **포커스 관리** 자동 처리
- **WCAG 2.1 AA** 준수

## 브라우저 지원

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 라이선스

MIT License
