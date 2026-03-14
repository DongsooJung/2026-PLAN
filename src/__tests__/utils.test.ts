import { describe, it, expect } from "vitest";
import { toMonthlyCost, formatCurrency, daysUntil, cn } from "@/lib/utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("px-2", "py-1")).toBe("px-2 py-1");
  });

  it("resolves tailwind conflicts", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible");
  });
});

describe("toMonthlyCost", () => {
  it("returns same cost for monthly", () => {
    expect(toMonthlyCost(10000, "monthly")).toBe(10000);
  });

  it("divides yearly cost by 12", () => {
    expect(toMonthlyCost(12000, "yearly")).toBe(1000);
  });

  it("multiplies weekly cost by 4.33", () => {
    expect(toMonthlyCost(1000, "weekly")).toBeCloseTo(4330);
  });
});

describe("formatCurrency", () => {
  it("formats KRW without decimals", () => {
    const result = formatCurrency(15000, "KRW");
    expect(result).toContain("15,000");
  });

  it("formats USD with decimals", () => {
    const result = formatCurrency(9.99, "USD");
    expect(result).toContain("9.99");
  });

  it("defaults to KRW", () => {
    const result = formatCurrency(5000);
    expect(result).toContain("5,000");
  });
});

describe("daysUntil", () => {
  it("returns 0 for today", () => {
    const today = new Date().toISOString().split("T")[0];
    expect(daysUntil(today)).toBe(0);
  });

  it("returns positive for future dates", () => {
    const future = new Date();
    future.setDate(future.getDate() + 5);
    expect(daysUntil(future.toISOString().split("T")[0])).toBe(5);
  });

  it("returns negative for past dates", () => {
    const past = new Date();
    past.setDate(past.getDate() - 3);
    expect(daysUntil(past.toISOString().split("T")[0])).toBe(-3);
  });
});
