import { KOREAN_CONSONANTS } from "./govdoc-constants";
import type { NumberingLevel } from "./govdoc-types";

export function formatNumber(level: NumberingLevel, index: number): string {
  const n = index + 1;
  switch (level) {
    case 1:
      return `${n}.`;
    case 2:
      return `${KOREAN_CONSONANTS[index] ?? n}.`;
    case 3:
      return `${n})`;
    case 4:
      return `${KOREAN_CONSONANTS[index] ?? n})`;
    case 5:
      return `(${n})`;
    case 6:
      return `(${KOREAN_CONSONANTS[index] ?? n})`;
    default:
      return `${n}.`;
  }
}

export function getIndent(level: NumberingLevel): string {
  const spaces = (level - 1) * 2;
  return " ".repeat(spaces);
}

export function detectNumberingLevel(depth: number): NumberingLevel {
  const clamped = Math.min(Math.max(depth, 1), 6);
  return clamped as NumberingLevel;
}
