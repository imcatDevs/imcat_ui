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
4. [View Router API](#view-router-api) - SPA 라우팅 (views/ 하위 폴더 지원)
5. [Loading API](#loading-api) - 로딩 표시
6. [Security API](#security-api) - 보안
7. [Event API](#event-api) - 이벤트 버스
8. [Utils API](#utils-api) - 유틸리티
9. [Template API](#template-api) - 템플릿 엔진
10. [Animation API](#animation-api) - 애니메이션 (20+)
11. [Storage API](#storage-api) - LocalStorage 래퍼
12. [State API](#state-api) - 리액티브 상태 관리
13. [Form API](#form-api) - 폼 검증
14. [URL API](#url-api) - URL 파싱 및 조작
15. [유틸리티 헬퍼 메서드](#유틸리티-헬퍼-메서드) - ready(), version

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

### catui-href 속성 (선언적 라우팅)

HTML 요소에 `catui-href` 속성을 추가하면 자동으로 SPA 네비게이션이 적용됩니다.

**특징:**

- ✅ 설정 코드 불필요 (프레임워크가 자동 처리)
- ✅ 클릭 시 자동으로 `IMCAT.view.navigate()` 호출
- ✅ 모든 HTML 요소에 사용 가능 (a, button, div 등)
- ✅ 동적으로 추가된 요소도 자동 동작
- ✅ URL 파라미터 지원

```html
<!-- 링크 -->
<a catui-href="views/home.html">홈</a>
<a catui-href="views/products.html">제품</a>

<!-- 버튼 -->
<button catui-href="views/about.html">소개</button>

<!-- URL 파라미터 -->
<a catui-href="views/product-detail.html?id=123">상품 상세</a>

<!-- 모든 요소에 사용 가능 -->
<div catui-href="views/dashboard.html" style="cursor: pointer;">
  대시보드로 이동
</div>
```

**동적으로 추가된 요소도 자동 동작:**

```javascript
// 동적으로 생성된 요소도 자동으로 SPA 네비게이션
IMCAT('#product-list').html(`
  <li><a catui-href="views/product-detail.html?id=1">상품 1</a></li>
  <li><a catui-href="views/product-detail.html?id=2">상품 2</a></li>
`);
// 별도의 바인딩 코드 불필요!
```

---

### IMCAT.view.navigate(path, [replace])

프로그래밍 방식으로 페이지 이동

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

## Template API

### IMCAT.template.render(template, data)

템플릿 문자열을 데이터로 렌더링합니다. (자동 XSS 방어)

```javascript
const html = IMCAT.template.render('Hello {{name}}!', { name: 'John' });
// 'Hello John!'

// XSS 자동 방어
const html2 = IMCAT.template.render('{{userInput}}', { 
  userInput: '<script>alert("XSS")</script>' 
});
// &lt;script&gt;alert("XSS")&lt;/script&gt;
```

**매개변수:**

- `template` (string) - 템플릿 문자열 ({{key}} 형식)
- `data` (Object) - 데이터 객체

**반환값:** `string` - 렌더링된 HTML

---

### IMCAT.template.renderRaw(template, data)

이스케이프 없이 렌더링합니다. **신뢰할 수 있는 HTML만 사용!**

```javascript
const html = IMCAT.template.renderRaw('{{content}}', { 
  content: '<b>Bold</b>' 
});
// '<b>Bold</b>'
```

---

### IMCAT.template.if(condition, template, data)

조건부 렌더링

```javascript
const user = { isAdmin: true, name: 'Admin' };

const html = IMCAT.template.if(
  user.isAdmin,
  '<button>Admin Panel</button>',
  user
);
// '<button>Admin Panel</button>'

const html2 = IMCAT.template.if(false, '<button>Hidden</button>');
// ''
```

---

### IMCAT.template.each(items, template)

배열의 각 아이템을 템플릿으로 렌더링

```javascript
const users = [
  { name: 'John', age: 30 },
  { name: 'Jane', age: 25 }
];

const html = IMCAT.template.each(users, '<li>{{name}} ({{age}})</li>');
// '<li>John (30)</li><li>Jane (25)</li>'
```

---

### IMCAT.template.compile(template)

템플릿을 컴파일하여 재사용 가능한 함수 생성

```javascript
const userCard = IMCAT.template.compile(`
  <div class="card">
    <h3>{{name}}</h3>
    <p>{{email}}</p>
  </div>
`);

const html1 = userCard({ name: 'John', email: 'john@example.com' });
const html2 = userCard({ name: 'Jane', email: 'jane@example.com' });
```

---

### Template API 실전 예제

#### 사용자 목록 렌더링

```javascript
const users = [
  { id: 1, name: 'John Doe', role: 'Admin' },
  { id: 2, name: 'Jane Smith', role: 'User' }
];

const html = `
  <ul class="user-list">
    ${IMCAT.template.each(users, `
      <li data-id="{{id}}">
        <strong>{{name}}</strong> - {{role}}
      </li>
    `)}
  </ul>
`;

IMCAT('#app').html(html);
```

#### 조건부 UI 렌더링

```javascript
function renderProductCard(product) {
  return IMCAT.template.render(`
    <div class="product-card">
      <h3>{{name}}</h3>
      <p class="price">₩{{price}}</p>
      ${IMCAT.template.if(product.inStock, '<span class="badge">재고 있음</span>')}
      ${IMCAT.template.if(product.isNew, '<span class="badge new">신상품</span>')}
    </div>
  `, product);
}
```

---

## Animation API

### IMCAT.animate(element)

요소에 애니메이션을 적용합니다. (Web Animations API 기반)

```javascript
// Fade In
await IMCAT.animate('#card').fadeIn(600);

// Bounce In
await IMCAT.animate('.button').bounceIn(500);

// Shake 효과
await IMCAT.animate('#alert').shake();
```

**매개변수:**

- `element` (string | HTMLElement) - 대상 요소

**반환값:** `Animator` - 애니메이터 인스턴스

---

### Fade 애니메이션

#### .fadeIn(duration, easing)

요소를 서서히 나타냅니다.

```javascript
await IMCAT.animate('#modal').fadeIn(300);
await IMCAT.animate('#modal').fadeIn(500, 'ease-out');
```

#### .fadeOut(duration, easing)

요소를 서서히 사라지게 합니다.

```javascript
await IMCAT.animate('#notification').fadeOut(300);
```

---

### Scale 애니메이션

#### .scaleIn(duration, easing)

요소를 확대하며 나타냅니다.

```javascript
await IMCAT.animate('#tooltip').scaleIn(300);
```

#### .scaleOut(duration, easing)

요소를 축소하며 사라지게 합니다.

```javascript
await IMCAT.animate('#popup').scaleOut(300);
```

---

### Bounce 애니메이션

#### .bounceIn(duration, easing)

요소를 튕기며 나타냅니다.

```javascript
await IMCAT.animate('#button').bounceIn(600);
```

#### .bounceOut(duration, easing)

요소를 튕기며 사라지게 합니다.

```javascript
await IMCAT.animate('#alert').bounceOut(600);
```

---

### Slide 애니메이션

#### .slideDown(duration, easing)

요소를 위에서 아래로 슬라이드합니다.

```javascript
await IMCAT.animate('#menu').slideDown(400);
```

#### .slideUp(duration, easing)

요소를 아래에서 위로 슬라이드합니다.

```javascript
await IMCAT.animate('#dropdown').slideUp(400);
```

---

### 효과 애니메이션

#### .shake(duration)

요소를 좌우로 흔듭니다.

```javascript
await IMCAT.animate('#error-message').shake();
```

#### .pulse(duration)

요소를 확대/축소 반복합니다.

```javascript
await IMCAT.animate('#notification-badge').pulse();
```

#### .tada(duration)

요소를 회전하며 강조합니다.

```javascript
await IMCAT.animate('#success-icon').tada();
```

#### .swing(duration), .wobble(duration), .heartBeat(duration)

다양한 효과 애니메이션을 제공합니다.

```javascript
await IMCAT.animate('#element').swing(800);
await IMCAT.animate('#element').wobble(800);
await IMCAT.animate('#element').heartBeat(500);
```

---

### 애니메이션 실전 예제

```javascript
// 순차 애니메이션
async function showNotification(message) {
  const notification = IMCAT('#notification')
    .text(message)
    .show();
  
  await IMCAT.animate(notification).bounceIn(500);
  await new Promise(resolve => setTimeout(resolve, 3000));
  await IMCAT.animate(notification).fadeOut(300);
}

// 에러 표시
async function showError(element) {
  await IMCAT.animate(element).shake(500);
  IMCAT(element).addClass('error');
}

// 버튼 클릭 피드백
IMCAT('#submit-btn').on('click', async function() {
  await IMCAT.animate(this).pulse(300);
  // ... 제출 로직
});
```

---

## Storage API

### IMCAT.storage.set(key, value, options)

LocalStorage에 값을 저장합니다. (자동 직렬화)

```javascript
// 기본 저장
IMCAT.storage.set('user', { name: 'John', age: 30 });

// 만료 시간 설정 (5분)
IMCAT.storage.set('token', 'abc123', { ttl: 300 });

// Session Storage 사용
IMCAT.storage.set('temp', 'data', { session: true });
```

**매개변수:**

- `key` (string) - 키
- `value` (any) - 값 (자동으로 JSON 직렬화)
- `options` (Object) - 옵션
  - `ttl` (number) - 만료 시간 (초)
  - `session` (boolean) - Session Storage 사용 여부

---

### IMCAT.storage.get(key, defaultValue)

LocalStorage에서 값을 가져옵니다. (자동 역직렬화)

```javascript
const user = IMCAT.storage.get('user');
// { name: 'John', age: 30 }

// 기본값 설정
const theme = IMCAT.storage.get('theme', 'light');
```

**매개변수:**

- `key` (string) - 키
- `defaultValue` (any) - 기본값 (키가 없을 때)

**반환값:** `any` - 저장된 값 (만료되었으면 null)

---

### IMCAT.storage.remove(key)

값을 삭제합니다.

```javascript
IMCAT.storage.remove('token');
```

---

### IMCAT.storage.clear()

모든 값을 삭제합니다.

```javascript
IMCAT.storage.clear();
```

---

### IMCAT.storage.has(key)

키의 존재 여부를 확인합니다.

```javascript
if (IMCAT.storage.has('user')) {
  console.log('로그인됨');
}
```

---

### Storage 실전 예제

```javascript
// 사용자 세션 관리
function login(userData, remember = false) {
  if (remember) {
    // 7일간 유지
    IMCAT.storage.set('user', userData, { ttl: 7 * 24 * 60 * 60 });
  } else {
    // 세션만 유지
    IMCAT.storage.set('user', userData, { session: true });
  }
}

// 자동 로그인 확인
function checkAuth() {
  const user = IMCAT.storage.get('user');
  if (user) {
    console.log('자동 로그인:', user.name);
    return true;
  }
  return false;
}

// 로그아웃
function logout() {
  IMCAT.storage.remove('user');
  IMCAT.view.navigate('views/login.html', true);
}
```

---

## State API

### IMCAT.state.create(initialState)

리액티브 상태 객체를 생성합니다.

```javascript
const state = IMCAT.state.create({
  count: 0,
  user: null,
  isLoading: false
});

// 상태 변경 감지
state.watch('count', (newValue, oldValue) => {
  console.log(`Count: ${oldValue} → ${newValue}`);
});

// 상태 변경
state.set('count', 5); // 자동으로 watch 콜백 실행
```

**매개변수:**

- `initialState` (Object) - 초기 상태

**반환값:** `StateManager` - 상태 관리자 인스턴스

---

### state.get(key)

상태 값을 가져옵니다.

```javascript
const count = state.get('count');
```

---

### state.set(key, value)

상태 값을 설정합니다. (watch 콜백 자동 실행)

```javascript
state.set('count', 10);
state.set('user', { name: 'John' });
```

---

### state.watch(key, callback)

상태 변경을 감지합니다.

```javascript
const unwatch = state.watch('count', (newValue, oldValue) => {
  IMCAT('#counter').text(newValue);
});

// 감지 중지
unwatch();
```

---

### state.computed(key, dependencies, computeFn)

계산된 속성을 정의합니다.

```javascript
state.computed('fullName', ['firstName', 'lastName'], (state) => {
  return `${state.firstName} ${state.lastName}`;
});

state.set('firstName', 'John');
state.set('lastName', 'Doe');
console.log(state.get('fullName')); // 'John Doe'
```

---

### IMCAT.globalState

앱 전체에서 공유하는 전역 상태입니다.

```javascript
// 어디서든 접근 가능
IMCAT.globalState.set('theme', 'dark');

// 다른 파일에서
const theme = IMCAT.globalState.get('theme');
```

---

### State 실전 예제

```javascript
// Todo 앱 상태 관리
const todoState = IMCAT.state.create({
  todos: [],
  filter: 'all' // 'all', 'active', 'completed'
});

// 필터링된 Todo 계산
todoState.computed('filteredTodos', ['todos', 'filter'], (state) => {
  if (state.filter === 'all') return state.todos;
  if (state.filter === 'active') return state.todos.filter(t => !t.completed);
  return state.todos.filter(t => t.completed);
});

// UI 자동 업데이트
todoState.watch('filteredTodos', (todos) => {
  const html = IMCAT.template.each(todos, `
    <li class="{{#completed}}completed{{/completed}}">
      {{text}}
    </li>
  `);
  IMCAT('#todo-list').html(html);
});

// Todo 추가
function addTodo(text) {
  const todos = todoState.get('todos');
  todoState.set('todos', [...todos, { id: Date.now(), text, completed: false }]);
}
```

---

## Form API

### IMCAT.form.validate(selector, rules)

폼 검증을 설정합니다.

```javascript
const validator = IMCAT.form.validate('#myForm', {
  rules: {
    email: ['required', 'email'],
    password: ['required', { min: 8 }],
    age: ['required', 'number', { min: 18, max: 100 }]
  },
  messages: {
    email: {
      required: '이메일을 입력하세요',
      email: '올바른 이메일 형식이 아닙니다'
    },
    password: {
      required: '비밀번호를 입력하세요',
      min: '비밀번호는 최소 8자 이상이어야 합니다'
    }
  }
});
```

**매개변수:**

- `selector` (string) - 폼 선택자
- `rules` (Object) - 검증 규칙

**반환값:** `FormValidator` - 검증기 인스턴스

---

### validator.validate()

폼을 수동으로 검증합니다.

```javascript
if (validator.validate()) {
  console.log('검증 성공');
  // 폼 제출
}
```

---

### validator.getValues()

폼의 모든 값을 가져옵니다.

```javascript
const formData = validator.getValues();
// { email: 'user@example.com', password: '********' }
```

---

### validator.destroy()

검증기를 정리합니다.

```javascript
validator.destroy();
```

---

### Form 실전 예제

```javascript
// 회원가입 폼
const signupValidator = IMCAT.form.validate('#signup-form', {
  rules: {
    username: ['required', { min: 3, max: 20 }, 'alphanumeric'],
    email: ['required', 'email'],
    password: ['required', { min: 8 }],
    passwordConfirm: ['required', { match: 'password' }],
    terms: ['required']
  }
});

IMCAT('#signup-form').on('submit', async (e) => {
  e.preventDefault();
  
  if (!signupValidator.validate()) {
    return;
  }
  
  const data = signupValidator.getValues();
  const response = await IMCAT.api.post('/api/signup', data);
  
  if (response.success) {
    IMCAT.view.navigate('views/welcome.html');
  }
});
```

---

## URL API

### IMCAT.url.parse(queryString)

쿼리 스트링을 객체로 파싱합니다.

```javascript
const params = IMCAT.url.parse('?id=1&name=John&tags=a,b,c');
// { id: '1', name: 'John', tags: 'a,b,c' }

// 현재 URL 파싱
const current = IMCAT.url.parse(window.location.search);
```

---

### IMCAT.url.stringify(params)

객체를 쿼리 스트링으로 변환합니다.

```javascript
const query = IMCAT.url.stringify({ id: 1, name: 'John' });
// 'id=1&name=John'
```

---

### IMCAT.url.build(base, params)

베이스 URL과 파라미터로 전체 URL을 생성합니다.

```javascript
const url = IMCAT.url.build('/api/users', { page: 1, limit: 10 });
// '/api/users?page=1&limit=10'
```

---

### IMCAT.url.getParam(key)

현재 URL에서 특정 파라미터를 가져옵니다.

```javascript
// URL: /products.html?category=electronics
const category = IMCAT.url.getParam('category');
// 'electronics'
```

---

### URL 실전 예제

```javascript
// 페이지네이션
function loadPage(page) {
  const params = IMCAT.url.parse(window.location.search);
  params.page = page;
  
  const newUrl = IMCAT.url.build(window.location.pathname, params);
  window.history.pushState({}, '', newUrl);
  
  fetchData(params);
}

// 검색 필터
function applyFilters(filters) {
  const query = IMCAT.url.stringify(filters);
  IMCAT.view.navigate(`views/products.html?${query}`);
}

// API 요청 URL 빌더
async function fetchUsers(options = {}) {
  const url = IMCAT.url.build('/api/users', {
    page: options.page || 1,
    limit: options.limit || 20,
    sort: options.sort || 'name'
  });
  
  return await IMCAT.api.get(url);
}
```

---

## 유틸리티 헬퍼 메서드

### IMCAT.ready(callback)

DOM이 준비되면 콜백을 실행합니다.

```javascript
IMCAT.ready(() => {
  console.log('DOM 준비 완료');
  initApp();
});
```

---

### IMCAT.version

프레임워크 버전을 반환합니다.

```javascript
console.log('IMCAT UI 버전:', IMCAT.version);
// '1.0.0'
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
