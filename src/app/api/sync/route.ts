import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isNotionEnabled } from "@/lib/notion/client";
import { fetchAllFromNotion, syncToNotion } from "@/lib/notion/sync";
import type { Subscription } from "@/lib/types";

// POST /api/sync — Full bidirectional sync
export async function POST() {
  if (!isNotionEnabled()) {
    return NextResponse.json(
      { error: "Notion 연동이 설정되지 않았습니다. 환경변수를 확인하세요." },
      { status: 400 }
    );
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }

    // 1. Fetch from both sources
    const { data: supabaseItems, error: sbError } = await supabase
      .from("subscriptions")
      .select("*")
      .order("created_at", { ascending: true });

    if (sbError) throw sbError;

    const notionItems = await fetchAllFromNotion();
    const subs = (supabaseItems ?? []) as Subscription[];
    const stats = { toNotion: 0, toSupabase: 0 };

    // 2. Supabase → Notion: sync all Supabase items
    for (const sub of subs) {
      const result = await syncToNotion(sub);
      if (result) stats.toNotion++;
    }

    // 3. Notion → Supabase: items in Notion that don't exist in Supabase
    const supabaseIds = new Set(subs.map((s) => s.id));
    const supabaseServiceNames = new Set(subs.map((s) => s.service_name));

    for (const notionItem of notionItems) {
      // Skip if already linked to Supabase
      if (notionItem.id && supabaseIds.has(notionItem.id)) continue;

      // Skip if service name already exists in Supabase
      if (supabaseServiceNames.has(notionItem.service_name ?? "")) continue;

      // New item from Notion → insert to Supabase
      if (notionItem.service_name) {
        const { error: insertError } = await supabase
          .from("subscriptions")
          .insert({
            user_id: user.id,
            service_name: notionItem.service_name,
            plan_name: notionItem.plan_name ?? null,
            cost: notionItem.cost ?? 0,
            currency: notionItem.currency ?? "KRW",
            billing_cycle: notionItem.billing_cycle ?? "monthly",
            next_billing_date: notionItem.next_billing_date ?? new Date().toISOString().split("T")[0],
            category: notionItem.category ?? "기타",
            status: notionItem.status ?? "active",
            memo: notionItem.memo ?? null,
            icon_url: null,
          });

        if (!insertError) stats.toSupabase++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `동기화 완료: Notion에 ${stats.toNotion}건 반영, Supabase에 ${stats.toSupabase}건 추가`,
      stats,
    });
  } catch (error) {
    console.error("[Sync API] Error:", error);
    return NextResponse.json(
      { error: "동기화 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// GET /api/sync — Check sync status
export async function GET() {
  return NextResponse.json({
    enabled: isNotionEnabled(),
    database_id: process.env.NOTION_DATABASE_ID ?? null,
  });
}
