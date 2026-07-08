"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export function NotionSyncButton() {
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleSync = async () => {
    setSyncing(true);
    setResult(null);

    try {
      const res = await fetch("/api/sync", { method: "POST" });
      const data = await res.json();

      if (res.ok) {
        setResult(data.message);
        router.refresh();
      } else {
        setResult(data.error ?? "동기화 실패");
      }
    } catch {
      setResult("네트워크 오류가 발생했습니다.");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={handleSync}
        disabled={syncing}
        variant="outline"
        size="sm"
        title="Notion과 양방향 동기화"
      >
        <RefreshCw className={`mr-1 h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
        {syncing ? "동기화 중..." : "Notion 동기화"}
      </Button>
      {result && (
        <span className="text-xs text-muted-foreground">{result}</span>
      )}
    </div>
  );
}
