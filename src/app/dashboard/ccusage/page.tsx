import { getCcUsageRecords } from "@/actions/ccusage";
import { createClient } from "@/lib/supabase/server";
import { UsageSummaryCards } from "@/components/ccusage/usage-summary-cards";
import { UsageCharts } from "@/components/ccusage/usage-charts";
import { UsageTable } from "@/components/ccusage/usage-table";
import { AddUsageDialog } from "@/components/ccusage/add-usage-dialog";
import type { CcUsage } from "@/lib/types";

export default async function CcUsagePage() {
  let records: CcUsage[] = [];
  let userId = "";

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userId = user?.id ?? "";
    records = await getCcUsageRecords();
  } catch {
    // Supabase not connected yet — show empty state
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">CC Usage</h2>
          <p className="text-muted-foreground">
            Claude Code 사용량을 추적하고 분석하세요
          </p>
        </div>
        {userId && <AddUsageDialog userId={userId} />}
      </div>
      <UsageSummaryCards records={records} />
      <UsageCharts records={records} />
      <UsageTable records={records} />
    </div>
  );
}
