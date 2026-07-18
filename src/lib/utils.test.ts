import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  toMonthlyCost,
  formatCurrency,
  daysUntil,
  formatDate,
  parseDateOnly,
} from "./utils";

describe("toMonthlyCost", () => {
  it("월간 요금은 그대로 반환한다", () => {
    expect(toMonthlyCost(10000, "monthly")).toBe(10000);
  });

  it("연간 요금은 12로 나눈다", () => {
    expect(toMonthlyCost(120000, "yearly")).toBe(10000);
  });

  it("주간 요금은 4.33을 곱한다", () => {
    expect(toMonthlyCost(1000, "weekly")).toBeCloseTo(4330);
  });
});

describe("formatCurrency", () => {
  it("KRW는 소수점 없이 천단위 구분한다", () => {
    const result = formatCurrency(1000000, "KRW");
    expect(result).toContain("1,000,000");
    expect(result).not.toContain(".");
  });

  it("통화를 지정하지 않으면 KRW 기본값을 사용한다", () => {
    expect(formatCurrency(5000)).toContain("5,000");
  });

  it("USD는 소수점 둘째 자리까지 표시한다", () => {
    expect(formatCurrency(9.9, "USD")).toContain("9.90");
  });
});

describe("parseDateOnly", () => {
  it("YYYY-MM-DD를 로컬 자정 기준의 날짜 부분으로 해석한다", () => {
    const d = parseDateOnly("2026-03-01");
    // 시간대와 무관하게 로컬 3월 1일이어야 한다 (UTC 파싱이면 음수 오프셋에서 2월로 밀림)
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(2); // 0-indexed = 3월
    expect(d.getDate()).toBe(1);
    expect(d.getHours()).toBe(0);
  });

  it("시간이 포함된 문자열도 날짜 부분만 사용한다", () => {
    const d = parseDateOnly("2026-12-25T09:30:00Z");
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(11);
    expect(d.getDate()).toBe(25);
  });
});

describe("daysUntil / formatDate", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T09:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("미래 날짜까지 남은 일수를 계산한다", () => {
    expect(daysUntil("2026-01-10")).toBe(9);
  });

  it("오늘이면 0을 반환한다", () => {
    expect(daysUntil("2026-01-01")).toBe(0);
  });

  it("지난 날짜는 음수를 반환한다", () => {
    expect(daysUntil("2025-12-30")).toBeLessThan(0);
  });

  it("formatDate는 한국어 날짜 형식으로 변환한다", () => {
    const result = formatDate("2026-01-01");
    expect(result).toContain("2026");
    expect(result).toContain("1");
  });
});
