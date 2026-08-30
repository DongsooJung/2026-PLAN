"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import {
  createSubscription,
  updateSubscription,
} from "@/actions/subscriptions";
import type { Subscription } from "@/lib/types";
import { CATEGORIES, BILLING_CYCLES, STATUS_OPTIONS, POPULAR_SERVICES } from "@/lib/constants";
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

const subscriptionSchema = z.object({
  service_name: z.string().min(1, "서비스 이름을 입력하세요"),
  plan_name: z.string().optional(),
  cost: z.number().min(0, "금액은 0 이상이어야 합니다"),
  currency: z.string(),
  billing_cycle: z.enum(["monthly", "yearly", "weekly"]),
  next_billing_date: z.string().optional(),
  category: z.string().min(1, "카테고리를 선택하세요"),
  status: z.enum(["active", "paused", "cancelled"]),
  memo: z.string().optional(),
});

type FormData = z.infer<typeof subscriptionSchema>;

interface SubscriptionFormProps {
  subscription?: Subscription | null;
  onSuccess: () => void;
}

export function SubscriptionForm({
  subscription,
  onSuccess,
}: SubscriptionFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      service_name: subscription?.service_name ?? "",
      plan_name: subscription?.plan_name ?? "",
      cost: subscription ? Number(subscription.cost) : 0,
      currency: subscription?.currency ?? "KRW",
      billing_cycle: subscription?.billing_cycle ?? "monthly",
      next_billing_date: subscription?.next_billing_date ?? "",
      category: subscription?.category ?? "기타",
      status: subscription?.status ?? "active",
      memo: subscription?.memo ?? "",
    },
  });

  const serviceName = watch("service_name");
  const [suggestions, setSuggestions] = useState<typeof POPULAR_SERVICES[number][]>([]);

  useEffect(() => {
    if (serviceName && !subscription) {
      const matches = POPULAR_SERVICES.filter((s) =>
        s.name.toLowerCase().includes(serviceName.toLowerCase())
      );
      setSuggestions(matches);
    } else {
      setSuggestions([]);
    }
  }, [serviceName, subscription]);

  const selectSuggestion = (service: typeof POPULAR_SERVICES[number]) => {
    setValue("service_name", service.name);
    setValue("category", service.category);
    setSuggestions([]);
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError("");

    try {
      if (subscription) {
        await updateSubscription(subscription.id, {
          service_name: data.service_name,
          plan_name: data.plan_name || null,
          cost: data.cost,
          currency: data.currency,
          billing_cycle: data.billing_cycle,
          next_billing_date: data.next_billing_date || null,
          category: data.category as Subscription["category"],
          status: data.status,
          memo: data.memo || null,
        });
      } else {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("로그인이 필요합니다");

        await createSubscription({
          user_id: user.id,
          service_name: data.service_name,
          plan_name: data.plan_name || null,
          cost: data.cost,
          currency: data.currency,
          billing_cycle: data.billing_cycle,
          next_billing_date: data.next_billing_date || null,
          category: data.category as Subscription["category"],
          icon_url: null,
          status: data.status,
          memo: data.memo || null,
        });
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="service_name">서비스 이름 *</Label>
        <div className="relative">
          <Input
            id="service_name"
            placeholder="예: Netflix, YouTube Premium"
            {...register("service_name")}
          />
          {suggestions.length > 0 && (
            <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover shadow-md">
              {suggestions.map((s) => (
                <button
                  key={s.name}
                  type="button"
                  className="w-full px-3 py-2 text-left text-sm hover:bg-accent"
                  onClick={() => selectSuggestion(s)}
                >
                  {s.name}
                  <span className="ml-2 text-xs text-muted-foreground">
                    {s.category}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
        {errors.service_name && (
          <p className="text-xs text-destructive">
            {errors.service_name.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="plan_name">플랜 이름</Label>
        <Input
          id="plan_name"
          placeholder="예: 프리미엄, 스탠다드"
          {...register("plan_name")}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cost">금액 *</Label>
          <Input
            id="cost"
            type="number"
            step="1"
            min="0"
            placeholder="14900"
            {...register("cost", { valueAsNumber: true })}
          />
          {errors.cost && (
            <p className="text-xs text-destructive">{errors.cost.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label>통화</Label>
          <Select
            defaultValue={subscription?.currency ?? "KRW"}
            onValueChange={(v) => setValue("currency", v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="KRW">KRW (원)</SelectItem>
              <SelectItem value="USD">USD ($)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>결제 주기 *</Label>
          <Select
            defaultValue={subscription?.billing_cycle ?? "monthly"}
            onValueChange={(v) =>
              setValue("billing_cycle", v as "monthly" | "yearly" | "weekly")
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BILLING_CYCLES.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="next_billing_date">다음 결제일</Label>
          <Input
            id="next_billing_date"
            type="date"
            {...register("next_billing_date")}
          />
          <p className="text-xs text-muted-foreground">
            알 수 없으면 비워두세요.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>카테고리 *</Label>
          <Select
            defaultValue={subscription?.category ?? "기타"}
            onValueChange={(v) => setValue("category", v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.emoji} {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>상태</Label>
          <Select
            defaultValue={subscription?.status ?? "active"}
            onValueChange={(v) =>
              setValue("status", v as "active" | "paused" | "cancelled")
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="memo">메모</Label>
        <Input
          id="memo"
          placeholder="메모 (선택사항)"
          {...register("memo")}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading
          ? "저장 중..."
          : subscription
          ? "수정하기"
          : "추가하기"}
      </Button>
    </form>
  );
}
