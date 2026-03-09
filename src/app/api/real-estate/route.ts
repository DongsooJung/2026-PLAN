import { NextRequest, NextResponse } from "next/server";
import { fetchAptTrades } from "@/lib/real-estate/api";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const regionCode = searchParams.get("regionCode");
  const dealYearMonth = searchParams.get("dealYearMonth");

  if (!regionCode || !dealYearMonth) {
    return NextResponse.json(
      { error: "regionCode와 dealYearMonth 파라미터가 필요합니다." },
      { status: 400 }
    );
  }

  if (!/^\d{5}$/.test(regionCode)) {
    return NextResponse.json(
      { error: "지역코드는 5자리 숫자여야 합니다." },
      { status: 400 }
    );
  }

  if (!/^\d{6}$/.test(dealYearMonth)) {
    return NextResponse.json(
      { error: "계약년월은 YYYYMM 형식이어야 합니다." },
      { status: 400 }
    );
  }

  try {
    const trades = await fetchAptTrades(regionCode, dealYearMonth);
    return NextResponse.json({ trades, total: trades.length });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
