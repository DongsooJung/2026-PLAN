"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Conversion } from "@/lib/types";

export async function getConversions(): Promise<Conversion[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("conversions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Conversion[];
}

export async function createConversion(
  formData: Omit<Conversion, "id" | "user_id" | "created_at" | "updated_at">
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("인증이 필요합니다.");

  const { error } = await supabase
    .from("conversions")
    .insert({ ...formData, user_id: user.id } as Record<string, unknown>);

  if (error) throw error;
  revalidatePath("/converter");
}

export async function deleteConversion(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("conversions")
    .delete()
    .eq("id", id);

  if (error) throw error;
  revalidatePath("/converter");
}
