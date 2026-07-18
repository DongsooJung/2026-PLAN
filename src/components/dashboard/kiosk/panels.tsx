"use client";

import type { ReactNode } from "react";
import type { Subscription } from "@/lib/types";
import { formatCurrency, daysUntil, formatDate } from "@/lib/utils";
import { CATEGORIES } from "@/lib/constants";
import {
  categoryBreakdown,
  topSubscriptions,
  upcomingBillings,
  dashboardStats,
  activeSubs,
} from "@/lib/dashboard/analytics";
import { DonutChart } from "@/components/dashboard/charts/donut-chart";
import { BarList } from "@/components/dashboard/charts/bar-list";
import { ColumnChart } from "@/components/dashboard/charts/column-chart";
import { Wallet, PieChart, TrendingUp, CalendarRange } from "lucide-react";

const EMOJI: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.value, c.emoji])
);

export interface PanelDef {
  id: string;
  title: string;
  subtitle: string;
  icon: ReactNode;
  render: (subs: Subscription[]) => ReactNode;
}

function Legend({ subs }: { subs: Subscription[] }) {
  const slices = categoryBreakdown(subs);
  return (
    <ul className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
      {slices.map((s) => (
        <li key={s.category} className="flex items-center justify-between gap-2">
          <span className="flex min-w-0 items-center gap-2">
            <span
              className="h-3 w-3 shrink-0 rounded-[3px]"
              style={{ backgroundColor: s.color }}
              aria-hidden
            />
            <span className="truncate">
              {EMOJI[s.category]} {s.category}
            </span>
          </span>
          <span className="shrink-0 font-medium tabular-nums text-muted-foreground">
            {Math.round(s.share * 100)}%
          </span>
        </li>
      ))}
    </ul>
  );
}

export const PANELS: PanelDef[] = [
  {
    id: "overview",
    title: "전체 요약",
    subtitle: "구독 지출 한눈에 보기",
    icon: <Wallet className="h-5 w-5" />,
    render: (subs) => {
      const s = dashboardStats(subs);
      const cards = [
        { label: "월간 총 지출", value: formatCurrency(s.totalMonthly), accent: true },
        { label: "연간 환산", value: formatCurrency(s.totalYearly) },
        { label: "활성 구독", value: `${s.activeCount}개`, sub: `전체 ${s.totalCount}개` },
        {
          label: "구독당 평균",
          value: formatCurrency(s.avgMonthly),
          sub: "월 기준",
        },
      ];
      return (
        <div className="grid h-full grid-cols-2 gap-4">
          {cards.map((c) => (
            <div
              key={c.label}
              className={`flex flex-col justify-center rounded-2xl border p-6 ${
                c.accent ? "bg-primary/5" : "bg-[var(--card)]"
              }`}
            >
              <span className="text-sm text-muted-foreground">{c.label}</span>
              <span
                className={`mt-1 font-bold tabular-nums ${
                  c.accent ? "text-primary" : ""
                } text-3xl sm:text-4xl`}
              >
                {c.value}
              </span>
              {c.sub && (
                <span className="mt-1 text-xs text-muted-foreground">{c.sub}</span>
              )}
            </div>
          ))}
        </div>
      );
    },
  },
  {
    id: "category",
    title: "카테고리별 지출",
    subtitle: "월간 환산 비용 비중",
    icon: <PieChart className="h-5 w-5" />,
    render: (subs) => {
      const slices = categoryBreakdown(subs);
      const s = dashboardStats(subs);
      return (
        <div className="grid h-full grid-cols-1 items-center gap-6 sm:grid-cols-2">
          <div className="mx-auto aspect-square w-full max-w-[280px]">
            <DonutChart
              data={slices.map((d) => ({
                label: d.category,
                value: d.total,
                color: d.color,
              }))}
              centerLabel={formatCurrency(s.totalMonthly)}
              centerSub="월간 합계"
            />
          </div>
          <Legend subs={subs} />
        </div>
      );
    },
  },
  {
    id: "top-spend",
    title: "지출 상위 구독",
    subtitle: "월간 환산 비용 Top 6",
    icon: <TrendingUp className="h-5 w-5" />,
    render: (subs) => {
      const top = topSubscriptions(subs, 6);
      return (
        <div className="flex h-full flex-col justify-center">
          <BarList
            data={top.map((t) => ({
              label: t.name,
              value: t.monthly,
              color: t.color,
              prefix: EMOJI[t.category],
            }))}
            format={(v) => formatCurrency(v)}
            emptyText="활성 구독이 없습니다"
          />
        </div>
      );
    },
  },
  {
    id: "upcoming",
    title: "결제 예정 추이",
    subtitle: "앞으로 6개월 청구 예정 금액",
    icon: <CalendarRange className="h-5 w-5" />,
    render: (subs) => {
      const buckets = upcomingBillings(subs, 6);
      const next = activeSubs(subs)
        .filter((x) => daysUntil(x.next_billing_date) >= 0)
        .sort(
          (a, b) => daysUntil(a.next_billing_date) - daysUntil(b.next_billing_date)
        )[0];
      return (
        <div className="flex h-full flex-col gap-4">
          <div className="min-h-0 flex-1">
            <ColumnChart
              data={buckets.map((b, i) => ({
                label: b.label,
                value: b.total,
                highlight: i === 0,
              }))}
              format={(v) => formatCurrency(v)}
            />
          </div>
          {next && (
            <div className="rounded-xl border bg-[var(--card)] px-4 py-3 text-sm">
              <span className="text-muted-foreground">다음 결제 · </span>
              <span className="font-semibold">{next.service_name}</span>
              <span className="text-muted-foreground">
                {" "}
                · {formatDate(next.next_billing_date)} (D-
                {daysUntil(next.next_billing_date)})
              </span>
            </div>
          )}
        </div>
      );
    },
  },
];
