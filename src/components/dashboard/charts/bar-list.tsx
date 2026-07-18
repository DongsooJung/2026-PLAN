"use client";

export interface BarDatum {
  label: string;
  value: number;
  color: string;
  sublabel?: string;
  prefix?: string; // 이모지 등
}

interface BarListProps {
  data: BarDatum[];
  format?: (value: number) => string;
  emptyText?: string;
}

/** 가로 막대 리스트 — 값 내림차순 가정, 각 막대에 직접 라벨 표기(relief 규칙 충족) */
export function BarList({
  data,
  format = (v) => v.toLocaleString("ko-KR"),
  emptyText = "데이터가 없습니다",
}: BarListProps) {
  const max = Math.max(1, ...data.map((d) => d.value));

  if (data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        {emptyText}
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {data.map((d) => {
        const pct = Math.max(2, (d.value / max) * 100);
        return (
          <li key={d.label} className="flex flex-col gap-1">
            <div className="flex items-baseline justify-between gap-2 text-sm">
              <span className="flex min-w-0 items-center gap-1.5 font-medium">
                {d.prefix && <span aria-hidden>{d.prefix}</span>}
                <span className="truncate">{d.label}</span>
                {d.sublabel && (
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {d.sublabel}
                  </span>
                )}
              </span>
              <span className="shrink-0 font-semibold tabular-nums">
                {format(d.value)}
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]">
              <div
                className="h-full rounded-full transition-[width] duration-700 ease-out"
                style={{ width: `${pct}%`, backgroundColor: d.color }}
                title={`${d.label}: ${format(d.value)}`}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
