"use client";

import { useState } from "react";
import type { Subscription } from "@/lib/types";
import { CATEGORIES, STATUS_OPTIONS, BILLING_CYCLES } from "@/lib/constants";
import { formatCurrency, daysUntil, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { DeleteDialog } from "./delete-dialog";

interface SubscriptionCardProps {
  subscription: Subscription;
  onEdit: (subscription: Subscription) => void;
  readOnly?: boolean;
}

export function SubscriptionCard({
  subscription,
  onEdit,
  readOnly = false,
}: SubscriptionCardProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);

  const category = CATEGORIES.find((c) => c.value === subscription.category);
  const status = STATUS_OPTIONS.find((s) => s.value === subscription.status);
  const cycle = BILLING_CYCLES.find(
    (c) => c.value === subscription.billing_cycle,
  );
  const days = daysUntil(subscription.next_billing_date);

  return (
    <>
      <Card className="group relative transition-shadow hover:shadow-md">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
          <div className="space-y-1">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <span>{category?.emoji}</span>
              {subscription.service_name}
            </CardTitle>
            {subscription.plan_name && (
              <p className="text-xs text-muted-foreground">
                {subscription.plan_name}
              </p>
            )}
          </div>
          {!readOnly && (
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onEdit(subscription)}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold">
              {formatCurrency(Number(subscription.cost), subscription.currency)}
            </span>
            <span className="text-xs text-muted-foreground">
              /{cycle?.label}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">다음 결제</span>
            <span className="font-medium">
              {formatDate(subscription.next_billing_date)}
              {days !== null && days >= 0 && (
                <span className="ml-1 text-xs text-muted-foreground">
                  (D-{days})
                </span>
              )}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-xs">
              {category?.label}
            </Badge>
            <Badge
              variant={
                subscription.status === "active"
                  ? "default"
                  : subscription.status === "paused"
                    ? "secondary"
                    : "destructive"
              }
              className="text-xs"
            >
              {status?.label}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {!readOnly && (
        <DeleteDialog
          open={deleteOpen}
          onClose={() => setDeleteOpen(false)}
          subscriptionId={subscription.id}
          serviceName={subscription.service_name}
        />
      )}
    </>
  );
}
