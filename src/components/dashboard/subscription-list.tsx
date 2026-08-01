"use client";

import { useMemo, useState } from "react";
import type { Subscription } from "@/lib/types";
import { CATEGORIES } from "@/lib/constants";
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
import { downloadBlob } from "@/lib/utils";
import { subscriptionsToCsv } from "@/lib/subscriptions-csv";
import { Plus, LayoutGrid, Calendar, Download, Search } from "lucide-react";

interface SubscriptionListProps {
  subscriptions: Subscription[];
}

type SortOption = "billing-date" | "cost-high" | "cost-low" | "name";

export function SubscriptionList({ subscriptions }: SubscriptionListProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] =
    useState<Subscription | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "calendar">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("billing-date");

  const filtered = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLocaleLowerCase("ko-KR");

    return subscriptions
      .filter(
        (subscription) =>
          selectedCategory === "all" ||
          subscription.category === selectedCategory
      )
      .filter((subscription) => {
        if (!normalizedQuery) return true;

        return [subscription.service_name, subscription.plan_name ?? ""].some(
          (value) => value.toLocaleLowerCase("ko-KR").includes(normalizedQuery)
        );
      })
      .toSorted((a, b) => {
        switch (sortBy) {
          case "cost-high":
            return Number(b.cost) - Number(a.cost);
          case "cost-low":
            return Number(a.cost) - Number(b.cost);
          case "name":
            return a.service_name.localeCompare(b.service_name, "ko-KR");
          case "billing-date":
            return a.next_billing_date.localeCompare(b.next_billing_date);
        }
      });
  }, [subscriptions, selectedCategory, searchQuery, sortBy]);

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

  const handleExport = () => {
    const csv = subscriptionsToCsv(filtered);
    const date = new Intl.DateTimeFormat("en-CA").format(new Date());
    downloadBlob(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
      `subscriptions-${date}.csv`
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <CategoryFilter
          categories={CATEGORIES}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-md border">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              aria-label="그리드 보기"
              title="그리드 보기"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "calendar" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("calendar")}
              aria-label="캘린더 보기"
              title="캘린더 보기"
            >
              <Calendar className="h-4 w-4" />
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={filtered.length === 0}
          >
            <Download className="mr-1 h-4 w-4" />
            CSV 내보내기
          </Button>
          <Button onClick={handleAdd} size="sm">
            <Plus className="mr-1 h-4 w-4" />
            구독 추가
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="서비스명 또는 플랜명 검색"
            className="pl-9"
            aria-label="구독 검색"
          />
        </div>
        <Select
          value={sortBy}
          onValueChange={(value) => setSortBy(value as SortOption)}
        >
          <SelectTrigger className="w-full sm:w-44" aria-label="구독 정렬 기준">
            <SelectValue placeholder="정렬 기준" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="billing-date">결제일 빠른 순</SelectItem>
            <SelectItem value="cost-high">비용 높은 순</SelectItem>
            <SelectItem value="cost-low">비용 낮은 순</SelectItem>
            <SelectItem value="name">이름 순</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {(searchQuery.trim() || selectedCategory !== "all") && (
        <p className="text-sm text-muted-foreground" aria-live="polite">
          검색 결과 {filtered.length}개
        </p>
      )}

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
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
            {subscriptions.length === 0 ? (
              <>
                <p className="text-lg font-medium text-muted-foreground">
                  등록된 구독이 없습니다
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  &quot;구독 추가&quot; 버튼을 눌러 구독 서비스를 등록하세요
                </p>
                <Button onClick={handleAdd} className="mt-4" size="sm">
                  <Plus className="mr-1 h-4 w-4" />
                  첫 구독 추가하기
                </Button>
              </>
            ) : (
              <>
                <p className="text-lg font-medium text-muted-foreground">
                  조건에 맞는 구독이 없습니다
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  검색어나 카테고리 필터를 변경해 보세요
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                  }}
                  className="mt-4"
                  size="sm"
                >
                  필터 초기화
                </Button>
              </>
            )}
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
