import { RealEstateSearch } from "@/components/dashboard/real-estate-search";

export default function RealEstatePage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          아파트 실거래가 조회
        </h2>
        <p className="text-muted-foreground">
          국토교통부 실거래가 공개 데이터를 조회합니다
        </p>
      </div>
      <RealEstateSearch />
    </div>
  );
}
