"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { CcUsage } from "@/lib/types";

export async function getCcUsageRecords(): Promise<CcUsage[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cc_usage")
    .select("*")
    .order("used_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as CcUsage[];
}

export async function createCcUsage(
  formData: Omit<CcUsage, "id" | "created_at">
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("cc_usage")
    .insert(formData as Record<string, unknown>);

  if (error) throw error;
  revalidatePath("/dashboard/ccusage");
}

export async function deleteCcUsage(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("cc_usage")
    .delete()
    .eq("id", id);

  if (error) throw error;
  revalidatePath("/dashboard/ccusage");
}
