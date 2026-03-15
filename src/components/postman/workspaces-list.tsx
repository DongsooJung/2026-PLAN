"use client";

import { Briefcase } from "lucide-react";
import type { PostmanWorkspace } from "@/lib/postman/types";
import { Badge } from "@/components/ui/badge";

const TYPE_LABELS: Record<string, string> = {
  personal: "개인",
  team: "팀",
  private: "비공개",
  public: "공개",
};

interface WorkspacesListProps {
  workspaces: PostmanWorkspace[];
}

export function WorkspacesList({ workspaces }: WorkspacesListProps) {
  if (workspaces.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        워크스페이스가 없습니다.
      </p>
    );
  }

  return (
    <div className="space-y-1">
      {workspaces.map((ws) => (
        <div
          key={ws.id}
          className="flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-muted"
        >
          <Briefcase className="h-4 w-4 shrink-0 text-blue-500" />
          <span className="truncate font-medium">{ws.name}</span>
          <Badge variant="secondary" className="ml-auto text-xs">
            {TYPE_LABELS[ws.type] ?? ws.type}
          </Badge>
        </div>
      ))}
    </div>
  );
}
