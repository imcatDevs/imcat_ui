# IMCAT UI 문서

IMCAT UI 프레임워크의 전체 설계 및 개발 문서입니다.

---

## 📚 문서 목록

### 1. 설계 문서

#### [프레임워크 설계 이념](./프레임워크_설계_이념.md)

- 핵심 설계 원칙
- 제로 빌드 철학
- SPA 뷰 라우팅 시스템
- XSS 보안 필터링 시스템
- 완전한 애플리케이션 예제

#### [코어 아키텍처 설계서](./코어_설계서.md)

- 코어 모듈 구조
- DOM 조작 시스템
- 이벤트 시스템
- 뷰 라우터
- 로딩 인디케이터
- 보안 모듈
- API 유틸리티
- 유틸리티

#### [모듈 시스템 설계서](./모듈_시스템_설계서.md)

- 동적 모듈 로딩
- 표준 모듈 인터페이스
- Modal 모듈 예시
- 모듈 개발 가이드
- 스타일 가이드

#### [디자인 시스템 설계서](./디자인_시스템_설계서.md)

- SCSS 아키텍처
- 디자인 토큰 (색상, 타이포그래피, 간격)
- 믹스인 및 함수
- 테마 시스템
- 컴포넌트 스타일 가이드
- 코딩 규칙 및 네이밍 컨벤션

#### [번들링 가이드](./번들링_가이드.md)

- 빌드 구조
- Rollup 설정
- 최적화 전략
- CSS 번들링
- 배포 전략
- CI/CD 파이프라인

#### [코딩 가이드](./코딩_가이드.md)

- JavaScript 코딩 규칙
- SCSS 코딩 규칙
- 명명 규칙
- 주석 규칙 (JSDoc)
- 파일 구조
- 모범 사례 및 안티 패턴
- 코드 리뷰 체크리스트

#### [API 레퍼런스](./API_레퍼런스.md)

- Core API (IMCAT, use, create)
- DOM API (요소 조작)
- API 유틸리티 (HTTP 요청)
- View Router API (SPA 라우팅)
- Loading API (로딩 표시)
- Security API (보안)
- Event API (이벤트 버스)
- Utils API (유틸리티)

---

## 🎯 문서 읽는 순서

### 처음 시작하는 경우

1. **프레임워크 설계 이념** - 전체 철학과 방향 이해
2. **코어 아키텍처 설계서** - 핵심 구조 파악
3. **모듈 시스템 설계서** - 확장 방법 학습

### 개발자인 경우

1. **코어 아키텍처 설계서** - 구현 세부사항
2. **모듈 시스템 설계서** - 모듈 개발 방법
3. **디자인 시스템 설계서** - 스타일 가이드
4. **번들링 가이드** - 빌드 및 배포
5. **프레임워크 설계 이념** - 설계 방향 참고

### 기여자인 경우

모든 문서를 순서대로 읽으시고:

- 코딩 스타일 가이드 준수
- 보안 검토 필수
- 테스트 작성 필수

---

## 🏗️ 프로젝트 구조

```text
imcat-ui/
├── docs/                           # 📄 문서
│   ├── README.md                   # 문서 인덱스 (이 파일)
│   ├── 프레임워크_설계_이념.md     # 설계 이념
│   ├── 코어_설계서.md              # 코어 설계
│   ├── 모듈_시스템_설계서.md       # 모듈 시스템
│   ├── 디자인_시스템_설계서.md     # 디자인 시스템
│   ├── 번들링_가이드.md            # 번들링 가이드
│   └── 코딩_가이드.md              # 코딩 규칙
│
├── src/                            # 💻 소스 코드
│   ├── core/                       # 🎯 코어
│   │   ├── index.js
│   │   ├── dom.js
│   │   ├── event.js
│   │   ├── loader.js
│   │   ├── router.js
│   │   ├── loading.js
│   │   ├── security.js
│   │   ├── api.js
│   │   └── utils.js
│   │
│   ├── modules/                    # 📦 모듈
│   │   ├── modal/
│   │   ├── dropdown/
│   │   ├── tooltip/
│   │   └── ...
│   │
│   └── styles/                     # 🎨 스타일
│       ├── abstracts/
│       │   ├── _variables.scss
│       │   ├── _mixins.scss
│       │   ├── _functions.scss
│       │   └── _themes.scss
│       ├── base/
│       │   ├── _reset.scss
│       │   ├── _typography.scss
│       │   └── _animations.scss
│       ├── components/
│       │   ├── _button.scss
│       │   ├── _modal.scss
│       │   └── ...
│       ├── core/
│       │   ├── _loading.scss
│       │   └── _router.scss
│       └── imcat-ui.scss
│
├── dist/                           # 📤 배포 파일
│   ├── imcat-ui.js                 # 빌드된 코어
│   ├── imcat-ui.min.js             # 압축 버전
│   ├── imcat-ui.css                # 코어 스타일
│   ├── imcat-ui.min.css            # 압축 스타일
│   └── modules/                    # 빌드된 모듈
│
├── examples/                       # 💡 예제
│   ├── basic/
│   ├── spa/
│   └── advanced/
│
├── tests/                          # 🧪 테스트
│   ├── core/
│   ├── modules/
│   └── integration/
│
├── rollup.config.js                # 📦 번들 설정
├── package.json                    # 📄 패키지 정보
└── .eslintrc.js                    # 🔍 린트 설정
```

---

## 🚀 빠른 시작

### 설치

CDN을 통한 즉시 사용:

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>IMCAT UI</title>
  <link rel="stylesheet" href="https://cdn.imcat.io/ui/1.0.0/imcat-ui.css">
</head>
<body>
  <div id="app">
    <button id="btn">Click Me</button>
  </div>

  <script type="module">
    import IMCAT from 'https://cdn.imcat.io/ui/1.0.0/imcat-ui.js';
    
    // DOM 조작
    IMCAT('#btn').on('click', () => {
      alert('Hello IMCAT UI!');
    });
    
    // 모듈 사용
    const modal = await IMCAT.use('modal');
    modal.show('Welcome', 'IMCAT UI Framework');
  </script>
</body>
</html>
```

### SPA 애플리케이션

```html
<!-- index.html -->
<nav>
  <a catui-href="views/home.html">홈</a>
  <a catui-href="views/about.html">소개</a>
</nav>

<main id="app"></main>

<script type="module">
  import IMCAT from './imcat-ui.js';
  // 라우트 설정 불필요! catui-href가 자동 처리
</script>
```

---

## 🎓 핵심 개념

### 제로 빌드

- NPM 설치 불필요
- 빌드 도구 불필요
- 복잡한 설정 불필요
- CSS/JS 로드만으로 즉시 시작

### 동적 모듈 로딩

```javascript
// 필요할 때만 로드
const modal = await IMCAT.use('modal');

// 여러 모듈 동시 로드
const [modal, tooltip] = await IMCAT.use('modal', 'tooltip');
```

### 보안 우선

- XSS 자동 방어
- 경로 순회 공격 차단
- 인젝션 공격 방어
- CSP 호환

### SPA 라우팅

```html
<!-- 라우트 설정 없이 파일 경로만 지정 -->
<a catui-href="views/products.html">상품</a>
<a catui-href="views/products.php">상품 (PHP)</a>
```

---

## 📊 개발 현황

### Phase 1: 코어 구현 (진행 중)

- [ ] DOM 유틸리티
- [ ] 이벤트 시스템
- [ ] 모듈 로더
- [ ] 뷰 라우터 (SPA 지원)
- [ ] 로딩 인디케이터
- [ ] XSS 보안 필터
- [ ] API 유틸리티 (JSON 응답 표준화)
- [ ] 기본 유틸리티

### Phase 2: 기본 모듈

- [ ] Modal
- [ ] Dropdown
- [ ] Tooltip
- [ ] Tabs
- [ ] Alert

### Phase 3: 확장 모듈

- [ ] Form Validation
- [ ] Ajax/Fetch Wrapper
- [ ] Animation
- [ ] State Management

### Phase 4: 고급 기능

- [ ] 플러그인 시스템
- [ ] 테마 시스템

---

## 🤝 기여 방법

### 코딩 규칙

- **순수 ES6+ 자바스크립트만 사용**
- **TypeScript 사용 금지**
- **코드 스타일 가이드 준수**
- **테스트 커버리지 유지**
- **보안 검토 필수** (XSS, 인젝션 등)
- **문서화 필수**

### Pull Request 프로세스

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

---

## 📄 라이센스

MIT License - 자유롭게 사용, 수정, 배포 가능

---

## 🔗 링크

- **GitHub**: (저장소 URL 추가 예정)
- **Website**: <https://imcat.io> (예정)
- **CDN**: <https://cdn.imcat.io> (예정)
- **Docs**: <https://docs.imcat.io> (예정)

---

## 💬 문의

- **Issues**: GitHub Issues 사용
- **Discussions**: GitHub Discussions 사용
- **Email**: (이메일 추가 예정)

---

**IMCAT UI** - 즉시 사용 가능한, 경량의, 안전한, 모던한 웹 프레임워크 ⚡
