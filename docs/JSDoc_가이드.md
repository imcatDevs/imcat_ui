# JSDoc 문서 생성 가이드

## 📋 개요

IMCAT UI 프레임워크의 코어 모듈에 대한 JSDoc 문서를 자동으로 생성합니다.

---

## 🚀 빠른 시작

### 1. 의존성 설치

```bash
npm install
```

이 명령어로 다음 패키지가 설치됩니다:
- `jsdoc` - JSDoc 생성기
- `docdash` - 깔끔한 JSDoc 템플릿

### 2. JSDoc 생성

```bash
npm run docs
```

생성된 문서 위치: `docs/jsdoc/`

### 3. 문서 확인

브라우저에서 확인:
```bash
npm run docs:serve
```

또는 직접 열기:
```bash
# Windows
start docs/jsdoc/index.html

# macOS
open docs/jsdoc/index.html

# Linux
xdg-open docs/jsdoc/index.html
```

---

## 📚 사용 가능한 스크립트

| 스크립트 | 설명 |
|---------|------|
| `npm run docs` | JSDoc 문서 생성 |
| `npm run docs:clean` | 생성된 문서 삭제 |
| `npm run docs:serve` | 문서를 로컬 서버로 실행 (http://localhost:8080) |

---

## 📖 JSDoc 주석 작성 규칙

### 모듈 주석

```javascript
/**
 * DOM 조작 유틸리티
 * @module core/dom
 * @description jQuery 스타일의 DOM 조작 유틸리티를 제공합니다.
 */
```

### 클래스 주석

```javascript
/**
 * DOM Element Wrapper
 * @class
 * @description DOM 요소를 감싸서 체이닝 가능한 메서드를 제공합니다.
 */
class DOMElement {
  /**
   * DOMElement 생성자
   * @param {HTMLElement|HTMLElement[]} elements - 대상 요소(들)
   */
  constructor(elements) {
    // ...
  }
}
```

### 메서드 주석

```javascript
/**
 * 클래스 추가
 * @param {string} className - 추가할 클래스명
 * @returns {DOMElement} 체이닝을 위한 this 반환
 * 
 * @example
 * IMCAT('#element').addClass('active');
 */
addClass(className) {
  return this.each(el => el.classList.add(className));
}
```

### 매개변수 타입

| JSDoc 타입 | 설명 |
|-----------|------|
| `{string}` | 문자열 |
| `{number}` | 숫자 |
| `{boolean}` | 불리언 |
| `{Object}` | 객체 |
| `{Array}` | 배열 |
| `{Function}` | 함수 |
| `{HTMLElement}` | HTML 요소 |
| `{Promise}` | Promise 객체 |
| `{*}` | 모든 타입 |
| `{string|number}` | 여러 타입 가능 |
| `{string[]}` | 문자열 배열 |

### 옵션 매개변수

```javascript
/**
 * 애니메이션 실행
 * @param {number} [duration=300] - 애니메이션 시간 (ms)
 * @param {string} [easing='ease-out'] - 이징 함수
 * @returns {Promise<void>}
 */
async fadeIn(duration = 300, easing = 'ease-out') {
  // ...
}
```

### Private 메서드

```javascript
/**
 * 내부 헬퍼 함수
 * @private
 * @param {string} value - 파싱할 값
 * @returns {Object} 파싱된 객체
 */
_parseValue(value) {
  // ...
}
```

### Deprecated

```javascript
/**
 * 레거시 메서드 (더 이상 사용 권장하지 않음)
 * @deprecated 대신 newMethod()를 사용하세요
 * @param {string} data - 데이터
 */
oldMethod(data) {
  // ...
}
```

---

## 🎯 JSDoc 설정 파일 (jsdoc.json)

```json
{
  "source": {
    "include": ["src/core"],
    "includePattern": ".+\\.js(doc|x)?$",
    "excludePattern": "(node_modules/|docs)"
  },
  "sourceType": "module",
  "opts": {
    "template": "node_modules/docdash",
    "encoding": "utf8",
    "destination": "./docs/jsdoc",
    "recurse": true,
    "readme": "./README.md"
  }
}
```

### 주요 설정

- **source.include**: 문서화할 소스 폴더
- **opts.template**: 사용할 JSDoc 템플릿
- **opts.destination**: 생성된 문서 저장 위치
- **opts.readme**: 메인 페이지에 표시할 README 파일

---

## 📂 생성되는 문서 구조

```
docs/jsdoc/
├── index.html              # 메인 페이지
├── module-core_dom.html    # DOM 모듈 문서
├── module-core_event.html  # Event 모듈 문서
├── module-core_router.html # Router 모듈 문서
├── ...                     # 기타 모듈 문서들
├── classes/                # 클래스 문서
│   ├── DOMElement.html
│   ├── EventBus.html
│   └── ...
├── scripts/                # JSDoc 스크립트
└── styles/                 # JSDoc 스타일
```

---

## 💡 팁

### 1. 실시간 업데이트

코드를 수정할 때마다 문서를 다시 생성하려면:

```bash
# 코드 수정 후
npm run docs:clean && npm run docs
```

### 2. VS Code 확장

JSDoc 작성을 도와주는 VS Code 확장:
- **Document This** - JSDoc 자동 생성
- **Better Comments** - 주석 하이라이팅

### 3. 타입 체크와 함께 사용

JSDoc은 TypeScript 없이도 타입 체크를 제공합니다:

```javascript
/**
 * @param {string} name
 * @param {number} age
 */
function greet(name, age) {
  // VS Code에서 타입 체크 활성화
}
```

### 4. 링크 추가

다른 클래스나 메서드를 참조:

```javascript
/**
 * DOM 요소를 선택합니다.
 * @see {@link DOMElement}
 * @param {string} selector - CSS 선택자
 * @returns {DOMElement}
 */
select(selector) {
  // ...
}
```

---

## 🐛 문제 해결

### JSDoc 생성 실패

```bash
# 의존성 재설치
rm -rf node_modules package-lock.json
npm install
```

### 템플릿을 찾을 수 없음

```bash
# docdash 설치 확인
npm list docdash

# 없으면 설치
npm install --save-dev docdash
```

### 문서가 업데이트되지 않음

```bash
# 캐시 삭제 후 재생성
npm run docs:clean
npm run docs
```

---

## 📖 참고 자료

- [JSDoc 공식 문서](https://jsdoc.app/)
- [Docdash 템플릿](https://github.com/clenemt/docdash)
- [JSDoc 타입 정의](https://jsdoc.app/tags-type.html)
- [JSDoc 예제](https://jsdoc.app/about-getting-started.html)

---

## ✅ 체크리스트

문서화 전 확인사항:

- [ ] 모든 공개 함수에 JSDoc 주석 작성
- [ ] 매개변수 타입과 설명 작성
- [ ] 반환값 타입과 설명 작성
- [ ] 사용 예제 추가 (`@example`)
- [ ] private 메서드는 `@private` 태그 추가
- [ ] deprecated 메서드는 `@deprecated` 태그 추가

---

**완벽한 문서화로 개발자 경험(DX) 향상!** 📚✨
