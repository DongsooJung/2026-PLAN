import { describe, it, expect } from "vitest";
import { parseMdToGovDoc } from "@/lib/converter/md-parser";

describe("parseMdToGovDoc", () => {
  it("parses heading level 1 as title", () => {
    const doc = parseMdToGovDoc("# 공문서 제목");
    expect(doc.nodes).toHaveLength(1);
    expect(doc.nodes[0].type).toBe("title");
    expect(doc.nodes[0].content).toBe("공문서 제목");
  });

  it("parses heading level 2 as subtitle1", () => {
    const doc = parseMdToGovDoc("## 부제목");
    expect(doc.nodes[0].type).toBe("subtitle1");
  });

  it("parses heading level 3+ as subtitle2", () => {
    const doc = parseMdToGovDoc("### 소제목");
    expect(doc.nodes[0].type).toBe("subtitle2");
  });

  it("parses paragraph as body", () => {
    const doc = parseMdToGovDoc("일반 텍스트 내용입니다.");
    expect(doc.nodes[0].type).toBe("body");
    expect(doc.nodes[0].content).toBe("일반 텍스트 내용입니다.");
  });

  it("parses ordered list as numbered items", () => {
    const md = "1. 첫 번째\n2. 두 번째\n3. 세 번째";
    const doc = parseMdToGovDoc(md);
    const numbered = doc.nodes.filter((n) => n.type === "numbered");
    expect(numbered).toHaveLength(3);
    expect(numbered[0].content).toBe("첫 번째");
    expect(numbered[0].level).toBe(1);
    expect(numbered[0].index).toBe(0);
  });

  it("parses nested lists with increasing levels", () => {
    const md = "1. 상위\n   1. 하위";
    const doc = parseMdToGovDoc(md);
    const numbered = doc.nodes.filter((n) => n.type === "numbered");
    expect(numbered).toHaveLength(2);
    expect(numbered[0].level).toBe(1);
    expect(numbered[1].level).toBe(2);
  });

  it("parses thematic break as end-marker", () => {
    const doc = parseMdToGovDoc("---");
    expect(doc.nodes[0].type).toBe("end-marker");
    expect(doc.nodes[0].content).toBe("끝.");
  });

  it("parses blockquote as metadata-block", () => {
    const doc = parseMdToGovDoc("> 메타 정보");
    expect(doc.nodes[0].type).toBe("metadata-block");
    expect(doc.nodes[0].content).toContain("메타 정보");
  });

  it("parses GFM table", () => {
    const md = "| 항목 | 값 |\n|------|----|\n| A | 1 |\n| B | 2 |";
    const doc = parseMdToGovDoc(md);
    const table = doc.nodes.find((n) => n.type === "table");
    expect(table).toBeDefined();
    expect(table!.rows).toHaveLength(3);
    expect(table!.rows![0]).toEqual(["항목", "값"]);
  });

  it("uses default metadata when none provided", () => {
    const doc = parseMdToGovDoc("# 테스트");
    expect(doc.metadata.recipient).toBe("");
    expect(doc.metadata.department).toBe("");
  });

  it("uses custom metadata when provided", () => {
    const meta = {
      recipient: "교육부장관",
      reference: "",
      drafter: "홍길동",
      reviewer: "",
      approver: "",
      documentNumber: "제2026-001호",
      enforcementDate: "2026-03-14",
      department: "총무과",
      contactInfo: "02-1234-5678",
    };
    const doc = parseMdToGovDoc("# 제목", meta);
    expect(doc.metadata.recipient).toBe("교육부장관");
    expect(doc.metadata.documentNumber).toBe("제2026-001호");
  });

  it("handles complex document with multiple node types", () => {
    const md = `# 업무 협조 요청

## 1. 목적

본 문서는 업무 협조를 요청합니다.

1. 첫째 항목
2. 둘째 항목

---`;
    const doc = parseMdToGovDoc(md);
    const types = doc.nodes.map((n) => n.type);
    expect(types).toContain("title");
    expect(types).toContain("subtitle1");
    expect(types).toContain("body");
    expect(types).toContain("numbered");
    expect(types).toContain("end-marker");
  });
});
