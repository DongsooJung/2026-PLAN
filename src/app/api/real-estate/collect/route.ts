import { NextRequest, NextResponse } from "next/server";
import {
  collectRegionData,
  collectBatchData,
  startAutoCollect,
  stopAutoCollect,
  getCollectorStatus,
} from "@/lib/real-estate/collector";

// POST: 데이터 수집 실행 (단일/배치/자동수집 시작·중지)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, regionCode, regionCodes, dealYearMonth } = body;

    switch (action) {
      case "collect-single": {
        if (!regionCode) {
          return NextResponse.json(
            { error: "regionCode가 필요합니다." },
            { status: 400 }
          );
        }
        const result = await collectRegionData(regionCode, dealYearMonth);
        return NextResponse.json({ result });
      }

      case "collect-batch": {
        const results = await collectBatchData(regionCodes, dealYearMonth);
        return NextResponse.json({
          results,
          summary: {
            total: results.length,
            success: results.filter((r) => r.status === "success").length,
            error: results.filter((r) => r.status === "error").length,
            totalRows: results.reduce((sum, r) => sum + r.rowCount, 0),
          },
        });
      }

      case "start-auto": {
        const intervalHours = body.intervalHours ?? 24;
        const intervalMs = intervalHours * 60 * 60 * 1000;
        const result = await startAutoCollect(intervalMs);
        return NextResponse.json(result);
      }

      case "stop-auto": {
        const result = stopAutoCollect();
        return NextResponse.json(result);
      }

      default:
        return NextResponse.json(
          { error: `알 수 없는 action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET: 수집 현황 조회
export async function GET() {
  try {
    const status = await getCollectorStatus();
    return NextResponse.json(status);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
