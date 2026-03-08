"use client";

import { useState } from "react";
import type { Subscription } from "@/lib/types";
import { CATEGORIES } from "@/lib/constants";
import { SubscriptionCard } from "./subscription-card";
import { SubscriptionDialog } from "./subscription-dialog";
import { CategoryFilter } from "./category-filter";
import { CalendarView } from "./calendar-view";
import { Button } from "@/components/ui/button";
import { Plus, LayoutGrid, Calendar } from "lucide-react";

interface SubscriptionListProps {
  subscriptions: Subscription[];
}

export function SubscriptionList({ subscriptions }: SubscriptionListProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] =
    useState<Subscription | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "calendar">("grid");

  const filtered =
    selectedCategory === "all"
      ? subscriptions
      : subscriptions.filter((s) => s.category === selectedCategory);

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
          <Button onClick={handleAdd} size="sm">
            <Plus className="mr-1 h-4 w-4" />
            구독 추가
          </Button>
        </div>
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
