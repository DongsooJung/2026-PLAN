"use client";

import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import type { PostmanItem } from "@/lib/postman/types";

const METHOD_COLORS: Record<string, string> = {
  GET: "text-green-600",
  POST: "text-yellow-600",
  PUT: "text-blue-600",
  PATCH: "text-purple-600",
  DELETE: "text-red-600",
  OPTIONS: "text-gray-500",
  HEAD: "text-gray-500",
};

interface RequestItemProps {
  item: PostmanItem;
  style?: CSSProperties;
}

export function RequestItem({ item, style }: RequestItemProps) {
  const method = item.request?.method ?? "GET";
  const url = item.request?.url?.raw ?? "";

  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm hover:bg-muted cursor-default"
      style={style}
    >
      <span
        className={cn(
          "text-xs font-bold uppercase w-12 shrink-0",
          METHOD_COLORS[method] ?? "text-gray-500"
        )}
      >
        {method}
      </span>
      <span className="truncate">{item.name}</span>
      {url && (
        <span className="truncate text-xs text-muted-foreground ml-auto">
          {url}
        </span>
      )}
    </div>
  );
}
