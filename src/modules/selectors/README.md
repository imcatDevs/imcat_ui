# Selectors Module

고급 선택 컴포넌트 모음 - Autocomplete, MultiSelect, RangeSlider

## 설치

```javascript
const Selectors = await IMCAT.use('selectors');
```

---

## Autocomplete (자동완성)

검색어 입력 시 실시간으로 결과를 표시하는 자동완성 컴포넌트

### 기본 사용법

```javascript
const autocomplete = new Selectors.Autocomplete('#search', {
  source: ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry'],
  onSelect: (item) => console.log('선택:', item)
});
```

### 비동기 데이터 소스

```javascript
const autocomplete = new Selectors.Autocomplete('#search', {
  source: async (query) => {
    const response = await fetch(`/api/search?q=${query}`);
    return response.json();
  },
  minLength: 2,
  delay: 500
});
```

### 옵션

| 옵션 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `source` | `Array|Function` | `[]` | 데이터 소스 (배열 또는 async 함수) |
| `minLength` | `number` | `1` | 검색 시작 최소 글자 수 |
| `delay` | `number` | `300` | 디바운스 딜레이 (ms) |
| `maxResults` | `number` | `10` | 최대 표시 결과 수 |
| `highlight` | `boolean` | `true` | 검색어 하이라이트 |
| `placeholder` | `string` | `'검색...'` | 플레이스홀더 |
| `noResultsText` | `string` | `'검색 결과가 없습니다'` | 결과 없음 메시지 |
| `onSelect` | `Function` | `null` | 선택 시 콜백 |
| `renderItem` | `Function` | `null` | 커스텀 렌더링 함수 |

### 메서드

```javascript
autocomplete.getValue();      // 현재 값 반환
autocomplete.setValue('값');  // 값 설정
autocomplete.clear();         // 초기화
autocomplete.destroy();       // 정리
```

---

## MultiSelect (다중 선택)

태그 형태로 여러 항목을 선택할 수 있는 컴포넌트

### 기본 사용법

```javascript
const multiSelect = new Selectors.MultiSelect('#tags', {
  options: [
    { value: 'js', label: 'JavaScript' },
    { value: 'ts', label: 'TypeScript' },
    { value: 'py', label: 'Python' },
    { value: 'go', label: 'Go' }
  ],
  selected: ['js'],
  onChange: (values) => console.log('선택된 값:', values)
});
```

### 새 태그 생성 허용

```javascript
const multiSelect = new Selectors.MultiSelect('#tags', {
  options: [...],
  allowCreate: true,  // 새 태그 생성 허용
  maxItems: 5         // 최대 5개까지 선택
});
```

### 옵션

| 옵션 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `options` | `Array` | `[]` | 선택 가능한 옵션 `[{value, label}]` |
| `selected` | `Array` | `[]` | 초기 선택된 값 |
| `maxItems` | `number` | `null` | 최대 선택 가능 수 |
| `placeholder` | `string` | `'선택...'` | 플레이스홀더 |
| `searchable` | `boolean` | `true` | 검색 가능 여부 |
| `allowCreate` | `boolean` | `false` | 새 태그 생성 허용 |
| `onChange` | `Function` | `null` | 변경 시 콜백 |

### 메서드

```javascript
multiSelect.getValue();           // 선택된 값 배열 반환
multiSelect.setValue(['js', 'ts']); // 값 설정
multiSelect.clear();              // 초기화
multiSelect.destroy();            // 정리
```

---

## RangeSlider (범위 선택)

범위 또는 단일 값을 선택할 수 있는 슬라이더 컴포넌트

### 범위 선택 (기본)

```javascript
const rangeSlider = new Selectors.RangeSlider('#price-range', {
  min: 0,
  max: 1000,
  value: [200, 800],
  step: 10,
  formatValue: (v) => `₩${v.toLocaleString()}`,
  onChange: (values) => console.log('범위:', values)
});
```

### 단일 값 선택

```javascript
const slider = new Selectors.RangeSlider('#volume', {
  min: 0,
  max: 100,
  value: 50,
  range: false,  // 단일 값 모드
  onChange: (value) => console.log('볼륨:', value)
});
```

### 옵션

| 옵션 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `min` | `number` | `0` | 최소값 |
| `max` | `number` | `100` | 최대값 |
| `step` | `number` | `1` | 증감 단위 |
| `value` | `number|Array` | `[25, 75]` | 초기값 |
| `range` | `boolean` | `true` | 범위 선택 모드 |
| `showTooltip` | `boolean` | `true` | 툴팁 표시 |
| `showLabels` | `boolean` | `true` | 최소/최대 레이블 표시 |
| `formatValue` | `Function` | `(v) => v` | 값 포맷 함수 |
| `onChange` | `Function` | `null` | 변경 시 콜백 |
| `onDragEnd` | `Function` | `null` | 드래그 종료 시 콜백 |

### 메서드

```javascript
rangeSlider.getValue();       // 현재 값 반환
rangeSlider.setValue([100, 500]); // 값 설정
rangeSlider.destroy();        // 정리
```

---

## 이벤트

모든 컴포넌트는 EventBus를 통한 이벤트를 지원합니다.

```javascript
// Autocomplete
autocomplete.events.on('select', (item) => {});

// MultiSelect
multiSelect.events.on('change', (values) => {});

// RangeSlider
rangeSlider.events.on('change', (values) => {});
rangeSlider.events.on('dragend', (values) => {});
```

---

## 스타일 커스터마이징

CSS 변수로 스타일을 조정할 수 있습니다.

```css
:root {
  --primary-color: #667eea;
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --border-color: #e2e8f0;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
}
```
