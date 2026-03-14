"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { syncToNotion, deleteFromNotion } from "@/lib/notion/sync";
import type { Subscription } from "@/lib/types";

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
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .insert(formData as Record<string, unknown>)
    .select()
    .single();

  if (error) throw error;

  // Sync to Notion (non-blocking)
  if (data) {
    syncToNotion(data as Subscription).catch(() => {});
  }

  revalidatePath("/dashboard");
}

export async function updateSubscription(
  id: string,
  updateData: Partial<Omit<Subscription, "id" | "user_id" | "created_at" | "updated_at">>
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .update(updateData as Record<string, unknown>)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  // Sync to Notion (non-blocking)
  if (data) {
    syncToNotion(data as Subscription).catch(() => {});
  }

  revalidatePath("/dashboard");
}

export async function deleteSubscription(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("subscriptions")
    .delete()
    .eq("id", id);

  if (error) throw error;

  // Delete from Notion (non-blocking)
  deleteFromNotion(id).catch(() => {});

  revalidatePath("/dashboard");
}
