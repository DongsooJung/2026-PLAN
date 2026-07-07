import type { Subscription } from "./types";
import { BILLING_CYCLES, STATUS_OPTIONS } from "./constants";
import { toMonthlyCost, downloadBlob } from "./utils";

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function labelOf(
  options: readonly { value: string; label: string }[],
  value: string
): string {
  return options.find((o) => o.value === value)?.label ?? value;
}

export function exportSubscriptionsCsv(subscriptions: Subscription[]) {
  const header = [
    "서비스명",
    "플랜",
    "금액",
    "통화",
    "결제주기",
    "월 환산 비용",
    "다음 결제일",
    "카테고리",
    "상태",
    "메모",
  ];

  const rows = subscriptions.map((s) => [
    s.service_name,
    s.plan_name ?? "",
    String(s.cost),
    s.currency,
    labelOf(BILLING_CYCLES, s.billing_cycle),
    toMonthlyCost(Number(s.cost), s.billing_cycle).toFixed(0),
    s.next_billing_date,
    s.category,
    labelOf(STATUS_OPTIONS, s.status),
    s.memo ?? "",
  ]);

  const csv = [header, ...rows]
    .map((row) => row.map(csvEscape).join(","))
    .join("\r\n");

  // BOM을 붙여야 Excel에서 한글이 깨지지 않는다
  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;",
  });

  const today = new Date().toISOString().slice(0, 10);
  downloadBlob(blob, `subscriptions-${today}.csv`);
}
