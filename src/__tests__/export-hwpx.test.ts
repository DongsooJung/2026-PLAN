import { describe, it, expect } from "vitest";
import { exportToHwpx } from "@/lib/converter/export-hwpx";
import JSZip from "jszip";
import type { GovDocument } from "@/lib/converter/govdoc-types";
import { DEFAULT_METADATA } from "@/lib/converter/govdoc-types";

function makeDoc(overrides: Partial<GovDocument> = {}): GovDocument {
  return {
    metadata: { ...DEFAULT_METADATA },
    nodes: [{ type: "title", content: "테스트 문서" }],
    ...overrides,
  };
}

describe("exportToHwpx", () => {
  it("produces a valid ZIP blob", async () => {
    const blob = await exportToHwpx(makeDoc());
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBeGreaterThan(0);
  });

  it("contains required HWPX structure files", async () => {
    const blob = await exportToHwpx(makeDoc());
    const arrayBuffer = await blob.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);

    expect(zip.file("mimetype")).not.toBeNull();
    expect(zip.file("META-INF/container.xml")).not.toBeNull();
    expect(zip.file("Contents/content.hpf")).not.toBeNull();
    expect(zip.file("Contents/section0.xml")).not.toBeNull();
  });

  it("mimetype is 'application/hwp+zip'", async () => {
    const blob = await exportToHwpx(makeDoc());
    const zip = await JSZip.loadAsync(await blob.arrayBuffer());
    const mimetype = await zip.file("mimetype")!.async("string");
    expect(mimetype).toBe("application/hwp+zip");
  });

  it("content.hpf contains the document title", async () => {
    const blob = await exportToHwpx(makeDoc());
    const zip = await JSZip.loadAsync(await blob.arrayBuffer());
    const hpf = await zip.file("Contents/content.hpf")!.async("string");
    expect(hpf).toContain("테스트 문서");
  });

  it("section0.xml contains title node content", async () => {
    const blob = await exportToHwpx(makeDoc());
    const zip = await JSZip.loadAsync(await blob.arrayBuffer());
    const section = await zip.file("Contents/section0.xml")!.async("string");
    expect(section).toContain("테스트 문서");
    expect(section).toContain("CENTER");
  });

  it("escapes XML special characters", async () => {
    const doc = makeDoc({
      nodes: [{ type: "body", content: '<script>alert("xss")&</script>' }],
    });
    const blob = await exportToHwpx(doc);
    const zip = await JSZip.loadAsync(await blob.arrayBuffer());
    const section = await zip.file("Contents/section0.xml")!.async("string");
    expect(section).toContain("&lt;script&gt;");
    expect(section).toContain("&amp;");
    expect(section).not.toContain('<script>');
  });

  it("includes metadata fields in section XML", async () => {
    const doc = makeDoc({
      metadata: {
        ...DEFAULT_METADATA,
        recipient: "국무총리",
        drafter: "홍길동",
      },
    });
    const blob = await exportToHwpx(doc);
    const zip = await JSZip.loadAsync(await blob.arrayBuffer());
    const section = await zip.file("Contents/section0.xml")!.async("string");
    expect(section).toContain("국무총리");
    expect(section).toContain("홍길동");
  });

  it("handles table nodes", async () => {
    const doc = makeDoc({
      nodes: [
        {
          type: "table",
          content: "",
          rows: [
            ["헤더1", "헤더2"],
            ["값1", "값2"],
          ],
        },
      ],
    });
    const blob = await exportToHwpx(doc);
    const zip = await JSZip.loadAsync(await blob.arrayBuffer());
    const section = await zip.file("Contents/section0.xml")!.async("string");
    expect(section).toContain("hp:tbl");
    expect(section).toContain("헤더1");
    expect(section).toContain("값2");
  });

  it("handles empty table rows gracefully", async () => {
    const doc = makeDoc({
      nodes: [{ type: "table", content: "", rows: [] }],
    });
    const blob = await exportToHwpx(doc);
    const zip = await JSZip.loadAsync(await blob.arrayBuffer());
    const section = await zip.file("Contents/section0.xml")!.async("string");
    expect(section).not.toContain("hp:tbl");
  });

  it("renders end-marker with RIGHT alignment", async () => {
    const doc = makeDoc({
      nodes: [{ type: "end-marker", content: "끝." }],
    });
    const blob = await exportToHwpx(doc);
    const zip = await JSZip.loadAsync(await blob.arrayBuffer());
    const section = await zip.file("Contents/section0.xml")!.async("string");
    expect(section).toContain("RIGHT");
    expect(section).toContain("끝.");
  });

  it("renders numbered items with correct prefix", async () => {
    const doc = makeDoc({
      nodes: [{ type: "numbered", content: "항목 내용", level: 1, index: 0 }],
    });
    const blob = await exportToHwpx(doc);
    const zip = await JSZip.loadAsync(await blob.arrayBuffer());
    const section = await zip.file("Contents/section0.xml")!.async("string");
    expect(section).toContain("1.");
    expect(section).toContain("항목 내용");
  });

  it("uses fallback title when no title node exists", async () => {
    const doc = makeDoc({
      nodes: [{ type: "body", content: "본문만 있는 문서" }],
    });
    const blob = await exportToHwpx(doc);
    const zip = await JSZip.loadAsync(await blob.arrayBuffer());
    const hpf = await zip.file("Contents/content.hpf")!.async("string");
    expect(hpf).toContain("문서");
  });
});
