import { fetchAptTrades } from "./api";
import { saveTradesToCsv, listCsvFiles } from "./csv";
import { REGIONS } from "./regions";

export interface CollectResult {
  regionCode: string;
  regionName: string;
  dealYearMonth: string;
  rowCount: number;
  filePath: string;
  status: "success" | "error";
  error?: string;
}

function getCurrentYearMonth(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `${y}${m}`;
}

function getPreviousYearMonth(): string {
  const now = new Date();
  now.setMonth(now.getMonth() - 1);
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `${y}${m}`;
}

export async function collectRegionData(
  regionCode: string,
  dealYearMonth?: string
): Promise<CollectResult> {
  const ym = dealYearMonth ?? getCurrentYearMonth();
  const region = REGIONS.find((r) => r.code === regionCode);
  const regionName = region?.name ?? regionCode;

  try {
    const trades = await fetchAptTrades(regionCode, ym);
    const { filePath, rowCount } = await saveTradesToCsv(trades, regionCode, ym);

    return {
      regionCode,
      regionName,
      dealYearMonth: ym,
      rowCount,
      filePath,
      status: "success",
    };
  } catch (error) {
    return {
      regionCode,
      regionName,
      dealYearMonth: ym,
      rowCount: 0,
      filePath: "",
      status: "error",
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    };
  }
}

// Collect data for selected regions (default: Seoul top 5 districts)
export async function collectBatchData(
  regionCodes?: string[],
  dealYearMonth?: string
): Promise<CollectResult[]> {
  const codes = regionCodes ?? [
    "11680", // 강남구
    "11650", // 서초구
    "11710", // 송파구
    "11440", // 마포구
    "11560", // 영등포구
  ];
  const ym = dealYearMonth ?? getCurrentYearMonth();

  const results: CollectResult[] = [];
  for (const code of codes) {
    const result = await collectRegionData(code, ym);
    results.push(result);
    // Delay between API calls to avoid rate limiting
    await new Promise((r) => setTimeout(r, 500));
  }

  return results;
}

// Tracking for the 24h auto-collect scheduler
let lastCollectTime: string | null = null;
let collectInterval: ReturnType<typeof setInterval> | null = null;

export function getLastCollectTime(): string | null {
  return lastCollectTime;
}

export function isCollectorRunning(): boolean {
  return collectInterval !== null;
}

export async function startAutoCollect(
  intervalMs: number = 24 * 60 * 60 * 1000 // 24 hours
): Promise<{ started: boolean; message: string }> {
  if (collectInterval) {
    return { started: false, message: "이미 자동 수집이 실행 중입니다." };
  }

  // Run immediately on start
  const results = await collectBatchData();
  lastCollectTime = new Date().toISOString();

  collectInterval = setInterval(async () => {
    await collectBatchData();
    lastCollectTime = new Date().toISOString();
    console.log(`[자동수집] ${lastCollectTime} - 데이터 수집 완료`);
  }, intervalMs);

  return {
    started: true,
    message: `자동 수집 시작 (간격: ${intervalMs / 1000 / 60 / 60}시간). 첫 수집 완료: ${results.length}개 지역`,
  };
}

export function stopAutoCollect(): { stopped: boolean; message: string } {
  if (!collectInterval) {
    return { stopped: false, message: "실행 중인 자동 수집이 없습니다." };
  }

  clearInterval(collectInterval);
  collectInterval = null;

  return { stopped: true, message: "자동 수집이 중지되었습니다." };
}

export async function getCollectorStatus() {
  const csvFiles = await listCsvFiles();

  return {
    isRunning: isCollectorRunning(),
    lastCollectTime,
    totalFiles: csvFiles.length,
    files: csvFiles,
  };
}
