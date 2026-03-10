"use client";

import { useState, useRef, useMemo, useCallback } from "react";
import { MdInput } from "@/components/converter/md-input";
import { DocumentPreview } from "@/components/converter/document-preview";
import { DocumentStructureForm } from "@/components/converter/document-structure-form";
import { ExportControls } from "@/components/converter/export-controls";
import { parseMdToGovDoc } from "@/lib/converter/md-parser";
import { DEFAULT_METADATA, type DocumentMetadata } from "@/lib/converter/govdoc-types";
import type { ExportFormat } from "@/lib/types";
import { createConversion } from "@/actions/conversions";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ConverterPage() {
  const [markdown, setMarkdown] = useState("");
  const [metadata, setMetadata] = useState<DocumentMetadata>({ ...DEFAULT_METADATA });
  const [showMeta, setShowMeta] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const govDoc = useMemo(() => {
    if (!markdown.trim()) return null;
    return parseMdToGovDoc(markdown, metadata);
  }, [markdown, metadata]);

  const handleSaveHistory = useCallback(
    async (format: ExportFormat) => {
      if (!govDoc) return;
      const title = govDoc.nodes.find((n) => n.type === "title")?.content ?? "제목 없음";
      try {
        await createConversion({
          title,
          md_content: markdown,
          document_metadata: metadata,
          export_format: format,
        });
      } catch (err) {
        console.error("Failed to save conversion history:", err);
      }
    },
    [govDoc, markdown, metadata]
  );

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-card">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowMeta(!showMeta)}
          >
            {showMeta ? (
              <ChevronUp className="h-4 w-4 mr-1" />
            ) : (
              <ChevronDown className="h-4 w-4 mr-1" />
            )}
            공문서 정보
          </Button>
        </div>
        <ExportControls
          document={govDoc}
          previewRef={previewRef}
          onSaveHistory={handleSaveHistory}
        />
      </div>

      {/* Metadata form (collapsible) */}
      {showMeta && (
        <div className="px-4 py-3 border-b bg-muted/30">
          <DocumentStructureForm metadata={metadata} onChange={setMetadata} />
        </div>
      )}

      {/* Split pane: MD input | Preview */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <div className="flex-1 p-4 overflow-auto border-b lg:border-b-0 lg:border-r min-h-[300px]">
          <MdInput value={markdown} onChange={setMarkdown} />
        </div>
        <div className="flex-1 p-4 overflow-auto bg-muted/20">
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">
            공문서 미리보기
          </h3>
          <DocumentPreview ref={previewRef} document={govDoc} />
        </div>
      </div>
    </div>
  );
}
