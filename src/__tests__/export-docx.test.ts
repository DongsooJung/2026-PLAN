import { describe, it, expect } from "vitest";
import { exportToDocx } from "@/lib/converter/export-docx";
import type { GovDocument } from "@/lib/converter/govdoc-types";
import { DEFAULT_METADATA } from "@/lib/converter/govdoc-types";

function makeDoc(overrides: Partial<GovDocument> = {}): GovDocument {
  return {
    metadata: { ...DEFAULT_METADATA },
    nodes: [{ type: "title", content: "테스트 문서" }],
    ...overrides,
  };
}

describe("exportToDocx", () => {
  it("produces a valid Blob", async () => {
    const blob = await exportToDocx(makeDoc());
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBeGreaterThan(0);
  });

  it("produces a DOCX-compatible blob (ZIP signature)", async () => {
    const blob = await exportToDocx(makeDoc());
    const buffer = await blob.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    // ZIP magic bytes: PK (0x50, 0x4B)
    expect(bytes[0]).toBe(0x50);
    expect(bytes[1]).toBe(0x4b);
  });

  it("handles document with all node types", async () => {
    const doc = makeDoc({
      nodes: [
        { type: "title", content: "제목" },
        { type: "subtitle1", content: "소제목1" },
        { type: "subtitle2", content: "소제목2" },
        { type: "body", content: "본문 내용" },
        { type: "numbered", content: "항목", level: 1, index: 0 },
        { type: "end-marker", content: "끝." },
        { type: "metadata-block", content: "메타데이터" },
        {
          type: "table",
          content: "",
          rows: [
            ["A", "B"],
            ["1", "2"],
          ],
        },
      ],
    });
    const blob = await exportToDocx(doc);
    expect(blob.size).toBeGreaterThan(0);
  });

  it("handles empty nodes array", async () => {
    const doc = makeDoc({ nodes: [] });
    const blob = await exportToDocx(doc);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBeGreaterThan(0);
  });

  it("handles document with metadata", async () => {
    const doc = makeDoc({
      metadata: {
        ...DEFAULT_METADATA,
        recipient: "대통령",
        reference: "참조부서",
        drafter: "기안자",
        reviewer: "검토자",
        approver: "결재자",
        department: "총무과",
        documentNumber: "2026-001",
        enforcementDate: "2026-03-17",
        contactInfo: "02-1234-5678",
      },
    });
    const blob = await exportToDocx(doc);
    expect(blob.size).toBeGreaterThan(0);
  });

  it("handles empty table rows", async () => {
    const doc = makeDoc({
      nodes: [{ type: "table", content: "", rows: [] }],
    });
    const blob = await exportToDocx(doc);
    expect(blob).toBeInstanceOf(Blob);
  });

  it("handles numbered items at various levels", async () => {
    const doc = makeDoc({
      nodes: [
        { type: "numbered", content: "레벨1", level: 1, index: 0 },
        { type: "numbered", content: "레벨2", level: 2, index: 1 },
        { type: "numbered", content: "레벨3", level: 3, index: 2 },
        { type: "numbered", content: "레벨4", level: 4, index: 0 },
        { type: "numbered", content: "레벨5", level: 5, index: 0 },
        { type: "numbered", content: "레벨6", level: 6, index: 0 },
      ],
    });
    const blob = await exportToDocx(doc);
    expect(blob.size).toBeGreaterThan(0);
  });

  it("produces consistent output for same input", async () => {
    const doc = makeDoc();
    const blob1 = await exportToDocx(doc);
    const blob2 = await exportToDocx(doc);
    expect(blob1.size).toBe(blob2.size);
  });
});
