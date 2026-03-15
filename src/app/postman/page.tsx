"use client";

import { useEffect, useState } from "react";
import { Folder, Globe, Briefcase, RefreshCw, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CollectionsList } from "@/components/postman/collections-list";
import { EnvironmentsList } from "@/components/postman/environments-list";
import { WorkspacesList } from "@/components/postman/workspaces-list";
import type {
  PostmanCollection,
  PostmanEnvironment,
  PostmanWorkspace,
} from "@/lib/postman/types";

type Tab = "collections" | "environments" | "workspaces";

const TABS: { key: Tab; label: string; icon: typeof Folder }[] = [
  { key: "collections", label: "컬렉션", icon: Folder },
  { key: "environments", label: "환경", icon: Globe },
  { key: "workspaces", label: "워크스페이스", icon: Briefcase },
];

export default function PostmanPage() {
  const [activeTab, setActiveTab] = useState<Tab>("collections");
  const [collections, setCollections] = useState<PostmanCollection[]>([]);
  const [environments, setEnvironments] = useState<PostmanEnvironment[]>([]);
  const [workspaces, setWorkspaces] = useState<PostmanWorkspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchData() {
    setLoading(true);
    setError(null);

    try {
      const [colRes, envRes, wsRes] = await Promise.all([
        fetch("/api/postman/collections"),
        fetch("/api/postman/environments"),
        fetch("/api/postman/workspaces"),
      ]);

      const [colJson, envJson, wsJson] = await Promise.all([
        colRes.json(),
        envRes.json(),
        wsRes.json(),
      ]);

      if (colJson.error || envJson.error || wsJson.error) {
        setError(colJson.error || envJson.error || wsJson.error);
      } else {
        setCollections(colJson.data ?? []);
        setEnvironments(envJson.data ?? []);
        setWorkspaces(wsJson.data ?? []);
      }
    } catch {
      setError("Postman API에 연결할 수 없습니다. API 키를 확인해주세요.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Postman API</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Postman 컬렉션, 환경, 워크스페이스를 관리합니다.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchData}
          disabled={loading}
        >
          <RefreshCw
            className={cn("h-4 w-4 mr-1", loading && "animate-spin")}
          />
          새로고침
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              컬렉션
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{collections.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              환경
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{environments.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              워크스페이스
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{workspaces.length}</p>
          </CardContent>
        </Card>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 mb-6 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b mb-4">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px",
              activeTab === key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <Card>
        <CardContent className="pt-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {activeTab === "collections" && (
                <CollectionsList collections={collections} />
              )}
              {activeTab === "environments" && (
                <EnvironmentsList environments={environments} />
              )}
              {activeTab === "workspaces" && (
                <WorkspacesList workspaces={workspaces} />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
