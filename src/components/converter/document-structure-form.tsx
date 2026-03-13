"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { DocumentMetadata } from "@/lib/converter/govdoc-types";
import { METADATA_LABELS } from "@/lib/converter/govdoc-constants";

interface DocumentStructureFormProps {
  metadata: DocumentMetadata;
  onChange: (metadata: DocumentMetadata) => void;
}

const FIELD_KEYS: (keyof DocumentMetadata)[] = [
  "recipient",
  "reference",
  "drafter",
  "reviewer",
  "approver",
  "documentNumber",
  "enforcementDate",
  "department",
  "contactInfo",
];

export function DocumentStructureForm({ metadata, onChange }: DocumentStructureFormProps) {
  const handleChange = (key: keyof DocumentMetadata, value: string) => {
    onChange({ ...metadata, [key]: value });
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground mb-2">공문서 정보</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {FIELD_KEYS.map((key) => (
          <div key={key} className="space-y-1">
            <Label htmlFor={key} className="text-xs">
              {METADATA_LABELS[key]}
            </Label>
            <Input
              id={key}
              type={key === "enforcementDate" ? "date" : "text"}
              value={metadata[key]}
              onChange={(e) => handleChange(key, e.target.value)}
              placeholder={`${METADATA_LABELS[key]}을(를) 입력하세요`}
              className="h-8 text-sm"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
