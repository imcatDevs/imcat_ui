# IMCAT UI CSS 클래스 레퍼런스

> 실제 구현된 SCSS 클래스에 대한 종합 문서
>
> ⚠️ **네이밍 규칙**: 컴포넌트별로 BEM(`--`) 또는 Bootstrap(`-`) 스타일을 사용합니다.

## 📋 목차

1. [Base](#base)
2. [Layout](#layout)
3. [Components](#components)
4. [Utilities](#utilities)

---

## Base

### Reset & Typography

- **파일**: `_reset.scss`, `_typography.scss`

| 클래스 | 설명 |
|--------|------|
| `h1` ~ `h6` | 제목 스타일 |
| `.lead` | 강조 텍스트 |
| `.small` | 작은 텍스트 |
| `.text-muted` | 흐린 텍스트 |

---

## Layout

### Grid System

- **파일**: `_grid-system.scss`

| 클래스 | 설명 |
|--------|------|
| `.container` | 반응형 컨테이너 (max-width) |
| `.container-fluid` | 전체 너비 컨테이너 |
| `.row` | 플렉스 행 |
| `.col` | 자동 너비 컬럼 |
| `.col-{1-12}` | 고정 너비 컬럼 (12분할) |
| `.col-{sm,md,lg,xl}-{1-12}` | 반응형 컬럼 |
| `.g-{0-5}` | 거터 간격 |
| `.gx-{0-5}` | 가로 거터 |
| `.gy-{0-5}` | 세로 거터 |

### App Layout

- **파일**: `_layout.scss`

| 클래스 | 설명 |
|--------|------|
| `.app-header` | 상단 헤더 (sticky) |
| `.app-logo` | 로고 영역 |
| `.header-actions` | 헤더 우측 액션 영역 |
| `.app-main` | 메인 그리드 레이아웃 |
| `.sidebar-left` | 좌측 사이드바 |
| `.sidebar-right` | 우측 사이드바 |
| `.sidebar-title` | 사이드바 섹션 제목 |
| `.content-area` | 메인 콘텐츠 영역 |
| `.app-footer` | 푸터 영역 |
| `.footer-links` | 푸터 링크 컨테이너 |
| `.footer-link` | 푸터 링크 |

### Navigation

- **파일**: `_navigation.scss`

| 클래스 | 설명 |
|--------|------|
| `.nav-menu` | 네비게이션 메뉴 컨테이너 |
| `.nav-item` | 네비게이션 아이템 |
| `.nav-link` | 네비게이션 링크 |
| `.nav-link.active` | 활성 링크 |

---

## Components

### Alerts

- **파일**: `_alerts.scss`
- **네이밍**: Bootstrap 스타일 (`-`)

| 클래스 | 설명 |
|--------|------|
| `.alert` | 기본 알림 |
| `.alert-primary` | Primary 알림 |
| `.alert-secondary` | Secondary 알림 |
| `.alert-success` | 성공 알림 |
| `.alert-danger` | 위험/에러 알림 |
| `.alert-warning` | 경고 알림 |
| `.alert-info` | 정보 알림 |
| `.alert-light` | 밝은 알림 |
| `.alert-dark` | 어두운 알림 |
| `.alert-heading` | 알림 제목 |
| `.alert-link` | 알림 내 링크 |
| `.alert-icon` | 아이콘 포함 알림 |
| `.alert-icon-symbol` | 아이콘 영역 |
| `.alert-icon-content` | 콘텐츠 영역 |
| `.alert-dismissible` | 닫기 가능한 알림 |
| `.btn-close` | 닫기 버튼 |

### Avatars

- **파일**: `_avatars.scss`
- **네이밍**: Bootstrap 스타일 (`-`) + BEM 혼합

#### 기본 및 크기

| 클래스 | 설명 |
|--------|------|
| `.avatar` | 기본 아바타 (48px) |
| `.avatar-xs` | 초소형 (24px) |
| `.avatar-sm` | 소형 (32px) |
| `.avatar-md` | 중형 (48px) |
| `.avatar-lg` | 대형 (64px) |
| `.avatar-xl` | 초대형 (96px) |
| `.avatar__title` | 아바타 텍스트 (이니셜 표시용) |

#### 스타일

| 클래스 | 설명 |
|--------|------|
| `.rounded` | 둥근 모서리 |
| `.rounded-circle` | 원형 |
| `.img-thumbnail` | 썸네일 스타일 (테두리) |

#### 그룹 및 상태 배지

| 클래스 | 설명 |
|--------|------|
| `.avatar-group` | 아바타 그룹 (겹침 효과) |
| `.avatar--with-badge` | 상태 배지 포함 아바타 |
| `.avatar__badge` | 상태 배지 |
| `.avatar__badge--online` | 온라인 (초록) |
| `.avatar__badge--offline` | 오프라인 (회색) |
| `.avatar__badge--away` | 자리비움 (주황) |
| `.avatar__badge--busy` | 바쁨 (빨강) |

### Avatar Badge

- **파일**: `_avatar-badge.scss`
- **네이밍**: BEM 스타일 (`__`, `--`)

| 클래스 | 설명 |
|--------|------|
| `.avatar-badge` | 배지 포함 아바타 컨테이너 |
| `.avatar-badge__avatar` | 아바타 이미지 |
| `.avatar-badge__badge` | 숫자 배지 |
| `.avatar-badge__status` | 상태 표시기 |
| `.avatar-badge__badge--top-right` | 배지 우상단 |
| `.avatar-badge__badge--top-left` | 배지 좌상단 |
| `.avatar-badge__badge--bottom-right` | 배지 우하단 |
| `.avatar-badge__badge--bottom-left` | 배지 좌하단 |
| `.avatar-badge__status--online` | 온라인 |
| `.avatar-badge__status--offline` | 오프라인 |
| `.avatar-badge__status--busy` | 바쁨 |
| `.avatar-badge__status--away` | 자리비움 |
| `.avatar-badge__status--idle` | 대기 |
| `.avatar-badge__status--pulse` | 펄스 애니메이션 |
| `.avatar-badge--sm` | 소형 (2rem) |
| `.avatar-badge--lg` | 대형 (4rem) |
| `.avatar-badge--xl` | 초대형 (5rem) |
| `.avatar-badge--rounded` | 둥근 모서리 |
| `.avatar-badge--square` | 사각형 |
| `.avatar-badge-group` | 아바타 그룹 |

### Badges

- **파일**: `_badges.scss`
- **네이밍**: BEM 스타일 (`--`)

| 클래스 | 설명 |
|--------|------|
| `.badge` | 기본 배지 |
| `.badge--primary` | Primary 배지 |
| `.badge--secondary` | Secondary 배지 |
| `.badge--success` | 성공 배지 |
| `.badge--danger` | 위험 배지 |
| `.badge--warning` | 경고 배지 |
| `.badge--info` | 정보 배지 |
| `.badge--light` | 밝은 배지 |
| `.badge--dark` | 어두운 배지 |
| `.badge--pill` | 알약 형태 (rounded) |
| `.badge--outline` | 아웃라인 스타일 |
| `.badge--soft` | 소프트 스타일 |
| `.badge--sm` | 소형 |
| `.badge--lg` | 대형 |
| `.badge--icon` | 아이콘 포함 |
| `.badge--dot` | 점 형태 (indicator) |
| `.badge--positioned` | 절대 위치 (top-right) |
| `.badge-container` | 배지 컨테이너 (relative) |

### Blockquotes

- **파일**: `_blockquotes.scss`

| 클래스 | 설명 |
|--------|------|
| `.blockquote` | 기본 인용문 |
| `.blockquote--bordered` | 테두리 인용문 |
| `.blockquote--icon` | 아이콘 인용문 |
| `.blockquote__footer` | 인용문 출처 |
| `.blockquote--center` | 중앙 정렬 |
| `.blockquote--right` | 오른쪽 정렬 |

### Breadcrumb

- **파일**: `_breadcrumb.scss`
- **네이밍**: Bootstrap 스타일 (`-`)

| 클래스 | 설명 |
|--------|------|
| `.breadcrumb` | 기본 경로 표시 |
| `.breadcrumb-item` | 경로 아이템 |
| `.breadcrumb-item a` | 경로 링크 |
| `.breadcrumb-item.active` | 현재 페이지 |
| `.page-title-box` | 페이지 제목 박스 (breadcrumb 포함) |
| `.page-title` | 페이지 제목 |

### Buttons

- **파일**: `_buttons.scss`
- **네이밍**: BEM 기본 (`--`), Bootstrap alias (`-`) 모두 지원

#### BEM 스타일 (기본)

| 클래스 | 설명 |
|--------|------|
| `.btn` | 기본 버튼 |
| `.btn--primary` | Primary 버튼 |
| `.btn--secondary` | Secondary 버튼 |
| `.btn--success` | 성공 버튼 |
| `.btn--danger` | 위험 버튼 |
| `.btn--warning` | 경고 버튼 |
| `.btn--info` | 정보 버튼 |
| `.btn--light` | 밝은 버튼 |
| `.btn--dark` | 어두운 버튼 |
| `.btn--outline-primary` | Primary 아웃라인 |
| `.btn--outline-*` | 아웃라인 버튼 |
| `.btn--ghost` | 투명 버튼 |
| `.btn--sm` | 소형 버튼 |
| `.btn--lg` | 대형 버튼 |
| `.btn--block` | 전체 너비 버튼 |
| `.btn--icon` | 아이콘 전용 버튼 |
| `.btn--link` | 링크 스타일 버튼 |
| `.btn--loading` | 로딩 상태 |
| `.btn--disabled` | 비활성화 |

#### Bootstrap Alias (호환성)

| 클래스 | 매핑 |
|--------|------|
| `.btn-primary` | `.btn--primary` |
| `.btn-secondary` | `.btn--secondary` |
| `.btn-success` | `.btn--success` |
| `.btn-danger` | `.btn--danger` |
| `.btn-warning` | `.btn--warning` |
| `.btn-info` | `.btn--info` |
| `.btn-light` | `.btn--light` |
| `.btn-dark` | `.btn--dark` |
| `.btn-outline-*` | `.btn--outline-*` |
| `.btn-soft-*` | 소프트 버튼 (배경 투명) |
| `.btn-sm` | `.btn--sm` |
| `.btn-lg` | `.btn--lg` |
| `.btn-block` | `.btn--block` |
| `.btn-icon` | `.btn--icon` |
| `.btn-loading` | `.btn--loading` |

### Button Group

- **파일**: `_button-group.scss`

| 클래스 | 설명 |
|--------|------|
| `.btn-group` | 버튼 그룹 |
| `.btn-group-vertical` | 세로 버튼 그룹 |
| `.btn-group--sm` | 소형 그룹 |
| `.btn-group--lg` | 대형 그룹 |

### Callouts

- **파일**: `_callouts.scss`

| 클래스 | 설명 |
|--------|------|
| `.callout` | 기본 콜아웃 |
| `.callout--primary` | Primary 콜아웃 |
| `.callout--success` | 성공 콜아웃 |
| `.callout--danger` | 위험 콜아웃 |
| `.callout--warning` | 경고 콜아웃 |
| `.callout--info` | 정보 콜아웃 |
| `.callout__title` | 콜아웃 제목 |

### Cards

- **파일**: `_cards.scss`
- **네이밍**: BEM 스타일 (`__`, `--`)

| 클래스 | 설명 |
|--------|------|
| `.card` | 기본 카드 |
| `.card__header` | 카드 헤더 |
| `.card__body` | 카드 본문 |
| `.card__footer` | 카드 푸터 |
| `.card__title` | 카드 제목 |
| `.card__subtitle` | 카드 부제목 |
| `.card__text` | 카드 텍스트 |
| `.card__link` | 카드 링크 |
| `.card__img` | 카드 이미지 |
| `.card__img-top` | 상단 이미지 |
| `.card__img-bottom` | 하단 이미지 |
| `.card__img-overlay` | 이미지 오버레이 |
| `.card__list-group` | 카드 내 목록 그룹 |
| `.card__list-item` | 카드 내 목록 아이템 |
| `.card--primary` | Primary 카드 |
| `.card--secondary` | Secondary 카드 |
| `.card--success` | 성공 카드 |
| `.card--danger` | 위험 카드 |
| `.card--warning` | 경고 카드 |
| `.card--info` | 정보 카드 |
| `.card--outline` | 아웃라인 카드 |
| `.card--horizontal` | 가로 카드 |
| `.card-group` | 카드 그룹 (flex) |
| `.card-deck` | 카드 덱 (반응형) |
| `.card-columns` | 카드 컬럼 (masonry) |

### Chips

- **파일**: `_chips.scss`
- **네이밍**: BEM 스타일 (`--`)

| 클래스 | 설명 |
|--------|------|
| `.chip` | 기본 칩 |
| `.chip--avatar` | 아바타 포함 칩 |
| `.chip__avatar` | 칩 내 아바타 이미지 |
| `.chip__icon` | 칩 내 아이콘 |
| `.chip--closeable` | 닫기 버튼 포함 칩 |
| `.chip__close` | 닫기 버튼 |
| `.chip--sm` | 소형 (22px) |
| `.chip--lg` | 대형 (36px) |
| `.chip--primary` | Primary 칩 |
| `.chip--secondary` | Secondary 칩 |
| `.chip--success` | 성공 칩 |
| `.chip--danger` | 위험 칩 |
| `.chip--warning` | 경고 칩 |
| `.chip--info` | 정보 칩 |
| `.chip--outlined` | 아웃라인 칩 |

### Code Blocks

- **파일**: `_code-blocks.scss`

| 클래스 | 설명 |
|--------|------|
| `code` | 인라인 코드 |
| `pre` | 코드 블록 |
| `.code-block` | 스타일 코드 블록 |
| `.code-block--numbered` | 줄 번호 표시 |
| `.code-block__header` | 코드 블록 헤더 |
| `.code-block__copy` | 복사 버튼 |

### Counters

- **파일**: `_counters.scss`

| 클래스 | 설명 |
|--------|------|
| `.counter` | 숫자 카운터 |
| `.counter__value` | 카운터 값 |
| `.counter__label` | 카운터 라벨 |
| `.counter--primary` | Primary 카운터 |
| `.counter--success` | 성공 카운터 |

### Dividers

- **파일**: `_dividers.scss`
- **네이밍**: 클래스 분리형 + BEM 혼합

| 클래스 | 설명 |
|--------|------|
| `.divider` | 기본 구분선 |
| `.divider--sm` | 작은 마진 |
| `.divider--lg` | 큰 마진 |
| `.divider--xl` | 매우 큰 마진 |
| `.divider--dashed` | 점선 |
| `.divider--dotted` | 점 |
| `.divider--thick` | 두꺼운 (2px) |
| `.divider--primary` | Primary 색상 |
| `.divider--success` | 성공 색상 |
| `.divider--danger` | 위험 색상 |
| `.divider--warning` | 경고 색상 |
| `.divider-text` | 텍스트 포함 구분선 |
| `.divider-icon` | 아이콘 포함 구분선 |
| `.divider-vertical` | 세로 구분선 |
| `.divider-vertical--sm` | 소형 세로 (16px) |
| `.divider-vertical--lg` | 대형 세로 (32px) |

### Embeds

- **파일**: `_embeds.scss`

| 클래스 | 설명 |
|--------|------|
| `.embed-responsive` | 반응형 임베드 |
| `.embed-responsive--16by9` | 16:9 비율 |
| `.embed-responsive--4by3` | 4:3 비율 |
| `.embed-responsive--21by9` | 21:9 비율 |
| `.embed-responsive--1by1` | 1:1 비율 |

### Empty States

- **파일**: `_empty-states.scss`

| 클래스 | 설명 |
|--------|------|
| `.empty-state` | 빈 상태 컴포넌트 |
| `.empty-state__icon` | 빈 상태 아이콘 |
| `.empty-state__title` | 빈 상태 제목 |
| `.empty-state__description` | 빈 상태 설명 |
| `.empty-state__action` | 빈 상태 액션 버튼 |

### FAB (Floating Action Button)

- **파일**: `_fab.scss`

| 클래스 | 설명 |
|--------|------|
| `.fab` | 플로팅 액션 버튼 |
| `.fab--primary` | Primary FAB |
| `.fab--secondary` | Secondary FAB |
| `.fab--sm` | 소형 FAB |
| `.fab--lg` | 대형 FAB |
| `.fab--extended` | 확장형 FAB |
| `.fab-container` | FAB 컨테이너 |
| `.fab--bottom-right` | 우하단 위치 |
| `.fab--bottom-left` | 좌하단 위치 |

### Figures

- **파일**: `_figures.scss`

| 클래스 | 설명 |
|--------|------|
| `.figure` | 기본 피규어 |
| `.figure__img` | 피규어 이미지 |
| `.figure__caption` | 피규어 캡션 |

### File Upload

- **파일**: `_file-upload.scss`

| 클래스 | 설명 |
|--------|------|
| `.file-upload` | 파일 업로드 영역 |
| `.file-upload__input` | 파일 입력 |
| `.file-upload__label` | 업로드 라벨 |
| `.file-upload__icon` | 업로드 아이콘 |
| `.file-upload__text` | 업로드 텍스트 |
| `.file-upload--dragover` | 드래그 오버 상태 |
| `.file-upload__preview` | 파일 미리보기 |

### Forms

- **파일**: `_forms.scss`

| 클래스 | 설명 |
|--------|------|
| `.form-control` | 기본 폼 컨트롤 |
| `.form-control-sm` | 소형 컨트롤 |
| `.form-control-lg` | 대형 컨트롤 |
| `.form-label` | 폼 라벨 |
| `.form-text` | 도움말 텍스트 |
| `.form-select` | 셀렉트 박스 |
| `.form-check` | 체크박스/라디오 래퍼 |
| `.form-check-input` | 체크박스/라디오 입력 |
| `.form-check-label` | 체크박스/라디오 라벨 |
| `.form-switch` | 스위치 토글 |
| `.form-floating` | 플로팅 라벨 |
| `.input-group` | 입력 그룹 |
| `.input-group-text` | 입력 그룹 텍스트 |
| `.form-range` | 범위 슬라이더 |
| `.is-valid` | 유효 상태 |
| `.is-invalid` | 무효 상태 |
| `.valid-feedback` | 유효 피드백 |
| `.invalid-feedback` | 무효 피드백 |

### Form Validation

- **파일**: `_form-validation.scss`

| 클래스 | 설명 |
|--------|------|
| `.was-validated` | 검증 완료 폼 |
| `.needs-validation` | 검증 필요 폼 |

### Gauge

- **파일**: `_gauge.scss`

| 클래스 | 설명 |
|--------|------|
| `.gauge` | 게이지 차트 |
| `.gauge__value` | 게이지 값 |
| `.gauge__label` | 게이지 라벨 |
| `.gauge--primary` | Primary 게이지 |
| `.gauge--success` | 성공 게이지 |
| `.gauge--danger` | 위험 게이지 |

### Images

- **파일**: `_images.scss`

| 클래스 | 설명 |
|--------|------|
| `.img-fluid` | 반응형 이미지 |
| `.img-thumbnail` | 썸네일 이미지 |
| `.img-rounded` | 둥근 모서리 이미지 |
| `.img-circle` | 원형 이미지 |

### KBD

- **파일**: `_kbd.scss`

| 클래스 | 설명 |
|--------|------|
| `kbd` | 키보드 입력 |
| `.kbd` | 키보드 스타일 |
| `.kbd--light` | 밝은 키보드 |
| `.kbd--dark` | 어두운 키보드 |

### Links

- **파일**: `_link.scss`

| 클래스 | 설명 |
|--------|------|
| `.link` | 기본 링크 |
| `.link--primary` | Primary 링크 |
| `.link--muted` | 흐린 링크 |
| `.link--underline` | 밑줄 링크 |
| `.link--no-underline` | 밑줄 없는 링크 |

### Lists

- **파일**: `_lists.scss`
- **네이밍**: Bootstrap 스타일 (`-`)

| 클래스 | 설명 |
|--------|------|
| `.list-group` | 목록 그룹 |
| `.list-group-item` | 목록 아이템 |
| `.list-group-item.active` | 활성 아이템 |
| `.list-group-item.disabled` | 비활성 아이템 |
| `.list-group-flush` | 테두리 없는 그룹 |
| `.list-group-horizontal` | 가로 그룹 |
| `.list-group-numbered` | 번호 목록 |
| `.list-group-item-action` | 액션 아이템 |
| `.list-group-item-primary` | Primary 색상 아이템 |
| `.list-group-item-secondary` | Secondary 색상 아이템 |
| `.list-group-item-success` | 성공 색상 아이템 |
| `.list-group-item-danger` | 위험 색상 아이템 |
| `.list-group-item-warning` | 경고 색상 아이템 |
| `.list-group-item-info` | 정보 색상 아이템 |
| `.list-group-item-icon` | 아이콘 포함 아이템 |
| `.list-group-item-badge` | 배지 포함 아이템 |

### Loading

- **파일**: `_loading.scss`

| 클래스 | 설명 |
|--------|------|
| `.loading` | 로딩 오버레이 |
| `.loading__spinner` | 로딩 스피너 |
| `.loading__text` | 로딩 텍스트 |

### Mark

- **파일**: `_mark.scss`

| 클래스 | 설명 |
|--------|------|
| `mark` | 하이라이트 |
| `.mark` | 하이라이트 클래스 |
| `.mark--primary` | Primary 하이라이트 |
| `.mark--success` | 성공 하이라이트 |
| `.mark--warning` | 경고 하이라이트 |

### Media

- **파일**: `_media.scss`

| 클래스 | 설명 |
|--------|------|
| `.media` | 미디어 객체 |
| `.media__img` | 미디어 이미지 |
| `.media__body` | 미디어 본문 |

### Menu

- **파일**: `_menu.scss`

| 클래스 | 설명 |
|--------|------|
| `.menu` | 메뉴 컨테이너 |
| `.menu__item` | 메뉴 아이템 |
| `.menu__link` | 메뉴 링크 |
| `.menu__divider` | 메뉴 구분선 |
| `.menu--vertical` | 세로 메뉴 |
| `.menu--horizontal` | 가로 메뉴 |

### Navbar

- **파일**: `_navbar.scss`
- **네이밍**: BEM 스타일 (`__`, `--`)

| 클래스 | 설명 |
|--------|------|
| `.navbar` | 네비게이션 바 |
| `.navbar__brand` | 브랜드/로고 |
| `.navbar__nav` | 네비게이션 메뉴 |
| `.navbar__item` | 네비게이션 아이템 |
| `.navbar__link` | 네비게이션 링크 |
| `.navbar__link--active` | 활성 링크 |
| `.navbar__actions` | 액션 영역 |
| `.navbar__toggle` | 모바일 토글 버튼 |
| `.navbar__nav--open` | 모바일 메뉴 열림 |
| `.navbar--fixed-top` | 상단 고정 |
| `.navbar--fixed-bottom` | 하단 고정 |
| `.navbar--sticky` | 스티키 |
| `.navbar--sm` | 소형 |
| `.navbar--lg` | 대형 |
| `.navbar--dark` | 어두운 네비게이션 |
| `.navbar--light` | 밝은 네비게이션 |
| `.navbar--primary` | Primary 배경 |

### Page Title

- **파일**: `_page-title.scss`

| 클래스 | 설명 |
|--------|------|
| `.page-title-box` | 페이지 제목 박스 |
| `.page-title` | 페이지 제목 |
| `.page-description` | 페이지 설명 |

### Pagination

- **파일**: `_pagination.scss`
- **네이밍**: Bootstrap 스타일 (`-`)

| 클래스 | 설명 |
|--------|------|
| `.pagination` | 페이지네이션 |
| `.page-item` | 페이지 아이템 |
| `.page-link` | 페이지 링크 |
| `.page-item.active` | 활성 페이지 |
| `.page-item.disabled` | 비활성 페이지 |
| `.pagination-sm` | 소형 페이지네이션 |
| `.pagination-lg` | 대형 페이지네이션 |
| `.pagination-rounded` | 원형 페이지네이션 |
| `.pagination-center` | 중앙 정렬 |
| `.pagination-end` | 우측 정렬 |
| `.pagination-simple` | Prev/Next만 표시 |
| `.page-info` | 페이지 정보 표시 |

### Tables

- **파일**: `_tables.scss`
- **네이밍**: Bootstrap 스타일 (`-`)

| 클래스 | 설명 |
|--------|------|
| `.table` | 기본 테이블 |
| `.table-striped` | 줄무니 테이블 |
| `.table-bordered` | 테두리 테이블 |
| `.table-borderless` | 테두리 없는 테이블 |
| `.table-hover` | 호버 테이블 |
| `.table-sm` | 작은 테이블 |
| `.table-compact` | 컯팩트 테이블 |
| `.table-responsive` | 반응형 래퍼 |
| `.table-primary` | Primary 배경색 행 |
| `.table-success` | 성공 배경색 행 |
| `.table-danger` | 위험 배경색 행 |
| `.table-warning` | 경고 배경색 행 |
| `.table-info` | 정보 배경색 행 |
| `.table-light` | 밝은 배경색 행 |
| `.table-dark` | 어두운 배경색 행 |
| `.table-actions` | 액션 버튼 컨테이너 |

### Progress

- **파일**: `_progress.scss`
- **네이밍**: Bootstrap 스타일 (`-`)

| 클래스 | 설명 |
|--------|------|
| `.progress` | 진행률 바 컨테이너 |
| `.progress-bar` | 진행률 바 |
| `.progress-sm` | 소형 (0.5rem) |
| `.progress-md` | 중형 (1rem) |
| `.progress-lg` | 대형 (1.5rem) |
| `.progress-xl` | 초대형 (2rem) |
| `.progress-bar-striped` | 줄무니 진행률 |
| `.progress-bar-animated` | 애니메이션 진행률 |
| `.progress-bar-primary` | Primary 진행률 |
| `.progress-bar-secondary` | Secondary 진행률 |
| `.progress-bar-success` | 성공 진행률 |
| `.progress-bar-danger` | 위험 진행률 |
| `.progress-bar-warning` | 경고 진행률 |
| `.progress-bar-info` | 정보 진행률 |
| `.progress-bar-dark` | 어두운 진행률 |
| `.progress-vertical` | 세로 진행률 바 |
| `.progress-circle` | 원형 진행률 (CSS only) |
| `.progress-circle-sm` | 소형 원형 (60px) |
| `.progress-circle-lg` | 대형 원형 (120px) |
| `.progress-circle-text` | 원형 내부 텍스트 |
| `.progress-label-left` | 레이블 좌측 정렬 |
| `.progress-multiple` | 다중 진행률 바 |

### Rating

- **파일**: `_rating.scss`
- **네이밍**: BEM 스타일 (`__`, `--`)

| 클래스 | 설명 |
|--------|------|
| `.rating` | 별점 컨테이너 |
| `.rating__star` | 별 아이템 |
| `.rating__star--filled` | 채워진 별 |
| `.rating__star--empty` | 빈 별 |
| `.rating__star--half` | 반 별 |
| `.rating--primary` | Primary 색상 |
| `.rating--success` | 성공 색상 |
| `.rating--danger` | 위험 색상 |
| `.rating--sm` | 소형 |
| `.rating--lg` | 대형 |
| `.rating--readonly` | 읽기 전용 |

### Ribbons

- **파일**: `_ribbons.scss`
- **네이밍**: BEM 스타일 (`--`)

| 클래스 | 설명 |
|--------|------|
| `.ribbon` | 기본 리본 |
| `.ribbon--top-left` | 좌상단 위치 |
| `.ribbon--top-right` | 우상단 위치 |
| `.ribbon--corner-top-left` | 좌상단 코너 (대각선) |
| `.ribbon--corner-top-right` | 우상단 코너 (대각선) |
| `.ribbon--primary` | Primary 색상 |
| `.ribbon--secondary` | Secondary 색상 |
| `.ribbon--success` | 성공 색상 |
| `.ribbon--danger` | 위험 색상 |
| `.ribbon--warning` | 경고 색상 |
| `.ribbon--info` | 정보 색상 |

### Skeleton

- **파일**: `_skeleton.scss`
- **네이밍**: 클래스 분리형

| 클래스 | 설명 |
|--------|------|
| `.skeleton` | 기본 스켈레톤 (애니메이션) |
| `.skeleton-text` | 텍스트 스켈레톤 (14px) |
| `.skeleton-title` | 제목 스켈레톤 (24px) |
| `.skeleton-circle` | 원형 스켈레톤 (48px) |
| `.skeleton-rectangle` | 직사각형 스켈레톤 |
| `.skeleton-square` | 정사각형 스켈레톤 (120px) |
| `.skeleton--sm` | 소형 |
| `.skeleton--lg` | 대형 |

### Steps

- **파일**: `_steps.scss`
- **네이밍**: BEM 스타일 (`__`, `--`)

| 클래스 | 설명 |
|--------|------|
| `.steps` | 스텝 컨테이너 |
| `.steps__item` | 스텝 아이템 |
| `.steps__step` | 스텝 내용 |
| `.steps__number` | 스텝 번호 |
| `.steps__label` | 스텝 라벨 |
| `.steps__line` | 스텝 연결선 |
| `.steps__item--active` | 현재 스텝 |
| `.steps__item--completed` | 완료된 스텝 |
| `.steps--vertical` | 세로 스텝 |
| `.steps--sm` | 소형 스텝 |

### FAB (Floating Action Button)

- **파일**: `_fab.scss`
- **네이밍**: BEM 스타일 (`--`)

| 클래스 | 설명 |
|--------|------|
| `.fab` | 기본 FAB |
| `.fab--bottom-right` | 우하단 위치 |
| `.fab--bottom-left` | 좌하단 위치 |
| `.fab--top-right` | 우상단 위치 |
| `.fab--top-left` | 좌상단 위치 |
| `.fab--sm` | 소형 (2.5rem) |
| `.fab--lg` | 대형 (4.5rem) |
| `.fab--primary` | Primary 색상 |
| `.fab--secondary` | Secondary 색상 |
| `.fab--success` | 성공 색상 |
| `.fab--danger` | 위험 색상 |
| `.fab--extended` | 확장형 (텍스트 포함) |

### Tags

- **파일**: `_tags.scss`
- **네이밍**: BEM 스타일 (`--`)

| 클래스 | 설명 |
|--------|------|
| `.tag` | 기본 태그 |
| `.tag--primary` | Primary 태그 |
| `.tag--secondary` | Secondary 태그 |
| `.tag--success` | 성공 태그 |
| `.tag--danger` | 위험 태그 |
| `.tag--warning` | 경고 태그 |
| `.tag--info` | 정보 태그 |
| `.tag--outlined` | 아웃라인 태그 |
| `.tag--sm` | 소형 태그 |
| `.tag--lg` | 대형 태그 |
| `.tag--rounded` | 둥근 태그 |
| `.tag__close` | 태그 닫기 버튼 |
| `.tag-group` | 태그 그룹 |

### Status Dots

- **파일**: `_status-dots.scss`
- **네이밍**: BEM 스타일 (`__`, `--`)

| 클래스 | 설명 |
|--------|------|
| `.status-dot` | 상태 점 컨테이너 |
| `.status-dot__indicator` | 상태 점 |
| `.status-dot--online` | 온라인 (초록) |
| `.status-dot--offline` | 오프라인 (회색) |
| `.status-dot--busy` | 바쁨 (빨강) |
| `.status-dot--away` | 자리비움 (주황) |
| `.status-dot--idle` | 대기 (파랑) |
| `.status-dot--pulse` | 펄스 애니메이션 |

### Stats Cards

- **파일**: `_stats-cards.scss`
- **네이밍**: BEM 스타일 (`__`, `--`)

| 클래스 | 설명 |
|--------|------|
| `.stats-card` | 통계 카드 컨테이너 |
| `.stats-card__header` | 카드 헤더 |
| `.stats-card__icon` | 아이콘 영역 |
| `.stats-card__trend` | 트렌드 표시 |
| `.stats-card__trend--up` | 상승 트렌드 (초록) |
| `.stats-card__trend--down` | 하락 트렌드 (빨강) |
| `.stats-card__value` | 통계 값 |
| `.stats-card__label` | 라벨 |
| `.stats-card__footer` | 푸터 |
| `.stats-card--primary` | Primary 아이콘 배경 |
| `.stats-card--success` | Success 아이콘 배경 |
| `.stats-card--danger` | Danger 아이콘 배경 |

### Spinners

- **파일**: `_spinners.scss`
- **네이밍**: Bootstrap 스타일 (`-`)

| 클래스 | 설명 |
|--------|------|
| `.spinner-border` | 둘레 스피너 |
| `.spinner-grow` | 크기 증가 스피너 |
| `.spinner-border-sm` | 소형 둘레 스피너 |
| `.spinner-grow-sm` | 소형 크기 증가 스피너 |
| `.spinner-border-lg` | 대형 둘레 스피너 |
| `.spinner-grow-lg` | 대형 크기 증가 스피너 |
| `.spinner-primary` | Primary 색상 |
| `.spinner-secondary` | Secondary 색상 |
| `.spinner-success` | 성공 색상 |
| `.spinner-danger` | 위험 색상 |
| `.spinner-warning` | 경고 색상 |
| `.spinner-info` | 정보 색상 |
| `.spinner-light` | 밝은 색상 |
| `.spinner-dark` | 어두운 색상 |
| `.spinner-dots` | 점 스피너 |
| `.spinner-pulse` | 펄스 스피너 |
| `.spinner-bars` | 바 스피너 |
| `.spinner-overlay` | 오버레이 스피너 |

### Text Utilities

- **파일**: `_text-utilities.scss`

| 클래스 | 설명 |
|--------|------|
| `.text-truncate` | 텍스트 말줄임 |
| `.text-wrap` | 텍스트 줄바꾼 |
| `.text-nowrap` | 줄바꾼 금지 |
| `.text-break` | 단어 분리 |

### Timeline

- **파일**: `_timeline.scss`

| 클래스 | 설명 |
|--------|------|
| `.timeline` | 타임라인 |
| `.timeline__item` | 타임라인 아이템 |
| `.timeline__marker` | 타임라인 마커 |
| `.timeline__content` | 타임라인 콘텐츠 |
| `.timeline__time` | 타임라인 시간 |
| `.timeline--left` | 왼쪽 정렬 |
| `.timeline--right` | 오른쪽 정렬 |
| `.timeline--center` | 중앙 정렬 |

### Videos

- **파일**: `_videos.scss`

| 클래스 | 설명 |
|--------|------|
| `.video` | 비디오 컨테이너 |
| `.video--responsive` | 반응형 비디오 |
| `.video__overlay` | 비디오 오버레이 |
| `.video__play-btn` | 재생 버튼 |

### Wells

- **파일**: `_wells.scss`

| 클래스 | 설명 |
|--------|------|
| `.well` | 웰 컴포넌트 |
| `.well--sm` | 소형 웰 |
| `.well--lg` | 대형 웰 |
| `.well--primary` | Primary 웰 |
| `.well--light` | 밝은 웰 |
| `.well--dark` | 어두운 웰 |

---

## Utilities

### Display

| 클래스 | 설명 |
|--------|------|
| `.d-none` | display: none |
| `.d-inline` | display: inline |
| `.d-inline-block` | display: inline-block |
| `.d-block` | display: block |
| `.d-flex` | display: flex |
| `.d-inline-flex` | display: inline-flex |
| `.d-grid` | display: grid |
| `.d-{sm,md,lg,xl}-*` | 반응형 display |

### Flexbox

| 클래스 | 설명 |
|--------|------|
| `.flex-row` | flex-direction: row |
| `.flex-column` | flex-direction: column |
| `.flex-wrap` | flex-wrap: wrap |
| `.flex-nowrap` | flex-wrap: nowrap |
| `.justify-content-start` | justify-content: flex-start |
| `.justify-content-center` | justify-content: center |
| `.justify-content-end` | justify-content: flex-end |
| `.justify-content-between` | justify-content: space-between |
| `.justify-content-around` | justify-content: space-around |
| `.align-items-start` | align-items: flex-start |
| `.align-items-center` | align-items: center |
| `.align-items-end` | align-items: flex-end |
| `.align-self-*` | align-self 유틸리티 |
| `.flex-grow-0` | flex-grow: 0 |
| `.flex-grow-1` | flex-grow: 1 |
| `.flex-shrink-0` | flex-shrink: 0 |
| `.flex-shrink-1` | flex-shrink: 1 |
| `.order-{0-5}` | 순서 지정 |

### Spacing

| 클래스 | 설명 |
|--------|------|
| `.m-{0-5}` | margin 전체 |
| `.mt-{0-5}` | margin-top |
| `.mb-{0-5}` | margin-bottom |
| `.ms-{0-5}` | margin-start (left) |
| `.me-{0-5}` | margin-end (right) |
| `.mx-{0-5}` | margin 가로 |
| `.my-{0-5}` | margin 세로 |
| `.p-{0-5}` | padding 전체 |
| `.pt-{0-5}` | padding-top |
| `.pb-{0-5}` | padding-bottom |
| `.ps-{0-5}` | padding-start (left) |
| `.pe-{0-5}` | padding-end (right) |
| `.px-{0-5}` | padding 가로 |
| `.py-{0-5}` | padding 세로 |
| `.m-auto` | margin: auto |
| `.mx-auto` | 가로 중앙 정렬 |
| `.gap-{0-5}` | gap (flex/grid) |

### Text

| 클래스 | 설명 |
|--------|------|
| `.text-start` | text-align: left |
| `.text-center` | text-align: center |
| `.text-end` | text-align: right |
| `.text-lowercase` | 소문자 변환 |
| `.text-uppercase` | 대문자 변환 |
| `.text-capitalize` | 첫글자 대문자 |
| `.fw-light` | font-weight: 300 |
| `.fw-normal` | font-weight: 400 |
| `.fw-medium` | font-weight: 500 |
| `.fw-semibold` | font-weight: 600 |
| `.fw-bold` | font-weight: 700 |
| `.fst-italic` | font-style: italic |
| `.fst-normal` | font-style: normal |
| `.text-decoration-none` | 밑줄 제거 |
| `.text-decoration-underline` | 밑줄 추가 |

### Colors

| 클래스 | 설명 |
|--------|------|
| `.text-primary` | Primary 텍스트 색상 |
| `.text-secondary` | Secondary 텍스트 색상 |
| `.text-success` | 성공 텍스트 색상 |
| `.text-danger` | 위험 텍스트 색상 |
| `.text-warning` | 경고 텍스트 색상 |
| `.text-info` | 정보 텍스트 색상 |
| `.text-light` | 밝은 텍스트 |
| `.text-dark` | 어두운 텍스트 |
| `.text-muted` | 흐린 텍스트 |
| `.text-white` | 흰색 텍스트 |
| `.text-black` | 검은색 텍스트 |
| `.bg-primary` | Primary 배경색 |
| `.bg-secondary` | Secondary 배경색 |
| `.bg-success` | 성공 배경색 |
| `.bg-danger` | 위험 배경색 |
| `.bg-warning` | 경고 배경색 |
| `.bg-info` | 정보 배경색 |
| `.bg-light` | 밝은 배경색 |
| `.bg-dark` | 어두운 배경색 |
| `.bg-white` | 흰색 배경 |
| `.bg-transparent` | 투명 배경 |

### Borders

| 클래스 | 설명 |
|--------|------|
| `.border` | 테두리 추가 |
| `.border-0` | 테두리 제거 |
| `.border-top` | 상단 테두리 |
| `.border-end` | 우측 테두리 |
| `.border-bottom` | 하단 테두리 |
| `.border-start` | 좌측 테두리 |
| `.border-primary` | Primary 테두리 색상 |
| `.border-secondary` | Secondary 테두리 색상 |
| `.rounded` | 둥근 모서리 |
| `.rounded-0` | 모서리 제거 |
| `.rounded-1` | 작은 둥근 모서리 |
| `.rounded-2` | 중간 둥근 모서리 |
| `.rounded-3` | 큰 둥근 모서리 |
| `.rounded-circle` | 원형 |
| `.rounded-pill` | 알약형 |

### Position

| 클래스 | 설명 |
|--------|------|
| `.position-static` | position: static |
| `.position-relative` | position: relative |
| `.position-absolute` | position: absolute |
| `.position-fixed` | position: fixed |
| `.position-sticky` | position: sticky |
| `.top-0` | top: 0 |
| `.top-50` | top: 50% |
| `.top-100` | top: 100% |
| `.bottom-0` | bottom: 0 |
| `.start-0` | left: 0 |
| `.end-0` | right: 0 |
| `.translate-middle` | 중앙 정렬 변환 |

### Sizing

| 클래스 | 설명 |
|--------|------|
| `.w-25` | width: 25% |
| `.w-50` | width: 50% |
| `.w-75` | width: 75% |
| `.w-100` | width: 100% |
| `.w-auto` | width: auto |
| `.h-25` | height: 25% |
| `.h-50` | height: 50% |
| `.h-75` | height: 75% |
| `.h-100` | height: 100% |
| `.h-auto` | height: auto |
| `.mw-100` | max-width: 100% |
| `.mh-100` | max-height: 100% |
| `.min-vw-100` | min-width: 100vw |
| `.min-vh-100` | min-height: 100vh |
| `.vw-100` | width: 100vw |
| `.vh-100` | height: 100vh |

### Visibility

| 클래스 | 설명 |
|--------|------|
| `.visible` | visibility: visible |
| `.invisible` | visibility: hidden |
| `.opacity-0` | opacity: 0 |
| `.opacity-25` | opacity: 0.25 |
| `.opacity-50` | opacity: 0.5 |
| `.opacity-75` | opacity: 0.75 |
| `.opacity-100` | opacity: 1 |

### Overflow

| 클래스 | 설명 |
|--------|------|
| `.overflow-auto` | overflow: auto |
| `.overflow-hidden` | overflow: hidden |
| `.overflow-visible` | overflow: visible |
| `.overflow-scroll` | overflow: scroll |
| `.overflow-x-auto` | overflow-x: auto |
| `.overflow-y-auto` | overflow-y: auto |

### Shadow

| 클래스 | 설명 |
|--------|------|
| `.shadow-none` | 그림자 제거 |
| `.shadow-sm` | 작은 그림자 |
| `.shadow` | 기본 그림자 |
| `.shadow-lg` | 큰 그림자 |

### Z-Index

| 클래스 | 설명 |
|--------|------|
| `.z-0` | z-index: 0 |
| `.z-1` | z-index: 1 |
| `.z-2` | z-index: 2 |
| `.z-3` | z-index: 3 |

### Background

- **파일**: `_background.scss`

| 클래스 | 설명 |
|--------|------|
| `.bg-cover` | background-size: cover |
| `.bg-contain` | background-size: contain |
| `.bg-center` | background-position: center |
| `.bg-top` | background-position: top |
| `.bg-bottom` | background-position: bottom |
| `.bg-left` | background-position: left |
| `.bg-right` | background-position: right |
| `.bg-no-repeat` | background-repeat: no-repeat |
| `.bg-repeat` | background-repeat: repeat |
| `.bg-repeat-x` | background-repeat: repeat-x |
| `.bg-repeat-y` | background-repeat: repeat-y |
| `.bg-fixed` | background-attachment: fixed |
| `.bg-scroll` | background-attachment: scroll |

### Helpers

- **파일**: `_helpers.scss`

| 클래스 | 설명 |
|--------|------|
| `.clearfix` | float 해제 |
| `.float-start` | float: left |
| `.float-end` | float: right |
| `.float-none` | float: none |
| `.user-select-all` | user-select: all |
| `.user-select-auto` | user-select: auto |
| `.user-select-none` | user-select: none |
| `.pointer-events-none` | pointer-events: none |
| `.pointer-events-auto` | pointer-events: auto |
| `.pe-none` | pointer-events: none (축약) |
| `.pe-auto` | pointer-events: auto (축약) |
| `.cursor-pointer` | cursor: pointer |
| `.cursor-default` | cursor: default |
| `.cursor-not-allowed` | cursor: not-allowed |
| `.cursor-wait` | cursor: wait |
| `.cursor-move` | cursor: move |
| `.cursor-grab` | cursor: grab |

---

## 📝 네이밍 규칙

### BEM (Block Element Modifier)

```css
.block { }
.block__element { }
.block--modifier { }
```

### 예시

```html
<div class="card card--hover">
  <div class="card__header">
    <h3 class="card__title">제목</h3>
  </div>
  <div class="card__body">
    내용
  </div>
</div>
```

---

## 🎨 반응형 Breakpoints

| Breakpoint | 클래스 접미사 | 최소 너비 |
|------------|--------------|----------|
| Extra Small | (기본) | 0 |
| Small | `-sm` | 576px |
| Medium | `-md` | 768px |
| Large | `-lg` | 992px |
| Extra Large | `-xl` | 1200px |
| XXL | `-xxl` | 1400px |

---

> **생성일**: 2024-12-01  
> **버전**: 1.0.0  
> **IMCAT UI Framework**
