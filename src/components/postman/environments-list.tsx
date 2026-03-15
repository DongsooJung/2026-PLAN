"use client";

import { useState } from "react";
import { ChevronRight, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  PostmanEnvironment,
  PostmanEnvironmentDetail,
} from "@/lib/postman/types";

interface EnvironmentsListProps {
  environments: PostmanEnvironment[];
}

export function EnvironmentsList({ environments }: EnvironmentsListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<PostmanEnvironmentDetail | null>(null);
  const [loading, setLoading] = useState(false);

  async function toggleEnvironment(uid: string) {
    if (expandedId === uid) {
      setExpandedId(null);
      setDetail(null);
      return;
    }

    setExpandedId(uid);
    setLoading(true);
    try {
      const res = await fetch(`/api/postman/environments/${uid}`);
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

  if (environments.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        환경이 없습니다.
      </p>
    );
  }

  return (
    <div className="space-y-1">
      {environments.map((env) => (
        <div key={env.uid}>
          <button
            onClick={() => toggleEnvironment(env.uid)}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors hover:bg-muted",
              expandedId === env.uid && "bg-muted"
            )}
          >
            <ChevronRight
              className={cn(
                "h-4 w-4 shrink-0 transition-transform",
                expandedId === env.uid && "rotate-90"
              )}
            />
            <Globe className="h-4 w-4 shrink-0 text-green-500" />
            <span className="truncate font-medium">{env.name}</span>
          </button>

          {expandedId === env.uid && (
            <div className="ml-10 mt-1">
              {loading ? (
                <p className="text-xs text-muted-foreground px-3 py-2">
                  로딩 중...
                </p>
              ) : detail && detail.values.length > 0 ? (
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="text-left px-3 py-1.5 font-medium">
                          변수명
                        </th>
                        <th className="text-left px-3 py-1.5 font-medium">
                          값
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.values.map((v, idx) => (
                        <tr key={idx} className="border-t">
                          <td className="px-3 py-1.5 font-mono">{v.key}</td>
                          <td className="px-3 py-1.5 font-mono text-muted-foreground">
                            {v.value || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground px-3 py-2">
                  변수가 없습니다.
                </p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
