export const GOVDOC_STYLES = {
  fonts: {
    body: "HamChoRomBatang",
    bodyFallback: "Batang, serif",
    heading: "HamChoRomDotum",
    headingFallback: "Dotum, sans-serif",
  },
  sizes: {
    title: 16,
    subtitle1: 14,
    subtitle2: 13,
    body: 12,
    footer: 10,
  },
  margins: {
    top: 15,
    bottom: 15,
    left: 20,
    right: 15,
  },
  lineSpacing: 160,
  pageSize: {
    width: 210,
    height: 297,
  },
} as const;

export const KOREAN_CONSONANTS = [
  "가", "나", "다", "라", "마", "바", "사", "아", "자", "차", "카", "타", "파", "하",
] as const;

export const NUMBERING_FORMATS = {
  1: (n: number) => `${n}.`,
  2: (n: number) => `${KOREAN_CONSONANTS[n - 1] ?? n}.`,
  3: (n: number) => `${n})`,
  4: (n: number) => `${KOREAN_CONSONANTS[n - 1] ?? n})`,
  5: (n: number) => `(${n})`,
  6: (n: number) => `(${KOREAN_CONSONANTS[n - 1] ?? n})`,
} as const;

export const METADATA_LABELS: Record<string, string> = {
  recipient: "수신",
  reference: "참조",
  drafter: "기안자",
  reviewer: "검토자",
  approver: "결재권자",
  documentNumber: "문서번호",
  enforcementDate: "시행일자",
  department: "부서명",
  contactInfo: "연락처",
};
