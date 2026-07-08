# 구독 관리 대시보드 요구사항 목록

> 2026-PLAN 프로젝트 코드베이스 분석 기반 추출
> 생성일: 2026-04-06
> 브랜치: claude/subscription-dashboard-Ht2Da

---

## 1. 구독 관리 대시보드

### 1.1 요약 카드 (Summary Cards)
| ID | 요구사항 | 상태 | 소스 파일 |
|----|---------|------|----------|
| D-001 | 월간 총 구독 비용 표시 (통화 변환 포함) | ✅ 구현완료 | `summary-cards.tsx`, `utils.ts` |
| D-002 | 활성 구독 수 카운트 표시 | ✅ 구현완료 | `summary-cards.tsx` |
| D-003 | 다음 결제일 D-day 카운트다운 표시 | ✅ 구현완료 | `summary-cards.tsx`, `utils.ts` |

### 1.2 구독 목록 (Subscription List)
| ID | 요구사항 | 상태 | 소스 파일 |
|----|---------|------|----------|
| D-004 | 그리드 뷰 (카드 레이아웃) | ✅ 구현완료 | `subscription-list.tsx` |
| D-005 | 캘린더 뷰 (월별 달력) | ✅ 구현완료 | `calendar-view.tsx` |
| D-006 | 그리드/캘린더 뷰 전환 토글 | ✅ 구현완료 | `subscription-list.tsx` |
| D-007 | 카테고리별 필터링 | ✅ 구현완료 | `category-filter.tsx` |
| D-008 | 빈 상태(Empty State) 처리 | ✅ 구현완료 | `subscription-list.tsx` |

### 1.3 구독 카드 (Subscription Card)
| ID | 요구사항 | 상태 | 소스 파일 |
|----|---------|------|----------|
| D-009 | 서비스명 표시 | ✅ 구현완료 | `subscription-card.tsx` |
| D-010 | 금액 + 통화 표시 (KRW/USD) | ✅ 구현완료 | `subscription-card.tsx` |
| D-011 | 결제 주기 표시 (월/연/주) | ✅ 구현완료 | `subscription-card.tsx` |
| D-012 | 다음 결제일 D-N 포맷 | ✅ 구현완료 | `subscription-card.tsx`, `utils.ts` |
| D-013 | 카테고리 뱃지 | ✅ 구현완료 | `subscription-card.tsx` |
| D-014 | 상태 뱃지 (활성/일시정지/취소됨) | ✅ 구현완료 | `subscription-card.tsx` |
| D-015 | 수정 버튼 | ✅ 구현완료 | `subscription-card.tsx` |
| D-016 | 삭제 버튼 | ✅ 구현완료 | `subscription-card.tsx` |

### 1.4 캘린더 뷰 (Calendar View)
| ID | 요구사항 | 상태 | 소스 파일 |
|----|---------|------|----------|
| D-017 | 월별 달력 그리드 렌더링 | ✅ 구현완료 | `calendar-view.tsx` |
| D-018 | 월 네비게이션 (이전/다음) | ✅ 구현완료 | `calendar-view.tsx` |
| D-019 | 오늘 날짜 하이라이트 | ✅ 구현완료 | `calendar-view.tsx` |
| D-020 | 결제일에 구독 뱃지 표시 | ✅ 구현완료 | `calendar-view.tsx` |

### 1.5 CRUD 기능
| ID | 요구사항 | 상태 | 소스 파일 |
|----|---------|------|----------|
| D-021 | 구독 추가 다이얼로그 | ✅ 구현완료 | `subscription-dialog.tsx` |
| D-022 | 구독 수정 다이얼로그 | ✅ 구현완료 | `subscription-dialog.tsx` |
| D-023 | 구독 삭제 확인 다이얼로그 | ✅ 구현완료 | `delete-dialog.tsx` |

### 1.6 폼 필드 (Subscription Form)
| ID | 요구사항 | 상태 | 소스 파일 |
|----|---------|------|----------|
| D-024 | 서비스명 입력 + 자동완성 (인기 서비스) | ✅ 구현완료 | `subscription-form.tsx`, `constants.ts` |
| D-025 | 플랜명 입력 | ✅ 구현완료 | `subscription-form.tsx` |
| D-026 | 금액 입력 | ✅ 구현완료 | `subscription-form.tsx` |
| D-027 | 통화 선택 (KRW/USD) | ✅ 구현완료 | `subscription-form.tsx` |
| D-028 | 결제 주기 선택 (월/연/주) | ✅ 구현완료 | `subscription-form.tsx` |
| D-029 | 다음 결제일 선택 | ✅ 구현완료 | `subscription-form.tsx` |
| D-030 | 카테고리 선택 | ✅ 구현완료 | `subscription-form.tsx` |
| D-031 | 상태 선택 (active/paused/cancelled) | ✅ 구현완료 | `subscription-form.tsx` |
| D-032 | 메모 입력 | ✅ 구현완료 | `subscription-form.tsx` |
| D-033 | Zod 스키마 유효성 검증 | ✅ 구현완료 | `subscription-form.tsx` |

### 1.7 카테고리
| ID | 요구사항 | 상태 | 소스 파일 |
|----|---------|------|----------|
| D-034 | 엔터테인먼트 | ✅ 구현완료 | `constants.ts` |
| D-035 | 생산성 | ✅ 구현완료 | `constants.ts` |
| D-036 | 음악 | ✅ 구현완료 | `constants.ts` |
| D-037 | 클라우드 | ✅ 구현완료 | `constants.ts` |
| D-038 | 교육 | ✅ 구현완료 | `constants.ts` |
| D-039 | 건강 | ✅ 구현완료 | `constants.ts` |
| D-040 | 뉴스 | ✅ 구현완료 | `constants.ts` |
| D-041 | 기타 | ✅ 구현완료 | `constants.ts` |

### 1.8 인기 서비스 자동완성
| ID | 요구사항 | 상태 | 소스 파일 |
|----|---------|------|----------|
| D-042 | Netflix | ✅ 구현완료 | `constants.ts` |
| D-043 | YouTube Premium | ✅ 구현완료 | `constants.ts` |
| D-044 | Disney+ | ✅ 구현완료 | `constants.ts` |
| D-045 | Spotify | ✅ 구현완료 | `constants.ts` |
| D-046 | Apple Music | ✅ 구현완료 | `constants.ts` |
| D-047 | ChatGPT Plus | ✅ 구현완료 | `constants.ts` |
| D-048 | Notion | ✅ 구현완료 | `constants.ts` |
| D-049 | iCloud+ | ✅ 구현완료 | `constants.ts` |
| D-050 | Google One | ✅ 구현완료 | `constants.ts` |
| D-051 | Microsoft 365 | ✅ 구현완료 | `constants.ts` |

---

## 2. 인증 및 보안

| ID | 요구사항 | 상태 | 소스 파일 |
|----|---------|------|----------|
| D-052 | Supabase Auth 이메일/비밀번호 로그인 | ✅ 구현완료 | `login-form.tsx` |
| D-053 | 회원가입 (Sign Up) | ✅ 구현완료 | `login-form.tsx` |
| D-054 | /dashboard 경로 보호 (미인증 → 리다이렉트) | ✅ 구현완료 | `middleware.ts` |
| D-055 | Row Level Security (RLS) - user_id 기반 | ✅ 구현완료 | `001_create_subscriptions.sql` |
| D-056 | 사용자 메뉴 (이메일 표시 + 로그아웃) | ✅ 구현완료 | `user-menu.tsx` |

---

## 3. 데이터베이스 스키마

| ID | 요구사항 | 상태 | 소스 파일 |
|----|---------|------|----------|
| D-057 | subscriptions 테이블 생성 | ✅ 구현완료 | `001_create_subscriptions.sql` |
| D-058 | user_id (UUID, FK → auth.users) | ✅ 구현완료 | `001_create_subscriptions.sql` |
| D-059 | service_name, plan_name, cost, currency | ✅ 구현완료 | `001_create_subscriptions.sql` |
| D-060 | billing_cycle, next_billing_date | ✅ 구현완료 | `001_create_subscriptions.sql` |
| D-061 | category, status, memo 필드 | ✅ 구현완료 | `001_create_subscriptions.sql` |
| D-062 | notion_page_id (Notion 동기화용) | ✅ 구현완료 | `001_create_subscriptions.sql` |
| D-063 | created_at, updated_at 타임스탬프 | ✅ 구현완료 | `001_create_subscriptions.sql` |
| D-064 | updated_at 자동 갱신 트리거 | ✅ 구현완료 | `001_create_subscriptions.sql` |
| D-065 | user_id + next_billing_date 인덱스 | ✅ 구현완료 | `001_create_subscriptions.sql` |

---

## 4. 유틸리티 함수

| ID | 요구사항 | 상태 | 소스 파일 |
|----|---------|------|----------|
| D-066 | toMonthlyCost() - 월간 비용 환산 (연÷12, 주×4.33) | ✅ 구현완료 | `utils.ts` |
| D-067 | formatCurrency() - 통화 포맷 (KRW: 0자리, USD: 2자리) | ✅ 구현완료 | `utils.ts` |
| D-068 | daysUntil() - D-day 계산 (UTC 정규화) | ✅ 구현완료 | `utils.ts` |
| D-069 | formatDate() - 한국어 날짜 포맷 (ko-KR) | ✅ 구현완료 | `utils.ts` |

---

## 5. Notion 양방향 동기화

| ID | 요구사항 | 상태 | 소스 파일 |
|----|---------|------|----------|
| D-070 | Supabase → Notion 동기화 (생성/업데이트) | ✅ 구현완료 | `notion/sync.ts` |
| D-071 | Notion → Supabase 동기화 (supabase_id 매칭) | ✅ 구현완료 | `notion/sync.ts` |
| D-072 | 배치 처리 (5건씩, rate limit 대응) | ✅ 구현완료 | `notion/sync.ts` |
| D-073 | 삭제 시 Notion 페이지 아카이브 처리 | ✅ 구현완료 | `notion/sync.ts` |
| D-074 | 커서 기반 페이지네이션 (100건/페이지) | ✅ 구현완료 | `notion/sync.ts` |
| D-075 | POST /api/sync 엔드포인트 | ✅ 구현완료 | `api/sync/route.ts` |
| D-076 | 환경변수 기반 Notion 활성화 제어 | ✅ 구현완료 | `notion/client.ts` |
| D-077 | Notion 동기화 버튼 UI | ✅ 구현완료 | `notion-sync-button.tsx` |

---

## 6. PWA / 앱 배포

| ID | 요구사항 | 상태 | 소스 파일 |
|----|---------|------|----------|
| D-078 | Next.js PWA manifest 설정 | ✅ 구현완료 | `layout.tsx` |
| D-079 | 반응형 디자인 (모바일 우선) | ✅ 구현완료 | `globals.css` |
| D-080 | 다크모드 지원 | ✅ 구현완료 | `globals.css` |

---

## 7. 기술 스택

| ID | 요구사항 | 상태 | 소스 파일 |
|----|---------|------|----------|
| D-081 | Next.js 16 (App Router) | ✅ 구현완료 | `package.json` |
| D-082 | React 19 | ✅ 구현완료 | `package.json` |
| D-083 | Supabase (Auth + PostgreSQL) | ✅ 구현완료 | `package.json` |
| D-084 | Tailwind CSS v4 | ✅ 구현완료 | `package.json` |
| D-085 | React Hook Form + Zod 유효성 검증 | ✅ 구현완료 | `package.json` |
| D-086 | @notionhq/client (Notion API) | ✅ 구현완료 | `package.json` |
| D-087 | TypeScript 5 | ✅ 구현완료 | `tsconfig.json` |

---

## 요약

| 카테고리 | 항목 수 | 구현완료 | 미구현 |
|---------|--------|---------|-------|
| 구독 관리 대시보드 | 51 | 51 | 0 |
| 인증 및 보안 | 5 | 5 | 0 |
| 데이터베이스 스키마 | 9 | 9 | 0 |
| 유틸리티 함수 | 4 | 4 | 0 |
| Notion 동기화 | 8 | 8 | 0 |
| PWA/앱 배포 | 3 | 3 | 0 |
| 기술 스택 | 7 | 7 | 0 |
| **총계** | **87** | **87** | **0** |
