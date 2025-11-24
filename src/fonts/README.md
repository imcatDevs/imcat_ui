# Material Icons 폰트 다운로드 가이드

## 1. 폰트 다운로드

### 방법 1: Google Fonts Helper 사용 (권장)

1. <https://gwfh.mranftl.com/fonts/material-icons> 접속
2. 원하는 스타일 선택:
   - **Material Icons** (Filled - 기본, 필수)
   - **Material Icons Outlined** (아웃라인, 권장)
   - Material Icons Round (선택)
   - Material Icons Sharp (선택)

3. "Download" 클릭하여 woff2 파일 다운로드

4. 다운로드한 파일을 이 폴더에 저장:
   - `material-icons-v145-latin-regular.woff2` (Filled)
   - `material-icons-outlined-v109-latin-regular.woff2` (Outlined, 선택)
   - `material-icons-round-v108-latin-regular.woff2` (Round, 선택)
   - `material-icons-sharp-v108-latin-regular.woff2` (Sharp, 선택)

### 방법 2: 직접 다운로드

1. <https://github.com/google/material-design-icons> 접속
2. Releases에서 최신 버전 다운로드
3. `font` 폴더에서 woff2 파일 찾기
4. 이 폴더에 복사

## 2. 필요한 파일

**최소 필수:**

```
src/fonts/
  └── material-icons-v145-latin-regular.woff2   (필수, 50KB)
```

**권장 (Outlined 포함):**

```
src/fonts/
  ├── material-icons-v145-latin-regular.woff2           (Filled)
  └── material-icons-outlined-v109-latin-regular.woff2  (Outlined)
```

**전체 (선택):**

```
src/fonts/
  ├── material-icons-v145-latin-regular.woff2           (Filled)
  ├── material-icons-outlined-v109-latin-regular.woff2  (Outlined)
  ├── material-icons-round-v108-latin-regular.woff2     (Round)
  └── material-icons-sharp-v108-latin-regular.woff2     (Sharp)
```

## 3. 사용법

### HTML

```html
<!-- Filled (기본) -->
<i class="material-icons">home</i>

<!-- Outlined -->
<i class="material-icons-outlined">home</i>

<!-- Round -->
<i class="material-icons-round">home</i>

<!-- Sharp -->
<i class="material-icons-sharp">home</i>
```

### 크기 조절

```html
<i class="material-icons mi-xs">home</i>      <!-- 16px -->
<i class="material-icons mi-sm">home</i>      <!-- 20px -->
<i class="material-icons mi-md">home</i>      <!-- 24px, 기본 -->
<i class="material-icons mi-lg">home</i>      <!-- 32px -->
<i class="material-icons mi-xl">home</i>      <!-- 48px -->
```

### 색상

```html
<i class="material-icons mi-primary">favorite</i>
<i class="material-icons mi-danger">delete</i>
<i class="material-icons mi-success">check_circle</i>
```

### 버튼에 사용

```html
<button class="catui-btn catui-btn--primary">
  <i class="material-icons-outlined">add</i>
  <span class="catui-btn__text">추가</span>
</button>
```

### 아이콘 버튼

```html
<button class="catui-icon-btn">
  <i class="material-icons">search</i>
</button>
```

## 4. 자주 사용하는 아이콘 이름

### 기본

- `home` - 홈
- `person` - 사용자
- `settings` - 설정
- `search` - 검색
- `notifications` - 알림

### 액션

- `add` - 추가
- `edit` - 수정
- `delete` - 삭제
- `check` - 확인
- `close` - 닫기
- `save` - 저장

### 화살표/네비게이션

- `arrow_back` - 뒤로
- `arrow_forward` - 앞으로
- `arrow_upward` - 위로
- `arrow_downward` - 아래로
- `chevron_left` - 왼쪽 화살표
- `chevron_right` - 오른쪽 화살표

### 소셜

- `favorite` - 좋아요
- `share` - 공유
- `bookmark` - 북마크
- `star` - 별점

### 기타

- `menu` - 메뉴
- `more_vert` - 더보기 (세로)
- `more_horiz` - 더보기 (가로)
- `refresh` - 새로고침
- `visibility` - 보기
- `visibility_off` - 숨기기

## 5. 아이콘 검색

전체 아이콘 목록:
<https://fonts.google.com/icons>

## 6. 문제 해결

### 아이콘이 안 보이는 경우

1. 폰트 파일이 올바른 위치에 있는지 확인
2. 브라우저 콘솔에서 404 에러 확인
3. CSS 파일이 로드되었는지 확인

### 파일 경로 오류

CSS 파일에서 경로가 `../fonts/`로 설정되어 있습니다.
폴더 구조가 다르다면 CSS 수정 필요.

### 아이콘이 깨지는 경우

`font-feature-settings: 'liga'` 설정 확인
(ligature 기능이 활성화되어야 함)
