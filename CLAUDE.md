# 2026-PLAN 프로젝트 컨텍스트

## 프로젝트 개요
구독 서비스 관리 대시보드 + 공문서 변환기 웹앱 (한국어)

## 기술 스택
- Next.js 16 (App Router, Server Actions)
- Supabase (Auth + PostgreSQL + SSR + RLS)
- Tailwind CSS v4
- React Hook Form + Zod
- Lucide React (아이콘)
- PWA (Service Worker, manifest.json, TWA for Google Play)

## 주요 경로
- `/` - 로그인 페이지 (인증 시 `/converter`로 리다이렉트)
- `/dashboard` - 구독 관리 대시보드 (보호됨)
- `/converter` - 공문서 변환기 (보호됨)

## 핵심 디렉토리 구조
```
src/
  actions/subscriptions.ts     # Server Actions (CRUD)
  app/dashboard/page.tsx       # 대시보드 메인 페이지
  app/dashboard/layout.tsx     # 대시보드 레이아웃
  components/dashboard/        # 대시보드 컴포넌트
    summary-cards.tsx           # 요약 카드 (월간비용, 활성구독, 다음결제)
    subscription-list.tsx       # 구독 목록 (그리드/캘린더 뷰)
    subscription-card.tsx       # 개별 구독 카드
    subscription-form.tsx       # 구독 추가/수정 폼
    subscription-dialog.tsx     # 모달 다이얼로그
    calendar-view.tsx           # 캘린더 뷰
    category-filter.tsx         # 카테고리 필터
    delete-dialog.tsx           # 삭제 확인
    notification-bell.tsx       # 결제일 알림 벨 (신규)
  components/layout/header.tsx  # 헤더 (공문서 변환기 네비게이션)
  components/pwa/               # PWA 서비스워커 등록
  lib/types.ts                  # Subscription, Conversion 타입
  lib/constants.ts              # 카테고리, 결제주기, 상태, 인기서비스
  lib/utils.ts                  # 유틸 (toMonthlyCost, formatCurrency, daysUntil 등)
  lib/supabase/                 # Supabase 클라이언트 (client.ts, server.ts)
supabase/migrations/            # DB 마이그레이션
middleware.ts                   # 인증 미들웨어 (경로 보호)
```

## 데이터 모델
- `subscriptions` 테이블: id, user_id, service_name, plan_name, cost, currency(KRW/USD), billing_cycle(monthly/yearly/weekly), next_billing_date, category(8종), icon_url, status(active/paused/cancelled), memo
- RLS: 사용자별 데이터 격리

## 현재 브랜치
- `main` - 프로덕션
- `claude/list-dashboard-requirements-RFPJQ` - 대시보드 요구사항 리스트 + 결제일 알림 기능 (PR #5)

## 완료된 작업
1. 구독 관리 대시보드 전체 구현 (77개 요구사항, DASHBOARD_REQUIREMENTS.md 참조)
2. 공문서 변환기 구현
3. PWA/TWA 설정 (Google Play 배포)
4. 결제일 알림/리마인더 기능 (notification-bell.tsx)
   - 벨 아이콘 + 드롭다운 알림 패널
   - 브라우저 Notification API
   - 알림 설정 (N일 전, 활성화/비활성화)
   - localStorage로 설정 유지

## 다음 작업 후보
- [ ] 구독 비용 차트/그래프 (월별 지출 추이, 카테고리별 비율)
- [ ] 구독 내보내기 (CSV/Excel)
- [ ] 검색 + 정렬 기능 (금액순, 결제일순, 이름순)
- [ ] 온보딩 플로우
- [ ] 테스트 코드 (unit/e2e)
- [ ] CI/CD 파이프라인 (GitHub Actions)
- [ ] 에러 모니터링 (Sentry)
- [ ] 다국어 지원 (i18n)

## 배포
- Vercel (2026-plan-8zwh.vercel.app)
- Supabase (백엔드)
