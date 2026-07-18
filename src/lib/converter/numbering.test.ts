import { describe, it, expect } from "vitest";
import { formatNumber, getIndent, detectNumberingLevel } from "./numbering";

describe("formatNumber", () => {
  it("레벨 1은 아라비아 숫자 + 마침표", () => {
    expect(formatNumber(1, 0)).toBe("1.");
    expect(formatNumber(1, 4)).toBe("5.");
  });

  it("레벨 2는 한글 자음 + 마침표", () => {
    expect(formatNumber(2, 0)).toBe("가.");
    expect(formatNumber(2, 1)).toBe("나.");
  });

  it("레벨 3은 아라비아 숫자 + 닫는 괄호", () => {
    expect(formatNumber(3, 0)).toBe("1)");
  });

  it("레벨 4는 한글 자음 + 닫는 괄호", () => {
    expect(formatNumber(4, 2)).toBe("다)");
  });

  it("레벨 5는 괄호로 감싼 숫자", () => {
    expect(formatNumber(5, 0)).toBe("(1)");
  });

  it("레벨 6은 괄호로 감싼 한글 자음", () => {
    expect(formatNumber(6, 0)).toBe("(가)");
  });

  it("한글 자음이 부족하면 숫자로 대체한다", () => {
    // KOREAN_CONSONANTS는 14개(가~하)까지만 존재
    expect(formatNumber(2, 14)).toBe("15.");
  });
});

describe("getIndent", () => {
  it("레벨이 깊어질수록 들여쓰기가 2칸씩 늘어난다", () => {
    expect(getIndent(1)).toBe("");
    expect(getIndent(2)).toBe("  ");
    expect(getIndent(3)).toBe("    ");
  });
});

describe("detectNumberingLevel", () => {
  it("1~6 범위 안의 depth는 그대로 반환한다", () => {
    expect(detectNumberingLevel(1)).toBe(1);
    expect(detectNumberingLevel(4)).toBe(4);
    expect(detectNumberingLevel(6)).toBe(6);
  });

  it("범위를 벗어나면 1~6으로 클램프한다", () => {
    expect(detectNumberingLevel(0)).toBe(1);
    expect(detectNumberingLevel(-3)).toBe(1);
    expect(detectNumberingLevel(9)).toBe(6);
  });
});
