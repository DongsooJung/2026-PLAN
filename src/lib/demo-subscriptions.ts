import type { Subscription } from "@/lib/types";

function dateAfter(days: number): string {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export function getDemoSubscriptions(): Subscription[] {
  const timestamp = new Date().toISOString();

  return [
    {
      id: "demo-netflix",
      user_id: "demo",
      service_name: "Netflix",
      plan_name: "프리미엄",
      cost: 17000,
      currency: "KRW",
      billing_cycle: "monthly",
      next_billing_date: dateAfter(3),
      category: "엔터테인먼트",
      icon_url: null,
      status: "active",
      memo: "가족 계정",
      created_at: timestamp,
      updated_at: timestamp,
    },
    {
      id: "demo-chatgpt",
      user_id: "demo",
      service_name: "ChatGPT Plus",
      plan_name: "Plus",
      cost: 20,
      currency: "USD",
      billing_cycle: "monthly",
      next_billing_date: dateAfter(7),
      category: "생산성",
      icon_url: null,
      status: "active",
      memo: null,
      created_at: timestamp,
      updated_at: timestamp,
    },
    {
      id: "demo-youtube",
      user_id: "demo",
      service_name: "YouTube Premium",
      plan_name: "개인",
      cost: 14900,
      currency: "KRW",
      billing_cycle: "monthly",
      next_billing_date: dateAfter(12),
      category: "엔터테인먼트",
      icon_url: null,
      status: "active",
      memo: null,
      created_at: timestamp,
      updated_at: timestamp,
    },
    {
      id: "demo-microsoft",
      user_id: "demo",
      service_name: "Microsoft 365",
      plan_name: "Personal",
      cost: 125000,
      currency: "KRW",
      billing_cycle: "yearly",
      next_billing_date: dateAfter(21),
      category: "생산성",
      icon_url: null,
      status: "active",
      memo: "연간 결제",
      created_at: timestamp,
      updated_at: timestamp,
    },
    {
      id: "demo-spotify",
      user_id: "demo",
      service_name: "Spotify",
      plan_name: "Individual",
      cost: 10.99,
      currency: "USD",
      billing_cycle: "monthly",
      next_billing_date: dateAfter(28),
      category: "음악",
      icon_url: null,
      status: "paused",
      memo: "다음 달 재검토",
      created_at: timestamp,
      updated_at: timestamp,
    },
  ];
}
