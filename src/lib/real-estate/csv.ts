import * as fs from "fs/promises";
import * as path from "path";
import type { AptTrade } from "./types";

const CSV_DIR = path.join(process.cwd(), "data", "real-estate");

const CSV_HEADERS = [
  "아파트명",
  "거래금액",
  "거래금액(만원)",
  "전용면적(㎡)",
  "층",
  "건축년도",
  "거래일",
  "법정동",
  "지번",
  "거래유형",
  "지역코드",
] as const;

function tradeToCsvRow(trade: AptTrade): string {
  const values = [
    trade.apartmentName,
    trade.price,
    trade.priceNumber.toString(),
    trade.area,
    trade.floor,
    trade.buildYear,
    trade.dealDate,
    trade.dong,
    trade.jibun,
    trade.dealType,
    trade.regionCode,
  ];
  return values.map((v) => `"${v.replace(/"/g, '""')}"`).join(",");
}

function getCsvFileName(regionCode: string, dealYearMonth: string): string {
  return `apt-trades_${regionCode}_${dealYearMonth}.csv`;
}

export async function ensureCsvDir(): Promise<void> {
  await fs.mkdir(CSV_DIR, { recursive: true });
}

export async function saveTradesToCsv(
  trades: AptTrade[],
  regionCode: string,
  dealYearMonth: string
): Promise<{ filePath: string; rowCount: number }> {
  await ensureCsvDir();

  const fileName = getCsvFileName(regionCode, dealYearMonth);
  const filePath = path.join(CSV_DIR, fileName);

  const header = CSV_HEADERS.join(",");
  const rows = trades.map(tradeToCsvRow);
  const content = [header, ...rows].join("\n") + "\n";

  await fs.writeFile(filePath, "\uFEFF" + content, "utf-8"); // BOM for Excel compatibility

  return { filePath, rowCount: trades.length };
}

export async function readTradesFromCsv(
  regionCode: string,
  dealYearMonth: string
): Promise<AptTrade[] | null> {
  const fileName = getCsvFileName(regionCode, dealYearMonth);
  const filePath = path.join(CSV_DIR, fileName);

  try {
    const content = await fs.readFile(filePath, "utf-8");
    const lines = content.replace(/^\uFEFF/, "").trim().split("\n");

    if (lines.length <= 1) return [];

    return lines.slice(1).map((line) => {
      const values = line
        .match(/"([^"]*(?:""[^"]*)*)"/g)
        ?.map((v) => v.slice(1, -1).replace(/""/g, '"')) ?? [];

      return {
        apartmentName: values[0] ?? "",
        price: values[1] ?? "",
        priceNumber: parseInt(values[2] ?? "0", 10) || 0,
        area: values[3] ?? "",
        floor: values[4] ?? "",
        buildYear: values[5] ?? "",
        dealDate: values[6] ?? "",
        dong: values[7] ?? "",
        jibun: values[8] ?? "",
        dealType: values[9] ?? "",
        regionCode: values[10] ?? "",
      };
    });
  } catch {
    return null;
  }
}

export interface CsvFileInfo {
  fileName: string;
  regionCode: string;
  dealYearMonth: string;
  filePath: string;
  size: number;
  updatedAt: string;
}

export async function listCsvFiles(): Promise<CsvFileInfo[]> {
  await ensureCsvDir();

  const files = await fs.readdir(CSV_DIR);
  const csvFiles = files.filter((f) => f.endsWith(".csv"));

  const results: CsvFileInfo[] = [];
  for (const fileName of csvFiles) {
    const match = fileName.match(/^apt-trades_(\d{5})_(\d{6})\.csv$/);
    if (!match) continue;

    const filePath = path.join(CSV_DIR, fileName);
    const stat = await fs.stat(filePath);

    results.push({
      fileName,
      regionCode: match[1],
      dealYearMonth: match[2],
      filePath,
      size: stat.size,
      updatedAt: stat.mtime.toISOString(),
    });
  }

  return results.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
