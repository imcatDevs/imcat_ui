# IMCAT UI 예제

모던하고 심플한 SPA 구조의 예제 애플리케이션입니다.

## 🚀 실행 방법

### 1. 로컬 서버 시작

```bash
# npm 스크립트 사용
npm run serve

# 또는 다른 로컬 서버 사용
npx http-server . -p 3000
```

### 2. 브라우저에서 열기

```
http://localhost:3000/examples/
```

---

## 📂 구조

```
examples/
├── index.html              # 메인 SPA 페이지
└── views/                  # 뷰 파일들
    ├── home.html          # 홈
    ├── started.html       # 시작하기
    ├── features.html      # 기능 소개
    ├── api.html           # API 문서
    ├── examples.html      # 예제 모음
    └── about.html         # 소개
```

---

## 🎨 레이아웃

### 3단 구조

```
┌─────────────────────────────────────┐
│           Header (상단)              │
│  Logo + 테마 스위처                   │
├───────┬─────────────────┬───────────┤
│       │                 │           │
│  왼쪽  │     가운데        │   오른쪽   │
│ 메뉴   │    콘텐츠         │   설명    │
│       │                 │           │
├───────┴─────────────────┴───────────┤
│           Footer (하단)              │
│  Copyright + Links                  │
└─────────────────────────────────────┘
```

### 상세 설명

#### 1. **Header (상단)**
- IMCAT UI 로고
- 테마 스위처 (라이트/다크/시스템)
- Sticky 고정

#### 2. **Main - 3분할 레이아웃**

**왼쪽 사이드바 (240px)**
- Navigation 메뉴
- 아이콘 + 텍스트
- 활성 상태 표시
- Resources 링크

**가운데 콘텐츠 (flexible)**
- 라우터가 뷰를 로드하는 영역
- 페이지별 컨텐츠 표시
- 스크롤 가능

**오른쪽 사이드바 (280px)**
- 프레임워크 정보 카드
- 핵심 기능 목록
- 빠른 시작 가이드
- 추가 정보

#### 3. **Footer (하단)**
- Copyright 정보
- 문서/GitHub/소개 링크

---

## 🎯 주요 기능

### SPA 라우팅
- Hash 기반 라우팅 (`#/path`)
- `catui-href` 속성으로 링크 처리
- 페이지 전환 애니메이션
- 로딩 오버레이

### 테마 시스템
- 라이트/다크 모드
- 시스템 설정 감지
- CSS Custom Properties 활용
- 부드러운 전환 애니메이션

### 반응형 디자인
- Desktop: 3분할 레이아웃
- Tablet: 2분할 (오른쪽 사이드바 숨김)
- Mobile: 1분할 (모든 사이드바 숨김)

---

## 💡 사용된 기술

### CSS
- CSS Custom Properties (테마)
- CSS Grid (레이아웃)
- Flexbox (컴포넌트)
- CSS Animations (전환 효과)

### JavaScript
- ES6+ Modules
- Hash-based Routing
- Fetch API
- Theme Module

### 디자인 시스템
- Material Design 3.0 색상
- Material Icons
- Variable Fonts (Montserrat, Noto Sans KR)
- BEM 네이밍 컨벤션

---

## 📄 페이지 설명

### 1. 홈 (`/`)
- 프레임워크 소개
- 핵심 기능 카드
- CTA 버튼
- 시작 가이드 링크

### 2. 시작하기 (`/started`)
- 설치 방법 (NPM, CDN)
- 빠른 시작 가이드
- 기본 사용 예제
- 다음 단계 링크

### 3. 기능 (`/features`)
- DOM 조작
- SPA 라우팅
- 상태 관리
- 이벤트 버스
- XSS 방어
- 애니메이션

### 4. API 문서 (`/api`)
- Core API
- Router API
- Events API
- Animation API
- 각 메서드 설명

### 5. 예제 (`/examples`)
- Todo 앱
- SPA 블로그
- 관리자 대시보드
- 폼 검증
- 애니메이션 쇼케이스
- 테마 시스템

### 6. 소개 (`/about`)
- 프로젝트 목표
- 기술 스택
- 성능 지표
- 브라우저 지원
- 라이선스

---

## 🎨 디자인 토큰

### 색상
```scss
--primary-color: #2196f3
--success-color: #4caf50
--danger-color: #f44336
--warning-color: #ff9800
--info-color: #00bcd4
```

### 간격
```scss
--space-1: 4px
--space-2: 8px
--space-3: 12px
--space-4: 16px
--space-6: 24px
```

### 둥근 모서리
```scss
--radius-sm: 4px
--radius-md: 8px
--radius-lg: 12px
--radius-full: 9999px
```

---

## 📱 반응형 브레이크포인트

```scss
// Desktop (기본)
.app-main { 
  grid-template-columns: 240px 1fr 280px; 
}

// Tablet (< 1200px)
@media (max-width: 1200px) {
  grid-template-columns: 240px 1fr;
  // 오른쪽 사이드바 숨김
}

// Mobile (< 768px)
@media (max-width: 768px) {
  grid-template-columns: 1fr;
  // 왼쪽 사이드바 숨김
}
```

---

## 🔗 관련 문서

- [API 레퍼런스](../docs/API_레퍼런스.md)
- [디자인 시스템 구현 가이드](../docs/디자인_시스템_구현_가이드.md)
- [빌드 가이드](../docs/빌드_가이드.md)
- [코딩 가이드](../docs/코딩_가이드.md)

---

## 💻 개발

### 빌드

```bash
# 전체 빌드
npm run build

# CSS만 빌드
npm run build:css:all

# 개발 서버
npm run serve
```

### 수정 사항

예제를 수정하려면:
1. `views/*.html` 파일 편집
2. `index.html` 스타일/스크립트 수정
3. 브라우저 새로고침 (Ctrl+Shift+R)

---

## ✨ 특징

### 1. 심플하고 모던한 디자인
- 깔끔한 3단 레이아웃
- Material Design 3.0 기반
- 부드러운 애니메이션

### 2. 완벽한 반응형
- Desktop, Tablet, Mobile 지원
- 자동 레이아웃 조정
- 터치 친화적

### 3. 접근성
- WCAG 2.1 AA 준수
- 키보드 내비게이션
- 스크린 리더 지원

### 4. 성능 최적화
- 경량 HTML/CSS
- 지연 로딩
- CSS 애니메이션

---

**IMCAT UI 예제를 즐겨보세요! 🚀**
