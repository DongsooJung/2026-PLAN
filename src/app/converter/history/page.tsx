"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { HistoryList } from "@/components/converter/history-list";
import { getConversions, deleteConversion } from "@/actions/conversions";
import type { Conversion } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function HistoryPage() {
  const [conversions, setConversions] = useState<Conversion[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    getConversions()
      .then(setConversions)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    try {
      await deleteConversion(id);
      setConversions((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  }, []);

  const handleSelect = useCallback(
    (conv: Conversion) => {
      // Store selected conversion in sessionStorage for the converter page to load
      sessionStorage.setItem("selectedConversion", JSON.stringify(conv));
      router.push("/converter");
    },
    [router]
  );

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.push("/converter")}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          변환기
        </Button>
        <h1 className="text-xl font-bold">변환 이력</h1>
      </div>

      {loading ? (
        <div className="text-center text-muted-foreground py-12">
          불러오는 중...
        </div>
      ) : (
        <HistoryList
          conversions={conversions}
          onSelect={handleSelect}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
