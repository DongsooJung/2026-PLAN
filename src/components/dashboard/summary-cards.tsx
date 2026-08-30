import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Wallet, CreditCard, CalendarClock } from "lucide-react";
import type { Subscription } from "@/lib/types";
import { toMonthlyCost, formatCurrency, daysUntil, formatDate } from "@/lib/utils";

interface SummaryCardsProps {
  subscriptions: Subscription[];
}

export function SummaryCards({ subscriptions }: SummaryCardsProps) {
  const activeSubscriptions = subscriptions.filter(
    (s) => s.status === "active"
  );

  const monthlyTotals = Array.from(
    activeSubscriptions.reduce((totals, subscription) => {
      totals.set(
        subscription.currency,
        (totals.get(subscription.currency) ?? 0) +
          toMonthlyCost(Number(subscription.cost), subscription.billing_cycle)
      );
      return totals;
    }, new Map<string, number>())
  ).sort(([currencyA], [currencyB]) => currencyA.localeCompare(currencyB));

  const upcoming = activeSubscriptions
    .map((subscription) => ({
      subscription,
      days: daysUntil(subscription.next_billing_date),
    }))
    .filter(
      (item): item is { subscription: Subscription; days: number } =>
        item.days !== null && item.days >= 0
    )
    .sort((a, b) => a.days - b.days)[0];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">월간 총 비용</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-1 text-2xl font-bold">
            {monthlyTotals.length > 0
              ? monthlyTotals.map(([currency, total]) => (
                  <div key={currency}>{formatCurrency(total, currency)}</div>
                ))
              : "-"}
          </div>
          <p className="text-xs text-muted-foreground">
            모든 활성 구독의 월간 환산 비용
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">활성 구독</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {activeSubscriptions.length}개
          </div>
          <p className="text-xs text-muted-foreground">
            전체 {subscriptions.length}개 중 활성 구독
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">다음 결제</CardTitle>
          <CalendarClock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {upcoming ? (
            <>
              <div className="text-2xl font-bold">
                D-{upcoming.days}
              </div>
              <p className="text-xs text-muted-foreground">
                {upcoming.subscription.service_name} &middot;{" "}
                {formatDate(upcoming.subscription.next_billing_date)}
              </p>
            </>
          ) : (
            <>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">
                결제일이 등록된 예정 항목이 없습니다
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
