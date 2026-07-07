"use client";

import { useMemo, useState } from "react";
import type { Subscription } from "@/lib/types";
import { CATEGORIES } from "@/lib/constants";
import { toMonthlyCost, formatCurrency } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrendingUp, PieChart } from "lucide-react";

interface SpendingChartsProps {
  subscriptions: Subscription[];
}

interface MonthlyPoint {
  label: string;
  amount: number;
  count: number;
}

interface CategoryPoint {
  category: string;
  emoji: string;
  amount: number;
  count: number;
  share: number;
}

const compactKrw = new Intl.NumberFormat("ko-KR", {
  notation: "compact",
  maximumFractionDigits: 1,
});

function buildMonthlyProjection(subscriptions: Subscription[]): MonthlyPoint[] {
  const active = subscriptions.filter((s) => s.status === "active");
  const now = new Date();
  const points: MonthlyPoint[] = [];

  for (let offset = 0; offset < 6; offset++) {
    const month = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    let amount = 0;
    let count = 0;

    for (const s of active) {
      const cost = Number(s.cost);
      if (s.billing_cycle === "monthly") {
        amount += cost;
        count++;
      } else if (s.billing_cycle === "weekly") {
        amount += cost * 4.33;
        count++;
      } else if (s.billing_cycle === "yearly") {
        // 연간 구독은 결제 기념월에만 청구
        const billingMonth = new Date(s.next_billing_date).getMonth();
        if (billingMonth === month.getMonth()) {
          amount += cost;
          count++;
        }
      }
    }

    points.push({
      label: `${month.getMonth() + 1}월`,
      amount,
      count,
    });
  }

  return points;
}

function buildCategoryBreakdown(
  subscriptions: Subscription[]
): CategoryPoint[] {
  const active = subscriptions.filter((s) => s.status === "active");
  const totals = new Map<string, { amount: number; count: number }>();

  for (const s of active) {
    const monthly = toMonthlyCost(Number(s.cost), s.billing_cycle);
    const entry = totals.get(s.category) ?? { amount: 0, count: 0 };
    entry.amount += monthly;
    entry.count++;
    totals.set(s.category, entry);
  }

  const grandTotal = [...totals.values()].reduce(
    (sum, e) => sum + e.amount,
    0
  );

  return [...totals.entries()]
    .map(([category, entry]) => ({
      category,
      emoji: CATEGORIES.find((c) => c.value === category)?.emoji ?? "📦",
      amount: entry.amount,
      count: entry.count,
      share: grandTotal > 0 ? (entry.amount / grandTotal) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-44 items-center justify-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}

function MonthlyTrendChart({ points }: { points: MonthlyPoint[] }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const max = Math.max(...points.map((p) => p.amount), 1);

  return (
    <div className="flex h-44 items-end gap-2 border-b pb-px sm:gap-3">
      {points.map((point, i) => (
        <div
          key={point.label}
          className="relative flex h-full flex-1 flex-col items-center justify-end"
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(null)}
        >
          {hovered === i && (
            <div className="pointer-events-none absolute -top-2 z-10 -translate-y-full whitespace-nowrap rounded-md border bg-popover px-2.5 py-1.5 text-xs text-popover-foreground shadow-md">
              <p className="font-medium">{point.label} 예상 지출</p>
              <p>
                {formatCurrency(point.amount)} · {point.count}건
              </p>
            </div>
          )}
          <span className="mb-1 text-[11px] text-muted-foreground">
            {compactKrw.format(Math.round(point.amount))}
          </span>
          <div
            className="w-full max-w-6 rounded-t-[4px] bg-primary transition-opacity"
            style={{
              height: `${(point.amount / max) * 100}%`,
              minHeight: point.amount > 0 ? "2px" : "0",
              opacity: hovered === null || hovered === i ? 1 : 0.4,
            }}
          />
          <span className="mt-1.5 text-xs text-muted-foreground">
            {point.label}
          </span>
        </div>
      ))}
    </div>
  );
}

function CategoryBreakdownChart({ points }: { points: CategoryPoint[] }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const max = Math.max(...points.map((p) => p.amount), 1);

  return (
    <div className="space-y-3">
      {points.map((point, i) => (
        <div
          key={point.category}
          className="relative flex items-center gap-3"
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(null)}
        >
          {hovered === i && (
            <div className="pointer-events-none absolute -top-1 left-28 z-10 -translate-y-full whitespace-nowrap rounded-md border bg-popover px-2.5 py-1.5 text-xs text-popover-foreground shadow-md">
              <p className="font-medium">
                {point.emoji} {point.category}
              </p>
              <p>
                월 {formatCurrency(point.amount)} · {point.count}개 구독 ·{" "}
                {point.share.toFixed(1)}%
              </p>
            </div>
          )}
          <span className="w-24 shrink-0 truncate text-sm">
            {point.emoji} {point.category}
          </span>
          <div className="flex-1">
            <div
              className="h-2.5 rounded-r-[4px] bg-primary transition-opacity"
              style={{
                width: `${(point.amount / max) * 100}%`,
                minWidth: "2px",
                opacity: hovered === null || hovered === i ? 1 : 0.4,
              }}
            />
          </div>
          <span className="w-20 shrink-0 text-right text-xs text-muted-foreground">
            {point.share.toFixed(0)}%
          </span>
        </div>
      ))}
    </div>
  );
}

export function SpendingCharts({ subscriptions }: SpendingChartsProps) {
  const monthly = useMemo(
    () => buildMonthlyProjection(subscriptions),
    [subscriptions]
  );
  const categories = useMemo(
    () => buildCategoryBreakdown(subscriptions),
    [subscriptions]
  );

  const hasData = subscriptions.some((s) => s.status === "active");

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-sm font-medium">
            월별 지출 전망 (향후 6개월)
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {hasData ? (
            <MonthlyTrendChart points={monthly} />
          ) : (
            <EmptyChart message="활성 구독을 추가하면 지출 전망이 표시됩니다" />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-sm font-medium">
            카테고리별 월 지출 비율
          </CardTitle>
          <PieChart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {hasData ? (
            <CategoryBreakdownChart points={categories} />
          ) : (
            <EmptyChart message="활성 구독을 추가하면 카테고리 비율이 표시됩니다" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
