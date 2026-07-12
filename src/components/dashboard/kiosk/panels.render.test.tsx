import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { PANELS } from "./panels";
import type { Subscription } from "@/lib/types";

function sub(o: Partial<Subscription>): Subscription {
  return {
    id: o.id ?? "id",
    user_id: "u",
    service_name: o.service_name ?? "Service",
    plan_name: null,
    cost: o.cost ?? 10000,
    currency: "KRW",
    billing_cycle: o.billing_cycle ?? "monthly",
    next_billing_date: o.next_billing_date ?? "2026-08-15",
    category: o.category ?? "기타",
    icon_url: null,
    status: o.status ?? "active",
    memo: null,
    created_at: "2026-01-01",
    updated_at: "2026-01-01",
    ...o,
  };
}

const SUBS: Subscription[] = [
  sub({ id: "a", service_name: "Netflix", category: "엔터테인먼트", cost: 17000 }),
  sub({ id: "b", service_name: "Spotify", category: "음악", cost: 10900 }),
  sub({ id: "c", service_name: "ChatGPT Plus", category: "생산성", cost: 29000 }),
];

describe("대시보드 패널 렌더링 스모크 테스트", () => {
  it("4개의 패널이 정의되어 있다", () => {
    expect(PANELS.map((p) => p.id)).toEqual([
      "overview",
      "category",
      "top-spend",
      "upcoming",
    ]);
  });

  it("모든 패널이 데이터와 함께 오류 없이 렌더링된다", () => {
    for (const panel of PANELS) {
      const html = renderToStaticMarkup(<>{panel.render(SUBS)}</>);
      expect(html.length).toBeGreaterThan(0);
    }
  });

  it("모든 패널이 빈 데이터에서도 안전하게 렌더링된다", () => {
    for (const panel of PANELS) {
      expect(() => renderToStaticMarkup(<>{panel.render([])}</>)).not.toThrow();
    }
  });

  it("전체 요약 패널은 월간 총 지출과 활성 구독 수를 표시한다", () => {
    const html = renderToStaticMarkup(<>{PANELS[0].render(SUBS)}</>);
    expect(html).toContain("월간 총 지출");
    expect(html).toContain("3개"); // 활성 구독 3개
  });

  it("지출 상위 패널은 가장 비싼 구독을 최상단 막대로 표시한다", () => {
    const html = renderToStaticMarkup(<>{PANELS[2].render(SUBS)}</>);
    expect(html).toContain("ChatGPT Plus"); // 월 29,000원으로 최상위
    expect(html).toContain("Netflix");
  });

  it("카테고리 패널은 도넛 세그먼트(path)를 렌더링한다", () => {
    const html = renderToStaticMarkup(<>{PANELS[1].render(SUBS)}</>);
    expect(html).toContain("<path");
    expect(html).toContain("var(--chart-");
  });
});
