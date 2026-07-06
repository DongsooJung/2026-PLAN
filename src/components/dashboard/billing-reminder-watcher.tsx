"use client";

import { useEffect } from "react";
import type { Subscription } from "@/lib/types";
import { getNotificationSettings } from "@/actions/notifications";
import { daysUntil, formatCurrency } from "@/lib/utils";
import { DEFAULT_REMINDER_DAYS } from "@/lib/constants";

interface BillingReminderWatcherProps {
  subscriptions: Subscription[];
}

const STORAGE_PREFIX = "billing-reminded:";

/**
 * 인앱(로컬) 결제일 알림.
 * 대시보드가 열릴 때 결제 임박 구독을 확인해 로컬 알림을 표시합니다.
 * 서버 Web Push가 설정되지 않았거나 앱이 열려 있을 때의 보조 경로입니다.
 * 동일 알림은 localStorage로 하루 1회만 표시합니다.
 */
export function BillingReminderWatcher({
  subscriptions,
}: BillingReminderWatcherProps) {
  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (
        typeof window === "undefined" ||
        !("serviceWorker" in navigator) ||
        !("Notification" in window) ||
        Notification.permission !== "granted"
      ) {
        return;
      }

      let enabled = true;
      let reminderDays: number[] = DEFAULT_REMINDER_DAYS;
      try {
        const settings = await getNotificationSettings();
        enabled = settings.enabled;
        reminderDays = settings.reminder_days?.length
          ? settings.reminder_days
          : DEFAULT_REMINDER_DAYS;
      } catch {
        // 설정 조회 실패 시 기본값 사용
      }

      if (!enabled || cancelled) return;

      const registration = await navigator.serviceWorker.ready;
      if (cancelled) return;

      const active = subscriptions.filter((s) => s.status === "active");

      for (const sub of active) {
        const d = daysUntil(sub.next_billing_date);
        if (!reminderDays.includes(d)) continue;

        const key = `${STORAGE_PREFIX}${sub.id}:${sub.next_billing_date}:${d}`;
        if (localStorage.getItem(key)) continue;

        const dLabel = d === 0 ? "오늘" : `${d}일 후`;
        await registration.showNotification(`${sub.service_name} 결제 ${dLabel}`, {
          body: `${formatCurrency(
            Number(sub.cost),
            sub.currency
          )} 결제가 예정되어 있습니다.`,
          icon: "/icons/icon-192x192.png",
          badge: "/icons/icon-96x96.png",
          tag: `billing-${sub.id}-${sub.next_billing_date}`,
          data: { url: "/dashboard" },
        });

        localStorage.setItem(key, new Date().toISOString());
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [subscriptions]);

  return null;
}
