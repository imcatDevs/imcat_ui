# IMCAT UI Framework 문서

> 모던 웹 애플리케이션을 위한 경량 UI 프레임워크

## 문서 목록

| 문서 | 설명 |
|------|------|
| [시작하기](./시작하기.md) | 설치, 기본 설정, 첫 번째 앱 만들기 |
| [코어 API](./코어API.md) | DOM, Router, Event, State 등 핵심 API |
| [모듈 목록](./모듈목록.md) | 22개 외장 모듈 상세 설명 |
| [스타일 시스템](./스타일시스템.md) | SCSS 변수, 믹스인, 테마 시스템 |
| [고급 가이드](./고급가이드.md) | AutoInit, SPA 패턴, 메모리 관리, 디버깅 |
| [빌드 가이드](./빌드가이드.md) | 빌드, 배포, 최적화 |

## 프레임워크 구조

```text
imcat-ui/
├── src/
│   ├── core/           # 핵심 모듈 (20개)
│   ├── modules/        # 외장 모듈 (22개)
│   └── styles/         # SCSS 스타일
├── dist/               # 빌드 결과물
├── examples/           # 예제 페이지
└── types/              # TypeScript 정의
```

## 핵심 특징

### 1. 제로 빌드 개발

```html
<!-- CDN 또는 로컬 파일로 바로 사용 -->
<script type="module">
  import IMCAT from './dist/imcat-ui.min.js';
</script>
```

### 2. 단축 API

```javascript
// 간편한 다이얼로그
await IMCAT.alert('완료되었습니다');
await IMCAT.confirm('삭제하시겠습니까?');

// 토스트 메시지
IMCAT.toast.success('저장 완료');
IMCAT.toast.error('오류 발생');
```

### 3. SPA 라우터

```html
<!-- 자동 SPA 링크 처리 -->
<a catui-href="views/dashboard.html">대시보드</a>

<!-- 컨텐츠 영역 -->
<main id="app-content"></main>
```

### 4. 모듈 동적 로딩

```javascript
// 필요할 때만 로드
const Overlays = await IMCAT.use('overlays');
const modal = new Overlays.Modal({ title: '알림' });
```

### 5. 테마 시스템

```javascript
// 라이트/다크 테마 전환
IMCAT.theme.toggle();
IMCAT.theme.set('dark');
IMCAT.theme.set('system');
```

## 브라우저 지원

| 브라우저 | 버전 |
|----------|------|
| Chrome | 88+ |
| Firefox | 78+ |
| Safari | 14+ |
| Edge | 88+ |

## 라이선스

MIT License
