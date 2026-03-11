import { DataCollector } from "@/components/dashboard/data-collector";

export default function DataCollectPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">데이터 자동 수집</h1>
        <p className="text-muted-foreground">
          아파트 실거래가 데이터를 24시간 간격으로 자동 수집하여 CSV 파일로 저장합니다.
        </p>
      </div>
      <DataCollector />
    </div>
  );
}
