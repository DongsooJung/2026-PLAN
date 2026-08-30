"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Subscription } from "@/lib/types";

function assertSubscriptionsWritable() {
  if (
    process.env.SUBSCRIPTIONS_JSON !== undefined ||
    process.env.NEXT_PUBLIC_DEMO_MODE === "true"
  ) {
    throw new Error("읽기 전용 구독 데이터는 변경할 수 없습니다");
  }
}

export async function getSubscriptions(): Promise<Subscription[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .order("next_billing_date", { ascending: true });

  if (error) throw error;
  return (data ?? []) as Subscription[];
}

export async function createSubscription(
  formData: Omit<Subscription, "id" | "created_at" | "updated_at">
) {
  assertSubscriptionsWritable();
  const supabase = await createClient();
  const { error } = await supabase
    .from("subscriptions")
    .insert(formData as Record<string, unknown>);

  if (error) throw error;
  revalidatePath("/dashboard");
}

export async function updateSubscription(
  id: string,
  data: Partial<Omit<Subscription, "id" | "user_id" | "created_at" | "updated_at">>
) {
  assertSubscriptionsWritable();
  const supabase = await createClient();
  const { error } = await supabase
    .from("subscriptions")
    .update(data as Record<string, unknown>)
    .eq("id", id);

  if (error) throw error;
  revalidatePath("/dashboard");
}

export async function deleteSubscription(id: string) {
  assertSubscriptionsWritable();
  const supabase = await createClient();
  const { error } = await supabase
    .from("subscriptions")
    .delete()
    .eq("id", id);

  if (error) throw error;
  revalidatePath("/dashboard");
}
