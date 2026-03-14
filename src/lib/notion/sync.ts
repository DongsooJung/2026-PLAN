import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { getNotionClient, getNotionDataSourceId, getNotionDatabaseId, isNotionEnabled } from "./client";
import type { Subscription, BillingCycle, Category, SubscriptionStatus } from "@/lib/types";

// ========== Mapping helpers ==========

const BILLING_CYCLE_TO_NOTION: Record<BillingCycle, string> = {
  monthly: "월간",
  yearly: "연간",
  weekly: "주간",
};

const NOTION_TO_BILLING_CYCLE: Record<string, BillingCycle> = {
  "월간": "monthly",
  "연간": "yearly",
  "주간": "weekly",
};

const STATUS_TO_NOTION: Record<SubscriptionStatus, string> = {
  active: "활성",
  paused: "일시정지",
  cancelled: "해지",
};

const NOTION_TO_STATUS: Record<string, SubscriptionStatus> = {
  "활성": "active",
  "일시정지": "paused",
  "해지": "cancelled",
};

// ========== Property extractors ==========

function getPlainText(prop: unknown): string | null {
  const p = prop as { type: string; rich_text?: Array<{ plain_text: string }>; title?: Array<{ plain_text: string }> };
  if (p?.type === "title" && p.title?.length) return p.title[0].plain_text;
  if (p?.type === "rich_text" && p.rich_text?.length) return p.rich_text[0].plain_text;
  return null;
}

function getSelect(prop: unknown): string | null {
  const p = prop as { type: string; select?: { name: string } | null };
  return p?.select?.name ?? null;
}

function getNumber(prop: unknown): number | null {
  const p = prop as { type: string; number?: number | null };
  return p?.number ?? null;
}

function getDate(prop: unknown): string | null {
  const p = prop as { type: string; date?: { start: string } | null };
  return p?.date?.start ?? null;
}

function getStatus(prop: unknown): string | null {
  const p = prop as { type: string; status?: { name: string } | null };
  return p?.status?.name ?? null;
}

// ========== Notion → Supabase ==========

interface NotionSubscription extends Partial<Subscription> {
  notion_page_id: string;
}

export function notionPageToSubscription(page: PageObjectResponse): NotionSubscription {
  const props = page.properties;

  return {
    notion_page_id: page.id,
    service_name: getPlainText(props["서비스명"]) ?? "",
    plan_name: getPlainText(props["플랜"]),
    cost: getNumber(props["비용"]) ?? 0,
    currency: getSelect(props["통화"]) ?? "KRW",
    billing_cycle: NOTION_TO_BILLING_CYCLE[getSelect(props["결제주기"]) ?? ""] ?? "monthly",
    next_billing_date: getDate(props["다음결제일"]) ?? new Date().toISOString().split("T")[0],
    category: (getSelect(props["카테고리"]) as Category) ?? "기타",
    status: NOTION_TO_STATUS[getStatus(props["상태"]) ?? ""] ?? "active",
    memo: getPlainText(props["메모"]),
    id: getPlainText(props["supabase_id"]) ?? undefined,
  };
}

// ========== Supabase → Notion properties ==========

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function subscriptionToNotionProperties(sub: Partial<Subscription>): Record<string, any> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const properties: Record<string, any> = {};

  if (sub.service_name !== undefined) {
    properties["서비스명"] = { title: [{ text: { content: sub.service_name } }] };
  }
  if (sub.plan_name !== undefined) {
    properties["플랜"] = { rich_text: sub.plan_name ? [{ text: { content: sub.plan_name } }] : [] };
  }
  if (sub.cost !== undefined) {
    properties["비용"] = { number: sub.cost };
  }
  if (sub.currency !== undefined) {
    properties["통화"] = { select: { name: sub.currency } };
  }
  if (sub.billing_cycle !== undefined) {
    properties["결제주기"] = { select: { name: BILLING_CYCLE_TO_NOTION[sub.billing_cycle] } };
  }
  if (sub.next_billing_date !== undefined) {
    properties["다음결제일"] = { date: { start: sub.next_billing_date } };
  }
  if (sub.category !== undefined) {
    properties["카테고리"] = { select: { name: sub.category } };
  }
  if (sub.status !== undefined) {
    properties["상태"] = { status: { name: STATUS_TO_NOTION[sub.status] } };
  }
  if (sub.memo !== undefined) {
    properties["메모"] = { rich_text: sub.memo ? [{ text: { content: sub.memo } }] : [] };
  }
  if (sub.id !== undefined) {
    properties["supabase_id"] = { rich_text: [{ text: { content: sub.id } }] };
  }

  return properties;
}

// ========== CRUD operations ==========

export async function syncToNotion(subscription: Subscription): Promise<string | null> {
  if (!isNotionEnabled()) return null;

  const notion = getNotionClient();
  if (!notion) return null;

  try {
    // Check if page already exists by supabase_id
    const existing = await notion.dataSources.query({
      data_source_id: getNotionDataSourceId(),
      filter: {
        property: "supabase_id",
        rich_text: { equals: subscription.id },
      },
    });

    const properties = subscriptionToNotionProperties(subscription);

    if (existing.results.length > 0) {
      // Update existing page
      const pageId = existing.results[0].id;
      await notion.pages.update({ page_id: pageId, properties });
      return pageId;
    } else {
      // Create new page under database
      const response = await notion.pages.create({
        parent: { database_id: getNotionDatabaseId() },
        properties,
      });
      return response.id;
    }
  } catch (error) {
    console.error("[Notion Sync] Error syncing to Notion:", error);
    return null;
  }
}

export async function deleteFromNotion(supabaseId: string): Promise<boolean> {
  if (!isNotionEnabled()) return false;

  const notion = getNotionClient();
  if (!notion) return false;

  try {
    const existing = await notion.dataSources.query({
      data_source_id: getNotionDataSourceId(),
      filter: {
        property: "supabase_id",
        rich_text: { equals: supabaseId },
      },
    });

    if (existing.results.length > 0) {
      await notion.pages.update({
        page_id: existing.results[0].id,
        archived: true,
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error("[Notion Sync] Error deleting from Notion:", error);
    return false;
  }
}

export async function fetchAllFromNotion(): Promise<NotionSubscription[]> {
  if (!isNotionEnabled()) return [];

  const notion = getNotionClient();
  if (!notion) return [];

  try {
    const results: PageObjectResponse[] = [];
    let cursor: string | undefined = undefined;

    do {
      const response = await notion.dataSources.query({
        data_source_id: getNotionDataSourceId(),
        start_cursor: cursor,
      });
      results.push(...(response.results.filter(r => r.object === "page") as PageObjectResponse[]));
      cursor = response.has_more ? (response.next_cursor ?? undefined) : undefined;
    } while (cursor);

    return results.map(notionPageToSubscription);
  } catch (error) {
    console.error("[Notion Sync] Error fetching from Notion:", error);
    return [];
  }
}
