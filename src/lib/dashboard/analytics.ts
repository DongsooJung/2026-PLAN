import type { Subscription, Category } from "@/lib/types";
import { toMonthlyCost, parseDateOnly } from "@/lib/utils";
import { CATEGORY_COLOR } from "@/lib/constants";

/**
 * 대시보드 시각화를 위한 순수 집계 함수 모음.
 * 모든 함수는 부수효과가 없어 유닛 테스트로 검증한다.
 *
 * 비용은 통화가 섞일 수 있으므로 KRW 기준 월간 환산값으로 합산한다.
 * (다중 통화 환율 변환은 범위 밖 — 동일 통화 가정)
 */

export interface CategorySlice {
  category: Category;
  color: string;
  total: number;
  count: number;
  share: number; // 0~1
}

export interface RankedSubscription {
  id: string;
  name: string;
  category: Category;
  color: string;
  monthly: number;
}

export interface MonthlyBucket {
  key: string; // YYYY-MM
  label: string; // "1월"
  total: number;
  count: number;
}

export interface CycleBucket {
  cycle: Subscription["billing_cycle"];
  label: string;
  count: number;
}

const CYCLE_LABEL: Record<Subscription["billing_cycle"], string> = {
  monthly: "월간",
  yearly: "연간",
  weekly: "주간",
};

export function activeSubs(subs: Subscription[]): Subscription[] {
  return subs.filter((s) => s.status === "active");
}

export function monthlyOf(sub: Subscription): number {
  return toMonthlyCost(Number(sub.cost), sub.billing_cycle);
}

export function totalMonthly(subs: Subscription[]): number {
  return activeSubs(subs).reduce((sum, s) => sum + monthlyOf(s), 0);
}

/** 카테고리별 월간 지출 — 지출 내림차순, 지출 0 카테고리는 제외 */
export function categoryBreakdown(subs: Subscription[]): CategorySlice[] {
  const active = activeSubs(subs);
  const totals = new Map<Category, { total: number; count: number }>();

  for (const s of active) {
    const cur = totals.get(s.category) ?? { total: 0, count: 0 };
    cur.total += monthlyOf(s);
    cur.count += 1;
    totals.set(s.category, cur);
  }

  const grand = [...totals.values()].reduce((a, b) => a + b.total, 0);

  return [...totals.entries()]
    .map(([category, { total, count }]) => ({
      category,
      color: CATEGORY_COLOR[category] ?? "var(--chart-8)",
      total,
      count,
      share: grand > 0 ? total / grand : 0,
    }))
    .sort((a, b) => b.total - a.total);
}

/** 월간 환산 비용 상위 N개 구독 */
export function topSubscriptions(
  subs: Subscription[],
  limit = 5
): RankedSubscription[] {
  return activeSubs(subs)
    .map((s) => ({
      id: s.id,
      name: s.service_name,
      category: s.category,
      color: CATEGORY_COLOR[s.category] ?? "var(--chart-8)",
      monthly: monthlyOf(s),
    }))
    .sort((a, b) => b.monthly - a.monthly)
    .slice(0, limit);
}

/** 결제 주기별 구독 수 (0개 주기 제외) */
export function billingCycleBreakdown(subs: Subscription[]): CycleBucket[] {
  const active = activeSubs(subs);
  const order: Subscription["billing_cycle"][] = [
    "monthly",
    "yearly",
    "weekly",
  ];
  return order
    .map((cycle) => ({
      cycle,
      label: CYCLE_LABEL[cycle],
      count: active.filter((s) => s.billing_cycle === cycle).length,
    }))
    .filter((b) => b.count > 0);
}

function ymKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/**
 * from 기준으로 앞으로 months개월간 결제 예정 금액(실제 청구액 기준) 버킷.
 * 각 구독의 next_billing_date가 속한 달에 청구 비용을 더한다.
 */
export function upcomingBillings(
  subs: Subscription[],
  months = 6,
  from: Date = new Date()
): MonthlyBucket[] {
  const start = new Date(from.getFullYear(), from.getMonth(), 1);
  const buckets: MonthlyBucket[] = [];
  const index = new Map<string, MonthlyBucket>();

  for (let i = 0; i < months; i++) {
    const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
    const bucket: MonthlyBucket = {
      key: ymKey(d),
      label: `${d.getMonth() + 1}월`,
      total: 0,
      count: 0,
    };
    buckets.push(bucket);
    index.set(bucket.key, bucket);
  }

  for (const s of activeSubs(subs)) {
    const date = parseDateOnly(s.next_billing_date);
    const bucket = index.get(ymKey(date));
    if (bucket) {
      bucket.total += Number(s.cost);
      bucket.count += 1;
    }
  }

  return buckets;
}

export interface DashboardStats {
  totalMonthly: number;
  totalYearly: number;
  activeCount: number;
  totalCount: number;
  avgMonthly: number;
  topCategory: CategorySlice | null;
}

export function dashboardStats(subs: Subscription[]): DashboardStats {
  const active = activeSubs(subs);
  const total = totalMonthly(subs);
  const cats = categoryBreakdown(subs);
  return {
    totalMonthly: total,
    totalYearly: total * 12,
    activeCount: active.length,
    totalCount: subs.length,
    avgMonthly: active.length > 0 ? total / active.length : 0,
    topCategory: cats[0] ?? null,
  };
}
