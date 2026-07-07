# 2026 PLAN — 구독 관리 & 공문서 변환

구독 서비스를 한눈에 관리하고, 마크다운을 대한민국 정부 공문서 양식으로 변환하는 Next.js 웹앱입니다. PWA/TWA로 패키징되어 Google Play 배포까지 지원합니다.

## ✨ 주요 기능

### 📊 구독 관리 대시보드 (`/dashboard`)
- 구독 서비스 등록·수정·삭제 (서비스명, 요금제, 비용, 결제주기, 카테고리, 다음 결제일)
- 월간 지출 요약 카드 및 카테고리별 필터링
- 결제 예정일을 보여주는 캘린더 뷰
- 통화(KRW 등)·결제주기(월/년/주)별 관리

### 📄 공문서 변환기 (`/converter`)
- 마크다운을 한국 정부 공문서 서식으로 변환
- 공문서 번호 체계(1. → 가. → 1) → 가) …) 자동 적용
- **DOCX · HWPX · PDF** 형식으로 내보내기
- 변환 이력 저장 및 조회 (`/converter/history`)

## 🛠 기술 스택

| 영역 | 사용 기술 |
|------|-----------|
| 프레임워크 | Next.js 16 (App Router), React 19 |
| 언어 | TypeScript |
| 스타일 | Tailwind CSS v4, shadcn/ui (Radix UI) |
| 인증·DB | Supabase (Auth + Postgres, RLS) |
| 폼·검증 | react-hook-form, zod |
| 문서 생성 | docx, jspdf, html2canvas, jszip |
| PWA/TWA | Service Worker, Web App Manifest, Bubblewrap |

## 🚀 시작하기

### 1. 환경 변수 설정
`.env.example`을 복사해 `.env.local`을 만들고 Supabase 값을 채웁니다.

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 2. 데이터베이스 마이그레이션
`supabase/migrations/`의 SQL을 Supabase 프로젝트에 적용합니다.

- `001_create_subscriptions.sql` — 구독 테이블 + RLS 정책
- `002_create_conversions.sql` — 변환 이력 테이블 + RLS 정책

### 3. 개발 서버 실행
```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 확인합니다.

## 📜 스크립트

| 명령 | 설명 |
|------|------|
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 프로덕션 빌드 |
| `npm run start` | 프로덕션 서버 실행 |
| `npm run lint` | ESLint 검사 |

## 🔒 보안

- 모든 테이블에 **Row Level Security(RLS)** 적용 — 사용자는 본인 데이터만 접근 가능
- 서버 액션에서 `user_id`를 세션(`auth.getUser()`)으로부터 결정 (클라이언트 입력 신뢰 안 함)
- 보호 경로(`/dashboard`, `/converter`)는 `middleware.ts`에서 인증 검사

## 📱 배포

- **웹**: Vercel (`2026-plan-8zwh.vercel.app`)
- **Android**: TWA로 Google Play 배포 — [`GOOGLE_PLAY_DEPLOY.md`](./GOOGLE_PLAY_DEPLOY.md) 참고

## 📂 프로젝트 구조

```
src/
├── actions/        # 서버 액션 (subscriptions, conversions)
├── app/            # App Router 페이지 (dashboard, converter, auth)
├── components/     # UI·기능 컴포넌트 (dashboard, converter, ui)
└── lib/            # 유틸·타입·Supabase 클라이언트·변환 로직
    └── converter/  # 마크다운 파싱 및 DOCX/HWPX/PDF 내보내기
```
