import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CATEGORIES } from "@/lib/constants";
import type { Subscription } from "@/lib/types";
import { formatCurrency, toMonthlyCost } from "@/lib/utils";

interface CostChartProps {
  subscriptions: Subscription[];
}

const BAR_COLORS = [
  "bg-indigo-500",
  "bg-sky-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-violet-500",
  "bg-cyan-500",
  "bg-slate-500",
] as const;

export function CostChart({ subscriptions }: CostChartProps) {
  const activeSubscriptions = subscriptions.filter(
    (subscription) => subscription.status === "active"
  );
  const currencies = Array.from(
    new Set(activeSubscriptions.map((subscription) => subscription.currency))
  ).sort();

  const groups = currencies.map((currency) => {
    const categories = CATEGORIES.map((category, index) => ({
      ...category,
      color: BAR_COLORS[index % BAR_COLORS.length],
      total: activeSubscriptions
        .filter(
          (subscription) =>
            subscription.currency === currency &&
            subscription.category === category.value
        )
        .reduce(
          (sum, subscription) =>
            sum +
            toMonthlyCost(
              Number(subscription.cost),
              subscription.billing_cycle
            ),
          0
        ),
    })).filter((category) => category.total > 0);

    return {
      currency,
      categories,
      max: Math.max(...categories.map((category) => category.total), 0),
      total: categories.reduce((sum, category) => sum + category.total, 0),
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">카테고리별 월간 비용</CardTitle>
        <p className="text-sm text-muted-foreground">
          활성 구독을 월간 비용으로 환산한 금액입니다
        </p>
      </CardHeader>
      <CardContent>
        {groups.length === 0 ? (
          <div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
            표시할 활성 구독 비용이 없습니다
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-2">
            {groups.map((group) => (
              <section key={group.currency} aria-label={`${group.currency} 월간 비용`}>
                <div className="mb-4 flex items-baseline justify-between gap-3">
                  <h3 className="text-sm font-semibold">{group.currency}</h3>
                  <p className="text-sm text-muted-foreground">
                    합계 {formatCurrency(group.total, group.currency)}
                  </p>
                </div>
                <div className="space-y-4">
                  {group.categories.map((category) => {
                    const percentage =
                      group.max === 0 ? 0 : (category.total / group.max) * 100;

                    return (
                      <div key={category.value}>
                        <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                          <span className="truncate">
                            {category.emoji} {category.label}
                          </span>
                          <span className="shrink-0 font-medium tabular-nums">
                            {formatCurrency(category.total, group.currency)}
                          </span>
                        </div>
                        <div className="h-2.5 overflow-hidden rounded-full bg-secondary">
                          <div
                            className={`h-full rounded-full ${category.color}`}
                            style={{ width: `${percentage}%` }}
                            role="img"
                            aria-label={`${category.label} ${formatCurrency(
                              category.total,
                              group.currency
                            )}`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
