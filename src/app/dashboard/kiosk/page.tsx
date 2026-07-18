import Link from "next/link";
import { getSubscriptions } from "@/actions/subscriptions";
import { RotatingDashboard } from "@/components/dashboard/kiosk/rotating-dashboard";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import type { Subscription } from "@/lib/types";

export default async function KioskPage() {
  let subscriptions: Subscription[] = [];

  try {
    subscriptions = await getSubscriptions();
  } catch {
    // Supabase 미연결 — 빈 상태로 표시
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">순환 대시보드</h2>
          <p className="text-muted-foreground">
            15초마다 자동으로 지표가 전환됩니다 · ← → 이동, Space 정지
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard">
            <ArrowLeft className="mr-1 h-4 w-4" />
            대시보드
          </Link>
        </Button>
      </div>

      <RotatingDashboard subscriptions={subscriptions} intervalMs={15000} />
    </div>
  );
}
