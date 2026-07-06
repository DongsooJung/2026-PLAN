"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  getNotificationSettings,
  updateNotificationSettings,
  savePushSubscription,
  deletePushSubscription,
} from "@/actions/notifications";
import {
  isPushSupported,
  getPermission,
  getExistingSubscription,
  subscribeToPush,
  unsubscribeFromPush,
} from "@/lib/push-client";
import { REMINDER_DAY_OPTIONS, DEFAULT_REMINDER_DAYS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

type Status = { type: "idle" | "success" | "error"; message: string };

export function NotificationSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pushBusy, setPushBusy] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [reminderDays, setReminderDays] =
    useState<number[]>(DEFAULT_REMINDER_DAYS);
  const [pushSubscribed, setPushSubscribed] = useState(false);
  const [permission, setPermission] = useState<
    NotificationPermission | "unsupported"
  >("default");
  const [status, setStatus] = useState<Status>({ type: "idle", message: "" });

  useEffect(() => {
    setPermission(getPermission());

    async function load() {
      try {
        const settings = await getNotificationSettings();
        setEnabled(settings.enabled);
        setReminderDays(
          settings.reminder_days?.length
            ? settings.reminder_days
            : DEFAULT_REMINDER_DAYS
        );
      } catch {
        // 미로그인/미연결 시 기본값 유지
      }

      if (isPushSupported()) {
        const sub = await getExistingSubscription();
        setPushSubscribed(Boolean(sub));
      }
      setLoading(false);
    }

    load();
  }, []);

  const toggleDay = (day: number) => {
    setReminderDays((prev) =>
      prev.includes(day)
        ? prev.filter((d) => d !== day)
        : [...prev, day].sort((a, b) => a - b)
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setStatus({ type: "idle", message: "" });
    try {
      await updateNotificationSettings({ enabled, reminder_days: reminderDays });
      setStatus({ type: "success", message: "알림 설정을 저장했습니다." });
    } catch {
      setStatus({
        type: "error",
        message: "저장에 실패했습니다. 로그인 상태를 확인하세요.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEnablePush = async () => {
    setPushBusy(true);
    setStatus({ type: "idle", message: "" });
    try {
      if (!VAPID_PUBLIC_KEY) {
        setStatus({
          type: "error",
          message:
            "푸시 키(NEXT_PUBLIC_VAPID_PUBLIC_KEY)가 설정되지 않았습니다.",
        });
        return;
      }
      const sub = await subscribeToPush(VAPID_PUBLIC_KEY);
      setPermission(getPermission());
      if (!sub) {
        setStatus({
          type: "error",
          message: "알림 권한이 거부되었거나 구독에 실패했습니다.",
        });
        return;
      }
      await savePushSubscription({
        endpoint: sub.endpoint,
        p256dh: sub.p256dh,
        auth: sub.auth,
        userAgent:
          typeof navigator !== "undefined" ? navigator.userAgent : undefined,
      });
      setPushSubscribed(true);
      setStatus({
        type: "success",
        message: "이 기기에서 결제일 푸시 알림을 받습니다.",
      });
    } catch {
      setStatus({ type: "error", message: "푸시 구독 중 오류가 발생했습니다." });
    } finally {
      setPushBusy(false);
    }
  };

  const handleDisablePush = async () => {
    setPushBusy(true);
    setStatus({ type: "idle", message: "" });
    try {
      const endpoint = await unsubscribeFromPush();
      if (endpoint) {
        await deletePushSubscription(endpoint);
      }
      setPushSubscribed(false);
      setStatus({ type: "success", message: "이 기기의 푸시 알림을 해제했습니다." });
    } catch {
      setStatus({ type: "error", message: "푸시 해제 중 오류가 발생했습니다." });
    } finally {
      setPushBusy(false);
    }
  };

  const handleTest = async () => {
    if (!isPushSupported()) return;
    const perm = await Notification.requestPermission();
    setPermission(getPermission());
    if (perm !== "granted") {
      setStatus({ type: "error", message: "알림 권한을 허용해야 합니다." });
      return;
    }
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification("테스트 알림", {
      body: "결제일 알림이 이렇게 표시됩니다.",
      icon: "/icons/icon-192x192.png",
      tag: "test-notification",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10 text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        불러오는 중...
      </div>
    );
  }

  const pushSupported = permission !== "unsupported";

  return (
    <div className="space-y-6">
      {/* 알림 사용 여부 */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label className="text-sm font-medium">결제일 알림</Label>
          <p className="text-xs text-muted-foreground">
            결제일이 다가오면 알림을 받습니다
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={() => setEnabled((v) => !v)}
          className={cn(
            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
            enabled ? "bg-primary" : "bg-input"
          )}
        >
          <span
            className={cn(
              "inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform",
              enabled ? "translate-x-5" : "translate-x-0.5"
            )}
          />
        </button>
      </div>

      {/* N일 전 선택 */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">며칠 전에 알릴까요?</Label>
        <div className="flex flex-wrap gap-2">
          {REMINDER_DAY_OPTIONS.map((opt) => {
            const active = reminderDays.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                disabled={!enabled}
                onClick={() => toggleDay(opt.value)}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm transition-colors disabled:opacity-50",
                  active
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-input text-muted-foreground hover:text-foreground"
                )}
              >
                {active && <Check className="h-3.5 w-3.5" />}
                {opt.label}
              </button>
            );
          })}
        </div>
        {enabled && reminderDays.length === 0 && (
          <p className="text-xs text-destructive">
            최소 한 개 이상 선택하세요
          </p>
        )}
      </div>

      <Button
        onClick={handleSave}
        disabled={saving || (enabled && reminderDays.length === 0)}
        className="w-full"
      >
        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        설정 저장
      </Button>

      {/* 푸시 구독 (기기별) */}
      <div className="rounded-lg border p-4 space-y-3">
        <div className="flex items-center gap-2">
          {pushSubscribed ? (
            <Bell className="h-4 w-4 text-primary" />
          ) : (
            <BellOff className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="text-sm font-medium">기기 푸시 알림</span>
        </div>
        <p className="text-xs text-muted-foreground">
          {pushSupported
            ? "앱이 닫혀 있어도 이 기기로 결제일 푸시를 받으려면 구독하세요."
            : "이 브라우저는 푸시 알림을 지원하지 않습니다."}
        </p>

        {pushSupported && (
          <div className="flex flex-wrap gap-2">
            {pushSubscribed ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDisablePush}
                disabled={pushBusy}
              >
                {pushBusy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                푸시 해제
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleEnablePush}
                disabled={pushBusy}
              >
                {pushBusy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                이 기기에서 푸시 받기
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={handleTest}>
              테스트 알림
            </Button>
          </div>
        )}

        {permission === "denied" && (
          <p className="text-xs text-destructive">
            브라우저 설정에서 알림이 차단되어 있습니다. 사이트 권한을 허용으로
            변경하세요.
          </p>
        )}
      </div>

      {status.type !== "idle" && (
        <p
          className={cn(
            "text-sm",
            status.type === "success" ? "text-green-600" : "text-destructive"
          )}
        >
          {status.message}
        </p>
      )}
    </div>
  );
}
