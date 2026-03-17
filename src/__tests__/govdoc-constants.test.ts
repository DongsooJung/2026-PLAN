import { describe, it, expect } from "vitest";
import { GOVDOC_STYLES, KOREAN_CONSONANTS, NUMBERING_FORMATS, METADATA_LABELS } from "@/lib/converter/govdoc-constants";

describe("GOVDOC_STYLES", () => {
  it("has body and heading fonts defined", () => {
    expect(GOVDOC_STYLES.fonts.body).toBeTruthy();
    expect(GOVDOC_STYLES.fonts.heading).toBeTruthy();
  });

  it("has all required size keys", () => {
    const { sizes } = GOVDOC_STYLES;
    expect(sizes.title).toBeGreaterThan(0);
    expect(sizes.subtitle1).toBeGreaterThan(0);
    expect(sizes.subtitle2).toBeGreaterThan(0);
    expect(sizes.body).toBeGreaterThan(0);
    expect(sizes.footer).toBeGreaterThan(0);
  });

  it("title size is larger than body size", () => {
    expect(GOVDOC_STYLES.sizes.title).toBeGreaterThan(GOVDOC_STYLES.sizes.body);
  });

  it("has valid margins in mm", () => {
    const { margins } = GOVDOC_STYLES;
    expect(margins.top).toBeGreaterThan(0);
    expect(margins.bottom).toBeGreaterThan(0);
    expect(margins.left).toBeGreaterThan(0);
    expect(margins.right).toBeGreaterThan(0);
  });

  it("page size is A4 (210x297mm)", () => {
    expect(GOVDOC_STYLES.pageSize.width).toBe(210);
    expect(GOVDOC_STYLES.pageSize.height).toBe(297);
  });
});

describe("KOREAN_CONSONANTS", () => {
  it("has 14 consonants", () => {
    expect(KOREAN_CONSONANTS).toHaveLength(14);
  });

  it("starts with 가 and ends with 하", () => {
    expect(KOREAN_CONSONANTS[0]).toBe("가");
    expect(KOREAN_CONSONANTS[13]).toBe("하");
  });
});

describe("NUMBERING_FORMATS", () => {
  it("level 1 produces arabic with dot", () => {
    expect(NUMBERING_FORMATS[1](1)).toBe("1.");
    expect(NUMBERING_FORMATS[1](3)).toBe("3.");
  });

  it("level 2 produces korean consonant with dot", () => {
    expect(NUMBERING_FORMATS[2](1)).toBe("가.");
    expect(NUMBERING_FORMATS[2](2)).toBe("나.");
  });

  it("level 3 produces arabic with paren", () => {
    expect(NUMBERING_FORMATS[3](1)).toBe("1)");
  });

  it("level 4 produces korean consonant with paren", () => {
    expect(NUMBERING_FORMATS[4](1)).toBe("가)");
  });

  it("level 5 produces arabic in parens", () => {
    expect(NUMBERING_FORMATS[5](1)).toBe("(1)");
  });

  it("level 6 produces korean consonant in parens", () => {
    expect(NUMBERING_FORMATS[6](1)).toBe("(가)");
  });

  it("falls back to number when index exceeds consonants", () => {
    expect(NUMBERING_FORMATS[2](15)).toBe("15.");
  });
});

describe("METADATA_LABELS", () => {
  it("has all required metadata field labels", () => {
    const requiredKeys = [
      "recipient", "reference", "drafter", "reviewer",
      "approver", "documentNumber", "enforcementDate",
      "department", "contactInfo",
    ];
    for (const key of requiredKeys) {
      expect(METADATA_LABELS[key]).toBeTruthy();
    }
  });

  it("labels are in Korean", () => {
    expect(METADATA_LABELS.recipient).toBe("수신");
    expect(METADATA_LABELS.drafter).toBe("기안자");
  });
});
