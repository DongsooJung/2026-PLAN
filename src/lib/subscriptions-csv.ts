import { BILLING_CYCLES, STATUS_OPTIONS } from "@/lib/constants";
import type { Subscription } from "@/lib/types";

const CSV_HEADERS = [
  "서비스명",
  "플랜명",
  "비용",
  "통화",
  "결제 주기",
  "다음 결제일",
  "카테고리",
  "상태",
  "메모",
] as const;

function escapeCsvCell(value: string | number | null): string {
  const text = value === null ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

export function subscriptionsToCsv(subscriptions: Subscription[]): string {
  const rows = subscriptions.map((subscription) => {
    const billingCycle = BILLING_CYCLES.find(
      (cycle) => cycle.value === subscription.billing_cycle
    )?.label;
    const status = STATUS_OPTIONS.find(
      (option) => option.value === subscription.status
    )?.label;

    return [
      subscription.service_name,
      subscription.plan_name,
      Number(subscription.cost),
      subscription.currency,
      billingCycle ?? subscription.billing_cycle,
      subscription.next_billing_date ?? "미등록",
      subscription.category,
      status ?? subscription.status,
      subscription.memo,
    ]
      .map(escapeCsvCell)
      .join(",");
  });

  return `\uFEFF${[
    CSV_HEADERS.map(escapeCsvCell).join(","),
    ...rows,
  ].join("\r\n")}`;
}
