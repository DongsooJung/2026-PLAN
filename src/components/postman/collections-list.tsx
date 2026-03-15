"use client";

import { useState } from "react";
import { ChevronRight, Folder, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  PostmanCollection,
  PostmanCollectionDetail,
  PostmanItem,
} from "@/lib/postman/types";
import { RequestItem } from "./request-item";

interface CollectionsListProps {
  collections: PostmanCollection[];
}

export function CollectionsList({ collections }: CollectionsListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<PostmanCollectionDetail | null>(null);
  const [loading, setLoading] = useState(false);

  async function toggleCollection(uid: string) {
    if (expandedId === uid) {
      setExpandedId(null);
      setDetail(null);
      return;
    }

    setExpandedId(uid);
    setLoading(true);
    try {
      const res = await fetch(`/api/postman/collections/${uid}`);
      const json = await res.json();
      if (json.data) {
        setDetail(json.data);
      }
    } catch {
      setDetail(null);
    } finally {
      setLoading(false);
    }
  }

  if (collections.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        컬렉션이 없습니다.
      </p>
    );
  }

  return (
    <div className="space-y-1">
      {collections.map((col) => (
        <div key={col.uid}>
          <button
            onClick={() => toggleCollection(col.uid)}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors hover:bg-muted",
              expandedId === col.uid && "bg-muted"
            )}
          >
            <ChevronRight
              className={cn(
                "h-4 w-4 shrink-0 transition-transform",
                expandedId === col.uid && "rotate-90"
              )}
            />
            {expandedId === col.uid ? (
              <FolderOpen className="h-4 w-4 shrink-0 text-orange-500" />
            ) : (
              <Folder className="h-4 w-4 shrink-0 text-orange-500" />
            )}
            <span className="truncate font-medium">{col.name}</span>
          </button>

          {expandedId === col.uid && (
            <div className="ml-6 mt-1 space-y-0.5">
              {loading ? (
                <p className="text-xs text-muted-foreground px-3 py-2">
                  로딩 중...
                </p>
              ) : detail ? (
                <ItemTree items={detail.item} depth={0} />
              ) : (
                <p className="text-xs text-muted-foreground px-3 py-2">
                  데이터를 불러올 수 없습니다.
                </p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ItemTree({ items, depth }: { items: PostmanItem[]; depth: number }) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  function toggleItem(name: string) {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  }

  return (
    <div className="space-y-0.5">
      {items.map((item, idx) => {
        const key = item.id ?? `${item.name}-${idx}`;
        const isFolder = !!item.item;
        const isExpanded = expandedItems.has(key);

        if (isFolder) {
          return (
            <div key={key}>
              <button
                onClick={() => toggleItem(key)}
                className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-sm hover:bg-muted"
                style={{ paddingLeft: `${(depth + 1) * 12}px` }}
              >
                <ChevronRight
                  className={cn(
                    "h-3.5 w-3.5 shrink-0 transition-transform",
                    isExpanded && "rotate-90"
                  )}
                />
                <Folder className="h-3.5 w-3.5 shrink-0 text-yellow-500" />
                <span className="truncate">{item.name}</span>
              </button>
              {isExpanded && item.item && (
                <ItemTree items={item.item} depth={depth + 1} />
              )}
            </div>
          );
        }

        return (
          <RequestItem
            key={key}
            item={item}
            style={{ paddingLeft: `${(depth + 1) * 12 + 20}px` }}
          />
        );
      })}
    </div>
  );
}
