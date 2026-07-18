import { describe, it, expect } from "vitest";
import {
  totalMonthly,
  monthlyOf,
  categoryBreakdown,
  topSubscriptions,
  billingCycleBreakdown,
  upcomingBillings,
  dashboardStats,
} from "./analytics";
import type { Subscription } from "@/lib/types";

function sub(overrides: Partial<Subscription>): Subscription {
  return {
    id: overrides.id ?? "id",
    user_id: "u",
    service_name: overrides.service_name ?? "Service",
    plan_name: null,
    cost: overrides.cost ?? 10000,
    currency: "KRW",
    billing_cycle: overrides.billing_cycle ?? "monthly",
    next_billing_date: overrides.next_billing_date ?? "2026-01-15",
    category: overrides.category ?? "기타",
    icon_url: null,
    status: overrides.status ?? "active",
    memo: null,
    created_at: "2026-01-01",
    updated_at: "2026-01-01",
    ...overrides,
  };
}

describe("monthlyOf / totalMonthly", () => {
  it("결제 주기를 월간으로 환산해 합산한다", () => {
    const subs = [
      sub({ id: "a", cost: 10000, billing_cycle: "monthly" }),
      sub({ id: "b", cost: 120000, billing_cycle: "yearly" }), // 10,000/월
    ];
    expect(monthlyOf(subs[1])).toBe(10000);
    expect(totalMonthly(subs)).toBe(20000);
  });

  it("비활성 구독은 합산에서 제외한다", () => {
    const subs = [
      sub({ id: "a", cost: 10000, status: "active" }),
      sub({ id: "b", cost: 99999, status: "paused" }),
      sub({ id: "c", cost: 99999, status: "cancelled" }),
    ];
    expect(totalMonthly(subs)).toBe(10000);
  });
});

describe("categoryBreakdown", () => {
  it("카테고리별 지출을 합산하고 비중을 계산한다", () => {
    const subs = [
      sub({ id: "a", category: "음악", cost: 10000 }),
      sub({ id: "b", category: "음악", cost: 10000 }),
      sub({ id: "c", category: "생산성", cost: 20000 }),
    ];
    const result = categoryBreakdown(subs);
    // 지출 내림차순: 음악(20000) == 생산성(20000) — 합계 40000
    const music = result.find((r) => r.category === "음악")!;
    expect(music.total).toBe(20000);
    expect(music.count).toBe(2);
    expect(music.share).toBeCloseTo(0.5);
    expect(result.every((r) => r.color.startsWith("var(--chart-"))).toBe(true);
  });

  it("지출 내림차순으로 정렬한다", () => {
    const subs = [
      sub({ id: "a", category: "뉴스", cost: 5000 }),
      sub({ id: "b", category: "생산성", cost: 30000 }),
    ];
    const result = categoryBreakdown(subs);
    expect(result[0].category).toBe("생산성");
    expect(result[1].category).toBe("뉴스");
  });

  it("구독이 없으면 빈 배열", () => {
    expect(categoryBreakdown([])).toEqual([]);
  });
});

describe("topSubscriptions", () => {
  it("월간 환산 비용 상위 N개를 반환한다", () => {
    const subs = [
      sub({ id: "a", service_name: "A", cost: 5000 }),
      sub({ id: "b", service_name: "B", cost: 30000 }),
      sub({ id: "c", service_name: "C", cost: 120000, billing_cycle: "yearly" }), // 10000/월
    ];
    const top = topSubscriptions(subs, 2);
    expect(top).toHaveLength(2);
    expect(top[0].name).toBe("B");
    expect(top[1].name).toBe("C");
  });
});

describe("billingCycleBreakdown", () => {
  it("주기별 개수를 세고 0개 주기는 제외한다", () => {
    const subs = [
      sub({ id: "a", billing_cycle: "monthly" }),
      sub({ id: "b", billing_cycle: "monthly" }),
      sub({ id: "c", billing_cycle: "yearly" }),
    ];
    const result = billingCycleBreakdown(subs);
    expect(result.find((r) => r.cycle === "monthly")?.count).toBe(2);
    expect(result.find((r) => r.cycle === "yearly")?.count).toBe(1);
    expect(result.find((r) => r.cycle === "weekly")).toBeUndefined();
  });
});

describe("upcomingBillings", () => {
  it("결제 예정일이 속한 달 버킷에 청구액을 더한다", () => {
    const from = new Date("2026-01-01");
    const subs = [
      sub({ id: "a", cost: 10000, next_billing_date: "2026-01-15" }),
      sub({ id: "b", cost: 5000, next_billing_date: "2026-02-10" }),
      sub({ id: "c", cost: 3000, next_billing_date: "2026-02-20" }),
    ];
    const buckets = upcomingBillings(subs, 3, from);
    expect(buckets).toHaveLength(3);
    expect(buckets[0].label).toBe("1월");
    expect(buckets[0].total).toBe(10000);
    expect(buckets[1].label).toBe("2월");
    expect(buckets[1].total).toBe(8000);
    expect(buckets[1].count).toBe(2);
    expect(buckets[2].total).toBe(0);
  });

  it("범위를 벗어난 결제일은 어떤 버킷에도 넣지 않는다", () => {
    const from = new Date("2026-01-01");
    const subs = [sub({ id: "a", cost: 10000, next_billing_date: "2026-12-01" })];
    const buckets = upcomingBillings(subs, 3, from);
    expect(buckets.reduce((a, b) => a + b.total, 0)).toBe(0);
  });
});

describe("dashboardStats", () => {
  it("핵심 지표를 종합한다", () => {
    const subs = [
      sub({ id: "a", category: "생산성", cost: 20000 }),
      sub({ id: "b", category: "음악", cost: 10000 }),
      sub({ id: "c", status: "cancelled", cost: 99999 }),
    ];
    const stats = dashboardStats(subs);
    expect(stats.totalMonthly).toBe(30000);
    expect(stats.totalYearly).toBe(360000);
    expect(stats.activeCount).toBe(2);
    expect(stats.totalCount).toBe(3);
    expect(stats.avgMonthly).toBe(15000);
    expect(stats.topCategory?.category).toBe("생산성");
  });

  it("빈 목록에서도 안전하다", () => {
    const stats = dashboardStats([]);
    expect(stats.totalMonthly).toBe(0);
    expect(stats.avgMonthly).toBe(0);
    expect(stats.topCategory).toBeNull();
  });
});
