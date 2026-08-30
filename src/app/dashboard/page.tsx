import { getSubscriptions } from "@/actions/subscriptions";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { SubscriptionList } from "@/components/dashboard/subscription-list";
import { NotificationBell } from "@/components/dashboard/notification-bell";
import { CostChart } from "@/components/dashboard/cost-chart";
import { getDemoSubscriptions } from "@/lib/demo-subscriptions";
import {
  getPrivateSubscriptions,
  hasPrivateSubscriptions,
} from "@/lib/subscriptions-env.server";
import type { Subscription } from "@/lib/types";

export default async function DashboardPage() {
  const isPrivateDataMode = hasPrivateSubscriptions();
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
  let subscriptions: Subscription[] = [];

  if (isPrivateDataMode) {
    subscriptions = getPrivateSubscriptions();
  } else if (isDemoMode) {
    subscriptions = getDemoSubscriptions();
  } else {
    try {
      subscriptions = await getSubscriptions();
    } catch {
      // Supabase not connected yet — show empty state
    }
  }

  return (
    <div className="space-y-8">
      {isPrivateDataMode ? (
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-muted-foreground">
          서버 전용 환경변수에서 불러온 실제 구독 {subscriptions.length}건입니다.
          원본에 결제일이 없는 항목은 &quot;미등록&quot;으로 표시됩니다.
        </div>
      ) : isDemoMode ? (
        <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
          샘플 데이터로 제공되는 읽기 전용 데모입니다. 검색·정렬·비용 차트·CSV
          내보내기를 직접 확인할 수 있습니다.
        </div>
      ) : null}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">대시보드</h2>
          <p className="text-muted-foreground">
            내 구독 서비스를 한눈에 확인하세요
          </p>
        </div>
        <NotificationBell subscriptions={subscriptions} />
      </div>
      <SummaryCards subscriptions={subscriptions} />
      <CostChart subscriptions={subscriptions} />
      <SubscriptionList
        subscriptions={subscriptions}
        readOnly={isDemoMode || isPrivateDataMode}
      />
    </div>
  );
}
