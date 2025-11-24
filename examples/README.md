# IMCAT UI Examples

IMCAT UI 컴포넌트 라이브러리의 예제 및 데모 페이지입니다.

## 🚀 시작하기

### 로컬 서버 실행

```bash
# 프로젝트 루트에서
npm run serve
```

브라우저에서 `http://localhost:8080/examples/` 를 열어주세요.

## 📁 디렉토리 구조

```
examples/
├── index.html          # 메인 예제 페이지
├── styles/
│   └── demo.css        # 데모 전용 스타일
└── views/              # 컴포넌트 예제 페이지
    ├── static/         # 정적 컴포넌트 (12개)
    ├── modules/        # 동적 모듈 (8개)
    ├── layout/         # 레이아웃 (4개)
    ├── design/         # 디자인 시스템 (8개)
    └── utilities/      # 유틸리티 (5개)
```

## 🎯 주요 기능

### 1. SPA 네비게이션
IMCAT UI의 `catui-href` 속성을 사용한 싱글 페이지 애플리케이션

### 2. 컴포넌트 카테고리
- **Static Components**: CSS만으로 구현된 컴포넌트
- **Dynamic Modules**: JavaScript가 필요한 인터랙티브 컴포넌트
- **Layout**: 그리드, Flexbox 등 레이아웃 시스템
- **Design**: 타이포그래피, 색상 등 디자인 토큰
- **Utilities**: Display, Position 등 유틸리티 클래스

### 3. 다크 테마
라이트/다크 모드 전환 지원

### 4. 반응형 디자인
모바일, 태블릿, 데스크톱 최적화

## 💻 개발 가이드

### 새 예제 추가하기

1. **카테고리 선택**: `views/` 하위의 적절한 폴더 선택
2. **HTML 파일 생성**: 예) `views/static/buttons.html`
3. **메타데이터 추가** (선택):
   ```html
   <script type="application/json" id="pageMetadata">
   {
     "info": { ... },
     "usage": { ... },
     "features": { ... }
   }
   </script>
   ```
4. **index.html 메뉴 업데이트**: 사이드바에 링크 추가

### 예제 페이지 구조

```html
<!-- 페이지 헤더 -->
<div class="demo-page-header">
  <h1>컴포넌트 이름</h1>
  <p>설명</p>
</div>

<!-- 예제 섹션 -->
<section class="demo-section">
  <h2>섹션 제목</h2>
  <p>설명</p>
  
  <!-- 시각적 예제 -->
  <div class="demo-example">
    <!-- 컴포넌트 예제 -->
  </div>
  
  <!-- 코드 -->
  <div class="demo-code">
    <pre><code>...</code></pre>
  </div>
</section>
```

### 사용 가능한 CSS 클래스

#### 레이아웃
- `.demo-page-header` - 페이지 헤더
- `.demo-section` - 예제 섹션
- `.demo-example` - 시각적 예제 영역
- `.demo-code` - 코드 블록

#### 버튼
- `.demo-btn` - 기본 버튼
- `.demo-btn--primary` - Primary 버튼
- `.demo-btn--outline` - Outline 버튼

## 🎨 스타일 가이드

### 클래스 네이밍

- **데모 전용**: `.demo-*` 접두사 사용
- **컴포넌트**: BEM 네이밍 (`.block__element--modifier`)
- **유틸리티**: 기능 중심 (`.d-flex`, `.text-center`)

### 색상 변수

```css
/* 라이트 모드 */
--bg-primary: #ffffff
--bg-secondary: #f8f9fa
--text-primary: #1a1a1a
--text-secondary: #6b7280
--primary-color: #6366f1

/* 다크 모드 */
[data-theme="dark"] {
  --bg-primary: #1a1a1a
  --text-primary: #ffffff
  ...
}
```

## 📚 참고 자료

### IMCAT UI 문서
- [API 레퍼런스](../docs/API_레퍼런스.md)
- [코딩 가이드](../docs/코딩_가이드.md)
- [디자인 시스템 설계서](../docs/디자인_시스템_설계서.md)
- [프레임워크 설계 이념](../docs/프레임워크_설계_이념.md)

### 외부 리소스
- [Material Icons](https://fonts.google.com/icons)
- [Material Design](https://m3.material.io/)

## 🔧 개발 팁

### catui-href 사용법

```html
<!-- ✅ 올바름 -->
<a href="#" catui-href="views/static/buttons.html">Buttons</a>

<!-- ❌ 잘못됨 -->
<a href="views/static/buttons.html">Buttons</a>
```

### 페이지 로드 훅

```javascript
IMCAT.view.afterLoad((path) => {
  console.log('Loaded:', path);
  // 페이지 로드 후 처리
});
```

### 테마 전환

```javascript
document.documentElement.setAttribute('data-theme', 'dark');
```

## 📝 체크리스트

새 예제 추가 시 확인 사항:

- [ ] HTML 파일 생성
- [ ] 페이지 메타데이터 추가
- [ ] 시각적 예제 작성
- [ ] 코드 스니펫 추가
- [ ] index.html 메뉴 업데이트
- [ ] 다크 테마 테스트
- [ ] 반응형 확인
- [ ] 브라우저 호환성 확인

## 🐛 문제 해결

### 페이지가 로드되지 않음
- `views/` 경로가 올바른지 확인
- 파일 확장자가 `.html`인지 확인
- catui-href 속성 사용 여부 확인

### 스타일이 적용되지 않음
- `../dist/imcat-ui.css` 경로 확인
- `./styles/demo.css` 경로 확인
- 빌드 실행 여부 확인 (`npm run build`)

### 메뉴 활성화가 안 됨
- catui-href 값이 정확한지 확인
- afterLoad 훅이 실행되는지 확인

## 📞 문의

이슈나 질문은 [GitHub Issues](https://github.com/imcat-devs/imcat-ui/issues)에 등록해 주세요.
