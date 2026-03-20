"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Plus } from "lucide-react";
import { createCcUsage } from "@/actions/ccusage";

const MODELS = [
  "claude-opus-4-6",
  "claude-sonnet-4-6",
  "claude-haiku-4-5-20251001",
  "claude-sonnet-4-20250514",
  "claude-opus-4-20250918",
];

interface FormData {
  model: string;
  input_tokens: number;
  output_tokens: number;
  cache_read_tokens: number;
  cache_write_tokens: number;
  cost_usd: number;
  duration_ms: number;
  tool_uses: number;
  task_description?: string;
  used_at: string;
}

interface AddUsageDialogProps {
  userId: string;
}

export function AddUsageDialog({ userId }: AddUsageDialogProps) {
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      model: MODELS[1],
      input_tokens: 0,
      output_tokens: 0,
      cache_read_tokens: 0,
      cache_write_tokens: 0,
      cost_usd: 0,
      duration_ms: 0,
      tool_uses: 0,
      task_description: "",
      used_at: new Date().toISOString().slice(0, 16),
    },
  });

  const onSubmit = async (data: FormData) => {
    await createCcUsage({
      user_id: userId,
      session_id: null,
      model: data.model,
      input_tokens: data.input_tokens,
      output_tokens: data.output_tokens,
      cache_read_tokens: data.cache_read_tokens,
      cache_write_tokens: data.cache_write_tokens,
      cost_usd: data.cost_usd,
      duration_ms: data.duration_ms,
      tool_uses: data.tool_uses,
      task_description: data.task_description || null,
      used_at: new Date(data.used_at).toISOString(),
    });
    reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-1 h-4 w-4" />
          사용 기록 추가
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Claude Code 사용 기록 추가</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>모델</Label>
            <Select
              defaultValue={MODELS[1]}
              onValueChange={(v) => setValue("model", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MODELS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m.replace("claude-", "")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.model && (
              <p className="text-xs text-destructive">{errors.model.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">입력 토큰</Label>
              <Input type="number" {...register("input_tokens")} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">출력 토큰</Label>
              <Input type="number" {...register("output_tokens")} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">캐시 읽기</Label>
              <Input type="number" {...register("cache_read_tokens")} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">캐시 쓰기</Label>
              <Input type="number" {...register("cache_write_tokens")} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">비용 (USD)</Label>
              <Input type="number" step="0.0001" {...register("cost_usd")} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">소요시간 (ms)</Label>
              <Input type="number" {...register("duration_ms")} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">도구 사용</Label>
              <Input type="number" {...register("tool_uses")} />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">작업 설명</Label>
            <Input {...register("task_description")} placeholder="예: 버그 수정, 기능 추가 등" />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">사용 일시</Label>
            <Input type="datetime-local" {...register("used_at")} />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              취소
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "저장 중..." : "저장"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
