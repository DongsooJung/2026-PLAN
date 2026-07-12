"use client";

export interface ColumnDatum {
  label: string;
  value: number;
  highlight?: boolean;
}

interface ColumnChartProps {
  data: ColumnDatum[];
  format?: (value: number) => string;
}

/** 월별 추이용 세로 막대 — 데이터 끝을 4px 라운드, 베이스라인 고정 */
export function ColumnChart({
  data,
  format = (v) => v.toLocaleString("ko-KR"),
}: ColumnChartProps) {
  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <div className="flex h-full w-full items-end justify-between gap-2">
      {data.map((d) => {
        const pct = d.value > 0 ? Math.max(3, (d.value / max) * 100) : 0;
        return (
          <div
            key={d.label}
            className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
          >
            <span className="text-xs font-semibold tabular-nums text-foreground">
              {d.value > 0 ? format(d.value) : ""}
            </span>
            <div className="flex h-full w-full items-end justify-center">
              <div
                className="w-full max-w-[44px] rounded-t-[4px] transition-[height] duration-700 ease-out"
                style={{
                  height: `${pct}%`,
                  backgroundColor: d.highlight
                    ? "var(--chart-1)"
                    : "var(--chart-5)",
                }}
                title={`${d.label}: ${format(d.value)}`}
              />
            </div>
            <span className="text-xs text-muted-foreground">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}
