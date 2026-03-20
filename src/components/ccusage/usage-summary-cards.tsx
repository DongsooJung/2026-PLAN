import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Cpu, DollarSign, Zap, Clock } from "lucide-react";
import type { CcUsage } from "@/lib/types";

interface UsageSummaryCardsProps {
  records: CcUsage[];
}

export function UsageSummaryCards({ records }: UsageSummaryCardsProps) {
  const totalCost = records.reduce((sum, r) => sum + Number(r.cost_usd), 0);
  const totalTokens = records.reduce(
    (sum, r) => sum + r.input_tokens + r.output_tokens,
    0
  );
  const totalSessions = new Set(records.map((r) => r.session_id).filter(Boolean)).size;
  const totalDuration = records.reduce((sum, r) => sum + r.duration_ms, 0);
  const totalHours = totalDuration / 1000 / 60 / 60;

  // This month
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonthRecords = records.filter(
    (r) => new Date(r.used_at) >= monthStart
  );
  const monthCost = thisMonthRecords.reduce(
    (sum, r) => sum + Number(r.cost_usd),
    0
  );

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">이번 달 비용</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${monthCost.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            총 누적 ${totalCost.toFixed(2)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">총 토큰</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {totalTokens >= 1_000_000
              ? `${(totalTokens / 1_000_000).toFixed(1)}M`
              : totalTokens >= 1_000
                ? `${(totalTokens / 1_000).toFixed(1)}K`
                : totalTokens}
          </div>
          <p className="text-xs text-muted-foreground">
            입력 + 출력 토큰 합계
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">세션 수</CardTitle>
          <Cpu className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalSessions}</div>
          <p className="text-xs text-muted-foreground">
            총 {records.length}건의 사용 기록
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">사용 시간</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {totalHours >= 1
              ? `${totalHours.toFixed(1)}h`
              : `${(totalDuration / 1000 / 60).toFixed(0)}m`}
          </div>
          <p className="text-xs text-muted-foreground">
            총 누적 사용 시간
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
