import { NextRequest, NextResponse } from "next/server";
import { readTradesFromCsv, listCsvFiles } from "@/lib/real-estate/csv";

// GET: CSV 파일 목록 또는 특정 CSV 데이터 조회
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const regionCode = searchParams.get("regionCode");
  const dealYearMonth = searchParams.get("dealYearMonth");

  try {
    // 특정 CSV 파일 데이터 조회
    if (regionCode && dealYearMonth) {
      const trades = await readTradesFromCsv(regionCode, dealYearMonth);
      if (trades === null) {
        return NextResponse.json(
          { error: "해당 CSV 파일이 존재하지 않습니다." },
          { status: 404 }
        );
      }
      return NextResponse.json({ trades, total: trades.length });
    }

    // CSV 파일 목록 조회
    const files = await listCsvFiles();
    return NextResponse.json({ files, total: files.length });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
