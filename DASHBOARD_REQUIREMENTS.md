# 대시보드 요구사항 리스트

기존 대화 및 커밋 히스토리에서 추출한 대시보드 관련 요구사항을 정리합니다.

---

## 1. 구독 관리 대시보드 (Subscription Dashboard)

> 출처: PR #1 `Add subscription management dashboard with Supabase integration`, 커밋 `07dd523`

### 1.1 요약 카드 (Summary Cards)
| # | 요구사항 | 구현 상태 |
|---|---------|----------|
| 1 | 월간 총 비용 표시 (모든 활성 구독의 월간 환산 비용) | O |
| 2 | 활성 구독 수 표시 (전체 N개 중 활성 구독) | O |
| 3 | 다음 결제일 D-day 카운트다운 (가장 가까운 결제 서비스명 + 날짜) | O |

### 1.2 구독 목록 (Subscription List)
| # | 요구사항 | 구현 상태 |
|---|---------|----------|
| 4 | 그리드 뷰 (카드형 레이아웃) | O |
| 5 | 캘린더 뷰 (월별 달력에 결제일 표시) | O |
| 6 | 그리드/캘린더 뷰 전환 토글 | O |
| 7 | 카테고리별 필터링 (전체 + 8개 카테고리) | O |
| 8 | 빈 상태(empty state) 안내 + "첫 구독 추가하기" 버튼 | O |

### 1.3 구독 카드 (Subscription Card)
| # | 요구사항 | 구현 상태 |
|---|---------|----------|
| 9 | 서비스 이름 + 카테고리 이모지 표시 | O |
| 10 | 플랜 이름 표시 | O |
| 11 | 금액 표시 (통화 포맷팅) + 결제 주기 라벨 | O |
| 12 | 다음 결제일 + D-day 표시 | O |
| 13 | 카테고리 배지 | O |
| 14 | 상태 배지 (활성/일시정지/해지) | O |
| 15 | 수정(Edit) 버튼 (hover 시 노출) | O |
| 16 | 삭제(Delete) 버튼 (hover 시 노출) + 확인 다이얼로그 | O |

### 1.4 캘린더 뷰 (Calendar View)
| # | 요구사항 | 구현 상태 |
|---|---------|----------|
| 17 | 월별 달력 그리드 (일~토) | O |
| 18 | 이전/다음 월 네비게이션 | O |
| 19 | 오늘 날짜 하이라이트 | O |
| 20 | 결제일에 서비스명 + 카테고리 이모지 뱃지 표시 | O |

### 1.5 구독 CRUD (추가/수정/삭제)
| # | 요구사항 | 구현 상태 |
|---|---------|----------|
| 21 | 구독 추가 다이얼로그 (모달) | O |
| 22 | 구독 수정 다이얼로그 (기존 데이터 프리필) | O |
| 23 | 구독 삭제 확인 다이얼로그 | O |

### 1.6 구독 폼 필드
| # | 요구사항 | 구현 상태 |
|---|---------|----------|
| 24 | 서비스 이름 (필수) + 인기 서비스 자동완성 | O |
| 25 | 플랜 이름 (선택) | O |
| 26 | 금액 (필수, 0 이상) | O |
| 27 | 통화 선택 (KRW / USD) | O |
| 28 | 결제 주기 (월간/연간/주간) | O |
| 29 | 다음 결제일 (필수, date picker) | O |
| 30 | 카테고리 선택 (8개 카테고리) | O |
| 31 | 상태 선택 (활성/일시정지/해지) | O |
| 32 | 메모 (선택) | O |
| 33 | Zod 스키마 기반 폼 유효성 검증 | O |

### 1.7 인기 서비스 자동완성 목록
| # | 요구사항 | 구현 상태 |
|---|---------|----------|
| 34 | Netflix, YouTube Premium, Disney+ (엔터테인먼트) | O |
| 35 | Spotify, Apple Music (음악) | O |
| 36 | ChatGPT Plus, Notion, Microsoft 365 (생산성) | O |
| 37 | iCloud+, Google One (클라우드) | O |

### 1.8 카테고리 체계
| # | 카테고리 | 이모지 | 구현 상태 |
|---|---------|--------|----------|
| 38 | 엔터테인먼트 | 🎬 | O |
| 39 | 생산성 | ⚡ | O |
| 40 | 음악 | 🎵 | O |
| 41 | 클라우드 | ☁️ | O |
| 42 | 교육 | 📚 | O |
| 43 | 건강 | 💪 | O |
| 44 | 뉴스 | 📰 | O |
| 45 | 기타 | 📦 | O |

---

## 2. 인증 및 보안 (Authentication & Security)

> 출처: 커밋 `07dd523`, `middleware.ts`

| # | 요구사항 | 구현 상태 |
|---|---------|----------|
| 46 | Supabase Auth 기반 이메일/비밀번호 인증 | O |
| 47 | 대시보드 경로(`/dashboard`) 보호 (미인증 시 로그인 페이지 리다이렉트) | O |
| 48 | Row Level Security (RLS) - 사용자별 데이터 격리 | O |
| 49 | 로그인 사용자가 `/` 접근 시 `/converter`로 자동 리다이렉트 | O |
| 50 | 사용자 메뉴 (프로필, 로그아웃) | O |

---

## 3. 데이터베이스 스키마 (Database Schema)

> 출처: `supabase/migrations/001_create_subscriptions.sql`

| # | 요구사항 | 구현 상태 |
|---|---------|----------|
| 51 | `subscriptions` 테이블 (UUID PK, FK to auth.users) | O |
| 52 | 금액 numeric(10,2) + cost >= 0 체크 제약조건 | O |
| 53 | billing_cycle 체크 제약조건 (monthly/yearly/weekly) | O |
| 54 | category 체크 제약조건 (8개 카테고리) | O |
| 55 | status 체크 제약조건 (active/paused/cancelled) | O |
| 56 | `user_id` 인덱스 | O |
| 57 | `(user_id, next_billing_date)` 복합 인덱스 | O |
| 58 | `updated_at` 자동 갱신 트리거 | O |
| 59 | 사용자별 CRUD RLS 정책 4개 (select/insert/update/delete) | O |

---

## 4. 유틸리티 함수 (Utility Functions)

> 출처: `src/lib/utils.ts`

| # | 요구사항 | 구현 상태 |
|---|---------|----------|
| 60 | 결제 주기별 월간 비용 환산 (`toMonthlyCost`) | O |
| 61 | 통화 포맷팅 - KRW(원)/USD($) (`formatCurrency`) | O |
| 62 | D-day 계산 (`daysUntil`) | O |
| 63 | 한국어 날짜 포맷 (`formatDate`) | O |

---

## 5. PWA / 앱 배포 (PWA & App Deployment)

> 출처: 커밋 `0e9b7b2`, `793e9db`, `4526b71`

| # | 요구사항 | 구현 상태 |
|---|---------|----------|
| 64 | PWA manifest.json (start_url: `/dashboard`) | O |
| 65 | 앱 바로가기: "구독 대시보드" (`/dashboard`) | O |
| 66 | 앱 바로가기: "공문서 변환기" (`/converter`) | O |
| 67 | TWA (Trusted Web Activity) 설정 - Google Play 배포 | O |
| 68 | Android assetlinks.json SHA256 fingerprint 설정 | O |
| 69 | 반응형 디자인 (모바일/태블릿/데스크톱) | O |
| 70 | 다크모드 지원 | O |

---

## 6. 기술 스택 요구사항

> 출처: `package.json`, 커밋 히스토리

| # | 요구사항 | 구현 상태 |
|---|---------|----------|
| 71 | Next.js 16 (App Router) | O |
| 72 | Supabase (Auth + Database + SSR) | O |
| 73 | Tailwind CSS v4 | O |
| 74 | React Hook Form + Zod (폼 검증) | O |
| 75 | Lucide React (아이콘) | O |
| 76 | Server Actions (구독 CRUD) | O |
| 77 | 한국어 로컬라이제이션 (모든 UI 텍스트) | O |

---

## 요약

- **총 요구사항 수**: 77개
- **구현 완료**: 77개 (100%)
- **미구현**: 0개

모든 대시보드 관련 요구사항이 현재 구현된 상태입니다.
