"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CcUsage } from "@/lib/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface UsageChartsProps {
  records: CcUsage[];
}

const COLORS = [
  "#4f46e5",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];

export function UsageCharts({ records }: UsageChartsProps) {
  // Daily cost for last 30 days
  const dailyCost = getDailyCostData(records);
  // Model distribution
  const modelDistribution = getModelDistribution(records);
  // Daily tokens
  const dailyTokens = getDailyTokenData(records);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">일별 비용 (최근 30일)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {dailyCost.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyCost}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis fontSize={12} tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    formatter={(value) => [`$${Number(value).toFixed(4)}`, "비용"]}
                    labelFormatter={(label) => `${label}`}
                  />
                  <Bar dataKey="cost" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                데이터가 없습니다
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">모델별 사용량</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            {modelDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={modelDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) =>
                      `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`
                    }
                    labelLine={false}
                  >
                    {modelDistribution.map((_, index) => (
                      <Cell
                        key={index}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip
                    formatter={(value) => [
                      `$${Number(value).toFixed(4)}`,
                      "비용",
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                데이터가 없습니다
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">일별 토큰 사용량</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            {dailyTokens.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyTokens}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis
                    fontSize={12}
                    tickFormatter={(v) =>
                      v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v
                    }
                  />
                  <Tooltip
                    formatter={(value, name) => [
                      Number(value).toLocaleString(),
                      name === "input" ? "입력" : "출력",
                    ]}
                  />
                  <Bar
                    dataKey="input"
                    stackId="a"
                    fill="#4f46e5"
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    dataKey="output"
                    stackId="a"
                    fill="#06b6d4"
                    radius={[4, 4, 0, 0]}
                  />
                  <Legend
                    formatter={(value) =>
                      value === "input" ? "입력 토큰" : "출력 토큰"
                    }
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                데이터가 없습니다
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function getDailyCostData(records: CcUsage[]) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const filtered = records.filter((r) => new Date(r.used_at) >= thirtyDaysAgo);
  const grouped: Record<string, number> = {};

  for (const r of filtered) {
    const date = new Date(r.used_at).toLocaleDateString("ko-KR", {
      month: "short",
      day: "numeric",
    });
    grouped[date] = (grouped[date] || 0) + Number(r.cost_usd);
  }

  return Object.entries(grouped).map(([date, cost]) => ({ date, cost }));
}

function getModelDistribution(records: CcUsage[]) {
  const grouped: Record<string, number> = {};
  for (const r of records) {
    const model = r.model.replace("claude-", "").replace(/-\d{8}$/, "");
    grouped[model] = (grouped[model] || 0) + Number(r.cost_usd);
  }
  return Object.entries(grouped).map(([name, value]) => ({ name, value }));
}

function getDailyTokenData(records: CcUsage[]) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const filtered = records.filter((r) => new Date(r.used_at) >= thirtyDaysAgo);
  const grouped: Record<string, { input: number; output: number }> = {};

  for (const r of filtered) {
    const date = new Date(r.used_at).toLocaleDateString("ko-KR", {
      month: "short",
      day: "numeric",
    });
    if (!grouped[date]) grouped[date] = { input: 0, output: 0 };
    grouped[date].input += r.input_tokens;
    grouped[date].output += r.output_tokens;
  }

  return Object.entries(grouped).map(([date, tokens]) => ({
    date,
    ...tokens,
  }));
}
