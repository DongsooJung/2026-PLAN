# 결제일 알림 / 리마인더 설정 가이드

구독 결제일 **N일 전**에 알림을 보내는 기능입니다. 두 경로로 동작합니다.

1. **서버 Web Push** — Vercel Cron이 매일 실행되어, 결제가 임박한 구독을 찾아
   각 기기로 푸시를 전송합니다. **앱이 닫혀 있어도** 도착합니다.
2. **인앱(로컬) 알림** — 대시보드를 열면 임박한 결제를 확인해 로컬 알림을
   표시합니다. 서버 푸시가 아직 설정되지 않았을 때의 보조 경로입니다.

## 1. DB 마이그레이션

`supabase/migrations/003_create_notifications.sql` 을 적용합니다.

- `notification_settings` — 사용자별 알림 on/off, N일 전 목록(`reminder_days`)
- `push_subscriptions` — 브라우저 Web Push 구독(엔드포인트/키)
- `notification_logs` — 같은 결제일·리마인더 조합의 중복 발송 방지

```bash
supabase db push
# 또는 Supabase 대시보드 SQL 편집기에 파일 내용을 붙여넣어 실행
```

## 2. VAPID 키 생성

```bash
npx web-push generate-vapid-keys
```

출력된 Public/Private 키를 환경 변수에 넣습니다.

## 3. 환경 변수 (`.env.local` / Vercel Project Settings)

```
NEXT_PUBLIC_VAPID_PUBLIC_KEY=<VAPID public key>
VAPID_PRIVATE_KEY=<VAPID private key>
VAPID_SUBJECT=mailto:you@example.com

# 서버가 모든 사용자 구독을 읽어 발송하기 위한 서비스 롤 키 (비공개!)
SUPABASE_SERVICE_ROLE_KEY=<Supabase service_role key>

# Cron 요청 인증용 시크릿
CRON_SECRET=<임의의 긴 문자열>
```

- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` 만 클라이언트에 노출됩니다. 나머지는 서버 전용입니다.
- `SUPABASE_SERVICE_ROLE_KEY`, `VAPID_PRIVATE_KEY`, `CRON_SECRET` 은 절대 클라이언트에 노출하지 마세요.

## 4. Vercel Cron

`vercel.json` 에 매일 실행 스케줄이 정의되어 있습니다.

```json
{ "crons": [{ "path": "/api/cron/billing-reminders", "schedule": "0 0 * * *" }] }
```

- `0 0 * * *` (UTC) = **매일 09:00 KST**.
- Vercel은 `CRON_SECRET` 이 설정되어 있으면 자동으로
  `Authorization: Bearer <CRON_SECRET>` 헤더를 붙여 호출합니다.

수동 테스트:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" \
  https://<your-app>/api/cron/billing-reminders
```

응답 예: `{ "ok": true, "candidates": 3, "logged": 3, "sent": 5, "cleaned": 0 }`

## 5. 사용자 흐름

1. 대시보드 우상단 **알림** 버튼 → 설정 다이얼로그.
2. **결제일 알림** 토글, **며칠 전**(1/3/7/14일) 선택 후 **설정 저장**.
3. **이 기기에서 푸시 받기** → 브라우저 알림 권한 허용 → 이 기기가 구독됩니다.
4. **테스트 알림** 으로 표시를 즉시 확인할 수 있습니다.

## 동작 요약

- 크론은 `next_billing_date` 가 오늘 기준 사용자의 `reminder_days` 중 하나와
  정확히 일치하는 활성 구독을 골라 발송합니다(예: 3일 전이면 D-3에 1회).
- `notification_logs` 유니크 제약으로 같은 (구독, 결제일, N일) 조합은 1회만 발송됩니다.
- 만료된 푸시 구독(404/410)은 자동으로 정리됩니다.
