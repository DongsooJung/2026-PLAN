import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { RotatingDashboard } from "./rotating-dashboard";
import type { Subscription } from "@/lib/types";

const SUBS: Subscription[] = [
  {
    id: "a",
    user_id: "u",
    service_name: "Netflix",
    plan_name: null,
    cost: 17000,
    currency: "KRW",
    billing_cycle: "monthly",
    next_billing_date: "2026-08-15",
    category: "엔터테인먼트",
    icon_url: null,
    status: "active",
    memo: null,
    created_at: "2026-01-01",
    updated_at: "2026-01-01",
  },
];

describe("RotatingDashboard 접근성", () => {
  it("회전식 대시보드 region 롤과 진행바 롤을 렌더링한다", () => {
    const html = renderToStaticMarkup(
      <RotatingDashboard subscriptions={SUBS} />
    );
    expect(html).toContain('role="region"');
    expect(html).toContain('aria-roledescription="회전식 대시보드"');
    expect(html).toContain('role="progressbar"');
    expect(html).toContain('aria-roledescription="슬라이드"');
  });

  it("첫 슬라이드 제목과 위치를 aria-label로 노출한다", () => {
    const html = renderToStaticMarkup(
      <RotatingDashboard subscriptions={SUBS} />
    );
    expect(html).toContain("전체 요약 (1/4)");
  });

  it("데이터가 없어도 오류 없이 렌더링된다", () => {
    expect(() =>
      renderToStaticMarkup(<RotatingDashboard subscriptions={[]} />)
    ).not.toThrow();
  });
});
