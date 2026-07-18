import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { BillingCycle } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toMonthlyCost(cost: number, cycle: BillingCycle): number {
  switch (cycle) {
    case "yearly":
      return cost / 12;
    case "weekly":
      return cost * 4.33;
    case "monthly":
      return cost;
  }
}

export function formatCurrency(
  amount: number,
  currency: string = "KRW"
): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "KRW" ? 0 : 2,
  }).format(amount);
}

/**
 * "YYYY-MM-DD" 날짜 문자열을 로컬 자정 Date로 파싱한다.
 * new Date("YYYY-MM-DD")는 UTC 자정으로 해석되어 UTC보다 뒤진 시간대에서는
 * 하루 밀릴 수 있으므로, 날짜 부분을 직접 로컬 기준으로 구성한다.
 */
export function parseDateOnly(dateStr: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateStr);
  if (match) {
    const [, y, m, d] = match;
    return new Date(Number(y), Number(m) - 1, Number(d));
  }
  return new Date(dateStr);
}

export function daysUntil(dateStr: string): number {
  const target = parseDateOnly(dateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.ceil(
    (target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(parseDateOnly(dateStr));
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
