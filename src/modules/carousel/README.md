# Carousel 모듈

이미지/콘텐츠 슬라이더와 라이트박스를 제공합니다.

## 설치

```javascript
const CarouselModule = await IMCAT.use('carousel');
```

## Carousel

### 기본 사용법

```html
<!-- HTML 마크업 -->
<div class="carousel" id="myCarousel">
  <div class="carousel__slide">
    <img src="slide1.jpg" alt="슬라이드 1">
  </div>
  <div class="carousel__slide">
    <img src="slide2.jpg" alt="슬라이드 2">
  </div>
</div>

<script>
const carousel = new CarouselModule.Carousel('#myCarousel', {
  autoplay: true,
  dots: true
});
</script>
```

### JavaScript로 생성

```javascript
const carousel = new CarouselModule.Carousel('#container', {
  items: [
    { src: 'image1.jpg', title: '제목 1', description: '설명 1' },
    { src: 'image2.jpg', title: '제목 2', description: '설명 2' },
    'image3.jpg' // URL만 제공 가능
  ],
  autoplay: true,
  autoplaySpeed: 3000
});
```

### 옵션

| 옵션 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `items` | array | `[]` | 슬라이드 아이템 배열 |
| `startIndex` | number | `0` | 시작 인덱스 |
| `arrows` | boolean | `true` | 화살표 표시 |
| `dots` | boolean | `true` | 도트 인디케이터 |
| `counter` | boolean | `false` | 현재/전체 카운터 |
| `thumbnails` | boolean | `false` | 썸네일 네비게이션 |
| `autoplay` | boolean | `false` | 자동 재생 |
| `autoplaySpeed` | number | `3000` | 자동 재생 간격(ms) |
| `pauseOnHover` | boolean | `true` | 호버 시 일시 정지 |
| `loop` | boolean | `true` | 무한 루프 |
| `slidesToShow` | number | `1` | 한 번에 보여줄 슬라이드 수 |
| `slidesToScroll` | number | `1` | 스크롤 슬라이드 수 |
| `speed` | number | `300` | 전환 속도(ms) |
| `draggable` | boolean | `true` | 드래그/스와이프 |

### 메서드

```javascript
carousel.next();              // 다음 슬라이드
carousel.prev();              // 이전 슬라이드
carousel.goTo(3);             // 특정 슬라이드로 이동
carousel.play();              // 자동 재생 시작
carousel.pause();             // 일시 정지
carousel.getCurrentIndex();   // 현재 인덱스
carousel.getSlideCount();     // 전체 슬라이드 수
carousel.destroy();           // 제거
```

### 콜백

```javascript
const carousel = new Carousel(element, {
  onSlideChange: (currentIndex, prevIndex) => {
    console.log(`슬라이드 변경: ${prevIndex} → ${currentIndex}`);
  },
  onInit: (carousel) => {
    console.log('캐러셀 초기화 완료');
  }
});
```

## Lightbox

이미지를 전체 화면으로 보여주는 갤러리입니다.

### 기본 사용법

```html
<!-- data-lightbox 속성만 추가 -->
<a href="large.jpg" data-lightbox>
  <img src="thumb.jpg" alt="썸네일">
</a>

<!-- 갤러리 그룹 -->
<a href="img1.jpg" data-lightbox="gallery1" data-caption="첫 번째 이미지">
  <img src="thumb1.jpg">
</a>
<a href="img2.jpg" data-lightbox="gallery1" data-caption="두 번째 이미지">
  <img src="thumb2.jpg">
</a>

<script>
// 싱글톤으로 자동 초기화
new CarouselModule.Lightbox();
</script>
```

### 옵션

| 옵션 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `selector` | string | `'a[data-lightbox]'` | 트리거 셀렉터 |
| `loop` | boolean | `true` | 무한 루프 |
| `showCounter` | boolean | `true` | 카운터 표시 |
| `showCaption` | boolean | `true` | 캡션 표시 |
| `closeOnBackdrop` | boolean | `true` | 배경 클릭으로 닫기 |
| `closeOnEscape` | boolean | `true` | ESC 키로 닫기 |

### 메서드

```javascript
const lightbox = new CarouselModule.Lightbox();

lightbox.open(0);    // 인덱스로 열기
lightbox.close();    // 닫기
lightbox.next();     // 다음
lightbox.prev();     // 이전
lightbox.destroy();  // 제거
```

## 스타일 커스터마이징

```css
/* 화살표 */
.carousel__arrow {
  background: rgba(0, 0, 0, 0.5);
  color: white;
}

/* 도트 */
.carousel__dot.is-active {
  background: var(--primary-color);
}

/* 캡션 */
.carousel__caption {
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
}
```

## 변형

```html
<!-- 전체 너비 -->
<div class="carousel carousel--fullwidth">...</div>

<!-- 카드 스타일 -->
<div class="carousel carousel--card">...</div>

<!-- 페이드 효과 -->
<div class="carousel carousel--fade">...</div>
```

## 반응형

```javascript
const carousel = new Carousel(element, {
  slidesToShow: 4,
  responsive: [
    {
      breakpoint: 1024,
      settings: { slidesToShow: 3 }
    },
    {
      breakpoint: 768,
      settings: { slidesToShow: 2 }
    },
    {
      breakpoint: 480,
      settings: { slidesToShow: 1 }
    }
  ]
});
```

## 접근성

- 키보드 네비게이션 (← → 키)
- ARIA 속성 자동 설정
- 포커스 관리
- 스크린 리더 지원
