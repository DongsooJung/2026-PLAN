"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { REGIONS } from "@/lib/real-estate/regions";
import type { AptTrade } from "@/lib/real-estate/types";

function formatPrice(price: string): string {
  const trimmed = price.trim().replace(/,/g, "");
  const num = parseInt(trimmed, 10);
  if (isNaN(num)) return price;
  const eok = Math.floor(num / 10000);
  const man = num % 10000;
  if (eok > 0 && man > 0) return `${eok}억 ${man.toLocaleString()}만원`;
  if (eok > 0) return `${eok}억`;
  return `${num.toLocaleString()}만원`;
}

export function RealEstateSearch() {
  const now = new Date();
  const defaultMonth = `${now.getFullYear()}${String(now.getMonth()).padStart(2, "0")}`;

  const [regionCode, setRegionCode] = useState("11680");
  const [dealYearMonth, setDealYearMonth] = useState(defaultMonth);
  const [trades, setTrades] = useState<AptTrade[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  async function handleSearch() {
    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const res = await fetch(
        `/api/real-estate?regionCode=${regionCode}&dealYearMonth=${dealYearMonth}`
      );
      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        setTrades([]);
        return;
      }

      setTrades(data.trades);
    } catch {
      setError("데이터를 불러오는 중 오류가 발생했습니다.");
      setTrades([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>검색 조건</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="region">지역</Label>
              <Select value={regionCode} onValueChange={setRegionCode}>
                <SelectTrigger id="region">
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
              <Label htmlFor="dealYearMonth">계약년월</Label>
              <Input
                id="dealYearMonth"
                value={dealYearMonth}
                onChange={(e) => setDealYearMonth(e.target.value)}
                placeholder="202603"
                maxLength={6}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleSearch} disabled={loading}>
                {loading ? "검색 중..." : "검색"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {searched && !error && (
        <Card>
          <CardHeader>
            <CardTitle>
              검색 결과{" "}
              <span className="text-muted-foreground font-normal text-base">
                ({trades.length}건)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {trades.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                검색 결과가 없습니다.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="py-3 px-2 font-medium">아파트</th>
                      <th className="py-3 px-2 font-medium">거래금액</th>
                      <th className="py-3 px-2 font-medium">전용면적</th>
                      <th className="py-3 px-2 font-medium">층</th>
                      <th className="py-3 px-2 font-medium">건축년도</th>
                      <th className="py-3 px-2 font-medium">거래일</th>
                      <th className="py-3 px-2 font-medium">법정동</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trades.map((trade, i) => (
                      <tr key={i} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-2 font-medium">
                          {trade.apartmentName}
                        </td>
                        <td className="py-3 px-2 text-blue-600 font-semibold">
                          {formatPrice(trade.price)}
                        </td>
                        <td className="py-3 px-2">{trade.area}m²</td>
                        <td className="py-3 px-2">{trade.floor}층</td>
                        <td className="py-3 px-2">{trade.buildYear}년</td>
                        <td className="py-3 px-2">{trade.dealDate}</td>
                        <td className="py-3 px-2">{trade.dong}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
