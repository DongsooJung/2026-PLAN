import { describe, it, expect } from "vitest";
import {
  formatNumber,
  getIndent,
  detectNumberingLevel,
} from "@/lib/converter/numbering";

describe("formatNumber", () => {
  it("level 1: arabic with dot", () => {
    expect(formatNumber(1, 0)).toBe("1.");
    expect(formatNumber(1, 2)).toBe("3.");
  });

  it("level 2: korean consonant with dot", () => {
    expect(formatNumber(2, 0)).toBe("가.");
    expect(formatNumber(2, 1)).toBe("나.");
  });

  it("level 3: arabic with paren", () => {
    expect(formatNumber(3, 0)).toBe("1)");
    expect(formatNumber(3, 4)).toBe("5)");
  });

  it("level 4: korean consonant with paren", () => {
    expect(formatNumber(4, 0)).toBe("가)");
    expect(formatNumber(4, 2)).toBe("다)");
  });

  it("level 5: arabic in parens", () => {
    expect(formatNumber(5, 0)).toBe("(1)");
  });

  it("level 6: korean consonant in parens", () => {
    expect(formatNumber(6, 0)).toBe("(가)");
  });

  it("falls back to number when index exceeds korean consonants", () => {
    expect(formatNumber(2, 20)).toBe("21.");
  });
});

describe("getIndent", () => {
  it("level 1 has no indent", () => {
    expect(getIndent(1)).toBe("");
  });

  it("level 2 has 2 spaces", () => {
    expect(getIndent(2)).toBe("  ");
  });

  it("level 4 has 6 spaces", () => {
    expect(getIndent(4)).toBe("      ");
  });
});

describe("detectNumberingLevel", () => {
  it("returns depth as level for valid range", () => {
    expect(detectNumberingLevel(1)).toBe(1);
    expect(detectNumberingLevel(3)).toBe(3);
    expect(detectNumberingLevel(6)).toBe(6);
  });

  it("clamps to 1 for depth < 1", () => {
    expect(detectNumberingLevel(0)).toBe(1);
    expect(detectNumberingLevel(-1)).toBe(1);
  });

  it("clamps to 6 for depth > 6", () => {
    expect(detectNumberingLevel(7)).toBe(6);
    expect(detectNumberingLevel(100)).toBe(6);
  });
});
