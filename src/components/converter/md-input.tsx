"use client";

import { useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileText } from "lucide-react";

const SAMPLE_TEMPLATE = `# 업무 협조 요청

## 1. 추진 배경

행정 업무의 효율성 향상과 디지털 전환을 위하여 다음과 같이 업무 협조를 요청합니다.

## 2. 협조 요청 사항

1. 관련 자료 제출
   가. 2026년도 업무 계획서
   나. 예산 집행 현황
   다. 성과 보고서
2. 회의 참석
   가. 일시: 2026년 3월 15일 14:00
   나. 장소: 본관 3층 대회의실
3. 기타 사항
   가. 문의사항은 담당자에게 연락 바랍니다.

## 3. 행정 사항

| 구분 | 내용 | 비고 |
|------|------|------|
| 제출기한 | 2026.3.20 | 엄수 |
| 제출방법 | 전자문서 | 공문 발송 |

---
`;

interface MdInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function MdInput({ value, onChange }: MdInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result;
        if (typeof text === "string") {
          onChange(text);
        }
      };
      reader.readAsText(file);
      e.target.value = "";
    },
    [onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result;
        if (typeof text === "string") {
          onChange(text);
        }
      };
      reader.readAsText(file);
    },
    [onChange]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-sm font-semibold text-muted-foreground">마크다운 입력</h3>
        <div className="flex gap-1 ml-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onChange(SAMPLE_TEMPLATE)}
          >
            <FileText className="h-3.5 w-3.5 mr-1" />
            샘플
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-3.5 w-3.5 mr-1" />
            파일
          </Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".md,.txt,.markdown"
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>
      <textarea
        className="flex-1 w-full resize-none rounded-lg border bg-background p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        placeholder="마크다운을 입력하거나 .md 파일을 드래그하세요..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        spellCheck={false}
      />
    </div>
  );
}
