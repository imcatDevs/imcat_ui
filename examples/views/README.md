# IMCAT UI 예제 Views

이 디렉토리에는 IMCAT UI 컴포넌트 예제 페이지가 포함됩니다.

## 📁 디렉토리 구조

```
views/
├── static/          # 정적 컴포넌트 (CSS only) - 12개
├── modules/         # 동적 모듈 (JS required) - 8개
├── layout/          # 레이아웃 시스템 - 4개
├── design/          # 디자인 토큰 - 8개
└── utilities/       # 유틸리티 클래스 - 5개
```

## 🎯 컴포넌트 분류

### Static Components (12개)
CSS만으로 구현된 정적 컴포넌트

1. **buttons.html** - 버튼 스타일
2. **cards.html** - 카드 레이아웃
3. **forms.html** - 폼 요소
4. **tables.html** - 데이터 테이블
5. **alerts.html** - 알림 메시지
6. **badges.html** - 배지/태그
7. **breadcrumb.html** - 경로 표시
8. **lists.html** - 목록
9. **navbar.html** - 네비게이션 바
10. **pagination.html** - 페이지네이션
11. **progress.html** - 진행률 바
12. **loader.html** - 로딩 스피너

### Dynamic Modules (8개)
JavaScript가 필요한 동적 모듈

1. **modal.html** - 모달 다이얼로그
2. **dropdown.html** - 드롭다운 메뉴
3. **tabs.html** - 탭 네비게이션
4. **accordion.html** - 아코디언
5. **tooltip.html** - 툴팁
6. **carousel.html** - 캐러셀/슬라이더
7. **notification.html** - 토스트 알림
8. **datepicker.html** - 날짜 선택기

### Layout (4개)
레이아웃 시스템

1. **grid.html** - 12컬럼 그리드
2. **flexbox.html** - Flexbox 유틸리티
3. **containers.html** - 반응형 컨테이너
4. **sections.html** - 섹션 레이아웃

### Design (8개)
디자인 토큰 및 시스템

1. **typography.html** - 타이포그래피
2. **colors.html** - 색상 팔레트
3. **icons.html** - Material Icons
4. **spacing.html** - 여백 시스템
5. **shadows.html** - 그림자 효과
6. **borders.html** - 테두리
7. **animations.html** - 전환 효과
8. **breakpoints.html** - 반응형 중단점

### Utilities (5개)
유틸리티 클래스

1. **display.html** - Display 속성
2. **position.html** - Position 속성
3. **sizing.html** - 크기 조정
4. **text.html** - 텍스트 유틸리티
5. **background.html** - 배경

## 📝 예제 파일 구조

각 예제 파일은 다음 구조를 따릅니다:

```html
<!-- 페이지 메타데이터 (선택) -->
<script type="application/json" id="pageMetadata">
{
  "info": { ... },
  "usage": { ... },
  "features": { ... }
}
</script>

<!-- 페이지 헤더 -->
<div class="demo-page-header">
  <h1>컴포넌트 이름</h1>
  <p>컴포넌트 설명</p>
</div>

<!-- 예제 섹션들 -->
<section class="demo-section">
  <h2>기본 사용법</h2>
  <!-- 예제 코드 -->
</section>
```

## 🚀 개발 가이드

### 새 예제 추가하기

1. 적절한 카테고리 폴더에 HTML 파일 생성
2. 페이지 메타데이터 추가 (선택)
3. 예제 코드 작성
4. `index.html` 메뉴에 링크 추가

### 코딩 규칙

- **BEM 네이밍**: `.block__element--modifier`
- **접두사 사용**: 예제 전용 클래스는 `.demo-*` 사용
- **Material Icons**: `material-icons-outlined` 스타일 사용
- **IMCAT UI API**: 코어 API 문서 참조하여 정확히 사용

## 📚 참고 문서

- [API 레퍼런스](../../docs/API_레퍼런스.md)
- [코딩 가이드](../../docs/코딩_가이드.md)
- [디자인 시스템 설계서](../../docs/디자인_시스템_설계서.md)
