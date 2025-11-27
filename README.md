# IMCAT UI

**Lightweight, Zero-Build, ES6+ JavaScript Web Framework**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-1.1.0-green.svg)](https://github.com/imcatDevs/imcat_ui)
[![npm](https://img.shields.io/npm/v/@imcat-ckim/catui.svg)](https://www.npmjs.com/package/@imcat-ckim/catui)

---

## ⚡ 특징

- **제로 빌드** - NPM, Webpack 불필요
- **경량** - 코어 < 15KB (gzipped)
- **동적 모듈 로딩** - 필요한 것만 로드
- **SPA 라우팅** - 내장 라우터
- **보안 우선** - XSS 자동 방어
- **순수 ES6+** - TypeScript 불필요

---

## 📦 설치

### CDN (unpkg)

```html
<link rel="stylesheet" href="https://unpkg.com/@imcat-ckim/catui@1.1.0/dist/imcat-ui.css">
<script src="https://unpkg.com/@imcat-ckim/catui@1.1.0/dist/imcat-ui.js"></script>
```

### CDN (jsDelivr)

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@imcat-ckim/catui@1.1.0/dist/imcat-ui.css">
<script src="https://cdn.jsdelivr.net/npm/@imcat-ckim/catui@1.1.0/dist/imcat-ui.js"></script>
```

### NPM

```bash
npm install @imcat-ckim/catui
```

---

## 🚀 빠른 시작

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>IMCAT UI</title>
  <link rel="stylesheet" href="./dist/imcat-ui.css">
</head>
<body>
  <div id="app">
    <button id="btn">Click Me</button>
  </div>

  <script type="module">
    import IMCAT from './dist/imcat-ui.js';
    
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

--

## 🛠️ 개발

### 환경 설정

```bash
npm install
```

### 개발 서버

```bash
npm run dev
npm run serve
```

### 빌드

```bash
npm run build
```

### 테스트

```bash
npm test
npm run test:coverage
```

### 린트

```bash
npm run lint
npm run lint:fix
```

---

## 📁 프로젝트 구조

```text
imcat-ui/
├── docs/           # 문서
├── src/            # 소스 코드
│   ├── core/       # 코어 모듈
│   ├── modules/    # 확장 모듈
│   └── styles/     # SCSS
├── dist/           # 빌드 결과
├── tests/          # 테스트
└── examples/       # 예제
```

---

## 🤝 기여

기여를 환영합니다! [CONTRIBUTING.md](./CONTRIBUTING.md)를 참조하세요.

---

## 📄 라이센스

MIT License - 자유롭게 사용, 수정, 배포 가능

---

## 🔗 링크

- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions

---

**IMCAT UI** - Build faster, lighter, safer web applications ⚡
