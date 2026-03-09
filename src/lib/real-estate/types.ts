export interface AptTradeItem {
  거래금액: string;
  거래유형: string;
  건축년도: string;
  년: string;
  법정동: string;
  아파트: string;
  월: string;
  일: string;
  전용면적: string;
  층: string;
  지번: string;
  지역코드: string;
}

export interface AptTradeResponse {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    body: {
      items: {
        item: AptTradeItem | AptTradeItem[];
      };
      numOfRows: number;
      pageNo: number;
      totalCount: number;
    };
  };
}

export interface AptTrade {
  apartmentName: string;
  price: string;
  priceNumber: number;
  area: string;
  floor: string;
  buildYear: string;
  dealDate: string;
  dong: string;
  jibun: string;
  dealType: string;
  regionCode: string;
}

export interface RegionOption {
  code: string;
  name: string;
}
