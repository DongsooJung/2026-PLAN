import { parseMdToGovDoc } from "./src/lib/converter/md-parser";
import { formatNumber, getIndent } from "./src/lib/converter/numbering";
import { METADATA_LABELS } from "./src/lib/converter/govdoc-constants";
import type { DocumentMetadata } from "./src/lib/converter/govdoc-types";

const sampleMd = `# 2026년도 정보화사업 추진계획 보고

## 1. 사업 개요

본 사업은 국가 정보화 기본계획에 따라 공공기관의 디지털 전환을 촉진하기 위한 사업입니다.

- 사업기간: 2026. 4. 1. ~ 2026. 12. 31.
- 사업비: 500,000천원
- 주관부서: 정보화전략과

## 2. 추진 배경 및 필요성

최근 공공부문의 디지털 전환 가속화에 따라, 기존 시스템의 현대화가 시급한 상황입니다.

1. 노후 시스템 교체 필요성 증대
   1. 운영 10년 이상 시스템 38건
   2. 보안 취약점 발견 시스템 12건
   3. 성능 저하 시스템 8건
2. 국민 편의성 향상 요구
   1. 모바일 서비스 확대
   2. 24시간 민원처리 체계 구축
3. 법제도 개선사항 반영
   1. 전자정부법 개정 반영
   2. 개인정보보호법 강화 대응

## 3. 세부 추진계획

| 구분 | 세부사업명 | 예산(천원) | 일정 |
|------|-----------|-----------|------|
| 1 | 전자결재 시스템 고도화 | 150,000 | 4월~9월 |
| 2 | 통합민원포털 구축 | 200,000 | 5월~11월 |
| 3 | 데이터 분석 플랫폼 | 100,000 | 6월~12월 |
| 4 | 보안체계 강화 | 50,000 | 4월~12월 |

> 붙임: 세부 추진일정표 1부. 끝.

---
`;

const metadata: DocumentMetadata = {
  recipient: "정보화전략본부장",
  reference: "정보화전략과장",
  drafter: "주무관 김철수",
  reviewer: "사무관 이영희",
  approver: "과장 박민수",
  documentNumber: "정보화전략과-2026-0042",
  enforcementDate: "2026-03-14",
  department: "정보화전략과",
  contactInfo: "02-1234-5678",
};

const result = parseMdToGovDoc(sampleMd, metadata);

console.log("========================================");
console.log("  공문서 변환기 파서 테스트 결과");
console.log("========================================\n");

// 메타데이터 출력
console.log("[ 메타데이터 ]");
for (const [key, label] of Object.entries(METADATA_LABELS)) {
  const value = metadata[key as keyof DocumentMetadata];
  console.log(`  ${label}: ${value}`);
}

console.log(`\n[ 파싱 노드: ${result.nodes.length}개 ]\n`);

// 노드별 상세 출력
let passCount = 0;
let failCount = 0;

result.nodes.forEach((node, i) => {
  let detail = "";
  if (node.level !== undefined && node.index !== undefined) {
    const prefix = formatNumber(node.level, node.index);
    const indent = getIndent(node.level);
    detail = ` → ${indent}${prefix} `;
  }
  if (node.rows) {
    detail += ` [표: ${node.rows.length}행 x ${node.rows[0]?.length ?? 0}열]`;
  }
  const contentPreview = node.content.substring(0, 50) + (node.content.length > 50 ? "..." : "");
  console.log(`  [${String(i).padStart(2, " ")}] ${node.type.padEnd(15)} ${detail}${contentPreview}`);

  if (node.rows) {
    console.log("       ┌" + "─".repeat(60));
    node.rows.forEach((row, ri) => {
      console.log(`       │ 행${ri}: ${row.join(" | ")}`);
    });
    console.log("       └" + "─".repeat(60));
  }
});

// 검증
console.log("\n========================================");
console.log("  검증 결과");
console.log("========================================\n");

function check(label: string, condition: boolean) {
  if (condition) {
    passCount++;
    console.log(`  ✓ ${label}`);
  } else {
    failCount++;
    console.log(`  ✗ ${label}`);
  }
}

check("제목(h1)이 title로 변환됨", result.nodes[0]?.type === "title");
check("제목 내용 일치", result.nodes[0]?.content === "2026년도 정보화사업 추진계획 보고");
check("부제목(h2)이 subtitle1로 변환됨", result.nodes[1]?.type === "subtitle1");
check("본문(paragraph)이 body로 변환됨", result.nodes[2]?.type === "body");

const numberedNodes = result.nodes.filter(n => n.type === "numbered");
check("번호 목록 존재", numberedNodes.length > 0);

const level1Items = numberedNodes.filter(n => n.level === 1);
const level2Items = numberedNodes.filter(n => n.level === 2);
check("레벨1 번호 항목 존재", level1Items.length > 0);
check("레벨2 하위 번호 항목 존재", level2Items.length > 0);

const tableNode = result.nodes.find(n => n.type === "table");
check("표가 파싱됨", tableNode !== undefined);
check("표 행 수 (헤더+4행)", tableNode?.rows?.length === 5);
check("표 열 수 (4열)", tableNode?.rows?.[0]?.length === 4);

const metaBlock = result.nodes.find(n => n.type === "metadata-block");
check("인용문이 metadata-block으로 변환됨", metaBlock !== undefined);
check("metadata-block에 '붙임' 포함", metaBlock?.content.includes("붙임") ?? false);

const endMarker = result.nodes.find(n => n.type === "end-marker");
check("구분선이 end-marker로 변환됨", endMarker !== undefined);
check("end-marker 내용이 '끝.'", endMarker?.content === "끝.");

// 넘버링 포맷 검증
console.log("\n[ 넘버링 포맷 검증 ]");
check("레벨1 포맷: 1.", formatNumber(1, 0) === "1.");
check("레벨2 포맷: 가.", formatNumber(2, 0) === "가.");
check("레벨2 포맷: 나.", formatNumber(2, 1) === "나.");
check("레벨3 포맷: 1)", formatNumber(3, 0) === "1)");
check("레벨4 포맷: 가)", formatNumber(4, 0) === "가)");
check("레벨5 포맷: (1)", formatNumber(5, 0) === "(1)");
check("레벨6 포맷: (가)", formatNumber(6, 0) === "(가)");

console.log(`\n========================================`);
console.log(`  결과: ${passCount}개 통과 / ${failCount}개 실패`);
console.log(`========================================\n`);

if (failCount > 0) {
  process.exit(1);
}
