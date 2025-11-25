# Dropdown Module

드롭다운 메뉴 컴포넌트

## 설치

```javascript
const Dropdown = await IMCAT.use('dropdown');
```

## 기본 사용법

```javascript
const dropdown = new Dropdown('#myButton', {
  items: [
    { text: '프로필', icon: 'person', action: () => console.log('프로필') },
    { text: '설정', icon: 'settings', action: () => console.log('설정') },
    { divider: true },
    { text: '로그아웃', icon: 'logout', action: () => console.log('로그아웃') }
  ]
});
```

## 옵션

| 옵션 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| items | Array | [] | 메뉴 아이템 배열 |
| position | String | 'bottom' | 위치 (top, bottom, left, right) |
| align | String | 'start' | 정렬 (start, center, end) |
| offset | Number | 8 | 트리거로부터의 거리 (px) |
| closeOnClick | Boolean | true | 아이템 클릭 시 닫기 |
| closeOnOutside | Boolean | true | 외부 클릭 시 닫기 |
| openOnHover | Boolean | false | Hover 시 자동 열기 |
| hoverDelay | Number | 200 | Hover 지연 시간 (ms) |
| keyboard | Boolean | true | 키보드 네비게이션 활성화 |
| animation | Boolean | true | 애니메이션 활성화 |
| animationDuration | Number | 200 | 애니메이션 시간 (ms) |
| onShow | Function | null | 표시 시 콜백 |
| onHide | Function | null | 숨김 시 콜백 |
| onSelect | Function | null | 아이템 선택 시 콜백 |
| onDestroy | Function | null | 삭제 시 콜백 |

## 아이템 구조

### 일반 아이템
```javascript
{
  text: '메뉴 텍스트',
  icon: 'material-icons 이름',
  action: () => { /* 클릭 시 동작 */ },
  disabled: false
}
```

### 구분선
```javascript
{
  divider: true
}
```

## 메서드

### show()
메뉴를 표시합니다.

```javascript
dropdown.show();
```

### hide()
메뉴를 숨깁니다.

```javascript
dropdown.hide();
```

### toggle()
메뉴를 토글합니다.

```javascript
dropdown.toggle();
```

### updateItems(items)
메뉴 아이템을 업데이트합니다.

```javascript
dropdown.updateItems([
  { text: '새 아이템', action: () => {} }
]);
```

### destroy()
드롭다운을 제거하고 메모리를 정리합니다.

```javascript
dropdown.destroy();
```

## 키보드 단축키

| 키 | 동작 |
|----|------|
| Escape | 메뉴 닫기 |
| ↑ | 이전 아이템으로 이동 |
| ↓ | 다음 아이템으로 이동 |
| Home | 첫 아이템으로 이동 |
| End | 마지막 아이템으로 이동 |
| Tab | 메뉴 닫기 |

## 예제

### 위치 및 정렬
```javascript
const dropdown = new Dropdown('#button', {
  items: [...],
  position: 'top',    // 위쪽에 표시
  align: 'end'        // 오른쪽 정렬
});
```

### 비활성화 아이템
```javascript
const dropdown = new Dropdown('#button', {
  items: [
    { text: '활성', action: () => {} },
    { text: '비활성', action: () => {}, disabled: true }
  ]
});
```

### Hover로 열기
```javascript
const dropdown = new Dropdown('#button', {
  items: [...],
  openOnHover: true,    // Hover 시 자동 열기
  hoverDelay: 200       // 200ms 지연
});
```

### 이벤트 콜백
```javascript
const dropdown = new Dropdown('#button', {
  items: [...],
  onShow: (dropdown) => console.log('표시됨'),
  onHide: (dropdown) => console.log('숨겨짐'),
  onSelect: (item, index) => console.log('선택됨:', item)
});
```

### 동적 아이템 업데이트
```javascript
const dropdown = new Dropdown('#button', {
  items: [{ text: '초기' }]
});

// 나중에 업데이트
dropdown.updateItems([
  { text: '새 아이템 1', action: () => {} },
  { text: '새 아이템 2', action: () => {} }
]);
```

## 접근성

- ARIA 속성 자동 설정
- 키보드 네비게이션 지원
- 포커스 관리
- 스크린리더 호환

## 브라우저 지원

- Chrome (최신)
- Firefox (최신)
- Safari (최신)
- Edge (최신)

## 라이선스

MIT
