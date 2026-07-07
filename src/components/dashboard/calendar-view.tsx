"use client";

import type { Subscription } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { CATEGORIES } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface CalendarViewProps {
  subscriptions: Subscription[];
}

export function CalendarView({ subscriptions }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const subscriptionsByDay: Record<number, Subscription[]> = {};
  subscriptions.forEach((sub) => {
    const date = new Date(sub.next_billing_date);
    if (date.getFullYear() === year && date.getMonth() === month) {
      const day = date.getDate();
      if (!subscriptionsByDay[day]) subscriptionsByDay[day] = [];
      subscriptionsByDay[day].push(sub);
    }
  });

  const prevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const today = new Date();
  const isToday = (day: number) =>
    today.getFullYear() === year &&
    today.getMonth() === month &&
    today.getDate() === day;

  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <CardTitle className="text-lg">
            {year}년 {month + 1}월
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-px">
          {dayNames.map((name) => (
            <div
              key={name}
              className="p-2 text-center text-xs font-medium text-muted-foreground"
            >
              {name}
            </div>
          ))}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[80px] p-1" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const subs = subscriptionsByDay[day] || [];
            return (
              <div
                key={day}
                className={`min-h-[80px] rounded-md border p-1 ${
                  isToday(day) ? "border-primary bg-primary/5" : "border-transparent"
                }`}
              >
                <span
                  className={`text-xs font-medium ${
                    isToday(day) ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {day}
                </span>
                <div className="mt-1 space-y-0.5">
                  {subs.map((sub) => {
                    const cat = CATEGORIES.find(
                      (c) => c.value === sub.category
                    );
                    return (
                      <div
                        key={sub.id}
                        className="truncate text-[10px] leading-tight"
                        title={`${sub.service_name} - ${formatCurrency(Number(sub.cost), sub.currency)}`}
                      >
                        <Badge
                          variant="secondary"
                          className="h-auto px-1 py-0 text-[10px]"
                        >
                          {cat?.emoji} {sub.service_name}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
