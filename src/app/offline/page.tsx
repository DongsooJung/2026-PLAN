"use client";

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center space-y-4">
        <div className="text-6xl">📡</div>
        <h1 className="text-2xl font-bold">오프라인 상태</h1>
        <p className="text-muted-foreground">
          인터넷 연결을 확인한 후 다시 시도해 주세요.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-white rounded-md"
        >
          다시 시도
        </button>
      </div>
    </div>
  );
}
