"use client";

import { useMemo, useState } from "react";
import type { Subscription } from "@/lib/types";
import { CATEGORIES } from "@/lib/constants";
import { toMonthlyCost, daysUntil } from "@/lib/utils";
import { exportSubscriptionsCsv } from "@/lib/export-csv";
import { SubscriptionCard } from "./subscription-card";
import { SubscriptionDialog } from "./subscription-dialog";
import { CategoryFilter } from "./category-filter";
import { CalendarView } from "./calendar-view";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, LayoutGrid, Calendar, Search, Download, X } from "lucide-react";

interface SubscriptionListProps {
  subscriptions: Subscription[];
}

type SortKey =
  | "next_billing"
  | "cost_desc"
  | "cost_asc"
  | "name"
  | "recent";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "next_billing", label: "결제일 임박순" },
  { value: "cost_desc", label: "금액 높은순" },
  { value: "cost_asc", label: "금액 낮은순" },
  { value: "name", label: "이름순" },
  { value: "recent", label: "최근 등록순" },
];

function sortSubscriptions(list: Subscription[], key: SortKey): Subscription[] {
  const sorted = [...list];
  switch (key) {
    case "next_billing":
      sorted.sort(
        (a, b) => daysUntil(a.next_billing_date) - daysUntil(b.next_billing_date)
      );
      break;
    case "cost_desc":
      sorted.sort(
        (a, b) =>
          toMonthlyCost(Number(b.cost), b.billing_cycle) -
          toMonthlyCost(Number(a.cost), a.billing_cycle)
      );
      break;
    case "cost_asc":
      sorted.sort(
        (a, b) =>
          toMonthlyCost(Number(a.cost), a.billing_cycle) -
          toMonthlyCost(Number(b.cost), b.billing_cycle)
      );
      break;
    case "name":
      sorted.sort((a, b) =>
        a.service_name.localeCompare(b.service_name, "ko")
      );
      break;
    case "recent":
      sorted.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      break;
  }
  return sorted;
}

export function SubscriptionList({ subscriptions }: SubscriptionListProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] =
    useState<Subscription | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "calendar">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("next_billing");

  const filtered = useMemo(() => {
    let result =
      selectedCategory === "all"
        ? subscriptions
        : subscriptions.filter((s) => s.category === selectedCategory);

    const query = searchQuery.trim().toLowerCase();
    if (query) {
      result = result.filter((s) =>
        [s.service_name, s.plan_name ?? "", s.memo ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(query)
      );
    }

    return sortSubscriptions(result, sortKey);
  }, [subscriptions, selectedCategory, searchQuery, sortKey]);

  const handleEdit = (subscription: Subscription) => {
    setEditingSubscription(subscription);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingSubscription(null);
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setEditingSubscription(null);
  };

  const isSearching = searchQuery.trim().length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <CategoryFilter
          categories={CATEGORIES}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />
        <div className="flex items-center gap-2">
          <div className="flex rounded-md border">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "calendar" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("calendar")}
            >
              <Calendar className="h-4 w-4" />
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportSubscriptionsCsv(filtered)}
            disabled={filtered.length === 0}
            title="현재 목록을 CSV 파일로 내려받기"
          >
            <Download className="mr-1 h-4 w-4" />
            CSV
          </Button>
          <Button onClick={handleAdd} size="sm">
            <Plus className="mr-1 h-4 w-4" />
            구독 추가
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="서비스명, 플랜, 메모 검색"
            className="h-9 pl-9 pr-8"
          />
          {isSearching && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-0.5 text-muted-foreground hover:text-foreground"
              aria-label="검색어 지우기"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Select
          value={sortKey}
          onValueChange={(v) => setSortKey(v as SortKey)}
        >
          <SelectTrigger className="h-9 w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {isSearching && (
          <p className="text-sm text-muted-foreground">
            검색 결과 {filtered.length}건
          </p>
        )}
      </div>

      {viewMode === "grid" ? (
        filtered.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((subscription) => (
              <SubscriptionCard
                key={subscription.id}
                subscription={subscription}
                onEdit={handleEdit}
              />
            ))}
          </div>
        ) : isSearching ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
            <p className="text-lg font-medium text-muted-foreground">
              검색 결과가 없습니다
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              다른 검색어를 입력해보세요
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
            <p className="text-lg font-medium text-muted-foreground">
              등록된 구독이 없습니다
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              &quot;구독 추가&quot; 버튼을 눌러 구독 서비스를 등록하세요
            </p>
            <Button onClick={handleAdd} className="mt-4" size="sm">
              <Plus className="mr-1 h-4 w-4" />
              첫 구독 추가하기
            </Button>
          </div>
        )
      ) : (
        <CalendarView subscriptions={filtered} />
      )}

      <SubscriptionDialog
        open={dialogOpen}
        onClose={handleClose}
        subscription={editingSubscription}
      />
    </div>
  );
}
