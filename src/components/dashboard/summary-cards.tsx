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

  const totalMonthlyCost = activeSubscriptions.reduce(
    (sum, s) =>
      sum +
      toMonthlyCost(
        Number(s.cost),
        s.billing_cycle as "monthly" | "yearly" | "weekly"
      ),
    0
  );

  const upcoming = activeSubscriptions
    .filter((s) => daysUntil(s.next_billing_date) >= 0)
    .sort(
      (a, b) =>
        daysUntil(a.next_billing_date) - daysUntil(b.next_billing_date)
    )[0];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">월간 총 비용</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(totalMonthlyCost)}
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
                D-{daysUntil(upcoming.next_billing_date)}
              </div>
              <p className="text-xs text-muted-foreground">
                {upcoming.service_name} &middot;{" "}
                {formatDate(upcoming.next_billing_date)}
              </p>
            </>
          ) : (
            <>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">
                예정된 결제가 없습니다
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
