# Theme Module

테마 전환 및 관리를 위한 IMCAT UI 확장 모듈입니다.

## ✨ 주요 기능

- **🌓 라이트/다크 테마** - 즉각적인 테마 전환
- **🖥️ 시스템 설정 감지** - `prefers-color-scheme` 자동 감지
- **💾 자동 저장** - localStorage에 선택 저장
- **🎨 커스텀 테마** - 무제한 커스텀 테마 생성
- **⚡ 부드러운 전환** - CSS transition 애니메이션
- **📱 반응형** - 모든 디바이스 지원
- **♿ 접근성** - WCAG 2.1 AA 준수

---

## 📦 설치

### 방법 1: ES Module (권장)

```javascript
import Theme from './src/modules/theme/theme.js';

const theme = new Theme({
  defaultTheme: 'system',
  transition: true
});
```

### 방법 2: 싱글톤 인스턴스

```javascript
import { themeInstance } from './src/modules/theme/theme.js';

themeInstance.setTheme('dark');
```

---

## 🚀 사용법

### 1. 기본 사용

```javascript
// 테마 인스턴스 생성
const theme = new Theme();

// 테마 설정
theme.setTheme('dark');   // 다크 테마
theme.setTheme('light');  // 라이트 테마
theme.setTheme('system'); // 시스템 설정 따름

// 토글
theme.toggleTheme(); // light ↔ dark

// 현재 테마 가져오기
const current = theme.getTheme();        // 'dark'
const actual = theme.getActualTheme();   // 'dark' (system 해석 후)
const system = theme.getSystemTheme();   // 'light' (시스템 설정)
```

### 2. 옵션 설정

```javascript
const theme = new Theme({
  defaultTheme: 'light',          // 기본 테마 (기본값: 'system')
  storageKey: 'my-app-theme',     // localStorage 키 (기본값: 'imcat-theme')
  transition: true,               // 전환 애니메이션 (기본값: true)
  transitionDuration: 500,        // 애니메이션 시간 ms (기본값: 500)
  autoInit: true,                 // 자동 초기화 (기본값: true)
  
  // 테마 변경 콜백
  onChange: (theme, actualTheme, oldTheme) => {
    console.log(`테마 변경: ${oldTheme} → ${theme} (실제: ${actualTheme})`);
  }
});
```

### 3. 커스텀 테마

```javascript
// 커스텀 테마 등록
theme.registerCustomTheme('ocean', {
  primary: '#0077be',
  secondary: '#4fc3f7',
  background: '#e0f7fa',
  text: '#004d7a'
});

// 적용
theme.applyCustomTheme('ocean');
```

### 4. 이벤트 리스너

```javascript
// 테마 변경 이벤트
document.addEventListener('imcat:themechange', (e) => {
  console.log('테마 변경:', e.detail);
  // {
  //   theme: 'dark',
  //   actualTheme: 'dark',
  //   oldTheme: 'light'
  // }
});

// 시스템 테마 변경 이벤트 (system 모드일 때만)
document.addEventListener('imcat:systemthemechange', (e) => {
  console.log('시스템 테마 변경:', e.detail.theme);
});
```

---

## 🎨 HTML 사용 예제

### 테마 스위처

```html
<div class="theme-switcher">
  <span class="theme-switcher__label">테마:</span>
  <div class="theme-switcher__buttons">
    <button class="theme-switcher__button" data-theme="light">
      <i class="material-icons-outlined">light_mode</i>
      <span>라이트</span>
    </button>
    <button class="theme-switcher__button theme-switcher__button--active" data-theme="dark">
      <i class="material-icons-outlined">dark_mode</i>
      <span>다크</span>
    </button>
    <button class="theme-switcher__button" data-theme="system">
      <i class="material-icons-outlined">brightness_auto</i>
      <span>시스템</span>
    </button>
  </div>
</div>

<script type="module">
  import Theme from './src/modules/theme/theme.js';
  
  const theme = new Theme();
  
  document.querySelectorAll('[data-theme]').forEach(btn => {
    btn.addEventListener('click', () => {
      theme.setTheme(btn.dataset.theme);
      
      // 활성 상태 업데이트
      document.querySelectorAll('[data-theme]').forEach(b => 
        b.classList.remove('theme-switcher__button--active')
      );
      btn.classList.add('theme-switcher__button--active');
    });
  });
</script>
```

### 토글 버튼

```html
<button class="theme-toggle" id="themeToggle">
  <i class="material-icons-outlined">dark_mode</i>
</button>

<script type="module">
  import Theme from './src/modules/theme/theme.js';
  
  const theme = new Theme();
  const toggleBtn = document.getElementById('themeToggle');
  
  toggleBtn.addEventListener('click', () => {
    theme.toggleTheme();
    
    // 아이콘 업데이트
    const icon = toggleBtn.querySelector('i');
    const actualTheme = theme.getActualTheme();
    icon.textContent = actualTheme === 'dark' ? 'light_mode' : 'dark_mode';
  });
</script>
```

---

## 📖 API 레퍼런스

### 생성자

```javascript
new Theme(options)
```

| 옵션 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `defaultTheme` | string | `'system'` | 기본 테마 ('light', 'dark', 'system') |
| `storageKey` | string | `'imcat-theme'` | localStorage 저장 키 |
| `transition` | boolean | `true` | 전환 애니메이션 활성화 |
| `transitionDuration` | number | `500` | 애니메이션 시간 (ms) |
| `autoInit` | boolean | `true` | 자동 초기화 |
| `customThemes` | object | `{}` | 커스텀 테마 맵 |
| `onChange` | function | `null` | 테마 변경 콜백 |

### 메서드

#### `init()`
초기화 (autoInit: false인 경우 수동 호출)

```javascript
const theme = new Theme({ autoInit: false });
theme.init();
```

#### `setTheme(theme, animate?)`
테마 설정

```javascript
theme.setTheme('dark');              // 애니메이션 있음
theme.setTheme('light', false);      // 애니메이션 없음
```

#### `getTheme()`
현재 선택된 테마 반환

```javascript
const current = theme.getTheme(); // 'system'
```

#### `getActualTheme()`
실제 적용된 테마 반환 (system 해석 후)

```javascript
theme.setTheme('system');
const actual = theme.getActualTheme(); // 'dark' or 'light'
```

#### `toggleTheme()`
라이트 ↔ 다크 토글

```javascript
theme.toggleTheme();
```

#### `getSystemTheme()`
시스템 테마 반환

```javascript
const system = theme.getSystemTheme(); // 'dark' or 'light'
```

#### `registerCustomTheme(name, colors)`
커스텀 테마 등록

```javascript
theme.registerCustomTheme('ocean', {
  primary: '#0077be',
  secondary: '#4fc3f7',
  background: '#e0f7fa',
  text: '#004d7a'
});
```

#### `applyCustomTheme(name)`
커스텀 테마 적용

```javascript
theme.applyCustomTheme('ocean');
```

#### `reset()`
기본 테마로 리셋

```javascript
theme.reset();
```

#### `destroy()`
정리 (메모리 누수 방지)

```javascript
theme.destroy();
```

---

## 🎯 고급 사용법

### 1. React/Vue 통합

```javascript
// React Hook
import { useState, useEffect } from 'react';
import Theme from './theme.js';

function useTheme() {
  const [theme, setTheme] = useState(null);
  
  useEffect(() => {
    const themeInstance = new Theme({
      onChange: (newTheme) => setTheme(newTheme)
    });
    
    setTheme(themeInstance.getTheme());
    
    return () => themeInstance.destroy();
  }, []);
  
  return theme;
}
```

### 2. 여러 커스텀 테마

```javascript
const themes = {
  ocean: {
    primary: '#0077be',
    secondary: '#4fc3f7',
    background: '#e0f7fa',
    text: '#004d7a'
  },
  forest: {
    primary: '#2e7d32',
    secondary: '#66bb6a',
    background: '#e8f5e9',
    text: '#1b5e20'
  },
  sunset: {
    primary: '#ff6f00',
    secondary: '#ff9100',
    background: '#fff3e0',
    text: '#e65100'
  }
};

// 모든 테마 등록
Object.entries(themes).forEach(([name, colors]) => {
  theme.registerCustomTheme(name, colors);
});

// 드롭다운에서 선택
document.getElementById('themeSelect').addEventListener('change', (e) => {
  const selectedTheme = e.target.value;
  
  if (['light', 'dark', 'system'].includes(selectedTheme)) {
    theme.setTheme(selectedTheme);
  } else {
    theme.applyCustomTheme(selectedTheme);
  }
});
```

### 3. 초기 로딩 플래시 방지

```html
<!-- HTML head에 추가 -->
<script>
  // DOM 로드 전에 실행
  (function() {
    const savedTheme = localStorage.getItem('imcat-theme') || 'system';
    
    if (savedTheme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    } else {
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  })();
</script>
```

---

## 🎨 CSS 커스터마이징

### SCSS 변수 오버라이드

```scss
// 커스텀 변수 정의
$primary-500: #00897b; // Teal
$secondary-500: #ff6f00; // Orange

// Theme 모듈 import
@use './modules/theme/theme.scss';
```

### CSS Custom Properties

```css
:root {
  --primary-color: #00897b;
  --secondary-color: #ff6f00;
}

[data-theme="dark"] {
  --primary-color: #4db6ac;
  --secondary-color: #ff9800;
}
```

---

## 🔍 문제 해결

### Q: 테마가 저장되지 않습니다
A: localStorage 권한을 확인하세요. Private 모드에서는 작동하지 않을 수 있습니다.

### Q: 페이지 로드 시 테마가 깜빡입니다
A: HTML head에 초기 로딩 스크립트를 추가하세요 (위 "초기 로딩 플래시 방지" 참고).

### Q: 시스템 테마 변경이 감지되지 않습니다
A: `prefers-color-scheme` 미디어 쿼리를 지원하는 브라우저인지 확인하세요.

### Q: 커스텀 테마가 적용되지 않습니다
A: CSS Custom Properties 이름이 정확한지 확인하세요 (`--primary-color` 등).

---

## 📚 관련 문서

- [디자인 시스템 구현 가이드](../../../docs/디자인_시스템_구현_가이드.md)
- [SCSS 테마 시스템](../../styles/abstracts/_themes.scss)
- [예제 코드](../../../examples/theme-system.html)

---

## 🤝 기여

버그 리포트, 기능 제안, PR 환영합니다!

---

## 📄 라이선스

MIT License - IMCAT UI
