import Link from "next/link";
import { getSubscriptions } from "@/actions/subscriptions";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { SubscriptionList } from "@/components/dashboard/subscription-list";
import { Button } from "@/components/ui/button";
import { MonitorPlay } from "lucide-react";
import type { Subscription } from "@/lib/types";

export default async function DashboardPage() {
  let subscriptions: Subscription[] = [];

  try {
    subscriptions = await getSubscriptions();
  } catch {
    // Supabase not connected yet — show empty state
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">대시보드</h2>
          <p className="text-muted-foreground">
            내 구독 서비스를 한눈에 확인하세요
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard/kiosk">
            <MonitorPlay className="mr-1 h-4 w-4" />
            순환 대시보드
          </Link>
        </Button>
      </div>
      <SummaryCards subscriptions={subscriptions} />
      <SubscriptionList subscriptions={subscriptions} />
    </div>
  );
}
