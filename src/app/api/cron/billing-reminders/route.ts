import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  ensureWebPushConfigured,
  sendWebPush,
  type WebPushTarget,
} from "@/lib/webpush";
import type {
  NotificationSettings,
  PushSubscriptionRecord,
  Subscription,
} from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// 리마인더로 미리 조회할 최대 창(일). 어떤 사용자든 이보다 먼 알림은 없음.
const MAX_WINDOW_DAYS = 60;

/** Asia/Seoul 기준 오늘 날짜(YYYY-MM-DD). */
function getKstToday(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/** 두 YYYY-MM-DD 날짜의 정수 일수 차이(target - base). */
function dayDiff(target: string, base: string): number {
  const t = Date.parse(`${target}T00:00:00Z`);
  const b = Date.parse(`${base}T00:00:00Z`);
  return Math.round((t - b) / 86_400_000);
}

function formatKRW(amount: number, currency: string): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: currency || "KRW",
    maximumFractionDigits: currency === "KRW" ? 0 : 2,
  }).format(amount);
}

function formatKoreanDate(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  return `${d.getUTCMonth() + 1}월 ${d.getUTCDate()}일`;
}

function authorize(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  // 시크릿 미설정 시(로컬 개발) 통과. 배포 환경에서는 반드시 설정할 것.
  if (!secret) return true;

  const header = request.headers.get("authorization");
  if (header === `Bearer ${secret}`) return true;

  const qp = request.nextUrl.searchParams.get("secret");
  return qp === secret;
}

export async function GET(request: NextRequest) {
  if (!authorize(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!ensureWebPushConfigured()) {
    return NextResponse.json(
      { error: "VAPID 키가 설정되지 않았습니다." },
      { status: 500 }
    );
  }

  const admin = createAdminClient();
  const today = getKstToday();

  const windowEnd = new Date(`${today}T00:00:00Z`);
  windowEnd.setUTCDate(windowEnd.getUTCDate() + MAX_WINDOW_DAYS);
  const windowEndStr = windowEnd.toISOString().slice(0, 10);

  // 1) 알림 창 안의 활성 구독 조회
  const { data: subs, error: subsError } = await admin
    .from("subscriptions")
    .select("id, user_id, service_name, cost, currency, next_billing_date")
    .eq("status", "active")
    .gte("next_billing_date", today)
    .lte("next_billing_date", windowEndStr);

  if (subsError) {
    return NextResponse.json({ error: subsError.message }, { status: 500 });
  }

  const subscriptions = (subs ?? []) as Pick<
    Subscription,
    "id" | "user_id" | "service_name" | "cost" | "currency" | "next_billing_date"
  >[];

  if (subscriptions.length === 0) {
    return NextResponse.json({ ok: true, candidates: 0, sent: 0 });
  }

  const userIds = Array.from(new Set(subscriptions.map((s) => s.user_id)));

  // 2) 대상 사용자들의 알림 설정 조회 (활성화된 사용자만)
  const { data: settingsRows } = await admin
    .from("notification_settings")
    .select("*")
    .in("user_id", userIds);

  const settingsByUser = new Map<string, NotificationSettings>();
  for (const row of (settingsRows ?? []) as NotificationSettings[]) {
    settingsByUser.set(row.user_id, row);
  }

  // 설정이 없는 사용자는 기본값(활성, 7/3/1일 전) 적용
  const DEFAULT_DAYS = [7, 3, 1];

  // 3) 후보 계산: (구독, 결제일, N일 전)
  type Candidate = {
    user_id: string;
    subscription_id: string;
    billing_date: string;
    reminder_day: number;
    service_name: string;
    cost: number;
    currency: string;
  };

  const candidates: Candidate[] = [];
  for (const sub of subscriptions) {
    const settings = settingsByUser.get(sub.user_id);
    if (settings && !settings.enabled) continue;

    const reminderDays = settings?.reminder_days?.length
      ? settings.reminder_days
      : DEFAULT_DAYS;

    const d = dayDiff(sub.next_billing_date, today);
    if (reminderDays.includes(d)) {
      candidates.push({
        user_id: sub.user_id,
        subscription_id: sub.id,
        billing_date: sub.next_billing_date,
        reminder_day: d,
        service_name: sub.service_name,
        cost: Number(sub.cost),
        currency: sub.currency,
      });
    }
  }

  if (candidates.length === 0) {
    return NextResponse.json({ ok: true, candidates: 0, sent: 0 });
  }

  // 4) 중복 방지: 로그를 먼저 insert하고, 새로 추가된 것만 발송
  const { data: insertedLogs, error: logError } = await admin
    .from("notification_logs")
    .upsert(
      candidates.map((c) => ({
        user_id: c.user_id,
        subscription_id: c.subscription_id,
        billing_date: c.billing_date,
        reminder_day: c.reminder_day,
      })),
      {
        onConflict: "subscription_id,billing_date,reminder_day",
        ignoreDuplicates: true,
      }
    )
    .select("subscription_id, billing_date, reminder_day");

  if (logError) {
    return NextResponse.json({ error: logError.message }, { status: 500 });
  }

  // 새로 로깅된 후보만 발송 대상으로 남김
  const insertedKeys = new Set(
    (insertedLogs ?? []).map(
      (l) => `${l.subscription_id}|${l.billing_date}|${l.reminder_day}`
    )
  );
  const toSend = candidates.filter((c) =>
    insertedKeys.has(`${c.subscription_id}|${c.billing_date}|${c.reminder_day}`)
  );

  if (toSend.length === 0) {
    return NextResponse.json({
      ok: true,
      candidates: candidates.length,
      sent: 0,
    });
  }

  // 5) 발송 대상 사용자들의 푸시 구독 조회
  const sendUserIds = Array.from(new Set(toSend.map((c) => c.user_id)));
  const { data: pushRows } = await admin
    .from("push_subscriptions")
    .select("*")
    .in("user_id", sendUserIds);

  const pushByUser = new Map<string, PushSubscriptionRecord[]>();
  for (const row of (pushRows ?? []) as PushSubscriptionRecord[]) {
    const list = pushByUser.get(row.user_id) ?? [];
    list.push(row);
    pushByUser.set(row.user_id, list);
  }

  // 6) 발송
  let sent = 0;
  const expiredEndpoints: string[] = [];

  for (const c of toSend) {
    const targets = pushByUser.get(c.user_id) ?? [];
    if (targets.length === 0) continue;

    const dLabel = c.reminder_day === 0 ? "오늘" : `${c.reminder_day}일 후`;
    const payload = {
      title: `${c.service_name} 결제 ${dLabel}`,
      body: `${formatKRW(c.cost, c.currency)} · ${formatKoreanDate(
        c.billing_date
      )} 결제 예정`,
      url: "/dashboard",
      tag: `billing-${c.subscription_id}-${c.billing_date}`,
    };

    for (const target of targets) {
      const webPushTarget: WebPushTarget = {
        endpoint: target.endpoint,
        keys: { p256dh: target.p256dh, auth: target.auth },
      };
      const result = await sendWebPush(webPushTarget, payload);
      if (result.ok) {
        sent += 1;
      } else if (result.statusCode === 404 || result.statusCode === 410) {
        expiredEndpoints.push(target.endpoint);
      }
    }
  }

  // 7) 만료된 구독 정리
  if (expiredEndpoints.length > 0) {
    await admin
      .from("push_subscriptions")
      .delete()
      .in("endpoint", expiredEndpoints);
  }

  return NextResponse.json({
    ok: true,
    candidates: candidates.length,
    logged: toSend.length,
    sent,
    cleaned: expiredEndpoints.length,
  });
}
