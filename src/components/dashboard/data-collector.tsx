"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { REGIONS } from "@/lib/real-estate/regions";
import type { CsvFileInfo } from "@/lib/real-estate/csv";

interface CollectorStatus {
  isRunning: boolean;
  lastCollectTime: string | null;
  totalFiles: number;
  files: CsvFileInfo[];
}

interface CollectResult {
  regionCode: string;
  regionName: string;
  dealYearMonth: string;
  rowCount: number;
  status: "success" | "error";
  error?: string;
}

export function DataCollector() {
  const now = new Date();
  const defaultMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;

  const [status, setStatus] = useState<CollectorStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [results, setResults] = useState<CollectResult[]>([]);
  const [regionCode, setRegionCode] = useState("11680");
  const [dealYearMonth, setDealYearMonth] = useState(defaultMonth);
  const [message, setMessage] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/real-estate/collect");
      const data = await res.json();
      setStatus(data);
    } catch {
      setMessage("현황 조회 실패");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  async function handleCollectSingle() {
    setActionLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/real-estate/collect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "collect-single",
          regionCode,
          dealYearMonth,
        }),
      });
      const data = await res.json();
      if (data.result) {
        setResults([data.result]);
        setMessage(
          data.result.status === "success"
            ? `${data.result.regionName}: ${data.result.rowCount}건 저장 완료`
            : `오류: ${data.result.error}`
        );
      }
      await fetchStatus();
    } catch {
      setMessage("수집 실패");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCollectBatch() {
    setActionLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/real-estate/collect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "collect-batch",
          dealYearMonth,
        }),
      });
      const data = await res.json();
      if (data.results) {
        setResults(data.results);
        setMessage(
          `배치 수집 완료: ${data.summary.success}건 성공, ${data.summary.error}건 실패 (총 ${data.summary.totalRows}건 데이터)`
        );
      }
      await fetchStatus();
    } catch {
      setMessage("배치 수집 실패");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleAutoCollect(action: "start-auto" | "stop-auto") {
    setActionLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/real-estate/collect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, intervalHours: 24 }),
      });
      const data = await res.json();
      setMessage(data.message);
      await fetchStatus();
    } catch {
      setMessage("자동 수집 설정 실패");
    } finally {
      setActionLoading(false);
    }
  }

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
  }

  function formatDateTime(iso: string): string {
    return new Date(iso).toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const regionMap = Object.fromEntries(REGIONS.map((r) => [r.code, r.name]));

  return (
    <div className="space-y-6">
      {/* 자동 수집 상태 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            자동 수집 현황
            {status?.isRunning && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                실행 중
              </span>
            )}
            {status && !status.isRunning && (
              <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                중지됨
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div className="rounded-lg border p-4 text-center">
              <p className="text-2xl font-bold">{status?.totalFiles ?? 0}</p>
              <p className="text-sm text-muted-foreground">저장된 CSV 파일</p>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <p className="text-2xl font-bold">24h</p>
              <p className="text-sm text-muted-foreground">수집 간격</p>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <p className="text-sm font-medium">
                {status?.lastCollectTime
                  ? formatDateTime(status.lastCollectTime)
                  : "-"}
              </p>
              <p className="text-sm text-muted-foreground">마지막 수집</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => handleAutoCollect("start-auto")}
              disabled={actionLoading || status?.isRunning === true}
              variant="default"
            >
              24시간 자동 수집 시작
            </Button>
            <Button
              onClick={() => handleAutoCollect("stop-auto")}
              disabled={actionLoading || status?.isRunning === false}
              variant="outline"
            >
              중지
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 수동 수집 */}
      <Card>
        <CardHeader>
          <CardTitle>수동 데이터 수집</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1 space-y-2">
              <Label>지역</Label>
              <Select value={regionCode} onValueChange={setRegionCode}>
                <SelectTrigger>
                  <SelectValue placeholder="지역 선택" />
                </SelectTrigger>
                <SelectContent>
                  {REGIONS.map((r) => (
                    <SelectItem key={r.code} value={r.code}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-40 space-y-2">
              <Label>계약년월</Label>
              <Input
                value={dealYearMonth}
                onChange={(e) => setDealYearMonth(e.target.value)}
                placeholder="202603"
                maxLength={6}
              />
            </div>
            <div className="flex items-end gap-2">
              <Button
                onClick={handleCollectSingle}
                disabled={actionLoading}
                variant="outline"
              >
                {actionLoading ? "수집 중..." : "단일 수집"}
              </Button>
              <Button onClick={handleCollectBatch} disabled={actionLoading}>
                {actionLoading ? "수집 중..." : "주요 5개구 배치 수집"}
              </Button>
            </div>
          </div>

          {message && (
            <div className="rounded-lg border bg-muted/50 p-3 text-sm">
              {message}
            </div>
          )}

          {results.length > 0 && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-2 px-2 font-medium">지역</th>
                    <th className="py-2 px-2 font-medium">계약년월</th>
                    <th className="py-2 px-2 font-medium">수집 건수</th>
                    <th className="py-2 px-2 font-medium">상태</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr key={i} className="border-b">
                      <td className="py-2 px-2">{r.regionName}</td>
                      <td className="py-2 px-2">{r.dealYearMonth}</td>
                      <td className="py-2 px-2">{r.rowCount}건</td>
                      <td className="py-2 px-2">
                        {r.status === "success" ? (
                          <span className="text-green-600">성공</span>
                        ) : (
                          <span className="text-red-600">실패: {r.error}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 저장된 CSV 파일 목록 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            저장된 CSV 파일
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchStatus}
              disabled={loading}
            >
              {loading ? "조회 중..." : "새로고침"}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!status?.files?.length ? (
            <p className="text-muted-foreground text-center py-8">
              저장된 CSV 파일이 없습니다. 데이터를 수집해 주세요.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-2 px-2 font-medium">파일명</th>
                    <th className="py-2 px-2 font-medium">지역</th>
                    <th className="py-2 px-2 font-medium">계약년월</th>
                    <th className="py-2 px-2 font-medium">파일 크기</th>
                    <th className="py-2 px-2 font-medium">수집 시각</th>
                  </tr>
                </thead>
                <tbody>
                  {status.files.map((f) => (
                    <tr key={f.fileName} className="border-b hover:bg-muted/50">
                      <td className="py-2 px-2 font-mono text-xs">
                        {f.fileName}
                      </td>
                      <td className="py-2 px-2">
                        {regionMap[f.regionCode] ?? f.regionCode}
                      </td>
                      <td className="py-2 px-2">{f.dealYearMonth}</td>
                      <td className="py-2 px-2">{formatFileSize(f.size)}</td>
                      <td className="py-2 px-2">
                        {formatDateTime(f.updatedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
