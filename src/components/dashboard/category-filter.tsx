"use client";

import { cn } from "@/lib/utils";

interface Category {
  readonly value: string;
  readonly label: string;
  readonly emoji: string;
}

interface CategoryFilterProps {
  categories: readonly Category[];
  selected: string;
  onSelect: (category: string) => void;
}

export function CategoryFilter({
  categories,
  selected,
  onSelect,
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect("all")}
        className={cn(
          "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
          selected === "all"
            ? "bg-primary text-primary-foreground"
            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
        )}
      >
        전체
      </button>
      {categories.map((category) => (
        <button
          key={category.value}
          onClick={() => onSelect(category.value)}
          className={cn(
            "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
            selected === category.value
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          )}
        >
          {category.emoji} {category.label}
        </button>
      ))}
    </div>
  );
}
