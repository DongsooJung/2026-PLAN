"use client";

export interface DonutDatum {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutDatum[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerSub?: string;
}

const TAU = Math.PI * 2;

function polar(cx: number, cy: number, r: number, angle: number) {
  return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)] as const;
}

/** 도넛 세그먼트 arc path (시계방향, 12시 시작) */
function arcPath(
  cx: number,
  cy: number,
  rOuter: number,
  rInner: number,
  start: number,
  end: number
): string {
  const a0 = start - Math.PI / 2;
  const a1 = end - Math.PI / 2;
  const large = end - start > Math.PI ? 1 : 0;
  const [ox0, oy0] = polar(cx, cy, rOuter, a0);
  const [ox1, oy1] = polar(cx, cy, rOuter, a1);
  const [ix1, iy1] = polar(cx, cy, rInner, a1);
  const [ix0, iy0] = polar(cx, cy, rInner, a0);
  return [
    `M ${ox0} ${oy0}`,
    `A ${rOuter} ${rOuter} 0 ${large} 1 ${ox1} ${oy1}`,
    `L ${ix1} ${iy1}`,
    `A ${rInner} ${rInner} 0 ${large} 0 ${ix0} ${iy0}`,
    "Z",
  ].join(" ");
}

export function DonutChart({
  data,
  size = 240,
  thickness = 34,
  centerLabel,
  centerSub,
}: DonutChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const cx = size / 2;
  const cy = size / 2;
  const rOuter = size / 2;
  const rInner = rOuter - thickness;
  const gap = total > 0 ? 0.03 : 0; // 세그먼트 간 간격(라디안)

  let cursor = 0;
  const segments = data
    .filter((d) => d.value > 0)
    .map((d) => {
      const frac = total > 0 ? d.value / total : 0;
      const start = cursor + gap / 2;
      const end = cursor + frac * TAU - gap / 2;
      cursor += frac * TAU;
      return { ...d, path: arcPath(cx, cy, rOuter, rInner, start, Math.max(end, start)) };
    });

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="h-full w-full"
      role="img"
      aria-label={`${centerLabel ?? "합계"} ${centerSub ?? ""}`}
    >
      {total === 0 ? (
        <circle
          cx={cx}
          cy={cy}
          r={rOuter - thickness / 2}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={thickness}
        />
      ) : (
        segments.map((s) => (
          <path key={s.label} d={s.path} fill={s.color}>
            <title>{`${s.label}: ${s.value.toLocaleString("ko-KR")}`}</title>
          </path>
        ))
      )}
      {centerLabel && (
        <text
          x={cx}
          y={cy - 2}
          textAnchor="middle"
          className="fill-[var(--foreground)]"
          style={{ fontSize: size * 0.13, fontWeight: 700 }}
        >
          {centerLabel}
        </text>
      )}
      {centerSub && (
        <text
          x={cx}
          y={cy + size * 0.11}
          textAnchor="middle"
          className="fill-[var(--muted-foreground)]"
          style={{ fontSize: size * 0.06 }}
        >
          {centerSub}
        </text>
      )}
    </svg>
  );
}
