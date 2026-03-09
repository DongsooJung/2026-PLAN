import type { AptTrade, AptTradeItem, AptTradeResponse } from "./types";

const API_BASE_URL =
  "http://openapi.molit.go.kr/OpenAPI_ToolInstallPackage/service/rest/RTMSOBJSvc/getRTMSDataSvcAptTradeDev";

function parseItem(item: AptTradeItem): AptTrade {
  const priceStr = item["거래금액"].trim().replace(/,/g, "");
  return {
    apartmentName: item["아파트"]?.trim() ?? "",
    price: item["거래금액"]?.trim() ?? "",
    priceNumber: parseInt(priceStr, 10) || 0,
    area: item["전용면적"]?.trim() ?? "",
    floor: item["층"]?.trim() ?? "",
    buildYear: item["건축년도"]?.trim() ?? "",
    dealDate: `${item["년"]}.${item["월"].padStart(2, "0")}.${item["일"].trim().padStart(2, "0")}`,
    dong: item["법정동"]?.trim() ?? "",
    jibun: item["지번"]?.trim() ?? "",
    dealType: item["거래유형"]?.trim() ?? "",
    regionCode: item["지역코드"]?.trim() ?? "",
  };
}

export async function fetchAptTrades(
  regionCode: string,
  dealYearMonth: string
): Promise<AptTrade[]> {
  const apiKey = process.env.DATA_GO_KR_API_KEY;
  if (!apiKey) {
    throw new Error("DATA_GO_KR_API_KEY 환경변수가 설정되지 않았습니다.");
  }

  const params = new URLSearchParams({
    serviceKey: apiKey,
    LAWD_CD: regionCode,
    DEAL_YMD: dealYearMonth,
    pageNo: "1",
    numOfRows: "100",
    type: "json",
  });

  const url = `${API_BASE_URL}?${params.toString()}`;
  const res = await fetch(url, { next: { revalidate: 3600 } });

  if (!res.ok) {
    throw new Error(`API 호출 실패: ${res.status} ${res.statusText}`);
  }

  const json: AptTradeResponse = await res.json();

  if (json.response.header.resultCode !== "00") {
    throw new Error(
      `API 오류: ${json.response.header.resultCode} - ${json.response.header.resultMsg}`
    );
  }

  const items = json.response.body?.items?.item;
  if (!items) return [];

  const itemArray = Array.isArray(items) ? items : [items];
  return itemArray.map(parseItem);
}
