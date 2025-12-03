# 코어 API 레퍼런스

## 코어 모듈 목록

| 모듈 | 파일 | 설명 |
|------|------|------|
| DOM | `dom.js` | DOM 선택 및 조작 |
| Event | `event.js` | 이벤트 버스 |
| Router | `router.js` | SPA 라우터 |
| Loader | `loader.js` | 모듈 동적 로딩 |
| Loading | `loading.js` | 로딩 인디케이터 |
| State | `state.js` | 상태 관리 |
| Storage | `storage.js` | 로컬/세션 스토리지 |
| Security | `security.js` | XSS 방어, 새니타이징 |
| API | `api.js` | HTTP 클라이언트 |
| Template | `template.js` | 템플릿 렌더링 |
| Utils | `utils.js` | 유틸리티 함수 |
| Animation | `animation.js` | 애니메이션 유틸 |
| Formatters | `formatters.js` | 숫자, 날짜 포맷 |
| Helpers | `helpers.js` | 복사, 다운로드, 스크롤 |
| Config | `config.js` | 앱 설정 관리 |
| Form | `form.js` | 폼 검증 |
| URL | `url.js` | URL 파싱/생성 |
| Shortcuts | `shortcuts.js` | 단축 API |
| AutoInit | `auto-init.js` | 자동 초기화 |

---

## DOM API

### 요소 선택

```javascript
// 단일/다중 선택
const el = IMCAT('#app');
const els = IMCAT('.btn');
const all = IMCAT('div.card');
```

### 클래스 조작

```javascript
IMCAT('#app')
  .addClass('active')
  .removeClass('hidden')
  .toggleClass('open')
  .hasClass('active'); // boolean
```

### 속성 조작

```javascript
IMCAT('#input')
  .attr('placeholder', '입력하세요')  // 설정
  .attr('placeholder');               // 조회
  .removeAttr('disabled');

// data-* 속성
IMCAT('#el').data('id', 123);
IMCAT('#el').data('id'); // 123
```

### 콘텐츠 조작

```javascript
// 텍스트
IMCAT('#title').text('제목');
IMCAT('#title').text(); // 조회

// HTML
IMCAT('#content').html('<p>내용</p>');
IMCAT('#content').html(); // 조회

// 값 (input)
IMCAT('#input').val('값 설정');
IMCAT('#input').val(); // 조회
```

### 이벤트

```javascript
// 이벤트 바인딩
IMCAT('#btn').on('click', (e) => {
  console.log('clicked');
});

// 이벤트 제거
IMCAT('#btn').off('click', handler);

// 이벤트 발생
IMCAT('#form').trigger('submit');
```

### DOM 조작

```javascript
IMCAT('#list')
  .append('<li>새 항목</li>')   // 끝에 추가
  .prepend('<li>첫 항목</li>'); // 앞에 추가

IMCAT('#item').remove();        // 요소 삭제
IMCAT('#list').empty();         // 자식 삭제
```

### 표시/숨김

```javascript
IMCAT('#modal').show();
IMCAT('#modal').hide();
IMCAT('#panel').toggle();
```

### 탐색

```javascript
IMCAT('#item').parent();          // 부모
IMCAT('#list').children();        // 자식들
IMCAT('#item').siblings();        // 형제들
IMCAT('#list').find('.active');   // 하위 검색
IMCAT('#item').closest('.card');  // 상위 검색
```

### 반복

```javascript
IMCAT('.item').each((el, index) => {
  console.log(index, el.textContent);
});
```

---

## Router API

### 기본 사용

```javascript
// 페이지 이동
IMCAT.view.navigate('views/page.html');

// 쿼리 파라미터와 함께
IMCAT.view.navigate('views/detail.html', { id: 123 });
```

### 라이프사이클

```javascript
// 로딩 전 (false 반환 시 취소)
IMCAT.view.beforeLoad((path) => {
  if (!isLoggedIn) {
    IMCAT.view.navigate('views/login.html');
    return false;
  }
  return true;
});

// 로딩 후
IMCAT.view.afterLoad((path) => {
  trackPageView(path);
});
```

### 인스턴스 관리

```javascript
// 모듈 인스턴스 등록 (페이지 이동 시 자동 정리)
const modal = new Overlays.Modal({ title: '알림' });
IMCAT.view.registerInstance(modal);
```

### URL 파라미터

```javascript
// URL: ?id=123&name=test
const params = IMCAT.view.params();
console.log(params.id);   // '123'
console.log(params.name); // 'test'
```

---

## Event API

### 이벤트 버스

```javascript
// 구독
IMCAT.on('event:name', (data) => {
  console.log(data);
});

// 발행
IMCAT.emit('event:name', { key: 'value' });

// 일회성 구독
IMCAT.once('app:init', () => {
  console.log('최초 1회만 실행');
});

// 구독 취소
IMCAT.off('event:name', handler);
```

---

## State API

### 로컬 상태

```javascript
// 생성
const state = IMCAT.state.create({
  count: 0,
  items: []
});

// 감시
state.watch('count', (newVal, oldVal) => {
  console.log(`변경: ${oldVal} -> ${newVal}`);
});

// 값 변경 (자동 감지)
state.count++;
state.items.push('new item');

// 정리
state.destroy();
```

### 전역 상태

```javascript
// 스토어 생성/접근
const store = IMCAT.globalState.use('user', {
  isLoggedIn: false,
  profile: null
});

// 다른 곳에서 같은 스토어 접근
const sameStore = IMCAT.globalState.use('user');

// 값 변경
store.isLoggedIn = true;
store.profile = { name: 'John' };

// 스토어 삭제
IMCAT.globalState.remove('user');
```

---

## Storage API

### 기본 사용

```javascript
// 저장
IMCAT.storage.set('key', 'value');

// 객체 저장 (자동 JSON 변환)
IMCAT.storage.set('user', { id: 1, name: 'John' });

// 조회
const user = IMCAT.storage.get('user');

// 기본값
const theme = IMCAT.storage.get('theme', 'light');

// 삭제
IMCAT.storage.remove('key');

// 존재 확인
IMCAT.storage.has('key'); // boolean

// 전체 삭제
IMCAT.storage.clear();
```

### TTL (만료 시간)

```javascript
// 1시간 후 만료
IMCAT.storage.set('token', 'abc', { expires: 3600 });

// 만료된 값은 자동으로 null 반환
```

### 세션 스토리지

```javascript
IMCAT.storage.set('temp', 'data', { storage: 'session' });
IMCAT.storage.get('temp', null, { storage: 'session' });
```

---

## Security API

### XSS 방어

```javascript
// HTML 이스케이프
const safe = IMCAT.escape('<script>alert("xss")</script>');
// 결과: &lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;

// HTML 새니타이징 (위험 태그 제거)
const clean = IMCAT.sanitize('<p>안전</p><script>위험</script>');
// 결과: <p>안전</p>
```

---

## API Util

### HTTP 요청

```javascript
// GET
const data = await IMCAT.api.get('/api/users');

// POST
const result = await IMCAT.api.post('/api/users', {
  name: 'John',
  email: 'john@example.com'
});

// PUT
await IMCAT.api.put('/api/users/1', { name: 'Jane' });

// DELETE
await IMCAT.api.delete('/api/users/1');
```

### 설정

```javascript
// 기본 URL 설정
IMCAT.api.baseURL = 'https://api.example.com';

// 공통 헤더
IMCAT.api.headers = {
  'Authorization': 'Bearer token123'
};
```

---

## Template API

### 기본 렌더링

```javascript
// 변수 치환 (자동 XSS 방어)
const html = IMCAT.template.render(
  'Hello, {{name}}!',
  { name: 'World' }
);

// Raw HTML (이스케이프 안함)
const html = IMCAT.template.renderRaw(
  '<div>{{content}}</div>',
  { content: '<b>Bold</b>' }
);
```

### 조건/반복

```javascript
// 조건부 렌더링
const html = IMCAT.template.if(
  isLoggedIn,
  '<button>로그아웃</button>'
);

// 반복 렌더링
const listHtml = IMCAT.template.each(
  items,
  '<li>{{name}}</li>'
);
```

---

## Loading API

### 기본 사용

```javascript
// 표시
IMCAT.loading.show();
IMCAT.loading.show('데이터 로딩 중...');

// 숨김
IMCAT.loading.hide();

// 상태 확인
IMCAT.loading.isVisible(); // boolean
```

---

## Formatters

### 숫자/통화

```javascript
// 숫자 포맷
IMCAT.format.number(1234567);        // '1,234,567'
IMCAT.format.number(0.12345, 2);     // '0.12'

// 통화 포맷
IMCAT.format.currency(50000);        // '₩50,000'
IMCAT.format.currency(99.99, 'USD'); // '$99.99'

// 퍼센트
IMCAT.format.percent(0.1234);        // '12.34%'
```

### 날짜/시간

```javascript
// 날짜 포맷
IMCAT.format.date(new Date());                    // '2025-01-01'
IMCAT.format.date(new Date(), 'YYYY년 MM월 DD일'); // '2025년 01월 01일'

// 시간 포맷
IMCAT.format.time(new Date());       // '14:30:00'

// 상대 시간
IMCAT.format.relative(pastDate);     // '3일 전', '방금 전'
```

### 파일 크기

```javascript
IMCAT.format.fileSize(1024);         // '1 KB'
IMCAT.format.fileSize(1048576);      // '1 MB'
```

---

## Helpers

### 클립보드

```javascript
// 복사
await IMCAT.copy('복사할 텍스트');
await IMCAT.copy(document.getElementById('input'));
```

### 다운로드

```javascript
// 텍스트 파일
IMCAT.download('내용', 'file.txt', 'text/plain');

// JSON
IMCAT.download(JSON.stringify(data), 'data.json', 'application/json');
```

### 스크롤

```javascript
// 맨 위로
IMCAT.scrollTo(0);

// 요소로
IMCAT.scrollTo('#section');
IMCAT.scrollTo(element);

// 옵션
IMCAT.scrollTo('#section', { behavior: 'smooth', offset: -100 });
```

---

## Utils

### 타입 체크

```javascript
IMCAT.isString('hello');   // true
IMCAT.isNumber(123);       // true
IMCAT.isArray([1, 2, 3]);  // true
IMCAT.isObject({});        // true
IMCAT.isFunction(fn);      // true
```

### ID 생성

```javascript
IMCAT.randomId();           // 'imcat-a1b2c3'
IMCAT.randomId('modal');    // 'modal-x9y8z7'
```

### 함수 제어

```javascript
// 디바운스 (마지막 호출 후 대기)
const debouncedFn = IMCAT.debounce(fn, 300);

// 스로틀 (일정 간격으로 실행)
const throttledFn = IMCAT.throttle(fn, 100);
```

### 객체 조작

```javascript
// 병합
const merged = IMCAT.extend({}, defaults, options);

// 깊은 복사
const cloned = IMCAT.clone(object);
```
