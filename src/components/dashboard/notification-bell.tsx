"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, BellRing, Settings2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Subscription } from "@/lib/types";
import { daysUntil, formatDate, formatCurrency } from "@/lib/utils";

interface NotificationBellProps {
  subscriptions: Subscription[];
}

const STORAGE_KEY = "notification-settings";

interface NotificationSettings {
  enabled: boolean;
  daysBeforeBilling: number;
  dismissedIds: string[];
}

function getSettings(): NotificationSettings {
  if (typeof window === "undefined") {
    return { enabled: true, daysBeforeBilling: 3, dismissedIds: [] };
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore
  }
  return { enabled: true, daysBeforeBilling: 3, dismissedIds: [] };
}

function saveSettings(settings: NotificationSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function NotificationBell({ subscriptions }: NotificationBellProps) {
  const [settings, setSettings] = useState<NotificationSettings>(getSettings);
  const [open, setOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const notifiedRef = useRef(false);

  const upcomingAlerts = subscriptions
    .filter((s) => s.status === "active")
    .filter((s) => {
      const days = daysUntil(s.next_billing_date);
      return days >= 0 && days <= settings.daysBeforeBilling;
    })
    .filter((s) => !settings.dismissedIds.includes(s.id))
    .sort(
      (a, b) =>
        daysUntil(a.next_billing_date) - daysUntil(b.next_billing_date)
    );

  const alertCount = settings.enabled ? upcomingAlerts.length : 0;

  useEffect(() => {
    if (!settings.enabled || notifiedRef.current || upcomingAlerts.length === 0)
      return;
    notifiedRef.current = true;

    if (!("Notification" in window)) return;

    if (Notification.permission === "default") {
      Notification.requestPermission();
      return;
    }

    if (Notification.permission === "granted") {
      const sub = upcomingAlerts[0];
      const days = daysUntil(sub.next_billing_date);
      new Notification("결제일 알림", {
        body:
          days === 0
            ? `${sub.service_name} 오늘 결제됩니다!`
            : `${sub.service_name} 결제 D-${days} (${formatDate(sub.next_billing_date)})`,
        icon: "/icons/icon-192x192.png",
        tag: `billing-${sub.id}`,
      });
    }
  }, [settings.enabled, upcomingAlerts]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setShowSettings(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const dismissAlert = (id: string) => {
    const updated = {
      ...settings,
      dismissedIds: [...settings.dismissedIds, id],
    };
    setSettings(updated);
    saveSettings(updated);
  };

  const updateSettings = (partial: Partial<NotificationSettings>) => {
    const updated = { ...settings, ...partial, dismissedIds: [] };
    setSettings(updated);
    saveSettings(updated);
  };

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => {
          setOpen(!open);
          setShowSettings(false);
        }}
      >
        {alertCount > 0 ? (
          <BellRing className="h-5 w-5 text-orange-500" />
        ) : (
          <Bell className="h-5 w-5" />
        )}
        {alertCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
            {alertCount}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-lg border bg-popover shadow-lg">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h3 className="text-sm font-semibold">결제 알림</h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings2 className="h-4 w-4" />
            </Button>
          </div>

          {showSettings ? (
            <div className="space-y-4 p-4">
              <label className="flex items-center justify-between">
                <span className="text-sm">알림 활성화</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={settings.enabled}
                  onClick={() =>
                    updateSettings({ enabled: !settings.enabled })
                  }
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    settings.enabled ? "bg-primary" : "bg-muted"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.enabled ? "translate-x-4.5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </label>
              <div className="space-y-1">
                <label className="text-sm" htmlFor="days-before">
                  결제 며칠 전부터 알림
                </label>
                <select
                  id="days-before"
                  className="w-full rounded-md border bg-background px-3 py-1.5 text-sm"
                  value={settings.daysBeforeBilling}
                  onChange={(e) =>
                    updateSettings({
                      daysBeforeBilling: Number(e.target.value),
                    })
                  }
                >
                  <option value={1}>1일 전</option>
                  <option value={3}>3일 전</option>
                  <option value={5}>5일 전</option>
                  <option value={7}>7일 전</option>
                  <option value={14}>14일 전</option>
                </select>
              </div>
            </div>
          ) : alertCount > 0 ? (
            <ul className="max-h-64 overflow-y-auto">
              {upcomingAlerts.map((sub) => {
                const days = daysUntil(sub.next_billing_date);
                return (
                  <li
                    key={sub.id}
                    className="flex items-start gap-3 border-b px-4 py-3 last:border-b-0"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {sub.service_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(sub.next_billing_date)} &middot;{" "}
                        {formatCurrency(Number(sub.cost), sub.currency)}
                      </p>
                      <Badge
                        variant={days === 0 ? "destructive" : "secondary"}
                        className="mt-1 text-[10px]"
                      >
                        {days === 0 ? "오늘 결제" : `D-${days}`}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0"
                      onClick={() => dismissAlert(sub.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="px-4 py-8 text-center">
              <Bell className="mx-auto h-8 w-8 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">
                {settings.enabled
                  ? "예정된 결제 알림이 없습니다"
                  : "알림이 비활성화되어 있습니다"}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
