# Pickers Module

날짜, 시간, 색상 선택 및 카운트다운/디데이 컴포넌트

## 포함 컴포넌트

| 컴포넌트 | 설명 |
|---------|------|
| DatePicker | 달력 기반 날짜 선택 |
| TimePicker | 시간 선택 드롭다운 |
| ColorPicker | 색상 선택 (프리셋 + 커스텀) |
| Countdown | 카운트다운 타이머 |
| DDay | 디데이 카운터 |

## 설치

```javascript
const Pickers = await IMCAT.use('pickers');
```

## DatePicker

```javascript
const datePicker = new Pickers.DatePicker('#date-input', {
  format: 'YYYY-MM-DD',
  minDate: '2024-01-01',
  maxDate: '2025-12-31',
  locale: 'ko',
  placeholder: '날짜 선택',
  onChange: (value) => console.log('선택:', value)
});

// 메서드
datePicker.setValue('2024-12-25');
datePicker.getValue(); // '2024-12-25'
datePicker.open();
datePicker.close();
datePicker.destroy();
```

## TimePicker

```javascript
const timePicker = new Pickers.TimePicker('#time-input', {
  format: 'HH:mm',
  step: 15, // 15분 간격
  placeholder: '시간 선택',
  onChange: (value) => console.log('선택:', value)
});

// 메서드
timePicker.setValue('14:30');
timePicker.getValue(); // '14:30'
timePicker.destroy();
```

## ColorPicker

```javascript
const colorPicker = new Pickers.ColorPicker('#color-input', {
  defaultColor: '#667eea',
  presetColors: ['#ef4444', '#22c55e', '#3b82f6', '#8b5cf6'],
  onChange: (color) => console.log('선택:', color)
});

// 메서드
colorPicker.setValue('#ff0000');
colorPicker.getValue(); // '#ff0000'
colorPicker.destroy();
```

## Countdown

```javascript
const countdown = new Pickers.Countdown('#countdown', {
  targetDate: '2025-01-01T00:00:00',
  labels: { days: '일', hours: '시간', minutes: '분', seconds: '초' },
  showLabels: true,
  onTick: (time) => console.log(time),
  onComplete: () => console.log('완료!')
});

// 메서드
countdown.start();
countdown.stop();
countdown.setTarget('2025-06-01');
countdown.destroy();
```

## DDay

```javascript
const dday = new Pickers.DDay('#dday', {
  targetDate: '2025-03-01',
  title: '프로젝트 마감',
  showPastDays: true,
  onChange: (diff) => console.log('D-Day:', diff)
});

// 메서드
dday.setTarget('2025-04-01', '새로운 이벤트');
dday.getDays(); // 남은 일수 반환
dday.destroy();
```

## 옵션

### DatePicker Options

| 옵션 | 타입 | 기본값 | 설명 |
|-----|------|-------|------|
| format | string | 'YYYY-MM-DD' | 날짜 포맷 |
| minDate | string | null | 최소 선택 가능 날짜 |
| maxDate | string | null | 최대 선택 가능 날짜 |
| locale | string | 'ko' | 언어 설정 |
| placeholder | string | '날짜 선택' | 플레이스홀더 |
| onChange | function | null | 변경 콜백 |

### TimePicker Options

| 옵션 | 타입 | 기본값 | 설명 |
|-----|------|-------|------|
| format | string | 'HH:mm' | 시간 포맷 |
| step | number | 15 | 분 간격 |
| placeholder | string | '시간 선택' | 플레이스홀더 |
| onChange | function | null | 변경 콜백 |

### ColorPicker Options

| 옵션 | 타입 | 기본값 | 설명 |
|-----|------|-------|------|
| defaultColor | string | '#667eea' | 기본 색상 |
| presetColors | array | [...] | 프리셋 색상 배열 |
| onChange | function | null | 변경 콜백 |

### Countdown Options

| 옵션 | 타입 | 기본값 | 설명 |
|-----|------|-------|------|
| targetDate | string/Date | null | 목표 날짜/시간 |
| labels | object | {days:'일',...} | 레이블 텍스트 |
| showLabels | boolean | true | 레이블 표시 여부 |
| onTick | function | null | 매초 콜백 |
| onComplete | function | null | 완료 콜백 |

### DDay Options

| 옵션 | 타입 | 기본값 | 설명 |
|-----|------|-------|------|
| targetDate | string/Date | null | 목표 날짜 |
| title | string | 'D-Day' | 제목 |
| showPastDays | boolean | true | 지난 일수 표시 |
| onChange | function | null | 변경 콜백 |

## CSS 클래스

```scss
// DatePicker
.datepicker
.datepicker__input
.datepicker__dropdown
.datepicker__day--today
.datepicker__day--selected

// TimePicker
.timepicker
.timepicker__option.is-selected

// ColorPicker
.colorpicker
.colorpicker__preview
.colorpicker__preset.is-selected

// Countdown
.countdown
.countdown--sm / --lg
.countdown--complete

// DDay
.dday
.dday--card
.dday__count--today / --future / --past
```

## 메모리 관리

```javascript
// 인스턴스 등록 (SPA에서 자동 정리)
IMCAT.view.registerInstance(datePicker);
IMCAT.view.registerInstance(countdown);

// 수동 정리
datePicker.destroy();
countdown.destroy();
```
