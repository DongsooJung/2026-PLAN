"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import type { CcUsage } from "@/lib/types";
import { deleteCcUsage } from "@/actions/ccusage";

interface UsageTableProps {
  records: CcUsage[];
}

export function UsageTable({ records }: UsageTableProps) {
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await deleteCcUsage(id);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">사용 기록</CardTitle>
      </CardHeader>
      <CardContent>
        {records.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">
            아직 사용 기록이 없습니다. 사용 기록을 추가해 주세요.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 pr-4 font-medium">날짜</th>
                  <th className="pb-2 pr-4 font-medium">모델</th>
                  <th className="pb-2 pr-4 font-medium text-right">입력</th>
                  <th className="pb-2 pr-4 font-medium text-right">출력</th>
                  <th className="pb-2 pr-4 font-medium text-right">비용</th>
                  <th className="pb-2 pr-4 font-medium">작업</th>
                  <th className="pb-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {records.slice(0, 50).map((r) => (
                  <tr key={r.id} className="border-b last:border-0">
                    <td className="py-2 pr-4 whitespace-nowrap">
                      {new Date(r.used_at).toLocaleDateString("ko-KR", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-2 pr-4">
                      <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        {r.model.replace("claude-", "").replace(/-\d{8}$/, "")}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-right tabular-nums">
                      {r.input_tokens.toLocaleString()}
                    </td>
                    <td className="py-2 pr-4 text-right tabular-nums">
                      {r.output_tokens.toLocaleString()}
                    </td>
                    <td className="py-2 pr-4 text-right tabular-nums">
                      ${Number(r.cost_usd).toFixed(4)}
                    </td>
                    <td className="py-2 pr-4 max-w-[200px] truncate">
                      {r.task_description || "-"}
                    </td>
                    <td className="py-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleDelete(r.id)}
                        disabled={deleting === r.id}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {records.length > 50 && (
              <p className="mt-2 text-center text-xs text-muted-foreground">
                최근 50건만 표시됩니다 (전체 {records.length}건)
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
