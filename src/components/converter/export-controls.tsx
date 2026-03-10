"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { FileText, FileDown, FileImage, Loader2 } from "lucide-react";
import type { GovDocument } from "@/lib/converter/govdoc-types";
import type { ExportFormat } from "@/lib/types";
import { downloadBlob } from "@/lib/utils";

interface ExportControlsProps {
  document: GovDocument | null;
  previewRef: React.RefObject<HTMLDivElement | null>;
  onSaveHistory?: (format: ExportFormat) => void;
}

export function ExportControls({ document: doc, previewRef, onSaveHistory }: ExportControlsProps) {
  const [loading, setLoading] = useState<ExportFormat | null>(null);

  const handleExport = useCallback(
    async (format: ExportFormat) => {
      if (!doc) return;
      setLoading(format);
      try {
        let blob: Blob;
        const title = doc.nodes.find((n) => n.type === "title")?.content ?? "문서";

        switch (format) {
          case "docx": {
            const { exportToDocx } = await import("@/lib/converter/export-docx");
            blob = await exportToDocx(doc);
            downloadBlob(blob, `${title}.docx`);
            break;
          }
          case "pdf": {
            if (!previewRef.current) return;
            const { exportToPdf } = await import("@/lib/converter/export-pdf");
            blob = await exportToPdf(previewRef.current);
            downloadBlob(blob, `${title}.pdf`);
            break;
          }
          case "hwpx": {
            const { exportToHwpx } = await import("@/lib/converter/export-hwpx");
            blob = await exportToHwpx(doc);
            downloadBlob(blob, `${title}.hwpx`);
            break;
          }
        }
        onSaveHistory?.(format);
      } catch (err) {
        console.error(`Export failed (${format}):`, err);
        alert(`내보내기에 실패했습니다: ${err instanceof Error ? err.message : "알 수 없는 오류"}`);
      } finally {
        setLoading(null);
      }
    },
    [doc, previewRef, onSaveHistory]
  );

  const disabled = !doc || doc.nodes.length === 0;

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-semibold text-muted-foreground mr-2">내보내기:</span>
      <Button
        variant="outline"
        size="sm"
        disabled={disabled || loading !== null}
        onClick={() => handleExport("docx")}
      >
        {loading === "docx" ? (
          <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
        ) : (
          <FileText className="h-3.5 w-3.5 mr-1" />
        )}
        DOCX
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={disabled || loading !== null}
        onClick={() => handleExport("pdf")}
      >
        {loading === "pdf" ? (
          <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
        ) : (
          <FileImage className="h-3.5 w-3.5 mr-1" />
        )}
        PDF
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={disabled || loading !== null}
        onClick={() => handleExport("hwpx")}
      >
        {loading === "hwpx" ? (
          <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
        ) : (
          <FileDown className="h-3.5 w-3.5 mr-1" />
        )}
        HWPX
      </Button>
    </div>
  );
}
