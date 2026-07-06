"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_REMINDER_DAYS } from "@/lib/constants";
import type { NotificationSettings } from "@/lib/types";

/**
 * 현재 사용자의 알림 설정을 조회합니다.
 * 아직 저장된 설정이 없으면 기본값을 반환합니다(레코드는 생성하지 않음).
 */
export async function getNotificationSettings(): Promise<NotificationSettings> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("로그인이 필요합니다.");

  const { data, error } = await supabase
    .from("notification_settings")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) throw error;

  if (!data) {
    const now = new Date().toISOString();
    return {
      user_id: user.id,
      enabled: true,
      reminder_days: DEFAULT_REMINDER_DAYS,
      created_at: now,
      updated_at: now,
    };
  }

  return data as NotificationSettings;
}

/**
 * 알림 설정을 저장(upsert)합니다.
 */
export async function updateNotificationSettings(input: {
  enabled: boolean;
  reminder_days: number[];
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("로그인이 필요합니다.");

  // 유효한 값만 저장 (오름차순 정렬, 중복 제거)
  const reminderDays = Array.from(new Set(input.reminder_days))
    .filter((d) => Number.isInteger(d) && d > 0 && d <= 60)
    .sort((a, b) => a - b);

  const { error } = await supabase.from("notification_settings").upsert(
    {
      user_id: user.id,
      enabled: input.enabled,
      reminder_days: reminderDays,
    },
    { onConflict: "user_id" }
  );

  if (error) throw error;
  revalidatePath("/dashboard");
}

/**
 * 브라우저 푸시 구독 정보를 저장합니다. 동일 endpoint는 갱신(upsert).
 */
export async function savePushSubscription(input: {
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("로그인이 필요합니다.");

  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      user_id: user.id,
      endpoint: input.endpoint,
      p256dh: input.p256dh,
      auth: input.auth,
      user_agent: input.userAgent ?? null,
    },
    { onConflict: "user_id,endpoint" }
  );

  if (error) throw error;
}

/**
 * 특정 endpoint의 푸시 구독을 해제합니다.
 */
export async function deletePushSubscription(endpoint: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("로그인이 필요합니다.");

  const { error } = await supabase
    .from("push_subscriptions")
    .delete()
    .eq("user_id", user.id)
    .eq("endpoint", endpoint);

  if (error) throw error;
}
