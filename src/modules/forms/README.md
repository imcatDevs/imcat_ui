# Forms Module

폼 관련 고급 컴포넌트 - FileUpload, Rating, SignaturePad, FormWizard

## 설치

```javascript
const Forms = await IMCAT.use('forms');
```

---

## FileUpload (파일 업로드)

드래그 앤 드롭을 지원하는 파일 업로드 컴포넌트

### 기본 사용법

```javascript
const uploader = new Forms.FileUpload('#file-input', {
  accept: 'image/*',
  multiple: true,
  onChange: (files) => console.log('선택된 파일:', files)
});
```

### 옵션

| 옵션 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `accept` | `string` | `*/*` | 허용 파일 타입 |
| `multiple` | `boolean` | `false` | 다중 선택 허용 |
| `maxSize` | `number` | `10MB` | 최대 파일 크기 |
| `maxFiles` | `number` | `10` | 최대 파일 수 |
| `dropzone` | `boolean` | `true` | 드롭존 표시 |
| `preview` | `boolean` | `true` | 미리보기 표시 |
| `onChange` | `Function` | `null` | 변경 시 콜백 |

### 메서드

```javascript
uploader.getFiles();  // 선택된 파일 배열 반환
uploader.clear();     // 모든 파일 제거
uploader.destroy();   // 정리
```

---

## Rating (별점 입력)

별점 입력 컴포넌트

### 기본 사용법

```javascript
const rating = new Forms.Rating('#rating', {
  max: 5,
  value: 3,
  onChange: (value) => console.log('별점:', value)
});
```

### 옵션

| 옵션 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `max` | `number` | `5` | 최대 별 개수 |
| `value` | `number` | `0` | 초기값 |
| `readonly` | `boolean` | `false` | 읽기 전용 |
| `icon` | `string` | `star` | 채워진 아이콘 |
| `iconEmpty` | `string` | `star_border` | 빈 아이콘 |
| `size` | `string` | `md` | 크기 (sm/md/lg) |
| `color` | `string` | `#f59e0b` | 별 색상 |

### 메서드

```javascript
rating.getValue();     // 현재 값 반환
rating.setValue(4);    // 값 설정
rating.destroy();      // 정리
```

---

## SignaturePad (서명 패드)

터치/마우스로 서명을 그릴 수 있는 캔버스 컴포넌트

### 기본 사용법

```javascript
const signature = new Forms.SignaturePad('#signature', {
  width: 400,
  height: 200,
  penColor: '#000000'
});

// 서명 저장
signature.events.on('save', (dataUrl) => {
  console.log('서명 이미지:', dataUrl);
});
```

### 옵션

| 옵션 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `width` | `number` | `400` | 캔버스 너비 |
| `height` | `number` | `200` | 캔버스 높이 |
| `backgroundColor` | `string` | `#ffffff` | 배경색 |
| `penColor` | `string` | `#000000` | 펜 색상 |
| `penWidth` | `number` | `2` | 펜 굵기 |

### 메서드

```javascript
signature.clear();          // 서명 지우기
signature.isEmpty();        // 빈 상태인지 확인
signature.toDataURL();      // 이미지 데이터 URL 반환
signature.destroy();        // 정리
```

---

## FormWizard (단계별 폼)

여러 단계로 구성된 폼 마법사 컴포넌트

### 기본 사용법

```javascript
const wizard = new Forms.FormWizard('#wizard', {
  steps: [
    {
      title: '기본 정보',
      content: '<input name="name" placeholder="이름">',
      validate: () => document.querySelector('[name="name"]').value.length > 0
    },
    {
      title: '연락처',
      content: '<input name="email" placeholder="이메일">'
    },
    {
      title: '완료',
      content: '<p>모든 정보가 입력되었습니다.</p>'
    }
  ],
  onComplete: (data) => console.log('완료:', data)
});
```

### 옵션

| 옵션 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `steps` | `Array` | `[]` | 단계 배열 `[{title, content, validate?}]` |
| `startStep` | `number` | `0` | 시작 단계 |
| `showProgress` | `boolean` | `true` | 진행 표시 |
| `showNavigation` | `boolean` | `true` | 이전/다음 버튼 |
| `prevText` | `string` | `이전` | 이전 버튼 텍스트 |
| `nextText` | `string` | `다음` | 다음 버튼 텍스트 |
| `submitText` | `string` | `완료` | 완료 버튼 텍스트 |
| `onStepChange` | `Function` | `null` | 단계 변경 시 콜백 |
| `onComplete` | `Function` | `null` | 완료 시 콜백 |

### 메서드

```javascript
wizard.next();              // 다음 단계
wizard.prev();              // 이전 단계
wizard.goToStep(2);         // 특정 단계로 이동
wizard.getCurrentStep();    // 현재 단계 번호
wizard.destroy();           // 정리
```

---

## 이벤트

```javascript
// FileUpload
uploader.events.on('change', (files) => {});
uploader.events.on('error', (message) => {});

// Rating
rating.events.on('change', (value) => {});

// SignaturePad
signature.events.on('begin', () => {});
signature.events.on('end', () => {});
signature.events.on('save', (dataUrl) => {});
signature.events.on('clear', () => {});

// FormWizard
wizard.events.on('stepChange', (step) => {});
wizard.events.on('complete', (data) => {});
wizard.events.on('validationError', (step) => {});
```
