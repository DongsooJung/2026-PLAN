import { describe, it, expect } from "vitest";
import { parseMdToGovDoc } from "./md-parser";
import { DEFAULT_METADATA } from "./govdoc-types";

describe("parseMdToGovDoc", () => {
  it("제목(#/##/###)을 title/subtitle 노드로 변환한다", () => {
    const doc = parseMdToGovDoc("# 대제목\n\n## 중제목\n\n### 소제목");
    expect(doc.nodes[0]).toMatchObject({ type: "title", content: "대제목" });
    expect(doc.nodes[1]).toMatchObject({ type: "subtitle1", content: "중제목" });
    expect(doc.nodes[2]).toMatchObject({ type: "subtitle2", content: "소제목" });
  });

  it("문단을 body 노드로 변환한다", () => {
    const doc = parseMdToGovDoc("이것은 본문입니다.");
    expect(doc.nodes[0]).toMatchObject({ type: "body", content: "이것은 본문입니다." });
  });

  it("리스트를 레벨/인덱스가 있는 numbered 노드로 변환한다", () => {
    const doc = parseMdToGovDoc("- 첫째\n- 둘째");
    const numbered = doc.nodes.filter((n) => n.type === "numbered");
    expect(numbered).toHaveLength(2);
    expect(numbered[0]).toMatchObject({ level: 1, index: 0, content: "첫째" });
    expect(numbered[1]).toMatchObject({ level: 1, index: 1, content: "둘째" });
  });

  it("중첩 리스트는 하위 레벨로 변환한다", () => {
    const doc = parseMdToGovDoc("- 상위\n  - 하위");
    const numbered = doc.nodes.filter((n) => n.type === "numbered");
    expect(numbered[0]).toMatchObject({ level: 1, content: "상위" });
    expect(numbered[1]).toMatchObject({ level: 2, index: 0, content: "하위" });
  });

  it("표(table)를 rows 배열이 있는 table 노드로 변환한다", () => {
    const md = "| A | B |\n| --- | --- |\n| 1 | 2 |";
    const doc = parseMdToGovDoc(md);
    const table = doc.nodes.find((n) => n.type === "table");
    expect(table).toBeDefined();
    expect(table?.rows).toEqual([
      ["A", "B"],
      ["1", "2"],
    ]);
  });

  it("수평선(---)을 종결 표시 노드로 변환한다", () => {
    const doc = parseMdToGovDoc("본문\n\n---");
    const end = doc.nodes.find((n) => n.type === "end-marker");
    expect(end).toMatchObject({ type: "end-marker", content: "끝." });
  });

  it("메타데이터를 지정하지 않으면 기본값을 사용한다", () => {
    const doc = parseMdToGovDoc("# 제목");
    expect(doc.metadata).toBe(DEFAULT_METADATA);
  });

  it("전달한 메타데이터를 그대로 보존한다", () => {
    const meta = { ...DEFAULT_METADATA, drafter: "정동수" };
    const doc = parseMdToGovDoc("# 제목", meta);
    expect(doc.metadata.drafter).toBe("정동수");
  });
});
