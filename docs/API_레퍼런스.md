# IMCAT UI API 레퍼런스

## 📋 개요

IMCAT UI 프레임워크의 전체 공개 API 레퍼런스입니다.

**버전:** 1.0.0  
**최종 업데이트:** 2025-11-23

---

## 📚 목차

1. [Core API](#core-api) - IMCAT(), use(), create()
2. [DOM API](#dom-api) - 요소 조작
3. [API 유틸리티](#api-유틸리티) - HTTP 요청
4. [View Router API](#view-router-api) - SPA 라우팅
5. [Loading API](#loading-api) - 로딩 표시
6. [Security API](#security-api) - 보안
7. [Event API](#event-api) - 이벤트 버스
8. [Utils API](#utils-api) - 유틸리티

---

## Core API

### IMCAT(selector)

DOM 요소를 선택합니다.

```javascript
// CSS 선택자
const app = IMCAT('#app');
const buttons = IMCAT('.button');

// 메서드 체이닝
IMCAT('#app')
  .addClass('active')
  .text('Hello')
  .on('click', handler);
```

**매개변수:**

- `selector` (string | HTMLElement) - 선택자

**반환값:** `DOMElement`

---

### IMCAT.use(...moduleNames)

모듈을 동적으로 로드합니다.

```javascript
// 단일 모듈
const Modal = await IMCAT.use('modal');

// 여러 모듈
const [Modal, Dropdown] = await IMCAT.use('modal', 'dropdown');
```

**매개변수:**

- `...moduleNames` (string[]) - 모듈 이름들

**반환값:** `Promise<Module | Module[]>`

---

### IMCAT.create(tagName, attributes)

새 DOM 요소를 생성합니다.

```javascript
const div = IMCAT.create('div', {
  class: 'card',
  id: 'my-card',
  text: 'Content'
});

IMCAT.create('button', { text: 'Click' })
  .on('click', handler)
  .appendTo('#container');
```

**매개변수:**

- `tagName` (string) - HTML 태그
- `attributes` (Object) - 속성 객체

**반환값:** `DOMElement`

---

## DOM API

### .text([value])

텍스트 내용 설정/가져오기 (자동 이스케이프)

```javascript
const text = IMCAT('#title').text();  // 가져오기
IMCAT('#title').text('새 제목');      // 설정
```

---

### .html([value])

HTML 내용 설정/가져오기 (자동 새니타이징)

```javascript
const html = IMCAT('#content').html();
IMCAT('#content').html('<h1>제목</h1>');
```

---

### .addClass(className) / .removeClass(className) / .toggleClass(className)

CSS 클래스 조작

```javascript
IMCAT('#btn').addClass('active');
IMCAT('#btn').removeClass('disabled');
IMCAT('#menu').toggleClass('open');
```

---

### .hasClass(className)

클래스 포함 여부 확인

```javascript
if (IMCAT('#menu').hasClass('open')) {
  console.log('열림');
}
```

---

### .attr(name, [value]) / .removeAttr(name)

속성 조작

```javascript
const href = IMCAT('#link').attr('href');
IMCAT('#link').attr('href', '/page');
IMCAT('#input').removeAttr('disabled');
```

---

### .data(key, [value])

data 속성 조작

```javascript
IMCAT('#product').data('id', '123');
const id = IMCAT('#product').data('id');
```

---

### .css(property, [value])

CSS 스타일 조작

```javascript
const color = IMCAT('#text').css('color');
IMCAT('#box').css('background-color', 'red');
IMCAT('#card').css({
  width: '300px',
  height: '200px'
});
```

---

### .on(event, [selector], handler) / .off(event, handler)

이벤트 리스너 추가/제거

```javascript
// 직접 바인딩
IMCAT('#btn').on('click', (e) => {
  console.log('클릭');
});

// 이벤트 위임
IMCAT('#list').on('click', '.item', (e) => {
  console.log('아이템 클릭');
});

// 제거
IMCAT('#btn').off('click', handler);
```

---

### .show() / .hide() / .toggle()

요소 표시/숨김

```javascript
IMCAT('#modal').show();
IMCAT('#loading').hide();
IMCAT('#dropdown').toggle();
```

---

### .append(content) / .appendTo(parent)

요소 추가

```javascript
IMCAT('#list').append('<li>항목</li>');

IMCAT.create('div').appendTo('#container');
```

---

### .remove()

요소 제거

```javascript
IMCAT('#old-content').remove();
```

---

### .find(selector) / .parent() / .closest(selector)

요소 탐색

```javascript
const items = IMCAT('#list').find('.item');
const parent = IMCAT('#child').parent();
const card = IMCAT('.btn').closest('.card');
```

---

### .each(callback)

각 요소에 함수 실행

```javascript
IMCAT('.item').each((el, index) => {
  console.log(`Item ${index}`, el);
});
```

---

## API 유틸리티

### 응답 포맷

```typescript
interface ApiResponse {
  success: boolean;
  statusCode: number;
  data: any;
  message: string | null;
  error: Object | null;
  timestamp: number;
}
```

---

### IMCAT.api.get(url, [options])

GET 요청

```javascript
const response = await IMCAT.api.get('/api/users');
if (response.success) {
  console.log(response.data);
}

// 커스텀 헤더
const profile = await IMCAT.api.get('/api/profile', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

---

### IMCAT.api.post(url, body, [options])

POST 요청

```javascript
const response = await IMCAT.api.post('/api/users', {
  name: 'John',
  email: 'john@example.com'
});
```

---

### IMCAT.api.put(url, body, [options])

PUT 요청

```javascript
await IMCAT.api.put('/api/users/123', {
  name: 'Jane'
});
```

---

### IMCAT.api.patch(url, body, [options])

PATCH 요청

```javascript
await IMCAT.api.patch('/api/users/123', {
  age: 31
});
```

---

### IMCAT.api.delete(url, [options])

DELETE 요청

```javascript
const response = await IMCAT.api.delete('/api/users/123');
if (response.success) {
  console.log('삭제 완료');
}
```

---

### IMCAT.api.all(...requests)

여러 요청 병렬 실행

```javascript
const [users, posts, comments] = await IMCAT.api.all(
  IMCAT.api.get('/api/users'),
  IMCAT.api.get('/api/posts'),
  IMCAT.api.get('/api/comments')
);
```

---

## View Router API

### IMCAT.view.navigate(path, [replace])

페이지 이동

```javascript
await IMCAT.view.navigate('views/home.html');
await IMCAT.view.navigate('views/login.html', true); // 히스토리 교체
```

---

### IMCAT.view.params()

URL 파라미터 가져오기

```javascript
// URL: #views/product.html?id=123
const params = IMCAT.view.params();
console.log(params.id); // '123'
```

---

### IMCAT.view.current()

현재 경로 가져오기

```javascript
const path = IMCAT.view.current();
```

---

### IMCAT.view.back() / .forward()

브라우저 히스토리 탐색

```javascript
IMCAT.view.back();
IMCAT.view.forward();
```

---

### IMCAT.view.registerInstance(instance)

인스턴스 등록 (자동 정리)

```javascript
const modal = new Modal();
IMCAT.view.registerInstance(modal);
// 뷰 전환 시 modal.destroy() 자동 호출
```

---

### IMCAT.view.beforeLoad(handler)

페이지 로드 전 훅

```javascript
IMCAT.view.beforeLoad((path, from) => {
  console.log(`${from} → ${path}`);
});
```

---

### IMCAT.view.afterLoad(handler)

페이지 로드 후 훅

```javascript
IMCAT.view.afterLoad((path) => {
  console.log('로드 완료:', path);
});
```

---

### IMCAT.view.onError(handler)

에러 발생 훅

```javascript
IMCAT.view.onError((error) => {
  console.error('로드 실패:', error);
});
```

---

## Loading API

### IMCAT.loading.show([message])

로딩 표시

```javascript
IMCAT.loading.show();
IMCAT.loading.show('데이터 로딩 중...');
```

---

### IMCAT.loading.hide()

로딩 숨김

```javascript
IMCAT.loading.hide();
```

---

### IMCAT.loading.config(options)

로딩 설정

```javascript
IMCAT.loading.config({
  style: 'spinner',  // 'spinner', 'bar', 'dots'
  color: '#007bff',
  position: 'center', // 'center', 'top'
  delay: 200
});
```

---

### IMCAT.loading.progress(percent)

진행률 설정 (프로그레스 바)

```javascript
IMCAT.loading.progress(50); // 50%
```

---

## Security API

### IMCAT.escape(str)

HTML 이스케이프

```javascript
const safe = IMCAT.escape('<script>alert("XSS")</script>');
// &lt;script&gt;alert("XSS")&lt;/script&gt;
```

---

### IMCAT.sanitize(html)

HTML 새니타이징 (위험 요소 제거)

```javascript
const clean = IMCAT.sanitize('<script>alert()</script><p>안전</p>');
// <p>안전</p>
```

---

### IMCAT.validatePath(path)

경로 검증 (경로 순회 방지)

```javascript
if (IMCAT.validatePath('views/home.html')) {
  console.log('안전한 경로');
}
```

---

### IMCAT.isSafeFilename(filename)

파일명 검증

```javascript
if (IMCAT.isSafeFilename('document.pdf')) {
  console.log('안전한 파일명');
}
```

---

## Event API

### IMCAT.on(event, handler)

이벤트 구독

```javascript
IMCAT.on('user:login', (user) => {
  console.log('로그인:', user);
});
```

---

### IMCAT.once(event, handler)

일회성 이벤트 구독

```javascript
IMCAT.once('data:loaded', () => {
  console.log('한 번만 실행');
});
```

---

### IMCAT.off(event, [handler])

이벤트 구독 취소

```javascript
const handler = () => console.log('이벤트');
IMCAT.on('custom', handler);
IMCAT.off('custom', handler);

// 모든 핸들러 제거
IMCAT.off('custom');
```

---

### IMCAT.emit(event, ...args)

이벤트 발생

```javascript
IMCAT.emit('user:login', { id: 1, name: 'John' });
IMCAT.emit('data:updated', data, timestamp);
```

---

## Utils API

### IMCAT.isString(value) / isNumber(value) / isBoolean(value) / isObject(value) / isArray(value) / isFunction(value)

타입 체크

```javascript
IMCAT.isString('hello');  // true
IMCAT.isNumber(123);      // true
IMCAT.isArray([1, 2]);    // true
```

---

### IMCAT.isNull(value) / isUndefined(value) / isNullOrUndefined(value)

null/undefined 체크

```javascript
IMCAT.isNull(null);              // true
IMCAT.isUndefined(undefined);    // true
IMCAT.isNullOrUndefined(null);   // true
```

---

### IMCAT.extend(target, ...sources)

객체 병합

```javascript
const result = IMCAT.extend({}, { a: 1 }, { b: 2 });
// { a: 1, b: 2 }
```

---

### IMCAT.clone(obj)

깊은 복사

```javascript
const original = { a: { b: 1 } };
const copy = IMCAT.clone(original);
```

---

### IMCAT.unique(array)

배열 중복 제거

```javascript
const arr = [1, 2, 2, 3, 3, 3];
const unique = IMCAT.unique(arr); // [1, 2, 3]
```

---

### IMCAT.flatten(array)

배열 평탄화

```javascript
const nested = [1, [2, [3, 4]]];
const flat = IMCAT.flatten(nested); // [1, 2, 3, 4]
```

---

### IMCAT.debounce(func, wait)

디바운스

```javascript
const search = IMCAT.debounce((query) => {
  console.log('검색:', query);
}, 300);

IMCAT('#search').on('input', (e) => {
  search(e.target.value);
});
```

---

### IMCAT.throttle(func, limit)

스로틀

```javascript
const onScroll = IMCAT.throttle(() => {
  console.log('스크롤');
}, 100);

window.addEventListener('scroll', onScroll);
```

---

### IMCAT.randomId([prefix])

랜덤 ID 생성

```javascript
const id = IMCAT.randomId('user'); // 'user-abc123xyz'
```

---

### IMCAT.randomInt(min, max)

랜덤 정수 생성

```javascript
const num = IMCAT.randomInt(1, 100); // 1~100 사이
```

---

## 📖 사용 예제

### 완전한 SPA 애플리케이션

```javascript
// index.html
import IMCAT from './imcat-ui.js';

// 페이지 로드 후 초기화
IMCAT.view.afterLoad(async (path) => {
  // 사용자 인증 확인
  const token = localStorage.getItem('token');
  if (!token && path !== 'views/login.html') {
    IMCAT.view.navigate('views/login.html', true);
    return;
  }
  
  // 페이지별 초기화
  if (path === 'views/dashboard.html') {
    await initDashboard();
  }
});

async function initDashboard() {
  // 데이터 로드
  const response = await IMCAT.api.get('/api/dashboard');
  
  if (response.success) {
    const { users, stats } = response.data;
    
    // DOM 업데이트
    IMCAT('#user-count').text(users.length);
    IMCAT('#stats').html(renderStats(stats));
    
    // 이벤트 바인딩
    IMCAT('#refresh-btn').on('click', initDashboard);
  }
}
```

---

## 🔗 관련 문서

- [프레임워크 설계 이념](./프레임워크_설계_이념.md)
- [코어 설계서](./코어_설계서.md)
- [코딩 가이드](./코딩_가이드.md)
- [모듈 시스템 설계서](./모듈_시스템_설계서.md)
