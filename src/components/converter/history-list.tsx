"use client";

import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FileText, Trash2 } from "lucide-react";
import type { Conversion } from "@/lib/types";

interface HistoryListProps {
  conversions: Conversion[];
  onSelect: (conversion: Conversion) => void;
  onDelete: (id: string) => void;
}

export function HistoryList({ conversions, onSelect, onDelete }: HistoryListProps) {
  if (conversions.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-12">
        변환 이력이 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {conversions.map((conv) => (
        <div
          key={conv.id}
          className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors"
        >
          <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
          <button
            type="button"
            className="flex-1 text-left"
            onClick={() => onSelect(conv)}
          >
            <div className="font-medium text-sm">{conv.title}</div>
            <div className="text-xs text-muted-foreground">
              {formatDate(conv.created_at)}
              {conv.export_format && (
                <span className="ml-2 uppercase">{conv.export_format}</span>
              )}
            </div>
          </button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(conv.id)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ))}
    </div>
  );
}
