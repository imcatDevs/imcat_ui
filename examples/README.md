# IMCAT UI 예제 모음

IMCAT UI 프레임워크의 다양한 기능을 테스트하고 학습할 수 있는 예제 모음입니다.

## 📚 예제 목록

### 1. 기본 예제 (basic.html)

**모든 코어 기능을 한눈에!**

- ✅ DOM 조작 (jQuery 스타일 API)
- ✅ 이벤트 시스템 (전역 이벤트 버스)
- ✅ XSS 보안 방어 (자동 이스케이프 & 새니타이징)
- ✅ API 통신 (통일된 응답 형식)
- ✅ 유틸리티 함수 (타입 체크, 객체 병합 등)
- ✅ 로딩 인디케이터 (스피너, 프로그레스 바)

**실행 방법:**

```bash
# 브라우저에서 직접 열기
open examples/basic.html

# 또는 로컬 서버 사용 (권장)
npx serve examples
# 브라우저에서 http://localhost:3000/basic.html
```

### 2. SPA 라우터 (spa.html)

**싱글 페이지 애플리케이션 라우팅!**

- ✅ History API 통합
- ✅ 페이지 전환 및 네비게이션
- ✅ URL 해시 기반 라우팅
- ✅ 라우터 훅 (beforeLoad, afterLoad, onError)
- ✅ 동적 콘텐츠 로딩
- ✅ 404 에러 처리

**실행 방법:**

```bash
npx serve examples
# 브라우저에서 http://localhost:3000/spa.html
```

### 3. 템플릿 엔진 (template-engine.html)

**강력하고 안전한 템플릿 시스템!**

- ✅ 기본 템플릿 렌더링 ({{key}} 문법)
- ✅ 자동 XSS 방어 (HTML 이스케이프)
- ✅ 조건부 렌더링 (if)
- ✅ 리스트 렌더링 (each)
- ✅ 템플릿 컴파일 (성능 최적화)
- ✅ 커스텀 템플릿 작성

**실행 방법:**

```bash
npx serve examples
# 브라우저에서 http://localhost:3000/template-engine.html
```

### 4. 폼 & 애니메이션 (form-animation.html)

**폼 검증과 부드러운 애니메이션!**

- ✅ 폼 검증 (실시간 검증)
- ✅ 다양한 애니메이션 효과
- ✅ 사용자 피드백

### 5. 상태 관리 (state-management.html)

**리액티브 상태 관리!**

- ✅ 리액티브 상태 생성
- ✅ 상태 변경 감지 (watch)
- ✅ 계산된 속성 (computed)
- ✅ 전역 상태 관리

### 6. 대시보드 (dashboard.html)

**실전 대시보드 예제!**

- ✅ 복합적인 UI 컴포넌트
- ✅ 차트 및 통계
- ✅ 실시간 데이터 업데이트

### 7. SPA 라우터 메인 (spa-router.html)

**선언적 라우팅 (catui-href)!**

- ✅ catui-href 속성으로 자동 라우팅
- ✅ views/ 하위 폴더 지원
- ✅ URL 파라미터 처리
- ✅ 라우터 훅

### 8. 예제 인덱스 (index.html)

**모든 예제를 한눈에!**

예제 목록과 프레임워크 통계를 보여주는 랜딩 페이지입니다.

## 🚀 빠른 시작

### 사전 준비

1. 프레임워크 빌드 완료

```bash
npm run build
```

2. dist 폴더에 빌드 파일 확인

```text
dist/
├── imcat-ui.js          # 개발용
└── imcat-ui.min.js      # 프로덕션용
```

### 로컬 서버 실행 (권장)

```bash
# serve 사용
npx serve examples

# 또는 http-server 사용
npx http-server examples -p 3000

# 또는 Python 내장 서버
python -m http.server 3000 --directory examples
```

### 브라우저에서 직접 열기

ES Module을 사용하므로 일부 브라우저에서는 CORS 이슈가 발생할 수 있습니다.
로컬 서버를 사용하는 것을 권장합니다.

## 🧪 테스트 가이드

### 기본 예제 테스트 순서

1. **DOM 조작**
   - "텍스트 변경" 버튼 클릭
   - "클래스 토글" 버튼으로 하이라이트 효과 확인
   - "요소 추가" 버튼으로 동적 요소 생성

2. **이벤트 시스템**
   - "클릭하세요" 버튼 반복 클릭하여 카운트 증가
   - "전역 이벤트 발행" 버튼으로 이벤트 버스 테스트

3. **보안 기능**
   - 입력 필드에 `<script>alert('XSS')</script>` 입력
   - "보안 처리" 버튼 클릭하여 XSS 차단 확인

4. **API 통신**
   - 각 버튼 클릭하여 표준 응답 형식 확인
   - 성공/에러/페이지네이션 응답 확인

5. **유틸리티**
   - 타입 체크 함수 테스트
   - 객체 병합 테스트
   - 디바운스 동작 확인

6. **로딩 인디케이터**
   - 2초 로딩 표시
   - 진행률 바 애니메이션

### SPA 라우터 테스트 순서

1. 네비게이션 바에서 각 메뉴 클릭
2. 브라우저 뒤로/앞으로 가기 버튼 테스트
3. 라우터 정보 박스에서 현재 경로 확인
4. 각 페이지의 인터랙션 테스트

## 🎯 학습 포인트

### 코드 구조

예제 코드는 다음과 같이 구성되어 있습니다:

```javascript
import IMCAT from '../dist/imcat-ui.js';

// 전역 객체로 등록
window.IMCAT = IMCAT;

// DOM 준비 완료
IMCAT.ready(() => {
  console.log('준비 완료!');
});

// DOM 조작
IMCAT('#element').text('Hello');

// 이벤트
IMCAT('#button').on('click', () => {
  console.log('Clicked!');
});

// 전역 이벤트
IMCAT.on('custom:event', (data) => {
  console.log(data);
});
```

### 주요 API 사용법

**DOM 조작**

```javascript
IMCAT('#id')              // ID로 선택
IMCAT('.class')           // 클래스로 선택
IMCAT.create('div', {})   // 요소 생성
```

**이벤트**

```javascript
IMCAT('#btn').on('click', handler)  // 이벤트 등록
IMCAT.on('global', handler)         // 전역 이벤트
IMCAT.emit('global', data)          // 이벤트 발행
```

**보안**

```javascript
IMCAT.escape(userInput)     // HTML 이스케이프
IMCAT.sanitize(html)        // HTML 새니타이징
```

**API**

```javascript
IMCAT.api.get(url)          // GET 요청
IMCAT.api.post(url, data)   // POST 요청
IMCAT.api.success(data)     // 성공 응답 생성
```

## 📖 추가 리소스

- [코어 설계서](../docs/코어_설계서.md)
- [API 레퍼런스](../docs/API_레퍼런스.md)
- [코딩 가이드](../docs/코딩_가이드.md)

## 🐛 문제 해결

### CORS 에러 발생 시

```bash
# 로컬 서버를 반드시 사용하세요
npx serve examples
```

### 모듈을 찾을 수 없음

```bash
# 빌드를 먼저 실행하세요
npm run build
```

### 스타일이 적용되지 않음

CSS는 인라인으로 포함되어 있으므로 별도 파일이 필요하지 않습니다.

## 💡 팁

1. **개발자 도구 콘솔 확인**
   - 모든 예제는 콘솔에 상세한 로그를 출력합니다
   - F12를 눌러 개발자 도구를 열고 Console 탭 확인

2. **코드 수정 실습**
   - 예제 HTML 파일을 직접 수정하여 실험해보세요
   - 실시간으로 결과를 확인할 수 있습니다

3. **네트워크 탭 활용**
   - 모듈 로딩 과정을 Network 탭에서 확인
   - ES Module의 동작 방식 학습

## 🎓 다음 단계

1. 예제 코드를 복사하여 새 프로젝트 시작
2. 커스텀 모듈 개발
3. 실제 백엔드 API와 통합
4. 프로덕션 배포

---

**즐거운 개발 되세요!** 🚀
