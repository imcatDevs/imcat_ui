# IMCAT UI Typography 가이드

## 📋 개요

IMCAT UI는 일관되고 접근 가능한 Typography 시스템을 제공합니다. 모든 텍스트 요소는 테마 변수를 사용하여 라이트/다크 모드에 자동으로 대응합니다.

## 🎨 텍스트 색상 시스템

### 테마 기반 텍스트 색상

```scss
// CSS Variables
--text-dark       // 제목 (Headings) - 가장 진한 색상
--text-primary    // 본문 텍스트 - 기본 읽기 색상
--text-secondary  // 보조 텍스트 - 덜 중요한 정보
--text-disabled   // 비활성 텍스트
```

### 사용 예제

```html
<!-- 제목 -->
<h1>IMCAT UI Component Library</h1>  <!-- color: var(--text-dark) -->

<!-- 본문 -->
<p>경량, 제로 빌드, 모던 UI 프레임워크</p>  <!-- color: var(--text-primary) -->

<!-- 보조 텍스트 -->
<p class="text-muted">추가 정보</p>  <!-- color: var(--text-secondary) -->
```

## 📐 제목 스타일 (Headings)

### H1 - H6

```html
<h1>H1 제목</h1>  <!-- 2.5rem, bold -->
<h2>H2 제목</h2>  <!-- 2rem, bold -->
<h3>H3 제목</h3>  <!-- 1.75rem, semibold -->
<h4>H4 제목</h4>  <!-- 1.5rem, semibold -->
<h5>H5 제목</h5>  <!-- 1.25rem, medium -->
<h6>H6 제목</h6>  <!-- 1rem, medium -->
```

### 특징

- **색상**: 모두 `var(--text-dark)` 사용
- **폰트 굵기**: H1-H2는 Bold, H3-H4는 Semibold, H5-H6는 Medium
- **여백**: 자동으로 하단 margin 적용
- **테마 대응**: 라이트/다크 모드 자동 전환

## 📝 본문 텍스트 (Body Text)

### 기본 단락

```html
<p>이것은 기본 단락입니다.</p>
```

**스타일:**

- Font size: `1rem` (16px)
- Line height: `1.6` (relaxed)
- Color: `var(--text-primary)`
- Margin bottom: `1rem`

### Body 변형

```html
<p class="body1">Body1 스타일</p>

<p class="body2">Body2 스타일 - 약간 작은 텍스트</p>
```

## 유틸리티 클래스

### 텍스트 색상

```html
<!-- 테마 기반 색상 -->
<p class="text-dark">제목용 진한 색상</p>
<p class="text-primary">본문용 기본 색상</p>
<p class="text-secondary">보조 텍스트 색상</p>
<p class="text-muted">희미한 텍스트 (secondary와 동일)</p>
<p class="text-disabled">비활성 텍스트</p>

<!-- 브랜드 색상 -->
<p class="text-primary-color">Primary 브랜드 색상</p>
<p class="text-secondary-color">Secondary 브랜드 색상</p>

<!-- 시맨틱 색상 -->
<p class="text-success">성공 메시지</p>
<p class="text-danger">오류 메시지</p>
<p class="text-warning">경고 메시지</p>
<p class="text-info">정보 메시지</p>
```

### 폰트 굵기

```html
<p class="font-light">Light (300)</p>
<p class="font-regular">Regular (400)</p>
<p class="font-medium">Medium (500)</p>
<p class="font-semibold">Semibold (600)</p>
<p class="font-bold">Bold (700)</p>
```

### 텍스트 정렬

```html
<p class="text-left">왼쪽 정렬</p>
<p class="text-center">가운데 정렬</p>
<p class="text-right">오른쪽 정렬</p>
<p class="text-justify">양쪽 정렬</p>
```

### 텍스트 변환

```html
<p class="text-lowercase">소문자로 변환</p>
<p class="text-uppercase">대문자로 변환</p>
<p class="text-capitalize">첫글자만 대문자</p>
```

### 줄 높이

```html
<p class="line-height-tight">좁은 줄 간격 (1.25)</p>
<p class="line-height-normal">기본 줄 간격 (1.5)</p>
<p class="line-height-relaxed">넓은 줄 간격 (1.75)</p>
```

### 글자 간격

```html
<p class="letter-spacing-tight">좁은 글자 간격</p>
<p class="letter-spacing-normal">기본 글자 간격</p>
<p class="letter-spacing-wide">넓은 글자 간격</p>
```

### 텍스트 말줄임

```html
<!-- 한 줄 말줄임 -->
<p class="text-ellipsis">매우 긴 텍스트가 한 줄로 줄어듭니다...</p>

<!-- 여러 줄 말줄임 -->
<p class="text-ellipsis-2">두 줄까지 표시...</p>
<p class="text-ellipsis-3">세 줄까지 표시...</p>
```

### 줄바꿈 제어

```html
<p class="word-break">긴단어도자동으로줄바꿈</p>
<p class="word-break-all">모든 문자에서 줄바꿈 가능</p>
<p class="whitespace-nowrap">줄바꿈 없이 한 줄로</p>
<p class="whitespace-pre">공백과 줄바꿈 그대로 유지</p>
```

## 🎨 컴포넌트별 Typography

### Card

```html
<div class="card">
  <div class="card-header">Card Header (text-dark, bold)</div>
  <div class="card-body">
    <h4>Card Title (text-dark, semibold)</h4>
    <p>Card content text (text-primary)</p>
  </div>
  <div class="card-footer">Card Footer (text-secondary, small)</div>
</div>
```

### Page Title

```html
<div class="page-title-box">
  <h1 class="page-title">Gradient Title</h1>
  <p class="text-muted">Subtitle text</p>
</div>
```

### Topbar

```html
<div class="topbar">
  <h4 class="page-title">Page Title (text-dark, semibold)</h4>
</div>
```

## 🌓 테마 대응

모든 Typography는 자동으로 테마에 대응합니다:

```scss
// Light Theme
--text-dark: #313a46      (거의 검정)
--text-primary: #6c757d   (중간 회색)
--text-secondary: #98a6ad (연한 회색)

// Dark Theme
--text-dark: #ffffff      (흰색)
--text-primary: #ced4da   (밝은 회색)
--text-secondary: #98a6ad (중간 회색)
```

## ✅ 베스트 프랙티스

### 1. 항상 테마 변수 사용

```scss
// ✅ 좋음
h1 {
  color: var(--text-dark);
}

// ❌ 나쁨
h1 {
  color: #313a46;  // 하드코딩된 색상
}
```

### 2. 시맨틱한 클래스 사용

```html
<!-- ✅ 좋음 -->
<p class="text-muted">보조 정보</p>
<p class="text-danger">오류 메시지</p>

<!-- ❌ 나쁨 -->
<p style="color: #98a6ad">보조 정보</p>
```

### 3. 일관된 계층 구조

```html
<!-- ✅ 좋음 -->
<h1>메인 제목</h1>
<h2>섹션 제목</h2>
<h3>서브 섹션</h3>
<p>본문 텍스트</p>

<!-- ❌ 나쁨 -->
<h1>메인 제목</h1>
<h4>섹션 제목</h4>  <!-- h2를 건너뜀 -->
```

### 4. 적절한 Line Height

```html
<!-- ✅ 좋음 - 본문은 넓은 줄 간격 -->
<p class="line-height-relaxed">
  긴 본문 텍스트는 읽기 편하도록 넓은 줄 간격을 사용합니다.
</p>

<!-- ✅ 좋음 - 제목은 좁은 줄 간격 -->
<h1 class="line-height-tight">
  멀티라인 제목
</h1>
```

## 📊 Typography Scale

| 요소 | Size | Weight | Line Height | Use Case |
|------|------|--------|-------------|----------|
| H1 | 2.5rem | 700 | 1.2 | 페이지 메인 제목 |
| H2 | 2rem | 700 | 1.2 | 섹션 제목 |
| H3 | 1.75rem | 600 | 1.3 | 서브 섹션 |
| H4 | 1.5rem | 600 | 1.4 | 카드 제목 |
| H5 | 1.25rem | 500 | 1.5 | 작은 제목 |
| H6 | 1rem | 500 | 1.5 | 최소 제목 |
| Body | 1rem | 400 | 1.6 | 본문 텍스트 |
| Body2 | 0.875rem | 400 | 1.6 | 작은 본문 |
| Caption | 0.75rem | 400 | 1.5 | 캡션, 라벨 |

## 🚀 사용 예제

### 기본 페이지 구조

```html
<div id="app-content">
  <!-- 페이지 제목 -->
  <div class="page-title-box">
    <h1 class="page-title">IMCAT UI Component Library</h1>
    <p class="text-muted">경량, 제로 빌드, 모던 UI 프레임워크</p>
  </div>

  <!-- 카드 -->
  <div class="card">
    <div class="card-header">컴포넌트 소개</div>
    <div class="card-body">
      <h4>Button Component</h4>
      <p>다양한 스타일과 크기의 버튼을 제공합니다.</p>
      <p class="text-muted">
        <small>최종 업데이트: 2025-11-24</small>
      </p>
    </div>
  </div>
</div>
```

### 정보 메시지

```html
<div class="alert alert-info">
  <h5 class="text-info">
    <i class="material-icons-outlined">info</i>
    알림
  </h5>
  <p>이것은 정보 메시지입니다.</p>
</div>
```

## 💡 주의사항

1. **!important 사용 자제**: 유틸리티 클래스는 !important를 사용하지만, 커스텀 스타일에서는 피하세요.

2. **테마 변수 필수**: 모든 색상은 테마 변수를 사용하여 다크 모드를 지원하세요.

3. **접근성**: 텍스트와 배경 간 대비율은 최소 4.5:1을 유지하세요.

4. **일관성**: 프로젝트 전체에서 동일한 Typography 스케일을 사용하세요.

## 🔗 관련 문서

- [디자인_시스템_설계서.md](./디자인_시스템_설계서.md)
- [API_레퍼런스.md](./API_레퍼런스.md)
- [코딩_가이드.md](./코딩_가이드.md)
